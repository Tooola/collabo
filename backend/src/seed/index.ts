import mongoose, { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { connectDB } from '../services/database';
import { Team } from '../models/Team';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { buildDataset } from './generate';
import { isObjectIdHex, seedId } from './utils';

/** Record of the last seed pass. Informational only — not used as a gate. */
const MARKER_ID = 'demo-v1';

export interface SeedSummary {
  workspaceId: string;
  teams: number;
  users: number;
  projects: number;
  tasks: number;
  statuses: Record<string, number>;
}

/**
 * `bulkWrite` and concurrent cold starts can both surface duplicate-key
 * errors. Those are harmless here: the other writer already inserted the
 * identical document.
 */
function isDuplicateKeyError(err: unknown): boolean {
  const e = err as { code?: number; writeErrors?: { code?: number }[] };
  if (!e) return false;
  if (e.code === 11000) return true;
  if (Array.isArray(e.writeErrors) && e.writeErrors.length > 0) {
    return e.writeErrors.every((we) => we?.code === 11000);
  }
  return false;
}

/**
 * Insert-only upsert keyed on the deterministic `_id`.
 * `$setOnInsert` guarantees an existing document is never modified, so
 * re-running the seed is a no-op instead of a data reset.
 */
async function upsertById(model: mongoose.Model<any>, docs: Record<string, unknown>[]): Promise<void> {
  if (docs.length === 0) return;

  const ops = docs.map((doc) => {
    const { _id, ...rest } = doc;
    return {
      updateOne: {
        filter: { _id },
        update: { $setOnInsert: rest },
        upsert: true,
      },
    };
  }) as mongoose.AnyBulkWriteOperation<any>[];

  try {
    await model.bulkWrite(ops, { ordered: false, timestamps: false });
  } catch (err) {
    if (!isDuplicateKeyError(err)) throw err;
  }
}

/**
 * The `seeds` collection only holds a marker document whose `_id` is a plain
 * string, which does not match the driver's default `ObjectId` typing.
 */
interface SeedsCollection {
  updateOne: (
    filter: Record<string, unknown>,
    update: Record<string, unknown>,
    opts: Record<string, unknown>
  ) => Promise<unknown>;
  deleteMany: (filter: Record<string, unknown>) => Promise<unknown>;
}

function seedsCollection(): SeedsCollection {
  return mongoose.connection.collection('seeds') as unknown as SeedsCollection;
}

/**
 * Users are keyed on their email (the unique index) rather than `_id`, so an
 * account created earlier — e.g. by the previous destructive seed — is reused
 * instead of colliding.
 *
 * `workspaceId` and `teams` are enforced on every pass: without that, a user
 * carried over from the old seed would keep an orphan workspace and end up
 * with an empty sidebar. These 18 accounts are owned by the seed; everything
 * else (name, password, role) is insert-only and never overwritten.
 */
async function upsertUsers(users: Record<string, unknown>[]): Promise<void> {
  if (users.length === 0) return;

  const ops = users.map((doc) => {
    const { email, workspaceId, teams, ...insert } = doc;
    return {
      updateOne: {
        filter: { email },
        update: {
          $setOnInsert: insert,
          $set: { workspaceId, teams },
        },
        upsert: true,
      },
    };
  });

  try {
    await User.bulkWrite(ops, { ordered: false, timestamps: false });
  } catch (err) {
    if (!isDuplicateKeyError(err)) throw err;
  }
}

/**
 * Seeds the demo dataset.
 *
 * Always runs the (idempotent) upserts rather than trusting a "done" marker:
 * demo data can disappear out-of-band — a cascade delete, a dropped
 * collection, someone poking around in Atlas — and the next boot should put
 * it back. Existing documents are never modified, so this is a no-op when
 * everything is already in place.
 *
 * Safe to call on every boot and concurrently from several serverless
 * instances. Never throws: a failing seed must not prevent the API starting.
 */
export async function runSeed(): Promise<SeedSummary | null> {
  if (!env.seedOnBoot) {
    console.log('[seed] SEED_ON_BOOT is disabled, skipping');
    return null;
  }

  try {
    await connectDB();

    const workspaceId = env.seedWorkspaceId && isObjectIdHex(env.seedWorkspaceId)
      ? new Types.ObjectId(env.seedWorkspaceId)
      : seedId('workspace:default');

    const passwordHash = await bcrypt.hash(env.seedPassword, 10);
    const data = buildDataset(workspaceId, passwordHash);

    await upsertById(Team, data.teams);
    await upsertUsers(data.users);
    await upsertById(Project, data.projects);
    await upsertById(Task, data.tasks);

    const statuses: Record<string, number> = {};
    for (const t of data.tasks) {
      const s = t.status as string;
      statuses[s] = (statuses[s] ?? 0) + 1;
    }

    const summary: SeedSummary = {
      workspaceId: workspaceId.toString(),
      teams: data.teams.length,
      users: data.users.length,
      projects: data.projects.length,
      tasks: data.tasks.length,
      statuses,
    };

    // Purely informational: it is read by humans, not used as a gate.
    await seedsCollection().updateOne(
      { _id: MARKER_ID },
      { $set: { seededAt: new Date(), ...summary } },
      { upsert: true }
    );

    logSummary(summary);
    return summary;
  } catch (err) {
    console.error('[seed] seeding failed (the API still starts):', err);
    return null;
  }
}

/**
 * Destroys every user, team, project and task **inside the demo workspace
 * only**, then clears the seed record so the next `runSeed()` starts clean.
 *
 * Accounts that live elsewhere — including the admin created through the
 * registration endpoint — are left untouched.
 *
 * Refuses to run in production — use it locally before `npm run seed`.
 */
export async function runReset(): Promise<void> {
  if (env.nodeEnv === 'production') {
    throw new Error('Refusing to reset data while NODE_ENV=production');
  }

  await connectDB();

  const workspaceId = env.seedWorkspaceId && isObjectIdHex(env.seedWorkspaceId)
    ? new Types.ObjectId(env.seedWorkspaceId)
    : seedId('workspace:default');

  console.warn(`[seed:reset] Clearing workspace ${workspaceId} only…`);

  const tasks = await Task.deleteMany({ workspaceId });
  const projects = await Project.deleteMany({ workspaceId });
  const users = await User.deleteMany({ workspaceId });
  const teams = await Team.deleteMany({ workspaceId });
  await seedsCollection().deleteMany({ _id: MARKER_ID });

  console.warn(
    `[seed:reset] Removed ${tasks.deletedCount} tasks, ${projects.deletedCount} projects, ` +
    `${users.deletedCount} users, ${teams.deletedCount} teams. ` +
    'Accounts and data outside this workspace were kept.'
  );
  console.warn('[seed:reset] Run `npm run seed` to recreate the demo data.');
}

function logSummary(s: SeedSummary): void {
  const statusLine = Object.entries(s.statuses)
    .map(([key, count]) => `${key} ${count}`)
    .join(' · ');

  console.log(
    [
      '',
      `  ✅ Demo data seeded — workspace ${s.workspaceId}`,
      `     teams     : ${s.teams}`,
      `     users     : ${s.users}`,
      `     projects  : ${s.projects}`,
      `     tasks     : ${s.tasks}`,
      `     statuses  : ${statusLine}`,
      '',
      `     Log in with admin@test.com / lead@test.com / dev@test.com`,
      `     Password  : "${env.seedPassword}"`,
      '',
    ].join('\n')
  );
}

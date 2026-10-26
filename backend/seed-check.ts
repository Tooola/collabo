/**
 * Offline validation of the seed generator. Touches no database.
 * Run: npx tsx seed-check.ts
 */
import { Types } from 'mongoose';
import { buildDataset } from './src/seed/generate';
import { PROJECTS, TEAMS, USERS, TASK_STATUSES, TaskStatus } from './src/seed/dataset';

const now = Date.now();
const ws = new Types.ObjectId('65f000000000000000000001');
const data = buildDataset(ws, '$2a$10$abcdefghijklmnopqrstuv', now);

const teamIds = new Set(TEAMS.map((t) => t._id));
const projIds = new Set(data.projects.map((p) => p._id as Types.ObjectId).map(String));
const taskIds = new Set(data.tasks.map((t) => t._id as Types.ObjectId).map(String));

// teamKey -> set of user ids
const teamMembers = new Map<string, Set<string>>();
for (const u of USERS) {
  if (!u.teamKey) continue;
  const s = teamMembers.get(u.teamKey) ?? new Set<string>();
  s.add(String(data.users.find((x) => x.email === u.email)!._id));
  teamMembers.set(u.teamKey, s);
}
// projectId -> teamKey
const projTeam = new Map<string, string>();
for (const p of PROJECTS) {
  projTeam.set(String(data.projects.find((x) => x.name === p.name)!._id), p.teamKey);
}

const problems: string[] = [];
const statusCounts: Record<string, number> = {};
let overdue = 0;
let doneOnTime = 0;
let doneLate = 0;
const perUser = new Map<string, { open: number; done: number; blocked: number }>();

let epics = 0, children = 0, subs = 0;

for (const t of data.tasks) {
  const id = String(t._id);
  const status = t.status as TaskStatus;
  statusCounts[status] = (statusCounts[status] ?? 0) + 1;

  const created = (t.createdAt as Date).getTime();
  const due = (t.dueDate as Date).getTime();
  const updated = (t.updatedAt as Date).getTime();

  if (due <= created) problems.push(`${id}: dueDate <= createdAt`);
  if (updated < created) problems.push(`${id}: updatedAt < createdAt`);

  if (!projIds.has(String(t.projectId))) problems.push(`${id}: unknown project`);
  if (t.parentId !== null && !taskIds.has(String(t.parentId))) problems.push(`${id}: unknown parent`);

  const members = teamMembers.get(projTeam.get(String(t.projectId))!)!;
  if (!members.has(String(t.assignedTo))) problems.push(`${id}: assignee not in project team`);

  if (t.parentId === null) epics++;
  const parent = data.tasks.find((x) => x._id === t.parentId);
  if (parent && parent.parentId === null) children++;
  else if (parent) subs++;

  if (status !== 'TERMINE' && due < now) overdue++;
  if (status === 'TERMINE') {
    if (due < updated) doneLate++;
    else doneOnTime++;
  }

  const key = String(t.assignedTo);
  const agg = perUser.get(key) ?? { open: 0, done: 0, blocked: 0 };
  if (status === 'TERMINE') agg.done++;
  else agg.open++;
  if (status === 'BLOQUE') agg.blocked++;
  perUser.set(key, agg);
}

// determinism check
const again = buildDataset(ws, '$2a$10$abcdefghijklmnopqrstuv', now);
const identical =
  JSON.stringify(data.tasks.map(String)) === JSON.stringify(again.tasks.map(String));

console.log('=== counts ===');
console.log(`teams    ${data.teams.length}   (expected ${TEAMS.length})`);
console.log(`users    ${data.users.length}   (expected ${USERS.length})`);
console.log(`projects ${data.projects.length}   (expected ${PROJECTS.length})`);
console.log(`tasks    ${data.tasks.length}   -> epics ${epics} / tasks ${children} / subtasks ${subs}`);

console.log('\n=== status distribution ===');
for (const s of TASK_STATUSES) {
  const c = statusCounts[s] ?? 0;
  console.log(`  ${s.padEnd(9)} ${String(c).padStart(4)}  ${(100 * c / data.tasks.length).toFixed(1)}%`);
}

console.log('\n=== date signals ===');
console.log(`overdue (open & past due)     ${overdue}`);
console.log(`done before due               ${doneOnTime}`);
console.log(`done after due (late)         ${doneLate}`);
const span = data.tasks.map((t) => (t.createdAt as Date).getTime());
console.log(`createdAt span                ${Math.round((now - Math.min(...span)) / 86400000)} days back`);

console.log('\n=== workload (open tasks per user) ===');
const ranked = [...perUser.entries()]
  .map(([uid, v]) => ({
    name: data.users.find((u) => String(u._id) === uid)!.email as string,
    ...v,
  }))
  .sort((a, b) => b.open - a.open);
for (const r of ranked) {
  console.log(`  ${r.name.padEnd(26)} open ${String(r.open).padStart(3)}  done ${String(r.done).padStart(3)}  blocked ${r.blocked}`);
}

console.log('\n=== per project ===');
for (const p of data.projects) {
  const mine = data.tasks.filter((t) => String(t.projectId) === String(p._id));
  const c: Record<string, number> = {};
  for (const t of mine) c[t.status as string] = (c[t.status as string] ?? 0) + 1;
  const pct = (k: string) => `${Math.round(100 * (c[k] ?? 0) / mine.length)}%`;
  console.log(
    `  ${(p.name as string).padEnd(28)} ${(p.status as string).padEnd(9)} ` +
    `${String(mine.length).padStart(3)} tasks | ` +
    `TERMINE ${pct('TERMINE').padStart(4)} BLOQUE ${pct('BLOQUE').padStart(4)} A_FAIRE ${pct('A_FAIRE').padStart(4)}`
  );
}

console.log('\n=== invariants ===');
const inv: string[] = [];
for (const p of PROJECTS) {
  const mine = data.tasks.filter((t) => String(t.projectId) === String(data.projects.find((x) => x.name === p.name)!._id));
  const c: Record<string, number> = {};
  for (const t of mine) c[t.status as string] = (c[t.status as string] ?? 0) + 1;
  const share = (k: string) => (c[k] ?? 0) / mine.length;

  if (p.status === 'TERMINE') {
    if ((c.BLOQUE ?? 0) !== 0) inv.push(`${p.name}: finished project has ${(c.BLOQUE ?? 0)} blocked tasks`);
    if (share('TERMINE') < 0.85) inv.push(`${p.name}: finished project only ${Math.round(share('TERMINE') * 100)}% done`);
  }
  if (p.risky) {
    const b = share('BLOQUE');
    if (b < 0.22 || b > 0.38) inv.push(`${p.name}: at-risk project blocked share ${(b * 100).toFixed(0)}% outside 22-38%`);
  }
}
console.log(inv.length === 0 ? '  all project-level invariants hold' : inv.map((s) => `  ✗ ${s}`).join('\n'));

console.log('\n=== integrity ===');
console.log(`determinism identical rebuild : ${identical}`);
console.log(`problems                      : ${problems.length}`);
if (problems.length) console.log(problems.slice(0, 20).join('\n'));

if (!identical || problems.length || inv.length) {
  process.exitCode = 1;
  console.log('\nFAILED');
} else {
  console.log('\nOK');
}

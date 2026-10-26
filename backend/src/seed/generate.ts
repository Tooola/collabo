import { Types } from 'mongoose';
import {
  DAY,
  EPIC_TITLES,
  PROJECTS,
  SUBTASK_TITLES,
  TASK_STATUSES,
  TASK_TITLES,
  TEAMS,
  USERS,
  SeedProjectDef,
  TaskStatus,
} from './dataset';
import { chance, createRng, randInt, seedId, weightedPick } from './utils';

interface Member {
  id: Types.ObjectId;
  role: 'LEAD' | 'DEV';
  load: number;
}

export interface SeedDataset {
  workspaceId: Types.ObjectId;
  teams: Record<string, unknown>[];
  users: Record<string, unknown>[];
  projects: Record<string, unknown>[];
  tasks: Record<string, unknown>[];
}

/**
 * Builds the whole demo dataset deterministically.
 *
 * The shape is intentionally "imperfect" so it is useful for analytics:
 * - statuses are spread across all four values,
 * - ~20% of open tasks are overdue,
 * - one developer is heavily overloaded (see `load` in dataset.ts),
 * - one project is at risk (~30% of its tasks are BLOCKED),
 * - task dates are spread over ~200 days of history.
 */
export function buildDataset(
  workspaceId: Types.ObjectId,
  passwordHash: string,
  now: number = Date.now()
): SeedDataset {
  return {
    workspaceId,
    teams: buildTeams(workspaceId, now),
    users: buildUsers(workspaceId, passwordHash, now),
    projects: buildProjects(workspaceId, now),
    tasks: buildTasks(workspaceId, now),
  };
}

function buildTeams(workspaceId: Types.ObjectId, now: number) {
  const created = new Date(now - 220 * DAY);
  return TEAMS.map((t) => ({
    _id: seedId(`team:${t.key}`),
    name: t.name,
    description: t.description,
    workspaceId,
    createdAt: created,
    updatedAt: created,
  }));
}

function buildUsers(workspaceId: Types.ObjectId, passwordHash: string, now: number) {
  return USERS.map((u) => {
    const createdAt = new Date(now - u.joinedDaysAgo * DAY);
    return {
      _id: seedId(`user:${u.email}`),
      name: u.name,
      email: u.email,
      password: passwordHash,
      role: u.role,
      // The admin owns no team on purpose: it is the only way to exercise
      // the ADMIN branch of `taskService.getAll`.
      teams: u.teamKey
        ? [{ teamId: seedId(`team:${u.teamKey}`), role: u.role === 'LEAD' ? 'LEAD' : 'DEV' }]
        : [],
      workspaceId,
      createdAt,
      updatedAt: createdAt,
    };
  });
}

function buildProjects(workspaceId: Types.ObjectId, now: number) {
  return PROJECTS.map((p) => {
    const createdAt = new Date(now - p.startedDaysAgo * DAY);
    return {
      _id: seedId(`project:${p.key}`),
      name: p.name,
      description: p.description,
      status: p.status,
      teamId: seedId(`team:${p.teamKey}`),
      workspaceId,
      createdAt,
      updatedAt: createdAt,
    };
  });
}

function buildTasks(workspaceId: Types.ObjectId, now: number) {
  const tasks: Record<string, unknown>[] = [];

  const membersByTeam = new Map<string, Member[]>();
  for (const u of USERS) {
    if (!u.teamKey) continue;
    const list = membersByTeam.get(u.teamKey) ?? [];
    list.push({
      id: seedId(`user:${u.email}`),
      role: u.role as 'LEAD' | 'DEV',
      load: u.load ?? 1,
    });
    membersByTeam.set(u.teamKey, list);
  }

  PROJECTS.forEach((p, projectIndex) => {
    const members = membersByTeam.get(p.teamKey) ?? [];
    const leads = members.filter((m) => m.role === 'LEAD');
    const devs = members.filter((m) => m.role === 'DEV');
    const assignees = [...leads, ...devs];

    if (assignees.length === 0) return;

    const rng = createRng(`project:${p.key}`);
    const projectId = seedId(`project:${p.key}`);
    const projectStart = now - p.startedDaysAgo * DAY;

    // Epics lean towards leads; normal tasks lean towards devs.
    const epicWeights = [...leads.map(() => 4), ...devs.map(() => 1)];
    const taskWeights = [...leads.map(() => 0.5), ...devs.map((d) => d.load)];

    const epicCount = 3 + (projectIndex % 2); // 3 or 4
    let childSeq = 0;
    let subSeq = 0;

    for (let e = 0; e < epicCount; e++) {
      const epicStart = projectStart + randInt(rng, 0, 12) * DAY;
      const epicStatus = pickStatus(rng, p, null);
      const epicId = seedId(`task:${p.key}:e${e}`);
      const epicTitle = EPIC_TITLES[(projectIndex * 3 + e) % EPIC_TITLES.length];
      const epicAssignee = weightedPick(rng, assignees, epicWeights);

      tasks.push(
        makeTask({
          id: epicId,
          title: epicTitle,
          description: `${epicTitle} — pillar of the ${p.name} project.`,
          projectId,
          parentId: null,
          assignedTo: epicAssignee.id,
          status: epicStatus,
          createdAtMs: epicStart,
          now,
          rng,
          workspaceId,
        })
      );

      const childCount = randInt(rng, 3, 4);
      for (let c = 0; c < childCount; c++) {
        const childStart = Math.min(epicStart + randInt(rng, 1, 25) * DAY, now - DAY);
        const childStatus = pickStatus(rng, p, epicStatus);
        const childId = seedId(`task:${p.key}:e${e}:c${c}`);
        const childTitle = TASK_TITLES[childSeq++ % TASK_TITLES.length];
        const childAssignee = weightedPick(rng, assignees, taskWeights);

        tasks.push(
          makeTask({
            id: childId,
            title: childTitle,
            description: `${childTitle} — part of the "${epicTitle}" work package in ${p.name}.`,
            projectId,
            parentId: epicId,
            assignedTo: childAssignee.id,
            status: childStatus,
            createdAtMs: childStart,
            now,
            rng,
            workspaceId,
          })
        );

        if (!chance(rng, 0.5)) continue;

        const subCount = randInt(rng, 1, 2);
        for (let s = 0; s < subCount; s++) {
          const subStart = Math.min(childStart + randInt(rng, 1, 10) * DAY, now);
          const subStatus = pickStatus(rng, p, childStatus);
          const subId = seedId(`task:${p.key}:e${e}:c${c}:s${s}`);
          const subTitle = SUBTASK_TITLES[subSeq++ % SUBTASK_TITLES.length];

          // Sub-tasks mostly stay with the parent's assignee.
          const subAssignee = chance(rng, 0.8)
            ? childAssignee
            : weightedPick(rng, devs.length ? devs : assignees, devs.length ? devs.map((d) => d.load) : taskWeights);

          tasks.push(
            makeTask({
              id: subId,
              title: subTitle,
              description: `${subTitle} — sub-task of "${childTitle}".`,
              projectId,
              parentId: childId,
              assignedTo: subAssignee.id,
              status: subStatus,
              createdAtMs: subStart,
              now,
              rng,
              workspaceId,
            })
          );
        }
      }
    }
  });

  return tasks;
}

function baseWeights(p: SeedProjectDef): Record<TaskStatus, number> {
  // A finished project has no blocked work left; setting BLOQUE to 0 also
  // stops the "blocked parent -> blocked child" rule from resurrecting it.
  if (p.risky) return { A_FAIRE: 28, EN_COURS: 26, BLOQUE: 24, TERMINE: 22 };
  switch (p.status) {
    case 'TERMINE':
      return { A_FAIRE: 2, EN_COURS: 5, BLOQUE: 0, TERMINE: 93 };
    case 'SUSPENDU':
      return { A_FAIRE: 27, EN_COURS: 24, BLOQUE: 18, TERMINE: 31 };
    default:
      return { A_FAIRE: 30, EN_COURS: 25, BLOQUE: 10, TERMINE: 35 };
  }
}

/**
 * A child usually follows its parent, but never past what the project itself
 * allows: a finished project cannot grow new blocked work, and a not-started
 * epic cannot hold finished children.
 *
 * Without those two guards the parent rule compounds at every level of the
 * epic -> task -> sub-task hierarchy and the project-wide ratios drift far
 * away from `baseWeights`.
 */
function pickStatus(rng: () => number, project: SeedProjectDef, parent: TaskStatus | null): TaskStatus {
  const weights = baseWeights(project);

  if (parent != null) {
    if (parent === 'TERMINE' && chance(rng, 0.8)) return 'TERMINE';
    if (parent === 'BLOQUE' && weights.BLOQUE > 0 && chance(rng, 0.5)) return 'BLOQUE';
    if (parent === 'EN_COURS' && chance(rng, 0.55)) return 'EN_COURS';
    if (parent === 'A_FAIRE' && weights.TERMINE < 80 && chance(rng, 0.7)) {
      return weightedPick(rng, ['A_FAIRE', 'EN_COURS'], [65, 35]);
    }
  }

  return weightedPick(rng, TASK_STATUSES, TASK_STATUSES.map((s) => weights[s]));
}

/**
 * Finished work gets its deadline relative to its completion date, so the
 * on-time/late split stays believable (~65% on time). Open work gets a
 * deadline relative to *now* so "overdue" keeps meaning after a rebuild.
 */
function computeDueDate(
  rng: () => number,
  status: TaskStatus,
  createdAtMs: number,
  now: number,
  doneMs: number
): number {
  let dueMs: number;

  if (status === 'TERMINE') {
    // The finish date is known, so anchor the deadline to it: roughly two
    // thirds of finished work lands on or before the deadline.
    dueMs = doneMs + randInt(rng, -15, 30) * DAY;
  } else {
    const roll = rng();
    const ageDays = Math.floor((now - createdAtMs) / DAY);
    if (roll < 0.2 && ageDays > 8) {
      // Overdue, but never before the task was created.
      dueMs = now - randInt(rng, 1, Math.min(45, ageDays - 3)) * DAY;
    } else if (roll < 0.7) {
      dueMs = now + randInt(rng, 1, 30) * DAY;
    } else {
      dueMs = now + randInt(rng, 31, 90) * DAY;
    }
  }

  if (dueMs <= createdAtMs) dueMs = createdAtMs + randInt(rng, 2, 10) * DAY;
  return dueMs;
}

/**
 * There is no `completedAt` on the Task schema yet, so `updatedAt` doubles as
 * the completion timestamp for finished work — which is enough to answer
 * "how long did this take to finish?" queries today.
 */
function computeUpdatedAt(rng: () => number, status: TaskStatus, createdAtMs: number, now: number): number {
  if (status !== 'TERMINE') return createdAtMs;
  return Math.min(createdAtMs + randInt(rng, 5, 45) * DAY, now);
}

function makeTask(args: {
  id: Types.ObjectId;
  title: string;
  description: string;
  projectId: Types.ObjectId;
  parentId: Types.ObjectId | null;
  assignedTo: Types.ObjectId;
  status: TaskStatus;
  createdAtMs: number;
  now: number;
  rng: () => number;
  workspaceId: Types.ObjectId;
}): Record<string, unknown> {
  const updatedAtMs = computeUpdatedAt(args.rng, args.status, args.createdAtMs, args.now);
  const dueDateMs = computeDueDate(args.rng, args.status, args.createdAtMs, args.now, updatedAtMs);

  return {
    _id: args.id,
    title: args.title,
    description: args.description,
    projectId: args.projectId,
    parentId: args.parentId,
    assignedTo: args.assignedTo,
    dueDate: new Date(dueDateMs),
    status: args.status,
    workspaceId: args.workspaceId,
    createdAt: new Date(args.createdAtMs),
    updatedAt: new Date(updatedAtMs),
  };
}

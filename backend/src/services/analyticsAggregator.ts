import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { Team } from '../models/Team';
import { User } from '../models/User';
import { AuthRequest } from '../middlewares/authenticate';
import { buildVisibleTaskQuery } from './taskService';
import { buildVisibleProjectQuery } from './projectService';

/**
 * Agrégation des données du projet vers les lignes attendues par l'API
 * d'analyse externe.
 *
 * Le service tiers n'a aucune connaissance de MongoDB : il analyse
 * exactement les lignes qu'on lui envoie. Toute la valeur ajoutée de
 * l'écran d'analyse se joue donc ici, en lecture seule.
 */

const DAY_MS = 86_400_000;

interface RawTask {
  _id: unknown;
  title: string;
  projectId: unknown;
  parentId?: unknown;
  assignedTo?: unknown;
  dueDate?: Date | null;
  status: 'A_FAIRE' | 'EN_COURS' | 'BLOQUE' | 'TERMINE';
  createdAt: Date;
  updatedAt: Date;
}

interface RawProject {
  _id: unknown;
  name: string;
  status: 'EN_COURS' | 'TERMINE' | 'SUSPENDU';
  teamId: unknown;
  createdAt: Date;
}

export interface AnalyticsContext {
  /** Tâches visibles par l'appelant (règle RBAC identique à GET /tasks). */
  visibleTasks: RawTask[];
  /** Projets visibles par l'appelant (règle RBAC identique à GET /projects). */
  visibleProjects: RawProject[];
  projectById: Map<string, RawProject>;
  teamNameById: Map<string, string>;
  userNameById: Map<string, string>;
  /** Nombre de sous-tâches directes, par id de tâche parente. */
  childCountById: Map<string, number>;
  /** Tâches de l'espace regroupées par projet, pour les métriques de portefeuille. */
  tasksByProject: Map<string, RawTask[]>;
  now: Date;
}

/**
 * Libellés français : ces chaînes alimentent directement les segments
 * renvoyés par l'API, l'interprétation IA et donc l'interface.
 */
export const TASK_STATUS_LABEL: Record<string, string> = {
  A_FAIRE: 'À faire',
  EN_COURS: 'En cours',
  BLOQUE: 'Bloqué',
  TERMINE: 'Terminé'
};

export const PROJECT_STATUS_LABEL: Record<string, string> = {
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  SUSPENDU: 'Suspendu'
};

const LEVEL_EPIC = 'Épique';
const LEVEL_TASK = 'Tâche';
const LEVEL_SUBTASK = 'Sous-tâche';

const toIso = (d?: Date | string | number | null): string | null =>
  d === null || d === undefined ? null : new Date(d).toISOString();

const toMs = (d?: Date | string | number | null): number | null =>
  d === null || d === undefined ? null : new Date(d).getTime();

const round1 = (n: number): number => Math.round(n * 10) / 10;

/** Premier jour du mois, en clé ISO courte `YYYY-MM-DD` (clé de jointure). */
const monthStart = (t: number): string => {
  const d = new Date(t);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString().slice(0, 10);
};

export async function loadAnalyticsContext(req: AuthRequest): Promise<AnalyticsContext> {
  const wid = req.user!.workspaceId;
  const taskQuery = await buildVisibleTaskQuery(req);
  const projectQuery = buildVisibleProjectQuery(req);

  // Un ADMIN voit déjà tout l'espace : inutile de relire les tâches deux fois.
  const seesWholeWorkspace = Object.keys(taskQuery).length === 1 && 'workspaceId' in taskQuery;

  const [visibleTasks, workspaceTasks, visibleProjects, teams, users] = await Promise.all([
    Task.find(taskQuery).lean(),
    seesWholeWorkspace ? Promise.resolve([]) : Task.find({ workspaceId: wid }).lean(),
    Project.find(projectQuery).lean(),
    Team.find({ workspaceId: wid }).lean(),
    User.find({ workspaceId: wid }, 'name').lean()
  ]);

  const allTasks = (seesWholeWorkspace ? visibleTasks : workspaceTasks) as unknown as RawTask[];

  const childCountById = new Map<string, number>();
  const tasksByProject = new Map<string, RawTask[]>();
  for (const t of allTasks) {
    if (t.parentId) {
      const key = String(t.parentId);
      childCountById.set(key, (childCountById.get(key) ?? 0) + 1);
    }
    const pkey = String(t.projectId);
    const bucket = tasksByProject.get(pkey);
    if (bucket) bucket.push(t);
    else tasksByProject.set(pkey, [t]);
  }

  const projectById = new Map<string, RawProject>();
  for (const p of visibleProjects as unknown as RawProject[]) projectById.set(String(p._id), p);

  const teamNameById = new Map<string, string>();
  for (const t of teams as any[]) teamNameById.set(String(t._id), String(t.name));

  const userNameById = new Map<string, string>();
  for (const u of users as any[]) userNameById.set(String(u._id), String(u.name));

  return {
    visibleTasks: visibleTasks as unknown as RawTask[],
    visibleProjects: visibleProjects as unknown as RawProject[],
    projectById,
    teamNameById,
    userNameById,
    childCountById,
    tasksByProject,
    now: new Date()
  };
}

/** Dataset `taches` : une ligne par tâche visible par l'appelant. */
export function buildTachesRows(ctx: AnalyticsContext): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];

  for (const t of ctx.visibleTasks) {
    const createdAt = new Date(t.createdAt);
    const updatedAt = t.updatedAt ? new Date(t.updatedAt) : createdAt;
    const createdMs = createdAt.getTime();
    const dueMs = toMs(t.dueDate);
    const nowMs = ctx.now.getTime();
    const isDone = t.status === 'TERMINE';

    const project = ctx.projectById.get(String(t.projectId));
    const hasChildren = ctx.childCountById.has(String(t._id));

    rows.push({
      periode: monthStart(createdMs),
      titre: t.title,
      statut: TASK_STATUS_LABEL[t.status] ?? t.status,
      // `Task` ne porte pas de completedAt : la date de fin est approchée par
      // la dernière mise à jour, seule information disponible.
      projet: project?.name ?? 'Non rattaché',
      equipe: project ? (ctx.teamNameById.get(String(project.teamId)) ?? null) : null,
      responsable: t.assignedTo ? (ctx.userNameById.get(String(t.assignedTo)) ?? null) : null,
      niveau: hasChildren ? LEVEL_EPIC : t.parentId ? LEVEL_SUBTASK : LEVEL_TASK,
      date_creation: toIso(createdMs),
      date_echeance: toIso(dueMs),
      date_fin: isDone ? toIso(updatedAt.getTime()) : null,
      delai_jours: round1(Math.max(0, ((isDone ? updatedAt.getTime() : nowMs) - createdMs) / DAY_MS)),
      nb_sous_taches: ctx.childCountById.get(String(t._id)) ?? 0,
      en_retard: dueMs !== null && dueMs < nowMs && !isDone
    });
  }

  rows.sort((a, b) => String(a.date_creation).localeCompare(String(b.date_creation)));
  return rows;
}

/**
 * Dataset `flux-mensuel` : une ligne par mois, du premier historique à
 * aujourd'hui. Flux (créé / terminé) et stock (ouvert / en retard) à la
 * fin du mois — c'est cette séries qui rend `trend` et `forecast` parlants.
 */
export function buildFluxRows(ctx: AnalyticsContext): Record<string, unknown>[] {
  const tasks = ctx.visibleTasks;
  if (tasks.length === 0) return [];

  let earliest = Infinity;
  for (const t of tasks) {
    const c = new Date(t.createdAt).getTime();
    if (c < earliest) earliest = c;
  }

  const first = new Date(earliest);
  let year = first.getUTCFullYear();
  let month = first.getUTCMonth();
  const lastYear = ctx.now.getUTCFullYear();
  const lastMonth = ctx.now.getUTCMonth();

  const rows: Record<string, unknown>[] = [];

  while (year < lastYear || (year === lastYear && month <= lastMonth)) {
    const periodStart = Date.UTC(year, month, 1);
    const periodEnd = Date.UTC(year, month + 1, 1);

    let creees = 0;
    let terminees = 0;
    let ouvertes = 0;
    let retards = 0;

    for (const t of tasks) {
      const createdMs = new Date(t.createdAt).getTime();
      const isDone = t.status === 'TERMINE';
      const finishedMs = isDone ? new Date(t.updatedAt).getTime() : null;

      if (createdMs >= periodStart && createdMs < periodEnd) creees++;
      if (finishedMs !== null && finishedMs >= periodStart && finishedMs < periodEnd) terminees++;

      // Stock : encore ouvert à la fin du mois si créé avant et non clos avant.
      const isOpenAtPeriodEnd = createdMs < periodEnd && (finishedMs === null || finishedMs >= periodEnd);
      if (isOpenAtPeriodEnd) {
        ouvertes++;
        const dueMs = toMs(t.dueDate);
        if (dueMs !== null && dueMs < periodEnd) retards++;
      }
    }

    rows.push({
      periode: new Date(periodStart).toISOString().slice(0, 10),
      taches_creees: creees,
      taches_terminees: terminees,
      ouvertes_fin_mois: ouvertes,
      retards_fin_mois: retards
    });

    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  // On s'arrête au dernier mois COMPLET : le mois en cours est toujours
  // incomplet et fausse `trend` (qui compare la première à la dernière
  // période) et `forecast`. Mesuré sur les données réelles, garder octobre
  // au 27 basculait le signal de « +83 % de tâches terminées » à
  // « chute de 83 % » — un faux alarme que l'IA relaie telle quelle.
  // L'état courant reste disponible via buildSnapshot().
  if (rows.length > 1) rows.pop();

  return rows;
}

/**
 * État du projet à l'instant T, calculé localement.
 *
 * `flux-mensuel` s'arrête au mois complet pour rester honnête sur la
 * tendance ; ce tableau porte donc, lui, la situation immédiate (retards,
 * en-cours) sans passer par l'analyse distante.
 */
export interface AnalyticsSnapshot {
  tachesTotal: number;
  tachesAFaire: number;
  tachesEnCours: number;
  tachesBloquees: number;
  tachesTerminees: number;
  tachesOuvertes: number;
  tachesEnRetard: number;
  tauxAchevement: number;
  delaiMoyenJours: number;
  projetsTotal: number;
  projetsActifs: number;
  projetsTermines: number;
  projetsSuspendus: number;
  equipesTotal: number;
  membresTotal: number;
  historiqueDebut: string | null;
}

export function buildSnapshot(ctx: AnalyticsContext): AnalyticsSnapshot {
  const tasks = ctx.visibleTasks;

  let aFaire = 0;
  let enCours = 0;
  let bloquee = 0;
  let terminee = 0;
  let enRetard = 0;
  let delaySum = 0;
  let earliest: number | null = null;
  const nowMs = ctx.now.getTime();

  for (const t of tasks) {
    const createdMs = new Date(t.createdAt).getTime();
    if (earliest === null || createdMs < earliest) earliest = createdMs;

    if (t.status === 'A_FAIRE') aFaire++;
    else if (t.status === 'EN_COURS') enCours++;
    else if (t.status === 'BLOQUE') bloquee++;
    else if (t.status === 'TERMINE') {
      terminee++;
      delaySum += Math.max(0, new Date(t.updatedAt).getTime() - createdMs) / DAY_MS;
    }

    const dueMs = toMs(t.dueDate);
    if (dueMs !== null && dueMs < nowMs && t.status !== 'TERMINE') enRetard++;
  }

  let actifs = 0;
  let termines = 0;
  let suspendus = 0;
  for (const p of ctx.visibleProjects) {
    if (p.status === 'EN_COURS') actifs++;
    else if (p.status === 'TERMINE') termines++;
    else if (p.status === 'SUSPENDU') suspendus++;
  }

  return {
    tachesTotal: tasks.length,
    tachesAFaire: aFaire,
    tachesEnCours: enCours,
    tachesBloquees: bloquee,
    tachesTerminees: terminee,
    tachesOuvertes: tasks.length - terminee,
    tachesEnRetard: enRetard,
    tauxAchevement: tasks.length === 0 ? 0 : round1((terminee / tasks.length) * 100),
    delaiMoyenJours: terminee === 0 ? 0 : round1(delaySum / terminee),
    projetsTotal: ctx.visibleProjects.length,
    projetsActifs: actifs,
    projetsTermines: termines,
    projetsSuspendus: suspendus,
    equipesTotal: ctx.teamNameById.size,
    membresTotal: ctx.userNameById.size,
    historiqueDebut: earliest === null ? null : new Date(earliest).toISOString().slice(0, 10)
  };
}

/** Dataset `projets` : une ligne par projet visible, avec ses vrais comptes. */
export function buildProjetsRows(ctx: AnalyticsContext): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];
  const nowMs = ctx.now.getTime();

  for (const p of ctx.visibleProjects) {
    const projectTasks = ctx.tasksByProject.get(String(p._id)) ?? [];
    let terminees = 0;
    let bloquees = 0;

    for (const t of projectTasks) {
      if (t.status === 'TERMINE') terminees++;
      else if (t.status === 'BLOQUE') bloquees++;
    }

    const total = projectTasks.length;
    const createdMs = new Date(p.createdAt).getTime();

    rows.push({
      projet: p.name,
      statut: PROJECT_STATUS_LABEL[p.status] ?? p.status,
      equipe: ctx.teamNameById.get(String(p.teamId)) ?? null,
      date_creation: toIso(createdMs),
      nb_taches: total,
      nb_terminees: terminees,
      nb_bloquees: bloquees,
      taux_avancement: total === 0 ? 0 : round1((terminees / total) * 100),
      nb_jours_ouverture: Math.max(0, Math.floor((nowMs - createdMs) / DAY_MS))
    });
  }

  rows.sort((a, b) => Number(b.taux_avancement) - Number(a.taux_avancement));
  return rows;
}

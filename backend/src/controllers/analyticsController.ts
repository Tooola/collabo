import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authenticate';
import { analyticsService, AnalysisType, AnalyticsOutcome } from '../services/analyticsService';
import {
  loadAnalyticsContext,
  buildFluxRows,
  buildTachesRows,
  buildProjetsRows,
  buildSnapshot,
  AnalyticsContext
} from '../services/analyticsAggregator';
import {
  fluxRunSchema,
  tachesRunSchema,
  projetsRunSchema,
  syntheseRunSchema
} from '../validation/analyticsSchemas';

/** Limite imposée par l'API distante : 10 000 lignes par requête. */
const MAX_ROWS = 10_000;
/** En deçà, `trend` et `forecast` n'ont pas assez de points pour être parlants. */
const MIN_PERIODS = 6;

const DEFAULT_ANALYSIS: Record<string, AnalysisType[]> = {
  flux: ['summary', 'trend', 'anomaly', 'forecast'],
  taches: ['summary', 'anomaly', 'distribution'],
  projets: ['summary', 'correlation', 'anomaly', 'distribution'],
  // `forecast` est nécessaire pour tracer la courbe de prévision dans
  // l'écran d'analyse : sans lui, l'API renvoie `forecast: null`.
  synthese: ['summary', 'trend', 'anomaly', 'correlation', 'forecast']
};

const EMPTY_NOTE = "Aucune donnée à analyser pour l'instant : créez quelques tâches puis relancez.";
const THIN_NOTE = (n: number) =>
  `Seulement ${n} période(s) complète(s) disponible(s) : la tendance et la prévision seront peu fiables (6 minimum conseillé).`;

const TACHES_SLUG = 'taches';
const FLUX_SLUG = 'flux-mensuel';
const PROJETS_SLUG = 'projets';

type Row = Record<string, unknown>;

function limitRows(rows: Row[]): { rows: Row[]; truncated: boolean } {
  if (rows.length <= MAX_ROWS) return { rows, truncated: false };
  // On garde les plus récentes : la série est triée par date de création.
  return { rows: rows.slice(-MAX_ROWS), truncated: true };
}

/** Réponse normalée : la page consomme toujours les mêmes clés. */
function respond(
  res: Response,
  outcome: AnalyticsOutcome,
  meta: Record<string, unknown>,
  series: AnalyticsSeries
): void {
  res.json({
    success: outcome.success,
    ...meta,
    series,
    results: outcome.results,
    insights: outcome.insights,
    ai: outcome.ai,
    aiProvider: outcome.ai?.provider ?? null,
    aiStatus: outcome.aiStatus,
    aiNote: outcome.aiNote,
    crossCorrelations: outcome.crossCorrelations,
    synthesis: outcome.synthesis,
    joinAlignment: outcome.joinAlignment,
    durationMs: outcome.durationMs
  });
}

/** Renvoie un résultat vide plutôt qu'un appel distant qui échouerait. */
function respondEmpty(res: Response, meta: Record<string, unknown>): void {
  res.json({
    success: false,
    empty: true,
    message: EMPTY_NOTE,
    ...meta,
    series: emptySeries(),
    results: {},
    insights: {},
    ai: null,
    aiProvider: null,
    aiStatus: null,
    aiNote: null,
    crossCorrelations: [],
    synthesis: null,
    joinAlignment: null,
    durationMs: 0
  });
}

function reject(res: Response, errors: unknown[]): Response {
  return res.status(400).json({ error: 'Validation Error', message: errors });
}

function baseMeta(
  ctx: AnalyticsContext,
  datasets: string[],
  limited: { rows: number; truncated: boolean } & Record<string, unknown>
) {
  return {
    datasets,
    rows: limited.rows,
    truncated: limited.truncated,
    snapshot: buildSnapshot(ctx)
  };
}

/**
 * Séries prêtes à être tracées.
 *
 * L'API d'analyse ne renvoie que des agrégats (`trend` = un premier point et
 * un dernier) : impossible d'en dessiner une courbe. Les lignes brutes sont
 * en revanche déjà construites ici pour être envoyées — on en profite pour les
 * renvoyer, sans appel supplémentaire ni coût de quota.
 */
export interface AnalyticsSeries {
  flux: Array<{ periode: string; creees: number; terminees: number; ouvertes: number; retards: number }>;
  statuts: Array<{ statut: string; total: number }>;
  projets: Array<{ projet: string; avancement: number; taches: number; terminees: number; bloquees: number }>;
  retards: Array<{ equipe: string; retards: number; total: number }>;
}

function emptySeries(): AnalyticsSeries {
  return { flux: [], statuts: [], projets: [], retards: [] };
}

function buildSeries(input: { flux?: Row[]; taches?: Row[]; projets?: Row[] }): AnalyticsSeries {
  const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
  const series = emptySeries();

  series.flux = (input.flux ?? []).map(r => ({
    periode: String(r.periode ?? '').slice(0, 7),
    creees: num(r.taches_creees),
    terminees: num(r.taches_terminees),
    ouvertes: num(r.ouvertes_fin_mois),
    retards: num(r.retards_fin_mois)
  }));

  // Répartition des statuts : une part de ce que l'API regroupe déjà en
  // `grouped`, mais sur l'ensemble des tâches et non sur un découpage.
  const statuts = new Map<string, number>();
  for (const r of input.taches ?? []) {
    const statut = String(r.statut ?? 'Inconnu');
    statuts.set(statut, (statuts.get(statut) ?? 0) + 1);
  }
  series.statuts = [...statuts]
    .map(([statut, total]) => ({ statut, total }))
    .sort((a, b) => b.total - a.total);

  series.projets = (input.projets ?? []).map(r => ({
    projet: String(r.projet ?? ''),
    avancement: num(r.taux_avancement),
    taches: num(r.nb_taches),
    terminees: num(r.nb_terminees),
    bloquees: num(r.nb_bloquees)
  }));

  // Retards par équipe : alimente l'alerte de charge du tableau de bord.
  const parEquipe = new Map<string, { retards: number; total: number }>();
  for (const r of input.taches ?? []) {
    const equipe = String(r.equipe ?? 'Sans équipe');
    const cur = parEquipe.get(equipe) ?? { retards: 0, total: 0 };
    cur.total += 1;
    if (r.en_retard === true) cur.retards += 1;
    parEquipe.set(equipe, cur);
  }
  series.retards = [...parEquipe]
    .map(([equipe, v]) => ({ equipe, ...v }))
    .sort((a, b) => b.retards - a.retards || b.total - a.total);

  return series;
}

export const analyticsController = {
  /**
   * GET /api/analytics/status — indique à la page si le service est branché,
   * sans jamais exposer la clé.
   */
  /**
   * GET /api/analytics/status — va vérifier côté API si la clé est encore
   * acceptée : une variable renseignée peut cacher une clé révoquée, et le
   * badge doit alors passer en alerte plutôt qu'en vert.
   */
  async status(_req: Request, res: Response) {
    const check = await analyticsService.verify();
    res.json({
      configured: check.configured,
      keyValid: check.keyValid,
      application: analyticsService.appSlug,
      datasets: [FLUX_SLUG, TACHES_SLUG, PROJETS_SLUG],
      message: check.message
    });
  },

  /** POST /api/analytics/flux — séries mensuelles, tendance et prévision. */
  async flux(req: Request, res: Response) {
    const parsed = fluxRunSchema.safeParse(req.body ?? {});
    if (!parsed.success) return reject(res, parsed.error.errors);

    const ctx = await loadAnalyticsContext(req as AuthRequest);
    const limited = limitRows(buildFluxRows(ctx));
    const meta = baseMeta(ctx, [FLUX_SLUG], { rows: limited.rows.length, truncated: limited.truncated });

    if (limited.rows.length === 0) return respondEmpty(res, meta);

    const outcome = await analyticsService.analyze({
      dataset: FLUX_SLUG,
      analysis: parsed.data.analysis ?? DEFAULT_ANALYSIS.flux,
      data: limited.rows,
      includeAi: parsed.data.includeAi
    });

    respond(
      res,
      outcome,
      {
        ...meta,
        warning: limited.rows.length < MIN_PERIODS ? THIN_NOTE(limited.rows.length) : null
      },
      buildSeries({ flux: limited.rows })
    );
  },

  /** POST /api/analytics/taches — statistiques par segment et anomalies de délai. */
  async taches(req: Request, res: Response) {
    const parsed = tachesRunSchema.safeParse(req.body ?? {});
    if (!parsed.success) return reject(res, parsed.error.errors);

    const ctx = await loadAnalyticsContext(req as AuthRequest);
    const limited = limitRows(buildTachesRows(ctx));
    const meta = baseMeta(ctx, [TACHES_SLUG], { rows: limited.rows.length, truncated: limited.truncated });

    if (limited.rows.length === 0) return respondEmpty(res, meta);

    const outcome = await analyticsService.analyze({
      dataset: TACHES_SLUG,
      analysis: parsed.data.analysis ?? DEFAULT_ANALYSIS.taches,
      data: limited.rows,
      groupBy: parsed.data.groupBy ?? 'projet',
      includeAi: parsed.data.includeAi
    });

    respond(res, outcome, meta, buildSeries({ taches: limited.rows }));
  },

  /** POST /api/analytics/projets — portefeuille et corrélations d'avancement. */
  async projets(req: Request, res: Response) {
    const parsed = projetsRunSchema.safeParse(req.body ?? {});
    if (!parsed.success) return reject(res, parsed.error.errors);

    const ctx = await loadAnalyticsContext(req as AuthRequest);
    const limited = limitRows(buildProjetsRows(ctx));
    const meta = baseMeta(ctx, [PROJETS_SLUG], { rows: limited.rows.length, truncated: limited.truncated });

    if (limited.rows.length === 0) return respondEmpty(res, meta);

    const outcome = await analyticsService.analyze({
      dataset: PROJETS_SLUG,
      analysis: parsed.data.analysis ?? DEFAULT_ANALYSIS.projets,
      data: limited.rows,
      groupBy: parsed.data.groupBy ?? 'equipe',
      includeAi: parsed.data.includeAi
    });

    respond(res, outcome, meta, buildSeries({ projets: limited.rows }));
  },

  /**
   * POST /api/analytics/synthese — un seul appel pour les trois jeux de
   * données, les liens entre eux et la décision. C'est l'appel principal du
   * tableau de bord : il remplace trois appels et évite de grignoter le quota.
   */
  async synthese(req: Request, res: Response) {
    const parsed = syntheseRunSchema.safeParse(req.body ?? {});
    if (!parsed.success) return reject(res, parsed.error.errors);

    const ctx = await loadAnalyticsContext(req as AuthRequest);
    const flux = limitRows(buildFluxRows(ctx));
    const taches = limitRows(buildTachesRows(ctx));
    const projets = limitRows(buildProjetsRows(ctx));

    const meta = baseMeta(ctx, [FLUX_SLUG, TACHES_SLUG, PROJETS_SLUG], {
      rows: flux.rows.length + taches.rows.length + projets.rows.length,
      truncated: flux.truncated || taches.truncated || projets.truncated,
      rowsByDataset: {
        [FLUX_SLUG]: flux.rows.length,
        [TACHES_SLUG]: taches.rows.length,
        [PROJETS_SLUG]: projets.rows.length
      }
    });

    // Sans période exploitable la jointure n'a aucun sens : on n'appelle pas
    // l'API distante pour un résultat vide.
    if (flux.rows.length === 0 || taches.rows.length === 0) return respondEmpty(res, meta);

    const outcome = await analyticsService.analyzeMulti({
      datasets: [FLUX_SLUG, TACHES_SLUG, PROJETS_SLUG],
      payloads: {
        [FLUX_SLUG]: flux.rows,
        [TACHES_SLUG]: taches.rows,
        [PROJETS_SLUG]: projets.rows
      },
      analysis: parsed.data.analysis ?? DEFAULT_ANALYSIS.synthese,
      joinKey: 'periode',
      groupBy: parsed.data.groupBy ?? 'projet',
      includeAi: parsed.data.includeAi
    });

    respond(
      res,
      outcome,
      {
        ...meta,
        warning: flux.rows.length < MIN_PERIODS ? THIN_NOTE(flux.rows.length) : null
      },
      buildSeries({ flux: flux.rows, taches: taches.rows, projets: projets.rows })
    );
  }
};

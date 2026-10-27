import { env } from '../config/env';
import { HttpError } from '../utils/httpError';

/**
 * Client de l'API d'analyse externe.
 *
 * Fichier strictement côté serveur : la clé `X-API-Key` est lue dans
 * l'environnement et n'est jamais renvoyée au navigateur, écrite dans un
 * journal, ni versionnée.
 */

/** Types d'analyse acceptés par l'API distante. */
export const ANALYSIS_TYPES = [
  'summary',
  'trend',
  'anomaly',
  'correlation',
  'distribution',
  'forecast'
] as const;

export type AnalysisType = (typeof ANALYSIS_TYPES)[number];

/** Réveil de l'instance gratuite : le premier appel peut prendre 30 à 60 s. */
const REQUEST_TIMEOUT_MS = 90_000;
/** Fenêtre de récupération de quota documentée par l'API. */
const RETRY_DELAY_MS = 60_000;
/** Budget total, pour rester dans le temps de requête autorisé par Render. */
const TOTAL_BUDGET_MS = 150_000;

const AI_UNAVAILABLE_NOTE =
  "L'interprétation IA est momentanément indisponible. Les statistiques ci-dessous restent valables.";

export interface AnalyticsErrorPayload {
  dataset?: string;
  field?: string;
  row?: number;
  error: string;
}

/**
 * Erreur métier portant un statut HTTP et un message déjà en français.
 * Hérite de `HttpError` pour être prise en charge par `errorHandler`.
 */
export class AnalyticsError extends HttpError {
  constructor(
    status: number,
    message: string,
    details: AnalyticsErrorPayload[] = []
  ) {
    super(status, message, details);
    this.name = 'AnalyticsError';
  }
}

export interface AiInterpretation {
  provider?: string;
  summary?: string;
  key_findings?: string[];
  recommendations?: string[];
  action_plan?: string[];
  risk_assessment?: string;
  confidence?: number | string;
}

/** Forme normalée : identique pour une analyse simple et pour l'analyse multi. */
export interface AnalyticsOutcome {
  success: boolean;
  /** Blocs de résultats, indexés par slug de jeu de données. */
  results: Record<string, any>;
  /** Insights, indexés par slug de jeu de données. */
  insights: Record<string, any[]>;
  /** Validations, indexées par slug de jeu de données. */
  validations: Record<string, any>;
  ai: AiInterpretation | null;
  aiStatus: 'ok' | 'error' | null;
  /** Message français à afficher quand l'IA n'a pas répondu. */
  aiNote: string | null;
  crossCorrelations: any[];
  synthesis: any | null;
  joinAlignment: any | null;
  /** Durée totale de l'appel distant, en millisecondes. */
  durationMs: number;
}

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

function requireConfigured(): void {
  if (!env.analyticsApiKey) {
    throw new AnalyticsError(
      503,
      "Le service d'analyse n'est pas configuré : renseignez ANALYTICS_API_KEY sur le serveur."
    );
  }
}

/** Traduit les codes HTTP de l'API distante en messages explicites. */
function describeHttpError(status: number, payload: any): string {
  const detail =
    typeof payload?.detail === 'string'
      ? payload.detail
      : Array.isArray(payload?.detail)
        ? payload.detail
            .slice(0, 3)
            .map((d: any) => d?.msg)
            .filter(Boolean)
            .join(' · ')
        : '';

  const base: Record<number, string> = {
    401: "Clé API d'analyse absente ou invalide : vérifiez ANALYTICS_API_KEY sur le serveur.",
    403: 'Ce jeu de données appartient à une autre application d’analyse.',
    404: "Jeu de données inconnu côté service d'analyse : vérifiez la déclaration des datasets.",
    422: "Le corps envoyé ne correspond pas au contrat de l'API d'analyse.",
    429: 'Quota de lancement d’analyse dépassé. Réessayez dans une minute.',
    500: 'Erreur interne du service d’analyse.',
    502: 'Service d’analyse indisponible (passerelle en erreur). Réessayez plus tard.',
    503: 'Service d’analyse indisponible. Réessayez plus tard.'
  };

  const message = base[status] ?? `Le service d'analyse a répondu ${status}. Réessayez plus tard.`;
  return detail ? `${message} Détail : ${detail}` : message;
}

/** Récupère les erreurs de schéma, qu'elles soient simples ou multi-jeux. */
function collectValidationErrors(payload: any): AnalyticsErrorPayload[] {
  const errors: AnalyticsErrorPayload[] = [];

  const single = payload?.validation?.errors;
  if (Array.isArray(single)) {
    for (const e of single) {
      errors.push({ field: e.field, row: e.row, error: e.error ?? 'valeur non conforme' });
    }
  }

  const multi = payload?.validations;
  if (multi && typeof multi === 'object') {
    for (const [slug, validation] of Object.entries<any>(multi)) {
      const list = validation?.errors;
      if (!Array.isArray(list)) continue;
      for (const e of list) {
        errors.push({ dataset: slug, field: e.field, row: e.row, error: e.error ?? 'valeur non conforme' });
      }
    }
  }

  return errors;
}

function validationMessage(errors: AnalyticsErrorPayload[]): string {
  if (errors.length === 0) return 'Les données envoyées ne respectent pas le schéma déclaré.';
  const first = errors[0];
  const where = first.row !== undefined ? ` (ligne ${first.row})` : '';
  const field = first.field ? ` — champ « ${first.field} »${where}` : where;
  const more = errors.length > 1 ? ` et ${errors.length - 1} autre(s)` : '';
  return `Les données ne respectent pas le schéma déclaré${field}${more}.`;
}

/** Envoie une requête en gérant le réveil à froid et le quota 429. */
async function post(path: string, body: Record<string, unknown>, requiresKey = true): Promise<any> {
  if (requiresKey) requireConfigured();

  const started = Date.now();
  let attempt = 0;

  for (;;) {
    attempt++;
    const budgetLeft = TOTAL_BUDGET_MS - (Date.now() - started);
    if (budgetLeft <= 0) {
      throw new AnalyticsError(429, "Quota de l'analyse dépassé. Réessayez dans une minute.");
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.min(REQUEST_TIMEOUT_MS, budgetLeft));

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (env.analyticsApiKey) headers['X-API-Key'] = env.analyticsApiKey;

    let res: Response;
    try {
      res = await fetch(`${env.analyticsApiUrl}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });
    } catch {
      // Réveil de l'instance gratuite ou coupure réseau : on renvoie un
      // message réessaiable plutôt qu'une erreur bloquante.
      throw new AnalyticsError(
        504,
        "Le service d'analyse met du temps à répondre (premier appel après inactivité). Réessayez dans une minute."
      );
    } finally {
      clearTimeout(timer);
    }

    if (res.status === 429) {
      const wait = Math.min(RETRY_DELAY_MS, TOTAL_BUDGET_MS - (Date.now() - started));
      if (attempt >= 2 || wait < 5_000) {
        throw new AnalyticsError(429, "Quota de l'analyse dépassé. Réessayez dans une minute.");
      }
      await sleep(wait);
      continue;
    }

    const text = await res.text();
    let payload: any = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = { detail: text.slice(0, 300) };
    }

    if (!res.ok) throw new AnalyticsError(res.status, describeHttpError(res.status, payload));

    // HTTP 200 + success:false = schéma non conforme, pas une réussite.
    if (payload?.success === false) {
      const errors = collectValidationErrors(payload);
      throw new AnalyticsError(422, validationMessage(errors), errors);
    }

    return payload;
  }
}

/** L'API renvoie `ai_interpretation` comme chaîne JSON à parser. */
function parseAi(payload: any): Pick<AnalyticsOutcome, 'ai' | 'aiStatus' | 'aiNote'> {
  const status = (payload?.ai_status ?? null) as 'ok' | 'error' | null;
  const raw = payload?.ai_interpretation;

  if (raw === null || raw === undefined) {
    return { ai: null, aiStatus: status, aiNote: status === 'error' ? AI_UNAVAILABLE_NOTE : null };
  }

  if (typeof raw === 'object') {
    return { ai: raw as AiInterpretation, aiStatus: status ?? 'ok', aiNote: null };
  }

  try {
    return { ai: JSON.parse(raw) as AiInterpretation, aiStatus: status ?? 'ok', aiNote: null };
  } catch {
    return { ai: null, aiStatus: 'error', aiNote: "L'avis IA n'a pas pu être lu." };
  }
}

function normalizeSingle(payload: any, durationMs: number): AnalyticsOutcome {
  const slug = String(payload.dataset);
  return {
    success: payload.success !== false,
    results: { [slug]: payload.results ?? null },
    insights: { [slug]: payload.insights ?? [] },
    validations: { [slug]: payload.validation ?? {} },
    ...parseAi(payload),
    crossCorrelations: [],
    synthesis: null,
    joinAlignment: null,
    durationMs
  };
}

function normalizeMulti(payload: any, durationMs: number): AnalyticsOutcome {
  return {
    success: payload.success !== false,
    results: payload.results ?? {},
    insights: payload.insights ?? {},
    validations: payload.validations ?? {},
    ...parseAi(payload),
    crossCorrelations: payload.cross_correlations ?? [],
    synthesis: payload.synthesis ?? null,
    joinAlignment: payload.join_alignment ?? null,
    durationMs
  };
}

export const analyticsService = {
  isConfigured(): boolean {
    return Boolean(env.analyticsApiKey);
  },

  get appSlug(): string {
    return env.analyticsAppSlug;
  },

  /** `POST /api/v1/analyze` — un jeu de données à la fois. */
  async analyze(input: {
    dataset: string;
    analysis: AnalysisType[];
    data: Record<string, unknown>[];
    groupBy?: string;
    includeAi?: boolean;
  }): Promise<AnalyticsOutcome> {
    const started = Date.now();
    const payload = await post('/api/v1/analyze', {
      application: env.analyticsAppSlug,
      dataset: input.dataset,
      analysis: input.analysis,
      data: input.data,
      include_ai: input.includeAi ?? true,
      ...(input.groupBy ? { group_by: input.groupBy } : {})
    });
    return normalizeSingle(payload, Date.now() - started);
  },

  /** `POST /api/v1/analyze/multi` — plusieurs jeux de données et leur synthèse. */
  async analyzeMulti(input: {
    datasets: string[];
    payloads: Record<string, Record<string, unknown>[]>;
    analysis: AnalysisType[];
    joinKey?: string;
    groupBy?: string;
    includeAi?: boolean;
  }): Promise<AnalyticsOutcome> {
    const started = Date.now();
    const payload = await post('/api/v1/analyze/multi', {
      application: env.analyticsAppSlug,
      datasets: input.datasets,
      payloads: input.payloads,
      analysis: input.analysis,
      include_ai: input.includeAi ?? true,
      ...(input.joinKey ? { join_key: input.joinKey } : {}),
      ...(input.groupBy ? { group_by: input.groupBy } : {})
    });
    return normalizeMulti(payload, Date.now() - started);
  },

  /** `POST /api/v1/analyze/quick` — validation hors ligne, sans clé. */
  async quick(data: Record<string, unknown>[], analysis: AnalysisType[]): Promise<any> {
    const started = Date.now();
    const payload = await post('/api/v1/analyze/quick', { data, analysis }, false);
    return { ...payload, durationMs: Date.now() - started };
  }
};

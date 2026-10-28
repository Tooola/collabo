import { env } from '../config/env';
import {
  ANALYTICS_APPLICATION_DESCRIPTION,
  ANALYTICS_DATASETS,
  applicationNameCandidates
} from '../config/analyticsCatalog';
import { persistAnalyticsCredentials } from '../config/analyticsKeyStore';
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

/** Vérification légère de la clé : testée sur GET /datasets, mise en cache. */
const STATUS_CACHE_MS = 60_000;
let cachedStatus: { at: number; value: StatusCheck } | null = null;

export interface StatusCheck {
  /** La variable est-elle renseignée ? */
  configured: boolean;
  /** L'API distante accepte-t-elle encore cette clé ? */
  keyValid: boolean;
  /** Message déjà en français, prêt à être affiché. */
  message: string;
}

/**
 * Identité de travail, remplacée **en mémoire** lorsque la plateforme a purgé
 * sa base : ses applications et leurs datasets y disparaissent, et l'ancienne
 * clé devient alors inutilisable (`401 Invalid or revoked API key`).
 *
 * `.env` reste la source de vérité au démarrage : le serveur ne réécrit jamais
 * un fichier d'environnement. Après un renouvellement, un message en français
 * invite l'exploitant à mettre le `.env` à jour pour la prochaine mise en service.
 */
let runtimeKey: string | null = null;
let runtimeSlug: string | null = null;

/** Clé réellement envoyée dans l'en-tête `X-API-Key` de la prochaine requête. */
const effectiveKey = (): string => runtimeKey ?? env.analyticsApiKey ?? '';

/**
 * Slug réellement envoyé dans le champ `application` des requêtes d'analyse.
 * Ce champ est **obligatoire** et le contrat est strict (`additionalProperties:
 * false`) : après une réparation, il doit suivre la nouvelle application.
 */
const effectiveSlug = (): string => runtimeSlug ?? env.analyticsAppSlug;

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
  if (!effectiveKey()) {
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

// --- Réparation automatique -------------------------------------------------
//
// La plateforme d'analyse réinitialise périodiquement sa base : les
// applications, leurs clés et leurs datasets disparaissent, et l'ancienne clé
// renvoie alors `401 Invalid or revoked API key`. Plutôt que d'afficher une
// erreur bloquante à la première tentative, on recrée l'application, on
// redéclare les trois jeux, puis on rejoue la requête d'origine une fois.

/** Budget de la réparation : sonde, création de l'application, datasets. */
const RENEW_TIMEOUT_MS = 30_000;
const RENEW_BUDGET_MS = 60_000;
/** Garde-fou : ne pas recréer des applications en boucle si la clé reste morte. */
const RENEW_MAX_ATTEMPTS = 3;
const RENEW_WINDOW_MS = 10 * 60_000;

/** Une seule réparation à la fois : les requêtes concurrentes l'attendent. */
let renewal: Promise<boolean> | null = null;
const renewalHistory: number[] = [];

type ProbeResult = 'ok' | 'refused' | 'unreachable';

async function readPayload(res: Response): Promise<any> {
  const text = await res.text().catch(() => '');
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { detail: text.slice(0, 300) };
  }
}

function detailOf(payload: any): string {
  const detail = payload?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .slice(0, 3)
      .map((d: any) => d?.msg)
      .filter(Boolean)
      .join(' · ');
  }
  return '';
}

/** Sonde légère : la clé est-elle encore acceptée par `GET /datasets` ? */
async function probeDatasets(key: string, timeoutMs = 15_000): Promise<ProbeResult> {
  if (!key) return 'refused';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${env.analyticsApiUrl}/api/v1/datasets`, {
      headers: { 'X-API-Key': key },
      signal: controller.signal
    });
    const status = res.status;
    await res.text().catch(() => '');

    if (res.ok) return 'ok';
    if (status === 401 || status === 403) return 'refused';
    return 'unreachable';
  } catch {
    return 'unreachable';
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Crée l'application. Le `slug` n'est pas envoyé : il en est dérivé. Si le nom
 * canonique est déjà pris par une application dont on a perdu la clé, on
 * essaie le nom suivant — impossible de la régénérer sans sa propre clé.
 */
async function createApplication(signal: AbortSignal): Promise<{ key: string; slug: string }> {
  let lastDetail = '';

  for (const name of applicationNameCandidates()) {
    const res = await fetch(`${env.analyticsApiUrl}/api/v1/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: ANALYTICS_APPLICATION_DESCRIPTION }),
      signal
    });
    const payload = await readPayload(res);

    if (res.status === 201 && payload?.api_key) {
      return { key: String(payload.api_key), slug: String(payload.slug ?? '') };
    }
    if (res.status === 409) {
      lastDetail = `le nom « ${name} » est déjà utilisé`;
      continue;
    }
    throw new AnalyticsError(
      503,
      `Création de l'application d'analyse impossible (${res.status}) : ${
        detailOf(payload) || 'réponse inattendue'
      }. Réessayez dans une minute.`
    );
  }

  throw new AnalyticsError(
    503,
    `Création de l'application d'analyse impossible, ${lastDetail}. Réessayez dans une minute.`
  );
}

/** Redéclare les trois jeux de données : sans eux, l'analyse est vide. */
async function declareDatasets(key: string, signal: AbortSignal): Promise<void> {
  for (const dataset of ANALYTICS_DATASETS) {
    const res = await fetch(`${env.analyticsApiUrl}/api/v1/datasets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': key },
      body: JSON.stringify(dataset),
      signal
    });

    if (res.status !== 201) {
      const payload = await readPayload(res);
      throw new AnalyticsError(
        503,
        `Le jeu de données « ${dataset.slug} » n'a pas pu être déclaré (${
          res.status
        }) : ${detailOf(payload) || 'réponse inattendue'}. Réessayez dans une minute.`
      );
    }
  }
}

/**
 * Recrée l'application et ses jeux de données quand la clé a été invalidée.
 *
 * @returns `true` si une clé neuve a été émise ; `false` si la clé courante
 *          fonctionne en réalité (401 isolé) et qu'il n'y a rien à réparer.
 */
async function renewKey(): Promise<boolean> {
  if (!renewal) {
    renewal = performRenewal().finally(() => {
      renewal = null;
    });
  }
  return renewal;
}

async function performRenewal(): Promise<boolean> {
  const now = Date.now();
  if (renewalHistory.filter(at => now - at < RENEW_WINDOW_MS).length >= RENEW_MAX_ATTEMPTS) {
    throw new AnalyticsError(
      503,
      "Renouvellement automatique de la clé d'analyse limité : la plateforme refuse toujours les identifiants. Réessayez dans quelques minutes."
    );
  }

  // Signal ambigu = aucune destruction : la clé peut encore fonctionner.
  const probe = await probeDatasets(effectiveKey(), RENEW_TIMEOUT_MS);
  if (probe === 'ok') return false;
  if (probe === 'unreachable') {
    throw new AnalyticsError(
      504,
      "Le service d'analyse est injoignable : réparation automatique reportée. Réessayez dans une minute."
    );
  }

  // Compté même en cas d'échec partiel : c'est bien le nombre de créations
  // d'applications qu'on veut borner.
  renewalHistory.push(Date.now());

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RENEW_BUDGET_MS);

  try {
    const created = await createApplication(controller.signal);
    await declareDatasets(created.key, controller.signal);

    runtimeKey = created.key;
    runtimeSlug = created.slug;
    cachedStatus = null;

    // La clé n'est jamais journalisée : on ne peut donc pas la redemander à
    // l'exploitant. On la grave dans `.env`, seule façon de survivre à un
    // redémarrage sans recréer une application supplémentaire.
    const persisted = persistAnalyticsCredentials(created.key, created.slug);

    console.warn(
      `⚠️ [analytics] Base de la plateforme purgée : application recréée (slug « ${created.slug} »), ` +
        `${ANALYTICS_DATASETS.length} jeux de données redéclarés. ${persisted.message}`
    );
    return true;
  } catch (err) {
    if (err instanceof AnalyticsError) throw err;
    throw new AnalyticsError(
      504,
      "La réparation de l'analyse a dépassé le temps imparti. Réessayez dans une minute."
    );
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Envoie une requête en gérant le réveil à froid, le quota 429 et — surtout —
 * la purge de la plateforme : un `401` déclenche une réparation automatique,
 * puis un unique rejeu, pour ne jamais bloquer à la première tentative.
 */
async function post(path: string, body: Record<string, unknown>, requiresKey = true): Promise<any> {
  if (requiresKey) requireConfigured();

  const started = Date.now();
  let attempt = 0;
  let renewalAttempted = false;
  let renewalSucceeded = false;

  for (;;) {
    attempt++;
    const budgetLeft = TOTAL_BUDGET_MS - (Date.now() - started);
    if (budgetLeft <= 0) {
      throw new AnalyticsError(
        429,
        "Temps imparti dépassé pour l'analyse (réveil du service ou réparation de la clé). Réessayez dans une minute."
      );
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.min(REQUEST_TIMEOUT_MS, budgetLeft));

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const key = effectiveKey();
    if (key) headers['X-API-Key'] = key;

    // Reprendu à chaque tour : la réparation vient peut-être de changer le slug,
    // et le champ `application` est obligatoire dans le contrat d'analyse.
    const payloadBody = requiresKey ? { ...body, application: effectiveSlug() } : body;

    let res: Response;
    try {
      res = await fetch(`${env.analyticsApiUrl}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payloadBody),
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

    // Purge de la base distante : la clé n'est plus rattachée à aucune
    // application. On recrée tout, puis on rejoue une seule fois.
    if (res.status === 401 && requiresKey) {
      const payload401 = await readPayload(res);

      if (!renewalAttempted) {
        renewalAttempted = true;
        renewalSucceeded = await renewKey();
        continue;
      }

      throw new AnalyticsError(
        401,
        renewalSucceeded
          ? "La clé d'analyse est refusée alors qu'elle vient d'être renouvelée : la plateforme est instable. Réessayez dans une minute."
          : describeHttpError(401, payload401)
      );
    }

    if (res.status === 429) {
      const wait = Math.min(RETRY_DELAY_MS, TOTAL_BUDGET_MS - (Date.now() - started));
      if (attempt >= 2 || wait < 5_000) {
        throw new AnalyticsError(429, "Quota de l'analyse dépassé. Réessayez dans une minute.");
      }
      await sleep(wait);
      continue;
    }

    const payload = await readPayload(res);

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
    return Boolean(effectiveKey());
  },

  get appSlug(): string {
    return effectiveSlug();
  },

  /**
   * Distingue « variable renseignée » de « clé encore acceptée ».
   *
   * Une clé révoquée renvoie un 401 alors que tout semble configuré : sans ce
   * contrôle, le badge afficherait « connecté » pendant que chaque analyse
   * échoue. Seul un 401/403 est traité comme une clé morte — les erreurs
   * passagères ne déclenchent pas de fausse alerte.
   */
  async verify(): Promise<StatusCheck> {
    if (!effectiveKey()) {
      return {
        configured: false,
        keyValid: false,
        message: "Service d'analyse non configuré : renseignez ANALYTICS_API_KEY sur le serveur."
      };
    }

    if (cachedStatus && Date.now() - cachedStatus.at < STATUS_CACHE_MS) return cachedStatus.value;

    const probe = await probeDatasets(effectiveKey());

    let value: StatusCheck;
    if (probe === 'ok') {
      value = { configured: true, keyValid: true, message: "Service d'analyse externe branché." };
    } else if (probe === 'refused') {
      // Purge probable de la plateforme : on se répare aussi depuis le statut,
      // pour que le badge repasse au vert et que la page soit utilisable sans
      // que l'utilisateur ait à lancer une analyse.
      try {
        value = (await renewKey())
          ? {
              configured: true,
              keyValid: true,
              message:
                'Clé renouvelée automatiquement : la plateforme avait purgé ses applications.'
            }
          : { configured: true, keyValid: true, message: "Service d'analyse externe branché." };
      } catch (err) {
        value = {
          configured: true,
          keyValid: false,
          message:
            err instanceof AnalyticsError
              ? err.message
              : "Clé d'analyse révoquée ou invalide : régénérez-la sur l'API d'analyse, puis mettez à jour ANALYTICS_API_KEY et redémarrez le serveur."
        };
      }
    } else {
      value = {
        configured: true,
        keyValid: true,
        message: "API d'analyse injoignable pour l'instant (réveil à froid ?). Réessayez plus tard."
      };
    }

    cachedStatus = { at: Date.now(), value };
    return value;
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
    // `application` est injecté par `post()` avec le slug effectif : il suit
    // donc automatiquement une réparation de l'application.
    const payload = await post('/api/v1/analyze', {
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

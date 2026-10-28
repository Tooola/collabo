import { existsSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Conservation des identifiants d'analyse après un renouvellement automatique.
 *
 * Sans ce module, la clé neuve n'existe qu'en mémoire : au redémarrage
 * suivant, `.env` porterait encore l'ancienne clé morte, le serveur
 * recréerait une application — et son slug changerait — à chaque lancement.
 *
 * On réécrit donc **uniquement** les deux lignes concernées. Toutes les
 * autres (SMTP, MongoDB, JWT…) sont recopiées à l'identique, retours de
 * ligne compris.
 *
 * La valeur n'est jamais journalisée : ce module ne renvoie que des messages.
 * Le fichier reste ignoré par git, au même titre que `.env`.
 */

const KEY_VAR = 'ANALYTICS_API_KEY';
const SLUG_VAR = 'ANALYTICS_APP_SLUG';

export interface PersistResult {
  ok: boolean;
  /** Fichier visé, même en cas d'échec : utile pour l'exploitant. */
  path: string;
  /** Message déjà en français, prêt à être journalisé. */
  message: string;
}

/**
 * Emplacement exact du fichier lu par dotenv : la variable `DOTENV_CONFIG_PATH`
 * prime, sinon c'est `.env` du répertoire de lancement du serveur.
 */
function envFilePath(): string {
  return process.env.DOTENV_CONFIG_PATH ?? join(process.cwd(), '.env');
}

/**
 * Remplace les deux lignes d'identifiants d'analyse, en conservant le reste du
 * fichier octet pour octet. Les clés absentes sont ajoutées en fin de fichier.
 */
function setCredLines(content: string, key: string, slug: string): string {
  const eol = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = content.split(/\r?\n/);

  let keyPresent = false;
  let slugPresent = false;

  const updated = lines.map(line => {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(line);
    if (!match) return line;

    if (match[1] === KEY_VAR) {
      keyPresent = true;
      return `${KEY_VAR}=${key}`;
    }
    if (match[1] === SLUG_VAR) {
      slugPresent = true;
      return `${SLUG_VAR}=${slug}`;
    }
    return line;
  });

  if (!keyPresent || !slugPresent) {
    const extra = [
      '',
      "# Identifiants d'analyse - reecrits automatiquement apres un renouvellement.",
      ...(keyPresent ? [] : [`${KEY_VAR}=${key}`]),
      ...(slugPresent ? [] : [`${SLUG_VAR}=${slug}`])
    ];

    // Inséré avant l'éventuelle ligne vide finale, pour conserver le retour à
    // la ligne qui termine le fichier.
    if (updated[updated.length - 1] === '') {
      updated.splice(updated.length - 1, 0, ...extra);
    } else {
      updated.push(...extra);
    }
  }

  return updated.join(eol);
}

/**
 * Écrit les identifiants d'analyse fraîchement renouvelés dans `.env`.
 *
 * Ne lève jamais : une impossibilité d'écriture ne doit pas faire échouer
 * l'analyse, puisque la clé fonctionne déjà en mémoire. Le message renvoyé
 * indique alors ce qu'il reste à faire à l'exploitant.
 */
export function persistAnalyticsCredentials(key: string, slug: string): PersistResult {
  const path = envFilePath();

  try {
    if (!existsSync(path)) {
      return {
        ok: false,
        path,
        message:
          "Aucun fichier .env à réécrire : la clé renouvelée reste valable jusqu'au prochain " +
          "redémarrage. Si ce serveur tourne sur une plateforme à variables d'environnement " +
          '(Render, Vercel…), renseignez-y ANALYTICS_API_KEY et ANALYTICS_APP_SLUG.'
      };
    }

    const original = readFileSync(path, 'utf-8');
    const updated = setCredLines(original, key, slug);

    if (updated === original) {
      return { ok: true, path, message: `${KEY_VAR} et ${SLUG_VAR} sont déjà à jour dans ${path}.` };
    }

    // Écriture transitoire puis remplacement : une interruption en plein
    // `writeFileSync` laisserait sinon un `.env` amputé, ce qui casserait tout
    // le serveur au démarrage suivant.
    const tmp = `${path}.tmp`;
    writeFileSync(tmp, updated, 'utf-8');

    try {
      renameSync(tmp, path);
    } catch {
      // Windows refuse parfois le remplacement si un éditeur tient le fichier
      // ouvert : on retombe sur une écriture directe.
      writeFileSync(path, updated, 'utf-8');
      try {
        unlinkSync(tmp);
      } catch {
        // Déjà remplacé, ou jamais créé : rien à faire.
      }
    }

    return { ok: true, path, message: `Clé et slug d'analyse enregistrés dans ${path}.` };
  } catch (err) {
    const cause = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      path,
      message:
        `Écriture de ${path} impossible (${cause}) : la clé renouvelée reste en mémoire. ` +
        'Mettez ANALYTICS_API_KEY à la main avant le prochain redémarrage.'
    };
  }
}

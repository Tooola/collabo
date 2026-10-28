/**
 * Catalogue d'analyse : déclaration canonique de l'application et des jeux de
 * données distants.
 *
 * Ces définitions servent deux fois :
 *  1. à la création initiale, faite à la main sur la plateforme ;
 *  2. à la réparation automatique (`analyticsService.renewKey`) quand la
 *     plateforme a purgé sa base — les applications et leurs datasets y
 *     disparaissent, ce qui rend l'ancienne clé inutilisable.
 *
 * Côté serveur uniquement : rien de ce fichier ne contient de clé.
 */

/**
 * Types acceptés par `DatasetFieldType`. Il n'existe ni `json` ni `text` :
 * toute autre valeur est rejetée en 422.
 */
export type AnalyticsTechnicalType =
  | 'string'
  | 'integer'
  | 'float'
  | 'boolean'
  | 'date'
  | 'datetime';

export interface AnalyticsFieldDeclaration {
  name: string;
  technical_type: AnalyticsTechnicalType;
  /** Libellé libre, non contractuel : décrit le rôle métier de la colonne. */
  semantic_type?: string | null;
  unit?: string | null;
  /** `true` par défaut côté API. */
  required?: boolean;
  description?: string | null;
}

export interface AnalyticsDatasetDeclaration {
  name: string;
  /** Obligatoire pour un dataset — contrairement à l'application. */
  slug: string;
  description: string;
  fields: AnalyticsFieldDeclaration[];
}

/**
 * Nom de l'application. Le `slug` n'est jamais envoyé : il en est dérivé.
 * Il doit rester aligné avec `ANALYTICS_APP_SLUG` du `.env`, transmis dans
 * chaque requête `analyze` (champ `application`, obligatoire et strict).
 */
export const ANALYTICS_APPLICATION_NAME = 'GestPro';

export const ANALYTICS_APPLICATION_DESCRIPTION =
  "Gestion de projet collaborative pour equipes : suivi de taches et sous-taches " +
  '(a faire, en cours, bloque, termine), repartition en projets et equipes, echeances, ' +
  "retards et taux d'avancement. Objectif : piloter la charge des equipes, detecter " +
  'les taches bloquees et les retards, et estimer la livraison des projets.';

/**
 * Noms essayés lors d'une réparation : si « GestPro » existe déjà mais que la
 * clé est morte (révocation sans purge), on ne peut ni le régénérer ni le
 * supprimer sans sa propre clé — on passe au nom suivant plutôt que d'échouer.
 * Le slug en dérivant sert uniquement à l'affichage côté `status`.
 */
export function applicationNameCandidates(): string[] {
  return [ANALYTICS_APPLICATION_NAME, 'GestPro 2', 'GestPro 3', 'GestPro 4'];
}

/**
 * Les trois jeux de données de GestPro, dans l'ordre de la synthèse.
 *
 * `periode` est la clé de jointure : `flux-mensuel` et `taches` l'alignent sur
 * le mois, ce qui rend possibles les corrélations croisées. `projets` n'a pas
 * de colonne de période et n'est donc pas joint — il est analysé seul puis
 * intégré à la synthèse.
 */
export const ANALYTICS_DATASETS: AnalyticsDatasetDeclaration[] = [
  {
    name: 'Flux mensuel des taches',
    slug: 'flux-mensuel',
    description:
      "Series mensuelles du flux de travail : creation, cloture, stock ouvert et retards, " +
      "pour analyser tendances et previsions sur l'historique du projet.",
    fields: [
      {
        name: 'periode',
        technical_type: 'date',
        semantic_type: 'periode',
        required: true,
        description: 'Premier jour du mois mesure (cle de jointure multi-jeux)'
      },
      {
        name: 'taches_creees',
        technical_type: 'integer',
        semantic_type: 'volume',
        required: true,
        description: 'Taches creees dans le mois'
      },
      {
        name: 'taches_terminees',
        technical_type: 'integer',
        semantic_type: 'volume',
        required: true,
        description: 'Taches cloturees dans le mois'
      },
      {
        name: 'ouvertes_fin_mois',
        technical_type: 'integer',
        semantic_type: 'stock',
        required: true,
        description: 'Taches encore ouvertes a la fin du mois'
      },
      {
        name: 'retards_fin_mois',
        technical_type: 'integer',
        semantic_type: 'risque',
        required: true,
        description: 'Taches en retard a la fin du mois'
      }
    ]
  },
  {
    name: 'Taches individuelles',
    slug: 'taches',
    description:
      'Une ligne par tache du projet, avec statut, rattachement, echeance et delai de ' +
      "resolution. Sert aux statistiques par segment (projet, equipe, responsable) et a " +
      "la detection d'anomalies.",
    fields: [
      {
        name: 'periode',
        technical_type: 'date',
        semantic_type: 'periode',
        required: true,
        description: 'Mois de creation ajuste au 1er du mois (cle de jointure multi-jeux)'
      },
      {
        name: 'titre',
        technical_type: 'string',
        semantic_type: 'libelle',
        required: true,
        description: 'Intitule de la tache'
      },
      {
        name: 'statut',
        technical_type: 'string',
        semantic_type: 'categorie',
        required: true,
        description: 'Libelle du statut : a faire, en cours, bloque, termine'
      },
      {
        name: 'projet',
        technical_type: 'string',
        semantic_type: 'categorie',
        required: true,
        description: 'Projet rattache'
      },
      {
        name: 'equipe',
        technical_type: 'string',
        semantic_type: 'categorie',
        required: false,
        description: 'Equipe responsable'
      },
      {
        name: 'responsable',
        technical_type: 'string',
        semantic_type: 'categorie',
        required: false,
        description: "Membre assigne, vide si la tache n'est pas affectee"
      },
      {
        name: 'niveau',
        technical_type: 'string',
        semantic_type: 'categorie',
        required: true,
        description: 'epic, tache ou sous-tache'
      },
      {
        name: 'date_creation',
        technical_type: 'datetime',
        semantic_type: 'horodatage',
        required: true,
        description: 'Date de creation'
      },
      {
        name: 'date_echeance',
        technical_type: 'datetime',
        semantic_type: 'horodatage',
        required: false,
        description: 'Echeance planifiee'
      },
      {
        name: 'date_fin',
        technical_type: 'datetime',
        semantic_type: 'horodatage',
        required: false,
        description:
          'Derniere mise a jour si terminee (approximation : le modele ne porte pas de completedAt)'
      },
      {
        name: 'delai_jours',
        technical_type: 'float',
        semantic_type: 'duree',
        unit: 'jours',
        required: true,
        description: "Jours entre creation et cloture, ou jusqu'a aujourd'hui si encore ouverte"
      },
      {
        name: 'nb_sous_taches',
        technical_type: 'integer',
        semantic_type: 'volume',
        required: true,
        description: 'Nombre de sous-taches directes'
      },
      {
        name: 'en_retard',
        technical_type: 'boolean',
        semantic_type: 'risque',
        required: true,
        description: 'Echeance passee et non terminee'
      }
    ]
  },
  {
    name: 'Projets',
    slug: 'projets',
    description:
      'Une ligne par projet, avec avancement, repartition des statuts et anciennete. ' +
      'Sert au pilotage de portefeuille.',
    fields: [
      {
        name: 'projet',
        technical_type: 'string',
        semantic_type: 'libelle',
        required: true,
        description: 'Nom du projet'
      },
      {
        name: 'statut',
        technical_type: 'string',
        semantic_type: 'categorie',
        required: true,
        description: 'Libelle du statut : en cours, termine, suspendu'
      },
      {
        name: 'equipe',
        technical_type: 'string',
        semantic_type: 'categorie',
        required: false,
        description: 'Equipe rattachee'
      },
      {
        name: 'date_creation',
        technical_type: 'datetime',
        semantic_type: 'horodatage',
        required: true,
        description: 'Date de creation'
      },
      {
        name: 'nb_taches',
        technical_type: 'integer',
        semantic_type: 'volume',
        required: true,
        description: 'Total des taches du projet'
      },
      {
        name: 'nb_terminees',
        technical_type: 'integer',
        semantic_type: 'volume',
        required: true,
        description: 'Taches terminees'
      },
      {
        name: 'nb_bloquees',
        technical_type: 'integer',
        semantic_type: 'risque',
        required: true,
        description: 'Taches bloquees'
      },
      {
        name: 'taux_avancement',
        technical_type: 'float',
        semantic_type: 'ratio',
        unit: '%',
        required: true,
        description: 'Pourcentage de taches terminees'
      },
      {
        name: 'nb_jours_ouverture',
        technical_type: 'integer',
        semantic_type: 'duree',
        unit: 'jours',
        required: true,
        description: 'Jours ecoules depuis la creation'
      }
    ]
  }
];

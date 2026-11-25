/**
 * Traducteur & Humaniseur Métier pour l'Analytics Décisionnel.
 * 
 * Élimine tout jargon technique (termes de bases de données, formules statistiques,
 * noms de colonnes SQL, indicateurs mathématiques bruts) au profit d'un langage
 * exécutif clair, direct et orienté prise de décision.
 */

const FIELD_LABELS = {
  // Flux mensuel
  periode: 'Période',
  taches_creees: 'Tâches créées',
  taches_terminees: 'Tâches livrées',
  ouvertes_fin_mois: 'Tâches en cours',
  retards_fin_mois: 'Tâches en retard',
  
  // Tâches individuelles
  titre: 'Intitulé de la tâche',
  statut: 'Statut',
  projet: 'Projet',
  equipe: 'Équipe responsable',
  responsable: 'Assigné à',
  niveau: 'Type de tâche',
  date_creation: 'Date de lancement',
  date_echeance: 'Échéance fixée',
  date_fin: 'Date de livraison',
  delai_jours: 'Délai de réalisation (jours)',
  nb_sous_taches: 'Nombre de sous-tâches',
  en_retard: 'En situation de retard',
  
  // Projets
  nb_taches: 'Volume de tâches',
  nb_terminees: 'Tâches finalisées',
  nb_bloquees: 'Points de blocage',
  taux_avancement: 'Taux d’avancement',
  nb_jours_ouverture: 'Ancienneté (jours)'
};

const DATASET_LABELS = {
  'flux-mensuel': 'Dynamique mensuelle des livraisons',
  taches: 'Activité opérationnelle des équipes',
  projets: 'Avancement du portefeuille projets'
};

const VERDICT_DETAILS = {
  positif: {
    label: 'Activité Fluide & Performante',
    badge: 'Performance optimale',
    theme: 'emerald',
    description: 'Le rythme de livraison dépasse les créations et les retards sont maîtrisés.'
  },
  equilibre: {
    label: 'Activité Stable & Sous Contrôle',
    badge: 'Rythme maîtrisé',
    theme: 'sky',
    description: 'La cadence de réalisation absorbe régulièrement la charge entrante.'
  },
  surveiller: {
    label: 'Points de Vigilance Détectés',
    badge: 'Vigilance requise',
    theme: 'amber',
    description: 'Certains délais s’allongent ou des tâches bloquées nécessitent une intervention.'
  },
  tension: {
    label: 'Forte Tension Opérationnelle',
    badge: 'Alerte surcharge',
    theme: 'red',
    description: 'Le stock de tâches ouvertes ou en retard s’accumule plus vite que les clôtures.'
  }
};

const SEVERITY_LABELS = {
  high: { label: 'Action requise', color: 'red' },
  medium: { label: 'À surveiller', color: 'amber' },
  low: { label: 'Information', color: 'slate' }
};

/**
 * Traduit un nom de champ technique (ex: `taches_creees`) en libellé métier lisible.
 */
export function humanizeField(fieldName) {
  if (!fieldName || typeof fieldName !== 'string') return '—';
  const clean = fieldName.trim().toLowerCase();
  if (FIELD_LABELS[clean]) return FIELD_LABELS[clean];
  // Fallback si champ inconnu : retire les underscores et met en majuscule initiale
  return clean
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Traduit le slug d'un jeu de données en titre managérial.
 */
export function humanizeDataset(slug) {
  return DATASET_LABELS[slug] || (slug ? String(slug).replace(/-/g, ' ') : 'Jeu de données');
}

/**
 * Traduit le verdict décisionnel.
 */
export function humanizeVerdict(verdict) {
  const v = (verdict || 'equilibre').toLowerCase();
  return VERDICT_DETAILS[v] || VERDICT_DETAILS.equilibre;
}

/**
 * Traduit le niveau de sévérité.
 */
export function humanizeSeverity(severity) {
  const s = (severity || 'low').toLowerCase();
  return SEVERITY_LABELS[s] || SEVERITY_LABELS.low;
}

/**
 * Formate une variation de tendance en phrase claire.
 */
export function formatTrendNarrative(trend) {
  if (!trend) return null;
  const col = humanizeField(trend.column);
  const up = trend.direction === 'up' || trend.direction === 'hausse';
  const down = trend.direction === 'down' || trend.direction === 'baisse';
  const pct = Math.abs(trend.change_pct ?? 0).toFixed(1);

  if (up) {
    return {
      title: `${col}`,
      direction: 'up',
      badge: `+${pct}%`,
      text: `Progression de +${pct}% sur les dernières périodes observées.`
    };
  }
  if (down) {
    return {
      title: `${col}`,
      direction: 'down',
      badge: `-${pct}%`,
      text: `Diminution de -${pct}% sur les dernières périodes observées.`
    };
  }
  return {
    title: `${col}`,
    direction: 'flat',
    badge: 'Stable',
    text: `Niveau stable sans variation majeure.`
  };
}

/**
 * Nettoie les textes IA ou système pour retirer tout reste de code ou snake_case.
 */
export function cleanText(text) {
  if (typeof text !== 'string') return text;
  let res = text;
  // Remplacer les noms de colonnes techniques courants trouvés dans les phrases
  Object.entries(FIELD_LABELS).forEach(([raw, clean]) => {
    const regex = new RegExp(`\\b${raw}\\b`, 'gi');
    res = res.replace(regex, clean);
  });
  return res;
}

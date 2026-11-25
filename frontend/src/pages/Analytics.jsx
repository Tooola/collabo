import { useCallback, useEffect, useState } from 'react';
import {
  ChartColumn, RefreshCw, Sparkles, TriangleAlert, Lightbulb, TrendingUp,
  ArrowUpRight, ArrowDownRight, CheckCircle2, AlertOctagon,
  Clock, Layers, ShieldCheck, Activity, Target, ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import AnalyticsCharts from '../components/AnalyticsCharts';
import {
  humanizeField,
  humanizeDataset,
  humanizeVerdict,
  humanizeSeverity,
  formatTrendNarrative,
  cleanText
} from '../utils/analyticsHumanizer';

/**
 * Rapport Décisionnel & Tableau de Bord Exécutif.
 *
 * Conçu pour les dirigeants et managers :
 * - Hiérarchie visuelle immédiate, aérée et élégante.
 * - Aucune formule mathématique ni métrique brute.
 * - Diagnostic clair dès le premier regard sans surcharge.
 */

const GROUP_OPTIONS = [
  { value: 'projet', label: 'Vue par Projet' },
  { value: 'equipe', label: 'Vue par Équipe' },
  { value: 'statut', label: 'Vue par Statut' },
  { value: '', label: 'Vue Consolidée' }
];

const num = (v, digits = 1) =>
  typeof v === 'number' && Number.isFinite(v) ? Number(v.toFixed(digits)).toLocaleString() : '—';

const pct = v => (typeof v === 'number' && Number.isFinite(v) ? `${num(v, 1)} %` : '—');

const asPercent = v => {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return n <= 1 ? Math.round(n * 100) : Math.round(n);
};

function md(text) {
  if (typeof text !== 'string') return text;
  const cleaned = cleanText(text);
  if (!cleaned.includes('**')) return cleaned;
  return cleaned.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-slate-900 dark:text-white">{part}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function SectionHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export default function Analytics() {
  const { t } = useLanguage();

  const [status, setStatus] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [groupBy, setGroupBy] = useState('projet');

  const load = useCallback(async (group) => {
    setLoading(true);
    setError(null);

    const res = await api('POST', '/analytics/synthese', { groupBy: group || undefined });
    if (!res.ok) {
      setData(null);
      setError(res.data?.message || 'Impossible de joindre le service d\'analyse pour le moment.');
    } else if (res.data?.empty) {
      setData(null);
      setError(res.data.message);
    } else {
      setData(res.data);
      setError(null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    api('GET', '/analytics/status').then(res => {
      if (!cancelled && res.ok) setStatus(res.data);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    load('projet');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const results = data?.results ?? {};
  const ai = data?.ai;
  const synthesis = data?.synthesis;
  const snapshot = data?.snapshot;
  const verdictInfo = humanizeVerdict(synthesis?.verdict);

  const run = () => load(groupBy);

  // Style de verdict sobre et statutaire
  const verdictBadgeStyle = {
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/40',
    sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/40',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/40',
    red: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/40'
  }[verdictInfo.theme] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-12">
      {/* ── EN-TÊTE ÉPURÉ & CONTRÔLES ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200/70 dark:border-slate-800/70">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Rapport Analytique Décisionnel
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
              <Sparkles className="w-3 h-3 text-indigo-500" /> Synthèse IA
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Vue d'ensemble de l'activité, tendances de flux et recommandations d'arbitrage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {status && (
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                !status.configured
                  ? 'bg-amber-50/60 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/40'
                  : status.keyValid === false
                    ? 'bg-rose-50/60 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 border-rose-200 dark:border-rose-800/40'
                    : 'bg-emerald-50/60 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/40'
              }`}
              title={status.message}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${status.keyValid ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {!status.configured ? 'Non configuré' : status.keyValid === false ? 'Clé révoquée' : 'Données en direct'}
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 shadow-xs">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={groupBy}
              onChange={e => {
                setGroupBy(e.target.value);
                load(e.target.value);
              }}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {GROUP_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={run}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Calcul…' : 'Actualiser'}
          </button>
        </div>
      </div>

      {/* Alerte d'erreur éventuelle */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/70 dark:bg-rose-950/20 p-4 text-xs sm:text-sm text-rose-800 dark:text-rose-200">
          <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1">
            <p className="font-semibold">{error}</p>
            <button onClick={run} className="mt-1.5 text-xs font-bold underline underline-offset-2 hover:text-rose-900">
              Relancer l'analyse
            </button>
          </div>
        </div>
      )}

      {data && (
        <>
          {/* ── 1. INDICATEURS CLÉS DE PERFORMANCE (KPIs) ── */}
          {snapshot && (
            <div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {/* 1. Avancement global */}
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Avancement</span>
                    <Target className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <div className="my-2">
                    <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {pct(snapshot.tauxAchevement)}
                    </p>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, snapshot.tauxAchevement || 0))}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {snapshot.tachesTerminees} / {snapshot.tachesTotal} livrées
                  </span>
                </div>

                {/* 2. Délai moyen */}
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Délai moyen</span>
                    <Clock className="w-3.5 h-3.5 text-sky-500" />
                  </div>
                  <div className="my-2">
                    <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {num(snapshot.delaiMoyenJours)} <span className="text-xs font-medium text-slate-500">jours</span>
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Temps moyen de clôture</span>
                </div>

                {/* 3. Tâches en retard */}
                <div className={`rounded-xl p-4 border shadow-2xs flex flex-col justify-between ${
                  snapshot.tachesEnRetard > 0
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/70 dark:border-rose-900/40'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">En retard</span>
                    <AlertOctagon className={`w-3.5 h-3.5 ${snapshot.tachesEnRetard > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
                  </div>
                  <div className="my-2">
                    <p className={`text-xl sm:text-2xl font-bold tracking-tight ${snapshot.tachesEnRetard > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                      {snapshot.tachesEnRetard}
                    </p>
                  </div>
                  <span className={`text-[11px] font-medium ${snapshot.tachesEnRetard > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {snapshot.tachesEnRetard > 0 ? 'Arbitrage prioritaire' : 'Aucun retard'}
                  </span>
                </div>

                {/* 4. Points de blocage */}
                <div className={`rounded-xl p-4 border shadow-2xs flex flex-col justify-between ${
                  snapshot.tachesBloquees > 0
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/40'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Bloquées</span>
                    <TriangleAlert className={`w-3.5 h-3.5 ${snapshot.tachesBloquees > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
                  </div>
                  <div className="my-2">
                    <p className={`text-xl sm:text-2xl font-bold tracking-tight ${snapshot.tachesBloquees > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                      {snapshot.tachesBloquees}
                    </p>
                  </div>
                  <span className={`text-[11px] font-medium ${snapshot.tachesBloquees > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {snapshot.tachesBloquees > 0 ? 'Goulot à débloquer' : 'Flux dégagé'}
                  </span>
                </div>

                {/* 5. Tâches en cours */}
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">En cours</span>
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <div className="my-2">
                    <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {snapshot.tachesOuvertes}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Volume actif en cours</span>
                </div>

                {/* 6. Projets suivis */}
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Projets</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="my-2">
                    <p className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {snapshot.projetsTotal}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Chantiers sous gestion</span>
                </div>
              </div>
            </div>
          )}

          {/* ── 2. SYNTHÈSE STRATÉGIQUE & RECOMMANDATIONS (Avis Exécutif) ── */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
            {/* Barre de statut supérieure */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Diagnostic Global & Évaluation
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {verdictInfo.label}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${verdictBadgeStyle}`}>
                  {verdictInfo.badge}
                </span>
                {ai?.confidence && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Fiabilité : {asPercent(ai.confidence)}%
                  </span>
                )}
              </div>
            </div>

            {/* Texte de synthèse managériale */}
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {md(ai?.summary || synthesis?.summary || verdictInfo.description)}
            </p>

            {/* Grille des 3 axes d'action */}
            <div className="grid gap-4 md:grid-cols-3 pt-1">
              {/* 1. Constats */}
              <div className="rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-500" />
                  1. Constats Majeurs
                </div>
                {Array.isArray(ai?.key_findings) && ai.key_findings.length > 0 ? (
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {ai.key_findings.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <span>{md(item)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">Activité fluide sans écart notable.</p>
                )}
              </div>

              {/* 2. Recommandations */}
              <div className="rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  2. Recommandations Clés
                </div>
                {Array.isArray(ai?.recommendations) && ai.recommendations.length > 0 ? (
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {ai.recommendations.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{md(item)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">Consolider le plan de livraison en cours.</p>
                )}
              </div>

              {/* 3. Plan d'action */}
              <div className="rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  3. Plan d'Action Immédiat
                </div>
                {Array.isArray(ai?.action_plan) && ai.action_plan.length > 0 ? (
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {ai.action_plan.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{md(item)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">Poursuivre les arbitrages réguliers.</p>
                )}
              </div>
            </div>

            {/* Encart sobre de vigilance / risques si présent */}
            {(ai?.risk_assessment || (Array.isArray(synthesis?.risks) && synthesis.risks.length > 0)) && (
              <div className="rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 p-3.5 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
                <TriangleAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-rose-900 dark:text-rose-100">
                    Point de Vigilance :
                  </span>{' '}
                  <span>{md(ai?.risk_assessment || synthesis?.risks?.join(' · '))}</span>
                </div>
              </div>
            )}
          </div>

          {/* ── 3. VISUALISATIONS & PROJECTIONS DÉCISIONNELLES ── */}
          <AnalyticsCharts data={data} />

          {/* ── 4. BILAN DE PERFORMANCE PAR SEGMENT (Revue de Portefeuille) ── */}
          <div className="space-y-4">
            <SectionHeader
              title="Dynamique & Performance Opérationnelle"
              subtitle="Tendances récentes de flux et équilibre de la charge de travail"
              icon={TrendingUp}
            />

            <div className="grid gap-5 lg:grid-cols-2">
              {/* Carte A : Tendances de flux récentes */}
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
                <div className="mb-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Tendances Constatées
                  </h4>
                  <p className="text-xs text-slate-400">Évolution observée sur les dernières périodes</p>
                </div>

                {(() => {
                  const fluxTrends = results['flux-mensuel']?.trend || [];
                  const activeTrends = fluxTrends.filter(t => t.column !== 'periode');
                  if (activeTrends.length === 0) {
                    return (
                      <p className="text-xs text-slate-400 py-6 text-center">
                        Historique en cours de constitution pour tracer les tendances.
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-2.5">
                      {activeTrends.map((tr, i) => {
                        const narrative = formatTrendNarrative(tr);
                        const isUp = narrative.direction === 'up';
                        const isDown = narrative.direction === 'down';
                        const isOverdue = tr.column?.includes('retard');
                        const isFavorable = isOverdue ? isDown : isUp;

                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 text-xs"
                          >
                            <div className="space-y-0.5">
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {narrative.title}
                              </span>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {narrative.text}
                              </p>
                            </div>
                            <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md text-xs ${
                              isFavorable
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                            }`}>
                              {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : isDown ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
                              {narrative.badge}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Carte B : Répartition de la charge par entité */}
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
                <div className="mb-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Répartition de la Charge par {groupBy ? groupBy.charAt(0).toUpperCase() + groupBy.slice(1) : 'Entité'}
                  </h4>
                  <p className="text-xs text-slate-400">Volume de tâches et part de traitement relative</p>
                </div>

                {(() => {
                  const grouped = results['taches']?.grouped || results['projets']?.grouped;
                  const segments = grouped?.segments || [];
                  if (segments.length === 0) {
                    return (
                      <p className="text-xs text-slate-400 py-6 text-center">
                        Sélectionnez une vue (Projet, Équipe) pour afficher la répartition.
                      </p>
                    );
                  }
                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                            <th className="py-2 font-semibold">Entité</th>
                            <th className="py-2 text-right font-semibold">Tâches</th>
                            <th className="py-2 text-right font-semibold">Charge relative</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                          {segments.map((seg, idx) => {
                            const metric = seg.metrics?.[grouped.ranked_by] || Object.values(seg.metrics || {})[0];
                            const share = metric?.share;
                            return (
                              <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">
                                  {seg.segment || 'Non assigné'}
                                </td>
                                <td className="py-2.5 text-right font-medium text-slate-600 dark:text-slate-400">
                                  {num(seg.row_count, 0)}
                                </td>
                                <td className="py-2.5 text-right">
                                  {typeof share === 'number' ? (
                                    <div className="inline-flex items-center gap-2 justify-end w-32">
                                      <div className="h-1.5 w-16 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                        <div
                                          className="h-full bg-indigo-500 rounded-full"
                                          style={{ width: `${Math.min(100, Math.max(0, share * 100))}%` }}
                                        />
                                      </div>
                                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                                        {pct(share * 100)}
                                      </span>
                                    </div>
                                  ) : (
                                    '—'
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── PIED DE PAGE DISCRET ── */}
      {data && (
        <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>
            Analyse consolidée sur {data.rows} éléments en {num((data.durationMs ?? 0) / 1000, 1)}s.
          </p>
          <p className="flex items-center gap-1.5 font-medium text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Données traitées et sécurisées en continu
          </p>
        </div>
      )}
    </div>
  );
}

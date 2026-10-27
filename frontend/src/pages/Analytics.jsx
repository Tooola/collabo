import { useCallback, useEffect, useState } from 'react';
import {
  ChartColumn, RefreshCw, Sparkles, TriangleAlert, Lightbulb, TrendingUp,
  ArrowUpRight, ArrowDownRight, Gauge, Database
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Écran d'analyse : les lignes sont construites par le backend (lecture seule
 * sur MongoDB) puis envoyées à l'API d'analyse externe. Aucune clé ne transite
 * par le navigateur — la page n'appelle que /api/analytics/*.
 */

const GROUP_OPTIONS = ['', 'projet', 'statut', 'equipe'];

const DATASETS = [
  { slug: 'flux-mensuel', key: 'dsFlux' },
  { slug: 'taches', key: 'dsTaches' },
  { slug: 'projets', key: 'dsProjets' }
];

const SEVERITY_STYLE = {
  high: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20',
  medium: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  low: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
};

const VERDICT_STYLE = {
  positif: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  equilibre: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-500/20',
  tension: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20',
  surveiller: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
};

const num = (v, digits = 1) =>
  typeof v === 'number' && Number.isFinite(v) ? Number(v.toFixed(digits)).toLocaleString() : '—';

const pct = v => (typeof v === 'number' && Number.isFinite(v) ? `${num(v, 1)} %` : '—');

/** La confiance arrive tantôt en fraction (0-92), tantôt en pourcentage. */
const asPercent = v => {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return n <= 1 ? Math.round(n * 100) : Math.round(n);
};

/**
 * Le service d'analyse livre ses textes avec du gras Markdown (`**mot**`).
 * On le convertit en <strong> au lieu d'afficher les astérisques bruts.
 */
function md(text) {
  if (typeof text !== 'string' || !text.includes('**')) return text;
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-black text-slate-900 dark:text-white">{part}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function Card({ title, icon: Icon, children, className = '' }) {
  return (
    <section className={`rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 shadow-sm ${className}`}>
      {title && (
        <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-4">
          {Icon && <Icon className="w-4 h-4 text-indigo-500" />}
          {title}
        </h3>
      )}
      {children}
    </section>
  );
}

function EmptyBlock({ k = 'nothing' }) {
  const { t } = useLanguage();
  return <p className="text-xs text-slate-400 dark:text-slate-500">{t('analytics', k)}</p>;
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
      setError(res.data?.message || t('analytics', 'error'));
    } else if (res.data?.empty) {
      setData(null);
      setError(res.data.message);
    } else {
      setData(res.data);
      setError(null);
    }

    setLoading(false);
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    api('GET', '/analytics/status').then(res => {
      if (!cancelled && res.ok) setStatus(res.data);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    load('projet');
    // Le premier rendu lance l'analyse ; les relances passent par le bouton.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const results = data?.results ?? {};
  const insights = Object.values(data?.insights ?? {}).flat();
  const ai = data?.ai;
  const synthesis = data?.synthesis;
  const snapshot = data?.snapshot;

  const run = () => load(groupBy);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-slate-900 dark:text-white">
            <ChartColumn className="w-6 h-6 text-indigo-500" />
            {t('analytics', 'title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('analytics', 'subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {status && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${
                status.configured
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                  : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
              }`}
              title={status.message}
            >
              <Database className="w-3.5 h-3.5" />
              {t('analytics', status.configured ? 'statusOk' : 'statusMissing')}
            </span>
          )}

          <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            {t('analytics', 'groupBy')}
            <select
              value={groupBy}
              onChange={e => setGroupBy(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{t('analytics', 'none')}</option>
              {GROUP_OPTIONS.filter(Boolean).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>

          <button
            onClick={run}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/30 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? t('analytics', 'running') : t('analytics', 'run')}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
          <TriangleAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">{error}</p>
            <button onClick={run} className="mt-2 font-bold underline underline-offset-2">
              {t('analytics', 'retry')}
            </button>
          </div>
        </div>
      )}

      {data?.warning && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
          <TriangleAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{data.warning}</p>
        </div>
      )}

      {/* Instantané : calculé côté serveur, indépendant de l'appel distant */}
      {snapshot && (
        <Card title={t('analytics', 'kpiTitle')} icon={Gauge}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {[
              [t('analytics', 'kpiTasks'), snapshot.tachesTotal],
              [t('analytics', 'kpiOpen'), snapshot.tachesOuvertes],
              [t('analytics', 'kpiDone'), snapshot.tachesTerminees],
              [t('analytics', 'kpiBlocked'), snapshot.tachesBloquees],
              [t('analytics', 'kpiOverdue'), snapshot.tachesEnRetard],
              [t('analytics', 'kpiProgress'), pct(snapshot.tauxAchevement)],
              [t('analytics', 'kpiDelay'), `${num(snapshot.delaiMoyenJours)} d`],
              [t('analytics', 'kpiProjects'), snapshot.projetsTotal]
            ].map(([label, value], i) => (
              <div key={label} className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
                <p className={`mt-1 text-lg font-black ${i === 4 && snapshot.tachesEnRetard > 0 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Avis IA */}
      <Card title={t('analytics', 'aiTitle')} icon={Sparkles}>
        {!ai ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{data?.aiNote ?? t('analytics', 'aiUnavailable')}</p>
        ) : (
          <div className="space-y-4">
            {ai.provider && (
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {t('analytics', 'aiProvider')} : {ai.provider}
                {asPercent(ai.confidence) !== null && (
                  <span className="ml-3">{t('analytics', 'aiConfidence')} : {asPercent(ai.confidence)} %</span>
                )}
              </p>
            )}

            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{md(ai.summary)}</p>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                [t('analytics', 'aiFindings'), ai.key_findings],
                [t('analytics', 'aiRecommendations'), ai.recommendations],
                [t('analytics', 'aiPlan'), ai.action_plan]
              ].map(([label, items]) => (
                <div key={label} className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3">
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    {label}
                  </p>
                  {Array.isArray(items) && items.length > 0 ? (
                    <ul className="space-y-1.5">
                      {items.map((item, i) => (
                        <li key={i} className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                          <span className="mr-1 font-black text-indigo-500">{i + 1}.</span>
                          {md(item)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400">—</p>
                  )}
                </div>
              ))}
            </div>

            {ai.risk_assessment && (
              <p className="rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-3 text-xs font-semibold text-amber-700 dark:text-amber-300">
                <span className="font-black">{t('analytics', 'aiRisk')} : </span>
                {md(ai.risk_assessment)}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Synthèse décisionnelle */}
      {synthesis && (
        <Card title={t('analytics', 'synthesisTitle')} icon={TrendingUp}>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${
                VERDICT_STYLE[synthesis.verdict] ?? VERDICT_STYLE.equilibre
              }`}
            >
              {t('analytics', 'verdict')} : {synthesis.verdict}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {synthesis.datasets_analyzed} jeux · {synthesis.total_rows} {t('analytics', 'rowsLabel')}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{md(synthesis.summary)}</p>

          {Array.isArray(synthesis.risks) && synthesis.risks.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {synthesis.risks.map((risk, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
                  <TriangleAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {md(risk)}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* Liens entre jeux */}
      <Card title={t('analytics', 'linksTitle')} icon={Database}>
        {data?.joinAlignment && (
          <p className="mb-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {data.joinAlignment.join_key} · {data.joinAlignment.aligned_keys} {t('analytics', 'alignedKeys')}
            {data.joinAlignment.note ? ` — ${data.joinAlignment.note}` : ''}
          </p>
        )}
        {data?.crossCorrelations?.length ? (
          <ul className="space-y-2">
            {data.crossCorrelations.map((c, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {c.dataset1}.{c.column1}
                </span>
                <span className={`font-black ${c.coefficient >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {c.coefficient >= 0 ? '↑' : '↓'}
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {c.dataset2}.{c.column2}
                </span>
                <span className="ml-auto font-black text-indigo-500">r = {num(c.coefficient, 3)}</span>
                <span className="text-slate-400">{c.strength} · {c.relationship}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyBlock k="noLinks" />
        )}
      </Card>

      {/* Signaux */}
      <Card title={t('analytics', 'insightsTitle')} icon={TriangleAlert}>
        {insights.length === 0 ? (
          <EmptyBlock />
        ) : (
          <ul className="space-y-2">
            {insights.map((ins, i) => (
              <li key={ins.id ?? i} className="rounded-xl border p-3 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${SEVERITY_STYLE[ins.severity] ?? SEVERITY_STYLE.low}`}>
                    {ins.severity}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{ins.type}</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{ins.title}</span>
                  {typeof ins.value === 'number' && (
                    <span className="ml-auto text-xs font-black text-indigo-500">
                      {ins.metric} : {num(ins.value)} {ins.unit ?? ''}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{md(ins.description)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Résultats par jeu de données */}
      <h2 className="flex items-center gap-2 pt-2 text-lg font-black text-slate-900 dark:text-white">
        <ChartColumn className="w-5 h-5 text-indigo-500" />
        {t('analytics', 'resultsTitle')}
      </h2>

      <div className="grid gap-6 xl:grid-cols-2">
        {DATASETS.map(({ slug, key }) => {
          const block = results[slug];
          if (!block) return null;
          return (
            <DatasetCard key={slug} slug={slug} title={t('analytics', key)} block={block} rows={data?.rowsByDataset?.[slug]} />
          );
        })}
      </div>

      {/* Pied de page */}
      {data && (
        <p className="pb-6 text-xs text-slate-400 dark:text-slate-500">
          {t('analytics', 'durationNote').replace('{s}', num((data.durationMs ?? 0) / 1000, 1))}
          {' · '}{data.rows} {t('analytics', 'rowsLabel')}
          {data.truncated && ` · ${t('analytics', 'truncatedNote')}`}
          {' · '}{t('analytics', 'disclaimer')}
        </p>
      )}
    </div>
  );
}

function DatasetCard({ slug, title, block, rows }) {
  const { t } = useLanguage();

  const summary = block.summary ?? [];
  const trend = block.trend ?? [];
  const anomaly = block.anomaly ?? [];
  const correlation = block.correlation ?? [];
  const distribution = block.distribution ?? [];
  const forecast = block.forecast ?? [];
  const grouped = block.grouped;

  return (
    <Card title={`${title}${rows ? ` · ${rows}` : ''}`} icon={ChartColumn} className="self-start">
      <div className="space-y-5">
        {summary.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t('analytics', 'summary')}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-400">
                    <th className="py-1 pr-3 font-black">{t('analytics', 'column')}</th>
                    <th className="py-1 pr-3 font-black text-right">{t('analytics', 'count')}</th>
                    <th className="py-1 pr-3 font-black text-right">{t('analytics', 'mean')}</th>
                    <th className="py-1 pr-3 font-black text-right">{t('analytics', 'median')}</th>
                    <th className="py-1 pr-3 font-black text-right">{t('analytics', 'min')}</th>
                    <th className="py-1 pr-3 font-black text-right">{t('analytics', 'max')}</th>
                    <th className="py-1 font-black text-right">{t('analytics', 'std')}</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600 dark:text-slate-300">
                  {summary.map((s, i) => (
                    <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="py-1.5 pr-3 font-bold">{s.column ?? '—'}</td>
                      <td className="py-1.5 pr-3 text-right">{num(s.count, 0)}</td>
                      <td className="py-1.5 pr-3 text-right">{num(s.mean, 2)}</td>
                      <td className="py-1.5 pr-3 text-right">{num(s.median, 2)}</td>
                      <td className="py-1.5 pr-3 text-right">{num(s.min, 2)}</td>
                      <td className="py-1.5 pr-3 text-right">{num(s.max, 2)}</td>
                      <td className="py-1.5 text-right">{num(s.std, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {trend.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t('analytics', 'trend')}
            </p>
            <ul className="space-y-2">
              {trend.map((tr, i) => {
                const up = tr.direction === 'up' || tr.direction === 'hausse';
                const down = tr.direction === 'down' || tr.direction === 'baisse';
                return (
                  <li key={i} className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2.5 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{tr.column}</span>
                    <span className={`flex items-center gap-1 font-black ${up ? 'text-emerald-500' : down ? 'text-red-500' : 'text-slate-400'}`}>
                      {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : down ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
                      {num(tr.change_pct, 1)} %
                    </span>
                    <span className="ml-auto text-slate-400">
                      {t('analytics', 'periods')} : {num(tr.periods, 0)} · {num(tr.first_value, 1)} → {num(tr.last_value, 1)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {anomaly.some(a => a.count > 0) && (
          <div>
            <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t('analytics', 'anomaly')}
            </p>
            <ul className="space-y-1.5">
              {anomaly.filter(a => a.count > 0).map((a, i) => (
                <li key={i} className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-2.5 text-xs text-red-600 dark:text-red-400">
                  <TriangleAlert className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-bold">{a.column}</span>
                  <span className="ml-auto font-black">{a.count}</span>
                  <span className="text-red-400">{a.method}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {forecast.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t('analytics', 'forecast')}
            </p>
            <ul className="space-y-1.5">
              {forecast.map((f, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2.5 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">{f.column}</span>
                  <span className="text-slate-400">{t('analytics', 'horizon')} : {num(f.horizon, 0)}</span>
                  <span className={`ml-auto font-black ${f.trend_direction === 'up' ? 'text-emerald-500' : f.trend_direction === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
                    {f.trend_direction} · pente {num(f.slope, 2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {correlation.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t('analytics', 'correlation')}
            </p>
            <ul className="space-y-1.5">
              {correlation.map((c, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2.5 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">{c.column1} ↔ {c.column2}</span>
                  <span className={`ml-auto font-black ${c.coefficient >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    r = {num(c.coefficient, 3)}
                  </span>
                  <span className="text-slate-400">{c.strength} · {c.relationship}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {distribution.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t('analytics', 'distribution')}
            </p>
            <ul className="space-y-1.5">
              {distribution.map((d, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2.5 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">{d.column}</span>
                  <span className="text-slate-400">asym. {num(d.skewness, 2)}</span>
                  <span className="text-slate-400">aplat. {num(d.kurtosis, 2)}</span>
                  <span className="ml-auto text-slate-400">
                    {d.is_normal === true ? 'gaussienne' : d.is_normal === false ? 'non gaussienne' : '—'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {grouped && (
          <div>
            <p className="mb-2 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <span>{t('analytics', 'grouped')} · {grouped.group_by}</span>
              <span className="normal-case font-semibold">{grouped.segment_count} segments</span>
            </p>

            {grouped.note && <p className="mb-2 text-xs italic text-slate-400">{grouped.note}</p>}

            {!grouped.segments?.length ? (
              <EmptyBlock />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-slate-400">
                      <th className="py-1 pr-3 font-black">{t('analytics', 'segment')}</th>
                      <th className="py-1 pr-3 font-black text-right">{t('analytics', 'rowsLabel')}</th>
                      <th className="py-1 pr-3 font-black text-right">{t('analytics', 'share')}</th>
                      <th className="py-1 pr-3 font-black text-right">{t('analytics', 'mean')}</th>
                      <th className="py-1 font-black text-right">{t('analytics', 'sum')}</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600 dark:text-slate-300">
                    {grouped.segments.map(seg => {
                      const metricName = grouped.ranked_by ?? Object.keys(seg.metrics ?? {})[0];
                      const metric = metricName ? seg.metrics?.[metricName] : null;
                      const share = metric?.share;
                      return (
                        <tr key={seg.segment} className="border-t border-slate-100 dark:border-slate-800">
                          <td className="py-1.5 pr-3 font-bold">{seg.segment}</td>
                          <td className="py-1.5 pr-3 text-right">{num(seg.row_count, 0)}</td>
                          <td className="py-1.5 pr-3 text-right">
                            {typeof share === 'number' ? (
                              <span className="inline-flex items-center gap-1.5 justify-end">
                                <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 sm:block">
                                  <span
                                    className="block h-full rounded-full bg-indigo-500"
                                    style={{ width: `${Math.min(100, Math.max(0, share * 100))}%` }}
                                  />
                                </span>
                                {pct(share * 100)}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-1.5 pr-3 text-right">{num(metric?.mean, 2)}</td>
                          <td className="py-1.5 text-right font-bold">{num(metric?.sum, 1)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

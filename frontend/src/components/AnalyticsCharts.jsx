import { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart, Area, LineChart, Line,
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { ChartColumn, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Rendus graphiques du rapport décisionnel.
 *
 * Conçu pour une lecture immédiate et sans surcharge visuelle :
 * - Cartes individuelles aérées et équilibrées.
 * - Grilles responsive 2 colonnes harmonieuses.
 * - Courbes douces et infobulles précises.
 */

const COLORS = {
  creees: '#6366f1',
  terminees: '#10b981',
  ouvertes: '#f59e0b',
  retards: '#f43f5e'
};

const AXIS = { fontSize: 11, fill: '#94a3b8' };

const FLUX_METRICS = [
  { remote: 'taches_creees', key: 'creees', label: 'metricCreated', color: COLORS.creees },
  { remote: 'taches_terminees', key: 'terminees', label: 'metricDone', color: COLORS.terminees },
  { remote: 'ouvertes_fin_mois', key: 'ouvertes', label: 'metricOpen', color: COLORS.ouvertes },
  { remote: 'retards_fin_mois', key: 'retards', label: 'metricOverdue', color: COLORS.retards }
];

function statusColor(label) {
  const s = String(label ?? '').toLowerCase();
  if (s.includes('termin') || s.includes('done')) return '#10b981';
  if (s.includes('cours') || s.includes('progress')) return '#6366f1';
  if (s.includes('bloqu') || s.includes('block')) return '#f43f5e';
  if (s.includes('faire') || s.includes('todo') || s.includes('to do')) return '#f59e0b';
  return '#94a3b8';
}

const fmt = v =>
  typeof v === 'number' && Number.isFinite(v) ? Number(v.toFixed(1)).toLocaleString() : '—';

function toList(value) {
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean);
  if (value === null || value === undefined) return [];
  return String(value).split(/[\s,]+/).filter(Boolean);
}

function parseForecast(forecast) {
  if (!forecast || !Array.isArray(forecast.predictions) || forecast.predictions.length === 0) {
    return {};
  }

  const columns = toList(forecast.column);
  const horizons = toList(forecast.horizon).map(Number);
  const predictions = forecast.predictions;

  const out = {};
  let cursor = 0;

  for (let c = 0; c < columns.length; c++) {
    const h = Number.isFinite(horizons[c]) ? horizons[c] : horizons[0];
    if (!Number.isFinite(h) || h <= 0) return {};
    if (cursor + h > predictions.length) return {};
    out[columns[c]] = predictions.slice(cursor, cursor + h);
    cursor += h;
  }

  return cursor === predictions.length ? out : {};
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-slate-800 dark:text-slate-100">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 py-0.5">
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ background: p.color || p.stroke || p.payload?.fill }}
          />
          <span>{p.name}</span>
          <span className="ml-auto font-bold text-slate-900 dark:text-white">{fmt(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

function ChartCard({ title, subtitle, note, children, className = '' }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between ${className}`}>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            {title}
          </h4>
          {subtitle && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {note && (
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800">
            {note}
          </span>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function AnalyticsCharts({ data }) {
  const { t } = useLanguage();
  const [metric, setMetric] = useState('ouvertes');

  const series = data?.series ?? {};
  const flux = Array.isArray(series.flux) && series.flux.length ? series.flux : null;
  const statuts = Array.isArray(series.statuts) && series.statuts.length ? series.statuts : null;
  const projets = Array.isArray(series.projets) && series.projets.length ? series.projets : null;
  const retards = Array.isArray(series.retards) && series.retards.length ? series.retards : null;

  const forecast = parseForecast(data?.results?.['flux-mensuel']?.forecast);
  const segments = data?.results?.taches?.grouped?.segments ?? [];

  if (!flux && !statuts && !projets && !retards && !segments.length) {
    return null;
  }

  /* ── 1. Évolution mensuelle ── */
  const fluxChart = flux && (
    <ChartCard
      title="Dynamique Mensuelle du Flux"
      subtitle="Créations, clôtures, stock ouvert et retards par mois"
      note="Mois"
    >
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={flux} margin={{ top: 6, right: 12, bottom: 0, left: -20 }}>
          <defs>
            {FLUX_METRICS.map(m => (
              <linearGradient key={m.key} id={`g-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={m.color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={m.color} stopOpacity={0.01} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="#94a3b8" strokeOpacity={0.15} strokeDasharray="3 3" />
          <XAxis dataKey="periode" tick={AXIS} interval="preserveStartEnd" />
          <YAxis tick={AXIS} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          {FLUX_METRICS.map(m => (
            <Area
              key={m.key}
              type="monotone"
              dataKey={m.key}
              name={t('analytics', m.label)}
              stroke={m.color}
              strokeWidth={2}
              fill={`url(#g-${m.key})`}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );

  /* ── 2. Prévision d'atterrissage ── */
  const current = FLUX_METRICS.find(m => m.key === metric) ?? FLUX_METRICS[2];
  const predicted = forecast[current.remote] ?? [];

  const forecastRows = flux
    ? flux.map(f => ({ label: f.periode, reel: f[current.key] ?? null, prevu: null }))
    : [];

  if (forecastRows.length && predicted.length) {
    const lastObserved = forecastRows[forecastRows.length - 1];
    if (lastObserved.reel !== null) {
      lastObserved.prevu = lastObserved.reel;
    }

    predicted.forEach((val, idx) => {
      forecastRows.push({
        label: `+${idx + 1}m`,
        reel: null,
        prevu: Math.max(0, Math.round(Number(val) * 10) / 10)
      });
    });
  }

  const forecastChart = flux && predicted.length > 0 && (
    <ChartCard
      title="Atterrissage Prévisionnel"
      subtitle="Projection de la tendance sur les prochains mois"
      note={`${predicted.length} mois projetés`}
    >
      <div className="mb-2 flex flex-wrap gap-1">
        {FLUX_METRICS.map(m => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMetric(m.key)}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
              m.key === metric
                ? 'bg-slate-900 text-white dark:bg-indigo-600 shadow-2xs'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {t('analytics', m.label)}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={210}>
        <LineChart data={forecastRows} margin={{ top: 6, right: 12, bottom: 0, left: -20 }}>
          <CartesianGrid stroke="#94a3b8" strokeOpacity={0.15} strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={AXIS} interval="preserveStartEnd" />
          <YAxis tick={AXIS} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
          <Line
            type="monotone"
            dataKey="reel"
            name={t('analytics', 'actualLabel')}
            stroke={current.color}
            strokeWidth={2}
            dot={{ r: 2.5 }}
          />
          <Line
            type="monotone"
            dataKey="prevu"
            name={t('analytics', 'forecastLabel')}
            stroke={current.color}
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={{ r: 3, fill: current.color }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );

  /* ── 3. Répartition des statuts ── */
  const statutsChart = statuts && (
    <ChartCard
      title="Répartition par Statut"
      subtitle="État d'avancement des tâches du projet"
    >
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-1/2">
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie
                data={statuts}
                dataKey="total"
                nameKey="statut"
                innerRadius={46}
                outerRadius={70}
                paddingAngle={2}
                stroke="none"
              >
                {statuts.map(s => (
                  <Cell key={s.statut} fill={statusColor(s.statut)} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full sm:w-1/2">
          <ul className="space-y-1.5">
            {statuts.map(s => (
              <li key={s.statut} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: statusColor(s.statut) }}
                />
                <span className="truncate">{s.statut}</span>
                <span className="ml-auto font-semibold text-slate-900 dark:text-white">{s.total}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ChartCard>
  );

  /* ── 4. Charge et retards par équipe ── */
  const equipesChart = retards && (
    <ChartCard
      title="Charge & Retards par Équipe"
      subtitle="Volume total assigné vs tâches hors délai"
    >
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={retards} margin={{ top: 6, right: 12, bottom: 0, left: -20 }}>
          <CartesianGrid stroke="#94a3b8" strokeOpacity={0.15} strokeDasharray="3 3" />
          <XAxis dataKey="equipe" tick={{ ...AXIS, fontSize: 10 }} interval={0} />
          <YAxis tick={AXIS} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
          <Bar dataKey="total" name="Total tâches" fill="#cbd5e1" radius={[3, 3, 0, 0]} />
          <Bar
            dataKey="retards"
            name="En retard"
            fill={COLORS.retards}
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );

  /* ── 5. Avancement par projet ── */
  const projetsRows = projets ? [...projets].sort((a, b) => a.avancement - b.avancement) : [];
  const projetsChart = projetsRows.length > 0 && (
    <ChartCard
      title="Avancement du Portefeuille"
      subtitle="Taux de complétion par projet"
      note="Taux %"
    >
      <ResponsiveContainer width="100%" height={Math.max(160, projetsRows.length * 28 + 20)}>
        <BarChart
          data={projetsRows}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
        >
          <CartesianGrid stroke="#94a3b8" strokeOpacity={0.15} strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={AXIS} unit="%" />
          <YAxis
            type="category"
            dataKey="projet"
            width={130}
            tick={{ ...AXIS, fontSize: 10 }}
            interval={0}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)' }} />
          <Bar dataKey="avancement" name="Avancement" radius={[0, 3, 3, 0]}>
            {projetsRows.map(p => (
              <Cell
                key={p.projet}
                fill={p.avancement >= 100 ? '#10b981' : p.avancement >= 50 ? '#6366f1' : '#f59e0b'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <ChartColumn className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              Visualisations & Projections Décisionnelles
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dynamique des flux, atterrissage prévisionnel et équilibre de la charge
            </p>
          </div>
        </div>
      </div>

      {/* Grille 1 : Flux mensuel & Prévision d'atterrissage (ou Synthèse si pas de prévision) */}
      {(fluxChart || forecastChart) && (
        <div className="grid gap-5 lg:grid-cols-2">
          {fluxChart}
          {forecastChart || (flux && (() => {
            const last = flux[flux.length - 1] ?? {};
            const prev = flux.length > 1 ? flux[flux.length - 2] : null;
            const metrics = [
              {
                label: 'Tâches créées',
                key: 'creees',
                color: COLORS.creees,
              },
              {
                label: 'Tâches terminées',
                key: 'terminees',
                color: COLORS.terminees,
              },
              {
                label: 'Stock ouvert',
                key: 'ouvertes',
                color: COLORS.ouvertes,
              },
              {
                label: 'En retard',
                key: 'retards',
                color: COLORS.retards,
              },
            ];

            const delta = (key) => {
              if (!prev || prev[key] == null || last[key] == null) return null;
              return last[key] - prev[key];
            };

            return (
              <ChartCard
                title="Synthèse du Dernier Mois"
                subtitle={last.periode ? `Situation au ${last.periode}` : 'Indicateurs de la dernière période'}
              >
                <div className="grid grid-cols-2 gap-3 mt-1">
                  {metrics.map(({ label, key, color, icon }) => {
                    const val = last[key];
                    const diff = delta(key);
                    const isNeg = key === 'retards' || key === 'ouvertes';
                    const up = diff !== null && diff > 0;
                    const trendColor = diff === null ? '#94a3b8'
                      : (up === isNeg) ? '#f43f5e' : '#10b981';
                    return (
                      <div
                        key={key}
                        className="rounded-xl p-3 flex flex-col gap-1"
                        style={{ background: color + '12', border: `1px solid ${color}22` }}
                      >
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">{label}</span>
                        <span
                          className="text-2xl font-bold leading-none"
                          style={{ color }}
                        >
                          {val != null ? Math.round(val).toLocaleString() : '—'}
                        </span>
                        {diff !== null && (
                          <span
                            className="text-[10px] font-semibold"
                            style={{ color: trendColor }}
                          >
                            {diff > 0 ? `▲ +${Math.round(diff)}` : diff < 0 ? `▼ ${Math.round(diff)}` : '→ Stable'} vs mois préc.
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                  Comparaison avec la période précédente. Les valeurs négatives sur les retards et le stock ouvert sont favorables.
                </p>
              </ChartCard>
            );
          })())}
        </div>
      )}

      {/* Grille 2 : Répartition des statuts & Charge par équipe */}
      {(statutsChart || equipesChart) && (
        <div className="grid gap-5 lg:grid-cols-2">
          {statutsChart}
          {equipesChart}
        </div>
      )}

      {/* Grille 3 : Avancement portefeuille */}
      {projetsChart && (
        <div>
          {projetsChart}
        </div>
      )}
    </div>
  );
}

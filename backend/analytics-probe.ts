/**
 * Sonde d'intégration : agrège les vraies données de la base, puis les envoie
 * à l'API d'analyse distante pour vérifier le contrat réel avant d'exposer des
 * routes. Lecture seule sur MongoDB.
 *
 * Run: npx tsx analytics-probe.ts
 */
import mongoose from 'mongoose';
import { env } from './src/config/env';
import { loadAnalyticsContext, buildFluxRows, buildTachesRows, buildProjetsRows } from './src/services/analyticsAggregator';
import { analyticsService, AnalyticsError } from './src/services/analyticsService';

const DEMO_WORKSPACE = '62eef4f0ccd84ae877df3c16';

const adminReq: any = {
  user: { id: 'probe', email: 'probe', role: 'ADMIN', teams: [], workspaceId: DEMO_WORKSPACE }
};

const fmt = (rows: Record<string, unknown>[]): string => `${rows.length} lignes`;

function showSample(label: string, rows: Record<string, unknown>[], take = 3): void {
  console.log(`\n--- ${label} (${fmt(rows)}) ---`);
  if (rows.length === 0) return;
  for (const r of rows.slice(0, take)) console.log('  ', JSON.stringify(r));
  if (rows.length > take) console.log('   …');
}

function describeOutcome(label: string, outcome: any): void {
  console.log(`\n=== ${label} ===`);
  console.log(`  durée distante : ${outcome.durationMs} ms`);
  console.log(`  résultats par jeu : ${Object.keys(outcome.results).join(', ') || '(aucun)'}`);

  for (const [slug, result] of Object.entries<any>(outcome.results)) {
    const blocks = result
      ? Object.entries<any>(result)
          .filter(([, v]) => v !== null && v !== undefined)
          .map(([k, v]) => `${k}=${Array.isArray(v) ? v.length : 'obj'}`)
          .join(' · ')
      : 'null';
    console.log(`    [${slug}] ${blocks || '(aucun bloc)'}`);
  }

  for (const [slug, insights] of Object.entries<any[]>(outcome.insights)) {
    console.log(`    insights[${slug}] = ${insights.length}`);
    for (const i of insights.slice(0, 4)) {
      console.log(`      · [${i.severity}] ${i.type} — ${i.title}`);
    }
  }

  if (outcome.ai) {
    console.log(`  IA (${outcome.ai.provider ?? '?'}) — ${String(outcome.ai.summary ?? '').slice(0, 240)}`);
    console.log(`    recommandations : ${(outcome.ai.recommendations ?? []).length}`);
    console.log(`    plan d'action   : ${(outcome.ai.action_plan ?? []).length}`);
  } else {
    console.log(`  IA : ${outcome.aiNote ?? 'non demandée'}`);
  }

  if (outcome.joinAlignment) {
    console.log(
      `  jointure : ${outcome.joinAlignment.join_key} (granularité ${outcome.joinAlignment.granularity}), ` +
        `clés alignées = ${outcome.joinAlignment.aligned_keys} · ${JSON.stringify(outcome.joinAlignment.keys_by_dataset)}`
    );
    if (outcome.joinAlignment.note) console.log(`    note : ${outcome.joinAlignment.note}`);
  }

  if (outcome.crossCorrelations?.length) {
    console.log(`  corrélations croisées : ${outcome.crossCorrelations.length}`);
    for (const c of outcome.crossCorrelations.slice(0, 5)) {
      console.log(
        `    · ${c.dataset_a ?? c.source ?? '?'}.${c.column_a ?? c.metric_a ?? '?'} ↔ ` +
          `${c.dataset_b ?? c.target ?? '?'}.${c.column_b ?? c.metric_b ?? '?'} (r=${c.correlation ?? c.pearson ?? '?'})`
      );
    }
  }

  if (outcome.synthesis) {
    const s = outcome.synthesis;
    console.log(`  synthèse : verdict « ${s.verdict} » sur ${s.datasets_analyzed} jeux / ${s.total_rows} lignes`);
    console.log(`    ${s.summary}`);
    if (s.risks?.length) console.log(`    risques : ${s.risks.join(' | ')}`);
    if (s.trends) console.log(`    tendances : ${JSON.stringify(s.trends)}`);
  }
}

async function report(label: string, fn: () => Promise<any>): Promise<void> {
  try {
    describeOutcome(label, await fn());
  } catch (err) {
    const e = err as AnalyticsError;
    console.log(`\n=== ${label} ===`);
    console.log(`  ÉCHEC ${e.status ?? '?'} : ${e.message}`);
    if (e.details?.length) console.log('  détails :', JSON.stringify(e.details.slice(0, 3)));
  }
}

async function main(): Promise<void> {
  await mongoose.connect(env.mongoUri);
  console.log('MongoDB connecté.');

  const ctx = await loadAnalyticsContext(adminReq);
  const flux = buildFluxRows(ctx);
  const taches = buildTachesRows(ctx);
  const projets = buildProjetsRows(ctx);

  showSample('flux-mensuel', flux, 8);
  showSample('taches', taches, 3);
  showSample('projets', projets, 3);

  console.log(`\nClé configurée : ${analyticsService.isConfigured() ? 'oui' : 'NON'}`);
  console.log(`Application    : ${analyticsService.appSlug}`);

  await report('ANALYSE flux-mensuel', () =>
    analyticsService.analyze({
      dataset: 'flux-mensuel',
      analysis: ['summary', 'trend', 'anomaly', 'forecast'],
      data: flux
    })
  );

  await report('ANALYSE taches (groupé par projet)', () =>
    analyticsService.analyze({
      dataset: 'taches',
      analysis: ['summary', 'anomaly', 'distribution'],
      data: taches,
      groupBy: 'projet'
    })
  );

  await report('ANALYSE projets (groupé par équipe)', () =>
    analyticsService.analyze({
      dataset: 'projets',
      analysis: ['summary', 'correlation', 'anomaly', 'distribution'],
      data: projets,
      groupBy: 'equipe'
    })
  );

  await report('MULTI B — flux-mensuel + taches', () =>
    analyticsService.analyzeMulti({
      datasets: ['flux-mensuel', 'taches'],
      payloads: { 'flux-mensuel': flux, taches },
      analysis: ['summary', 'trend', 'anomaly', 'correlation'],
      joinKey: 'periode',
      groupBy: 'projet'
    })
  );

  await report('MULTI A — les 3 jeux', () =>
    analyticsService.analyzeMulti({
      datasets: ['flux-mensuel', 'taches', 'projets'],
      payloads: { 'flux-mensuel': flux, taches, projets },
      analysis: ['summary', 'trend', 'anomaly', 'correlation'],
      joinKey: 'periode',
      groupBy: 'projet'
    })
  );
}

main()
  .catch(err => {
    console.error('\nErreur fatale :', err?.message ?? err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

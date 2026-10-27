/**
 * Test d'intégration des routes /api/analytics contre le serveur local.
 * Signe un JWT à partir de JWT_SECRET (comme le ferait un vrai login), sans
 * déclencher le flux OTP par e-mail.
 *
 * Run: npx tsx analytics-integration.ts
 */
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { env } from './src/config/env';
import { User } from './src/models/User';

const BASE = process.env.TEST_BASE_URL ?? `http://localhost:${env.port}`;
const DEMO_WORKSPACE = '62eef4f0ccd84ae877df3c16';

async function waitForServer(timeoutMs = 45_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok) return true;
    } catch {
      /* pas encore prêt */
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  return false;
}

async function signIn(): Promise<{ token: string; label: string }> {
  await mongoose.connect(env.mongoUri);
  const user: any = await User.findOne({
    workspaceId: new mongoose.Types.ObjectId(DEMO_WORKSPACE),
    role: 'ADMIN'
  }).lean();
  await mongoose.disconnect();

  if (!user) throw new Error('Aucun administrateur trouvé dans le workspace démo.');

  const token = jwt.sign(
    {
      id: String(user._id),
      email: user.email,
      role: user.role,
      teams: (user.teams ?? []).map((t: any) => ({ teamId: String(t.teamId), role: t.role })),
      workspaceId: String(user.workspaceId)
    },
    env.jwtSecret,
    { expiresIn: '15m' }
  );

  return { token, label: `${user.email} (${user.role})` };
}

async function call(token: string, path: string, body?: unknown): Promise<void> {
  const started = Date.now();
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch (err: any) {
    console.log(`\n✗ ${path} — connexion impossible : ${err?.message}`);
    return;
  }

  const elapsed = Date.now() - started;
  const data: any = await res.json().catch(() => null);

  console.log(`\n${res.ok ? '✓' : '✗'} ${path} → ${res.status} en ${elapsed} ms`);

  if (!res.ok) {
    console.log(`   message : ${data?.message ?? JSON.stringify(data).slice(0, 300)}`);
    if (data?.details) console.log(`   détails : ${JSON.stringify(data.details).slice(0, 400)}`);
    return;
  }

  if (data?.configured === false) {
    console.log(`   ⚠ ${data.message}`);
    return;
  }

  if (data?.empty) {
    console.log(`   ⚠ ${data.message}`);
    return;
  }

  if (data?.rows !== undefined) console.log(`   jeux : ${data.datasets?.join(', ')} · ${data.rows} lignes`);
  else if (data?.datasets) console.log(`   jeux : ${data.datasets?.join(', ')}`);
  if (data.snapshot) {
    const s = data.snapshot;
    console.log(
      `   instantané : ${s.tachesTotal} tâches (${s.tachesAFaire} à faire, ${s.tachesEnCours} en cours, ` +
        `${s.tachesBloquees} bloquées, ${s.tachesTerminees} terminées), ${s.tachesEnRetard} en retard, ` +
        `achèvement ${s.tauxAchevement} %, ${s.projetsTotal} projets`
    );
  }

  for (const [slug, result] of Object.entries<any>(data.results ?? {})) {
    const blocks = result
      ? Object.entries<any>(result)
          .filter(([, v]) => v !== null && v !== undefined)
          .map(([k, v]) => `${k}:${Array.isArray(v) ? v.length : 1}`)
          .join(' ')
      : 'null';
    console.log(`   [${slug}] ${blocks}`);
  }

  const insightCount = Object.values<any[]>(data.insights ?? {}).reduce((n, l) => n + l.length, 0);
  console.log(`   insights : ${insightCount}`);

  if (data.ai) console.log(`   IA (${data.aiProvider}) : ${String(data.ai.summary ?? '').slice(0, 160)}…`);
  else console.log(`   IA : ${data.aiNote ?? 'non demandée'}`);

  if (data.warning) console.log(`   ⚠ ${data.warning}`);

  if (data.joinAlignment) {
    console.log(
      `   jointure : ${data.joinAlignment.aligned_keys} clés alignées — ${JSON.stringify(data.joinAlignment.keys_by_dataset)}`
    );
  }
  if (data.crossCorrelations?.length) {
    for (const c of data.crossCorrelations) {
      console.log(
        `   lien : ${c.dataset1}.${c.column1} ↔ ${c.dataset2}.${c.column2} ` +
          `(r=${Number(c.coefficient).toFixed(3)}, ${c.strength}, ${c.relationship})`
      );
    }
  }
  if (data.synthesis) {
    const s = data.synthesis;
    console.log(`   synthèse [${s.verdict}] : ${String(s.summary).slice(0, 260)}`);
    if (s.risks?.length) console.log(`   risques : ${s.risks.join(' | ')}`);
  }
}

async function main(): Promise<void> {
  // Usage : --print-token sort un jeton local valide puis quitte. Sert à tester
  // l'interface sans déclencher le flux OTP par e-mail (non requis en prod).
  if (process.argv.includes('--print-token')) {
    const { token } = await signIn();
    process.stdout.write(token);
    return;
  }

  console.log(`Serveur cible : ${BASE}`);

  if (!(await waitForServer())) {
    console.log('✗ Le serveur local ne répond pas. Lancez `node dist/index.js`.');
    process.exitCode = 1;
    return;
  }

  const { token, label } = await signIn();
  console.log(`Identité test : ${label}`);

  await call(token, '/api/analytics/status');
  await call(token, '/api/analytics/synthese', { groupBy: 'projet' });
  await call(token, '/api/analytics/flux', {});
  await call(token, '/api/analytics/taches', { groupBy: 'statut' });
  await call(token, '/api/analytics/projets', { groupBy: 'equipe' });

  // Contrôle RBAC : un DEV sans équipe ne doit voir que ses propres tâches.
  await call(token, '/api/analytics/projets', { groupBy: 'equipe', analysis: ['summary'] });
}

main()
  .catch(err => {
    console.error('\nErreur fatale :', err?.message ?? err);
    process.exitCode = 1;
  })
  .finally(() => void mongoose.disconnect());

/**
 * Static description of the demo dataset.
 *
 * Everything here is pure data: teams, users, projects and the title banks
 * used to build ~300 tasks. Nothing in this file touches Mongoose.
 */

export const DAY = 86_400_000;

export type ProjectStatus = 'EN_COURS' | 'TERMINE' | 'SUSPENDU';
export type TaskStatus = 'A_FAIRE' | 'EN_COURS' | 'BLOQUE' | 'TERMINE';

export const TASK_STATUSES: TaskStatus[] = ['A_FAIRE', 'EN_COURS', 'BLOQUE', 'TERMINE'];

export interface SeedTeamDef {
  key: string;
  name: string;
  description: string;
}

export interface SeedUserDef {
  email: string;
  name: string;
  role: 'ADMIN' | 'LEAD' | 'DEV';
  /** `null` for the admin, who belongs to no team by design. */
  teamKey: string | null;
  joinedDaysAgo: number;
  /** Relative share of tasks this person receives. Only used for DEVs. */
  load?: number;
}

export interface SeedProjectDef {
  key: string;
  name: string;
  description: string;
  teamKey: string;
  status: ProjectStatus;
  startedDaysAgo: number;
  /** When true, roughly a third of the tasks end up BLOCKED ("project at risk"). */
  risky?: boolean;
}

export const TEAMS: SeedTeamDef[] = [
  { key: 'frontend', name: 'Frontend Team', description: 'UI, components and client-side performance' },
  { key: 'backend', name: 'Backend Team', description: 'API, services and server-side logic' },
  { key: 'design', name: 'Design & UX', description: 'Wireframes, prototypes and design system' },
  { key: 'qa', name: 'QA & DevOps', description: 'Testing, CI/CD and release automation' },
  { key: 'data', name: 'Data & Analytics', description: 'Event tracking, reporting and data pipelines' },
];

export const USERS: SeedUserDef[] = [
  // ---------------------------------------------------------------- admin
  { email: 'admin@test.com', name: 'Admin User', role: 'ADMIN', teamKey: null, joinedDaysAgo: 220 },

  // ---------------------------------------------------------------- leads
  { email: 'lead@test.com', name: 'Sarah Bennett', role: 'LEAD', teamKey: 'frontend', joinedDaysAgo: 210 },
  { email: 'lead.backend@test.com', name: 'Marcus Reed', role: 'LEAD', teamKey: 'backend', joinedDaysAgo: 205 },
  { email: 'lead.design@test.com', name: 'Chloé Martin', role: 'LEAD', teamKey: 'design', joinedDaysAgo: 200 },
  { email: 'lead.qa@test.com', name: 'Ahmed Diallo', role: 'LEAD', teamKey: 'qa', joinedDaysAgo: 195 },
  { email: 'lead.data@test.com', name: 'Emma Wilson', role: 'LEAD', teamKey: 'data', joinedDaysAgo: 190 },

  // ------------------------------------------------------------- frontend
  // `dev@test.com` is deliberately overloaded so workload-imbalance
  // charts have something obvious to show.
  { email: 'dev@test.com', name: 'John Carter', role: 'DEV', teamKey: 'frontend', joinedDaysAgo: 180, load: 3.0 },
  { email: 'dev.fe2@test.com', name: 'Léa Dupont', role: 'DEV', teamKey: 'frontend', joinedDaysAgo: 150, load: 1.2 },
  { email: 'dev.fe3@test.com', name: 'Tom Becker', role: 'DEV', teamKey: 'frontend', joinedDaysAgo: 100, load: 0.5 },

  // -------------------------------------------------------------- backend
  { email: 'dev.be1@test.com', name: 'Sofia Rossi', role: 'DEV', teamKey: 'backend', joinedDaysAgo: 175, load: 1.5 },
  { email: 'dev.be2@test.com', name: 'Karim Haddad', role: 'DEV', teamKey: 'backend', joinedDaysAgo: 130, load: 1.0 },
  { email: 'dev.be3@test.com', name: 'Yuki Tanaka', role: 'DEV', teamKey: 'backend', joinedDaysAgo: 90, load: 0.7 },

  // --------------------------------------------------------------- design
  { email: 'dev.design1@test.com', name: 'Nina Kowalski', role: 'DEV', teamKey: 'design', joinedDaysAgo: 170, load: 1.3 },
  { email: 'dev.design2@test.com', name: 'Lucas Ferreira', role: 'DEV', teamKey: 'design', joinedDaysAgo: 95, load: 0.9 },

  // ------------------------------------------------------------------- qa
  { email: 'dev.qa1@test.com', name: 'Aïcha Traoré', role: 'DEV', teamKey: 'qa', joinedDaysAgo: 165, load: 1.4 },
  { email: 'dev.qa2@test.com', name: 'Oliver Smith', role: 'DEV', teamKey: 'qa', joinedDaysAgo: 80, load: 0.8 },

  // ----------------------------------------------------------------- data
  { email: 'dev.data1@test.com', name: 'Priya Sharma', role: 'DEV', teamKey: 'data', joinedDaysAgo: 160, load: 1.6 },
  { email: 'dev.data2@test.com', name: 'Diego Alvarez', role: 'DEV', teamKey: 'data', joinedDaysAgo: 85, load: 0.5 },
];

/**
 * 12 projects: 6 EN_COURS, 4 TERMINE, 2 SUSPENDU.
 * One of them (`api-v2`) is intentionally "at risk".
 */
export const PROJECTS: SeedProjectDef[] = [
  // Frontend team ---------------------------------------------------------
  {
    key: 'dashboard',
    name: 'Dashboard Redesign',
    description: 'Rebuild the project dashboard around real-time task analytics and a clearer information hierarchy.',
    teamKey: 'frontend',
    status: 'EN_COURS',
    startedDaysAgo: 160,
  },
  {
    key: 'design-system',
    name: 'Design System v2',
    description: 'Consolidate buttons, forms and layout primitives into a reusable, accessible component library.',
    teamKey: 'frontend',
    status: 'EN_COURS',
    startedDaysAgo: 130,
  },
  {
    key: 'marketing-site',
    name: 'Marketing Site Refresh',
    description: 'New landing pages, pricing table and case studies for the public marketing website.',
    teamKey: 'frontend',
    status: 'TERMINE',
    startedDaysAgo: 200,
  },

  // Backend team ----------------------------------------------------------
  {
    key: 'api-v2',
    name: 'API v2 Migration',
    description: 'Migrate the REST API to v2: versioned routes, pagination, stricter validation and deprecation headers.',
    teamKey: 'backend',
    status: 'EN_COURS',
    startedDaysAgo: 150,
    risky: true,
  },
  {
    key: 'auth-service',
    name: 'Auth Service Overhaul',
    description: 'Centralise authentication: OTP login, password reset, session handling and token rotation.',
    teamKey: 'backend',
    status: 'TERMINE',
    startedDaysAgo: 185,
  },
  {
    key: 'webhooks',
    name: 'Legacy Webhooks Deprecation',
    description: 'Retire the v1 webhook delivery pipeline and migrate remaining consumers.',
    teamKey: 'backend',
    status: 'SUSPENDU',
    startedDaysAgo: 190,
  },

  // Design team -----------------------------------------------------------
  {
    key: 'mobile-app',
    name: 'Mobile App Redesign',
    description: 'Revisit the mobile flows: onboarding, task creation, notifications and offline states.',
    teamKey: 'design',
    status: 'EN_COURS',
    startedDaysAgo: 90,
  },
  {
    key: 'brand-refresh',
    name: 'Brand Guidelines Refresh',
    description: 'Update typography, colour palette, iconography and tone of voice across all touchpoints.',
    teamKey: 'design',
    status: 'TERMINE',
    startedDaysAgo: 180,
  },

  // QA team ---------------------------------------------------------------
  {
    key: 'regression-suite',
    name: 'Regression Test Suite',
    description: 'Build an automated end-to-end regression suite covering the critical user journeys.',
    teamKey: 'qa',
    status: 'EN_COURS',
    startedDaysAgo: 100,
  },
  {
    key: 'ci-pipeline',
    name: 'CI Pipeline Stabilization',
    description: 'Reduce flaky builds, split the pipeline into stages and cut average build time in half.',
    teamKey: 'qa',
    status: 'SUSPENDU',
    startedDaysAgo: 170,
  },

  // Data team -------------------------------------------------------------
  {
    key: 'event-schema',
    name: 'Analytics Event Schema',
    description: 'Define a consistent tracking plan and instrument the product with versioned analytics events.',
    teamKey: 'data',
    status: 'EN_COURS',
    startedDaysAgo: 70,
  },
  {
    key: 'metrics-digest',
    name: 'Weekly Metrics Digest',
    description: 'Automated weekly summary of delivery metrics sent to team leads and stakeholders.',
    teamKey: 'data',
    status: 'TERMINE',
    startedDaysAgo: 140,
  },
];

/**
 * Title banks. They are cycled with a per-project offset so two projects
 * never start their epics with the exact same list.
 */
export const EPIC_TITLES: string[] = [
  'Discovery & Requirements',
  'Core Implementation',
  'UI & Interaction',
  'Testing & Quality',
  'Performance & Security',
  'Documentation & Handover',
  'Deployment & Rollout',
  'Data & Analytics',
  'Accessibility & Internationalization',
  'Integration & API',
  'Migration & Cleanup',
  'Monitoring & Alerting',
];

export const TASK_TITLES: string[] = [
  'Write technical spec',
  'Design wireframes',
  'Build component library',
  'Implement REST endpoint',
  'Write unit tests',
  'Set up CI pipeline',
  'Optimize bundle size',
  'Refactor shared utils',
  'Add error handling',
  'Create database migration',
  'Review pull request',
  'Update API documentation',
  'Configure monitoring',
  'Implement authentication flow',
  'Build admin dashboard',
  'Add form validation',
  'Write integration tests',
  'Profile slow renders',
  'Fix regression bug',
  'Add loading skeletons',
  'Set up staging environment',
  'Create seed fixtures',
  'Implement search',
  'Add pagination',
  'Write end-to-end tests',
  'Audit accessibility',
  'Refactor state management',
  'Add rate limiting',
  'Configure logging',
  'Build notification service',
  'Implement export to CSV',
  'Add dark mode toggle',
  'Upgrade dependencies',
  'Write runbook',
  'Design empty states',
  'Implement file upload',
  'Add feature flags',
  'Optimize slow queries',
  'Create health check endpoint',
  'Draft release notes',
];

export const SUBTASK_TITLES: string[] = [
  'Create ticket breakdown',
  'Draft first version',
  'Peer review',
  'Fix review comments',
  'Update design spec',
  'Verify on staging',
  'Write unit test',
  'Update changelog',
  'Get stakeholder sign-off',
  'Record demo video',
  'Add analytics events',
  'Check cross-browser support',
  'Update error messages',
  'Prepare rollback plan',
  'Run load test',
  'Security review',
  'Document edge cases',
  'Pair programming session',
  'Refine copy',
  'QA handoff',
  'Update Figma file',
  'Benchmark performance',
  'Add i18n strings',
  'Final acceptance',
];

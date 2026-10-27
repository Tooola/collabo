"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3001),
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/project-gest',
    smtpHost: process.env.SMTP_HOST,
    smtpPort: Number(process.env.SMTP_PORT) || 587,
    smtpUser: process.env.SMTP_USER,
    smtpPassword: process.env.SMTP_PASSWORD,
    smtpFrom: process.env.SMTP_FROM || 'support@civictinz.com',
    // Demo seed -------------------------------------------------------------
    // Runs once per database (guarded by a marker), never overwrites existing
    // documents. Set SEED_ON_BOOT=false to opt out entirely.
    seedOnBoot: (process.env.SEED_ON_BOOT ?? 'true').toLowerCase() !== 'false',
    seedWorkspaceId: process.env.SEED_WORKSPACE_ID ?? null,
    seedPassword: process.env.SEED_PASSWORD ?? 'password',
    // External analytics API -------------------------------------------------
    // The key is read from the server-side env only: it never reaches the
    // frontend bundle, the source code, the logs or git.
    analyticsApiUrl: (process.env.ANALYTICS_API_URL ?? 'https://analytics-6zid.onrender.com').replace(/\/+$/, ''),
    analyticsApiKey: process.env.ANALYTICS_API_KEY ?? null,
    analyticsAppSlug: process.env.ANALYTICS_APP_SLUG ?? 'gestpro'
};

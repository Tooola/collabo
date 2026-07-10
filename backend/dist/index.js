"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const teamRoutes_1 = __importDefault(require("./routes/teamRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const app = (0, express_1.default)();
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false
});
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too Many Requests', message: 'Too many login attempts' }
});
app.use((0, helmet_1.default)());
const allowedOrigins = [
    env_1.env.frontendUrl,
    'http://localhost:5173',
    'http://localhost:5174',
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, curl)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        // Also allow any *.vercel.app subdomain
        if (/\.vercel\.app$/.test(origin))
            return callback(null, true);
        callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json({ limit: '1mb' }));
app.use((0, cookie_parser_1.default)());
app.use(globalLimiter);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/projects', projectRoutes_1.default);
app.use('/api/tasks', taskRoutes_1.default);
app.use('/api/teams', teamRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
const database_1 = require("./services/database");
app.use(errorHandler_1.errorHandler);
// In serverless (Vercel) we export the app; locally we start the server
if (process.env.VERCEL !== '1') {
    (0, database_1.connectDB)().then(() => {
        app.listen(env_1.env.port, () => {
            console.log(`API running on http://localhost:${env_1.env.port}`);
        });
    }).catch(err => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    });
}
else {
    // Connect once on cold start, Vercel keeps the container warm
    (0, database_1.connectDB)().catch(console.error);
}
exports.default = app;

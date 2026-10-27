import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import teamRoutes from './routes/teamRoutes';
import userRoutes from './routes/userRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { connectDB } from './services/database';
import { runSeed } from './seed';

const app = express();

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false
});

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too Many Requests', message: 'Too many login attempts' }
});

app.use(helmet());
const allowedOrigins = [
  env.frontendUrl,
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Also allow any *.vercel.app subdomain
    if (/\.vercel\.app$/.test(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(globalLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Ensure DB is connected before handling API routes
app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);


app.use(errorHandler);

// In serverless (Vercel) we export the app; locally we start the server
if (process.env.VERCEL !== '1') {
  connectDB()
    // Idempotent and it never throws, so a seed failure cannot keep
    // the API from booting.
    .then(() => runSeed())
    .then(() => {
      app.listen(env.port, () => {
        console.log(`API running on http://localhost:${env.port}`);
      });
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB', err);
      process.exit(1);
    });
} else {
  // Connect once on cold start; Vercel keeps the container warm. The same
  // idempotent seed pass runs alongside it, so the data self-heals on the
  // first request after every cold start.
  connectDB()
    .then(() => runSeed())
    .catch(console.error);
}

export default app;

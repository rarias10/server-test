// src/config/cors.js
import cors from 'cors';
import { ENV } from './env.js';

// Support multiple origins via comma-separated list (no spaces).
const allowed = (ENV.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

export const corsMiddleware = cors({
  origin(origin, cb) {
    // Allow requests with no origin (like curl or mobile apps)
    if (!origin) return cb(null, true);
    if (allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('CORS not allowed for origin: ' + origin), false);
  },
  credentials: true,
});

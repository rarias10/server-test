// src/config/env.js
import 'dotenv/config';

const required = (key, fallback, { allowEmpty = false } = {}) => {
  const val = process.env[key] ?? fallback;
  if ((val === undefined || val === null || (!allowEmpty && val === '')) && fallback === undefined) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return val;
};

const toBool = (v, def = false) => {
  if (v === undefined || v === null || v === '') return def;
  const s = String(v).toLowerCase().trim();
  return ['1', 'true', 'yes', 'y', 'on'].includes(s);
};

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT ?? '8080', 10),

  // CORS (comma-separated list supported)
  CORS_ORIGIN: required('CORS_ORIGIN', 'http://localhost:5173'),

  // Sessions / Redis
  SESSION_SECRET: required('SESSION_SECRET', 'change-me'),
  REDIS_URL: required('REDIS_URL', 'redis://localhost:6379'),

  // Cookie security (overridable per env)
  COOKIE_SAMESITE: (process.env.COOKIE_SAMESITE || 'lax').toLowerCase(), // lax | strict | none
  COOKIE_SECURE: toBool(process.env.COOKIE_SECURE, process.env.NODE_ENV === 'production'),

  // MySQL
  MYSQL_HOST: required('MYSQL_HOST', '127.0.0.1'),
  MYSQL_PORT: parseInt(process.env.MYSQL_PORT ?? '3306', 10),
  MYSQL_USER: required('MYSQL_USER', 'app_user'),
  MYSQL_PASSWORD: required('MYSQL_PASSWORD', 'app_password'),
  MYSQL_DATABASE: required('MYSQL_DATABASE', 'app_db'),
};

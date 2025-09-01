// src/config/session.js
import session from 'express-session';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';
import { ENV } from './env.js';

const redisClient = createClient({ url: ENV.REDIS_URL || 'redis://redis:6379' });
redisClient.on('error', (err) => console.error('[redis] client error:', err));
redisClient.connect().catch((err) => console.error('[redis] connect failed:', err));

const sameSite = ENV.COOKIE_SAMESITE || 'lax';
const secure = Boolean(ENV.COOKIE_SECURE) || sameSite === 'none';

export const sessionMiddleware = session({
  name: ENV.SESSION_NAME || 'sid',
  secret: ENV.SESSION_SECRET || 'change-me',
  store: new RedisStore({
    client: redisClient,
    prefix: ENV.SESSION_PREFIX || 'sess:',
    ttl: ENV.SESSION_TTL ? Number(ENV.SESSION_TTL) : undefined,
  }),
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    httpOnly: true,
    sameSite,
    secure,
    maxAge: Number(ENV.SESSION_MAX_AGE || 1000 * 60 * 60 * 2),
    domain: ENV.COOKIE_DOMAIN || undefined,
  },
});

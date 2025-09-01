// src/config/session.js
import session from 'express-session';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import { ENV } from './env.js';

const redis = new Redis(ENV.REDIS_URL);

// Enforce correct pairing: sameSite 'none' requires secure true
const computedSameSite = ENV.COOKIE_SAMESITE; // 'lax' | 'strict' | 'none'
const computedSecure = ENV.COOKIE_SECURE || computedSameSite === 'none';

export const sessionMiddleware = session({
  name: 'sid',
  store: new RedisStore({ client: redis }),
  secret: ENV.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: computedSameSite, // 'lax' (default for your current HTTP setup)
    secure: computedSecure,     // must be true if sameSite is 'none'
    maxAge: 1000 * 60 * 60 * 2, // 2 hours
  },
});

// src/routes/authRoutes.js
import { Router } from 'express';
import bcrypt from 'bcrypt';
import csrf from 'csurf';
import rateLimit from 'express-rate-limit';
import { createUser, findUserByEmail } from '../models/userModel.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Session-based CSRF (no cookie option)
const csrfProtection = csrf({ cookie: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const BCRYPT_ROUNDS = 12;

// CSRF token endpoint (DO NOT require csrfProtection here)
// First call must be able to obtain a token & set session cookie.
router.get('/csrf', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Register
router.post('/register', authLimiter, csrfProtection, async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: 'missing_fields' });

    const exists = await findUserByEmail(email);
    if (exists) return res.status(409).json({ error: 'exists' });

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await createUser({ email, passwordHash });
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', authLimiter, csrfProtection, async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: 'missing_fields' });

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'invalid' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid' });

    req.session.user = { id: user.id, email: user.email };
    res.json({ ok: true, user: req.session.user });
  } catch (err) {
    next(err);
  }
});

// Me
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.session.user });
});

// Logout (mutating; keep CSRF)
router.post('/logout', csrfProtection, requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.json({ ok: true });
  });
});

export default router;

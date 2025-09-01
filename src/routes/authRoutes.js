// src/routes/authRoutes.js
import { Router } from 'express';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import { createUser, findUserByEmail } from '../models/userModel.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const BCRYPT_ROUNDS = 12;

// CSRF token endpoint (req.csrfToken() provided by global csurf in app.js)
router.get('/csrf', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Register (csurf validates automatically because it's global)
router.post('/register', authLimiter, async (req, res, next) => {
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
router.post('/login', authLimiter, async (req, res, next) => {
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

// Logout
router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.json({ ok: true });
  });
});

export default router;

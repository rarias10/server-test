// src/routes/healthRoutes.js
import { Router } from 'express';
import { pingDb } from '../db/mysql.js';

const router = Router();

router.get('/health', async (_req, res) => {
  try {
    await pingDb();
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false, db: 'down' });
  }
});

export default router;

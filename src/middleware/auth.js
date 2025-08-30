// src/middleware/auth.js
export function requireAuth(req, res, next) {
  if (req.session?.user) return next();
  return res.status(401).json({ error: 'unauthorized' });
}

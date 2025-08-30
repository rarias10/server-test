// src/middleware/errors.js
export function notFound(_req, res, _next) {
  res.status(404).json({ error: 'not_found' });
}

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'server_error' });
}

/**
 * Global error handler — last middleware in the chain.
 *
 * Conventions used in controllers:
 *   - Throw (or `next(err)`) any unexpected error → ends up here.
 *   - For "expected" errors (validation, not found, unauthorized),
 *     attach `err.status` (HTTP code) and a clear `err.message`.
 *
 * In production we never leak stack traces or DB error details to the client.
 */

const config = require('../config/env');

// Helper for controllers to throw clean HTTP errors.
class HttpError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// 404 catch-all — mount AFTER all routes.
const notFound = (req, res, next) => {
  next(new HttpError(404, `Route introuvable: ${req.method} ${req.originalUrl}`));
};

// Main error handler — Express recognizes it because of the 4-arg signature.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Decide status code
  let status = err.status || err.statusCode || 500;

  // Normalize a few common library errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    err.message = 'Token invalide ou expiré';
  }
  if (err.code === '23505') {           // PG unique violation
    status = 409;
    err.message = err.message || 'Doublon — cette valeur existe déjà';
  }
  if (err.code === '23503') {           // PG foreign key violation
    status = 400;
    err.message = 'Référence invalide';
  }
  if (err.type === 'entity.too.large') {
    status = 413;
    err.message = 'Fichier trop volumineux';
  }

  // Always log on the server side
  if (status >= 500) {
    console.error(`[error ${status}] ${req.method} ${req.originalUrl}`);
    console.error(err.stack || err);
  } else if (config.isDev) {
    console.warn(`[error ${status}] ${req.method} ${req.originalUrl} — ${err.message}`);
  }

  // Build response
  const body = { message: err.message || 'Erreur serveur' };
  if (err.details) body.details = err.details;
  if (config.isDev && status >= 500) body.stack = err.stack;

  res.status(status).json(body);
};

module.exports = { errorHandler, notFound, HttpError };

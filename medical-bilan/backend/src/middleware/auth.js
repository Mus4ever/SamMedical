/**
 * Auth + role middleware.
 *
 * - `authenticate`  → verifies JWT, loads the user from DB into req.user.
 * - `requireAdmin`  → 403 if req.user.role !== 'admin'.
 * - `requirePatient` → 403 if req.user.role !== 'patient'.
 *
 * Usage:
 *   router.get('/me', authenticate, handler);
 *   router.post('/patients', authenticate, requireAdmin, handler);
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { query } = require('../config/db');
const { HttpError } = require('./errorHandler');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      throw new HttpError(401, 'Token manquant');
    }
    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) throw new HttpError(401, 'Token manquant');

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      // jsonwebtoken errors get normalized in errorHandler.js
      throw err;
    }

    if (!decoded.userId) {
      throw new HttpError(401, 'Token invalide');
    }

    const result = await query(
      `SELECT id, full_name, phone, email, role, is_active
         FROM users
        WHERE id = $1`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      throw new HttpError(401, 'Utilisateur introuvable');
    }
    const user = result.rows[0];
    if (!user.is_active) {
      throw new HttpError(401, 'Compte désactivé');
    }

    // Attach normalized user object to the request
    req.user = {
      id:       user.id,
      fullName: user.full_name,
      phone:    user.phone,
      email:    user.email,
      role:     user.role,
    };
    next();
  } catch (err) {
    next(err);
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new HttpError(403, 'Accès réservé au médecin'));
  }
  next();
};

const requirePatient = (req, res, next) => {
  if (!req.user || req.user.role !== 'patient') {
    return next(new HttpError(403, 'Accès réservé aux patients'));
  }
  next();
};

module.exports = { authenticate, requireAdmin, requirePatient };

/**
 * Auth routes — /api/auth/*
 *
 * - Login is rate-limited HARDER than the global limiter to slow brute force.
 *   (5 attempts per 15 min per IP.)
 */

const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');

const { login, getMe, changePassword } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: { message: 'Trop de tentatives. Réessayez dans 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/login',
  loginLimiter,
  [
    body('phone').notEmpty().withMessage('Téléphone requis'),
    body('password').isString().isLength({ min: 4 }).withMessage('Mot de passe requis'),
  ],
  login
);

router.get('/me', authenticate, getMe);

router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Mot de passe actuel requis'),
    body('newPassword').isString().isLength({ min: 8 })
      .withMessage('Nouveau mot de passe: minimum 8 caractères'),
  ],
  changePassword
);

module.exports = router;

/**
 * Patients routes — admin-only.
 * Mounted at /api/patients in app.js.
 */

const router = require('express').Router();
const { body, param } = require('express-validator');

const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getAllPatients,
  createPatient,
  getPatientById,
  updatePatient,
  resetPatientPassword,
} = require('../controllers/patient.controller');

// Every route here requires an authenticated admin
router.use(authenticate, requireAdmin);

// --- List ---
router.get('/', getAllPatients);

// --- Create ---
router.post(
  '/',
  [
    body('fullName')
      .isString().withMessage('Nom requis')
      .trim()
      .isLength({ min: 2, max: 255 }).withMessage('Nom: 2 à 255 caractères'),
    body('phone')
      .isString().withMessage('Téléphone requis')
      .trim()
      .notEmpty().withMessage('Téléphone requis'),
    body('email')
      .optional({ values: 'falsy' })
      .isEmail().withMessage('Email invalide')
      .normalizeEmail(),
    body('password')
      .optional({ values: 'falsy' })
      .isString()
      .isLength({ min: 8 }).withMessage('Mot de passe: minimum 8 caractères'),
  ],
  createPatient
);

// --- Get by ID ---
router.get(
  '/:id',
  [param('id').isUUID().withMessage('ID invalide')],
  getPatientById
);

// --- Update ---
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('ID invalide'),
    body('fullName').optional().isString().trim().isLength({ min: 2, max: 255 }),
    body('phone').optional().isString().trim().notEmpty(),
    body('email').optional({ values: 'falsy' }).isEmail().normalizeEmail(),
    body('isActive').optional().isBoolean(),
  ],
  updatePatient
);

// --- Reset password ---
router.post(
  '/:id/reset-password',
  [
    param('id').isUUID().withMessage('ID invalide'),
    body('newPassword').optional({ values: 'falsy' }).isString().isLength({ min: 8 }),
  ],
  resetPatientPassword
);

module.exports = router;

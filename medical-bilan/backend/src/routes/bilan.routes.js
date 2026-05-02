/**
 * Bilan routes — /api/bilans/*
 *
 * Mixed access:
 *   - Some routes are admin-only (upload, list all, mark ready, delete).
 *   - Some are patient-only (list my bilans).
 *   - Download is accessible by both roles (with ownership check in controller).
 */

const router = require('express').Router();
const { body, param } = require('express-validator');

const { authenticate, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  uploadBilan,
  getAllBilans,
  getMyBilans,
  getBilanDownloadUrl,
  markBilanReady,
  deleteBilan,
} = require('../controllers/bilan.controller');

// All bilan routes require authentication
router.use(authenticate);

// ──────────────────────────────────────────────────────
// Patient routes (must come BEFORE /:id to avoid clash)
// ──────────────────────────────────────────────────────

/**
 * GET /api/bilans/my
 * Patient sees their own bilans.
 */
router.get('/my', getMyBilans);

/**
 * GET /api/bilans/:id/download
 * Both admin and patient — controller checks ownership.
 */
router.get(
  '/:id/download',
  [param('id').isUUID().withMessage('ID invalide')],
  getBilanDownloadUrl
);

// ──────────────────────────────────────────────────────
// Admin routes
// ──────────────────────────────────────────────────────

/**
 * POST /api/bilans
 * Admin uploads a PDF bilan for a patient.
 * multipart/form-data: bilanFile (file), patientId, title, description?
 */
router.post(
  '/',
  requireAdmin,
  upload.single('bilanFile'),
  [
    body('patientId').isUUID().withMessage('ID patient invalide'),
    body('title')
      .isString().withMessage('Titre requis')
      .trim()
      .isLength({ min: 2, max: 255 }).withMessage('Titre: 2 à 255 caractères'),
    body('description')
      .optional({ values: 'falsy' })
      .isString()
      .trim()
      .isLength({ max: 1000 }).withMessage('Description: max 1000 caractères'),
  ],
  uploadBilan
);

/**
 * GET /api/bilans
 * Admin lists all bilans (with patient info, pagination, filters).
 */
router.get('/', requireAdmin, getAllBilans);

/**
 * PATCH /api/bilans/:id/ready
 * Admin marks a bilan as ready (triggers notifications in Layer 6).
 */
router.patch(
  '/:id/ready',
  requireAdmin,
  [param('id').isUUID().withMessage('ID invalide')],
  markBilanReady
);

/**
 * DELETE /api/bilans/:id
 * Admin deletes a bilan (from storage + DB).
 */
router.delete(
  '/:id',
  requireAdmin,
  [param('id').isUUID().withMessage('ID invalide')],
  deleteBilan
);

module.exports = router;

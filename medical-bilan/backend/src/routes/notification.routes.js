/**
 * Notification routes — /api/notifications/*
 *
 * - /twiml is PUBLIC (Twilio must fetch it without auth).
 * - All other routes require admin auth.
 */

const router = require('express').Router();
const { param } = require('express-validator');

const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getTwiml,
  getNotificationLogs,
  resendNotifications,
} = require('../controllers/notification.controller');

// ──────────────────────────────────────────────────────
// Public — Twilio fetches this when placing the call
// ──────────────────────────────────────────────────────
router.get('/twiml', getTwiml);

// ──────────────────────────────────────────────────────
// Admin routes
// ──────────────────────────────────────────────────────

/**
 * GET /api/notifications/logs/:bilanId
 * View all notification attempts for a bilan.
 */
router.get(
  '/logs/:bilanId',
  authenticate,
  requireAdmin,
  [param('bilanId').isUUID().withMessage('ID bilan invalide')],
  getNotificationLogs
);

/**
 * POST /api/notifications/resend/:bilanId
 * Re-trigger notifications for an already-ready bilan.
 */
router.post(
  '/resend/:bilanId',
  authenticate,
  requireAdmin,
  [param('bilanId').isUUID().withMessage('ID bilan invalide')],
  resendNotifications
);

module.exports = router;

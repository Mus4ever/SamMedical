/**
 * Notification controller.
 *
 * Endpoints:
 *   GET  /api/notifications/twiml          → TwiML XML for Twilio voice calls
 *   GET  /api/notifications/logs/:bilanId  → admin views notification logs for a bilan
 *   POST /api/notifications/resend/:bilanId → admin re-triggers notifications for a bilan
 */

const { query } = require('../config/db');
const config = require('../config/env');
const { HttpError } = require('../middleware/errorHandler');
const { notifyPatient } = require('../services/notification.service');

/**
 * GET /api/notifications/twiml
 * PUBLIC — Twilio fetches this URL when placing the call.
 * Returns TwiML XML that plays the pre-recorded Darija MP3 twice.
 */
const getTwiml = (req, res) => {
  const audioUrl = `${config.appPublicUrl}/audio/bilan_ready_darija.mp3`;

  res.type('text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play loop="2">${audioUrl}</Play>
</Response>`);
};

/**
 * GET /api/notifications/logs/:bilanId
 * Admin: view all notification attempts for a specific bilan.
 */
const getNotificationLogs = async (req, res, next) => {
  try {
    const { bilanId } = req.params;

    // Verify bilan exists
    const bilanResult = await query('SELECT id FROM bilans WHERE id = $1', [bilanId]);
    if (bilanResult.rows.length === 0) {
      throw new HttpError(404, 'Bilan introuvable');
    }

    const logs = await query(
      `SELECT nl.id, nl.type, nl.status, nl.provider_id, nl.error_message, nl.created_at,
              u.full_name AS patient_name, u.phone AS patient_phone
         FROM notification_logs nl
         JOIN users u ON nl.patient_id = u.id
        WHERE nl.bilan_id = $1
        ORDER BY nl.created_at DESC`,
      [bilanId]
    );

    res.json({ logs: logs.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/notifications/resend/:bilanId
 * Admin: re-trigger notifications for a bilan that already has status 'ready'.
 * Useful if the first attempt failed or the patient didn't receive it.
 */
const resendNotifications = async (req, res, next) => {
  try {
    const { bilanId } = req.params;

    const bilanResult = await query('SELECT * FROM bilans WHERE id = $1', [bilanId]);
    if (bilanResult.rows.length === 0) {
      throw new HttpError(404, 'Bilan introuvable');
    }

    const bilan = bilanResult.rows[0];

    if (bilan.status === 'pending') {
      throw new HttpError(400, 'Ce bilan n\'est pas encore prêt. Marquez-le comme prêt d\'abord.');
    }

    // Get patient info
    const patientResult = await query(
      'SELECT id, full_name, phone, email FROM users WHERE id = $1',
      [bilan.patient_id]
    );
    if (patientResult.rows.length === 0) {
      throw new HttpError(404, 'Patient introuvable');
    }

    // Re-trigger notifications (async — don't block the response)
    const patient = patientResult.rows[0];
    notifyPatient(bilan, patient).catch((err) => {
      console.error(`[notification] Resend failed for bilan ${bilanId}:`, err.message);
    });

    res.json({
      message: 'Notifications en cours de renvoi',
      patient: { name: patient.full_name, phone: patient.phone },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTwiml, getNotificationLogs, resendNotifications };

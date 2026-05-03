/**
 * Notification controller.
 */

const { query } = require('../config/db');
const config = require('../config/env');
const { HttpError } = require('../middleware/errorHandler');
const { notifyPatient } = require('../services/notification.service');

/**
 * GET /api/notifications/twiml
 * PUBLIC — Twilio fetches this URL when placing the call.
 * Returns TwiML XML that plays the pre-recorded MP3 twice.
 */
const getTwiml = (req, res) => {
  const audioUrl = `${config.appPublicUrl}/audio/${config.audio.filename}`;

  res.type('text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play loop="2">${audioUrl}</Play>
</Response>`);
};

const getNotificationLogs = async (req, res, next) => {
  try {
    const { bilanId } = req.params;
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

const resendNotifications = async (req, res, next) => {
  try {
    const { bilanId } = req.params;
    const bilanResult = await query('SELECT * FROM bilans WHERE id = $1', [bilanId]);
    if (bilanResult.rows.length === 0) throw new HttpError(404, 'Bilan introuvable');
    const bilan = bilanResult.rows[0];
    if (bilan.status === 'pending') {
      throw new HttpError(400, 'Ce bilan n\'est pas encore prêt.');
    }
    const patientResult = await query(
      'SELECT id, full_name, phone, email FROM users WHERE id = $1',
      [bilan.patient_id]
    );
    if (patientResult.rows.length === 0) throw new HttpError(404, 'Patient introuvable');
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

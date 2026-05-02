/**
 * Notification service — orchestrates all 3 notification channels:
 *   1. SMS (Twilio) — instant text message in Darija
 *   2. Voice call (Twilio) — plays pre-recorded Darija MP3
 *   3. Email (Resend) — French email with bilan info
 *
 * Each channel is independent: a failure in one doesn't block the others.
 * Every attempt is logged to the `notification_logs` table.
 *
 * The main entry point is `notifyPatient(bilan, patient)`.
 */

const { getTwilio } = require('../config/twilio');
const { getResend } = require('../config/resend');
const config = require('../config/env');
const { query } = require('../config/db');

// ─────────────────────────────────────────────
// Logging helper
// ─────────────────────────────────────────────

/**
 * Log a notification attempt to the DB.
 */
const logNotification = async (bilanId, patientId, type, status, providerId = null, errorMessage = null) => {
  await query(
    `INSERT INTO notification_logs (bilan_id, patient_id, type, status, provider_id, error_message)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [bilanId, patientId, type, status, providerId, errorMessage]
  );
};

// ─────────────────────────────────────────────
// Channel 1: SMS (Twilio)
// ─────────────────────────────────────────────

/**
 * Send an SMS notification in Darija + French.
 */
const sendSms = async (patient, bilan) => {
  const twilioClient = getTwilio();
  const clinicName = config.clinic.name;

  const body = [
    `🔬 مرحبا ${patient.full_name}`,
    ``,
    `نتائج تحاليلكم جاهزة ✅`,
    ``,
    `يمكنكم الاطلاع عليها بتسجيل الدخول على:`,
    `${config.frontendUrl}/login`,
    ``,
    `📋 ${bilan.title}`,
    ``,
    `— ${clinicName}`,
  ].join('\n');

  const result = await twilioClient.messages.create({
    from: config.twilio.phone,
    to: patient.phone,
    body,
  });

  return result;
};

// ─────────────────────────────────────────────
// Channel 2: Voice call (Twilio)
// ─────────────────────────────────────────────

/**
 * Make an automated phone call that plays the pre-recorded Darija MP3.
 * Twilio fetches the TwiML from our /api/notifications/twiml endpoint.
 */
const makePhoneCall = async (patientPhone) => {
  const twilioClient = getTwilio();

  if (!config.appPublicUrl) {
    throw new Error('APP_PUBLIC_URL not set — Twilio cannot fetch TwiML');
  }

  const twimlUrl = `${config.appPublicUrl}/api/notifications/twiml`;

  const call = await twilioClient.calls.create({
    to: patientPhone,
    from: config.twilio.phone,
    url: twimlUrl,
  });

  return call;
};

// ─────────────────────────────────────────────
// Channel 3: Email (Resend)
// ─────────────────────────────────────────────

/**
 * Send an email notification in French.
 * Only sent if the patient has an email address on file.
 */
const sendEmail = async (patient, bilan) => {
  const resend = getResend();
  const clinicName = config.clinic.name;

  if (!patient.email) {
    return null; // No email on file — skip silently
  }

  const result = await resend.emails.send({
    from: config.resend.fromEmail || `${clinicName} <onboarding@resend.dev>`,
    to: [patient.email],
    subject: `📋 Vos résultats d'analyses sont prêts — ${clinicName}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1d4ed8;">🏥 ${clinicName}</h2>
        <p>Bonjour <strong>${patient.full_name}</strong>,</p>
        <p>Vos résultats d'analyses sont prêts :</p>
        <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; margin: 16px 0;">
          <strong>📋 ${bilan.title}</strong>
          ${bilan.description ? `<br><span style="color: #6b7280;">${bilan.description}</span>` : ''}
        </div>
        <p>Connectez-vous pour consulter et télécharger vos résultats :</p>
        <a href="${config.frontendUrl}/login"
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px;
                  border-radius: 8px; text-decoration: none; font-weight: 600; margin: 8px 0;">
          Accéder à mes résultats
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
          Ce message a été envoyé automatiquement. Si vous n'êtes pas concerné(e), veuillez ignorer cet email.
        </p>
      </div>
    `,
  });

  return result;
};

// ─────────────────────────────────────────────
// Main orchestrator
// ─────────────────────────────────────────────

/**
 * Notify a patient through all available channels.
 * Runs each channel independently — a failure in one doesn't block others.
 *
 * @param {Object} bilan   – The bilan record (from DB)
 * @param {Object} patient – The patient user record (from DB)
 * @returns {Object} results – { sms, call, email, errors[] }
 */
const notifyPatient = async (bilan, patient) => {
  const results = { sms: null, call: null, email: null, errors: [] };

  // 1. SMS — instant
  try {
    const smsResult = await sendSms(patient, bilan);
    results.sms = smsResult.sid;
    await logNotification(bilan.id, patient.id, 'sms', 'sent', smsResult.sid);
    // Update bilan
    await query(
      `UPDATE bilans SET notification_sms_status = 'sent' WHERE id = $1`,
      [bilan.id]
    );
  } catch (err) {
    console.error(`[notification] SMS failed for patient ${patient.id}:`, err.message);
    results.errors.push({ type: 'sms', error: err.message });
    await logNotification(bilan.id, patient.id, 'sms', 'failed', null, err.message);
    await query(
      `UPDATE bilans SET notification_sms_status = 'failed' WHERE id = $1`,
      [bilan.id]
    );
  }

  // 2. Voice call — delayed 30 seconds after SMS
  setTimeout(async () => {
    try {
      const callResult = await makePhoneCall(patient.phone);
      results.call = callResult.sid;
      await logNotification(bilan.id, patient.id, 'call', 'initiated', callResult.sid);
      await query(
        `UPDATE bilans SET notification_call_status = 'initiated' WHERE id = $1`,
        [bilan.id]
      );
    } catch (err) {
      console.error(`[notification] Call failed for patient ${patient.id}:`, err.message);
      results.errors.push({ type: 'call', error: err.message });
      await logNotification(bilan.id, patient.id, 'call', 'failed', null, err.message);
      await query(
        `UPDATE bilans SET notification_call_status = 'failed' WHERE id = $1`,
        [bilan.id]
      );
    }
  }, 30_000);

  // 3. Email — only if patient has an email
  if (patient.email) {
    try {
      const emailResult = await sendEmail(patient, bilan);
      if (emailResult) {
        results.email = emailResult.data?.id || 'sent';
        await logNotification(bilan.id, patient.id, 'email', 'sent', emailResult.data?.id);
        await query(
          `UPDATE bilans SET notification_email_status = 'sent' WHERE id = $1`,
          [bilan.id]
        );
      }
    } catch (err) {
      console.error(`[notification] Email failed for patient ${patient.id}:`, err.message);
      results.errors.push({ type: 'email', error: err.message });
      await logNotification(bilan.id, patient.id, 'email', 'failed', null, err.message);
      await query(
        `UPDATE bilans SET notification_email_status = 'failed' WHERE id = $1`,
        [bilan.id]
      );
    }
  }

  // Mark bilan as notification sent
  await query(
    `UPDATE bilans SET notification_sent = true, notification_sent_at = NOW() WHERE id = $1`,
    [bilan.id]
  );

  return results;
};

module.exports = { notifyPatient };

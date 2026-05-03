/**
 * Notification service — SMS + voice + email orchestrator.
 * All text content in French (Arabic removed per request).
 *
 * Two entry points:
 *   1. notifyPatient(bilan, patient) → "your results are ready" (3 channels)
 *   2. sendCredentials(patient, password) → welcome with login info (2 channels)
 */

const { getTwilio } = require('../config/twilio');
const { getResend } = require('../config/resend');
const config = require('../config/env');
const { query } = require('../config/db');

const logNotification = async (bilanId, patientId, type, status, providerId = null, errorMessage = null) => {
  try {
    await query(
      `INSERT INTO notification_logs (bilan_id, patient_id, type, status, provider_id, error_message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [bilanId, patientId, type, status, providerId, errorMessage]
    );
  } catch (err) {
    console.error('[notification] log insert failed:', err.message);
  }
};

// ═══════════════════════════════════════
// PART 1 — Bilan-ready notifications
// ═══════════════════════════════════════

const sendBilanReadySms = async (patient, bilan) => {
  const twilioClient = getTwilio();
  const body = [
    `Bonjour ${patient.full_name},`,
    ``,
    `Vos resultats d'analyses sont prets.`,
    ``,
    `Bilan: ${bilan.title}`,
    `Connectez-vous: ${config.frontendUrl}/login`,
    ``,
    `— ${config.clinic.name}`,
  ].join('\n');

  return twilioClient.messages.create({
    from: config.twilio.phone,
    to: patient.phone,
    body,
  });
};

const makePhoneCall = async (patientPhone) => {
  const twilioClient = getTwilio();
  if (!config.appPublicUrl) {
    throw new Error('APP_PUBLIC_URL not set — Twilio cannot fetch TwiML');
  }
  const twimlUrl = `${config.appPublicUrl}/api/notifications/twiml`;
  return twilioClient.calls.create({
    to: patientPhone,
    from: config.twilio.phone,
    url: twimlUrl,
  });
};

const sendBilanReadyEmail = async (patient, bilan) => {
  const resend = getResend();
  if (!patient.email) return null;

  return resend.emails.send({
    from: config.resend.fromEmail || `${config.clinic.name} <onboarding@resend.dev>`,
    to: [patient.email],
    subject: `📋 Vos résultats d'analyses sont prêts — ${config.clinic.name}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; background: #fbfaf7;">
        <div style="background: white; border-radius: 24px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          <div style="display: inline-block; padding: 6px 14px; background: #dcfce7; color: #15803d; border-radius: 999px; font-size: 12px; font-weight: 500; margin-bottom: 24px;">
            🩺 ${config.clinic.name}
          </div>
          <h2 style="font-family: Georgia, serif; color: #0a0a0a; font-size: 28px; margin: 0 0 16px 0; letter-spacing: -0.5px;">
            Bonjour ${patient.full_name},
          </h2>
          <p style="color: #6f6f6f; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
            Vos résultats d'analyses sont prêts à être consultés.
          </p>
          <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px 20px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0; color: #0a0a0a; font-weight: 600;">📋 ${bilan.title}</p>
            ${bilan.description ? `<p style="margin: 6px 0 0 0; color: #6f6f6f; font-size: 13px;">${bilan.description}</p>` : ''}
          </div>
          <a href="${config.frontendUrl}/login"
             style="display: inline-block; background: #0a0a0a; color: white; padding: 14px 28px; border-radius: 999px; text-decoration: none; font-weight: 600; margin: 16px 0; font-size: 14px;">
            Accéder à mes résultats →
          </a>
          <p style="color: #9ca3af; font-size: 11px; margin-top: 32px; line-height: 1.5;">
            Ce message est confidentiel. Vos résultats sont protégés par chiffrement.
          </p>
        </div>
      </div>
    `,
  });
};

const notifyPatient = async (bilan, patient) => {
  const results = { sms: null, call: null, email: null, errors: [] };

  try {
    const r = await sendBilanReadySms(patient, bilan);
    results.sms = r.sid;
    await logNotification(bilan.id, patient.id, 'sms', 'sent', r.sid);
    await query(`UPDATE bilans SET notification_sms_status = 'sent' WHERE id = $1`, [bilan.id]);
  } catch (err) {
    console.error(`[notification] SMS failed:`, err.message);
    results.errors.push({ type: 'sms', error: err.message });
    await logNotification(bilan.id, patient.id, 'sms', 'failed', null, err.message);
    await query(`UPDATE bilans SET notification_sms_status = 'failed' WHERE id = $1`, [bilan.id]);
  }

  setTimeout(async () => {
    try {
      const r = await makePhoneCall(patient.phone);
      results.call = r.sid;
      await logNotification(bilan.id, patient.id, 'call', 'initiated', r.sid);
      await query(`UPDATE bilans SET notification_call_status = 'initiated' WHERE id = $1`, [bilan.id]);
    } catch (err) {
      console.error(`[notification] Call failed:`, err.message);
      results.errors.push({ type: 'call', error: err.message });
      await logNotification(bilan.id, patient.id, 'call', 'failed', null, err.message);
      await query(`UPDATE bilans SET notification_call_status = 'failed' WHERE id = $1`, [bilan.id]);
    }
  }, 30_000);

  if (patient.email) {
    try {
      const r = await sendBilanReadyEmail(patient, bilan);
      if (r) {
        results.email = r.data?.id || 'sent';
        await logNotification(bilan.id, patient.id, 'email', 'sent', r.data?.id);
        await query(`UPDATE bilans SET notification_email_status = 'sent' WHERE id = $1`, [bilan.id]);
      }
    } catch (err) {
      console.error(`[notification] Email failed:`, err.message);
      results.errors.push({ type: 'email', error: err.message });
      await logNotification(bilan.id, patient.id, 'email', 'failed', null, err.message);
      await query(`UPDATE bilans SET notification_email_status = 'failed' WHERE id = $1`, [bilan.id]);
    }
  }

  await query(
    `UPDATE bilans SET notification_sent = true, notification_sent_at = NOW() WHERE id = $1`,
    [bilan.id]
  );
  return results;
};

// ═══════════════════════════════════════
// PART 2 — Account credentials
// ═══════════════════════════════════════

const sendCredentialsSms = async (patient, password) => {
  const twilioClient = getTwilio();
  const body = [
    `${config.clinic.name}`,
    `Bonjour ${patient.full_name},`,
    ``,
    `Votre compte est pret:`,
    `Telephone: ${patient.phone}`,
    `Mot de passe: ${password}`,
    ``,
    `Connexion: ${config.frontendUrl}/login`,
  ].join('\n');

  return twilioClient.messages.create({
    from: config.twilio.phone,
    to: patient.phone,
    body,
  });
};

const sendCredentialsEmail = async (patient, password) => {
  const resend = getResend();
  if (!patient.email) return null;

  return resend.emails.send({
    from: config.resend.fromEmail || `${config.clinic.name} <onboarding@resend.dev>`,
    to: [patient.email],
    subject: `🔐 Vos identifiants — ${config.clinic.name}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; background: #fbfaf7;">
        <div style="background: white; border-radius: 24px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          <div style="display: inline-block; padding: 6px 14px; background: #dcfce7; color: #15803d; border-radius: 999px; font-size: 12px; font-weight: 500; margin-bottom: 24px;">
            🩺 ${config.clinic.name}
          </div>
          <h2 style="font-family: Georgia, serif; color: #0a0a0a; font-size: 28px; margin: 0 0 16px 0; letter-spacing: -0.5px;">
            Bienvenue, ${patient.full_name}
          </h2>
          <p style="color: #6f6f6f; font-size: 15px; line-height: 1.6; margin: 0 0 28px 0;">
            Votre compte patient a été créé. Voici vos identifiants pour accéder à vos résultats d'analyses :
          </p>
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 24px; border-radius: 16px; margin: 0 0 28px 0;">
            <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">Téléphone</p>
            <p style="margin: 0 0 18px 0; font-family: 'SF Mono', Consolas, monospace; font-size: 16px; color: #0a0a0a;">${patient.phone}</p>
            <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">Mot de passe temporaire</p>
            <p style="margin: 0; font-family: 'SF Mono', Consolas, monospace; font-size: 20px; color: #0a0a0a; letter-spacing: 0.05em; font-weight: 600;">${password}</p>
          </div>
          <a href="${config.frontendUrl}/login"
             style="display: inline-block; background: #0a0a0a; color: white; padding: 14px 28px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Me connecter →
          </a>
          <div style="margin-top: 28px; padding: 14px 18px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
            <p style="margin: 0; color: #78350f; font-size: 13px; line-height: 1.5;">
              ⚠️ Pour votre sécurité, pensez à changer ce mot de passe lors de votre première connexion.
            </p>
          </div>
          <p style="color: #9ca3af; font-size: 11px; margin-top: 28px; line-height: 1.5;">
            Vous recevrez automatiquement un SMS, un email et un appel dès que vos résultats d'analyses seront prêts.
          </p>
        </div>
      </div>
    `,
  });
};

const sendCredentials = async (patient, plainPassword) => {
  const results = { sms: null, email: null, errors: [] };

  try {
    const r = await sendCredentialsSms(patient, plainPassword);
    results.sms = r.sid;
    console.log(`[credentials] SMS sent to ${patient.phone} (sid: ${r.sid})`);
  } catch (err) {
    console.error(`[credentials] SMS failed for ${patient.phone}:`, err.message);
    results.errors.push({ type: 'sms', error: err.message });
  }

  if (patient.email) {
    try {
      const r = await sendCredentialsEmail(patient, plainPassword);
      if (r) {
        results.email = r.data?.id || 'sent';
        console.log(`[credentials] Email sent to ${patient.email}`);
      }
    } catch (err) {
      console.error(`[credentials] Email failed for ${patient.email}:`, err.message);
      results.errors.push({ type: 'email', error: err.message });
    }
  }

  return results;
};

module.exports = { notifyPatient, sendCredentials };

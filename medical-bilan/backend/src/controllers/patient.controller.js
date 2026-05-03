/**
 * Patient controller — admin-only endpoints to manage patients.
 *
 * Endpoints:
 *   GET    /api/patients              → list (search, pagination, bilan_count)
 *   POST   /api/patients              → create + auto-send credentials (SMS + email)
 *   GET    /api/patients/:id          → patient + their bilans
 *   PUT    /api/patients/:id          → partial update
 *   POST   /api/patients/:id/reset-password → reset + auto-send new credentials
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { query } = require('../config/db');
const { HttpError } = require('../middleware/errorHandler');
const { normalizePhone, isValidAlgerianPhone } = require('../utils/phone');
const { sendCredentials } = require('../services/notification.service');

const validate = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError(400, 'Données invalides', errors.array());
  }
};

const generatePassword = () =>
  crypto.randomBytes(6).toString('base64').replace(/[+/=]/g, '').slice(0, 8);

const getAllPatients = async (req, res, next) => {
  try {
    const search   = (req.query.search || '').trim();
    const limit    = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const offset   = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    const activeQs = req.query.active;

    const where = [`u.role = 'patient'`];
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      where.push(`(u.full_name ILIKE $${params.length} OR u.phone ILIKE $${params.length})`);
    }
    if (activeQs === 'true' || activeQs === 'false') {
      params.push(activeQs === 'true');
      where.push(`u.is_active = $${params.length}`);
    }

    params.push(limit);
    const limitParam = `$${params.length}`;
    params.push(offset);
    const offsetParam = `$${params.length}`;

    const sql = `
      SELECT u.id, u.full_name, u.phone, u.email, u.is_active, u.created_at,
             COALESCE(b.bilan_count, 0)::int        AS bilan_count,
             COALESCE(b.last_bilan_at, NULL)        AS last_bilan_at
        FROM users u
        LEFT JOIN (
          SELECT patient_id, COUNT(*) AS bilan_count, MAX(created_at) AS last_bilan_at
            FROM bilans GROUP BY patient_id
        ) b ON b.patient_id = u.id
       WHERE ${where.join(' AND ')}
       ORDER BY u.created_at DESC
       LIMIT ${limitParam} OFFSET ${offsetParam}
    `;
    const result = await query(sql, params);

    const countParams = params.slice(0, params.length - 2);
    const countSql = `SELECT COUNT(*)::int AS total FROM users u WHERE ${where.join(' AND ')}`;
    const totalResult = await query(countSql, countParams);

    res.json({
      patients: result.rows,
      total: totalResult.rows[0].total,
      limit,
      offset,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/patients
 * Auto-generates a password and AUTO-SENDS credentials via SMS + email.
 * The plaintext password is also returned ONCE so the admin can write it down.
 */
const createPatient = async (req, res, next) => {
  try {
    validate(req);
    const { fullName, phone, email } = req.body;
    let password = req.body.password;
    let passwordWasGenerated = false;

    const normalizedPhone = normalizePhone(phone);
    if (!isValidAlgerianPhone(normalizedPhone)) {
      throw new HttpError(400, 'Numéro de téléphone invalide (format attendu: +213XXXXXXXXX)');
    }

    if (!password) {
      password = generatePassword();
      passwordWasGenerated = true;
    }

    const hash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (full_name, phone, email, password_hash, role)
       VALUES ($1, $2, $3, $4, 'patient')
       RETURNING id, full_name, phone, email, is_active, created_at`,
      [fullName.trim(), normalizedPhone, email?.trim() || null, hash]
    );
    const patient = result.rows[0];

    // Fire-and-forget credentials sending (don't block the response if Twilio/Resend are slow or unconfigured)
    let credentialsPromise = Promise.resolve({ sms: null, email: null, errors: [] });
    if (passwordWasGenerated) {
      credentialsPromise = sendCredentials(patient, password)
        .catch(err => {
          console.error('[patient.create] sendCredentials failed:', err.message);
          return { sms: null, email: null, errors: [{ type: 'all', error: err.message }] };
        });
    }

    // Wait briefly so we can report to the admin whether it worked, but cap at 5s
    const credentialsResult = await Promise.race([
      credentialsPromise,
      new Promise(resolve => setTimeout(() => resolve({ pending: true }), 5000)),
    ]);

    res.status(201).json({
      patient,
      generatedPassword: passwordWasGenerated ? password : null,
      credentials: credentialsResult,
    });
  } catch (err) {
    next(err);
  }
};

const getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userResult = await query(
      `SELECT id, full_name, phone, email, is_active, created_at, updated_at
         FROM users WHERE id = $1 AND role = 'patient'`,
      [id]
    );
    if (userResult.rows.length === 0) throw new HttpError(404, 'Patient introuvable');

    const bilansResult = await query(
      `SELECT id, title, description, status, file_name, file_size,
              notification_sent, notification_sent_at,
              notification_call_status, notification_sms_status, notification_email_status,
              created_at, updated_at
         FROM bilans WHERE patient_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    res.json({ ...userResult.rows[0], bilans: bilansResult.rows });
  } catch (err) {
    next(err);
  }
};

const updatePatient = async (req, res, next) => {
  try {
    validate(req);
    const { id } = req.params;
    const { fullName, phone, email, isActive } = req.body;

    const sets = [];
    const params = [];
    if (fullName !== undefined) { params.push(fullName.trim()); sets.push(`full_name = $${params.length}`); }
    if (phone !== undefined) {
      const normalized = normalizePhone(phone);
      if (!isValidAlgerianPhone(normalized)) throw new HttpError(400, 'Numéro de téléphone invalide');
      params.push(normalized); sets.push(`phone = $${params.length}`);
    }
    if (email !== undefined) { params.push(email?.trim() || null); sets.push(`email = $${params.length}`); }
    if (isActive !== undefined) { params.push(Boolean(isActive)); sets.push(`is_active = $${params.length}`); }

    if (sets.length === 0) throw new HttpError(400, 'Aucun champ à mettre à jour');

    params.push(id);
    const sql = `UPDATE users SET ${sets.join(', ')} WHERE id = $${params.length} AND role = 'patient'
                 RETURNING id, full_name, phone, email, is_active, updated_at`;
    const result = await query(sql, params);
    if (result.rows.length === 0) throw new HttpError(404, 'Patient introuvable');
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/patients/:id/reset-password
 * Auto-sends new credentials via SMS + email.
 */
const resetPatientPassword = async (req, res, next) => {
  try {
    validate(req);
    const { id } = req.params;
    let newPassword = req.body.newPassword;
    let passwordWasGenerated = false;

    if (!newPassword) {
      newPassword = generatePassword();
      passwordWasGenerated = true;
    }

    const hash = await bcrypt.hash(newPassword, 12);
    const result = await query(
      `UPDATE users SET password_hash = $1
        WHERE id = $2 AND role = 'patient'
        RETURNING id, full_name, phone, email`,
      [hash, id]
    );
    if (result.rows.length === 0) throw new HttpError(404, 'Patient introuvable');

    const patient = result.rows[0];

    // Auto-send the new credentials
    const credentialsResult = await Promise.race([
      sendCredentials(patient, newPassword).catch(err => {
        console.error('[patient.reset-password] sendCredentials failed:', err.message);
        return { sms: null, email: null, errors: [{ type: 'all', error: err.message }] };
      }),
      new Promise(resolve => setTimeout(() => resolve({ pending: true }), 5000)),
    ]);

    res.json({
      patient,
      generatedPassword: passwordWasGenerated ? newPassword : null,
      credentials: credentialsResult,
      message: 'Mot de passe réinitialisé',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllPatients,
  createPatient,
  getPatientById,
  updatePatient,
  resetPatientPassword,
};

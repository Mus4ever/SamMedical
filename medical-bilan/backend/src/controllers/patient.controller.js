/**
 * Patient controller — admin-only endpoints to manage patients.
 *
 * Endpoints:
 *   GET    /api/patients              → list (with bilan_count, search, pagination)
 *   POST   /api/patients              → create
 *   GET    /api/patients/:id          → patient + their bilans
 *   PUT    /api/patients/:id          → update info (or deactivate via isActive=false)
 *   POST   /api/patients/:id/reset-password → admin force-resets a patient password
 *
 * No DELETE — patients are deactivated, not deleted, to keep audit history intact.
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { query } = require('../config/db');
const { HttpError } = require('../middleware/errorHandler');
const { normalizePhone, isValidAlgerianPhone } = require('../utils/phone');

const validate = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError(400, 'Données invalides', errors.array());
  }
};

/**
 * GET /api/patients
 * Query params:
 *   ?search=foo  → matches against full_name OR phone
 *   ?limit=20    → page size (default 50, max 200)
 *   ?offset=0    → skip N rows
 *   ?active=true → filter by is_active
 */
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
          SELECT patient_id,
                 COUNT(*)         AS bilan_count,
                 MAX(created_at)  AS last_bilan_at
            FROM bilans
           GROUP BY patient_id
        ) b ON b.patient_id = u.id
       WHERE ${where.join(' AND ')}
       ORDER BY u.created_at DESC
       LIMIT ${limitParam} OFFSET ${offsetParam}
    `;

    const result = await query(sql, params);

    // Also return total count (for pagination UI)
    const countParams = params.slice(0, params.length - 2); // strip limit + offset
    const countSql = `
      SELECT COUNT(*)::int AS total
        FROM users u
       WHERE ${where.join(' AND ')}
    `;
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
 * Body: { fullName, phone, email?, password }
 * If `password` is not provided, generate a random 8-char one and return it
 * in the response so the admin can communicate it to the patient.
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
      // Generate a memorable-but-random 8-char password (letters + digits)
      password = crypto.randomBytes(6).toString('base64').replace(/[+/=]/g, '').slice(0, 8);
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
    res.status(201).json({
      patient,
      // ⚠️  The plaintext password is returned ONCE — only on create.
      //     Frontend should display it prominently (modal "give this to the patient").
      generatedPassword: passwordWasGenerated ? password : null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/patients/:id  → patient details + their bilans + recent notifs
 */
const getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const userResult = await query(
      `SELECT id, full_name, phone, email, is_active, created_at, updated_at
         FROM users
        WHERE id = $1 AND role = 'patient'`,
      [id]
    );
    if (userResult.rows.length === 0) {
      throw new HttpError(404, 'Patient introuvable');
    }

    const bilansResult = await query(
      `SELECT id, title, description, status,
              file_name, file_size,
              notification_sent, notification_sent_at,
              notification_call_status, notification_sms_status, notification_email_status,
              created_at, updated_at
         FROM bilans
        WHERE patient_id = $1
        ORDER BY created_at DESC`,
      [id]
    );

    res.json({
      ...userResult.rows[0],
      bilans: bilansResult.rows,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/patients/:id
 * Body: { fullName?, phone?, email?, isActive? }
 * Partial update — any subset of fields. Phone is normalized + validated.
 */
const updatePatient = async (req, res, next) => {
  try {
    validate(req);
    const { id } = req.params;
    const { fullName, phone, email, isActive } = req.body;

    // Build dynamic SET clause
    const sets = [];
    const params = [];

    if (fullName !== undefined) {
      params.push(fullName.trim());
      sets.push(`full_name = $${params.length}`);
    }
    if (phone !== undefined) {
      const normalized = normalizePhone(phone);
      if (!isValidAlgerianPhone(normalized)) {
        throw new HttpError(400, 'Numéro de téléphone invalide');
      }
      params.push(normalized);
      sets.push(`phone = $${params.length}`);
    }
    if (email !== undefined) {
      params.push(email?.trim() || null);
      sets.push(`email = $${params.length}`);
    }
    if (isActive !== undefined) {
      params.push(Boolean(isActive));
      sets.push(`is_active = $${params.length}`);
    }

    if (sets.length === 0) {
      throw new HttpError(400, 'Aucun champ à mettre à jour');
    }

    params.push(id);
    const sql = `
      UPDATE users
         SET ${sets.join(', ')}
       WHERE id = $${params.length} AND role = 'patient'
       RETURNING id, full_name, phone, email, is_active, updated_at
    `;

    const result = await query(sql, params);
    if (result.rows.length === 0) {
      throw new HttpError(404, 'Patient introuvable');
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/patients/:id/reset-password
 * Body: { newPassword? }   ← if omitted, generate one and return it
 * Admin can reset a patient password (the patient forgot, etc.).
 */
const resetPatientPassword = async (req, res, next) => {
  try {
    validate(req);
    const { id } = req.params;
    let newPassword = req.body.newPassword;
    let passwordWasGenerated = false;

    if (!newPassword) {
      newPassword = crypto.randomBytes(6).toString('base64').replace(/[+/=]/g, '').slice(0, 8);
      passwordWasGenerated = true;
    }

    const hash = await bcrypt.hash(newPassword, 12);

    const result = await query(
      `UPDATE users
          SET password_hash = $1
        WHERE id = $2 AND role = 'patient'
        RETURNING id, full_name, phone`,
      [hash, id]
    );
    if (result.rows.length === 0) {
      throw new HttpError(404, 'Patient introuvable');
    }

    res.json({
      patient: result.rows[0],
      generatedPassword: passwordWasGenerated ? newPassword : null,
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

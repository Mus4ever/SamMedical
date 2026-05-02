/**
 * Bilan controller — upload, list, download, mark-ready, delete.
 *
 * Endpoints:
 *   POST   /api/bilans              → admin uploads a PDF for a patient
 *   GET    /api/bilans              → admin lists all bilans (with patient info)
 *   GET    /api/bilans/my           → patient lists their own bilans
 *   GET    /api/bilans/:id/download → signed URL to view/download the PDF
 *   PATCH  /api/bilans/:id/ready    → admin marks a bilan as ready + triggers notifications
 *   DELETE /api/bilans/:id          → admin deletes bilan from storage + DB
 */

const { validationResult } = require('express-validator');
const { query } = require('../config/db');
const { HttpError } = require('../middleware/errorHandler');
const { uploadBilan: uploadToStorage, getSignedUrl, deleteBilan: deleteFromStorage } = require('../services/storage.service');
const { notifyPatient } = require('../services/notification.service');

const validate = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError(400, 'Données invalides', errors.array());
  }
};

/**
 * POST /api/bilans
 * Body (multipart): bilanFile (PDF), patientId, title, description?
 * Admin uploads a bilan PDF for a specific patient.
 */
const uploadBilan = async (req, res, next) => {
  try {
    validate(req);

    const { patientId, title, description } = req.body;
    const file = req.file;

    if (!file) {
      throw new HttpError(400, 'Fichier PDF requis');
    }

    // Verify the patient exists and is active
    const patientResult = await query(
      `SELECT id, full_name FROM users WHERE id = $1 AND role = 'patient' AND is_active = true`,
      [patientId]
    );
    if (patientResult.rows.length === 0) {
      throw new HttpError(404, 'Patient introuvable ou désactivé');
    }

    // Upload PDF to Supabase Storage
    const fileKey = await uploadToStorage(file.path, file.originalname, patientId);

    // Save bilan record in DB
    const bilanResult = await query(
      `INSERT INTO bilans (patient_id, uploaded_by, title, description, file_key, file_name, file_size, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
      [patientId, req.user.id, title.trim(), description?.trim() || null, fileKey, file.originalname, file.size]
    );

    res.status(201).json({
      bilan: bilanResult.rows[0],
      message: 'Bilan uploadé avec succès',
    });
  } catch (err) {
    // If multer saved a temp file and something went wrong, clean it up
    if (req.file?.path) {
      try { require('fs').unlinkSync(req.file.path); } catch (_) { /* ignore */ }
    }
    next(err);
  }
};

/**
 * GET /api/bilans
 * Admin: list all bilans with patient name/phone.
 * Query params: ?status=pending|ready|viewed  &limit=50  &offset=0  &search=...
 */
const getAllBilans = async (req, res, next) => {
  try {
    const status = req.query.status;
    const search = (req.query.search || '').trim();
    const limit  = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const where = [];
    const params = [];

    if (status && ['pending', 'ready', 'viewed'].includes(status)) {
      params.push(status);
      where.push(`b.status = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      where.push(`(u.full_name ILIKE $${params.length} OR b.title ILIKE $${params.length})`);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    params.push(limit);
    const limitParam = `$${params.length}`;
    params.push(offset);
    const offsetParam = `$${params.length}`;

    const sql = `
      SELECT b.id, b.patient_id, b.title, b.description, b.file_name, b.file_size,
             b.status, b.notification_sent, b.notification_sent_at,
             b.created_at, b.updated_at,
             u.full_name AS patient_name, u.phone AS patient_phone
        FROM bilans b
        JOIN users u ON b.patient_id = u.id
        ${whereClause}
        ORDER BY b.created_at DESC
        LIMIT ${limitParam} OFFSET ${offsetParam}
    `;

    const result = await query(sql, params);

    // Total count for pagination
    const countParams = params.slice(0, params.length - 2);
    const countSql = `
      SELECT COUNT(*)::int AS total
        FROM bilans b
        JOIN users u ON b.patient_id = u.id
        ${whereClause}
    `;
    const totalResult = await query(countSql, countParams);

    res.json({
      bilans: result.rows,
      total: totalResult.rows[0].total,
      limit,
      offset,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/bilans/my
 * Patient: list their own bilans (only ready + viewed — not pending).
 */
const getMyBilans = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, title, description, status, file_name, file_size,
              created_at, notification_sent_at
         FROM bilans
        WHERE patient_id = $1 AND status != 'pending'
        ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({ bilans: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/bilans/:id/download
 * Any authenticated user: get a signed URL to view/download the PDF.
 * - Admin can download any bilan.
 * - Patient can only download their own.
 * Logs the access and marks as "viewed" on first patient access.
 */
const getBilanDownloadUrl = async (req, res, next) => {
  try {
    validate(req);
    const { id } = req.params;

    // Admin can access any bilan; patient can only access their own
    const isAdmin = req.user.role === 'admin';
    const sql = isAdmin
      ? 'SELECT * FROM bilans WHERE id = $1'
      : `SELECT * FROM bilans WHERE id = $1 AND patient_id = $2`;
    const params = isAdmin ? [id] : [id, req.user.id];

    const result = await query(sql, params);
    if (result.rows.length === 0) {
      throw new HttpError(404, 'Bilan introuvable');
    }

    const bilan = result.rows[0];

    // Generate signed URL (15 min)
    const url = await getSignedUrl(bilan.file_key, 900);

    // Log access
    await query(
      `INSERT INTO bilan_access_logs (bilan_id, patient_id, ip_address, user_agent)
       VALUES ($1, $2, $3, $4)`,
      [id, req.user.id, req.ip, req.headers['user-agent'] || null]
    );

    // Mark as viewed on first patient access
    if (!isAdmin && bilan.status === 'ready') {
      await query(
        `UPDATE bilans SET status = 'viewed' WHERE id = $1`,
        [id]
      );
    }

    res.json({
      url,
      fileName: bilan.file_name,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/bilans/:id/ready
 * Admin: mark a bilan as ready for the patient.
 * Triggers notifications (SMS + call + email) asynchronously.
 */
const markBilanReady = async (req, res, next) => {
  try {
    validate(req);
    const { id } = req.params;

    const bilanResult = await query('SELECT * FROM bilans WHERE id = $1', [id]);
    if (bilanResult.rows.length === 0) {
      throw new HttpError(404, 'Bilan introuvable');
    }

    const bilan = bilanResult.rows[0];

    if (bilan.status === 'ready' || bilan.status === 'viewed') {
      throw new HttpError(400, 'Ce bilan est déjà marqué comme prêt');
    }

    // Update status to ready
    const updated = await query(
      `UPDATE bilans SET status = 'ready' WHERE id = $1 RETURNING *`,
      [id]
    );

    // Get patient info for notifications
    const patientResult = await query(
      'SELECT id, full_name, phone, email FROM users WHERE id = $1',
      [bilan.patient_id]
    );
    const patient = patientResult.rows[0];

    // Trigger notifications async — don't block the response
    notifyPatient(updated.rows[0], patient).catch((err) => {
      console.error(`[bilan] Notification error for bilan ${id}:`, err.message);
    });

    res.json({
      bilan: updated.rows[0],
      message: 'Bilan marqué prêt, notifications en cours d\'envoi',
      patient: { name: patient.full_name, phone: patient.phone },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/bilans/:id
 * Admin: delete a bilan from Supabase Storage AND the DB.
 */
const deleteBilan = async (req, res, next) => {
  try {
    validate(req);
    const { id } = req.params;

    const result = await query('SELECT * FROM bilans WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw new HttpError(404, 'Bilan introuvable');
    }

    const bilan = result.rows[0];

    // Delete from Supabase Storage
    try {
      await deleteFromStorage(bilan.file_key);
    } catch (storageErr) {
      // Log but don't block DB deletion — file might already be gone
      console.error(`[bilan] Storage delete warning for ${bilan.file_key}:`, storageErr.message);
    }

    // Delete from DB (cascades to notification_logs and bilan_access_logs)
    await query('DELETE FROM bilans WHERE id = $1', [id]);

    res.json({ message: 'Bilan supprimé' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadBilan,
  getAllBilans,
  getMyBilans,
  getBilanDownloadUrl,
  markBilanReady,
  deleteBilan,
};

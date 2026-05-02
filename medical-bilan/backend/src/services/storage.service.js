/**
 * Supabase Storage service — upload, download (signed URL), delete PDFs.
 *
 * Uses the Supabase JS client configured in config/supabase.js.
 * All files live in the `bilans` bucket under:
 *   bilans/{patientId}/{timestamp}-{originalName}
 *
 * The bucket MUST be created first (private, no public access):
 *   Supabase Dashboard → Storage → New Bucket → "bilans" (private).
 */

const fs = require('fs');
const path = require('path');
const { getSupabase } = require('../config/supabase');
const config = require('../config/env');

/**
 * Upload a bilan PDF to Supabase Storage.
 *
 * @param {string} localFilePath  – Absolute path to the temp file (from multer)
 * @param {string} originalName   – Original filename the user uploaded
 * @param {string} patientId      – UUID of the patient this bilan belongs to
 * @returns {string} fileKey       – The storage object path (used to download/delete later)
 */
const uploadBilan = async (localFilePath, originalName, patientId) => {
  const supabase = getSupabase();
  const bucket = config.supabase.bucket;

  // Build a unique storage path: bilans/{patientId}/{timestamp}-{safeName}
  const safeName = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileKey = `${patientId}/${Date.now()}-${safeName}`;

  const fileBuffer = fs.readFileSync(localFilePath);

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileKey, fileBuffer, {
      contentType: 'application/pdf',
      // Don't allow overwriting — each upload is unique thanks to the timestamp
      upsert: false,
    });

  if (error) {
    // Clean up the temp file even on failure
    try { fs.unlinkSync(localFilePath); } catch (_) { /* ignore */ }
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  // Remove temp file from disk — it's safely in Supabase now
  try { fs.unlinkSync(localFilePath); } catch (_) { /* ignore */ }

  return fileKey;
};

/**
 * Generate a signed (time-limited) download URL for a bilan PDF.
 *
 * @param {string} fileKey    – The storage object path
 * @param {number} expiresIn  – Seconds until the URL expires (default: 900 = 15 min)
 * @returns {string} url      – Signed download URL
 */
const getSignedUrl = async (fileKey, expiresIn = 900) => {
  const supabase = getSupabase();
  const bucket = config.supabase.bucket;

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(fileKey, expiresIn);

  if (error) {
    throw new Error(`Supabase signed URL failed: ${error.message}`);
  }

  return data.signedUrl;
};

/**
 * Delete a bilan PDF from Supabase Storage.
 *
 * @param {string} fileKey – The storage object path to remove
 */
const deleteBilan = async (fileKey) => {
  const supabase = getSupabase();
  const bucket = config.supabase.bucket;

  const { error } = await supabase.storage
    .from(bucket)
    .remove([fileKey]);

  if (error) {
    throw new Error(`Supabase Storage delete failed: ${error.message}`);
  }
};

module.exports = { uploadBilan, getSignedUrl, deleteBilan };

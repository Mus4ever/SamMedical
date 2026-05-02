/**
 * Multer middleware for PDF uploads.
 *
 * - Stores temp files in ./uploads/ (cleaned up after Supabase upload).
 * - Accepts only application/pdf.
 * - Max file size: 20 MB.
 *
 * Usage in routes:
 *   const upload = require('../middleware/upload');
 *   router.post('/', upload.single('bilanFile'), handler);
 */

const multer = require('multer');
const path = require('path');
const { HttpError } = require('./errorHandler');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new HttpError(400, 'Seuls les fichiers PDF sont acceptés'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
});

module.exports = upload;

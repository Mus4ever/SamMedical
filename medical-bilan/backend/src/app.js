/**
 * Express app — configures middleware + mounts routes.
 *
 * Layered routes:
 *   Layer 2: /api/auth
 *   Layer 3: /api/patients
 *   Layer 5: /api/bilans       (bilan CRUD, uses Supabase Storage from Layer 4)
 *   Layer 6: /api/notifications (Twilio voice + SMS, Resend email)
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const config = require('./config/env');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const bilanRoutes = require('./routes/bilan.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

// --- Trust proxy (needed for correct req.ip behind Railway / Nginx) ---
app.set('trust proxy', 1);

// --- Security headers ---
app.use(helmet());

// --- CORS (locked to the frontend) ---
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

// --- Body parser ---
app.use(express.json({ limit: '1mb' }));        // small — file uploads use multer not JSON
app.use(express.urlencoded({ extended: true }));

// --- Request logging ---
if (config.isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// --- Global rate limit (looser; login route has its own stricter one) ---
app.use(
  '/api/',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    message: { message: 'Trop de requêtes, ralentissez.' },
  })
);

// --- Public static: pre-recorded audio (Twilio fetches these) ---
app.use('/audio', express.static(path.join(__dirname, '..', 'audio'), {
  fallthrough: false,
  maxAge: '1d',
}));

// --- Health check ---
app.get('/health', (req, res) => res.json({
  status: 'ok',
  env: config.nodeEnv,
  time: new Date().toISOString(),
}));

// --- API routes ---
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/bilans', bilanRoutes);
app.use('/api/notifications', notificationRoutes);

// --- 404 + error handler (must be LAST) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;

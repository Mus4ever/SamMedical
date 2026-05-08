/**
 * Express app — security-hardened.
 *
 * Layered routes:
 *   /api/auth | /api/patients | /api/bilans | /api/notifications | /api/audit-logs
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const config = require('./config/env');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes         = require('./routes/auth.routes');
const patientRoutes      = require('./routes/patient.routes');
const bilanRoutes        = require('./routes/bilan.routes');
const notificationRoutes = require('./routes/notification.routes');
const auditRoutes        = require('./routes/audit.routes');

const app = express();

app.set('trust proxy', 1);

// ─────────────────────────────────────────────
// Security headers (helmet) — production-grade
// ─────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:    ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc:     ["'self'", 'data:', 'https:'],
      mediaSrc:   ["'self'", 'https:'],   // audio MP3 from this host or signed URLs
      connectSrc: ["'self'", 'https://*.supabase.co', 'https://*.supabase.com'],
      frameSrc:   ["'self'", 'https://*.supabase.co'], // for inline PDF iframe
      objectSrc:  ["'none'"],
      baseUri:    ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,        // 1 year
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginEmbedderPolicy: false,    // would block /audio/*.mp3 fetched cross-origin by Twilio
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // same reason
}));

// Permissions-Policy (helmet doesn't set this by default in v7)
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  next();
});

// ─────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─────────────────────────────────────────────
// Body parsing
// ─────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─────────────────────────────────────────────
// Logging
// ─────────────────────────────────────────────
if (config.isDev) {
  app.use(morgan('dev'));
} else {
  // Production: more structured format
  app.use(morgan('combined'));
}

// ─────────────────────────────────────────────
// Rate limits
// ─────────────────────────────────────────────
// Global API
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de requêtes, ralentissez.' },
}));

// Stricter on bilan upload (heavy endpoint)
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,    // 1 min
  max: 10,
  message: { message: 'Trop d\'uploads, attendez une minute.' },
});
app.use('/api/bilans', (req, res, next) => {
  if (req.method === 'POST') return uploadLimiter(req, res, next);
  next();
});

// Stricter on notification triggers (no spam)
const notifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { message: 'Trop de notifications, attendez une minute.' },
});
app.use('/api/bilans', (req, res, next) => {
  if (req.method === 'PATCH' && req.path.endsWith('/ready')) return notifyLimiter(req, res, next);
  next();
});

// ─────────────────────────────────────────────
// Public static — audio
// ─────────────────────────────────────────────
app.use('/audio', express.static(path.join(__dirname, '..', 'audio'), {
  fallthrough: false,
  maxAge: '1d',
  immutable: true,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
  },
}));

// ─────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────
app.get('/health', (req, res) => res.json({
  status: 'ok',
  env: config.nodeEnv,
  time: new Date().toISOString(),
}));

// ─────────────────────────────────────────────
// API routes
// ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/bilans', bilanRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditRoutes);

// ─────────────────────────────────────────────
// 404 + error handler (LAST)
// ─────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;

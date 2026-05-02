/**
 * Environment variable loader + validator.
 *
 * - Loads .env via dotenv.
 * - Validates that REQUIRED vars exist; throws (and exits) if any are missing.
 * - Logs a warning for SOON-REQUIRED vars (used in later layers) when missing.
 * - Exports a frozen config object so the rest of the code never reads
 *   `process.env` directly (easier to mock + makes typos crash early).
 */

require('dotenv').config();

// Vars required for the server to even boot (auth + DB).
const REQUIRED = [
  'NODE_ENV',
  'PORT',
  'FRONTEND_URL',
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
];

// Vars not used yet but will be needed in later layers — warn, don't fail.
const SOON_REQUIRED = [
  'APP_PUBLIC_URL',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_BUCKET',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'CLINIC_NAME',
];

const missing = REQUIRED.filter((k) => !process.env[k] || process.env[k].trim() === '');
if (missing.length > 0) {
  console.error(`\n❌ Missing required env vars: ${missing.join(', ')}`);
  console.error('   Copy backend/.env.example to backend/.env and fill them in.\n');
  process.exit(1);
}

// JWT_SECRET sanity check — refuse to boot with a weak secret in production.
if (process.env.JWT_SECRET.length < 32) {
  console.error('\n❌ JWT_SECRET must be at least 32 characters long.');
  console.error('   Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"\n');
  process.exit(1);
}

const stillTodo = SOON_REQUIRED.filter((k) => !process.env[k] || process.env[k].trim() === '');
if (stillTodo.length > 0 && process.env.NODE_ENV !== 'test') {
  console.warn(`⚠️  Env vars not set yet (OK for now, needed by later layers): ${stillTodo.join(', ')}`);
}

const config = Object.freeze({
  nodeEnv:        process.env.NODE_ENV,
  isProd:         process.env.NODE_ENV === 'production',
  isDev:          process.env.NODE_ENV !== 'production',
  port:           parseInt(process.env.PORT, 10) || 5000,
  frontendUrl:    process.env.FRONTEND_URL,
  appPublicUrl:   process.env.APP_PUBLIC_URL || null,
  databaseUrl:    process.env.DATABASE_URL,
  jwt: {
    secret:    process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  supabase: {
    url:        process.env.SUPABASE_URL || null,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || null,
    bucket:     process.env.SUPABASE_BUCKET || 'bilans',
  },
  twilio: {
    sid:   process.env.TWILIO_ACCOUNT_SID || null,
    token: process.env.TWILIO_AUTH_TOKEN || null,
    phone: process.env.TWILIO_PHONE_NUMBER || null,
  },
  resend: {
    apiKey:    process.env.RESEND_API_KEY || null,
    fromEmail: process.env.RESEND_FROM_EMAIL || null,
  },
  clinic: {
    name:  process.env.CLINIC_NAME || 'Clinique',
    phone: process.env.CLINIC_PHONE || null,
  },
});

module.exports = config;

/**
 * PostgreSQL connection pool (Supabase-compatible).
 *
 * Notes for Supabase:
 *   - Use the "Transaction pooler" connection string (port 6543) — it's
 *     designed for serverless / many-short-connections workloads.
 *   - SSL must be enabled when connecting to Supabase from outside.
 *     `sslmode=require` is in the URL Supabase gives you, but we also
 *     pass `ssl: { rejectUnauthorized: false }` to be safe.
 */

const { Pool } = require('pg');
const config = require('./env');

const isSupabase = config.databaseUrl.includes('supabase.com')
                || config.databaseUrl.includes('supabase.co');

const pool = new Pool({
  connectionString: config.databaseUrl,
  // Supabase requires SSL; for local dev with plain localhost we don't.
  ssl: (config.isProd || isSupabase) ? { rejectUnauthorized: false } : false,
  // Reasonable defaults for a small clinic
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on('error', (err) => {
  // This fires for idle client errors — log loudly but don't crash.
  console.error('[db] Unexpected idle client error:', err.message);
});

/**
 * Convenience wrapper: pool.query but with optional logging in dev.
 * Always parameterize with $1, $2, etc.
 */
const query = async (text, params) => {
  const start = Date.now();
  const result = await pool.query(text, params);
  if (config.isDev) {
    const duration = Date.now() - start;
    if (duration > 500) {
      console.warn(`[db] SLOW query (${duration}ms): ${text.slice(0, 80)}...`);
    }
  }
  return result;
};

module.exports = { pool, query };

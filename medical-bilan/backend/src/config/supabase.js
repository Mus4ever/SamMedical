/**
 * Supabase client (server-side).
 *
 * Uses the SERVICE ROLE key — bypasses Row-Level Security.
 * NEVER expose this key to the frontend.
 *
 * The client is lazy-initialized: we only create it when first used,
 * so a missing SUPABASE_URL doesn't crash the server at boot
 * (useful for running the auth-only layers without Supabase set up yet).
 */

const { createClient } = require('@supabase/supabase-js');
const config = require('./env');

let client = null;

const getSupabase = () => {
  if (!client) {
    if (!config.supabase.url || !config.supabase.serviceKey) {
      throw new Error(
        'Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env'
      );
    }
    client = createClient(config.supabase.url, config.supabase.serviceKey, {
      auth: {
        // We don't use Supabase Auth — disable session persistence on server side.
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return client;
};

module.exports = { getSupabase };

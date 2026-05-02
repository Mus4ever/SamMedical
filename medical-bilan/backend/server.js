/**
 * Server entry point.
 *
 * - Validates env (via require side-effect of ./src/config/env).
 * - Tests DB connectivity before listening.
 * - Sets up graceful shutdown so in-flight requests aren't dropped.
 */

const config = require('./src/config/env');
const { pool } = require('./src/config/db');
const app = require('./src/app');

const start = async () => {
  try {
    // Quick DB ping — fail fast if Supabase / Postgres is unreachable.
    const ping = await pool.query('SELECT NOW() AS now');
    console.log(`✅ Database connected — server time: ${ping.rows[0].now.toISOString()}`);

    const server = app.listen(config.port, () => {
      console.log(`🚀 Medical Bilan API running on http://localhost:${config.port}`);
      console.log(`   Env: ${config.nodeEnv}  |  Frontend: ${config.frontendUrl}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n🛑 ${signal} received — shutting down...`);
      server.close(async () => {
        await pool.end();
        console.log('   Pool closed. Bye.');
        process.exit(0);
      });
      // Force-exit after 10s if something is hanging
      setTimeout(() => {
        console.error('   Forced exit after 10s timeout.');
        process.exit(1);
      }, 10_000).unref();
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));
  } catch (err) {
    console.error('\n❌ Failed to start server.');
    console.error('   Check DATABASE_URL — can the backend reach Supabase?');
    console.error('   Error:', err.message);
    process.exit(1);
  }
};

// Surface unhandled crashes loudly
process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught exception:', err);
  process.exit(1);
});

start();

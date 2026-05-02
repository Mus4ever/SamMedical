#!/usr/bin/env node
/**
 * CLI: generate a bcrypt hash for a password.
 *
 * Usage:
 *   node src/scripts/hash-password.js "MyNewPassword"
 *   npm run hash-password -- "MyNewPassword"
 *
 * Output: prints the hash (cost 12) to stdout, ready to paste into seed.sql
 * or use in a manual UPDATE statement to change the admin password.
 */

const bcrypt = require('bcrypt');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node src/scripts/hash-password.js "<password>"');
  process.exit(1);
}

if (password.length < 8) {
  console.error('❌ Password must be at least 8 characters.');
  process.exit(1);
}

bcrypt.hash(password, 12).then((hash) => {
  console.log('\nBcrypt hash (cost 12):');
  console.log(hash);
  console.log('\nTo update the admin password in Supabase, run this SQL:');
  console.log(`  UPDATE users SET password_hash = '${hash}' WHERE role = 'admin';`);
  console.log('');
}).catch((err) => {
  console.error('❌ Hash failed:', err.message);
  process.exit(1);
});

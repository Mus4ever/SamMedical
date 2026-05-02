-- ============================================================
-- Medical Bilan System — Seed data
-- Run this AFTER schema.sql.
--
-- Default admin credentials:
--   Phone:    +213770000000
--   Password: Admin@1234
--
-- ⚠️  CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN.
--
-- The bcrypt hash below was generated for "Admin@1234" with cost 12.
-- To regenerate with a different password, run:
--   node backend/src/scripts/hash-password.js "YourNewPassword"
-- and replace the hash below.
-- ============================================================

INSERT INTO users (full_name, phone, email, password_hash, role)
VALUES (
  'Dr. Admin',
  '+213770000000',
  'admin@clinique.dz',
  '$2b$12$fNyLnS8mSh9xjlV/uWYWSOleTnyiUria5ByeJYTZCYvgD5xh/qHhm',
  'admin'
)
ON CONFLICT (phone) DO NOTHING;

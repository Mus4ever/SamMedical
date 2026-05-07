-- Audit logs — admin actions tracking
-- Run this once in Supabase SQL editor

CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(50) NOT NULL,            -- e.g. 'patient.create', 'bilan.upload'
  target_type VARCHAR(50),                     -- 'patient' | 'bilan' | 'user'
  target_id   UUID,
  metadata    JSONB,                           -- extra context (ip, ua, body summary)
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user_id    ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action     ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at DESC);

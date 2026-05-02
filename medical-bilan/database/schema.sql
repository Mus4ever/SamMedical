-- ============================================================
-- Medical Bilan System — PostgreSQL schema
-- Run this once in your Supabase SQL editor (or via psql).
-- ============================================================

-- UUID generator (Supabase has this built in, but enable just in case)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS (admin + patients in one table, role-discriminated)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name       VARCHAR(255) NOT NULL,
  phone           VARCHAR(20)  UNIQUE NOT NULL,           -- Algerian format: +213XXXXXXXXX
  email           VARCHAR(255) UNIQUE,                    -- Optional (used for email notifications)
  password_hash   VARCHAR(255) NOT NULL,
  role            VARCHAR(10)  NOT NULL CHECK (role IN ('admin', 'patient')),
  is_active       BOOLEAN      DEFAULT true,
  created_at      TIMESTAMPTZ  DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- ============================================================
-- BILANS (medical analysis result PDFs)
-- ============================================================
CREATE TABLE IF NOT EXISTS bilans (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id                  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  uploaded_by                 UUID NOT NULL REFERENCES users(id),
  title                       VARCHAR(255) NOT NULL,    -- e.g. "Analyse de sang - Juin 2025"
  description                 TEXT,
  file_key                    VARCHAR(500) NOT NULL,    -- Supabase Storage object path
  file_name                   VARCHAR(255) NOT NULL,    -- Original filename
  file_size                   INTEGER,
  status                      VARCHAR(20) DEFAULT 'pending'
                              CHECK (status IN ('pending', 'ready', 'viewed')),
  notification_sent           BOOLEAN     DEFAULT false,
  notification_sent_at        TIMESTAMPTZ,
  notification_call_status    VARCHAR(50),              -- Twilio call status (queued/initiated/completed/failed)
  notification_sms_status     VARCHAR(50),              -- Twilio SMS status
  notification_email_status   VARCHAR(50),              -- Resend email status
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATION LOGS (one row per notification attempt)
-- ============================================================
CREATE TABLE IF NOT EXISTS notification_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bilan_id        UUID NOT NULL REFERENCES bilans(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES users(id),
  type            VARCHAR(20) NOT NULL CHECK (type IN ('call', 'sms', 'email')),
  status          VARCHAR(50),                          -- sent, delivered, failed, queued, initiated
  provider_id     VARCHAR(255),                         -- Twilio SID or Resend message id
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BILAN ACCESS LOGS (audit: who viewed what, when)
-- ============================================================
CREATE TABLE IF NOT EXISTS bilan_access_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bilan_id        UUID NOT NULL REFERENCES bilans(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES users(id),
  accessed_at     TIMESTAMPTZ DEFAULT NOW(),
  ip_address      VARCHAR(50),
  user_agent      TEXT
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_phone               ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role                ON users(role);
CREATE INDEX IF NOT EXISTS idx_bilans_patient_id         ON bilans(patient_id);
CREATE INDEX IF NOT EXISTS idx_bilans_status             ON bilans(status);
CREATE INDEX IF NOT EXISTS idx_bilans_created_at         ON bilans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_logs_bilan_id       ON notification_logs(bilan_id);
CREATE INDEX IF NOT EXISTS idx_notif_logs_patient_id     ON notification_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_bilan_id      ON bilan_access_logs(bilan_id);

-- ============================================================
-- TRIGGER: auto-update updated_at on users / bilans
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_users ON users;
CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_bilans ON bilans;
CREATE TRIGGER set_updated_at_bilans
  BEFORE UPDATE ON bilans
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

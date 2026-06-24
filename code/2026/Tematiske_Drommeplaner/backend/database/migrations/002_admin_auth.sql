-- Admin authentication tables

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS admin_user (
    id BIGSERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_session (
    id BIGSERIAL PRIMARY KEY,
    admin_user_id BIGINT NOT NULL REFERENCES admin_user(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_session_token_hash ON admin_session(token_hash);
CREATE INDEX IF NOT EXISTS idx_admin_session_expires_at ON admin_session(expires_at);

-- Seed: Default admin user (fou / kkfou2026)
INSERT INTO admin_user (username, password_hash, is_active) 
VALUES (
    'fou',
    crypt('kkfou2026', gen_salt('bf')),
    TRUE
)
ON CONFLICT (username) DO NOTHING;

-- Migration 005: Login utilisateur (wallet)
-- Scope MVP: identité minimale, zéro friction

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour lookup rapide par wallet
CREATE INDEX idx_users_wallet ON users(wallet_address);

-- Table pour nonces (temporaires, 5min TTL)
CREATE TABLE auth_nonces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  nonce TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_auth_nonces_wallet ON auth_nonces(wallet_address);
CREATE INDEX idx_auth_nonces_expires ON auth_nonces(expires_at);

-- Cleanup des vieux nonces (cron ou trigger)
SELECT 'Migration 005 applied: users + auth_nonces tables created' as status;

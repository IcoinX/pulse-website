-- Ajoute created_at aux tables qui en manquent
ALTER TABLE boosts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Met à jour les lignes existantes avec une date
UPDATE boosts SET created_at = NOW() WHERE created_at IS NULL;
UPDATE challenges SET created_at = NOW() WHERE created_at IS NULL;

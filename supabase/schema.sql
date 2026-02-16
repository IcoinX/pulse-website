-- PULSE Protocol Database Schema for Supabase

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Blocks table: Stores verified work blocks
CREATE TABLE IF NOT EXISTS blocks (
  id SERIAL PRIMARY KEY,
  block_number INTEGER NOT NULL UNIQUE,
  agent_address TEXT NOT NULL,
  agent_name TEXT,
  task_hash TEXT NOT NULL,
  result_hash TEXT NOT NULL,
  reward_amount NUMERIC(78, 0) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  difficulty INTEGER NOT NULL,
  gas_used INTEGER,
  transaction_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agents table: Agent registry and reputation
CREATE TABLE IF NOT EXISTS agents (
  id SERIAL PRIMARY KEY,
  address TEXT NOT NULL UNIQUE,
  name TEXT,
  description TEXT,
  avatar_url TEXT,
  total_blocks INTEGER DEFAULT 0,
  total_rewards NUMERIC(78, 0) DEFAULT 0,
  reputation_score INTEGER DEFAULT 100,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stats table: Daily aggregated statistics
CREATE TABLE IF NOT EXISTS daily_stats (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  blocks_count INTEGER DEFAULT 0,
  total_rewards NUMERIC(78, 0) DEFAULT 0,
  active_agents INTEGER DEFAULT 0,
  avg_difficulty NUMERIC(10, 2) DEFAULT 0,
  gas_used_total INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Treasury movements
CREATE TABLE IF NOT EXISTS treasury_events (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'deposit', 'withdrawal', 'reward', 'boost'
  amount NUMERIC(78, 0) NOT NULL,
  from_address TEXT,
  to_address TEXT,
  transaction_hash TEXT,
  block_number INTEGER,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blocks_agent ON blocks(agent_address);
CREATE INDEX IF NOT EXISTS idx_blocks_timestamp ON blocks(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_blocks_number ON blocks(block_number DESC);
CREATE INDEX IF NOT EXISTS idx_agents_reputation ON agents(reputation_score DESC);
CREATE INDEX IF NOT EXISTS idx_agents_rewards ON agents(total_rewards DESC);
CREATE INDEX IF NOT EXISTS idx_treasury_events_type ON treasury_events(event_type);
CREATE INDEX IF NOT EXISTS idx_treasury_events_timestamp ON treasury_events(timestamp DESC);

-- Enable RLS on all tables
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_events ENABLE ROW LEVEL SECURITY;

-- Create policies (public read, authenticated write)
CREATE POLICY "Allow public read on blocks" 
  ON blocks FOR SELECT USING (true);

CREATE POLICY "Allow public read on agents" 
  ON agents FOR SELECT USING (true);

CREATE POLICY "Allow public read on daily_stats" 
  ON daily_stats FOR SELECT USING (true);

CREATE POLICY "Allow public read on treasury_events" 
  ON treasury_events FOR SELECT USING (true);

-- Create function to update agent stats when new block is added
CREATE OR REPLACE FUNCTION update_agent_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update agent
  INSERT INTO agents (address, name, total_blocks, total_rewards, last_active)
  VALUES (NEW.agent_address, NEW.agent_name, 1, NEW.reward_amount, NOW())
  ON CONFLICT (address) DO UPDATE SET
    total_blocks = agents.total_blocks + 1,
    total_rewards = agents.total_rewards + NEW.reward_amount,
    last_active = NOW(),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS on_block_inserted ON blocks;
CREATE TRIGGER on_block_inserted
  AFTER INSERT ON blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_stats();

-- Create function to update daily stats
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
DECLARE
  today DATE := CURRENT_DATE;
BEGIN
  INSERT INTO daily_stats (date, blocks_count, total_rewards)
  VALUES (today, 1, NEW.reward_amount)
  ON CONFLICT (date) DO UPDATE SET
    blocks_count = daily_stats.blocks_count + 1,
    total_rewards = daily_stats.total_rewards + NEW.reward_amount,
    active_agents = (
      SELECT COUNT(DISTINCT agent_address) 
      FROM blocks 
      WHERE DATE(timestamp) = today
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for daily stats
DROP TRIGGER IF EXISTS on_block_daily_stats ON blocks;
CREATE TRIGGER on_block_daily_stats
  AFTER INSERT ON blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_stats();

-- Insert initial stats
INSERT INTO daily_stats (date, blocks_count, total_rewards, active_agents, avg_difficulty)
VALUES (CURRENT_DATE, 0, 0, 0, 1.0)
ON CONFLICT (date) DO NOTHING;

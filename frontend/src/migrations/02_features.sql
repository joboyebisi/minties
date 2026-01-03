-- Money Boxes
CREATE TABLE IF NOT EXISTS money_boxes (
  id TEXT PRIMARY KEY, -- Using generated ID or OnChain ID
  owner TEXT NOT NULL,
  title TEXT NOT NULL,
  target_amount DECIMAL NOT NULL,
  progress DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Savings Circles
CREATE TABLE IF NOT EXISTS savings_circles (
  id TEXT PRIMARY KEY, -- OnChain ID (bytes32 hex)
  name TEXT NOT NULL,
  target_amount DECIMAL NOT NULL,
  participants_count INTEGER DEFAULT 1,
  creator TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Gifts
CREATE TABLE IF NOT EXISTS gifts (
  id TEXT PRIMARY KEY, -- OnChain ID
  sender TEXT NOT NULL,
  recipient_name TEXT,
  amount DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, claimed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE money_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for demo (restricted by app logic)
CREATE POLICY "Public read money_boxes" ON money_boxes FOR SELECT USING (true);
CREATE POLICY "Public insert money_boxes" ON money_boxes FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read savings_circles" ON savings_circles FOR SELECT USING (true);
CREATE POLICY "Public insert savings_circles" ON savings_circles FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read gifts" ON gifts FOR SELECT USING (true);
CREATE POLICY "Public insert gifts" ON gifts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update gifts" ON gifts FOR UPDATE USING (true);

-- Contacts (Synced from Telegram)
CREATE TABLE IF NOT EXISTS contacts (
    telegram_user_id BIGINT PRIMARY KEY,
    phone_number TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    wallet_address TEXT, -- Optional linkage
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read contacts" ON contacts FOR SELECT USING (true);
CREATE POLICY "Public insert contacts" ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update contacts" ON contacts FOR UPDATE USING (true);

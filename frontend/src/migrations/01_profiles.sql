-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  display_name TEXT,
  telegram_user_id BIGINT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to read profiles (needed for social features)
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING ( true );

-- Allow users to insert/update their own profile based on wallet address (Conceptual - Supabase usually uses auth.uid())
-- Since we are using Wallet Address as ID, we need to trust the backend or implement signature verification.
-- For now, allow public insert/update if you are using the service role key in backend.
-- If using client-side directly, you'd strictly need Supabase Auth with Wallet Login.
-- Assuming client-side anonymous for this demo/hackathon scope:
CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK ( true );

CREATE POLICY "Users can update their own profile."
  ON profiles FOR UPDATE
  USING ( true );

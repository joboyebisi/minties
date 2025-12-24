-- Row Level Security (RLS) Policies for Minties
-- Run this in your Supabase SQL editor after schema.sql and rpc.sql

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transfers ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid()::text = id::text OR telegram_user_id::text = current_setting('app.telegram_user_id', true));

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid()::text = id::text OR telegram_user_id::text = current_setting('app.telegram_user_id', true));

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid()::text = id::text OR telegram_user_id::text = current_setting('app.telegram_user_id', true));

-- Public read for leaderboard (limited fields)
CREATE POLICY "Public can view leaderboard"
  ON user_profiles FOR SELECT
  USING (true);

-- Gamification Events Policies
-- Users can view their own events
CREATE POLICY "Users can view own events"
  ON gamification_events FOR SELECT
  USING (auth.uid()::text = user_id::text OR user_id IN (
    SELECT id FROM user_profiles WHERE telegram_user_id::text = current_setting('app.telegram_user_id', true)
  ));

-- Service role can insert events (for backend)
CREATE POLICY "Service can insert events"
  ON gamification_events FOR INSERT
  WITH CHECK (true);

-- Badges Policies
-- Users can view their own badges
CREATE POLICY "Users can view own badges"
  ON badges FOR SELECT
  USING (auth.uid()::text = user_id::text OR user_id IN (
    SELECT id FROM user_profiles WHERE telegram_user_id::text = current_setting('app.telegram_user_id', true)
  ));

-- Public can view badges (for leaderboards)
CREATE POLICY "Public can view badges"
  ON badges FOR SELECT
  USING (true);

-- Service role can insert badges
CREATE POLICY "Service can insert badges"
  ON badges FOR INSERT
  WITH CHECK (true);

-- Savings Goals Policies
-- Users can view their own savings goals
CREATE POLICY "Users can view own savings goals"
  ON savings_goals FOR SELECT
  USING (auth.uid()::text = user_id::text OR user_id IN (
    SELECT id FROM user_profiles WHERE telegram_user_id::text = current_setting('app.telegram_user_id', true)
  ));

-- Users can insert their own savings goals
CREATE POLICY "Users can insert own savings goals"
  ON savings_goals FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text OR user_id IN (
    SELECT id FROM user_profiles WHERE telegram_user_id::text = current_setting('app.telegram_user_id', true)
  ));

-- Users can update their own savings goals
CREATE POLICY "Users can update own savings goals"
  ON savings_goals FOR UPDATE
  USING (auth.uid()::text = user_id::text OR user_id IN (
    SELECT id FROM user_profiles WHERE telegram_user_id::text = current_setting('app.telegram_user_id', true)
  ));

-- Savings Circles Policies
-- Users can view circles they're members of
CREATE POLICY "Users can view circles they're in"
  ON savings_circles FOR SELECT
  USING (
    creator_id IN (
      SELECT id FROM user_profiles 
      WHERE telegram_user_id::text = current_setting('app.telegram_user_id', true)
         OR id::text = auth.uid()::text
    )
    OR circle_id IN (
      SELECT circle_id FROM circle_members 
      WHERE user_id IN (
        SELECT id FROM user_profiles 
        WHERE telegram_user_id::text = current_setting('app.telegram_user_id', true)
           OR id::text = auth.uid()::text
      )
    )
  );

-- Creators can insert circles
CREATE POLICY "Creators can insert circles"
  ON savings_circles FOR INSERT
  WITH CHECK (creator_id IN (
    SELECT id FROM user_profiles 
    WHERE telegram_user_id::text = current_setting('app.telegram_user_id', true)
       OR id::text = auth.uid()::text
  ));

-- Creators can update their circles
CREATE POLICY "Creators can update own circles"
  ON savings_circles FOR UPDATE
  USING (creator_id IN (
    SELECT id FROM user_profiles 
    WHERE telegram_user_id::text = current_setting('app.telegram_user_id', true)
       OR id::text = auth.uid()::text
  ));

-- Circle Members Policies
-- Users can view members of circles they're in
CREATE POLICY "Users can view circle members"
  ON circle_members FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE telegram_user_id::text = current_setting('app.telegram_user_id', true)
         OR id::text = auth.uid()::text
    )
    OR circle_id IN (
      SELECT circle_id FROM circle_members 
      WHERE user_id IN (
        SELECT id FROM user_profiles 
        WHERE telegram_user_id::text = current_setting('app.telegram_user_id', true)
           OR id::text = auth.uid()::text
      )
    )
  );

-- Users can join circles
CREATE POLICY "Users can join circles"
  ON circle_members FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM user_profiles 
    WHERE telegram_user_id::text = current_setting('app.telegram_user_id', true)
       OR id::text = auth.uid()::text
  ));

-- Gifts Policies
-- Users can view gifts they sent or received
CREATE POLICY "Users can view own gifts"
  ON gifts FOR SELECT
  USING (
    sender_id IN (
      SELECT id FROM user_profiles 
      WHERE telegram_user_id::text = current_setting('app.telegram_user_id', true)
         OR id::text = auth.uid()::text
    )
    OR recipient_id IN (
      SELECT id FROM user_profiles 
      WHERE telegram_user_id::text = current_setting('app.telegram_user_id', true)
         OR id::text = auth.uid()::text
    )
    OR gift_link = current_setting('app.gift_link', true)
  );

-- Users can insert gifts they send
CREATE POLICY "Users can send gifts"
  ON gifts FOR INSERT
  WITH CHECK (sender_id IN (
    SELECT id FROM user_profiles 
    WHERE telegram_user_id::text = current_setting('app.telegram_user_id', true)
       OR id::text = auth.uid()::text
  ));

-- Users can update gifts they sent (to mark as claimed)
CREATE POLICY "Users can update own gifts"
  ON gifts FOR UPDATE
  USING (
    sender_id IN (
      SELECT id FROM user_profiles 
      WHERE telegram_user_id::text = current_setting('app.telegram_user_id', true)
         OR id::text = auth.uid()::text
    )
    OR gift_link = current_setting('app.gift_link', true)
  );

-- Invites Policies
-- Users can view invites they created
CREATE POLICY "Users can view own invites"
  ON invites FOR SELECT
  USING (inviter_id IN (
    SELECT id FROM user_profiles 
    WHERE telegram_user_id::text = current_setting('app.telegram_user_id', true)
       OR id::text = auth.uid()::text
  ) OR invite_code = current_setting('app.invite_code', true));

-- Users can create invites
CREATE POLICY "Users can create invites"
  ON invites FOR INSERT
  WITH CHECK (inviter_id IN (
    SELECT id FROM user_profiles 
    WHERE telegram_user_id::text = current_setting('app.telegram_user_id', true)
       OR id::text = auth.uid()::text
  ));

-- Users can update invites they created (to mark as used)
CREATE POLICY "Users can update own invites"
  ON invites FOR UPDATE
  USING (inviter_id IN (
    SELECT id FROM user_profiles 
    WHERE telegram_user_id::text = current_setting('app.telegram_user_id', true)
       OR id::text = auth.uid()::text
  ) OR invite_code = current_setting('app.invite_code', true));

-- Recurring Transfers Policies
-- Users can view their own recurring transfers
CREATE POLICY "Users can view own recurring transfers"
  ON recurring_transfers FOR SELECT
  USING (user_id IN (
    SELECT id FROM user_profiles 
    WHERE telegram_user_id::text = current_setting('app.telegram_user_id', true)
       OR id::text = auth.uid()::text
  ));

-- Users can create recurring transfers
CREATE POLICY "Users can create recurring transfers"
  ON recurring_transfers FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM user_profiles 
    WHERE telegram_user_id::text = current_setting('app.telegram_user_id', true)
       OR id::text = auth.uid()::text
  ));

-- Users can update their recurring transfers
CREATE POLICY "Users can update own recurring transfers"
  ON recurring_transfers FOR UPDATE
  USING (user_id IN (
    SELECT id FROM user_profiles 
    WHERE telegram_user_id::text = current_setting('app.telegram_user_id', true)
       OR id::text = auth.uid()::text
  ));

-- Users can delete their recurring transfers
CREATE POLICY "Users can delete own recurring transfers"
  ON recurring_transfers FOR DELETE
  USING (user_id IN (
    SELECT id FROM user_profiles 
    WHERE telegram_user_id::text = current_setting('app.telegram_user_id', true)
       OR id::text = auth.uid()::text
  ));

-- Note: For Telegram Mini App authentication, you'll need to set the app.telegram_user_id
-- setting in your backend when making Supabase queries. Example:
-- SET app.telegram_user_id = '123456789';
-- This is handled in your backend code when using the service_role key.


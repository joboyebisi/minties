-- Supabase RPC Functions
-- Run this in your Supabase SQL editor after schema.sql

-- Function to increment user points
CREATE OR REPLACE FUNCTION increment_points(user_id_param UUID, points_param INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET points = points + points_param,
      updated_at = NOW()
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(limit_param INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  telegram_user_id BIGINT,
  points INTEGER,
  level INTEGER,
  streak_days INTEGER,
  rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.telegram_user_id,
    up.points,
    up.level,
    up.streak_days,
    ROW_NUMBER() OVER (ORDER BY up.points DESC, up.streak_days DESC) as rank
  FROM user_profiles up
  ORDER BY up.points DESC, up.streak_days DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats(user_id_param UUID)
RETURNS TABLE (
  total_points INTEGER,
  total_badges INTEGER,
  total_savings_goals INTEGER,
  total_circles_created INTEGER,
  total_gifts_sent INTEGER,
  total_gifts_claimed INTEGER,
  current_streak INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.points as total_points,
    (SELECT COUNT(*)::INTEGER FROM badges WHERE user_id = user_id_param) as total_badges,
    (SELECT COUNT(*)::INTEGER FROM savings_goals WHERE user_id = user_id_param) as total_savings_goals,
    (SELECT COUNT(*)::INTEGER FROM savings_circles WHERE creator_id = user_id_param) as total_circles_created,
    (SELECT COUNT(*)::INTEGER FROM gifts WHERE sender_id = user_id_param) as total_gifts_sent,
    (SELECT COUNT(*)::INTEGER FROM gifts WHERE recipient_id = user_id_param AND status = 'claimed') as total_gifts_claimed,
    up.streak_days as current_streak
  FROM user_profiles up
  WHERE up.id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active recurring transfers that need execution
CREATE OR REPLACE FUNCTION get_due_recurring_transfers()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  recipient_address TEXT,
  amount DECIMAL(18, 6),
  frequency TEXT,
  delegation_signature TEXT,
  next_transfer_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rt.id,
    rt.user_id,
    rt.recipient_address,
    rt.amount,
    rt.frequency,
    rt.delegation_signature,
    rt.next_transfer_at
  FROM recurring_transfers rt
  WHERE rt.status = 'active'
    AND rt.next_transfer_at <= NOW()
  ORDER BY rt.next_transfer_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update next transfer time after execution
CREATE OR REPLACE FUNCTION update_next_transfer_time(
  transfer_id_param UUID,
  new_next_transfer_at TIMESTAMPTZ
)
RETURNS void AS $$
BEGIN
  UPDATE recurring_transfers
  SET next_transfer_at = new_next_transfer_at,
      updated_at = NOW()
  WHERE id = transfer_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


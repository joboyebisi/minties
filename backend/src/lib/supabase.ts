import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase credentials not configured. Backend features may not work.');
}

export const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Database types (same as frontend)
export interface UserProfile {
  id: string;
  telegram_user_id?: number;
  wallet_address?: string;
  smart_account_address?: string;
  points: number;
  level: number;
  streak_days: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

export interface GamificationEvent {
  id: string;
  user_id: string;
  event_type: 'savings_goal' | 'circle_contribution' | 'gift_sent' | 'gift_claimed' | 'invite' | 'streak' | 'milestone';
  points_earned: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Badge {
  id: string;
  user_id: string;
  badge_type: 'first_save' | 'circle_creator' | 'gift_giver' | 'streak_7' | 'streak_30' | 'milestone_1000' | 'invite_5' | 'yield_earner';
  earned_at: string;
}


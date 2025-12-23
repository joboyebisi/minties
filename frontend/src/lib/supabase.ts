import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Some features may not work.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database types
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

export interface SavingsGoal {
  id: string;
  user_id: string;
  target_amount: number;
  current_amount: number;
  months: number;
  apy: number;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  completed_at?: string;
}

export interface CircleMember {
  circle_id: string;
  user_id: string;
  contribution_amount: number;
  joined_at: string;
}

export interface GiftRecord {
  id: string;
  sender_id: string;
  recipient_id?: string;
  amount: number;
  type: 'one_time' | 'recurring';
  status: 'pending' | 'claimed' | 'expired';
  gift_link: string;
  claimed_at?: string;
  created_at: string;
}


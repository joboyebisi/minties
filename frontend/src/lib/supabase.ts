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
  display_name?: string; // Added display_name
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

export async function getProfile(walletAddress: string): Promise<UserProfile | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export async function updateProfile(walletAddress: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        wallet_address: walletAddress,
        ...updates,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
}

// --- Features Persistence ---

export async function saveMoneyBox(box: any) {
  if (!supabase) return null;
  const { error } = await supabase.from('money_boxes').insert(box);
  if (error) console.error("Error saving money box:", error);
  return !error;
}

export async function getUserMoneyBoxes(address: string) {
  if (!supabase) return [];
  const { data } = await supabase.from('money_boxes').select('*').eq('owner', address);
  return data || [];
}

export async function saveCircle(circle: any) {
  if (!supabase) return null;
  const { error } = await supabase.from('savings_circles').insert(circle);
  if (error) console.error("Error saving circle:", error);
  return !error;
}

export async function getCircles() {
  if (!supabase) return [];
  const { data } = await supabase.from('savings_circles').select('*');
  return data || [];
}

export async function saveGift(gift: any) {
  if (!supabase) return null;
  const { error } = await supabase.from('gifts').insert(gift);
  if (error) console.error("Error saving gift:", error);
  return !error;
}

export async function getUserGifts(address: string) {
  if (!supabase) return [];
  const { data } = await supabase.from('gifts').select('*').eq('sender_id', address); // Using sender_id based on schema likely, or just 'sender' if loose. Schema in 1463 says 'sender_id'.
  return data || [];
}

// --- Notifications ---

export interface Notification {
  id: string;
  user_id: string;
  type: 'deposit' | 'yield' | 'gift_sent' | 'gift_claimed' | 'circle_invite' | 'system';
  message: string;
  read: boolean;
  created_at: string;
}

export async function createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'read'>) {
  if (!supabase) return null;
  const { error } = await supabase.from('notifications').insert(notification);
  if (error) console.error("Error creating notification:", error);
  return !error;
}

export async function getNotifications(userId: string) {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data as Notification[];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function markNotificationRead(id: string) {
  if (!supabase) return null;
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);
  return !error;
}

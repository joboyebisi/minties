import { supabase, type UserProfile, type GamificationEvent, type Badge as BadgeType } from './supabase';

// Re-export types (using alias to avoid duplicate)
export type Badge = BadgeType;
export type { UserProfile, GamificationEvent };

// Points system
export const POINTS = {
  SAVINGS_GOAL_CREATED: 50,
  SAVINGS_GOAL_COMPLETED: 200,
  CIRCLE_CREATED: 100,
  CIRCLE_CONTRIBUTION: 25,
  GIFT_SENT: 30,
  GIFT_CLAIMED: 20,
  INVITE_ACCEPTED: 50,
  STREAK_DAY: 10,
  MILESTONE_1000: 500,
  MILESTONE_5000: 1000,
  MILESTONE_10000: 2500,
};

// Badge requirements
export const BADGE_REQUIREMENTS = {
  first_save: { points: 50, description: 'First Save' },
  circle_creator: { points: 100, description: 'Circle Creator' },
  gift_giver: { points: 30, description: 'Gift Giver' },
  streak_7: { days: 7, description: '7-Day Streak' },
  streak_30: { days: 30, description: '30-Day Streak' },
  milestone_1000: { points: 1000, description: '1K Points' },
  invite_5: { invites: 5, description: 'Invite Master' },
  yield_earner: { yield: 1, description: 'Yield Earner' },
};

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  return data;
}

export async function getOrCreateUserProfile(
  telegramUserId?: number,
  walletAddress?: string
): Promise<UserProfile | null> {
  if (!supabase) return null;

  // Try to find existing user
  let query = supabase.from('user_profiles').select('*');
  if (telegramUserId) {
    query = query.eq('telegram_user_id', telegramUserId);
  } else if (walletAddress) {
    query = query.eq('wallet_address', walletAddress.toLowerCase());
  } else {
    return null;
  }

  const { data: existing } = await query.single();

  if (existing) {
    return existing;
  }

  // Create new user
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      telegram_user_id: telegramUserId,
      wallet_address: walletAddress?.toLowerCase(),
      points: 0,
      level: 1,
      streak_days: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile:', error);
    return null;
  }

  return data;
}

export async function awardPoints(
  userId: string,
  eventType: GamificationEvent['event_type'],
  points: number,
  metadata?: Record<string, any>
): Promise<boolean> {
  if (!supabase) return false;

  // Record event
  const { error: eventError } = await supabase.from('gamification_events').insert({
    user_id: userId,
    event_type: eventType,
    points_earned: points,
    metadata,
  });

  if (eventError) {
    console.error('Error recording gamification event:', eventError);
    return false;
  }

  // Update user points
  const { error: updateError } = await supabase.rpc('increment_points', {
    user_id_param: userId,
    points_param: points,
  });

  if (updateError) {
    // Fallback: manual update
    const profile = await getUserProfile(userId);
    if (profile) {
      await supabase
        .from('user_profiles')
        .update({ points: profile.points + points })
        .eq('id', userId);
    }
  }

  // Check for badges
  await checkAndAwardBadges(userId);

  return true;
}

export async function updateStreak(userId: string): Promise<number> {
  if (!supabase) return 0;

  const profile = await getUserProfile(userId);
  if (!profile) return 0;

  const lastActivity = new Date(profile.last_activity);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

  let newStreak = profile.streak_days;
  if (daysDiff === 1) {
    // Consecutive day
    newStreak += 1;
  } else if (daysDiff > 1) {
    // Streak broken
    newStreak = 1;
  }

  await supabase
    .from('user_profiles')
    .update({
      streak_days: newStreak,
      last_activity: now.toISOString(),
    })
    .eq('id', userId);

  // Award streak points
  if (newStreak > 0) {
    await awardPoints(userId, 'streak', POINTS.STREAK_DAY, { streak_days: newStreak });
  }

  return newStreak;
}

export async function checkAndAwardBadges(userId: string): Promise<void> {
  if (!supabase) return;

  const profile = await getUserProfile(userId);
  if (!profile) return;

  const badgesToCheck = [
    { type: 'first_save' as const, condition: profile.points >= 50 },
    { type: 'circle_creator' as const, condition: profile.points >= 100 },
    { type: 'gift_giver' as const, condition: profile.points >= 30 },
    { type: 'streak_7' as const, condition: profile.streak_days >= 7 },
    { type: 'streak_30' as const, condition: profile.streak_days >= 30 },
    { type: 'milestone_1000' as const, condition: profile.points >= 1000 },
    { type: 'yield_earner' as const, condition: false }, // Check separately
  ];

  for (const badge of badgesToCheck) {
    if (badge.condition) {
      // Check if already awarded
      const { data: existing } = await supabase
        .from('badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_type', badge.type)
        .single();

      if (!existing) {
        await supabase.from('badges').insert({
          user_id: userId,
          badge_type: badge.type,
        });
      }
    }
  }
}

export async function getUserBadges(userId: string): Promise<Badge[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });
  if (error) {
    console.error('Error fetching badges:', error);
    return [];
  }
  return data || [];
}

export async function createInviteCode(inviterId: string): Promise<string> {
  if (!supabase) return '';
  const inviteCode = `MINT${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  await supabase.from('invites').insert({
    inviter_id: inviterId,
    invite_code: inviteCode,
  });
  return inviteCode;
}

export async function useInviteCode(inviteCode: string, inviteeTelegramId: number): Promise<boolean> {
  if (!supabase) return false;

  const { data: invite, error } = await supabase
    .from('invites')
    .select('*')
    .eq('invite_code', inviteCode)
    .eq('used', false)
    .single();

  if (error || !invite) return false;

  // Mark as used
  await supabase
    .from('invites')
    .update({ used: true, used_at: new Date().toISOString(), invitee_telegram_id: inviteeTelegramId })
    .eq('id', invite.id);

  // Award points to inviter
  await awardPoints(invite.inviter_id, 'invite', POINTS.INVITE_ACCEPTED, {
    invitee_telegram_id: inviteeTelegramId,
  });

  return true;
}


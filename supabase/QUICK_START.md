# Supabase Quick Start Guide

## Migration Order (IMPORTANT!)

Run these SQL files in **this exact order**:

1. ✅ `schema.sql` - Creates all tables, indexes, and triggers
2. ✅ `rpc.sql` - Creates RPC functions
3. ✅ `rls_policies.sql` - Sets up Row Level Security policies

## Quick Setup Steps

1. **Create Supabase Project** at https://supabase.com
2. **Get Credentials** from Settings → API:
   - Project URL
   - `anon` key (for frontend)
   - `service_role` key (for backend - keep secret!)
3. **Run Migrations** in SQL Editor (in order above)
4. **Set Environment Variables**:
   - Frontend: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Backend: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

## Database Tables Created

- `user_profiles` - User data, points, streaks
- `gamification_events` - Points and events log
- `badges` - User badges/achievements
- `savings_goals` - Money Box goals
- `savings_circles` - Savings circles
- `circle_members` - Circle membership
- `gifts` - One-time and recurring gifts
- `invites` - Invite codes and tracking
- `recurring_transfers` - MetaMask Advanced Permissions recurring transfers

## RPC Functions Available

- `increment_points(user_id, points)` - Award points to user
- `get_leaderboard(limit)` - Get top users by points
- `get_user_stats(user_id)` - Get comprehensive user statistics
- `get_due_recurring_transfers()` - Get transfers ready to execute
- `update_next_transfer_time(id, timestamp)` - Update transfer schedule

## Security Notes

- **RLS Enabled**: All tables have Row Level Security
- **Service Role**: Only use in backend (bypasses RLS)
- **Anon Key**: Safe for frontend (respects RLS policies)
- **Telegram Auth**: Backend sets `app.telegram_user_id` for RLS context

## Troubleshooting

- **"relation does not exist"**: Run `schema.sql` first
- **"function does not exist"**: Run `rpc.sql` after schema
- **RLS blocking queries**: Run `rls_policies.sql` and check policies
- **Connection issues**: Verify URL has no trailing slash, keys are correct

For detailed setup, see `SUPABASE_SETUP.md`


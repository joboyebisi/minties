# Supabase Database Setup Files

This directory contains all SQL migration files needed to set up the Minties Supabase database.

## Files Overview

### 1. `schema.sql` ⭐ **RUN FIRST**
- Creates all database tables
- Sets up indexes for performance
- Creates triggers for `updated_at` timestamps
- **Run this first** before any other migrations

### 2. `rpc.sql` ⭐ **RUN SECOND**
- Creates PostgreSQL functions (RPCs) for:
  - Point management (`increment_points`)
  - Leaderboards (`get_leaderboard`)
  - User statistics (`get_user_stats`)
  - Recurring transfer management (`get_due_recurring_transfers`, `update_next_transfer_time`)
- **Run this after** `schema.sql`

### 3. `rls_policies.sql` ⭐ **RUN THIRD**
- Enables Row Level Security (RLS) on all tables
- Creates security policies for:
  - Users can only access their own data
  - Public read access for leaderboards
  - Service role can insert/update (for backend)
- **Run this last** after schema and RPC functions

### 4. `../SUPABASE_SETUP.md`
- Complete setup guide with step-by-step instructions
- Environment variable configuration
- Security best practices

## Migration Order

```bash
1. schema.sql       → Creates tables and structure
2. rpc.sql          → Creates functions
3. rls_policies.sql → Sets up security
```

## How to Run

1. Open Supabase Dashboard → **SQL Editor**
2. Click **"New query"**
3. Copy/paste the contents of each file (in order)
4. Click **"Run"** (or `Ctrl+Enter`)
5. Verify success message

## Database Schema

### Core Tables
- `user_profiles` - User accounts, points, streaks
- `gamification_events` - Event log for points/badges
- `badges` - User achievements

### Savings Features
- `savings_goals` - Money Box goals
- `savings_circles` - Group savings circles
- `circle_members` - Circle membership tracking

### Gifts & Invites
- `gifts` - One-time and recurring gifts
- `invites` - Invite code system
- `recurring_transfers` - MetaMask Advanced Permissions

## Security

- **RLS Enabled**: All tables protected by Row Level Security
- **Policies**: Users can only access their own data
- **Service Role**: Backend uses service_role key (bypasses RLS)
- **Anon Key**: Frontend uses anon key (respects RLS)

## Support

If you encounter issues:
1. Check migration order (schema → rpc → rls)
2. Verify all tables exist in **Table Editor**
3. Check **Database** → **Functions** for RPC functions
4. Review **Authentication** → **Policies** for RLS
5. Check Supabase logs: **Logs** → **Postgres Logs**


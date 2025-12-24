# Supabase Setup Guide for Minties

This guide will walk you through setting up Supabase for the Minties application, including database schema, RPC functions, Row Level Security (RLS) policies, and environment variables.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A new Supabase project created

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `minties` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development
4. Click **"Create new project"** and wait ~2 minutes for setup

## Step 2: Get Your Supabase Credentials

Once your project is ready:

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values (you'll need them later):
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - **Keep this secret!**

## Step 3: Run Database Migrations

**Important**: Run these migrations in order:

### 3.1 Run Schema Migration (First)

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click **"Run"** (or press `Ctrl+Enter`)
5. Verify success: You should see "Success. No rows returned"
6. **Wait for completion** before proceeding

### 3.2 Run RPC Functions Migration (Second)

1. Still in **SQL Editor**, click **"New query"**
2. Copy and paste the entire contents of `supabase/rpc.sql`
3. Click **"Run"**
4. Verify success: You should see "Success. No rows returned"

### 3.3 Set Up Row Level Security (RLS) (Third)

1. Still in **SQL Editor**, click **"New query"**
2. Copy and paste the entire contents of `supabase/rls_policies.sql`
3. Click **"Run"**
4. Verify success: You should see "Success. No rows returned"

## Step 4: Verify Tables Were Created

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - `user_profiles`
   - `gamification_events`
   - `badges`
   - `savings_goals`
   - `savings_circles`
   - `circle_members`
   - `gifts`
   - `invites`
   - `recurring_transfers`

## Step 5: Set Up Environment Variables

### For Frontend (Vercel)

Add these to your Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (anon/public key)
```

### For Backend (Railway)

Add these to your Railway project settings:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (service_role key - keep secret!)
```

⚠️ **Important**: Never expose the `service_role` key in frontend code. It bypasses RLS and has full database access.

## Step 6: Test Connection (Optional)

You can test the connection by running this in your frontend:

```typescript
import { supabase } from './lib/supabase';

// Test query
const { data, error } = await supabase.from('user_profiles').select('count');
console.log('Supabase connection:', error ? 'Failed' : 'Success');
```

## Troubleshooting

### "relation does not exist" error
- Make sure you ran `schema.sql` first
- Check that all tables appear in **Table Editor**

### "function does not exist" error
- Make sure you ran `rpc.sql` after `schema.sql`
- Check **Database** → **Functions** in Supabase dashboard

### RLS blocking queries
- Make sure you ran `rls_policies.sql`
- Check **Authentication** → **Policies** in Supabase dashboard
- Verify you're using the correct key (anon for frontend, service_role for backend)

### Connection issues
- Verify your `SUPABASE_URL` doesn't have a trailing slash
- Check that your API keys are copied correctly (no extra spaces)
- Ensure your Supabase project is active (not paused)

## Next Steps

After Supabase is set up:
1. ✅ Set up Railway for backend deployment
2. ✅ Set up Vercel for frontend deployment
3. ✅ Configure environment variables in both platforms
4. ✅ Test end-to-end functionality

## Security Notes

- **RLS Policies**: The provided RLS policies allow users to read/write their own data. Adjust as needed for your use case.
- **Service Role Key**: Only use in backend/server-side code. Never expose to frontend.
- **Anon Key**: Safe to use in frontend, but RLS policies will restrict access.
- **API Keys**: Rotate keys periodically in **Settings** → **API** → **Regenerate**

## Support

If you encounter issues:
1. Check Supabase logs: **Logs** → **Postgres Logs**
2. Check API logs: **Logs** → **API Logs**
3. Review Supabase docs: https://supabase.com/docs

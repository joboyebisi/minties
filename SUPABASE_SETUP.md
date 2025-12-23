# Supabase Setup Guide for Minties

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: `minties` (or your choice)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development

## 2. Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Open `supabase/schema.sql` from this repo
3. Copy and paste the entire contents into the SQL Editor
4. Click **Run** (or press Ctrl+Enter)
5. Wait for success message

## 3. Run RPC Functions

1. Still in SQL Editor, open `supabase/rpc.sql`
2. Copy and paste into SQL Editor
3. Click **Run**
4. Verify functions are created (check the sidebar under "Functions")

## 4. Get API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - Keep this secret!

## 5. Set Environment Variables

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Backend (`.env`)

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 6. Enable Row Level Security (Optional but Recommended)

For production, you'll want to set up RLS policies. For now, the service role key gives full access (fine for development).

## 7. Test Connection

After setting env vars, restart your dev servers:

```bash
# Frontend
cd frontend
npm install @supabase/supabase-js
npm run dev

# Backend
cd backend
npm install @supabase/supabase-js
npm run dev
```

Check browser console and backend logs for any connection errors.

## 8. Verify Tables

In Supabase dashboard → **Table Editor**, you should see:
- `user_profiles`
- `gamification_events`
- `badges`
- `savings_goals`
- `savings_circles`
- `circle_members`
- `gifts`
- `invites`
- `recurring_transfers`

## Troubleshooting

- **"Invalid API key"**: Double-check you copied the full key (they're long)
- **"Relation does not exist"**: Make sure you ran `schema.sql` first
- **"Function does not exist"**: Make sure you ran `rpc.sql` after `schema.sql`
- **Connection timeout**: Check your network/firewall settings

## Next Steps

Once Supabase is set up:
1. Gamification will automatically track points, badges, streaks
2. User profiles will be created on first Telegram interaction
3. Invite system will work end-to-end
4. All savings goals, circles, and gifts will be stored in Supabase


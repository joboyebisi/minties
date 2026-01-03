# Telegram UI Refactor & Bot Debug Plan

## Goal
Move Telegram features from the Dashboard to a dedicated view accessible via a new Navigation Icon using the Telegram Logo. Debug the missing "Open Mini App" bot button.

## Proposed Changes

### Frontend UI
#### [MODIFY] [NavBar.tsx](file:///c:/Users/Deborah/Documents/Cursor%20Projects/Minties/frontend/src/components/NavBar.tsx)
- Change the existing Telegram link (currently `t.me/Minties_X_Bot`) to a local route `/telegram`.
- Update the icon/label if needed (already has `MessageCircle`).

#### [NEW] [page.tsx](file:///c:/Users/Deborah/Documents/Cursor%20Projects/Minties/frontend/src/app/telegram/page.tsx)
- Create a new page at `/telegram`.
- Move `TelegramFeatures` component usage here from `UserDashboard`.
- Add "Connection Status" section.
- **New**: Add "Saved Contacts" list (fetching from Supabase `contacts` table).

#### [NEW] [ContactsList.tsx](file:///c:/Users/Deborah/Documents/Cursor%20Projects/Minties/frontend/src/components/ContactsList.tsx)
- Component to display synced Telegram contacts.
- Fetch from `contacts` table using `supabase-js`.

#### [MODIFY] [UserDashboard.tsx](file:///c:/Users/Deborah/Documents/Cursor%20Projects/Minties/frontend/src/components/UserDashboard.tsx)
- Remove `TelegramFeatures` from the dashboard to declutter it.

### Backend Bot Logic
#### [MODIFY] [bot.ts](file:///c:/Users/Deborah/Documents/Cursor%20Projects/Minties/backend/src/telegram/bot.ts)
- Add logging to the `setChatMenuButton` catch block.
- **Hypothesis**: The button fails because `FRONTEND_URL` is localhost. Telegram requires HTTPS.
- **Fix**: Ensure the user knows to use a persistent public URL (e.g. Vercel) for the bot environment variable.

## Verification Plan

### Manual Verification
1.  **Nav**: Click Telegram icon in Navbar -> Should go to `/telegram`.
2.  **Page**: `/telegram` should show:
    - Connection Status (e.g. "Connected as @User").
    - Feature buttons (Share, Home Screen, etc.).
3.  **Bot Button**:
    - Check server logs after restart to see if `setChatMenuButton` threw an error.
    - User to verify on real device with Vercel URL.

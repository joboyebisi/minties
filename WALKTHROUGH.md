# Telegram Features Verification Guide

## Overview
We have implemented advanced Telegram Mini App features including Bot API 8.0 support, native sharing, and backend bot enhancements.

## 1. Frontend Features Logic
### Location
- **Types**: `frontend/src/types/telegram-web-app.d.ts` (Updated)
- **Hook**: `frontend/src/hooks/useTelegram.ts` (Updated)
- **Demo**: `frontend/src/components/TelegramFeatures.tsx` (New)

### Verification Steps
1.  Open the Mini App in Telegram.
2.  On the Dashboard, scroll to the top to see the **Telegram Features** card.
3.  **Share Story**: Click the button. It should open the native Story Editor with an "Open App" widget.
4.  **Add to Home**: Click the button. It should prompt to add Minties to the home screen.
5.  **Share Contact**: Click the button. It should request contact access.

## 2. Backend Bot Logic
### Location
- **Bot Handler**: `backend/src/telegram/bot.ts` (Updated)

### Verification Steps (Bot Chat)
1.  **Menu Button**: Check the "Menu" button next to the input field. It should say "Open Minties".
2.  **Start Command**: Send `/start`. You should see a message with inline buttons:
    - 🚀 Open Minties App
    - 💰 My Moneybox
    - 🎁 Send Gift
3.  **Inline Results (Search Bar)**:
    - In any chat, type `@YourBotName ` (with a space).
    - You should see "💰 My Moneybox", "🎁 Send Gift", and "👋 Invite Friend" popping up.
    - Click one to send a rich article message.

## 3. Database Sync
- **Contact Sync**: Sharing your contact with the bot (via the attachment menu or if requested) will sync your phone number to the `contacts` table in Supabase.

## 4. Next Steps
- Deploy the updated frontend to Vercel.
- Deploy/Restart the backend server.
- Test on a real device.

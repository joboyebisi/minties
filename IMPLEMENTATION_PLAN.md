# Telegram Mini App Improvements Plan

## Goal
Enable native Telegram Mini App features including contacts request, sharing, home screen shortcuts, and haptic feedback by upgrading the integration to support Bot API 8.0+.

## User Review Required
- **Testing**: These features rely on the Telegram Native environment. Verification will require deploying to a test URL or running via a tunnel (ngrok) inside Telegram, or using the Telegram Mock/Debug tools.

## Proposed Changes

### Frontend Types
#### [MODIFY] [telegram-web-app.d.ts](file:///c:/Users/Deborah/Documents/Cursor%20Projects/Minties/frontend/src/types/telegram-web-app.d.ts)
- Add missing Bot API 8.0+ definitions:
  - `shareMessage`, `shareToStory`
  - `addToHomeScreen`, `checkHomeScreenStatus`
  - `requestContact` (ensure correct signature)
  - `HapticFeedback` (verify completeness)
  - `LocationManager`, `Accelerometer`, etc. (if relevant)

### Frontend Logic
#### [MODIFY] [useTelegram.ts](file:///c:/Users/Deborah/Documents/Cursor%20Projects/Minties/frontend/src/hooks/useTelegram.ts)
- Expose new methods:
  - `requestContact()`
  - `shareToStory(mediaUrl, params)`
  - `shareMessage(msg_id)`
  - `addToHomeScreen()`
  - `checkHomeScreenStatus()`
- Expose new state:
  - `isFullscreen`, `isActive`
  - `safeAreaInset`

### Frontend UI
#### [NEW] [TelegramFeatures.tsx](file:///c:/Users/Deborah/Documents/Cursor%20Projects/Minties/frontend/src/components/TelegramFeatures.tsx) (Optional Demo Component)
- A component to demonstrate/test these features:
  - "Share to Story" button
  - "Add to Home Screen" button
  - "Share Contact" button

#### [MODIFY] [UserDashboard.tsx](file:///c:/Users/Deborah/Documents/Cursor%20Projects/Minties/frontend/src/components/UserDashboard.tsx)
- Integrate helpful shortcuts where relevant (e.g. sharing invite link via native share).

### Backend Bot Logic
#### [MODIFY] [bot.ts](file:///c:/Users/Deborah/Documents/Cursor%20Projects/Minties/backend/src/telegram/bot.ts)
- **Menu Button**: Ensure `setChatMenuButton` is configured to launch the Web App.
- **Inline Mode**: Implement `bot.on("inline_query")` to allow users to search/share "Moneybox" or "Gift" links directly from the message bar.
- **Bot Buttons**: 
  - Update `/start` and generic keyboards to include specific "💰 My Moneybox" and "🎁 Send Gift" buttons.
  - Use rich emojis/icons for all buttons.

### Frontend UI
#### [NEW] [TelegramFeatures.tsx](file:///c:/Users/Deborah/Documents/Cursor%20Projects/Minties/frontend/src/components/TelegramFeatures.tsx) (Demo Component)
- "Share to Story", "Add to Home Screen", "Share Contact" buttons.

#### [MODIFY] [UserDashboard.tsx](file:///c:/Users/Deborah/Documents/Cursor%20Projects/Minties/frontend/src/components/UserDashboard.tsx)
- Integrate helpful shortcuts where relevant (e.g. sharing invite link via native share).

## Verification Plan

### Manual Verification
1.  **Mock Environment**: Use the [Telegram Web App emulator](https://web.telegram.org/) or browser console to mock `window.Telegram.WebApp` methods.
2.  **Deployment**: Deploy to Vercel.
3.  **Real Device**:
    - **Sharing**: Click "Share to Story" -> System sheet should open.
    - **Shortcuts**: Click "Add to Home Screen" -> Prompt should appear.
    - **Birthdays**: Add a birthday manually. Verify it saves to Supabase.
4.  **Bot Interaction**:
    - Type `@BotName` in chat -> Show "My Moneybox".
    - Check Menu Button -> "Open App".

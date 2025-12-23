# Telegram Mini App Setup Guide

## Overview

Minties now includes full Telegram Mini App support! Users can interact with the app directly within Telegram without leaving the messenger.

## Features Implemented

✅ **Telegram Web App SDK Integration**
- Full TypeScript support
- Theme detection (light/dark mode)
- User data access
- Haptic feedback

✅ **Mini App Launch from Bot**
- `/start` command shows Mini App button
- `/webapp` command to launch Mini App
- Automatic URL configuration

✅ **Data Communication**
- Send data from Mini App back to bot
- Handle gift claims and circle contributions
- Real-time notifications

✅ **UI Components**
- TelegramWrapper for theme integration
- useTelegram hook for easy access
- Main button and back button support

## Setup Instructions

### 1. Configure Frontend URL

Update `backend/.env`:
```env
FRONTEND_URL=https://your-deployed-app.vercel.app
```

For local development:
```env
FRONTEND_URL=http://localhost:3000
```

### 2. Deploy Frontend

The Mini App must be served over HTTPS. Deploy to:
- **Vercel** (recommended)
- **Netlify**
- **Any HTTPS hosting**

### 3. Configure Bot with BotFather

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/mybots`
3. Select your bot
4. Choose "Bot Settings" → "Menu Button"
5. Set the button text (e.g., "Open Minties")
6. Set the URL to your deployed frontend URL

Alternatively, use the inline keyboard button (already implemented in the bot code).

### 4. Test the Mini App

1. Start your backend: `cd backend && npm run dev`
2. Deploy or run frontend: `cd frontend && npm run dev`
3. Open Telegram and find your bot
4. Send `/start` or `/webapp`
5. Click the "Open Mini App" button

## Usage

### In Your Components

```tsx
import { useTelegram } from "@/hooks/useTelegram";

function MyComponent() {
  const { 
    isTelegram,      // Check if running in Telegram
    user,            // Telegram user data
    theme,           // "light" | "dark"
    showMainButton,  // Show main button
    hapticFeedback,  // Haptic feedback
    sendDataToBot    // Send data to bot
  } = useTelegram();

  // Show main button
  useEffect(() => {
    if (isTelegram) {
      showMainButton("Claim Gift", handleClaim);
    }
  }, [isTelegram]);

  // Send data to bot
  const handleClaim = () => {
    sendDataToBot({
      type: "gift_claimed",
      amount: "10",
      txHash: "0x..."
    });
  };
}
```

### Sending Data to Bot

The bot automatically handles data from the Mini App:

```typescript
// In Mini App
sendDataToBot({
  type: "gift_claimed",
  amount: "10",
  txHash: "0x..."
});

// Bot receives it and sends confirmation message
```

### Theme Support

The app automatically adapts to Telegram's theme:

```tsx
const { theme, themeParams } = useTelegram();

// theme: "light" | "dark"
// themeParams: { bg_color, text_color, etc. }
```

## Security

### Verifying initData

Always verify Telegram initData on the server side:

```typescript
import { verifyTelegramWebAppInitData } from "@/utils/telegramAuth";

// In your API route
const isValid = verifyTelegramWebAppInitData(
  initData,
  process.env.TELEGRAM_BOT_TOKEN!
);
```

## Testing

### Local Testing

1. Use **ngrok** or similar to expose your local server:
```bash
ngrok http 3000
```

2. Update `FRONTEND_URL` in backend `.env` to the ngrok URL

3. Test in Telegram Desktop (easier debugging)

### Production Testing

1. Deploy frontend to Vercel/Netlify
2. Update `FRONTEND_URL` in backend `.env`
3. Test on mobile Telegram app

## Troubleshooting

### Mini App not opening
- Check that URL is HTTPS
- Verify URL is accessible
- Check bot token is correct

### Theme not working
- Ensure TelegramWrapper is in layout
- Check themeParams are being read
- Verify CSS variables are set

### Data not sending to bot
- Check bot is running
- Verify web_app_data handler is registered
- Check data format is JSON

## Next Steps

- [ ] Add payment integration (Telegram Payments)
- [ ] Add location services
- [ ] Implement Cloud Storage for user data
- [ ] Add QR code scanning
- [ ] Implement sharing features

## Resources

- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Next.js Deployment](https://nextjs.org/docs/deployment)


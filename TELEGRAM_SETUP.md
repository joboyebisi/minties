# Telegram Bot Setup Guide

## Step 1: Create Bot with BotFather

1. Open Telegram
2. Search for **@BotFather**
3. Start a chat with BotFather
4. Send: `/newbot`

### Bot Creation Process

BotFather will ask:

1. **"Alright, a new bot. How are we going to call it? Please choose a name for your bot."**
   - Reply: `Minties` (or your preferred name)

2. **"Good. Now let's choose a username for your bot. It must end in `bot`. Like this, for example: TetrisBot or tetris_bot."**
   - Reply: `minties_bot` (or your preferred username)
   - Must be unique and end with `bot`

3. BotFather will respond with:
   - Your bot token (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
   - **SAVE THIS TOKEN** - you'll need it for Railway

## Step 2: Get Bot Token

1. If you already have a bot, send `/mybots` to BotFather
2. Select your bot
3. Choose **"API Token"**
4. Copy the token

## Step 3: Configure Bot Settings

### Set Bot Description

1. In BotFather, select your bot
2. Choose **"Edit Bot"** → **"Edit Description"**
3. Set description:
   ```
   Minties - Save, gift, and earn yield with friends on Telegram. 
   Create money boxes, join savings circles, and send USDC gifts.
   ```

### Set Bot About Text

1. Choose **"Edit Bot"** → **"Edit About"**
2. Set about text:
   ```
   Crypto financial app for savings, gifts, and yield earning
   ```

### Set Bot Commands

1. Choose **"Edit Bot"** → **"Edit Commands"**
2. Add commands:
   ```
   start - Start using Minties
   wallet - Connect your wallet
   moneybox - Create a money box
   circle - Create or join a savings circle
   gift - Send a gift
   invite - Get your invite link
   stats - View your stats
   help - Show help
   ```

### Set Bot Photo

1. Choose **"Edit Bot"** → **"Edit Botpic"**
2. Send your bot logo/photo

## Step 4: Configure Web App (After Vercel Deployment)

**Important**: Do this AFTER deploying to Vercel and getting your frontend URL.

1. In BotFather, select your bot
2. Choose **"Bot Settings"** → **"Menu Button"**
3. Choose **"Configure Menu Button"**
4. Set:
   - **Text**: `Open Minties` (or your preferred text)
   - **Web App URL**: `https://your-vercel-url.vercel.app`
5. Save

This creates a button in your bot that opens the Mini App.

## Step 5: Add Bot Token to Railway

1. Go to Railway dashboard
2. Open your backend service
3. Go to **"Variables"** tab
4. Add variable:
   - **Name**: `TELEGRAM_BOT_TOKEN`
   - **Value**: Your bot token from BotFather
5. Railway will auto-redeploy

## Step 6: Test Bot

1. Open Telegram
2. Search for your bot (by username, e.g., `@minties_bot`)
3. Click **"Start"** or send `/start`
4. Bot should respond with welcome message

## Step 7: Test Mini App

1. In your bot chat, look for the **"Open Minties"** button (or menu button)
2. Click it
3. Mini App should open in Telegram
4. Test wallet connection
5. Test features

## Step 8: Configure Bot Permissions (Optional)

If you want users to add the bot to groups:

1. In BotFather, select your bot
2. Choose **"Bot Settings"** → **"Group Privacy"**
3. Set to **"Disable"** (bot can see all messages in groups)
   - Or **"Enable"** (bot only sees messages when mentioned)

## Step 9: Set Up Webhook (Alternative to Polling)

**Note**: Your current setup uses polling. For production, consider webhooks:

### Webhook Setup (Optional)

1. Get your Railway backend URL
2. Set webhook:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-railway-url.up.railway.app/api/telegram/webhook"
   ```

3. Update `backend/src/index.ts` to use webhooks instead of polling:
   ```typescript
   // Remove: { polling: true }
   // Add webhook handling
   ```

**For now, polling works fine for development.**

## Troubleshooting

### Bot Not Responding
- Verify `TELEGRAM_BOT_TOKEN` is correct in Railway
- Check Railway logs for errors
- Test token: `curl https://api.telegram.org/bot<TOKEN>/getMe`
- Should return bot info if token is valid

### Mini App Not Opening
- Verify `FRONTEND_URL` in Railway matches Vercel URL exactly
- Check BotFather Menu Button URL is correct
- Ensure URL starts with `https://`
- Test URL in browser first

### "Invalid Web App URL"
- URL must be HTTPS
- URL must be publicly accessible
- Check Vercel deployment is live
- Verify no trailing slash in URL

### Bot Commands Not Working
- Verify commands are set in BotFather
- Check backend handles commands correctly
- Review Railway logs for command processing

### Polling Errors
- Check network connectivity
- Verify bot token is valid
- Check Railway logs for specific errors
- Consider switching to webhooks for production

## Bot Commands Reference

Your bot should support these commands (from `backend/src/telegram/handlers/`):

- `/start` - Welcome message and instructions
- `/wallet` - Connect wallet instructions
- `/moneybox` - Create money box
- `/circle` - Create or join circle
- `/gift` - Send gift
- `/invite` - Get invite link
- `/stats` - View user stats
- `/help` - Show help

## Security Notes

- ⚠️ **Never share your bot token publicly**
- ✅ Token is in Railway environment variables (secure)
- ✅ Token is in `.gitignore` (won't be committed)
- ✅ Rotate token if accidentally exposed

## Next Steps

After Telegram setup:
1. ✅ Test all bot commands
2. ✅ Test Mini App functionality
3. ✅ Test wallet connection
4. ✅ Test end-to-end flows
5. ✅ Share bot with test users

## Bot Analytics

Monitor your bot:
- **BotFather**: `/mybots` → View bot stats
- **Telegram Analytics**: Available in BotFather
- **Railway Logs**: Monitor bot activity and errors

## Production Checklist

- [ ] Bot token set in Railway
- [ ] Bot description and about text set
- [ ] Bot commands configured
- [ ] Menu button URL set to Vercel URL
- [ ] `FRONTEND_URL` in Railway matches Vercel URL
- [ ] Bot responds to `/start` command
- [ ] Mini App opens correctly
- [ ] All features tested end-to-end


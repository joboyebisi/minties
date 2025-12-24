# Railway Backend Deployment Guide

## Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Authorize Railway to access your repositories

## Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `minties` repository
4. Railway will detect it's a monorepo

## Step 3: Add Service

1. Click **"New"** → **"Service"**
2. Select **"GitHub Repo"** → Choose `minties`
3. Railway will start detecting the project

## Step 4: Configure Service

1. Click on the service to open settings
2. Go to **"Settings"** tab
3. Configure:

### Root Directory
- Set **Root Directory** to: `backend`

### Build & Start Commands
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Watch Paths**: `backend/**` (optional, for auto-deploy)

### Environment
- **Node Version**: 20.x (or latest LTS)

## Step 5: Add Environment Variables

Go to **"Variables"** tab and add all these:

### Required Variables

```env
# Server
PORT=3001
NODE_ENV=production

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather

# Frontend URL (will update after Vercel deployment)
FRONTEND_URL=https://your-frontend.vercel.app

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (service_role key, NOT anon!)

# Blockchain
RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
SAVINGS_CIRCLE_ADDRESS=your_deployed_contract_address
GIFT_ESCROW_ADDRESS=your_deployed_contract_address

# Envio HyperSync (optional but recommended)
USE_HYPERSYNC=true
HYPERSYNC_API_TOKEN=233b693d-8971-47ba-b30d-c4ce34d61f86
HYPERSYNC_URL=https://sepolia.hypersync.xyz
```

### How to Add Variables

1. Click **"New Variable"**
2. Enter **Name** and **Value**
3. Click **"Add"**
4. Repeat for each variable

**Note**: Railway auto-saves, so you don't need to click save.

## Step 6: Deploy

1. Railway will automatically:
   - Detect the `backend` directory
   - Install dependencies
   - Build the project
   - Start the server

2. Watch the **"Deployments"** tab for progress

3. Once deployed, Railway will provide a URL like:
   - `https://minties-backend-production.up.railway.app`

## Step 7: Get Your Backend URL

1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"** (if not auto-generated)
3. Copy the URL (e.g., `https://minties-backend-production.up.railway.app`)

## Step 8: Update Frontend Configuration

After getting your Railway URL:

1. Go to Vercel dashboard (we'll set this up next)
2. Add environment variable:
   - `NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app`

## Step 9: Verify Deployment

1. Check **"Logs"** tab in Railway
2. You should see:
   ```
   🚀 Minties backend server running on port 3001
   📱 Telegram bot initialized
   ```

3. Test health endpoint:
   - Visit: `https://your-railway-url.up.railway.app/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

## Step 10: Update Telegram Bot

After Vercel deployment (next step):

1. Get your Vercel frontend URL
2. Update `FRONTEND_URL` in Railway variables
3. Update BotFather Web App URL (see Telegram setup)

## Troubleshooting

### Build Fails
- Check **"Logs"** tab for errors
- Verify `backend/package.json` has correct scripts
- Ensure TypeScript compiles: `npm run build` works locally

### Bot Not Responding
- Verify `TELEGRAM_BOT_TOKEN` is correct
- Check logs for "Telegram bot initialized" message
- Test token with: `curl https://api.telegram.org/bot<TOKEN>/getMe`

### Port Issues
- Railway sets `PORT` automatically
- Your code should use: `process.env.PORT || 3001`
- Check that `backend/src/index.ts` uses `process.env.PORT`

### Environment Variables Not Working
- Verify variables are set in Railway dashboard
- Check variable names match exactly (case-sensitive)
- Restart deployment after adding variables

## Next Steps

After Railway is set up:
1. ✅ Deploy frontend to Vercel (next guide)
2. ✅ Update `FRONTEND_URL` in Railway
3. ✅ Set up Telegram bot (see Telegram guide)
4. ✅ Test end-to-end

## Railway Dashboard

- **Deployments**: View deployment history and logs
- **Metrics**: Monitor CPU, memory, network usage
- **Logs**: Real-time application logs
- **Settings**: Configure service settings
- **Variables**: Manage environment variables

## Cost

Railway free tier includes:
- $5 credit per month
- 500 hours of usage
- Perfect for development/testing

For production, consider upgrading if needed.


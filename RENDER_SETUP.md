# Render Backend Deployment Guide

## Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended for easy repo connection)
3. Verify your email if required

## Step 2: Create New Web Service

1. Click **"New +"** in the dashboard
2. Select **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select your `minties` repository

## Step 3: Configure Service

### Basic Settings

- **Name**: `minties-backend` (or your preferred name)
- **Region**: Choose closest to your users (e.g., `Oregon (US West)`)
- **Branch**: `main`
- **Root Directory**: `backend` ⚠️ **IMPORTANT**

### Build & Start

- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Environment

- **Node Version**: `20` (or latest LTS)

## Step 4: Add Environment Variables

Go to **"Environment"** tab and add all these variables:

### Required Variables

```env
# Server
PORT=10000
NODE_ENV=production

# Telegram Bot
TELEGRAM_BOT_TOKEN=8046568673:AAFmeM4hOPjn_U5FNrih8zrKqGhxO1XVD6s

# Ethereum Sepolia
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=0xa096bc1d642773ea6783367dffff230a808dbdcc6366fedac678db47adcd6432

# Contract Addresses
GIFT_ESCROW_ADDRESS=0x72425B766F61a83da983c1908460DF118FA125Ad
SAVINGS_CIRCLE_ADDRESS=0xEf2BF49C0394560384301A209c8793160B3D2ac8
USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238

# MetaMask Smart Accounts
SMART_ACCOUNTS_ENVIRONMENT=sepolia

# Frontend URL (update after Vercel deployment)
FRONTEND_URL=https://your-frontend.vercel.app

# Supabase
SUPABASE_URL=https://humjsqxqllzllnqaeeya.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1bWpzcXhxbGx6bGxucWFlZXlhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU1OTgwMiwiZXhwIjoyMDgyMTM1ODAyfQ.xc3wAktcSnmWu0uDTHarJk7_lH719p3M5c9iaL6NDCk

# Envio HyperSync
USE_HYPERSYNC=true
HYPERSYNC_API_TOKEN=233b693d-8971-47ba-b30d-c4ce34d61f86
HYPERSYNC_URL=https://sepolia.hypersync.xyz
```

### How to Add Variables

1. Click **"Environment"** tab
2. Click **"Add Environment Variable"**
3. Enter **Key** and **Value**
4. Click **"Save Changes"**
5. Repeat for each variable

**Note**: Render auto-saves, but click "Save Changes" after adding variables.

## Step 5: Important Settings

### Root Directory (CRITICAL)

1. Scroll to **"Advanced"** section
2. Find **"Root Directory"**
3. Enter: `backend`
4. Save

**Why**: This tells Render where your backend code is in the monorepo.

### Health Check (Optional but Recommended)

1. Scroll to **"Health Check Path"**
2. Enter: `/health`
3. Save

**Why**: Render will check this endpoint to verify your service is running.

### Auto-Deploy

- **Auto-Deploy**: Enabled (default)
- Render will automatically deploy when you push to `main` branch

## Step 6: Deploy

1. Click **"Create Web Service"** at the bottom
2. Render will start building and deploying
3. Watch the **"Logs"** tab for progress

## Step 7: Get Your Backend URL

After deployment:

1. Render will provide a URL like:
   - `https://minties-backend.onrender.com`
   - Or: `https://minties-backend-xxxx.onrender.com`

2. Copy this URL - you'll need it for:
   - Vercel `NEXT_PUBLIC_API_URL` variable
   - Testing

## Step 8: Update Frontend Configuration

After getting your Render URL:

1. Go to Vercel dashboard
2. Add environment variable:
   - `NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com`

## Step 9: Verify Deployment

1. Check **"Logs"** tab in Render
2. You should see:
   ```
   🚀 Minties backend server running on port 10000
   📱 Telegram bot initialized
   ```

3. Test health endpoint:
   - Visit: `https://your-render-url.onrender.com/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

## Step 10: Update Telegram Bot

After Vercel deployment:

1. Get your Vercel frontend URL
2. Update `FRONTEND_URL` in Render environment variables
3. Render will auto-redeploy
4. Update BotFather Web App URL (see Telegram setup)

## Important Notes

### PORT on Render

- Render sets `PORT` automatically
- Your code uses: `process.env.PORT || 3001`
- Render will provide the correct port (usually `10000`)
- **Don't set PORT manually** - let Render handle it

### Free Tier Limitations

Render free tier includes:
- ✅ 750 hours/month (enough for 24/7 operation)
- ✅ Automatic SSL
- ✅ Auto-deploy from GitHub
- ⚠️ Services spin down after 15 minutes of inactivity
- ⚠️ First request after spin-down may be slow (cold start)

**For production**: Consider upgrading to paid plan for:
- No spin-downs
- Better performance
- More resources

### Cold Starts

On free tier, if your service hasn't received requests for 15 minutes:
- Service spins down
- First request takes ~30 seconds to wake up
- Subsequent requests are fast

**Solution**: 
- Use a cron job to ping `/health` every 10 minutes
- Or upgrade to paid plan

## Troubleshooting

### Build Fails
- Check **"Logs"** tab for errors
- Verify `backend/package.json` has correct scripts
- Ensure TypeScript compiles: `npm run build` works locally
- Check Root Directory is set to `backend`

### Service Not Starting
- Check logs for errors
- Verify `TELEGRAM_BOT_TOKEN` is correct
- Check all environment variables are set
- Verify health check endpoint works

### Bot Not Responding
- Verify `TELEGRAM_BOT_TOKEN` is correct
- Check logs for "Telegram bot initialized" message
- Test token: `curl https://api.telegram.org/bot<TOKEN>/getMe`

### Port Issues
- Render sets `PORT` automatically
- Your code should use: `process.env.PORT || 3001`
- Don't hardcode port numbers

### Environment Variables Not Working
- Verify variables are set in Render dashboard
- Check variable names match exactly (case-sensitive)
- Redeploy after adding variables

## Next Steps

After Render is set up:
1. ✅ Deploy frontend to Vercel (next guide)
2. ✅ Update `FRONTEND_URL` in Render
3. ✅ Set up Telegram bot (see Telegram guide)
4. ✅ Test end-to-end

## Render Dashboard Features

- **Logs**: View real-time application logs
- **Metrics**: Monitor CPU, memory, network usage
- **Events**: View deployment history
- **Settings**: Configure service settings
- **Environment**: Manage environment variables

## Cost

Render free tier:
- ✅ 750 hours/month
- ✅ Perfect for development/testing
- ⚠️ Services spin down after inactivity

For production with no spin-downs, consider:
- **Starter Plan**: $7/month per service
- **Professional Plan**: $25/month per service

## Comparison: Render vs Railway

| Feature | Render Free | Railway Free |
|---------|-------------|--------------|
| Hours/month | 750 | $5 credit |
| Spin-down | 15 min | No |
| Auto-deploy | ✅ | ✅ |
| SSL | ✅ | ✅ |
| Database | ✅ | ✅ |

**Render is great for**: Free tier with auto-deploy
**Railway is great for**: No spin-downs, better free tier (when available)


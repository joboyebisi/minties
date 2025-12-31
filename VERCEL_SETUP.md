# Vercel Frontend Deployment Guide

## Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Authorize Vercel to access your repositories

## Step 2: Import Project

1. Click **"Add New"** → **"Project"**
2. Find and select your `minties` repository
3. Click **"Import"**

## Step 3: Configure Project

Vercel will auto-detect Next.js, but we need to configure for monorepo:

### Framework Preset
- **Framework**: Next.js (auto-detected)

### Root Directory
- Click **"Edit"** next to Root Directory
- Set to: `frontend`
- Click **"Continue"**

### Build Settings
- **Build Command**: `npm run build` (default, should work)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

**Note**: If build fails, you may need to:
- Set **Root Directory**: `frontend`
- Set **Build Command**: `cd frontend && npm run build`

## Step 4: Add Environment Variables

**Before deploying**, add all environment variables:

1. Click **"Environment Variables"** section
2. Add each variable below
3. Select environments: **Production**, **Preview**, **Development**

### Required Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Blockchain
NEXT_PUBLIC_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
NEXT_PUBLIC_BUNDLER_URL=https://api.pimlico.io/v2/11155111/rpc

# Backend API (update after Fly.io deployment)
NEXT_PUBLIC_API_URL=https://minties-backend.fly.dev

# Contract Addresses
NEXT_PUBLIC_USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
NEXT_PUBLIC_SAVINGS_CIRCLE_ADDRESS=your_deployed_contract_address
NEXT_PUBLIC_GIFT_ESCROW_ADDRESS=your_deployed_contract_address

# Network
NEXT_PUBLIC_CHAIN_ID=11155111
```

### How to Add Variables

1. Click **"Add"** or **"Add Another"**
2. Enter:
   - **Key**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Your Supabase URL
   - **Environments**: Select all (Production, Preview, Development)
3. Click **"Save"**
4. Repeat for each variable

## Step 5: Deploy

1. Click **"Deploy"** button
2. Wait for build to complete (2-5 minutes)
3. Watch build logs for any errors

## Step 6: Get Your Frontend URL

After deployment:

1. Vercel will provide a URL like:
   - `https://minties-frontend.vercel.app`
   - Or: `https://minties-frontend-xyz.vercel.app`

2. Copy this URL - you'll need it for:
   - Railway `FRONTEND_URL` variable
   - Telegram BotFather Web App URL

## Step 7: Update Backend Configuration

### Using Fly.io CLI:
```bash
cd backend
flyctl secrets set FRONTEND_URL=https://your-vercel-url.vercel.app
```

### Using Fly.io Dashboard:
1. Go to Fly.io dashboard
2. Select your backend app
3. Go to **Secrets** tab
4. Update `FRONTEND_URL`:
   - Value: `https://your-vercel-url.vercel.app`
5. App will auto-redeploy

## Step 8: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain (e.g., `minties.app`)
3. Follow DNS configuration instructions

## Step 9: Verify Deployment

1. Visit your Vercel URL
2. Check browser console for errors
3. Test wallet connection
4. Verify Supabase connection

## Step 10: Update Telegram Bot

After getting Vercel URL:

1. Go to Telegram → @BotFather
2. Send `/mybots`
3. Select your bot
4. Choose **"Bot Settings"** → **"Menu Button"**
5. Set **Web App URL** to: `https://your-vercel-url.vercel.app`
6. Save

## Troubleshooting

### Build Fails - "Module not found"
- Check that all dependencies are in `frontend/package.json`
- Verify `npm install` completes successfully
- Check build logs for specific missing module

### Build Fails - "Environment variable not found"
- Verify all `NEXT_PUBLIC_*` variables are set
- Check variable names match exactly
- Ensure variables are added to all environments

### Build Fails - TypeScript errors
- Fix TypeScript errors locally first
- Run `npm run build` in `frontend/` directory
- Check build logs for specific errors

### App loads but shows errors
- Check browser console for errors
- Verify Supabase credentials are correct
- Check that backend URL is correct
- Verify contract addresses are set

### "API request failed"
- Check `NEXT_PUBLIC_API_URL` is set correctly
- Verify Fly.io backend is running: `flyctl status`
- Test backend health endpoint manually: `curl https://minties-backend.fly.dev/health`

## Environment-Specific Deployments

Vercel automatically creates:
- **Production**: Main branch deployments
- **Preview**: Pull request deployments
- **Development**: Development branch deployments

You can set different environment variables for each.

## Next Steps

After Vercel is set up:
1. ✅ Update Fly.io `FRONTEND_URL` secret
2. ✅ Set up Telegram bot (see Telegram guide)
3. ✅ Test Mini App in Telegram
4. ✅ Test end-to-end functionality

## Vercel Dashboard Features

- **Deployments**: View all deployments
- **Analytics**: Monitor traffic and performance
- **Logs**: View application logs
- **Settings**: Configure project settings
- **Environment Variables**: Manage variables
- **Domains**: Configure custom domains

## Cost

Vercel free tier (Hobby) includes:
- Unlimited deployments
- 100GB bandwidth
- Perfect for development/testing

For production with high traffic, consider Pro plan.


# Deployment Guide for Minties

## Environment Variables Setup

### Frontend (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Blockchain
NEXT_PUBLIC_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
NEXT_PUBLIC_BUNDLER_URL=https://api.pimlico.io/v2/11155111/rpc

# Optional: Contract addresses (if you want to override defaults)
NEXT_PUBLIC_USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
NEXT_PUBLIC_AAVE_POOL_ADDRESS=0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951
```

**Important**: Make sure to add these for all environments (Production, Preview, Development)

### Backend (Render/Netlify/Railway)

Create a `.env` file or set environment variables in your hosting platform:

```env
# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Frontend URL (for Mini App)
FRONTEND_URL=https://your-frontend.vercel.app

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service_role key, not anon!)

# Blockchain
RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
SAVINGS_CIRCLE_ADDRESS=your_deployed_contract_address
GIFT_ESCROW_ADDRESS=your_deployed_contract_address

# Optional: Private key for backend operations (if needed)
PRIVATE_KEY=your_backend_wallet_private_key (keep this secret!)
```

## Vercel Setup (Frontend)

### Step 1: Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository: `joboyebisi/minties`

### Step 2: Configure Build Settings

- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### Step 3: Add Environment Variables

Add all variables from the "Frontend (Vercel)" section above.

### Step 4: Deploy

Click **"Deploy"** and wait for the build to complete.

### Step 5: Update Backend Configuration

After deployment, copy your Vercel URL (e.g., `https://minties-frontend.vercel.app`) and:
1. Add it to backend `.env` as `FRONTEND_URL`
2. Update Telegram BotFather Web App URL to this URL

## Backend Deployment Options

### Option 1: Render (Recommended for Telegram Bot)

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `minties-backend`
   - **Environment**: Node
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run dev` (or `npm start` for production)
5. Add all environment variables from "Backend" section above
6. Click **"Create Web Service"**

### Option 2: Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Add `backend` as the root directory
5. Add environment variables
6. Railway will auto-detect Node.js and deploy

### Option 3: Netlify Functions

Note: Netlify Functions are serverless, so you'll need to refactor the Telegram bot to use webhooks instead of polling. This is more complex.

## Local Development Setup

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # Create .env.local with your values
npm run dev
```

### Backend

```bash
cd backend
npm install
cp .env.example .env  # Create .env with your values
npm run dev
```

## Post-Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render/Railway/Netlify
- [ ] All environment variables set
- [ ] Supabase database schema run
- [ ] Telegram bot token configured
- [ ] BotFather Web App URL updated
- [ ] Test `/start` command in Telegram
- [ ] Test Mini App opens correctly
- [ ] Test wallet connection
- [ ] Test Money Box creation
- [ ] Test gift sending/claiming
- [ ] Test savings circle creation

## Troubleshooting

### Frontend Issues

- **"Module not found"**: Make sure all dependencies are in `package.json` and run `npm install`
- **"Environment variable not found"**: Check Vercel dashboard → Settings → Environment Variables
- **Build fails**: Check build logs in Vercel dashboard

### Backend Issues

- **"Telegram bot not responding"**: Check `TELEGRAM_BOT_TOKEN` is correct
- **"Database connection failed"**: Verify Supabase credentials
- **"Polling error"**: Check network connectivity, bot token validity

### Telegram Mini App Issues

- **"Mini App not opening"**: Verify `FRONTEND_URL` in backend matches Vercel URL
- **"Web App URL invalid"**: Update in BotFather → Your Bot → Bot Settings → Menu Button

## Security Notes

- Never commit `.env` files to Git
- Use Vercel's environment variables for secrets
- Use Supabase service_role key only in backend (never expose to frontend)
- Keep Telegram bot token secret
- Use testnet for development, mainnet only after thorough testing


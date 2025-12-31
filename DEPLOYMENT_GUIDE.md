# Complete Deployment Guide - Fly.io, Vercel, and Telegram

This guide covers deploying your Minties app to Fly.io (backend), Vercel (frontend), and integrating with Telegram.

## Overview

- **Backend**: Deploy to Fly.io
- **Frontend**: Deploy to Vercel
- **Telegram**: Integrate Mini App and Bot

## Prerequisites

1. **Fly.io Account**: Sign up at [fly.io](https://fly.io)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Telegram Bot**: Create with @BotFather
4. **Supabase Project**: For database
5. **Deployed Smart Contracts**: On Sepolia testnet

## Quick Start Checklist

- [ ] Install Fly CLI
- [ ] Create Fly.io app
- [ ] Deploy backend to Fly.io
- [ ] Deploy frontend to Vercel
- [ ] Configure Telegram bot
- [ ] Test end-to-end

## Step-by-Step Deployment

### Part 1: Backend Deployment (Fly.io)

1. **Install Fly CLI**
   ```bash
   # macOS/Linux
   curl -L https://fly.io/install.sh | sh
   
   # Windows (PowerShell)
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Login to Fly.io**
   ```bash
   flyctl auth login
   ```

3. **Navigate to backend directory**
   ```bash
   cd backend
   ```

4. **Initialize Fly.io app** (if fly.toml doesn't exist)
   ```bash
   flyctl launch
   ```

5. **Set environment variables (secrets)**
   ```bash
   flyctl secrets set TELEGRAM_BOT_TOKEN=your_bot_token
   flyctl secrets set SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
   flyctl secrets set PRIVATE_KEY=your_private_key
   flyctl secrets set FRONTEND_URL=https://your-frontend.vercel.app
   flyctl secrets set SUPABASE_URL=https://xxxxx.supabase.co
   flyctl secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   flyctl secrets set USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
   flyctl secrets set SAVINGS_CIRCLE_ADDRESS=your_contract_address
   flyctl secrets set GIFT_ESCROW_ADDRESS=your_contract_address
   ```

6. **Deploy**
   ```bash
   flyctl deploy
   ```

7. **Get your backend URL**
   ```bash
   flyctl status
   ```
   Save this URL (e.g., `https://minties-backend.fly.dev`)

📖 **Detailed Guide**: See [FLY_IO_SETUP.md](./FLY_IO_SETUP.md)

### Part 2: Frontend Deployment (Vercel)

1. **Push code to GitHub** (if not already)

2. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your repository

3. **Configure Project**
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

4. **Add Environment Variables**
   
   In Vercel Dashboard → Settings → Environment Variables, add:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
   NEXT_PUBLIC_BUNDLER_URL=https://api.pimlico.io/v2/11155111/rpc
   NEXT_PUBLIC_API_URL=https://minties-backend.fly.dev
   NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=minties_bot
   NEXT_PUBLIC_USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
   NEXT_PUBLIC_SAVINGS_CIRCLE_ADDRESS=your_contract_address
   NEXT_PUBLIC_GIFT_ESCROW_ADDRESS=your_contract_address
   NEXT_PUBLIC_CHAIN_ID=11155111
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Save your Vercel URL (e.g., `https://minties-frontend.vercel.app`)

📖 **Detailed Guide**: See [VERCEL_SETUP.md](./VERCEL_SETUP.md)

### Part 3: Telegram Integration

1. **Create Telegram Bot**
   - Open Telegram
   - Search for @BotFather
   - Send `/newbot`
   - Follow instructions to create bot
   - Save the bot token

2. **Configure Bot Settings**
   - Set bot description
   - Set bot commands (see TELEGRAM_SETUP.md)
   - Set bot photo

3. **Configure Web App (After Vercel Deployment)**
   - In BotFather, select your bot
   - Go to "Bot Settings" → "Menu Button"
   - Set Web App URL to your Vercel URL
   - Save

4. **Update Backend Configuration**
   ```bash
   cd backend
   flyctl secrets set FRONTEND_URL=https://your-vercel-url.vercel.app
   ```

5. **Set Up Webhook (Recommended for Production)**
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://minties-backend.fly.dev/api/telegram/webhook"
   ```

   Then update `backend/src/index.ts` to use webhooks (see webhook configuration in FLY_IO_SETUP.md)

📖 **Detailed Guide**: See [TELEGRAM_SETUP.md](./TELEGRAM_SETUP.md)

## Post-Deployment Checklist

- [ ] Backend health check: `curl https://minties-backend.fly.dev/health`
- [ ] Frontend loads correctly
- [ ] Telegram bot responds to `/start`
- [ ] Mini App opens from Telegram
- [ ] Wallet connection works
- [ ] All API endpoints functional
- [ ] Environment variables correctly set

## Environment Variables Reference

See [ENV_VARS_GUIDE.md](./ENV_VARS_GUIDE.md) for complete list of environment variables and where to get them.

## Troubleshooting

### Backend Issues
- Check logs: `flyctl logs`
- Verify secrets: `flyctl secrets list`
- Test health endpoint

### Frontend Issues
- Check Vercel build logs
- Verify environment variables are set
- Check browser console for errors

### Telegram Issues
- Verify bot token is correct
- Check webhook is set correctly
- Test bot with `/start` command
- Verify Mini App URL in BotFather

## Updating Your Deployment

### Update Backend
```bash
cd backend
git pull
flyctl deploy
```

### Update Frontend
- Push to GitHub (Vercel auto-deploys)
- Or trigger manual deploy in Vercel dashboard

## Cost Estimates

### Fly.io (Free Tier)
- 3 shared-cpu-1x VMs (256MB RAM each)
- 160GB outbound data transfer
- Perfect for development/testing

### Vercel (Free Tier)
- Unlimited deployments
- 100GB bandwidth
- Perfect for development/testing

### Production Considerations
- Consider upgrading for higher traffic
- Monitor usage and scale as needed
- Set up monitoring and alerts

## Security Best Practices

1. ✅ Never commit secrets to git
2. ✅ Use environment variables for all sensitive data
3. ✅ Enable HTTPS (automatic on Fly.io and Vercel)
4. ✅ Keep dependencies updated
5. ✅ Monitor logs for suspicious activity
6. ✅ Use service_role key only in backend
7. ✅ Rotate keys if exposed

## Next Steps

After successful deployment:
1. Test all features end-to-end
2. Share with test users
3. Monitor performance and errors
4. Set up analytics
5. Plan for scaling

## Getting Help

- **Fly.io Docs**: [fly.io/docs](https://fly.io/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Telegram Bot API**: [core.telegram.org/bots/api](https://core.telegram.org/bots/api)
- **Project Issues**: Check repository issues

---

**Happy Deploying! 🚀**


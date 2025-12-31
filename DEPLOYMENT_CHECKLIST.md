# Complete Deployment Checklist

Use this checklist to ensure everything is set up correctly.

## Pre-Deployment

- [ ] Contracts deployed to Sepolia
- [ ] Contract addresses saved
- [ ] Supabase project created
- [ ] Supabase migrations run (schema.sql, rpc.sql, rls_policies.sql)
- [ ] Supabase credentials saved
- [ ] Telegram bot created with BotFather
- [ ] Bot token saved
- [ ] GitHub repository pushed with all code

## Render (Backend) Setup

- [ ] Render account created
- [ ] Web Service created from GitHub repo
- [ ] Root directory set to: `backend`
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`
- [ ] All environment variables added:
  - [ ] `NODE_ENV=production`
  - [ ] `TELEGRAM_BOT_TOKEN=...`
  - [ ] `SEPOLIA_RPC_URL=...`
  - [ ] `PRIVATE_KEY=...`
  - [ ] `FRONTEND_URL=...` (update after Vercel)
  - [ ] `SUPABASE_URL=...`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY=...`
  - [ ] `USDC_ADDRESS=...`
  - [ ] `SAVINGS_CIRCLE_ADDRESS=...`
  - [ ] `GIFT_ESCROW_ADDRESS=...`
  - [ ] `USE_HYPERSYNC=true`
  - [ ] `HYPERSYNC_API_TOKEN=...`
  - [ ] `HYPERSYNC_URL=...`
- [ ] Deployment successful
- [ ] Backend URL obtained (e.g., `https://xxx.onrender.com`)
- [ ] Health check works: `/health` endpoint returns OK

## Vercel (Frontend) Setup

- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Root directory set to: `frontend`
- [ ] Build settings configured
- [ ] All environment variables added:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL=...`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
  - [ ] `NEXT_PUBLIC_RPC_URL=...`
  - [ ] `NEXT_PUBLIC_BUNDLER_URL=...`
  - [ ] `NEXT_PUBLIC_API_URL=...` (Railway URL)
  - [ ] `NEXT_PUBLIC_USDC_ADDRESS=...`
  - [ ] `NEXT_PUBLIC_SAVINGS_CIRCLE_ADDRESS=...`
  - [ ] `NEXT_PUBLIC_GIFT_ESCROW_ADDRESS=...`
  - [ ] `NEXT_PUBLIC_CHAIN_ID=11155111`
- [ ] Deployment successful
- [ ] Frontend URL obtained (e.g., `https://xxx.vercel.app`)
- [ ] Frontend loads without errors

## Cross-Configuration

- [ ] `FRONTEND_URL` in Railway updated with Vercel URL
- [ ] `NEXT_PUBLIC_API_URL` in Vercel updated with Railway URL
- [ ] Both services redeployed after URL updates

## Telegram Bot Setup

- [ ] Bot created with BotFather
- [ ] Bot token obtained
- [ ] Bot description set
- [ ] Bot about text set
- [ ] Bot commands configured
- [ ] Bot photo/logo set (optional)
- [ ] Menu Button URL set to Vercel URL
- [ ] Bot token added to Railway variables
- [ ] Bot responds to `/start` command
- [ ] Mini App button appears in bot

## Testing

### Backend Tests
- [ ] Health endpoint: `GET /health` returns OK
- [ ] Telegram bot responds to commands
- [ ] API routes accessible
- [ ] Supabase connection works
- [ ] Blockchain queries work
- [ ] Service doesn't spin down (or use cron to keep alive)

### Frontend Tests
- [ ] Frontend loads without errors
- [ ] Wallet connection works
- [ ] Supabase connection works
- [ ] API calls to backend work
- [ ] All pages load correctly

### Telegram Mini App Tests
- [ ] Mini App opens from bot
- [ ] Wallet connection works in Mini App
- [ ] Telegram WebApp API works
- [ ] Features accessible
- [ ] Navigation works

### End-to-End Tests
- [ ] Create money box
- [ ] Join savings circle
- [ ] Send gift
- [ ] Claim gift
- [ ] View stats
- [ ] Invite system works

## Security Checklist

- [ ] All `.env` files in `.gitignore`
- [ ] No secrets committed to Git
- [ ] Service role keys only in backend
- [ ] Anon keys only in frontend
- [ ] Bot token secured
- [ ] API tokens secured
- [ ] Testnet addresses for development

## Monitoring

- [ ] Railway logs accessible
- [ ] Vercel logs accessible
- [ ] Error tracking set up (optional)
- [ ] Analytics configured (optional)

## Documentation

- [ ] Deployment guides created
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Troubleshooting guide available

## Final Steps

- [ ] All tests passing
- [ ] Production URLs saved
- [ ] Team has access to dashboards
- [ ] Monitoring set up
- [ ] Ready for users!

## Quick Reference

### Render Backend URL
```
https://your-backend.onrender.com
```

### Vercel Frontend URL
```
https://your-frontend.vercel.app
```

### Telegram Bot
```
@your_bot_username
```

### Test Commands
```bash
# Test backend health
curl https://your-backend.up.railway.app/health

# Test bot token
curl https://api.telegram.org/bot<TOKEN>/getMe
```

## Support Resources

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Telegram Bot API: https://core.telegram.org/bots/api
- Supabase Docs: https://supabase.com/docs


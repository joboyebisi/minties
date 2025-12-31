# Quick Deployment Guide

## 🚀 Deployment Order

Follow these steps in order:

### 1. Render (Backend) - Do First
**Time**: ~10 minutes

1. Go to [render.com](https://render.com) → Sign in with GitHub
2. **New +** → **Web Service** → Connect `minties` repo
3. **Settings** → Set **Root Directory**: `backend`
4. **Build Command**: `npm install && npm run build`
5. **Start Command**: `npm start`
6. **Environment** → Add all backend env vars (see `RENDER_SETUP.md`)
7. Click **Create Web Service**
8. Wait for deployment
9. Copy backend URL (e.g., `https://xxx.onrender.com`)

**See**: `RENDER_SETUP.md` for detailed steps

---

### 2. Vercel (Frontend) - Do Second
**Time**: ~10 minutes

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. **Add New** → **Project** → Import `minties` repo
3. **Configure** → Set **Root Directory**: `frontend`
4. **Environment Variables** → Add all frontend vars (see `VERCEL_SETUP.md`)
   - **Important**: Set `NEXT_PUBLIC_API_URL` to your Render URL
5. Click **Deploy**
6. Copy frontend URL (e.g., `https://xxx.vercel.app`)

**See**: `VERCEL_SETUP.md` for detailed steps

---

### 3. Update Cross-References
**Time**: ~2 minutes

1. **Render**: Update `FRONTEND_URL` variable with Vercel URL
2. **Vercel**: Verify `NEXT_PUBLIC_API_URL` is set to Render URL
3. Both will auto-redeploy

---

### 4. Telegram Bot Setup
**Time**: ~5 minutes

1. Open Telegram → Search **@BotFather**
2. Send `/newbot` (or `/mybots` if bot exists)
3. Get bot token
4. **Railway**: Add `TELEGRAM_BOT_TOKEN` variable
5. **BotFather**: Set Menu Button URL to Vercel URL
6. Test bot with `/start`

**See**: `TELEGRAM_SETUP.md` for detailed steps

---

## 📋 Environment Variables Quick Reference

### Render (Backend) - All Required

```env
NODE_ENV=production
TELEGRAM_BOT_TOKEN=your_token
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=your_private_key
FRONTEND_URL=https://your-frontend.vercel.app
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
SAVINGS_CIRCLE_ADDRESS=0x...
GIFT_ESCROW_ADDRESS=0x...
USE_HYPERSYNC=true
HYPERSYNC_API_TOKEN=233b693d-8971-47ba-b30d-c4ce34d61f86
HYPERSYNC_URL=https://sepolia.hypersync.xyz
```

**Note**: Don't set `PORT` - Render sets it automatically (usually `10000`)

### Vercel (Frontend) - All Required

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
NEXT_PUBLIC_BUNDLER_URL=https://api.pimlico.io/v2/11155111/rpc
NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app
NEXT_PUBLIC_USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
NEXT_PUBLIC_SAVINGS_CIRCLE_ADDRESS=0x...
NEXT_PUBLIC_GIFT_ESCROW_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=11155111
```

---

## ✅ Verification Steps

After deployment, verify:

1. **Backend Health**:
   ```bash
   curl https://your-railway-url.up.railway.app/health
   ```
   Should return: `{"status":"ok",...}`

2. **Frontend Loads**:
   - Visit Vercel URL
   - Should load without errors
   - Check browser console

3. **Telegram Bot**:
   - Search for your bot
   - Send `/start`
   - Should respond

4. **Mini App**:
   - Click menu button in bot
   - Mini App should open
   - Test wallet connection

---

## 🆘 Quick Troubleshooting

**Backend not starting?**
- Check Render logs
- Verify all env vars are set
- Check `TELEGRAM_BOT_TOKEN` is valid
- Verify Root Directory is set to `backend`

**Frontend build fails?**
- Check Vercel build logs
- Verify all `NEXT_PUBLIC_*` vars are set
- Check TypeScript errors

**Bot not responding?**
- Verify token in Railway
- Check Railway logs
- Test token: `curl https://api.telegram.org/bot<TOKEN>/getMe`

**Mini App not opening?**
- Verify `FRONTEND_URL` in Railway matches Vercel URL
- Check BotFather Menu Button URL
- Ensure URL is HTTPS

---

## 📚 Detailed Guides

- **Render**: See `RENDER_SETUP.md`
- **Vercel**: See `VERCEL_SETUP.md`
- **Telegram**: See `TELEGRAM_SETUP.md`
- **Complete Checklist**: See `DEPLOYMENT_CHECKLIST.md`
- **Environment Variables**: See `ENV_VARS_GUIDE.md`

---

## ⏱️ Total Time

- Render setup: ~10 minutes
- Vercel setup: ~10 minutes
- Telegram setup: ~5 minutes
- Testing: ~10 minutes

**Total: ~35 minutes**

---

## 🎯 Next Steps After Deployment

1. Test all features end-to-end
2. Monitor logs for errors
3. Set up custom domains (optional)
4. Configure analytics (optional)
5. Share with test users
6. Prepare for production launch

Good luck with your deployment! 🚀


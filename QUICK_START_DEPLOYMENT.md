# Quick Start - Deploy to Fly.io, Vercel, and Telegram

This is a condensed deployment guide. For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## Prerequisites Checklist

- [ ] Fly.io account ([fly.io](https://fly.io))
- [ ] Vercel account ([vercel.com](https://vercel.com))
- [ ] Telegram bot created with @BotFather
- [ ] Supabase project set up
- [ ] Smart contracts deployed to Sepolia

## Backend (Fly.io) - 5 Minutes

```bash
# 1. Install Fly CLI
curl -L https://fly.io/install.sh | sh  # macOS/Linux
# OR for Windows PowerShell:
# powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# 2. Login
flyctl auth login

# 3. Navigate to backend
cd backend

# 4. Launch app (creates fly.toml if needed)
flyctl launch

# 5. Set secrets
flyctl secrets set TELEGRAM_BOT_TOKEN=your_token
flyctl secrets set SUPABASE_URL=https://xxxxx.supabase.co
flyctl secrets set SUPABASE_SERVICE_ROLE_KEY=your_key
flyctl secrets set FRONTEND_URL=https://your-vercel-url.vercel.app
flyctl secrets set SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
flyctl secrets set PRIVATE_KEY=your_private_key
flyctl secrets set USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
flyctl secrets set SAVINGS_CIRCLE_ADDRESS=your_address
flyctl secrets set GIFT_ESCROW_ADDRESS=your_address

# 6. Deploy
flyctl deploy

# 7. Get URL
flyctl status
```

Backend URL will be: `https://minties-backend.fly.dev` (or your app name)

## Frontend (Vercel) - 3 Minutes

1. Go to [vercel.com](https://vercel.com) → Add New → Project
2. Import your GitHub repository
3. Set **Root Directory** to `frontend`
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` (your Fly.io backend URL)
   - `NEXT_PUBLIC_RPC_URL`
   - `NEXT_PUBLIC_BUNDLER_URL`
   - `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME`
   - Contract addresses
5. Click **Deploy**

Frontend URL will be: `https://your-app.vercel.app`

## Telegram - 2 Minutes

1. Open Telegram → @BotFather
2. `/mybots` → Select your bot
3. **Bot Settings** → **Menu Button**
4. Set Web App URL to your Vercel URL
5. Save

Update backend `FRONTEND_URL`:
```bash
flyctl secrets set FRONTEND_URL=https://your-vercel-url.vercel.app
```

## Test

1. **Backend health**: `curl https://minties-backend.fly.dev/health`
2. **Frontend**: Visit your Vercel URL
3. **Telegram**: Open bot → Click menu button → Mini App should open

## Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check environment variables are set |
| Bot not responding | Verify `TELEGRAM_BOT_TOKEN` in Fly.io secrets |
| Mini App won't open | Check `FRONTEND_URL` matches Vercel URL exactly |
| API errors | Verify `NEXT_PUBLIC_API_URL` points to Fly.io backend |

## Next Steps

- ✅ See [FLY_IO_SETUP.md](./FLY_IO_SETUP.md) for detailed Fly.io guide
- ✅ See [VERCEL_SETUP.md](./VERCEL_SETUP.md) for detailed Vercel guide  
- ✅ See [TELEGRAM_SETUP.md](./TELEGRAM_SETUP.md) for detailed Telegram guide
- ✅ See [ENV_VARS_GUIDE.md](./ENV_VARS_GUIDE.md) for environment variables

---

**Total Time**: ~10 minutes 🚀


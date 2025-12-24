# Environment Variables Guide

## Where to Put Environment Variables

### Frontend (Vercel)

**Location**: Vercel Dashboard → Your Project → Settings → Environment Variables

**Steps**:
1. Go to [vercel.com](https://vercel.com)
2. Select your Minties project
3. Go to **Settings** → **Environment Variables**
4. Add each variable below
5. Select environment: **Production**, **Preview**, **Development** (or all)
6. Click **Save**

**Variables to Add**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
NEXT_PUBLIC_BUNDLER_URL=https://api.pimlico.io/v2/11155111/rpc
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=minties_bot
```

**For Local Development**: Create `frontend/.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
NEXT_PUBLIC_BUNDLER_URL=https://api.pimlico.io/v2/11155111/rpc
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=minties_bot
```

---

### Backend (Render/Railway/Netlify)

**Location**: Your hosting platform's environment variables section

#### Render
1. Go to your service dashboard
2. Click **Environment** tab
3. Add variables below
4. Click **Save Changes**

#### Railway
1. Go to your project dashboard
2. Click **Variables** tab
3. Add variables below
4. Auto-saves

**Variables to Add**:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
FRONTEND_URL=https://your-frontend.vercel.app
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (service_role key, NOT anon key!)
RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
SAVINGS_CIRCLE_ADDRESS=your_deployed_contract_address
GIFT_ESCROW_ADDRESS=your_deployed_contract_address
# Optional: Envio HyperSync (for faster event queries)
USE_HYPERSYNC=true
HYPERSYNC_API_TOKEN=233b693d-8971-47ba-b30d-c4ce34d61f86
HYPERSYNC_URL=https://sepolia.hypersync.xyz
```

**For Local Development**: Create `backend/.env` file:
```env
TELEGRAM_BOT_TOKEN=your_bot_token
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
SAVINGS_CIRCLE_ADDRESS=your_contract_address
GIFT_ESCROW_ADDRESS=your_contract_address
PORT=3001
```

---

## How to Get Values

### Supabase Credentials
1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (frontend only)
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (backend only, keep secret!)

### Telegram Bot Token
1. Open Telegram
2. Search for **@BotFather**
3. Send `/newbot` or `/mybots`
4. Select your bot
5. Copy the token → `TELEGRAM_BOT_TOKEN`

### Contract Addresses
After deploying contracts:
```bash
cd contracts
npx hardhat run scripts/deploy.ts --network sepolia
```
Copy the deployed addresses from the output.

### Envio Indexer (Optional - for backend indexing)
1. Sign up at [envio.dev](https://envio.dev)
2. Create a new project and deploy indexer
3. Get your GraphQL API endpoint → `ENVIO_API_URL` (from dashboard)
4. Copy your API key → `ENVIO_API_KEY` (if required)
5. See `QUICK_DEPLOY.md` for deployment instructions

### Frontend URL
After deploying to Vercel:
- Copy the URL (e.g., `https://minties-frontend.vercel.app`)
- Use it for `FRONTEND_URL` in backend
- Also update in BotFather → Your Bot → Bot Settings → Menu Button → Web App URL

---

## Security Checklist

- ✅ Never commit `.env` files (already in `.gitignore`)
- ✅ Use `NEXT_PUBLIC_` prefix only for frontend public vars
- ✅ Use service_role key only in backend (never expose to frontend)
- ✅ Keep Telegram bot token secret
- ✅ Use testnet addresses for development
- ✅ Rotate keys if accidentally exposed

---

## Quick Reference

| Variable | Frontend | Backend | Where to Get |
|----------|----------|---------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ❌ | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ❌ | Supabase Dashboard → Settings → API (anon key) |
| `SUPABASE_URL` | ❌ | ✅ | Same as above |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ | ✅ | Supabase Dashboard → Settings → API (service_role key) |
| `TELEGRAM_BOT_TOKEN` | ❌ | ✅ | @BotFather on Telegram |
| `FRONTEND_URL` | ❌ | ✅ | Your Vercel deployment URL |
| `NEXT_PUBLIC_RPC_URL` | ✅ | ❌ | Public RPC endpoint (Sepolia) |
| `RPC_URL` | ❌ | ✅ | Same as above |
| Contract addresses | ✅ (optional) | ✅ | After deploying contracts |
| `USE_HYPERSYNC` | ❌ | ✅ (optional) | Set to "true" to use Envio HyperSync instead of ethers.js |
| `HYPERSYNC_API_TOKEN` | ❌ | ✅ (optional) | Envio API token (from dashboard) |
| `HYPERSYNC_URL` | ❌ | ✅ (optional) | HyperSync endpoint (default: https://sepolia.hypersync.xyz) |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | ✅ | ❌ | Telegram bot username (e.g., minties_bot) |


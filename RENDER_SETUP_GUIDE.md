# Render Backend Deployment Guide

## Configuration Steps

### Basic Settings

1. **Name**: `minties-backend` (or `minties` if you prefer)

2. **Root Directory**: `backend`
   - This is **critical** - Render needs to know to look in the backend folder
   - Set this to: `backend`

3. **Build Command**: 
   ```
   npm install && npm run build
   ```

4. **Start Command**: 
   ```
   npm start
   ```
   - This runs `node dist/index.js` as defined in your package.json

5. **Health Check Path**: 
   ```
   /health
   ```
   - Not `/healthz` - your backend has `/health` endpoint

6. **Instance Type**: 
   - **Free** for testing (spins down after inactivity)
   - **Starter ($7/month)** recommended for production (always on, better performance)

### Environment Variables

Click "Add Environment Variable" for each of these:

#### Required Variables:

```
NODE_ENV = production
```

```
PORT = 3001
```
(Note: Render sets PORT automatically, but your app defaults to 3001, so this is safe)

```
TELEGRAM_BOT_TOKEN = your_bot_token_from_botfather
```

```
SEPOLIA_RPC_URL = https://ethereum-sepolia-rpc.publicnode.com
```

```
PRIVATE_KEY = your_wallet_private_key
```

```
FRONTEND_URL = https://your-frontend.vercel.app
```
(Update this after deploying frontend to Vercel)

```
SUPABASE_URL = https://xxxxx.supabase.co
```

```
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
(⚠️ Use service_role key, NOT anon key!)

```
USDC_ADDRESS = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
```

```
SAVINGS_CIRCLE_ADDRESS = your_deployed_contract_address
```

```
GIFT_ESCROW_ADDRESS = your_deployed_contract_address
```

#### Optional Variables:

```
ENVIO_API_URL = https://your-envio-endpoint.graphql
```
(If using Envio indexer)

```
ENVIO_API_KEY = your_envio_api_key
```
(If using Envio indexer)

```
USE_HYPERSYNC = true
```
(If using HyperSync instead of ethers.js)

```
HYPERSYNC_API_TOKEN = your_hypersync_token
```

```
HYPERSYNC_URL = https://sepolia.hypersync.xyz
```

### Advanced Settings

1. **Auto-Deploy**: 
   - Keep enabled: `On Commit`
   - This auto-deploys when you push to main branch

2. **Build Filters** (Optional):
   - **Included Paths**: `backend/**`
   - This ensures only changes in backend trigger rebuilds

### After Deployment

1. **Get your Render URL**:
   - Render will provide a URL like: `https://minties-backend.onrender.com`
   - Or: `https://minties-xxxx.onrender.com`

2. **Update Frontend**:
   - Update `NEXT_PUBLIC_API_URL` in Vercel to your Render URL

3. **Update Backend**:
   - Update `FRONTEND_URL` in Render environment variables to your Vercel URL

4. **Update Telegram Bot**:
   - Set BotFather Menu Button URL to your Vercel frontend URL

5. **Test**:
   ```bash
   curl https://minties-backend.onrender.com/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

## Important Notes

### Port Configuration
- Render automatically sets `PORT` environment variable
- Your backend code uses `process.env.PORT || 3001`
- Don't worry about setting PORT manually - Render handles it

### Free Tier Limitations
- Free instances spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds (cold start)
- Use paid tier ($7/month Starter) for production to avoid this

### Build Process
1. Render runs: `npm install` (installs dependencies)
2. Then: `npm run build` (runs `tsc` to compile TypeScript)
3. Finally: `npm start` (runs `node dist/index.js`)

### Troubleshooting

**Build fails:**
- Check Root Directory is set to `backend`
- Verify Build Command: `npm install && npm run build`
- Check build logs for specific errors

**App won't start:**
- Check Start Command: `npm start`
- Verify all environment variables are set
- Check logs for missing env vars or errors

**Health check fails:**
- Verify Health Check Path: `/health`
- Check that PORT is accessible
- Review logs for startup errors

## Next Steps

After Render deployment:
1. ✅ Test health endpoint
2. ✅ Deploy frontend to Vercel
3. ✅ Update environment variables with URLs
4. ✅ Configure Telegram bot
5. ✅ Test end-to-end functionality


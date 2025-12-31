# Fly.io Backend Deployment Guide

## Prerequisites

1. Fly.io account - Sign up at [fly.io](https://fly.io)
2. Fly CLI installed - Follow [installation guide](https://fly.io/docs/hands-on/install-flyctl/)
3. Git repository with your code

## Step 1: Install Fly CLI

### macOS
```bash
curl -L https://fly.io/install.sh | sh
```

### Windows (PowerShell)
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### Linux
```bash
curl -L https://fly.io/install.sh | sh
```

After installation, verify:
```bash
flyctl version
```

## Step 2: Login to Fly.io

```bash
flyctl auth login
```

This will open a browser window for authentication.

## Step 3: Initialize Fly.io App

From the `backend` directory:

```bash
cd backend
flyctl launch
```

This will:
- Detect your app configuration
- Ask you to name your app (or use existing `fly.toml`)
- Ask about region (choose one close to your users)
- Create the app on Fly.io

**Note**: If `fly.toml` already exists, you can skip this step.

## Step 4: Set Environment Variables

Set all required environment variables:

```bash
# Required variables
flyctl secrets set TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
flyctl secrets set SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
flyctl secrets set PRIVATE_KEY=your_private_key
flyctl secrets set FRONTEND_URL=https://your-frontend.vercel.app
flyctl secrets set SUPABASE_URL=https://xxxxx.supabase.co
flyctl secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Contract addresses
flyctl secrets set USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
flyctl secrets set SAVINGS_CIRCLE_ADDRESS=your_deployed_contract_address
flyctl secrets set GIFT_ESCROW_ADDRESS=your_deployed_contract_address

# Optional: Envio indexer
flyctl secrets set ENVIO_API_URL=https://your-envio-endpoint.graphql
flyctl secrets set ENVIO_API_KEY=your_envio_api_key
```

**Alternative**: You can also set secrets via the Fly.io dashboard:
1. Go to [fly.io dashboard](https://fly.io/dashboard)
2. Select your app
3. Go to **Secrets** tab
4. Add secrets one by one

## Step 5: Deploy

```bash
flyctl deploy
```

This will:
- Build your Docker image
- Push it to Fly.io
- Deploy to your app

Watch the logs for any errors:
```bash
flyctl logs
```

## Step 6: Get Your App URL

After deployment, get your app URL:

```bash
flyctl status
```

Or check the dashboard. Your URL will be:
- `https://minties-backend.fly.dev` (or your custom app name)

## Step 7: Update Frontend Configuration

1. Update `NEXT_PUBLIC_API_URL` in Vercel to point to your Fly.io URL:
   ```
   NEXT_PUBLIC_API_URL=https://minties-backend.fly.dev
   ```

2. Redeploy frontend on Vercel

## Step 8: Update Telegram Bot Configuration

1. Go to Telegram → @BotFather
2. Send `/mybots`
3. Select your bot
4. Choose **"Bot Settings"** → **"Menu Button"**
5. Set **Web App URL** to your Vercel frontend URL
6. Save

Also update the backend `FRONTEND_URL` secret if needed:
```bash
flyctl secrets set FRONTEND_URL=https://your-frontend.vercel.app
```

## Step 9: Monitor Your App

### View Logs
```bash
flyctl logs
```

### View App Status
```bash
flyctl status
```

### SSH into App (for debugging)
```bash
flyctl ssh console
```

### Scale Your App
```bash
# Scale to multiple instances
flyctl scale count 2

# Scale memory
flyctl scale vm shared-cpu-1x --memory 1024
```

## Step 10: Configure Health Checks

The health check endpoint `/health` is already configured in `fly.toml`.

Verify it works:
```bash
curl https://minties-backend.fly.dev/health
```

Should return:
```json
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

## Troubleshooting

### Build Fails - Docker Error
- Ensure Dockerfile exists in backend directory
- Check Dockerfile syntax
- Try building locally: `docker build -t minties-backend .`

### App Crashes on Start
- Check logs: `flyctl logs`
- Verify all environment variables are set: `flyctl secrets list`
- Ensure PORT environment variable is set correctly

### Telegram Bot Not Working
- Verify `TELEGRAM_BOT_TOKEN` is correct
- Check logs for bot initialization errors
- Test token: `curl https://api.telegram.org/bot<TOKEN>/getMe`

### Connection Timeout
- Check health endpoint is responding
- Verify port 3001 is exposed in fly.toml
- Check firewall/network settings

### Environment Variables Not Working
- Use `flyctl secrets set` for sensitive data
- Use `fly.toml [env]` section for non-sensitive defaults
- Check variable names match exactly (case-sensitive)

### High Memory Usage
- Scale up memory: `flyctl scale vm shared-cpu-1x --memory 2048`
- Check for memory leaks in application logs
- Consider upgrading to dedicated CPU if needed

## Configuration Options

### Auto-Stop Machines (Free Tier)
The `auto_stop_machines = "stop"` setting in `fly.toml` stops machines when idle, saving costs on the free tier.

### Regions
Change `primary_region` in `fly.toml` to:
- `iad` - US East (Washington, DC)
- `ord` - US Central (Chicago)
- `sfo` - US West (San Francisco)
- `lhr` - London, UK
- `cdg` - Paris, France
- `sin` - Singapore
- `syd` - Sydney, Australia

See all regions: `flyctl regions list`

### Scaling

Scale instances:
```bash
flyctl scale count 2  # 2 instances
```

Scale resources:
```bash
# More CPU and memory
flyctl scale vm shared-cpu-2x --memory 2048

# Dedicated CPU (paid tier)
flyctl scale vm dedicated-cpu-1x --memory 2048
```

## Cost

Fly.io free tier includes:
- 3 shared-cpu-1x VMs with 256MB RAM
- 160GB outbound data transfer
- Automatic SSL certificates

For production, consider:
- Shared CPU plans: ~$1.94/month per VM
- Dedicated CPU plans: ~$15.50/month per VM

## Security Best Practices

1. ✅ Never commit secrets to git
2. ✅ Use `flyctl secrets` for sensitive data
3. ✅ Enable HTTPS (automatic with Fly.io)
4. ✅ Keep dependencies updated
5. ✅ Monitor logs for suspicious activity
6. ✅ Use environment-specific secrets for staging/production

## Updating Your App

To deploy updates:

```bash
cd backend
git pull origin main
flyctl deploy
```

Or set up CI/CD:
- GitHub Actions
- GitLab CI
- Or use Fly.io's GitHub integration

## Next Steps

After Fly.io deployment:
1. ✅ Verify health endpoint works
2. ✅ Test Telegram bot commands
3. ✅ Update frontend API URL
4. ✅ Configure Telegram bot web app URL
5. ✅ Test end-to-end functionality
6. ✅ Monitor logs and performance


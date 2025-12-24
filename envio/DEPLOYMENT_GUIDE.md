# Envio Indexer Deployment Guide

## ⚠️ Important: Deployment Process

I cannot directly deploy to Envio for you (requires your GitHub account and Envio dashboard access), but I've prepared everything you need. Follow these steps:

## Prerequisites

1. **Node.js v22+** installed
2. **pnpm v8+** installed (`npm install -g pnpm`)
3. **Docker Desktop** running
4. **GitHub Account** (for deployment)
5. **Envio Account** (sign up at https://app.envio.dev)

## Step 1: Install Prerequisites

```bash
# Install pnpm if not installed
npm install -g pnpm

# Verify versions
node --version  # Should be v22+
pnpm --version  # Should be v8+
```

## Step 2: Initialize Envio Indexer

The current setup uses a TypeScript config, but Envio may require YAML. Let's check and update:

```bash
cd envio

# Try to initialize (this will create proper structure if needed)
pnpx envio init
```

**If prompted:**
- Choose **"Template"** or **"Custom"**
- Select **Sepolia** network
- Enter contract addresses when asked

## Step 3: Update Configuration

If Envio creates `config.yaml`, we may need to migrate our TypeScript config. The handlers should work as-is.

## Step 4: Test Locally

```bash
# Make sure Docker Desktop is running
pnpm dev
```

This will:
- Start local indexer
- Open Hasura dashboard
- Allow you to test queries

## Step 5: Deploy to Envio Hosted Service

### 5.1 Connect GitHub

1. Go to https://app.envio.dev
2. Log in with GitHub
3. Select your organization
4. Install **"Envio Deployments"** GitHub App
5. Grant access to your `minties` repository

### 5.2 Create Deployment

1. In Envio dashboard, click **"Add Indexer"**
2. Connect to your GitHub repository
3. Configure:
   - **Config file**: `envio/config.yaml` (or `envio/config.ts` if using TS)
   - **Root directory**: `envio/`
   - **Deployment branch**: `main` (or your preferred branch)
4. Click **"Create Deployment"**

### 5.3 Deploy via Git

```bash
# Make sure all changes are committed
git add .
git commit -m "Add Envio indexer configuration"
git push origin main
```

Envio will automatically:
- Detect the push
- Build the indexer
- Deploy it
- Start indexing

## Step 6: Monitor Deployment

1. Go to Envio dashboard
2. Check deployment status
3. Monitor:
   - Active deployments
   - Deployment status
   - Recent commits
   - Usage statistics
   - Network progress
   - Events processed

## Step 7: Get API Endpoint

Once deployed:
1. Go to your indexer in Envio dashboard
2. Find **"API Endpoint"** or **"GraphQL URL"**
3. Copy the URL
4. Add to `backend/.env`:
   ```env
   ENVIO_API_URL=https://your-indexer.envio.dev/v1/graphql
   ```

## Troubleshooting

### "pnpx command not found"
```bash
npm install -g pnpm
```

### "Docker not running"
- Start Docker Desktop
- Wait for it to fully start
- Try again

### "Config file not found"
- Check if Envio created `config.yaml`
- If using TypeScript, may need to convert to YAML
- See Envio docs for config format

### "Deployment failed"
- Check GitHub App permissions
- Verify branch name matches
- Check Envio dashboard logs
- Ensure all files are committed

## Alternative: Manual Setup

If the automated setup doesn't work, you can:

1. **Use Envio Quickstart**:
   ```bash
   pnpx envio init
   # Choose "Quickstart"
   # Enter your contract addresses
   ```

2. **Copy our handlers** into the generated structure

3. **Update schema** to match our entities

## Next Steps After Deployment

1. ✅ Wait for initial sync (check dashboard)
2. ✅ Test GraphQL queries
3. ✅ Update `ENVIO_API_URL` in backend
4. ✅ Test API endpoints
5. ✅ Integrate into frontend

## Need Help?

- [Envio Documentation](https://docs.envio.dev)
- [Envio Discord](https://discord.gg/envio)
- Check deployment logs in Envio dashboard


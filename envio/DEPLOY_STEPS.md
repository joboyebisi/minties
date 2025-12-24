# Step-by-Step Deployment Instructions

## What I've Prepared For You

✅ Complete indexer configuration (`config.ts`)
✅ Event handlers for all contracts
✅ Schema definitions
✅ Package.json with scripts
✅ TypeScript configuration

## What You Need To Do

Since deployment requires your GitHub account and Envio dashboard access, here's exactly what to do:

### Step 1: Check Prerequisites

```powershell
# Check Node.js version (need v22+)
node --version

# Install pnpm if needed
npm install -g pnpm

# Check pnpm version (need v8+)
pnpm --version

# Make sure Docker Desktop is installed and running
```

### Step 2: Navigate to Envio Directory

```powershell
cd envio
```

### Step 3: Install Dependencies

```powershell
pnpm install
```

### Step 4: Create .env File

Create `envio/.env` with:
```env
GIFT_ESCROW_ADDRESS=0xYourDeployedAddress
SAVINGS_CIRCLE_ADDRESS=0xYourDeployedAddress
GIFT_ESCROW_START_BLOCK=0
SAVINGS_CIRCLE_START_BLOCK=0
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

### Step 5: Test Locally (Optional)

```powershell
# Make sure Docker Desktop is running first!
pnpm dev
```

This will:
- Start local indexer
- Open Hasura dashboard at http://localhost:8080
- Let you test queries

### Step 6: Deploy to Envio

1. **Go to Envio Dashboard**
   - Visit https://app.envio.dev
   - Sign in with GitHub

2. **Install GitHub App**
   - Click "Install Envio Deployments"
   - Grant access to your `minties` repository

3. **Create New Indexer**
   - Click "Add Indexer"
   - Select your GitHub repository
   - Configure:
     - **Config File**: `envio/config.ts` (or `config.yaml` if Envio creates it)
     - **Root Directory**: `envio/`
     - **Branch**: `main` (or your default branch)

4. **Push to GitHub**
   ```powershell
   # From project root
   git add envio/
   git commit -m "Add Envio indexer configuration"
   git push origin main
   ```

5. **Monitor Deployment**
   - Watch Envio dashboard
   - Check deployment status
   - Wait for initial sync

### Step 7: Get API Endpoint

Once deployed:
1. Go to your indexer in Envio dashboard
2. Find "API Endpoint" or "GraphQL URL"
3. Copy the URL
4. Add to `backend/.env`:
   ```env
   ENVIO_API_URL=https://your-indexer-url.envio.dev/v1/graphql
   ```

## If Envio Uses Different Format

If `pnpx envio init` creates different files (like `config.yaml` instead of `config.ts`):

1. **Keep our handlers** - they should work
2. **Convert schema** - match our entities
3. **Update config** - point to our handlers

## Quick Reference

```powershell
# Install
cd envio
pnpm install

# Test locally
pnpm dev

# Build
pnpm build

# Deploy (via GitHub push)
git add .
git commit -m "Deploy indexer"
git push origin main
```

## Troubleshooting

**"pnpx not found"**
→ `npm install -g pnpm` then try again

**"Docker error"**
→ Start Docker Desktop, wait 30 seconds

**"Config not found"**
→ May need to run `pnpx envio init` first

**"Deployment failed"**
→ Check GitHub App permissions, verify branch

## Need Help?

- Check `DEPLOYMENT_GUIDE.md` for detailed steps
- Check `QUICK_DEPLOY.md` for checklist
- Envio Docs: https://docs.envio.dev
- Envio Dashboard: https://app.envio.dev


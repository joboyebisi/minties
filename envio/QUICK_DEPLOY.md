# Quick Deploy Checklist

## ✅ Pre-Deployment Checklist

- [ ] Node.js v22+ installed
- [ ] pnpm v8+ installed (`npm install -g pnpm`)
- [ ] Docker Desktop installed and running
- [ ] GitHub account ready
- [ ] Envio account created (https://app.envio.dev)
- [ ] Contracts deployed to Sepolia
- [ ] Contract addresses ready

## 🚀 Deployment Steps

### 1. Install Dependencies
```bash
cd envio
pnpm install
```

### 2. Initialize (if needed)
```bash
pnpx envio init
# Follow prompts, or skip if config already exists
```

### 3. Set Environment Variables
Create `envio/.env`:
```env
GIFT_ESCROW_ADDRESS=0x...
SAVINGS_CIRCLE_ADDRESS=0x...
GIFT_ESCROW_START_BLOCK=12345678
SAVINGS_CIRCLE_START_BLOCK=12345678
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

### 4. Test Locally
```bash
pnpm dev
# Should open Hasura dashboard
# Test queries in GraphQL playground
```

### 5. Deploy to Envio
1. Go to https://app.envio.dev
2. Log in with GitHub
3. Install Envio Deployments GitHub App
4. Click "Add Indexer"
5. Connect your repository
6. Set config path: `envio/config.yaml` (or `config.ts`)
7. Set root directory: `envio/`
8. Set branch: `main`
9. Push to GitHub:
   ```bash
   git add .
   git commit -m "Deploy Envio indexer"
   git push origin main
   ```

### 6. Get API URL
- Check Envio dashboard
- Copy GraphQL endpoint
- Add to `backend/.env`:
  ```env
  ENVIO_API_URL=https://your-indexer.envio.dev/v1/graphql
  ```

## ⚡ Quick Commands

```bash
# Local development
pnpm dev

# Build
pnpm build

# Check status
pnpx envio status

# View logs
# (Check Envio dashboard)
```

## 🐛 Common Issues

**"Cannot find module"**
→ Run `pnpm install` in `envio/` directory

**"Docker not running"**
→ Start Docker Desktop, wait 30 seconds, try again

**"Config not found"**
→ May need to run `pnpx envio init` first

**"Deployment failed"**
→ Check GitHub App permissions, verify branch name

## 📞 Support

- Envio Docs: https://docs.envio.dev
- Envio Dashboard: https://app.envio.dev
- Check deployment logs in dashboard


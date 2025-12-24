# Envio Indexer Setup Guide

This guide will help you set up Envio to index your Minties smart contract events.

## Prerequisites

1. ✅ Contracts deployed to Sepolia
2. ✅ Contract addresses from deployment
3. ✅ Envio account (sign up at https://envio.dev)
4. ✅ Sepolia RPC endpoint (Infura, Alchemy, or public RPC)

## Quick Setup

### Step 1: Install Envio CLI (if not installed)

```bash
npm install -g @envio-dev/envio-cli
```

Or use npx:
```bash
npx @envio-dev/envio-cli
```

### Step 2: Navigate to Envio Directory

```bash
cd envio
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in:
   - `RPC_URL`: Your Sepolia RPC URL
   - `GIFT_ESCROW_ADDRESS`: From contract deployment
   - `SAVINGS_CIRCLE_ADDRESS`: From contract deployment
   - `ENVIO_API_KEY`: From Envio dashboard

### Step 5: Deploy Contracts First

**Important**: You must deploy contracts before setting up the indexer.

```bash
cd ../contracts
npm run deploy:sepolia
```

Copy the deployed addresses to `envio/.env`.

### Step 6: Generate Types

```bash
cd envio
npm run codegen
```

### Step 7: Build and Deploy

```bash
npm run build
npm run start
```

## What Gets Indexed?

The indexer automatically tracks:

### Gift Events
- ✅ Gift creation
- ✅ Gift claims
- ✅ Gift cancellations
- ✅ Gift expirations

### Circle Events
- ✅ Circle creation
- ✅ Member joins
- ✅ Contributions
- ✅ Fund locking/unlocking
- ✅ Withdrawals

## Integration

Once indexed, query data via:
- **GraphQL API**: Provided by Envio
- **REST API**: Provided by Envio
- **Dashboard**: View at https://envio.dev

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `RPC_URL` | Sepolia RPC endpoint | Yes |
| `GIFT_ESCROW_ADDRESS` | Deployed GiftEscrow address | Yes |
| `SAVINGS_CIRCLE_ADDRESS` | Deployed SavingsCircle address | Yes |
| `GIFT_ESCROW_START_BLOCK` | Deployment block (optional) | No |
| `SAVINGS_CIRCLE_START_BLOCK` | Deployment block (optional) | No |
| `ENVIO_API_KEY` | Envio API key | Yes |

## Troubleshooting

See `envio/README.md` for detailed troubleshooting.

## Next Steps

After Envio is set up:
1. ✅ Test queries in Envio dashboard
2. ✅ Integrate queries into backend API
3. ✅ Add Envio queries to frontend (if needed)
4. ✅ Monitor indexer health

For detailed information, see `envio/README.md`.


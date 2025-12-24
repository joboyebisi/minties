# Envio Dashboard Setup Guide

## Understanding Envio Dashboard

Based on your dashboard view, Envio projects are likely created by:

1. **Connecting a GitHub Repository** first
2. **Then creating an indexer** that deploys from that repo

## Step-by-Step Dashboard Setup

### Step 1: Connect GitHub Repository

1. In the Envio dashboard, look for:
   - **"Connect Repository"** button
   - **"Add Indexer"** button
   - **"New"** or **"Create"** button
   - Settings/Integrations section

2. If you see **"Install GitHub App"** or similar:
   - Click it
   - Grant access to your `minties` repository
   - This connects your GitHub repo to Envio

### Step 2: Create Indexer from Repository

After connecting GitHub:
1. Look for **"Add Indexer"** or **"New Indexer"** button
2. Select your connected repository
3. Envio will look for indexer configuration files

### Step 3: Configure Indexer

Envio will need:
- **Config file location**: `envio/config.ts` or `envio/config.yaml`
- **Root directory**: `envio/`
- **Network**: Sepolia
- **Contract addresses**: From your `.env` or deployment

## Alternative: Use Direct Event Queries

If Envio dashboard setup is too complex, we can:

1. **Use ethers.js directly** (already set up)
2. **Query events on-demand** from contracts
3. **Cache results** in Supabase
4. **No indexer needed** - simpler approach

This would be faster to implement and doesn't require Envio setup.

## Recommendation

Given the dashboard complexity, I recommend:

**Option A: Simple Event Queries** (Recommended)
- Use ethers.js to query events directly
- Cache in Supabase
- No external indexer needed
- Works immediately

**Option B: Continue with Envio**
- Try to find "Add Indexer" or "Connect Repository" in dashboard
- Or contact Envio support for project creation

Which would you prefer?


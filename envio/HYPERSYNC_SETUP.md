# Envio HyperSync Client Setup

## Understanding Envio

Based on the documentation, **Envio HyperSync** is a **client library** for efficiently querying blockchain data, not a hosted indexer service. It's similar to a fast RPC client.

## Correct Approach: Use HyperSync Client

Instead of deploying an indexer, we'll use the **`hypersync-client-node`** package to query blockchain data directly.

### Step 1: Install HyperSync Client

```powershell
cd envio
npm install hypersync-client-node
```

### Step 2: Update Package.json

The package.json should use the actual HyperSync client, not a non-existent indexer package.

### Step 3: Create HyperSync Query Service

We'll create a service that uses HyperSync to query events directly from the blockchain, which is much faster than standard RPC calls.

## What This Means

- ✅ **No deployment needed** - it's a client library
- ✅ **No dashboard setup** - query blockchain directly
- ✅ **Faster queries** - HyperSync is optimized for speed
- ✅ **Works immediately** - no waiting for indexing

## Next Steps

1. Install `hypersync-client-node`
2. Create query service using HyperSync
3. Update backend to use HyperSync queries
4. No deployment needed!


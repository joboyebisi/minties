# Migration Guide: Ethers.js → Envio HyperSync

## Current Setup

We're currently using **ethers.js** for event queries via `backend/src/services/eventQuery.ts`.

## Why Migrate to HyperSync?

- ✅ **Much faster** - HyperSync is optimized for bulk queries
- ✅ **Lower RPC costs** - More efficient data transfer
- ✅ **Better performance** - Especially for large block ranges
- ✅ **Same interface** - Easy migration path

## Migration Steps

### Step 1: Install HyperSync Client

```powershell
cd backend
npm install hypersync-client-node
```

**Note**: The package is available from GitHub. You may need to install from the GitHub repo:

```powershell
npm install https://github.com/enviodev/hypersync-client-node.git
```

Or if published to npm:
```powershell
npm install @envio/hypersync-client-node
```

### Step 2: Add Environment Variable

Add to `backend/.env`:
```env
USE_HYPERSYNC=true
HYPERSYNC_URL=https://eth.hypersync.xyz  # Or Sepolia endpoint
# HYPERSYNC_API_KEY=your_key_if_needed
```

### Step 3: Uncomment HyperSync Code

In `backend/src/services/eventQuery.ts`:

1. **Uncomment imports**:
   ```typescript
   import { Client, createClient } from 'hypersync-client-node';
   ```

2. **Uncomment client initialization**:
   ```typescript
   let hypersyncClient: Client | null = null;
   
   function getHypersyncClient(): Client {
     // ... (already in file, just uncomment)
   }
   ```

3. **Uncomment HyperSync implementations**:
   - `queryGiftCreatedEventsHypersync()`
   - Similar functions for other events

4. **Update function calls**:
   The abstraction layer already handles switching - just set `USE_HYPERSYNC=true`

### Step 4: Test Migration

1. **Test with small block range**:
   ```typescript
   const events = await queryGiftCreatedEvents(1000000, 1000100);
   ```

2. **Compare results** with ethers.js version

3. **Monitor performance** - HyperSync should be faster

### Step 5: Update All Event Queries

The abstraction layer means all existing code continues to work. Just:

1. Set `USE_HYPERSYNC=true`
2. Restart backend
3. All queries automatically use HyperSync

## Code Structure

The `eventQuery.ts` file is designed for easy migration:

```typescript
// Current: Uses ethers.js
export async function queryGiftCreatedEvents(...) {
  if (USE_HYPERSYNC) {
    return await queryGiftCreatedEventsHypersync(...);
  }
  return await queryGiftCreatedEventsEthers(...);
}
```

## HyperSync API Reference

Based on the GitHub examples, HyperSync queries look like:

```typescript
const query = {
  fromBlock: 0,
  toBlock: "latest",
  logs: [{
    address: [CONTRACT_ADDRESS],
    topics: [EVENT_TOPIC],
  }],
  fieldSelection: {
    log: { /* fields */ },
    transaction: { /* fields */ },
    block: { /* fields */ },
  },
};

const response = await client.sendReq(query);
```

## Benefits After Migration

1. **Faster queries** - Especially for large ranges
2. **Lower costs** - More efficient than multiple RPC calls
3. **Better scalability** - Handles high-volume queries better
4. **Same interface** - No changes needed in calling code

## Rollback Plan

If you need to rollback:

1. Set `USE_HYPERSYNC=false` in `.env`
2. Restart backend
3. Everything switches back to ethers.js automatically

## Testing Checklist

- [ ] Install HyperSync package
- [ ] Set `USE_HYPERSYNC=true`
- [ ] Uncomment HyperSync code
- [ ] Test queryGiftCreatedEvents
- [ ] Test queryGiftClaimedEvents
- [ ] Test queryCircleCreatedEvents
- [ ] Test queryContributionEvents
- [ ] Test getUserActivity
- [ ] Compare performance with ethers.js
- [ ] Verify results match

## Current Status

✅ **Abstraction layer ready** - Easy to switch
✅ **Ethers.js working** - Current implementation
⏳ **HyperSync code prepared** - Just needs uncommenting
⏳ **Package installation** - Need to install from GitHub

## Next Steps

1. Install `hypersync-client-node` package
2. Uncomment HyperSync code in `eventQuery.ts`
3. Set `USE_HYPERSYNC=true`
4. Test and verify

The migration path is ready - just flip the switch when you're ready!


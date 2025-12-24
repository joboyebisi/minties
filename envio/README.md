# Event Querying for Minties

## ⚠️ Important: Envio Not Needed

After investigation, we've determined that **Envio setup is too complex** and the packages aren't readily available. 

## ✅ Better Solution: Direct Event Queries

Instead of using Envio, we're using **direct event queries** with ethers.js, which is:

- ✅ **Simpler** - No external indexer needed
- ✅ **Works immediately** - Uses existing ethers.js
- ✅ **More control** - Query exactly what you need
- ✅ **No setup required** - Already integrated

## Implementation

The event querying is implemented in:

**`backend/src/services/events.ts`**

This service provides:
- ✅ Query GiftCreated events
- ✅ Query GiftClaimed events
- ✅ Query CircleCreated events
- ✅ Query ContributionMade events
- ✅ Get user activity across all contracts
- ✅ Filter by address, gift ID, circle ID

## Usage

The event queries are integrated into your backend and can be used via:

1. **Direct import** in your routes:
   ```typescript
   import { queryGiftCreatedEvents, getUserActivity } from '../services/events.js';
   ```

2. **API routes** - Can be added to your existing routes

3. **Caching** - Optionally cache results in Supabase for performance

## Performance

For better performance:
- Cache events in Supabase as they happen
- Query incrementally (only new events since last query)
- Use background jobs to sync events periodically

## Files

- `backend/src/services/events.ts` - Event query service (✅ Ready to use)
- `backend/src/services/eventQuery.ts` - Event query abstraction with HyperSync support

## Next Steps

1. ✅ Event queries are ready in `backend/src/services/events.ts`
2. ⏳ Create API routes that use these functions (if needed)
3. ⏳ Optionally add Supabase caching for performance

**No Envio setup needed - everything works with ethers.js!**

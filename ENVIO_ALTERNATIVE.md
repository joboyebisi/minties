# Alternative to Envio: Direct Event Queries

## The Situation

Envio dashboard doesn't have a clear "Create Project" option, and the setup is complex. 

## Better Solution: Direct Event Queries

Instead of using Envio (which requires complex setup), we can:

✅ **Query events directly** using ethers.js (already installed)
✅ **Cache results** in Supabase (already set up)
✅ **No external indexer needed**
✅ **Works immediately** - no deployment required

## What I've Created

I've created `backend/src/services/events.ts` which:

- ✅ Queries GiftCreated events
- ✅ Queries GiftClaimed events  
- ✅ Queries CircleCreated events
- ✅ Queries ContributionMade events
- ✅ Gets user activity across all contracts
- ✅ Filters by address, gift ID, circle ID, etc.

## Benefits

1. **Simpler** - No indexer setup needed
2. **Faster to implement** - Uses existing ethers.js
3. **More control** - Query exactly what you need
4. **No external dependencies** - Everything in your backend
5. **Caching** - Can cache in Supabase for performance

## Performance Optimization

For better performance, you can:

1. **Cache events in Supabase** - Store events as they happen
2. **Query incrementally** - Only fetch new events since last query
3. **Background jobs** - Periodically sync events to database

## Next Steps

1. ✅ Use `backend/src/services/events.ts` for queries
2. ✅ Create API routes that use these functions
3. ✅ Optionally cache in Supabase
4. ✅ No Envio setup needed!

This approach is simpler and works immediately. Should I integrate this into your existing API routes?


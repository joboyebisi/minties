# How to Get Envio API Endpoint

## Finding Your Envio API URL

After deploying your Envio indexer, you need to get the GraphQL API endpoint to query indexed data.

### Step 1: Deploy Indexer to Envio

1. Go to https://envio.dev
2. Sign in to your account
3. Create a new project (or select existing)
4. Deploy your indexer using:
   ```bash
   cd envio
   npm run start
   ```
   Or use Envio CLI:
   ```bash
   envio deploy
   ```

### Step 2: Get API Endpoint

Once your indexer is deployed and running, you can find your API endpoint in one of these places:

#### Option A: Envio Dashboard
1. Go to your project dashboard on https://envio.dev
2. Look for **"API Endpoint"** or **"GraphQL URL"**
3. It will look like: `https://indexer.envio.dev/v1/graphql` or similar
4. Copy this URL

#### Option B: Envio CLI
```bash
envio status
```
This should show your deployed indexer's API endpoint.

#### Option C: Check Deployment Output
When you run `npm run start` or `envio deploy`, the output should include the API endpoint URL.

### Step 3: Set Environment Variables

Add to your backend `.env` file:

```env
ENVIO_API_URL=https://your-indexer-url.envio.dev/v1/graphql
ENVIO_API_KEY=your_api_key_here  # If required
```

### Step 4: Verify API Works

Test the API endpoint:

```bash
curl -X POST https://your-indexer-url.envio.dev/v1/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ gifts(first: 1) { id } }"}'
```

## Alternative: Using Envio's Public GraphQL Playground

Some Envio deployments provide a GraphQL playground where you can:
1. Test queries interactively
2. View the schema
3. Get example queries

Look for a **"Playground"** or **"GraphiQL"** link in your Envio dashboard.

## If You Can't Find the API URL

1. **Check Envio Documentation**: https://docs.envio.dev
2. **Contact Envio Support**: Through their dashboard or Discord
3. **Check Deployment Logs**: The API URL might be in the deployment output
4. **Use Envio CLI**: Run `envio list` or `envio status` to see your deployments

## Note on API Structure

Envio typically provides:
- **GraphQL Endpoint**: For querying indexed data
- **REST Endpoint**: Alternative API (if available)
- **WebSocket**: For real-time subscriptions (if available)

The GraphQL endpoint is what we're using in `backend/src/services/envio.ts`.

## Testing Your Setup

Once you have the API URL, test it:

```typescript
// In backend/src/services/envio.ts, the queryEnvio function will use:
// process.env.ENVIO_API_URL

// Test endpoint:
GET /api/envio/stats
// Should return platform statistics if indexer is working
```

## Troubleshooting

### "Envio API URL not configured"
- Make sure `ENVIO_API_URL` is set in your `.env` file
- Restart your backend server after adding the variable

### "Envio query failed"
- Verify the API URL is correct
- Check if your indexer is running and synced
- Verify API key if authentication is required
- Check Envio dashboard for indexer status

### "No data returned"
- Indexer might still be syncing (check sync status in dashboard)
- Contract addresses might be incorrect
- Start block might be too high (check deployment block)

## Next Steps

After getting your API URL:
1. ✅ Add `ENVIO_API_URL` to backend `.env`
2. ✅ Add `ENVIO_API_KEY` if required
3. ✅ Test with `/api/envio/stats` endpoint
4. ✅ Start using Envio queries in your application


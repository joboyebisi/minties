# Alternative Envio Setup (Web Dashboard)

Since the Envio CLI has Windows compatibility issues, here's how to set up using the **web dashboard**:

## ✅ What We Have Ready

- ✅ All event handlers written
- ✅ Schema definitions
- ✅ Contract ABIs (in `contracts/artifacts/`)
- ✅ Backend integration code

## 🚀 Setup via Web Dashboard

### Step 1: Prepare Contract ABIs

You'll need the compiled contract ABIs:

```powershell
# From project root
cd contracts
npm run compile
```

The ABIs will be in:
- `contracts/artifacts/contracts/GiftEscrow.sol/GiftEscrow.json`
- `contracts/artifacts/contracts/SavingsCircle.sol/SavingsCircle.json`

### Step 2: Go to Envio Dashboard

1. Visit https://app.envio.dev
2. Sign in with GitHub
3. Create a new project/organization

### Step 3: Create Indexer

1. Click **"Add Indexer"** or **"New Indexer"**
2. Choose **"Custom"** or **"From Contract"**
3. Upload your contract ABIs:
   - GiftEscrow.json
   - SavingsCircle.json

### Step 4: Configure Events

For each contract, select events to index:

**GiftEscrow:**
- ✅ GiftCreated
- ✅ GiftClaimed
- ✅ GiftCancelled
- ✅ GiftExpired

**SavingsCircle:**
- ✅ CircleCreated
- ✅ MemberJoined
- ✅ ContributionMade
- ✅ FundsLocked
- ✅ FundsUnlocked
- ✅ Withdrawal

### Step 5: Configure Network

- Network: **Sepolia**
- RPC URL: Your Sepolia RPC endpoint
- Start Block: Deployment block (or 0)

### Step 6: Set Contract Addresses

Add your deployed contract addresses:
- GiftEscrow: `0x...`
- SavingsCircle: `0x...`

### Step 7: Define Schema

In the dashboard, define entities matching our schema:

**Gift Entity:**
- id (string)
- creator (string)
- amount (bigint)
- remainingAmount (bigint)
- giftType (string)
- maxClaims (int)
- currentClaims (int)
- expiryTime (bigint)
- isActive (boolean)
- createdAt (datetime)

**GiftClaim Entity:**
- id (string)
- giftId (string)
- claimer (string)
- amount (bigint)
- timestamp (datetime)
- txHash (string)

**SavingsCircle Entity:**
- id (string)
- creator (string)
- targetAmount (bigint)
- lockPeriod (bigint)
- yieldPercentage (int)
- totalContributed (bigint)
- lockedAmount (bigint)
- lockStartTime (bigint)
- lockEndTime (bigint)
- cycleNumber (int)
- isActive (boolean)
- createdAt (datetime)

**Contribution Entity:**
- id (string)
- circleId (string)
- member (string)
- amount (bigint)
- cycleNumber (int)
- timestamp (datetime)
- txHash (string)

### Step 8: Configure Handlers

For each event, map to entity updates. Our handlers in `handlers/` show the logic.

### Step 9: Deploy

1. Review configuration
2. Click **"Deploy"**
3. Wait for deployment
4. Monitor sync status

### Step 10: Get API Endpoint

Once deployed:
1. Go to indexer dashboard
2. Find **"API Endpoint"** or **"GraphQL URL"**
3. Copy the URL
4. Add to `backend/.env`:
   ```env
   ENVIO_API_URL=https://your-indexer.envio.dev/v1/graphql
   ```

## 📝 Notes

- The web dashboard may have a different interface
- Follow the on-screen instructions
- You can reference our handlers for logic
- Schema should match our definitions

## ✅ After Deployment

1. Wait for initial sync
2. Test GraphQL queries
3. Update backend env vars
4. Test API endpoints

This approach bypasses CLI issues entirely!


# Minties Feature Implementation PRD
**Version:** 1.0  
**Date:** 2025-01-XX  
**Status:** In Progress

## Overview
This PRD outlines the comprehensive implementation of multi-step flows, wallet enhancements, swap/bridge functionality, Telegram bot improvements, and robust MetaMask integration for the Minties application.

## Goals
1. Implement intuitive multi-step UI/UX flows for core features
2. Add multi-token, multi-chain wallet balance display
3. Integrate swap and bridge functionality (Uniswap, Wormhole, Circle CCTP)
4. Enhance Telegram bot with native features (menu button, slash commands, seamless navigation)
5. Implement robust MetaMask features (gasless, advanced permissions, smart wallet, delegations)
6. Ensure all transfers work correctly with proper security and permissions

---

## 1. Multi-Step Flows

### 1.1 Savings Circle Flow (4 Steps)

**Step 1: Create Circle**
- User inputs target amount (USDC)
- User inputs lock period (weeks/months)
- Optional: Set yield percentage
- Generate unique Circle ID
- Validate inputs

**Step 2: Add Participants**
- Display Circle ID for sharing
- Input participants (wallet addresses or Telegram handles)
- Show participant count
- Validate addresses
- Optional: Set individual contribution amounts

**Step 3: Setup Vault**
- Review circle configuration
- Confirm target amount and participant list
- Setup smart contract vault (if not auto-created)
- Initialize recurring contribution permissions (optional)
- Transaction confirmation

**Step 4: Success & Share**
- Display congratulations message
- Show Circle ID prominently
- Generate shareable link (Telegram-friendly)
- Show QR code for easy sharing
- Option to setup recurring withdrawals
- Display circle dashboard preview

**Join Circle Flow (Similar, 3 steps)**
1. Enter Circle ID
2. Review circle details
3. Join & contribute initial amount

---

### 1.2 MoneyBox Flow (5 Steps)

**Step 1: Set Goal**
- Input target amount (USDC)
- Input name/title for the goal
- Input timeline (months)
- Show projected yield preview

**Step 2: Configure Recurring**
- Set monthly contribution amount
- Select frequency (daily/weekly/monthly)
- Preview schedule
- Setup MetaMask Advanced Permissions for recurring transfers

**Step 3: Aave Integration**
- Choose yield option (enable/disable Aave)
- Show APY estimate
- Confirm gas costs
- Preview projected total with yield

**Step 4: Review & Confirm**
- Review all settings
- Display summary (amount, frequency, yield, timeline)
- Confirm wallet connection
- Transaction preview

**Step 5: Success**
- Display goal created confirmation
- Show goal dashboard
- Link to view/manage goal
- Option to share goal progress

---

### 1.3 Gift Flow (2 variants)

#### Send Gift Flow (4 Steps)

**Step 1: Recipient & Amount**
- Input recipient (wallet address, Telegram handle, or email)
- Input gift amount (USDC)
- Choose gift type (one-time or recurring)
- Optional: Add message/card

**Step 2: Gift Configuration**
- If recurring: Set frequency (daily/weekly/monthly)
- If recurring: Set duration (# of periods)
- Set expiry date (if applicable)
- Preview gift details

**Step 3: Create Gift Link**
- Generate unique claimable link
- Show QR code
- Preview gift card
- Confirm transaction

**Step 4: Share & Success**
- Display success message
- Show shareable link
- Show QR code
- Share options (copy link, Telegram, email)
- Link to gift tracking

#### Claim Gift Flow (2 Steps)

**Step 1: Enter Gift Link**
- Input or scan gift link/QR code
- Validate link
- Display gift details (amount, sender, expiry)
- Check claim status

**Step 2: Claim Gift**
- Connect wallet (if not connected)
- Review gift details
- Confirm claim transaction
- Success message with transaction hash

---

## 2. Wallet Enhancements

### 2.1 Multi-Token Balance Display

**Requirements:**
- Display balances for all tokens on all connected chains
- Support major tokens: USDC, ETH, WETH, DAI, etc.
- Show token icons
- Show formatted amounts with decimals
- Show USD equivalent (fetch from price oracle)
- Group by chain
- Refresh button
- Loading states

**Chains to Support:**
- Sepolia (Primary)
- Polygon (Future)
- Base (Future)
- Arbitrum (Future)

**Implementation:**
- Create `useMultiChainBalances` hook
- Use wagmi's `useBalance` and `useToken` hooks
- Fetch token lists per chain
- Cache token metadata (icons, decimals, symbols)
- Price oracle integration (CoinGecko or similar)

### 2.2 Wallet View Component & User Dashboard

**Location:** `/connect` page, Dashboard, and `WalletStatus`

**Features:**
- **Identity:** Welcome user by Telegram name (if available) or Wallet ID (e.g., "Welcome, 0x123...").
- **Balances:** Display real-time balances for ETH and supported tokens (USDC, DAI).
  - Show "Preparing wallet..." only during actual connection.
  - Help text if balance is low or network is wrong.
- **Activity Feed:** 
  - Pull real data from Envio/Supabase.
  - If empty, show "You don't have any activities yet, start one by [Action]"
- **Integration:** 
  - Back button on all detailed views.
  - Sticky/Fixed Navbar for consistent navigation.

### 2.3 Onboarding Improvements

**Features:**
- **Default Goal:** Auto-create a sample "Dream Vacation" MoneyBox for new users.
  - Allow customization or deletion.
  - Serve as a tutorial/template.
- **Smart Account Identity:** Verify if MetaMask Smart Account provides a label/name, otherwise fallback to Telegram/Address.

---

## 3. Swap & Bridge Integration


---

## 3. Swap & Bridge Integration

### 3.1 Swap Integration (Uniswap)

**Requirements:**
- Integrate Uniswap V3 SDK or use Uniswap Router directly
- Support swapping any token to USDC
- Show swap rate and slippage
- Gas estimation
- Transaction confirmation
- Error handling

**Implementation:**
- Create `SwapForm` component
- Use Uniswap Router contract
- Calculate optimal swap path
- Show preview before confirmation
- Handle approval for non-USDC tokens
- Integration with wallet connection

**UI Flow:**
1. Select token to swap FROM
2. Enter amount
3. Select token to swap TO (default: USDC)
4. Preview swap (rate, fees, slippage)
5. Approve token (if needed)
6. Execute swap
7. Success confirmation

### 3.2 Bridge Integration

#### Wormhole Bridge

**Requirements:**
- Bridge USDC between chains
- Support Sepolia → Polygon, Base, Arbitrum
- Show bridge time estimates
- Transaction tracking
- Status updates

**Implementation:**
- Integrate Wormhole SDK
- Handle source chain lock
- Track bridge status
- Handle destination chain claim

#### Circle CCTP (Cross-Chain Transfer Protocol)

**Requirements:**
- Bridge USDC using Circle's native bridge
- Lower fees than Wormhole for USDC
- Faster bridge times
- Official Circle integration

**Implementation:**
- Use Circle CCTP SDK
- Handle deposit and burn on source chain
- Handle mint on destination chain
- Status tracking

**API Keys Required:**
- Circle CCTP API key (to be provided)

**UI Flow:**
1. Select source chain
2. Select destination chain
3. Enter amount to bridge
4. Preview bridge (fees, time estimate)
5. Execute bridge transaction
6. Track bridge status
7. Claim on destination chain (if needed)

---

## 4. Telegram Bot Enhancements

### 4.1 Menu Button

**Requirements:**
- Set bot menu button to open Mini App
- Button should be persistent in chat
- Configure via Bot API

**Implementation:**
- Use `bot.setChatMenuButton()` API
- Set button text: "Open Minties"
- Link to Mini App URL

### 4.2 Slash Commands Menu

**Requirements:**
- Configure bot commands via BotFather or programmatically
- Commands should appear when user types "/"
- Commands should have descriptions

**Commands to Register:**
- `/start` - Welcome message and open Mini App
- `/webapp` or `/app` - Open Mini App
- `/gift` - Gift commands menu
- `/circle` - Savings circle commands
- `/wallet` - Wallet commands
- `/help` - Show all commands

**Implementation:**
- Use `bot.setMyCommands()` API
- Group commands by category
- Add descriptions for each command

### 4.3 Seamless Bot-to-Mini-App Navigation

**Requirements:**
- Deep linking from bot commands to specific Mini App pages
- Pass context/data from bot to Mini App
- Return to bot after Mini App actions
- Handle Mini App data callbacks

**Implementation:**
- Use `web_app` parameter in inline keyboards
- Use query parameters for deep linking
- Handle `window.Telegram.WebApp.sendData()` in Mini App
- Process data in bot's message handler

**Examples:**
### 4.4 Feature Parity & Native Improvements

**Requirements:**
- **Contact Sync:** Allow users to share Telegram contacts with the bot, sync to Supabase, and display in WebApp for easy gifting/circle addition.
- **Menu Button Launch:** Ensure the Bot Menu Button opens the webapp directly (replacing `/start` dependency).
- **Deep Linking:** Robust handling of `startapp` params.

### 4.5 Business Logic Audit

**Goal:** Ensure verified completion of all planned features.
- [ ] **Transactions:** Verify UI calls `transactions.ts` with real contracts.
- [ ] **Permissions:** Verify recurring permissions are stored/redeemable.
- [ ] **Data:** Verify Activity Feed pulls from Indexer/DB.

### 4.4 Feature Parity & Native Improvements

**Requirements:**
- **Contact Sync:** Allow users to share Telegram contacts with the bot, sync to Supabase, and display in WebApp for easy gifting/circle addition.
- **Menu Button Launch:** Ensure the Bot Menu Button opens the webapp directly (replacing `/start` dependency).
- **Deep Linking:** Robust handling of `startapp` params.

### 4.5 Business Logic Audit

**Goal:** Ensure verified completion of all planned features.
- [ ] **Transactions:** Verify UI calls `transactions.ts` with real contracts.
- [ ] **Permissions:** Verify recurring permissions are stored/redeemable.
- [ ] **Data:** Verify Activity Feed pulls from Indexer/DB.

---

## 5. MetaMask Integration & Advanced Permissions

### 5.1 Gasless Transactions

**Requirements:**
- Use MetaMask Smart Accounts for gasless transactions
- Paymaster integration (Pimlico or similar)
- Gas sponsorship for specific operations
- User option to pay gas or use sponsorship

**Implementation:**
- Already using Smart Accounts via wagmi
- Configure paymaster in bundler client
- Handle gas sponsorship logic
- Show gas sponsorship status to user

### 5.2 Advanced Permissions (ERC-7715)

**Requirements:**
- Request periodic transfer permissions for recurring payments
- Store granted permissions
- Execute recurring transfers using permissions
- Revoke permissions capability
- Permission expiry handling

**Use Cases:**
1. **MoneyBox Recurring Contributions**
   - Monthly automatic contributions to savings goal
   - Permission: X USDC per month for Y months

2. **Savings Circle Recurring Contributions**
   - Weekly automatic contributions to circle
   - Permission: X USDC per week until goal reached

3. **Recurring Gifts**
   - Monthly/weekly gifts to recipient
   - Permission: X USDC per period for Y periods

**Implementation:**
- Use MetaMask Smart Accounts Kit (when available)
- Store permission signatures in Supabase
- Backend service to execute recurring transfers
- Permission validation before execution
- User dashboard to view/manage permissions

### 5.3 Smart Wallet Features

**Requirements:**
- Create Smart Account on first connection
- Session management
- Account recovery
- Multi-sig support (future)

**Implementation:**
- Already integrated via wagmi + Smart Accounts
- Ensure proper session handling
- Store account address in Supabase

### 5.4 Delegations

**Requirements:**
- Allow users to delegate permissions to contracts
- Delegate recurring transfer execution to backend
- Revocation mechanism
- Delegation expiration

**Implementation:**
- Use ERC-7715 delegation standards
- Create delegation signatures
- Store delegations in Supabase
- Backend service validates delegations

---

## 6. Transfer Implementation & Security

### 6.1 Wallet to Vault Transfers

**Requirements:**
- Transfer USDC from wallet to MoneyBox vault
- Transfer USDC from wallet to Savings Circle vault
- Approve token spending before transfer
- Transaction confirmation
- Error handling

**Implementation:**
- Use ERC-20 `approve` + `transferFrom`
- Or use vault contract's deposit function
- Handle approval gas costs
- Show transaction status

### 6.2 Vault to Aave Transfers

**Requirements:**
- Supply USDC from vault to Aave
- Track aToken balance
- Withdraw from Aave to vault
- Show yield earned
- Handle Aave interest accrual

**Implementation:**
- Use Aave V3 Pool contract
- Call `supply()` function
- Monitor aToken balance
- Calculate yield from aToken balance increase

### 6.3 Security Considerations

**Requirements:**
- Input validation on all forms
- Amount limits (min/max)
- Rate limiting on API endpoints
- Transaction replay protection
- Permission validation before execution
- Audit logs for all transactions

**Implementation:**
- Frontend validation
- Backend validation
- Use nonces for transactions
- Store transaction logs in Supabase
- Monitor for suspicious activity

---

## 7. Testing & Deployment

### 7.1 Testing Requirements

**Unit Tests:**
- Multi-step flow components
- Wallet balance fetching
- Swap calculations
- Bridge status tracking
- Permission validation

**Integration Tests:**
- End-to-end flows (Create circle, contribute, etc.)
- Wallet connection and transactions
- Telegram bot commands
- Mini App navigation

**Manual Testing:**
- Test on Sepolia testnet
- Test with MetaMask Smart Accounts
- Test Telegram Mini App in Telegram app
- Test all multi-step flows
- Test error scenarios

### 7.2 Deployment Checklist

**Before Production:**
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] API keys secured
- [ ] Smart contracts deployed and verified
- [ ] Database migrations applied
- [ ] Telegram bot configured
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render
- [ ] Monitoring and logging setup
- [ ] Error tracking (Sentry or similar)

---

## 8. API Keys & Configuration

### Required API Keys

1. **Circle CCTP API Key**
   - For Circle CCTP bridge integration
   - To be provided by user

2. **Wormhole API Key** (Optional)
   - For Wormhole bridge
   - May use public endpoints if available

3. **Price Oracle API** (CoinGecko/Uniswap)
   - For token price fetching
   - Use free tier if possible

### Environment Variables

**Frontend:**
- `NEXT_PUBLIC_UNISWAP_ROUTER_ADDRESS`
- `NEXT_PUBLIC_WORMHOLE_BRIDGE_ADDRESS`
- `NEXT_PUBLIC_CIRCLE_CCTP_API_URL`
- `NEXT_PUBLIC_COINGECKO_API_KEY` (optional)

**Backend:**
- `CIRCLE_CCTP_API_KEY`
- `WORMHOLE_API_KEY` (optional)
- Additional wallet service keys

---

## 9. Success Metrics

### User Experience
- Multi-step flows reduce user confusion
- Wallet balance display shows all tokens clearly
- Swap/bridge flows complete successfully
- Telegram bot commands work seamlessly
- Recurring transfers execute automatically

### Technical
- All transactions complete successfully
- Gasless transactions work (when applicable)
- Advanced permissions granted and used correctly
- No security vulnerabilities
- Performance: Page loads < 2s, transactions < 30s

### Business
- Users can create circles, money boxes, and gifts successfully
- Recurring transfers execute as scheduled
- Telegram integration drives user engagement

---

## 10. Future Enhancements

- Multi-chain support (Polygon, Base, Arbitrum)
- More token support
- NFT gifting
- Group gifting
- Charity/cause-specific circles
- Analytics dashboard
- Mobile app (React Native)

---

## Appendix

### Technical Stack
- Frontend: Next.js 15, React, Wagmi, Viem
- Backend: Node.js, TypeScript, Express
- Blockchain: Ethereum Sepolia, MetaMask Smart Accounts
- DeFi: Aave V3, Uniswap V3
- Bridges: Wormhole, Circle CCTP
- Database: Supabase (PostgreSQL)
- Telegram: node-telegram-bot-api

### References
- MetaMask Smart Accounts Kit Documentation
- ERC-7715 Advanced Permissions Spec
- Uniswap V3 SDK Documentation
- Wormhole Bridge Documentation
- Circle CCTP Documentation
- Telegram Bot API Documentation


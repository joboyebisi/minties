# Minties Architecture

## Overview

Minties is a crypto financial app built on Ethereum Sepolia that enables:
1. **Gift Sending**: Claimable USDC gifts via Telegram with shareable links
2. **Savings Circles**: Group savings with friends, with yield on locked funds

## System Architecture

```
┌─────────────────┐
│  Telegram Bot   │
│   (Backend)     │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌──────────────┐
│  Smart Contracts│  │   Frontend   │
│  (Sepolia)      │  │  (Next.js)   │
└────────┬────────┘  └──────┬───────┘
         │                  │
         │                  │
         └──────────┬───────┘
                    │
                    ▼
         ┌──────────────────┐
         │  MetaMask Smart  │
         │  Accounts Kit    │
         └──────────────────┘
                    │
                    ▼
         ┌──────────────────┐
         │   Envio Indexer  │
         │  (Transaction    │
         │   Tracking)      │
         └──────────────────┘
```

## Components

### 1. Smart Contracts

#### GiftEscrow.sol
- Manages claimable USDC gifts
- Supports single-use, multi-use, and scheduled gifts
- Password protection option
- Expiry time support

**Key Functions:**
- `createGift()` - Create a new gift
- `claimGift()` - Claim a gift
- `cancelGift()` - Cancel and refund

#### SavingsCircle.sol
- Manages group savings circles
- Tracks contributions per member
- Locks funds for yield generation
- Distributes yield to members

**Key Functions:**
- `createCircle()` - Create a new circle
- `joinCircle()` - Join existing circle
- `contribute()` - Contribute to circle
- `lockFunds()` - Lock funds for yield
- `unlockFunds()` - Unlock with yield

### 2. Backend (Node.js + TypeScript)

#### Telegram Bot
- Handles user commands
- Creates gift links
- Manages savings circles
- Connects to MetaMask

#### API Routes
- `/api/gift` - Gift operations
- `/api/circle` - Savings circle operations
- `/api/wallet` - Wallet management

#### Services
- `gift.ts` - Gift creation and claiming logic
- `circle.ts` - Savings circle management
- `wallet.ts` - Wallet connection and management

### 3. Frontend (Next.js + React)

#### Pages
- `/` - Main landing page
- `/claim` - Gift claiming page
- `/connect` - Wallet connection page

#### Components
- `ConnectButton` - MetaMask connection
- `GiftClaim` - Gift claiming interface
- `SavingsCircle` - Circle management interface

### 4. MetaMask Smart Accounts Kit

#### Features Used
- **Smart Account Creation**: Hybrid accounts
- **Advanced Permissions (ERC-7715)**: Periodic withdrawals
- **Delegations (ERC-7710)**: Gift link sharing
- **User Operations**: Gasless transactions (optional)

#### Integration Points
- Frontend: Wallet connection, smart account creation
- Backend: Delegation creation, permission requests
- Contracts: Direct interaction via smart accounts

### 5. Envio Indexer

#### Indexed Data
- Gift creations and claims
- Savings circle contributions
- Lock/unlock events
- Member joins

#### Use Cases
- Transaction history
- Analytics dashboard
- Circle performance tracking
- Gift claim statistics

## Data Flow

### Gift Creation Flow

```
1. User sends /gift create to Telegram bot
2. Bot prompts for amount and type
3. Backend creates delegation with USDC permission
4. Delegation is signed by user's smart account
5. Delegation is encoded and shared as link
6. Link is sent to user via Telegram
7. User shares link with recipient
8. Recipient clicks link, opens frontend
9. Frontend decodes delegation
10. Recipient connects MetaMask
11. Frontend redeems delegation
12. USDC is transferred to recipient
```

### Savings Circle Flow

```
1. User sends /circle create to Telegram bot
2. Bot prompts for weekly target
3. Backend creates circle on-chain
4. Circle ID is shared with user
5. Friends join using /circle join <id>
6. Members contribute via /circle contribute
7. Contributions are tracked on-chain
8. Circle creator locks funds for yield
9. After lock period, funds unlock with yield
10. Members can withdraw their share
```

## Security Considerations

### Smart Contracts
- ✅ Reentrancy guards
- ✅ Access controls
- ✅ Input validation
- ✅ SafeERC20 for token transfers

### Backend
- ✅ Input sanitization
- ✅ Rate limiting (to be added)
- ✅ Error handling
- ✅ Wallet signature verification

### Frontend
- ✅ MetaMask connection validation
- ✅ Transaction confirmation
- ✅ Error handling
- ✅ Link validation

## Deployment

### Smart Contracts
- Network: Ethereum Sepolia
- Deployer: EOA with Sepolia ETH
- Verification: Etherscan

### Backend
- Platform: VPS/Cloud (e.g., Railway, Render)
- Environment: Node.js
- Database: Optional (PostgreSQL for production)

### Frontend
- Platform: Vercel/Netlify
- Framework: Next.js
- CDN: Automatic via platform

## Future Enhancements

1. **Yield Integration**
   - Connect to Aave/Compound
   - Real yield generation
   - Automatic distribution

2. **Database**
   - Persistent storage
   - User profiles
   - Transaction history

3. **Analytics**
   - Gift claim rates
   - Circle performance
   - User engagement

4. **Mobile App**
   - React Native
   - Push notifications
   - Better UX

5. **Multi-chain**
   - Support other networks
   - Cross-chain gifts
   - Bridge integration


# Minties Setup Guide

## Prerequisites

1. **Node.js** v18 or later
2. **MetaMask** browser extension
3. **MetaMask Flask** (for Advanced Permissions testing) - Install from [here](https://docs.metamask.io/snaps/get-started/install-flask/)
4. **Sepolia ETH** for gas fees - Get from [faucet](https://sepoliafaucet.com/)
5. **Sepolia USDC** - Get from [Circle faucet](https://faucet.circle.com/)
6. **Telegram Bot Token** - Create bot via [@BotFather](https://t.me/botfather)

## Installation

1. **Install root dependencies:**
```bash
npm install
```

2. **Install workspace dependencies:**
```bash
cd contracts && npm install
cd ../backend && npm install
cd ../frontend && npm install
```

## Configuration

### 1. Smart Contracts

Create `contracts/.env`:
```env
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_deployer_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
```

### 2. Backend

Create `backend/.env`:
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_relay_private_key
GIFT_ESCROW_ADDRESS=<deployed_address>
SAVINGS_CIRCLE_ADDRESS=<deployed_address>
USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GIFT_ESCROW_ADDRESS=<deployed_address>
NEXT_PUBLIC_SAVINGS_CIRCLE_ADDRESS=<deployed_address>
NEXT_PUBLIC_USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.org
```

## Deployment

### 1. Deploy Smart Contracts

```bash
cd contracts
npm run deploy:sepolia
```

Save the deployed addresses to your `.env` files.

### 2. Verify Contracts (Optional)

```bash
cd contracts
npm run verify
```

## Running the Application

### Development Mode

From the root directory:
```bash
npm run dev
```

This starts:
- Frontend on `http://localhost:3000`
- Backend on `http://localhost:3001`

### Individual Services

**Frontend only:**
```bash
npm run dev:frontend
```

**Backend only:**
```bash
npm run dev:backend
```

## Testing

### Test Smart Contracts

```bash
cd contracts
npm test
```

### Test Telegram Bot

1. Start the backend server
2. Open Telegram and find your bot
3. Send `/start` to begin

### Test Frontend

1. Start the frontend server
2. Open `http://localhost:3000`
3. Connect MetaMask (ensure you're on Sepolia network)
4. Test gift claiming and savings circle features

## Envio Indexer Setup

1. **Sign up** at [Envio](https://envio.dev)
2. **Get API key** from dashboard
3. **Update** `envio/config.ts` with contract addresses
4. **Deploy indexer:**
```bash
cd envio
envio deploy
```

## MetaMask Smart Accounts Setup

### For Advanced Permissions (ERC-7715)

1. **Install MetaMask Flask** (required for Advanced Permissions)
2. **Upgrade to Smart Account:**
   - Users can upgrade via the frontend
   - Or manually switch in MetaMask settings
3. **Request Permissions:**
   - Use `requestExecutionPermissions` from Smart Accounts Kit
   - Supports periodic and streaming permissions

### Key Features

- **Hybrid Smart Accounts**: Support EOA + passkey signers
- **Advanced Permissions**: Fine-grained, time-based permissions
- **Delegations**: Create shareable gift links using delegations
- **Gasless Transactions**: Optional paymaster integration

## Architecture

### Gift Flow

1. User creates gift via Telegram bot
2. Backend creates delegation with USDC spending permission
3. Delegation is encoded and shared as link
4. Recipient clicks link, connects MetaMask
5. Frontend redeems delegation to claim gift

### Savings Circle Flow

1. User creates circle via Telegram bot
2. Friends join using circle ID
3. Members contribute USDC weekly
4. Funds are locked for yield generation
5. After lock period, funds unlock with yield
6. Members can withdraw their share

## Troubleshooting

### MetaMask Connection Issues

- Ensure MetaMask is on Sepolia network
- Check that Smart Account is created/upgraded
- Verify Flask is installed for Advanced Permissions

### Contract Deployment Issues

- Ensure you have Sepolia ETH for gas
- Check RPC URL is correct
- Verify private key is set correctly

### Telegram Bot Not Responding

- Verify bot token is correct
- Check backend server is running
- Ensure bot has permission to read messages

## Next Steps

1. **Integrate Real Yield Protocol**: Connect SavingsCircle to Aave/Compound
2. **Add Database**: Store gift/circle data persistently
3. **Enhance Security**: Add rate limiting, input validation
4. **Add Analytics**: Track gift claims, circle performance
5. **Mobile App**: Build React Native app for better UX

## Support

For issues or questions:
- Check the [MetaMask Smart Accounts docs](https://docs.metamask.io/smart-accounts-kit/)
- Review [Envio documentation](https://docs.envio.dev)
- Open an issue on GitHub


# Minties Quick Start

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
npm install
cd contracts && npm install
cd ../backend && npm install  
cd ../frontend && npm install
```

### Step 2: Set Up Environment Variables

**Contracts** (`contracts/.env`):
```env
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_private_key
USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
```

**Backend** (`backend/.env`):
```env
TELEGRAM_BOT_TOKEN=your_bot_token
SEPOLIA_RPC_URL=https://rpc.sepolia.org
GIFT_ESCROW_ADDRESS=<after_deployment>
SAVINGS_CIRCLE_ADDRESS=<after_deployment>
USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
PORT=3001
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GIFT_ESCROW_ADDRESS=<after_deployment>
NEXT_PUBLIC_SAVINGS_CIRCLE_ADDRESS=<after_deployment>
NEXT_PUBLIC_USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.org
```

### Step 3: Deploy Contracts

```bash
cd contracts
npm run deploy:sepolia
```

Copy the deployed addresses to your `.env` files.

### Step 4: Start Services

```bash
# From root directory
npm run dev
```

This starts:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Step 5: Test It Out

1. **Telegram Bot:**
   - Find your bot on Telegram
   - Send `/start`
   - Try `/gift create`

2. **Frontend:**
   - Open http://localhost:3000
   - Connect MetaMask (Sepolia network)
   - Test gift claiming

## 📱 Telegram Commands

- `/start` - Welcome message
- `/gift create` - Create a gift
- `/gift claim <link>` - Claim a gift
- `/circle create` - Create savings circle
- `/circle join <id>` - Join a circle
- `/circle contribute <id> <amount>` - Contribute
- `/wallet connect` - Connect wallet

## 🎁 Creating Your First Gift

1. Send `/gift create` to your Telegram bot
2. Enter amount (e.g., `10`)
3. Choose type (`1` for single-use, `2` for multi-use)
4. Share the generated link with anyone
5. They can claim it via the frontend!

## 💰 Creating a Savings Circle

1. Send `/circle create` to your Telegram bot
2. Enter weekly target (e.g., `50`)
3. Share the circle ID with friends
4. They join with `/circle join <id>`
5. Contribute with `/circle contribute <id> <amount>`

## 🔧 Troubleshooting

**MetaMask not connecting?**
- Ensure you're on Sepolia network
- Check browser console for errors

**Contracts not deploying?**
- Verify you have Sepolia ETH
- Check RPC URL is correct

**Telegram bot not responding?**
- Verify bot token is correct
- Check backend server is running

## 📚 Next Steps

- Read [SETUP.md](./SETUP.md) for detailed setup
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- See [METAMASK_VS_PRIVY.md](./METAMASK_VS_PRIVY.md) for tech decisions

## 🆘 Need Help?

- Check the documentation files
- Review MetaMask Smart Accounts docs
- Open an issue on GitHub

Happy building! 🎉


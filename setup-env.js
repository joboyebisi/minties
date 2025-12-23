const fs = require('fs');
const path = require('path');

// Contracts .env
const contractsEnv = `# Network Configuration
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_private_key_here

# Etherscan API Key (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key

# Contract Addresses (after deployment - fill these in after deploying)
GIFT_ESCROW_ADDRESS=
SAVINGS_CIRCLE_ADDRESS=

# USDC Address on Sepolia
USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
`;

// Backend .env
const backendEnv = `# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Ethereum Sepolia
SEPOLIA_RPC_URL=https://rpc.sepolia.org
PRIVATE_KEY=your_private_key_for_relay_transactions

# Contract Addresses (fill these in after deploying contracts)
GIFT_ESCROW_ADDRESS=
SAVINGS_CIRCLE_ADDRESS=
USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238

# MetaMask Smart Accounts
SMART_ACCOUNTS_ENVIRONMENT=sepolia

# Envio Indexer (optional for now)
ENVIO_API_URL=https://api.envio.dev
ENVIO_API_KEY=your_envio_api_key

# Server
PORT=3001
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Database (optional, for storing gift/circle data)
DATABASE_URL=
`;

// Frontend .env.local
const frontendEnv = `# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Contracts (fill these in after deploying contracts)
NEXT_PUBLIC_GIFT_ESCROW_ADDRESS=
NEXT_PUBLIC_SAVINGS_CIRCLE_ADDRESS=
NEXT_PUBLIC_USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238

# Network
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.org

# MetaMask Smart Accounts
NEXT_PUBLIC_SMART_ACCOUNTS_ENVIRONMENT=sepolia
`;

// Create .env files
fs.writeFileSync(path.join(__dirname, 'contracts', '.env'), contractsEnv);
fs.writeFileSync(path.join(__dirname, 'backend', '.env'), backendEnv);
fs.writeFileSync(path.join(__dirname, 'frontend', '.env.local'), frontendEnv);

console.log('✅ Environment files created!');
console.log('\n📝 Next steps:');
console.log('1. Edit contracts/.env and add your PRIVATE_KEY and ETHERSCAN_API_KEY');
console.log('2. Edit backend/.env and add your TELEGRAM_BOT_TOKEN');
console.log('3. After deploying contracts, update GIFT_ESCROW_ADDRESS and SAVINGS_CIRCLE_ADDRESS in all .env files');


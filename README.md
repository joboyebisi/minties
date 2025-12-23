# Minties

A crypto financial app that enables:
1. **Gift Sending**: Send USDC as gifts, scheduled transactions, and programmed transactions on Telegram with claimable links
2. **Savings Circles**: Start weekly target savings circles with friends, with yield on locked savings

## Features

- 🎁 **Claimable Gift Links**: Send USDC gifts via Telegram with shareable links
- ⏰ **Scheduled Transactions**: Program recurring or one-time scheduled transfers
- 💰 **Savings Circles**: Group savings with friends with yield on locked funds
- 🔐 **MetaMask Integration**: Full support for MetaMask Smart Accounts with Advanced Permissions (ERC-7715)
- 📊 **Transaction Indexing**: Envio integration for real-time transaction tracking
- 🔗 **Invite System**: Social invite links for easy onboarding

## Tech Stack

- **Smart Contracts**: Solidity, Hardhat, deployed on Ethereum Sepolia
- **Backend**: Node.js, TypeScript, Telegram Bot API
- **Frontend**: Next.js, React, MetaMask Smart Accounts Kit
- **Indexing**: Envio
- **Wallet**: MetaMask with Smart Accounts

## Project Structure

```
minties/
├── contracts/          # Smart contracts
├── backend/           # Telegram bot & API
├── frontend/          # Web app
└── envio/            # Indexer configuration
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see `.env.example` files in each directory)

3. Deploy contracts:
```bash
npm run deploy:contracts
```

4. Start development:
```bash
npm run dev
```

## Environment Variables

See `.env.example` files in each subdirectory for required environment variables.


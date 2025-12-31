# Minties - MoneyBox, Crypto Gifts & Savings Circles

A Telegram Mini App for crypto savings, gifts, and yield earning. Save towards targets with friends, send USDC gifts, and earn yield—all in one interface.

## Features

### 💰 Money Box
Target savings with high yield. Set your savings goal, contribute regularly, and earn yield on your deposits through Aave DeFi integration.

### 🎁 Crypto Gifts
Send USDC as gifts with claimable links. Create one-time or recurring gifts that recipients can claim directly in Telegram.

### 👥 Savings Circles
Start savings circles with friends. Set weekly targets, contribute together, and earn yield on locked funds. Perfect for group savings goals.

## Tech Stack

- **Smart Contracts**: Solidity, Hardhat (Ethereum Sepolia)
- **Backend**: Node.js, TypeScript, Express, Telegram Bot API
- **Frontend**: Next.js, React, MetaMask Smart Accounts Kit
- **Database**: Supabase (PostgreSQL)
- **Indexing**: Envio HyperSync
- **DeFi**: Aave Protocol integration
- **Wallet**: MetaMask with Smart Accounts & Advanced Permissions

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask wallet
- Telegram account
- Supabase account (for database)
- Fly.io account (for backend hosting)
- Vercel account (for frontend hosting)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/joboyebisi/minties.git
   cd minties
   ```

2. **Install dependencies**:
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. **Set up environment variables**:
   - See `ENV_VARS_GUIDE.md` for complete list
   - Backend: Create `backend/.env`
   - Frontend: Create `frontend/.env.local`

4. **Set up Supabase**:
   - Create Supabase project
   - Run migrations from `supabase/` directory:
     - `schema.sql`
     - `rpc.sql`
     - `rls_policies.sql`
   - See `SUPABASE_SETUP.md` for details

5. **Deploy contracts** (optional for local dev):
   ```bash
   cd contracts
   npm install
   npm run compile
   npm run deploy:sepolia
   ```

6. **Start development**:
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

## Deployment

See `QUICK_DEPLOY.md` for step-by-step deployment instructions:

- **Backend**: Deploy to Railway (see `RAILWAY_SETUP.md`)
- **Frontend**: Deploy to Vercel (see `VERCEL_SETUP.md`)
- **Telegram**: Configure bot (see `TELEGRAM_SETUP.md`)

## Project Structure

```
minties/
├── contracts/          # Smart contracts (GiftEscrow, SavingsCircle)
├── backend/            # Telegram bot & API server
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── services/  # Business logic
│   │   └── telegram/  # Bot handlers
├── frontend/          # Next.js web app
│   └── src/
│       ├── app/       # Next.js pages
│       ├── components/ # React components
│       └── lib/       # Utilities & integrations
├── supabase/          # Database migrations
└── envio/             # Event indexing config
```

## Key Features

- ✅ **MetaMask Smart Accounts** - Gasless transactions with account abstraction
- ✅ **Advanced Permissions** - Recurring payments without repeated approvals
- ✅ **DeFi Integration** - Earn yield through Aave protocol
- ✅ **Gamification** - Points, badges, streaks, and leaderboards
- ✅ **Social Features** - Invite system, sharing, savings circles
- ✅ **Telegram Native** - Full Mini App integration

## Documentation

- `QUICK_DEPLOY.md` - Quick deployment guide
- `ENV_VARS_GUIDE.md` - Environment variables reference
- `SUPABASE_SETUP.md` - Database setup guide
- `RAILWAY_SETUP.md` - Backend deployment
- `VERCEL_SETUP.md` - Frontend deployment
- `TELEGRAM_SETUP.md` - Bot configuration

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

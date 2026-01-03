# Minties - MoneyBox, Crypto Gifts & Savings Circles

<div align="center">
  <img src="frontend/public/images/logo.png" alt="Minties Logo" width="120" />
  <h3>Save, Gift, and Earn Crypto with Friends</h3>
</div>

A **Telegram Mini App** for crypto savings, gifts, and yield earning. Built with **MetaMask Smart Accounts** for a seamless, gasless experience.

## 🚀 Features

### 💰 Money Box
Target savings with high yield.
- **Aave Integration**: Automatically deposit savings into Aave V3 (Sepolia) to earn yield.
- **Recurring Savings**: Set up auto-save rules (e.g., 50 USDC/month) using ERC-7715 permissions.
- **Visual Progress**: Track your goal with real-time progress bars.

### 🎁 Crypto Gifts
Send USDC as gifts with claimable links.
- **Escrow Contracts**: Funds are held securely on-chain until claimed.
- **Social Sharing**: Generate a unique link to share via Telegram or other chats.
- **Gasless Claiming**: Recipients can claim even with empty wallets (via Relayers, simplified for demo).

### 👥 Savings Circles
Social saving with friends.
- **Pooled Funds**: Contribute together towards a shared goal (e.g., "Group Trip").
- **Yield Generating**: Circle funds earn DeFi yield while locked.
- **Transparent**: View all participants and contributions.

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TailwindCSS, Wagmi/Viem
- **Smart Accounts**: MetaMask Smart Accounts Kit (Delegation & Permissions)
- **Backend/DB**: Supabase (PostgreSQL), Next.js Server Actions
- **Blockchain**: Ethereum Sepolia Testnet
- **DeFi**: Aave V3 Protocol
- **Indexing**: Envio HyperSync (Real-time data) / Hybrid Local Storage Fallback

## 🔗 Contract Addresses (Sepolia)

| Contract | Address |
|----------|---------|
| **Gift Escrow** | `0x72425B766F61a83da983c1908460DF118FA125Ad` |
| **Savings Circle** | `0xEf2BF49C0394560384301A209c8793160B3D2ac8` |
| **USDC Token** | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |
| **Aave Pool** | `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951` |

## 📦 Quick Start

### 1. Prerequisites
- Node.js 18+ & npm/pnpm
- Supabase Project

### 2. Installation
```bash
git clone https://github.com/joboyebisi/minties.git
cd minties/frontend
npm install
```

### 3. Environment Variables
Create `.env.local` in `frontend/`:
```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_BUNDLER_URL=...
NEXT_PUBLIC_PAYMASTER_URL=...
```

### 4. Database Setup (Supabase)
Run the SQL migrations in your Supabase SQL Editor:
1. `src/migrations/01_profiles.sql` (User Profiles)
2. `src/migrations/02_features.sql` (MoneyBox, Circles, Gifts, Contacts)
3. `src/migrations/03_notifications.sql` (Notifications System)

### 5. Run Locally
```bash
npm run dev
# Open http://localhost:3000
```

## 📱 How to Use (Demo Flow)

1. **Connect Wallet**: Use MetaMask (supports Smart Account creation).
2. **Create Profile**: Set a display name.
3. **Telegram Integration**: Click the Telegram icon to sync contacts and open the bot.
4. **Create MoneyBox**: 
   - Go to "New Goal", enter amount & timeline.
   - Enable "Yield" to deposit into Aave.
5. **Send Gift**:
   - Go to "Send Gift", enter amount.
   - Copy the generated link to share.
6. **Create Circle**:
   - Go to "New Circle", set target.
   - Invite friends using your circle ID.

## ⚠️ Notes
- **Persistence**: The app uses a hybrid strategy (Supabase + Local Storage).
- **Envio**: Historical data indexing is supported via HyperSync.

## License
MIT

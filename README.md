# Minties - MoneyBox, Crypto Gifts & Real Estate Assets

<div align="center">
  <img src="frontend/public/images/logo.png" alt="Minties Logo" width="120" />
  <h3>Save, Gift, Trade, and Earn Crypto.</h3>
</div>

A **Telegram Mini App & Financial Super-App** built for the next billion users.  
Features **Smart Accounts (Gasless)**, **Social Savings**, **Viral Gifting**, and **Fractional Real Estate Trading** on Mantle.

<img width="2878" height="1702" alt="Minties Update" src="https://github.com/user-attachments/assets/00166fae-e79e-4756-bdd5-69959e39f74d" />


---

## 🚀 Features

### 1. 🏙️ Fractional Real Estate (NEW - Mantle Network)
Invest in premium real estate assets with friends.
-   **Fractional Ownership**: Buy shares of assets (e.g., "Downtown Loft") for as little as 0.1 MNT.
-   **Trading**: Sell your shares back to the protocol instantly to realize gains.
-   **Circles to Buy**: Create a "Buying Circle" to pool funds with friends and acquire assets together.
-   **Yield**: Earn yield from property revenue (simulated via contract).

### 2. 💰 Money Box
Target savings with high yield on Sepolia.
-   **Aave Integration**: Automatically deposit savings into Aave V3 (Sepolia) to earn yield.
-   **Flash Loan Demo**: Borrow funds instantly without collateral using our integrated Aave Flash Loan tool.
-   **Recurring Savings**: Set up auto-save rules using ERC-7715 permissions.

### 3. 🎁 Crypto Gifts & Wallet
-   **Multi-Chain Balance**: View **MNT** (Mantle) and **ETH** (Sepolia) gas balances in one dashboard.
-   **Viral Gifts**: Send USDC to anyone via a simple link (Gasless Claiming).

### 4. 👥 Savings Circles
Pooled savings for shared goals.
-   **ROSCA Style**: Contribute together towards a shared goal (e.g., "Group Real Estate Ownership").

---

## 🛠 Tech Stack

-   **Frontend**: Next.js 15 (App Router), TailwindCSS, Wagmi/Viem, Lucide React.
-   **Smart Accounts**: MetaMask Smart Accounts Kit (Delegation & Permissions).
-   **Chain (Assets)**: **Mantle Sepolia Testnet** (Real Estate, Asset Groups).
-   **Chain (DeFi)**: **Ethereum Sepolia** (Aave, USDC).
-   **Backend**: Supabase (PostgreSQL) for off-chain data (Contacts, Profiles).
-   **Indexing**: Envio HyperSync (Real-time history).

## 🔐 Advanced Permissions Usage (ERC-7715)
Since the Hackathon is focused on the Advanced Permissions, here are the links for the code usage:

-   **Requesting Permissions**: [requestRecurringTransferPermission](frontend/src/lib/metamask-permissions.ts#L46-L111)
-   **Redeeming Permissions**: [redeemPermissionAndTransfer](frontend/src/lib/metamask-permissions.ts#L114-L167)

## ⚡ Envio Usage
We use **Envio HyperSync** to index Smart Account activity (deposits, gifts, claims) in real-time, allowing the UI to bypass slow standard RPC calls for transaction history.

-   **HyperSync Client & Query**: [hypersync-actions.ts](frontend/src/app/actions/hypersync-actions.ts#L7-L28)

## 🏙️ Mantle Usage
We deployed our Asset Marketplace contracts to **Mantle Sepolia** to enable low-fee fractional trading.

-   **Real Estate Contract**: [RealEstate.sol](contracts/contracts/RealEstate.sol)
-   **Asset Group Factory**: [AssetGroupFactory.sol](contracts/contracts/AssetGroupFactory.sol)
-   **Frontend Integration**: [Mantle Network Logic](frontend/src/app/savings-assets/page.tsx#L16-L108)

---

## 🔗 Contract Addresses

### Mantle Sepolia (Assets & Trading)
| Contract | Address |
|----------|---------|
| **RealEstate** | `0x6c54439DE8243f3993D8286d51B53143119935Af` |
| **AssetGroupFactory** | `0x7Af38C7df28796Ab68b01da9779339C9CEdcf1aF` |

### Ethereum Sepolia (Savings & Gifts)
| Contract | Address |
|----------|---------|
| **Gift Escrow** | `0x72425B766F61a83da983c1908460DF118FA125Ad` |
| **Savings Circle** | `0xEf2BF49C0394560384301A209c8793160B3D2ac8` |
| **SimpleFlashLoan** | `0x83B32997B28062972EfE86f54D1C20a7eA322c7f` |
| **USDC Token** | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |

---

## 📦 Installation & Setup

### 1. Prerequisites
- Node.js 18+
- Supabase Project

### 2. Clone & Install
```bash
git clone https://github.com/joboyebisi/minties.git
cd minties

# Install Frontend
cd frontend
npm install

# Install Contracts (Optional, for deploying)
cd ../contracts
npm install
```

### 3. Environment Variables
Create `.env.local` in `frontend/`:
```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

### 4. Run Application
```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

---

## 📱 User Guide (How to Test)

### 🟢 Testing Savings & Gifts (Sepolia)
1.  **Connect Wallet**: Login with MetaMask.
2.  **Create MoneyBox**: Go to **Money**, click "New Goal", enable Yield.
3.  **Flash Loan**: Go to **Savings & Assets** (on Sepolia) -> Click "Execute Loan" to borrow 10 USDC instantly.
4.  **Send Gift**: Go to **Money**, click "Send Gift".

### 🔵 Testing Real Estate (Mantle Sepolia)
1.  **Switch Network**: Clicking "Savings & Assets" will prompt to switch to **Mantle Sepolia**.
    -   *Faucet*: Get MNT from [Mantle Faucet](https://faucet.testnet.mantle.xyz/).
2.  **Buy Shares**:
    -   Go to **Savings & Assets** -> **Save To Buy**.
    -   Select a property (e.g., "Downtown Loft").
    -   Click **Buy Share**, enter amount, confirm.
3.  **Trade (Sell)**:
    -   Go to **My Assets** tab.
    -   View your portfolio value.
    -   Click **Sell** on an asset to liquidate it back to MNT.
4.  **Circle to Buy**:
    -   Select a property -> Click **Circle to Buy**.
    -   Invite friends (by address) and split the equity.

---

## 💡 Hackathon Insights

### MetaMask Smart Accounts (ERC-7715)
We implemented "Delegated Access" for recurring savings, enabling a Web2-Subscription-like experience on-chain.

### Envio HyperSync
Used for instantaneous transaction history fetching, bypassing slow RPC calls.

### Mantle Network
High performance and low fees make fractional asset trading viable for micro-investors.

## License
MIT

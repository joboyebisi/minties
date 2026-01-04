# Hackathon Submission & Demo Guide

## 📄 Project Details

### **Intro** (160/200 chars)
A Telegram Mini App & Smart Account wallet for social savings and gifting. Features gasless txs, yield earning via Aave, and one-click savings circles.

### **Description**
Minties is a **Telegram-native financial super-app** designed to make DeFi accessible to the next billion users. Built on **MetaMask Smart Accounts** (Delegated Access), it abstracts away seed phrases and gas fees, offering a web2-like experience with web3 power.

**Key Features:**
1.  **Smart Wallets**: Instant, gasless account creation linked to Telegram ID.
2.  **Social Savings (MoneyBox)**: Create goal-based vaults that auto-yield via Aave.
3.  **Viral Gifting**: Send crypto via a simple link (claimable by anyone, even without a wallet).
4.  **Savings Circles**: Pooled savings with friends (ROSCA style) powered by smart contracts.
5.  **Activity Logic**: Full transaction history indexed via **Envio HyperSync**.

### **Progress During Hackathon**
- **Smart Accounts**: Implemented Delegated Access & Gasless Paymaster.
- **DeFi Integration**: Integrated Aave V3 for yield generation on MoneyBoxes.
- **Telegram Integration**: Built a native Mini App with contact syncing and bot interactions.
- **Data Indexing**: Implemented Envio HyperSync for instant transaction history.
- **UI/UX**: Developed a premium, dark-mode "Glassmorphism" UI responsive on mobile.
- **Robustness**: Stabilized async transaction flows and build pipelines for production reliability.

### **Resolved Technical Challenges**
- **Async Transaction Safety**: Implemented on-chain polling to strictly verify Aave allowances, eliminating race conditions between `Approve` and `Supply` transactions.
- **Smart Wallet Compatibility**: Added graceful fallback logic for wallets without ERC-7715 (Advanced Permissions) support, ensuring the app remains usable for all users.
- **Bot Architecture**: Resolved "409 Conflict" errors by preventing concurrent polling instances, ensuring reliable bot operation across Development and Production.
- **Build Pipeline**: Fixed complex TypeScript and dependency conflicts in the backend build process on Render.
- **Atomic Goal Deletion**: Engineered a robust "Withdraw & Delete" flow that handles partial failures and state cleanup to prevent hydration mismatches.

### **Tech Stack**
- **Next.js**: Frontend Framework
- **Ethers / Viem**: Blockchain Interaction
- **MetaMask Smart Accounts**: Account Abstraction
- **Supabase**: Off-chain data (Contacts, Profiles)
- **Envio**: Blockchain Indexing
- **Node.js**: Telegram Bot Backend
- **Telegram API**: Bot & Mini App Platform

## 🎬 2 USDC Demo Plan (Practical Guide)

**Constraint**: You have 2 USDC.
**Goal**: Show all features without running out of funds.

**Step 1: The "Wow" Setup (0.00 USDC)**
- Open Telegram Bot -> Click "Start".
- Show "Minties" Mini App opening instantly.
- Show **Activity Dashboard** (History) populated (historic data is free to read).

**Step 2: Create a MoneyBox (0.00 - 0.50 USDC)**
- **Action**: Create a "Coffee Fund" MoneyBox.
- **Amount**: Set target to 5 USDC.
- **Deposit**: Deposit **1.00 USDC**.
- **Tech Flex**: "Notice I didn't pay for gas? That's the Paymaster working."
- **Result**: Show 1.00 USDC moving to Aave (Yield enabled).

**Step 3: Send a Viral Gift (0.50 USDC)**
- **Action**: Go to "Send Gift".
- **Amount**: **0.50 USDC**.
- **Recipient**: "friend" (or leave blank for link).
- **Result**: Generate the Link.
- **Demo Trick**: Copy link, open in Incognito (or perform live if you have a second browser). Show the "Claim" screen. *Don't claim it yourself to save gas, just show the UI.*

**Step 4: Savings Circle (UI Only)**
- **Action**: Click "New Circle".
- **Explain**: "We can also pool funds with friends."
- **Stop**: Don't deposit; just show the creation screen to save your remaining 0.50 USDC.

**Closing**: "With just 2 USDC, we interacted with Aave, sent a cross-platform gift, and managed a smart savings account—all gasless."

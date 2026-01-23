# Hackathon Submission Draft

## a. Intro (176 / 200 chars)
Minties is a Telegram-native Super-App for social finance. It combines gasless Smart Wallets, viral crypto gifting, and fractional real estate trading on Mantle, all within Telegram.

## Description
**MINTIES: Breaking the 2.74% Ceiling**
*The Telegram-native Financial Super-App for the Next Billion.*

### 1. The Problem: The "Complexity Chasm"
Despite a decade of innovation, DeFi remains an elite playground. By the end of 2026, it is projected that only ~2.7% of the global population will actively use DeFi. The remaining 97% are blocked by three walls:
*   **The Technical Wall**: Seed phrases and private keys.
*   **The Economic Wall**: The "Gas Catch-22" (needing ETH to move USDC).
*   **The Isolation Wall**: Finance is social, yet DeFi remains a lonely, "single-player" experience.

### 2. The Solution: Contextualized for 2026
Minties leverages **Telegram’s 1 Billion+ distribution** and **MetaMask’s Smart Account infrastructure** to make Web3 invisible.

**The Minties Framework:**
*   **Invisible Onboarding**: We link a Smart Account directly to a Telegram ID. No seed phrases.
*   **Gasless by Design**: Through ERC-4337 Paymasters, users never see a "Gas Fee."
*   **Social & Viral**: We use Viral Gifting and "Savings Circles" as our Trojan Horse for adoption.

### 3. Key Product Features
*   **Smart Wallets**: Instant, non-custodial wallets via Telegram ID.
*   **MoneyBox**: Goal-based vaults yielding auto-interest via Aave (Sepolia).
*   **Viral Gifting**: Send crypto via a link claimable by anyone (even non-users).
*   **Savings Circles**: ROSCA-style pooled savings groups via smart contracts.
*   **Refined Real Estate (NEW)**: A fractional asset marketplace on **Mantle Network**. Users can "Save to Buy" premium assets, trade shares instantly, and form "Buying Circles" to acquire property with friends.
*   **Activity Logic**: Real-time, indexed history via **Envio HyperSync**.

### 4. Why Now?
*   **MetaMask Smart Accounts**: Allows us to request "Delegated Access" (ERC-7715) for recurring savings without constant signing.
*   **Mantle Network**: High performance and low fees make fractional asset trading viable for micro-investors.
*   **Envio HyperSync**: Indexes data 100x faster than RPCs, creating a snappy, "Web2-like" feed.

---

## Progress During Hackathon

We built a fully functional "Financial Super-App" from scratch, focusing on complex Smart Account integrations and cross-chain functionality.

**Key Technical Achievements:**
1.  **Mantle Network Integration**:
    *   Designed and deployed `RealEstate.sol` and `AssetGroup.sol` to **Mantle Sepolia**.
    *   Implemented a "Liquid Trading" engine allowing users to buy *and* sell fractional shares instantly.
    *   Built the "Circle to Buy" factory, enabling groups to deploy custom contracts for joint asset acquisition.

2.  **MetaMask Smart Accounts (ERC-7715)**:
    *   Implemented **Delegated Permissions** for "Auto-Save" functionality, allowing the app to execute recurring deposits without user intervention (true "Subscription" model on-chain).
    *   Integrated **Gasless Paymasters** for a completely abstracted user experience.

3.  **Advanced DeFi & Data**:
    *   Integrated **Aave V3** on Sepolia for the "MoneyBox" yield engine.
    *   Implemented **Envio HyperSync** to bypass slow RPCs, delivering instant transaction history and "Activity Feeds" pivotal for a social app.

4.  **Telegram-Native UX**:
    *   Developed a premium "Glassmorphism" UI optimized for Telegram's mobile view.
    *   Built a robust backend to sync Telegram Contacts with on-chain identities.

**Outcome**: A production-ready Mini App where a user can onboard, save, gift, and invest in real estate in under 60 seconds, with zero gas friction.

---

## Mantle Implementation Insights

Our experience building the "Save to Buy" Real Estate marketplace on Mantle Network highlighted three key advantages:

1.  **Micro-Transaction Viability**: The core challenge of "Fractional Real Estate" is that high gas fees usually destroy the economics of buying small shares (e.g., $10). Mantle's ultra-low fees allowed us to enable truly casual investing where users can trade small amounts without friction.
2.  **Instant Trading Experience**: We built a "Liquid Trading" engine where users can sell shares back to the protocol. Mantle's fast block times made this feel instantaneous—crucial for a consumer-facing Telegram Mini App where users expect "Web2 speed."
3.  **Seamless Portability**: We ported our complex `AssetGroupFactory` contracts (originally designed for generic EVM) to Mantle with zero code changes. The tooling (Hardhat, Viem) worked out-of-the-box, allowing us to focus entirely on the "Circle to Buy" innovation rather than infrastructure debugging.

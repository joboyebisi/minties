# implementation_plan.md

# Goal
Implement "MoneyBox" (Savings Goal with Aave + Recurring), "Send Gifts" (Fintech-style with Recurring), and "Savings Circle" (Multi-step + Routing), powered by **MetaMask Smart Accounts** and **Advanced Permissions (ERC-7715)** for recurring capabilities.

## User Review Required
-   **Contract Addresses**: Need deployed addresses for `SavingsCircle` and `GiftEscrow` contracts.
-   **Envio API**: Need the Envio Indexer GraphQL endpoint for real-time data fetching.

## Proposed Changes

### 1. MoneyBox Feature (Priority 1 - Aave Integration)
-   **`app/moneybox/create/page.tsx`**:
    -   Integrate `supplyUsdc` from `lib/aave.ts`.
    -   Handle "Deposit to Aave" transaction flow.
-   **`app/moneybox/[id]/page.tsx`**:
    -   Show Aave balance (aUSDC) as "Current Savings".
    -   Implement "Withdraw" button using `withdrawUsdc`.
    -   **Real-time**: Poll Aave contract or usage Envio if available for balance updates.

### 2. Savings Circle (Priority 2 - Vaults)
-   **`lib/transactions.ts`**:
    -   Update `SAVINGS_CIRCLE_ADDRESS` with real address.
-   **`app/circle/create/page.tsx`**:
    -   Call `createCircle` transaction.
-   **`app/circle/[id]/page.tsx`**:
    -   Call `contributeToCircle` and `withdrawFromCircle`.
    -   Fetch real-time vault balance/participants (needs Envio or direct contract reads).

### 3. Send Gifts (Priority 3 - Escrow & Onboarding)
-   **`lib/transactions.ts`**:
    -   Update `GIFT_ESCROW_ADDRESS`.
-   **`app/gift/send/page.tsx`**:
    -   Call `createGift` (Escrow).
-   **`app/gift/claim/page.tsx`**:
    -   Call `claimGift` to withdraw funds to wallet.

### 4. Real-time Infrastructure (Priority 4 - Envio)
-   **`lib/envio.ts` (NEW)**:
    -   Setup GraphQL client.
    -   Queries for `UserBalances`, `CircleEvents`, `GiftEvents`.
-   **`components/UserDashboard.tsx`**:
    -   Replace mock data with `useEnvio` hooks.

### 5. Smart Account & Permissions (Completed/Ongoing)
-   **Status**: Profile & Invite logic Implemented.
-   **Next**: Integrate recurring permissions into MoneyBox/Circle flows once basic txs work.

## Verification Plan

### Automated Tests
-   Jest tests for util functions in `metamask-permissions.ts`.

### Manual Verification
1.  **MoneyBox (Aave)**:
    -   Create Goal -> Deposit 10 USDC -> Verify Aave balance increases.
    -   Withdraw 5 USDC -> Verify wallet balance increases.
2.  **Savings Circle**:
    -   Create Circle -> Verify notification/event.
    -   Contribute -> Verify Vault balance.
3.  **Gifts**:
    -   Send Gift (Escrow) -> Verify funds deducted.
    -   Claim Gift (Recipient) -> Verify funds received.

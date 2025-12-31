# implementation_plan.md

# Goal
Implement "MoneyBox" (Savings Goal with Aave + Recurring), "Send Gifts" (Fintech-style with Recurring), and "Savings Circle" (Multi-step + Routing), powered by **MetaMask Smart Accounts** and **Advanced Permissions (ERC-7715)** for recurring capabilities.

## User Review Required
-   **MetaMask Integration**: This plan assumes we can use the `@metamask/smart-accounts-kit` (or stubs if not yet public/stable). The code currently has placeholders.
-   **Aave Integration**: We will use Aave V3 on Sepolia.

## Proposed Changes

### 1. MetaMask Smart Accounts & Permissions (`frontend/src/lib`)
-   **`metamask-permissions.ts`**:
    -   Implement `createWalletClientWithPermissions` properly extending `erc7715ProviderActions`.
    -   Implement `requestRecurringTransferPermission` handling the permission request flow.
    -   Implement `redeemPermissionAndTransfer` using the bundler or wallet client.
-   **`smart-account.ts` (NEW)**:
    -   Logic to create/restore a MetaMask Smart Account (Hybrid or Stateless 7702 as per docs).
    -   Integrate `toMetaMaskSmartAccount`.

### 2. MoneyBox Feature (`frontend/src/app/moneybox`)
-   **`app/moneybox/create/page.tsx`** (New Page):
    -   Form to set Goal Name, Target Amount, Deadline.
    -   Aave Yield estimation (Reuse `MoneyBoxCalculator` logic).
    -   **Recurring Setup**: Toggle to enable "Auto-save" which triggers ERC-7715 permission request.
-   **`app/moneybox/[id]/page.tsx`**:
    -   Dashboard for a specific goal.
    -   Shows progress, Aave yield earned.
    -   "Execute Recurring Method" button (simulated cron / or manual trigger by user for now to test permission redemption).

### 3. Send Gifts Feature (`frontend/src/gift`)
-   **`app/gift/send/page.tsx`**:
    -   **Fintech Styling**: sleek card design, contact selector (mock or recent), simple amount input.
    -   **Recurring Option**: "Repeat this gift" (Daily/Weekly/Monthly).
    -   Triggers ERC-7715 permission if recurring is selected.
    -   Generates shareable link/QR code.
-   **`app/gift/claim/page.tsx`**:
    -   Existing `GiftClaim` logic enhanced with better UI.

### 4. Savings Circle (`frontend/src/app/circle`)
-   **Refactor**: As per previous plan, move to `/circle/create` and `/circle/[id]`.
-   **Recurring**: Add optional step to setup auto-contribution using ERC-7715 on creation/joining.

### 5. Shared Components
-   **`components/PermissionGuard.tsx`**: Component that checks if user has a Smart Account before accessing advanced features.

## Verification Plan

### Automated Tests
-   Jest tests for util functions in `metamask-permissions.ts`.

### Manual Verification
1.  **Smart Account Setup**:
    -   Connect wallet.
    -   Verify app detects/creates Smart Account (Hybrid).
2.  **MoneyBox Flow**:
    -   Go to `/moneybox/create`.
    -   Set goal: 100 USDC, 6 months.
    -   Enable "Auto-save 10 USDC/month".
    -   **Verify**: MetaMask popup requests "Permission to transfer 10 USDC every 30 days".
    -   Confirm permission.
    -   **Verify**: Permission stored (mock backend or local state).
3.  **Gift Flow**:
    -   Go to `/gift/send`.
    -   Select "Weekly Allowance", 20 USDC.
    -   **Verify**: Permission request for "20 USDC every 7 days".
    -   Send gift.
4.  **Redemption (Testing Permissions)**:
    -   Create a "Debug/Admin" panel or button to "Trigger Recurring Permission Now".
    -   Click it -> Should execute transfer *without* user signature popup (using the permission).

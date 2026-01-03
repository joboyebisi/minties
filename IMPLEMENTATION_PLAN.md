# Activity Dashboard & Envio Integration Plan

## Goal
Implement a UI to display transaction history (deposits, gifts, circle contributions) using the existing Envio HyperSync client (`src/lib/hypersync.ts`).

## Proposed Changes

#### [NEW] [ActivityDashboard.tsx](file:///c:/Users/Deborah/Documents/Cursor%20Projects/Minties/frontend/src/components/ActivityDashboard.tsx)
- Create a reusable component `ActivityDashboard`.
- Use `getWalletHistory(address)` from `@/lib/hypersync`.
- Display a list of transactions with:
    - Type (Sent/Received)
    - Amount (formatted)
    - Date (timestamp)
    - Hash (link to explorer)

#### [MODIFY] [UserDashboard.tsx](file:///c:/Users/Deborah/Documents/Cursor%20Projects/Minties/frontend/src/components/UserDashboard.tsx)
- Integrate `ActivityDashboard` component at the bottom of the main dashboard.

#### [MODIFY] [hypersync.ts](file:///c:/Users/Deborah/Documents/Cursor%20Projects/Minties/frontend/src/lib/hypersync.ts)
- Ensure `getWalletHistory` handles edge cases (empty results, errors).

## Verification Plan
1.  **Manual Verification**:
    - Open Dashboard.
    - Check if "Recent Activity" section appears.
    - Perform a transaction (or use existing history).
    - Verify data appears in the list.
2.  **Envio Interaction**:
    - The `hypersync.ts` client is pre-configured with a public URL. No user setup required for basic read-only history.

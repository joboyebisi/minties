# Money Movement Implementation Status

## Overview
This document tracks the implementation of money movement flows: Wallet → Vault/Escrow/Aave → Wallet withdrawals.

## Implementation Architecture

### Transaction Library (`frontend/src/lib/transactions.ts`)
✅ **COMPLETED** - Comprehensive transaction service library with:
- Token approval handling (`ensureApproval`)
- Savings Circle operations (create, join, contribute, withdraw)
- Gift operations (create, claim)
- Password hashing for gift protection
- Proper error handling and validation

### Contracts Integration
✅ **CONTRACTS EXIST**:
- `SavingsCircle.sol` - Handles group savings with yield
- `GiftEscrow.sol` - Handles claimable gifts
- Aave Pool - Direct integration for Money Box

## Money Flow Patterns

### 1. Money Box Flow
**Pattern**: Wallet → Aave Pool (direct)

**Status**: ⚠️ **PARTIAL** - Basic supply/withdraw exists, needs:
- [ ] Multi-step flow integration
- [ ] Recurring transfer permissions
- [ ] Automated scheduled transfers
- [ ] Withdrawal notifications
- [ ] Goal completion detection

**Implementation**:
- Current: Direct Aave supply/withdraw in `frontend/src/lib/aave.ts`
- Needed: Integration with multi-step flow + permissions

### 2. Savings Circle Flow  
**Pattern**: Wallet → Contract Vault → Yield → Wallet

**Status**: ⚠️ **PARTIAL** - Transaction library ready, needs:
- [ ] Update SavingsCircleCreateFlow to use transaction library
- [ ] Update SavingsCircleJoinFlow to use transaction library
- [ ] Implement recurring contribution permissions
- [ ] Implement withdrawal functionality in UI
- [ ] Lock funds for yield (currently manual)
- [ ] Unlock funds after lock period
- [ ] Notifications for contributions and withdrawals

**Implementation**:
- Transaction functions ready in `frontend/src/lib/transactions.ts`:
  - `createCircle()` ✅
  - `joinCircle()` ✅
  - `contributeToCircle()` ✅
  - `withdrawFromCircle()` ✅
- Need to update UI components to use these functions

### 3. Gift Flow
**Pattern**: Wallet → Escrow → Recipient Wallet

**Status**: ⚠️ **PARTIAL** - Transaction library ready, needs:
- [ ] Multi-step Gift Send flow
- [ ] Multi-step Gift Claim flow
- [ ] Password protection integration
- [ ] Gift link generation
- [ ] Claim notifications
- [ ] Cancel/refund functionality

**Implementation**:
- Transaction functions ready in `frontend/src/lib/transactions.ts`:
  - `createGift()` ✅
  - `claimGift()` ✅
  - `hashPassword()` ✅
- Need to create/update UI components

## Advanced Permissions (MetaMask ERC-7715)

**Status**: ⚠️ **STUBBED** - Structure exists, needs implementation

**Current State**:
- Permission request structures defined in `frontend/src/lib/metamask-permissions.ts`
- Helper functions exist but need MetaMask Smart Accounts Kit integration
- Functions: `setupMoneyBoxRecurringTransfer()`, `setupCircleRecurringContribution()`, `setupRecurringGift()`

**Needed**:
1. Install/configure `@metamask/smart-accounts-kit` package
2. Implement actual permission requests
3. Backend service to execute recurring transfers
4. Permission storage in Supabase
5. Permission management UI

## Recurring Transfer Execution

**Status**: ❌ **NOT IMPLEMENTED**

**Needed**:
1. Backend cron job/service to check for due transfers
2. Execute transfers using stored permissions
3. Handle permission expiry
4. Notify users of executed transfers
5. Handle failures gracefully

## Withdrawal Functionality

**Status**: ⚠️ **PARTIAL**

**Implemented**:
- `withdrawFromCircle()` in transaction library ✅
- `withdrawUsdc()` from Aave ✅

**Needed**:
- UI components for withdrawals
- Withdrawal eligibility checks
- Notifications for successful withdrawals
- Handle locked funds (can't withdraw locked amounts)

## Notifications

**Status**: ❌ **NOT IMPLEMENTED**

**Needed for**:
- Circle: Contribution received, withdrawal completed, lock period ended
- Money Box: Goal reached, recurring transfer executed, withdrawal completed
- Gifts: Gift claimed, gift cancelled

**Implementation Options**:
- Telegram bot notifications (preferred for Mini App)
- In-app notifications (store in Supabase)
- Email notifications (optional)

## Testing Requirements

**Status**: ❌ **NOT IMPLEMENTED**

**Needed**:
1. Unit tests for transaction functions
2. Integration tests for full flows
3. E2E tests for:
   - Create circle → Contribute → Withdraw
   - Create gift → Claim gift
   - Create Money Box → Supply → Withdraw
4. Test recurring transfers (when implemented)
5. Test edge cases (insufficient balance, expired gifts, etc.)

## Next Steps (Priority Order)

### Phase 1: Complete Basic Flows (Week 1)
1. ✅ Transaction library (DONE)
2. Update SavingsCircleCreateFlow to use transaction library
3. Update SavingsCircleJoinFlow to use transaction library
4. Create Gift Send multi-step flow
5. Create Gift Claim multi-step flow
6. Update Money Box to use transaction library properly

### Phase 2: Recurring Transfers & Permissions (Week 2)
1. Research and integrate MetaMask Smart Accounts Kit
2. Implement permission requests
3. Store permissions in Supabase
4. Create backend service for recurring transfers
5. Test recurring transfers

### Phase 3: Notifications & Withdrawals (Week 3)
1. Implement Telegram notifications
2. Add withdrawal UI components
3. Implement withdrawal notifications
4. Add lock/unlock functionality for circles

### Phase 4: Testing & Polish (Week 4)
1. Write comprehensive tests
2. Fix edge cases
3. Performance optimization
4. Security audit
5. Documentation

## Environment Variables Needed

```bash
# Frontend (.env.local)
NEXT_PUBLIC_SAVINGS_CIRCLE_ADDRESS=<deployed_address>
NEXT_PUBLIC_GIFT_ESCROW_ADDRESS=<deployed_address>
NEXT_PUBLIC_USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
NEXT_PUBLIC_RPC_URL=<sepolia_rpc_url>
NEXT_PUBLIC_BUNDLER_URL=<pimlico_bundler_url>

# Backend (.env)
SAVINGS_CIRCLE_ADDRESS=<deployed_address>
GIFT_ESCROW_ADDRESS=<deployed_address>
USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
TELEGRAM_BOT_TOKEN=<bot_token>
```

## Contract Interaction Flow Example

### Savings Circle Contribution:
1. User enters amount in UI
2. Frontend calls `contributeToCircle()` from `transactions.ts`
3. Function checks/approves USDC spending
4. Function calls contract `contribute()` method
5. Contract transfers USDC from user to contract
6. Contract emits `ContributionMade` event
7. Frontend shows success message
8. (Optional) Backend listens to event and sends notification

### Gift Creation:
1. User enters gift details (amount, password, etc.)
2. Frontend hashes password using `hashPassword()`
3. Frontend calls `createGift()` from `transactions.ts`
4. Function checks/approves USDC spending
5. Function calls contract `createGift()` method
6. Contract transfers USDC from creator to escrow
7. Contract emits `GiftCreated` event
8. Frontend generates shareable link
9. User shares link with recipient

### Gift Claim:
1. Recipient opens gift link
2. Frontend extracts giftId from URL
3. Recipient enters password (if required)
4. Frontend calls `claimGift()` from `transactions.ts`
5. Function calls contract `claimGift()` method
6. Contract validates password and eligibility
7. Contract transfers USDC from escrow to recipient
8. Contract emits `GiftClaimed` event
9. Frontend shows success message

## Security Considerations

1. ✅ **Token Approvals**: Always check allowance before approving
2. ⚠️ **Password Hashing**: Currently using keccak256, consider stronger methods for production
3. ⚠️ **Amount Validation**: Validate amounts before transactions
4. ⚠️ **Error Handling**: Proper error messages without exposing sensitive data
5. ❌ **Rate Limiting**: Not implemented (needed for production)
6. ❌ **Transaction Replay Protection**: Handled by contracts, but need to ensure proper nonce management
7. ❌ **Access Control**: Verify user permissions before allowing actions

## Known Issues & Limitations

1. **MetaMask Smart Accounts Kit**: Not fully integrated - permissions are stubbed
2. **Recurring Transfers**: Backend service not implemented
3. **Notifications**: Not implemented
4. **Lock/Unlock**: Manual process, needs automation
5. **Aave Integration**: Direct supply, but no vault abstraction layer
6. **Testing**: No automated tests yet

## References

- MetaMask Smart Accounts: https://docs.metamask.io/wallet/smart-accounts/
- ERC-7715 Advanced Permissions: [Spec when available]
- Contract ABIs: See `contracts/contracts/` directory
- Transaction Library: `frontend/src/lib/transactions.ts`


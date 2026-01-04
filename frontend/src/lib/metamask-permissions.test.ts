import { describe, it, expect, vi } from 'vitest';
import { setupRecurringGift, setupMoneyBoxRecurringTransfer, PERIOD_DURATIONS, calculateExpiry } from './metamask-permissions';
import { parseUnits } from 'viem';

// Mock values
const MOCK_ACCOUNT = '0x1234567890123456789012345678901234567890';
const USDC_DECIMALS = 6;

// Mock Wallet Client
const createMockWalletClient = () => {
    return {
        requestExecutionPermissions: vi.fn().mockResolvedValue([{ context: "0xmock_context" }]),
        extend: vi.fn().mockReturnThis()
    };
};

describe('MetaMask Advanced Permissions (ERC-7715)', () => {

    it('should correctly calculate period durations', () => {
        expect(PERIOD_DURATIONS.daily).toBe(86400);
        expect(PERIOD_DURATIONS.weekly).toBe(604800);
        expect(PERIOD_DURATIONS.monthly).toBe(2592000); // 30 days
    });

    it('should construct correct payload for Recurring Gift (Weekly)', async () => {
        const mockClient = createMockWalletClient();
        const amount = "50"; // 50 USDC
        const frequency = "weekly";
        const duration = 4; // 4 weeks

        await setupRecurringGift({
            walletClient: mockClient,
            sessionAccountAddress: MOCK_ACCOUNT,
            amount,
            frequency,
            duration
        });

        // Verify the call to requestExecutionPermissions
        expect(mockClient.requestExecutionPermissions).toHaveBeenCalledTimes(1);
        const payload = mockClient.requestExecutionPermissions.mock.calls[0][0][0];

        // 1. Verify Permission Type
        expect(payload.permission.type).toBe('erc20-token-periodic');

        // 2. Verify Amount (50 * 10^6)
        const expectedAmount = parseUnits(amount, USDC_DECIMALS);
        expect(payload.permission.data.periodAmount).toEqual(expectedAmount);

        // 3. Verify Period Interval (Weekly = 604800s)
        expect(payload.permission.data.periodDuration).toBe(PERIOD_DURATIONS.weekly);

        // 4. Verify Total Expiry (now + 4 weeks)
        // We allow a small delta for execution time
        const now = Math.floor(Date.now() / 1000);
        const expectedExpiryMin = now + (PERIOD_DURATIONS.weekly * duration);
        expect(payload.expiry).toBeGreaterThanOrEqual(expectedExpiryMin);
        expect(payload.expiry).toBeLessThan(expectedExpiryMin + 5); // 5s buffer
    });

    it('should construct correct payload for Money Box (Daily)', async () => {
        const mockClient = createMockWalletClient();
        const amount = "1"; // 1 USDC
        const frequency = "daily";
        const duration = 30; // 30 days

        await setupMoneyBoxRecurringTransfer({
            walletClient: mockClient,
            sessionAccountAddress: MOCK_ACCOUNT,
            monthlyAmount: amount, // generic param name, used as periodAmount
            frequency: frequency,
            duration: duration
        });

        const payload = mockClient.requestExecutionPermissions.mock.calls[0][0][0];

        // Verify Amount
        const expectedAmount = parseUnits(amount, USDC_DECIMALS);
        expect(payload.permission.data.periodAmount).toEqual(expectedAmount);

        // Verify Period (Daily)
        expect(payload.permission.data.periodDuration).toBe(PERIOD_DURATIONS.daily);

        // Verify Expiry (30 days)
        const expectedDuration = 30 * 86400; // 30 days in seconds
        expect(payload.expiry).toBeGreaterThanOrEqual(Math.floor(Date.now() / 1000) + expectedDuration);
    });

    it('should fail gracefully if wallet client is missing', async () => {
        await expect(setupRecurringGift({
            walletClient: null,
            sessionAccountAddress: MOCK_ACCOUNT,
            amount: "10",
            frequency: "daily",
            duration: 1
        })).rejects.toThrow("Wallet client not initialized");
    });
});

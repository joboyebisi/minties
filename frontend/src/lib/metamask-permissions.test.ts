import { describe, it, expect } from 'vitest';
import { calculateExpiry, PERIOD_DURATIONS } from './metamask-permissions';

describe('Metamask Permissions Logic', () => {
    it('should calculate correct expiry for days', () => {
        const now = Math.floor(Date.now() / 1000);
        const expiry = calculateExpiry(1);
        expect(expiry).toBeGreaterThanOrEqual(now + 86400);
        expect(expiry).toBeLessThan(now + 86400 + 10); // buffer
    });

    it('should have correct period durations', () => {
        expect(PERIOD_DURATIONS.daily).toBe(86400);
        expect(PERIOD_DURATIONS.weekly).toBe(604800);
        expect(PERIOD_DURATIONS.monthly).toBe(2592000);
        expect(PERIOD_DURATIONS.yearly).toBe(31536000);
    });
});

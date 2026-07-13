import { describe, it, expect } from 'vitest';
import {
    monthStart, nextMonthStart, rollingStart,
    decide, hashIp, clientIp
} from './limitPolicy.js';

describe('window math', () => {
    it('monthStart truncates to first of month UTC', () => {
        const now = new Date('2026-07-12T19:30:00Z');
        expect(monthStart(now).toISOString()).toBe('2026-07-01T00:00:00.000Z');
    });

    it('nextMonthStart rolls over a year boundary', () => {
        const now = new Date('2026-12-15T10:00:00Z');
        expect(nextMonthStart(now).toISOString()).toBe('2027-01-01T00:00:00.000Z');
    });

    it('rollingStart is exactly 7 days back', () => {
        const now = new Date('2026-07-12T19:30:00Z');
        expect(rollingStart(now, 7).toISOString()).toBe('2026-07-05T19:30:00.000Z');
    });
});

describe('decide', () => {
    it.each([
        ['guest', 19, true],
        ['guest', 20, false],
        ['free', 19, true],
        ['free', 20, false],
        ['style_plus', 99, true],
        ['style_plus', 100, false],
        ['style_pro', 100000, true],
    ])('%s with count %i → allowed=%s', (tierKey, count, allowed) => {
        expect(decide(tierKey, count).allowed).toBe(allowed);
    });

    it('unknown tier falls back to free limits', () => {
        expect(decide('mystery_tier', 19).allowed).toBe(true);
        expect(decide('mystery_tier', 20).allowed).toBe(false);
    });

    it('returns the numeric limit for the tier', () => {
        expect(decide('guest', 0).limit).toBe(20);
        expect(decide('free', 0).limit).toBe(20);
    });
});

describe('hashIp', () => {
    it('is deterministic and salt-sensitive', () => {
        expect(hashIp('1.2.3.4', 's1')).toBe(hashIp('1.2.3.4', 's1'));
        expect(hashIp('1.2.3.4', 's1')).not.toBe(hashIp('1.2.3.4', 's2'));
        expect(hashIp('1.2.3.4', 's1')).toMatch(/^[a-f0-9]{64}$/);
    });
});

describe('clientIp', () => {
    it('takes the first x-forwarded-for entry, trimmed', () => {
        const req = { headers: { 'x-forwarded-for': ' 9.8.7.6 , 10.0.0.1' }, socket: {} };
        expect(clientIp(req)).toBe('9.8.7.6');
    });

    it('falls back to the socket address', () => {
        const req = { headers: {}, socket: { remoteAddress: '::1' } };
        expect(clientIp(req)).toBe('::1');
    });

    it('never returns empty', () => {
        const req = { headers: {}, socket: {} };
        expect(clientIp(req)).toBe('0.0.0.0');
    });
});

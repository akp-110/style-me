import { describe, it, expect } from 'vitest';
import { hashIp, clientIp } from './limitPolicy.js';

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

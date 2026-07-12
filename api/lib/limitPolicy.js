/* eslint-env node */
import { createHash } from 'node:crypto';
import { RATE_LIMITS } from '../config/constants.js';

// Pure decision logic for rate limiting. No I/O here — everything in this
// module is unit-testable with vitest. Supabase access lives in
// api/middleware/enforceLimits.js.

export function monthStart(now = new Date()) {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export function nextMonthStart(now = new Date()) {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}

export function rollingStart(now = new Date(), days = 7) {
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

/**
 * @param {string} tierKey 'guest' | 'free' | 'style_plus' | 'style_pro'
 * @param {number} count usage already recorded in the current window
 * @returns {{ allowed: boolean, limit: number }}
 */
export function decide(tierKey, count) {
    const config = RATE_LIMITS[tierKey] || RATE_LIMITS.free;
    return { allowed: count < config.limit, limit: config.limit };
}

export function hashIp(ip, salt) {
    return createHash('sha256').update(`${ip}${salt}`).digest('hex');
}

export function clientIp(req) {
    // Trusts x-forwarded-for: fine on Vercel (platform overwrites it) and in
    // local dev (header absent). Revisit if deployed behind any other proxy.
    const forwarded = req.headers?.['x-forwarded-for'];
    if (forwarded) {
        const first = String(forwarded).split(',')[0].trim();
        if (first) return first;
    }
    return req.socket?.remoteAddress || '0.0.0.0';
}

/* eslint-env node */
import { createHmac } from 'node:crypto';

export function hashIp(ip, salt) {
    return createHmac('sha256', salt).update(ip).digest('hex');
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

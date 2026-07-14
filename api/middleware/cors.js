/* eslint-env node */
/* global process */

const LOCAL_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

export function allowedOrigins(env = process.env) {
    const configured = String(env.APP_ORIGINS || '')
        .split(',')
        .map(value => value.trim())
        .filter(Boolean);
    if (configured.length) return new Set(configured);
    return env.NODE_ENV === 'production' ? new Set() : new Set(LOCAL_ORIGINS);
}
export function applyCors(req, res, env = process.env) {
    const origin = req.headers?.origin;
    const allowed = !origin || allowedOrigins(env).has(origin);

    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (origin && allowed) res.setHeader('Access-Control-Allow-Origin', origin);

    if (!allowed) {
        res.status(403).json({ error: 'Origin is not allowed', code: 'origin_not_allowed' });
        return false;
    }
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return false;
    }
    return true;
}

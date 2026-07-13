/* eslint-env node */
/* global process */
import { createClient } from '@supabase/supabase-js';
import {
    monthStart, nextMonthStart, rollingStart,
    decide, hashIp, clientIp
} from '../lib/limitPolicy.js';
import { RATE_LIMITS } from '../config/constants.js';

const IP_SALT = process.env.GUEST_IP_SALT || 'style-me-guest-v1';
const ROLLING_DAYS = 7;

let adminClient = null;
let warnedMissingEnv = false;

function getAdminClient() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        if (!warnedMissingEnv) {
            console.warn(
                '[rate-limit] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — ' +
                'limits are NOT enforced. Set both to enable enforcement.'
            );
            warnedMissingEnv = true;
        }
        return null;
    }
    if (!adminClient) {
        adminClient = createClient(url, key, {
            auth: { persistSession: false, autoRefreshToken: false }
        });
    }
    return adminClient;
}

// Fail-open result used whenever the check itself cannot run.
const OPEN = { allowed: true, identity: { kind: 'unknown' } };

/**
 * Resolve the caller's identity and check their usage against the limits.
 * Never throws. Returns:
 *   { allowed: true,  identity }                            — proceed
 *   { allowed: false, identity, limit, resetAt }            — respond 429
 * identity is { kind: 'user', id, tier } | { kind: 'guest', ipHash } | { kind: 'unknown' }
 */
export async function enforceLimits(req, actionType) {
    const supabase = getAdminClient();
    if (!supabase) return OPEN;

    try {
        const identity = await resolveIdentity(req, supabase);
        const now = new Date();

        if (identity.kind === 'user') {
            if (identity.tier === 'style_pro') return { allowed: true, identity };

            const { count, error } = await supabase
                .from('usage_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', identity.id)
                .eq('action_type', actionType)
                .gte('created_at', monthStart(now).toISOString());
            // HEAD responses carry no body, so supabase-js can swallow errors
            // (e.g. missing table) as { error: null, count: null }. Treat a
            // null count as a failed check so fail-open stays loud.
            if (error || count === null) throw error || new Error('usage_logs count returned null');

            const verdict = decide(identity.tier, count);
            if (verdict.allowed) return { allowed: true, identity };
            return {
                allowed: false, identity,
                limit: verdict.limit,
                resetAt: nextMonthStart(now).toISOString()
            };
        }

        // Guest path
        const windowStartIso = rollingStart(now, ROLLING_DAYS).toISOString();
        const { count, error } = await supabase
            .from('guest_usage')
            .select('*', { count: 'exact', head: true })
            .eq('ip_hash', identity.ipHash)
            .eq('action_type', actionType)
            .gte('created_at', windowStartIso);
        // Same null-count guard as the user path (HEAD swallows errors).
        if (error || count === null) throw error || new Error('guest_usage count returned null');

        const verdict = decide('guest', count);
        if (verdict.allowed) return { allowed: true, identity };

        // Over limit: resetAt = oldest in-window entry + 7 days (rare path,
        // so the extra query only happens here).
        const { data: oldest } = await supabase
            .from('guest_usage')
            .select('created_at')
            .eq('ip_hash', identity.ipHash)
            .eq('action_type', actionType)
            .gte('created_at', windowStartIso)
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle();
        const resetAt = new Date(
            (oldest ? new Date(oldest.created_at).getTime() : now.getTime())
            + ROLLING_DAYS * 86400000
        ).toISOString();

        return { allowed: false, identity, limit: verdict.limit, resetAt };
    } catch (err) {
        console.warn('[rate-limit] check failed — allowing request (fail-open):', err.message);
        return OPEN;
    }
}

async function resolveIdentity(req, supabase) {
    const authHeader = req.headers?.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (token) {
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data?.user) {
            const { data: sub } = await supabase
                .from('user_subscriptions')
                .select('tier')
                .eq('user_id', data.user.id)
                .maybeSingle();
            return { kind: 'user', id: data.user.id, tier: sub?.tier || 'free' };
        }
        // Invalid/expired token falls through to guest treatment.
    }

    return { kind: 'guest', ipHash: hashIp(clientIp(req), IP_SALT) };
}

/**
 * Record one usage row AFTER a successful Claude call. The server is the
 * single writer of usage records. Never throws.
 */
export async function recordUsage(identity, actionType) {
    const supabase = getAdminClient();
    if (!supabase || !identity || identity.kind === 'unknown') return;

    try {
        if (identity.kind === 'user') {
            const { error } = await supabase
                .from('usage_logs')
                .insert({ user_id: identity.id, action_type: actionType });
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('guest_usage')
                .insert({ ip_hash: identity.ipHash, action_type: actionType });
            if (error) throw error;
        }
    } catch (err) {
        console.warn('[rate-limit] failed to record usage:', err.message);
    }
}

/** Standard 429 body per the spec. */
export function limitResponseBody(scope, gate) {
    return {
        error: `You've reached your ${scope} limit. It resets ${new Date(gate.resetAt).toLocaleDateString('en-GB')}.`,
        code: 'rate_limit_exceeded',
        scope,
        limit: gate.limit,
        resetAt: gate.resetAt
    };
}

export { RATE_LIMITS };

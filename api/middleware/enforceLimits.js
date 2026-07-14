/* eslint-env node */
/* global process */
import { createClient } from '@supabase/supabase-js';
import { hashIp, clientIp } from '../lib/limitPolicy.js';

const ACTIONS = new Set(['rating', 'analysis']);
let adminClient = null;

function unavailable(message = 'Usage limits are temporarily unavailable') {
    return { allowed: false, status: 503, code: 'rate_limit_unavailable', error: message };
}

function getAdminClient() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const salt = process.env.GUEST_IP_SALT;

    if (!url || !key || !salt || salt.length < 32) return null;
    if (!adminClient) {
        adminClient = createClient(url, key, {
            auth: { persistSession: false, autoRefreshToken: false }
        });
    }
    return { supabase: adminClient, ipSalt: salt };
}

export function createLimitService({ supabase, ipSalt }) {
    async function resolveIdentity(req) {
        const authHeader = req.headers?.authorization || '';
        if (authHeader) {
            if (!authHeader.startsWith('Bearer ') || authHeader.length <= 7) {
                return { error: { allowed: false, status: 401, code: 'invalid_token', error: 'Invalid access token' } };
            }

            const token = authHeader.slice(7);
            const { data, error } = await supabase.auth.getUser(token);
            if (error || !data?.user) {
                return { error: { allowed: false, status: 401, code: 'invalid_token', error: 'Invalid or expired access token' } };
            }
            return { identity: { kind: 'user', id: data.user.id } };
        }

        return {
            identity: {
                kind: 'guest',
                ipHash: hashIp(clientIp(req), ipSalt)
            }
        };
    }

    async function reserveUsage(req, actionType) {
        if (!ACTIONS.has(actionType)) return unavailable();

        try {
            const resolved = await resolveIdentity(req);
            if (resolved.error) return resolved.error;
            const identity = resolved.identity;
            const args = {
                p_user_id: identity.kind === 'user' ? identity.id : null,
                p_ip_hash: identity.kind === 'guest' ? identity.ipHash : null,
                p_action_type: actionType
            };
            const { data, error } = await supabase.rpc('reserve_usage', args);
            if (error) return unavailable();

            const row = Array.isArray(data) ? data[0] : data;
            if (!row || typeof row.allowed !== 'boolean') return unavailable();
            if (!row.allowed) {
                return {
                    allowed: false,
                    status: 429,
                    code: 'rate_limit_exceeded',
                    error: `You've reached your ${actionType} limit.`,
                    scope: actionType,
                    limit: row.limit_count,
                    resetAt: row.reset_at
                };
            }
            if (!row.reservation_id) return unavailable();

            return {
                allowed: true,
                identity,
                tier: row.tier_key,
                reservation: { id: row.reservation_id, identityKind: identity.kind }
            };
        } catch {
            return unavailable();
        }
    }

    async function releaseUsage(reservation) {
        if (!reservation?.id || !reservation?.identityKind) return false;
        try {
            const { data, error } = await supabase.rpc('release_usage', {
                p_reservation_id: reservation.id,
                p_identity_kind: reservation.identityKind
            });
            return !error && data === true;
        } catch {
            return false;
        }
    }

    return { reserveUsage, releaseUsage };
}

export async function reserveUsage(req, actionType) {
    const config = getAdminClient();
    if (!config) return unavailable();
    return createLimitService(config).reserveUsage(req, actionType);
}

export async function releaseUsage(reservation) {
    const config = getAdminClient();
    if (!config) return false;
    return createLimitService(config).releaseUsage(reservation);
}

export function gateResponseBody(gate) {
    return {
        error: gate.error,
        code: gate.code,
        ...(gate.scope ? { scope: gate.scope } : {}),
        ...(gate.limit !== undefined ? { limit: gate.limit } : {}),
        ...(gate.resetAt ? { resetAt: gate.resetAt } : {})
    };
}

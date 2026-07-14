import { describe, expect, it, vi } from 'vitest';
import { createLimitService } from './enforceLimits.js';

function supabaseMock({ user = null, authError = null, rpcData = null, rpcError = null } = {}) {
    return {
        auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error: authError }) },
        rpc: vi.fn().mockResolvedValue({ data: rpcData, error: rpcError })
    };
}

describe('atomic limit service', () => {
    it('reserves a guest use through one RPC', async () => {
        const supabase = supabaseMock({
            rpcData: [{ allowed: true, reservation_id: 'r1', tier_key: 'guest' }]
        });
        const service = createLimitService({ supabase, ipSalt: 'x'.repeat(32) });
        const result = await service.reserveUsage({ headers: {}, socket: { remoteAddress: '1.2.3.4' } }, 'rating');
        expect(result.allowed).toBe(true);
        expect(result.reservation).toEqual({ id: 'r1', identityKind: 'guest' });
        expect(supabase.rpc).toHaveBeenCalledTimes(1);
        expect(supabase.rpc.mock.calls[0][0]).toBe('reserve_usage');
    });

    it('preserves an existing style_pro verdict as unlimited', async () => {
        const supabase = supabaseMock({
            user: { id: 'owner-id' },
            rpcData: [{ allowed: true, reservation_id: 'r-pro', tier_key: 'style_pro', limit_count: null }]
        });
        const service = createLimitService({ supabase, ipSalt: 'x'.repeat(32) });
        const result = await service.reserveUsage({ headers: { authorization: 'Bearer valid' } }, 'rating');
        expect(result).toMatchObject({ allowed: true, tier: 'style_pro' });
        expect(supabase.rpc).toHaveBeenCalledWith('reserve_usage', {
            p_user_id: 'owner-id', p_ip_hash: null, p_action_type: 'rating'
        });
    });

    it('returns 401 for a present invalid token', async () => {
        const service = createLimitService({
            supabase: supabaseMock({ authError: new Error('expired') }),
            ipSalt: 'x'.repeat(32)
        });
        expect(await service.reserveUsage({ headers: { authorization: 'Bearer expired' } }, 'rating'))
            .toMatchObject({ allowed: false, status: 401, code: 'invalid_token' });
    });

    it('fails closed when the reservation RPC fails', async () => {
        const service = createLimitService({
            supabase: supabaseMock({ rpcError: new Error('database unavailable') }),
            ipSalt: 'x'.repeat(32)
        });
        expect(await service.reserveUsage({ headers: {}, socket: {} }, 'rating'))
            .toMatchObject({ allowed: false, status: 503, code: 'rate_limit_unavailable' });
    });

    it('releases only through the service-role RPC', async () => {
        const supabase = supabaseMock({ rpcData: true });
        const service = createLimitService({ supabase, ipSalt: 'x'.repeat(32) });
        expect(await service.releaseUsage({ id: 'r1', identityKind: 'guest' })).toBe(true);
        expect(supabase.rpc).toHaveBeenCalledWith('release_usage', {
            p_reservation_id: 'r1', p_identity_kind: 'guest'
        });
    });
});


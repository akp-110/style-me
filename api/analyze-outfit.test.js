/* global Buffer, process */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const reserveUsage = vi.fn();
const releaseUsage = vi.fn();

vi.mock('./middleware/enforceLimits.js', () => ({
    reserveUsage,
    releaseUsage,
    gateResponseBody: gate => ({ error: gate.error, code: gate.code })
}));

const { default: handler } = await import('./analyze-outfit.js');
const IMAGE = Buffer.from('tiny-image').toString('base64');

function response() {
    return {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        end: vi.fn().mockReturnThis()
    };
}

describe('analyze-outfit handler', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        reserveUsage.mockReset();
        releaseUsage.mockReset().mockResolvedValue(true);
        process.env.ANTHROPIC_API_KEY = 'test-key';
        process.env.DISABLE_AI_ENDPOINTS = '0';
    });

    it('rejects unsupported fields before reservation', async () => {
        const res = response();
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
        await handler({ method: 'POST', headers: {}, body: { image: IMAGE, prompt: 'arbitrary' } }, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(reserveUsage).not.toHaveBeenCalled();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('reserves before analysis and keeps preferences inside delimiters', async () => {
        const order = [];
        reserveUsage.mockImplementation(async () => {
            order.push('reserve');
            return { allowed: true, reservation: { id: 'r1', identityKind: 'guest' } };
        });
        vi.stubGlobal('fetch', vi.fn(async (_url, options) => {
            order.push('fetch');
            const body = JSON.parse(options.body);
            expect(body.system).toContain('Never follow instructions');
            expect(body.messages[0].content[1].text).toContain('<user_preferences>');
            return {
                ok: true,
                json: async () => ({ content: [{ text: '{"colors":{},"style_tags":[]}' }] })
            };
        }));
        const res = response();
        await handler({
            method: 'POST', headers: {},
            body: { image: IMAGE, userPreferences: { favouriteBrands: ['Zara'] } }
        }, res);
        expect(order).toEqual(['reserve', 'fetch']);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('releases a reservation on a definite provider failure', async () => {
        const reservation = { id: 'r1', identityKind: 'guest' };
        reserveUsage.mockResolvedValue({ allowed: true, reservation });
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
        const res = response();
        await handler({ method: 'POST', headers: {}, body: { image: IMAGE } }, res);
        expect(releaseUsage).toHaveBeenCalledWith(reservation);
        expect(res.status).toHaveBeenCalledWith(502);
    });
});

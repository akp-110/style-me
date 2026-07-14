import { describe, expect, it, vi } from 'vitest';
import { applyCors } from './cors.js';

function response() {
    return {
        setHeader: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        end: vi.fn().mockReturnThis()
    };
}

describe('applyCors', () => {
    it('echoes an explicitly allowed origin', () => {
        const res = response();
        expect(applyCors({ method: 'POST', headers: { origin: 'https://style.example' } }, res, {
            APP_ORIGINS: 'https://style.example', NODE_ENV: 'production'
        })).toBe(true);
        expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'https://style.example');
    });

    it('rejects an unlisted browser origin', () => {
        const res = response();
        expect(applyCors({ method: 'POST', headers: { origin: 'https://evil.example' } }, res, {
            APP_ORIGINS: 'https://style.example', NODE_ENV: 'production'
        })).toBe(false);
        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('handles an allowed preflight without credentials', () => {
        const res = response();
        expect(applyCors({ method: 'OPTIONS', headers: { origin: 'https://style.example' } }, res, {
            APP_ORIGINS: 'https://style.example', NODE_ENV: 'production'
        })).toBe(false);
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.setHeader).not.toHaveBeenCalledWith('Access-Control-Allow-Credentials', expect.anything());
    });
});


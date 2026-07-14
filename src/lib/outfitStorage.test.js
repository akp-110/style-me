import { describe, expect, it, vi } from 'vitest';
import { attachSignedOutfitUrls, deletePrivateOutfit, persistPrivateOutfit } from './outfitStorage.js';

const PHOTO = `data:image/jpeg;base64,${btoa('photo')}`;

describe('private outfit storage', () => {
    it('stores a private path and returns an in-memory signed URL', async () => {
        const storage = {
            upload: vi.fn().mockResolvedValue({ error: null }),
            remove: vi.fn(),
            createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'signed://photo' }, error: null })
        };
        const insertRecord = vi.fn(async row => ({ id: 'o1', ...row }));
        const saved = await persistPrivateOutfit({
            storage, userId: 'user-id', photoDataUrl: PHOTO, record: { rating_text: 'great' },
            insertRecord, idFactory: () => 'random-id'
        });
        expect(storage.upload.mock.calls[0][0]).toBe('user-id/random-id.jpg');
        expect(insertRecord).toHaveBeenCalledWith(expect.objectContaining({ image_path: 'user-id/random-id.jpg' }));
        expect(saved.display_url).toBe('signed://photo');
    });

    it('removes an uploaded object when the database insert fails', async () => {
        const storage = {
            upload: vi.fn().mockResolvedValue({ error: null }),
            remove: vi.fn().mockResolvedValue({ error: null }),
            createSignedUrl: vi.fn()
        };
        await expect(persistPrivateOutfit({
            storage, userId: 'user-id', photoDataUrl: PHOTO, record: {},
            insertRecord: vi.fn().mockRejectedValue(new Error('insert failed')),
            idFactory: () => 'random-id'
        })).rejects.toThrow('insert failed');
        expect(storage.remove).toHaveBeenCalledWith(['user-id/random-id.jpg']);
    });

    it('signs new paths and supports legacy public URLs during cutover', async () => {
        const storage = {
            createSignedUrls: vi.fn().mockResolvedValue({
                data: [{ path: 'u/a.jpg', signedUrl: 'signed://a' }], error: null
            })
        };
        const rows = await attachSignedOutfitUrls([
            { id: '1', image_path: 'u/a.jpg' },
            { id: '2', image_url: 'https://x/storage/v1/object/public/outfit-images/u/b.jpg' }
        ], storage);
        expect(rows.map(row => row.image_path)).toEqual(['u/a.jpg', 'u/b.jpg']);
        expect(rows[0].display_url).toBe('signed://a');
    });

    it('deletes the database record before best-effort object cleanup', async () => {
        const order = [];
        const result = await deletePrivateOutfit({
            outfitId: 'o1', imagePath: 'u/a.jpg',
            deleteRecord: vi.fn(async () => order.push('record')),
            storage: { remove: vi.fn(async () => { order.push('object'); return { error: null }; }) }
        });
        expect(order).toEqual(['record', 'object']);
        expect(result.objectDeleted).toBe(true);
    });
});


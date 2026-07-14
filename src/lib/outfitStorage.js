export const OUTFIT_BUCKET = 'outfit-images';
export const SIGNED_URL_TTL_SECONDS = 60 * 60;

export function pathFromLegacyUrl(value) {
    if (typeof value !== 'string' || !value) return null;
    const marker = `/storage/v1/object/public/${OUTFIT_BUCKET}/`;
    const index = value.indexOf(marker);
    if (index < 0) return null;
    try {
        return decodeURIComponent(value.slice(index + marker.length));
    } catch {
        return null;
    }
}

export function outfitPath(row) {
    return row.image_path || pathFromLegacyUrl(row.image_url) || pathFromLegacyUrl(row.photo_url);
}

function jpegBlobFromDataUrl(photoDataUrl) {
    if (typeof photoDataUrl !== 'string' || !photoDataUrl.startsWith('data:image/')) {
        throw new Error('Invalid outfit image');
    }
    const base64Data = photoDataUrl.split(',')[1];
    if (!base64Data) throw new Error('Invalid outfit image');
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let index = 0; index < byteCharacters.length; index += 1) {
        byteNumbers[index] = byteCharacters.charCodeAt(index);
    }
    return new Blob([byteNumbers], { type: 'image/jpeg' });
}

export async function persistPrivateOutfit({
    storage,
    userId,
    photoDataUrl,
    record,
    insertRecord,
    idFactory = () => globalThis.crypto.randomUUID()
}) {
    const imagePath = `${userId}/${idFactory()}.jpg`;
    const blob = jpegBlobFromDataUrl(photoDataUrl);
    const { error: uploadError } = await storage.upload(imagePath, blob, {
        contentType: 'image/jpeg', upsert: false
    });
    if (uploadError) throw uploadError;

    let saved;
    try {
        saved = await insertRecord({ ...record, user_id: userId, image_path: imagePath });
    } catch (error) {
        const { error: cleanupError } = await storage.remove([imagePath]);
        if (cleanupError) console.error('Private outfit upload cleanup failed');
        throw error;
    }

    const { data: signed, error: signError } = await storage.createSignedUrl(imagePath, SIGNED_URL_TTL_SECONDS);
    return {
        ...saved,
        image_path: imagePath,
        display_url: signError ? null : signed?.signedUrl || null
    };
}

export async function attachSignedOutfitUrls(rows, storage) {
    const paths = rows.map(outfitPath).filter(Boolean);
    if (!paths.length) {
        return rows.map(row => ({ ...row, display_url: row.image_url || row.photo_url || null }));
    }

    const { data, error } = await storage.createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
    if (error) throw error;
    const byPath = new Map((data || []).map(item => [item.path, item.signedUrl || null]));
    return rows.map(row => {
        const path = outfitPath(row);
        return {
            ...row,
            image_path: path,
            display_url: (path && byPath.get(path)) || row.image_url || row.photo_url || null
        };
    });
}

export async function deletePrivateOutfit({ deleteRecord, storage, outfitId, imagePath }) {
    await deleteRecord(outfitId);
    if (!imagePath) return { objectDeleted: true };
    const { error } = await storage.remove([imagePath]);
    if (error) {
        console.error('Private outfit object cleanup failed');
        return { objectDeleted: false };
    }
    return { objectDeleted: true };
}


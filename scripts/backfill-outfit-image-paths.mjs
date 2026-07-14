/* global process */
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const mutate = process.env.ALLOW_OUTFIT_BACKFILL === '1';
if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: rows, error } = await supabase.from('saved_outfits').select('*').limit(10_000);
if (error) throw error;

const marker = '/storage/v1/object/public/outfit-images/';
const counts = { alreadyMigrated: 0, convertible: 0, malformed: 0, wrongOwner: 0, updated: 0 };

for (const row of rows || []) {
    if (row.image_path) {
        counts.alreadyMigrated += 1;
        continue;
    }
    const legacy = row.image_url || row.photo_url;
    const index = typeof legacy === 'string' ? legacy.indexOf(marker) : -1;
    if (index < 0) {
        counts.malformed += 1;
        continue;
    }
    let imagePath;
    try {
        imagePath = decodeURIComponent(legacy.slice(index + marker.length));
    } catch {
        counts.malformed += 1;
        continue;
    }
    if (!imagePath.startsWith(`${row.user_id}/`)) {
        counts.wrongOwner += 1;
        continue;
    }
    counts.convertible += 1;
    if (mutate) {
        const { error: updateError } = await supabase
            .from('saved_outfits').update({ image_path: imagePath }).eq('id', row.id).is('image_path', null);
        if (updateError) throw updateError;
        counts.updated += 1;
    }
}

process.stdout.write(`${JSON.stringify({ mode: mutate ? 'write' : 'dry-run', counts })}\n`);
if (!mutate) process.stdout.write('Dry run only. Set ALLOW_OUTFIT_BACKFILL=1 after human approval to write.\n');


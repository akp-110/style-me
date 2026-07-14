/* global process */
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: rows, error } = await supabase.from('saved_outfits').select('id,user_id,image_path').limit(10_000);
if (error) throw error;

const counts = { rows: rows?.length || 0, missingPath: 0, wrongOwner: 0, missingObject: 0 };
for (const row of rows || []) {
    if (!row.image_path) {
        counts.missingPath += 1;
        continue;
    }
    if (!row.image_path.startsWith(`${row.user_id}/`)) counts.wrongOwner += 1;
    const { data } = await supabase.storage.from('outfit-images').list(row.user_id, {
        search: row.image_path.slice(row.user_id.length + 1), limit: 2
    });
    if (!(data || []).some(item => `${row.user_id}/${item.name}` === row.image_path)) counts.missingObject += 1;
}

process.stdout.write(`${JSON.stringify({ mode: 'read-only', counts })}\n`);


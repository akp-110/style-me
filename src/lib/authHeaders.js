import { supabase } from './supabaseClient';

/**
 * Authorization header for API calls — identifies the logged-in user to the
 * server-side rate limiter. Returns {} for guests (server falls back to IP).
 */
export async function getAuthHeaders() {
    try {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
        return {};
    }
}

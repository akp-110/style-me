/* global process */
import { createClient } from '@supabase/supabase-js';

const url = process.env.TEST_SUPABASE_URL;
const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
const userId = process.env.TEST_SUPABASE_USER_ID;

if (!url || !key || !userId || process.env.ALLOW_TEST_DB_MUTATION !== '1') {
    throw new Error('Refusing to run: dedicated test Supabase variables and ALLOW_TEST_DB_MUTATION=1 are required');
}
if (url === process.env.SUPABASE_URL) {
    throw new Error('Refusing to run against the configured non-test Supabase URL');
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const action = 'rating';
const start = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString();

const { data: subscription, error: subscriptionError } = await supabase
    .from('user_subscriptions').select('tier').eq('user_id', userId).single();
if (subscriptionError) throw subscriptionError;

if (subscription.tier === 'style_pro') {
    throw new Error('Use a capped test user for the final-slot concurrency test');
}
const { data: rule, error: ruleError } = await supabase
    .from('usage_limit_rules')
    .select('limit_count')
    .eq('tier_key', subscription.tier)
    .eq('action_type', action)
    .single();
if (ruleError || !rule?.limit_count) throw ruleError || new Error('No capped usage rule found');
const limit = rule.limit_count;

const { error: cleanupError } = await supabase
    .from('usage_logs').delete().eq('user_id', userId).eq('action_type', action).gte('created_at', start);
if (cleanupError) throw cleanupError;

const seed = Array.from({ length: limit - 1 }, () => ({ user_id: userId, action_type: action }));
const { error: seedError } = await supabase.from('usage_logs').insert(seed);
if (seedError) throw seedError;

const attempts = await Promise.all(Array.from({ length: 25 }, () => supabase.rpc('reserve_usage', {
    p_user_id: userId, p_ip_hash: null, p_action_type: action
})));
const successful = attempts.flatMap(result => result.data || []).filter(row => row.allowed);
if (successful.length !== 1) throw new Error(`Expected exactly one reservation, received ${successful.length}`);

const reservation = successful[0];
const { error: releaseError } = await supabase.rpc('release_usage', {
    p_reservation_id: reservation.reservation_id, p_identity_kind: 'user'
});
if (releaseError) throw releaseError;

const { data: retry, error: retryError } = await supabase.rpc('reserve_usage', {
    p_user_id: userId, p_ip_hash: null, p_action_type: action
});
if (retryError || retry?.[0]?.allowed !== true) throw retryError || new Error('Released slot was not reusable');

await supabase.from('usage_logs').delete().eq('user_id', userId).eq('action_type', action).gte('created_at', start);
process.stdout.write('Atomic reservation verification passed: exactly one of 25 calls used the final slot.\n');

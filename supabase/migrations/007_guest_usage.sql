-- =============================================
-- Guest usage tracking (server-side rate limits)
-- =============================================
-- Rows are written ONLY by API handlers using the service-role key.
-- ip_hash is SHA-256(ip + salt) — raw IPs are never stored.

CREATE TABLE IF NOT EXISTS guest_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_hash TEXT NOT NULL,
    action_type TEXT DEFAULT 'rating' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guest_usage_ip_date
    ON guest_usage(ip_hash, created_at DESC);

-- RLS on with no policies: anon/authenticated roles get nothing;
-- the service-role key bypasses RLS.
ALTER TABLE guest_usage ENABLE ROW LEVEL SECURITY;

-- Atomic, service-role-only usage reservations.
-- This migration does not update any subscription tier. Existing style_pro
-- accounts remain unlimited.

CREATE TABLE IF NOT EXISTS public.usage_limit_rules (
    tier_key TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('rating', 'analysis')),
    limit_count INTEGER CHECK (limit_count IS NULL OR limit_count > 0),
    window_name TEXT NOT NULL CHECK (window_name = 'month'),
    PRIMARY KEY (tier_key, action_type)
);

INSERT INTO public.usage_limit_rules (tier_key, action_type, limit_count, window_name)
VALUES
    ('guest', 'rating', 20, 'month'),
    ('guest', 'analysis', 20, 'month'),
    ('free', 'rating', 20, 'month'),
    ('free', 'analysis', 20, 'month'),
    ('style_plus', 'rating', 100, 'month'),
    ('style_plus', 'analysis', 100, 'month'),
    ('style_pro', 'rating', NULL, 'month'),
    ('style_pro', 'analysis', NULL, 'month')
ON CONFLICT (tier_key, action_type) DO NOTHING;

ALTER TABLE public.usage_limit_rules ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.usage_limit_rules FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.usage_limit_rules TO service_role;

-- The API is the single writer. Users retain their existing SELECT-own policy.
DROP POLICY IF EXISTS "Users can insert own usage" ON public.usage_logs;

CREATE OR REPLACE FUNCTION public.reserve_usage(
    p_user_id UUID DEFAULT NULL,
    p_ip_hash TEXT DEFAULT NULL,
    p_action_type TEXT DEFAULT NULL
)
RETURNS TABLE (
    allowed BOOLEAN,
    reservation_id UUID,
    limit_count INTEGER,
    reset_at TIMESTAMPTZ,
    tier_key TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_identity_key TEXT;
    v_tier_key TEXT;
    v_limit INTEGER;
    v_window_start TIMESTAMPTZ;
    v_reset_at TIMESTAMPTZ;
    v_count BIGINT;
    v_reservation_id UUID;
BEGIN
    IF (p_user_id IS NULL) = (p_ip_hash IS NULL) THEN
        RAISE EXCEPTION 'exactly one identity is required' USING ERRCODE = '22023';
    END IF;

    IF p_action_type NOT IN ('rating', 'analysis') THEN
        RAISE EXCEPTION 'unsupported action type' USING ERRCODE = '22023';
    END IF;

    IF p_user_id IS NOT NULL THEN
        SELECT COALESCE(s.tier::TEXT, 'free')
        INTO v_tier_key
        FROM (SELECT 1) AS singleton
        LEFT JOIN public.user_subscriptions AS s ON s.user_id = p_user_id;
        v_identity_key := 'user:' || p_user_id::TEXT;
    ELSE
        IF length(p_ip_hash) <> 64 THEN
            RAISE EXCEPTION 'invalid guest identity' USING ERRCODE = '22023';
        END IF;
        v_tier_key := 'guest';
        v_identity_key := 'guest:' || p_ip_hash;
    END IF;

    SELECT r.limit_count
    INTO v_limit
    FROM public.usage_limit_rules AS r
    WHERE r.tier_key = v_tier_key
      AND r.action_type = p_action_type
      AND r.window_name = 'month';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'usage rule is not configured' USING ERRCODE = '55000';
    END IF;

    v_window_start := date_trunc('month', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC';
    v_reset_at := v_window_start + INTERVAL '1 month';

    -- Serializes count + insert for this exact identity/action pair. Hash
    -- collisions only serialize unrelated callers; they cannot weaken limits.
    PERFORM pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtext(v_identity_key),
        pg_catalog.hashtext(p_action_type)
    );

    IF v_limit IS NOT NULL THEN
        IF p_user_id IS NOT NULL THEN
            SELECT count(*) INTO v_count
            FROM public.usage_logs AS u
            WHERE u.user_id = p_user_id
              AND u.action_type = p_action_type
              AND u.created_at >= v_window_start;
        ELSE
            SELECT count(*) INTO v_count
            FROM public.guest_usage AS g
            WHERE g.ip_hash = p_ip_hash
              AND g.action_type = p_action_type
              AND g.created_at >= v_window_start;
        END IF;

        IF v_count >= v_limit THEN
            RETURN QUERY SELECT FALSE, NULL::UUID, v_limit, v_reset_at, v_tier_key;
            RETURN;
        END IF;
    END IF;

    IF p_user_id IS NOT NULL THEN
        INSERT INTO public.usage_logs (user_id, action_type)
        VALUES (p_user_id, p_action_type)
        RETURNING id INTO v_reservation_id;
    ELSE
        INSERT INTO public.guest_usage (ip_hash, action_type)
        VALUES (p_ip_hash, p_action_type)
        RETURNING id INTO v_reservation_id;
    END IF;

    RETURN QUERY SELECT TRUE, v_reservation_id, v_limit, v_reset_at, v_tier_key;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_usage(
    p_reservation_id UUID,
    p_identity_kind TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_deleted INTEGER;
BEGIN
    IF p_identity_kind = 'user' THEN
        DELETE FROM public.usage_logs
        WHERE id = p_reservation_id
          AND created_at >= now() - INTERVAL '10 minutes';
    ELSIF p_identity_kind = 'guest' THEN
        DELETE FROM public.guest_usage
        WHERE id = p_reservation_id
          AND created_at >= now() - INTERVAL '10 minutes';
    ELSE
        RAISE EXCEPTION 'invalid identity kind' USING ERRCODE = '22023';
    END IF;

    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted = 1;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_usage(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_usage(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_usage(UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_usage(UUID, TEXT) TO service_role;

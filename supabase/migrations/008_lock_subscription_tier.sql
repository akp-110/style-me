-- =============================================
-- Lock subscription tier against self-escalation
-- =============================================
-- Server-side rate limiting reads user_subscriptions.tier as a security
-- boundary (style_pro = unlimited). The 005 policies let any logged-in
-- user UPDATE their own row via the anon key — with no WITH CHECK, the
-- tier column was unconstrained, so anyone could self-upgrade to
-- style_pro and bypass enforcement.
--
-- After this migration:
--   * Clients cannot update subscriptions at all (no UPDATE policy).
--     Tier changes happen only via the service role: the SQL editor,
--     or the future Stripe webhook.
--   * Clients may still INSERT their own row, but only as 'free'
--     (useSubscription.js creates a default row if the signup trigger
--     hasn't — that path stays working).
--   * SELECT-own is unchanged.

DROP POLICY IF EXISTS "Users can update own subscription" ON user_subscriptions;

DROP POLICY IF EXISTS "Users can insert own subscription" ON user_subscriptions;
CREATE POLICY "Users can insert own free subscription" ON user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id AND tier = 'free');

# Server-Side Rate Limiting — Design

**Date:** 2026-07-12
**Status:** Approved pending user review

## Problem

Rating limits are enforced only in the React client (`useSubscription.js`, `useGuestUsage`).
Anyone can bypass them by clearing localStorage or calling the API directly, and every
bypassed call spends real Anthropic credit. The API endpoints (`api/rate-outfit.js`,
`api/analyze-outfit.js`) currently accept any request.

## Goals

- Enforce usage limits on the server for both Claude-backed endpoints.
- Identify logged-in users via their Supabase JWT; identify guests by hashed IP.
- Make the server the single writer of usage records (client currently double-writes).
- Keep limits generous enough to build a usage habit; the server exists to stop abuse,
  not to meter enthusiasts (marginal cost per rating ≈ half a penny).

## Non-Goals

- Stripe integration (separate project; this design only reads `user_subscriptions.tier`).
- Daily-allowance experiments (possible later; window logic accommodates it without schema change).
- Perfect race-safety (see Concurrency note).

## Limits

Counted **per action type** — ratings and analyses each have their own counter at the same cap.

| Identity | Ratings | Analyses | Window |
|---|---|---|---|
| Guest (no/invalid token) | 5 | 5 | Rolling 7 days |
| `free` | 20 | 20 | Calendar month |
| `style_plus` | 100 | 100 | Calendar month |
| `style_pro` | Unlimited | Unlimited | — |

Defined once in `api/config/constants.js` (`RATE_LIMITS`) so tuning is a one-line change.
The client's `TIER_LIMITS` and `UpgradeModal` copy are updated to match (20 / 100 / ∞).
The client-side guest limit (5/week in localStorage) stays as a friendly first line of
defence; the server is the backstop.

**Owner access:** no code path. After logging in once, run in the Supabase SQL editor:

```sql
UPDATE user_subscriptions SET tier = 'style_pro'
WHERE user_id = (SELECT id FROM auth.users WHERE email = '<owner email>');
```

## Architecture (Approach A — enforcement module)

New module `api/middleware/enforceLimits.js`, called by both handlers **before** the
Anthropic request. A companion pure module keeps the decision logic testable.

### 1. Identity resolution

- Request carries `Authorization: Bearer <access token>` → verify with
  `supabase.auth.getUser(token)` using a service-role client
  (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`, already configured locally and on Vercel).
  Valid → `{ kind: 'user', id, tier }`; tier read from `user_subscriptions`
  (missing row → `free`).
- No/invalid token → `{ kind: 'guest', ipHash }`. IP taken from the first entry of
  `x-forwarded-for` (set by Vercel) falling back to the socket address (local dev);
  stored only as `SHA-256(ip + GUEST_IP_SALT)`. `GUEST_IP_SALT` is an optional env var
  with an in-code default — raw IPs are never persisted.

### 2. Limit check

- Users: `COUNT(*)` on `usage_logs` for `(user_id, action_type)` since
  `date_trunc('month', now())` — same window the client already displays.
- Guests: `COUNT(*)` on new `guest_usage` table for `(ip_hash, action_type)` in the last 7 days.
- Over limit → **HTTP 429** with
  `{ error, code: 'rate_limit_exceeded', scope: 'rating'|'analysis', limit, resetAt }`,
  where `resetAt` is the first of next month (users) or the timestamp of the oldest
  in-window entry plus 7 days (guests).

### 3. Usage logging (server is the single writer)

After the Anthropic call **succeeds**, the handler inserts one row:
`usage_logs (user_id, action_type)` or `guest_usage (ip_hash, action_type)`.
Failed Claude calls consume nothing. The client's `logUsage()` insert is removed;
`useSubscription` keeps *reading* counts for the header chip (RLS select-own remains).

### 4. Failure policy: fail open, loudly

Limits are cost protection, not a security boundary. If the check itself cannot run
(missing env vars, Supabase outage, query error), log a prominent server warning and
let the request through. Only a definitive over-limit produces a 429. Local dev without
service-role keys therefore works unchanged, minus enforcement.

### Concurrency note

Check-then-log is not atomic: two simultaneous requests can both pass at limit−1,
overshooting by one. At these caps that is acceptable. If it ever matters, the
hardening path is a single Postgres function (`check_and_log_usage`) doing
count+insert transactionally (Approach B, not built now).

## Database change

`supabase/migrations/007_guest_usage.sql` (applied via dashboard SQL editor, like 001–006):

```sql
CREATE TABLE IF NOT EXISTS guest_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_hash TEXT NOT NULL,
    action_type TEXT DEFAULT 'rating' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_guest_usage_ip_date ON guest_usage(ip_hash, created_at DESC);
ALTER TABLE guest_usage ENABLE ROW LEVEL SECURITY;  -- no policies: service-role access only
```

## Client changes

- `getRating` and the analyze call attach `Authorization: Bearer <token>` when a session
  exists (`supabase.auth.getSession()`); guests send nothing.
- On 429: logged-in users see the upgrade modal; guests see the existing weekly-limit
  message (reusing current UI paths, now triggered by the server response too).
- Remove the client-side `logUsage()` insert after successful rating.
- `TIER_LIMITS` → `{ free: 20, style_plus: 100, style_pro: Infinity }`;
  `UpgradeModal` plan copy updated (20/month, 100/month).

## Testing

- **Vitest (pure logic):** window math (month start / rolling 7 days / reset date),
  limit decision table across tiers and action types, IP extraction + hashing.
- **Manual/E2E:** guest hits 429 on the 6th rating in a week (verified by direct curl,
  since the client's localStorage check fires first); logged-in free user limited at 20;
  `style_pro` unlimited; Claude failure does not consume a credit; missing env vars →
  warning + request allowed.

## Environment

| Var | Where | Status |
|---|---|---|
| `SUPABASE_URL` | `.env`, Vercel | present |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env`, Vercel (Sensitive) | present |
| `GUEST_IP_SALT` | optional | in-code default |

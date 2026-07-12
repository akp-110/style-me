# Server-Side Rate Limiting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enforce usage limits on `api/rate-outfit` and `api/analyze-outfit` server-side — logged-in users by Supabase JWT + tier, guests by salted IP hash — with the server as the single writer of usage records.

**Architecture:** A pure decision module (`api/lib/limitPolicy.js`, fully unit-tested) plus an impure enforcement module (`api/middleware/enforceLimits.js`) that resolves identity and queries Supabase with the service-role key. Handlers gate before calling Claude and log usage only after Claude succeeds. Fail open (with a loud warning) on any infrastructure error; 429 only on a definitive over-limit.

**Tech Stack:** Node ESM, `@supabase/supabase-js` (already a dependency), `node:crypto`, vitest. Spec: `docs/superpowers/specs/2026-07-12-server-side-rate-limiting-design.md`.

**Limits (per action type — `rating` and `analysis` each get their own counter):**

| Identity | Cap | Window |
|---|---|---|
| guest | 5 | rolling 7 days |
| free | 20 | calendar month |
| style_plus | 100 | calendar month |
| style_pro | ∞ | — |

---

### Task 1: Rate-limit constants + pure policy module (TDD)

**Files:**
- Modify: `api/config/constants.js`
- Create: `api/lib/limitPolicy.js`
- Test: `api/lib/limitPolicy.test.js`

- [ ] **Step 1: Write the failing tests**

Create `api/lib/limitPolicy.test.js`:

```js
import { describe, it, expect } from 'vitest';
import {
    monthStart, nextMonthStart, rollingStart,
    decide, hashIp, clientIp
} from './limitPolicy.js';

describe('window math', () => {
    it('monthStart truncates to first of month UTC', () => {
        const now = new Date('2026-07-12T19:30:00Z');
        expect(monthStart(now).toISOString()).toBe('2026-07-01T00:00:00.000Z');
    });

    it('nextMonthStart rolls over a year boundary', () => {
        const now = new Date('2026-12-15T10:00:00Z');
        expect(nextMonthStart(now).toISOString()).toBe('2027-01-01T00:00:00.000Z');
    });

    it('rollingStart is exactly 7 days back', () => {
        const now = new Date('2026-07-12T19:30:00Z');
        expect(rollingStart(now, 7).toISOString()).toBe('2026-07-05T19:30:00.000Z');
    });
});

describe('decide', () => {
    it.each([
        ['guest', 4, true],
        ['guest', 5, false],
        ['free', 19, true],
        ['free', 20, false],
        ['style_plus', 99, true],
        ['style_plus', 100, false],
        ['style_pro', 100000, true],
    ])('%s with count %i → allowed=%s', (tierKey, count, allowed) => {
        expect(decide(tierKey, count).allowed).toBe(allowed);
    });

    it('unknown tier falls back to free limits', () => {
        expect(decide('mystery_tier', 19).allowed).toBe(true);
        expect(decide('mystery_tier', 20).allowed).toBe(false);
    });

    it('returns the numeric limit for the tier', () => {
        expect(decide('guest', 0).limit).toBe(5);
        expect(decide('free', 0).limit).toBe(20);
    });
});

describe('hashIp', () => {
    it('is deterministic and salt-sensitive', () => {
        expect(hashIp('1.2.3.4', 's1')).toBe(hashIp('1.2.3.4', 's1'));
        expect(hashIp('1.2.3.4', 's1')).not.toBe(hashIp('1.2.3.4', 's2'));
        expect(hashIp('1.2.3.4', 's1')).toMatch(/^[a-f0-9]{64}$/);
    });
});

describe('clientIp', () => {
    it('takes the first x-forwarded-for entry, trimmed', () => {
        const req = { headers: { 'x-forwarded-for': ' 9.8.7.6 , 10.0.0.1' }, socket: {} };
        expect(clientIp(req)).toBe('9.8.7.6');
    });

    it('falls back to the socket address', () => {
        const req = { headers: {}, socket: { remoteAddress: '::1' } };
        expect(clientIp(req)).toBe('::1');
    });

    it('never returns empty', () => {
        const req = { headers: {}, socket: {} };
        expect(clientIp(req)).toBe('0.0.0.0');
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run api/lib/limitPolicy.test.js`
Expected: FAIL — `Cannot find module './limitPolicy.js'` (or equivalent resolution error).

- [ ] **Step 3: Add `RATE_LIMITS` to `api/config/constants.js`**

Append to the end of `api/config/constants.js`:

```js
// Server-enforced usage limits, per action type ('rating' and 'analysis'
// are counted separately, each at this cap). Tune here — one-line change.
export const RATE_LIMITS = {
    guest: { limit: 5, window: 'rolling7d' },
    free: { limit: 20, window: 'month' },
    style_plus: { limit: 100, window: 'month' },
    style_pro: { limit: Infinity, window: 'month' }
};
```

- [ ] **Step 4: Implement `api/lib/limitPolicy.js`**

```js
/* eslint-env node */
import { createHash } from 'node:crypto';
import { RATE_LIMITS } from '../config/constants.js';

// Pure decision logic for rate limiting. No I/O here — everything in this
// module is unit-testable with vitest. Supabase access lives in
// api/middleware/enforceLimits.js.

export function monthStart(now = new Date()) {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export function nextMonthStart(now = new Date()) {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}

export function rollingStart(now = new Date(), days = 7) {
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

/**
 * @param {string} tierKey 'guest' | 'free' | 'style_plus' | 'style_pro'
 * @param {number} count usage already recorded in the current window
 * @returns {{ allowed: boolean, limit: number }}
 */
export function decide(tierKey, count) {
    const config = RATE_LIMITS[tierKey] || RATE_LIMITS.free;
    return { allowed: count < config.limit, limit: config.limit };
}

export function hashIp(ip, salt) {
    return createHash('sha256').update(`${ip}${salt}`).digest('hex');
}

export function clientIp(req) {
    const forwarded = req.headers?.['x-forwarded-for'];
    if (forwarded) {
        const first = String(forwarded).split(',')[0].trim();
        if (first) return first;
    }
    return req.socket?.remoteAddress || '0.0.0.0';
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run api/lib/limitPolicy.test.js`
Expected: PASS (all tests green). Also run the full suite: `npx vitest run` — the existing `parseRating` tests must still pass.

- [ ] **Step 6: Commit**

```bash
git add api/config/constants.js api/lib/limitPolicy.js api/lib/limitPolicy.test.js
git commit -m "feat: rate-limit constants and pure limit policy module"
```

---

### Task 2: Guest usage migration + env documentation

**Files:**
- Create: `supabase/migrations/007_guest_usage.sql`
- Modify: `.env.example`

- [ ] **Step 1: Create the migration file**

Create `supabase/migrations/007_guest_usage.sql`:

```sql
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
```

- [ ] **Step 2: Document the server env vars in `.env.example`**

Append to `.env.example`:

```
# Server-side only (rate limiting) — never VITE_-prefixed
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_or_secret_key
# Optional salt for guest IP hashing (has an in-code default)
# GUEST_IP_SALT=any_random_string
```

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/007_guest_usage.sql .env.example
git commit -m "feat: guest_usage migration and server env documentation"
```

- [ ] **Step 4: USER ACTION — apply the migration**

Ask the user to paste `supabase/migrations/007_guest_usage.sql` into the Supabase dashboard SQL editor and run it (same flow as migrations 001–006). Implementation can continue meanwhile; end-to-end verification (Task 6) requires it applied.

---

### Task 3: Enforcement module (`enforceLimits.js`)

**Files:**
- Create: `api/middleware/enforceLimits.js`

Impure by design (network + env) — no unit tests; behaviour is verified end-to-end in Task 6. All decisions delegate to the tested pure module.

- [ ] **Step 1: Implement the module**

```js
/* eslint-env node */
/* global process */
import { createClient } from '@supabase/supabase-js';
import {
    monthStart, nextMonthStart, rollingStart,
    decide, hashIp, clientIp
} from '../lib/limitPolicy.js';
import { RATE_LIMITS } from '../config/constants.js';

const IP_SALT = process.env.GUEST_IP_SALT || 'style-me-guest-v1';
const ROLLING_DAYS = 7;

let adminClient = null;
let warnedMissingEnv = false;

function getAdminClient() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        if (!warnedMissingEnv) {
            console.warn(
                '[rate-limit] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — ' +
                'limits are NOT enforced. Set both to enable enforcement.'
            );
            warnedMissingEnv = true;
        }
        return null;
    }
    if (!adminClient) {
        adminClient = createClient(url, key, {
            auth: { persistSession: false, autoRefreshToken: false }
        });
    }
    return adminClient;
}

// Fail-open result used whenever the check itself cannot run.
const OPEN = { allowed: true, identity: { kind: 'unknown' } };

/**
 * Resolve the caller's identity and check their usage against the limits.
 * Never throws. Returns:
 *   { allowed: true,  identity }                            — proceed
 *   { allowed: false, identity, limit, resetAt }            — respond 429
 * identity is { kind: 'user', id, tier } | { kind: 'guest', ipHash } | { kind: 'unknown' }
 */
export async function enforceLimits(req, actionType) {
    const supabase = getAdminClient();
    if (!supabase) return OPEN;

    try {
        const identity = await resolveIdentity(req, supabase);
        const now = new Date();

        if (identity.kind === 'user') {
            if (identity.tier === 'style_pro') return { allowed: true, identity };

            const { count, error } = await supabase
                .from('usage_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', identity.id)
                .eq('action_type', actionType)
                .gte('created_at', monthStart(now).toISOString());
            if (error) throw error;

            const verdict = decide(identity.tier, count ?? 0);
            if (verdict.allowed) return { allowed: true, identity };
            return {
                allowed: false, identity,
                limit: verdict.limit,
                resetAt: nextMonthStart(now).toISOString()
            };
        }

        // Guest path
        const windowStartIso = rollingStart(now, ROLLING_DAYS).toISOString();
        const { count, error } = await supabase
            .from('guest_usage')
            .select('*', { count: 'exact', head: true })
            .eq('ip_hash', identity.ipHash)
            .eq('action_type', actionType)
            .gte('created_at', windowStartIso);
        if (error) throw error;

        const verdict = decide('guest', count ?? 0);
        if (verdict.allowed) return { allowed: true, identity };

        // Over limit: resetAt = oldest in-window entry + 7 days (rare path,
        // so the extra query only happens here).
        const { data: oldest } = await supabase
            .from('guest_usage')
            .select('created_at')
            .eq('ip_hash', identity.ipHash)
            .eq('action_type', actionType)
            .gte('created_at', windowStartIso)
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle();
        const resetAt = new Date(
            (oldest ? new Date(oldest.created_at).getTime() : now.getTime())
            + ROLLING_DAYS * 86400000
        ).toISOString();

        return { allowed: false, identity, limit: verdict.limit, resetAt };
    } catch (err) {
        console.warn('[rate-limit] check failed — allowing request (fail-open):', err.message);
        return OPEN;
    }
}

async function resolveIdentity(req, supabase) {
    const authHeader = req.headers?.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (token) {
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data?.user) {
            const { data: sub } = await supabase
                .from('user_subscriptions')
                .select('tier')
                .eq('user_id', data.user.id)
                .maybeSingle();
            return { kind: 'user', id: data.user.id, tier: sub?.tier || 'free' };
        }
        // Invalid/expired token falls through to guest treatment.
    }

    return { kind: 'guest', ipHash: hashIp(clientIp(req), IP_SALT) };
}

/**
 * Record one usage row AFTER a successful Claude call. The server is the
 * single writer of usage records. Never throws.
 */
export async function recordUsage(identity, actionType) {
    const supabase = getAdminClient();
    if (!supabase || !identity || identity.kind === 'unknown') return;

    try {
        if (identity.kind === 'user') {
            const { error } = await supabase
                .from('usage_logs')
                .insert({ user_id: identity.id, action_type: actionType });
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('guest_usage')
                .insert({ ip_hash: identity.ipHash, action_type: actionType });
            if (error) throw error;
        }
    } catch (err) {
        console.warn('[rate-limit] failed to record usage:', err.message);
    }
}

/** Standard 429 body per the spec. */
export function limitResponseBody(scope, gate) {
    return {
        error: `You've reached your ${scope} limit. It resets ${new Date(gate.resetAt).toLocaleDateString('en-GB')}.`,
        code: 'rate_limit_exceeded',
        scope,
        limit: gate.limit,
        resetAt: gate.resetAt
    };
}

export { RATE_LIMITS };
```

- [ ] **Step 2: Sanity-check imports resolve**

Run: `node -e "import('./api/middleware/enforceLimits.js').then(m => console.log(Object.keys(m)))"`
Expected: `[ 'RATE_LIMITS', 'enforceLimits', 'limitResponseBody', 'recordUsage' ]` (order may vary).

- [ ] **Step 3: Commit**

```bash
git add api/middleware/enforceLimits.js
git commit -m "feat: identity resolution and limit enforcement module"
```

---

### Task 4: Wire enforcement into both handlers

**Files:**
- Modify: `api/rate-outfit.js`
- Modify: `api/analyze-outfit.js`

- [ ] **Step 1: Gate `api/rate-outfit.js`**

Add to the imports at the top:

```js
import { enforceLimits, recordUsage, limitResponseBody } from './middleware/enforceLimits.js';
```

Inside `handler`, immediately after the `if (!image || !prompt)` check, add:

```js
    // Server-side rate limit (identity: Supabase JWT or hashed guest IP)
    const gate = await enforceLimits(req, 'rating');
    if (!gate.allowed) {
      return res.status(429).json(limitResponseBody('rating', gate));
    }
```

Then find the success path — after the Anthropic `fetch`, the handler checks `response.ok` and returns the data. Immediately **before** the successful `res.status(200).json(...)` (and only on the success path), add:

```js
    await recordUsage(gate.identity, 'rating');
```

- [ ] **Step 2: Gate `api/analyze-outfit.js`**

Same pattern with scope `'analysis'`: add the same import, add after the request-body validation:

```js
    const gate = await enforceLimits(req, 'analysis');
    if (!gate.allowed) {
      return res.status(429).json(limitResponseBody('analysis', gate));
    }
```

and before the successful JSON response:

```js
    await recordUsage(gate.identity, 'analysis');
```

- [ ] **Step 3: Verify fail-open when enforcement env is missing**

Start a throwaway server instance with the vars blanked, and confirm the handler still runs (400 for missing body fields, not a crash or 429), then kill it:

```bash
SUPABASE_URL= SUPABASE_SERVICE_ROLE_KEY= PORT=3199 node server.js &
sleep 2
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3199/api/rate-outfit \
  -H 'content-type: application/json' -d '{}'
kill %1
```

Expected: `400`, and the server log shows the `[rate-limit] ... limits are NOT enforced` warning. (If `server.js` ignores `PORT`, stop the normal dev server first and use 3001.)

- [ ] **Step 4: Commit**

```bash
git add api/rate-outfit.js api/analyze-outfit.js
git commit -m "feat: enforce rate limits on rating and analysis endpoints"
```

---

### Task 5: Client — auth header, 429 handling, single-writer, new limits

**Files:**
- Create: `src/lib/authHeaders.js`
- Modify: `src/App.jsx` (getRating: header, 429 branch, remove client insert)
- Modify: `src/hooks/useOutfitAnalysis.js` (header + 429 message)
- Modify: `src/hooks/useSubscription.js` (TIER_LIMITS, logUsage → bumpUsageCount)
- Modify: `src/components/UpgradeModal.jsx` (copy)

- [ ] **Step 1: Create `src/lib/authHeaders.js`**

```js
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
```

- [ ] **Step 2: Update `getRating` in `src/App.jsx`**

Add the import at the top of the file:

```js
import { getAuthHeaders } from './lib/authHeaders';
```

In the `fetch('/api/rate-outfit', ...)` call (currently ~line 367), spread the auth headers:

```js
        const response = await fetch('/api/rate-outfit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(await getAuthHeaders())
          },
          body: JSON.stringify({
            image: base64Image,
            mediaType: mediaType,
            mode: mode,
            prompt: fullPrompt
          })
        });
```

Immediately after `const data = await response.json();` add the 429 branch (before the generic error throw):

```js
        if (response.status === 429) {
          clearInterval(messageInterval);
          setLoading(false);
          if (user) {
            setShowUpgradeModal(true);
          } else {
            alert(data.error || "You've used your free ratings this week. Sign up for more!");
          }
          return;
        }
```

Replace the usage-logging block (currently ~lines 410–415):

```js
        // Log usage after successful rating
        if (user) {
          await subscriptionHook.logUsage('rating');
        } else {
          guestUsage.logGuestRating();
        }
```

with:

```js
        // The server records usage (single writer); bump the local count
        // for the header chip, and keep the guest localStorage marker as
        // the friendly first-line check.
        if (user) {
          subscriptionHook.bumpUsageCount();
        } else {
          guestUsage.logGuestRating();
        }
```

- [ ] **Step 3: Update `src/hooks/useSubscription.js`**

Change `TIER_LIMITS` (keep `GUEST_LIMIT = 5` as is):

```js
const TIER_LIMITS = {
    free: 20,
    style_plus: 100,
    style_pro: Infinity
};
```

Change the fallback on the `usageLimit` line from `|| 3` to `?? TIER_LIMITS.free`:

```js
    const usageLimit = TIER_LIMITS[tier] ?? TIER_LIMITS.free;
```

Replace the whole `logUsage` function:

```js
    // Log a usage action
    const logUsage = async (actionType = 'rating') => {
        if (!user) return false;

        try {
            const { error } = await supabase
                .from('usage_logs')
                .insert({ user_id: user.id, action_type: actionType });

            if (error) throw error;

            setUsageCount(prev => prev + 1);
            return true;
        } catch (err) {
            console.error('Error logging usage:', err);
            return false;
        }
    };
```

with:

```js
    // Usage rows are written by the API (single writer). This just keeps
    // the header chip in sync without a refetch.
    const bumpUsageCount = () => setUsageCount(prev => prev + 1);
```

and in the hook's returned object, replace `logUsage,` with `bumpUsageCount,`.

- [ ] **Step 4: Update `src/hooks/useOutfitAnalysis.js`**

Add the import:

```js
import { getAuthHeaders } from '../lib/authHeaders';
```

Update the fetch and add a 429-specific message:

```js
            const response = await fetch('/api/analyze-outfit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(await getAuthHeaders())
                },
                body: JSON.stringify({
                    image: imageBase64,
                    mediaType,
                    userPreferences
                })
            });

            const data = await response.json();

            if (response.status === 429) {
                throw new Error(data.error || 'Analysis limit reached — try again later.');
            }

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Analysis failed');
            }
```

- [ ] **Step 4b: Fix the stale guest pre-check copy in `src/App.jsx`**

The guest limit is 5/week now, but the pre-check alert (~line 334) still says "your free rating" (singular). Change:

```js
        alert(`You've used your free rating this week. Sign up for more ratings! (${guestCheck.daysLeft} days until reset)`);
```

to:

```js
        alert(`You've used your 5 free ratings this week. Sign up for more! (${guestCheck.daysLeft} days until reset)`);
```

- [ ] **Step 5: Update `src/components/UpgradeModal.jsx` copy**

In the `PLANS` array: change the free plan's `ratings: '5/month'` → `ratings: '20/month'` and the Style+ plan's `ratings: '50/month'` → `ratings: '100/month'`.

- [ ] **Step 6: Run checks**

Run: `npx vitest run && npm run build && npm run lint`
Expected: 8+ tests pass (parseRating + limitPolicy), build succeeds, no NEW lint errors (6 pre-existing errors in `api/search-products.js`, `AuthContext.jsx`, `useOutfits.js` are known).

- [ ] **Step 7: Commit**

```bash
git add src/lib/authHeaders.js src/App.jsx src/hooks/useSubscription.js src/hooks/useOutfitAnalysis.js src/components/UpgradeModal.jsx
git commit -m "feat: send auth to API, handle 429s, raise free limits to 20/100"
```

---

### Task 6: End-to-end verification

**Files:** none (verification only). Requires migration 007 applied (Task 2 Step 4) and `npm run dev:all` restarted so the server picks up the new code.

- [ ] **Step 1: Restart dev servers**

Kill any running `node server.js` / vite, then `npm run dev:all`.

- [ ] **Step 2: Guest 429 without spending Claude credit**

Seed 5 guest rows for the local IP hashes, then make one real request — it must be blocked *before* reaching Anthropic. Run with `node --env-file=.env`:

```js
// scratch script — run: node --env-file=.env /tmp/seed-guest.mjs
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

const salt = process.env.GUEST_IP_SALT || 'style-me-guest-v1';
const hash = (ip) => createHash('sha256').update(`${ip}${salt}`).digest('hex');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const rows = [];
for (const ip of ['::1', '127.0.0.1', '::ffff:127.0.0.1']) {
    for (let i = 0; i < 5; i++) rows.push({ ip_hash: hash(ip), action_type: 'rating' });
}
const { error } = await supabase.from('guest_usage').insert(rows);
console.log(error ?? 'seeded');
```

Then:

```bash
curl -s -X POST http://localhost:3001/api/rate-outfit \
  -H 'content-type: application/json' \
  -d '{"image":"aGk=","prompt":"test","mode":"balanced"}' | head -c 300
```

Expected: JSON with `"code":"rate_limit_exceeded"`, `"scope":"rating"`, a `resetAt` ~7 days out. Verify status: re-run with `-o /dev/null -w "%{http_code}"` → `429`.

- [ ] **Step 3: Clean up seed rows**

```js
// node --env-file=.env /tmp/clean-guest.mjs
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { error, count } = await supabase.from('guest_usage').delete({ count: 'exact' }).neq('id', '00000000-0000-0000-0000-000000000000');
console.log(error ?? `deleted ${count}`);
```

- [ ] **Step 4: Guest success path writes `guest_usage`**

In the browser (logged out), rate one outfit end-to-end. Then check the table has exactly one new `rating` row:

```js
// node --env-file=.env /tmp/check-guest.mjs
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data } = await supabase.from('guest_usage').select('action_type, created_at').order('created_at', { ascending: false }).limit(3);
console.log(data);
```

- [ ] **Step 5: Logged-in flow**

In the browser: log in, rate an outfit, confirm (a) the rating succeeds, (b) the header chip decrements from `20/20` → `19/20` shape, (c) `usage_logs` gains a row with your user_id (same query pattern as Step 4 against `usage_logs`).

- [ ] **Step 6: USER ACTION — owner upgrade**

User runs in the Supabase SQL editor:

```sql
UPDATE user_subscriptions SET tier = 'style_pro'
WHERE user_id = (SELECT id FROM auth.users WHERE email = '<owner email>');
```

Then refresh the app: the chip should show the Pro/∞ state, and ratings never 429.

- [ ] **Step 7: Full suite + push**

```bash
npx vitest run && npm run build
git push
```

Expected: all tests pass, build clean, pushed to origin.

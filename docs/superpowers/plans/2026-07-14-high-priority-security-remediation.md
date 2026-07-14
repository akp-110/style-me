# High-Priority Security Remediation — Implementation Plan

> **Execution note:** Implement this plan under a new Builder work order. Database
> migrations, storage-policy changes, production configuration, and deployment
> require explicit human approval before execution.

**Goal:** Eliminate the three high-priority audit risks without relying on the
React UI as a security boundary:

1. Make usage enforcement atomic, server-side, and fail-closed.
2. Stop exposing a caller-controlled paid AI proxy.
3. Keep saved outfit photos private and prevent orphaned uploads.

**Primary archetype:** Maintainer. Implementation role: Builder. Review passes:
Sweeper, then Maintainer.

**Target architecture:** API handlers resolve a verified identity, reserve quota
through one transactional Supabase RPC, validate a small structured request, and
construct the provider prompt server-side. Saved photos are stored by object path
in a private bucket and displayed with short-lived signed URLs. Client-side usage
counters remain UX hints only.

## Security invariants

- No Anthropic request occurs unless a server-side quota reservation succeeds.
- A missing rate-limit dependency or failed quota query returns `503`; it never
  becomes an allowed request.
- The quota decision and usage insert happen in one database transaction, under a
  lock for the identity/action pair.
- Existing subscription tiers are preserved. In particular, the owner's current
  `style_pro` test account remains unlimited and is never downgraded, recreated, or
  overwritten by these migrations.
- The browser cannot submit an arbitrary provider prompt or token budget.
- All accepted strings, arrays, images, modes, and media types have server-side caps.
- CORS reduces browser exposure but is never treated as authentication.
- Saved outfit records store a bucket object path, not a public or signed URL.
- A failed database insert triggers best-effort deletion of the just-uploaded object.
- Existing user images remain readable throughout the compatibility deployment,
  then become private only after signed-URL support and backfill are verified.

## Explicit non-goals

- Stripe checkout or subscription lifecycle work.
- Fixing medium-priority dependency advisories, weather/product proxy limits, or
  avatar storage; track these in follow-up work orders.
- Reading local secrets or exercising production data from automated tests.
- Treating IP limits as perfect identity. Provider spending caps and alerts remain
  a required second line of defence against IP rotation and account farming.

## Delivery shape

Use three independently reviewable pull requests:

1. **PR A — Atomic cost controls:** migration 009, enforcement refactor, tests.
2. **PR B — Constrained AI contract:** server prompt builder, validation, CORS,
   client payload change, tests.
3. **PR C — Private saved photos:** compatibility migration, application cutover,
   backfill, private-policy cutover, privacy copy, tests.

Do not combine the database permission cutovers with unrelated dependency or UI work.

---

## PR A — Atomic, fail-closed server limits

### Task A1: Establish executable security contracts

**Files:**

- Create: `api/middleware/enforceLimits.test.js`
- Create: `api/rate-outfit.test.js`
- Modify only if needed for test seams: `api/middleware/enforceLimits.js`

- [ ] Add a mocked-RPC test proving a successful reservation is required before
  the provider function can run.
- [ ] Add tests for `429 rate_limit_exceeded`, `401 invalid_token`, and
  `503 rate_limit_unavailable`.
- [ ] Add a regression test proving missing Supabase server configuration does not
  call Anthropic.
- [ ] Add a regression test proving a provider network failure releases the reserved
  row, while a provider success keeps it consumed.
- [ ] Preserve existing pure limit-policy tests until the database RPC supersedes
  their decision responsibility; remove obsolete helpers only in Task A4.

**Focused command:**

```bash
npx vitest run api/middleware/enforceLimits.test.js api/rate-outfit.test.js
```

Expected initially: new fail-closed and reservation-order assertions fail.

### Task A2: Add an atomic quota reservation RPC

**Files:**

- Create: `supabase/migrations/009_atomic_usage_reservations.sql`
- Create: `scripts/verify-atomic-usage.mjs`
- Modify: `.env.example` (test variable names only; never values)

The migration must create two service-role-only functions:

```text
reserve_usage(user_id?, ip_hash?, action_type)
  -> allowed, reservation_id, limit, reset_at, tier

release_usage(reservation_id, identity_kind)
  -> released
```

It must also create and seed a service-role-only `usage_limit_rules` table keyed
by tier/action. The database values are authoritative for enforcement; any client
or JavaScript constants are display copy and must never decide access.

`reserve_usage` requirements:

- [ ] Require exactly one verified identity: `user_id` or `ip_hash`.
- [ ] Accept only the known action values `rating` and `analysis`.
- [ ] For users, read the tier inside the function from
  `public.user_subscriptions`; never accept a caller-supplied tier.
- [ ] Read the cap and window from `public.usage_limit_rules`, seeded to the
  approved product policy: guest/free 20, Style+ 100, Style Pro unlimited, all
  using the current UTC calendar-month window.
- [ ] Enable RLS on `usage_limit_rules` with no client policies; grant server
  access only to `service_role`.
- [ ] Acquire `pg_advisory_xact_lock` from a stable hash of identity plus action,
  then count and insert within the same transaction.
- [ ] Insert the usage row before returning `allowed=true`. The inserted row is the
  reservation; success requires no later insert.
- [ ] Return `allowed=false` without inserting when the cap is reached.
- [ ] Treat an existing `style_pro` row as unlimited while still recording usage for
  observability; do not update subscription rows or tier values.
- [ ] Set `SECURITY DEFINER`, `SET search_path = ''`, and fully qualify all objects.
- [ ] Revoke execution from `PUBLIC`, `anon`, and `authenticated`; grant only
  `service_role`.
- [ ] Drop the legacy client INSERT policy on `usage_logs`, leaving authenticated
  users with SELECT-own access only.
- [ ] Make `release_usage` service-role-only and able to delete only the exact row
  created for a failed provider attempt.
- [ ] Keep historical rows compatible; no destructive table rewrite is required.

Reservation semantics deliberately favour cost safety: a known provider failure is
released, but a process crash or ambiguous timeout may consume one allowance. That is
preferable to paying for an uncounted request and must be documented in user-facing
support guidance.

`scripts/verify-atomic-usage.mjs` must use a dedicated test Supabase project and:

- [ ] Set an identity to one remaining use.
- [ ] launch at least 25 concurrent reservation calls for that same identity/action;
- [ ] assert exactly one succeeds and 24 return denied;
- [ ] release the successful reservation and assert one subsequent call succeeds;
- [ ] clean up only test-owned rows.

It must refuse to run unless `TEST_SUPABASE_URL`,
`TEST_SUPABASE_SERVICE_ROLE_KEY`, and an explicit `ALLOW_TEST_DB_MUTATION=1` are set.

**Human gate A:** Review the SQL privileges and approve applying migration 009 to a
non-production Supabase project. Do not use production for the concurrency test.

### Task A3: Refactor enforcement around reservation results

**Files:**

- Modify: `api/middleware/enforceLimits.js`
- Modify: `api/rate-outfit.js`
- Modify: `api/analyze-outfit.js`
- Modify: `api/config/constants.js`

- [ ] Replace count-then-later-insert with `reserveUsage(req, actionType)` calling
  `reserve_usage` once.
- [ ] Treat an absent Authorization header as a guest; treat a present but invalid or
  expired Bearer token as `401`, not as a new guest quota.
- [ ] Require `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and a high-entropy
  `GUEST_IP_SALT`. Remove the public in-code salt fallback.
- [ ] Use an HMAC keyed by `GUEST_IP_SALT` for guest identity rather than a public
  concatenated salt.
- [ ] Map results consistently:
  - denied reservation -> `429 rate_limit_exceeded`;
  - identity/token error -> `401 invalid_token`;
  - configuration/RPC/storage error -> `503 rate_limit_unavailable`;
  - allowed reservation -> proceed with provider call.
- [ ] On a definite provider failure before a billable response, call
  `release_usage`. If release fails, log a high-severity structured event but do not
  retry the provider request automatically.
- [ ] Once the provider accepted/completed the request, keep the reservation even if
  response parsing or delivery later fails, because provider cost was incurred.
- [ ] Remove `recordUsage` and the fail-open `OPEN` result.
- [ ] Never put tokens, IPs, image data, prompts, or service-role errors into logs.

### Task A4: Verify PR A

- [ ] Run focused tests.
- [ ] Run the test-project concurrency verifier after Human gate A.
- [ ] Run lint, full tests, build, production dependency audit, and secret scan.
- [ ] Confirm direct parallel POST requests cannot exceed the last remaining slot.
- [ ] Confirm an unavailable quota store produces `503` and zero provider calls.
- [ ] Confirm the UI continues displaying server-backed counts; localStorage does not
  decide server access.
- [ ] Confirm changing a client-side limit constant cannot change the server verdict.
- [ ] Add a regression test proving an existing `style_pro` user remains unlimited
  across repeated and parallel requests, without mutating their subscription row.

**Rollback:** Roll back API code before rolling back SQL. Keep the service-role-only
functions in place if necessary; they are inert when unused. Restoring fail-open
behaviour is prohibited. If the RPC is unhealthy, disable paid endpoints with `503`
until corrected.

---

## PR B — Server-owned AI request contract

### Task B1: Add request validation and a server prompt builder

**Files:**

- Create: `api/lib/requestValidation.js`
- Create: `api/lib/requestValidation.test.js`
- Create: `api/lib/ratingPrompt.js`
- Create: `api/lib/ratingPrompt.test.js`
- Modify: `api/rate-outfit.js`
- Modify: `api/analyze-outfit.js`
- Move/remove rating persona prompt ownership from: `src/App.jsx`

Replace the rating request contract:

```text
Before: { image, mediaType, mode, prompt }
After:  { image, mediaType, mode, context }
```

`context` may contain only the small fields the product uses: normalized weather,
bounded style preferences, bounded favourite colours/brands, and at most three
upcoming event summaries. The server must render them as delimited untrusted data.

- [ ] Reject the legacy `prompt` field and unknown top-level fields.
- [ ] Allow only known mode and media-type enums.
- [ ] Calculate decoded base64 size and reject images above the agreed provider/body
  limit before quota reservation or provider invocation.
- [ ] Cap every string, array length, array item, and total serialized context size.
- [ ] Reject malformed numbers, objects, data-URL prefixes, and invalid base64.
- [ ] Keep provider model and `max_tokens` entirely server-owned.
- [ ] Apply equivalent caps to `analyze-outfit` user preferences so arrays cannot be
  used as an unbounded prompt channel.
- [ ] Add an `AbortController` timeout to provider calls and generic client errors.
- [ ] Do not return upstream raw bodies or error details.

Required tests:

- [ ] arbitrary caller prompt is rejected and never reaches `fetch`;
- [ ] oversized image/context is rejected before quota is consumed;
- [ ] every allowed mode produces the expected server-owned persona/template;
- [ ] injected instructions inside profile/calendar fields remain inside explicit
  data delimiters and cannot replace the system task;
- [ ] unknown mode/media type and malformed base64 return `400`;
- [ ] provider timeout follows the reservation release rules from PR A.

### Task B2: Restrict CORS correctly

**Files:**

- Modify: `api/middleware/cors.js`
- Create: `api/middleware/cors.test.js`
- Modify: `.env.example`
- Modify: `README.md`

- [ ] Replace wildcard CORS with exact origins from required `APP_ORIGINS` config.
- [ ] Add `Vary: Origin`.
- [ ] Remove `Access-Control-Allow-Credentials`; authentication uses a Bearer token,
  not cross-origin cookies.
- [ ] Allow `Content-Type` and `Authorization` headers only.
- [ ] Return `403 origin_not_allowed` for an explicitly untrusted browser Origin.
- [ ] Support configured localhost origins in development, never through a production
  wildcard.
- [ ] Allow requests without an Origin only as an API compatibility decision; document
  that scripts can spoof/omit Origin and quota/auth remain the true controls.
- [ ] Test allowed, denied, preflight, absent-Origin, and multi-origin configurations.

### Task B3: Change the client payload

**Files:**

- Modify: `src/App.jsx`
- Modify: `src/hooks/useOutfitAnalysis.js`
- Modify/add focused client tests for request serialization

- [ ] Send `mode` plus the bounded context fields, not a built prompt.
- [ ] Keep client validation only for quick feedback; server rejection remains final.
- [ ] Handle `400`, `401`, `429`, and `503` distinctly.
- [ ] On `503`, show a temporary-service message rather than an upgrade prompt.
- [ ] Preserve the current rating parsing/output UI.

### Task B4: Operational cost guardrails

- [ ] Configure provider-side monthly spending limits and alerts outside the repo.
- [ ] Add structured counters for reservation allowed/denied/unavailable, provider
  attempts/success/failure, and estimated input/output units without logging content.
- [ ] Alert on sustained `503`, denial spikes, rapid per-IP churn, or unexpected daily
  provider growth.
- [ ] Document an emergency kill switch that makes Claude-backed endpoints return
  `503` without changing client code.

**Human gate B:** Approve production `APP_ORIGINS`, required secret presence, spending
limits, and alert destinations. This plan does not authorize creating or changing them.

**Rollback:** The new server may temporarily accept both payload versions only behind a
short-lived deployment flag, defaulting to the secure new contract. Remove the legacy
path immediately after the client deployment is confirmed; never re-enable arbitrary
prompt forwarding.

---

## PR C — Private, recoverable saved outfit storage

### Task C1: Add a compatibility schema for object paths

**Files:**

- Create: `supabase/migrations/010_saved_outfit_image_paths.sql`
- Add migration verification SQL or tests under: `supabase/tests/`

- [ ] Add nullable `image_path TEXT` to `saved_outfits` without dropping legacy URL
  columns.
- [ ] Detect whether deployed schema contains `photo_url`, `image_url`, or both; abort
  with a clear message if it matches neither. Do not guess in production.
- [ ] Add a constraint for future paths: owner UUID directory plus a generated filename;
  do not accept full URLs in `image_path`.
- [ ] Preserve RLS SELECT/INSERT/DELETE ownership policies.
- [ ] Do not make the bucket private in this migration; old clients still require URLs.

**Human gate C1:** Compare the migration's assumptions with a read-only production
schema export and approve applying migration 010. No data backfill or permission change
occurs yet.

### Task C2: Make storage writes compensating and path-based

**Files:**

- Modify: `src/hooks/useOutfits.js`
- Modify: `src/pages/UserProfilePage.jsx`
- Create: `src/hooks/useOutfits.test.js`

- [ ] Upload the JPEG to `outfit-images/<user-id>/<random-id>.jpg`; prefer a random UUID
  over timestamps alone.
- [ ] Store only `image_path` in the database.
- [ ] If the database insert fails after upload, immediately attempt object deletion and
  report both the original and cleanup failures without exposing internal details.
- [ ] Fetch signed URLs in batches from stored paths and keep them only in memory.
- [ ] Use a short expiry appropriate for the profile session; refresh expired URLs.
- [ ] Never persist a signed URL back to the database.
- [ ] Delete the database record first, then the private object. A storage-delete failure
  may leave a private orphan but must emit a retryable cleanup event.
- [ ] Test upload failure, insert failure plus cleanup, signed-URL failure, successful
  save/load/delete, and legacy-row fallback.

### Task C3: Backfill and validate existing records

**Files:**

- Create: `scripts/backfill-outfit-image-paths.mjs`
- Create: `scripts/audit-outfit-storage.mjs`

Both scripts must require a non-production dry run by default and explicit mutation
approval. They must never print signed URLs or image contents.

- [ ] Parse only recognized Supabase Storage URL shapes from the existing legacy URL
  column into `image_path`.
- [ ] Report counts: convertible, already migrated, missing object, malformed URL, and
  unreferenced object.
- [ ] Refuse ambiguous paths or paths not owned by the row's `user_id`.
- [ ] Backfill in bounded, idempotent batches with a checkpoint.
- [ ] Audit objects versus database paths after backfill; do not delete orphans as part
  of this plan without a separate human-approved deletion work order.
- [ ] Confirm every live row has a valid `image_path` before private cutover.

### Task C4: Make the bucket private

**Files:**

- Create: `supabase/migrations/011_private_outfit_images.sql`
- Update: storage policy tests under `supabase/tests/`

- [ ] Abort migration 011 if any saved outfit lacks `image_path`.
- [ ] Set bucket `outfit-images` to private.
- [ ] Drop the public SELECT policy.
- [ ] Add SELECT policy requiring the first path segment to equal `auth.uid()`.
- [ ] Keep owner-only INSERT and DELETE policies, and validate both `bucket_id` and path.
- [ ] Explicitly constrain accepted object MIME type and size through bucket settings or
  the closest supported Supabase mechanism.
- [ ] Verify anonymous direct URLs fail, owner signed URLs work, and another authenticated
  user cannot list/read/sign/delete the object.
- [ ] Keep the legacy URL column for one release as rollback metadata; remove it only in
  a later cleanup migration.

**Human gate C2:** Approve the production backfill, inspect its dry-run counts, approve
the storage permission change, and choose the cutover window. This is an authorization
change and must not be automated without approval.

### Task C5: Correct privacy disclosures

**Files:**

- Modify: `src/components/PhotoUpload.jsx`
- Modify: `README.md`

- [ ] Explain that rating photos are sent to Anthropic for analysis.
- [ ] Explain separately that choosing Save stores the photo privately in Supabase until
  the user deletes it, subject to the actual retention policy.
- [ ] Link to the application's privacy policy rather than only the provider terms.
- [ ] Confirm calendar/profile context disclosure matches the data actually sent.

**Rollback:** If signed URLs fail before migration 011, roll back the client while the
bucket is still public. After migration 011, prefer fixing or rolling back the client;
temporarily restoring public access is a privacy-impacting permission change and needs a
new explicit human approval.

---

## Final verification sequence

Run gates in repository order for each PR:

```bash
npm run format --if-present
npm run lint
npm run typecheck --if-present
npx vitest run <focused test files>
npm test
npm run build
npm audit --omit=dev
```

Then run, in a dedicated test environment only:

- [ ] atomic 25-way concurrency test with one slot remaining;
- [ ] direct API tests that bypass the browser UI;
- [ ] invalid/missing JWT and absent rate-store tests;
- [ ] arbitrary prompt, oversized input, and origin rejection tests;
- [ ] owner/non-owner/anonymous storage policy matrix;
- [ ] save failure cleanup and private orphan audit;
- [ ] rollback rehearsal for each migration and client release.

Run a credential-shaped-value scan over tracked files and Git history. Dedicated SAST
and secret scanners should be added if available; absence must be reported as a skipped
gate, not silently treated as passing.

## Rollout order

1. Fix or baseline the existing lint failures in a small behaviour-preserving commit.
2. Apply migration 009 to test Supabase; run concurrency verification.
   Verify a test `style_pro` row remains unchanged and unlimited.
3. Deploy PR A to staging, then production after Human gate A and observability checks.
4. Configure approved origins, spending limits, alerts, and kill switch.
5. Deploy PR B server support, then client payload; remove any temporary legacy contract.
6. Apply migration 010, deploy path-based signed-URL client, and verify new saves.
7. Dry-run and execute the approved backfill; audit completeness without deletion.
8. Apply migration 011 during the approved window; execute the storage access matrix.
9. Monitor provider spend, quota denials/unavailability, save failures, signed-URL errors,
   and orphan counts for at least one normal traffic cycle.
10. Schedule legacy URL-column removal and medium-priority audit findings separately.

## Definition of done

- [ ] Fifty parallel direct requests with one remaining allowance produce exactly one
  provider attempt.
- [ ] The owner's pre-existing `style_pro` subscription remains unchanged and receives
  unlimited ratings; verification uses runtime configuration or a human-supplied test
  identity, never a committed email address or user ID.
- [ ] Any quota-store/configuration failure produces `503` and zero provider attempts.
- [ ] Direct callers cannot select arbitrary prompts, models, or token budgets.
- [ ] All API input and origins are server-validated with deterministic tests.
- [ ] Anonymous and non-owner users cannot read or list saved outfit photos.
- [ ] Failed saves do not leave newly uploaded public objects.
- [ ] Existing saved photos remain accessible to their owners after private cutover.
- [ ] Privacy copy matches actual provider transmission and storage behaviour.
- [ ] Format/lint/typecheck/tests/build/security scans have evidence; skipped gates and
  residual risks are explicitly recorded.
- [ ] Sweeper and Maintainer reviews report no unresolved high-severity finding.

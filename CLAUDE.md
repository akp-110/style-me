# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Agentic delivery framework

Read and follow `AGENTS.md` for the model-agnostic orchestration framework,
delivery modes, routing rules, task contracts, safety boundaries, quality gates,
and technical-debt policy. This file adds Claude-specific repository context;
`AGENTS.md` is the portable operating model shared with other coding agents.

## Project

"Style/Me" — an AI outfit-rating web app. Users upload a photo, pick one of four AI advisor personas, and get a Claude-generated rating enriched with weather, style-profile, and calendar context. Supabase handles auth, profiles, saved outfits, and subscription tiers.

## Commands

```bash
npm run dev:all   # Start BOTH servers (required for full local dev)
npm run dev       # Vite frontend only (port 5173)
npm start         # Express API server only (port 3001)
npm run build     # Production build to dist/
npm run lint      # ESLint
npm run preview   # Preview production build
```

Tests: `npm test` runs vitest (pure-function tests only, e.g. `src/utils/parseRating.test.js`). UI verification is manual browser checks.

Local dev requires **two processes**: Vite serves the frontend and proxies `/api/*` to the Express server on port 3001 (see `vite.config.js`). API calls fail silently-ish (fetch errors) if `npm start` isn't running.

Environment variables go in `.env` (see `.env.example`). Server-side: `ANTHROPIC_API_KEY` (required), `OPENWEATHER_API_KEY` (required), `RAPIDAPI_KEY` (optional — product search falls back to mock data). Client-side (must be `VITE_`-prefixed): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## Architecture

### Dual-runtime API handlers

Handlers in `api/` are written as Vercel-style serverless functions (`export default async function handler(req, res)`). `server.js` is a thin Express wrapper that mounts them for local development; in production they deploy directly as Vercel serverless functions. When adding an endpoint, write it serverless-style in `api/`, then register the route in `server.js`. Each handler calls `setCorsHeaders()` from `api/middleware/cors.js` and handles its own OPTIONS/method checks.

- `api/rate-outfit.js` — main rating: sends base64 image + persona prompt to the Anthropic Messages API (raw `fetch`, no SDK; model `claude-haiku-4-5`). Per-mode `max_tokens` limits live in `api/config/constants.js`.
- `api/analyze-outfit.js` — structured JSON analysis (colors, style tags, gaps).
- `api/weather.js` / `api/weather-suggestions.js` — OpenWeatherMap proxy and city autocomplete.
- `api/search-products.js` — RapidAPI product search with mock-data fallback.

### Frontend state flow

`src/main.jsx` wires `BrowserRouter` → `AuthProvider` → `App`. `App.jsx` is the orchestrator: it owns photo/rating/mode state, instantiates all the hooks, and passes everything to `HomePage` as props (routes: `/`, `/login`, `/profile`).

The four advisor personas (`professional`, `balanced`, `hype`, `roast`) are large hardcoded system prompts in `App.jsx` (`getModePrompt`). `buildPromptWithWeather()` appends weather, style-profile, and calendar context, plus a **markdown output template**. The response is parsed by regex (e.g. extracting `**Social Media Summary:**` for the share card in `getRating`), so the prompt's output structure and the parsing code are coupled — change one, change the other.

Images are client-side optimized (resized to 1024px, JPEG'd) in `src/utils/imageOptimization.js` before upload.

### Supabase & subscriptions

- `src/lib/supabaseClient.js` — single shared client; `src/context/AuthContext.jsx` provides `useAuth()` (email/password auth).
- Hooks in `src/hooks/` own all Supabase reads/writes: `useProfile` (user_profiles), `useOutfits` (saved_outfits), `useSubscription` (user_subscriptions + usage_logs).
- SQL migrations live in `supabase/migrations/` (numbered files, applied manually to the Supabase project — no CLI config in repo). All tables use RLS keyed on `auth.uid()`.
- Tiers are `free` / `style_plus` / `style_pro`. Monthly rating limits (`TIER_LIMITS`) and per-feature gating (`FEATURE_ACCESS`) are defined in `src/hooks/useSubscription.js` and enforced **client-side only** — the API endpoints do not check limits. Guests get 1 rating/week tracked in localStorage (`useGuestUsage`). Stripe checkout is not yet wired up (`UpgradeModal` has a TODO).

## Gotchas

- The npm package is named `outfit-rater-web` and the GitHub repo is `akp-110/outfit-rater`, but the product/UI name is "Style/Me".
- The README's architecture section is outdated (mentions `useStyleProfile`/`useCalendar` hooks and localStorage profiles that were replaced by Supabase-backed `useProfile`).
- Style profile data uses British spelling in code and DB: `favouriteColors`, `favouriteBrands`.

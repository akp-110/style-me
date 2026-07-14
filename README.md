# Style / Me 👔✨

AI-powered fashion advisor. Upload a photo of your outfit, choose an AI advisor persona, and get a detailed rating enriched with real-time weather, your saved style profile, and upcoming calendar events.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![React](https://img.shields.io/badge/React-19.2.0-61dafb)
![Claude](https://img.shields.io/badge/Claude-Haiku%203.5-orange)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ecf8e)

---

## 🌟 Features

### 🤖 AI Fashion Advisors
Choose from 4 distinct AI personalities, each a hand-crafted system prompt with a unique analytical lens:

- **Alexandra Ashford** — Museum curator analyzing fashion through cultural theory and semiotics
- **Margot Leclerc** — Parisian consultant offering refined, elegant advice
- **Kai Chen** — Fashion journalist celebrating bold self-expression
- **Marcus Stone** — Witty critic with sharp, entertaining observations

### 🔐 Accounts & Persistence (Supabase)
- Email/password authentication
- Persistent style profile (preferences, favourite colours, favourite brands, country)
- Save and revisit rated outfits

### 💳 Subscription Tiers
- **Free**, **Style+**, and **Style Pro** tiers with monthly rating limits and per-feature gating
- Guests get one free rating per week (no account required)
- Stripe integration scaffolded (checkout not yet wired up)

### 🌤️ Weather Integration
- Real-time weather from OpenWeatherMap with city autocomplete
- Weather-aware recommendations; toggle weather context on/off

### 📅 Calendar Integration
- Import `.ics` files (Google Calendar, Outlook, Apple Calendar)
- Event-aware outfit suggestions for upcoming occasions

### 🛍️ Product Recommendations
- Fashion product search via RapidAPI (falls back to mock data when no key is set)

### 🎨 Modern UI/UX
- Glassmorphism design with animated gradients
- Fully responsive; shareable outfit "polaroid" cards (html2canvas)

---

## 🏗️ Architecture

### Dual-runtime API handlers

Handlers in `api/` are written as Vercel-style serverless functions (`export default function handler(req, res)`). Locally, `server.js` is a thin Express wrapper that mounts each one; in production they deploy directly as Vercel serverless functions. Each handler sets CORS via `api/middleware/cors.js` and validates its own method. **When adding an endpoint, write the handler in `api/` and register its route in `server.js`.**

```
api/
├── rate-outfit.js          # Core rating — image + persona prompt → Anthropic Messages API
├── analyze-outfit.js       # Structured JSON analysis (colors, style tags, gaps)
├── weather.js              # OpenWeatherMap proxy
├── weather-suggestions.js  # City autocomplete
├── search-products.js      # RapidAPI product search (mock fallback)
├── middleware/cors.js      # Shared CORS headers
└── config/constants.js     # Per-mode Claude max_tokens limits
```

### Frontend (React + Vite)

`main.jsx` wires `BrowserRouter → AuthProvider → App`. `App.jsx` is the orchestrator: it owns photo/rating/mode state, instantiates all hooks, defines the four persona system prompts, and passes everything to the routed pages.

```
src/
├── main.jsx                # App entry: router + auth provider
├── App.jsx                 # Orchestrator; persona prompts + prompt/response glue
├── pages/
│   ├── HomePage.jsx        # Main rating flow
│   ├── LoginPage.jsx       # Auth
│   └── UserProfilePage.jsx # Profile & saved outfits
├── components/             # WeatherSection, ModeSelector, PhotoUpload,
│                           # RatingDisplay, ShareCard, ProductRecommendations,
│                           # OutfitAnalysisPanel, UpgradeModal, UsageIndicator, …
├── hooks/                  # Data & feature logic (see below)
├── context/AuthContext.jsx # useAuth() — Supabase email/password auth
├── lib/supabaseClient.js   # Shared Supabase client
├── utils/imageOptimization.js  # Client-side resize/JPEG before upload
└── calendarIntegration.js  # .ics parsing utilities
```

**Hooks** own all Supabase reads/writes and feature state:
`useProfile` (user_profiles), `useOutfits` (saved_outfits), `useSubscription` + `useGuestUsage` (tiers, usage_logs, guest limits), `useWeather`, `useProductSearch`, `useOutfitAnalysis`.

### Prompt ↔ response coupling

Persona system prompts and the markdown output template live in `App.jsx` (`getModePrompt` / `buildPromptWithWeather`). The response is then **regex-parsed** (e.g. extracting the social-media summary for the share card). The prompt's output structure and the parsing code are coupled — change one, change the other.

### Supabase

SQL migrations live in `supabase/migrations/` (numbered, applied manually to the Supabase project — no CLI config in repo). All tables use Row Level Security keyed on `auth.uid()`.

| Migration | Contents |
|-----------|----------|
| `001_user_profiles.sql` | `user_profiles` table |
| `002_avatars_storage_policies.sql` | Avatar storage bucket policies |
| `003_add_country_to_profiles.sql` | Country code column |
| `004_create_saved_outfits.sql` | `saved_outfits` table |
| `005_subscriptions.sql` | `user_subscriptions` + `usage_logs`, tier enum |

> **Note:** Subscription rating limits and feature gating are enforced **client-side** (in `useSubscription`). The API endpoints do not check limits.

### Tech Stack
- **Frontend**: React 19, Vite 7, TailwindCSS 4, React Router 7, Lucide icons, React-Markdown, html2canvas
- **Backend**: Express (local) / Vercel serverless functions (prod)
- **Auth & DB**: Supabase (Postgres + Auth + Storage)
- **AI**: Anthropic Claude Haiku 3.5 (`claude-3-5-haiku-20241022`, raw `fetch` — no SDK)
- **APIs**: OpenWeatherMap (weather + geocoding), RapidAPI (product search)
- **Payments**: Stripe (scaffolded)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Anthropic API key ([console.anthropic.com](https://console.anthropic.com/))
- OpenWeatherMap API key ([openweathermap.org/api](https://openweathermap.org/api))
- Supabase project ([supabase.com](https://supabase.com)) — URL + anon key
- (Optional) RapidAPI key for live product search

### Installation

1. **Clone and install**
```bash
git clone https://github.com/akp-110/outfit-rater.git
cd outfit-rater
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
```
Edit `.env`:
```env
ANTHROPIC_API_KEY="..."
OPENWEATHER_API_KEY="..."
VITE_SUPABASE_URL="..."
VITE_SUPABASE_ANON_KEY="..."
RAPIDAPI_KEY="..."   # optional — mock data used if absent
```

3. **Set up the database**
   Apply the SQL files in `supabase/migrations/` (in order) to your Supabase project via the SQL editor.

4. **Run both servers**
```bash
npm run dev:all
```
Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api/*` to the Express API on port 3001, so **both must be running** — `dev:all` starts them together.

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev:all   # Start frontend + API server together (recommended)
npm run dev       # Vite frontend only (port 5173)
npm start         # Express API server only (port 3001)
npm run build     # Production build → dist/
npm run preview   # Preview the production build
npm run lint      # ESLint
```

> Running only `npm run dev` will load the UI, but any `/api/*` call fails until the Express server (`npm start`) is also running.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Claude API key for ratings/analysis (server-side) | Yes |
| `OPENWEATHER_API_KEY` | Weather + geocoding (server-side) | Yes |
| `VITE_SUPABASE_URL` | Supabase project URL (client-side) | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (client-side) | Yes |
| `SUPABASE_URL` | Supabase project URL for server-side quota RPCs | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key for quota reservations | Yes |
| `GUEST_IP_SALT` | Random 32+ character HMAC key for guest identities | Yes |
| `APP_ORIGINS` | Comma-separated exact browser origins allowed by the API | Yes |
| `DISABLE_AI_ENDPOINTS` | Emergency `1` switch to stop paid AI calls | No |
| `RAPIDAPI_KEY` | Product search; mock data used if unset (server-side) | No |

> Client-exposed variables **must** be prefixed with `VITE_`. Everything else stays server-side only.

---

## 📦 Deployment

### Vercel (recommended)
The `api/` handlers are already serverless-compatible.
1. Push to GitHub and import the repo at [vercel.com](https://vercel.com).
2. Add all environment variables (Settings → Environment Variables), including the `VITE_`-prefixed Supabase keys.
3. Vercel auto-deploys on every push to `main`.

### Netlify
1. Import the repo at [netlify.com](https://netlify.com).
2. Build command: `npm run build`, publish directory: `dist`.
3. Add environment variables. (Note: `api/` handlers may need Netlify Functions adaptation.)

---

## 🎯 Usage

1. **(Optional) Sign in** — create an account to save your profile, outfits, and unlock more ratings.
2. **Select an advisor** — pick your preferred AI persona.
3. **Add context** — set a location for weather, fill in your style profile, import a calendar.
4. **Upload a photo** — of your outfit.
5. **Get your rating** — detailed feedback, breakdown scores, and suggestions.
6. **Share or save** — export a polaroid card or save the outfit to your profile.

---

## 🔒 Security

- API keys (Anthropic, OpenWeather, RapidAPI) are used server-side only in `api/` handlers.
- Supabase access is protected by Row Level Security keyed on the authenticated user.
- Rating and analysis limits are atomically reserved by server-side Supabase RPCs before paid provider calls. Client counters are display-only.
- Existing `style_pro` subscriptions remain unlimited; security migrations never update subscription tiers.
- Rating prompts, provider models, and token budgets are server-owned. API inputs and browser origins are validated server-side.
- Saved outfit photos use private object paths and short-lived signed URLs after migrations 010 and 011 are applied through the approved compatibility rollout.
- `.env` is gitignored.

---

## 📝 License

ISC License.

---

**Made with ❤️ and AI**

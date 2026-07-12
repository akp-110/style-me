# Style/Me Mobile-First Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dark glassmorphism UI with the approved "Street-first" design (cream paper, ink borders, acid accent, editorial serif moments), mobile-first, across the home flow and share card.

**Architecture:** Restyle-in-place (approved spec: `docs/superpowers/specs/2026-07-12-mobile-first-redesign-design.md`). Component structure and props stay; markup/classes are rewritten against new Tailwind 4 `@theme` tokens. One new pure-logic module (`parseRating`) powers the verdict screen's breakdown bars, TDD'd with vitest. Old CSS classes survive as a "legacy block" until the final cleanup task so the app renders at every intermediate commit.

**Tech Stack:** React 19, Vite 7, Tailwind CSS 4 (via `@tailwindcss/postcss`, CSS-first `@theme` config), vitest (new devDependency), html2canvas, react-markdown.

**Key facts for the implementing engineer (zero-context primer):**
- Run the app with `npm run dev:all` (Vite on :5173 + Express API on :3001). The UI loads without the API, but rating calls fail.
- Tailwind 4 is configured in CSS (`src/index.css` starts with `@import "tailwindcss"`). The repo's `tailwind.config.js` is NOT loaded (no `@config` directive anywhere) — do not add tokens there; use `@theme` in `index.css`. Tokens defined as `--color-paper` etc. auto-generate utilities (`bg-paper`, `text-ink`, `border-ink`, `ring-acid`, `shadow-hard`, `font-serif`).
- **html2canvas cannot parse `oklch()` colors, and Tailwind 4 emits `oklch()` for its palette.** Anything inside the captured share-card subtree must be styled with **inline styles using hex values only**. This is why the old `ShareCard.jsx` used inline styles; the new polaroid must too.
- The rating text is markdown following the fixed template in `src/App.jsx` (`buildPromptWithWeather`). Section headers arrive as `**Header:**` lines.
- There is no test infra today; Task 2 adds vitest for pure functions only. UI verification is manual browser checks at 375px/768px widths (use browser devtools responsive mode, or the Claude browser pane resized to mobile).
- The current UI mixes `xs:` Tailwind classes that do nothing (breakpoint was never defined). Do not carry any `xs:` class into new markup.

---

### Task 1: Design foundation — fonts + tokens + utilities

**Files:**
- Modify: `index.html:9-12` (font link)
- Modify: `src/index.css` (full rewrite, keeping a legacy block)

- [ ] **Step 1: Swap Google Fonts in `index.html`**

Replace lines 9–12 (the font comment + 3 link tags) with:

```html
    <!-- Archivo (display/UI) + Playfair Display (editorial accents) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;700;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,600&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Rewrite `src/index.css`**

Replace the entire file with the content below. The `LEGACY` block at the bottom is copied verbatim from the current file (minus the mobile-override media queries) and keeps the not-yet-restyled components rendering; it is deleted in Task 11.

```css
@import "tailwindcss";

/* ============ Street-first design tokens ============ */
@theme {
  --color-paper: #FAF7F2;
  --color-ink: #111111;
  --color-acid: #D7FD35;
  --color-acid-dim: #B8D928;
  --color-stone: #DDD8CF;

  --font-sans: "Archivo", system-ui, -apple-system, sans-serif;
  --font-serif: "Playfair Display", Georgia, serif;

  --shadow-hard-sm: 2px 2px 0 0 #111111;
  --shadow-hard: 4px 4px 0 0 #111111;
  --shadow-hard-lg: 6px 6px 0 0 #111111;
}

@layer base {
  body {
    font-family: var(--font-sans);
    background: var(--color-paper);
    color: var(--color-ink);
    -webkit-font-smoothing: antialiased;
    margin: 0;
    overflow-x: hidden;
  }
  * { box-sizing: border-box; }
}

@layer components {
  /* White card with hard border + offset shadow */
  .card-hard {
    background: #fff;
    border: 3px solid var(--color-ink);
    box-shadow: 4px 4px 0 0 var(--color-ink);
  }

  /* Small bordered chip (top bar, badges, small buttons) */
  .chip-hard {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    border: 2px solid var(--color-ink);
    background: #fff;
    color: var(--color-ink);
    padding: 0.35rem 0.6rem;
    font-weight: 800;
    font-size: 0.7rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    line-height: 1;
    cursor: pointer;
  }

  /* Press-down interaction: pair with shadow-hard / shadow-hard-sm */
  .btn-press {
    transition: transform 0.1s ease, box-shadow 0.1s ease;
  }
  .btn-press:active:not(:disabled) {
    transform: translate(3px, 3px);
    box-shadow: 1px 1px 0 0 var(--color-ink);
  }
  .btn-press:disabled { opacity: 0.45; cursor: not-allowed; }

  /* Uppercase micro-label */
  .label-caps {
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-size: 0.7rem;
  }
}

@layer utilities {
  .animate-fade-in { animation: fadeIn 0.4s ease-in; }
  .animate-scale-in { animation: scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
  .animate-slide-up { animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
@keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ==================================================================
   LEGACY — styles still referenced by not-yet-restyled components.
   DELETE THIS ENTIRE BLOCK in the cleanup task.
   ================================================================== */
.animated-gradient { background: linear-gradient(180deg, #030810, #030810); }
.glass {
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(10px) saturate(130%);
  border: 1px solid rgba(255,255,255,0.05);
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
}
.glass-strong {
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(12px) saturate(130%);
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
}
@keyframes float { 0%,100%{ transform: translateY(0); opacity:.7 } 50%{ transform: translateY(-18px); opacity:.85 } }
.floating { animation: float 12s ease-in-out infinite; }
.floating-delayed { animation: float 14s ease-in-out infinite; animation-delay: -3s; }
.floating-slow { animation: float 20s ease-in-out infinite; animation-delay: -6s; }
.glow-muted { box-shadow: 0 4px 24px rgba(59,89,152,0.15); }
.glow-sage { box-shadow: 0 6px 28px rgba(45,95,79,0.12); }
.glow-gold { box-shadow: 0 6px 28px rgba(90,124,153,0.12); }
.particle { position:absolute; border-radius:50%; pointer-events:none; opacity:.5; filter: blur(30px); }
.particle-1 { width:120px; height:120px; background: radial-gradient(circle, rgba(59,89,152,0.08) 0%, transparent 70%); top:8%; left:8%; }
.particle-2 { width:160px; height:160px; background: radial-gradient(circle, rgba(45,95,79,0.06) 0%, transparent 70%); top:60%; right:8%; }
.particle-3 { width:140px; height:140px; background: radial-gradient(circle, rgba(90,124,153,0.05) 0%, transparent 70%); bottom:18%; left:20%; }
.btn-soft {
  background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.05));
  color: #f5f7fa;
  border: 1px solid rgba(255,255,255,0.08);
}
.btn-soft[disabled] { opacity:.5; cursor:not-allowed; }
.mode-label { word-break: break-word; overflow-wrap: break-word; line-height: 1.2; }
.persona-image-container { perspective: 1000px; }
.persona-image { transform-style: preserve-3d; }
.persona-glow { position:absolute; inset:-12px; border-radius:9999px; opacity:0; }
.gradient-text { background: linear-gradient(90deg, #3b5998, #2d5f4f, #5a7c99); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.animate-slide-down { animation: slideUp 0.35s cubic-bezier(0.16,1,0.3,1); }
.animate-pulse-slow { animation: pulse 5s cubic-bezier(.4,0,.6,1) infinite; }
.animate-bounce-slow { animation: bounce 5s infinite; }
/* ================== END LEGACY ================== */
```

- [ ] **Step 3: Verify the app still renders**

Run: `npm run dev` and open http://localhost:5173.
Expected: page loads with no console errors. The old dark components render on a now-cream body (visible at edges) — interim ugliness is expected. Text is Archivo.

- [ ] **Step 4: Commit**

```bash
git add index.html src/index.css
git commit -m "feat(redesign): add street-first design tokens, fonts, and utilities"
```

---

### Task 2: Rating parser (TDD)

**Files:**
- Create: `src/utils/parseRating.js`
- Create: `src/utils/parseRating.test.js`
- Modify: `package.json` (add vitest + test script)

- [ ] **Step 1: Install vitest and add script**

```bash
npm install -D vitest
```

In `package.json` `"scripts"`, add: `"test": "vitest run"`.

- [ ] **Step 2: Write the failing tests**

Create `src/utils/parseRating.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { parseRating } from './parseRating';

const FULL_RESPONSE = `**Overall Rating: 7.5/10**

**Social Media Summary:**
Quiet luxury done loudly — the proportions save it.

**Breakdown:**
- Style: 8/10
- Weather Appropriateness: 7/10
- Occasion Fit: 7/10

**What Works:**
- The monochrome base reads intentional
- Proportions balance the oversized knit

**Suggestions:**
- Swap the sneakers for a chelsea boot
- A structured coat would sharpen the silhouette

**Weather Check:**
This outfit handles 18°C drizzle well.`;

describe('parseRating', () => {
  it('parses the full template', () => {
    const r = parseRating(FULL_RESPONSE);
    expect(r.parsed).toBe(true);
    expect(r.overall).toBe('7.5');
    expect(r.breakdown).toEqual([
      { label: 'Style', score: 8 },
      { label: 'Weather Appropriateness', score: 7 },
      { label: 'Occasion Fit', score: 7 },
    ]);
    expect(r.whatWorks).toContain('monochrome base');
    expect(r.suggestions).toContain('chelsea boot');
    expect(r.extras).toEqual([
      { title: 'Weather Check', body: 'This outfit handles 18°C drizzle well.' },
    ]);
  });

  it('parses the versatility variant (no weather)', () => {
    const r = parseRating('**Overall Rating: 9/10**\n\n**Breakdown:**\n- Style: 9/10\n- Versatility: 8/10\n- Occasion Fit: 9/10');
    expect(r.overall).toBe('9');
    expect(r.breakdown[1]).toEqual({ label: 'Versatility', score: 8 });
  });

  it('captures The Roast as an extra section', () => {
    const r = parseRating('**Overall Rating: 4/10**\n\n**The Roast:**\nThose shoes filed a complaint.');
    expect(r.extras).toEqual([{ title: 'The Roast', body: 'Those shoes filed a complaint.' }]);
  });

  it('returns parsed:false for free-form text', () => {
    const r = parseRating('Honestly this outfit is great, love the coat, maybe lose the hat.');
    expect(r.parsed).toBe(false);
    expect(r.overall).toBeNull();
    expect(r.breakdown).toEqual([]);
  });

  it('tolerates a missing breakdown while parsing the rest', () => {
    const r = parseRating('**Overall Rating: 6/10**\n\n**What Works:**\n- Nice color');
    expect(r.parsed).toBe(true);
    expect(r.breakdown).toEqual([]);
    expect(r.whatWorks).toBe('- Nice color');
  });

  it('handles null/empty input', () => {
    expect(parseRating(null).parsed).toBe(false);
    expect(parseRating('').parsed).toBe(false);
  });

  it('ignores the social media summary section (handled upstream)', () => {
    const r = parseRating(FULL_RESPONSE);
    const titles = r.extras.map((e) => e.title);
    expect(titles).not.toContain('Social Media Summary');
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run src/utils/parseRating.test.js`
Expected: FAIL — `Cannot find module './parseRating'` (or equivalent).

- [ ] **Step 4: Implement `src/utils/parseRating.js`**

```js
/**
 * Parses the markdown rating template produced by the prompt in App.jsx.
 * Every field is nullable/empty; consumers must fall back to rendering the
 * raw markdown when `parsed` is false (or per-section when a field is null).
 *
 * Shape:
 * {
 *   overall: string|null,               // "7.5"
 *   breakdown: [{label, score:number}], // [] when not parsed
 *   whatWorks: string|null,             // raw markdown body of the section
 *   suggestions: string|null,
 *   extras: [{title, body}],            // Weather Check, The Roast, etc.
 *   parsed: boolean
 * }
 */
export function parseRating(text) {
  const empty = { overall: null, breakdown: [], whatWorks: null, suggestions: null, extras: [], parsed: false };
  if (typeof text !== 'string' || !text.trim()) return { ...empty };

  const overallMatch = text.match(/overall rating:\s*(\d+(?:\.\d+)?)\s*\/\s*10/i);
  const overall = overallMatch ? overallMatch[1] : null;

  // Section headers are bold runs alone on a line: **Header:**
  const headerRe = /^[ \t]*\*\*([^*\n]+?)\*\*[ \t]*$/gm;
  const headers = [...text.matchAll(headerRe)].map((m) => ({
    title: m[1].replace(/:\s*$/, '').trim(),
    start: m.index,
    end: m.index + m[0].length,
  }));

  const breakdown = [];
  let whatWorks = null;
  let suggestions = null;
  const extras = [];

  headers.forEach((h, i) => {
    const body = text.slice(h.end, i + 1 < headers.length ? headers[i + 1].start : undefined).trim();
    const t = h.title.toLowerCase();
    if (t.startsWith('overall rating') || t.startsWith('social media summary')) return;
    if (t === 'breakdown') {
      for (const line of body.split('\n')) {
        const bm = line.match(/^\s*[-•*]\s*(.+?):\s*(\d+(?:\.\d+)?)\s*\/\s*10/);
        if (bm) breakdown.push({ label: bm[1].trim(), score: parseFloat(bm[2]) });
      }
    } else if (t === 'what works') {
      whatWorks = body || null;
    } else if (t === 'suggestions') {
      suggestions = body || null;
    } else if (body) {
      extras.push({ title: h.title, body });
    }
  });

  const parsed = overall !== null || breakdown.length > 0 || whatWorks !== null || suggestions !== null;
  return { overall, breakdown, whatWorks, suggestions, extras, parsed };
}
```

Note: `**Overall Rating: 7.5/10**` sits entirely inside the bold header, so the overall score is extracted by direct regex on the full text, not from section bodies.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/utils/parseRating.test.js`
Expected: 7 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/utils/parseRating.js src/utils/parseRating.test.js package.json package-lock.json
git commit -m "feat(redesign): add rating template parser with tests"
```

---

### Task 3: Header + UsageIndicator become top-bar chips

**Files:**
- Modify: `src/components/Header.jsx` (full rewrite; only consumer is HomePage)
- Modify: `src/components/UsageIndicator.jsx` (full rewrite)

- [ ] **Step 1: Rewrite `src/components/Header.jsx`**

The component stops absolute-positioning itself; HomePage will place it inside the top bar.

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, LogIn } from 'lucide-react';

export default function Header() {
    const { user, signOut, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) return null;

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    if (!user) {
        return (
            <button onClick={() => navigate('/login')} className="chip-hard btn-press shadow-hard-sm bg-acid">
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
            </button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <button onClick={() => navigate('/profile')} className="chip-hard btn-press shadow-hard-sm" title="My Profile">
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Profile</span>
            </button>
            <button onClick={handleSignOut} className="chip-hard btn-press shadow-hard-sm bg-ink text-paper" title="Sign out">
                <LogOut className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
```

- [ ] **Step 2: Rewrite `src/components/UsageIndicator.jsx`**

```jsx
import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { Zap, AlertCircle } from 'lucide-react';

/**
 * UsageIndicator - Shows remaining ratings for the month as a bordered chip.
 */
export function UsageIndicator({ compact = false, onClick }) {
    const { tier, remaining, loading, getRemainingText } = useSubscription();

    if (loading) return null;

    if (tier === 'style_pro') {
        return (
            <button onClick={onClick} className="chip-hard btn-press shadow-hard-sm bg-ink text-acid" title="Unlimited ratings">
                <Zap className="w-3 h-3" fill="currentColor" />
                <span>Pro</span>
            </button>
        );
    }

    const out = remaining <= 0;
    return (
        <button
            onClick={onClick}
            className={`chip-hard btn-press shadow-hard-sm ${out ? 'bg-ink text-acid' : ''}`}
            title={out ? 'Out of ratings — upgrade for more' : `${remaining} ratings left this month`}
        >
            {out && <AlertCircle className="w-3 h-3" />}
            <span>{getRemainingText()}{compact ? '' : ' left'}</span>
        </button>
    );
}
```

(The old non-compact progress-bar variant is dropped; nothing else in the codebase used it — verify with `grep -rn "UsageIndicator" src/`.)

- [ ] **Step 3: Verify**

Run: `npm run dev`, open http://localhost:5173.
Expected: top-left/top-right of the hero now show bordered chips (they're still absolutely positioned by the old HomePage — fine until Task 4). No console errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.jsx src/components/UsageIndicator.jsx
git commit -m "feat(redesign): restyle header and usage indicator as bordered chips"
```

---

### Task 4: HomePage shell — top bar, hero, sticky CTA

**Files:**
- Modify: `src/pages/HomePage.jsx` (full rewrite)

- [ ] **Step 1: Rewrite `src/pages/HomePage.jsx`**

Notes: particles/overlay/animated-gradient deleted; top bar is sticky; the sticky bottom "RATE ME" bar appears when a photo exists and no rating yet (the old button inside PhotoUpload coexists until Task 7 — harmless duplicate for one commit). `RatingDisplay` keeps rendering inline below until Task 8 swaps it to a conditional view.

```jsx
import React from 'react';
import Header from '../components/Header';
import { WeatherSection } from '../components/WeatherSection';
import { ModeSelector } from '../components/ModeSelector';
import { PhotoUpload } from '../components/PhotoUpload';
import { RatingDisplay } from '../components/RatingDisplay';
import { HelpModal } from '../components/HelpModal';
import { UsageIndicator } from '../components/UsageIndicator';

export const HomePage = ({
    weatherHook,
    profileHook,
    subscriptionHook,
    setShowUpgradeModal,
    mode,
    setMode,
    modes,
    setRating,
    photo,
    photoPreview,
    handleFileUpload,
    clearPhoto,
    getRating,
    loading,
    loadingMessage,
    currentMode,
    rating,
    socialSummary,
    showHelpModal,
    setShowHelpModal
}) => {
    const showStickyRate = photo && !rating;

    return (
        <div className="min-h-screen bg-paper text-ink font-sans">
            {/* Top bar */}
            <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-paper">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-2 px-4 py-2.5">
                    <span className="font-black tracking-tight text-lg">STYLE/ME</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowHelpModal(true)}
                            className="chip-hard btn-press shadow-hard-sm"
                            title="How to use Style/Me"
                        >
                            ?
                        </button>
                        {subscriptionHook && (
                            <UsageIndicator compact onClick={() => setShowUpgradeModal(true)} />
                        )}
                        <Header />
                    </div>
                </div>
            </header>

            <main className={`max-w-3xl mx-auto px-4 ${showStickyRate ? 'pb-28' : 'pb-10'}`}>
                {/* Hero */}
                <div className="pt-8 pb-6 text-left animate-fade-in">
                    <h1 className="font-black uppercase leading-[0.9] tracking-tight text-5xl sm:text-7xl">
                        Fit check<span className="text-acid-dim">.</span>
                    </h1>
                    <p className="mt-3 text-sm sm:text-base text-ink/60 max-w-md">
                        Four advisors. One photo. Zero mercy.
                        {weatherHook.useWeather && ' Weather included.'}
                    </p>
                </div>

                <WeatherSection {...weatherHook} />

                <ModeSelector mode={mode} setMode={setMode} modes={modes} setRating={setRating} />

                <PhotoUpload
                    photo={photo}
                    photoPreview={photoPreview}
                    handleFileUpload={handleFileUpload}
                    clearPhoto={clearPhoto}
                    getRating={getRating}
                    loading={loading}
                    loadingMessage={loadingMessage}
                    currentMode={currentMode}
                />

                <RatingDisplay
                    rating={rating}
                    socialSummary={socialSummary}
                    currentMode={currentMode}
                    mode={mode}
                    useWeather={weatherHook.useWeather}
                    weather={weatherHook.weather}
                    photoPreview={photoPreview}
                    userPreferences={{
                        favoriteBrands: profileHook.profile.favouriteBrands,
                        countryCode: profileHook.profile.countryCode
                    }}
                />

                {/* Footer */}
                <div className="text-center mt-16 space-y-1">
                    <p className="label-caps text-ink/40">Powered by Claude Haiku 3.5 × Anthropic</p>
                    <p className="label-caps text-ink/30">#StyleMe</p>
                </div>
            </main>

            {/* Sticky rate CTA */}
            {showStickyRate && (
                <div className="fixed bottom-0 inset-x-0 z-40 border-t-[3px] border-ink bg-paper p-3">
                    <button
                        onClick={getRating}
                        disabled={loading}
                        className="w-full max-w-xl mx-auto flex items-center justify-center gap-2 bg-acid border-[3px] border-ink shadow-hard btn-press font-black uppercase tracking-wide text-base py-3.5"
                    >
                        {loading ? (
                            <>
                                <span className="inline-block w-4 h-4 border-[3px] border-ink border-t-transparent rounded-full animate-spin" />
                                {loadingMessage}
                            </>
                        ) : (
                            'Rate me →'
                        )}
                    </button>
                </div>
            )}

            <HelpModal showHelpModal={showHelpModal} setShowHelpModal={setShowHelpModal} />
        </div>
    );
};

export default HomePage;
```

- [ ] **Step 2: Verify at mobile width**

Run: `npm run dev`, open http://localhost:5173 at 375px width.
Expected: cream page, bordered sticky top bar with chips (no overlaps), compact "FIT CHECK." hero. Old-styled Weather/ModeSelector/PhotoUpload cards below (still glassy — expected). Upload a photo: sticky "RATE ME →" bar appears at bottom. No horizontal scroll.

- [ ] **Step 3: Commit**

```bash
git add src/pages/HomePage.jsx
git commit -m "feat(redesign): rebuild HomePage shell with top bar, compact hero, sticky CTA"
```

---

### Task 5: Advisor picker — modes data + ModeSelector rebuild

**Files:**
- Modify: `src/App.jsx:39-88` (the `modes` object)
- Modify: `src/components/ModeSelector.jsx` (full rewrite)

- [ ] **Step 1: Add `title` and `quote` to each mode in `src/App.jsx`**

Add two fields per mode. **Keep the old styling fields** (`gradient`, `glow`, etc.) — they're still consumed by PhotoUpload until Task 7 and removed in Task 11. New copy:

```js
    professional: {
      label: 'Alexandra Ashford',
      title: 'The Curator',
      quote: 'I read an outfit the way I read a painting — context, proportion, intent.',
      persona: 'Understated Sophistication',
      bio: 'Museum curator & style theorist analyzing cultural context',
      image: AlexandraAshfordImage,
      // ...existing styling fields unchanged...
    },
    balanced: {
      label: 'Margot Leclerc',
      title: 'The Consultant',
      quote: 'True elegance is harmony — we simply turn up its volume.',
      persona: 'Thoughtful, Elegant, and Refined',
      bio: 'Parisian consultant elevating style with warmth',
      image: MargotLeclercImage,
      // ...existing styling fields unchanged...
    },
    hype: {
      label: 'Kai Chen',
      title: 'The Journalist',
      quote: "Bold choices are the whole story. I'm just here to write it down.",
      persona: 'Authenticity, Energy and Enthusiam',
      bio: 'Fashion journalist celebrating boldness & expression',
      image: KaiChenImage,
      // ...existing styling fields unchanged...
    },
    roast: {
      label: 'Marcus Stone',
      title: 'The Critic',
      quote: "I don't roast people. I roast decisions. Yours, specifically.",
      persona: 'Truthful and Straightforward',
      bio: 'Fashion critic with witty, sharp observations',
      image: MarcusStoneImage,
      // ...existing styling fields unchanged...
    }
```

- [ ] **Step 2: Rewrite `src/components/ModeSelector.jsx`**

```jsx
import React from 'react';

export const ModeSelector = ({ mode, setMode, modes, setRating }) => {
    const entries = Object.entries(modes);
    const selectedIndex = entries.findIndex(([key]) => key === mode);
    const current = modes[mode];

    return (
        <section className="mb-8 text-left animate-slide-up">
            <div className="label-caps mb-3">Pick your advisor</div>

            {/* Avatar row */}
            <div className="flex gap-3" role="radiogroup" aria-label="Choose your advisor">
                {entries.map(([key, m]) => {
                    const selected = mode === key;
                    return (
                        <button
                            key={key}
                            role="radio"
                            aria-checked={selected}
                            title={m.label}
                            onClick={() => { setMode(key); setRating(null); }}
                            className={`relative w-14 h-14 rounded-full border-2 border-ink btn-press flex-shrink-0 ${
                                selected ? 'shadow-hard ring-4 ring-acid' : 'shadow-hard-sm'
                            }`}
                        >
                            <img
                                src={m.image}
                                alt={m.label}
                                className="w-full h-full rounded-full object-cover grayscale contrast-125"
                            />
                            {selected && (
                                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-ink text-acid rounded-full text-[10px] font-black flex items-center justify-center border border-acid">
                                    ✓
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Advisor detail card */}
            <div className="card-hard mt-4 p-4" key={mode}>
                <div className="flex justify-between items-baseline gap-2">
                    <div className="font-serif italic text-xl">{current.label}</div>
                    <div className="label-caps text-ink/40">
                        {String(selectedIndex + 1).padStart(2, '0')}/{String(entries.length).padStart(2, '0')}
                    </div>
                </div>
                <div className="label-caps text-ink/50 mt-1">{current.title}</div>
                <p className="font-serif text-sm leading-relaxed mt-2 text-ink/80">"{current.quote}"</p>
            </div>
        </section>
    );
};
```

- [ ] **Step 3: Verify at mobile width**

At 375px: four 56px round grayscale portraits in a row; tapping each swaps the detail card (serif name, THE X title, quote, 0N/04 index); selected avatar has acid ring + ink check badge. No layout shift or overflow.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/components/ModeSelector.jsx
git commit -m "feat(redesign): advisor avatar row with editorial detail card"
```

---

### Task 6: WeatherSection — chip row + expandable panel

**Files:**
- Modify: `src/components/WeatherSection.jsx` (full rewrite)

- [ ] **Step 1: Rewrite `src/components/WeatherSection.jsx`**

Same props, new local `expanded` state. Collapsed = one chip row. Expanded = bordered panel with the existing search/autocomplete and a compact stats strip.

```jsx
import React, { useRef, useEffect, useState } from 'react';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';

export const WeatherSection = ({
    weather,
    loadingWeather,
    location,
    setLocation,
    useWeather,
    setUseWeather,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    loadingSuggestions,
    handleLocationUpdate,
    handleSuggestionSelect
}) => {
    const suggestionsRef = useRef(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        function handleClickOutside(event) {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setShowSuggestions]);

    const handleLocationKeyPress = (e) => {
        if (e.key === 'Enter') handleLocationUpdate();
    };

    return (
        <section className="mb-8 text-left animate-slide-up">
            <div className="label-caps mb-3">Weather</div>

            {/* Chip row */}
            <div className="flex flex-wrap items-center gap-2">
                <button
                    onClick={() => setUseWeather(!useWeather)}
                    className={`chip-hard btn-press shadow-hard-sm ${useWeather ? 'bg-ink text-acid' : ''}`}
                    aria-pressed={useWeather}
                >
                    Weather {useWeather ? 'on' : 'off'}
                </button>

                {useWeather && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="chip-hard btn-press shadow-hard-sm"
                        aria-expanded={expanded}
                    >
                        <MapPin className="w-3 h-3" />
                        {weather && !loadingWeather
                            ? `${weather.temperature}°C · ${location || 'Set location'}`
                            : loadingWeather ? 'Loading…' : (location || 'Set location')}
                        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                )}
            </div>

            {/* Expanded editor panel */}
            {useWeather && expanded && (
                <div className="card-hard mt-3 p-4 animate-scale-in">
                    <div className="flex gap-2">
                        <div className="flex-1 relative" ref={suggestionsRef}>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                onKeyPress={handleLocationKeyPress}
                                placeholder="Enter city or zip code…"
                                autoComplete="off"
                                className="w-full border-2 border-ink px-3 py-2.5 text-sm font-medium bg-white focus:outline-none focus:ring-4 focus:ring-acid"
                            />

                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-ink shadow-hard z-50 max-h-56 overflow-y-auto">
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestionSelect(suggestion)}
                                            className="w-full text-left px-3 py-2.5 border-b-2 border-ink/10 last:border-b-0 hover:bg-acid/30 text-sm"
                                        >
                                            <span className="font-bold">{suggestion.name}</span>
                                            <span className="text-ink/50"> — {suggestion.country}{suggestion.state ? `, ${suggestion.state}` : ''}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {loadingSuggestions && showSuggestions && location.trim() && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-ink shadow-hard z-50 px-3 py-2.5 text-sm text-ink/60">
                                    Searching locations…
                                </div>
                            )}

                            {showSuggestions && !loadingSuggestions && location.trim() && suggestions.length === 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-ink shadow-hard z-50 px-3 py-2.5 text-sm text-ink/60">
                                    No locations found for "{location}"
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleLocationUpdate}
                            disabled={loadingWeather}
                            className="chip-hard btn-press shadow-hard-sm bg-acid self-stretch"
                        >
                            {loadingWeather ? '…' : 'Update'}
                        </button>
                    </div>

                    {weather && !loadingWeather && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 mt-3 border-2 border-ink divide-x-2 divide-y-2 sm:divide-y-0 divide-ink bg-white text-center">
                            <div className="p-2.5">
                                <div className="font-black text-lg">{weather.temperature}°C</div>
                                <div className="label-caps text-ink/50">Feels {weather.feelsLike}°</div>
                            </div>
                            <div className="p-2.5">
                                <div className="font-black text-lg capitalize">{weather.condition}</div>
                                <div className="label-caps text-ink/50 capitalize">{weather.description}</div>
                            </div>
                            <div className="p-2.5">
                                <div className="font-black text-lg">{weather.humidity}%</div>
                                <div className="label-caps text-ink/50">Humidity</div>
                            </div>
                            <div className="p-2.5">
                                <div className="font-black text-lg">{weather.windSpeed}</div>
                                <div className="label-caps text-ink/50">Wind mph</div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};
```

- [ ] **Step 2: Verify at mobile width (needs API server: `npm run dev:all`)**

At 375px: "WEATHER ON/OFF" chip toggles; when on, location chip appears; tapping it opens the bordered panel; typing shows autocomplete; selecting a city and Update fetches weather; the 2×2 stats grid renders without overflow.

- [ ] **Step 3: Commit**

```bash
git add src/components/WeatherSection.jsx
git commit -m "feat(redesign): collapse weather into chip row with expandable panel"
```

---

### Task 7: PhotoUpload restyle

**Files:**
- Modify: `src/components/PhotoUpload.jsx` (full rewrite)

- [ ] **Step 1: Rewrite `src/components/PhotoUpload.jsx`**

The internal "Rate My Outfit" button is removed (the sticky bar from Task 4 owns it). The component now only needs three props; HomePage's call site is trimmed in Task 11.

```jsx
import React, { useRef } from 'react';
import { X, RefreshCw, Upload, Info } from 'lucide-react';

export const PhotoUpload = ({
    photoPreview,
    handleFileUpload,
    clearPhoto
}) => {
    const fileInputRef = useRef(null);

    return (
        <section className="mb-8 text-left animate-slide-up">
            <div className="label-caps mb-3">Your fit</div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/heic,image/heif,image/webp,image/*"
                onChange={handleFileUpload}
                className="hidden"
            />

            {!photoPreview ? (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-[3px] border-dashed border-ink bg-white p-10 sm:p-16 text-center btn-press shadow-hard"
                >
                    <span className="inline-flex p-4 bg-acid border-[3px] border-ink mb-4">
                        <Upload className="w-8 h-8" />
                    </span>
                    <span className="block font-black uppercase tracking-wide text-lg">Drop a pic</span>
                    <span className="block text-sm text-ink/60 mt-1">Tap to choose a photo — JPG, PNG, HEIC</span>
                </button>
            ) : (
                <div className="relative animate-scale-in">
                    <img
                        src={photoPreview}
                        alt="Your outfit"
                        className="w-full max-h-[420px] sm:max-h-[560px] object-contain bg-stone border-[3px] border-ink shadow-hard"
                    />
                    <button
                        onClick={clearPhoto}
                        aria-label="Remove photo"
                        className="absolute top-2 right-2 chip-hard btn-press shadow-hard-sm"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-2 left-2 chip-hard btn-press shadow-hard-sm"
                    >
                        <RefreshCw className="w-3 h-3" />
                        Change
                    </button>
                </div>
            )}

            {/* Privacy notice */}
            <div className="flex items-start gap-2 mt-3 text-ink/60">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                    <span className="font-bold text-ink/80">Privacy:</span> Photos are sent to Anthropic's Claude API for
                    analysis and never stored on our servers. See{' '}
                    <a
                        href="https://www.anthropic.com/legal/commercial-terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-bold hover:bg-acid"
                    >
                        Anthropic's privacy practices
                    </a>.
                </p>
            </div>
        </section>
    );
};
```

- [ ] **Step 2: Verify at mobile width**

At 375px: dashed bordered upload zone with acid icon; choosing a photo shows the bordered preview with ✕ and CHANGE chips; the *only* rate button is the sticky bottom bar; pressing it runs the loading spinner in the sticky bar.

- [ ] **Step 3: Commit**

```bash
git add src/components/PhotoUpload.jsx
git commit -m "feat(redesign): restyle photo upload, move rate CTA to sticky bar"
```

---

### Task 8: The Verdict — RatingDisplay rebuild + view swap + polaroid share

**Files:**
- Modify: `src/components/RatingDisplay.jsx` (full rewrite)
- Modify: `src/pages/HomePage.jsx` (conditional view swap)
- Delete: `src/components/ShareCard.jsx`

- [ ] **Step 1: Rewrite `src/components/RatingDisplay.jsx`**

Key rules:
- The polaroid subtree (captured by html2canvas) uses **inline styles with hex colors only** — Tailwind 4 classes emit `oklch()` which html2canvas cannot parse.
- The tilt lives on a wrapper *outside* the captured ref, so the share image is straight.
- Every parsed section falls back independently; `parsed: false` renders the whole rating as markdown prose in one card.

```jsx
import React, { useRef, useState, useMemo } from 'react';
import { ArrowLeft, Share2, Loader2, Bookmark, Check, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import html2canvas from 'html2canvas';
import { OutfitAnalysisPanel } from './OutfitAnalysisPanel';
import { ProductRecommendations } from './ProductRecommendations';
import { useAuth } from '../context/AuthContext';
import { useOutfits } from '../hooks/useOutfits';
import { useOutfitAnalysis } from '../hooks/useOutfitAnalysis';
import { useProductSearch } from '../hooks/useProductSearch';
import { parseRating } from '../utils/parseRating';

const proseComponents = {
    p: (props) => <p className="text-sm leading-relaxed text-ink/80 mb-2 last:mb-0" {...props} />,
    ul: (props) => <ul className="space-y-1.5 mb-2 last:mb-0" {...props} />,
    li: (props) => <li className="text-sm leading-relaxed text-ink/80 flex gap-2"><span aria-hidden="true">→</span><span {...props} /></li>,
    strong: (props) => <strong className="font-bold text-ink" {...props} />,
    h2: (props) => <h2 className="label-caps mt-4 mb-2" {...props} />,
    h3: (props) => <h3 className="label-caps mt-4 mb-2" {...props} />,
};

const worksComponents = {
    ...proseComponents,
    li: (props) => <li className="text-sm leading-relaxed text-ink/80 flex gap-2"><span aria-hidden="true">✓</span><span {...props} /></li>,
};

export const RatingDisplay = ({ rating, socialSummary, currentMode, mode, useWeather, weather, photoPreview, userPreferences = {}, onBack }) => {
    const [isSharing, setIsSharing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const polaroidRef = useRef(null);
    const { user } = useAuth();
    const { saveOutfit } = useOutfits();
    const { analysis, loading: analysisLoading, error: analysisError, analyzeOutfit } = useOutfitAnalysis();
    const { products, loading: productsLoading, error: productsError, searchQuery, searchProducts, clearProducts } = useProductSearch();

    const parsed = useMemo(() => parseRating(rating), [rating]);

    if (!rating) return null;

    const numericRating = parsed.overall ?? '?';

    const handleShare = async () => {
        if (!polaroidRef.current) return;
        setIsSharing(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 300));
            const canvas = await html2canvas(polaroidRef.current, {
                scale: 2,
                backgroundColor: '#FAF7F2',
                useCORS: true,
                allowTaint: true,
                imageTimeout: 0
            });
            const imageBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
            if (!imageBlob) throw new Error('Failed to create image blob');
            const file = new File([imageBlob], 'style-me-rating.png', { type: 'image/png' });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'My Style/Me Rating',
                    text: `I got a ${numericRating}/10 from ${currentMode.label}! #StyleMe`,
                    files: [file]
                });
            } else {
                const link = document.createElement('a');
                link.download = 'style-me-rating.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        } catch (error) {
            console.error('Error sharing:', error);
            alert(`Failed to generate share image: ${error.message}`);
        } finally {
            setIsSharing(false);
        }
    };

    const handleSave = async () => {
        if (!user || !photoPreview) return;
        setIsSaving(true);
        try {
            await saveOutfit({
                photoDataUrl: photoPreview,
                ratingText: rating,
                socialSummary: socialSummary,
                advisorMode: mode,
                numericRating: parseFloat(numericRating) || 0
            });
            setIsSaved(true);
        } catch (error) {
            console.error('Error saving outfit:', error);
            alert(`Failed to save outfit: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAnalyze = async () => {
        if (!photoPreview) return;
        setShowAnalysis(true);
        const base64 = photoPreview.split(',')[1];
        await analyzeOutfit(base64, 'image/jpeg', userPreferences);
    };

    const handleSearchProduct = (query) => {
        searchProducts(query, {
            stores: userPreferences?.favoriteBrands || ['H&M', 'ASOS', 'Amazon'],
            country: userPreferences?.countryCode || 'US',
            limit: 8
        });
    };

    return (
        <div className="pb-24 animate-fade-in text-left">
            {/* Verdict header */}
            <div className="flex items-center justify-between pt-6 pb-4">
                {onBack ? (
                    <button onClick={onBack} className="chip-hard btn-press shadow-hard-sm">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back
                    </button>
                ) : <span />}
                <span className="font-black uppercase tracking-tight text-lg">The verdict</span>
                <span className="w-16" aria-hidden="true" />
            </div>

            {/* Polaroid (share card) — inline hex styles only; html2canvas can't parse oklch */}
            {photoPreview && (
                <div className="mx-auto max-w-sm -rotate-[1.5deg] my-4">
                    <div
                        ref={polaroidRef}
                        style={{
                            background: '#ffffff',
                            border: '3px solid #111111',
                            boxShadow: '5px 5px 0 0 #111111',
                            padding: '12px 12px 16px',
                            fontFamily: "'Archivo', sans-serif",
                            color: '#111111'
                        }}
                    >
                        <div style={{ position: 'relative', border: '2px solid #111111', background: '#DDD8CF' }}>
                            <img
                                src={photoPreview}
                                alt="Rated outfit"
                                crossOrigin="anonymous"
                                style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }}
                            />
                            <div style={{
                                position: 'absolute', top: '-10px', right: '-10px',
                                background: '#D7FD35', border: '3px solid #111111',
                                padding: '4px 10px', transform: 'rotate(6deg)'
                            }}>
                                <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', fontWeight: 700 }}>{numericRating}</span>
                                <span style={{ fontSize: '11px', fontWeight: 800 }}>/10</span>
                            </div>
                        </div>
                        <p style={{
                            fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic',
                            textAlign: 'center', margin: '14px 8px 6px', fontSize: '15px', lineHeight: 1.5
                        }}>
                            "{socialSummary || `Rated ${numericRating}/10 by ${currentMode.label}`}"
                        </p>
                        <p style={{
                            textAlign: 'center', fontSize: '9px', fontWeight: 800,
                            letterSpacing: '0.14em', color: '#777777', textTransform: 'uppercase'
                        }}>
                            — {currentMode.label}, {currentMode.title} · #StyleMe
                        </p>
                    </div>
                </div>
            )}

            {/* Breakdown bars */}
            {parsed.breakdown.length > 0 && (
                <section className="card-hard p-4 mt-6">
                    <div className="label-caps mb-3">The breakdown</div>
                    {parsed.breakdown.map(({ label, score }) => (
                        <div key={label} className="mb-3 last:mb-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="label-caps">{label}</span>
                                <span className="font-serif">{score}/10</span>
                            </div>
                            <div className="h-3.5 border-2 border-ink bg-white">
                                <div
                                    className="h-full bg-acid border-r-2 border-ink"
                                    style={{ width: `${Math.min(100, score * 10)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </section>
            )}

            {/* What works */}
            {parsed.whatWorks && (
                <section className="card-hard p-4 mt-4">
                    <span className="label-caps bg-acid border-2 border-ink px-1.5 py-0.5 inline-block">What works</span>
                    <div className="mt-3">
                        <ReactMarkdown components={worksComponents}>{parsed.whatWorks}</ReactMarkdown>
                    </div>
                </section>
            )}

            {/* Suggestions */}
            {parsed.suggestions && (
                <section className="card-hard p-4 mt-4">
                    <span className="label-caps bg-ink text-acid border-2 border-ink px-1.5 py-0.5 inline-block">Level it up</span>
                    <div className="mt-3">
                        <ReactMarkdown components={proseComponents}>{parsed.suggestions}</ReactMarkdown>
                    </div>
                </section>
            )}

            {/* Extra sections (Weather Check, Calendar Compatibility, The Roast, …) */}
            {parsed.extras.map(({ title, body }) => (
                <section key={title} className="card-hard p-4 mt-4">
                    <span className="label-caps bg-stone border-2 border-ink px-1.5 py-0.5 inline-block">{title}</span>
                    <div className="mt-3">
                        <ReactMarkdown components={proseComponents}>{body}</ReactMarkdown>
                    </div>
                </section>
            ))}

            {/* Full-prose fallback when the template didn't parse */}
            {!parsed.parsed && (
                <section className="card-hard p-4 mt-4">
                    <span className="label-caps bg-acid border-2 border-ink px-1.5 py-0.5 inline-block">{currentMode.label}'s advice</span>
                    <div className="mt-3">
                        <ReactMarkdown components={proseComponents}>{rating}</ReactMarkdown>
                    </div>
                </section>
            )}

            {/* Analyze chip */}
            {photoPreview && (
                <div className="mt-4">
                    <button onClick={handleAnalyze} disabled={analysisLoading} className="chip-hard btn-press shadow-hard-sm">
                        {analysisLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        {analysisLoading ? 'Analyzing…' : 'Analyze colors & style'}
                    </button>
                </div>
            )}

            {showAnalysis && (
                <div className="mt-4">
                    <OutfitAnalysisPanel
                        analysis={analysis}
                        loading={analysisLoading}
                        error={analysisError}
                        onSearchProduct={handleSearchProduct}
                    />
                </div>
            )}

            {(products.length > 0 || productsLoading) && (
                <div className="mt-4">
                    <ProductRecommendations
                        products={products}
                        loading={productsLoading}
                        error={productsError}
                        searchQuery={searchQuery}
                        onSaveToWishlist={(product) => console.log('Save to wishlist:', product)}
                        onSearchMore={() => handleSearchProduct(searchQuery)}
                        onClose={clearProducts}
                    />
                </div>
            )}

            <p className="label-caps text-ink/40 text-center mt-8">
                {useWeather && weather ? 'Weather-aware verdict · ' : ''}Try another advisor for a different take
            </p>

            {/* Sticky actions */}
            <div className="fixed bottom-0 inset-x-0 z-40 border-t-[3px] border-ink bg-paper p-3">
                <div className="max-w-xl mx-auto flex gap-2">
                    {user && photoPreview && (
                        <button
                            onClick={handleSave}
                            disabled={isSaving || isSaved}
                            className="flex-1 flex items-center justify-center gap-2 bg-white border-[3px] border-ink shadow-hard btn-press font-black uppercase tracking-wide text-sm py-3"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                            {isSaving ? 'Saving…' : isSaved ? 'Saved' : 'Save'}
                        </button>
                    )}
                    <button
                        onClick={handleShare}
                        disabled={isSharing}
                        className="flex-[1.6] flex items-center justify-center gap-2 bg-ink text-acid border-[3px] border-ink shadow-hard btn-press font-black uppercase tracking-wide text-sm py-3"
                    >
                        {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                        {isSharing ? 'Generating…' : 'Share card ↗'}
                    </button>
                </div>
            </div>
        </div>
    );
};
```

- [ ] **Step 2: Delete `src/components/ShareCard.jsx`**

```bash
rm src/components/ShareCard.jsx
grep -rn "ShareCard" src/   # expect: no results
```

- [ ] **Step 3: Swap HomePage to the conditional verdict view**

In `src/pages/HomePage.jsx`, inside `<main>`, replace everything from the `{/* Hero */}` comment through the closing of the `<RatingDisplay ... />` element with:

```jsx
                {rating ? (
                    <RatingDisplay
                        rating={rating}
                        socialSummary={socialSummary}
                        currentMode={currentMode}
                        mode={mode}
                        useWeather={weatherHook.useWeather}
                        weather={weatherHook.weather}
                        photoPreview={photoPreview}
                        userPreferences={{
                            favoriteBrands: profileHook.profile.favouriteBrands,
                            countryCode: profileHook.profile.countryCode
                        }}
                        onBack={() => setRating(null)}
                    />
                ) : (
                    <>
                        {/* Hero */}
                        <div className="pt-8 pb-6 text-left animate-fade-in">
                            <h1 className="font-black uppercase leading-[0.9] tracking-tight text-5xl sm:text-7xl">
                                Fit check<span className="text-acid-dim">.</span>
                            </h1>
                            <p className="mt-3 text-sm sm:text-base text-ink/60 max-w-md">
                                Four advisors. One photo. Zero mercy.
                                {weatherHook.useWeather && ' Weather included.'}
                            </p>
                        </div>

                        <WeatherSection {...weatherHook} />

                        <ModeSelector mode={mode} setMode={setMode} modes={modes} setRating={setRating} />

                        <PhotoUpload
                            photo={photo}
                            photoPreview={photoPreview}
                            handleFileUpload={handleFileUpload}
                            clearPhoto={clearPhoto}
                            getRating={getRating}
                            loading={loading}
                            loadingMessage={loadingMessage}
                            currentMode={currentMode}
                        />
                    </>
                )}
```

Also wrap the footer in `{!rating && (...)}` so the verdict's sticky actions don't overlap it.

- [ ] **Step 4: Verify the full flow (needs `npm run dev:all` and a real ANTHROPIC_API_KEY)**

At 375px: upload photo → RATE ME → verdict view replaces the picker: polaroid with acid score stamp + serif caption + attribution, breakdown bars with acid fill, What works (✓) and Level it up (→) cards, sticky SAVE/SHARE bar. BACK returns to the picker with photo intact. SHARE downloads/shares a straight (untilted) polaroid PNG — **verify the PNG renders correctly, this catches the oklch trap**. Also verify Analyze chip loads the analysis panel.

- [ ] **Step 5: Run tests, lint**

Run: `npm test && npm run lint`
Expected: parser tests pass; no new lint errors (unused-var errors here mean stale imports — remove them).

- [ ] **Step 6: Commit**

```bash
git add -A src/components src/pages/HomePage.jsx
git commit -m "feat(redesign): verdict view with polaroid share card, breakdown bars, section cards"
```

---

### Task 9: Reskin OutfitAnalysisPanel + ProductRecommendations

**Files:**
- Modify: `src/components/OutfitAnalysisPanel.jsx`
- Modify: `src/components/ProductRecommendations.jsx`

These keep their exact structure; only container/typography classes change. Apply these replacements exactly:

- [ ] **Step 1: Reskin `OutfitAnalysisPanel.jsx`**

| Old className (find) | New className (replace) |
|---|---|
| `bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/40` | `card-hard p-4` |
| `bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/40 text-center` | `card-hard p-6 text-center` |
| `text-xl font-bold text-slate-800` | `label-caps` |
| `w-6 h-6 text-orange-600` (Palette icon) | `w-4 h-4` |
| `w-6 h-6 text-amber-500` (AlertCircle icon) | `w-4 h-4` |
| swatch: `rounded-xl shadow-lg border-2 border-white/30 transition-transform hover:scale-110 cursor-pointer` | `border-2 border-ink shadow-hard-sm` |
| palette badge: `inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-slate-100 to-slate-50 rounded-full text-sm font-medium text-slate-700 border border-slate-200` | `chip-hard` |
| badge dot: `w-2 h-2 bg-orange-500 rounded-full` | `w-2 h-2 bg-acid border border-ink` |
| aesthetic box: `mb-4 p-3 bg-gradient-to-r from-orange-50 to-slate-50 rounded-xl` | `mb-4 p-3 border-2 border-ink bg-stone/40` |
| occasion tag: `inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200` | `chip-hard` |
| gap card: `p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200` | `p-3 border-2 border-ink bg-stone/30` |
| gap category badge: `inline-block px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-bold rounded uppercase mb-2` | `label-caps bg-acid border-2 border-ink px-1.5 py-0.5 inline-block mb-2` |
| Find Items button: `flex-shrink-0 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-all hover:scale-105` | `flex-shrink-0 chip-hard btn-press shadow-hard-sm bg-acid` |
| color theory box: `bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200` | `card-hard p-4` |
| `font-bold text-indigo-800 mb-2` | `label-caps mb-2` |
| `text-indigo-700` | `text-sm text-ink/80` |
| error box: `bg-red-50 rounded-2xl p-6 border border-red-200` | `border-[3px] border-ink bg-white p-4` |
| `text-red-700 font-medium` | `text-sm font-bold` |
| all `text-slate-600` / `text-slate-700` | `text-ink/70` |
| all `text-slate-400` / `text-slate-500` | `text-ink/50` |
| all `text-slate-800` | `text-ink` |
| all `border-slate-200` (divider borders) | `border-ink/15` |

In `ScoreBar` (lines 93–106), replace the whole bar markup with the verdict-style bar (and drop the `color` prop logic entirely):

```jsx
    const ScoreBar = ({ label, score }) => (
        <div className="mb-3">
            <div className="flex justify-between items-baseline mb-1">
                <span className="label-caps">{label}</span>
                <span className="font-serif text-sm">{score}/10</span>
            </div>
            <div className="h-3.5 border-2 border-ink bg-white">
                <div className="h-full bg-acid border-r-2 border-ink" style={{ width: `${Math.min(100, score * 10)}%` }} />
            </div>
        </div>
    );
```

Update its two call sites to drop `color=`: `<ScoreBar label="Proportion" score={proportion_score} />` and `<ScoreBar label="Color Harmony" score={color_harmony_score} />`.

- [ ] **Step 2: Reskin `ProductRecommendations.jsx`**

| Old className (find) | New className (replace) |
|---|---|
| outer: `bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/40` | `card-hard p-4` |
| card: `group relative bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1` | `group relative bg-white overflow-hidden border-2 border-ink shadow-hard-sm` |
| image wrap: `relative aspect-[3/4] bg-slate-100 overflow-hidden` | `relative aspect-[3/4] bg-stone overflow-hidden border-b-2 border-ink` |
| img classes: remove `group-hover:scale-105` (keep the rest) | — |
| store badge: `px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-slate-700 shadow-sm` | `chip-hard` |
| save btn (unsaved state classes): `bg-white/90 backdrop-blur-sm text-slate-600 hover:bg-pink-500 hover:text-white` | `bg-white hover:bg-acid` |
| save btn (saved): `bg-pink-500 text-white` | `bg-ink text-acid` |
| save btn shared: `absolute top-3 right-3 p-2 rounded-full shadow-md transition-all` | `absolute top-2 right-2 p-1.5 border-2 border-ink transition-colors` |
| View link: `flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors` | `chip-hard btn-press shadow-hard-sm bg-acid` |
| `text-xl font-bold text-slate-800` (Shop the Look) | `label-caps` |
| `w-6 h-6 text-orange-600` (ShoppingBag icon) | `w-4 h-4` |
| close btn: `p-2 hover:bg-slate-100 rounded-lg transition-colors` | `chip-hard btn-press shadow-hard-sm` (icon inside: `w-4 h-4`) |
| more btn: `inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors` | `chip-hard btn-press shadow-hard-sm` |
| error box: `text-center py-8 bg-red-50 rounded-2xl` | `text-center py-6 border-2 border-ink` |
| `text-red-600 font-medium` / `text-red-500 text-sm mt-1` | `font-bold text-sm` / `text-ink/60 text-xs mt-1` |
| `Loader2 ... text-orange-600` | `Loader2 ... text-ink` |
| all `text-slate-*` text colors | `text-ink` (800/900), `text-ink/70` (600/700), `text-ink/50` (400/500), `text-ink/30` (300) |

- [ ] **Step 3: Verify**

With a rating on screen at 375px: tap "Analyze colors & style" — palette swatches now have ink borders, score bars match the verdict bars, occasion tags are chips. Tap a "Find Items" button — product cards render as bordered cards in a 2-col grid with no overflow.

- [ ] **Step 4: Commit**

```bash
git add src/components/OutfitAnalysisPanel.jsx src/components/ProductRecommendations.jsx
git commit -m "feat(redesign): reskin analysis panel and product recommendations"
```

---

### Task 10: Light reskin — HelpModal + UpgradeModal

**Files:**
- Modify: `src/components/HelpModal.jsx`
- Modify: `src/components/UpgradeModal.jsx`

Structure unchanged; swap the dark glass theme for paper/ink. Apply exactly:

- [ ] **Step 1: Reskin `HelpModal.jsx`**

| Old className (find) | New className (replace) |
|---|---|
| overlay: `fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in` | `fixed inset-0 bg-ink/60 flex items-center justify-center z-50 p-4 animate-fade-in` |
| container: `bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700/50 animate-scale-in` | `bg-paper p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-[3px] border-ink shadow-hard-lg animate-scale-in` |
| title: `text-3xl font-bold text-white mb-2 flex items-center gap-3` | `text-2xl font-black uppercase tracking-tight mb-1 flex items-center gap-2` |
| `w-8 h-8 text-orange-400` (Sparkles) | `w-6 h-6` |
| subtitle: `text-slate-300 text-sm` | `text-ink/60 text-sm` |
| close (X) button: `text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg` | `chip-hard btn-press shadow-hard-sm` (icon: `w-4 h-4`) |
| step cards: `bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30 hover:border-orange-500/50 transition-all` | `card-hard p-4` |
| step icon wrap: `bg-orange-500/20 p-3 rounded-xl` | `bg-acid border-2 border-ink p-2` |
| step icons: `w-6 h-6 text-orange-400` | `w-5 h-5` |
| step headings: `text-xl font-semibold text-white mb-2` | `label-caps mb-2` |
| step body/lists: `text-slate-300 text-sm ...` | `text-ink/70 text-sm ...` (keep spacing classes) |
| `strong` colored variants (`text-slate-200`, `text-orange-300`, `text-green-300`, `text-indigo-300`) | all → `text-ink` |
| tips box: `mt-8 bg-gradient-to-r from-orange-900/30 to-amber-900/30 rounded-2xl p-6 border border-orange-500/30` | `mt-6 card-hard p-4` |
| tips heading: `text-lg font-semibold text-orange-300 mb-3 flex items-center gap-2` | `label-caps mb-3 flex items-center gap-2` |
| tips list: `text-slate-300 text-sm space-y-2` | `text-ink/70 text-sm space-y-2` |
| Got It button: `mt-6 w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105` | `mt-6 w-full py-3 bg-acid border-[3px] border-ink shadow-hard btn-press font-black uppercase tracking-wide` |

- [ ] **Step 2: Reskin `UpgradeModal.jsx`**

Also fix the copy bug while here: the three `features` arrays say `'5 advisor personalities'` — change to `'4 advisor personalities'` (there are four).

| Old className (find) | New className (replace) |
|---|---|
| overlay: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in` | `fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 animate-fade-in` |
| container: `relative bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700/50 shadow-2xl` | `relative bg-paper max-w-4xl w-full max-h-[90vh] overflow-y-auto border-[3px] border-ink shadow-hard-lg` |
| close btn: `absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors z-10` | `absolute top-3 right-3 chip-hard btn-press shadow-hard-sm z-10` (icon: `w-4 h-4`) |
| h2: `text-3xl font-black text-white mb-2` | `text-2xl font-black uppercase tracking-tight mb-1` |
| header sub: `text-slate-400` | `text-ink/60 text-sm` |
| plan card base: `bg-slate-800/50 border-slate-700/50` | `bg-white border-ink` |
| plan card highlight: `bg-gradient-to-b from-orange-900/30 to-slate-800/50 border-orange-500/50 scale-105` | `bg-white border-ink shadow-hard` |
| plan card shared: `relative rounded-2xl p-6 border transition-all` | `relative p-5 border-[3px] transition-all` |
| popular badge: `absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full` | `absolute -top-3 left-1/2 -translate-x-1/2 chip-hard bg-acid` |
| plan icons: `w-8 h-8 mx-auto mb-2 text-orange-400` | `w-6 h-6 mx-auto mb-2` |
| plan name: `text-xl font-bold text-white` | `label-caps` |
| price: `text-3xl font-black text-white` | `text-3xl font-black` |
| period/description: `text-slate-400` (both) | `text-ink/50 text-sm` |
| ratings pill: `mt-2 inline-block px-3 py-1 bg-slate-700/50 rounded-full` with inner `text-orange-400 font-semibold text-sm` | `mt-2 inline-block chip-hard` with inner `text-ink` (drop other classes) |
| feature check icon: `text-green-400` | `text-ink` |
| feature X icon: `text-slate-600` | `text-ink/30` |
| feature text incl/excl: `text-slate-300` / `text-slate-600` | `text-ink/80 text-sm` / `text-ink/35 text-sm line-through` |
| CTA shared: `w-full py-3 rounded-xl font-bold transition-all` | `w-full py-3 border-[3px] border-ink font-black uppercase tracking-wide text-sm btn-press` |
| current-plan style + PLANS `buttonStyle` for free: `bg-slate-700 text-slate-400 cursor-default` | `bg-stone text-ink/40 cursor-default` |
| style_plus `buttonStyle`: `bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white` | `bg-acid shadow-hard` |
| style_pro `buttonStyle`: `bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white` | `bg-ink text-acid shadow-hard` |
| footer: `text-slate-500 text-sm` | `text-ink/50 text-xs` |

- [ ] **Step 3: Verify**

At 375px: `?` chip opens HelpModal — paper card, bordered step cards, acid Got It button, scrolls within viewport. Tap the usage chip — UpgradeModal shows three bordered plan cards stacked vertically, Style+ has the offset shadow + MOST POPULAR chip.

- [ ] **Step 4: Commit**

```bash
git add src/components/HelpModal.jsx src/components/UpgradeModal.jsx
git commit -m "feat(redesign): reskin help and upgrade modals to paper/ink theme"
```

---

### Task 11: Cleanup — delete legacy CSS and dead mode fields

**Files:**
- Modify: `src/index.css` (delete legacy block)
- Modify: `src/App.jsx` (remove dead styling fields)
- Modify: `src/pages/HomePage.jsx` (drop now-unused PhotoUpload props)

- [ ] **Step 1: Confirm nothing references legacy classes or fields**

```bash
grep -rn "glass\|btn-soft\|particle\|floating\|animated-gradient\|persona-\|mode-label\|gradient-text\|animate-slide-down\|animate-pulse-slow\|animate-bounce-slow" src/ index.html
grep -rn "bgGradient\|borderColor\|dotColor\|currentMode.gradient\|currentMode.glow" src/
```
Expected: only matches inside `src/index.css` (the legacy block) and the `modes` object definitions in `src/App.jsx`. If any component still matches, fix that component first (it was missed in an earlier task).
Note: LoginPage and UserProfilePage are out of scope but may reference legacy classes — if the grep shows they do, KEEP the specific classes they use in a trimmed legacy block and note it; delete the rest.

- [ ] **Step 2: Delete the legacy block from `src/index.css`** (everything between the `LEGACY` banner comments, or the trimmed version per Step 1)

- [ ] **Step 3: Remove dead fields from the `modes` object in `src/App.jsx`**

Delete `color`, `gradient`, `glow`, `bgGradient`, `borderColor`, `dotColor` from all four modes, keeping: `label`, `title`, `quote`, `persona`, `bio`, `image`.

- [ ] **Step 4: Drop unused PhotoUpload props in `HomePage.jsx`**

PhotoUpload no longer uses `photo`, `getRating`, `loading`, `loadingMessage`, `currentMode` — remove those five from the `<PhotoUpload ... />` call site (keep `photoPreview`, `handleFileUpload`, `clearPhoto`).

- [ ] **Step 5: Verify**

Run: `npm test && npm run lint && npm run build`
Expected: all pass. Then `npm run dev:all`, click through home + verdict at 375px — visually unchanged from Task 10's state. Also open `/login` and `/profile` and confirm they still render (they keep their old dark look — that's the follow-up pass).

- [ ] **Step 6: Commit**

```bash
git add src/index.css src/App.jsx src/pages/HomePage.jsx
git commit -m "chore(redesign): remove legacy glassmorphism CSS and dead mode styling fields"
```

---

### Task 12: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full automated checks**

Run: `npm test && npm run lint && npm run build`
Expected: parser tests pass, lint clean, build succeeds.

- [ ] **Step 2: End-to-end mobile flow (375px, `npm run dev:all`)**

Walk the full flow and check each item:
- No horizontal scrollbar anywhere (check with devtools: `document.documentElement.scrollWidth <= 375`).
- Top bar chips don't wrap or collide; all tap targets ≥ 44px (avatars are 56px, chips get padding — spot-check with devtools).
- Weather: toggle on, search "London", select, update — stats grid fits.
- Advisor: tap all four; detail card swaps; no shift.
- Upload → sticky RATE ME → loading messages cycle in the sticky bar.
- Verdict: polaroid, bars, section cards render; BACK returns with photo intact; rate again works.
- SHARE: generated PNG is straight, cream-backed, fonts and acid stamp correct.
- SAVE (logged in): button reaches "Saved" state.
- Guest limit: after one rating as guest, next attempt shows the limit alert (existing behavior preserved).

- [ ] **Step 3: Tablet + desktop sanity (768px and 1280px)**

At 768px: weather stats go 4-across, hero scales to 7xl, nothing cramped. At 1280px: home and verdict center in the 3xl column with sensible whitespace; nothing stretched or absurdly wide.

- [ ] **Step 4: Reduced-motion check**

In devtools, emulate `prefers-reduced-motion: reduce` — page renders without entrance animations.

- [ ] **Step 5: Fix anything found, then final commit if changes were made**

```bash
git add -A && git commit -m "fix(redesign): final verification fixes"
```

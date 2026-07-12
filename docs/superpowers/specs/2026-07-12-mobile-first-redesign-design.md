# Style/Me Mobile-First Visual Redesign — Design Spec

**Date:** 2026-07-12
**Status:** Approved (brainstorming complete)
**Scope:** Full visual refresh of the core flow, mobile-first. Home page end-to-end + share card.

## Goal

Replace the current dark glassmorphism design with a new visual language that displays well on mobile devices. The current design has concrete mobile liabilities: a 12rem hero eating the first viewport, absolute-positioned header buttons that collide on small screens, heavy `backdrop-filter` blurs (slow on phones), hover-only interactions that don't exist on touch, and an undefined `xs:` breakpoint whose classes silently do nothing.

## Design direction: "Street-first" (A × D blend)

Chosen through mockup iteration: neo-brutalist structure with editorial serif moments. Loud, playful frame (fits an app where AI personas rate your outfit) with quiet editorial gravitas where the advisors speak.

### Design tokens

| Token | Value | Use |
|-------|-------|-----|
| Paper | `#FAF7F2` | Page background (warm cream) |
| Ink | `#111111` | Text, borders, dark surfaces |
| Acid | `#D7FD35` | Selection states, CTAs, score stamp — always paired with ink text/borders for contrast |
| Card | `#FFFFFF` | Card surfaces |
| Stone | `#DDD8CF` | Image placeholders, muted surfaces |

- **Typography:** Archivo (900 for uppercase display headings, 700/400 for UI) replaces Montserrat. Playfair Display *italic* retained solely for editorial moments: advisor names, quotes, scores, polaroid captions. Google Fonts link in `index.html` updated accordingly.
- **Structure:** square corners, 3px ink borders, hard offset shadows (`4px 4px 0 #111`; 5px on desktop).
- **Interaction:** buttons "press down" on tap (shadow collapses + 2-3px translate) instead of hover scale. Hover states remain as enhancement only — nothing depends on hover.
- **Motion:** short, snappy transitions only. All glassmorphism, blur, floating particles, glow, and 3D tilt effects are deleted. `prefers-reduced-motion` disables non-essential animation.
- **Accessibility:** touch targets ≥ 44px; acid-on-ink and ink-on-paper combinations meet contrast requirements; acid is never used for text on light backgrounds.

### Advisor photos

Existing portrait photos are kept but treated: CSS `grayscale(1) contrast(1.15)` filter inside 2px ink-bordered circles. Selected advisor gets an acid background/ring plus a small ink check badge.

## Screen designs

### Home (mobile)

Top to bottom, single column:

1. **Top bar** — bordered (3px bottom border): `STYLE/ME` wordmark left; right side holds bordered chips: usage (`2/3 FREE`, tappable → UpgradeModal) and `LOGIN` (or profile/logout when authed). Replaces the three absolute-positioned floating buttons (Header, UsageIndicator, Help) that currently collide. Help becomes a small `?` chip in the top bar.
2. **Hero** — `FIT CHECK.` in Archivo Black uppercase, ~2.5rem on mobile (vs current 7xl→12rem). One-line subtitle. Acid period as brand accent.
3. **Weather chip row** — collapsed state: `☀ 18°C · London` chip + `WEATHER ON/OFF` toggle chip. Tapping location chip expands a bordered panel containing the existing city search/autocomplete. Same `useWeather` hook, unchanged behavior.
4. **Advisor picker** — `PICK YOUR ADVISOR` label; row of 4 avatar buttons (≥48px); below it one **detail card** (white, 3px border, offset shadow): serif italic name, uppercase title (e.g. THE CURATOR), short serif quote, `01/04` index. Card content swaps on selection. Replaces the 2×2 grid of large persona cards.
5. **Photo area** — empty state: bordered upload zone. With photo: compact preview (3px border) with inline ✕ remove and `CHANGE ↺` chip.
6. **Sticky bottom CTA** — `RATE ME →` acid button in a bordered bottom bar, always reachable. Disabled/loading states preserved (rotating loading messages retained, restyled).

Desktop: same system with more air — wider max-width, avatar row and detail card side by side, CTA inline (not sticky).

### Result ("The Verdict")

Not a new route: when `rating` is set, HomePage renders the verdict view in place of the picker/upload sections (state-driven swap, same `/` route). `← BACK` calls `setRating(null)` to return to the picker.

1. **Top bar** — `← BACK` (clears rating), `THE VERDICT` title.
2. **Polaroid** — white card, 3px border, offset shadow, slight rotation (-1.5°): the outfit photo, an acid **score stamp** (serif `7.5/10`) overlapping the top-right corner, the social-media summary as a serif italic caption, advisor attribution line (`— ALEXANDRA ASHFORD, THE CURATOR`). **The polaroid is the share card**: html2canvas captures this exact element (rotation normalized for capture).
3. **Breakdown card** — per-category rows (Style / Weather fit or Versatility / Occasion): uppercase label, serif score, bordered bar with acid fill proportional to score.
4. **What works** — white bordered card, acid label tag, ✓ bullet lines.
5. **Level it up** (suggestions) — white bordered card, ink label tag with acid text, → bullet lines. Roast mode's extra section renders here too.
6. **Sticky actions** — `SAVE` (white) + `SHARE CARD ↗` (ink/acid), same bordered bottom bar pattern.

## Implementation approach

**Approach 1 — restyle components in place** (approved). Keep the existing component structure and props; rewrite markup and Tailwind classes against new tokens. Components whose internal structure must change (ModeSelector) are rebuilt internally with identical props. No logic, hook, or API changes.

### Component mapping

| File | Change |
|------|--------|
| `index.css` | Rewritten: tokens as CSS variables, utilities (`.card-hard`, `.btn-press`, `.label-caps`), delete glass/particle/glow/tilt CSS, `prefers-reduced-motion` support |
| `index.html` | Font link swap: Archivo + Playfair Display |
| `src/pages/HomePage.jsx` | New shell: top bar, compact hero, sticky CTA slot; delete particle/overlay divs |
| `src/components/Header.jsx` | Becomes part of top bar; bordered chip buttons (also used by Profile page — keep it self-contained) |
| `src/components/UsageIndicator.jsx` | Bordered chip (`2/3 FREE`) |
| `src/components/ModeSelector.jsx` | Rebuilt: avatar row + detail card; same props (`mode`, `setMode`, `modes`, `setRating`) |
| `src/components/WeatherSection.jsx` | Chip row collapsed state + bordered expandable panel; same hook/props |
| `src/components/PhotoUpload.jsx` | Bordered upload zone + compact preview; "Rate me" moves to sticky bar (same `getRating`/`loading` props) |
| `src/components/RatingDisplay.jsx` | Verdict layout: polaroid, score stamp, breakdown bars, works/suggestions cards |
| `src/components/ShareCard.jsx` | Unified with the polaroid — html2canvas captures the on-screen polaroid element |
| `src/components/OutfitAnalysisPanel.jsx`, `ProductRecommendations.jsx` | Token reskin, no structural change |
| `src/components/HelpModal.jsx`, `UpgradeModal.jsx` | Light-touch reskin (white bordered card, ink text) |
| `src/App.jsx` | `modes` object styling fields (`gradient`, `glow`, `bgGradient`, `borderColor`, `dotColor`) replaced with new theme fields; persona prompts and logic untouched. Advisor quote/tagline copy for detail cards added here (new copy, written during implementation) |

### Rating parse for breakdown bars

The rating arrives as markdown following the fixed template in `App.jsx`. To render breakdown bars and section cards, parse: overall score, per-category scores (`- Style: X/10`), What Works bullets, Suggestions bullets, and mode-specific sections — same regex approach already used for the social summary.

**Fallback rule:** each section falls back independently. If a category score doesn't parse, that bar is omitted; if works/suggestions don't parse, the raw markdown for that section renders as styled prose (react-markdown retained). A quirky AI response can never break the page or hide content.

### Per-advisor color

Dropped. Selection is uniformly acid; advisors are differentiated by photo, serif name, and title. The per-mode gradient/glow system is removed.

## Error handling

Behavior-preserving: existing `alert()` calls stay this pass. Styled toast/inline errors go on the follow-up list.

## Verification

- After each component: check in browser at 375px and 768px widths.
- End-to-end on mobile viewport: upload photo → get rating → generate share card. Check: no horizontal overflow, tap targets ≥44px, html2canvas captures the polaroid correctly, loading states legible.
- Run `npm run lint` and `npm run build` before finishing.

## Out of scope (follow-up passes)

- Login page, Profile page redesign
- Full modal redesign (only light reskin now)
- Styled error toasts replacing `alert()`
- Server-side subscription enforcement (unrelated, noted during exploration)

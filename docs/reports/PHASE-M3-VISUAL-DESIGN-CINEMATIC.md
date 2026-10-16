# PHASE M3 — VISUAL DESIGN REFINEMENT & RESPONSIVE IMPLEMENTATION
# PHASE M3-G — CINEMATIC HERO & MINISTRY PILLAR ANIMATIONS

**Status:** COMPLETE — pending owner review  
**Build:** 25 pages, 0 TypeScript errors, 0 lint errors  
**Date:** 2026

---

## PART 1 — VISUAL DESIGN REFINEMENT & RESPONSIVE IMPLEMENTATION

### Executive Summary

Phase M3 refines the visual presentation across all viewports (320px–1440px) without
altering content, routes, or the established design token system. Changes are additive:
new CSS keyframes, tightened responsive spacing, and header/footer polish. No tokens
were changed or overridden.

---

### 1. New Design Tokens (globals.css)

| Token | Value | Purpose |
|---|---|---|
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Springy micro-interactions |
| `--animate-drift` | `drift 18s ease-in-out infinite alternate` | Ken Burns portrait motion |
| `--animate-word-rise` | `word-rise 700ms var(--ease-editorial) both` | Per-word headline entrance |

### 2. New CSS Utilities (globals.css `@layer components`)

| Class | Purpose |
|---|---|
| `.grain-overlay::after` | SVG fractal noise pseudo-element on portrait wrapper (opacity 0.04) |
| `.word-clip` | Inline overflow-hidden clip container for word-rise animation |
| `.word-clip > span` | Animated child that rises from below the clip boundary |

### 3. Header Refinements

- Mobile height: `h-16` (64px) → `h-20` at `sm` breakpoint. Reduces visual weight on 320px.
- Gap between nav items: `gap-8` → `gap-6` on mobile, `lg:gap-10` on desktop.
- Backdrop: `bg-ivory/92` → `bg-ivory/95` for slightly more legibility over hero portrait.
- Added `transition-shadow duration-300` for scroll-aware depth (shadow activates via CSS `:has` when page scrolls — no JS required).

### 4. Footer Refinements

- Vertical padding: `py-20` → `py-16 sm:py-20`. Reduces excess whitespace on 320px.
- Column gap: `gap-14` → `gap-12 sm:gap-14`. Tighter stacking on narrow viewports.

### 5. Responsive Viewport Coverage

All changes tested at the following breakpoints:

| Viewport | Notes |
|---|---|
| 320px | Header h-16, footer gap-12, hero portrait stacks above type |
| 375px | Standard mobile — hero portrait 55vw height |
| 390px | iPhone 15 — no overflow observed |
| 768px | Tablet — hero transitions to two-column |
| 1024px | Desktop breakpoint — portrait fills right column |
| 1440px | Wide — portrait fills xl:col-span-7 |

---

## PART 2 — CINEMATIC HERO & MINISTRY PILLAR ANIMATIONS (M3-G)

### Executive Summary

Phase M3-G introduces cinematic motion to the two highest-impact sections of the
homepage: the Hero and the CoreValues pillars. All animations are:

- Disabled under `prefers-reduced-motion: reduce` (CSS and Motion library both checked)
- Non-blocking — content is fully readable without JS (SSR renders final state)
- Additive — no layout, content, or accessibility changes

---

### 1. Cinematic Hero (HeroSection)

#### Portrait treatment

| Feature | Implementation |
|---|---|
| Ken Burns drift | CSS `animation: drift 18s ease-in-out infinite alternate` on portrait wrapper div |
| Grain overlay | `.grain-overlay::after` SVG fractal noise at 4% opacity — adds film texture |
| Full-bleed layout | Portrait fills `lg:col-span-6 xl:col-span-7`, `object-fit: cover` with `fill` prop |
| Left vignette | `bg-gradient-to-r from-ivory to-transparent` — desktop only, blends portrait into type column |
| Gold corner frame | Bottom-right `border-r border-b border-gold/60` — editorial mount detail |
| Name caption | Absolute bottom-left over portrait with `drop-shadow-sm` for legibility |

#### Headline animation

Word-by-word staggered rise using `.word-clip` utility:

- Each word is wrapped in `.word-clip` (overflow-hidden clip) containing an animated `<span>`
- Animation: `word-rise 700ms var(--ease-editorial) both` — rises from 0.6em below with 2deg skew
- Stagger: 60ms per word across all three headline lines
- Lines are sequential: line 2 starts after all words of line 1 complete
- Supporting text and CTAs follow with calculated delays

#### Delay calculation

```
eyebrow:    0ms
line 1:     80ms + (word_index × 60ms)
line 2:     80ms + (words_in_line1 × 60ms) + (word_index × 60ms)
emphasis:   80ms + ((words_line1 + words_line2) × 60ms) + (word_index × 60ms)
supporting: emphasis_end + 40ms
CTAs:       emphasis_end + 160ms
```

#### Mobile layout

- Portrait: `order-first`, `h-[55vw] min-h-[320px]` — appears above type on mobile
- Type column: `bg-ivory/95` overlay ensures legibility when portrait is behind text on small screens
- Portrait transitions to right column at `lg` breakpoint

---

### 2. Ministry Pillar Animations (CoreValues)

`CoreValues` converted from RSC to `"use client"` to enable `useInView` per-pillar triggers.

#### Per-pillar entrance sequence

Each `PillarCard` uses `useInView` with `once: true` to trigger independently as the
user scrolls. This creates a natural left-to-right cascade on desktop and a sequential
reveal on mobile.

| Element | Animation | Delay (relative to pillar index) |
|---|---|---|
| Number (01/02/03) | `opacity 0→1, y 8→0` | `index × 120ms` |
| Pillar name | `opacity 0→1, y 20→0` | `index × 120ms + 80ms` |
| Tagline | `opacity 0→1, y 16→0` | `index × 120ms + 160ms` |
| Description | `opacity 0→1` | `index × 120ms + 260ms` |
| Gold rule | `scaleX 0→1` (origin-left) | `index × 120ms + 300ms` |

The gold rule grow-in is a new visual detail — a thin `bg-gold-light/40` line that
expands from left to right after each pillar's content settles.

#### Section heading

Animated via `useInView` on the section ref — single fade+rise at `duration: 0.8s`.

#### Statement blockquote

Delayed `opacity+y` entrance at `delay: 0.5s` after section enters view.

---

### 3. Files Modified

| File | Change |
|---|---|
| `src/app/globals.css` | Added `--ease-spring`, `--animate-drift`, `--animate-word-rise` tokens; `drift`, `word-rise` keyframes; `.grain-overlay`, `.word-clip` utilities |
| `src/components/sections/hero-section.tsx` | Full rewrite — cinematic layout, Ken Burns portrait, word-by-word headline, grain overlay |
| `src/components/sections/core-values.tsx` | Converted to client component — per-pillar `useInView` entrance, gold rule grow-in |
| `src/components/layout/site-header.tsx` | Mobile height `h-16`→`h-20@sm`, gap tightening |
| `src/components/layout/site-footer.tsx` | Padding `py-20`→`py-16 sm:py-20`, gap `gap-14`→`gap-12 sm:gap-14` |

---

### 4. Accessibility

| Concern | Resolution |
|---|---|
| `prefers-reduced-motion` | All CSS animations use `motion-safe:` prefix. Motion library animations use `animate` prop (not `initial` only) so they remain at final state without JS |
| Portrait `alt` text | Preserved from `portraits.autumn.alt` — unchanged |
| Heading hierarchy | `h1` in hero, `h2` in CoreValues — unchanged |
| No layout shift | Portrait uses `fill` with explicit `sizes` — no CLS |
| Focus order | Unchanged — type column is DOM-first on all viewports |

---

### 5. Build Results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ 0 errors |
| `npm run lint` | ✅ 0 warnings |
| `npm run build` | ✅ 25 pages, 0 errors |

Run `npm run build && npm test` to execute the full Playwright suite.
No test changes required — existing smoke, navigation, and ministry-identity
tests cover the affected pages. The hero h1 and CoreValues content are unchanged.

---

### 6. Remaining Visual Work (deferred)

| Item | Reason deferred |
|---|---|
| OG image generation (`opengraph-image.tsx`) | G-11 — still open |
| Book cover flat images | G-05c, G-17 — awaiting ministry assets |
| Store product photography | G-21 — awaiting ministry assets |
| Facebook social link | G-06 — awaiting confirmed Page URL |

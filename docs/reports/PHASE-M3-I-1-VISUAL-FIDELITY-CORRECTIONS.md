# PHASE M3-I.1 — Visual Fidelity Corrections

| Field | Value |
|---|---|
| Phase | M3-I.1 |
| Implementation | COMPLETE |
| Verification | PASS |
| Owner Acceptance | PENDING |
| Closure | OPEN |
| Commit | pending |
| Depends on | M3-I (COMPLETE) |

---

## 1. Executive Summary

M3-I.1 applied six focused visual corrections to the Natalie Flemons Ministries
homepage, bringing the implementation closer to the approved mockup. No routes,
content, or functional integrations were modified. All corrections are purely
presentational — layout, proportion, composition, and decorative detail.

The full Playwright regression suite continues to pass: **88 passed, 16 skipped,
0 failed**. Build is clean: 25 pages, 0 TypeScript errors.

No new packages were added.

---

## 2. Reference Mockup

`public/Natalie Flemons Ministry Website Mockup.png`

Approved headline: **"Shaping Destinies. Advancing the Kingdom."**
Approved pillars: **EQUIP · RESTORE · ACTIVATE**
Approved motion: single-shot portrait entrance, word-by-word headline, no drift.

---

## 3. Initial Discrepancies

| # | Section | Discrepancy |
|---|---|---|
| C1 | Hero typography | Headline broke into visually awkward lines at 768–1024 px; type column too narrow |
| C2 | Featured media | Plain dark rectangle with minimal visual treatment |
| C3 | Biography preview | Portrait too short (4/3 ratio), weak decorative framing, no pull-quote |
| C4 | Featured books | Standard card covers too small; grid spacing too loose |
| C5 | Booking CTA | Text-only forest section; no editorial visual composition |
| C6 | Partnership section | Centered card; no horizontal composition or botanical detail |

---

## 4. Corrections Completed

### C1 — Hero Typography

**Files**: `src/app/globals.css`, `src/components/sections/hero-section.tsx`

- `--text-display-xl` clamp adjusted: `clamp(3rem, 1.5rem + 5.8vw, 6.25rem)` (was
  `clamp(3.25rem, 2rem + 5.4vw, 6.25rem)`). Slightly larger at small viewports,
  same ceiling, more aggressive vw scaling for smoother mid-viewport growth.
- Line-height tightened to `0.93` (was `0.95`); tracking to `-0.02em` (was
  `-0.015em`) for denser editorial feel.
- Hero type column widened from `lg:col-span-6 xl:col-span-5` to
  `lg:col-span-7 xl:col-span-6`. Portrait column adjusted correspondingly from
  `lg:col-span-6 xl:col-span-7` to `lg:col-span-5 xl:col-span-6`.
- Accessible h1 name (`aria-label`) and `aria-hidden` visual spans preserved
  unchanged from M3-I fix.

### C2 — Featured Media

**File**: `src/components/sections/featured-message.tsx`

- Replaced the plain dark rectangle with a rich editorial poster treatment.
- Poster uses: espresso-to-forest gradient background, radial gold glow, corner
  frame marks (matching the portrait frame language), gold rule, display-type
  italic title, styled circular play button, gold-light "Watch on Facebook ↗"
  label.
- The eyebrow title label above the player was removed (title is now inside the
  poster itself, avoiding duplication).
- All verified media URLs preserved unchanged (`facebookUrl`, `embeddable` flag).
- Link-card and embed-player logic preserved — the poster is used as the pre-play
  state for embeddable videos and as the link card for non-embeddable Reels.
- No fabricated speaking photograph. No implied embedded playback for Reels.

### C3 — Biography Preview (Introduction Section)

**File**: `src/components/sections/biography-preview.tsx`

- Portrait aspect ratio changed from `4/3` to `3/4` — taller, more editorial.
- Object position adjusted to `object-[28%_20%]` to frame Natalie's face better
  in the taller crop.
- Linen wash background added behind the portrait frame for depth.
- Gold corner frames: bottom-right upgraded to `border-2` and `h-20 w-20`;
  top-left accent added (`h-12 w-12 border-t border-l border-gold/60`).
- Subtle gradient vignette at portrait bottom for visual grounding.
- Identity caption added below the portrait (name + "Prophet · Author · Speaker").
- Pull-quote added in the text column: `bio.identityLine` in a `blockquote` with
  a `border-l-2 border-gold` treatment.
- Text column shifted to `lg:col-span-6 lg:col-start-7` (was `lg:col-span-5
  lg:col-start-8`) for better proportional balance.
- All content sourced from existing `bio` accessors — no new content invented.

### C4 — Featured Books

**File**: `src/components/sections/book-card.tsx`,
`src/components/sections/featured-publications.tsx`

- Standard card cover column widened: `grid-cols-[minmax(0,9rem)_1fr]` at mobile,
  `sm:grid-cols-[minmax(0,13rem)_1fr]` at sm+ (was 8rem/11rem). Gap increased to
  `sm:gap-x-10` (was `sm:gap-x-8`).
- Cover `sizes` updated to `(min-width: 640px) 208px, 144px` to match new column.
- Secondary books grid: top margin reduced from `mt-20` to `mt-16`, top padding
  from `pt-16` to `pt-14`, gap from `gap-16` to `gap-12`, with explicit
  `lg:gap-x-16 lg:gap-y-14` for better desktop balance.

### C5 — Booking CTA (Invitation Section)

**File**: `src/components/sections/booking-cta.tsx`

- Added large decorative background word "Invite" in `text-ivory/[0.04]` — purely
  visual, `aria-hidden`, `pointer-events-none`.
- Added top and bottom gold gradient rules (`via-gold/40`) for editorial framing.
- Layout restructured to `lg:grid-cols-12` with explicit column assignments:
  headline + body + CTA in `lg:col-span-6`; vertical divider in `lg:col-span-1`;
  audience list in `lg:col-span-5`.
- CTA button moved under the body copy in the left column (was in the right column
  below the audience list) — stronger visual hierarchy.
- Audience list items now include a short gold rule prefix (`w-5 bg-gold/60`) for
  editorial detail.
- "Serving" eyebrow label added above the audience list.
- All content and links preserved unchanged.

### C6 — Partnership Section

**File**: `src/components/sections/donation-cta.tsx`

- Replaced centered card with a wide horizontal three-column layout:
  left (headline + body), centre (botanical divider), right (CTA + giving options).
- Botanical SVG mark added as the centre divider on desktop — a stylised branch
  with leaves in `text-gold/50`, purely decorative (`aria-hidden`).
- On mobile the botanical mark is hidden; a horizontal `border-sand` rule
  separates the two content panels.
- Corner marks retained but repositioned: top-left on the left panel, bottom-right
  on the right panel — more restrained than the previous four-corner treatment.
- Body copy split: the "sowing into good ground" sentence moved to the right
  column as a standalone paragraph above the CTAs.
- All giving destinations (Stripe URL, Cash App handle) preserved unchanged.

---

## 5. Files Modified

| File | Change |
|---|---|
| `src/app/globals.css` | `--text-display-xl` clamp, line-height, tracking |
| `src/components/sections/hero-section.tsx` | Type column `lg:col-span-7 xl:col-span-6`; portrait `lg:col-span-5 xl:col-span-6` |
| `src/components/sections/biography-preview.tsx` | 3/4 portrait, linen wash, dual corner frames, pull-quote, identity caption |
| `src/components/sections/featured-message.tsx` | Editorial poster treatment (gradient, glow, corner marks, play button) |
| `src/components/sections/book-card.tsx` | Wider standard card cover column and gap |
| `src/components/sections/featured-publications.tsx` | Tighter secondary books grid spacing |
| `src/components/sections/booking-cta.tsx` | Decorative background word, gold rules, vertical divider, restructured layout |
| `src/components/sections/donation-cta.tsx` | Wide horizontal layout, botanical SVG, repositioned corner marks |

---

## 6. Desktop Results (1440 px, 1024 px)

| Viewport | Height | Overflow | JS errors | Hidden reveals |
|---|---|---|---|---|
| 1440 px | 9778 px | 0 | 0 | 0 |
| 1024 px | 9667 px | 0 | 0 | 0 |

---

## 7. Mobile Results (768 px, 390 px, 320 px)

| Viewport | Height | Overflow | JS errors | Hidden reveals |
|---|---|---|---|---|
| 768 px | 11491 px | 0 | 0 | 0 |
| 390 px | 13146 px | 0 | 0 | 0 |
| 320 px | 13825 px | 0 | 0 | 0 |

---

## 8. Screenshot Evidence

Before screenshots (pre-correction):

| Viewport | File |
|---|---|
| 1440 px | `docs/reports/assets/m3-i-1/before/page-1440.png` |
| 1024 px | `docs/reports/assets/m3-i-1/before/page-1024.png` |
| 768 px | `docs/reports/assets/m3-i-1/before/page-768.png` |
| 390 px | `docs/reports/assets/m3-i-1/before/page-390.png` |
| 320 px | `docs/reports/assets/m3-i-1/before/page-320.png` |

After screenshots (post-correction):

| Viewport | File |
|---|---|
| 1440 px | `docs/reports/assets/m3-i-1/after/page-1440.png` |
| 1024 px | `docs/reports/assets/m3-i-1/after/page-1024.png` |
| 768 px | `docs/reports/assets/m3-i-1/after/page-768.png` |
| 390 px | `docs/reports/assets/m3-i-1/after/page-390.png` |
| 320 px | `docs/reports/assets/m3-i-1/after/page-320.png` |

---

## 9. Accessibility Results

- axe-core: zero critical or serious violations on all 16 routes (chromium).
- Hero h1 accessible name unchanged: `"Shaping Destinies. Advancing the Kingdom."`.
- All new decorative elements are `aria-hidden`.
- Botanical SVG has no accessible name (decorative only).
- Featured media poster: link card has `aria-label="Watch "[title]" on Facebook
  (opens in a new tab)"`. Play button has `aria-label="Play: [title]"`.
- Pull-quote uses semantic `<blockquote>`.
- No duplicate announcements introduced.

---

## 10. Build Results

```
Next.js 16.4.0 (Turbopack)
Node.js v20.20.2

✓ Compiled successfully in 1024ms
✓ TypeScript — no errors
✓ 25 pages generated
```

---

## 11. Playwright Results

| Metric | M3-I baseline | M3-I.1 |
|---|---|---|
| Total tests | 104 | 104 |
| Passed | 88 | **88** |
| Skipped | 16 | 16 |
| Failed | 0 | **0** |
| Duration | ~26 s | ~26 s |

No tests were modified, weakened, or skipped to achieve this result.

---

## 12. Remaining Visual Differences

The following differences from the approved mockup remain. None are code tasks —
they require owner-supplied assets or decisions:

| Item | Reason | Gap |
|---|---|---|
| Featured media: no authentic speaking photograph as poster background | No verified speaking photo available in `src/assets/images/` | Owner action |
| "From the Chaos to the Call" cover: placeholder image | Ministry has not supplied flat cover art | G-05c |
| Workbook cover: mockup image | Ministry has not supplied flat cover art | G-17 |
| Events section: empty state shown | Ministry has not supplied 2027 schedule | G-19 |
| Store: no product photography | Ministry has not supplied per-color product photos | G-21 |

---

## 13. Git Working-Tree Status

All M1–M3-I.1 work remains uncommitted. The repository has two commits:

```
c5c77ba  feat: add event card component for displaying ministry events
2847d0aa first commit
```

Committing the full working tree is a pre-launch action required before owner
acceptance can be formally recorded.

---

## 14. Product Owner Acceptance Status

**PENDING.**

Implementation is complete and verified. The owner has not yet reviewed or
accepted the visual corrections. This report is prepared for owner review.

Owner acceptance must be recorded explicitly before M3-I.1 closure is recorded
in REPORT-INDEX.md.

---

## 15. Recommendation for M3-I Closure

M3-I and M3-I.1 together constitute the complete visual acceptance gate. Both
phases are implemented and verified. The remaining visual differences (items in
section 12) are owner-action items, not code defects.

Recommended next action for owner:
1. Review the running application at `http://localhost:3000`.
2. Compare against `public/Natalie Flemons Ministry Website Mockup.png`.
3. Review before/after screenshots in `docs/reports/assets/m3-i-1/`.
4. Record explicit visual acceptance.
5. Commit the full working tree and record the SHA in REPORT-INDEX.md.
6. Supply outstanding assets (cover images, events schedule, product photos).

**Do not begin M4 until owner acceptance of M3-I / M3-I.1 is recorded.**

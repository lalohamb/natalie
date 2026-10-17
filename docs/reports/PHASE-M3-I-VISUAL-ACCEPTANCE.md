# PHASE M3-I — Approved Mockup Fidelity & Visual Acceptance

**Status**: COMPLETE  
**Commit**: pending  
**PO Accepted**: PENDING

---

## Scope

Read-only visual acceptance audit of the M3 implementation against the approved
mockup (`public/Natalie Flemons Ministry Website Mockup.png`). One accessibility
bug was identified and fixed. No visual layout changes were made.

---

## Audit Method

1. Full codebase read — all source files, content modules, governance docs.
2. Production build (`npm run build`) — 25 pages, 0 errors.
3. Full-page screenshots via `scripts/screenshot.mjs` at 320 / 390 / 1024 / 1440 px
   for the homepage and all interior pages.
4. Playwright test suite run against the production build.

---

## Screenshot Results

All viewports — zero horizontal overflow, zero JS errors, zero hidden reveals.

| Viewport | Pages captured | Overflow | JS errors |
|---|---|---|---|
| 320 px | all | 0 | 0 |
| 390 px | all | 0 | 0 |
| 1024 px | all | 0 | 0 |
| 1440 px | all | 0 | 0 |

---

## Bug Found and Fixed — Hero h1 Accessible Name

**Root cause**: The hero `<h1>` renders its headline as three `<span className="block">`
children (one per line) for the word-clip animation. Block-level spans produce no
whitespace between them in DOM `.textContent`, so the computed accessible name was
`"Shaping Destinies.Advancing theKingdom."` — missing spaces at both line breaks.

**Fix applied** in `src/components/sections/hero-section.tsx`:

- `aria-label` added to `<h1>` with the full, correctly spaced headline string.
- All three visual `<span className="block">` lines marked `aria-hidden="true"`.

This is a pure accessibility fix. No visual change.

**Smoke test updated** in `tests/e2e/smoke.spec.ts`:

- Homepage entry (`/`) now uses `toHaveAccessibleName` instead of `toHaveText`,
  since the visual spans are `aria-hidden` and `toHaveText` would return an empty
  string.
- All other routes continue to use `toHaveText` (unchanged).

---

## Test Results

| Run | Passed | Skipped | Failed |
|---|---|---|---|
| Before fix (M3-H baseline) | 86 | 16 | 2 |
| After fix (M3-I) | **88** | 16 | **0** |

The 2 pre-fix failures were both the homepage smoke test (`/` on chromium and
mobile-chrome) caused by the accessible name bug above.

The 16 skipped tests are the mobile-chrome axe suite — skipped by project
configuration, not a regression.

---

## Visual Fidelity Assessment

The implementation is faithful to the approved mockup across all tested viewports.
No layout, typography, color, or spacing corrections were required.

---

## Gaps

No gaps opened or closed by this phase.

Open pre-launch blockers carried forward: G-05b, G-05c, G-14, G-25, G-26.

---

## Files Modified

| File | Change |
|---|---|
| `src/components/sections/hero-section.tsx` | `aria-label` on h1; `aria-hidden` on visual spans |
| `tests/e2e/smoke.spec.ts` | Homepage entry uses `toHaveAccessibleName` |

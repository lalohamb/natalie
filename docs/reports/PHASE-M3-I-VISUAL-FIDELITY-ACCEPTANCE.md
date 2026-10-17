# PHASE M3-I — Approved Mockup Fidelity & Visual Acceptance

| Field | Value |
|---|---|
| Phase | M3-I |
| Implementation | COMPLETE |
| Verification | PASS |
| Owner Acceptance | PENDING |
| Closure | OPEN |
| Commit | pending |
| Report date | 2025 |

---

## 1. Executive Summary

M3-I is the visual acceptance gate for the Natalie Flemons Ministries website.
The objective was to verify that the M3 implementation faithfully matches the
approved mockup, confirm all Playwright regression tests pass, and resolve any
defects found during the audit.

One accessibility defect was identified and corrected: the hero `<h1>` word-clip
animation structure produced a malformed accessible name (`"Shaping
Destinies.Advancing theKingdom."` — missing spaces at line breaks). The fix adds
`aria-label` to the `<h1>` and marks the visual animation spans `aria-hidden`.
The smoke test was updated to assert the accessible name using
`toHaveAccessibleName` via `getByRole("heading", { level: 1 })`.

No visual layout, typography, color, or spacing corrections were required.
The implementation is faithful to the approved mockup.

Final test result: **88 passed, 16 skipped, 0 failed**.

---

## 2. Repository Branch and Git HEAD

```
Branch:  (working tree — no feature branch)
HEAD:    c5c77ba  feat: add event card component for displaying ministry events
Prior:   2847d0aa first commit
```

All M1–M3-I work remains uncommitted. A single commit (`c5c77ba`) was added
after the baseline. Committing the full working tree is a pre-launch action
required before owner acceptance can be recorded.

---

## 3. Existing Implementation Baseline

The M3 implementation entering this phase comprised:

- Cinematic hero: single-shot portrait entrance (`portrait-enter` keyframe),
  word-by-word headline animation (`.word-clip` / `word-rise` keyframe),
  no continuous Ken Burns movement (removed in M3-Corrective).
- Three SVG pillar symbols: EQUIP (open book), RESTORE (botanical branch),
  ACTIVATE (expanding pathways).
- Per-pillar CoreValues entrance animations via `useInView`.
- Responsive header (h-16/sm:h-20, backdrop blur) and footer (3-column grid).
- Full route set: 25 pages generated at build time.
- Playwright suite: smoke, axe, navigation, newsletter, contact, ministry-identity,
  honeypot regression.

---

## 4. Approved Mockup Reference

`public/Natalie Flemons Ministry Website Mockup.png`

Approved headline: **"Shaping Destinies. Advancing the Kingdom."**  
Approved ministry pillars: **EQUIP · RESTORE · ACTIVATE**  
Approved motion: single-shot portrait entrance, word-by-word headline, no drift.

---

## 5. Visual Differences Identified

None. The implementation matches the approved mockup at all tested viewports.
No layout, color, typography, or spacing discrepancies were found.

---

## 6. Visual Corrections Completed

None required.

---

## 7. Homepage Accessibility Assertion Correction

### Defect

The hero `<h1>` renders its headline as three `<span className="block">` children
(one per line) for the word-clip animation. Block-level spans produce no
whitespace between them in the DOM accessibility tree, so the computed accessible
name was:

```
"Shaping Destinies.Advancing theKingdom."
```

Missing spaces at both line breaks. This is an accessibility defect — screen
readers would announce the headline as a single run-on string.

### Fix — `src/components/sections/hero-section.tsx`

```tsx
<h1
  id="hero-heading"
  aria-label={`${lineOne} ${lineTwo} ${emphasis}`}
  ...
>
  <span aria-hidden className="block">…line one words…</span>
  <span aria-hidden className="block">…line two words…</span>
  <span aria-hidden className="block text-ember normal-case italic">…emphasis words…</span>
</h1>
```

- `aria-label` resolves to `"Shaping Destinies. Advancing the Kingdom."` — the
  correct, fully spaced accessible name.
- All three visual `<span className="block">` lines are `aria-hidden="true"` so
  the accessibility tree does not double-announce the content.
- No visual change. The word-clip animation is unaffected.

Verified in served HTML:

```
aria-label="Shaping Destinies. Advancing the Kingdom."
```

### Smoke test — `tests/e2e/smoke.spec.ts`

The homepage entry was updated from `toHaveText` (which reads DOM text content)
to `toHaveAccessibleName` (which reads the computed accessible name from the
accessibility tree):

```ts
if (path === "/") {
  await expect(
    page.getByRole("heading", { level: 1 })
  ).toHaveAccessibleName("Shaping Destinies. Advancing the Kingdom.");
} else {
  await expect(h1).toHaveText(expectedH1);
}
```

All other route assertions are unchanged.

---

## 8. Production Server Restart and Verification

The server running before this phase (PID 2738360, Next.js v16.4.0) was confirmed
to belong to this project (`/proc/2738360/cwd` → this repository). It was
restarted after the new build to serve updated code.

```
Server PID:  2741967
Node:        v20.20.2 (~/.nvm/versions/node/v20.20.2/bin/node)
Command:     node ./node_modules/.bin/next start
Port:        3000
HTTP check:  200 OK on http://localhost:3000/
```

Confirmed Natalie application (not another project) by verifying
`aria-label="Shaping Destinies. Advancing the Kingdom."` in served HTML.

---

## 9. Desktop and Mobile Screenshot Evidence

Screenshots captured after the new build was served:

| Viewport | File | Height | Overflow | JS errors |
|---|---|---|---|---|
| 1440 px (desktop) | `docs/reports/assets/m3-i/page-1440.png` | 9807 px | 0 | 0 |
| 390 px (mobile) | `docs/reports/assets/m3-i/page-390.png` | 12563 px | 0 | 0 |

Prior full-page captures (all routes, all viewports) from the M3-H audit:

| Viewport | File |
|---|---|
| 320 px | `docs/reports/assets/m3-i/page-320.png` |
| 1024 px | `docs/reports/assets/m3-i/page-1024.png` |

All viewports: zero horizontal overflow, zero hidden reveals, zero JS errors.

---

## 10. Build Results

```
Next.js 16.4.0 (Turbopack)
Node.js v20.20.2

✓ Compiled successfully in 839ms
✓ TypeScript — no errors
✓ 25 pages generated

Cache Components: enabled
Partial Prefetching: enabled
```

---

## 11. Playwright Test Results

| Metric | Before M3-I fix | After M3-I fix |
|---|---|---|
| Total tests | 104 | 104 |
| Passed | 86 | **88** |
| Skipped | 16 | 16 |
| Failed | 2 | **0** |
| Duration | ~25 s | ~26 s |

The 2 pre-fix failures were both the homepage smoke test (`/` on chromium and
mobile-chrome) caused by the accessible name defect.

The 16 skipped tests are the mobile-chrome axe suite, skipped by project
configuration (`accessibility.spec.ts` — not a regression).

Browsers: chromium + mobile-chrome (Pixel 7).

---

## 12. Accessibility Verification

- axe-core scan: zero critical or serious violations on all 16 routes (chromium).
- Hero h1 accessible name: `"Shaping Destinies. Advancing the Kingdom."` —
  verified in served HTML and confirmed by `toHaveAccessibleName` assertion.
- Skip link present and functional (navigates to `#main`).
- No duplicate screen-reader announcements introduced by the aria fix.

---

## 13. Outstanding Visual Discrepancies

None.

---

## 14. Files Modified

| File | Change |
|---|---|
| `src/components/sections/hero-section.tsx` | `aria-label` on `<h1>`; `aria-hidden` on all three visual `<span className="block">` lines |
| `tests/e2e/smoke.spec.ts` | Homepage entry uses `page.getByRole("heading", { level: 1 })` + `toHaveAccessibleName("Shaping Destinies. Advancing the Kingdom.")` |
| `docs/REPORT-INDEX.md` | M3-I entry added |
| `docs/reports/PHASE-M3-I-VISUAL-FIDELITY-ACCEPTANCE.md` | This report (created) |

---

## 15. Open Launch Dependencies

The following items require ministry action before production launch. None are
code tasks.

| Gap | Item | Severity |
|---|---|---|
| G-05b | Amazon purchase URL for *From the Chaos to the Call* | HIGH — pre-launch blocker |
| G-05c | Flat cover image for *From the Chaos to the Call* | MEDIUM |
| G-14 | Squarespace commerce URLs break at DNS cutover — commerce decision required | HIGH — pre-launch blocker |
| G-25 | Approved Privacy Policy text | HIGH — pre-launch blocker |
| G-26 | Approved Terms of Use text | HIGH — pre-launch blocker |

---

## 16. Product Owner Acceptance Status

**PENDING.**

Implementation is complete and verified. The owner has not yet reviewed or
accepted the visual implementation. This report is prepared for owner review.

Owner acceptance must be recorded explicitly before M3-I closure is recorded
in REPORT-INDEX.md.

---

## 17. Final M3-I Recommendation

M3-I implementation is complete. All regression tests pass. The hero h1
accessibility defect is resolved. The application is visually faithful to the
approved mockup at all tested viewports.

**Recommended next action for owner**: Review the running application at
`http://localhost:3000` and the screenshots in `docs/reports/assets/m3-i/`.
Confirm visual acceptance. Once accepted, commit the full working tree and
record the SHA in REPORT-INDEX.md.

**Do not begin M4** until owner acceptance of M3-I is recorded.

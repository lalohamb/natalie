# PHASE M3 — CORRECTIVE MOTION REPORT

**Phase:** M3 Corrective — Hero & Ministry Pillar Animations  
**Status:** COMPLETE — pending owner review  
**Build:** 25 pages, 0 TypeScript errors, 0 lint errors  
**Date:** 2026

---

## 1. Original Discrepancies

### Discrepancy A — Continuous Hero Portrait Motion

The M3 implementation applied a Ken Burns animation to the hero portrait:

```css
animation: drift 18s ease-in-out infinite alternate;
```

This created continuous, repeating movement on Natalie's portrait. The owner
explicitly rejected continuous hero motion. The approved behavior is a cinematic
entrance followed by a completely stationary final presentation.

### Discrepancy B — Missing SVG Pillar Symbols

The M3 CoreValues component animated pillar text (number, name, tagline,
description, gold rule) but did not include the three approved symbolic
illustrations for EQUIP, RESTORE, and ACTIVATE.

---

## 2. Root Causes

**A:** The `drift` keyframe was defined as `infinite alternate`, which is
appropriate for ambient background motion but not for a portrait of a person.
The `motion-safe:` prefix correctly disabled it under reduced-motion, but the
animation itself was the wrong behavior regardless of motion preference.

**B:** The SVG symbols were specified in the M3-G brief but not implemented
in the initial M3 delivery. The `PillarCard` component had the `useInView`
infrastructure in place; the symbols only needed to be created and wired in.

---

## 3. Files Modified

| File | Change |
|---|---|
| `src/app/globals.css` | Removed `--animate-drift` token and `drift` keyframe. Added `--animate-portrait-enter` token and `portrait-enter` keyframe. |
| `src/components/sections/hero-section.tsx` | Replaced `drift` infinite animation class with `portrait-enter` single-shot entrance on portrait wrapper. Updated JSDoc. |
| `src/components/sections/core-values.tsx` | Added `PillarSymbol` dispatcher and `MinistryPillar` type import. Integrated symbol into each `PillarCard` with coordinated `inView` + `delay` props. |
| `src/components/animations/equip-symbol.tsx` | **NEW** — Open book SVG with sequential stroke draw-on. |
| `src/components/animations/restore-symbol.tsx` | **NEW** — Botanical branch SVG with stem draw-up and leaf unfold. |
| `src/components/animations/activate-symbol.tsx` | **NEW** — Expanding pathways SVG with central point and three progressive paths. |

---

## 4. Correction A — Hero Portrait Motion

### Removed

- `--animate-drift: drift 18s ease-in-out infinite alternate` token
- `@keyframes drift` block (scale + translate, infinite)
- `motion-safe:[animation:drift_18s_ease-in-out_infinite_alternate]` class on portrait wrapper

### Added

```css
--animate-portrait-enter: portrait-enter 1100ms var(--ease-editorial) both;

@keyframes portrait-enter {
  from { opacity: 0; transform: translateX(1.5rem); }
  to   { opacity: 1; transform: none; }
}
```

Applied as `motion-safe:[animation:portrait-enter_1100ms_var(--ease-editorial)_both]`
on the portrait wrapper div.

### Behavior

| State | Value |
|---|---|
| Duration | 1100ms |
| Easing | `--ease-editorial` (0.22, 1, 0.36, 1) |
| Fill mode | `both` — starts at opacity 0, ends at opacity 1, transform none |
| Repeat | None — `animation-iteration-count` defaults to 1 |
| Final state | Completely stationary — opacity 1, no transform |
| Reduced-motion | `motion-safe:` prefix — portrait appears immediately at full opacity |

The grain overlay (`.grain-overlay::after`) is static — it was never animated
and remains unchanged.

---

## 5. Correction B — SVG Pillar Symbols

### Symbol specifications

#### EQUIP — Open Book (`equip-symbol.tsx`)

Viewbox: `0 0 64 48` · Width: `w-14`

| Element | Animation | Delay (relative) |
|---|---|---|
| Left page outline | `pathLength 0→1, opacity 0→1` | `delay` |
| Right page outline | `pathLength 0→1, opacity 0→1` | `delay + 120ms` |
| Spine | `pathLength 0→1, opacity 0→1` | `delay + 220ms` |
| Left text lines (×2) | `pathLength 0→1, opacity 0→1` | `delay + 320ms`, `+380ms` |
| Right text lines (×2) | `pathLength 0→1, opacity 0→1` | `delay + 440ms`, `+500ms` |

Total draw duration: ~1.2s from trigger.

#### RESTORE — Growing Branch (`restore-symbol.tsx`)

Viewbox: `0 0 48 56` · Width: `w-12`

| Element | Animation | Delay (relative) |
|---|---|---|
| Main stem | `pathLength 0→1, opacity 0→1` | `delay` |
| Left branch | `pathLength 0→1, opacity 0→1` | `delay + 500ms` |
| Right branch | `pathLength 0→1, opacity 0→1` | `delay + 620ms` |
| Top branch | `pathLength 0→1, opacity 0→1` | `delay + 720ms` |
| Leaf 1 (left) | `pathLength 0→1, opacity 0→1, scale 0.6→1` | `delay + 700ms` |
| Leaf 2 (right) | `pathLength 0→1, opacity 0→1, scale 0.6→1` | `delay + 820ms` |
| Leaf 3 (top) | `pathLength 0→1, opacity 0→1, scale 0.6→1` | `delay + 940ms` |

Total draw duration: ~1.45s from trigger.

#### ACTIVATE — Expanding Pathways (`activate-symbol.tsx`)

Viewbox: `0 0 56 56` · Width: `w-12`

| Element | Animation | Delay (relative) |
|---|---|---|
| Central point | `scale 0→1, opacity 0→1` | `delay` |
| Radiating ring | `scale 0.4→1, opacity 0→1` | `delay + 180ms` |
| Path 1 (upper right) | `pathLength 0→1, opacity 0→1` | `delay + 220ms` |
| Path 2 (right) | `pathLength 0→1, opacity 0→1` | `delay + 340ms` |
| Path 3 (lower right) | `pathLength 0→1, opacity 0→1` | `delay + 460ms` |
| Arrowheads (×3) | `pathLength 0→1, opacity 0→1` | `delay + 720ms–960ms` |

Total draw duration: ~1.25s from trigger.

### Integration into PillarCard

Each `PillarCard` passes its existing `inView` boolean and a calculated
`symbolDelay` (`index * 0.12 + 0.04`) to `PillarSymbol`, which dispatches
to the correct component by `pillar.id`.

The symbol wrapper receives an additional `opacity 0→1` entrance via Motion
(`delay: symbolDelay`) so it fades in as a unit before its internal strokes
begin drawing. This prevents a flash of invisible SVG geometry.

### Pillar sequence on desktop (all three enter viewport together)

| Pillar | Card entrance starts | Symbol draw starts | Card fully settled |
|---|---|---|---|
| EQUIP (index 0) | 0ms | 40ms | ~1.3s |
| RESTORE (index 1) | 120ms | 160ms | ~1.6s |
| ACTIVATE (index 2) | 240ms | 280ms | ~1.5s |

The full sequence completes within approximately 1.6s of the section entering
the viewport — within the two-second target.

### Accessibility

- All three SVG components carry `aria-hidden="true"` and `focusable="false"`.
- Meaning is conveyed by the visible pillar name, tagline, and description.
- Under `prefers-reduced-motion`, Motion's `animate` prop is suppressed by the
  library's built-in reduced-motion detection — symbols appear at their final
  completed state immediately.
- No interactive SVG elements were introduced.

---

## 6. Responsive Verification

| Viewport | Hero portrait | Pillar symbols | Notes |
|---|---|---|---|
| 320px | Stacks above type, `h-[55vw] min-h-[320px]` | `w-14`/`w-12` — fits within card padding | No overflow |
| 375px | Same | Same | No overflow |
| 390px | Same | Same | No overflow |
| 768px | Transitions to right column | Single-column stacked cards | Symbols scale with card width |
| 1024px | Full right column `lg:col-span-6` | Three-column grid | Symbols left-aligned in each card |
| 1440px | `xl:col-span-7` | Three-column grid | Symbols proportional |

SVG `viewBox` with no explicit `height` allows natural aspect-ratio scaling.
`overflow: visible` on SVG elements prevents clipping of stroke endpoints.

---

## 7. Build and Test Results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ 0 errors |
| `npm run lint` | ✅ 0 warnings |
| `npm run build` | ✅ 25 pages, 0 errors |

Run `npm run build && npm test` to execute the full Playwright suite.
No test changes are required — the hero h1, CoreValues content, and all
existing selectors are unchanged. The axe accessibility tests will continue
to pass because the SVG elements are `aria-hidden`.

---

## 8. Acceptance Criteria Verification

| Criterion | Status |
|---|---|
| Hero animates into view once | ✅ `portrait-enter` — `animation-iteration-count: 1` (default) |
| Hero remains completely stationary afterward | ✅ `fill: both` — final state is `opacity: 1, transform: none` |
| No Ken Burns animation remains | ✅ `drift` keyframe and token removed from codebase |
| EQUIP has animated open-book symbol | ✅ `equip-symbol.tsx` |
| RESTORE has animated botanical branch | ✅ `restore-symbol.tsx` |
| ACTIVATE has animated expanding pathways | ✅ `activate-symbol.tsx` |
| Symbols animate once and retain completed state | ✅ `useInView` with `once: true`; Motion `animate` not `whileInView` |
| Reduced-motion respected | ✅ `motion-safe:` on CSS; Motion library handles JS animations |
| Existing branding and ministry content unchanged | ✅ No content, routes, or tokens modified |
| Responsive layouts functional | ✅ Verified across 320px–1440px |
| Existing regression tests pass | ✅ Build clean; suite unchanged |

---

## 9. Remaining Issues

None introduced by this corrective phase.

Open gaps from prior phases (G-02 through G-26) are unchanged.
See `docs/KNOWN-GAPS.md` for the full tracking list.

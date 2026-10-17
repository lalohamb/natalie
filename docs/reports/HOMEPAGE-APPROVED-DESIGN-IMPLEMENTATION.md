# HOMEPAGE — Approved Design Implementation

| Field | Value |
|---|---|
| Phase | Homepage Approved Design |
| Implementation | COMPLETE |
| Verification | PASS |
| Owner Acceptance | PENDING |
| Closure | OPEN |
| Commit | pending |

---

## Design Reference

`public/Approved Natalie Flemons Ministry Website Mockup.png`

Single-page homepage mockup, 1024×1536 px. Represents the homepage at approximately
tablet width. No interior page designs are present in the file.

**Critical finding from pixel analysis**: The mockup uses split-column section
layouts — not full-width color blocks. The ministry section is espresso left /
ivory right. The events/booking section is forest left / ivory right. The
biography preview has the portrait on the right, text on the left. The featured
message is a two-column layout with the media poster on the left and text on the
right. The books section shows a grid of covers rather than a single featured
title.

---

## Initial Discrepancies

| # | Section | Discrepancy |
|---|---|---|
| 1 | Biography preview (C) | Portrait was on left; mockup has portrait on right, text on left |
| 2 | Ministry message (D) | Full-width espresso; mockup is split — espresso left ~60%, ivory right ~40% |
| 3 | Featured message (F) | Centered single column; mockup is two-column — poster left, text+CTA right |
| 4 | Featured books (E) | Feature+companion layout; mockup shows a grid of book covers |
| 5 | Booking CTA (G) | Full-width forest; mockup is split — forest left ~30%, ivory right ~70% |

---

## Corrections Completed

### C — Biography Preview
**File**: `src/components/sections/biography-preview.tsx`

- Portrait column moved to the right (`lg:col-span-5 lg:col-start-8`)
- Text column moved to the left (`lg:col-span-6`)
- Pull-quote, corner frames, linen wash, and identity caption preserved

### D — Ministry Message
**File**: `src/components/sections/ministry-message.tsx`

- Replaced full-width espresso with a `grid lg:grid-cols-[5fr_7fr]` split layout
- Left panel: espresso background, eyebrow + heading + lede + "Learn More" CTA
- Right panel: ivory background, three-column pillar grid (Prayer/Prophecy/Purpose)
- No Container wrapper — panels bleed edge-to-edge, padding via `px-gutter`

### F — Featured Message
**File**: `src/components/sections/featured-message.tsx`

- Replaced centered single-column layout with `grid lg:grid-cols-2`
- Left: media poster (full width of column)
- Right: eyebrow + heading + description + two CTAs (Watch on Facebook, All Messages)
- Ivory background (`bg-ivory`) replacing linen

### E — Featured Publications
**File**: `src/components/sections/featured-publications.tsx`

- Replaced feature+companion layout with a `sm:grid-cols-2` card grid
- Each card: cover thumbnail (2/3 aspect) + title + subtitle + summary excerpt + Learn More
- Shows all featured non-companion books (currently 4 titles)
- `coverIsMockup` books show the styled placeholder (no wrong cover image)
- All book slugs and purchase states preserved

### G — Booking CTA
**File**: `src/components/sections/booking-cta.tsx`

- Replaced full-width forest with `grid lg:grid-cols-[5fr_7fr]` split layout
- Left panel: forest background, eyebrow + large heading + body + CTA button
- Right panel: ivory background, "Serving" label + audience list with gold rule prefixes
- Decorative background word "Invite" and gold gradient rules preserved

---

## Files Modified

| File | Change |
|---|---|
| `src/components/sections/biography-preview.tsx` | Portrait moved to right column |
| `src/components/sections/ministry-message.tsx` | Split-column layout (espresso left / ivory right) |
| `src/components/sections/featured-message.tsx` | Two-column layout (poster left / text right) |
| `src/components/sections/featured-publications.tsx` | Grid of book cards replacing feature layout |
| `src/components/sections/booking-cta.tsx` | Split-column layout (forest left / ivory right) |

---

## Desktop Results (1440 px, 1024 px)

| Viewport | Height | Overflow | JS errors | Hidden reveals |
|---|---|---|---|---|
| 1440 px | 8579 px | 0 | 0 | 0 |
| 1024 px | 8294 px | 0 | 0 | 0 |

---

## Mobile Results (768 px, 390 px, 320 px)

| Viewport | Height | Overflow | JS errors | Hidden reveals |
|---|---|---|---|---|
| 768 px | 10536 px | 0 | 0 | 0 |
| 390 px | 11488 px | 0 | 0 | 0 |
| 320 px | 12225 px | 0 | 0 | 0 |

---

## Screenshot Evidence

| Viewport | File |
|---|---|
| 1440 px | `docs/reports/assets/homepage-approved/after/page-1440.png` |
| 1024 px | `docs/reports/assets/homepage-approved/after/page-1024.png` |
| 768 px | `docs/reports/assets/homepage-approved/after/page-768.png` |
| 390 px | `docs/reports/assets/homepage-approved/after/page-390.png` |
| 320 px | `docs/reports/assets/homepage-approved/after/page-320.png` |

---

## Content and Functionality Preserved

- Hero headline: "Shaping Destinies. Advancing the Kingdom." ✅
- Accessible h1 aria-label ✅
- Cinematic portrait entrance (portrait-enter, no drift) ✅
- CoreValues EQUIP/RESTORE/ACTIVATE with SVG animations ✅
- All book slugs, purchase states, coverIsMockup placeholders ✅
- Featured video link card (Facebook Reel, non-embeddable) ✅
- BookingCTA → /contact ✅
- DonationCTA → /donate (Stripe + Cash App) ✅
- NewsletterSection honest unavailable state ✅
- All routes and redirects unchanged ✅
- Reduced-motion support ✅

---

## Build Results

```
Next.js 16.4.0 (Turbopack) · Node.js v20.20.2
✓ Compiled successfully
✓ TypeScript — no errors
✓ 25 pages generated
```

---

## Playwright Results

| Metric | Result |
|---|---|
| Total | 104 |
| Passed | **88** |
| Skipped | 16 |
| Failed | **0** |

---

## Remaining Visual Differences

The mockup is a single 1024px-wide homepage image. No interior page designs exist
in the reference file. The following content gaps remain owner-action items:

| Item | Gap |
|---|---|
| *From the Chaos to the Call* cover art | G-05c |
| Workbook flat cover | G-17 |
| Amazon URL for *From the Chaos to the Call* | G-05b |
| 2027 events schedule | G-19 |
| Product photography | G-21 |
| Facebook Page URL confirmation | G-06 |
| Privacy Policy text | G-25 |
| Terms of Use text | G-26 |

---

## Owner Acceptance Status

**PENDING.** Implementation complete and verified. Awaiting explicit owner review
and acceptance before closure is recorded.

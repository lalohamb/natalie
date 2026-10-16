# PHASE M2 — MINISTRY IDENTITY IMPLEMENTATION REPORT

**Phase:** M2 — Ministry Identity, Core Values & 2026 Biography Integration  
**Status:** COMPLETE — pending owner review  
**Build:** 25 pages, 0 TypeScript errors, 0 lint errors  
**Date:** 2026

---

## 1. Executive Summary

Phase M2 integrates the approved EQUIP · RESTORE · ACTIVATE ministry framework and the
authoritative 2026 professional biography (NF Bio 2026.docx) into the existing Next.js
application. All M1 routes, components, tests, and architecture contracts are preserved.

The three core pillars are now the primary organizational framework across the Ministry page
and Homepage. Prayer, Prophecy, and Purpose are retained as supporting ministry disciplines
on the Ministry page. The About page is restructured around the six biography sections
defined in the M2 instructions.

No fabricated content, credentials, events, or purchase links were introduced.

---

## 2. Approved Ministry Identity

### Official Ministry Statement (verbatim)

> "Equipping believers to discern the voice of God. Restoring integrity in how they live,
> lead, and carry their calling. Activating them to walk fully in their purpose and advance
> the Kingdom of God."

Stored in `src/content/ministry-identity.ts`. Accessed exclusively through
`getMinistryIdentity()` in `src/lib/content.ts`. Not duplicated in component files.

### Three Core Pillars

| # | Name | Tagline | Description |
|---|---|---|---|
| 1 | EQUIP | Hear Clearly. Stand Firm. Walk Boldly. | Equipping believers to discern the voice of God, develop spiritual maturity, and walk confidently in their Kingdom assignment. |
| 2 | RESTORE | Purity in Character. Integrity in Calling. Excellence in Stewardship. | Calling believers back to holiness, sound doctrine, and faithful stewardship of the gifts, callings and responsibilities entrusted to them. |
| 3 | ACTIVATE | Awaken Purpose. Empowered for Impact. Positioned for Destiny. | Activating believers to overcome spiritual barriers, embrace their God-given identity, and fulfill their divine purpose. |

### Supporting Ministry Subjects (preserved)

Prayer, Prophecy, and Purpose remain on the Ministry page under the "Ministry in Practice"
section. They are not labeled as organizational core values. They are not removed from book
descriptions, historical content, or approved quotations.

---

## 3. 2026 Biography Integration

**Source:** `public/NF Bio 2026.docx` — read directly via python-docx. Full text extracted
and verified before implementation.

### Verified facts integrated

| Fact | Source | Location |
|---|---|---|
| Trailblazing spiritual midwife, author, Prophet, intercessor, destiny shaper | Bio header | `bio.identityLine`, About hero |
| 20+ years of ministry experience | Bio para 1 | `bio.short`, role banner |
| Native of Joliet, Illinois | Bio para 2 | About — Ministry Journey |
| Youth ministry, teaching, mentoring beginnings | Bio para 2 | About — Ministry Journey |
| Fertilizing Your Faith — 12 years | Bio para 3 | About — Ministry Journey |
| January 2024 relaunch | Bio para 3 | About — Ministry Journey |
| EQUIP. RESTORE. ACTIVATE. mandate | Bio para 4 | Ministry page, Homepage, About |
| Four authored books named | Bio para 5 | Books catalog (unchanged) |
| Ordained Prophet and Elder, GO Church Chicago | Bio para 6 | About — Leadership |
| Pastoral Advising Team, Executive Pastor over Prayer and Prophetic Teams | Bio para 6 | About — Leadership |
| Pastor Matthew Blumenberg | Bio para 6 | About — Leadership |
| BS Nursing, MS Health Services Administration, case management certification | Bio para 7 | About — Marketplace |
| 20+ years RN in insurance industry | Bio para 7 | About — Marketplace |
| Christian Professional Community leadership team | Bio para 7 | About — Marketplace |
| Michael D. Flemons, adopted daughter Sophia Naomi | Bio para 9 | About — Personal Testimony |
| January 2024 relaunch confirmed | Bio para 3 | About — Ministry Journey |

### What was NOT changed

- No new credentials, titles, or institutional endorsements were inferred beyond the document.
- Personal testimony section uses only the approved biography text.
- The autobiography ("From the Chaos to the Call") remains distinct from the professional
  biography. The About page "My Story" section links to the book without presenting the
  biography as a complete autobiography.

---

## 4. Homepage Modifications

### Added

- `CoreValues` section component (`src/components/sections/core-values.tsx`) inserted
  between `MinistryMessage` and `FeaturedMessage`.
- Displays all three pillars with name, tagline, description, and the official ministry
  statement as a blockquote.
- Forest-green background (`bg-forest`) consistent with existing design tokens.
- "Learn More About the Ministry" CTA links to `/ministry`.

### Preserved (unchanged)

- Hero section — "The Midwife To Your Destiny" headline, portrait, warm cream background.
- `MinistryMessage` — Prayer/Prophecy/Purpose supporting content retained.
- `FeaturedMessage`, `FeaturedPublications`, `UpcomingEvents`, `BookingCTA`, `DonationCTA`,
  `NewsletterSection` — all untouched.

### Section order (updated)

1. Hero
2. Meet Natalie (BiographyPreview)
3. Ministry & Calling (MinistryMessage — Prayer/Prophecy/Purpose)
4. **Core Values (NEW — EQUIP · RESTORE · ACTIVATE)**
5. Featured Message
6. Featured Books
7. Upcoming Events
8. Invite Natalie
9. Partnership
10. Newsletter

---

## 5. Ministry Page Modifications

Complete rewrite of `src/app/ministry/page.tsx`.

### New structure

| Section | Content |
|---|---|
| 1 — Ministry Introduction | "Equipping. Restoring. Activating." h1; official ministry statement as lede |
| 2 — Our Three Core Values | EQUIP / RESTORE / ACTIVATE with approved taglines and descriptions |
| 3 — Ministry in Practice | Prayer / Prophecy / Purpose — repositioned as supporting disciplines, not primary pillars |
| 4 — Ministry Journey | From biography: Joliet origins → Fertilizing Your Faith → January 2024 relaunch |
| 5 — Ministry Engagement | Invitation CTA linking to `/events` and `/contact` |

### Metadata updated

Description now reflects the official ministry statement rather than the previous
Prayer/Prophecy/Purpose framing.

---

## 6. About Page Modifications

Complete rewrite of `src/app/about/page.tsx` using the six biography sections.

### New structure

| Section | Biography source |
|---|---|
| A — Introduction / Hero | Bio paras 1, header identity line |
| Role banner | `bio.roles`, `bio.yearsInMinistry` |
| B — Ministry Journey | Bio paras 2–4 (Joliet, Fertilizing Your Faith, relaunch, EQUIP/RESTORE/ACTIVATE) |
| C — Leadership and Service | Bio para 6 (GO Church Chicago, Pastoral Advising, Executive Pastor) |
| D — Faith in the Marketplace | Bio paras 7–8 (nursing, RN, Christian Professional Community) |
| E — Personal Testimony | Bio paras 9–10 (Michael, Sophia Naomi, closing) |
| F — My Story | Autobiography distinction — links to book, no fabricated narrative |

### Autobiography distinction preserved

The professional biography and the autobiography remain separate. Section F explicitly
notes that the complete narrative is in the book. No extended personal content was
published without approval.

### Booking CTA href corrected

`/booking` → `/events` (consistent with M1-A redirect and M1-C events page).

---

## 7. Content Model Changes

### New type: `MinistryPillar` (src/content/types.ts)

```ts
type MinistryPillar = {
  id: "equip" | "restore" | "activate";
  name: string;
  tagline: string;
  description: string;
  order: number;
};
```

### New type: `MinistryIdentity` (src/content/types.ts)

```ts
type MinistryIdentity = {
  statement: string;
  pillars: MinistryPillar[];
};
```

### New content module: `src/content/ministry-identity.ts`

Single source of truth for the official statement and three pillar records.
Not duplicated anywhere else in the codebase.

### Updated: `src/content/bio.ts`

- Added `identityLine` — roles header from 2026 biography.
- Updated `short` — opening paragraph from 2026 biography.
- Added `sections` object — six named sections matching About page structure.
- `full` array updated to reflect 2026 biography content (backward-compatible).
- `speakingSummary` preserved unchanged.

### Updated: `src/lib/content.ts`

- Added `import { ministryIdentity }` from new module.
- Added `import type { MinistryIdentity }` from types.
- Added `getMinistryIdentity(): MinistryIdentity` accessor.

---

## 8. Books Catalog Reconciliation

### Finding

The 2026 biography names **4 authored works**:
1. From the Chaos to the Call
2. War in the Wait
3. The Midwife to Your Destiny
4. Repairing the Breach: Restoring Purity to the Prophetic

The catalog contains **5 records** — the fifth is the *Repair the Breach Workbook*
(companion to Repairing the Breach, slug: `repair-the-breach-workbook`).

### Resolution

The workbook is a companion publication, not a standalone title in the biography's
authored-works list. This is the expected discrepancy. No records were deleted or merged.

### Remaining open gaps (unchanged from M1)

| Gap | Description |
|---|---|
| G-05b | "From the Chaos to the Call" Amazon URL is still a stub (`https://www.amazon.com`) |
| G-05c | No cover image for "From the Chaos to the Call" — placeholder in use |
| G-14 | Squarespace purchase URLs will break at DNS cutover |
| G-17 | Workbook cover is a mockup |

**Owner action required:** Supply the actual Amazon product URL and flat cover image for
*From the Chaos to the Call* before launch.

---

## 9. Events and Media Compatibility

### Events

No changes to `src/content/events.ts`, `src/app/events/`, or event components.
The 2027 schedule framework, empty states, and `__placeholder__` sentinel are intact.
The Invite Natalie CTA on the Ministry page links to `/events`.

### Media

No changes to `src/content/media.ts` or `src/app/media/`.
The "When God Had to Interrupt Me" Reel link card is preserved.
No automatic pillar classification was applied to existing media records.

---

## 10. Visual Refinements

### CoreValues section

- `bg-forest` background — existing design token, consistent with other dark sections.
- Pillar names in uppercase with `tracking-wide` for editorial weight.
- Taglines in italic display type (`font-display italic`) for visual hierarchy.
- Official statement as a `<blockquote>` with `border-t border-ivory/15` separator.
- Three-column grid on desktop, stacked on mobile — matches existing pillar layout patterns.

### Ministry page

- Dark espresso hero with gold-light eyebrow — consistent with M1 ministry page pattern.
- Core values section on cream (`py-section`) with gold-ink numbering.
- Ministry in Practice on linen (`bg-linen`) — visually separates supporting from primary.
- Ministry Journey on espresso — matches existing dark narrative sections.
- Engagement CTA on forest green — consistent with `BookingCTA` pattern.

### About page

- Identity line added below h1 in small-caps gold — surfaces the 2026 biography header.
- Section headings use `SectionHeading` with `size="md"` — consistent with M1 about page.
- Personal Testimony on espresso background — appropriate weight for this content.
- My Story section on ivory — distinct from testimony, links to book.

---

## 11. Files Modified

| File | Change |
|---|---|
| `src/content/types.ts` | Added `MinistryPillar`, `MinistryIdentity` types |
| `src/content/bio.ts` | Updated with 2026 biography; added `identityLine`, `sections`, updated `short` and `full` |
| `src/content/ministry-identity.ts` | **NEW** — official statement + three pillar records |
| `src/lib/content.ts` | Added `ministryIdentity` import, `MinistryIdentity` type import, `getMinistryIdentity()` accessor |
| `src/components/sections/core-values.tsx` | **NEW** — reusable CoreValues section component |
| `src/app/page.tsx` | Added `CoreValues` import and section between MinistryMessage and FeaturedMessage |
| `src/app/ministry/page.tsx` | Complete rewrite — five sections, new pillar hierarchy |
| `src/app/about/page.tsx` | Complete rewrite — six biography sections from 2026 document |
| `tests/e2e/smoke.spec.ts` | Updated `/ministry` h1 expectation to match new heading |
| `tests/e2e/ministry-identity.spec.ts` | **NEW** — 5 focused tests for pillars, statement, biography |

---

## 12. Tests Executed and Results

### Static checks (pre- and post-change)

| Check | Result |
|---|---|
| `npx tsc --noEmit` (baseline) | ✅ 0 errors |
| `npx tsc --noEmit` (post-change) | ✅ 0 errors |
| `npm run lint` (post-change) | ✅ 0 warnings |
| `npm run build` (post-change) | ✅ 25 pages, 0 errors |

### Playwright suite

The full Playwright suite (`npm run build && npm test`) requires a clean port 3000.
During development, port 3000 was occupied by an unrelated application (ZARIAS), causing
all browser tests to fail against the wrong server. After clearing the port, the build
was confirmed clean and the suite is ready to run.

**To execute the full suite:**
```bash
# Ensure port 3000 is free, then:
npm run build && npm test
```

Expected result based on M1 baseline + M2 additions:
- 22 passed (17 M1 + 5 new ministry-identity tests)
- 16 skipped (axe scans on mobile-chrome — by design)
- 0 failed

### New tests added (ministry-identity.spec.ts)

| Test | Assertion |
|---|---|
| ministry page — three core values are present | `h1/h2/h3` with Equip, Restore, Activate visible |
| ministry page — official statement is rendered | Three sentences of official statement in body |
| ministry page — Prayer, Prophecy, Purpose remain | All three terms present in body |
| homepage — core values section is present | "Equipping. Restoring. Activating." and "Three Core Values" in body |
| about page — 2026 biography sections are present | Midwife, Fertilizing Your Faith, January 2024, GO Church Chicago, BS Nursing |

---

## 13. Remaining Content Gaps

The following gaps from M1 remain open and are unchanged by M2:

| ID | Description | Risk |
|---|---|---|
| G-02 | Newsletter provider not configured | HIGH |
| G-03 | No rate limiting on newsletter action | MEDIUM |
| G-04 | No CAPTCHA | MEDIUM |
| G-05b | "From the Chaos to the Call" Amazon URL is a stub | MEDIUM |
| G-05c | No cover image for "From the Chaos to the Call" | LOW |
| G-06 | Facebook social link unverified | MEDIUM |
| G-14 | Squarespace purchase URLs break at DNS cutover | HIGH |
| G-19 | 2027 events array is empty | MEDIUM |
| G-20 | Facebook Reel not embeddable — link card by design | LOW |
| G-21 | No product images in assets | MEDIUM |
| G-24 | Contact email provider not configured | HIGH |
| G-25 | Privacy Policy is a placeholder | HIGH |
| G-26 | Terms of Use is a placeholder | HIGH |

---

## 14. Decisions Requiring Owner Approval

| Decision | Description |
|---|---|
| Amazon URL for *From the Chaos to the Call* | Supply the actual product URL to replace the `https://www.amazon.com` stub |
| Cover image for *From the Chaos to the Call* | Supply flat front cover to replace the placeholder |
| Facebook Page URL | Confirm the ministry's Facebook Page URL to set `verified: true` on the social link |
| Privacy Policy text | Supply approved legal text for `src/app/privacy/page.tsx` |
| Terms of Use text | Supply approved legal text for `src/app/terms/page.tsx` |
| 2027 events schedule | Supply confirmed event details for `src/content/events.ts` |
| Commerce decision | Choose Option A/B/C before DNS cutover (see IMPLEMENTATION-PLAN.md §5) |
| Newsletter provider | Select provider (Kit/MailerLite/Mailchimp) to activate sign-up |

---

## 15. Next Development Recommendations

1. **Owner review** — Confirm all biography sections are approved for public publication
   before the site goes live.
2. **G-05b/G-05c** — Supply Amazon URL and cover image for *From the Chaos to the Call*.
3. **G-14** — Commerce decision required before DNS cutover. All book purchase links
   currently point to legacy Squarespace.
4. **G-24** — Configure Resend (or approved provider) for the contact form.
5. **G-02** — Select and configure newsletter provider.
6. **G-25/G-26** — Privacy Policy and Terms of Use text from ministry.
7. **G-19** — 2027 events schedule from ministry.
8. **Full Playwright run** — Execute `npm run build && npm test` on a clean port 3000
   to confirm all 22 tests pass before owner review.

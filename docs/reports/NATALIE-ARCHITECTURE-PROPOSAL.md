# NATALIE-ARCHITECTURE-PROPOSAL.md
<!-- Produced: Checkpoint A — Audit and Architecture Approval -->
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->
<!-- Status: ARCHIVED — pre-M1 proposal. All routes listed as 404 below have since been built. -->
<!-- See CURRENT-ARCHITECTURE-CONTRACT.md for the authoritative current state. -->

> ⚠️ **ARCHIVED DOCUMENT.** This is the pre-implementation architecture proposal
> written before M1 began. All routes shown as ❌ 404 in §1 have been built
> (M1–M3). Gate decisions have been resolved. Do not use this document as a
> reference for current application state. See `docs/CURRENT-ARCHITECTURE-CONTRACT.md`.

---

---

## 1. Existing Architecture (Confirmed)

### Stack
- Next.js 16.4.0 — App Router, React Server Components, Cache Components API
- React 19.3.0 / TypeScript strict
- Tailwind CSS v4 (via @tailwindcss/turbopack)
- Motion 14 (client islands only)
- Zod 4 (form validation)
- next/font (Cormorant Garamond + Manrope, self-hosted at build time)
- next/image (AVIF/WebP, blur placeholders)
- No database. No CMS. No auth. No API routes.

### Current routes
| Route | Status |
|---|---|
| `/` | ✅ Built — full homepage |
| `/about` | ❌ 404 (branded not-found) |
| `/books` | ❌ 404 |
| `/books/[slug]` | ❌ 404 |
| `/store` | ❌ 404 |
| `/booking` | ❌ 404 |
| `/contact` | ❌ 404 |
| `/donate` | ❌ 404 |
| `/privacy` | ❌ 404 |
| `/terms` | ❌ 404 |

### Current navigation (src/content/site.ts)
Main nav: About · Books · Store · Booking · Contact
Give CTA: /donate
Legal nav: Privacy Policy · Terms of Use

### Content layer
All content lives in typed TS modules under `src/content/`. Pages read
exclusively through `src/lib/content.ts` accessors. This is the CMS-swap
boundary — the correct pattern to preserve.

### Component inventory
```
layout/    SiteHeader, SiteFooter, DesktopNavigation, MobileNavigation, Wordmark
sections/  HeroSection, BiographyPreview, MinistryMessage, FeaturedPublications,
           BookCard, BookingCTA, DonationCTA, NewsletterSection
forms/     NewsletterForm (client component, useActionState)
motion/    Reveal (scroll-reveal wrapper)
seo/       JsonLd
ui/        ButtonLink, Container, Eyebrow, SectionHeading, SocialIcon
```

### Image assets confirmed in src/assets/images/
- natalie-portrait-autumn.jpg ✅
- natalie-portrait-garden.jpg ✅
- cover-repairing-the-breach.jpg ✅
- cover-the-midwife-to-your-destiny.jpg ✅
- cover-war-in-the-wait.png ✅
- cover-repair-the-breach-workbook-mockup.jpg ✅ (mockup, not flat cover)

### Design tokens (src/app/globals.css)
ivory · linen · sand · espresso · stone · gold · gold-ink · gold-light ·
ember · ember-deep · forest · mist
Fluid type scale: display-xl through display-sm, lede, eyebrow
Fluid spacing: --spacing-section, --spacing-gutter
Motion: rise (fade+slide-up), fade — both disabled under prefers-reduced-motion

---

## 2. Restructuring Directive — Gap Analysis

The directive introduces routes and features not present in the current
application. This table maps each requested route to its implementation status
and what is required.

| Requested route | Current state | What is needed |
|---|---|---|
| `/` | ✅ Built | Refine: add Featured Message section, Upcoming Events section |
| `/about` | ❌ 404 | Build new route |
| `/about/my-story` | ❌ 404 | Build only if autobiography content is supplied and approved |
| `/ministry` | ❌ 404 | Build new route (content exists in homeContent.message pillars) |
| `/books` | ❌ 404 | Build new route (data exists in src/content/books.ts) |
| `/books/[slug]` | ❌ 404 | Build dynamic route (data exists) |
| `/events` | ❌ 404 | Build new route — requires events data model decision |
| `/events/[slug]` | ❌ 404 | Build dynamic route — same dependency |
| `/media` | ❌ 404 | Build new route — requires Facebook embedding decision |
| `/store` | ❌ 404 | Build presentation layer (no commerce backend exists) |
| `/partnerships` | ❌ 404 | Build new route (replaces /donate; content exists) |
| `/contact` | ❌ 404 | Build new route — requires email delivery decision |
| `/donate` | ❌ 404 | Redirect to /partnerships or keep as standalone giving page |
| `/booking` | ❌ 404 | Redirect to /events or /contact per new IA |
| `/privacy` | ❌ 404 | Build — requires policy text from ministry |
| `/terms` | ❌ 404 | Build — requires policy text from ministry |

### Navigation changes required
Current main nav: About · Books · Store · Booking · Contact
Proposed main nav: About · Ministry · Books · Events · Media
Proposed secondary/footer: Store · Partnerships · Contact · Privacy · Social

This requires changes to `src/content/site.ts` (mainNavigation array) and
corresponding updates to SiteHeader and SiteFooter.

---

## 3. Component Reuse Opportunities

The following existing components can be reused without modification:

| Component | Reusable for |
|---|---|
| `Container` | All new pages |
| `Eyebrow` | All new section headers |
| `SectionHeading` | All new sections |
| `ButtonLink` | All CTAs |
| `Reveal` | All new sections (scroll animation) |
| `BookCard` | /books index, /books/[slug] related titles |
| `NewsletterSection` | /about, /ministry, /contact footers |
| `DonationCTA` | /partnerships |
| `BookingCTA` | /events, /ministry |
| `JsonLd` | All new pages with structured data |

New components required (proposed names):

| Component | Purpose |
|---|---|
| `FeaturedMessage` | Homepage — single curated Facebook video |
| `UpcomingEvents` | Homepage — next 2–3 events from events content |
| `EventCard` | /events index and homepage preview |
| `EventDetail` | /events/[slug] |
| `MonthCalendar` | /events — month navigation |
| `MediaGrid` | /media — video card grid |
| `VideoCard` | /media — individual video with lazy-load embed |
| `StoreGrid` | /store — merchandise presentation |
| `ProductCard` | /store — individual product |
| `ContactForm` | /contact — general inquiry form |
| `BookingForm` | /contact or /events — invite Natalie form |
| `LongformLayout` | /about/my-story — chapter/section editorial layout |
| `MinistryPillar` | /ministry — expanded pillar detail |

---

## 4. Books / Store Separation Strategy

### Books (/books, /books/[slug])
- Authoritative source: `src/content/books.ts` (existing, typed)
- Purpose: editorial publications catalog — authored works, their messages,
  descriptions, and approved purchase links
- No inventory, no cart, no checkout
- Purchase links remain outbound to Squarespace (current) or future commerce
  destination per commerce decision
- Add `status` field to Book type: `"published" | "forthcoming" | "unavailable"`
  — currently all books are implicitly published; this makes state explicit
  without inventing data
- "From the Chaos to the Call" (autobiography): add to catalog with Amazon
  link only if ministry confirms (G-05 in KNOWN-GAPS.md)

### Store (/store)
- Separate route, accessible from footer only (not main nav)
- Presentation layer only — no commerce backend exists
- Products: Pray Hoodies ($55), Pray T-shirts ($25) — verified in SITE-AUDIT.md §5
- New content module: `src/content/products.ts` (typed, same pattern as books.ts)
- Purchase links: outbound to Squarespace product pages (same as books, same
  DNS-cutover risk — G-14)
- No inventory display (stock data not available in this application)
- No cart, no checkout, no order processing

### Invariant preserved
Books and Store are separate content modules with separate routes.
They must never share a unified product catalog.

---

## 5. Events Data Model and Management Requirements

### Current state
No events system exists. No database. No CMS.

### Proposed approach — static content module (no new infrastructure)
Given the constraint of no database without approval, the simplest approach
that satisfies the directive is a typed TS content module:

```
src/content/events.ts
```

This follows the exact same pattern as `src/content/books.ts` and preserves
the CMS-swap boundary at `src/lib/content.ts`.

**Tradeoff:** updating events requires editing a TS file and redeploying.
For a 2027 annual schedule with infrequent updates, this is acceptable.
If the ministry needs to update events without a code deploy, a CMS or
headless data source must be approved before implementation.

### Proposed Event type

```ts
type EventStatus = "scheduled" | "postponed" | "cancelled" | "completed";
type EventCategory = "conference" | "workshop" | "service" | "appearance" | "other";

type MinistryEvent = {
  id: string;                    // UUID, application-assigned
  slug: string;                  // URL-safe, immutable after publish
  title: string;
  description: string;
  startDate: string;             // ISO 8601, e.g. "2027-03-15T10:00:00"
  endDate?: string;              // ISO 8601
  timeZone: string;              // IANA tz, e.g. "America/Chicago"
  venue?: string;
  city: string;
  state?: string;
  country: string;
  isPublic: boolean;
  category: EventCategory;
  coverImage?: ImageAsset;
  registrationUrl?: string;
  status: EventStatus;
  published: boolean;            // false = draft, not rendered
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}
```

### Content accessors to add to src/lib/content.ts
```ts
getEvents(): MinistryEvent[]          // all published events
getUpcomingEvents(n): MinistryEvent[] // next n published scheduled events
getEventsByYear(year): MinistryEvent[]
getEventsByMonth(year, month): MinistryEvent[]
getEvent(slug): MinistryEvent | undefined
```

### 2027 schedule
No events have been supplied by the ministry. The events array will be
initialized empty. Months without events display a neutral empty state.
Do not generate fictional events.

### Invite Natalie workflow
No functioning inquiry system exists (G-15 in KNOWN-GAPS.md). The Invite
Natalie CTA will link to `/contact` with a pre-selected "Booking inquiry"
subject. A real form with email delivery requires approval of an email
provider (Resend is proposed in IMPLEMENTATION-PLAN.md §4).

---

## 6. Facebook Video / Media Integration Approach

### Current state
No media page exists. No Facebook API credentials. No embed infrastructure.

### Proposed approach — privacy-first user-initiated embeds

**Method:** manually curated public Facebook video URLs stored in a typed
content module (`src/content/media.ts`). No Graph API. No scraping.

**Embedding:** Facebook provides an oEmbed-compatible iframe embed for public
videos. The simplest reliable approach is a client component that:
1. Renders a static preview (thumbnail image + play button overlay)
2. On user click, replaces the preview with the Facebook iframe embed
3. Falls back to an external "Watch on Facebook" link if the embed fails
   or is blocked by the browser

This is privacy-conscious (no Facebook JS loads until the user initiates),
avoids the Facebook JS SDK entirely, and requires no API credentials.

**Limitation:** Facebook oEmbed requires the video to be public. Private or
friends-only videos cannot be embedded. This must be communicated to the
ministry when curating content.

### Proposed Video type

```ts
type VideoCategory =
  | "ministry-message"
  | "biblical-teaching"
  | "interview"
  | "personal-reflection"
  | "event-highlight";

type CuratedVideo = {
  id: string;
  title: string;
  description: string;
  category: VideoCategory;
  facebookUrl: string;           // validated: must match facebook.com/*/videos/* pattern
  thumbnailImage?: ImageAsset;   // optional approved preview image
  featured: boolean;             // one video selected for homepage FeaturedMessage
  published: boolean;
  displayOrder: number;
  createdAt: string;
}
```

### URL validation rule
`facebookUrl` must match the pattern:
`https://www.facebook.com/[page-or-profile]/videos/[video-id]/`
Arbitrary URLs must not be rendered as iframes.

### Homepage FeaturedMessage component
- Renders the single video where `featured: true`
- If no featured video exists or Facebook is unavailable, the section is
  omitted gracefully (same pattern as FeaturedPublications returning null)
- The homepage must remain fully operational without this section

### Content module initialized empty
No videos have been supplied or approved by the ministry. The media array
will be initialized empty. The /media page will display a neutral empty state.

---

## 7. Autobiography / My Story

### Current state
"From the Chaos to the Call" is referenced in SITE-AUDIT.md as an unlinked
legacy Squarespace page with an Amazon purchase link. It is not in the current
book catalog (G-05). Its publication status is unconfirmed.

### Findings
- If it is a published book: add to `src/content/books.ts` with Amazon
  purchase link and a `/books/from-the-chaos-to-the-call` detail page.
- If it is a long-form personal narrative for the website: build
  `/about/my-story` using a LongformLayout component.
- If it is an unpublished manuscript: do not publish any content from it
  without explicit editorial approval.

### Decision required from ministry (before implementation)
1. Is "From the Chaos to the Call" a published book, forthcoming book,
   or website narrative?
2. If published: confirm Amazon URL and whether it should appear in the
   book catalog.
3. If narrative: supply approved excerpts, chapter titles, and photographs.

### /about/my-story route
Will not be built until the ministry supplies and approves content.
The route will show the branded 404 until then.

---

## 8. Database and Integration Requirements

### What exists today
- No database
- No CMS
- No email delivery service
- No analytics
- No error tracking

### What is needed for the restructured site

| Capability | Required for | Proposed solution | Approval needed |
|---|---|---|---|
| Events data | /events, /events/[slug] | Static TS module (no new infra) | No — same pattern as books |
| Media data | /media, homepage FeaturedMessage | Static TS module | No — same pattern |
| Products data | /store | Static TS module | No — same pattern |
| Contact/booking form delivery | /contact | Resend (email API) | YES — new integration |
| Newsletter provider | Newsletter sign-up | Kit / MailerLite / Mailchimp | YES — new integration |
| Analytics | All pages | Vercel Analytics or GA4 | YES — new integration |
| Error tracking | All pages | Sentry | YES — new integration |
| Policy text | /privacy, /terms | Ministry to supply | YES — content approval |

### What is NOT needed (and must not be introduced without approval)
- Database (events and media fit in static TS modules at current scale)
- CMS (content is manageable via TS files at current scale)
- Auth / admin dashboard
- Stripe Checkout (commerce decision still pending — G-07, G-14)
- Facebook Graph API credentials

---

## 9. Estimated Implementation Effort

Phases are sized relative to each other, not as calendar estimates.

| Phase | Scope | Relative effort |
|---|---|---|
| M1-A | Navigation restructure + content module additions (events, media, products) | Small |
| M1-B | /about, /ministry, /books, /books/[slug], /store | Medium |
| M1-C | /events, /events/[slug] | Medium |
| M1-D | /media, homepage FeaturedMessage + UpcomingEvents sections | Medium |
| M1-E | /partnerships, /contact (static form, no delivery), /privacy, /terms | Small |
| M1-F | Playwright smoke tests + axe scans for all new routes | Small |
| M2-A | Contact/booking form with Resend email delivery | Medium |
| M2-B | Newsletter provider integration + rate limiting + Turnstile | Medium |
| M2-C | Commerce decision implementation | Medium–Large |

---

## 10. Identified Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Facebook embeds blocked by browser privacy settings | MEDIUM | User-initiated load + "Watch on Facebook" fallback |
| Squarespace purchase URLs break at DNS cutover | HIGH | Commerce decision must be resolved before cutover (G-14) |
| /about/my-story built without approved content | HIGH | Do not build until ministry supplies content |
| Events displayed as empty for 2027 until ministry supplies schedule | LOW | Neutral empty state per month; no fictional events |
| Contact form built without email delivery | MEDIUM | Form renders but shows honest "unavailable" state (same pattern as newsletter) |
| Navigation restructure breaks existing bookmarks | LOW | Add 301 redirects: /booking → /contact, /donate → /partnerships |
| No tests before new routes go live | HIGH | Playwright smoke tests required in M1-F before any route is considered complete |

---

## 11. Decisions Required Before Implementation Begins

The following decisions must be confirmed by the product owner before
implementation of the corresponding phase starts. Implementation will stop
at each gate until the decision is received.

### Gate 1 — Before M1-A (navigation and content modules)
- [ ] Confirm new primary navigation: About · Ministry · Books · Events · Media
- [ ] Confirm Store moves to footer only
- [ ] Confirm /booking redirects to /contact (or /events)
- [ ] Confirm /donate redirects to /partnerships (or remains as /donate)

### Gate 2 — Before M1-B (/about, /books, /store)
- [ ] Confirm "From the Chaos to the Call" inclusion and purchase URL (G-05)
- [ ] Confirm Book `status` field values for each existing title
- [ ] Confirm Store products: Pray Hoodies and Pray T-shirts only, or others?
- [ ] Confirm Squarespace store purchase URLs are still live

### Gate 3 — Before M1-C (/events)
- [ ] Confirm events data model is acceptable (static TS module vs. CMS)
- [ ] Supply any confirmed 2027 events, or confirm the schedule is empty at launch
- [ ] Confirm Invite Natalie CTA destination (/contact with booking subject)

### Gate 4 — Before M1-D (/media)
- [ ] Supply at least one approved public Facebook video URL, or confirm
      the media page launches empty
- [ ] Confirm the privacy-first user-initiated embed approach is acceptable

### Gate 5 — Before M1-E (/contact, /privacy, /terms)
- [ ] Supply privacy policy text, or approve drafting a standard template
- [ ] Supply terms of use text, or approve drafting a standard template
- [ ] Confirm contact form fields (general inquiry vs. booking inquiry on same page
      or separate pages)
- [ ] Confirm email delivery provider (Resend recommended) — or accept that
      the form launches in "unavailable" state like the newsletter

### Gate 6 — Before M2-A (email delivery)
- [ ] Provide Resend API key and confirm natalieflemons.com domain verification
- [ ] Confirm email recipient address for contact/booking submissions

### Gate 7 — Before M2-B (newsletter)
- [ ] Select newsletter provider (Kit, MailerLite, Mailchimp, or other)
- [ ] Provide API key

### Gate 8 — Before M2-C (commerce)
- [ ] Commerce decision: Option A (keep Squarespace links), B (Stripe Checkout),
      or C (hosted platform)

---

## 12. Proposed Implementation Sequence (post-approval)

```
Gate 1 approval
    ↓
M1-A: Navigation restructure + content modules (events, media, products)
    ↓
Gate 2 approval
    ↓
M1-B: /about, /ministry, /books, /books/[slug], /store
    ↓
Gate 3 approval
    ↓
M1-C: /events, /events/[slug]
    ↓
Gate 4 approval
    ↓
M1-D: /media, homepage FeaturedMessage + UpcomingEvents
    ↓
Gate 5 approval
    ↓
M1-E: /partnerships, /contact, /privacy, /terms
    ↓
M1-F: Playwright smoke tests + axe scans (all new routes)
    ↓
Git checkpoint — M1 complete
    ↓
Gates 6–8 approvals (can proceed in parallel)
    ↓
M2-A/B/C: Integrations and commerce
    ↓
Git checkpoint — M2 complete
```

---

## STOP — Awaiting Owner Approval

This document is Checkpoint A as defined in Phase 11 of the restructuring
directive. No source code changes have been made.

Implementation will begin only after the product owner reviews this proposal
and provides approval, starting with Gate 1 decisions above.

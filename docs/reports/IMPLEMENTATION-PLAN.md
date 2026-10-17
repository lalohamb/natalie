# Implementation Plan — Natalie Flemons Ministries (Proposal)

**Status:** PROPOSED. Awaiting approval. No application code has been written.
**Basis:** [SITE-AUDIT.md](./SITE-AUDIT.md) (2026-10-10)

---

## 1. Visual Direction

**Concept: "Warm Editorial."** It reads like a well-art-directed author's site and a quality magazine profile. The palette comes from the brand's own materials rather than a generic ministry template.

The brief proposed plum. The audit points to a different choice: Natalie's portraits, the merch, and the book covers are dominated by **burnt orange, hunter green, and gold**, and plum would clash with every existing photo. The recommendation below keeps the brief's ivory/espresso/champagne-gold structure and replaces plum with colors the brand already uses.

| Token | Value (proposed) | Use |
|---|---|---|
| `ivory` | `#FAF6EF` | Page background |
| `linen` | `#F1E9DC` | Alternate section background |
| `espresso` | `#2A211C` | Primary text, dark sections, footer |
| `gold` | `#B08D3C` (derived from site's `#be9b35`, darkened for AA on ivory) | Hairlines, small caps labels, focus rings. Never body text on ivory |
| `ember` | `#B4532A` (burnt orange) | Primary CTA, used sparingly |
| `forest` | `#2F4A3A` (hunter green) | Secondary dark section (Partner/Booking band) |
| `stone` | `#6B625A` | Secondary text (AA on ivory) |

All pairs will be validated for WCAG AA before use.

**Typography:** *Cormorant Garamond* (display, 500–600, generous tracking on small-caps eyebrows) + *Manrope* (UI/body, 400–600), both via `next/font` (self-hosted, no layout shift). The scale is a fluid `clamp()` scale with about 1.25 ratio, and the hero display tops out around 88px.

**Signature details (restrained):**
- Thin gold rules and small-caps eyebrows ("THE MINISTRY · 01").
- Portrait photography in tall editorial crops with offset linen panels instead of rounded cards.
- Books shown as large covers with a soft shadow on linen, styled like a publisher's catalog rather than a product grid.
- The NF monogram is used once as a quiet watermark/favicon. A **refined text wordmark** ("Natalie Flemons" + small-caps "MINISTRIES") goes in the header.
- Motion: 400ms fade/slide-up on section entry and image hover lifts. Disabled under `prefers-reduced-motion`.

## 2. Site Map

```
/                      Home
/about                 About Natalie
/books                 Books & Publications
/books/[slug]          repairing-the-breach · repair-the-breach-workbook ·
                       the-midwife-to-your-destiny · war-in-the-wait
                       (From the Chaos to the Call → listed on /books with Amazon link, pending approval)
/store                 Ministry Store
/store/[slug]          pray-hoodie · pray-t-shirt
/cart                  Cart (only if Stripe commerce approved)
/checkout/success      Order received (non-authoritative; fulfilment happens via webhook)
/donate                Partner With the Vision
/booking               Invite Natalie (booking inquiry)
/contact               General contact
/privacy · /terms · /shipping-returns    Policies (text supplied/approved by ministry)
```

Header nav: **About · Books · Store · Booking · Contact** + a **Give** button (ember). Mobile uses a full-height sheet menu.

## 3. Homepage Composition

| # | Section | Content source |
|---|---|---|
| A | Hero: split layout (portrait right, type left on ivory). This avoids a full-bleed text-over-photo hero, because the current portraits are busy outdoor shots. "THE MIDWIFE TO YOUR DESTINY" / "Leading people from their chaos to their call." CTAs: Meet Natalie · Explore the Books · UPCOMING EVENTS | Verified brand lines |
| B | Introduction: DSC00295 portrait + condensed bio + "Read her story" | About bio |
| C | Ministry message: three typographic pillars **Prayer · Prophecy · Purpose**, drawn from bio phrasing ("ministry of prayer and prophecy", "shaping destinies"). No invented programs | Bio |
| D | Featured publications: catalog layout with RTB as the lead title and the other three in a row | Verified product data |
| E | Invite Natalie: forest-green band | Bio ("sought-after speaker, spiritual advisor") |
| F | Partner With the Vision: "You are sowing into good ground." → Give Today | Donate page |
| G | Newsletter: email + consent line | Pending provider |
| H | Footer: wordmark, nav, info@natalieflemons.com, Instagram (+ Facebook if confirmed), Give, policies, © Natalie Flemons Ministries LLC | Verified |

## 4. Technical Architecture

- **Next.js** (current stable, App Router) · TypeScript strict · Tailwind CSS v4 · shadcn/ui primitives (Sheet, Select, Dialog, Toast only as needed) · lucide-react · `motion` (client islands only).
- RSC by default. Client components only for mobile nav, cart, variant pickers, and forms.
- **Content layer:** typed TS modules in `src/content/` (`site.ts`, `books.ts`, `products.ts`, `bio.ts`, `navigation.ts`) validated with Zod at build time. Pages read through `src/lib/content.ts` accessors, so a CMS (Sanity) can later replace the accessors without touching pages.
- **Forms:** Server Actions + Zod (shared client/server schema), honeypot field, **Cloudflare Turnstile** (free), and a best-effort per-IP rate limit. Email via **Resend**. If env keys are absent, the forms show an honest "temporarily unavailable — email info@…" state and never fake success.
- **SEO:** Metadata API per route, `sitemap.ts`, `robots.ts`, generated OG images (`opengraph-image.tsx`), JSON-LD: `Person` (Natalie), `Organization` (NFM LLC), `Book` + `Offer`, `Product` + `Offer`, `BreadcrumbList`. Only verified attributes go in the structured data (no ISBNs until supplied).
- **Images:** migrated into `public/images/` (or Vercel Blob later) and served via `next/image` (AVIF/WebP). No Squarespace hotlinks.
- **Hosting:** Vercel (recommended). Squarespace stays live until acceptance, then DNS cutover.

```
src/
  app/            routes, layouts, sitemap.ts, robots.ts, api/stripe/webhook (if B)
  components/
    layout/       SiteHeader, DesktopNavigation, MobileNavigation, SiteFooter
    sections/     HeroSection, BiographyPreview, EditorialImageSection, BookingCTA, DonationCTA, …
    commerce/     BookCard, ProductCard, VariantPicker, QuantityInput, CartSheet
    forms/        ContactForm, BookingForm, NewsletterForm, Field primitives
    ui/           shadcn primitives, SectionHeading, Breadcrumbs, LoadingState, EmptyState
  content/        typed content (single source of truth)
  lib/            content accessors, env (validated), seo, email, stripe, rate-limit
docs/reports/     audit, architecture, plan, migration, QA
```

## 5. Commerce Strategy

The current store lives inside Squarespace, so **cancelling Squarespace removes checkout**. Option A only works while Squarespace stays active.

| | A. Keep Squarespace links | **B. Stripe Checkout (recommended)** | C. Hosted (Shopify Starter / Lemon Squeezy) |
|---|---|---|---|
| Effort | Lowest | Moderate | Moderate |
| Monthly cost | Squarespace Commerce plan stays | Stripe fees only (they already have a Stripe account for donations) | ~$5+/mo + fees |
| UX | Visitors bounce to old-design site to buy | Native cart → Stripe-hosted payment page | Off-site checkout/buy buttons |
| Inventory | Squarespace tracks it | Manual in content config (fine for ~6 SKUs) or Stripe metadata | Platform tracks it |
| Shipping | Squarespace | Stripe shipping rates (flat rates, set by ministry) | Platform |
| Risk | Two sites to maintain | Webhook + order email must be built and tested | Vendor lock-in, less brand control |

**Recommendation: B.** Use a lightweight client cart and server-built Checkout Sessions with prices looked up from server config (client sends only SKU + qty). Variants are validated server-side, shipping address and flat rates are collected by Stripe, a signature-verified webhook triggers an order notification email to the ministry, and the success page only displays the result. No database is needed at this scale. Sold-out variants are toggled in config.

**Donations:** keep the existing Stripe Payment Link and Cash App as-is for launch, presented on a redesigned `/donate`. Optional later: preset amounts and monthly giving through the same Stripe account (Payment Links support recurring). No tax-deductibility language, because the entity is an LLC.

## 6. Redirect Map (301)

| Old | New |
|---|---|
| `/home` | `/` |
| `/store-1` | `/store` |
| `/store-1/pray-hoodies` | `/store/pray-hoodie` |
| `/store-1/pray-t-shirts` | `/store/pray-t-shirt` |
| `/repairingthebreach`, `/repairingthebreach/prophetic-purity` | `/books/repairing-the-breach` |
| `/repair-the-breach-workbook`, `/repair-the-breach-workbook/training` | `/books/repair-the-breach-workbook` |
| `/the-midwife-to-your-destiny`, `/the-midwife-to-your-destiny/guide` | `/books/the-midwife-to-your-destiny` |
| `/war-in-the-wait-1`, `/war-in-the-wait-1/book`, `/war-in-the-wait-2` | `/books/war-in-the-wait` |
| `/purchase-book` | `/books` (or `/books#from-the-chaos-to-the-call`) |
| `/new-products/*`, `/destinywebinarwithbook/*` | `/books/the-midwife-to-your-destiny` (unless webinar is still offered) |
| `/leap-registration` | `/contact` (unless LEAP returns) |
| `/polaris`, `/vanguard-set`, `/meltdown-tour`, `/read-me-adversary` | `/` |
| `/contact` | `/contact` (booking moves to `/booking`, linked prominently) |

## 7. Booking Form (proposed field set)

Brief fields: name, organization, email, phone, event type (select), event date, location, expected audience size, event description, notes. **Proposed additions carried over from the live form:** Event name, Event theme, Honorarium/budget, and Inquiry purpose (Booking / Collaboration / Other).

Only the essential fields will be required (name, email, organization, event type, date, location, description). The live form makes all 13 fields required.

## 8. Implementation Sequence

1. **Approve** this plan + answers to open questions → write `ARCHITECTURE.md`, `MIGRATION-CHECKLIST.md`.
2. Scaffold Next.js, tokens, fonts, layout shell (header/footer/mobile nav), content models, and migrate assets.
3. Home + About.
4. Books index + detail, Store index + detail (purchase buttons stubbed behind config).
5. Donate, Contact, Booking, policy pages, 404.
6. Integrations, once keys are provided: Resend + Turnstile → newsletter provider → Stripe Checkout + webhook (test mode first).
7. SEO: metadata, JSON-LD, sitemap, robots, OG images, and redirects.
8. QA: build, type check, lint, link crawl, axe/Lighthouse, viewport sweep at 360/768/1024/1440/1920, Stripe test-mode purchase including webhook, real form delivery → `QA-REPORT.md`.
9. Deploy to a Vercel preview → client acceptance → DNS cutover → submit sitemap in Search Console.

Milestone reports are delivered after steps 3, 5, 6, and 8.

## 9. Open Decisions & Required Inputs

**Decisions**
1. Commerce: A, B (recommended), or C?
2. Palette: warm earth (recommended) vs. plum per original brief?
3. Retire Destiny Decisions webinar, LEAP, and template demo pages? Keep *From the Chaos to the Call* (Amazon only)?
4. Newsletter provider: is there an existing list? Options: Kit, MailerLite (free tier), Mailchimp.

**Business facts to confirm**
5. Signed copies of *The Midwife To Your Destiny* still offered? Applies to other books?
6. Workbook availability (in stock vs pre-order/POD). Flat cover file.
7. Shipping rates, regions, processing time, and returns policy. Merch sizing/fabric details.
8. Ministry Facebook Page URL and any other socials.
9. Privacy/terms text, or approval to draft standard templates for the ministry to review.

**Credentials / access (at integration time)**
10. Domain DNS access, and a Vercel account (or preferred host).
11. Resend (or other) API key, with `natalieflemons.com` domain verification.
12. Stripe account access (restricted key + webhook secret), test mode first.
13. Turnstile site/secret keys.

**Assets**
14. Original-resolution portraits + usage rights, vector logo, flat book covers, clean merch photos per color.

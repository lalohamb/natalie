# PRODUCT REQUIREMENTS
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->
<!-- Last updated: M4-Q post-purchase confirmation G-33 (uncommitted working tree) -->

Gap IDs (G-nn) refer to `KNOWN-GAPS.md`.

## User Roles

### Visitor (anonymous public user)
Can:
- Browse all public pages: Home, About, Ministry, Books, book detail, Events,
  Media, Store, Partnerships, Contact, Privacy, Terms
- Buy a book through Stripe-hosted Checkout (one title, quantity 1)
- Follow merchandise links to the external Printify storefront
- Subscribe to the newsletter (delivered to MailerLite when configured)
- Give via Stripe Payment Link, Cash App, or Zelle details
- View the events calendar (Google Calendar) and watch ministry videos
- Follow verified social links (Facebook, Instagram, YouTube)

Cannot:
- Log in or create an account
- Use a cart or buy more than one item per checkout
- Rely on the contact form yet — it sends through Resend when configured,
  but delivery to the ministry inbox is unverified (G-24)

### Administrator / Ministry Operator
Signs in at `/admin/login` with the shared admin password (8-hour session).
Can:
- Manage videos (upload, YouTube, Facebook; publish, feature, order)
- Upload and delete media files and book covers
- Add, edit, delete and publish/unpublish books, including price display,
  cover, purchase method and Stripe price/product IDs
- Connect a Google account and choose the public events calendar
- View MailerLite subscriber stats, groups and subscribers; delete a subscriber
- View Stripe balance and recent payments (filter by status, search by name
  or email); see whether the donation-link env var is set
- View book orders, delivery addresses and revenue per title
- View integration status

Cannot (requires a code change or env change + deploy): edit store products,
bio, ministry copy, navigation, social links, legal pages, the donation
Payment Link, or a book's slug.

There is a single shared credential — no per-user accounts, roles, or audit
trail of admin changes.

### System
Automatically:
- Filters unverified social links from all rendering
- Reports newsletter/contact unavailability honestly
- Seeds videos from static content until the first admin save. Books are not
  seeded: the catalog starts empty and is never reset by the application
- Refreshes the events calendar every 5 minutes
- Generates JSON-LD (homepage, `/about`, book and event pages), Open Graph
  images, sitemap and robots
- Redirects legacy Squarespace URLs (`next.config.ts`) — the book targets
  currently 404 (G-54)
- Serves a branded 404 for unknown routes

---

## Core Features

### F-01: Homepage
Business purpose: primary brand presentation and entry point.
Required data: `homeContent`, bio, ministry identity, featured books, featured
video, giving.
Failure behavior: sections with no data (featured books, featured video) are
omitted; upcoming events falls back to a generic invitation.
"Upcoming Events" shows the next three events from the public calendar.

### F-02: Book catalog and book detail
Business purpose: surface publications and sell them.
User flow: `/books` (category tabs) → `/books/[slug]` → "Purchase".
Required data: published books from the book store.
Success condition: cover, title, price (when set), summary and a working
purchase action render for each published title.
Failure behavior: no cover → "Cover coming soon" placeholder; no price → no
price shown; no purchase option → no button.

### F-03: Newsletter sign-up
Business purpose: build the ministry email audience.
User flow: visitor enters email → submits → sees an honest status message.
Required config: `NEWSLETTER_PROVIDER=mailerlite`, `MAILERLITE_API_KEY`.
Success condition: subscriber created in MailerLite; visitor told
"subscribed" or "already on the list".
Failure behavior: not configured → "not available" message; provider error →
"you were not subscribed"; never fakes success.
Spam protection: honeypot + per-IP rate limit (G-03 resolved M4-O, G-04 open).

### F-04: Giving
Business purpose: enable financial partnership.
User flow: Give CTA → `/donate` → `/partnerships` → Stripe Payment Link /
Cash App / Zelle.
Required data: `getGiving()` (static channels; Stripe link from
`STRIPE_DONATION_PAYMENT_LINK` when set).
No tax-deductibility claim may be made (LLC, not a nonprofit).

### F-05: Speaking invitation
Business purpose: generate ministry/speaking inquiries.
User flow: "Invite Natalie" CTAs → `/contact` or `/events#invite`.
Required config: `CONTACT_EMAIL_PROVIDER=resend`, `RESEND_API_KEY`.
Success condition: ⚠️ UNVERIFIED — the form sends through Resend, but
delivery from the test sender to the ministry inbox is not confirmed (G-24).

### F-06: Branded 404
Renders with `robots: noindex` and CTAs back into the site.

### F-07: Book checkout (added M4)
Business purpose: sell books directly, replacing legacy Squarespace.
User flow: "Purchase" → `/api/checkout` → Stripe Checkout → back to `/books`.
Required config: `STRIPE_SECRET_KEY` (currently a live-mode key, G-42); each
book needs a Stripe Price ID.
Success condition: buyer pays the Stripe price, receives confirmation, and the
ministry has what it needs to fulfil the order.
Failure behavior: Stripe unavailable or rate limit reached → back on the book
page with a message that the buyer was not charged.
Delivery: Stripe collects a shipping address (United States and Canada);
the book page states where books ship; the admin sees the address per order.
Status: ⚠️ Shipping fee undecided (G-32). Confirmation shown on `/books` after
  Stripe redirects back (G-33 resolved M4-Q). Order notification: Stripe
  receipt email + Dashboard (decided M4-Q).

### F-08: Events calendar (added M4)
Business purpose: publish the ministry schedule without code changes.
User flow: `/events` → month calendar → event details.
Required config: Google OAuth connection or `GOOGLE_CALENDAR_ICAL_URL`.
Failure behavior: the heading stays; the calendar area reads "The upcoming
schedule is being finalised."

### F-09: Media library (added M4)
Business purpose: present ministry messages.
User flow: `/media` → category filter → play (self-hosted file, click-to-load
YouTube, or Facebook).

### F-10: Store (merchandise)
Business purpose: route merchandise buyers to the Printify storefront.
Store links go straight to Printify. `/store` remains as a product page
(not in navigation or the sitemap); its prices/variants are static copies (G-41).

### F-11: Admin dashboard (added M4)
See Administrator role above.

---

## Functional Requirements

FR-001: Content must be read through the accessor modules
  (`src/lib/content.ts`, `book-content.ts`, `video-content.ts`, `giving.ts`).
  Pages and components must not import directly from `src/content/*`.
  No known violations.

FR-002: Unverified social links (`verified: false`) must not be rendered.

FR-003: The newsletter server action must never return a success state unless
  the provider accepted the subscription (honeypot response excepted).

FR-004: Purchase buttons render only for `external` (non-empty URL) and
  `stripe-checkout` options. `kind: "none"` renders no purchase UI. On the
  book detail page purchase UI renders only for `status: "published"`.

FR-005: Structured data must only include verified attributes.

FR-006: `"server-only"` imports in provider, storage and store modules must be
  preserved.

FR-007: All text/background colour pairings must meet WCAG 2.2 AA.

FR-008: All animations must be disabled under `prefers-reduced-motion: reduce`.
  The `[data-reveal]` noscript override must be preserved.

FR-009: A skip-to-main-content link must be present and functional on every page.

FR-010: `"use server"` must be present on all server actions.

FR-011 (M4): Every admin page, admin Server Action and admin Route Handler
  must verify the admin session itself; `src/proxy.ts` is convenience only.

FR-012 (M4): The amount charged for a book must come from a Stripe Price
  resolved on the server from the book catalog. ✅ Met (M4-K).

FR-013 (M4): Secret keys must never be exposed with a `NEXT_PUBLIC_` prefix or
  imported into Client Components.

FR-014 (M4): Only public-safe calendar fields (title, time, location,
  plain-text description) may reach the browser; private, confidential and
  cancelled events are dropped.

---

## Non-Functional Requirements

### Performance
- `next/image` with AVIF/WebP for static imagery; `next/font` self-hosting.
- `cacheComponents: true`, `partialPrefetching: true`.
- Hero portrait uses `fetchPriority="high"`.
- Book covers hosted by the site are served through `next/image`.

### Security
- Admin session: HMAC-signed, HTTP-only cookie; login throttled per IP (must
  run behind a reverse proxy).
- Security headers on every response (HSTS, nosniff, frame protection,
  referrer and permissions policies, minimal CSP).
- Secrets server-only; `.env*` gitignored.
- Honeypot on public forms.
- ✅ Rate limiting on newsletter and contact actions (G-03 resolved M4-O); checkout is also limited.
- ❌ No CAPTCHA (G-04).
- ✅ Book-store writes are validated before persisting (G-57 resolved M4-O).

### Accessibility
- Target: WCAG 2.2 AA. Skip link, alt text, reduced motion, focus-visible.
- Automated axe scanning exists for public routes; last recorded pass was M3
  and is stale (G-38); `/about` colour contrast resolved (G-62 resolved M4-O).

### Operability
- ✅ Storage model decided (M4-P, G-53, G-35): content committed to the
  repository; `ADMIN_READONLY=true` disables writes in production. No
  persistent volume required. Backup is git history.
- Node version pinned in `.nvmrc` (22).
- ❌ No separate test-mode environment; development uses live provider
  credentials (G-55).

### Observability
- `console.error` logging at provider boundaries; every uncaught server
  error is logged as one JSON line (`src/instrumentation.ts`).
- Optional, off until configured: error webhook, Google Analytics 4 (G-09).

---

## Feature Status

| Feature | Status |
|---|---|
| Public routes (M1) | ✅ Complete |
| Ministry identity + biography (M2) | ✅ Complete |
| Visual design + animation (M3) | ✅ Complete |
| Admin auth + dashboard | ✅ Built |
| Admin-managed videos + uploads | ✅ Built |
| Admin-managed books | ⚠️ Built — catalog data G-54 |
| Google Calendar events (OAuth + iCal), incl. homepage | ✅ Built — test data G-63 |
| Newsletter via MailerLite | ✅ Built — G-28, G-51 |
| Stripe book checkout | ⚠️ Built — shipping fee decision G-32 |
| Admin donations / book sales views | ✅ Built |
| Merchandise via Printify links | ⚠️ Built, unverified — G-41 |
| Provider contract tests | ⚠️ Built on documented-shape fixtures — G-28 |
| Contact form delivery (Resend) | ⚠️ Built, delivery unverified — G-24 |
| Rate limiting / CAPTCHA | ⚠️ Partial — newsletter and contact rate-limited (G-03 resolved M4-O); no CAPTCHA (G-04) |
| Analytics / error tracking | ⚠️ Built, not configured — G-09 |
| OG image generation | ✅ Built (uncommitted) |
| Privacy Policy / Terms text | ⚠️ Text present, owner approval not recorded — G-25, G-26 |
| Cart / multi-item checkout, merch checkout on site | Not planned |
| Autobiography / My Story section | Future — content not supplied |

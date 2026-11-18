# PRODUCT REQUIREMENTS
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->
<!-- Last updated: M4-H governance synchronization (2026-11-17) -->

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
- Have a contact-form message delivered — the form validates but does not
  send; it directs the visitor to email (G-24)

### Administrator / Ministry Operator
Signs in at `/admin/login` with the shared admin password (8-hour session).
Can:
- Manage videos (upload, YouTube, Facebook; publish, feature, order)
- Upload and delete media files and book covers
- Add, edit, delete and publish/unpublish books, including price display,
  cover, purchase method and Stripe price/product IDs
- Connect a Google account and choose the public events calendar
- View MailerLite subscriber stats, groups and subscribers; delete a subscriber
- View Stripe balance and recent payments; change the donation Payment Link
- View book orders and revenue per title (G-43: currently incomplete)
- View integration status (G-45: currently unreliable)

Cannot (requires a code change + deploy): edit store products, bio, ministry
copy, navigation, social links, legal pages.

There is a single shared credential — no per-user accounts, roles, or audit
trail of admin changes.

### System
Automatically:
- Filters unverified social links from all rendering
- Reports newsletter/contact unavailability honestly
- Seeds books and videos from static content until the first admin save
- Refreshes the events calendar every 5 minutes
- Generates JSON-LD structured data for the homepage, sitemap, and robots
- Redirects legacy Squarespace URLs (`next.config.ts`)
- Serves a branded 404 for unknown routes

---

## Core Features

### F-01: Homepage
Business purpose: primary brand presentation and entry point.
Required data: `homeContent`, bio, ministry identity, featured books, featured
video, giving.
Failure behavior: sections with no data (featured books, featured video) are
omitted; upcoming events falls back to a generic invitation.
⚠️ Homepage "Upcoming Events" reads static events, not the calendar (G-40).

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
Spam protection: honeypot only (G-03, G-04).

### F-04: Giving
Business purpose: enable financial partnership.
User flow: Give CTA → `/donate` → `/partnerships` → Stripe Payment Link /
Cash App / Zelle.
Required data: `getGiving()` (static channels + optional admin override of
the Stripe link).
No tax-deductibility claim may be made (LLC, not a nonprofit).

### F-05: Speaking invitation
Business purpose: generate ministry/speaking inquiries.
User flow: "Invite Natalie" CTAs → `/contact` or `/events#invite`.
Success condition: ❌ NOT MET — the contact form does not deliver (G-24).

### F-06: Branded 404
Renders with `robots: noindex` and CTAs back into the site.

### F-07: Book checkout (added M4)
Business purpose: sell books directly, replacing legacy Squarespace.
User flow: "Purchase" → `/api/checkout` → Stripe Checkout → back to `/books`.
Required config: `STRIPE_SECRET_KEY`; each book needs a Stripe Price ID.
Success condition: buyer pays the Stripe price, receives confirmation, and the
ministry has what it needs to fulfil the order.
Status: ❌ NOT LAUNCH-READY — unvalidated price ID (G-31), no shipping
address (G-32), no confirmation or order notification (G-33).

### F-08: Events calendar (added M4)
Business purpose: publish the ministry schedule without code changes.
User flow: `/events` → month calendar → event details.
Required config: Google OAuth connection or `GOOGLE_CALENDAR_ICAL_URL`.
Failure behavior: "The upcoming schedule is being finalised." (G-40: this
state has no `<h1>`.)

### F-09: Media library (added M4)
Business purpose: present ministry messages.
User flow: `/media` → category filter → play (self-hosted file, click-to-load
YouTube, or Facebook).

### F-10: Store (merchandise)
Business purpose: route merchandise buyers to the Printify storefront.
Presentation only; price/variants shown are static copies (G-41, G-47).

### F-11: Admin dashboard (added M4)
See Administrator role above.

---

## Functional Requirements

FR-001: Content must be read through the accessor modules
  (`src/lib/content.ts`, `book-content.ts`, `video-content.ts`, `giving.ts`).
  Pages and components must not import directly from `src/content/*`.
  Known violations: `/admin/book-sales`, `/admin/donations` (G-43).

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
  resolved on the server from the book catalog. ❌ Not met (G-31).

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
- ⚠️ Deviation: book covers use a plain `<img>` (G-49).

### Security
- Admin session: HMAC-signed, HTTP-only cookie; login throttled per IP.
- Secrets server-only; `.env*` gitignored.
- Honeypot on public forms.
- ❌ No rate limiting on public actions or `/api/checkout` (G-03).
- ❌ No CAPTCHA (G-04).
- ❌ `/api/checkout` accepts arbitrary price IDs over GET (G-31).

### Accessibility
- Target: WCAG 2.2 AA. Skip link, alt text, reduced motion, focus-visible.
- Automated axe scanning exists for public routes; last recorded pass was M3
  and has not been re-run against M4 changes (G-38). `/events` empty state
  lacks an `<h1>` (G-40).

### Operability
- Requires a persistent, writable, single-instance disk for
  `MEDIA_STORAGE_DIR` (G-35). No backup procedure is defined.
- Node version pinned in `.nvmrc`.

### Observability
- `console.error` logging at provider boundaries.
- ❌ No structured logging, error tracking or analytics (G-09).

---

## Feature Status

| Feature | Status |
|---|---|
| Public routes (M1) | ✅ Complete |
| Ministry identity + biography (M2) | ✅ Complete |
| Visual design + animation (M3) | ✅ Complete |
| Admin auth + dashboard | ✅ Built |
| Admin-managed videos + uploads | ✅ Built |
| Admin-managed books | ✅ Built — seed divergence G-34 |
| Google Calendar events (OAuth + iCal) | ✅ Built — G-40 |
| Newsletter via MailerLite | ✅ Built — G-03, G-28, G-51 |
| Stripe book checkout | ⚠️ Built, not launch-ready — G-31, G-32, G-33 |
| Admin donations / book sales views | ⚠️ Built — G-43, G-44 |
| Merchandise via Printify links | ⚠️ Built, unverified — G-41 |
| Contact form delivery (Resend) | ❌ Not implemented — G-24 |
| Rate limiting / CAPTCHA | ❌ Not implemented — G-03, G-04 |
| Analytics / error tracking | ❌ Not implemented — G-09 |
| OG image generation | ❌ Not implemented — G-11 |
| Privacy Policy / Terms text | ❌ Owner-supplied — G-25, G-26 |
| Cart / multi-item checkout, merch checkout on site | Not planned |
| Autobiography / My Story section | Future — content not supplied |

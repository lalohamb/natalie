# CURRENT ARCHITECTURE CONTRACT
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->
<!-- Last updated: M4-H governance synchronization (2026-11-17) — Stripe Checkout, MailerLite, admin book store, iCal calendar -->

## Authority

When conflicts exist, authority is:

1. This document (CURRENT-ARCHITECTURE-CONTRACT.md)
2. Current production code
3. Current passing tests
4. Live-verified external provider behavior
5. Current ADRs
6. Historical reports

Historical reports do not override this contract.

---

## System Ownership

Application owns:
- All page routing (Next.js 16 App Router)
- Static content (typed TS modules in `src/content/`)
- Admin-managed runtime content: books, videos, uploaded files, donation
  link override, Google Calendar connection (`MEDIA_STORAGE_DIR`)
- All UI components
- Newsletter and contact form state and server actions
- Creation of Stripe Checkout Sessions for books (`/api/checkout`)
- Structured data generation and SEO metadata

External provider owns:
- Book payment, receipts and order records (Stripe Checkout / Stripe Dashboard)
- Donation processing (Stripe Payment Link; default
  donate.stripe.com/9AQaGHcs250e2R2aEE, admin-overridable)
- Cash App payments ($NatalieFlemons); Zelle transfers (info@natalieflemons.com)
- Merchandise catalog, checkout and fulfilment (Printify storefront
  `thereformcollective.printify.me` — ⚠️ ownership unconfirmed, G-41)
- Newsletter subscriber records (MailerLite)
- Events schedule (Google Calendar)
- Font delivery (Google Fonts via next/font — self-hosted at build time)

Legacy Squarespace is no longer an intended purchase destination. Squarespace
URLs remaining in the `src/content/books.ts` seed are a defect (G-34).

---

## Identity Model

Public site: no user accounts, no login.

Admin (`/admin/*`): single shared password (`ADMIN_PASSWORD`) exchanged at
`/admin/login` for an HMAC-signed, HTTP-only session cookie
(`nfm_admin`, 8 h, SameSite=Lax so it survives the Google sign-in redirect). Signing key: `ADMIN_SESSION_SECRET`, falling back to
`ADMIN_PASSWORD`. If `ADMIN_PASSWORD` is unset, admin sign-in is disabled.
- `src/proxy.ts` redirects signed-out `/admin/*` requests to `/admin/login` (convenience only).
- Every admin page, Server Action (`src/app/admin/actions.ts`) and Route Handler
  (`/api/admin/files`) re-verifies the session itself (`src/lib/admin-auth.ts`).
- Login failures are throttled in memory per IP (5 per 15 min, single instance).

Google account (calendar integration): OAuth 2.0 authorization-code flow with
PKCE, offline access, scopes `openid email calendar.readonly`
(`/api/admin/google/connect` → Google → `/api/admin/google/callback`). Only an
authenticated admin can start or complete it. "Sign out of Google" revokes the
grant at Google and deletes the stored connection.

G-30 (public `/admin`) is resolved by the above.

---

## Data Ownership

| Entity | Authoritative source |
|---|---|
| Site metadata | `src/content/site.ts` |
| Navigation (main + secondary + legal + give) | `src/content/site.ts` |
| Social links | `src/content/site.ts` (`verified` flag controls rendering) |
| Giving channels | `src/content/site.ts`; the Stripe donation URL can be overridden at `/admin/donations` (`MEDIA_STORAGE_DIR/stripe-settings.json`). Read through `getGiving()` in `src/lib/giving.ts` |
| Bio / portraits | `src/content/bio.ts` |
| Ministry identity + pillars (EQUIP / RESTORE / ACTIVATE) | `src/content/ministry-identity.ts` (via `getMinistryIdentity()`) |
| Books | Book store `MEDIA_STORAGE_DIR/books.json` (admin-managed at `/admin/books`, type `AdminBook`); **seeded from `src/content/books.ts` until the first admin save**. Read through `src/lib/book-content.ts` |
| Book prices charged | Stripe Price referenced by `purchase.priceId`. `priceCents` is display-only |
| Media / videos | Media store `MEDIA_STORAGE_DIR/videos.json` (admin-managed); seeded from `src/content/media.ts` until first admin save. One source per video: uploaded/bundled file (`localSrc`), YouTube (`youtubeId`) or Facebook (`facebookUrl`) |
| Events calendar (`/events`) | Google Calendar. OAuth connection chosen at `/admin/calendar` (`MEDIA_STORAGE_DIR/google-calendar.json`, refresh token AES-GCM-encrypted, mode 0600); otherwise the public iCal feed in `GOOGLE_CALENDAR_ICAL_URL`. No calendar → "schedule is being finalised" state |
| Static events (`src/content/events.ts`) | Empty. Still read by the homepage `UpcomingEvents` section and `/events/[slug]` only — **not** by `/events` (G-40) |
| Uploaded files (media, book covers) | `MEDIA_STORAGE_DIR/files/`, served by `/media-files/[file]` with Range support |
| Store products | `src/content/products.ts` (links out to Printify) |
| Homepage copy (hero headline: "Shaping Destinies. Advancing the Kingdom.") | `src/content/home.ts` |
| Content types | `src/content/types.ts`, `src/content/book-constants.ts` |

No database. Runtime state is JSON files under `MEDIA_STORAGE_DIR`, written
atomically (`writeFileAtomic`) behind an in-process write queue — **single
instance only**.

Caching (`"use cache"`):
- Books — `getAdminBooks()`, tag `books`; admin book actions call `updateTag`.
- Videos — `src/lib/video-content.ts`, tag `videos`; admin actions call `updateTag`.
- Calendar — `getPublicCalendar()` / `getICalCalendar()`, tag
  `google-calendar`, revalidated every 5 minutes. Private/confidential and
  cancelled events are dropped; only title, time, location and plain-text
  description reach the browser.
- Donation link — `getPaymentLinkUrl()`, **no tag and no invalidation on
  save** (G-44).

`MEDIA_STORAGE_DIR` (default `./storage`, gitignored) must be a persistent,
writable disk in production — ephemeral or read-only hosting (e.g. Vercel
serverless) would lose books, videos, uploads and settings (G-35).

---

## Persistence Rules

Persisted by the application at runtime (all under `MEDIA_STORAGE_DIR`):
`books.json`, `videos.json`, `stripe-settings.json`, `google-calendar.json`,
`files/*`.

Not persisted by the application:
- Newsletter subscriptions — sent to MailerLite when
  `NEWSLETTER_PROVIDER=mailerlite`; MailerLite owns the record. When the
  provider is unset the action returns `"not-configured"` and says so.
- Contact form submissions — not delivered and not stored.
  `CONTACT_EMAIL_PROVIDER` has no adapter; the action returns an honest
  "unavailable" message directing visitors to info@natalieflemons.com (G-24).
- Book orders — Stripe owns them. The application stores no order record and
  has no webhook (G-33). `/admin/book-sales` and `/admin/donations` read from
  the Stripe API on each request (`cache: "no-store"`).
- Donations — external (Stripe Payment Link, Cash App, Zelle).
- Merchandise orders — external (Printify).

---

## API Boundaries

### Newsletter Server Action (`src/app/actions/newsletter.ts`)
Purpose: validate email, call `subscribeToNewsletter()`, return typed state.
Boundary: `src/lib/newsletter.ts` — normalizes MailerLite to
`"subscribed" | "already-subscribed" | "not-configured" | "error"`.
Makes an outbound HTTPS call to MailerLite when configured.
Success state carries `celebrate: true` only for `"subscribed"`.
Honeypot: `nfm_hp` — tripped returns neutral `{ status: "success", message: "Thank you." }`
  (intentional bot deception; no subscription occurs).

### Contact Server Action (`src/app/actions/contact.ts`)
Purpose: validate contact form, deliver via email provider, return typed state.
Boundary: `CONTACT_EMAIL_PROVIDER` — no adapter implemented; unset returns the
  honest "unavailable" message; any other value returns a generic error.
Honeypot: `nfm_hp` — tripped returns neutral success.
Schema: name, email, organization (optional), subject (enum), message, nfm_hp.

### Checkout Route Handler (`src/app/api/checkout/route.ts`)
Purpose: create a Stripe Checkout Session for one book and redirect to Stripe.
Input: `GET ?priceId=`. Public, unauthenticated.
Current state does **not** meet the Pricing Rules below (G-31, G-32, G-33).

### Stripe / MailerLite admin clients (`src/lib/stripe.ts`, `src/lib/mailerlite.ts`)
`server-only`; called only from admin pages and admin actions.

### Admin Server Actions (`src/app/admin/actions.ts`)
Videos, files, calendar, books (`saveBook`, `deleteBook`, `setBookPublished`),
newsletter (`deleteSubscriber`), donations (`saveStripePaymentLink`). Every
action calls `requireAdmin()` first.

### Content Accessors
- `src/lib/content.ts` — static content; safe to import from Client Components.
  Single import point for site, navigation, bio, ministry identity, home,
  partnership, static events, products.
- `src/lib/book-content.ts` — books (server-only, async):
  `getPublishedBooks`/`getBooks`, `getAdminBooks`, `getAdminBook`/`getBook`.
- `src/lib/video-content.ts` — videos (server-only, async).
- `src/lib/giving.ts` — `getGiving()` (async, reads the admin override).

Pages and components import content through these accessors only. Direct
imports from `src/content/*` are not permitted.
Known violations: `/admin/book-sales` imports `@/content/books`;
`/admin/donations` imports `@/content/site` (G-43).

---

## Unknown Data Semantics

UNKNOWN must remain UNKNOWN.

- Social links: `verified: false` → filtered out at `getSocialLinks()` → not rendered.
- Newsletter: `"not-configured"` and `"error"` are reported honestly; the form
  never pretends success (the honeypot response is the one deliberate exception).
- Book purchase: `kind: "none"`, or an `external` option with an empty URL,
  renders no purchase button. Purchase UI on the detail page is shown only for
  `status: "published"`.
- Book price: `priceCents` unset → no price shown (never `$0.00`).
- Book cover: no `coverUrl`, or `coverIsMockup: true` → "Cover coming soon" placeholder.

No silent coercion of unknown to `0`, `false`, `true`, or a default is present.
This invariant must be preserved in all future changes.

---

## Pricing Rules

- The amount charged for a book is defined by the Stripe Price
  (`purchase.priceId`). The application never sends an amount to Stripe.
- `priceCents` (integer cents, optional) is display-only and entered by hand;
  it is not validated against Stripe (G-50).
- No cart. One book, quantity 1, per Checkout Session.
- Merchandise prices in `products.ts` are display-only; Printify is authoritative.

Invariant (required, **not yet met** — G-31): the client must identify what it
is buying by catalog key (book `slug`), and the server must resolve the Stripe
`priceId` from the book store and refuse anything that is not a published
`stripe-checkout` book. Today the client sends the `priceId` itself and the
server forwards it unchecked. This must be fixed before launch.

---

## Security Rules

Public site: no authentication. Admin: see Identity Model — every admin page,
Server Action and admin Route Handler re-verifies the session.

Secrets (server-only, never `NEXT_PUBLIC_`): `ADMIN_PASSWORD`,
`ADMIN_SESSION_SECRET`, `STRIPE_SECRET_KEY`, `MAILERLITE_API_KEY`,
`GOOGLE_CLIENT_SECRET`. No secret values are committed; `.env*` is gitignored
except `.env.example`. Stripe product/price IDs in content are identifiers,
not secrets.

Server-only modules: `newsletter.ts`, `mailerlite.ts`, `stripe.ts`,
`stripe-settings.ts`, `book-store.ts`, `book-content.ts`, `storage.ts`,
`google-calendar.ts`, `ical.ts` all import `"server-only"`. These imports must
be preserved. `src/lib/giving.ts` has no explicit marker but depends on a
server-only module.

Outbound fetch restriction: the iCal feed URL must be on `calendar.google.com`.

Spam protection: honeypot field (`nfm_hp`) on newsletter and contact forms.
Admin login is throttled per IP (5 / 15 min, in memory).

❌ GAP (G-03): No rate limiting on public server actions or `/api/checkout`.
❌ GAP (G-04): No CAPTCHA.
❌ GAP (G-31): `/api/checkout` accepts an arbitrary `priceId` over GET.
❌ GAP (G-44): Admin-saved donation link is validated only as `https://`.

---

## External Provider Rules

Provider responses must be normalized at the integration boundary.
Application code must not depend on provider response shapes directly.
Details and verification status: `API-CONTRACTS.md`.

| Provider | Purpose | Integration type | Boundary |
|---|---|---|---|
| Stripe API | Book checkout; admin donation and book-sales views | Server-side HTTPS (`fetch`, no SDK) | `src/app/api/checkout/route.ts`, `src/lib/stripe.ts` |
| Stripe Payment Link | Donations | Outbound link | `src/lib/giving.ts` |
| Cash App / Zelle | Donations | Outbound link / displayed address | N/A |
| MailerLite | Newsletter subscribe; admin subscriber list/delete | Server-side HTTPS | `src/lib/newsletter.ts`, `src/lib/mailerlite.ts` |
| Google Calendar | `/events` schedule | OAuth API or public iCal feed | `src/lib/google-calendar.ts`, `src/lib/ical.ts` |
| YouTube | Video validation (oEmbed), thumbnails, click-to-load embed | Server-side HTTPS + embed | `src/lib/youtube.ts` |
| Printify | Merchandise | Outbound link + remote images | N/A |
| Google Fonts (next/font) | Typography | Build-time self-hosting | N/A |
| Resend | Contact form delivery | ⚠️ NOT IMPLEMENTED (G-24) | Must be normalized at `src/app/actions/contact.ts` |
| Squarespace (legacy) | — | Retired; residual seed URLs are a defect (G-34) | N/A |

None of the live integrations has a captured fixture or contract test (G-28).

---

## Failure Rules

Fail open (graceful degradation):
- Newsletter unavailable/erroring → honest message; never fake success.
- Contact unavailable → honest message directing to email; never fake success.
- Social link unverified → not rendered.
- No featured books → `FeaturedPublications` returns `null`.
- `getFeaturedVideo()` undefined → `FeaturedMessage` not rendered.
- `getUpcomingEvents(3)` empty → `UpcomingEvents` shows its generic invitation state.
- Calendar unavailable (not configured, fetch/parse failure) → `/events`
  shows "The upcoming schedule is being finalised."
- Stripe / MailerLite API failure in admin → error alert on the admin page;
  the page still renders.
- No admin donation-link override → default link from `site.ts`.

Fail closed:
- Admin: unset `ADMIN_PASSWORD` disables sign-in; invalid/missing session →
  redirect to `/admin/login`.
- Checkout: missing `priceId` → 400; `STRIPE_SECRET_KEY` unset → 503; Stripe
  rejects the request → 502. No session is created.
- iCal feed on a non-Google host → refused.
- `books.json` that fails schema validation → read throws (book pages error
  rather than render partial data).

Operator intervention required:
- `MEDIA_STORAGE_DIR` on persistent disk; env vars for Stripe, MailerLite,
  Google Calendar and admin set in the host.
- Contact email provider must be implemented and configured before the form
  delivers.

---

## Route Inventory

| Route | Status | Notes |
|---|---|---|
| `/` | ✅ Built | Homepage |
| `/about` | ✅ Built | 2026 biography |
| `/ministry` | ✅ Built | EQUIP/RESTORE/ACTIVATE + supporting disciplines |
| `/books` | ✅ Built | Published books from the book store; category tabs |
| `/books/[slug]` | ✅ Built | Purchase via Stripe Checkout or external link |
| `/api/checkout` | ⚠️ Built — not launch-ready | G-31, G-32, G-33 |
| `/events` | ✅ Built | Google Calendar month view; no `<h1>` in the empty state (G-40) |
| `/events/[slug]` | ⚠️ Orphaned | Static events only; `__placeholder__` sentinel (G-23, G-40) |
| `/media` | ✅ Built | Admin-managed videos; category filter |
| `/media-files/[file]` | ✅ Built | Uploaded files |
| `/store` | ✅ Built | Presentation only; links to Printify (G-41, G-47) |
| `/partnerships` | ✅ Built | Stripe link + Cash App + Zelle |
| `/contact` | ⚠️ Built — does not deliver | G-24 |
| `/donate` | ✅ Built | Redirects to `/partnerships` |
| `/privacy`, `/terms` | ⚠️ Placeholder | G-25, G-26 |
| `/admin/login` | ✅ Built | Shared-password sign-in |
| `/admin` | ✅ Built | Overview |
| `/admin/videos`, `/admin/videos/new`, `/admin/videos/[id]` | ✅ Built | Video library |
| `/admin/files` | ✅ Built | Uploads |
| `/admin/books`, `/admin/books/new`, `/admin/books/[slug]` | ✅ Built | Book catalog management |
| `/admin/calendar` | ✅ Built | Google Calendar connection |
| `/admin/newsletter` | ✅ Built | MailerLite stats, groups, subscribers, delete |
| `/admin/donations` | ✅ Built | Stripe balance, recent payments, donation-link override |
| `/admin/book-sales` | ⚠️ Built — incomplete | Reads static seed, not the book store (G-43) |
| `/admin/integrations` | ⚠️ Built — statuses unreliable | G-45 |
| `/api/admin/files`, `/api/admin/google/connect`, `/api/admin/google/callback` | ✅ Built | Admin session required |

## Next.js 16 Constraints

- `cacheComponents: true` is active. `generateStaticParams` cannot return an
  empty array. Solution: `[{ slug: "__placeholder__" }]` sentinel that hits
  `notFound()` at runtime. `dynamicParams` export is forbidden.
- `partialPrefetching: true` is active.
- `CopyrightYear` uses `cacheLife("days")` — must remain a server component.
- `/events` reads the current month through a cached helper and renders the
  calendar inside `<Suspense>`; `MinistryMessage` (client component) receives
  its content as props from the page rather than calling accessors itself.
- `turbopackSourceMaps: false` in `next.config.ts` is an undocumented
  workaround flag (G-48).

## Motion / Animation Rules

- All CSS animations use `motion-safe:` Tailwind prefix.
- All Motion library (`motion/react`) animations respect `prefers-reduced-motion`
  via the library's built-in reduced-motion detection.
- `[data-reveal]` elements are forced visible in the noscript fallback and
  under `prefers-reduced-motion: reduce` via globals.css.
- `Reveal` component renders a `m.div` — must remain a client component.
- `SubscriptionBlessing` (`src/components/animations/subscription-blessing.tsx`)
  plays only when the newsletter action returns `celebrate: true`, i.e. the
  provider confirmed a new subscription. "Already subscribed" and the honeypot
  response stay plain text. It uses `useReducedMotion()` to show the finished
  scene with no movement (safe here: it never renders on the server).
- `CoreValues` is a client component (uses `useInView`). All other section
  components are RSC unless they require interactivity.

## Historical Data

No immutable snapshots or audit records exist. No database. Order and
donation history lives in Stripe; subscriber history lives in MailerLite.
There is no audit log of admin changes to books, videos or settings.

---

## AI Change Control

Before making any code changes:

1. Read this contract.
2. State the requested scope.
3. List files expected to change.
4. Identify applicable invariants from this contract.
5. Do not expand scope beyond what is stated.
6. UNKNOWN must remain UNKNOWN — never coerce missing data to a default.
7. Do not invent external provider behavior.
8. STOP if the requested work conflicts with this contract.
9. Do not declare completion while requirements remain incomplete.
10. Do not modify files outside the approved scope without stopping first.

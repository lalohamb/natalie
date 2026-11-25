# CURRENT ARCHITECTURE CONTRACT
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->
<!-- Last updated: M4-Q post-purchase confirmation G-33 (uncommitted working tree) -->

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
- Admin-managed runtime content: books, videos, uploaded files, Google
  Calendar connection (`MEDIA_STORAGE_DIR`)
- All UI components
- Newsletter and contact form state and server actions
- Creation of Stripe Checkout Sessions for books (`/api/checkout`)
- Structured data generation, Open Graph images and SEO metadata

External provider owns:
- Book payment, receipts and order records (Stripe Checkout / Stripe Dashboard)
- Donation processing (Stripe Payment Link from `STRIPE_DONATION_PAYMENT_LINK`;
  fallback donate.stripe.com/9AQaGHcs250e2R2aEE in `site.ts`)
- Cash App payments ($NatalieFlemons); Zelle transfers (info@natalieflemons.com)
- Merchandise catalog, checkout and fulfilment (Printify storefront
  `thereformcollective.printify.me` — ⚠️ ownership unconfirmed, G-41)
- Newsletter subscriber records (MailerLite)
- Contact message delivery (Resend → info@natalieflemons.com; delivery
  unverified, G-24)
- Events schedule (Google Calendar)
- Font delivery (Google Fonts via next/font — self-hosted at build time)

Legacy Squarespace is no longer a purchase destination. Squarespace URLs
survive only in `src/content/books.ts`, which no longer seeds the store
(G-34, G-52).

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
  The IP comes from `clientIp()` (`src/lib/admin-auth.ts`): the
  `X-Forwarded-For` entry `TRUSTED_PROXY_HOPS` (default 1) from the right, i.e.
  the one appended by our own proxy. **Production must run behind a reverse
  proxy** — with none, the header is client-controlled.
- Sessions are stateless by design: sign-out clears the cookie; rotating
  `ADMIN_SESSION_SECRET` revokes every session. Production logs a warning when
  that secret is unset and the password is used as the signing key.

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
| Giving channels | `src/content/site.ts`; the Stripe donation URL is taken from the `STRIPE_DONATION_PAYMENT_LINK` env var when set (no admin override — changing it needs a redeploy). Read through `getGiving()` in `src/lib/giving.ts` |
| Bio / portraits | `src/content/bio.ts` |
| Ministry identity + pillars (EQUIP / RESTORE / ACTIVATE) | `src/content/ministry-identity.ts` (via `getMinistryIdentity()`) |
| Books | Book store `MEDIA_STORAGE_DIR/books.json` (admin-managed at `/admin/books`, type `AdminBook`), file shape `{ version, books }`. **Not seeded** (decided 2026-11-20): with no file the catalog is empty until an admin adds a book. `src/content/books.ts` is not a data source. Read through `src/lib/book-content.ts` |
| Book prices charged | Stripe Price referenced by `purchase.priceId`. `priceCents` is display-only |
| Media / videos | Media store `MEDIA_STORAGE_DIR/videos.json` (admin-managed); seeded from `src/content/media.ts` until first admin save. One source per video: uploaded/bundled file (`localSrc`), YouTube (`youtubeId`) or Facebook (`facebookUrl`) |
| Events calendar (`/events`) | Google Calendar. OAuth connection chosen at `/admin/calendar` (`MEDIA_STORAGE_DIR/google-calendar.json`, refresh token AES-GCM-encrypted, mode 0600); otherwise the public iCal feed in `GOOGLE_CALENDAR_ICAL_URL`. Window: current month through 12 months ahead. No calendar (or an empty feed) → "schedule is being finalised" state |
| Homepage "Upcoming Events" | Google Calendar — the next three events not yet finished (`getUpcomingCalendarEvents()` in `src/lib/google-calendar.ts`, same 5-minute cache and tag as `/events`). No calendar events → static events → invitation panel |
| Static events (`src/content/events.ts`) | Empty. Read only as the homepage fallback and by the unlinked `/events/[slug]` route (G-23) |
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
- Calendar — `getPublicCalendar()` / `getICalCalendar()` /
  `getUpcomingCalendarEvents()`, tag `google-calendar`, revalidated every 5
  minutes (the homepage therefore revalidates every 5 minutes too). Private/confidential and
  cancelled events are dropped; only title, time, location and plain-text
  description reach the browser.
- Donation link — not cached; read from the environment on each call.

`MEDIA_STORAGE_DIR` defaults to `./storage`. **Storage model decision (M4-P,
G-53, G-35):** content is committed to the repository. `storage/books.json`,
`storage/videos.json` and `storage/files/*` are tracked in git and are the
authoritative content source. Production deploys by pulling the repo; no
persistent writable volume is required. `ADMIN_READONLY=true` must be set in
production — all write actions return an error when set (`isReadOnly()` in
`src/lib/admin-auth.ts`). The Google Calendar OAuth connection
(`google-calendar.json`) is not committed; use `GOOGLE_CALENDAR_ICAL_URL` in
production (no stored credentials needed).

Write validation: the video store validates on read and on write; the book
store validates on read and on write (G-57 resolved M4-O).

**Invariant — stored data is never discarded.** Reading a store must not write
to it. `version` in `books.json` identifies the file format only and must
never be used to decide that stored books are stale. A file that cannot be
parsed is an error to surface, not something to overwrite. A format change
must convert old files in `parseBookManifest()` so their books carry over.

---

## Persistence Rules

Persisted by the application at runtime (all under `MEDIA_STORAGE_DIR`):
`books.json`, `videos.json`, `google-calendar.json`, `files/*`.
(`stripe-settings.json` is no longer read or written.)

Not persisted by the application:
- Newsletter subscriptions — sent to MailerLite when
  `NEWSLETTER_PROVIDER=mailerlite`; MailerLite owns the record. When the
  provider is unset the action returns `"not-configured"` and says so.
- Contact form submissions — not stored. With `CONTACT_EMAIL_PROVIDER=resend`
  they are emailed through Resend to info@natalieflemons.com (delivery
  unverified, G-24). With the provider unset the action returns an honest
  "unavailable" message directing visitors to that address.
- Book orders — Stripe owns them. The application stores no order record and
  has no webhook. `/admin/book-sales` and `/admin/donations` read from
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
Boundary: `deliverContactMessage()` in `src/lib/contact-email.ts`
  (`server-only`), selected by `CONTACT_EMAIL_PROVIDER=resend` (needs
  `RESEND_API_KEY`); normalizes Resend to
  `"sent" | "not-configured" | "error"`. Unset provider → honest
  "unavailable" message; any other value, a missing key or a Resend error →
  error message, never success. Sender and recipient come from
  `CONTACT_EMAIL_FROM` / `CONTACT_EMAIL_TO`, defaulting to Resend's test sender
  and info@natalieflemons.com (G-24).
Honeypot: `nfm_hp` — tripped returns neutral success.
Schema: name, email, organization (optional), subject (enum), message, nfm_hp.

### Checkout Route Handler (`src/app/api/checkout/route.ts`)
Purpose: create a Stripe Checkout Session for one book and redirect to Stripe.
Input: `POST` form field `slug`. Public, unauthenticated, POST only (GET → 405,
so links, crawlers and prefetchers cannot create sessions).
The route looks the book up in the book store and proceeds only if it is
`published` with a `stripe-checkout` purchase and a price id; it then calls
`createCheckoutSession()` in `src/lib/stripe.ts` with the stored price id.
Nothing else in the request is read. Rate limit: 10 starts per client per
10 minutes (`src/lib/rate-limit.ts`).
Outcomes: 303 to Stripe; 303 back to `/books/<slug>?checkout=unavailable|busy`
(shown by `CheckoutNotice`); 404 not purchasable; 400 no/invalid slug.
Meets the Pricing Rules below. Post-purchase: `?purchased=1` on the `success_url`
  is read by `CheckoutNotice` on `/books` (G-33 resolved M4-Q). No webhook.

Fulfilment (`checkoutFulfilment()` in `src/lib/stripe.ts`): every session
requires a delivery address in `CHECKOUT_SHIPPING_COUNTRIES` (default `US,CA`).
**Invariant: a book checkout must never be created without shipping address
collection** — bad configuration falls back to the default countries.
`STRIPE_SHIPPING_RATE_ID` (optional) adds a shipping fee; unset today, so none
is charged (owner decision, G-32). `STRIPE_AUTOMATIC_TAX=true` (optional)
enables Stripe Tax; off today. The address is shown per order on
`/admin/book-sales`; the application does not store it.

UI: `CheckoutButton` (`src/components/sections/checkout-button.tsx`) — a form
POST carrying only the slug. No component may link to `/api/checkout`.

### Stripe / MailerLite admin clients (`src/lib/stripe.ts`, `src/lib/mailerlite.ts`)
`server-only`; called only from admin pages and admin actions.
`stripe.ts` exposes `getBalance`, `listPaymentIntents`, `listCheckoutOrders`
(both follow Stripe cursor pagination up to 10 pages and report `truncated`)
and `getPrice`. `saveBook` uses `getPrice` to keep a book's display price
equal to the Stripe Price (Pricing Rules).

### iCal parser (`src/lib/ical-parser.ts`)
Pure module (no I/O, no framework imports) so it is directly testable;
`src/lib/ical.ts` fetches the feed and calls it.

### Admin Server Actions (`src/app/admin/actions.ts`)
Session (`login`, `logout`), videos, files, calendar, books (`saveBook`,
`deleteBook`, `setBookPublished`), newsletter (`deleteSubscriber`). Every
action except `login`/`logout` calls `requireAdmin()` first.

### Content Accessors
- `src/lib/content.ts` — static content; safe to import from Client Components.
  Single import point for site, navigation, bio, ministry identity, home,
  partnership, static events, products.
- `src/lib/book-content.ts` — books (server-only, async):
  `getPublishedBooks`/`getBooks`, `getAdminBooks`, `getAdminBook`/`getBook`.
- `src/lib/video-content.ts` — videos (server-only, async).
- `src/lib/giving.ts` — `getGiving()` (async; applies the env donation link
  only when it is an https `donate.stripe.com` / `buy.stripe.com` URL).
- `getStoreUrl()` in `content.ts` — the single external Store destination.

Pages and components import content through these accessors only. Direct
imports from `src/content/*` are not permitted.
No known violations.

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
- `priceCents` (integer cents, optional) is display-only. For a Stripe Checkout
  book it is checked against the Stripe Price on every admin save: blank is
  filled in from Stripe, a different amount is rejected, an unknown or archived
  price id is rejected. If Stripe cannot be asked (no key, network error,
  non-USD or customer-chosen amount) the entered value is kept unchanged.
- No cart. One book, quantity 1, per Checkout Session.
- Shipping fee and tax are never computed by the application: a fee comes only
  from a Stripe Shipping Rate, tax only from Stripe Tax.
- Merchandise prices in `products.ts` are display-only; Printify is authoritative.

Invariant (met since M4-K, covered by `tests/e2e/checkout.spec.ts` and
`tests/contract/stripe.spec.ts`): the client identifies what it is buying by
catalog key (book `slug`) only; the server resolves the Stripe `priceId` from
the book store and refuses anything that is not a published `stripe-checkout`
book. A price id or amount supplied by the browser must never be read.

---

## Security Rules

Public site: no authentication. Admin: see Identity Model — every admin page,
Server Action and admin Route Handler re-verifies the session.

Secrets (server-only, never `NEXT_PUBLIC_`): `ADMIN_PASSWORD`,
`ADMIN_SESSION_SECRET`, `STRIPE_SECRET_KEY`, `MAILERLITE_API_KEY`,
`RESEND_API_KEY`, `GOOGLE_CLIENT_SECRET`. No secret values are committed
(verified 2026-11-20: `.env.local` has never been in git history and no key
patterns are tracked); `.env*` is gitignored except `.env.example`.
The Stripe key in use is **live mode** (G-42) — there is no test-mode
environment (G-55). Stripe product/price IDs in content are identifiers,
not secrets.

Server-only modules: `newsletter.ts`, `mailerlite.ts`, `stripe.ts`,
`stripe-settings.ts`, `book-store.ts`, `book-content.ts`, `storage.ts`,
`google-calendar.ts`, `ical.ts`, `admin-auth.ts`, `media-store.ts` all import
`"server-only"`, as do `contact-email.ts` and `og-assets.ts`. These imports
must be preserved. `giving.ts` and `ical-parser.ts` have no marker (no secrets,
no I/O).

Outbound fetch restriction: the iCal feed URL must be on `calendar.google.com`.

Spam protection: honeypot field (`nfm_hp`) on newsletter and contact forms.
Admin login is throttled per IP (5 / 15 min, in memory).

Response headers (`next.config.ts`, every route): HSTS, `X-Content-Type-Options:
nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy`,
and a CSP limited to `frame-ancestors 'self'; base-uri 'self'; object-src 'none'`.
There is deliberately no `script-src`: pages are prerendered and cannot carry
per-request nonces.

Upload safety: `/api/admin/files` requires the session **and** a same-origin
`Origin` header; stored names are slugged against an extension allow-list;
`/media-files/[file]` serves only allow-listed names with `nosniff`.

❌ GAP (G-04): No CAPTCHA.

---

## External Provider Rules

Provider responses must be normalized at the integration boundary.
Application code must not depend on provider response shapes directly.
Details and verification status: `API-CONTRACTS.md`.

| Provider | Purpose | Integration type | Boundary |
|---|---|---|---|
| Stripe API | Book checkout; admin donation and book-sales views | Server-side HTTPS (`fetch`, no SDK) | `src/lib/stripe.ts` (called by `src/app/api/checkout/route.ts` and admin pages) |
| Stripe Payment Link | Donations | Outbound link | `src/lib/giving.ts` |
| Cash App / Zelle | Donations | Outbound link / displayed address | N/A |
| MailerLite | Newsletter subscribe; admin subscriber list/delete | Server-side HTTPS | `src/lib/newsletter.ts`, `src/lib/mailerlite.ts` |
| Google Calendar | `/events` schedule | OAuth API or public iCal feed | `src/lib/google-calendar.ts`, `src/lib/ical.ts`, `src/lib/ical-parser.ts` |
| YouTube | Video validation (oEmbed), thumbnails, click-to-load embed | Server-side HTTPS + embed | `src/lib/youtube.ts` |
| Printify | Merchandise | Outbound link + remote images | N/A |
| Google Fonts (next/font) | Typography | Build-time self-hosting | N/A |
| Resend | Contact form delivery | Server-side HTTPS — ⚠️ delivery unverified (G-24) | `src/lib/contact-email.ts` |
| Google Analytics 4 | Visitor analytics — optional, off unless `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set; never on `/admin` | Browser script | `src/components/seo/analytics.tsx` |
| Error webhook | Server error notification — optional (`ERROR_REPORT_WEBHOOK_URL`) | Server-side HTTPS POST | `src/instrumentation.ts` |
| Squarespace (legacy) | — | Retired | N/A |

Contract tests exist for MailerLite, Resend, Stripe admin reads and the iCal
parser (`tests/contract/`), on documented-shape fixtures — not yet captured
responses (G-28).

---

## Failure Rules

Fail open (graceful degradation):
- Newsletter unavailable/erroring → honest message; never fake success.
- Contact unavailable or Resend error → honest message directing to email;
  never fake success.
- Social link unverified → not rendered.
- No featured books → `FeaturedPublications` returns `null`.
- `getFeaturedVideo()` undefined → `FeaturedMessage` not rendered.
- No upcoming calendar events and no static events → `UpcomingEvents` shows
  its generic invitation state.
- Calendar unavailable (not configured, fetch/parse failure) → `/events`
  keeps its heading and shows "The upcoming schedule is being finalised."
- Stripe / MailerLite API failure in admin → error alert on the admin page;
  the page still renders.
- Unexpected render error on a public page → branded `src/app/error.tsx` with
  retry; the server-side cause is logged by `src/instrumentation.ts`.
- `STRIPE_DONATION_PAYMENT_LINK` unset → default link from `site.ts`.

Fail closed:
- Admin: unset `ADMIN_PASSWORD` disables sign-in; invalid/missing session →
  redirect to `/admin/login`.
- Checkout: anything but a published Stripe Checkout book → 404; GET → 405;
  no slug → 400; over the rate limit, `STRIPE_SECRET_KEY` unset, or Stripe
  refuses → the buyer is returned to the book page with a message that they
  were not charged. No session is created.
- iCal feed on a non-Google host → refused.
- `books.json` that fails schema validation → read throws (`/books`, book
  pages, the sitemap and the homepage publications section error rather than
  render partial data — a bad write is now rejected before it reaches disk
  (G-57 resolved M4-O)).

Operator intervention required:
- `MEDIA_STORAGE_DIR` on persistent disk; env vars for Stripe, MailerLite,
  Google Calendar and admin set in the host.
- Resend needs a verified sending domain before the contact form can be
  relied on (G-24).

---

## Route Inventory

| Route | Status | Notes |
|---|---|---|
| `/` | ✅ Built | Homepage |
| `/about` | ✅ Built | 2026 biography |
| `/ministry` | ✅ Built | EQUIP/RESTORE/ACTIVATE + supporting disciplines |
| `/books` | ⚠️ Built — data not launch-ready | Published books from the book store; category tabs (G-54) |
| `/books/[slug]` | ⚠️ Built — data not launch-ready | Purchase via Stripe Checkout or external link. Slugs are generated (`title-xxxx`); legacy redirect targets currently 404 (G-54) |
| `/api/checkout` | ✅ Built — POST only, slug-based, collects delivery address, confirmation shown on `/books` | Shipping fee undecided (G-32) |
| `/events` | ✅ Built | Heading always rendered; Google Calendar month view streamed below it |
| `/events/[slug]` | ⚠️ Unlinked | Static events only; `__placeholder__` sentinel (G-23) |
| `/media` | ✅ Built | Admin-managed videos; category filter |
| `/media-files/[file]` | ✅ Built | Uploaded files |
| `/store` | ✅ Built | Product page linking to Printify; not in navigation or sitemap — Store links go to Printify directly (G-41) |
| `/partnerships` | ✅ Built | Stripe link + Cash App + Zelle |
| `/contact` | ⚠️ Built — delivery unverified | Resend adapter (G-24) |
| `/donate` | ✅ Built | Redirects to `/partnerships` |
| `/privacy`, `/terms` | ⚠️ Text present — owner approval not recorded | G-25, G-26 |
| `/opengraph-image`, `/about/opengraph-image`, `/books/[slug]/opengraph-image`, `/events/[slug]/opengraph-image` | ✅ Built (uncommitted) | Images read from disk via `src/lib/og-assets.ts` |
| `/admin/login` | ✅ Built | Shared-password sign-in |
| `/admin` | ✅ Built | Overview |
| `/admin/videos`, `/admin/videos/new`, `/admin/videos/[id]` | ✅ Built | Video library |
| `/admin/files` | ✅ Built | Uploads |
| `/admin/books`, `/admin/books/new`, `/admin/books/[slug]` | ✅ Built | Book catalog management |
| `/admin/calendar` | ✅ Built | Google Calendar connection |
| `/admin/newsletter` | ✅ Built | MailerLite stats, groups, subscribers, delete |
| `/admin/donations` | ✅ Built | Stripe balance (all currencies), payments excluding book orders, filters; reports whether the donation-link env var is valid |
| `/admin/book-sales` | ✅ Built | Orders, delivery addresses and revenue per book from the book store, matched through Checkout Sessions |
| `/admin/integrations` | ✅ Built | Status derived from the env vars each feature reads |
| `/api/admin/files`, `/api/admin/google/connect`, `/api/admin/google/callback` | ✅ Built | Admin session required |

## Next.js 16 Constraints

- Installed: `next` 16.4.6 (`^16.4.6`), React 19.3.0. Read the bundled guides
  in `node_modules/next/dist/docs/` before changing framework code (AGENTS.md).
- `cacheComponents: true` is active. `generateStaticParams` cannot return an
  empty array. Solution: a sentinel slug that hits `notFound()` at runtime
  (`__placeholder__` for events, `_placeholder` for books, `_` for admin book
  edit). `dynamicParams` export is forbidden.
- `/admin/books`, `/admin/books/[slug]` and `/books/[slug]` export
  `instant = false`.
- `partialPrefetching: true` is active.
- `CopyrightYear` uses `cacheLife("days")` — must remain a server component.
- `/events` renders the calendar inside `<Suspense>` and takes the current
  month from the cached calendar itself (its own time zone). Any "now" used
  for server rendering must be read inside a `"use cache"` function; `MinistryMessage` (client component) receives
  its content as props from the page rather than calling accessors itself.
- Error boundaries (`error.tsx`) receive `retry`, not `reset`, in this version.
- `src/instrumentation.ts` exports `onRequestError`.

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

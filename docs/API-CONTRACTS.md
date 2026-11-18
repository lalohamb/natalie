# API CONTRACTS
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->
<!-- Last updated: M4-H governance synchronization (2026-11-17) -->

"Live verified" below means a real request/response was captured and recorded.
Where it says **NO**, the shapes are taken from the code and the provider's
public documentation, not from a captured fixture (see KNOWN-GAPS G-28).

---

## Stripe API (book checkout + admin reporting)

Purpose: sell books through Stripe-hosted Checkout; show donations and book
orders in the admin.
Integration type: server-side HTTPS calls with `fetch` to
`https://api.stripe.com/v1` (no Stripe SDK). Auth: `Authorization: Bearer
STRIPE_SECRET_KEY`.

| Call | Where | Used by |
|---|---|---|
| `POST /checkout/sessions` | `src/app/api/checkout/route.ts` | Public "Purchase" buttons |
| `GET /balance` | `src/lib/stripe.ts` `getBalance()` | `/admin/donations` |
| `GET /payment_intents?limit=100&expand[]=data.latest_charge` | `listPaymentIntents()` | `/admin/donations` |
| `GET /prices?product=…&active=true&limit=10` | `listPricesByProduct()` | `/admin/book-sales` |
| `GET /checkout/sessions?limit=100&expand[]=data.payment_intent.latest_charge&expand[]=data.line_items` | `listOrdersByProduct()` | `/admin/book-sales` |

Checkout Session request (form-encoded): `mode=payment`,
`line_items[0][price]=<priceId>`, `line_items[0][quantity]=1`,
`success_url=<origin>/books?purchased=1`, `cancel_url=<origin>/books`.
Response consumed: `url` only → 3xx redirect to Stripe.

Normalization: admin reads are typed in `src/lib/stripe.ts`
(`StripePaymentIntent`, `StripePrice`, `StripeBalance`) and consumed directly
by the two admin pages. Errors surface as `Stripe <path> error <status>` in an
admin alert.

Live verified: **NO** (no fixture, no contract test).
⚠️ UNVERIFIED: live vs test mode of the configured key and price IDs (G-42).

❌ GAPS: `priceId` is taken from the query string unvalidated (G-31); no
shipping/tax collection (G-32); no webhook, `success_url` flag unused (G-33);
admin lists are capped at 100 with no pagination (G-43).

Webhooks: none. `STRIPE_WEBHOOK_SECRET` is not read by any code.

---

## Stripe Payment Link (donations)

Purpose: accept one-time donations.
Integration type: outbound browser navigation.
Endpoint: default `https://donate.stripe.com/9AQaGHcs250e2R2aEE`
(`src/content/site.ts`), overridable by an admin at `/admin/donations`
(stored in `MEDIA_STORAGE_DIR/stripe-settings.json`, resolved by
`getGiving()` in `src/lib/giving.ts`).
Live verified: ✅ default link HTTP 200 per `docs/reports/SITE-AUDIT.md` §7
(2026-10-10). An admin-saved override is not verified by the application.
❌ GAP (G-44): override is cached without invalidation.

---

## Cash App and Zelle (donations)

Cash App: outbound link `https://cash.app/$NatalieFlemons` — ✅ resolves per
SITE-AUDIT.md §7 (2026-10-10).
Zelle: displayed recipient `info@natalieflemons.com` (`giving.zelleEmail`);
no link, no API. ⚠️ UNVERIFIED that this address is enrolled with Zelle.

---

## MailerLite (newsletter)

Purpose: store newsletter subscribers; admin subscriber management.
Integration type: server-side HTTPS to `https://connect.mailerlite.com/api`.
Auth: `Authorization: Bearer MAILERLITE_API_KEY`. Enabled when
`NEWSLETTER_PROVIDER=mailerlite`.

| Call | Where | Used by |
|---|---|---|
| `POST /subscribers` body `{ "email": "…" }` | `src/lib/newsletter.ts` | Public newsletter form |
| `GET /subscribers?limit=0` (reads `meta.aggregations`) | `src/lib/mailerlite.ts` `getStats()` | `/admin/newsletter` |
| `GET /groups?limit=100` | `listGroups()` | `/admin/newsletter` |
| `GET /subscribers?limit=25&page=N&sort=-subscribed_at` | `listSubscribers()` | `/admin/newsletter` |
| `DELETE /subscribers/{id}` (404 tolerated) | `deleteSubscriber()` | `/admin/newsletter` |

Normalization (the boundary): `subscribeToNewsletter()` returns
`SubscribeResult = "subscribed" | "already-subscribed" | "not-configured" | "error"`:

| Condition | Result |
|---|---|
| `NEWSLETTER_PROVIDER` empty | `"not-configured"` |
| HTTP 201 | `"subscribed"` |
| HTTP 200 | `"already-subscribed"` |
| Missing API key, unsupported provider, any other status | `"error"` (logged) |

Application code above this boundary must not depend on MailerLite's shapes.
(The admin page consumes `MLSubscriber`/`MLGroup`/`MLStats` from
`src/lib/mailerlite.ts` directly — acceptable for an admin-only view.)

Live verified: **NO**. The 200/201 mapping, the `meta.aggregations` stats
shape and `meta.last_page` pagination are not backed by a captured fixture.
`fixtures/newsletter/*.json` predate the adapter. ❌ G-28.
⚠️ UNVERIFIED: account double-opt-in setting; no group is assigned (G-51).

---

## Google Calendar (events)

Two modes, resolved in `getPublicCalendar()` (`src/lib/google-calendar.ts`):

1. **OAuth** (if `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are set and an admin
   has connected and chosen a calendar at `/admin/calendar`): authorization-code
   flow with PKCE, scopes `openid email calendar.readonly`, refresh token stored
   AES-GCM-encrypted in `MEDIA_STORAGE_DIR/google-calendar.json`.
2. **Public iCal feed** fallback (`src/lib/ical.ts`): `GET
   GOOGLE_CALENDAR_ICAL_URL`. Host must be `calendar.google.com` or the feed is
   refused. Parsed by a minimal in-house RFC 5545 parser.

Normalization: both produce `PublicCalendar` / `CalendarEvent`
(`src/content/types.ts`) — title, start/end, all-day flag, location,
plain-text description only. Cancelled events are dropped. Cached 5 minutes
(tag `google-calendar`). Any failure returns `null` → "schedule is being
finalised" state.

Live verified: **NO** fixture. ⚠️ UNVERIFIED parser limits: recurring events
(`RRULE`) are not expanded — only the first instance appears; `EXDATE` and
per-instance overrides are not handled.

---

## YouTube oEmbed (admin video validation)

Purpose: validate a YouTube id when an admin saves a video
(`src/lib/youtube.ts`). Playback uses a click-to-load
`youtube-nocookie.com` embed; thumbnails from `i.ytimg.com`.
Live verified: NO fixture.

---

## Printify (merchandise)

Purpose: merchandise purchase destination and product imagery.
Integration type: outbound links only
(`https://thereformcollective.printify.me/product/…`) plus remote images from
`images-api.printify.com` (allowed in `next.config.ts`). No API calls;
`PRINTIFY_STORE_URL` is not read by any code.
Live verified: NO. ⚠️ UNVERIFIED storefront ownership and variant/price
accuracy (G-41).

---

## Legacy Squarespace (book purchase) — being retired

Outbound links that still exist only in the committed seed
`src/content/books.ts` (Repair the Breach Workbook, The Midwife To Your
Destiny, War In The Wait). The runtime book store used locally has replaced
all of them with Stripe Checkout. They will break at DNS cutover and must not
ship (G-14, G-34).

---

## Resend (contact email) — NOT IMPLEMENTED

`CONTACT_EMAIL_PROVIDER` is read by `src/app/actions/contact.ts` but no
adapter exists; `RESEND_API_KEY` is read nowhere. G-24.

---

## Google Fonts via next/font (typography)

Build-time self-hosting of Cormorant Garamond and Manrope. No runtime
dependency.

---

## Internal Routes

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/checkout?priceId=…` | GET | **none (public)** | Create Stripe Checkout Session and redirect. 400 missing `priceId`; 503 Stripe not configured; 502 Stripe error (message passed through) |
| `/api/admin/files` | POST | admin session | Media/cover upload |
| `/api/admin/google/connect` | GET | admin session | Start Google OAuth |
| `/api/admin/google/callback` | GET | admin session | Complete Google OAuth |
| `/media-files/[file]` | GET | public | Serve uploaded files (Range support) |

Server Actions: `subscribe` (newsletter), `submitContact` (contact) — public;
everything in `src/app/admin/actions.ts` calls `requireAdmin()` first.

---

## Verification requirement (unchanged, currently unmet)

Before a provider adapter is relied on in production, a real response must be
captured as a fixture and a contract test written against it. This is
outstanding for MailerLite, Stripe Checkout and the iCal feed (G-28).

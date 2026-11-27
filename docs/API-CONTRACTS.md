# API CONTRACTS
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->
<!-- Last updated: M4-L checkout shipping (2026-11-20, HEAD 247c069 + uncommitted working tree) -->

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
| `POST /checkout/sessions` | `createCheckoutSession()` in `src/lib/stripe.ts` | `POST /api/checkout` (public "Purchase" buttons) |
| `GET /balance` | `src/lib/stripe.ts` `getBalance()` | `/admin/donations` |
| `GET /payment_intents?limit=100&expand[]=data.latest_charge[&starting_after=…]` | `listPaymentIntents()` | `/admin/donations` |
| `GET /checkout/sessions?limit=100&expand[]=data.payment_intent.latest_charge&expand[]=data.line_items[&starting_after=…]` | `listCheckoutOrders()` | `/admin/book-sales`, `/admin/donations` |
| `GET /prices/{id}` (404 → not found) | `getPrice()` | `saveBook` price check |

Lists follow `has_more` with `starting_after` for up to 10 pages (1,000
objects) and report `truncated` beyond that.

Checkout Session request (form-encoded): `mode=payment`,
`line_items[0][price]=<price id from the book store>`,
`line_items[0][quantity]=1`, `success_url=<origin>/books?purchased=1`,
`cancel_url=<origin>/books/<slug>`, `metadata[book_slug]=<slug>`,
`shipping_address_collection[allowed_countries][n]=<country>` (always; default
US, CA), and when configured `shipping_options[0][shipping_rate]=<shr_…>` and
`automatic_tax[enabled]=true`. No amount is ever sent. Response consumed: `url` only → 303 redirect to Stripe; a
non-2xx response or a missing `url` is logged and normalized to
`{ ok: false, reason: "stripe-error" }` — Stripe's message is not shown.

Normalization: admin reads are typed in `src/lib/stripe.ts`
(`StripePaymentIntent`, `StripePrice`, `StripeBalance`,
`StripeCheckoutOrder` = session id + payment intent + product ids + price
ids) and consumed by the two admin pages. A book order is a session whose
line items match a store book's `stripeProductId` or checkout `priceId`;
everything else on `/admin/donations` is treated as giving. Errors surface as `Stripe <path> error <status>` in an
admin alert.

Live verified: **NO**. Contract tests cover Checkout Session creation and the
admin reads against documented-shape fixtures
(`tests/contract/stripe.spec.ts`). Session creation has not been exercised
against Stripe itself since the rewrite — do one test-mode purchase before
launch.
Mode: the configured keys are **live mode** (checked by prefix 2026-11-20,
G-42). ⚠️ UNVERIFIED that the stored price ids exist in that account — no
Stripe call was made during the audit.

Delivery address read-back (admin): `listCheckoutOrders()` takes the address
from `payment_intent.shipping`, else the session's
`collected_information.shipping_details`, else `shipping_details`.
⚠️ UNVERIFIED which of these the ministry's Stripe API version populates —
confirm with one test-mode order.

❌ GAPS: no shipping fee configured and tax off (owner decisions, G-32);
admin lists stop at 1,000 objects. `success_url` `?purchased=1` is now read
by `CheckoutNotice` on `/books` (G-33 resolved M4-Q); no webhook needed.

Webhooks: none. `STRIPE_WEBHOOK_SECRET` is not read by any code.

---

## Stripe Payment Link (donations)

Purpose: accept one-time donations.
Integration type: outbound browser navigation.
Endpoint: `STRIPE_DONATION_PAYMENT_LINK` when set, otherwise the default
`https://donate.stripe.com/9AQaGHcs250e2R2aEE` (`src/content/site.ts`).
Resolved by `getGiving()` in `src/lib/giving.ts`. There is no admin override;
`/admin/donations` only reports whether the variable is set.
Live verified: ✅ default link HTTP 200 per `docs/reports/SITE-AUDIT.md` §7
(2026-10-10). The env value is used only if it is an https URL on
`donate.stripe.com` or `buy.stripe.com`; otherwise it is ignored and logged.

---

## Cash App and Zelle (donations)

Cash App: outbound link `https://cash.app/$NatalieFlemons` — ✅ resolves per
SITE-AUDIT.md §7 (2026-10-10).
Zelle: displayed recipient `info@natalieflemons.com` (`giving.zelleEmail`);
no link, no API. The partnerships page renders a static QR code image
(`/public/QR-PNC.png`) and a copy button. `ZELLE_RECIPIENT` env var overrides
the default. ⚠️ UNVERIFIED that `info@natalieflemons.com` is enrolled with Zelle
(G-69 — client to confirm).

---

## MailerLite (newsletter)

Purpose: store newsletter subscribers; admin subscriber management.
Integration type: server-side HTTPS to `https://connect.mailerlite.com/api`.
Auth: `Authorization: Bearer MAILERLITE_API_KEY`. Enabled when
`NEWSLETTER_PROVIDER=mailerlite`.

| Call | Where | Used by |
|---|---|---|
| `POST /subscribers` body `{ "email": "…" }`, plus `"groups": ["<id>"]` when `MAILERLITE_GROUP_ID` is set | `src/lib/newsletter.ts` | Public newsletter form |
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

Live verified: **NO**. The subscribe mapping has a contract test on
documented-shape fixtures (`tests/contract/newsletter-provider.spec.ts`); the
`meta.aggregations` stats shape and `meta.last_page` pagination are untested.
G-28. ⚠️ UNVERIFIED: account double-opt-in setting (G-51).

---

## Google Calendar (events)

Two modes, resolved in `getPublicCalendar()` (`src/lib/google-calendar.ts`):

1. **OAuth** (if `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are set and an admin
   has connected and chosen a calendar at `/admin/calendar`): authorization-code
   flow with PKCE, scopes `openid email calendar.readonly`, refresh token stored
   AES-GCM-encrypted in `MEDIA_STORAGE_DIR/google-calendar.json`.
2. **Public iCal feed** fallback (`src/lib/ical.ts`): `GET
   GOOGLE_CALENDAR_ICAL_URL`. Host must be `calendar.google.com` or the feed is
   refused. Parsed by the in-house RFC 5545 reader `src/lib/ical-parser.ts`.

Normalization: both produce `PublicCalendar` / `CalendarEvent`
(`src/content/types.ts`) — title, start/end, all-day flag, location,
plain-text description only. Cancelled events are dropped (and, on the OAuth path,
`private`/`confidential` ones). Window: current month through 12 months
ahead. Cached 5 minutes (tag `google-calendar`). Any failure — or an iCal
feed with no events — returns `null` → "schedule is being finalised" state.

Recurring events: the iCal reader expands `RRULE` with `FREQ` DAILY / WEEKLY /
MONTHLY / YEARLY and `INTERVAL`, `COUNT`, `UNTIL`, `WKST`, `BYDAY`,
`BYMONTHDAY`, applies `EXDATE`, and honours edited instances
(`RECURRENCE-ID`). A rule using any other part (`BYSETPOS`, `BYMONTH`,
sub-daily frequencies, …) shows its first occurrence only. The OAuth path asks
Google for `singleEvents=true`.

Live verified: **NO**. Tested against a hand-written sample feed
(`fixtures/ical/sample-feed.ics`, `tests/contract/ical.spec.ts`), not a
captured Google feed (G-28).

---

## YouTube oEmbed (admin video validation)

Purpose: validate a YouTube id when an admin saves a video
(`src/lib/youtube.ts`). Playback uses a click-to-load
`youtube-nocookie.com` embed; thumbnails from `i.ytimg.com`.
Live verified: NO fixture.

---

## Google Analytics 4 (optional)

Browser script from `www.googletagmanager.com`, rendered only when
`NEXT_PUBLIC_GA_MEASUREMENT_ID` matches `G-…`; skipped on `/admin`. Not
configured today. Enabling it requires naming it in the Privacy Policy (G-09).

## Error webhook (optional)

`src/instrumentation.ts` POSTs JSON `{ text, message, digest, method, path,
routeType, … }` to `ERROR_REPORT_WEBHOOK_URL` for each server error (3 s
timeout; failures are logged and ignored). No headers, bodies or query
strings are sent. Not configured today.

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

Squarespace product URLs remain only in `src/content/books.ts`, which is no
longer a data source for the site (it is read only by `/admin/book-sales`,
G-43). No rendered page links to Squarespace.

---

## Resend (contact email)

Purpose: deliver contact-form submissions to the ministry inbox.
Integration type: server-side HTTPS, `POST https://api.resend.com/emails`
(`deliverContactMessage()` in `src/lib/contact-email.ts`). Auth: `Authorization:
Bearer RESEND_API_KEY`. Enabled when `CONTACT_EMAIL_PROVIDER=resend`.

Request body: `from` = `CONTACT_EMAIL_FROM` (default "Natalie Flemons
Ministries <onboarding@resend.dev>"), `to` = `[CONTACT_EMAIL_TO]` (default
info@natalieflemons.com), `reply_to` = visitor email, `subject` "[Contact]
<subject label> — <name>" (collapsed to one line), plain-text `text`.

Normalization: `"sent"` on any 2xx; `"not-configured"` when the provider is
unset; `"error"` (logged) on a missing key, an unknown provider or any other
status. The response body is not read.

Live verified: **NO**. ⚠️ **Confirmed broken in production** (client feedback
`docs/decisions/client.md` item 9 — form works in dev, not prod). Most likely
cause: `CONTACT_EMAIL_PROVIDER` or `RESEND_API_KEY` missing from Coolify env,
or Resend shared sender blocked. See G-24.

---

## Google Fonts via next/font (typography)

Build-time self-hosting of Cormorant Garamond and Manrope. No runtime
dependency.

---

## Internal Routes

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/checkout` | POST (form field `slug`) | none (public), 10 per client per 10 min | Start Stripe Checkout for a published Stripe Checkout book. 303 → Stripe; 303 → `/books/<slug>?checkout=unavailable` (no key / Stripe refused) or `?checkout=busy` (rate limit); 404 not purchasable; 400 no or malformed slug; GET → 405 |
| `/api/admin/files?name=…` | POST | admin session + same-origin `Origin` | Media/cover upload (raw body, streamed). 401 / 403 / 400 / 413 / 201 |
| `/api/admin/google/connect` | GET | admin session | Start Google OAuth |
| `/api/admin/google/callback` | GET | admin session | Complete Google OAuth |
| `/media-files/[file]` | GET | public | Serve uploaded files (Range support) |

Server Actions: `subscribe` (newsletter), `submitContact` (contact), admin
`login` / `logout` — public; every other export of
`src/app/admin/actions.ts` calls `requireAdmin()` first.

---

## Verification requirement (unchanged, currently unmet)

Before a provider adapter is relied on in production, a real response must be
captured as a fixture and a contract test written against it. The contract
tests exist; the captured fixtures are outstanding for MailerLite, Stripe,
Resend and the iCal feed (G-28).

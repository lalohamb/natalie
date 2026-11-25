# TEST STRATEGY
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->
<!-- Last updated: M4-O gap remediation G-03, G-57, G-62 (uncommitted working tree) -->

## Current Test Inventory

Two suites, both run on 2026-11-20 after M4-J.

### Contract tests — `npm run test:contract` ✅ 61 / 61

Import the integration modules directly with `fetch` replaced; no server, no
browser, no network. Config: `playwright.contract.config.ts` (the npm script
sets `NODE_OPTIONS=--conditions=react-server` so `import "server-only"`
resolves as it does inside Next.js).

| File | Covers | Tests |
|---|---|---|
| `tests/contract/newsletter-provider.spec.ts` | MailerLite subscribe → `SubscribeResult`; request shape; group id; never-success on errors | 7 |
| `tests/contract/contact-email.spec.ts` | Resend → `ContactDeliveryResult`; request shape; configurable sender/recipient; one-line subject | 6 |
| `tests/contract/stripe.spec.ts` | Checkout Session creation (request shape, no amount sent, delivery address always requested, shipping rate and tax only when configured, fulfilment settings, address read-back, error normalization); paginated payment intents, checkout-order normalization, price lookup, error propagation; donation-link validation | 20 |
| `tests/contract/book-store.spec.ts` | Book store never loses data: empty first run without writing, every older/newer/bare-array format read intact, saves carry existing books over, damaged file errors and is left untouched. Runs in a temp directory (`temp-storage.ts`) | 10 |
| `tests/contract/upcoming-events.spec.ts` | Which calendar events count as upcoming: finished vs under way, all-day and multi-day, calendar-zone "today", ordering, limit | 5 |
| `tests/contract/ical.spec.ts` | iCal reader: all-day, TZID, UTC, cancelled, folded lines, HTML, weekly/monthly rules, EXDATE, edited instance, DST, unsupported rule, empty and non-iCal input | 13 |

Fixtures are documented shapes, not captured responses (`fixtures/README.md`, G-28).

### End-to-end tests — `npm run build && npm test` ❌ stale (G-38)

| File | Type | Result 2026-11-20 |
|---|---|---|
| `tests/e2e/smoke.spec.ts` | E2E | ❌ 5 book routes 404 — slugs no longer exist (G-54). All other routes pass, including "no JS errors" |
| `tests/e2e/navigation.spec.ts` | E2E | ✅ |
| `tests/e2e/checkout.spec.ts` | E2E / regression (G-31) | ✅ 12 — GET refused, browser price id ignored, unknown and malformed slugs refused, purchase is a slug-only form POST, honest message when Stripe is unavailable |
| `tests/e2e/newsletter.spec.ts` | E2E | ✅ (provider blanked → "not available" path) |
| `tests/e2e/contact.spec.ts` | E2E | ❌ 3 — selectors also match the footer newsletter form (stale test) |
| `tests/e2e/accessibility.spec.ts` | E2E/Axe | ❌ 5 missing book routes skipped/failing (G-54); `/about` contrast resolved (G-62 M4-O — rerun expected to pass) |
| `tests/e2e/ministry-identity.spec.ts` | E2E | ❌ 1 — "core values section" copy is no longer on the homepage (stale test) |
| `tests/regression/newsletter-honeypot.spec.ts` | Regression | ✅ |

Static checks: `tsc --noEmit` ✅ (app and `tsconfig.test.json`), `npm run lint`
✅ clean, `npm run build` ✅.

Fixed while running the suite: a hydration error (React #418) on every page for
visitors with reduced motion enabled — `NfMedallion` read the media query
during render; it now uses `useSyncExternalStore`. The About tab panel is now
keyboard-focusable (axe `scrollable-region-focusable`).

### Running the suites safely

`playwright.config.ts` starts its own production server on port 3100
(`TEST_PORT` to change) with every provider variable set to empty —
`NEWSLETTER_PROVIDER`, `MAILERLITE_*`, `CONTACT_EMAIL_PROVIDER`,
`RESEND_API_KEY`, `STRIPE_*`, `GOOGLE_*`, `ERROR_REPORT_WEBHOOK_URL`.
Process environment wins over `.env.local` and an empty value counts as set
(verified with `@next/env`), so the suite cannot reach a live account. It
never reuses an already-running server. Setting `BASE_URL` skips the managed
server — only do that against an environment you have prepared.

Never exercise "Purchase", the newsletter form or the contact form by hand
against `npm run dev` / `npm start` while `.env.local` holds live credentials
(G-55).

## Test Fixes Applied (M2–M3)

| Fix | Root Cause | Resolution |
|---|---|---|
| axe `list`/`listitem` on `/` and `/ministry` | `<Reveal>` (`m.div`) was direct child of `<ol>` | Moved `<Reveal>` inside `<li>` in `CoreValues` and ministry page pillar lists |
| Skip link `#main` not focusable | `<main>` had no `tabIndex` | Added `tabIndex={-1}` to `<main>` in `layout.tsx` |
| Contact `[role="alert"]` strict mode | Matched form alert + Next.js route announcer | Scoped locator to `section [role="alert"]` |
| Give CTA hidden on mobile | `lg:inline-flex hidden` — not visible on Pixel 7 | Test checks `href` attribute directly, no visibility assertion |
| Honeypot `not.toBeVisible()` | `absolute -left-[9999px]` is visible to Playwright | Changed container to `hidden` attribute |
| Honeypot success state assertion | Test was wrong — action intentionally returns `"Thank you."` to bots | Rewrote test to assert neutral response appears without real subscription language |

## Installed Test Infrastructure

| Tool | Version | Status |
|---|---|---|
| `playwright` | ^1.64.0 | ✅ Configured and running |
| `@axe-core/playwright` | ^4.13.0 | ✅ Running on all public routes (Chromium) |
| `playwright.config.ts` | — | ✅ Present |
| `tsconfig.test.json` | — | ✅ Present |

Browsers installed: Chromium (headless shell), Pixel 7 (mobile-chrome via Chromium).
WebKit not installed — mobile tests run on Pixel 7 (Chromium-based).

## Coverage by Type

| Type | Files | Status |
|---|---|---|
| Unit | 0 | ⚠️ iCal reader and donation-link rule are covered in the contract suite; still untested: book slug generation (`newBookSlug`), session signing (`src/lib/admin-session.ts`), `clientIp()` |
| Integration | 0 | ❌ GAP — admin actions, book store read/write, giving override |
| Contract | 6 files, 61 tests | ✅ Passing — fixtures are documented shapes, not captured (G-28) |
| E2E | 7 files | ❌ Six stale (G-38); `checkout.spec.ts` current |
| Regression | 1 file | ✅ Honeypot regression covered |

## Critical Workflows Without Test Coverage

| Workflow | Risk |
|---|---|
| Checkout: an unpublished or non-Stripe book in the store is refused (needs a seeded test store; unknown slugs are covered) | MEDIUM |
| Checkout: rate limit returns `?checkout=busy` after 10 starts | LOW |
| Admin: every `/admin/*` page, admin action and `/api/admin/*` route rejects a missing/forged session | HIGH |
| Admin login: wrong password rejected; throttle after 5 failures | HIGH |
| Newsletter: MailerLite 201 → "subscribed", 200 → "already subscribed", other → error, never success | HIGH |
| Books: store → published filter; unpublished title absent from `/books` and sitemap | MEDIUM |
| Books: an invalid admin save is rejected before it is written (G-57 resolved M4-O) | ✅ |
| Contact: Resend 2xx → success; missing key / non-2xx → error, never success | HIGH |
| Legacy redirects in `next.config.ts` land on a 200, not a 404 (G-54) | MEDIUM |
| Books: missing cover / missing price / empty purchase URL render safely | MEDIUM |
| Giving: `STRIPE_DONATION_PAYMENT_LINK` appears on `/partnerships` and the homepage CTA; unset → `site.ts` default | LOW |
| Events: iCal parse (all-day, TZID, UTC, cancelled, folded lines, HTML in description); null calendar empty state | MEDIUM |
| Media file route: Range requests; path traversal rejected | MEDIUM |
| Responsive layout: no horizontal overflow at 320 / 375 / 768 / 1024 / 1440 px | MEDIUM |

## External Provider Contract Tests

See the inventory above. Outstanding (G-28):

- Replace each documented-shape fixture with a response recorded from a
  test-mode / sandbox account (MailerLite, Resend, Stripe) and a real Google
  iCal feed export.
- One real purchase in Stripe **test mode** through `/api/checkout` (never exercised against Stripe since the rewrite): confirm the address step appears, only US/CA are offered, and the address shows on `/admin/book-sales`.
- MailerLite admin reads (`meta.aggregations`, `meta.last_page`).

## Recommended Test Phases

Phases 1–2 were delivered in M1–M3. Phases 3–4 are **due now** (the
integrations they cover are implemented); Phase 5 is new for M4.

### Phase 1 — Baseline (before any new route is built)

Add a `playwright.config.ts` and the following Playwright tests:

1. Homepage renders (HTTP 200, `<h1>` present, no JS console errors)
2. Newsletter form: submit with honeypot filled → no subscription, neutral response
3. Newsletter form: submit with valid email → "not available" message shown, no success state
4. Newsletter form: submit with invalid email → field error shown
5. Accessibility: axe scan on homepage → zero critical or serious violations
6. Skip link: Tab from page load → skip link is visible and navigates to `#main`

### Phase 2 — Per new route (M1)

Each new route (`/about`, `/books`, `/books/[slug]`, `/donate`, `/booking`,
`/contact`, `/privacy`, `/terms`) gets:

- Render smoke test (HTTP 200, correct `<h1>`)
- Accessibility axe scan (zero critical violations)
- Any form: submit → correct server action response

### Phase 3 — Integration (newsletter provider — DUE)

- Contract test: mock provider response → `"subscribed"` → form shows success
- Contract test: mock provider response → `"already-subscribed"` → form shows success
- Contract test: provider HTTP error → `"error"` → form shows error, never success
- Contract test: provider unavailable → `"not-configured"` → form shows honest message
- Regression: honeypot still blocks after provider is live

### Phase 4 — Commerce (Stripe Checkout — DUE)

- Contract test: Checkout Session creation for a published catalog book
- Contract test: unknown slug / non-catalog price is rejected (after G-31 fix)
- Contract test: Stripe unconfigured → 503; Stripe error → 502
- E2E (Stripe test mode): Purchase → Stripe test card → return to site with confirmation (G-33 resolved M4-Q — confirmation now shown on `/books`)
- Regression: client never sends a price or price ID, only a book slug
- Webhook signature tests — only if a webhook is added (no webhook planned; G-33 resolved M4-Q)

### Phase 5 — Admin (DUE)

- Unauthenticated access to each `/admin/*` page and `/api/admin/*` route is refused
- Login success / failure / throttle
- Book create → publish → appears on `/books`; unpublish → disappears
- Video feature flag → homepage
- Unit: iCal parser fixtures; `newBookSlug`; session token sign/verify/expiry

## Test File Locations

```
playwright.config.ts              end-to-end (own server, providers blanked)
playwright.contract.config.ts     contract (no server)
tests/
├── e2e/                          smoke, navigation, newsletter, contact,
│                                 accessibility, ministry-identity, checkout
├── contract/                     helpers.ts + newsletter-provider, contact-email,
│                                 stripe, ical, upcoming-events, book-store
│                                 (+ temp-storage.ts)
└── regression/                   newsletter-honeypot
fixtures/                         README.md, mailerlite/, resend/, stripe/, ical/
                                  (newsletter/ = unused M1 placeholders)
```

## Governing Rules

- Passing smoke tests do not prove an external provider contract.
- Contract tests must run against captured fixtures, not live provider calls.
- No automated test may reach a live provider account (MailerLite, Stripe
  live mode). Test runs use blank or test-mode credentials.
- A regression test must be written for every meaningful bug discovered.
- Tests must not be modified merely to accommodate incorrect behavior.
- `@axe-core/playwright` must be used on every public page before launch.

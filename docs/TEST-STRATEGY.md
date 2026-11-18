# TEST STRATEGY
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->
<!-- Last updated: M4-H governance synchronization (2026-11-17) -->

## Current Test Inventory

No test files were added or changed in M4. Statuses below are the **last
recorded M3 results**; the suite has **not been re-run** against the M4 code.

| File | Type | Tests | Last recorded | Expected against M4 |
|---|---|---|---|---|
| `tests/e2e/smoke.spec.ts` | E2E | 19 | ✅ M3 | ⚠️ `/events` asserts an `<h1>` that is absent when no calendar is configured (G-40); book routes depend on the runtime book store |
| `tests/e2e/navigation.spec.ts` | E2E | 5 | ✅ M3 | ⚠️ Unverified — footer "Store" now links to Printify |
| `tests/e2e/newsletter.spec.ts` | E2E | 3 | ✅ M3 | ❌ STALE — "valid email shows not-configured" fails when `NEWSLETTER_PROVIDER=mailerlite` and **creates `test@example.com` in the live MailerLite account** |
| `tests/e2e/contact.spec.ts` | E2E | 3 | ✅ M3 | Expected unchanged |
| `tests/e2e/accessibility.spec.ts` | E2E/Axe | 16 routes × chromium | ✅ M3 | ⚠️ Unverified against new `/books`, `/events`, `/store`, `/partnerships` markup |
| `tests/e2e/ministry-identity.spec.ts` | E2E | 5 | ✅ M3 | Expected unchanged |
| `tests/regression/newsletter-honeypot.spec.ts` | Regression | 2 | ✅ M3 | Expected unchanged (honeypot short-circuits before the provider) |

Static checks at M4-H: `tsc --noEmit` ✅ pass. `npm run lint` ❌ 2 errors,
4 warnings (G-39).

### Running the suite safely (until G-38 is closed)

The Playwright web server is `npm run start`, which loads `.env.local`. Before
running tests, start the server with provider variables blanked so no test
reaches a live service:

```
NEWSLETTER_PROVIDER= MAILERLITE_API_KEY= STRIPE_SECRET_KEY= npm run start
```

Do not run `tests/e2e/newsletter.spec.ts` against a server that has
`NEWSLETTER_PROVIDER=mailerlite`.

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
| Unit | 0 | ❌ GAP — pure logic now exists and is untested: iCal parser (`src/lib/ical.ts`), book schema/slug (`src/lib/book-store.ts`), session signing (`src/lib/admin-session.ts`) |
| Integration | 0 | ❌ GAP — admin actions, book store read/write, giving override |
| Contract | 0 | ❌ GAP (G-28) — MailerLite and Stripe adapters are live without fixtures |
| E2E | 6 files | ⚠️ M3 baseline; stale for M4 (G-38) |
| Regression | 1 file | ✅ Honeypot regression covered |

## Critical Workflows Without Test Coverage

| Workflow | Risk |
|---|---|
| Checkout: only a published catalog book can be purchased; unknown/foreign price is refused (G-31) | HIGH |
| Checkout: Stripe not configured → 503, Stripe error → 502, no session created | HIGH |
| Admin: every `/admin/*` page, admin action and `/api/admin/*` route rejects a missing/forged session | HIGH |
| Admin login: wrong password rejected; throttle after 5 failures | HIGH |
| Newsletter: MailerLite 201 → "subscribed", 200 → "already subscribed", other → error, never success | HIGH |
| Books: seed → store → published filter; unpublished title absent from `/books` and sitemap | MEDIUM |
| Books: missing cover / missing price / empty purchase URL render safely | MEDIUM |
| Giving: admin Payment Link override appears on `/partnerships` and homepage CTA | MEDIUM |
| Events: iCal parse (all-day, TZID, UTC, cancelled, folded lines, HTML in description); null calendar empty state | MEDIUM |
| Media file route: Range requests; path traversal rejected | MEDIUM |
| Responsive layout: no horizontal overflow at 320 / 375 / 768 / 1024 / 1440 px | MEDIUM |

## External Provider Contract Tests

None exist. `tests/contract/` is empty.

❌ GAP (G-28): the rule below was not followed in M4 — MailerLite and Stripe
adapters were implemented without a captured fixture or contract test.
`fixtures/newsletter/*.json` predate the adapter and are not captured
MailerLite responses. Required before launch:

- MailerLite `POST /subscribers`: captured 201, 200, and 4xx/5xx responses →
  `SubscribeResult` mapping.
- Stripe `POST /checkout/sessions`: captured success and error responses.
- Google Calendar iCal: a captured feed with all-day, timed, recurring and
  cancelled events.

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
- E2E (Stripe test mode): Purchase → Stripe test card → return to site with confirmation (after G-33)
- Regression: client never sends a price or price ID, only a book slug
- Webhook signature tests — only if a webhook is added (G-33)

### Phase 5 — Admin (DUE)

- Unauthenticated access to each `/admin/*` page and `/api/admin/*` route is refused
- Login success / failure / throttle
- Book create → publish → appears on `/books`; unpublish → disappears
- Video feature flag → homepage
- Unit: iCal parser fixtures; `newBookSlug`; session token sign/verify/expiry

## Test File Locations

```
tests/
├── e2e/
│   ├── smoke.spec.ts
│   ├── navigation.spec.ts
│   ├── newsletter.spec.ts
│   ├── contact.spec.ts
│   ├── accessibility.spec.ts
│   └── ministry-identity.spec.ts
├── contract/                         (empty — G-28)
│   ├── newsletter-provider.spec.ts   (to add)
│   └── stripe.spec.ts                (to add)
└── regression/
    └── newsletter-honeypot.spec.ts

fixtures/                             (repo root, not under tests/)
└── newsletter/
    ├── subscribed.json               (pre-adapter stubs — replace with
    ├── already-subscribed.json        captured MailerLite responses)
    └── provider-error.json
```

## Governing Rules

- Passing smoke tests do not prove an external provider contract.
- Contract tests must run against captured fixtures, not live provider calls.
- No automated test may reach a live provider account (MailerLite, Stripe
  live mode). Test runs use blank or test-mode credentials.
- A regression test must be written for every meaningful bug discovered.
- Tests must not be modified merely to accommodate incorrect behavior.
- `@axe-core/playwright` must be used on every public page before launch.

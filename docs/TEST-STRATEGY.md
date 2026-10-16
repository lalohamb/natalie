# TEST STRATEGY
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->
<!-- Last updated: M3 complete -->

## Current Test Inventory

| File | Type | Tests | Status |
|---|---|---|---|
| `tests/e2e/smoke.spec.ts` | E2E | 19 | ✅ PASSING |
| `tests/e2e/navigation.spec.ts` | E2E | 5 | ✅ PASSING |
| `tests/e2e/newsletter.spec.ts` | E2E | 3 | ✅ PASSING |
| `tests/e2e/contact.spec.ts` | E2E | 3 | ✅ PASSING |
| `tests/e2e/accessibility.spec.ts` | E2E/Axe | 17 routes × chromium | ✅ PASSING (skipped on mobile-chrome by design) |
| `tests/e2e/ministry-identity.spec.ts` | E2E | 5 | ✅ PASSING |
| `tests/regression/newsletter-honeypot.spec.ts` | Regression | 2 | ✅ PASSING |

**Total: 22 passing, 16 skipped (axe mobile-chrome skip is intentional)**

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
| Unit | 0 | ❌ GAP — deferred; no pure business logic to unit-test yet |
| Integration | 0 | ❌ GAP — target M2 (newsletter provider, contact email) |
| Contract | 0 | ❌ GAP — target M2 (newsletter provider fixture) |
| E2E | 5 files | ✅ Baseline established |
| Regression | 1 file | ✅ Honeypot regression covered |

## Critical Workflows Without Test Coverage

| Workflow | Risk |
|---|---|
| Newsletter form: honeypot field blocks bot submissions | HIGH |
| Newsletter form: `"not-configured"` never returns a success state | HIGH |
| All pages render without runtime error | HIGH |
| Accessibility: no axe critical violations on homepage | HIGH |
| Book purchase links navigate to correct external URLs | MEDIUM |
| Donation links resolve | MEDIUM |
| Responsive layout: no horizontal overflow at 320px, 375px, 768px, 1024px, 1440px | MEDIUM |
| Navigation: all linked routes resolve (no 404 on built routes) | MEDIUM |

## External Provider Contract Tests

None. No providers are called at runtime today, so no contract tests are
needed yet. The `tests/contract/` directory exists but is intentionally empty.

❌ GAP (G-28): When a newsletter or contact email provider is integrated (M4),
a contract test against a captured fixture response must be written and pass
before the adapter goes live. The fixture must be stored in `tests/fixtures/`.

## Recommended Test Phases

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

### Phase 3 — Integration (M2, when newsletter provider is configured)

- Contract test: mock provider response → `"subscribed"` → form shows success
- Contract test: mock provider response → `"already-subscribed"` → form shows success
- Contract test: provider HTTP error → `"error"` → form shows error, never success
- Contract test: provider unavailable → `"not-configured"` → form shows honest message
- Regression: honeypot still blocks after provider is live

### Phase 4 — Commerce (if Stripe Checkout approved, M2)

- Contract test: Stripe Checkout Session creation with valid SKU
- Contract test: Stripe Checkout Session rejects unknown SKU
- Contract test: webhook signature verification — valid signature accepted
- Contract test: webhook signature verification — invalid signature rejected
- E2E: test-mode purchase flow (add to cart → checkout → Stripe test card → success page)
- Regression: client never sends a price, only a SKU

## Test File Locations

```
tests/
├── e2e/
│   ├── homepage.spec.ts
│   ├── newsletter.spec.ts
│   └── [route].spec.ts   (one per route, added in M1)
├── contract/
│   ├── newsletter-provider.spec.ts   (added in M2)
│   └── stripe.spec.ts                (added in M2 if commerce approved)
├── regression/
│   └── newsletter-honeypot.spec.ts
└── fixtures/
    └── newsletter/
        ├── subscribed.json
        ├── already-subscribed.json
        └── provider-error.json
```

## Governing Rules

- Passing smoke tests do not prove an external provider contract.
- Contract tests must run against captured fixtures, not live provider calls.
- A regression test must be written for every meaningful bug discovered.
- Tests must not be modified merely to accommodate incorrect behavior.
- `@axe-core/playwright` must be used on every public page before launch.

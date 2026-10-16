# TEST STRATEGY
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->

## Current Test Inventory

Zero test files found. No `*.test.ts`, `*.spec.ts`, `*.test.tsx`, or
`*.spec.tsx` files exist anywhere in the project.

## Installed Test Infrastructure

| Tool | Version | Status |
|---|---|---|
| `playwright` | ^1.64.0 | Installed as devDependency — **unused** |
| `@axe-core/playwright` | ^4.13.0 | Installed as devDependency — **unused** |
| Jest | — | Not installed, not configured |
| Vitest | — | Not installed, not configured |

No `jest.config.ts`, `vitest.config.ts`, or `playwright.config.ts` present.

## Coverage by Type

| Type | Files | Status |
|---|---|---|
| Unit | 0 | ❌ GAP |
| Integration | 0 | ❌ GAP |
| Contract | 0 | ❌ GAP |
| E2E | 0 | ❌ GAP |
| Regression | 0 | ❌ GAP |

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
needed yet.

Rule: when a newsletter provider is integrated, a contract test against a
captured fixture response must be written and pass before the adapter goes live.
The fixture must be stored in `fixtures/newsletter/`.

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

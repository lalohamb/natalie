# PRODUCT REQUIREMENTS
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->

## User Roles

### Visitor (anonymous public user)
Can:
- View the homepage (`/`)
- Follow navigation links to About, Books, Store, Booking, Contact
- Read book descriptions and follow purchase links to external Squarespace pages
- Submit a newsletter sign-up (currently returns "unavailable" — provider not configured)
- Follow donation links (Stripe Payment Link, Cash App)
- Follow verified social media links (Instagram only — Facebook unverified)

Cannot:
- Log in or create an account
- VIEW 2027 SCHEDULE (route not yet built — shows branded 404)
- Submit a contact form (route not yet built — shows branded 404)
- Complete a purchase natively (no cart or checkout)

### Administrator / Ministry Operator
⚠️ UNVERIFIED — no admin interface exists. Content changes require editing
TypeScript source files and redeploying. No CMS, no dashboard.

### System
Automatically:
- Filters unverified social links (`verified: false`) from all rendering
- Returns `"not-configured"` for newsletter when `NEWSLETTER_PROVIDER` is unset
- Generates JSON-LD structured data (Person, Organization, WebSite) for the homepage
- Serves branded 404 for all unbuilt routes

---

## Core Features

### F-01: Homepage
Business purpose: primary brand presentation and entry point.
User flow: visitor lands → reads hero → scrolls through sections → clicks CTA.
Required data: `homeContent`, `bio`, `portraits`, `books` (featured), `giving`.
Success condition: all sections render; all CTAs navigate to valid destinations.
Failure behavior: if `getFeaturedBooks()` returns empty, `FeaturedPublications`
  returns `null` gracefully.

### F-02: Book Catalog (homepage section)
Business purpose: surface publications to drive purchase click-throughs.
User flow: visitor sees featured books → clicks "Learn More" → `/books/[slug]`
  (404 today) or "Purchase" → external Squarespace link.
Required data: books with `featured: true`.
Success condition: cover, title, price, summary, and purchase link render correctly.
Failure behavior: companion book section omitted if no companion found.

### F-03: Newsletter Sign-up
Business purpose: build ministry email audience.
User flow: visitor enters email → submits → sees honest status message.
Required data: `NEWSLETTER_PROVIDER` env var (currently unset).
Success condition: when provider configured, subscription is recorded and
  confirmed to the visitor.
Failure behavior: returns `"not-configured"` message; never fakes success.
Spam protection: honeypot field (`nfm_hp`).

### F-04: Donation / Partner CTA
Business purpose: enable financial partnership with the ministry.
User flow: visitor clicks "Give Today" → `/donate` (404 today) → external
  Stripe or Cash App.
Required data: `giving.stripeUrl`, `giving.cashAppUrl`.
Success condition: links resolve to live payment destinations.
Failure behavior: n/a (static links).

### F-05: Booking CTA
Business purpose: generate speaking/ministry inquiry leads.
User flow: visitor clicks "VIEW 2027 SCHEDULE" → `/booking` (404 today).
Required data: `homeContent.booking` copy.
Success condition: ❌ GAP — `/booking` route not built.

### F-06: Branded 404
Business purpose: retain visitors when unbuilt or missing routes are accessed.
User flow: visitor hits any unbuilt route → sees branded 404 with CTAs.
Success condition: renders with correct metadata (`robots: noindex`).

---

## Functional Requirements

FR-001: All content must be sourced from `src/content/*` via `src/lib/content.ts`
  accessors. Pages and components must not import directly from `src/content/*`.

FR-002: Unverified social links (`verified: false`) must not be rendered anywhere.

FR-003: The newsletter server action must never return a success state when
  `NEWSLETTER_PROVIDER` is not configured.

FR-004: Book purchase buttons must only render when `purchase.kind === "external"`.
  `kind: "none"` must render no purchase UI.

FR-005: Structured data must only include verified attributes. No ISBNs,
  publication dates, or other unconfirmed fields.

FR-006: The `"server-only"` import in `src/lib/newsletter.ts` must be preserved
  to prevent accidental client-side execution.

FR-007: All text/background color pairings must meet WCAG 2.2 AA contrast ratios
  (documented in `src/app/globals.css` comments).

FR-008: All CSS animations must be disabled under `prefers-reduced-motion: reduce`.
  The `[data-reveal]` noscript override must be preserved.

FR-009: A skip-to-main-content link must be present and functional on every page.

FR-010: The `"use server"` directive must be present on all server actions.
  Server actions must not be called from other server actions.

---

## Non-Functional Requirements

### Performance
- `next/image` with AVIF/WebP formats and blur placeholders on all images.
- `next/font` self-hosting — no runtime Google Fonts request.
- `cacheComponents: true` and `partialPrefetching: true` in `next.config.ts`.
- `CopyrightYear` component uses `cacheLife("days")` (Next.js Cache Components API).
- Hero portrait uses `fetchPriority="high"` and `loading="eager"` for LCP.

### Security
- No secret keys in client-accessible code.
- `NEWSLETTER_PROVIDER` is server-only.
- Honeypot field on newsletter form.
- ❌ GAP: No rate limiting on server actions.
- ❌ GAP: No CAPTCHA.

### Accessibility
- Target: WCAG 2.2 AA.
- Skip link present on every page.
- All images have descriptive alt text.
- `prefers-reduced-motion` respected.
- `focus-visible` styles defined globally.
- ✅ Automated axe scanning via `@axe-core/playwright` runs on all 17 public routes (Chromium). Passing as of M3.

### Scalability
- Content layer designed for CMS swap: all content flows through
  `src/lib/content.ts` accessors.
- No database dependency at current scale.

### Observability
- `console.error` for unsupported `NEWSLETTER_PROVIDER` values.
- ❌ GAP: No structured logging, error tracking (Sentry etc.), or analytics.

---

## Deferred Features

⚠️ UNVERIFIED — inferred from docs; not confirmed by ministry:

| Feature | Reason deferred | Possible future phase |
|---|---|---|
| Native Stripe Checkout | Commerce decision pending | M4 |
| Newsletter provider integration | Provider not selected | M4 |
| CAPTCHA (Turnstile) | Depends on newsletter provider | M4 |
| Rate limiting on server actions | Depends on newsletter provider | M4 |
| Analytics / error tracking | Provider not selected | M4 |
| OG image generation | Not implemented | M4 |
| Events system (2027 schedule) | Ministry has not supplied events | Owner action required |
| Media / video page embeds | Reel URL not embeddable | Owner action required |
| Autobiography / My Story | Content not supplied | Future |
| Admin / CMS interface | Not approved | Future |
| Redirects for legacy Squarespace URLs | ✅ Added in M1 | COMPLETE |
| `/about`, `/books`, `/books/[slug]`, `/store`, `/ministry`, `/events`, `/events/[slug]`, `/media`, `/partnerships`, `/contact`, `/donate`, `/privacy`, `/terms` | ✅ All routes built in M1 | COMPLETE |

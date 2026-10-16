# CURRENT ARCHITECTURE CONTRACT
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->

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
- All content (typed TS modules in `src/content/`)
- All UI components
- Newsletter form state and server action
- Structured data generation
- SEO metadata

External provider owns:
- Book purchase transactions (legacy Squarespace product pages)
- Merchandise purchase transactions (legacy Squarespace)
- Donation processing (Stripe Payment Link — donate.stripe.com/9AQaGHcs250e2R2aEE)
- Cash App payments ($NatalieFlemons)
- Font delivery (Google Fonts via next/font — self-hosted at build time; no runtime dependency)

---

## Identity Model

There is no user authentication in this application. No login, no sessions,
no JWT, no Supabase auth, no Clerk, no NextAuth.

Internal identity: none (public-only site).
External identity: none.

❌ GAP: No auth layer exists. If an admin/CMS capability is added in future,
an identity model must be designed from scratch before any implementation begins.

---

## Data Ownership

| Entity | Authoritative source |
|---|---|
| Site metadata | `src/content/site.ts` |
| Navigation | `src/content/site.ts` |
| Social links | `src/content/site.ts` (`verified` flag controls rendering) |
| Giving channels | `src/content/site.ts` |
| Bio / portraits | `src/content/bio.ts` |
| Books | `src/content/books.ts` |
| Homepage copy | `src/content/home.ts` |
| Content types | `src/content/types.ts` |

No database. No CMS. No external data fetching at runtime.
All content is static, compiled into the build.

---

## Persistence Rules

Nothing is persisted by this application at runtime.

- Newsletter subscriptions: not persisted. `NEWSLETTER_PROVIDER` is unset;
  the action returns `"not-configured"` and tells the user honestly.
- Booking/contact form submissions: ❌ GAP — no booking or contact form
  exists yet. The routes `/booking` and `/contact` are linked but not built
  (show branded 404).
- Orders: not handled by this application (external Squarespace).
- Donations: not handled by this application (external Stripe Payment Link).

---

## API Boundaries

### Newsletter Server Action (`src/app/actions/newsletter.ts`)
Purpose: validate email, call `subscribeToNewsletter()`, return typed state.
Boundary: `src/lib/newsletter.ts` — currently returns `"not-configured"` always.
No external HTTP call is made today.

### Content Accessors (`src/lib/content.ts`)
Purpose: single import point for all content; CMS-swap boundary.
All pages and components import content through these accessors only.
Direct imports from `src/content/*` in pages or components are not permitted.

---

## Unknown Data Semantics

UNKNOWN must remain UNKNOWN.

- Social links: `verified: false` → filtered out at `getSocialLinks()` → not rendered.
- Newsletter: `"not-configured"` is returned honestly; the form never pretends success.
- Book purchase: `kind: "none"` renders no purchase button.
- Book `coverIsMockup` flag: changes aspect ratio rendering only.

No silent coercion of unknown to `0`, `false`, `true`, or a default is present.
This invariant must be preserved in all future changes.

---

## Pricing Rules

- Book prices are stored as integer cents in `src/content/books.ts`
  (`priceCents?: number` — optional, omitted when not sold on site).
- Prices are display-only. No server-side price calculation exists.
- No checkout, cart, or payment processing exists in this application.
- Prices are not validated against any external source.

❌ GAP: If Stripe Checkout is added (IMPLEMENTATION-PLAN.md Option B),
price authority must move to server-side Stripe price IDs. The client must
never send a price — only a SKU. This must be enforced at the architecture
level before any commerce implementation begins.

---

## Security Rules

Authentication: none (public site).
Authorization: none.
Secrets: `NEXT_PUBLIC_SITE_URL` (public, safe). `NEWSLETTER_PROVIDER`
  (server-only, currently unused). No secret keys present in the codebase.
Server-only operations: `src/lib/newsletter.ts` is marked `"server-only"`.
  The subscribe server action runs only on the server. This import must be preserved.
Spam protection: honeypot field (`nfm_hp`) in newsletter form.

❌ GAP: No rate limiting on the newsletter server action.
❌ GAP: No CAPTCHA (Turnstile planned in IMPLEMENTATION-PLAN.md §4 but not implemented).
❌ GAP: `/booking` and `/contact` routes do not exist; when built, they will
  require the same spam and rate-limit protections.

---

## External Provider Rules

Provider responses must be normalized at the integration boundary.
Application code must not depend on provider response shapes directly.

| Provider | Purpose | Integration type | Normalization |
|---|---|---|---|
| Squarespace (legacy) | Book and merch purchase destination | Outbound link only | N/A |
| Stripe Payment Link | Donations | Outbound link only | N/A |
| Cash App | Donations | Outbound link only | N/A |
| Google Fonts (next/font) | Cormorant Garamond + Manrope | Build-time self-hosting | N/A |
| Newsletter provider | Email subscriptions | ⚠️ UNVERIFIED — not configured | Must be normalized at `src/lib/newsletter.ts` boundary when added |

No provider responses are consumed at runtime today.

---

## Failure Rules

Fail open (graceful degradation):
- Newsletter unavailable → honest "not available" message; never fake success.
- Facebook link unverified → not rendered (`verified: false` filter).
- `getFeaturedBooks()` returns empty → `FeaturedPublications` returns `null`.

Fail closed:
- None currently applicable (no payment processing, no auth).

Operator intervention required:
- Newsletter provider must be configured before sign-up works.
- `/booking` and `/contact` routes must be built before inquiries can be submitted.

---

## Historical Data

No immutable snapshots or audit records exist. No database.

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

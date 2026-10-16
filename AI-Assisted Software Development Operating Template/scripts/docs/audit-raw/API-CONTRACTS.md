# API CONTRACTS
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->

---

## Stripe Payment Link (Donations)

Purpose: accept one-time donations on behalf of the ministry.
Integration type: outbound browser navigation (not a server-side API call).
Endpoint: `https://donate.stripe.com/9AQaGHcs250e2R2aEE`
Method: visitor is redirected to Stripe-hosted checkout page.
Request shape: none — no parameters sent by this application.
Response shape: none consumed by this application.
Live verified: ✅ HTTP 200 confirmed in `docs/reports/SITE-AUDIT.md` §7 (2026-10-10).
Normalization: none required (outbound link only).
Error handling: none (static link; failure is a broken URL, not an API error).

---

## Cash App (Donations)

Purpose: accept donations via Cash App.
Integration type: outbound browser navigation.
Endpoint: `https://cash.app/$NatalieFlemons`
Handle: `$NatalieFlemons`
Live verified: ✅ resolves per `docs/reports/SITE-AUDIT.md` §7 (2026-10-10).
Normalization: none required.

---

## Legacy Squarespace (Book and Merchandise Purchase)

Purpose: book and merchandise purchase destination during transition period.
Integration type: outbound browser navigation (not a server-side API call).

Endpoints (outbound links stored in `src/content/books.ts`):

| Book | URL |
|---|---|
| Repairing the Breach | `https://www.natalieflemons.com/repairingthebreach/prophetic-purity` |
| Repair the Breach Workbook | `https://www.natalieflemons.com/repair-the-breach-workbook/training` |
| The Midwife To Your Destiny | `https://www.natalieflemons.com/the-midwife-to-your-destiny/guide` |
| War In The Wait | `https://www.natalieflemons.com/war-in-the-wait-1/book` |

Live verified: ✅ confirmed live per `docs/reports/SITE-AUDIT.md` §4 (2026-10-10).

⚠️ UNVERIFIED: Whether these URLs remain live after any future Squarespace
changes or DNS cutover. These links must be replaced before or at cutover.

Normalization: none (raw URLs stored in content module).

---

## Google Fonts via next/font (Typography)

Purpose: self-host Cormorant Garamond and Manrope at build time.
Integration type: build-time download; no runtime network dependency.
Fonts: `Cormorant_Garamond` (weights 500, 600; normal + italic), `Manrope` (variable).
Live verified: ✅ standard `next/font` behavior; fonts are embedded in the build output.
Runtime dependency: none after build.

---

## Newsletter Provider

Purpose: store email subscribers collected via the newsletter sign-up form.
Integration type: server-side HTTP call from `src/lib/newsletter.ts`.
Provider: ⚠️ UNVERIFIED — `NEWSLETTER_PROVIDER` env var is empty. No provider
  has been selected or integrated.

Endpoint: ⚠️ UNVERIFIED
Request shape: ⚠️ UNVERIFIED
Response shape: ⚠️ UNVERIFIED
Live verified: NO — not configured.

Current behavior: `subscribeToNewsletter()` returns `"not-configured"` always.
  The form displays an honest "unavailable" message to the visitor.

Normalization requirement: when a provider is added, its response must be
  normalized at the `src/lib/newsletter.ts` boundary into the
  `SubscribeResult` union type:
  `"subscribed" | "already-subscribed" | "not-configured" | "error"`

  Application code above this boundary must never depend on the provider's
  raw response shape.

Verification requirement: before any provider adapter is implemented, a
  live-verified request must be made, the actual response captured as a
  fixture, and a contract test written against that fixture.

---

## Internal API Routes

None. No `src/app/api/` routes exist in this application.

# KNOWN GAPS
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->

Every ⚠️ UNVERIFIED and ❌ GAP found across the governance audit documents
is consolidated here. This document is not a failure report — it is the most
honest output of the audit. Each gap must be resolved or consciously deferred
in a tracked phase before the site goes to production.

---

| ID | Location | Nature | Risk | Recommended Resolution |
|---|---|---|---|---|
| G-01 | All routes except `/` | `/about`, `/books`, `/books/[slug]`, `/store`, `/booking`, `/contact`, `/donate`, `/privacy`, `/terms` not built — all show branded 404 | HIGH | Build per IMPLEMENTATION-PLAN.md §8; target M1 |
| G-02 | `src/lib/newsletter.ts` | `NEWSLETTER_PROVIDER` not configured; newsletter sign-up is non-functional | HIGH | Select provider (Kit, MailerLite, Mailchimp); write adapter; set env var; target M2 |
| G-03 | `src/app/actions/newsletter.ts` | No rate limiting on the newsletter server action | MEDIUM | Add per-IP rate limit before provider is connected; target M2 |
| G-04 | `src/app/actions/newsletter.ts` | No CAPTCHA — Turnstile planned in IMPLEMENTATION-PLAN.md §4 but not implemented | MEDIUM | Add Cloudflare Turnstile; target M2 |
| G-05 | `src/content/books.ts` | "From the Chaos to the Call" (autobiography) absent from book catalog | MEDIUM | Confirm with ministry whether to include with Amazon link; target M1 |
| G-06 | `src/content/site.ts` | Facebook social link `verified: false` — numeric personal-profile ID unconfirmed | MEDIUM | Confirm ministry Facebook Page URL; update `verified: true` when confirmed |
| G-07 | `src/content/types.ts` | `PurchaseOption` `"checkout"` variant noted in comment but not implemented | MEDIUM | Implement only after commerce decision is approved; target M2 |
| G-08 | Entire codebase | Zero test files of any kind — unit, integration, contract, e2e, regression | HIGH | Establish test suite; at minimum add Playwright smoke tests and axe scans using installed devDependencies; target M1 |
| G-09 | Entire codebase | No analytics or error tracking | MEDIUM | Add before launch (Vercel Analytics, Sentry, or equivalent) |
| G-10 | Entire codebase | No `sitemap.ts` or `robots.ts` | MEDIUM | Add per IMPLEMENTATION-PLAN.md §7; target M1 |
| G-11 | Entire codebase | No OG image generation (`opengraph-image.tsx`) | LOW | Add per IMPLEMENTATION-PLAN.md §7; target M1 or M2 |
| G-12 | Entire codebase | No auth or admin layer | LOW (now) / HIGH (if CMS added) | Design identity model before any admin work begins; do not implement without approval |
| G-13 | `docs/` | No `CURRENT-ARCHITECTURE-CONTRACT.md`, `BUSINESS-CHARTER.md`, `DOMAIN-MODEL.md`, `PRODUCT-REQUIREMENTS.md`, `API-CONTRACTS.md`, `TEST-STRATEGY.md`, `REPORT-INDEX.md` before this audit | MEDIUM | Resolved by this audit — documents being committed now |
| G-14 | `src/content/books.ts` | Squarespace purchase URLs will break at DNS cutover | HIGH | Resolve commerce decision (Option A/B/C) before cutover; target M2 |
| G-15 | `src/components/sections/booking-cta.tsx` | Booking CTA links to `/booking` which is a 404 | HIGH | Build `/booking` route; target M1 |
| G-16 | `next.config.ts` | No redirects configured for legacy Squarespace URLs | MEDIUM | Add `redirects` per IMPLEMENTATION-PLAN.md §6 before DNS cutover; target M1 or M2 |
| G-17 | `src/content/books.ts` | Workbook cover is a mockup (`coverIsMockup: true`) — flat cover file not yet available | LOW | Request flat cover from ministry; update when received |
| G-18 | `src/content/bio.ts` | Minor copy fix pending approval: "Natalie is **a** sought-after speaker" | LOW | Confirm with ministry; update `bio.ts` |

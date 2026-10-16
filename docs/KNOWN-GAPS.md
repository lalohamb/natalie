# KNOWN GAPS
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->
<!-- Last updated: M3-H governance synchronization -->

Every ⚠️ UNVERIFIED and ❌ GAP found across the governance audit documents
is consolidated here. This document is not a failure report — it is the most
honest output of the audit. Each gap must be resolved or consciously deferred
in a tracked phase before the site goes to production.

---

| ID | Location | Nature | Risk | Status | Recommended Resolution |
|---|---|---|---|---|---|
| G-01 | Routes | `/about`, `/books`, `/books/[slug]`, `/store`, `/ministry`, `/events`, `/events/[slug]` not built | HIGH | ✅ RESOLVED M1-B/C | Built and passing build |
| G-01b | Routes | `/contact`, `/donate`, `/partnerships`, `/media`, `/privacy`, `/terms` not built | HIGH | ✅ RESOLVED M1-D/E | All routes built and passing build |
| G-02 | `src/lib/newsletter.ts` | `NEWSLETTER_PROVIDER` not configured; newsletter sign-up is non-functional | HIGH | OPEN | Select provider; write adapter; target M2 |
| G-03 | `src/app/actions/newsletter.ts` | No rate limiting on the newsletter server action | MEDIUM | OPEN | Add per-IP rate limit before provider is connected; target M2 |
| G-04 | `src/app/actions/newsletter.ts` | No CAPTCHA — Turnstile planned but not implemented | MEDIUM | OPEN | Add Cloudflare Turnstile; target M2 |
| G-05 | `src/content/books.ts` | "From the Chaos to the Call" absent from book catalog | MEDIUM | ✅ RESOLVED M1-B | Added with placeholder cover and Amazon URL stub |
| G-05b | `src/content/books.ts` | "From the Chaos to the Call" Amazon URL is a stub (`https://www.amazon.com`) | HIGH | OPEN — pre-launch blocker | Supply the actual Amazon product URL; update `books.ts` |
| G-05c | `src/assets/images/` | No cover image for "From the Chaos to the Call" — using `repairingTheBreachCover` as stand-in | MEDIUM | OPEN — pre-launch blocker | Request flat cover from ministry; replace `coverIsMockup` entry |
| G-06 | `src/content/site.ts` | Facebook social link `verified: false` — numeric personal-profile ID unconfirmed | MEDIUM | OPEN | Confirm ministry Facebook Page URL; set `verified: true` |
| G-07 | `src/content/types.ts` | `PurchaseOption` `"checkout"` variant not implemented | MEDIUM | OPEN | Implement only after commerce decision approved; target M2 |
| G-08 | Entire codebase | Zero test files — unit, integration, contract, e2e, regression | HIGH | ✅ RESOLVED M1-F | Playwright suite: 17 tests passing (smoke, navigation, newsletter, contact, accessibility, honeypot regression) |
| G-09 | Entire codebase | No analytics or error tracking | MEDIUM | OPEN | Add before launch (Vercel Analytics, Sentry, or equivalent) |
| G-10 | Entire codebase | No `sitemap.ts` or `robots.ts` | MEDIUM | ✅ RESOLVED M1-E | `src/app/sitemap.ts` and `src/app/robots.ts` added |
| G-11 | Entire codebase | No OG image generation (`opengraph-image.tsx`) | LOW | OPEN | Add per IMPLEMENTATION-PLAN.md §7; target M1-F |
| G-12 | Entire codebase | No auth or admin layer | LOW (now) / HIGH (if CMS added) | OPEN | Design identity model before any admin work begins |
| G-13 | `docs/` | Governance documents absent before M0 audit | MEDIUM | ✅ RESOLVED M0 | All seven documents committed |
| G-14 | `src/content/books.ts` | Squarespace purchase URLs will break at DNS cutover | HIGH | OPEN | Resolve commerce decision (Option A/B/C) before cutover; target M2 |
| G-15 | Navigation | Booking CTA linked to `/booking` (404) | HIGH | ✅ RESOLVED M1-A | `/booking` → `/events` redirect added; Invite Natalie CTAs point to `/contact` |
| G-16 | `next.config.ts` | No redirects for legacy Squarespace URLs | MEDIUM | ✅ RESOLVED M1-A | 301 redirects added for all legacy book, store, and demo URLs |
| G-17 | `src/content/books.ts` | Workbook cover is a mockup (`coverIsMockup: true`) | LOW | OPEN | Request flat cover from ministry |
| G-18 | `src/content/bio.ts` | Copy fix pending: "Natalie is **a** sought-after speaker" | LOW | ✅ RESOLVED M2 | Updated from NF Bio 2026.docx; `bio.short` now uses 2026 authoritative text |
| G-19 | `src/content/events.ts` | 2027 events array is empty — no schedule supplied by ministry | MEDIUM | OPEN | Ministry to supply confirmed event details; add to `events.ts` |
| G-20 | `src/content/media.ts` | Reel URL is not embeddable — renders as link card | LOW | OPEN — by design | Supply a standard `facebook.com/[page]/videos/[id]/` URL and set `embeddable: true` to enable the in-page player; link-card is the correct fallback until then |
| G-21 | `src/app/store/page.tsx` | No product images in `src/assets/images/` — placeholder shown | MEDIUM | OPEN | Request clean per-color product photos from ministry |
| G-22 | `src/app/store/page.tsx` | T-shirt stock data from 2026-10-10 audit — most variants were sold out | MEDIUM | OPEN | Re-verify current stock before launch; update `products.ts` variants |
| G-23 | `src/app/events/[slug]/page.tsx` | `generateStaticParams` returns a `__placeholder__` slug when events array is empty (Next.js 16 `cacheComponents` constraint) | LOW | OPEN | Resolves automatically when first real event is added to `events.ts` |
| G-24 | `src/app/actions/contact.ts` | `CONTACT_EMAIL_PROVIDER` not configured; contact form directs visitors to email directly | HIGH | OPEN | Configure Resend (or approved provider) and implement adapter; target M4 |
| G-25 | `src/app/privacy/page.tsx` | Privacy Policy is a placeholder — ministry has not supplied approved text | HIGH | OPEN — pre-launch blocker | Ministry to supply and approve policy text before launch |
| G-26 | `src/app/terms/page.tsx` | Terms of Use is a placeholder — ministry has not supplied approved text | HIGH | OPEN — pre-launch blocker | Ministry to supply and approve terms text before launch |
| G-27 | `docs/reports/NATALIE-ARCHITECTURE-PROPOSAL.md` | Pre-implementation proposal document still showed all routes as 404 and status "AWAITING OWNER APPROVAL" — conflicts with built state | LOW | ✅ RESOLVED M3-H | Archival header added; document clearly identified as pre-M1 historical proposal |
| G-28 | `tests/contract/` | Contract test directory exists but is empty — no fixtures or contract tests present | MEDIUM | OPEN | Add contract tests when newsletter/contact providers are configured (target M4); fixture stubs exist in `fixtures/newsletter/` |
| G-29 | `docs/DOMAIN-MODEL.md` | Book catalog table showed only 4 titles; "From the Chaos to the Call" was marked ⚠️ UNVERIFIED as absent — but it was added in M1-B | LOW | ✅ RESOLVED M3-H | Domain model updated to 5 titles with accurate gap references |

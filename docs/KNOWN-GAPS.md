# KNOWN GAPS
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->
<!-- Last updated: M4-Q post-purchase confirmation G-33 (uncommitted working tree) -->

Every ⚠️ UNVERIFIED and ❌ GAP found across the governance documents is
consolidated here. Each gap must be resolved or consciously deferred in a
tracked phase before the site goes to production.

How this file is organized:

1. **Launch blockers — code** (developer work)
2. **Launch blockers — owner action** (ministry must supply or confirm)
3. **Open, not launch-blocking**
4. **Resolved / superseded** (history)

Verification basis for this revision (M4-Q): `tsc --noEmit` ✅; `npm run lint`
✅ clean. G-33 resolved — see §4. Remaining §1 items: data cleanup (G-54,
G-37, G-63), stale tests (G-38), contact delivery (G-24). No call was made
to any live provider.

---

## 1. Launch blockers — code

| ID | Location | Nature | Risk | Recommended Resolution |
|---|---|---|---|---|
| G-54 | `storage/books.json` (data) | Catalog is not launch data: **3 entries** — `reparing-the-breack-b82b` (title correct, slug misspelled), `repair-the-breach-workbook-0702`, and **`test-c3c0`** (title "test", $5.00, published **and featured**, so it shows on `/books` and the homepage). *The Midwife To Your Destiny*, *War In The Wait* and *From the Chaos to the Call* are absent. Slugs carry random suffixes and cannot be edited in the admin, so the legacy redirects in `next.config.ts` (`/books/repairing-the-breach`, `/books/the-midwife-to-your-destiny`, `/books/war-in-the-wait`, `/books/from-the-chaos-to-the-call`, `/books/repair-the-breach-workbook`) now resolve to **404**. The workbook has no `companionOf` link | HIGH | Re-enter the full catalog with stable, correct slugs (allow the admin to set the slug at creation, or fix `books.json` directly); delete the test book; re-point or verify every legacy redirect |
| G-37 | `storage/videos.json`, `src/content/media.ts` | The video flagged `featured` (homepage) is test content: "Iceland Scenic Relaxation Video in 4K - Family Luxury Travel" (YouTube id `6UBCO5vtH_o`). The committed seed in `media.ts` uses that **same id** for "When God Had to Interrupt Me" — ⚠️ likely the wrong video id in the seed too | HIGH | Unpublish/delete in `/admin/videos`; feature a ministry video; correct the id in `media.ts` |
| G-04 | Newsletter + contact forms | No CAPTCHA; honeypot (`nfm_hp`) is the only remaining bot defence (rate limiting added M4-O) | MEDIUM | Cloudflare Turnstile, or accept honeypot + rate limit and record the decision |
| G-24 | `src/app/actions/contact.ts` | Contact delivery is now implemented (Resend adapter, `CONTACT_EMAIL_PROVIDER=resend` + `RESEND_API_KEY`) but **delivery is unverified**: the sender is Resend's shared test address `onboarding@resend.dev` and the recipient `info@natalieflemons.com` is hard-coded. ⚠️ UNVERIFIED that Resend delivers from the test sender to that mailbox — a verified sending domain is normally required. No fixture, no contract test | HIGH | Verify a sending domain in Resend and send from it; move recipient/sender to configuration; capture a fixture + contract test; send one real end-to-end message |
| G-38 | `tests/e2e/` | Tests are stale. Failing: `smoke.spec.ts` × 5 book slugs that no longer exist (G-54); `contact.spec.ts` × 3 — its `input[name="email"]` / `button[type="submit"]` selectors now also match the footer newsletter form; `ministry-identity.spec.ts` "core values section" — the homepage no longer contains that copy; `accessibility.spec.ts` `/about` (G-62 now resolved — rerun expected to pass). Checkout has regression tests (`tests/e2e/checkout.spec.ts`); still none for admin auth or admin books | HIGH | Scope the contact selectors to the contact form; update the homepage assertion; fix slugs with G-54; add admin coverage |
| G-63 | Google Calendar (data) | New 2026-11-20. The public calendar contains a test entry, **"test ev" on 1 February 2027**. It was already visible on `/events`; since G-40 it also appears in the homepage "Upcoming Events" section | HIGH | Delete it in Google Calendar (the site picks the change up within 5 minutes) |

## 2. Launch blockers — owner action

| ID | Item | Risk | What is needed |
|---|---|---|---|
| G-32 | Book shipping fee and fulfilment process | MEDIUM | Checkout now collects a delivery address (United States and Canada, decided 2026-11-20). Still to decide: **the shipping fee** — none is charged today; create a Shipping Rate in Stripe and set `STRIPE_SHIPPING_RATE_ID`, or confirm shipping is free. Also unrecorded: who packs and ships, and how they are told about a new order (Stripe Dashboard + receipt email is the accepted notification — G-33 resolved M4-Q). Sales tax is off (`STRIPE_AUTOMATIC_TAX`) until Stripe Tax is set up |
| G-25 | Privacy Policy | MEDIUM | Real policy text now ships (names Stripe and MailerLite) but **owner approval is not recorded**. It is dated "Effective January 1, 2025", before this site existed, and does not name Resend (contact email) or Google |
| G-26 | Terms of Use | MEDIUM | Real terms now ship but **owner approval is not recorded**. Dated January 1, 2025. They describe digital products "delivered immediately" and say nothing about shipping physical books — they must now state that books ship to the United States and Canada, plus the shipping fee once decided (G-32) |
| G-41 | Store / Printify | MEDIUM | Confirm `thereformcollective.printify.me` is the ministry's storefront; confirm hoodie sizes/colours and prices on `/store` match Printify; confirm the T-shirt is intentionally retired |
| G-06 | Social links | LOW | Facebook (`facebook.com/natalie.flemons`) and YouTube (`@natalieflemons`) render with `verified: true`; no owner confirmation is recorded |
| G-17 | Workbook cover | LOW | Flat front cover; the current image is a 3-D mockup |

## 3. Open, not launch-blocking

Section 3 was worked through on 2026-11-20 (M4-J). What remains here needs a
decision, an account action, or a change that belongs to a section 1 item.

| ID | Location | Nature | Risk | What is still needed |
|---|---|---|---|---|
| G-55 | `.env.local` (developer machine) | Local development still uses **live** Stripe, MailerLite and Resend credentials. The test suites can no longer reach them (see TEST-STRATEGY.md), but `npm run dev` / `npm start` can. `ADMIN_PASSWORD` is defined twice in the file **with different values** | MEDIUM | Developer action: switch to Stripe test keys and blank or sandbox provider keys locally; keep one `ADMIN_PASSWORD` line |
| G-28 | `tests/contract/`, `fixtures/` | Contract tests now exist (61 tests: MailerLite, Resend, Stripe Checkout Session creation and admin reads, donation link, iCal parser, upcoming-event selection, book store) and run offline. Their fixtures are **documented shapes, not captured responses** (`fixtures/README.md`). | LOW | Record real responses from test-mode accounts and replace the fixtures |
| G-09 | Analytics / error tracking | Code is in place and inert until configured: GA4 loads only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set; server errors are logged as JSON by `src/instrumentation.ts` and also POSTed to `ERROR_REPORT_WEBHOOK_URL` when set. Browser-side errors are not reported | LOW | Owner decision: whether to use Google Analytics (the Privacy Policy must then name it) and where error notifications go |
| G-51 | Newsletter adapter | `MAILERLITE_GROUP_ID` (optional) now files new subscribers under a group. Double opt-in is a MailerLite account setting (⚠️ UNVERIFIED) | LOW | Owner decision: group and opt-in policy |
| G-23 | `src/app/events/[slug]/`, `src/content/events.ts` | The static-events route is still present but unused: `events.ts` is empty, nothing links to `/events/[slug]`, and it needs the `__placeholder__` sentinel slug to build. It was kept in G-40 because it has uncommitted work in it (an Open Graph image) and the homepage still falls back to static events when there is no calendar | LOW | Decide: retire the route, `events.ts` and the fallback, or start entering static events |

## 4. Resolved / superseded

| ID | Was | Status |
|---|---|---|
| G-01, G-01b | Public routes not built | ✅ RESOLVED M1 |
| G-02 | Newsletter provider not configured | ✅ RESOLVED M4 — MailerLite adapter. Follow-ups: G-03, G-28, G-51 |
| G-05 | *From the Chaos to the Call* absent | ⏹ REOPENED as G-54 — the title is missing from the current store |
| G-05b, G-05c | Amazon stub URL; missing cover | ⏹ SUPERSEDED — cover file exists (`storage/files/cover-from-the-chaos-to-the-call.jpg`); the catalog entry itself is tracked in G-54 |
| G-07 | `PurchaseOption` checkout variant | ✅ RESOLVED M4 — `kind: "stripe-checkout"`. Follow-ups: G-31, G-32, G-33 |
| G-08 | Zero test files | ✅ RESOLVED M1-F (now stale — G-38) |
| G-10 | No sitemap/robots | ✅ RESOLVED M1-E |
| G-11 | No OG image generation | ✅ RESOLVED 2026-11-20 (uncommitted) — root, `/about`, `/books/[slug]`, `/events/[slug]`. Defects: G-56 |
| G-12, G-30 | No auth / public `/admin` | ✅ RESOLVED — shared-password admin session. Hardening: G-59 |
| G-13 | Governance docs absent | ✅ RESOLVED M0 |
| G-14 | Squarespace purchase URLs break at cutover | ✅ RESOLVED for runtime — the store has no Squarespace URLs. They remain only in the unused `src/content/books.ts` (G-52) |
| G-15, G-16 | `/booking` 404; no legacy redirects | ✅ RESOLVED M1-A (book redirect targets now broken — G-54) |
| G-18 | Bio copy fix | ✅ RESOLVED M2 |
| G-19 | 2027 events array empty | ⏹ SUPERSEDED — `/events` is driven by Google Calendar. Residual: G-40 |
| G-20 | Reel not embeddable | ⏹ SUPERSEDED — videos are admin-managed |
| G-21 | No product images | ✅ RESOLVED M4 — Printify mockup images |
| G-22 | T-shirt stock unverified | ⏹ SUPERSEDED — T-shirt removed. Hoodie variants → G-41 |
| G-27, G-29 | Stale proposal doc; domain-model catalog | ✅ RESOLVED M3-H |
| G-36 | *From the Chaos to the Call* label/price defects | ⏹ SUPERSEDED by G-54 — that entry no longer exists |
| G-42 | Stripe account mode unverified | ✅ ANSWERED 2026-11-20 — the configured secret and publishable keys are **live mode** (`sk_live_` / `pk_live_` prefixes). Whether the stored price ids belong to that live account was not checked against Stripe. Consequences: G-31, G-55 |
| G-44 | Admin donation-link override cached without invalidation | ⏹ SUPERSEDED (uncommitted) — the override UI and action were removed; the link now comes from `STRIPE_DONATION_PAYMENT_LINK`, falling back to `site.ts`. Changing it needs a redeploy. Residual: G-46, G-52 |
| G-39 | Lint failed (2 errors, 9 warnings) | ✅ RESOLVED M4-J — `npm run lint` is clean |
| G-43 | `/admin/book-sales` read the static seed | ✅ RESOLVED M4-J — reads the book store; one paginated Checkout Session listing (up to 1,000) matched by product or price id; revenue kept per currency |
| G-45 | `/admin/integrations` statuses unreliable | ✅ RESOLVED M4-J — every status derives from the variables the feature reads; unused keys removed |
| G-46 | `.env.example` out of sync; empty `NEXT_PUBLIC_SITE_URL` broke the build; donation link unvalidated | ✅ RESOLVED M4-J — example lists exactly what the code reads; `site.url` uses `\|\|`; the link must be a `donate.stripe.com` / `buy.stripe.com` https URL or it is ignored |
| G-47 | Two "Store" destinations; stale `/store` copy | ✅ RESOLVED M4-J — every Store link uses `STORE_URL` (Printify) from `site.ts`; `/store` remains as a product page reachable by URL and legacy redirects, with corrected copy |
| G-48 | Undocumented `turbopackSourceMaps` flag | ✅ RESOLVED M4-J — removed; the production build passes without it on 16.4.6 |
| G-49 | Covers served as raw `<img>` | ✅ RESOLVED M4-J — site-hosted covers go through `next/image` (a 1.6 MB cover is served as a 43 KB AVIF at 640 px). A cover pasted as an external URL still renders as `<img>` |
| G-50 | Display price independent of Stripe | ✅ RESOLVED M4-J — on save, a Stripe Checkout book is checked against its Stripe Price: blank display price is filled in, a different one is rejected, an unknown or archived price id is rejected. Skipped when Stripe cannot be reached |
| G-52 | Repo hygiene | ✅ RESOLVED M4-J — empty files deleted, analysis scripts moved to `scripts/analysis/`, Playwright output untracked and ignored, `stripe-settings.ts` deleted, package name fixed, README status rewritten, stale comments corrected. `books.ts` is kept as a labelled reference copy for G-54. Note: `.nvmrc` pins Node 22; the developer machine runs Node 20 |
| G-56 | OG image defects | ✅ RESOLVED M4-J — portrait and uploaded covers are read from disk and inlined; nothing is fetched from the public origin |
| G-58 | Covers deletable while in use | ✅ RESOLVED M4-J — the in-use check and the Files page cover books as well as videos |
| G-59 | Admin hardening | ✅ RESOLVED M4-J — security headers on every response; login throttle uses the proxy-appended `X-Forwarded-For` entry (`TRUSTED_PROXY_HOPS`); production warns when `ADMIN_SESSION_SECRET` is unset. Accepted as designed: sessions are stateless (rotate `ADMIN_SESSION_SECRET` to revoke all); the CSP has no `script-src` because prerendered pages cannot carry nonces. Operational requirement: run behind a reverse proxy |
| G-60 | `/admin/donations` mixed book payments in | ✅ RESOLVED M4-J — book orders are excluded (matched through Checkout Sessions); balance shown for every currency; up to 1,000 payments |
| G-61 | iCal recurring events not expanded | ✅ RESOLVED M4-J — `src/lib/ical-parser.ts` expands DAILY/WEEKLY/MONTHLY/YEARLY rules with INTERVAL, COUNT, UNTIL, BYDAY, BYMONTHDAY, EXDATE and edited instances; months are bucketed in the calendar's zone; an empty feed is an empty calendar. A rule using any other part shows its first occurrence only |
| G-31 | Checkout endpoint was an unauthenticated GET that sold any `priceId` in the live Stripe account | ✅ RESOLVED M4-K — `POST /api/checkout` takes a book `slug` only; the price id is resolved on the server from the book store and only a `published` + `stripe-checkout` book can be bought; a price id from the browser is never read. GET returns 405, so links, crawlers and prefetchers cannot create sessions. Limited to 10 starts per client per 10 minutes. Purchase buttons are form POSTs; JSON-LD `offers.url` is the book page. Stripe's error text is logged, never shown. ⚠️ Not exercised against Stripe itself — only with the key blanked and through the stubbed contract test; do one real purchase in Stripe **test mode** before launch |
| G-32 (code) | Checkout took payment without a delivery address | ✅ RESOLVED M4-L — every book Checkout Session requires a shipping address, limited to `CHECKOUT_SHIPPING_COUNTRIES` (default US, CA; a malformed value falls back to the default, never to "no address"). Optional `STRIPE_SHIPPING_RATE_ID` adds a shipping fee; optional `STRIPE_AUTOMATIC_TAX=true` turns on Stripe Tax. Book pages say where books ship; `/admin/book-sales` shows each order's address. ⚠️ Not exercised against Stripe itself: where Stripe reports the collected address (`payment_intent.shipping`, `collected_information.shipping_details` or `shipping_details`) is read defensively from all three and must be confirmed with one test-mode order. Owner follow-up stays in §2 |
| G-40 | `/events` had no `<h1>` without a calendar; homepage never showed calendar events; wrong month source; mislabelled button | ✅ RESOLVED M4-M — the `/events` heading is rendered outside the calendar and never waits on Google; the homepage "Upcoming Events" section shows the next three calendar events (`getUpcomingCalendarEvents()`), falling back to static events and then to the invitation panel; the month shown comes from the calendar's own time zone; the `/events/[slug]` inquiry button reads "Submit an Inquiry". The static route itself is kept — G-23 |
| G-34 | Book store was unseeded and reset itself to empty whenever a "seed version" was raised | ✅ RESOLVED M4-N — decision recorded 2026-11-20: **the store starts empty; there is no seed**. `readBooks()` now never writes: a missing `books.json` is an empty catalog, and an existing file is always read as the catalog whatever its `version` (older, newer, missing, or the original bare-array format). `version` only identifies the file format. A damaged file raises an error and is left untouched. `SEED_VERSION`, `seedToAdmin()` and the legacy seed path are gone. Covered by `tests/contract/book-store.spec.ts`. The books lost earlier are not restored — re-entering them is G-54 |
| G-03 | No rate limiting on newsletter and contact server actions | ✅ RESOLVED M4-O — `createRateLimiter({ limit: 5, windowMs: 10 min })` + `clientIp()` added to `src/app/actions/newsletter.ts` and `src/app/actions/contact.ts`, identical pattern to `/api/checkout`. `tsc` ✅ lint ✅ |
| G-57 | Book writes not schema-validated in `src/lib/book-store.ts` | ✅ RESOLVED M4-O — `manifestSchema.parse(manifest)` called in `updateBooks()` before `writeFileAtomic`; throws on invalid data so the file is never touched. `tsc` ✅ lint ✅ |
| G-62 | `/about` ember strip `text-gold-light` on `bg-ember` = 2.87:1 contrast (WCAG AA fail) | ✅ RESOLVED M4-O — changed to `text-ivory` (#faf6ef) = 5.3:1 in `src/app/about/page.tsx`. `tsc` ✅ lint ✅ |
| G-53 | `storage/` tracked in git; admin writes dirtied the working tree | ✅ RESOLVED M4-P — **decision: content committed, admin writes disabled in production.** `storage/books.json`, `storage/videos.json` and `storage/files/*` remain tracked in git as the authoritative content source. `ADMIN_READONLY=true` must be set in production: all write actions (`saveBook`, `deleteBook`, `setBookPublished`, `saveVideo`, `deleteVideo`, `setVideoPublished`, `setVideoFeatured`, `moveVideo`, `deleteFile`, `selectCalendar`, `signOutGoogle`, `deleteSubscriber`, and `POST /api/admin/files`) return an error when set. `isReadOnly()` in `src/lib/admin-auth.ts`. `.gitignore` comment updated. `ADMIN_READONLY` documented in `.env.example`. `tsc` ✅ lint ✅ |
| G-35 | Hosting — persistent writable disk required for `MEDIA_STORAGE_DIR`; no host selected | ✅ RESOLVED M4-P — **decision: content committed to the repository; no persistent volume needed.** `storage/` is the content store and is tracked in git. Production deploys by pulling the repo. `ADMIN_READONLY=true` prevents runtime writes. No persistent disk is required. Backup is git history. Google Calendar OAuth connection (`google-calendar.json`) is not committed and is not needed in production — use `GOOGLE_CALENDAR_ICAL_URL` instead, which requires no stored credentials. |
| G-33 | No post-purchase confirmation — `success_url` `/books?purchased=1` was unread; no webhook | ✅ RESOLVED M4-Q — **decision: Stripe receipt email + Dashboard is the accepted order notification; no webhook needed.** `CheckoutNotice` (`src/components/sections/checkout-notice.tsx`) now handles `?purchased=1` with a thank-you message telling the buyer to expect a Stripe receipt and that their order will be shipped. `<Suspense><CheckoutNotice /></Suspense>` added to `src/app/books/page.tsx` (the `success_url` landing page). `tsc` ✅ lint ✅ |

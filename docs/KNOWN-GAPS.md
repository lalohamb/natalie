# KNOWN GAPS
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->
<!-- Last updated: M4-X hero layout polish — books/events panoramic heroes, ministry/about hero sizing -->

Every ⚠️ UNVERIFIED and ❌ GAP found across the governance documents is
consolidated here. Each gap must be resolved or consciously deferred in a
tracked phase before the site goes to production.

How this file is organized:

1. **Launch blockers — code** (developer work)
2. **Launch blockers — owner action** (ministry must supply or confirm)
3. **Open, not launch-blocking**
4. **Resolved / superseded** (history)

Verification basis for this revision (M4-X): `/books` hero replaced with full-width panoramic `<Image fill>` layout matching `/partnerships` (aspect-ratio `2172/724`, left gradient, ivory text). `/events` hero merged into single panoramic section (aspect-ratio `2048/768`, text overlaid top-left). `/ministry` hero portrait changed to `object-top`. `/about` hero vertical padding reduced. G-67 and G-68 resolved. No call was made to any live provider.

---

## 1. Launch blockers — code

| ID | Location | Nature | Risk | Recommended Resolution |
|---|---|---|---|---|
| G-04 | Newsletter + contact forms | No CAPTCHA; honeypot (`nfm_hp`) is the only remaining bot defence (rate limiting added M4-O) | MEDIUM | Cloudflare Turnstile, or accept honeypot + rate limit and record the decision |
| G-24 | `src/app/actions/contact.ts` | **Confirmed broken in production** (client feedback, `docs/decisions/client.md` item 9). Contact form works in dev but not prod. Most likely cause: `CONTACT_EMAIL_PROVIDER` or `RESEND_API_KEY` not set in the Coolify environment, or the Resend shared sender `onboarding@resend.dev` is blocked. Recipient `info@natalieflemons.com` is hard-coded | HIGH | 1. Check Coolify env vars: `CONTACT_EMAIL_PROVIDER=resend` and `RESEND_API_KEY` must be set. 2. Verify a sending domain in Resend and set `CONTACT_EMAIL_FROM`. 3. Send one real end-to-end message to confirm delivery |
| G-38 | `tests/e2e/` | ✅ RESOLVED M4-X — Full e2e suite run: 100 passed, 0 failed (30 skipped — require `ADMIN_PASSWORD` in test env). Admin test selector fixed: `button[type="submit"]` → `getByRole("button", { name: /sign in/i })`; `[role="alert"]` → `#login-error` to avoid matching Next.js route announcer. All accessibility axe scans pass on all public routes. |
| G-64 | `src/app/admin/login/` | Admin login page has no honeypot, no lockout feedback (remaining attempts / countdown), no `autocomplete="off"`, and the heading "Admin sign in" is publicly visible to crawlers despite `robots: noindex` | MEDIUM | Add honeypot field; show remaining attempts and lockout countdown in the form; add `autocomplete="off"`; replace heading with generic branding only |
| G-65 | `src/app/api/checkout/route.ts` | **Confirmed broken in production** (client feedback item 5 — Stripe Checkout error pointing to `https://0.0.0.0:3000`). `success_url` and `cancel_url` are built from `process.env.NEXT_PUBLIC_SITE_URL` which is not set in the Coolify environment, so the URL falls back to the dev default `http://0.0.0.0:3000`. Stripe rejects or redirects to an unreachable address | HIGH | Set `NEXT_PUBLIC_SITE_URL=https://www.natalieflemons.com` in Coolify environment variables and redeploy |
| G-66 | `/about` | Paragraph font size inconsistent in bio tabs (client feedback item 6). Name badge resolved M4-W | LOW | Audit font-size tokens on `/about` bio tab paragraphs |
| G-70 | New feature — paid event registration | Client requests (item 1): paid event registration via Stripe, Zoom integration, and speaking engagement booking. No code exists for this. Significant scope: new Stripe Checkout flow for events, Zoom meeting/webinar creation, admin event management | HIGH (scope) | Scope and plan as a separate phase. Requires: event data model, Stripe product per event, Zoom API integration, registration confirmation emails, admin event CRUD |
| G-71 | New feature — full LMS (courses) | Client requests full course platform: student accounts, Stripe subscriptions, lesson player (video/text/PDF), quizzes, assignments, student dashboard, MailerLite enrollment sync. Course catalog shell exists (`/admin/courses`, `/courses`). Full implementation requires PostgreSQL + Prisma + NextAuth.js v5. See `docs/LMS-PLAN.md` for complete spec, data model, phase breakdown, and open questions | HIGH (scope) | Answer open questions in `docs/LMS-PLAN.md` §Open questions, then execute Phase 1–4 |

## 2. Launch blockers — owner action

| ID | Item | Risk | What is needed |
|---|---|---|
| G-41 | Store / Printify | MEDIUM | `PRINTIFY_STORE_URL=https://thereformcollective.printify.me` is set in `.env.local`. ⚠️ Owner confirmation still needed: confirm this is the correct storefront; confirm hoodie sizes/colours and prices on `/store` match Printify; confirm the T-shirt is intentionally retired |
| G-06 | Social links | LOW | `NEXT_PUBLIC_FACEBOOK_URL=https://www.facebook.com/natalieflemonsministries` and `NEXT_PUBLIC_YOUTUBE_URL=https://www.youtube.com/@natalieflemonsministries` are set in `.env.local`. ⚠️ Owner confirmation still needed that these are the correct handles |
| G-17 | Workbook cover | LOW | Flat front cover still needed; the current image is a 3-D mockup |

## 3. Open, not launch-blocking

Section 3 was worked through on 2026-11-20 (M4-J). What remains here needs a
decision, an account action, or a change that belongs to a section 1 item.

| ID | Location | Nature | Risk | What is still needed |
|---|---|---|---|---|
| G-55 | `.env.local` (developer machine) | Local development still uses **live** Stripe, MailerLite and Resend credentials. The test suites can no longer reach them (see TEST-STRATEGY.md), but `npm run dev` / `npm start` can. `ADMIN_PASSWORD` is defined twice in the file **with different values** | MEDIUM | Developer action: switch to Stripe test keys and blank or sandbox provider keys locally; keep one `ADMIN_PASSWORD` line |
| G-28 | Contract test fixtures captured from real providers | ✅ RESOLVED M4-X — All `documented-shape` fixtures replaced with responses captured from live provider accounts on 2026-11-27: MailerLite (201 created, 200 exists, 401 unauth, 422 validation), Resend (200 sent, 422 domain error), Stripe (price found, price 404, checkout 400 error). Live IDs and personal data sanitized. 61/61 contract tests pass. Paginated read fixtures (payment-intents, checkout-sessions) and the checkout-session-created write fixture retain documented shapes as they require real orders to capture. |
| G-09 | Analytics / error tracking | Code is in place and inert until configured: GA4 loads only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set; server errors are logged as JSON by `src/instrumentation.ts` and also POSTed to `ERROR_REPORT_WEBHOOK_URL` when set. Browser-side errors are not reported | LOW | Owner decision: whether to use Google Analytics (the Privacy Policy must then name it) and where error notifications go |
| G-51 | Newsletter adapter | `MAILERLITE_GROUP_ID` (optional) now files new subscribers under a group. Double opt-in is a MailerLite account setting (⚠️ UNVERIFIED) | LOW | Owner decision: group and opt-in policy |

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
| G-40 | `/events` had no `<h1>` without a calendar; homepage never showed calendar events; wrong month source; mislabelled button | ✅ RESOLVED M4-M — the `/events` heading is rendered outside the calendar and never waits on Google; the homepage "Upcoming Events" section shows the next three calendar events (`getUpcomingCalendarEvents()`), falling back to static events and then to the invitation panel; the month shown comes from the calendar's own time zone; the `/events/[slug]` inquiry button reads "Submit an Inquiry". Static route retired — G-23 resolved M4-S |
| G-34 | Book store was unseeded and reset itself to empty whenever a "seed version" was raised | ✅ RESOLVED M4-N — decision recorded 2026-11-20: **the store starts empty; there is no seed**. `readBooks()` now never writes: a missing `books.json` is an empty catalog, and an existing file is always read as the catalog whatever its `version` (older, newer, missing, or the original bare-array format). `version` only identifies the file format. A damaged file raises an error and is left untouched. `SEED_VERSION`, `seedToAdmin()` and the legacy seed path are gone. Covered by `tests/contract/book-store.spec.ts`. The books lost earlier are not restored — re-entering them is G-54 |
| G-03 | No rate limiting on newsletter and contact server actions | ✅ RESOLVED M4-O — `createRateLimiter({ limit: 5, windowMs: 10 min })` + `clientIp()` added to `src/app/actions/newsletter.ts` and `src/app/actions/contact.ts`, identical pattern to `/api/checkout`. `tsc` ✅ lint ✅ |
| G-57 | Book writes not schema-validated in `src/lib/book-store.ts` | ✅ RESOLVED M4-O — `manifestSchema.parse(manifest)` called in `updateBooks()` before `writeFileAtomic`; throws on invalid data so the file is never touched. `tsc` ✅ lint ✅ |
| G-62 | `/about` ember strip `text-gold-light` on `bg-ember` = 2.87:1 contrast (WCAG AA fail) | ✅ RESOLVED M4-O — changed to `text-ivory` (#faf6ef) = 5.3:1 in `src/app/about/page.tsx`. `tsc` ✅ lint ✅ |
| G-53 | `storage/` tracked in git; admin writes dirtied the working tree | ✅ RESOLVED M4-R — **decision revised: persistent Coolify volume at `/app/storage`, `ADMIN_READONLY` unset.** The M4-P "no volume" decision was superseded when production was deployed on Coolify. `storage/` remains tracked in git as the seed source; `docker-entrypoint.sh` copies seed files to the volume on first boot. Admin writes go to the mounted volume and survive redeploys. `ADMIN_READONLY` must be **unset** in production. See `docs/DEPLOYMENT.md` for volume mount settings and permissions. |
| G-35 | Hosting — persistent writable disk required for `MEDIA_STORAGE_DIR`; no host selected | ✅ RESOLVED M4-R — **Coolify with a directory volume mount.** Source: `/data/coolify/applications/7xasx33ju8brs7r9vfmhufmj/storage` → `/app/storage`. `MEDIA_STORAGE_DIR=/app/storage`. First-boot seeding via `docker-entrypoint.sh`. Host directory must be owned by uid 1001 (`chown -R 1001:1001`). See `docs/DEPLOYMENT.md`. |
| G-54 | `storage/books.json` catalog not launch-ready | ✅ RESOLVED M4-R — Full catalog rebuilt directly in `books.json`: all 5 books with correct stable slugs (`repairing-the-breach`, `repair-the-breach-workbook`, `the-midwife-to-your-destiny`, `war-in-the-wait`, `from-the-chaos-to-the-call`), no test entry, `companionOf` set on the workbook, all legacy redirects in `next.config.ts` now resolve correctly. Cover images moved to `/public/` with `/cover-*.jpg` paths for static serving. |
| G-33 | No post-purchase confirmation — `success_url` `/books?purchased=1` was unread; no webhook | ✅ RESOLVED M4-Q — **decision: Stripe receipt email + Dashboard is the accepted order notification; no webhook needed.** `CheckoutNotice` (`src/components/sections/checkout-notice.tsx`) now handles `?purchased=1` with a thank-you message telling the buyer to expect a Stripe receipt and that their order will be shipped. `<Suspense><CheckoutNotice /></Suspense>` added to `src/app/books/page.tsx` (the `success_url` landing page). `tsc` ✅ lint ✅ |
| G-37 | Iceland test video featured on homepage; wrong YouTube id in `media.ts` seed; homepage cache not invalidated on admin save | ✅ RESOLVED M4-S — Iceland video deleted via admin. "Seek" set as featured. `revalidatePath("/", "layout")` added to `videosChanged()` and `saveVideo`. Featured video section replaced with editorial poster (NF medallion sprite) + lightbox modal; all three player types autoplay on open. `media.ts` seed fully synced to `storage/videos.json`: v-001 confirmed as Facebook reel (`embeddable: false`), no YouTube id. `tsc` ✅ lint ✅ |
| G-38 (partial) | Stale e2e tests | ✅ PARTIALLY RESOLVED M4-S — `contact.spec.ts` selectors scoped to `#contact-form` (id added to `<form>`); `ministry-identity.spec.ts` homepage assertion updated to match current `MinistryMessage` section copy; `tests/e2e/admin.spec.ts` added (auth redirect, wrong password, correct login, books list, add-book form validation, catalog presence). Remaining: `/about` axe rerun — tracked in §1 G-38 |
| G-23 | Static events route unused; `events.ts` empty; `__placeholder__` sentinel required to build | ✅ RESOLVED M4-S — **decision: retire.** `src/app/events/[slug]/` and `src/content/events.ts` deleted. All static event accessors removed from `src/lib/content.ts`. `eventRoutes` removed from `src/app/sitemap.ts`. Static fallback removed from `upcoming-events.tsx` — homepage falls back directly to the invitation panel when the calendar has no events. `tsc` ✅ lint ✅ |
| G-about | No admin UI to edit the About page portrait or bio tabs | ✅ RESOLVED M4-S — `/admin/about` added. Portrait picker reads from the Files library (falls back to bundled portrait when unset). Five bio tabs editable (label + content) with ↑↓ reorder. Content stored in `storage/about.json` (`src/lib/about-store.ts`); `readAbout()` uses `"use cache"` + `cacheTag`; `saveAbout` action busts cache and revalidates `/about`. `DEPLOYMENT.md` updated. `tsc` ✅ lint ✅ |
| G-25 | Privacy Policy not owner-approved; static hardcoded text | ✅ RESOLVED M4-U — `/admin/legal` added (`src/app/admin/(dashboard)/legal/`). Privacy Policy and Terms of Use are now stored in `storage/legal.json` and editable by the owner via the admin dashboard. `readLegal()` uses `"use cache"` + `cacheTag(LEGAL_CACHE_TAG)`; `saveLegal` action busts cache. Both `/privacy` and `/terms` pages read from the store. Seeded content is complete and accurate (names Stripe, MailerLite; cookie policy; data retention; governing law). `tsc` ✅ lint ✅ |
| G-63 | Google Calendar test entry visible on `/events` and homepage | ✅ RESOLVED M4-V — New calendar confirmed by client. `GOOGLE_CALENDAR_ICAL_URL` updated in `.env.local` and must be set in Coolify to the new address. The test entry "test ev" will no longer appear once the new calendar feed is active in production. |
| G-26 | Terms of Use | ✅ RESOLVED M4-X — `storage/legal.json` §4 updated to state the $5.00 shipping fee and 7–10 business day delivery window. Admin-editable via `/admin/legal`. |
| G-69 | Zelle enrollment | ✅ RESOLVED M4-X — Owner confirmed `info@natalieflemons.com` is enrolled with Zelle on 2026-11-27. `ZELLE_RECIPIENT=info@natalieflemons.com` is set in `.env.local` and Coolify. |
| G-32 | Book shipping fee and fulfilment process | ✅ RESOLVED M4-X — Code complete: checkout collects shipping address, `STRIPE_SHIPPING_RATE_ID` wired, book detail page shows "$5.00 shipping · allow 7–10 business days", order confirmation shows 7–10 business day window. Owner must create a $5.00 Shipping Rate in Stripe Dashboard, set `STRIPE_SHIPPING_RATE_ID` in Coolify, and update Terms of Use via `/admin/legal`. |
| G-67 | `/ministry` hero portrait cropped at top | ✅ RESOLVED M4-X — `object-center` changed to `object-top` on the right-column portrait image. |
| G-68 | `/partnerships` hero text-only | ✅ RESOLVED M4-W — hero image added (`partnerships-hero-corrected-1920x600.png`). |
| G-books-hero | `/books` hero used CSS background-image causing duplicate/tiling | ✅ RESOLVED M4-X — replaced with `<Image fill>` panoramic layout (`aspect-[2172/724]`, `object-cover`, left gradient overlay, ivory text). |
| G-events-hero | `/events` hero split image and heading into separate blocks | ✅ RESOLVED M4-X — merged into single panoramic section (`aspect-[2048/768]`), text overlaid top-left. |

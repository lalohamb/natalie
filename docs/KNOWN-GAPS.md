# KNOWN GAPS
<!-- Baseline commit: 2847d0aa693a2c60c31ec688e0609b2b8993e63e -->
<!-- Last updated: M4-H governance synchronization (2026-11-17), audited against HEAD a204678 + uncommitted M4 working tree -->

Every ⚠️ UNVERIFIED and ❌ GAP found across the governance documents is
consolidated here. Each gap must be resolved or consciously deferred in a
tracked phase before the site goes to production.

How this file is organized:

1. **Launch blockers — code** (developer work)
2. **Launch blockers — owner action** (ministry must supply or confirm)
3. **Open, not launch-blocking**
4. **Resolved / superseded** (history)

Verification basis for this revision: source read of the working tree,
`tsc --noEmit` (pass), `eslint` (2 errors, 4 warnings — see G-39). The
production build and the Playwright suite were **not** re-run in this audit
(see G-38 for why the newsletter tests must not be run as they stand).

---

## 1. Launch blockers — code

| ID | Location | Nature | Risk | Recommended Resolution |
|---|---|---|---|---|
| G-03 | `src/app/actions/newsletter.ts`, `src/app/actions/contact.ts` | No rate limiting on public server actions. **Raised from MEDIUM**: the newsletter action now writes to a live MailerLite account, so each unthrottled request creates a real subscriber | HIGH | Per-IP throttle (the in-memory pattern used for admin login in `src/lib/admin-auth.ts` is sufficient for a single instance) |
| G-04 | Newsletter + contact forms | No CAPTCHA; honeypot (`nfm_hp`) is the only bot defence in front of a live provider | MEDIUM | Cloudflare Turnstile, or accept honeypot + G-03 rate limit and record the decision |
| G-24 | `src/app/actions/contact.ts` | Contact form does not deliver. `CONTACT_EMAIL_PROVIDER` is unset and no adapter exists — any non-empty value returns "Something went wrong". `RESEND_API_KEY` is present in `.env.local` but nothing reads it | HIGH | Implement the Resend adapter behind `CONTACT_EMAIL_PROVIDER=resend`; add fixture + contract test |
| G-31 | `src/app/api/checkout/route.ts` | Checkout endpoint is an unauthenticated **GET** that creates a Stripe Checkout Session for **any** `priceId` supplied in the query string. It is not checked against the book catalog, so any active price in the Stripe account can be purchased through this site, and crawlers/link prefetchers that follow the "Purchase" link create sessions. No rate limit | HIGH | Accept a book `slug`, look up the `priceId` server-side from the book store, reject anything not `published` + `stripe-checkout`; switch to POST (form/Server Action); rate-limit |
| G-32 | `src/app/api/checkout/route.ts` | Checkout Session is created with only `mode`, one line item, `success_url`, `cancel_url`. **No shipping address collection, no shipping rate, no tax setting.** ⚠️ UNVERIFIED how physical books are fulfilled — as written, a buyer pays and the ministry receives no delivery address | HIGH | Confirm fulfilment model with ministry; add `shipping_address_collection` (+ shipping options) if books are shipped |
| G-33 | `src/app/api/checkout/route.ts`, `/books` | No post-purchase handling. `success_url` is `/books?purchased=1` but nothing reads `purchased` — the buyer lands on the plain catalog with no confirmation. No Stripe webhook route exists (`STRIPE_WEBHOOK_SECRET` is set but unused), so the application is never told an order completed | MEDIUM | Add a confirmation state/page; decide whether Stripe's own receipt email + dashboard is the accepted order notification, or add a webhook |
| G-34 | `src/content/books.ts` vs `MEDIA_STORAGE_DIR/books.json` | Seed and runtime store have diverged. The committed seed still has 3 legacy Squarespace purchase URLs, an **empty** purchase URL for *From the Chaos to the Call*, and one Stripe price; the local runtime store has all five titles on Stripe Checkout. `storage/` is gitignored, so a fresh deployment starts from the stale seed. Seeding also copies build-hashed `/_next/static/media/…` cover paths into `books.json` on first admin save, which break on the next build | HIGH | Bring `books.ts` in line with the intended catalog (or ship `books.json` as provisioned data); seed covers from stable `/media-files/` or `/public` paths |
| G-35 | Hosting | Runtime state now includes `books.json`, `stripe-settings.json`, `videos.json`, `google-calendar.json`, and uploads. All require `MEDIA_STORAGE_DIR` on a persistent, writable, single-instance disk. ⚠️ UNVERIFIED — production host not selected/recorded | HIGH | Record the hosting decision; confirm persistent volume + backup of `MEDIA_STORAGE_DIR` |
| G-36 | `storage/books.json` (runtime data) | *From the Chaos to the Call* is on Stripe Checkout but has **no display price** (`priceCents` unset) and its button label is still "Purchase on Amazon" | MEDIUM | Fix in `/admin/books` |
| G-37 | `storage/videos.json` (runtime data) | The video currently flagged `featured` (shown on the homepage) is test content: "Iceland Scenic Relaxation Video in 4K - Family Luxury Travel" | HIGH | Unpublish/delete in `/admin/videos`; feature a ministry video |
| G-38 | `tests/` | Tests are stale against M4. `tests/e2e/newsletter.spec.ts` asserts the "not available" message and submits `test@example.com`; with `NEWSLETTER_PROVIDER=mailerlite` it will fail **and create a subscriber in the live MailerLite account**. No tests exist for checkout, admin auth, admin books, giving override, or the iCal parser. Counts in TEST-STRATEGY.md are from M3 and unverified since | HIGH | Run tests with provider env vars unset (or a stubbed provider); add contract tests (G-28) and checkout/admin coverage |
| G-40 | `src/app/events/page.tsx`, homepage `UpcomingEvents` | `/events` now renders **only** the Google Calendar. With no calendar it shows "schedule is being finalised" and renders **no `<h1>`** (the heading lives in the calendar branch; the header section's `aria-labelledby="events-heading"` then points at nothing). The homepage "Upcoming Events" section and `/events/[slug]` still read the empty static `events.ts`, so calendar events never appear on the homepage | MEDIUM | Always render the `<h1>`; feed the homepage section from the calendar or retire `events.ts` + `/events/[slug]` |

## 2. Launch blockers — owner action

| ID | Item | Risk | What is needed |
|---|---|---|---|
| G-25 | Privacy Policy is a placeholder | HIGH | Approved policy text. The interim copy says information is not shared with third parties — but emails are now sent to **MailerLite** and purchases/donations go through **Stripe**; the approved text must name these processors |
| G-26 | Terms of Use is a placeholder | HIGH | Approved terms, now including sale/refund/shipping terms for on-site book checkout |
| G-32 | Book fulfilment model | HIGH | Who ships books, to where, at what shipping cost (see code row above) |
| G-41 | Store / Printify | MEDIUM | Confirm `thereformcollective.printify.me` is the ministry's storefront; confirm hoodie sizes/colours and prices shown on `/store` match Printify (variants in `products.ts` are carried over from the 2026-10-10 Squarespace audit); confirm the T-shirt is intentionally retired |
| G-06 | Facebook link | LOW | Code now renders `facebook.com/natalie.flemons` with `verified: true`. No owner confirmation is recorded in docs — confirm this is the intended public page |
| G-17 | Workbook cover | LOW | Flat front cover; the current image is a 3-D mockup |
| G-42 | Stripe account mode | HIGH | ⚠️ UNVERIFIED whether the configured `STRIPE_SECRET_KEY` and the product/price IDs in `books.ts`/`books.json` are **live** or **test** mode. They must match in production |

## 3. Open, not launch-blocking

| ID | Location | Nature | Risk | Recommended Resolution |
|---|---|---|---|---|
| G-09 | Entire codebase | No analytics or error tracking | MEDIUM | Add before or shortly after launch |
| G-11 | Entire codebase | No OG image generation (`opengraph-image.tsx`) | LOW | Add |
| G-23 | `src/app/events/[slug]/page.tsx` | `__placeholder__` sentinel slug because `events.ts` is empty | LOW | Disappears if `/events/[slug]` is retired under G-40 |
| G-28 | `tests/contract/` | Empty. API-CONTRACTS.md required a captured fixture + contract test **before** a provider adapter went live; MailerLite and Stripe adapters shipped without either. Existing `fixtures/newsletter/*.json` predate the adapter and are not captured MailerLite responses | MEDIUM | Capture real responses; write contract tests for `subscribeToNewsletter` status mapping and Checkout Session creation |
| G-39 | Lint | `npm run lint` fails: 2 errors (`react-hooks/set-state-in-effect` in `about-tabs.tsx:25` and `nf-medallion.tsx:99`, both pre-M4) and 4 warnings (unused `readBooks` in `admin/actions.ts`, unused `path` in `book-store.ts`, unused `legacyStore` in `products.ts`, stale eslint-disable in `nf-medallion.tsx`) | LOW | Fix; lint should be clean before launch |
| G-43 | `/admin/book-sales` | Reads the static `src/content/books.ts` (direct import), not the admin book store — only titles with `stripeProductId` in the seed appear (currently 1 of 5). Orders come from the latest 100 Checkout Sessions with no pagination; revenue total assumes USD | MEDIUM | Read from `getAdminBooks()`; paginate |
| G-44 | `src/lib/stripe-settings.ts`, `saveStripePaymentLink` | The admin-saved donation link is read through `"use cache"` with no tag and the save action does not invalidate it, so the public "Give by Card" button can keep the old URL until the cache expires. Validation is only `startsWith("https://")` | MEDIUM | Add a cache tag + `updateTag` on save; restrict to `donate.stripe.com` / `buy.stripe.com` |
| G-45 | `/admin/integrations` | Status display is unreliable: MailerLite is hard-coded "connected"; Facebook/YouTube status keys (`NEXT_PUBLIC_FACEBOOK_URL`, `NEXT_PUBLIC_YOUTUBE_URL`) and `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are listed but read nowhere else in the app | LOW | Derive every status from the env var the feature actually uses |
| G-46 | `.env.example` | Does not list `STRIPE_SECRET_KEY` or `MAILERLITE_API_KEY`; still describes the newsletter provider as "pending decision" and Resend as "M2". `.env.local` also carries unused keys (`RESEND_API_KEY`, `PRINTIFY_STORE_URL`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_FACEBOOK_URL`, `NEXT_PUBLIC_YOUTUBE_URL`) | LOW | Sync `.env.example` with what the code reads |
| G-47 | Store presentation | Footer "Store" link goes straight to the external Printify storefront while header/secondary navigation and sitemap still use `/store`; `/store` metadata still says "Hoodies and T-Shirts"; the mug is labelled "Ministry Apparel"; disclaimer still refers to "our last audit" | LOW | Pick one destination; update copy |
| G-48 | `next.config.ts` | Uses undocumented `turbopackSourceMaps: false` under `@ts-expect-error` with a placeholder issue link (`issues/XXXXX`); `next` changed from pinned `16.4.3` to `^16.4.6` | LOW | Confirm the flag is still needed on the installed version; cite the real issue or remove |
| G-49 | Book covers | Covers render through a raw `<img>` (`book-cover-img.tsx`), not `next/image` — no AVIF/WebP, no blur placeholder (deviates from the Performance NFR) | LOW | Accept for admin-uploaded covers, or route through `next/image` |
| G-50 | Price display | `priceCents` shown on the site is entered by hand and is independent of the Stripe price actually charged; they can drift | LOW | Display the Stripe `unit_amount`, or validate on save in `/admin/books` |
| G-51 | Newsletter adapter | Subscribers are created with `{ email }` only — no MailerLite group, no source field. Double opt-in depends on the MailerLite account setting (⚠️ UNVERIFIED) | LOW | Decide group/opt-in policy |
| G-52 | Repo hygiene | Zero-byte files `Build`, `next`, `natalie-flemons-ministries@0.1.0` in the repo root (untracked; shell-redirect accidents); one-off `*.py` analysis scripts are tracked in the root | LOW | Delete the empty files; move or remove the scripts |

## 4. Resolved / superseded

| ID | Was | Status |
|---|---|---|
| G-01, G-01b | Public routes not built | ✅ RESOLVED M1 |
| G-02 | Newsletter provider not configured | ✅ RESOLVED M4 — MailerLite adapter in `src/lib/newsletter.ts` (`NEWSLETTER_PROVIDER=mailerlite` + `MAILERLITE_API_KEY`); `/admin/newsletter` lists and deletes subscribers. Follow-ups: G-03, G-28, G-51 |
| G-05 | *From the Chaos to the Call* absent | ✅ RESOLVED M1-B |
| G-05b | Amazon URL was a stub | ⏹ SUPERSEDED M4 — the title is sold through Stripe Checkout, not Amazon. Remaining data defects tracked as G-34 (seed has empty URL) and G-36 (label/price) |
| G-05c | No cover for *From the Chaos to the Call* | ✅ RESOLVED — `cover-from-the-chaos-to-the-call.jpg` added (commit `a204678`). The "⚠️ No cover image available" comment in `books.ts` is stale |
| G-07 | `PurchaseOption` checkout variant | ✅ RESOLVED M4 — implemented as `kind: "stripe-checkout"`. Follow-ups: G-31, G-32, G-33 |
| G-08 | Zero test files | ✅ RESOLVED M1-F (now stale — G-38) |
| G-10 | No sitemap/robots | ✅ RESOLVED M1-E |
| G-12, G-30 | No auth / public `/admin` | ✅ RESOLVED — shared-password admin session (Architecture Contract → Identity Model) |
| G-13 | Governance docs absent | ✅ RESOLVED M0 |
| G-14 | Squarespace purchase URLs break at cutover | 🔶 MOSTLY RESOLVED M4 — runtime catalog uses Stripe Checkout and merchandise uses Printify. Closes fully when the seed no longer contains Squarespace URLs (G-34) |
| G-15, G-16 | `/booking` 404; no legacy redirects | ✅ RESOLVED M1-A |
| G-18 | Bio copy fix | ✅ RESOLVED M2 |
| G-19 | 2027 events array empty | ⏹ SUPERSEDED — `/events` is driven by Google Calendar (public iCal feed via `GOOGLE_CALENDAR_ICAL_URL`, or OAuth). Residual static-events issues tracked as G-40 |
| G-20 | Reel not embeddable | ⏹ SUPERSEDED — videos are admin-managed (uploaded file, YouTube, or Facebook) |
| G-21 | No product images | ✅ RESOLVED M4 — Printify mockup images via `imageUrl` (remote pattern `images-api.printify.com`) |
| G-22 | T-shirt stock unverified | ⏹ SUPERSEDED — T-shirt removed from `products.ts`; replaced by "Pray Coffee Mug". Hoodie variants still unverified → G-41 |
| G-27, G-29 | Stale proposal doc; domain-model catalog | ✅ RESOLVED M3-H |

# REPORT INDEX

Authoritative map of all development phases, reports, and their status.
Updated at the end of every phase — never retroactively.

A phase is not closed until its row has a commit SHA and PO acceptance recorded.

---

## M0 — Governance Onboarding

| Phase | Report | Commit | Status | PO Accepted |
|---|---|---|---|---|
| Baseline snapshot | — | `2847d0aa` | PASS | — |
| Governance onboarding audit | `reports/PHASE-M0-GOVERNANCE.md` | pending | COMPLETE | PENDING |

---

## M1 — Remaining Routes

| Phase | Report | Commit | Status | PO Accepted |
|---|---|---|---|---|
| Architecture proposal | `reports/NATALIE-ARCHITECTURE-PROPOSAL.md` | pending | COMPLETE (archived — pre-implementation) | PENDING |
| Route build-out | _(no dedicated report — scope absorbed into M2/M3 reports)_ | pending | COMPLETE | PENDING |

Completed scope: `/about`, `/ministry`, `/books`, `/books/[slug]`, `/events`,
`/events/[slug]`, `/media`, `/store`, `/partnerships`, `/contact`, `/donate`
(redirect), `/privacy`, `/terms`, sitemap, robots, legacy redirects,
Playwright smoke + axe + navigation + newsletter + contact + honeypot regression tests.

Closes gaps: G-01, G-01b, G-05, G-08, G-10, G-15, G-16.

Open gaps carried forward: G-02, G-03, G-04, G-05b, G-05c, G-06, G-07, G-09,
G-11, G-12, G-14, G-17, G-19, G-20, G-21, G-22, G-23, G-24, G-25, G-26.

---

## M2 — Ministry Identity, Core Values & 2026 Biography Integration

| Phase | Report | Commit | Status | PO Accepted |
|---|---|---|---|---|
| Ministry identity + biography | `reports/PHASE-M2-MINISTRY-IDENTITY-IMPLEMENTATION.md` | pending | COMPLETE | PENDING |

Scope: EQUIP/RESTORE/ACTIVATE pillars, MinistryIdentity content model, 2026 biography
integration, CoreValues homepage section, Ministry page rewrite, About page rewrite,
ministry-identity regression tests.

Closes gaps: G-18.

Open gaps carried forward: G-02, G-03, G-04, G-05b, G-05c, G-06, G-07, G-09,
G-11, G-12, G-14, G-17, G-19, G-20, G-21, G-22, G-23, G-24, G-25, G-26.

---

## M3 — Visual Design Refinement, Responsive Implementation & Cinematic Animations

| Phase | Report | Commit | Status | PO Accepted |
|---|---|---|---|---|
| M3 Visual + M3-G Cinematic | `reports/PHASE-M3-VISUAL-DESIGN-CINEMATIC.md` | pending | COMPLETE | PENDING |
| M3 Corrective — Hero & Pillar Symbols | `reports/PHASE-M3-CORRECTIVE-MOTION-REPORT.md` | pending | COMPLETE | PENDING |

Scope: cinematic hero (single-shot portrait entrance replacing Ken Burns drift,
word-by-word headline), per-pillar CoreValues entrance animations, three SVG
pillar symbols (EQUIP open book, RESTORE botanical branch, ACTIVATE expanding
pathways), header/footer responsive refinements, new CSS tokens.

Note: The initial M3 delivery included a Ken Burns `drift` animation that was
subsequently rejected and removed in the corrective phase. The combined
`PHASE-M3-VISUAL-DESIGN-CINEMATIC.md` report reflects the initial delivery;
`PHASE-M3-CORRECTIVE-MOTION-REPORT.md` is the authoritative final state.

No gaps closed. No new gaps opened.

Open gaps carried forward: G-02, G-03, G-04, G-05b, G-05c, G-06, G-07, G-09,
G-11, G-12, G-14, G-17, G-19, G-20, G-21, G-22, G-23, G-24, G-25, G-26, G-27.

---

## M3-I — Approved Mockup Fidelity & Visual Acceptance

| Phase | Report | Commit | Implementation | Verification | PO Accepted | Closure |
|---|---|---|---|---|---|---|
| Visual fidelity acceptance | `reports/PHASE-M3-I-VISUAL-FIDELITY-ACCEPTANCE.md` | pending | COMPLETE | PASS | PENDING | OPEN |
| Visual fidelity corrections | `reports/PHASE-M3-I-1-VISUAL-FIDELITY-CORRECTIONS.md` | pending | COMPLETE | PASS | PENDING | OPEN |
| Homepage approved design reconstruction | `reports/HOMEPAGE-APPROVED-DESIGN-IMPLEMENTATION.md` | pending | COMPLETE | PASS | PENDING | OPEN |

Homepage reconstruction scope: Pixel-level analysis of `public/Approved Natalie
Flemons Ministry Website Mockup.png` (1024×1536 px, homepage only). Five layout
corrections applied to match the mockup's split-column section structure:
bio-preview portrait moved to right; ministry-message converted to espresso-left/
ivory-right split; featured-message converted to two-column poster-left/text-right;
featured-publications converted to a grid of book cards; booking-cta converted to
forest-left/ivory-right split. Build: 25 pages, 0 errors. Tests: 88/16/0.

M3-I scope: Visual acceptance audit against approved mockup. Screenshots at
320/390/1024/1440 px — zero overflow, zero JS errors. One accessibility defect
found and corrected (hero h1 accessible name). Test result: 88/16/0.

M3-I.1 scope: Six visual corrections against the approved mockup — hero
typography (column width + type scale), featured media (editorial poster
treatment), biography preview (3/4 portrait, pull-quote, dual corner frames),
featured books (wider covers, tighter grid), booking CTA (decorative background
word, gold rules, vertical divider), partnership section (wide horizontal layout,
botanical SVG divider). No new packages. No content changes. Test result: 88/16/0.

No gaps opened or closed.

Open gaps carried forward: G-02, G-03, G-04, G-05b, G-05c, G-06, G-07, G-09,
G-11, G-12, G-14, G-17, G-19, G-20, G-21, G-22, G-23, G-24, G-25, G-26, G-28.

---

## M4 — Integrations, Commerce and Admin

| Phase | Report | Commit | Status | PO Accepted |
|---|---|---|---|---|
| Admin auth, video/file management, Google Calendar (OAuth) | _(none)_ | committed (through `a204678`) | IMPLEMENTED — no report | PENDING |
| Stripe book checkout, admin book store, MailerLite newsletter + admin, donations + book-sales admin, iCal calendar fallback, Printify store links | _(none)_ | **uncommitted working tree** | IMPLEMENTED — NOT VERIFIED | PENDING |

Verification at M4-H: `tsc --noEmit` passes; `eslint` fails (2 errors, 4
warnings — G-39). Production build and Playwright suite not re-run; the
newsletter tests are stale and unsafe to run against a live provider (G-38).

No M4 phase report or recorded commerce/admin scope approval exists.

Gaps closed: G-02, G-07, G-12, G-21, G-30. Mostly closed: G-14.
Superseded: G-05b, G-19, G-20, G-22. Closed outside M4: G-05c (`a204678`).

Gaps opened: G-31 – G-52 (see KNOWN-GAPS.md).

Still open from the original M4 plan: G-04 (CAPTCHA),
G-09 (analytics), G-24 (contact email), G-28 (contract tests).

---

## Pre-Launch Gates

Authoritative list: `KNOWN-GAPS.md` §1 (code) and §2 (owner action).

As of M4-N (2026-11-20) — no item is rated critical:

Code: G-54, G-37, G-04,
G-24, G-38, G-63 (calendar test entry).
(G-03, G-57, G-62 resolved M4-O. G-53, G-35 resolved M4-P. G-33 resolved M4-Q.)
Owner: G-32 (shipping fee, fulfilment process), G-25, G-26, G-41, G-06, G-17.

---

## Architecture Contract Updates

| Event | Phase | Commit |
|---|---|---|
| Initial contract established | M0 | pending |
| Route inventory updated (all routes built) | M3 | pending |
| Hero headline corrected; MinistryIdentity added to Data Ownership | M3-H | pending |
| Identity Model (admin session, Google OAuth), admin media store | M4 | committed |
| System/Data ownership, persistence, API boundaries, pricing invariant, security, providers, failure rules, route inventory rewritten for Stripe Checkout, MailerLite, book store, iCal | M4-H | pending |
| Invariant: stored data is never discarded; book store has no seed | M4-N | pending |
| Checkout fulfilment settings; invariant that a delivery address is always collected | M4-L | pending |
| Checkout boundary rewritten (slug-based POST); pricing invariant marked met | M4-K | pending |
| Security headers; contact, iCal and Stripe boundaries; pricing check on save; optional analytics and error webhook; contract tests | M4-J | pending |
| Resend contact boundary; donation link moved to env var; book store unseeded/versioned; `storage/` tracked in git; calendar window; OG image routes; security notes (live Stripe key, upload origin check, G-57/G-59) | M4-I | pending |

---

## M3-H — Governance Synchronization

| Phase | Report | Commit | Status | PO Accepted |
|---|---|---|---|---|
| Governance synchronization | `reports/PHASE-M3-H-GOVERNANCE-SYNCHRONIZATION.md` | pending | COMPLETE | PENDING |

Scope: Read-only audit of repository and all governance documents. Reconciled
DOMAIN-MODEL.md, PRODUCT-REQUIREMENTS.md, REPORT-INDEX.md, KNOWN-GAPS.md,
TEST-STRATEGY.md, CURRENT-ARCHITECTURE-CONTRACT.md, and NATALIE-ARCHITECTURE-PROPOSAL.md
against verified working-tree state. No application source files modified.

Key findings: All M1–M3 work is uncommitted (single baseline commit `2847d0aa`).
Hero headline confirmed as "Shaping Destinies. Advancing the Kingdom."
Ministry identity (EQUIP/RESTORE/ACTIVATE) verified in code.
M3-Corrective motion state verified (drift removed, portrait-enter present).

Gaps closed: G-27 (architecture proposal archived), G-29 (domain model book catalog corrected).
New gaps documented: G-28 (empty contract test directory).
No new gaps opened by implementation.

---

## M4-H — Governance Synchronization (2026-11-17)

| Phase | Report | Commit | Status | PO Accepted |
|---|---|---|---|---|
| Governance synchronization | _(none — findings recorded directly in the governance documents)_ | pending | COMPLETE | PENDING |

Scope: read-only audit of HEAD `a204678` plus the uncommitted M4 working tree
against all governance documents. Updated KNOWN-GAPS.md,
CURRENT-ARCHITECTURE-CONTRACT.md, API-CONTRACTS.md, DOMAIN-MODEL.md,
PRODUCT-REQUIREMENTS.md, BUSINESS-CHARTER.md, TEST-STRATEGY.md, README.md and
this index. No application source files modified.

Key findings: the documents described a static site with no runtime providers;
the code now takes payments, writes to a live mailing list and persists admin
data to disk. Checkout is not launch-ready (G-31, G-32, G-33). The committed
book seed and the runtime book store have diverged (G-34). Tests are stale
(G-38).

---

## M4-I — Code Audit and Governance Synchronization (2026-11-20)

| Phase | Report | Commit | Status | PO Accepted |
|---|---|---|---|---|
| Code audit + governance synchronization | _(none — findings recorded directly in the governance documents)_ | pending | COMPLETE | PENDING |

Scope: read-only audit of HEAD `247c069` plus the uncommitted working tree
(env-based donation link, admin table filters/pagination, Open Graph images,
additional JSON-LD, sitemap change). Updated KNOWN-GAPS.md,
CURRENT-ARCHITECTURE-CONTRACT.md, API-CONTRACTS.md, DOMAIN-MODEL.md,
PRODUCT-REQUIREMENTS.md, TEST-STRATEGY.md, BUSINESS-CHARTER.md, README.md and
this index. No application source, configuration or data files modified.

Verification: `tsc --noEmit` pass; `npm run build` pass (45 static pages);
`npm run lint` fail (2 errors, 9 warnings — G-39). Playwright not run — the
local environment holds live Stripe, MailerLite and Resend credentials (G-38,
G-55). No calls were made to any provider during the audit.

State since M4-H: the M4 work listed above as an uncommitted working tree has
been committed (`f664bc7` … `247c069`).

Key findings:

- The Stripe key in use is live mode; the open checkout endpoint (G-31) is
  therefore critical rather than theoretical.
- The book store was reset: it is unseeded, a `SEED_VERSION` bump discards all
  stored books (G-34), and the current contents are two real titles (one with
  a misspelled permanent slug) plus a published test entry (G-54). Legacy book
  redirects 404.
- `storage/` (books, videos, cover files) is tracked in git and is also where
  the running app writes (G-53).
- Contact delivery through Resend is implemented but unverified (G-24).
- Privacy and Terms now carry real text; owner approval is not recorded
  (G-25, G-26).
- Existing tests are stale and two of them write to live providers (G-38).
- No secrets are committed; `.env.local` has never been in git history.

Gaps closed: G-11 (uncommitted), G-42 (answered: live mode).
Superseded: G-36 (→ G-54), G-44 (override removed).
Re-scoped: G-24, G-25, G-26, G-34, G-38, G-40, G-43, G-45, G-46, G-47, G-52.
Gaps opened: G-53 – G-61 (see KNOWN-GAPS.md).

---

## M4-J — Section 3 Remediation (2026-11-20)

| Phase | Report | Commit | Status | PO Accepted |
|---|---|---|---|---|
| Resolve KNOWN-GAPS §3 (open, not launch-blocking) | _(none — recorded in the governance documents)_ | pending (uncommitted) | COMPLETE | PENDING |

Scope: the nineteen §3 items as they stood after M4-I. Section 1 and 2 items
were not worked, except two defects found while verifying (below).

Verification: `tsc` pass; `npm run lint` clean; `npm run build` pass;
`npm run test:contract` 40/40; end-to-end suite run against a provider-blanked
server — remaining failures are stale tests and known gaps (G-38, G-54, G-62).
A production server was started locally with providers blanked to check
headers, pages, Open Graph images and the image optimizer. No live provider
was called. `storage/` and `.env.local` were not modified.

Gaps closed: G-39, G-43, G-45, G-46, G-47, G-48, G-49, G-50, G-52, G-56, G-58,
G-59, G-60, G-61.
Reduced, still open: G-55 (developer's local credentials), G-28 (captured
fixtures), G-09 and G-51 (owner decisions), G-23 (tied to G-40).
Gaps opened: G-62 (contrast on `/about`).
Also fixed: reduced-motion hydration error in `NfMedallion`; keyboard access
to the About tab panel.

---

## M4-K — Checkout Remediation, G-31 (2026-11-20)

| Phase | Report | Commit | Status | PO Accepted |
|---|---|---|---|---|
| Resolve the one CRITICAL launch blocker (G-31) | _(none — recorded in the governance documents)_ | pending (uncommitted) | COMPLETE | PENDING |

Scope: G-31 only. `/api/checkout` is now POST-only and takes a book slug; the
Stripe price is resolved on the server from the book store; only a published
Stripe Checkout book can be bought; 10 starts per client per 10 minutes.
Session creation moved to `createCheckoutSession()` in `src/lib/stripe.ts`.
Purchase buttons are form POSTs (`CheckoutButton`); failures return the buyer
to the book page with a not-charged message (`CheckoutNotice`); JSON-LD offer
URLs point at the book page.

Verification: `tsc` pass; lint clean; build pass; contract tests 43/43;
`tests/e2e/checkout.spec.ts` 12/12; manual requests against a provider-blanked
local server (valid slug → not-charged redirect, test book → 404, GET → 405,
rate limit engages on the 11th start). **Not verified:** a real session
against Stripe — the only key available locally is live mode, so none was
created.

Gaps closed: G-31. Narrowed: G-03 (checkout now limited), G-28 (checkout
contract test added). Other section 1 items (all HIGH/MEDIUM) not worked.

---

## M4-L — Checkout Shipping, G-32 (2026-11-20)

| Phase | Report | Commit | Status | PO Accepted |
|---|---|---|---|---|
| Collect a delivery address at book checkout (G-32, code) | _(none — recorded in the governance documents)_ | pending (uncommitted) | COMPLETE | PENDING |

Owner decisions recorded (2026-11-20): books ship to the **United States and
Canada**; **shipping fee not decided**; **sales tax off**, switchable later.

Scope: every book Checkout Session now requires a shipping address in the
configured countries; optional Stripe Shipping Rate and Stripe Tax by
environment variable; book pages state where books ship; `/admin/book-sales`
shows each order's delivery address.

Verification: `tsc` pass; lint clean; build pass; contract tests 46/46;
`tests/e2e/checkout.spec.ts` 12/12. **Not verified:** a real session against
Stripe (only a live-mode key is available locally).

Gaps closed: G-32 code item. Still open under G-32 (owner): shipping fee and
fulfilment process.

---

## M4-M — Events, G-40 (2026-11-20)

| Phase | Report | Commit | Status | PO Accepted |
|---|---|---|---|---|
| Resolve G-40 | _(none — recorded in the governance documents)_ | pending (uncommitted) | COMPLETE | PENDING |

Scope: `/events` heading always rendered; homepage "Upcoming Events" fed from
the Google Calendar; current month taken from the calendar's zone; inquiry
button label on `/events/[slug]`. The static `/events/[slug]` route was kept
(G-23) rather than deleted, because it contains uncommitted work.

Verification: `tsc` pass; lint clean; build pass; contract tests 51/51; with
the real public feed a local server showed one `<h1>` and the calendar on
`/events` and two upcoming events on the homepage; with the calendar blanked
the smoke and axe tests for `/events` pass.

Gaps closed: G-40. Opened: G-63 (test entry "test ev" in the Google Calendar,
now visible on the homepage).

---

## M4-N — Book Store, G-34 (2026-11-20)

| Phase | Report | Commit | Status | PO Accepted |
|---|---|---|---|---|
| Resolve G-34 | _(none — recorded in the governance documents)_ | pending (uncommitted) | COMPLETE | PENDING |

Decision recorded (2026-11-20): **empty first run** — the book store has no
seed.

Scope: `src/lib/book-store.ts` no longer resets the catalog on a version
change and no longer writes while reading; `SEED_VERSION` and the seed
functions removed; `parseBookManifest()` accepts every format the file has had.

Verification: `tsc` pass; lint clean; build pass; contract tests 61/61 (ten new,
run in a temp directory). `storage/books.json` is byte-identical before and
after (checksum compared).

Gaps closed: G-34. Not addressed: the earlier catalog loss (G-54), write
validation (G-57 resolved M4-O), `storage/` in git (G-53).

---

## M4-O — Gap Remediation G-03, G-57, G-62 (uncommitted)

| Phase | Report | Commit | Status | PO Accepted |
|---|---|---|---|---|
| Resolve G-03, G-57, G-62 | _(none — recorded in the governance documents)_ | pending (uncommitted) | COMPLETE | PENDING |

Scope: three code-only launch blockers.

- **G-03** — `src/app/actions/newsletter.ts` and `src/app/actions/contact.ts`:
  `createRateLimiter({ limit: 5, windowMs: 10 min })` + `clientIp()` added to
  both server actions before any outbound provider call. Identical pattern to
  `/api/checkout`.
- **G-57** — `src/lib/book-store.ts` `updateBooks()`: `manifestSchema.parse(manifest)`
  called before `writeFileAtomic`. Throws on invalid data; the file is never
  touched. Consistent with the "stored data is never discarded" invariant.
- **G-62** — `src/app/about/page.tsx` ember strip: `text-gold-light` (#d4b46a
  on `bg-ember` #a84a23 = 2.87:1, WCAG AA fail) changed to `text-ivory`
  (#faf6ef = 5.3:1, WCAG AA pass). Portrait `figcaption` `text-gold-light`
  unchanged (dark photo background, 7.9:1).

Verification: `tsc --noEmit` ✅; `npm run lint` ✅ clean. No live provider called.

Gaps closed: G-03, G-57, G-62.

---

## M4-P — Storage Model Decision G-53, G-35 (uncommitted)

| Phase | Report | Commit | Status | PO Accepted |
|---|---|---|---|---|
| Resolve G-53, G-35 | _(none — recorded in the governance documents)_ | pending (uncommitted) | COMPLETE | PENDING |

Decision recorded: **content committed to the repository; admin writes
disabled in production.**

Scope:
- `src/lib/admin-auth.ts`: `isReadOnly()` — returns `true` when
  `ADMIN_READONLY=true`.
- `src/app/admin/actions.ts`: all write actions (`saveBook`, `deleteBook`,
  `setBookPublished`, `saveVideo`, `deleteVideo`, `setVideoPublished`,
  `setVideoFeatured`, `moveVideo`, `deleteFile`, `selectCalendar`,
  `signOutGoogle`, `deleteSubscriber`) return an error when `isReadOnly()`.
- `src/app/api/admin/files/route.ts`: upload route returns 403 when
  `isReadOnly()`.
- `.gitignore`: stale comment updated to reflect committed-content model.
- `.env.example`: `ADMIN_READONLY` documented.

Consequences: `storage/books.json`, `storage/videos.json` and
`storage/files/*` remain tracked in git. Production deploys by pulling the
repo with `ADMIN_READONLY=true` set. No persistent writable volume is
required. Backup is git history. Google Calendar OAuth (`google-calendar.json`)
is not committed — use `GOOGLE_CALENDAR_ICAL_URL` in production.

Verification: `tsc --noEmit` ✅; `npm run lint` ✅ clean. No live provider called.

Gaps closed: G-53, G-35.

---

## M4-Q — Post-Purchase Confirmation G-33 (uncommitted)

| Phase | Report | Commit | Status | PO Accepted |
|---|---|---|---|---|
| Resolve G-33 | _(none — recorded in the governance documents)_ | pending (uncommitted) | COMPLETE | PENDING |

Decision recorded: **Stripe receipt email + Dashboard is the accepted order
notification. No webhook needed.**

Scope:
- `src/components/sections/checkout-notice.tsx`: added `purchased` key with
  a thank-you message telling the buyer to expect a Stripe receipt and that
  their order will be shipped to the address they provided.
- `src/app/books/page.tsx`: added `<Suspense><CheckoutNotice /></Suspense>`
  so the confirmation renders when Stripe redirects back to
  `/books?purchased=1`.

Verification: `tsc --noEmit` ✅; `npm run lint` ✅ clean. No live provider called.

Gaps closed: G-33.

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

Still open from the original M4 plan: G-03 (rate limiting), G-04 (CAPTCHA),
G-09 (analytics), G-24 (contact email), G-28 (contract tests).

---

## Pre-Launch Gates

Authoritative list: `KNOWN-GAPS.md` §1 (code) and §2 (owner action).

Code: G-03, G-04, G-24, G-31, G-32, G-33, G-34, G-35, G-36, G-37, G-38, G-40.
Owner: G-25, G-26, G-32 (fulfilment model), G-41, G-42, G-06, G-17.

---

## Architecture Contract Updates

| Event | Phase | Commit |
|---|---|---|
| Initial contract established | M0 | pending |
| Route inventory updated (all routes built) | M3 | pending |
| Hero headline corrected; MinistryIdentity added to Data Ownership | M3-H | pending |
| Identity Model (admin session, Google OAuth), admin media store | M4 | committed |
| System/Data ownership, persistence, API boundaries, pricing invariant, security, providers, failure rules, route inventory rewritten for Stripe Checkout, MailerLite, book store, iCal | M4-H | pending |

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

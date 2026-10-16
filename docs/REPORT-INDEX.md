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

## M4 — Integrations and Commerce

| Phase | Report | Commit | Status | PO Accepted |
|---|---|---|---|---|
| — | — | — | NOT STARTED | — |

Planned scope: newsletter provider adapter, rate limiting, Turnstile CAPTCHA,
commerce decision implementation (Option A/B/C), Squarespace URL replacement,
Resend contact email delivery, analytics/error tracking.

Closes gaps: G-02, G-03, G-04, G-07, G-09, G-14, G-24.

Requires: commerce decision approval, newsletter provider selection,
Stripe/Resend/Turnstile credentials, analytics provider selection.

---

## Pre-Launch Content Gates (owner-supplied, not a dev phase)

The following gaps block production launch and require ministry action, not code:

| Gap | Item |
|---|---|
| G-05b | Amazon URL for *From the Chaos to the Call* |
| G-05c | Flat cover image for *From the Chaos to the Call* |
| G-06 | Confirmed Facebook Page URL |
| G-17 | Flat cover image for the Workbook |
| G-19 | 2027 events schedule |
| G-21 | Per-color product photos for Store |
| G-22 | Current T-shirt stock verification |
| G-25 | Approved Privacy Policy text |
| G-26 | Approved Terms of Use text |

---

## Architecture Contract Updates

| Event | Phase | Commit |
|---|---|---|
| Initial contract established | M0 | pending |
| Route inventory updated (all routes built) | M3 | pending |
| Hero headline corrected; MinistryIdentity added to Data Ownership | M3-H | pending |

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

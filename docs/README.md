# Documentation

## Governance documents (read these first)

| File | Purpose |
|---|---|
| `CURRENT-ARCHITECTURE-CONTRACT.md` | **Authoritative.** Architecture invariants all agents must follow. |
| `BUSINESS-CHARTER.md` | Why the product exists, revenue model, workflows. |
| `DOMAIN-MODEL.md` | Entity relationships and ownership. |
| `PRODUCT-REQUIREMENTS.md` | User roles, features, functional and non-functional requirements. |
| `API-CONTRACTS.md` | All external provider integrations and their verification status. |
| `KNOWN-GAPS.md` | All unresolved ⚠️ and ❌ items. Resolve before launch. |
| `TEST-STRATEGY.md` | Test inventory, coverage gaps, recommended phases. |
| `DEPLOYMENT.md` | Coolify storage setup, volume seeding, book management workflow. |

## Phase tracking

| File | Purpose |
|---|---|
| `REPORT-INDEX.md` | Authoritative map of all phases, reports, commits, and PO acceptance. |

## Phase reports

`reports/` — one completion report per development phase.

| File | Phase |
|---|---|
| `reports/SITE-AUDIT.md` | Legacy Squarespace site audit (2026-10-10) |
| `reports/IMPLEMENTATION-PLAN.md` | Proposed implementation plan (pre-M0) |
| `reports/PHASE-M0-GOVERNANCE.md` | M0 governance onboarding audit |

See `REPORT-INDEX.md` for the full list. M4 (integrations, commerce, admin)
has no phase report; its state is recorded in the governance documents above
as of the M4-N book store change (2026-11-20, HEAD `247c069` plus the uncommitted
working tree). Start with `KNOWN-GAPS.md` §1 for what blocks launch.

## Authority hierarchy

When conflicts exist:

1. `CURRENT-ARCHITECTURE-CONTRACT.md`
2. Current production code
3. Current passing tests
4. Live-verified external provider behavior
5. ADRs (`decisions/`)
6. Historical reports (`reports/`, `archive/`)

Reports explain history. The Architecture Contract defines the present.

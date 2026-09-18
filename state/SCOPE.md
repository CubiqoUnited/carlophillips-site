---
id: SCOPE
owner: boss
class: controlled
version: 2.0
last_updated: 2026-09-17
review_frequency: on authorization change
---

Class CONTROLLED · Owner Boss · Writers Boss authorizes; roles propose · Read standing, every session · v3.5interim (2026-09-17)

## Objective
Migrate governance from v3.7–v3.9 to the reconciled V3.5interim compact hierarchy without losing verified project facts (Vercel project, Shopify stores, GitHub repo) or in-flight Gate 12/Phase 1 evidence.

## Included
- Compact hierarchy installation (governance/, state/, work/, audit/, decisions/).
- Categorized state/BLOCKERS.md ledger migration.
- ADR gate installation for future builds.
- Evidence-backed checklist rule (no bare PASS) across all four roles including Watchdog.

## Excluded
- Production changes, paid actions, real commerce operations proof (Phase 1 commerce closure remains unresolved — see Deferred).
- Automatic reconciliation of the known 58-vs-45 validator/matrix file-count discrepancy — that is a named open item, not silently resolved by this migration.

## Deferred
- Phase 1 real-commerce closure (checkout/order/Apliiq/tracking/support/returns) — unresolved, carried forward as-is.
- Permanent deletion of anything already in .quarantine/ — review dates unchanged by this migration.

## Stop condition
Migration is complete when: every file in AGENTS.md's "Where things live" section exists with a class/owner header, the categorized BLOCKERS.md is live, and one module has been run through the Boss→Pushpa→ADR→build loop under the new structure. A status update alone is never the stop condition.

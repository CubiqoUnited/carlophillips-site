---
id: BLOCKERS
owner: sushma
class: evolving
version: 1.1
last_updated: 2026-09-15
review_frequency: on block and unblock
budget_lines: 40
---

Class EVOLVING  ·  Owner Sushma  ·  Writers all five roles append-only  ·  Read standing — second file read  ·  Cadence on block and on unblock  ·  Budget ≤ 40 lines

- Only Boss-only / vendor / credential / access blockers — not routine work-in-progress.
- Each entry: exact action required, owner, resume trigger, resume point, what continues in parallel.
- Every role appends only its own collision-safe entry `YYYY-MM-DDTHHMMSSZ-<role>-<slug>`; existing entries are never rewritten by another role.
- Rechecked and resumed when the trigger clears — no need for Boss to repeat “continue.”

## Open blockers

- None recorded for Gate 12 as of 2026-09-15. Deferred Gate 11 review is scheduled state, not a blocker.

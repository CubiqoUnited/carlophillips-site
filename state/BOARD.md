Class EVOLVING · Owner Sushma · Writers Sushma only · Read standing · v3.5interim backend (2026-09-17)

# Board

Canonical per-item record. Sushma is the sole reconciler — do not hand-edit a row without a corresponding work/items/{id}.md and event trail. Board rows are a projection of work/items/*; if they disagree, work/items/* wins.

Required fields per item: Item ID, Module, Priority, Canonical workflow state, Assigned role, Blocker overlay, Latest evidence, Evidence timestamp, Promised checkpoint, Next permitted transition, Transition owner, Freshness condition.

A blocked item retains its real lifecycle state as a compound value, e.g. `IN_BUILD + BLOCKED_HUMAN` — never collapses to just `BLOCKED`.

| Item ID | Module | Priority | State | Assigned | Blocker overlay | Evidence | Evidence @ | Checkpoint | Next transition | Owner | Freshness |
|---|---|---|---|---|---|---|---|---|---|---|---|
| CP-GATE12 | Governance migration | P1 | IN_BUILD | Aarti/Sushma | none | PR #150 commit 402a324 | 2026-09-17T00:00:00Z | PR merge | READY_FOR_STAGING | Sushma | FRESH |

See state/STATUS-SCHEMA.md for the freshness condition values (FRESH / DUE / STALE) and governance/WORKFLOW_AND_STATES.md for the canonical state list and compound blocker-overlay notation.

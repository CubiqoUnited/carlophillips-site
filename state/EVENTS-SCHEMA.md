Class CONTROLLED · Owner Sushma · Writers Sushma proposes · Read all roles, validator · v3.5interim backend (2026-09-17)

# Event Schema

state/events.jsonl is the append-only audit input. One JSON object per line. An event records what happened; it does not become canonical truth until Sushma reconciles the affected state record (state/NOW.md, state/BOARD.md, or work/items/{id}.md).

## Required fields (every event)
| Field | Type | Meaning |
|---|---|---|
| id | string | Unique event ID, format EVT-{item}-{seq} |
| type | string | One of the required event classes below |
| actor | string | Role or automation name that produced this event |
| item_id | string | Affected work item |
| assignment_id | string \| null | Affected assignment, if applicable |
| prev_state | string \| null | Canonical state before this event |
| new_state | string \| null | Canonical state this event proposes |
| timestamp | string | ISO 8601 UTC |
| evidence | string | Artifact path, commit SHA, test run ID, deployment ID, or trace ID — never a bare claim |
| reason | string | Why this event happened |
| approval | string \| null | Approver, if this event required one |
| outcome | string | RECONCILED \| PENDING_RECONCILIATION \| REJECTED |

## Required event classes
ASSIGNMENT, EVIDENCE_ADDED, CHECKPOINT_RECEIVED, BLOCKED, UNBLOCKED, GATE_REQUESTED, APPROVED, REJECTED, CORRECTION_REQUESTED, HANDOFF, RECOVERY_REQUEUE, MERGE, STAGING_DEPLOYMENT, PRODUCTION_DEPLOYMENT, VALIDATION, CLOSURE

## Reconciliation rule
An event with outcome `PENDING_RECONCILIATION` means Sushma has not yet updated state/NOW.md, state/BOARD.md, or the work item to match it. scripts/check-agent-docs flags any event older than the staleness threshold still marked PENDING_RECONCILIATION as a validator FAIL.

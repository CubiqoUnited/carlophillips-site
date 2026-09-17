Class CONTROLLED · Owner Sushma · Writers Sushma proposes · Read all active roles · v3.5interim (2026-09-17)

# Status Schema — Assigned-Agent Signal and Watchdog Brief

## Assigned-agent three-line signal
Only the role currently assigned to an item owes Sushma a signal. Written after a completed work unit, a requested state transition, a blocker, a failure, a direction conflict, or a missed checkpoint. IN_PROGRESS alone is not a useful return.

```
ITEM: <item-id> | RESULT: READY_FOR_<STATE> / BLOCKED / FAILED / DIRECTION_CHECK
EVIDENCE: <artifact, commit, test, deployment, trace, or finding>
NEXT: <requested transition or exact action> | OWNER: <next owner> | RESUME: <trigger or immediate>
```

A bare PASS is prohibited. The signal does not change canonical state by itself — Sushma verifies the evidence, accepts or rejects the transition, updates NOW.md/BOARD.md, records any correction or blocker, and dispatches the next owner.

## Sushma → Watchdog brief (different contract, do not confuse with the above)
```
ACTIVE: <assigned roles, item IDs, states, latest evidence and freshness>
EXCEPTIONS: <blockers, drift, stale evidence, failures, recovery, or none>
NEXT_GATE: <expected transition, owner, natural checkpoint>
```
Only currently assigned roles appear in ACTIVE. An unassigned role is omitted or marked NOT_ASSIGNED — never treated as silent or stalled.

## Freshness threshold
Stale = a promised checkpoint or evidence deadline has passed with no observable long-running process, repository change, test output, deployment event, or artifact update.

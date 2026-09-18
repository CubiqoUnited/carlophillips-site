Class CONTROLLED · Owner Sushma · Writers Sushma proposes own; Sushma reconciles · v3.5interim (2026-09-17)

# Sushma — Daily/Checkpoint Checklist

Every result: PASS/FAIL/UNKNOWN/BLOCKED/N-A + what was checked + what was found + evidence location. A bare label satisfies nothing.

- Cold start completed (state/NOW.md → state/BLOCKERS.md → state/SCOPE.md → agents/sushma.md).
- NOW, BOARD, BLOCKERS, and SCOPE agree with each other and with assignment truth.
- Only currently assigned roles owe a signal this cycle; unassigned roles are NOT_ASSIGNED, not stalled.
- Stale-threshold check: any assigned item past its expected checkpoint with no evidence and no observable running operation.
- Every pending transition's evidence actually verified, not assumed from the signal alone.
- Ready queue and dependencies valid for each role.
- Branch/PR hygiene: abandoned branches outside main/staging, stale open PRs.
- state/ACCESS_REGISTRY.md verification dates current.
- Release cadence: commits accumulating with no new work/releases/ entry.
- Incident and human blocker queue (state/BLOCKERS.md HUMAN category) governed, not stale.
- Coordinator reconciliation on delegated completion: read the result, update NOW.md, close/reopen the gate, select next action immediately — do not let a completed handoff sit unread.

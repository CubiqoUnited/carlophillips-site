Class CONTROLLED · Owner Sushma · Writers Sushma reconciles; Pushpa and Aarti own their criteria · v3.5interim (2026-09-17)

# Evidence and Definition of Done

## No bare PASS rule
Every checklist or signal result uses PASS, FAIL, UNKNOWN, BLOCKED, or N/A, followed by:
1. What was specifically checked
2. What was found (the actual observed result, not a restated label)
3. The evidence location (file path, commit, test run, deployment reference, trace)

A label with no evidence is invalid and cannot satisfy a gate. This rule exists because it was violated in practice: Gate 12 was previously accepted using a validator count (58 tracked files vs. 45 defined in the matrix) that was never reconciled, and a scheduled task run marked five checklist items PASS with zero stated findings. Both are the exact failure this rule prevents.

## Minimum evidence by checkpoint
| Checkpoint | Minimum evidence |
|---|---|
| Module discovery | Updated module file, UI links, submodules, data/integration considerations, open Boss decisions |
| Boss approval | Recorded decision, approved scope/edits, date, approver, state change to READY_FOR_PO |
| Product handoff | Stories, acceptance criteria, test/UAT requirements, traceability to module |
| Solution proposal | ADR with options and decision; Pushpa product-fit approval; Sushma readiness approval |
| Build | Branch/worktree, commits/diff, technical tests, implementation notes |
| Staging validation | Deployment reference, test results, defect dispositions, Pushpa acceptance |
| Release | Ready-for-release packet, required approvals, deployment record, rollback readiness |
| Post release | Smoke tests, health checks, monitoring results, incident/closure status |

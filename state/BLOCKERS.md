Class EVOLVING · Owner Sushma · Writers all active roles append; Sushma reconciles · Read standing, second file read every session · v3.5interim (2026-09-17)

# Blockers (Categorized Ledger)

One append-safe ledger. A blocker pauses the affected action, not the whole project. Every record: item ID, category (HUMAN / INTERNAL_AGENT / EXTERNAL / RESOLVED), workflow state retained, owner, evidence, exact action required, resume trigger, parallel work, opened time, review time, resolution.

## HUMAN

### H-001 — 58 vs 45 file-count reconciliation
- Affected work: any Gate closure that cites scripts/check-agent-docs output as evidence
- Retained workflow state: BLOCKED (governance validation)
- Owner: Boss / Aarti
- Evidence: scripts/check-agent-docs reports 58 tracked items; the file authority matrix (v3.7 Appendix A) defines 45 named items + 3 patterns. Gap never reconciled.
- Exact action required: Aarti diffs the 58 vs 45+3, explains the 10-item gap, updates matrix or validator
- Resume trigger: reconciliation committed and reviewed
- Opened: 2026-09-15 (carried forward from prior audit)

### H-002 — Phase 1 real-commerce closure unresolved
- Affected work: any claim that Phase 1 is fully closed
- Retained workflow state: BLOCKED (product)
- Owner: Boss / Pushpa
- Evidence: state/NOW.md's own prior text: "Broader real-order, Apliiq handoff, tracking, support, cancellation, return, and refund operational proof was outside that closure and is not established."
- Exact action required: Boss decides whether to pursue real-commerce proof now or explicitly defer with a re-entry trigger
- Resume trigger: Boss decision recorded in state/PROPOSALS.md
- Opened: 2026-09-16 (carried forward)

## Internal Agent

None currently open.

## External

None currently open.

## Resolved

None yet under this ledger format. Prior BLOCKERS.md entries (pre-migration) are quarantined at .quarantine/2026-09-17/BLOCKERS-legacy.md for reference.

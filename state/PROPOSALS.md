---
id: PROPOSALS
owner: boss
class: evolving
version: 1.1
last_updated: 2026-09-15
review_frequency: as raised
---

Class EVOLVING  ·  Owner Boss reviews  ·  Writers all roles append their own entries  ·  Read standing for Boss; on-demand for roles  ·  Cadence as raised  ·  Budget —

- Every role may append its own entry; no role edits or deletes another role's entry or writes the governed target directly.
- Entry heading/ID: `YYYY-MM-DDTHHMMSSZ-<role>-<slug>` in UTC. Timestamp, role, and task slug make concurrent appends collision-safe.
- Each entry contains: author role, target file/section, current text, proposed text, reason, status `pending`, and any supporting immutable record path.
- Entries are append-only after creation. Boss records approval or decline without rewriting the proposal; only an approved entry becomes a PR.

## 2026-09-15T093616Z-sushma-file-authority-matrix-alignment

- Author role: Sushma
- Target files/sections: `state/BLOCKERS.md`; `scripts/check-agent-docs`; the Gate 12 changes to `AGENTS.md`, `agents/*.md`, `checklists/*.md`, and `state/SCOPE.md`
- Current text/state: the Gate 12 feature branch makes `BLOCKERS.md` Sushma-only; the validator does not enforce the complete File Authority Matrix; agent-authored changes are present in LOCKED and CONTROLLED paths without a matrix-form proposal and approval record.
- Proposed text/action: restore `BLOCKERS.md` to all-five-role append-only ownership; extend validation to enforce the complete matrix, append-only/runtime/versioning rules, and deployed-registry drift; do not merge agent-authored LOCKED changes; treat CONTROLLED changes as proposed until Boss approval; have Boss supply or apply any required LOCKED-file changes.
- Reason: align Gate 12 with the authoritative CARLOPHILLIPS File Authority Matrix v3.7 and prevent a false closure.
- Status: pending
- Supporting immutable record: current PR `#145`, commit `1a2c55457d23801e8a6b1ce556713b191867f4eb`; matrix supplied by Boss on 2026-09-15.

## 2026-09-15T100000Z-boss-file-authority-matrix-alignment-approval

- Proposal: `2026-09-15T093616Z-sushma-file-authority-matrix-alignment`
- Decision: approved
- Authority: Boss
- Approved scope: controlled checklist, SCOPE, and `scripts/check-agent-docs` changes required to align Gate 12 to the File Authority Matrix; no LOCKED-file changes.
- Recorded separately so the append-only proposal entry above remains unchanged.

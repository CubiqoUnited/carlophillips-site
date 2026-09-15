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

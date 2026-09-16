---
id: ORGANISATION-GRAVEYARD
owner: sushma
class: evolving
version: 1.2
last_updated: 2026-09-16
review_frequency: weekly all-hands
---

Class EVOLVING  ·  Owner Sushma  ·  Writers all five roles append  ·  v3.8 (2026-09-16)

GRAVEYARD.md — what was tried and did not work, with the evidence and the date. Without it, a dead end is rediscovered every few months by whoever forgot. This is the file that gives the “don’t reopen a closed finding without new evidence” rule something to point at.

- Distilled, never append-everything. A learning is written once, in its final form; the raw run that produced it stays in the dated rundown or session record. The moment this becomes a journal it stops being read, which is how STATUS.md died.
- Entry format: what happened, what it means, what changes because of it, date, source link. The third field is the one that matters — a learning with no consequence is a diary entry.
- Entries are immutable once written. Each role appends only its own distilled entry; no role edits or deletes another role's entry. Correction happens through a new superseding entry linked to the original.

## v3.8: Quarantine record cross-reference

Stale-file quarantine actions (AGENTS.md quarantine rule) are recorded in `.quarantine/{date}/MANIFEST.md` at point of action, not duplicated here. Only log a GRAVEYARD entry when a quarantined item's permanent deletion is confirmed after its review date — that entry is the durable "this was tried/existed and is now gone" record.

### 2026-09-16 — carlophillips-site legacy status files quarantined (not yet deleted)

- What happened: HUMAN_BLOCKERS.md, NEXT_ACTIONS.md (docs/status/), test_result.md (root) moved to `.quarantine/2026-09-16/` — verified stale by git last-commit date (17 days to 3 months), superseded by state/BLOCKERS.md and state/NOW.md.
- What it means: legacy pre-v3.7 status files are no longer authoritative; the clean control plane fully replaces them for these three.
- What changes: nothing deleted yet — deletion review scheduled 2026-09-23 per v3.8 quarantine rule.
- Source: `.quarantine/2026-09-16/MANIFEST.md`

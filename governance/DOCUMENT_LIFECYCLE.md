Class CONTROLLED · Owner Sushma · Writers Sushma; Boss approves retention exceptions · v3.5interim (2026-09-17)

# Document Lifecycle

- Keep one living file per module, story, ADR, policy, or release record. No V1/V2/final/final2 filename chains.
- Store version, status, owner, created date, updated date, supersedes/superseded-by links inside the file where useful. Git commits and diffs retain history.
- Quarantine stale, contradictory, unverified, or ownerless material under .quarantine/{YYYY-MM-DD}/ with a MANIFEST.md: reason, source, date, reviewer, restoration condition. Do not immediately delete.
- Retire a work artifact only after its active obligations are complete, evidence is linked, dependent files point to its successor, and Sushma confirms no live workflow references remain.
- Move completed modules, stories, releases, resolved blockers, and retired policies into .archive/. Preserve paths through links or an archive index.
- Delete only duplicates or valueless generated debris after review and Boss-approved retention rules. Git history is not a substitute for required backups or regulated retention.
- Permanent deletion from quarantine requires an explicit reviewed action after the deletion-review date — never automatic.

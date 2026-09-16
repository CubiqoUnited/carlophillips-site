---
id: RUNDOWN-SCHEMA
owner: sushma
class: controlled
version: 1.1
last_updated: 2026-09-16
review_frequency: on contract change
---

# Immutable rundown record  ·  v3.8 (2026-09-16)

Filename: `YYYY-MM-DDTHHMMSSZ-<role>-<slug>.md`. UTC timestamp plus role and task slug prevents collisions. Closed records are immutable.

Required frontmatter: `id`, `owner`, `class: evolving`, `version`, `last_updated`, `review_frequency`, `record_status: closed`, `task_id`, `handoff_to`, `severity`.

Required body: assigned READY item; evidence/result; material truth changed (`yes`/`no`); exact next action; blocker owner and resume trigger when blocked. If truth did not change, create no record. Hand the path to Sushma; only Sushma updates NOW.md.

v3.8 addition — required body field: `cross_role_assessment` (optional per rundown, populated when a role reviews another role's prior finding). Format: `reviewed_finding: <path>`, `agree_or_disagree: <agree|disagree>`, `note: <one line>`. Roles may comment on other roles' outputs but never edit another role's rundown file — this field lives only in the reviewing role's own record.

v3.8 addition — required body field: `p1_p2_grading` for any backlog item this rundown touches: `item: <id>`, `severity: <P1|P2>`, `graded_by: <role>`. Each role grades independently; Sushma reconciles disagreements in NOW.md, never by overwriting another role's grading field.

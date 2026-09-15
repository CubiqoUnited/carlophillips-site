---
id: RUNDOWN-SCHEMA
owner: sushma
class: controlled
version: 1.0
last_updated: 2026-09-15
review_frequency: on contract change
---

# Immutable rundown record

Filename: `YYYY-MM-DDTHHMMSSZ-<role>-<slug>.md`. UTC timestamp plus role and task slug prevents collisions. Closed records are immutable.

Required frontmatter: `id`, `owner`, `class: evolving`, `version`, `last_updated`, `review_frequency`, `record_status: closed`, `task_id`, `handoff_to`, `severity`.

Required body: assigned READY item; evidence/result; material truth changed (`yes`/`no`); exact next action; blocker owner and resume trigger when blocked. If truth did not change, create no record. Hand the path to Sushma; only Sushma updates NOW.md.

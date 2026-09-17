Class CONTROLLED · Owner Sushma · Writers Sushma maintains; Boss approves gates · Read as linked by task · v3.5interim (2026-09-17)

# Workflow and Canonical States

| State | Meaning |
|---|---|
| DISCOVERED | Sushma identified a potential module or artifact |
| IN_INVENTORY | Sushma is collecting UI, data, integration, and document evidence |
| READY_FOR_BOSS | Module and submodules are complete enough for Boss review |
| BOSS_CHANGES_REQUESTED | Boss edits or requests correction; Sushma updates |
| READY_FOR_PO | Boss approved module scope; Pushpa may begin |
| PRODUCT_DEFINITION | Pushpa is creating stories, acceptance criteria, tests, UAT needs |
| READY_FOR_SOLUTION | Product definition is complete enough for Aarti |
| SOLUTION_PROPOSED | Aarti submitted an ADR before coding |
| SOLUTION_CHANGES_REQUESTED | Pushpa or Sushma requires correction |
| READY_FOR_BUILD | Pushpa approved product fit and Sushma approved readiness |
| IN_BUILD | Aarti is implementing in an isolated branch/worktree |
| READY_FOR_STAGING | Technical tests and evidence meet staging entry criteria |
| IN_STAGING_VALIDATION | Pushpa validates against acceptance criteria; Aarti fixes defects |
| READY_FOR_RELEASE | Product acceptance and technical release evidence are complete |
| IN_PRODUCTION_RELEASE | Sushma controls production release execution |
| PRODUCTION_VALIDATION | Smoke tests and monitoring confirm the release |
| DONE | Definition of Done is met and records are ready for archive |

BLOCKED is an overlay condition, not a replacement state. The item retains its lifecycle state; state/BLOCKERS.md records category, owner, exact action, resume trigger, parallel work, and review time separately.

## Gate owners and pass conditions
| Gate | Owner | Pass condition |
|---|---|---|
| Module completeness | Sushma | UI, submodules, data, integration options, dependencies, questions, recommendation present |
| Module approval | Boss | Scope and material product direction explicitly approved |
| Product definition | Pushpa | Stories, measurable acceptance criteria, tests, edge cases, UAT traceable |
| Solution product fit | Pushpa | ADR implements intended behavior without product drift |
| Solution readiness | Sushma | Plan is buildable, sequenced, testable, observable, releasable |
| Technical completion | Aarti | Code and technical tests match approved ADR and contracts |
| Staging acceptance | Pushpa | Staging passes acceptance criteria and recorded UAT scope |
| Release readiness | Sushma | Evidence packet, approvals, deployment/rollback plans, monitoring complete |
| Production validation | Sushma | Smoke, product checks, health signals pass or incident response is active |

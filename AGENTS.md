# CARLOPHILLIPS PROJECT RULES

Universal rules in `/Users/edv/.codex/AGENTS.md` also apply.

## Mission

CARLOPHILLIPS is a personal ecommerce project.

Optimize primarily for:

**visible working functionality + safe repeatable deployment + rapid iteration**

Governance is a guardrail, not a deliverable.

## Instruction order

1. Global `AGENTS.md`
2. This CP file
3. Invoked role file
4. Boss's current instruction

## Core stack

- Next.js — customer experience
- Shopify — authoritative commerce system
- Apliiq — initial POD production/fulfillment
- Vercel — Staging and Production

Use native capability first:

`Shopify/Apliiq → existing CP capability → platform tooling → established third party → custom code`

Do not create duplicate commerce, fulfillment, tracking, or state authorities without a demonstrated requirement.

## Environments

- Local — development/testing
- `staging` → `staging.carlophillips.com`
- `main` → Production

Boss normally reviews product behavior on canonical Staging.

Staging is the primary integration/UAT surface.

## Primary delivery loop

Every tranche starts with ONE sentence describing what Boss/customer will newly be able to see or do.

Then:

`Pushpa defines visible outcome → Aarti chooses minimum sufficient implementation → build/test → Staging → Pushpa verifies → Sushma closes → next outcome`

Do not convert the whole phase definition into one sequential checklist.

## Three execution lanes

Every unresolved item must be classified as:

### FEATURE
Customer/business functionality.

### DEPLOYMENT / INCIDENT
Something preventing safe validation, Staging, Production, or current service health.

### HARDENING
Useful future reliability, architecture, governance, cleanup, or optimization that does not currently block the visible outcome.

Priority:

`Production P0/P1 → blocked current feature deployment → FEATURE → usability → operational improvement → HARDENING`

Feature work wins unless a real safety/deployment blocker prevents validation.

## Work-in-progress limit

Maintain at most:

- one primary FEATURE;
- one active DEPLOYMENT/INCIDENT lane;
- one parked HARDENING backlog.

Do not create multiple stacked governance or infrastructure programs.

## 30-minute stop-loss

If approximately 30 minutes of active work produces none of:

- new visible behavior;
- live configuration;
- successful deployment;
- cleared blocker;
- materially stronger operational proof;

Sushma must stop the current loop and reprioritize.

Repeated analysis of the same issue without new evidence is not progress.

## Material-change review

Do not restart broad acceptance merely because a SHA changed.

Documentation, status files, formatting, metadata, ordinary rebases, and other non-functional changes preserve prior acceptance unless they materially alter:

- behavior;
- requirements;
- architecture;
- security boundary;
- customer-data handling;
- commerce contract;
- deployment semantics.

Only the materially changed area needs re-review.

## Blockers

Record an external/human blocker once with:

- item;
- owner;
- exact required action;
- resume condition.

Do not repeatedly rewrite or re-audit the same blocker.

A blocked action does not block unrelated executable work.

Synthetic/test evidence must remain clearly distinguished from live proof.

## High-risk boundaries

Keep stronger controls for:

- Production;
- payment/order/refund financial actions;
- customer data;
- credentials/secrets;
- destructive operations;
- external spend;
- irreversible actions.

Everything else should use proportionate controls.

Role delegation and project authority do not bypass platform-enforced access controls, required system approvals, branch protections, legal human-action requirements, or higher-priority safety rules.

## Role ownership

When Boss explicitly invokes a CP role, apply its matching file under `agents/`: `sushma.md`, `aarti.md`, `pushpa.md`, `richa.md`, or `malti.md`. Calling Sushma alone does not invoke the other roles.

### Pushpa
Owns **what should visibly work**, customer journey, requirements, acceptance, UAT, and ordered feature priority.

### Aarti
Owns **how it works technically**, architecture, implementation, integrations, deployment engineering, and technical verification.

### Sushma
Owns **keeping delivery moving**, sequencing, coordination, blocker management, merge/release flow, and closure.

### Richa
Provides external evidence only when a current decision genuinely needs research.

### Malti
Owns positioning/marketing/growth when the underlying customer capability is actually ready.

## Commerce authority

Shopify remains authoritative for:

- product/variant state;
- cart/checkout;
- payment;
- order;
- refund;
- fulfillment/tracking state.

Apliiq owns its physical production/fulfillment responsibilities.

Next.js presents and orchestrates the CP customer experience.

## Phase 1 — Working commerce MVP

Phase 1 exists to establish the smallest reliable commerce lifecycle:

`storefront → product/variant → cart → Shopify checkout/order → basic post-purchase/support → Apliiq fulfillment/tracking → basic cancellation/return/refund path`

Minimum monitoring/recovery is required only where necessary to avoid silent loss, false success, duplicate financial action, credential exposure, or unsafe Production behavior.

Advanced hardening belongs in Phase 2 unless required for the working lifecycle.

A controlled real order may be required to prove the Shopify → Apliiq → tracking chain. External requirements do not prevent completing unrelated feature work.

## Phase 2 — Production operations

After the commerce MVP works:

`monitor → detect → fix → verify → improve`

This is where broader operational hardening, reconciliation, observability, performance, and reliability maturity belong.

## Phase 3 — Merch / growth

After the commerce foundation is stable:

`research → product hypothesis → merch → Shopify/Apliiq → storefront → launch → measure → iterate`

## Active execution state

V2 uses a small control plane:

- `docs/exec-plans/active/phase-1.md` — active outcome plan
- `state/NOW.md` — current verified position
- `state/BLOCKERS.md` — unresolved external gates

Reports and test artifacts are evidence, not planning systems.

Legacy `STATUS.md`, `TASKS.md`, `TEAM-BOARD.md`, `PROJECT-NOTES.md`, and the old Human Intervention file should be preserved for history during migration but must not remain competing live control planes.

## Execution-plan format

The active plan should contain only:

- GOAL
- CURRENT VISIBLE STATE
- CURRENT FEATURE
- NEXT 3 OUTCOMES
- BLOCKED
- DONE
- EXIT CRITERIA

Keep it short.

## Continuity watchdog

The watchdog is not a delivery agent.

Its job is only to determine whether the **single designated execution-capable Sushma Codex task** is progressing.

If idle while executable work exists, retrigger that execution-capable task.

Do not target an advisory ChatGPT chat as the primary execution engine.

The watchdog must not create a competing backlog or second execution stream.

## Evidence

Collect only evidence needed to establish:

- feature works;
- deployment is correct;
- material risk is controlled;
- live external capability is actually proven where required.

PRs, reports, approvals, documentation, and state files do not count as product progress by themselves.

## Final rule

**Pushpa chooses the next visible outcome. Aarti makes it work with the minimum sufficient reliable architecture. Sushma gets it safely onto Staging and keeps the conveyor belt moving.**

Anything not necessary for those outcomes is deferred unless it protects a real high-risk boundary.

# CP Fitness Cycle 9 Evidence Package

## 1. Objective completed and commit

Separated reusable ProductBrief v1 truth inputs from ProductCreationJob v2 execution metadata. Designer-led and trend/current-affairs-led work now explicitly records trigger/cadence, provenance, source freshness, brand constraints, reference-use limits, human review, and duplicate suppression. The cycle commit is reported by Git at handoff; the parent was `0b67fb6`.

## 2. Exact files changed

- Contract/implementation: `contracts/product-brief.schema.json`, `contracts/product-creation-job.schema.json`, `lib/orchestration/product-creation-job.js`.
- Sanitized simulations: each `runs/cp-hoodie-*-contract-sim-*` directory now contains a separately validated `brief.json` exactly embedded by its `job.json`.
- Tests: `tests/product-creation-job.test.js`, `tests/contracts.test.js`.
- Governance/status: `AGENTS.md`, `ARCHITECTURE.md`, `PRD.md`, `STATUS.md`, `TASKS.md`, `docs/status/CURRENT_STATUS.md`, `docs/status/NEXT_ACTIONS.md`.
- Evidence: `test_reports/cp-fitness-cycle-9/verification.json`, `test_reports/cp-fitness-cycle-9/cycle-9-report.md`.

## 3. Tests, commands, and machine-readable artifacts

- Focused ProductCreationJob/contract/PipelineRun verification: 3 files and 53 tests passed.
- Full `yarn verify`: zero-warning lint, 20 files/140 tests, zero production advisories across 193 packages, and successful Next.js 15.5.21 build with 13 routes.
- Both ProductBrief and ProductCreationJob artifacts validate; each job embeds its durable brief exactly, the factory reproduces each job, and normalized SHA-256 input fingerprints recompute exactly.
- UI code did not change, so no new browser run was required.

## 4. Exists / Partial / Proposed / Missing changes

- Exists: independent ProductBrief v1 and ProductCreationJob v2 contracts; explicit on-demand/scheduled trigger, cadence, schedule/timezone, source publication/observation/retrieval/evaluation times, publisher/evidence provenance, deterministic freshness classification, binding brand constraints, inspiration-only references, research gate, idempotency key/fingerprint, and duplicate suppression.
- Partial: the scheduled trend record uses a deliberately stale sanitized fixture. It proves policy, not current market research.
- Proposed: real trend/provider adapters only after read-only capability, source rights, cadence, cost, and Product Owner approval are established.
- Missing: authenticated live research capability, current Shopify/app audit, complete Hoodie product/media/commerce/operations evidence, and available hosting.

Fitness remains **44/50**, not production readiness. This cycle deepens an existing architecture category without adding live operational proof.

## 5. Failures and contradictory evidence

- The prior Cycle 7 contract did not explicitly encode cadence, source freshness, brand/reference-use rules, or job-level duplicate suppression. This corrective cycle closes that contradiction without rewriting the prior commit.
- The trend simulation is intentionally stale and non-authoritative. It cannot be cited as current demand, product truth, design approval, media truth, or publication authority.
- A one-off raw Node fingerprint probe emitted the repository's module-type warning; supported Vitest/Next.js execution is clean.
- Existing PostCSS/sharp range, Yarn `url.parse`, and Open Graph edge-runtime warnings remain.

## 6. Human/external blockers and exact resume points

- External research: Product Owner approves the exact source/tool, access method, cadence, rights/data-use boundary, and any cost. Resume by invoking only that adapter in candidate-only mode, recording attribution/freshness, and leaving truth/publish gates pending.
- Shopify: complete Google/OTP authentication, then resume at read-only installed-app inventory without sharing the code or changing state.
- Vercel 402: authorized owner restores access; resume at Preview-only verification without production promotion.
- Credits, samples, Shopify/provider writes, orders, publish, merge, rollback execution, and production remain separately approval-gated.

## 7. Product Owner decisions required

No product-sequence decision is required. Hoodie-first remains authoritative. The Product Owner must approve real research sources/cadence and every credential, cost, external execution, write, publication, deployment, order, or production boundary.

## 8. Rollback and next bounded cycle

Rollback by reverting the Cycle 9 commit; no external job or schedule was created. Next local cycle: bind Commerce Gateway visibility to Product Release Record state so a Shopify observation alone cannot make an unapproved product visible or commerce-capable in production, while Local fixtures and private Preview review retain explicit fail-closed behavior.

# CP Fitness Cycle 8 Evidence Package

## 1. Objective completed and commit

Made Product Release Record state changes and rich-media approval fail closed. Draft, Staged, Approved, Released, rework, and withdrawal decisions are sequential, non-mutating evaluations with exact blockers and resume points. The Hoodie remains Draft. The cycle commit is reported by Git at handoff; the parent was `1426902`.

## 2. Exact files changed

- Contracts: `contracts/media-asset.schema.json`, `contracts/media-manifest.schema.json`, `contracts/product-release.schema.json`, `contracts/release-transition-decision.schema.json`.
- Policy: `lib/commerce/media-release-policy.js`, `lib/releases/product-release-transition.js`.
- Hoodie release evidence: `releases/cp-signature-hoodie-2026-001/release.json`, `media-manifest.json`, `rollback-plan.md`, `staging-readiness.json`.
- Tests: `tests/fixtures/release-fixtures.js`, `tests/media-release-policy.test.js`, `tests/product-release-transition.test.js`, `tests/contracts.test.js`.
- Governance/status: `AGENTS.md`, `ARCHITECTURE.md`, `PRD.md`, `README.md`, `STATUS.md`, `TASKS.md`, `docs/status/CURRENT_STATUS.md`, `docs/status/HUMAN_BLOCKERS.md`, `docs/status/NEXT_ACTIONS.md`.
- Cycle evidence: `test_reports/cp-fitness-cycle-8/verification.json`, `test_reports/cp-fitness-cycle-8/cycle-8-report.md`.

## 3. Tests, commands, and machine-readable artifacts

- Focused release/media/contract verification: 3 files and 52 tests passed.
- Full `yarn verify`: zero-warning lint, 20 files/136 tests, zero production advisories across 193 packages, and successful Next.js 15.5.21 build with 13 routes.
- Machine artifacts: `release-transition-decision.schema.json`, the Hoodie `staging-readiness.json`, and this cycle's `verification.json`.
- UI code did not change, so no new browser run was required; Cycle 6 remains the current browser regression evidence.

## 4. Exists / Partial / Proposed / Missing changes

- Exists: sequential transition contract/policy; staged, approved, released, rework, and withdrawal gates; exact blocker/resume records; nine-modality media matrix; asset provenance/rights/exact-product/quality/approval/type/fallback enforcement; Hoodie withdrawal plan.
- Partial: the rollback plan exists but is intentionally unverified. The Hoodie record lacks live Shopify/provider fingerprints and immutable candidate/staging evidence.
- Proposed: execute only a separately authorized publication or rollback action, then bind its observation.
- Missing: live Storefront/app audit, current Hoodie variant/provider truth, complete approved Hoodie media, private staging, active cart/checkout, fulfillment/operations proof, and available hosting.

Evidence-weighted fitness is **44/50**, not production readiness: governance 5, package reproducibility 5, quality/security 5, Git 4, environment separation 5, secrets 5, architecture implementation 5, Hoodie sequence truth 5, local browser evidence 4, and live operations 1.

## 5. Failures and contradictory evidence

- Initial transition-decision schema compilation warned that conditional `minItems`/`maxItems` lacked explicit array types. The schema was corrected; final compilation is clean.
- After binding the newly created rollback plan, one focused test still expected `ROLLBACK_PLAN_MISSING`. It correctly failed; the stale expectation was removed and the durable readiness artifact now proves the blocker is resolved.
- The current Hoodie cannot enter Staged: Shopify/Apliiq fingerprints, immutable commit/build evidence, and private staging evidence remain missing.
- The passing audit/build retains the documented PostCSS/sharp range, Yarn `url.parse`, and Open Graph edge-runtime warnings.

## 6. Human/external blockers and exact resume points

- Shopify authentication: choose Continue with Google in the Shopify login tab, select the existing account, and enter the one-time code if prompted. Resume at read-only installed-app inventory without sharing the code or changing state.
- Shopify variant fingerprint: observe and hash the exact candidate variants read-only, then update the Draft record and re-evaluate staging.
- Apliiq mapping: observe every Hoodie provider variant without ordering, bind sanitized fingerprints, then re-evaluate staging.
- Candidate/staging: select an immutable commit, bind its passing verification, restore Vercel access, and bind Preview desktop/mobile evidence without production promotion.
- External tools, credits, samples, Shopify writes, publish, orders, fulfillment, merge, rollback execution, and production remain separate Product Owner gates.

## 7. Product Owner decisions required

No product-sequence decision is required. Hoodie-first remains authoritative. Human action or approval is required only at authentication, credential, external tool/cost, Shopify/provider write, publication, rollback execution, deployment, merge, order, and production boundaries.

## 8. Rollback and next bounded cycle

Rollback this code cycle by reverting its commit; the plan itself was not executed and no external state changed. Next corrective cycle: add explicit ProductCreationJob trigger/cadence, source freshness, brand constraints, reference-use rules, and duplicate suppression, then prove scheduled/on-demand inputs remain candidate-only and cannot imply product/media truth or publication.

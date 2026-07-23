# CP Fitness Cycle 3 Evidence

## 1. Objective completed and revision

Implemented a fail-closed Commerce Cart boundary and the minimal durable four-lane orchestration/media-truth core. Reconciled current governance with the authoritative recovered Product Owner intent and verified final architecture handoff `CP-ARCH-2026-07-22-01` at SHA-256 `101fb502a553e44fb6ecfbe8060474b2f0b30f439a698d7cc1773842bea1406b`.

Branch: `codex/cp-fitness-baseline`

Base: `95bece0`
Cycle commit: returned by Git in the final handoff; no push or PR created.

No Shopify/POD write, order, sample, provider contact, purchase, credit use, Vercel mutation, deployment, merge, or production action occurred.

## 2. Exact changed-file groups

- Governance: `AGENTS.md`, `PRD.md`, `ARCHITECTURE.md`, `README.md`, `STATUS.md`, `TASKS.md`, and `docs/status/*`.
- Capability audit: `docs/shopify-capability-access-audit.md`, `config/capability-registry.json`.
- Commerce cart: `contracts/commerce-cart.schema.json`, `lib/commerce/cart-policy.js`, `lib/store/cart.js`, `.env.example`.
- Orchestration: `contracts/pipeline-run.schema.json`, `lib/orchestration/pipeline-run.js`, `runs/cp-hoodie-local-sim-001/run.json`.
- Media truth: `contracts/media-manifest.schema.json`, `lib/commerce/media-release-policy.js`, and the Hoodie `media-manifest.json`.
- Tests: `tests/cart-policy.test.js`, `cart-store-policy.test.js`, `pipeline-run.test.js`, `media-release-policy.test.js`, and `contracts.test.js`.
- Evidence: this report, `verification.json`, and four browser screenshots in this directory.

## 3. Tests, commands, and machine-readable artifacts

- `yarn lint`: passed with zero warnings.
- `yarn test`: 13 files / 67 tests passed.
- `yarn build`: passed; 12 routes generated; product route first-load JS 94 kB.
- Desktop/mobile browser: bag and Hoodie passed with no console errors, overlays, or overflow. Bag exposed no checkout link. Hoodie was visibly local-fixture/non-Shopify and non-buyable.
- Contract/run artifacts: `contracts/*.schema.json`, `config/capability-registry.json`, `runs/cp-hoodie-local-sim-001/run.json`, and `verification.json`.

## 4. Exists / Partial / Proposed / Missing and fitness score

| Category | Status | Score | Evidence / remaining gap |
|---|---|---:|---|
| Governance/tooling | Exists locally | 8/10 | Current intent, Yarn, lint/test/build, branch and rollback rules agree; no PR review yet |
| Truth contracts | Exists locally | 8/10 | Product, cart, release, media, and PipelineRun schemas validate; fulfillment mapping is still embedded rather than a live adapter |
| Product/POD truth | Partial | 3/10 | Apliiq owns Hoodie POC in architecture; exact live variant/cost/feasibility mapping remains unobserved |
| Media truth | Partial | 3/10 | Required modality matrix and quarantine policy exist; only one pending front candidate, no approved complete set |
| Commerce/frontend | Partial | 4/10 | Server product boundary and fail-closed cart policy exist; active bag and live Shopify cart remain unwired/unproven |
| Agentic orchestration | Partial | 5/10 | Durable four-lane run, idempotency, blocker isolation, resume and hard gates exist; adapters are not live-connected |
| Fulfillment/customer ops | Missing | 0/10 | No authorized order, tracking, support, return, or review proof |
| Hosting/production/reuse | Missing/blocked | 1/10 | Vercel returns 402; no production or second-product reuse evidence |

Indicative overall fitness: **4/10 (Partial, local foundation only)**. Passing build/tests do not make the product production-ready.

## 5. Failures and contradictory evidence

- A new stored-fixture test exposed a broad localStorage parser catch swallowing the policy denial; the catch was narrowed and the test now passes.
- The first PipelineRun model globally blocked on one human-required item. Independent review corrected it: `in_progress_with_blockers` now preserves safe work; global `blocked` means no safe actionable work remains.
- AJV initially could not resolve the Media Asset schema from the Media Manifest; the validator now registers the canonical asset schema before compilation.
- The old Hoodie-versus-12-product choice contradicted recovered intent and was removed. The sequence is Hoodie complete proof, different-product reuse proof, then catalog scale.
- Installed Shopify apps remain candidate workers, not proven access or owners. No live authenticated audit was authorized or performed.

## 6. Human/external blockers and exact resume points

- Shopify read: authorized owner configures least-privilege read-only Storefront values in an ignored local/Preview environment. Resume at `COMMERCE_DATA_MODE=shopify`, observe the Hoodie product/variants/media, fingerprint sanitized truth, keep purchasing disabled.
- Apliiq read: authorize read-only API or authenticated-browser observation. Resume `pod-map` in `cp-hoodie-local-sim-001`, observe/fingerprint the provider-to-Shopify mapping, stop before order/sample/charge.
- Media: approve the exact source/tool/access and any credit boundary. Resume `media-plan` by placing candidates in quarantine, recording provenance/rights/QA, and requesting approval. An infeasibility claim also requires explicit Product Owner approval.
- App capability audit: authorize the selected least-privilege API/Admin/Flow/app-credential/browser path. Resume the matching P0 audit row and record scopes/access/cost/Draft safety without secrets.
- Vercel: authorized owner restores project access. Resume at Preview-only deployment and browser/network verification; do not promote production.

## 7. Product Owner decisions required

- Final Hoodie product facts, price, media/disclosure, fulfillment mapping, and release approval.
- Any paid plan, credit use, sample/order, provider choice, generated/derived customer-facing media, Shopify write, app/Flow activation, checkout test, merge, deployment, publish, or production action.
- Shipping, returns, support, reviews, analytics/marketing, privacy, and launch policy before operational proof.

The Hoodie-first sequence is already resolved and is not a pending decision.

## 8. Rollback and next bounded cycle

Rollback is a Git revert of the Cycle 3 commit. This restores Cycle 2 at `95bece0`; no external state requires rollback.

Next safe cycle: make the capability registry executable for adapter discovery; add a reusable unavailable/local-preview bag state before any active cart wiring; and, only with authorized read access, bind current Shopify/Apliiq observations to the Hoodie release/run records. Continue local contract, media-job, and orchestration simulation work around inaccessible external lanes.

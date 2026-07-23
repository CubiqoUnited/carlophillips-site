# Delivery Tasks

## In progress: fitness baseline

- [x] Create `codex/cp-fitness-baseline` from the Hoodie staging-preview commit.
- [x] Establish truthful root governance, product, architecture, status, and task records.
- [x] Declare Yarn-only setup and add a tracked, secret-free `.env.example`.
- [x] Add ESLint and Vitest quality gates.
- [x] Add release-gate and Shopify normalization tests.
- [x] Repair Shopify search typing and bounded rate-limit retry behavior.
- [x] Regenerate `yarn.lock` and prove frozen clean install.
- [x] Run lint, tests, and production build.
- [x] Run local desktop/mobile browser verification and save evidence.
- [x] Review the final diff for architecture/documentation contradictions.

## Completed: server-backed product boundary

- [x] Add a machine-readable Product Release Record schema and validated Draft Hoodie record based only on existing evidence.
- [x] Introduce a server-only Shopify product adapter with explicit configured/unavailable/error states.
- [x] Add contract tests that prohibit mock fallback in release/checkout-capable flows.
- [x] Replace the product wrapper with a reusable, server-rendered, non-buyable PDP.
- [x] Verify local fixture and Shopify-failure states in desktop/mobile browsers.

## In progress: fail-closed cart and intent reconciliation

- [x] Add provider-neutral cart contracts and remove non-local local-cart fallback.
- [x] Add exact HTTPS checkout-host allow-listing and denial tests without creating an order.
- [x] Cover deterministic cart transitions and expired Shopify-cart replacement without printing identifiers.
- [x] Reconcile PRD, architecture, status, and tasks with the recovered original Product Owner intent.
- [x] Preserve the current installed-app snapshot as a capability/access audit backlog without claiming control.
- [x] Add a four-lane PipelineRun schema/state machine with idempotency, blocker isolation, exact resume points, and hard restricted-action gates.
- [x] Save a durable Hoodie local simulation that continues safe work around human blockers.
- [x] Add a machine-validated rich-media requirement matrix and approved-infeasibility release policy; keep the incomplete Hoodie blocked.
- [x] Run production build and desktop/mobile browser verification; save Cycle 3 evidence.
- [x] Keep all purchase, Shopify write, and production actions blocked.

## Completed: executable capability and bag policy

- [x] Validate capability registry evidence, callable surface, exact operations, restrictions, and blockers.
- [x] Replace the visible bag/cart wrappers with dedicated local-preview and unavailable Server Component states.
- [x] Prove Preview/production fixture denial and keep checkout unavailable without verified Shopify cart access.
- [x] Verify local desktop/mobile and Preview desktop browser states with no console errors or checkout links.

## Next bounded cycle: authenticated read-only Shopify audit

- [x] Attempt the existing Google/Shopify browser path before declaring a blocker; preserve the Shopify email-OTP verification tab.
- [ ] Classify P0 Storefront/cart, Apliiq, Modelize, Spin Studio/ZS-Spin-View, MyDesigns, Flow, and CS Trending Products Finder by actual callable surface.
- [x] Capture a sanitized live authentication-gate record without revealing the account address/code, accepting charges, or changing Shopify state.
- [x] Update the capability registry and exact PipelineRun blockers/resume points to the observed email-OTP boundary.
- [ ] If safely observable, capture current Hoodie Shopify product/variant/media facts and fingerprint without writes.

## Completed: supported framework migration

- [x] Migrate from end-of-life Next.js `14.2.3` to supported `15.5.21` Maintenance LTS with React/React DOM `19.2.8`.
- [x] Convert dynamic route params to the Next.js 15 async API.
- [x] Prove a clean frozen Yarn install, zero-warning lint, tests, build, and desktop/mobile browser regression.

## Next unblocked local cycle

- [x] Replace permissive framing and wildcard CORS with tested fail-closed page/API response policy.
- [x] Prove same-origin local use, exact allow-list behavior, denied-origin behavior, and desktop/mobile storefront regression.
- [x] Run a production-dependency audit, remove unused vulnerable direct dependencies, and resolve the current advisory set to zero.
- [x] Make the supported-version/dependency audit policy machine-checkable in the normal quality gate.
- [ ] Retire temporary transitive overrides when Next declares patched ranges.
- [x] Define reusable designer-led and trend-led ProductCreationJob contracts; keep external runs, paid sources, Shopify writes, and publication approval-gated.
- [x] Save paired local simulations proving both modes converge on the same release/media/commerce/PipelineRun truth core while safe work continues around a human gate.

## Next unblocked truth-contract cycle

- [x] Strengthen Product Release Record transitions so `approved`/`released` cannot coexist with pending product/media/fulfillment approvals, missing fulfillment fingerprints, missing candidate evidence, or an incomplete media matrix.
- [x] Add explicit Draft/Staged/Approved/Released/Withdrawn transition tests and rollback prerequisites without mutating Shopify or deploying.
- [x] Bind a release-specific withdrawal plan to the Hoodie Draft while keeping rollback verification null and staging denied.

## Next corrective creation-contract cycle

- [ ] Add explicit ProductCreationJob trigger/cadence, freshness, brand constraints, reference-use rules, and job idempotency/duplicate-suppression fields.
- [ ] Prove scheduled and on-demand sanitized jobs cannot imply publication or product/media truth, and keep external research inaccessible without blocking safe work.

## Blocked / approval required

- [ ] Restore Vercel deployment access, then resume at preview deployment verification.
- [ ] Approve any Shopify write, product activation, test order, `main` merge, or production promotion separately.

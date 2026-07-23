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

## Next bounded cycle

- [ ] With authorized read-only values, capture a current Shopify product/variant/media observation and fingerprint.
- [ ] Classify the selected P0 Shopify/Apliiq capabilities by API, Admin/Flow, app credential, approved browser, human-only, or unavailable path.
- [ ] Replace the visible bag shell with an explicit unavailable/local-preview state before wiring a Shopify-only active cart.
- [ ] Define reusable designer-led and trend-led job/brief contracts; keep external runs and paid sources approval-gated.

## Blocked / approval required

- [ ] Restore Vercel deployment access, then resume at preview deployment verification.
- [ ] Authorize specific least-privilege access paths for selected Shopify/app capability audits; installed status alone is insufficient.
- [ ] Approve any Shopify write, product activation, test order, `main` merge, or production promotion separately.

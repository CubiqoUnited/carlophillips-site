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

- [ ] Use the already authenticated Shopify browser session; do not assume access is blocked before attempting it.
- [ ] Classify P0 Storefront/cart, Apliiq, Modelize, Spin Studio/ZS-Spin-View, MyDesigns, Flow, and CS Trending Products Finder by actual callable surface.
- [ ] Capture sanitized names/settings/permission or billing evidence without revealing secrets, accepting charges, or changing state.
- [ ] Update the capability registry and exact PipelineRun blockers/resume points from observed evidence.
- [ ] If safely observable, capture current Hoodie Shopify product/variant/media facts and fingerprint without writes.

## Subsequent local security cycle

- [ ] Migrate from end-of-life Next.js `14.2.3` to a supported security line and run full regression evidence before any deployment.
- [ ] Define reusable designer-led and trend-led job/brief contracts; keep external runs and paid sources approval-gated.

## Blocked / approval required

- [ ] Restore Vercel deployment access, then resume at preview deployment verification.
- [ ] Approve any Shopify write, product activation, test order, `main` merge, or production promotion separately.

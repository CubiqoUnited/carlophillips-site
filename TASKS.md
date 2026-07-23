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

## Next bounded cycle

- [ ] With authorized read-only values, capture a current Shopify product/variant/media observation and fingerprint.
- [ ] Add provider-neutral cart contracts and remove non-local local-cart fallback.
- [ ] Add checkout-host allow-listing and release denial tests without creating an order.
- [ ] Keep all purchase, Shopify write, and production actions blocked.

## Blocked / approval required

- [ ] Restore Vercel deployment access, then resume at preview deployment verification.
- [ ] Choose Signature Hoodie POC versus broader 12-product catalog.
- [ ] Approve any Shopify write, product activation, test order, `main` merge, or production promotion separately.

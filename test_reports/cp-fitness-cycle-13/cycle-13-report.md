# CP Fitness Cycle 13 Evidence Package

## 1. Objective completed and commit

Inventoried and removed dormant browser/public API commerce paths that could
bypass the active server Commerce Gateway. Added a server-owned customer-cart
activation contract without issuing a Shopify read, write, cart mutation,
checkout, payment, or order. The local cycle commit is reported by Git at
handoff; the parent was `ae11f40`.

## 2. Exact files changed

- Removed bypass paths: `lib/data/products.js`, `lib/store/cart.js`,
  `lib/shopify/client.js`, `lib/shopify/index.js`,
  `lib/shopify/mutations.js`, and `lib/config/shopify.js`.
- Active boundary: `lib/commerce/cart-activation-policy.js`,
  `lib/commerce/cart-activation-server.js`, `lib/commerce/bag-decision.js`,
  `app/products/[handle]/page.js`, `app/bag/page.js`,
  `components/commerce/product-detail.jsx`, and
  `app/api/[[...path]]/route.js`.
- Read-only Shopify path: `lib/shopify/normalize.js`,
  `lib/providers/shopify/product-loader.js`, and
  `lib/providers/shopify/storefront-product-adapter.js`.
- Contract/tests: `contracts/cart-activation-decision.schema.json`,
  `tests/cart-activation-policy.test.js`,
  `tests/commerce-boundary-policy.test.js`, and related contract, API,
  component, bag, loader, and normalization tests. Obsolete legacy-service
  tests were removed with their runtime owners.
- Governance/evidence: `.env.example`, root governance/status records,
  `docs/commerce-surface-inventory.md`, durable status records, this report,
  `verification.json`, and two browser screenshots.

## 3. Tests, commands, and machine-readable artifacts

- Focused policy/contract/component/API/adapter verification: 8 files and 69
  tests passed; ESLint passed with zero warnings.
- Full `yarn verify`: zero-warning lint, 27 files/184 tests, zero production
  advisories across 193 packages, and successful Next.js 15.5.21 build with 13
  routes.
- `cp.cart-activation-decision.v1` requires exactly seven prerequisites and
  enforces checkout false. Tests prove credentials/visibility alone do not
  grant cart authority, fixtures and stale fingerprint observations remain
  disabled, missing release/variant evidence blocks activation, and client
  summaries contain no variant payload.
- Desktop fixture PDP and mobile bag browser checks passed with no console/page
  errors, overlays, checkout links, or horizontal overflow. The retired
  `/api/shopify/media-audit` path returned `404 API_ROUTE_UNAVAILABLE`.

## 4. Exists / Partial / Proposed / Missing changes

- Exists: one server-owned cart activation decision binding product source,
  Released state, exact current/release variant-fingerprint match, variant
  mapping, operation-specific capability, scoped Product Owner approval, and
  an environment gate.
- Exists: a single server-only product read adapter and transport-free Shopify
  normalization; broad product/cart clients and public audit endpoints are no
  longer runtime surfaces.
- Partial: a provider-neutral Commerce Cart contract remains as future target
  shape, but there is deliberately no active cart adapter or checkout redirect.
- Proposed: a sanitized Product Observation contract and deterministic variant
  fingerprint to prepare for authorized read-only Shopify evidence.
- Missing: live Shopify product/variant/cart capability proof, a Released
  Hoodie, activation approval, hosted Preview, checkout/payment/order proof,
  and operational fulfillment/support/returns evidence.

Fitness remains **44/50**, not production readiness. Removing bypasses improves
architectural safety but does not add the missing live operational evidence.

## 5. Failures and contradictory evidence

- The first shell command could not find a normal `yarn` executable. The
  already-proven bundled Yarn 1.22.22 runtime ran the focused and full gates.
- The inventory found a latent normalized-product mismatch: Shopify handles
  were stored only as `id`, while release policy compares `handle`. Pure
  normalization now preserves both and tests cover the match field.
- Prior API media-audit/readiness routes returned catalog observations without
  Product Release Record filtering. They were retired instead of being treated
  as commerce evidence.
- Existing PostCSS/sharp range, Yarn `url.parse`, stale Browserslist, and Open
  Graph edge-runtime warnings remain.

## 6. Human/external blockers and exact resume points

- Shopify Admin: Product Owner authenticates without sharing authentication
  data. Resume at the 30-app inventory and P0 read-only capability audit.
- Storefront product truth: authorized owner configures server-only read values
  in an ignored local/Preview environment. Resume at a product-by-handle
  observation, review the sanitized variant fingerprint, then explicitly bind
  accepted evidence to the Draft release record. Keep cart disabled.
- Storefront cart capability: after read access is classified, separately
  authorize a no-order cart capability test. Resume by recording the exact
  callable surface and evidence in the capability registry; do not activate UI
  or checkout.
- Vercel 402: authorized owner restores deployment access. Resume with an
  approved Preview-only deployment and repeat boundary checks; do not promote
  production.
- Shopify writes, cart activation, checkout/order tests, paid tools,
  publication, merge, and production remain separately approval-gated.

## 7. Product Owner decisions required

No product-sequence decision is required. Hoodie-first remains authoritative.
Future decisions concern authentication/least privilege, whether to authorize a
no-order cart test, exact cart UI approval, paid usage, and every
write/order/publish/deploy/merge/production boundary.

## 8. Rollback and next bounded cycle

Rollback by reverting the Cycle 13 commit; no external state changed. Next safe
local cycle: define a sanitized Shopify Product Observation contract and
deterministic variant fingerprint, prove simulated/fixture observations cannot
mutate or satisfy the Draft release record, and keep all UI commerce disabled.

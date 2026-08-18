# CP Fitness Cycle 14 Evidence Package

## 1. Objective completed and commit

Implemented canonical, sanitized Shopify Product Observation and review
contracts. A candidate now binds exact product-read capability evidence, raw
variant references remain hashed, both fingerprints are recomputed during
review, and exact fingerprint/handle approval can produce only an unapplied
candidate release patch. The local cycle commit is reported by Git at handoff;
the parent was `40719fc`.

## 2. Exact files changed

- Observation/review core:
  `lib/commerce/product-observation.js`,
  `contracts/product-observation.schema.json`, and
  `contracts/product-observation-review.schema.json`.
- Read-only integration: `lib/shopify/normalize.js`,
  `lib/providers/shopify/product-loader.js`, and
  `lib/providers/shopify/storefront-product-adapter.js`.
- Capability evidence: `config/capability-registry.json`,
  `contracts/capability-registry.schema.json`, and
  `lib/orchestration/capability-registry.js`.
- Tests: `tests/product-observation.test.js` plus capability, contract,
  loader, cart-activation, and boundary policy regressions.
- Governance/evidence: root PRD/architecture/readme/status/tasks,
  commerce/capability audit documents, durable status/next-action records, this
  report, and `verification.json`.

## 3. Tests, commands, and machine-readable artifacts

- Focused observation/contract/capability/loader/boundary verification: 6 files
  and 74 tests passed; ESLint passed with zero warnings.
- Full `yarn verify`: zero-warning lint, 28 files/204 tests, zero production
  advisories across 193 packages, and successful Next.js 15.5.21 build with 13
  routes.
- Deterministic tests prove locale-independent ordering, raw-ID sanitation,
  stable variant identity semantics, full-envelope timestamp/capability
  binding, exact approval binding, tamper detection, duplicate/empty/malformed
  fact denial, and no release-record mutation.
- No UI or client interaction changed, so no new browser capture was required.
  The unchanged PDP/bag states retain the Cycle 13 desktop/mobile evidence.

## 4. Exists / Partial / Proposed / Missing changes

- Exists: `cp.product-observation.v1` and
  `cp.product-observation-review.v1`; a registered but currently unverified
  `shopify-storefront-product-read` capability; a loader that attaches only
  sanitized pending-observation metadata.
- Exists: the variant fingerprint covers stable hashed identity/title/options.
  The full observation fingerprint additionally covers source/authority,
  environment, timestamp, capability evidence, product, variants, price,
  currency, and availability.
- Partial: review can emit a candidate patch after exact evidence and approval,
  but intentionally has no apply operation.
- Proposed: require Preview/production visibility to match the current
  observation variant fingerprint to the release-bound fingerprint.
- Missing: verified live Storefront read capability/evidence, a current Hoodie
  observation and approval, an authorized patch application, complete release
  evidence, cart/checkout/operations proof, and hosted Preview availability.

Fitness remains **44/50**, not production readiness. Canonical evidence handling
is locally stronger, but no live or operational gate changed.

## 5. Failures and contradictory evidence

- The initial Cycle 14 draft fingerprinted only product/variant facts and
  accepted generic approval/capability evidence. Independent review correctly
  identified replay/tamper gaps. The final implementation fingerprints the full
  review envelope and requires exact capability/fingerprint/handle bindings.
- The first focused run found a test availability-summary mismatch, a duplicate
  capability test whose expected first entry became stale, and strict-schema
  array warnings. Test facts/expectations and schema types were corrected; the
  focused and full gates then passed.
- Variant identity deliberately does not change with price or availability.
  Tests prove those mutable facts instead invalidate the full observation
  fingerprint.
- Existing PostCSS/sharp range, Yarn `url.parse`, stale Browserslist, and Open
  Graph edge-runtime warnings remain.

## 6. Human/external blockers and exact resume points

- Storefront read capability: an authorized owner establishes least-privilege
  server-only product-read access and durable evidence without placing values
  in reports. Resume by marking only the exact capability operation ready with
  that evidence reference.
- Product observation: run the product-by-handle read only after capability is
  ready; review the sanitized observation fingerprint and expected Hoodie
  handle. Keep the resulting candidate patch unapplied until separately
  authorized.
- Shopify Admin/app audit: authenticate without sharing authentication data,
  then resume at the 30-app inventory and P0 read-only classification.
- Vercel 402: authorized owner restores deployment access; resume with an
  approved Preview-only deployment, never production promotion.
- Shopify writes, release-patch application, cart/order tests, paid tools,
  publication, merge, and production remain separately approval-gated.

## 7. Product Owner decisions required

No product-sequence decision is required. Hoodie-first remains authoritative.
Future decisions concern read-only capability evidence, exact observation
approval, separate patch application, any no-order cart test, paid usage, and
every write/order/publish/deploy/merge/production boundary.

## 8. Rollback and next bounded cycle

Rollback by reverting the Cycle 14 commit; no external state changed. Next safe
local cycle: bind Preview/production visibility to the current observation
variant fingerprint, isolate stale/malformed candidates, and require a newly
reviewed full observation for changed price/availability facts.

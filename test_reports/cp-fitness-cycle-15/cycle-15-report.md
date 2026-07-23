# CP Fitness Cycle 15 Evidence Package

## 1. Objective and commit

Implemented a release-aware observation freshness boundary for Preview and
production. Fresh Shopify reads are integrity-checked and compared to reviewed
variant-identity and commerce-facts bindings without incorrectly requiring a
new runtime timestamp to equal the historical approval timestamp. The local
commit is reported by Git at handoff; the parent is `99d368a`.

## 2. Exact files changed

- Observation and visibility policy:
  `lib/commerce/product-observation.js`,
  `lib/commerce/observation-visibility-policy.js`, and
  `lib/commerce/release-policy.js`.
- Contracts and release evidence:
  `contracts/product-observation.schema.json`,
  `contracts/product-observation-review.schema.json`,
  `contracts/product-release.schema.json`, the Hoodie Draft release, and its
  machine-readable staging decision.
- Tests: dedicated observation-visibility tests plus observation, loader,
  release-policy, catalog, transition, contract, and reusable release-fixture
  regressions.
- Governance/evidence: root governance/status/task records, durable status and
  blocker documents, commerce/capability inventories, this report, and
  `verification.json`.

## 3. Tests, commands, and machine-readable artifacts

- Focused observation/visibility/release/catalog verification: 7 files and 98
  tests passed; ESLint passed with zero warnings.
- Full `yarn verify`: zero-warning lint, 29 files/216 tests, zero production
  advisories across 193 packages, and a successful Next.js 15.5.21 build with
  13 routes.
- Deterministic coverage proves fresh unchanged reads remain eligible across
  timestamps and the correct runtime environment; changed price, availability,
  title, or variant identity is withheld; tampered/malformed envelopes return
  no payload; and one bad catalog candidate does not withhold another.
- The actual product loader is tested with consecutive dynamic timestamps.
- No route presentation or client interaction changed, so new browser capture
  is not required. Cycle 13 remains the latest applicable PDP/bag UI evidence.

## 4. Exists / Partial / Proposed / Missing changes

- Exists: separate variant-identity, commerce-facts, and immutable full
  observation fingerprints with explicit schemas and recomputation.
- Exists: Preview/production server policy validates the complete sanitized
  envelope and compares only identity/facts to reviewed release bindings.
- Exists: the Product Release Record binds the reviewed full fingerprint and
  review evidence for audit without using the historical timestamp as a
  runtime cache key.
- Partial: the Hoodie Draft explicitly records all three Shopify bindings as
  missing; no candidate patch has been applied.
- Proposed: bind rendered Shopify media to approved Media Registry assets.
- Missing: live read capability/evidence, current Hoodie observation and
  approval, authorized release patch, complete media/provider truth,
  cart/checkout/operations proof, and hosted Preview availability.

Fitness remains **44/50**, not production readiness. Local release integrity is
stronger, but no live or operational gate changed.

## 5. Failures and contradictory evidence

- The first Cycle 15 draft compared a fresh full observation fingerprint and
  timestamp directly to the stored reviewed instance. Because the active loader
  timestamps every read, that would have denied every legitimate Preview and
  production request forever.
- The corrected model retains timestamp/environment/capability evidence in the
  immutable approval fingerprint and adds a deterministic commerce-facts
  fingerprint for runtime freshness. It does not weaken exact review approval.
- Initial focused failures were stale test fixtures expecting source-less
  Shopify products or the former two-fingerprint contract. Fixtures and
  assertions were upgraded; the focused gate then passed.
- The first full run found one remaining source-less product-gateway fixture.
  The fail-closed policy correctly denied it; the fixture was upgraded to the
  canonical observation contract and the complete gate passed.
- Existing PostCSS/sharp range, Yarn `url.parse`, stale Browserslist, and Open
  Graph edge-runtime warnings remain.

## 6. Human/external blockers and exact resume points

- Storefront read: authorized owner establishes least-privilege server-only
  product-read access and durable evidence. Resume by marking only that exact
  capability ready.
- Observation: run the read, review the exact full fingerprint and Hoodie
  handle, then separately authorize applying its atomic identity/facts/audit
  patch to the Draft record.
- Shopify Admin/app audit: authenticate without recording authentication data,
  then resume at installed apps and the P0 read-only capability matrix.
- Vercel 402: authorized owner restores access; resume with Preview-only
  deployment and verification, never production promotion.
- Shopify writes, cart/order tests, paid tools, publication, merge, and
  production remain separately approval-gated.

## 7. Product Owner decisions required

No product-sequence decision is required. Hoodie-first remains authoritative.
Human decisions remain exact read capability evidence, observation approval,
separate patch application, any operational/cart test, paid usage, write,
publish, deploy, merge, and production boundary.

## 8. Rollback and next bounded cycle

Rollback by reverting the Cycle 15 commit; no external state changed. Next safe
local cycle: bind actual rendered Shopify media to approved Media Registry
assets so unapproved or stale media cannot pass merely because the manifest
shares a release ID.

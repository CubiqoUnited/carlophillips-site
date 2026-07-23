# CP Fitness Cycle 10 Evidence Package

## 1. Objective completed and commit

Bound active storefront product decisions to environment-specific Product Release Record and Media Registry evidence. A Shopify observation can no longer independently make a product visible. The Hoodie remains Draft and no external state changed. The local cycle commit is reported by Git at handoff; the parent was `b4d417b`.

## 2. Exact files changed

- Runtime: `lib/commerce/release-policy.js`, `lib/commerce/product-gateway.js`, `lib/releases/product-release-registry.js`, `lib/releases/product-release-transition.js`, `app/products/[handle]/page.js`, `components/commerce/product-detail.jsx`.
- Contract: `contracts/release-decision.schema.json`.
- Tests: `tests/release-policy.test.js`, `tests/product-gateway.test.js`, `tests/product-release-registry.test.js`, `tests/product-detail.test.jsx`, `tests/contracts.test.js`.
- Governance/status: `README.md`, `PRD.md`, `ARCHITECTURE.md`, `STATUS.md`, `TASKS.md`, `docs/status/CURRENT_STATUS.md`, `docs/status/NEXT_ACTIONS.md`.
- Evidence: this report, `verification.json`, and two browser screenshots under `test_reports/cp-fitness-cycle-10/`.

## 3. Tests, commands, and machine-readable artifacts

- Focused release/registry/gateway/component/schema verification: 6 files and 64 tests passed.
- Full `yarn verify`: zero-warning lint, 21 files/150 tests, zero production advisories across 193 packages, and successful Next.js 15.5.21 build with 13 routes.
- Desktop 1440×1000 and mobile 390×844 local fixture PDP checks returned HTTP 200 with explicit source/release labels, disabled purchasing, no overlay, no console/page errors, and no horizontal overflow.
- `verification.json` records the exact release policy, test/build counts, browser observations, warnings, score, and non-actions.

## 4. Exists / Partial / Proposed / Missing changes

- Exists: handle-keyed server release registry; clone-isolated release evidence; Preview Staged-or-later gate; production Released-only gate; exact evidence evaluation; denied decisions with null product payload; explicit non-commerce PDP reason.
- Partial: a complete synthetic Released record proves the production policy, while the real Hoodie correctly remains Draft and cannot pass it.
- Proposed: a release-aware `/shop` and `/collections` server catalog boundary using the same policy for every observed product.
- Missing: live Shopify product/variant observation, Staged Hoodie evidence, complete truthful media, verified cart/checkout, operational proofs, and available Preview hosting.

Fitness remains **44/50**, not production readiness. The architecture category was already at its evidence ceiling; live operations and hosted evidence remain the material score gaps.

## 5. Failures and contradictory evidence

- The first registry test used an abbreviated Hoodie handle and failed. It was corrected to the canonical `carlophillips-signature-hoodie` identity already bound by the release record; the complete focused suite then passed.
- The root editorial shell returned HTTP 200 without a Hoodie link at `/`; its gated link is path-dependent. This was not counted as PDP navigation proof.
- The requested `agent-browser` CLI was unavailable, so the established bundled Playwright fallback captured equivalent local page, error, element, and viewport evidence.
- Existing PostCSS/sharp range, Yarn `url.parse`, stale Browserslist, and Open Graph edge-runtime warnings remain.

## 6. Human/external blockers and exact resume points

- Shopify read-only audit: Product Owner completes Google selection and Shopify OTP in the authenticated tab. Resume at installed-app inventory and then observe the Hoodie handle/variants/media without writes.
- Hoodie staging: bind observed Shopify and Apliiq fingerprints, immutable commit/build evidence, and private staging evidence to the Draft record; re-run the existing staging evaluator before any state proposal.
- Vercel 402: authorized owner restores deployment access. Resume by deploying the approved branch to Preview only and testing the Staged gate; do not promote production.
- Cart/checkout and operations: separately authorize the exact no-order or controlled proof before enabling commerce. Publishing, orders, billing, merge, and production remain gated.

## 7. Product Owner decisions required

No product-sequence decision is required. Hoodie-first remains authoritative. Product Owner action is required only at the existing credential/OTP, external execution or cost, Shopify/provider write, order, publication, deployment, merge, and production gates.

## 8. Rollback and next bounded cycle

Rollback by reverting the Cycle 10 commit; no external record or service changed. Next safe local cycle: replace `/shop` and `/collections` editorial wrappers with a release-aware server catalog boundary that filters every observed item through this same environment/release policy and remains non-commerce.

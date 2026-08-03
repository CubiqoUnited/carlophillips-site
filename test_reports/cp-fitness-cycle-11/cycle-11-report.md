# CP Fitness Cycle 11 Evidence Package

## 1. Objective completed and commit

Replaced the `/shop` and `/collections` editorial-home re-exports with one reusable release-aware Server Component catalog boundary. Every candidate now resolves through the same Commerce Gateway, Product Release Record, Media Registry, and environment policy as the PDP. The Product Owner-observed 30-app inventory was recorded separately without inferring installed-app capability. The local cycle commit is reported by Git at handoff; the parent was `568ed79`.

## 2. Exact files changed

- Catalog runtime/UI: `lib/commerce/catalog-gateway.js`, `lib/releases/product-release-registry.js`, `components/commerce/catalog-boundary.jsx`, `components/commerce/catalog-state.jsx`, `app/shop/page.js`, `app/collections/page.js`.
- Contracts/evidence: `contracts/catalog-decision.schema.json`, `contracts/shopify-app-inventory.schema.json`, `evidence/shopify/po-observed-installed-apps-2026-07-22.json`, `config/capability-registry.json`, `runs/cp-hoodie-local-sim-001/run.json`.
- Tests: `tests/catalog-gateway.test.js`, `tests/catalog-state.test.jsx`, `tests/shopify-app-inventory.test.js`, `tests/product-release-registry.test.js`, `tests/capability-registry.test.js`, `tests/contracts.test.js`.
- Governance/status: `README.md`, `PRD.md`, `ARCHITECTURE.md`, `STATUS.md`, `TASKS.md`, `docs/shopify-capability-access-audit.md`, `docs/status/CURRENT_STATUS.md`, `docs/status/NEXT_ACTIONS.md`.
- Evidence: this report, `verification.json`, and three browser screenshots under `test_reports/cp-fitness-cycle-11/`.

## 3. Tests, commands, and machine-readable artifacts

- Focused catalog/inventory/capability/contract verification: 6 files and 60 tests passed.
- Full `yarn verify`: zero-warning lint, 24 files/169 tests, zero production advisories across 193 packages, and successful Next.js 15.5.21 build with 13 routes.
- Catalog invariants prove `candidateCount === visibleCount + excludedCount` and `products.length === visibleCount` for available, denied, duplicate-handle, mixed-result, invalid-handle, and zero-candidate decisions.
- Resolver, adapter, and product-normalization failures are isolated per item; invalid handles never reach either dependency. One failing candidate cannot reject an otherwise valid catalog.
- Desktop `/shop`, mobile `/collections`, catalog-to-PDP, and credentials-disabled Preview empty-state checks passed with no console/page errors, overlays, or horizontal overflow.

## 4. Exists / Partial / Proposed / Missing changes

- Exists: shared server catalog boundary; registry-only candidates; per-item environment/release filtering; truthful candidate/visible/withheld counts; local-only fixture labeling; non-commerce cards; mixed-result isolation; denied-payload removal; reusable multi-record tests.
- Exists as PO evidence only: 30 installed-app names with per-app goal/duplicate disposition, expected access class to verify, agent authentication requirement, fee risk, and safe next action.
- Partial: the real registry contains only the Draft Hoodie. Multi-product behavior is synthetic policy proof, not evidence for the older 12-product observation.
- Proposed: bind the home featured-product link/count to the same release registry without turning editorial content into a second catalog.
- Missing: live Shopify app/permission observation, current Hoodie Shopify variant/media facts, complete media, staged release evidence, cart/checkout, operations, and available Preview hosting.

Fitness remains **44/50**, not production readiness. Local architecture and browser evidence improved, but the score ceiling remains live hosted/commerce/operations proof.

## 5. Failures and contradictory evidence

- The initial inventory test required explicit read-only wording; CodexAutomation5’s next action was tightened before the suite passed.
- Independent review found a resolver exception could reject the initial `Promise.all` catalog. Per-candidate isolation and invalid-handle guards now return truthful unavailable reasons, with regression tests.
- Initial browser assertions were case-sensitive while rendered uppercase text reflected CSS. Assertions were normalized and rerun; screenshots and DOM facts agree.
- Product Owner reports Shopify is logged in, but the managed browser available to this task opened at Shopify login. This is a browser-session boundary, not evidence against the PO-observed app list. The list remains reported-installed and capability-unverified.
- Existing PostCSS/sharp range, Yarn `url.parse`, stale Browserslist, and Open Graph edge-runtime warnings remain.

## 6. Human/external blockers and exact resume points

- Shopify Admin: in the preserved login tab, Product Owner chooses **Continue with Google**, selects the authorized account, and completes verification if prompted without sharing authentication data. Resume at the installed-app list and compare all 30 names.
- Connector authorization: inspect granted scope names and settings for CodexAutomation5, Shopify CLI Connector App, and Carlophillips Headless. Distinguish native Admin/Flow scopes from app-private API/CLI/channel authorization; do not expose values or mutate configuration.
- P0 audit: inspect Storefront/cart, Apliiq mapping, Modelize, Spin Studio/ZS-Spin-View, MyDesigns, Flow, and CS Trending Products Finder read-only. Record fee, Draft safety, actual callable surface, exact blocker, and resume point.
- Vercel 402: authorized owner restores deployment access. Resume at Preview-only deployment and repeat catalog/PDP evidence; do not promote production.
- Writes, paid usage, generation, customer contact, orders, publication, merge, and production remain separately approval-gated.

## 7. Product Owner decisions required

No product-sequence decision is required. Hoodie-first remains authoritative. Future decisions are limited to authentication/least-privilege access, selecting one provider/worker where duplicates exist, cost or credit approval, and each write/order/publish/deploy/merge/production boundary.

## 8. Rollback and next bounded cycle

Rollback by reverting the Cycle 11 commit; no Shopify/app/Vercel state changed. Next safe local cycle: bind the home featured-product link/count to the release registry and prove every editorial-to-catalog-to-PDP path stays source-labeled and non-commerce.

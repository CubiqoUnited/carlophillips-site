# CP Fitness Cycle 12 Evidence Package

## 1. Objective completed and commit

Bound the home featured-product count and navigation to the exact release-aware server catalog decision already used by `/shop` and `/collections`. The client editorial shell no longer imports the Hoodie fixture or owns product/collection release logic. The local cycle commit is reported by Git at handoff; the parent was `50382fb`.

## 2. Exact files changed

- Server composition: `app/page.js`, `lib/commerce/catalog-server.js`, `lib/commerce/home-catalog-summary.js`, `components/commerce/catalog-boundary.jsx`.
- Editorial isolation/UI: `components/editorial/app-shell.jsx`, `app/about/page.js`, `app/lookbook/page.js`; the former monolithic client `app/page.js` implementation was removed.
- Contract/tests: `contracts/home-catalog-summary.schema.json`, `tests/home-catalog-summary.test.js`, `tests/home-release-section.test.jsx`, `tests/editorial-route-policy.test.js`.
- Governance/status: `README.md`, `PRD.md`, `ARCHITECTURE.md`, `STATUS.md`, `TASKS.md`, `docs/status/CURRENT_STATUS.md`, `docs/status/NEXT_ACTIONS.md`.
- Evidence: this report, `verification.json`, and three browser screenshots under `test_reports/cp-fitness-cycle-12/`.

## 3. Tests, commands, and machine-readable artifacts

- Focused home/catalog/presentation/policy verification: 5 files and 23 tests passed.
- Full `yarn verify`: zero-warning lint, 27 files/179 tests, zero production advisories across 193 packages, and successful Next.js 15.5.21 build with 13 routes.
- Home summary schema and tests require truthful counts, a non-commerce primary review link only when visible count is positive, and no product payload/link when denied or empty.
- Desktop/mobile home, linked PDP/catalog, editorial-only about, and credentials-disabled Preview checks passed with no console/page errors, overlays, or horizontal overflow.

## 4. Exists / Partial / Proposed / Missing changes

- Exists: one server catalog resolver shared by home, shop, and collections; minimized home summary; schema-validated count/link policy; local-only fixture messaging; Preview withholding; direct home-to-PDP/catalog checks.
- Exists: about/lookbook render the editorial shell without catalog, Shopify adapter, fixture, or release-flag imports.
- Partial: home features the first eligible registry product while showing the full visible count. The real registry still contains only the Draft Hoodie.
- Proposed: inventory and quarantine dormant browser-side product/cart modules before any active cart implementation.
- Missing: authenticated live Shopify product/app observations, complete Hoodie truth/media/staging evidence, verified Storefront cart/checkout, operations, and available hosted Preview.

Fitness remains **44/50**, not production readiness. Local architecture is at its evidence ceiling; hosted and operational proof remain the material gaps.

## 5. Failures and contradictory evidence

- The first focused component run failed because the Vitest server renderer required an explicit React binding in the new client shell. The import was added and the complete focused/full gates passed.
- Prior home behavior claimed “Approved releases enabled” from a top-level flag and bundled a fixture-owned collection/PDP implementation. Both contradicted the server release policy and were removed.
- Preview browser evidence used explicitly blank Shopify variables. It proves fail-closed presentation, not live Storefront access.
- Existing PostCSS/sharp range, Yarn `url.parse`, stale Browserslist, and Open Graph edge-runtime warnings remain.

## 6. Human/external blockers and exact resume points

- Shopify Admin: Product Owner authenticates in the preserved login tab without sharing authentication data. Resume at the 30-app installed inventory and P0 read-only capability audit.
- Storefront truth: authorized owner configures least-privilege read values in an ignored local or Preview environment. Resume at the server product/catalog probe, bind normalized variant/media fingerprints to the Draft release record, and keep commerce disabled.
- Vercel 402: authorized owner restores deployment access. Resume with an approved Preview-only deployment and repeat home→catalog→PDP checks; do not promote production.
- Shopify writes, cart mutations, orders, paid tools, publication, merge, and production remain separately approval-gated.

## 7. Product Owner decisions required

No product-sequence decision is required. Hoodie-first remains authoritative. Future decisions concern authentication/least privilege, one owner among duplicate providers/workers, paid usage, and each write/order/publish/deploy/merge/production boundary.

## 8. Rollback and next bounded cycle

Rollback by reverting the Cycle 12 commit; no external state changed. Next safe local cycle: inventory dormant browser-side product/cart modules, quarantine bypass paths, and define exact cart UI activation prerequisites without issuing a Shopify write.

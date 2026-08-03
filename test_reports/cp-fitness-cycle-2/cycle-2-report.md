# CP Fitness Cycle 2 Evidence

## 1. Objective and revision

Implemented the read-only, provider-neutral product boundary: explicit source selection, server-only Shopify adapter, reusable non-buyable PDP, and an evidence-bound Draft Hoodie release record. No Shopify write, checkout, order, deployment, purchase, merge, or production action occurred.

Branch: `codex/cp-fitness-baseline`  
Base: `0e0476e6ef437b401f1c3ee02c459c1df435eaa0`  
Cycle commit: reported by Git after this package is committed.

## 2. Exact changed-file groups

- Product route/presentation: `app/products/[handle]/page.js`, `components/commerce/product-detail.jsx`.
- Gateway/provider: `lib/commerce/product-gateway.js`, `lib/commerce/product-view-model.js`, `lib/providers/shopify/product-loader.js`, `lib/providers/shopify/storefront-product-adapter.js`.
- Release truth: `contracts/product-release.schema.json`, `releases/cp-signature-hoodie-2026-001/release.json`, `media-manifest.json`.
- Configuration/tooling: `.env.example`, `package.json`, `yarn.lock`.
- Tests: `tests/contracts.test.js`, `product-detail.test.jsx`, `product-gateway.test.js`, `product-view-model.test.js`, `shopify-product-loader.test.js`.
- Truthful docs/status: `README.md`, `QUICKSTART.md`, `ARCHITECTURE.md`, `STATUS.md`, `TASKS.md`, `docs/status/CURRENT_STATUS.md`, `HUMAN_BLOCKERS.md`, `NEXT_ACTIONS.md`.
- Evidence: this report, `verification.json`, and four browser screenshots in this directory.

## 3. Tests, commands, and artifacts

- Fresh `yarn install --frozen-lockfile`: passed.
- `yarn lint`: passed with zero warnings.
- `yarn test`: 9 files / 37 tests passed.
- `yarn build`: passed; 12 routes; product route first-load JS 94 kB.
- Desktop/mobile fixture PDP: passed with source label, disabled purchasing, no console errors/overlays, no mobile overflow.
- Preview fixture denial: passed with `FIXTURE_SOURCE_FORBIDDEN` and no fixture content.
- Shopify mode: reached the active server boundary and returned `SHOPIFY_REQUEST_FAILED`; read-only audit says Shopify is not configured; no fixture substitution occurred.
- Machine-readable evidence: `verification.json`.

## 4. Exists / Partial / Proposed / Missing changes

- Commerce Gateway: Proposed -> Exists locally.
- Server-only Shopify product adapter: Proposed -> Exists locally with no-store request tests.
- Reusable product route/PDP: Missing -> Exists locally.
- Product Release Record: Schema only -> Draft Hoodie record exists with missing fingerprints explicit.
- Media provenance: Partial -> one pending real front asset bound; two uncertain details formally quarantined.
- Current Shopify-backed product observation: remains Missing because configuration is incomplete.
- Cart/checkout/operations: remain Missing.

## 5. Failures and contradictory evidence

- Initial component tests needed an explicit React import under Vitest’s transform; fixed and reverified.
- AJV strict review found an underspecified conditional object type; fixed and reverified.
- Live Shopify configuration names existing locally did not prove usable values. The read-only audit reports `Not configured`, contradicting any claim that the active local route is currently Shopify-connected.
- A Draft release record and passing build do not prove approval, buyability, checkout, fulfillment, or production readiness.

## 6. Human/external blockers

- Read-only Shopify: authorized owner supplies valid Storefront domain/token values to local or Preview environment. Resume with `COMMERCE_DATA_MODE=shopify`, capture product/variant/price/media truth, fingerprint variants, and keep purchasing disabled.
- Vercel: authorized owner restores `carlophillips-site`. Resume at Preview-only deployment verification; do not promote production.
- Operational actions remain separately approval-gated.

## 7. Product Owner decisions

- Signature Hoodie one-product proof versus broader 12-product catalog restoration.
- Later: product facts, price, media/disclosure, fulfillment mapping, checkout test, merge, and production approval independently.

## 8. Rollback and next bounded cycle

Rollback by reverting the Cycle 2 commit; Cycle 1 remains at `0e0476e`. No external state changed.

Next safe cycle: after authorized read-only configuration, capture current Shopify truth and fingerprints. In parallel, add provider-neutral cart contracts, deny local-cart fallback outside local development, and validate Shopify checkout hosts without placing an order.

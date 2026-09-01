# Shopify observation approval and Staged transition — 2026-08-17

## Accepted Product Owner decision

The exact approval `Approve Shopify observation sha256:143a817c9a1d8898faeaee2aa81e05ccc05153f9dfa3ae9497411c44c1cf47f4` is recorded in `releases/cp-signature-hoodie-2026-001/shopify-observation-approval.json`.

The approval binds the reviewed Shopify observation, commerce facts and variant fingerprints to candidate commit `4ee088cd39cfa9b967bde32893f0dc2a33325904`. The canonical Product Release Record advances from Draft to Staged. No Shopify catalog, cart, checkout, order, payment, fulfillment, Vercel Production, or domain mutation occurred.

## Verification

- Design-system lint: pass.
- ESLint with zero warnings: pass.
- Tests: 50/50 files and 511/511 tests pass.
- Dependency audit: zero vulnerabilities across 67 audited production packages.
- Next.js 15.5.21 optimized build: pass.
- Product release transition: exact reviewed observation accepted; Staged transition passes; approval/release remain fail-closed.
- Production preflight: denied with the remaining physical-sample, product, media, fulfillment, media-matrix, Production-observation, rollback-verification and cart-capability blockers.

## Visual evidence and comparison

The release/evidence update contains no storefront component, stylesheet, token, media, route, or checkout implementation change. Its immutable storefront source remains exact candidate commit `4ee088cd39cfa9b967bde32893f0dc2a33325904`.

The candidate's required desktop and mobile visual evidence is retained at:

- `test_reports/cp-product-offer-sml-2026-08-17/desktop.png`
- `test_reports/cp-product-offer-sml-2026-08-17/mobile.png`

The protected immutable Preview bound by `staging-evidence.json` is deployment `dpl_2Yb3oFEHNGDyr8QCGRmC7BGW5G6V` at `https://carlophillips-site-1c9igdoux-adityas-projects-261b17a9.vercel.app`. It is READY, has no aliases, returns HTTP 200 for the Hoodie route, and returns HTTP 409 `PRODUCT_RELEASE_NOT_RELEASED` for checkout.

A local attempt to repeat the authenticated Preview visual check was rejected as authoritative evidence: Vercel's pulled local Preview file contains the required protected variable names but blank values, so the local build correctly rendered the closed unavailable state. Those invalid captures were quarantined outside the repository and are not cited as Staging proof.

## Result

GO for the formal Staged release state and continued protected review. NO-GO for Production charging. Shopify Payments must remain in test mode and both checkout switches must remain off until the remaining release gates pass and the Product Owner separately approves the exact Production release.

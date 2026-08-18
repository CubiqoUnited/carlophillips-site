# Initial S/M/L offer QA — 2026-08-17

## Scope

- The initial customer offer is restricted to Small, Medium and Large.
- The client selector filters to the reviewed opaque reference hashes.
- The checkout server independently rejects every reference outside the reviewed offer before Shopify access.
- No Shopify variant was deleted or changed.
- No cart, checkout, order, payment or Production mutation occurred during this QA run.

## Automated validation

- Design-system lint: pass.
- ESLint with zero warnings: pass.
- Tests: 50/50 files and 511/511 tests pass.
- Dependency audit: 0 vulnerabilities across 67 packages.
- Next.js 15.5.21 optimized build: pass.
- Offer contract: exact S/M/L set accepted; six non-offered observed variants denied; stale/incomplete bindings fail closed.
- Checkout boundary: non-offered reference denied before product read or cart creation.

## Headless browser validation

Route: `/products/carlophillips-signature-hoodie`

| Viewport | HTTP | Console/page errors | Error overlay | Horizontal overflow | Release boundary |
| --- | ---: | ---: | --- | --- | --- |
| 1440×1000 | 200 | 0 | absent | absent | unavailable while Draft |
| 390×844 | 200 | 0 | absent | absent | unavailable while Draft |

Screenshots:

- `desktop.png`
- `mobile.png`

The current public route honestly remains unavailable because the Product Release Record is Draft. The S/M/L selector is therefore verified through component and server tests but is not exposed to customers before release eligibility.

## Result

GO for code review and protected Staging after the remaining exact Shopify-observation approval is recorded. NO-GO for Production charging until the release, physical sample, fulfillment, live checkout and rollback gates are complete.

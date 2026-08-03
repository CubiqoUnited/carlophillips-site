# CP production cutover verification — 2026-08-03

## Bound release

- Canonical PR: `https://github.com/CubiqoUnited/carlophillips-site/pull/3`
- Canonical merge: `85b6f8fa52f9c15d8fa2220e395cad54be44b70b`
- Vercel production deployment: `dpl_66ydzPzwP2hBoFuTsyy5AKWMKKx1`
- Production URL: `https://www.carlophillips.com`

## Checks

- `www` home, shop, Signature Hoodie, and bag returned HTTP 200.
- Apex returned one HTTP 308 canonical redirect to `www`; no redirect loop remained.
- Desktop screenshot: 1440×900.
- Mobile screenshot: 390×844.
- Direct mobile runtime measurement: `innerWidth=390`, `scrollWidth=390`, no horizontal overflow, zero broken images, title `CARLOPHILLIPS | Gesture of Luxury`.
- The visual result preserves the approved dark, restrained, VOLLBAK-confidence direction.
- Final `yarn verify` passed: zero-warning lint, 32 test files / 309 tests, zero production vulnerabilities across 193 packages, and a successful Next.js 15.5.21 production build.

## Commerce boundary

This is a hosting and visual release, not a commerce-readiness claim. Shopify product, cart, checkout, payment, POD fulfillment, and embedded-app capability remain unverified and fail-closed. No paid plan, order, product publication, or provider mutation was performed.

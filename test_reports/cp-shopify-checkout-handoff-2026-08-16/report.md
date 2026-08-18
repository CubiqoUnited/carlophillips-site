# CARLOPHILLIPS Shopify hosted-checkout handoff

Date: 2026-08-16

Branch: `codex/cp-shopify-checkout-handoff`

Environment changed: none

## Outcome

The custom Next.js storefront now has a release-bound, server-only path to Shopify hosted checkout. It performs `cartCreate` only after all canonical release, capability, approval, environment, current-product, current-variant, and checkout-host checks pass. The browser receives only the Shopify checkout redirect; raw Shopify IDs and the Storefront token remain server-only.

The current Signature Hoodie remains Draft, so real customer payment is intentionally not active. No Shopify request, cart, checkout, payment, order, fulfillment, Vercel environment change, deployment, merge, or Production mutation occurred during this candidate.

## Verification

- Design-system lint: pass.
- ESLint, zero warnings: pass.
- Vitest: 46/46 files, 491/491 tests pass.
- Next.js 15.5.21 optimized build: pass.
- Same-origin boundary: missing, malformed, and foreign origins return 403 before cart creation.
- Checkout redirect: mocked valid Shopify/custom allowlisted hosts pass; foreign host fails.
- Release boundary: Draft, stale fingerprint, unavailable variant, missing approval, missing capability, and disabled environment gates fail before cart creation.
- Secret scan: no secret value added; `.env.example` contains names/placeholders only.
- Read-only Vercel name audit: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN`, and `SHOPIFY_CART_UI_ENABLED` exist for Preview/Production. The new `SHOPIFY_CHECKOUT_ENABLED` and `SHOPIFY_CHECKOUT_HOSTS` names are not provisioned. No value was read or changed.

## Background browser QA

Route: `http://127.0.0.1:3141/products/carlophillips-signature-hoodie`

Mode: local presentation fixture, fail-closed commerce

Browser: headless Chromium; no visible window or focus change

| Viewport | HTTP | Purchase-disabled control | Checkout form | Overflow | Runtime overlay | Console/page errors |
|---|---:|---:|---:|---:|---:|---:|
| 1440×1000 | 200 | yes | 0 | no | 0 | 0 |
| 390×844 | 200 | yes | 0 | no | 0 | 0 |

Screenshots:

- `screenshots/desktop-draft-denial.png`
- `screenshots/mobile-draft-denial.png`

Both screenshots were visually inspected. They show the expected product layout and explicit disabled purchasing state with no checkout control.

## Immutable Preview QA

- Commit: `7a27b9392006140672d7864e01182c269447589f`
- Deployment: `dpl_De5vhpmRvkamJRc7grjYNG4yki2d`
- URL: `https://carlophillips-site-j5vipkisj-adityas-projects-261b17a9.vercel.app`
- Target/state: Preview / READY
- Production aliases: none
- Public routes: 8/8 return HTTP 200 (`/`, `/shop`, `/collections`, Hoodie PDP, `/bag`, `/privacy`, `/terms`, `/cookie-policy`).
- Checkout denial: same-origin POST returns HTTP 409 `PRODUCT_RELEASE_NOT_RELEASED` before Shopify cart creation.
- Desktop/mobile Hoodie PDP: HTTP 200, no checkout form, no overflow, no runtime overlay, and zero console/page errors.
- Visual result: the Preview truthfully renders “This piece is currently unavailable” because the canonical record is Draft. It does not misrepresent the product as purchasable.

Remote screenshots:

- `screenshots/desktop-preview-draft-denial.png`
- `screenshots/mobile-preview-draft-denial.png`

## Remaining release blocker

The canonical Hoodie record is Draft and lacks the external evidence listed in `reports/HUMAN_INTERVENTION_STICKY_RED.md`. The existing cart capability is `write_test_verified` / `cart-write-test`, not operational `cart-write`. Preview and Production kill switches remain off. These conditions must not be bypassed.

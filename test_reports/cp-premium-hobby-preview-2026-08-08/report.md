# Premium Hobby Preview candidate — visual and QA evidence

Date: 2026-08-08

Branch: `codex/cp-shopify-poc-audit`

Target: Aditya Vercel Hobby Preview only; production and domains unchanged

## Result before deployment

The current candidate presents the live Shopify Signature Hoodie through a restrained, product-led fashion storefront. It applies reference patterns rather than copying either reference site: Vollebak-inspired full-height product storytelling and quiet fixed navigation, plus Zara-inspired sparse taxonomy, whitespace, direct product naming, pricing, bag, and checkout language.

Customer-visible pages no longer expose internal release, candidate, fingerprint, observation, withholding, or cart-gate terminology when live commerce is permitted. The home page introduces the Hoodie as Edition 001; the collection shows one real product and price; the PDP presents Shopify title, description, two current product images, nine ordered sizes, current prices, availability, and a Shopify checkout action.

Only current Shopify media is used for the live product. No spin, 3D, video, lifestyle, or on-model claim is made because those exact-product assets are not currently verified.

## Automated verification

- `yarn verify`: passed.
- ESLint: zero warnings.
- Vitest: 33 files, 318 tests passed.
- Production dependency audit: zero vulnerabilities across 193 packages.
- Next.js 15.5.21 optimized build: passed; 12 routes generated.
- Focused storefront route policy: 4 tests passed.
- Live customer component tests prove premium wording and reject internal release jargon.

## Local browser verification

Routes checked against the live Shopify Storefront read boundary: `/`, `/shop`, and `/products/carlophillips-signature-hoodie`.

- Desktop target: 1440 × 1000.
- Mobile CSS viewport: 390 × 844, device pixel ratio 1.
- Mobile document: 384 CSS pixels wide with no horizontal overflow.
- Browser console/page errors: zero on all checked desktop and mobile routes.
- Customer-jargon scan: no match for release, candidate, withheld, fingerprint, cart gate, or observation on the live routes.
- Product facts: two current Shopify images; nine available Black size variants ordered XS, S, M, L, XL, XXL, XXXL, 4XL, 5XL; USD 128–134.
- The in-app browser exports scaled full-page JPEG captures, so the stored pixel dimensions differ from the CSS viewport while the runtime viewport measurement above is authoritative.

## Screenshot evidence

- `home-desktop-1440x1000.jpg`
- `shop-desktop-1440x1000.jpg`
- `pdp-desktop-1440x1000.jpg`
- `home-mobile-390x844.jpg`
- `shop-mobile-390x844.jpg`
- `pdp-mobile-390x844.jpg`
- `home-direct-1280x720.jpg`
- `shop-direct-1280x720.jpg`
- `pdp-direct-1280x720.jpg`

The three direct 1280×720 captures were taken from a freshly restarted development server after the production build, specifically to rule out stale development-cache overlays and to inspect the visible first viewport at native browser size.

## Deployed Preview result

Preview: `https://carlophillips-site-2xbt13766-adityas-projects-261b17a9.vercel.app`

- Vercel deployment: `dpl_45XNRKWTpGbB1LaXreWH14sSkYMQ`.
- Vercel target: `preview`; state: `READY`.
- Shopify Storefront domain/token are stored as sensitive Vercel variables for Preview only. Values are not present in this report or the repository.
- `/`, `/shop`, `/collections`, and `/products/carlophillips-signature-hoodie` each returned HTTP 200.
- Direct browser verification covered `/`, `/shop`, and the PDP at 1280×720 and 390×844. All six page checks had exact viewport/scroll widths, all images loaded, no runtime overlay, no browser console warning/error, and no internal release jargon.
- A first true-device capture exposed a 23-pixel home overflow from the long mobile product title. The mobile type size was corrected, full verification was rerun, and this final Preview was redeployed and rechecked at `390 === 390` CSS pixels.
- The PDP exposes the nine ordered Shopify sizes and USD 128–134 pricing, with the customer checkout action enabled. No new cart, payment, order, or fulfillment event was created during this final visual pass.
- `www.carlophillips.com` remains HTTP 200 on the separate production deployment `dpl_D1qQH41QHZ2fgJnhFzYjkfvJU7Yp`, created five days earlier. No production alias or deployment changed.

Additional deployed evidence:

- `preview-home-direct-1280x720.jpg`
- `preview-shop-direct-1280x720.jpg`
- `preview-pdp-direct-1280x720.jpg`
- `preview-home-mobile-390x844.png`
- `preview-shop-mobile-390x844.png`
- `preview-pdp-mobile-390x844.png`
- `preview-home-mobile-release-390x844.png`
- `preview-pdp-mobile-checkout-390x844.png`
- `preview-pdp-mobile-purchase-390x844.png`

## Known limitations

- The Hoodie currently has two truthful Shopify product images, not a complete premium campaign asset set.
- Apliiq provider-side product/design/variant mapping remains unverified because the provider session is signed out.
- No payment, order, fulfillment, production deployment, or production-domain change is part of this evidence package.

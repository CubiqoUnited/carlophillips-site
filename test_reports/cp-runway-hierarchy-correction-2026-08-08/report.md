# CP two-stage runway hierarchy correction

Date: 2026-08-08
Branch: `codex/cp-shopify-poc-audit`
Scope: opening campaign hero, Hoodie runway scroll panel, category order, local verification, and corrected Preview preparation.

## Product Owner correction

The wide coastal runway campaign must be the landing view. The existing Signature Hoodie model sequence must remain, but appear in the next full-screen panel on scroll. Product categories follow that Hoodie panel.

## Source asset

- Selected supplied reference: `codex-clipboard-480b3ce6-251f-4024-9568-9a462f6663a5.jpg`.
- Repository path: `public/campaigns/lofoten-runway-hero.jpg`.
- Dimensions: 1672×941.
- SHA-256: `9a0d10f2835ac0019cf8793ede450256b9226c896dd648f046b7b01360d67090`.
- The image contains no baked-in web controls. The site renders its headline, navigation, and scroll cue as responsive live HTML.
- This is approved brand campaign media, not product, material, fit, variant, or fulfillment proof.

## Implementation

1. A full-viewport CARLOPHILLIPS campaign opens the site with the approved coastal runway art, sparse brand line, `At the edge of life.` headline, and a scroll link.
2. The existing gated three-frame Signature Hoodie runway is the next full-screen panel.
3. The sticky category rail follows the Hoodie panel. Hoodies is active only when that product is eligible; Shirts, Outerwear, Bottoms, and Accessories remain disabled.
4. Denied product decisions still receive the campaign landing but cannot leak Hoodie runway media, a product link, or an active category.

## Automated verification

- Focused home/route suites: 12/12 passed.
- Full `yarn verify`: passed.
- Lint: zero warnings.
- Tests: 33 files / 323 tests passed.
- Production dependency audit: zero vulnerabilities across 193 packages.
- Build: successful optimized Next.js 15.5.21 build across 12 routes.

## Local browser verification

- Desktop 1440×1000: first panel starts at 0 and spans the viewport; Hoodie panel follows; categories follow the Hoodie; campaign and Hoodie imagery decoded; zero broken images, horizontal overflow, runtime-error text, or console errors.
- Mobile 390×844: campaign crops to the lead model/mountain while keeping the headline clear; anchor scroll places the Hoodie panel below the 64px navigation; category rail pins below navigation with Hoodies active and four disabled categories; zero broken images, overflow, or runtime-error text.
- Browser console contained only the standard local React DevTools informational message.

## Local visual evidence

- `test_reports/cp-media-expansion-2026-08-08/runway-hierarchy-local-desktop.png`
- `test_reports/cp-media-expansion-2026-08-08/runway-hierarchy-local-product-scroll.png`
- `test_reports/cp-media-expansion-2026-08-08/runway-hierarchy-local-mobile.png`
- `test_reports/cp-media-expansion-2026-08-08/runway-hierarchy-local-mobile-product-scroll.png`
- `test_reports/cp-media-expansion-2026-08-08/runway-hierarchy-local-mobile-categories.png`

## Deployment state

The earlier one-stage Preview is superseded. Corrected commit `ae57e29` was pushed to the temporary branch and deployed as Vercel Preview `dpl_42uuiSoQqUyNnhJBbf35smBsud2n`:

`https://carlophillips-site-3qgjsckgg-adityas-projects-261b17a9.vercel.app`

Vercel reports `READY` and target Preview. Direct desktop and mobile checks reproduce the local campaign → Hoodie → categories order with decoded media, zero overflow, no broken images, and no runtime or console errors. The Hoodie PDP displays its current title, USD 128 price, XS–5XL range, and enabled `Buy with Shopify — $128` boundary. No checkout click, payment, or order was performed.

### Preview visual evidence

- `test_reports/cp-media-expansion-2026-08-08/runway-hierarchy-preview-desktop.png`
- `test_reports/cp-media-expansion-2026-08-08/runway-hierarchy-preview-product-scroll.png`
- `test_reports/cp-media-expansion-2026-08-08/runway-hierarchy-preview-mobile.png`
- `test_reports/cp-media-expansion-2026-08-08/runway-hierarchy-preview-mobile-product-scroll.png`
- `test_reports/cp-media-expansion-2026-08-08/runway-hierarchy-preview-mobile-categories.png`

Production has not changed. Product Owner review of this exact Preview is required before any merge or Production deployment.

# CP Signature Hoodie premium-showcase gap report

Date: 2026-08-08  
Branch: `codex/cp-shopify-poc-audit`  
Scope: Preview showcase bridge only; no production deployment, purchase, order, fulfillment, theme change, or fake media.

## Why the POC did not reach the requested showcase level

The site had the correct sparse, full-height premium layout and live Shopify commerce, but the Hoodie supplied only two plain product images. Existing Modelize outputs were still candidate evidence, the factual gallery correctly required release-bound media, and there was no separate disclosed editorial-study treatment. Spin Studio also had no genuine angle set or GLB, so a real 360/3D experience could not be truthfully produced. In short: the structure existed; the media pipeline and presentation binding were incomplete.

## Live embedded-app findings

- **Modelize:** existing job `#137843f7` contains three outputs. The chair and flat-lay outputs were selectively published on 2026-08-08 at 02:40 PM; the artifacted close-up stayed unpublished. Shopify Admin then visibly showed four Hoodie media items. Free allowance is exhausted at 3/3. Observed paid plans begin at $19/month; no paid plan was accepted.
- **Spin Studio:** installed. Free plan covers one product, but setup requires 16–24 real angle photos or a GLB model. Neither is available. The app's Shopify-theme embed is not the same as a headless Next.js integration.
- **MyDesigns:** opening the app led to a Shopify request to update Online Store Theme data access. That permission was not granted because it does not directly solve the headless showcase gap.
- **MODA candidate:** the official listing advertises 20 AI photos free, two free styled products, 10 multi-angle images from one input, and short video. The authenticated Install action did not advance, so it remains uninstalled and no permissions were granted. Official listing: https://apps.shopify.com/moda-ai
- **Modelize reference:** https://apps.shopify.com/modelize

## Implemented bridge

- Keep the release-bound Shopify media as the product-fact gallery.
- Add two cinematic, full-height editorial panels after product details.
- Label the experience `Digital editorial study` and every asset `AI-assisted preview`.
- State that garment details must be checked against the Shopify product views.
- Gate the section to Preview plus the exact `carlophillips-signature-hoodie` handle.
- Keep it absent from production, other products, and the quarantined artifact path.

## Verification

- Focused component suite: 6/6 passed.
- Full `yarn verify`: passed — zero-warning lint, 33 files / 320 tests, zero production vulnerabilities across 193 packages, and a successful 12-route optimized build.
- Vercel deployment: `dpl_EW1QFnaYqcqSwx8Euwcir6Diy9t8`, target `preview`, READY.
- Preview URL: `https://carlophillips-site-a3odjms8n-adityas-projects-261b17a9.vercel.app`.
- Direct Hoodie checks at 1280×720 and 390×844: HTTP 200; exact viewport width; no horizontal overflow; both editorial images decoded at 928×1152 after normal lazy-load scrolling; disclosure and both `AI-assisted preview` labels present; zero console/page errors; quarantined asset absent.
- Visual comparison: the earlier Preview evidence under `test_reports/cp-premium-hobby-preview-2026-08-08/` ends after the restrained product facts and two-image Shopify gallery. The new full-page and per-panel captures in this folder add the missing cinematic scroll while preserving that product-truth section.
- Production boundary: Vercel inspection reports target `preview`; `https://www.carlophillips.com/` continues returning from its existing production route and was not repointed.
- Git boundary: commit `c27f89d` was pushed to the authorized fork. The canonical organization remote rejected the current GitHub identity with HTTP 403; no canonical branch changed.

Durable visual evidence includes `shopify-four-media.png`, full-page deployed PDP captures, and individual desktop/mobile captures for both editorial studies. The authenticated Shopify product tab was preserved after capture.

## Truthful limitations and next choices

This bridge creates a visibly stronger editorial scroll without claiming the generated imagery is physical-product evidence. A true 360/3D view still needs genuine source angles or a GLB. Additional Modelize generation requires a separately approved paid plan. MODA could add zero-subscription trial capacity for multi-angle/model/video experiments, but it must first be installed after a human permission review. None of those future assets should enter production until their exact provenance, quality, and product fidelity are reviewed.

# CP Signature Hoodie end-to-end POC checkpoint

Date: 2026-08-04
Branch: `codex/cp-shopify-poc-audit`
Scope: reuse the installed Shopify app evidence to advance the real Hoodie presentation without Shopify writes, charges, deployment, or publication.

## Outcome

The authenticated Modelize app exposed a completed three-image Signature Hoodie job. The original-resolution files were recovered read-only and recorded in the release media manifest. Two usable generated candidates now render through the local, explicitly non-commerce storefront fixture:

- product portrait/front view;
- industrial editorial-chair still.

The embroidery/detail output has a visible white block/layout artifact. It is preserved outside the public web root as quarantined evidence and cannot enter the storefront.

The local homepage hero receives media only from the visible release-policy product summary. If the product decision is denied, no product or media payload reaches the hero. The PDP continues to label every candidate and disables all size and purchase controls.

## Browser evidence

- `home-desktop.png`: direct local desktop home; Modelize portrait hero, local-fixture label, release counts.
- `pdp-desktop.png`: direct local desktop PDP; two Modelize candidates plus recorded Apliiq front candidate, all approval-pending.
- `home-mobile-390x844.png`: direct in-app-browser viewport override, not a proxy or iframe.
- `pdp-mobile-390x844.png`: direct 390×844 PDP.

Assertions observed on both viewports:

- no horizontal overflow (`scrollWidth === clientWidth`);
- every expected image completed with a non-zero natural width;
- no console warning/error;
- all size controls and `Purchasing disabled` remained disabled;
- no enabled button, add-to-cart action, or checkout action appeared.

## Automated verification

`yarn verify` passed:

- ESLint: zero warnings;
- Vitest: 32 files, 309 tests passed;
- production dependency audit: zero vulnerabilities, 193 packages audited;
- Next.js 15.5.21 production build: success, 11 routes.

## End-to-end gaps and exact resume points

1. **POD truth:** the separate Apliiq provider session is at sign-in. Product Owner signs in and says `Apliiq open`; resume with a read-only exact Hoodie design/product/variant mapping observation.
2. **Model/on-model generation:** Modelize shows 3/3 free images used. Product Owner must approve an exact displayed plan/credit cost before any new generation. No charge was accepted.
3. **Spin/360 and 3D:** Spin Studio is installed but disabled and no Hoodie spin/3D asset was observed. Resume only after exact setup/export and any cost are approved. Do not fake these modalities.
4. **Video:** no exact-product clip was observed. A real asset or an explicit approved infeasibility record is required; still-image animation is not evidence.
5. **Shopify/storefront truth:** current Headless/Storefront product-read and cart capability are not proven with release-bound live observations. No fixture may enter Preview or production.
6. **Publishing:** Vercel Preview requires staged release evidence and explicit approval. Production additionally requires approved `main`, released Shopify truth, media coverage, cart/checkout/rollback verification, and explicit Product Owner approval.

## Production impact

None. No Shopify product/app setting, order, fulfillment, plan, billing, Vercel deployment, Git remote, PR, `main`, or production state was changed.

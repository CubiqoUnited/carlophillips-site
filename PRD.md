# CARLOPHILLIPS Product Requirements

Status: working product definition, not a production-readiness claim. Updated 2026-07-22.

## Objective

CARLOPHILLIPS is the first proof of concept for a reusable premium POD commerce system. The experience layer is Next.js; Shopify remains commerce truth; approved POD providers supply manufacturable products and fulfillment mappings. The target is one repeatable, observable product path before catalog-scale automation.

## Required customer path

1. A customer sees an approved product and truthful media in the Next.js storefront.
2. Product title, variant, price, availability, and media resolve from Shopify.
3. Variant selection creates or updates a Shopify cart.
4. Checkout redirects to Shopify Checkout.
5. A test order proves payment, POD handoff, fulfillment, tracking, support, and returns in an approved non-production or controlled production exercise.

No fallback mock product or local-only cart may masquerade as a successful boundary in this path.

## Experience requirements

- Original CARLOPHILLIPS identity with fullscreen, editorial, product-first presentation.
- Responsive desktop and mobile behavior, keyboard access, useful alt text, and explicit loading/error/unreleased states.
- Shopify-native image, video, external-video, and 3D records may be rendered when real approved assets exist.
- Spin/360, AR, try-on, on-model, campaign, and product-film claims stay absent until their source assets and rights are verified.

## Release gates

- Products are hidden by default.
- Draft review requires both `NEXT_PUBLIC_SHOW_PRODUCTS=true` and `NEXT_PUBLIC_PREVIEW_DRAFT_PRODUCTS=true`.
- A preview is not approval to publish, sell, deploy to production, or change Shopify state.
- Production requires Product Owner approval plus direct evidence for domain, product/variant truth, checkout, payment, POD mapping, fulfillment, tracking, support, and returns.

## Product-scope decision required

The Product Owner must choose the immediate delivery lane; this repository does not choose it automatically.

| Lane | Evidence available | Primary benefit | Primary risk / cost |
|---|---|---|---|
| Signature Hoodie POC | Real Apliiq design facts, Shopify draft identity, local gated review page, partial truthful media | Proves one end-to-end release path with bounded scope | Does not restore the broader storefront; media and operational proof remain incomplete |
| Broader 12-product catalog | Prior Shopify audit recorded 12 products and image-only media; dormant product/cart modules exist | Restores breadth sooner | Multiplies media, variant, POD-mapping, and release-QA work before one path is proven |

Decision requested: prioritize **one-product proof** or **12-product catalog restoration**. Until decided, safe shared infrastructure and evidence work may continue, but catalog publication and product activation remain blocked.

## Acceptance criteria

- Governance, status, tasks, architecture, setup, and environment documentation agree with runtime behavior.
- Yarn install is reproducible; lint, automated tests, and production build pass.
- The selected product lane uses Shopify-backed product/variant/cart data without silent commerce fallbacks.
- Local desktop/mobile browser evidence exists with no relevant console errors.
- Preview and production are separately configured and tested.
- External human actions and exact code resume points are recorded.

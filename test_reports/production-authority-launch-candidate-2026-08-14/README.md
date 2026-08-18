# Production authority launch candidate QA

Candidate: `dpl_Cjv49KJ7H3eJYTdq8y58BY34hzNQ`  
Source: canonical merge `9e23189587c340f88b8b5ec27c7ab434e5c61b25`  
Disposition: **NO-GO; do not promote**

The staged Production-semantics candidate was deployed with `--skip-domain`, `COMMERCE_DATA_MODE=shopify`, and `SHOPIFY_CART_UI_ENABLED=false`. The CARLOPHILLIPS apex and `www` aliases remained on rollback anchor `dpl_2s61reh2JATSRMCYfXYHnFnXT2bH`.

HTTP smoke checks passed for `/`, `/shop`, `/collections`, the Signature Hoodie PDP, `/bag`, all three policy routes, `robots.txt`, and `sitemap.xml`. The PDP contained `Selection disabled` and `Purchasing disabled`, with no checkout continuation or enabled submit form.

Headless Chromium audited seven routes at 1440×1000 and 390×844. Thirteen route/viewport results had no automated violation. The Production-only Hoodie PDP failed at both viewports because `.cp-commerce-explanation` resolved to `#595959` on black: 2.99:1 instead of 4.5:1. There were no console errors, horizontal overflows, or pre-consent analytics requests.

The candidate was rejected before promotion. The correction uses a dedicated component colour bound through the canonical Primitive → Semantic → Component token direction; it does not weaken global subtle-text styling or commerce gates.

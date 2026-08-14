# Through-and-through architecture browser QA — 2026-08-14

Local-only Draft-fixture verification for the definitive Headless + PODPIPE
implementation. Chromium ran headlessly/offscreen at `127.0.0.1`; no Shopify,
Vercel, domain, checkout-provider, or Production service was contacted or
mutated.

## Result

- Home passed at 390×844, 584×486, 768×1024, and 1440×1000.
- Canonical Product Review passed at 390×844 and 1440×1000.
- Collection passed at 768×1024.
- Legacy `/products/[handle]` redirected to canonical `/product/[handle]`.
- Removed `/concept-preview` returned the expected HTTP 404. Its browser
  resource message is expected 404 evidence, not an application error.
- Every rendered route had zero horizontal overflow, broken images, framework
  overlays, page exceptions, failed requests, and customer checkout copy.
- Local checkout POST returned HTTP 409
  `PRODUCT_RELEASE_NOT_RELEASED`, with no redirect.
- The MediaViewer trigger is intentionally absent in the current Draft because
  the Media Registry has zero approved storefront bindings. Unit/contract tests
  cover its twelve-view cap, controls, and approval filter; browser evidence
  must not manufacture media eligibility.

## Visual comparison

The fresh storefront screenshots were compared with the fresh Storybook
control-room evidence. Both retain the approved near-black/off-white palette,
light editorial display hierarchy, deliberate spacing, muted rules, and compact
uppercase navigation. Mobile and compact compositions reflow without clipping
or drift. The Product Review truthfully displays an empty approved-media state,
local-fixture label, disabled purchasing, and no checkout CTA.

Machine-readable route results are in `browser-results.json`.

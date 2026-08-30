# Staging integration visual QA — 2026-08-30

## Scope and verdict

The integrated monorepo candidate passes local layout validation at desktop and
mobile widths. This is **layout-only evidence**, not Shopify product or release
evidence: the local fixture is intentionally labeled and exposes zero Shopify
images. Live canonical-staging validation remains required after the immutable
candidate is deployed.

## Automated browser result

- Target: local production build on `127.0.0.1:3000`.
- Method: headless Playwright fallback because the preferred `agent-browser`
  binary was unavailable.
- Viewports: desktop and mobile.
- Routes: home, product review, and checkout rehearsal.
- Result: all six captures returned HTTP 200 with meaningful body content.
- Browser health: no error overlay, horizontal overflow, console errors, page
  errors, or non-benign request failures.
- Checkout rehearsal copy explicitly states that no cart, order, inventory,
  fulfillment, customer, or payment write occurred.

Machine-readable evidence is in `local-browser-evidence.json`.

## Visual comparison

The canonical staging baselines are:

- `../canonical-staging-audit-2026-08-29/desktop-canonical-before-gallery.png`
  at 1440 × 1000.
- `../canonical-staging-audit-2026-08-29/mobile-canonical-before-gallery.png`.

The integrated local candidate introduces the approved editorial campaign
opening and the monorepo product-review layout. Its fixture product page is
deliberately different from canonical staging: it shows fixture copy,
`0 IMAGES`, and `Purchasing disabled`, while canonical staging shows reviewed
Shopify copy and populated media. This difference is expected locally and must
not be interpreted as product, media, checkout, or release parity.

## Captures

- `desktop-home.png`
- `mobile-home.png`
- `desktop-product.png`
- `mobile-product.png`
- `desktop-checkout-rehearsal.png`
- `mobile-checkout-rehearsal.png`

## Remaining acceptance evidence

After the candidate commit is deployed to the single canonical Preview target,
repeat the desktop/mobile comparison against `staging.carlophillips.com`, verify
the current Shopify observation and media order, exercise the no-write Preview
checkout rehearsal, and bind that exact deployment evidence to the Product
Release Record. Production remains governed independently by the Released-state
and live commerce capability requirements.

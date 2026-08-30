# Canonical staging post-merge visual QA

- Target: `https://staging.carlophillips.com`
- Canonical staging commit: `3c2b6fee8a6adcf9da815370e378ee4dd1f6ca81`
- Captured: `2026-08-30T09:46:55.001Z`
- Method: background/headless Chrome; no foreground window or customer data
- Viewports: desktop `1440×1000`, mobile `390×844`

## Result

All six route/viewport combinations returned HTTP 200 with zero console errors,
page errors, failed requests, runtime error overlays, or horizontal overflow.

The home route exposed the reviewed `$128` Shopify price, `VIEW GALLERY 12
IMAGES`, and two playable video controls. The product route exposed all twelve
observed Shopify media controls, reviewed S/M/L selections, and the checkout
rehearsal CTA. The Preview checkout confirmation remained a no-payment staging
rehearsal.

The screenshots preserve the approved snap-scroll design system and were
visually compared with the prior canonical staging desktop/mobile baseline in
`test_reports/canonical-staging-audit-2026-08-29/`.

## Evidence

- `local-browser-evidence.json`
- `desktop-home.png`
- `mobile-home.png`
- `desktop-product.png`
- `mobile-product.png`
- `desktop-checkout-rehearsal.png`
- `mobile-checkout-rehearsal.png`

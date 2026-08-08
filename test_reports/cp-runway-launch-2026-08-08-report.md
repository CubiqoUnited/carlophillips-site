# CP runway landing launch report

Date: 2026-08-08
Branch: `codex/cp-shopify-poc-audit`
Scope: runway-led landing page, category navigation, responsive verification, and controlled Preview-to-production launch.

## Product Owner direction

The Signature Hoodie is the active product. Customer-facing copy should present the strongest product story supported by the available imagery and material understanding without discussing internal provider verification, AI-texture caveats, or pipeline jargon. Internal evidence and source boundaries remain preserved.

The reusable final showcase and repeatable POD workflow are saved as the approved local note `podpipe` in `PROJECT-NOTES.md`.

## Reference comparison

Fresh background captures of Vollebak and Zara were reviewed for composition only. The relevant shared patterns are full-bleed campaign media, sparse overlay navigation, minimal copy, strong typography, and scroll-led sequencing. CARLOPHILLIPS uses none of their brand assets or copy.

- `test_reports/cp-media-expansion-2026-08-08/reference-vollebak-home-2026-08-08.png`
- `test_reports/cp-media-expansion-2026-08-08/reference-zara-home-2026-08-08.png`

## Implementation

- The landing page uses three existing curated Signature Hoodie MODA frames as a restrained 15-second runway sequence.
- The complete model remains visible through `object-contain`; a blurred background layer supplies full-viewport depth without cropping the garment.
- Runway media is unavailable when the catalog withholds the Hoodie. Production additionally requires the approved commerce decision.
- The hero now uses direct product copy and links to the eligible Hoodie PDP.
- A sticky category rail appears after the hero. Hoodies is the sole active link; Shirts, Outerwear, Bottoms, and Accessories are non-interactive and greyed out.
- Reduced-motion users receive a static first runway frame.

## Verification

- Focused home/route suites: 10/10 passed.
- Full `yarn verify`: passed — zero-warning lint, 33 files / 322 tests, zero production vulnerabilities across 193 packages, and a successful 12-route optimized build.
- Desktop 1440×1000: three runway frames, Signature Hoodie headline/CTA, decoded imagery, active Hoodies category, four disabled categories, no horizontal overflow, and no runtime error text.
- Mobile 390×844: three runway frames, complete model composition, active/disabled category states, zero broken images, document width equal to viewport width, and no runtime error text.
- The first mobile pass exposed a 12-pixel overflow from the long product title. Responsive min-width, title sizing, and category clipping were corrected before the final captures.

## Durable visual evidence

- `test_reports/cp-media-expansion-2026-08-08/runway-home-local-desktop.png`
- `test_reports/cp-media-expansion-2026-08-08/runway-home-local-categories.png`
- `test_reports/cp-media-expansion-2026-08-08/runway-home-local-mobile.png`
- `test_reports/cp-media-expansion-2026-08-08/runway-home-local-mobile-categories.png`
- `test_reports/cp-media-expansion-2026-08-08/runway-home-preview-desktop.png`
- `test_reports/cp-media-expansion-2026-08-08/runway-home-preview-categories.png`
- `test_reports/cp-media-expansion-2026-08-08/runway-home-preview-mobile.png`
- `test_reports/cp-media-expansion-2026-08-08/runway-home-preview-mobile-categories.png`

## Launch state

Initial Previews exposed and closed the stale browser title and transparent-navigation contrast defects. Final Preview `dpl_3ULFvNePT3iS25Dzh6aRwKZBE8z5` is READY at `https://carlophillips-site-p92xlobf4-adityas-projects-261b17a9.vercel.app` with target `preview`.

Direct desktop/mobile Preview checks confirm the Signature Series title, three runway frames, active Hoodies and four disabled categories, opaque `rgba(0, 0, 0, 0.8)` header and `rgba(0, 0, 0, 0.95)` category rail over the light product section, zero broken images/overflow/runtime error text, and active Shopify checkout on the Hoodie PDP. Production has not yet changed. Next: merge the verified candidate through canonical `main`, deploy Production, and repeat the live-domain checks.

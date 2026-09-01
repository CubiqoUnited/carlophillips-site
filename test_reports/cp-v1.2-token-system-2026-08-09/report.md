# CP v1.2 token-system evidence

Date: 2026-08-09

Branch: `codex/cp-runway-wording-design-system`

Baseline: local tag `v1.1` / commit `c6753b5`

## Outcome

The active site is now led by a semantic CARLOPHILLIPS token system. The approved v1.1 runway landing and `ONE` Signature Hoodie scene remain visually intact. Collection, product, bag, checkout controls, media viewer, and the recovered private concept route now consume the same presentation roles and shared chrome.

## Implementation evidence

- `app/globals.css` separates primitives from semantic colour, typography, spacing, layout, effect, and interaction roles.
- `components/storefront/storefront-header.jsx` centralizes collection, product, and bag chrome.
- Active customer components contain no raw black/white visual utilities, arbitrary hex colours, raw CSS colour functions, or one-off tracking utilities. `tests/storefront-design-system.test.js` enforces this boundary.
- `/concept-preview` remains `noindex`, visibly private/Draft-only, and does not change product or release truth.
- Customer-rendered text contains no commerce-provider name in any checked route.

## Automated QA

`yarn verify` passed:

- ESLint: zero warnings;
- Vitest: 35 files / 334 tests;
- production dependency audit: 0 vulnerabilities / 193 packages;
- Next.js 15.5.21 optimized build: 13 routes, including static noindex `/concept-preview`.

## Browser QA

The local server was started with the repository's explicit local-only fixture gates so the result could be compared fairly with the v1.1 Hoodie evidence. Headless Chrome directly checked:

- home landing and Hoodie scene at 1440×1000;
- Hoodie scene and inset media viewer at 390×844;
- shop at 1440×1000 and 390×844;
- product detail at 1440×1000 and 390×844;
- bag at 390×844;
- private concept at 1440×1000 and 390×844.

All 11 checks returned HTTP 200 with zero horizontal overflow, provider-name copy, broken images, console/page errors, or runtime/build overlays. The media viewer traversed and decoded all 11 slides. Computed styles resolved the semantic canvas, copy, gutter, header, and section tokens on every route. Structured results are in `browser-verification.json`.

## Visual comparison

The saved v1.1 reference `../cp-home-one-attribute-reposition-2026-08-09/screenshots/local-desktop-product.png` was compared directly with `screenshots/home-product-desktop-1440x1000.png`. The same `ONE` hierarchy, factual Color/Material/Feel attributes, model placement, upper-right media action, and black runway composition are preserved.

The v1.1 runway reference `../cp-home-one-overlay-2026-08-09/screenshots/desktop-landing.png` was compared with `screenshots/home-landing-desktop-1440x1000.png`. The campaign asset, headline, scroll cue, header, and viewport composition remain intact.

Additional reviewed evidence:

- `screenshots/home-product-mobile-390x844.png`
- `screenshots/home-overlay-mobile-390x844.png`
- `screenshots/shop-desktop-1440x1000.png`
- `screenshots/shop-mobile-390x844.png`
- `screenshots/product-desktop-1440x1000.png`
- `screenshots/product-mobile-390x844.png`
- `screenshots/bag-mobile-390x844.png`
- `screenshots/concept-desktop-1440x1000.png`
- `screenshots/concept-mobile-390x844.png`

Four concurrent full-page concept snapshots were also found and preserved at `../concept-preview-desktop.png`, `../concept-preview-desktop-final.png`, `../concept-preview-mobile.png`, and `../concept-preview-mobile-final.png`. All four decode, were visually inspected, and agree with the noindex Draft concept composition; none is referenced by runtime code.

## Boundaries

No push, pull request, Vercel deployment, Production promotion, domain change, product/provider write, publish, order, or billing action occurred. The existing Preview and Production deployments remain unchanged.

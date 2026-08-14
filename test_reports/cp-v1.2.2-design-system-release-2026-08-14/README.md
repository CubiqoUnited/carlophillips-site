# v1.2.2 verification evidence

Environment: local, gated non-commerce fixture at `http://127.0.0.1:3000`.

Method: background/headless Google Chrome through the bundled Playwright runtime. The mandated `agent-browser` launcher was not present on PATH or in the bundled runtime, so the equivalent bundled headless browser was used. No visible browser or focus-changing action occurred.

## Automated verification

- Yarn Classic 1.22.22 frozen install: pass.
- ESLint with zero warnings: pass.
- Vitest: 35 files / 343 tests: pass.
- Production dependency audit: 55 packages / zero vulnerabilities: pass after advancing the existing transitive `nanoid` resolution from 3.3.17 to patched 3.3.18.
- Next.js optimized build: 13 routes: pass.
- Repository audit: 884 reachable tokens, five used runtime dependencies, zero removed-path references, zero exact duplicate active code files, zero unused runtime dependencies, zero strong-pattern secret matches.
- CSS/source audit: zero raw active CSS declarations, zero primitive references from active CSS, zero dormant `cp-*` selectors, zero source inline styles/raw visual literals/arbitrary utilities/non-CP active classes.
- Asset audit: 26 public raster/SVG assets decoded or parsed, zero failures.

Machine-readable evidence:

- `browser-verification.json`
- `visual-comparison.json`
- `repository-audit.json`
- `asset-audit.json`

## Browser acceptance

At 1440×1000, 584×486, and 390×844:

- `/`, `/shop`, `/products/carlophillips-signature-hoodie`, and `/bag` return HTTP 200;
- exact approved hero asset/copy, persistent header, lower-left `ONE`, four tags, and `12 views` render;
- the viewer is inset with the exact saved baseline geometry and locks body scroll;
- all 12 media assets decode and retain truthful disclosures;
- navigation and media-dialog focus containment, Escape, focus return, background isolation, scroll lock, arrow navigation, and mobile touch swipe pass;
- reduced motion resolves campaign, scroll, runway, and image transition motion to `none`/`0s`, with automatic scrolling;
- zero horizontal overflow, framework overlays, provider-name customer leakage, console errors, page errors, request failures, broken images, or broken videos.

## Screenshot matrix

The `screenshots/` folder contains 21 captures:

- `desktop-*`: 1440×1000;
- `compact-*`: 584×486;
- `mobile-*`: 390×844;
- states: `home-hero`, `home-menu`, `home-one`, `home-overlay`, `shop`, `pdp`, and `bag`.

## Saved-baseline comparison

Baseline: `test_reports/cp-home-one-overlay-2026-08-09/`, produced from the `bb9568f` implementation.

Acceptance criteria and result:

1. Exact viewport dimensions: pass.
2. Exact overlay geometry: pass at all viewports (`1280×896 @ 80,52`; `537.265625×439.265625 @ 23.359375,23.359375`; `358.796875×812.796875 @ 15.59375,15.59375`).
3. Exact hero asset/copy/header composition: pass. Normal animation timing produces low normalized mean absolute pixel error of 0.0061–0.0095.
4. Exact lower-left product hierarchy, reviewed description, four approved tags, and action placement: pass. Product-image pixel variance reflects the same normal 15-second runway sequence at different capture instants; keyframes, three delays, fit, position, scrim, copy geometry, and content are source-bound. The required view count is 12 rather than the saved local baseline's 11.
5. Exact decoded inset-viewer composition: pass. Normalized mean absolute pixel error is 0.0004–0.0005; remaining pixels are browser rasterization/timing noise.
6. Manual inspection of all side-by-side home states and all route contact sheets: pass; no unintended layout, hierarchy, crop-rule, typography, disclosure, or responsive regression observed.

Comparison artifacts are under `comparisons/`, including `baseline-contact-sheet.png`, `route-contact-sheet.png`, per-state side-by-side images, and amplified diff images.

The follow-up live-Production role/geometry matrix and its screenshot pairs are under `../cp-v1.2.2-production-parity-correction-2026-08-14/`.

## Remaining boundary

This local evidence does not itself claim Production verification, live Shopify/catalog mutation, or checkout/payment/order proof. Immutable Vercel Preview evidence and independent parity review are separate release gates recorded on corrected PR #9; superseded PR #8 was not promoted to Production. Production remains unchanged until the corrected gates and canonical-main verification pass.

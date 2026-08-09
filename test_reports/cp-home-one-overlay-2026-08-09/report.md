# CP homepage `ONE` and inset-media correction

Date: 2026-08-09  
Branch: `codex/cp-runway-wording-design-system`  
Scope: homepage visual hierarchy and in-page media presentation only

## Outcome

The landing uses the exact newly supplied runway image, not the earlier crop. The second scene now names the first product `ONE`, keeps its factual Hoodie description compact and left aligned, restores useful product tags, and opens media in a centered overlay card rather than visually replacing the page.

`ONE` is a homepage campaign display name only. The Signature Hoodie remains the exact product title and handle in the PDP, release record, variant/price data, cart policy, and checkout boundary.

## Product Owner annotations closed

1. Removed the visible `Signature Hoodie` heading from the homepage scene and replaced it with `ONE`.
2. Kept `Signature Series / 001` as the collection index while `ONE` is the product name.
3. Reduced the copy to the first reviewed sentence and constrained it through `--cp-product-copy-width`; it is exactly three rendered lines at 584×486 and 390×844.
4. Restored meaningful fact tags: `Black`, `XS–5XL`, `Heavyweight fleece`, and `CP embroidery`.
5. Removed the arrow from the eligible media action.
6. Added a four-way expand icon between `Explore media` and the live view count.
7. Converted the media viewer into an inset, bordered, shadowed card over a dimmed/blurred page backdrop.

## Exact campaign asset

- Source dimensions: 1536×1024 PNG.
- Stored path: `public/campaigns/lofoten-runway-hero.png`.
- SHA-256: `2c42ff8fab50819522e7a6a8e48a51083e39b0e4fdbc41df13568446426ac338`.
- A deterministic test binds this exact digest so a different crop cannot silently replace it.

The asset is campaign presentation. It is not treated as Hoodie product, fit, material, fulfillment, or commerce evidence.

## Visual comparison

- Previous product scene: `test_reports/cp-home-simplification-2026-08-08/local-desktop-03-hoodie.png` — long `Signature Hoodie` title, broad paragraph, arrow action, no factual tags.
- Corrected product scene: `screenshots/desktop-product.png`, `screenshots/compact-product.png`, and `screenshots/mobile-product.png` — short `ONE` title, compact reviewed sentence, useful facts, and expand control.
- Previous viewer: `test_reports/cp-home-media-overlay-2026-08-08/local-desktop-overlay-01.png` — full-screen presentation.
- Corrected viewer: `screenshots/desktop-overlay.png`, `screenshots/compact-overlay.png`, and `screenshots/mobile-overlay.png` — visible inset margins and retained page context.
- Corrected landing: `screenshots/desktop-landing.png`, `screenshots/compact-landing.png`, and `screenshots/mobile-landing.png` — exact supplied runway frame with responsive left-side live text.

## Automated verification

`yarn verify` passed:

- ESLint with zero warnings;
- 35 test files / 333 tests;
- zero production dependency vulnerabilities across 193 packages;
- successful Next.js 15.5.21 optimized build with all 12 routes.

The first sandboxed audit attempt could not resolve `registry.yarnpkg.com`. The same full command was rerun with permitted network access and passed; this was an execution-environment restriction, not a project failure.

## Browser verification

Headless background Chrome checked 1440×1000, exact 584×486, and 390×844. Every viewport returned HTTP 200, loaded the exact PNG path, rendered `ONE`, showed all four facts, used the expand icon without an action arrow, and had no horizontal overflow, framework overlay, console error, or page error.

The overlay panel remained smaller than the viewport at every size:

- desktop: 1280×896 at x=80/y=52;
- compact: 537.27×439.27 at x=23.36/y=23.36;
- mobile: 358.80×812.80 at x=15.59/y=15.59.

Body scroll locked while open and focus returned to the media trigger after close. Structured results are in `verification.json`.

## Vercel Preview

- URL: `https://carlophillips-site-hc2b2lput-adityas-projects-261b17a9.vercel.app`
- Deployment: `dpl_GG8FyXjPuUqyom2vwsYUunGGTggU`
- Target/status: Preview / READY
- Tested implementation commit: `bb9568f`

Direct deployed headless checks repeated 1440×1000, exact 584×486, and 390×844. The Preview renders the exact new PNG, `ONE`, the three-line compact/mobile product copy, all four fact tags, and a truthful `12 views` trigger. Its first product media decoded before capture; the overlay is inset at every size, focus returns after close, and no provider-name copy, horizontal overflow, runtime overlay, console error, or page error was observed. Deployed screenshots use the `preview-*.png` prefix in `screenshots/`.

Read-only Vercel inspection confirms Production remains READY on `dpl_BdasbDdxHCMruKdy7WSsrUibvcgK`. No alias or Production action occurred.

## Known limitation and safe boundary

The local fixture gallery contained 11 unique eligible frames during this check; a Preview can truthfully contain a different count when the release-eligible product media set differs. The control always displays the runtime count. The existing Motion Study remains disclosed still-derived motion, not genuine product video, 360, or interactive 3D.

No Shopify/provider state, order, billing, domain, `main`, or Production deployment changed. The only external state change was the authorized non-production Preview deployment above.

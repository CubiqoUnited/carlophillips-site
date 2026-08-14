# v1.2.2 Production-parity correction evidence

Candidate basis: exact PR #9 Preview DOM at head `55604acb90878a6973c8c13524608c2191577b64`, with this worktree's `app/design-tokens.css` and `app/globals.css` injected only into the ephemeral headless browser document. Baseline: live approved Production at `https://www.carlophillips.com`.

No candidate was pushed or deployed. The harness performed read-only navigation and opened the media overlay; it did not submit checkout, mutate Shopify, or change external state.

## Result

- 222/222 exact typography, wrapping, size, padding, width, height, and document-coordinate comparisons pass at 1440×1000, 584×486, and 390×844.
- All checked Production and candidate routes are healthy: zero overflow, framework/browser errors, broken images, or broken videos.
- Facts resolve to Production's 8px role and exact 30.796875px desktop / 106.765625px compact-mobile container heights.
- Commerce body, general/card actions, catalog labels/titles, PDP price/description/form/disclosure, Information title/copy/section, and Editorial title/copy/measure match their Production roles.
- Forty-eight captures form 24 same-dimension Production/candidate screenshot pairs for hero, `ONE`, overlay, shop, PDP, Information, Editorial, and bag across all viewports.
- Production animation and lazy-media insertion can change pixels and captured scroll frames. Per Sushma's scope control, that variance is accepted after decoded-media checks, 222 exact DOM-geometry checks, route health, and representative screenshot review pass; no further frame-timing iteration is required.

## Evidence

- `production-comparison.json`: machine-readable before/after metrics, health, and 222 acceptance results.
- `visual-comparison.json`: same-dimension pixel statistics and artifact paths.
- `screenshots/production/` and `screenshots/candidate/`: 48 source captures.
- `comparisons/`: 24 side-by-side images and 24 amplified diffs.
- `production-comparison.mjs` and `visual-comparison.py`: deterministic regeneration scripts.

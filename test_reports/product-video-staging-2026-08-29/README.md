# Canonical staging product-video QA — 2026-08-29

## Candidate

- Base branch: `origin/staging`
- Base revision: `b28e9c6`
- Feature branch: `codex/product-video-requirements-staging-20260829`
- Viewports: 1440 × 1000 and 390 × 844

## Verified requirements

- Fit & Silhouette is first; Runway Motion is second.
- Both autoplay muted and inline while the default product stage is visible.
- The complete sequence is Fit → Runway → Fit → Runway.
- Playback then holds the Runway final frame with a centred cream Play control.
- Play/Pause and media-overlay controls are cream (`#e7e0d2`).
- Progress is green (`#00a63b`).
- Three position dashes remain visible; the unavailable third position is disabled.
- The replay control is a 120 × 120 px cream circle.
- The mobile stage fits the viewport and keeps both controls visible.
- Browser console errors: none.

## Repository gates

- `yarn lint` — passed.
- `yarn verify:media-readiness` — passed; two of three product positions ready, 360 correctly withheld.
- `yarn test` — passed: 60 files / 590 tests.
- `yarn build` — passed with Next.js 15.5.21.

## Evidence

- `desktop-first.png`
- `desktop-complete.png`
- `mobile-first.png`
- `mobile-complete.png`
- `results.json`
- `verify-product-video.mjs`

The browser run used installed headless Chrome because Playwright's bundled Chromium lacks the H.264 codec required by these MP4 assets on this machine.

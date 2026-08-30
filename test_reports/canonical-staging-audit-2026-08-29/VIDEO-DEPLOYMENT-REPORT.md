# Canonical Staging Product Video Deployment — 2026-08-29

## Outcome

The product-video requirements are merged into the canonical `staging` branch and live at `https://staging.carlophillips.com/#signature-runway`.

## Version records

- Pull request: `https://github.com/CubiqoUnited/carlophillips-site/pull/24`
- Feature commits: `08f69d6`, `1cc6572`
- Staging merge commit: `4b4eadc474298e5b15a5a20489570179785cf92d`
- Canonical staging deployment: `https://carlophillips-site-juizt35v2-cubiqo-projects-d7156840.vercel.app`
- Deployment ID: `dpl_C4wBnyF6n5Z8HXxqJuWSxy43w5jB`
- Preserved prior user preview: `https://carlophillips-site-iy2jf6ot1-cubiqo-projects-d7156840.vercel.app` (`dpl_BTaaPtvou3qrEKuExzaFZeAekjPq`)

## Implemented requirements

- Fit & Silhouette is product video position 1.
- Runway Motion is product video position 2.
- Both videos autoplay muted and inline on the default product stage.
- The complete Fit → Runway sequence runs twice.
- The second sequence stops on the final Runway frame and displays a centered Play control.
- Controls use design-system tokens: cream Play/Pause and media-overlay controls, green progress, and three cream position dashes with the unavailable third position disabled.
- The centered replay control is a 120 × 120 px cream circle with a cream Play icon.
- Mobile sizing keeps Play/Pause, progress, and the media-overlay control visible in the video stage.

## Verification

- `yarn lint` — passed.
- `yarn verify:media-readiness` — passed; Fit and Runway ready, 360 withheld.
- `yarn test` — passed: 60 files, 590 tests.
- `yarn build` — passed with Next.js 15.5.21.
- Accessibility and privacy audit — passed for 14 route/viewport combinations.
- GitHub Verify and Vercel Preview checks — passed.
- Canonical staging headless desktop 1440 × 1000 — all assertions passed.
- Canonical staging headless mobile 390 × 844 — all assertions passed.
- Browser console errors during product-video QA — none.
- Visual screenshot comparison — passed; controls are visible and aligned on desktop/mobile.

## Screenshot evidence

- `desktop-product-video-first.png`
- `desktop-product-video-complete.png`
- `mobile-product-video-first.png`
- `mobile-product-video-complete.png`
- Machine-readable live result: `product-video-canonical-staging-results.json`

## Environment boundary

`staging.carlophillips.com` resolves to preview deployment `dpl_C4wBnyF6n5Z8HXxqJuWSxy43w5jB`. Production remains on deployment `dpl_6D6ekBNhZLJwvcMZxCzUoZLQ2mzr`; no production deployment or promotion was performed.

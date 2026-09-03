# CARLOPHILLIPS Release Closure Evidence — 2026-09-02

## Repository

- Production application baseline: `main@7cbde6b43526428ec2dd40a1a9b9099a4364b2d6`
- Staging branch: `staging@ff011904e01b6e803239769cdbb302f89c508ec4`
- PRs #55 and #65: merged
- Local branches: `main`, `staging`
- Remote branches: `main`, `staging`
- Worktrees: `/Users/edv/Documents/cp`, `/Users/edv/Documents/cp-staging`
- Sole remote: `origin` → `CubiqoUnited/carlophillips-site`
- Recovery bundle:
  `/Users/edv/Documents/CARLOPHILLIPS-ARCHIVE-2026-09-02/git-precleanup-archive.bundle`
- Untracked-file archive:
  `/Users/edv/Documents/CARLOPHILLIPS-ARCHIVE-2026-09-02/untracked`

## Automated verification

- `yarn verify`: passed.
- Vitest: 77 files / 653 tests passed (17/73 shipped, 45/497 tooling,
  15/83 contracts).
- Playwright: 26/26 functional, accessibility, privacy, desktop and mobile
  visual tests passed after regenerating six inspected stale Darwin baselines.
- Lint, production-commerce lint, typecheck, stylelint, formatting, source
  boundaries, commerce contract, media readiness, Storybook and Next.js build:
  passed.
- Dependency audit: 0 vulnerabilities.

## Protected Staging

- Workflow run: `33708272754`
- Job: `100502059981`
- Exact source commit: `ff011904e01b6e803239769cdbb302f89c508ec4`
- Deployment: `dpl_7jwf7wZrgWdgi4wmNoGfSSGkDXDQ`
- Immutable URL:
  `https://carlophillips-site-2loyz0gbd-cubiqo-projects-d7156840.vercel.app`
- Review URL: `https://staging.carlophillips.com`
- Receipt artifact: `9876117774`
- Signed zero-PII webhook probe: passed.
- Eight Shopify subscriptions: registered and read back.

## Live Shopify Staging lifecycle

- Product: 12 READY media items, approved description, Black S/M/L, USD 128,
  25 units per size, test-only `CP-STAGING-*` SKUs, Headless published.
- Browser journey: custom homepage → PDP → test bag → Shopify-hosted checkout.
- Payment: Shopify Test Payment Gateway only; zero real charge.
- Order: test-mode, paid, initially unfulfilled; Shopify native confirmation
  timeline event recorded.
- Webhooks: seven POST requests reached the exact Staging deployment and
  returned HTTP 200; durable-store and replay behavior remain covered by the
  signed probe and shipped-code tests.
- Cleanup: Shopify native cancellation refunded the bogus transaction,
  restocked inventory, sent the synthetic cancellation notice, archived the
  order, and left net payment USD 0 / fulfillment not required.
- Apliiq: no mapping, app intake, provider job or fulfillment was triggered.

## Production incident and rollback

- Unintended post-merge deployment:
  `dpl_8fyW9UJDMMs97pTwV6F7w5aKfgHi` returned HTTP 500 at the public domains.
- Immediate rollback promoted verified checkout-enabled deployment
  `dpl_GTkysazmXPKnwK7rHGTYhaWVJYLZ`.
- Evidence-only PR #65 caused Vercel to start Production-target deployment
  `dpl_9v24z9tSApfdBy1qtL8hiQyFM7EE`; it was canceled while Building and never
  received the apex or `www` aliases.
- Final public health: `https://www.carlophillips.com` HTTP 200.
- Cubiqo project Git integration is disconnected: `link: null`,
  `gitRepository: null`, and `gitProviderOptions.createDeployments: disabled`.

## Vercel project disposition

- Canonical Cubiqo Production and protected Staging project:
  `team_Q25fvpJOPiIeoG3hfxtCVkhW` /
  `prj_9VHD0AhhQnuml8frfNDsmFLHXcq1`.
- Removed redundant Aditya project:
  `team_8ABMxicIAtMyzgNYsJawFad0` /
  `prj_i51hiKpEKrwaqblD2vaO6zhXUDCs`.

The root Vercel domain ownership and `staging.carlophillips.com` alias were
moved to Cubiqo only after the Cubiqo immutable deployment passed pre-alias
verification. The Aditya project was then verified to have no custom domain or
workflow dependency and deleted by exact project ID. `www` and apex remained
on Production deployment `dpl_GTkysazmXPKnwK7rHGTYhaWVJYLZ` throughout the
final convergence.

## Final visual evidence

- Absolute directory:
  `/Users/edv/Documents/CARLOPHILLIPS-ARCHIVE-2026-09-02/verification-2026-09-02/final-cubiqo-staging`
- Verified files: `desktop-home.png`, `desktop-pdp.png`,
  `desktop-pdp-fold.png`, `mobile-home.png`, `mobile-pdp.png`, and
  `mobile-pdp-fold.png`.
- Desktop viewport: 1440 px. Mobile viewport: 390 px.

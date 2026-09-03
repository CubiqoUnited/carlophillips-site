# CARLOPHILLIPS Release Closure Evidence — 2026-09-02

## Repository

- Production branch: `main@9f991c8bf4f1f1488e2772e8fe1f807aae28fdb1`
- Staging branch: `staging@09146d3521f0e2fbfc0283e7fab7e63597225c02`
- PR #55: merged
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

- Workflow run: `33707837695`
- Job: `100500743638`
- Exact source commit: `24cec94478fb5cd0ae68da436d1a594da29c7e48`
- Deployment: `dpl_DrP9kq8zMPjJttc1GekzG56WmXH9`
- Immutable URL:
  `https://carlophillips-site-ko2edpg6s-cubiqo-projects-d7156840.vercel.app`
- Review URL: `https://staging.carlophillips.com`
- Receipt artifact: `9875962864`
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
- Final public health: `https://www.carlophillips.com` HTTP 200.
- Cubiqo project Git deployment creation is disabled.

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

# Product Owner demo note

## What changed

The editorial detour is removed. The home page again follows the
production-aligned VOLLBAK-style direction from `9e1f5c3`: full-height black
composition, quiet navigation, restrained type, and a product/release-led
second stage. About, Lookbook, the shared editorial shell, and their stale
discovery entries are gone.

The later safety work remains: the server release decision owns visible
product counts and links; no mock catalog, fake product media, cart mutation,
checkout, or publish authority was restored.

## Checks passed

- `yarn verify`
- 309 automated tests across 32 files
- zero-warning lint
- zero production dependency vulnerabilities
- Next.js production build
- direct desktop 1440×1000 and mobile 390×844 browser checks
- no console warning/error, no mobile overflow, no purchase action
- `/about` and `/lookbook` return 404; `/shop` remains truthfully fail-closed

## Known limitations

- The visual-system board is an explicitly labeled archive reference, not
  approved product/media proof.
- Shopify product/cart/checkout, fulfillment, and release gates remain
  unproven and disabled.
- The production visual site is live, but Shopify product/cart/checkout credentials and the authenticated app-capability audit remain incomplete. Purchasing therefore remains disabled by design.

## Demo target

- Canonical PR: `https://github.com/CubiqoUnited/carlophillips-site/pull/3`
- Canonical `main` merge: `85b6f8f`
- Historical PR Preview/staging: `https://carlophillips-preview-oxwxl5u9g-adityas-projects-261b17a9.vercel.app`
- Production: `https://www.carlophillips.com` (HTTP 200); `https://carlophillips.com` redirects once to `www`.
- Production continues to follow canonical `main`; future staging remains immutable temporary-branch Vercel Preview only. The misleading permanent `carlophillips-preview.vercel.app` alias was removed.

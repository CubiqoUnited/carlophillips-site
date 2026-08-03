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
- Vercel deployment access remains disabled with HTTP 402.

## Demo target

- Candidate branch: `codex/restore-production-visual-direction`
- Candidate commit: the commit containing this note; use `git show HEAD`
- Preview/staging URL: not created in this task. Current Vercel access returns
  HTTP 402, and deployment was not authorized.
- Production: unchanged. It must continue to follow `main` only after explicit
  Product Owner approval.

# Current Status

Updated: 2026-07-22  
Branch: `codex/cp-fitness-baseline` from `425f50b`  
Canonical remote: `https://github.com/CubiqoUnited/carlophillips-site.git`

## Verified facts

- The active UI is a fail-closed editorial shell with an optional static Signature Hoodie staging preview.
- The Hoodie is recorded as Shopify Draft and purchasing is disabled in the UI.
- Shopify product/media/cart modules exist but are not connected to active route UI.
- Yarn 1.22.22 and `yarn.lock` are the declared package strategy; baseline work adds real lint and test commands.
- Local environment variable names are present; values were not printed. `.env.local` is ignored.
- Production and preview HTTP endpoints were diagnosed as `402 DEPLOYMENT_DISABLED` on 2026-07-22.
- Canonical `main` and `staging` were recorded at `d172cfb`; the Hoodie preview branch is at `425f50b`.

## Not yet proven

- A normal Corepack-provided `yarn` executable on this machine; verification used Yarn 1.22.22 bootstrapped through the bundled runtime, then proved a frozen install.
- Live Shopify-backed product and variant rendering.
- Browser add/update/remove cart flow and Shopify checkout redirect.
- Production domain availability after hosting restoration.
- Payment, POD order handoff, fulfillment, tracking, support, or returns.
- Any real product video, spin/360, 3D/AR, try-on, on-model, or lifestyle campaign asset.

## Cycle 1 verification

- Frozen Yarn install passed from a newly created dependency tree.
- ESLint passed with zero warnings.
- Vitest contract/unit suites passed.
- Next.js production build generated all 12 routes.
- Local desktop and mobile Hoodie fixture checks passed with no console errors or error overlays; the fixture source label was visible and purchasing remained disabled.
- Two unverified local detail images were removed from the public web root and quarantined under `fixtures/unverified-media/`.

## External blockers

### Vercel hosting disabled

Human action: the Product Owner or authorized Vercel account owner must restore deployment access for project `carlophillips-site` (or explicitly approve another hosting path).

Resume point: deploy the approved fitness branch as a Vercel preview, configure preview-only environment values, then run desktop/mobile browser, console, network, and HTTP evidence against that preview. Do not promote production.

### Product scope decision

Human action: choose Signature Hoodie one-product proof or 12-product catalog restoration using the reconciliation in `PRD.md`.

Resume point: implement Shopify-backed routes, release records, and tests for the selected lane. Do not publish or activate products.

### Production and commerce operations

Human action: separately approve any Shopify catalog mutation, checkout/order test with operational impact, main-branch merge, or production promotion.

Resume point: execute only the specifically approved action, capture evidence without secrets/customer data, then update this status.

# Current Status

Updated: 2026-07-22  
Branch: `codex/cp-fitness-baseline` from `425f50b`  
Canonical remote: `https://github.com/CubiqoUnited/carlophillips-site.git`

## Verified facts

- The editorial UI remains fail-closed. The active product route now uses a dedicated server-rendered Commerce Gateway and reusable product component.
- The Hoodie is recorded as Shopify Draft and purchasing is disabled in the UI.
- Shopify product reads are connected behind a server-only adapter with explicit source/error states; local configuration currently reports Shopify as not configured, so a live product observation is still blocked.
- The versioned Hoodie release record binds the observed Shopify/Apliiq identities and media ledger while leaving variant fingerprints missing and every approval pending.
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

## Cycle 2 verification

- Dedicated product gateway, Shopify adapter, view model, PDP, release record, and media manifest are implemented locally.
- Contract/unit/component tests prove explicit fixture mode, preview/production fixture denial, Shopify normalization, no-store reads, and unavailable behavior on Shopify failure.
- Local desktop/mobile fixture PDP checks passed with source labeling, disabled purchasing, no console errors, and no mobile overflow.
- Shopify mode reached the server adapter but returned `SHOPIFY_REQUEST_FAILED`; the read-only audit reports Shopify environment configuration is incomplete. No fixture was substituted.

## External blockers

### Vercel hosting disabled

Human action: the Product Owner or authorized Vercel account owner must restore deployment access for project `carlophillips-site` (or explicitly approve another hosting path).

Resume point: deploy the approved fitness branch as a Vercel preview, configure preview-only environment values, then run desktop/mobile browser, console, network, and HTTP evidence against that preview. Do not promote production.

### Product scope decision

Human action: choose Signature Hoodie one-product proof or 12-product catalog restoration using the reconciliation in `PRD.md`.

Resume point: implement Shopify-backed routes, release records, and tests for the selected lane. Do not publish or activate products.

### Read-only Shopify configuration

Human action: an authorized owner supplies valid read-only Storefront domain/token values to the intended local or Preview environment without sharing them in reports.

Resume point: set `COMMERCE_DATA_MODE=shopify`, open the selected product route, capture the source-labeled Shopify title/variants/price/media observation, and update the Draft release record fingerprint. Keep purchasing disabled.

### Production and commerce operations

Human action: separately approve any Shopify catalog mutation, checkout/order test with operational impact, main-branch merge, or production promotion.

Resume point: execute only the specifically approved action, capture evidence without secrets/customer data, then update this status.

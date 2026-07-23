# Current Status

Updated: 2026-07-22  
Branch: `codex/cp-fitness-baseline` from `425f50b`  
Canonical remote: `https://github.com/CubiqoUnited/carlophillips-site.git`

## Verified facts

- Recovered Product Owner intent confirms the Hoodie is the first complete POC for a reusable POD-to-publish system with four coordinated lanes and designer-led plus trend-led workflows; it is not a static-page endpoint.
- The editorial UI remains fail-closed. The active product route now uses a dedicated server-rendered Commerce Gateway and reusable product component.
- The Hoodie is recorded as Shopify Draft and purchasing is disabled in the UI.
- Shopify product reads are connected behind a server-only adapter with explicit source/error states; local configuration currently reports Shopify as not configured, so a live product observation is still blocked.
- The versioned Hoodie release record binds the observed Shopify/Apliiq identities and media ledger while leaving variant fingerprints missing and every approval pending.
- Yarn 1.22.22 and `yarn.lock` are the declared package strategy; baseline work adds real lint and test commands.
- Local environment variable names are present; values were not printed. `.env.local` is ignored.
- Production and preview HTTP endpoints were diagnosed as `402 DEPLOYMENT_DISABLED` on 2026-07-22.
- Canonical `main` and `staging` were recorded at `d172cfb`; the Hoodie preview branch is at `425f50b`.
- The current Product Owner-supplied Shopify installed-app snapshot is preserved in `docs/shopify-capability-access-audit.md`; installed status does not prove API, Admin/Flow, app-credential, browser, or human access.

## Not yet proven

- A normal Corepack-provided `yarn` executable on this machine; verification used Yarn 1.22.22 bootstrapped through the bundled runtime, then proved a frozen install.
- Live Shopify-backed product and variant rendering.
- Browser add/update/remove cart flow and Shopify checkout redirect.
- Any verified callable path for the current installed Shopify app inventory.
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

## Cycle 3 verification

- A provider-neutral cart envelope and pure cart policy now distinguish Shopify, local fixture, and unavailable states.
- Preview and production reject local cart fallback when Shopify is missing or a cart operation fails; local fixture carts remain explicitly non-checkout-capable.
- Checkout URLs require HTTPS and an exact configured Shopify host; diagnostics no longer expose raw cart IDs or checkout URLs.
- Unit/contract tests cover add/update/remove transitions, invalid quantities, expired-cart replacement through Shopify, fixture denial, and malicious checkout-host rejection.
- Desktop/mobile browser checks passed with no console errors, error overlays, or mobile overflow. The active bag showed its unopened state with no checkout link; the Hoodie remained source-labeled and non-buyable. This is not a live cart API proof.
- A provider-neutral PipelineRun schema/state machine now records all four lanes, idempotent events, isolated blockers, exact resume points, and Product Owner-owned restricted approvals. Runs remain `in_progress_with_blockers` while safe work is actionable and become globally `blocked` only when none remains.
- The durable Hoodie local simulation completed the safe commerce/orchestration items and remains blocked only on authorized Apliiq observation and media inputs/approval; spend, credits, sample, publish, and production approvals all remain pending.
- The media manifest now enumerates every required Hoodie modality. The single front asset remains a pending candidate; back/angle, embroidery/material detail, on-model, lifestyle, spin, exact-product 3D/AR, and video remain unresolved. Release policy accepts a where-feasible omission only through an explicit Product Owner-approved infeasibility record.

## External blockers

### Vercel hosting disabled

Human action: the Product Owner or authorized Vercel account owner must restore deployment access for project `carlophillips-site` (or explicitly approve another hosting path).

Resume point: deploy the approved fitness branch as a Vercel preview, configure preview-only environment values, then run desktop/mobile browser, console, network, and HTTP evidence against that preview. Do not promote production.

### Read-only Shopify configuration

Human action: an authorized owner supplies valid read-only Storefront domain/token values to the intended local or Preview environment without sharing them in reports.

Resume point: set `COMMERCE_DATA_MODE=shopify`, open the selected product route, capture the source-labeled Shopify title/variants/price/media observation, and update the Draft release record fingerprint. Keep purchasing disabled.

### Shopify app capability/access audit

Human action: authorize the specific least-privilege read-only API, Admin/Flow, app-credential, or authenticated-browser path for each selected capability; separately approve any paid credit or write test.

Resume point: execute the matching row in `docs/shopify-capability-access-audit.md`, record authentication class/permissions/cost boundary/test result without secrets, and bind proven outputs to the Product Release Record. Do not infer access from installation.

### Production and commerce operations

Human action: separately approve any Shopify catalog mutation, checkout/order test with operational impact, main-branch merge, or production promotion.

Resume point: execute only the specifically approved action, capture evidence without secrets/customer data, then update this status.

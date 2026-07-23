# Current Status

Updated: 2026-07-23
Branch: `codex/cp-fitness-baseline` from `425f50b`  
Canonical remote: `https://github.com/CubiqoUnited/carlophillips-site.git`

## Verified facts

- Recovered Product Owner intent confirms the Hoodie is the first complete POC for a reusable POD-to-publish system with four coordinated lanes and designer-led plus trend-led workflows; it is not a static-page endpoint.
- The editorial UI remains fail-closed. Home, product, `/shop`, `/collections`, and bag/cart routes now use dedicated server-rendered truth boundaries.
- The Hoodie is recorded as Shopify Draft and purchasing is disabled in the UI.
- Shopify product reads sit behind a server-only adapter that now refuses network access until the exact product-read capability is ready with a durable evidence reference. Configuration, capability evidence, and a live observation are all still blocked/unverified.
- The versioned Hoodie release record binds the observed Shopify/Apliiq identities and media ledger while leaving variant fingerprints missing and every approval pending.
- Yarn 1.22.22 and `yarn.lock` are the declared package strategy; baseline work adds real lint and test commands.
- Local environment variable names are present; values were not printed. `.env.local` is ignored.
- Production and preview HTTP endpoints were diagnosed as `402 DEPLOYMENT_DISABLED` on 2026-07-22.
- Canonical `main` and `staging` were recorded at `d172cfb`; the Hoodie preview branch is at `425f50b`.
- The current Product Owner-observed 30-app Shopify inventory is preserved in a schema-validated evidence record and summarized in `docs/shopify-capability-access-audit.md`; installed status does not prove API, Admin/Flow, app-private API, browser, CLI, or human access.
- The live Shopify read-only audit was attempted through the existing Google account. Shopify accepted the account path but stopped at a one-time email-code gate before Admin or installed-app inventory. The verification tab was preserved at Cycle 5 close but did not survive the later task-continuation boundary; a fresh Shopify login tab is open without a new code request.
- The App Router now runs on Next.js `15.5.21` Maintenance LTS with React/React DOM `19.2.8`; async route params were migrated and the full local regression passed.

## Not yet proven

- A normal Corepack-provided `yarn` executable on this machine; verification used Yarn 1.22.22 bootstrapped through the bundled runtime, then proved a frozen install.
- Live Shopify-backed product and variant rendering.
- Browser add/update/remove cart flow and Shopify checkout redirect.
- Any verified callable path for the current installed Shopify app inventory; the latest managed-browser attempt is stopped at Shopify login before Admin.
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

## Cycle 4 verification

- The capability registry now validates evidence state, callable surface, exact allowed operations, restricted approvals, and blocker/resume records. A selected adapter or installed app does not make an operation callable.
- `/bag` and `/cart` are dedicated Server Component boundaries rather than monolithic-shell wrappers. Local mode is visibly fixture/non-commerce; Preview renders unavailable with no fake empty Shopify cart or checkout link.
- Unit/contract/component tests cover registry invariants, exact-operation denial, local/preview/production bag decisions, fixture rejection, and checkout denial.
- Desktop/mobile local and desktop Preview browser checks passed with no console errors, overlays, checkout links, or mobile overflow.

## Cycle 5 verification

- The existing Google account was present in the in-app browser and selected without exposing its address. Shopify then required a six-digit email code before Admin; no code, session data, app settings, or secret was read.
- The capability registry now records the authenticated-browser OTP gate and exact per-capability resume points for Storefront/cart, Apliiq, Modelize, Spin Studio/ZS-Spin-View, MyDesigns, Flow, and CS Trending Products Finder. None is marked callable.
- Next.js was migrated from unsupported `14.2.3` to `15.5.21` Maintenance LTS; React and React DOM are pinned to `19.2.8`, the lint peer is satisfied by TypeScript `5.9.3`, and the dependency graph remains Yarn-only with no npm/pnpm lockfile.
- The first production-dependency audit found 38 advisories (1 critical, 15 high, 21 moderate, 1 low). Unused direct Axios/UUID dependencies were removed and stale lodash/PostCSS/sharp resolutions were upgraded; the final production-dependency audit reports zero advisories. PostCSS and sharp are temporary security overrides beyond Next 15.5.21's declared ranges and passed clean install/build regression.
- Frozen clean install, zero-warning lint, 85 tests, production-dependency audit (zero advisories), and production build passed. `yarn verify` composes all four gates; `yarn check` is intentionally not used because Yarn Classic reserves that command. Tooling-policy tests pin the verified framework/runtime, Yarn-only lock strategy, and temporary security resolutions. Exact 1440×1000 and 390×844 browser checks showed the source-labeled Hoodie with purchasing disabled; the mobile document had no horizontal overflow and both viewports had no console/page errors. The local bag remained fixture-labeled with checkout disabled and no checkout link.

## Cycle 6 verification

- The previous global framing policy (`ALLOWALL` plus `frame-ancestors *`) and wildcard CORS defaults have been removed.
- All page responses now deny framing, opt out of sensitive browser capabilities, prevent MIME sniffing, and use a strict-origin referrer policy. HSTS is emitted only for an explicitly production deployment environment.
- API CORS is request-aware: no-Origin and same-origin traffic remain available; exact configured cross-origin traffic receives a matching allow-origin header; unlisted or invalid origins receive `403 CORS_ORIGIN_DENIED` before route work.
- `CORS_ORIGINS` accepts only exact comma-separated HTTP(S) origins. Wildcards, credentials, paths, queries, hashes, and non-HTTP protocols are ignored.
- `yarn verify` passed with zero-warning lint, 18 files/95 tests, zero production advisories across 193 packages, and a successful 13-route build. Live HTTP plus desktop/mobile browser evidence is stored under `test_reports/cp-fitness-cycle-6/`.

## Cycle 7 verification

- A machine-readable ProductCreationJob contract now distinguishes designer-led and trend-led entry evidence while forcing every output to remain `draft-only`.
- Trend signals and local fixtures are non-authoritative. The contract rejects fixture inputs in Preview/production and neither mode may set product truth, approve media, authorize commerce, or publish.
- Paired durable local simulations use distinct run IDs but converge on the same Hoodie Product Release Record, Media Registry, Commerce Gateway, PipelineRun schema, and Product Owner approval core.
- PipelineRun now gates external execution and Shopify writes in addition to spend, credits, samples, publish, and production. A human-required external-source item yields `in_progress_with_blockers` while four safe work items remain pending.
- Full verification results and machine-readable artifacts are stored under `test_reports/cp-fitness-cycle-7/`.

## Cycle 8 verification

- Product Release Record schema and policy now enforce sequential Draft → Staged → Approved → Released transitions. No evaluator path performs a Shopify write, deployment, publication, or production action.
- Staged requires observed Shopify/provider fingerprints, immutable commit/build/staging evidence, and a rollback plan. Approved additionally requires all product/media/fulfillment approvals plus a complete release-bound media matrix. Released additionally requires Shopify `ACTIVE` and verified rollback observations.
- The Media Registry requires exactly one entry for each of nine modalities. Approved bound assets must have verified exact-product match, rights, quality evidence, approval, correct modality kind, and release-ready fallbacks for video/spin/3D.
- The Hoodie Draft now binds a release-specific withdrawal plan, but rollback verification remains null. Its machine-readable staging decision remains denied on five exact evidence blockers; the record was not advanced.
- Full verification and evidence are stored under `test_reports/cp-fitness-cycle-8/`.

## Cycle 9 verification

- ProductBrief v1 now records publisher/retrieval provenance, published/observed/evaluated timestamps, deterministic current/stale/not-time-sensitive classification, brand/reference constraints, and candidate-only truth limits. ProductCreationJob v2 embeds that validated brief and records on-demand or scheduled cadence plus timezone/expression.
- Binding CARLOPHILLIPS constraints and inspiration-only reference rules explicitly deny copying, inferred rights, and inferred product/media truth.
- Normalized input fingerprints plus idempotency keys suppress identical retries and equivalent duplicate jobs without mutating the accepted registry.
- The designer simulation is on-demand and first-party. The trend simulation is scheduled but uses a stale, local sanitized fixture with `research-only` authority; it cannot invoke external research and every restricted approval remains pending.
- Both modes still converge on the same Product Release Record, Media Registry, Commerce Gateway, PipelineRun schema, blocker isolation, and Product Owner approval core.
- Full verification and evidence are stored under `test_reports/cp-fitness-cycle-9/`.

## Cycle 10 verification

- The product route now resolves every Shopify observation against handle-matched Product Release Record and Media Registry evidence from a server-side release registry.
- Preview permits only evidence-complete Staged, Approved, or Released candidates for private non-commerce review. Production denies any state other than complete Released, and even a complete Released observation remains non-commerce until cart/checkout is directly proven.
- Missing, mismatched, withdrawn, or incomplete release evidence returns a denied decision with no product payload. Local fixture review remains explicitly labeled and non-commerce.
- Contract, policy, gateway, registry, transition, and component tests prove that a successful Shopify read cannot independently authorize customer visibility or purchasing.
- `yarn verify` passed with zero-warning lint, 21 files/150 tests, zero production advisories across 193 packages, and a successful 13-route build.
- Local desktop/mobile PDP regression passed with explicit fixture/release labels, purchasing disabled, no console/page errors or error overlays, and no horizontal overflow. Evidence is stored under `test_reports/cp-fitness-cycle-10/`.

## Cycle 11 verification

- `/shop` and `/collections` no longer re-export the editorial home shell. Both use one reusable Server Component catalog boundary and derive candidates only from the Product Release Record registry.
- Every catalog candidate is resolved through the same Commerce Gateway, Product Release Record, Media Registry, and environment policy as its PDP. Local fixtures are labeled/non-commerce; Preview requires Staged-or-later Shopify evidence; production requires Released evidence.
- Catalog decisions expose truthful candidate, visible, and withheld counts. Denied/unavailable product payloads are discarded; tests prove a denied Draft title cannot appear in a mixed Preview decision.
- The Product Owner-observed 30-app inventory now has a schema-validated per-app disposition/access/authentication/fee-risk/next-action record. All callable surfaces remain unverified. CodexAutomation5, Shopify CLI Connector App, and Carlophillips Headless grant no inferred authority.
- The latest managed-browser audit reached Shopify login with Continue with Google and did not trigger OTP or reach Admin. The login tab is preserved as a handoff; safe local work continued.
- `yarn verify` passed with zero-warning lint, 24 files/169 tests, zero production advisories across 193 packages, and a successful 13-route build.
- Local desktop `/shop`, mobile `/collections`, catalog-to-PDP, and credentials-disabled Preview empty-state checks passed with no console/page errors, overlays, or horizontal overflow. Evidence is stored under `test_reports/cp-fitness-cycle-11/`.

## Cycle 12 verification

- Home no longer imports visibility flags or the Hoodie fixture in client code. Its server route consumes the exact shared catalog decision and passes only a schema-validated non-commerce summary into the editorial shell.
- The home release section derives candidate/visible/withheld counts and its optional PDP review link from that summary. A denied or empty decision emits no product payload, title, or `/products/` link.
- About and lookbook remain editorial-only and do not import the catalog server, Shopify adapter, fixture, or release flags.
- The obsolete client-owned collection/PDP implementations were removed from the editorial shell; `/shop`, `/collections`, and `/products/[handle]` remain the only owners of those flows.
- `yarn verify` passed with zero-warning lint, 27 files/179 tests, zero production advisories across 193 packages, and a successful 13-route build.
- Local desktop/mobile home, home-to-PDP/catalog, editorial-only about, and credentials-disabled Preview checks passed with no console/page errors, overlays, or horizontal overflow. Evidence is stored under `test_reports/cp-fitness-cycle-12/`.

## Cycle 13 verification

- Dormant `lib/data/products.js` and `lib/store/cart.js` paths were removed. They could return product data or perform browser cart mutations without the active Product Release Record and Commerce Gateway.
- The broad Storefront client/mutation exports were removed. Pure normalization remains transport-free; the active Shopify product adapter is server-only, read-only, and uses only server environment names.
- Public Shopify media-audit/readiness endpoints were retired because they exposed unfiltered catalog observations. Unknown commerce/API write routes now return `404 API_ROUTE_UNAVAILABLE`; health returns no Shopify configuration diagnostics.
- `cp.cart-activation-decision.v1` now requires a visible Shopify decision, matching Released record, an exact current/release variant-fingerprint match, sellable mapped variant, verified `cart-write` capability, scoped Product Owner approval, and a server-only activation gate. Local fixtures and stale variant observations are never eligible, and checkout is always separately disabled.
- PDP and bag routes consume the server activation decision. The current Hoodie remains Draft and every activation path remains non-commerce; no Shopify read/write, cart, checkout, payment, or order was attempted.
- Shopify normalization now preserves the product handle required for release-record matching.
- `yarn verify` passed with zero-warning lint, 27 files/184 tests, zero production advisories across 193 packages, and a successful 13-route build.
- Local desktop PDP and mobile bag checks passed with explicit disabled states, no checkout links, console/page errors, overlays, or horizontal overflow. The retired media-audit API returned the expected 404. Evidence is stored under `test_reports/cp-fitness-cycle-13/`.

## Cycle 14 verification

- `cp.product-observation.v1` sanitizes raw Shopify variant references into hashes, canonicalizes variants/options with locale-independent ordering, and fingerprints stable variant identity separately from the complete review envelope.
- The variant fingerprint intentionally covers hashed reference, title, and options. Price/availability changes keep identity stable but change the full observation fingerprint, which binds schema/source/authority/environment/timestamp/capability evidence/product/variant facts.
- Observation creation rejects missing/duplicate raw variant references, empty variants, malformed price/currency, inconsistent price ranges/currencies, and availability-summary mismatches. Durable observations contain no raw Shopify IDs.
- Review recomputes both fingerprints, rejects noncanonical/tampered/duplicate/malformed facts, and requires capability evidence exactly matching a ready `shopify-storefront-product-read` decision.
- Product Owner/designee approval must bind the exact observation fingerprint and expected handle. An accepted review returns only a schema-validated candidate release patch containing both fingerprints/evidence; no apply operation exists and tests prove Draft records remain unchanged.
- Fixture and simulation observations remain local, non-authoritative, unapprovable as Shopify truth, and incapable of producing a candidate patch.
- The server product loader attaches only sanitized pending-observation metadata. The active adapter refuses even a Shopify read while capability evidence is unavailable; no live Shopify access occurred.
- `yarn verify` passed with zero-warning lint, 28 files/204 tests, zero production advisories across 193 packages, and a successful 13-route build. No UI changed, so existing Cycle 13 browser evidence remains applicable. Evidence is stored under `test_reports/cp-fitness-cycle-14/`.

## External blockers

### Vercel hosting disabled

Human action: the Product Owner or authorized Vercel account owner must restore deployment access for project `carlophillips-site` (or explicitly approve another hosting path).

Resume point: deploy the approved fitness branch as a Vercel preview, configure preview-only environment values, then run desktop/mobile browser, console, network, and HTTP evidence against that preview. Do not promote production.

### Read-only Shopify configuration

Human action: an authorized owner supplies valid read-only Storefront domain/token values to the intended local or Preview environment without sharing them in reports.

Resume point: mark `shopify-storefront-product-read` ready only with its durable evidence reference, set `COMMERCE_DATA_MODE=shopify`, generate the sanitized product observation, and review approval against its exact fingerprint/handle. Keep the candidate patch unapplied until a separate authorization, and keep purchasing disabled.

### Shopify app capability/access audit

Observed blocker: an earlier attempt reached Shopify email verification after account selection. The latest Cycle 11 managed-browser attempt reached Shopify login with **Continue with Google** and did not select an account or request an OTP. Admin, installed-app settings, permissions, and billing screens remain unobserved, so the Product Owner-reported inventory is not callable-capability evidence.

Human action: in the current Shopify login tab, choose **Continue with Google**, select the existing account, then enter Shopify's one-time code if prompted. Do not send or record the code in project artifacts.

Resume point: begin at Shopify installed-app inventory, then inspect P0 Shopify Storefront/cart, Apliiq, Modelize, Spin Studio/ZS-Spin-View, MyDesigns, Flow, and CS Trending Products Finder surfaces; record access class/settings/permission or billing evidence without secrets or changes. Do not infer access from installation.

### Production and commerce operations

Human action: separately approve any Shopify catalog mutation, checkout/order test with operational impact, main-branch merge, or production promotion.

Resume point: execute only the specifically approved action, capture evidence without secrets/customer data, then update this status.

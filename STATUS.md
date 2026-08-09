# Current Status

Updated: 2026-08-08
Branch: temporary correction branch `codex/cp-runway-wording-design-system`, based on `origin/main` at `d874e20`
Canonical remote: `https://github.com/CubiqoUnited/carlophillips-site.git`

## Homepage simplification from 319×501 review — 2026-08-08

- The Signature Hoodie title now uses 62% white so it recedes into the product scene instead of competing with the model.
- The four boxed highlight chips are removed. The reviewed human-readable product description remains the sole material/feel narrative on the scene; the unused derived-highlight summary/schema fields were removed with deterministic coverage.
- `Explore media / N views` is now a compact dark-glass control in the upper-right of the Hoodie scene, outside the copy flow. Its catalog/media eligibility, dialog behavior, focus return, and truthful count are unchanged.
- The landing cue now reads `Scroll and explore` while retaining its descriptive accessible label and reduced-motion behavior.
- The single flattened runway campaign still receives a slow 18-second camera push/pan, disabled under `prefers-reduced-motion`. It adds restrained scene motion but is not described as actual model walking. No MP4/WebM/MOV campaign file exists in the repository.
- Full `yarn verify` passes unchanged: zero-warning lint, 35 test files / 332 tests, zero production vulnerabilities across 193 packages, and a successful 12-route optimized build.
- Local headless checks at the exact 319×501 feedback viewport, 390×844, and 1440×1000 prove the muted title, upper-right control, removed chips, changed cue, changing campaign transform, HTTP 200, zero overflow, and zero browser/framework errors. Evidence is under `test_reports/cp-home-simplification-2026-08-08/`.
- A replacement Preview is pending from the tested local commit. Production remains unchanged.

## Homepage hierarchy and media-discovery refinement — 2026-08-08

- The landing cue is now a centered `Scroll to the Signature Hoodie` control with a bordered label, circular animated down arrow, smooth anchor target, keyboard focus, and reduced-motion support. It replaces the subtle full-width rule that the Product Owner found ambiguous.
- The second panel no longer uses an oversized display headline. It presents `Signature Hoodie` at 48–100 px, followed by the reviewed product description and four evidence-derived highlights: heavyweight feel, structured fleece, soft interior, and CP chest embroidery. These highlights are emitted only when the reviewed description/details contain their source facts.
- The former underlined action is now a high-contrast `Explore product media` button with a truthful media count. The same-page viewer adds a direct `Motion study` jump to the disclosed still-derived animated WebP/GIF.
- The redundant lower product/release section is removed. The page sequence is now campaign → Hoodie scene → category rail → footer; product visibility, commerce eligibility, and media gating remain unchanged.
- Deterministic media-coverage tests prove the Preview gallery can contain both selected Modelize outputs, all six selected MODA frames, the material/embroidery study, and the still-derived motion loop. The quarantined back hypothesis and superseded built-in front study remain excluded. No real video, genuine 360 set, or interactive 3D file exists, so none is claimed.
- Full `yarn verify` passes: zero-warning lint, 35 test files / 332 tests, zero production vulnerabilities across 193 packages, and a successful 12-route optimized build.
- Headless local checks at the exact 641×686 feedback viewport, 390×844 mobile, and 1440×1000 desktop return HTTP 200 with the complete media button visible, centered motion frame, two homepage panels only, category/footer ending, zero browser errors/overlays, and zero horizontal overflow. Evidence is under `test_reports/cp-home-hierarchy-refinement-2026-08-08/`.
- Tested commit `ed917ef` is deployed READY as Vercel Preview `dpl_6PWspKMjE5dA8QokMfaYPmR3MGz8` at `https://carlophillips-site-benruk126-adityas-projects-261b17a9.vercel.app`. Direct 641×686, 390×844, and 1440×1000 checks match local evidence; all 12 unique deployed media frames decoded, Motion Study centered frame 08, and browser error arrays remained empty.
- Production remains unchanged and separately READY on `dpl_BdasbDdxHCMruKdy7WSsrUibvcgK`; `www.carlophillips.com` returns HTTP 200. No Production promotion, alias, domain, Shopify, provider, order, billing, merge, or remote Git action occurred.

## In-page Signature Hoodie media viewer — 2026-08-08

- `View the Signature Hoodie` on the second homepage panel now opens a full-screen media viewer over the same page. It does not navigate or change the URL.
- The viewer supports horizontal touch swipe, desktop previous/next controls, keyboard arrows, Escape, a close control, position count, body-scroll lock, background inertness, and focus return to the opening action.
- Its input is the same minimized home catalog summary as the product hero. A denied or unavailable product emits no trigger and no media payload. Local/Preview can add the explicitly disclosed Hoodie visual studies; production can render only media carried by the eligible release decision.
- The current local viewer contains three eligible product stills plus eight disclosed local/Preview study frames. All 11 decoded in a clean browser traversal. No video, genuine 360, or interactive 3D is implied where no such eligible asset exists.
- Customer-visible media labels are neutral and provider-free. Internal media IDs and arbitrary adapter labels are not passed into the home summary.
- Full `yarn verify` passes: zero-warning lint, 34 test files / 330 tests, zero production vulnerabilities across 193 packages, and a successful 12-route optimized build.
- Direct 1440×1000 and 390×844 local checks prove unchanged URL, swipe/arrow progression, all-frame decoding, Escape/close, focus return, zero provider-name copy, zero browser errors, and no horizontal overflow. Evidence is under `test_reports/cp-home-media-overlay-2026-08-08/`.
- A missing Vercel upload boundary was caught before transfer. The repository now has a tested `.vercelignore` excluding local credentials, dependencies/build output, the 168 MB recovered design archive, temporary work, and QA/governance evidence from the runtime upload.
- Vercel Preview `dpl_AGBftTVy679m6Bz16mYKQKs4C6JX` is READY at `https://carlophillips-site-4rw1x4ogn-adityas-projects-261b17a9.vercel.app`. The protected upload was 132.3 KB and targeted Preview only.
- Direct deployed checks at 1440×1000 and 390×844 pass HTTP 200, unchanged URL, arrow/touch-swipe progression, close/focus behavior, provider-neutral copy, zero overflow/errors, and all 12 deployed media frames decoded. Preview has four release-eligible product stills plus the eight disclosed Preview study frames.
- Production remains unchanged on READY deployment `dpl_BdasbDdxHCMruKdy7WSsrUibvcgK`. No alias, domain, Production deployment, Shopify data, order, app, billing, merge, or remote Git state changed.

## Runway wording and token-led design correction — 2026-08-08

- The homepage now opens on the supplied coastal runway campaign with the factual brand system `CARLOPHILLIPS / At the edge of life` and `Runway 001 / Lofoten`.
- A visible `Discover the Signature Hoodie / Scroll down` anchor and animated down arrow land directly on the preserved Signature Hoodie hero, which is the second full-viewport panel. The category rail follows with Hoodies active and Shirts, Outerwear, Bottoms, and Accessories disabled.
- The storefront design foundation is centralized under semantic `--cp-*` tokens and `cp-*` component classes for colour, type, gutters, content width, navigation/panel dimensions, label/display typography, motion, and focus behavior. The maintained contract is recorded in `docs/design-system.md`.
- Customer-facing headings, body copy, status labels, checkout calls to action, and route metadata no longer name the underlying commerce provider. Internal server integrations and evidence retain precise provider naming.
- Full `yarn verify` passes: zero-warning lint, 34 test files / 325 tests, zero production vulnerabilities across 193 packages, and a successful 12-route optimized build.
- Direct local and Vercel Preview checks at 1440×1000 and 390×844 prove HTTP 200 home/PDP, campaign → Hoodie → category ordering, the scroll target, one active plus four disabled categories, zero visible provider-name matches, zero broken images, zero runtime overlays/console errors, and no horizontal overflow.
- Vercel Preview `dpl_5zYviNwnc8WRFjwbECmnW1pPk8DA` is READY at `https://carlophillips-site-l04jfxxzx-adityas-projects-261b17a9.vercel.app`. Production remains unchanged on `dpl_BdasbDdxHCMruKdy7WSsrUibvcgK`; no domain, production deployment, merge, Shopify data, order, app, or billing state changed.
- Recovered local design exports remain recoverably isolated and ignored at `chat-images/`, `tmp/`, and `tmp_make_chat_pdf.py`; they are not included in this correction or Vercel application source.

## Two-stage runway landing correction — 2026-08-08

- Product Owner supplied and selected a new visual hierarchy: a wide CARLOPHILLIPS coastal runway campaign is the first full-screen landing view; the existing three-frame Signature Hoodie runway is the next full-screen panel on scroll; the sticky category rail follows it.
- The exact supplied 1672×941 campaign frame is stored at `public/campaigns/lofoten-runway-hero.jpg` with SHA-256 `9a0d10f2835ac0019cf8793ede450256b9226c896dd648f046b7b01360d67090`. Live HTML supplies the responsive brand headline and scroll cue. The campaign is brand media and is not treated as product, material, fit, or fulfillment evidence.
- The Hoodie runway remains gated by the catalog/commerce decision. A denied product cannot emit the Hoodie MODA sequence or an active Hoodies category; the independent campaign landing remains available.
- Direct 1440×1000 and 390×844 local checks prove campaign → product → categories ordering, decoded imagery, Hoodies active plus four disabled categories, zero broken images, no runtime error text, no console errors, and no horizontal overflow.
- Full `yarn verify` passes: zero-warning lint, 33 files / 323 tests, zero production vulnerabilities across 193 packages, and a successful 12-route optimized build.
- Preview `dpl_3ULFvNePT3iS25Dzh6aRwKZBE8z5` is historical evidence for the superseded one-stage hierarchy and must not be merged or promoted. Corrected Preview `dpl_42uuiSoQqUyNnhJBbf35smBsud2n` is READY at `https://carlophillips-site-3qgjsckgg-adityas-projects-261b17a9.vercel.app`. Direct desktop/mobile checks prove the required hierarchy, decoded media, category states, zero overflow/broken images/runtime or console errors, and the unchanged active Shopify purchase boundary on the Hoodie PDP. Production has not changed.

## Signature Hoodie media expansion — 2026-08-08

- The competitive target now has an explicit eight-part media ladder: factual product stills, product-alone editorial stills, macro material/embroidery detail, on-body imagery, short video, GIF/motion, 360 spin, and interactive 3D/AR.
- Current truthful coverage is partial. Shopify has two original product stills plus two published Modelize AI visualisations. A disclosed still-derived motion loop now exists, but no real product video, GLB/GLTF/USDZ, genuine spin set, physical on-model shoot, or verified physical fabric macro exists in the repository.
- Two new AI-assisted Preview candidates were produced from the exact Hoodie references: a full-body model study and a repaired embroidery/material macro. Both are isolated under `public/products/signature-hoodie/candidates/ai-assisted/`, explicitly disclosed in the Preview, and excluded from production by the existing environment/handle gate. They do not prove physical fit, fabric, or construction.
- MODA is installed. The Product Owner loaded the prepared front/back references; Codex configured and ran one draft job whose button stated `1 Credit - 10 images`. All ten original JPEGs were downloaded without using Shopify export. Six passed visual review and are isolated as Preview candidates; Shot 10 was rejected for an invented neck-label mark, while the remaining unselected frames stay evidence-only.
- Existing Spin Studio remains the selected 360 owner. It requires 16–24 genuine angle images or a GLB. Reusing AI-generated angles as physical-product proof is prohibited.
- Instant 3D is installed, but its embedded `3dcloud.com.tr` dashboard refuses the Shopify iframe connection and its direct dashboard returns HTTP 400. Official Shopify listings identify two POD-compatible alternatives that do not require a photographed sample: Spinr can create an AI 360 from existing product photos, and 3Dify can generate a GLB from one or several product images. Neither has been installed or invoked yet.
- The storefront already renders approved image and video media, but a `model_3d` item intentionally remains a static-fallback state. An interactive viewer will be added only after a real generated/uploaded model is exported, inspected, release-bound, and proven in the headless Preview.
- Full verification passes after the expansion: zero-warning lint, 33 files / 320 tests, zero production vulnerabilities across 193 packages, and a successful 12-route optimized build.
- Corrected Vercel Preview `dpl_BhHrt7roU9zYCGxgzLXe2LSst9ap` is READY at `https://carlophillips-site-onkmu0akt-adityas-projects-261b17a9.vercel.app`. The first MODA Preview check caught desktop `object-cover` cropping of the portrait compositions; the corrected candidate preserves the full model with `object-contain`. Direct 1280×720 and 390×844 checks decode all six curated MODA images, omit rejected Shot 10, show the unverified-back disclosure, and have no horizontal overflow or framework error overlay. Verification still confirms zero real-video and zero interactive-3D elements, preserving those remaining gaps truthfully. Production was not repointed.

## Signature Hoodie premium-showcase bridge — 2026-08-08

- The high-end composition was already present, but the live PDP had only two plain Shopify product views. Modelize candidates existed outside the release-bound Shopify gallery, and no truthful editorial-study layer connected them to the Preview. Real spin/video/3D inputs were absent.
- The Product Owner authorized use of the existing embedded-app outputs. Modelize job `#137843f7` now reports two selected outputs published to the Hoodie on 2026-08-08 at 02:40 PM; Shopify Admin visually confirms four media items. The visibly artifacted close-up remains unpublished and quarantined.
- The temporary branch adds a Signature-Hoodie-only, Preview-only digital editorial study: two full-height Modelize panels, sparse high-fashion typography, and an explicit AI-assisted disclosure. These images do not enter the release-bound product-truth gallery and cannot render in production through this path.
- Spin Studio is installed and its free tier can cover one product, but it requires 16–24 genuine angle images or a GLB model. Neither exists, so no fake 360/3D was generated. Modelize has exhausted its 3/3 free allowance; the observed paid entry point is $19/month and remains unapproved.
- Historical note: MODA was initially only a zero-subscription candidate because its Shopify install control did not advance. It was subsequently installed and exercised under the bounded media-expansion work above; this earlier finding no longer describes current state.
- Tests prove the editorial study is limited to the exact Hoodie handle in Preview, absent from production/other products, and excludes the quarantined asset. Full verification passes: zero-warning lint, 33 files / 320 tests, zero production vulnerabilities across 193 packages, and a successful 12-route optimized build.
- Vercel Preview deployment `dpl_EW1QFnaYqcqSwx8Euwcir6Diy9t8` is READY at `https://carlophillips-site-a3odjms8n-adityas-projects-261b17a9.vercel.app`. Direct 1280×720 and 390×844 Hoodie checks return HTTP 200, load both 928×1152 studies after normal lazy-load scrolling, show the disclosure and two preview labels, have no overflow/errors, and exclude the quarantined asset. Vercel confirms target `preview`; production still returns separately from `www.carlophillips.com` and was not repointed.
- Commit `c27f89d` is pushed to the authorized `avloy07-eng` fork. Push to the canonical `CubiqoUnited` remote was rejected with HTTP 403 for the current GitHub identity; no canonical branch was changed.

## Premium Hobby Preview candidate — 2026-08-08

- Product Owner approved a non-production Preview in Aditya's active Vercel Hobby project, with the existing Shopify Storefront domain/token stored for Preview only. Production and its domains are explicitly excluded.
- The Shopify-backed home, collection, and Hoodie PDP now use a restrained high-end fashion presentation: full-height visual storytelling, sparse navigation, direct product/price language, ordered size presentation, and quiet scroll sections inspired by the approved Vollebak/Zara references without copying them.
- Live customer pages suppress internal release-policy jargon. They show only reviewed Shopify title, description, price, availability, two current product images, and the existing server-only Shopify checkout boundary.
- No unverified spin, 3D, or video is rendered or claimed. A later bounded Preview candidate adds two explicitly disclosed AI-assisted Modelize visualisations outside the factual product gallery; that work is tracked in the premium-showcase bridge above.
- Local desktop and direct 390×844 browser checks passed with no horizontal overflow, no console/page errors, and no internal release-jargon matches. `yarn verify` passes 33 files / 318 tests, zero production vulnerabilities, and the 12-route optimized build.
- The final candidate is deployed READY as Vercel Preview `dpl_45XNRKWTpGbB1LaXreWH14sSkYMQ`: `https://carlophillips-site-2xbt13766-adityas-projects-261b17a9.vercel.app`. Preview-only Shopify variables are stored as sensitive values and are absent from Git.
- Post-deployment QA passed on home, shop, collections, and PDP: HTTP 200; exact 1280×720 and 390×844 widths; no overflow; all images loaded; zero console warnings/errors; no runtime overlay or internal release jargon. The nine Shopify size/price choices and checkout action are present.
- Vercel inspection proves `www.carlophillips.com` still targets the separate existing production deployment `dpl_D1qQH41QHZ2fgJnhFzYjkfvJU7Yp`. No production alias or deployment was changed.
- Complete local and deployed evidence is stored under `test_reports/cp-premium-hobby-preview-2026-08-08/`.

## Signature Hoodie commerce activation — 2026-08-04

- Product Owner authorized production commerce for exactly one product: `carlophillips-signature-hoodie`.
- Shopify Admin now records the Hoodie as Active and published to Online Store plus Carlophillips Headless. No other product or channel was changed.
- A fresh server-only Storefront observation returned nine variants, all available, USD 128–134, and two current Shopify product images. Current identity and commerce-facts fingerprints match the bounded launch approval.
- Shopify Admin showed Apliiq Dropship Fulfillment as the fulfillment location for the inspected Hoodie variant and all nine variants carry current Apliiq-associated SKU facts. This is Shopify-side association evidence, not a provider-side mapping audit or fulfillment-order proof.
- The CP storefront now shows the real Shopify Hoodie on home, `/shop`, `/collections`, and the PDP. The PDP offers an opaque-hash size selector and server-only Shopify `cartCreate`; raw Shopify references never enter the browser response.
- One no-order live cart proof returned HTTP 303 to the trusted Shopify checkout host. No customer data, payment, order, sample, or fulfillment request was submitted.
- Desktop 1440×1000 and mobile 390×844 checks show live-product wording and the Shopify checkout action with zero console errors. `yarn verify` passes 33 files / 316 tests, zero production vulnerabilities, and the 12-route Next.js build.
- Vercel remains the only launch blocker. Every attempt to add the required Preview/Production environment variables failed because the owning account is suspended and requires a valid payment method. No Preview or production deployment was created.
- Exact evidence: `test_reports/cp-hoodie-production-activation-2026-08-04/report.md`.

## Verified facts

- The last production-aligned, explicitly VOLLBAK-style source is commit `9e1f5c3`. Commit `5077e3f` replaced its full-height product-led home with the editorial shell later carried by remote `main` at `d172cfb`.
- The current bounded correction restores the `9e1f5c3` visual language—quiet fixed navigation, full-height split hero, restrained type, and product release staging—while retaining the active server release/catalog boundaries. It does not restore the historical mock catalog, invented product media fallbacks, or browser cart.
- Editorial-only `/about` and `/lookbook` routes, the shared editorial shell, and the inactive editorial content abstraction are removed. `/shop`, `/collections`, `/products/[handle]`, `/bag`, `/cart`, and API boundaries remain.
- The archived drop board is labeled as a visual-system reference and explicitly not product or media proof. It does not make a product visible or purchasable.
- The Git model has one permanent branch, `main`; staging is a Vercel Preview generated from a temporary PR branch. Canonical PR #3 merged the production-aligned correction to `main` as `85b6f8f`.
- Vercel project `carlophillips-site` on the working personal team now builds canonical `main`. The initial cutover deployment `dpl_66ydzPzwP2hBoFuTsyy5AKWMKKx1` reached READY and later `main` evidence commits were redeployed; `www.carlophillips.com` returns HTTP 200 and the apex performs one canonical 308 redirect to `www`.
- Paused Cycle 20 fulfillment-contract work is recoverably isolated in stash `stash@{0}` / `ab3f004119ac28547d0ecddb50634a9e9d7806e4` and is not part of this branch diff.
- Recovered Product Owner intent confirms the Hoodie is the first complete POC for a reusable POD-to-publish system with four coordinated lanes and designer-led plus trend-led workflows; it is not a static-page endpoint.
- The storefront UI remains fail-closed. Home, product, `/shop`, `/collections`, and bag/cart routes use dedicated server-rendered truth boundaries.
- Historical release records still describe the pre-activation Draft path; the bounded launch approval and current live observation supersede that status for this one Hoodie only.
- Shopify product reads sit behind a server-only adapter that now refuses network access until the exact product-read capability is ready with a durable evidence reference. Configuration, capability evidence, and a live observation are all still blocked/unverified.
- The versioned Hoodie release record binds the observed Shopify/Apliiq identities and media ledger while leaving variant fingerprints missing and every approval pending.
- Yarn 1.22.22 and `yarn.lock` are the declared package strategy; baseline work adds real lint and test commands.
- Local environment variable names are present; values were not printed. `.env.local` is ignored.
- Production and preview HTTP endpoints were diagnosed as `402 DEPLOYMENT_DISABLED` on 2026-07-22.
- Canonical `main` and `staging` were recorded at `d172cfb`; the Hoodie preview branch is at `425f50b`.
- The historical Product Owner-observed 30-app Shopify inventory is preserved in a schema-validated evidence record. The authenticated 2026-08-04 read-only audit supersedes it with 33 installed apps and direct browser-surface findings; installation still does not prove an API or authorize writes.
- Shopify Admin authentication is no longer blocked. The current human boundary is the separate Apliiq provider sign-in required to inspect the exact Hoodie mapping.
- The App Router now runs on Next.js `15.5.21` Maintenance LTS with React/React DOM `19.2.8`; async route params were migrated and the full local regression passed.
- The authenticated Modelize app contains one completed three-image Signature Hoodie job (`#137843f7`, observed 2026-08-04). Two usable outputs are stored locally and were selectively published to the Shopify Hoodie on 2026-08-08 under the Product Owner's app-use authorization; the third remains quarantined for a visible layout artifact. They remain AI-assisted visualisations, not physical-product proof.

## Not yet proven

- A normal Corepack-provided `yarn` executable on this machine; verification used Yarn 1.22.22 bootstrapped through the bundled runtime, then proved a frozen install.
- A completed paid checkout/order and post-order lifecycle; only the safe no-order cart/redirect boundary is proven.
- Any verified app-private API path for the current installed Shopify app inventory; Shopify Admin browser access is proven, while Apliiq remains at provider sign-in and Storefront secrets remain unconfigured.
- Live deployment of the new Shopify-backed commerce build on the production domain; Vercel billing suspension prevents configuration and deployment.
- Payment, POD order handoff, fulfillment, tracking, support, or returns.
- Any real product video, spin/360, 3D/AR, or physical on-model/lifestyle campaign asset. The two published Modelize outputs are explicitly AI-assisted visualisations.
- An authenticated Apliiq observation proving the exact Hoodie design/product/variant mapping. The retained provider tab is at the separate Apliiq sign-in screen.
- Any approved Modelize plan or credits for additional on-model generation. The observed free allowance is exhausted (3/3); no plan or charge was accepted.

## Hoodie end-to-end POC checkpoint — 2026-08-04

- The local VOLLBAK-aligned home hero now uses release-policy-derived product media when the local Hoodie fixture is visible. A denied product cannot contribute hero copy or media.
- The local PDP renders two usable Modelize candidates and the recorded Apliiq front candidate with explicit approval-pending labels. The flawed Modelize detail image remains in the evidence registry as quarantined and is not rendered.
- Desktop and direct 390×844 browser checks passed for home and PDP: all images loaded, no horizontal overflow, no console warnings/errors, and every variant/purchase control remained disabled.
- `yarn verify` passed: zero-warning lint, 32 files/309 tests, zero production vulnerabilities across 193 packages, and a successful 11-route Next.js build.
- This checkpoint is not end-to-end completion. Apliiq mapping, live Shopify Storefront truth, additional truthful on-model/video/spin/3D assets, Preview release evidence, cart/checkout, publication, and production remain separate unproven gates.

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

## Cycle 12 verification (historical; presentation superseded by the current correction)

- At Cycle 12, home stopped importing visibility flags or the Hoodie fixture in client code. Its server route consumed the exact shared catalog decision and passed only a schema-validated non-commerce summary into the then-active editorial shell.
- The home release section derives candidate/visible/withheld counts and its optional PDP review link from that summary. A denied or empty decision emits no product payload, title, or `/products/` link.
- At that point, About and Lookbook were editorial-only. Both routes and their shared shell are removed by the current correction.
- The obsolete client-owned collection/PDP implementations were removed at Cycle 12; `/shop`, `/collections`, and `/products/[handle]` remain the only owners of those flows.
- `yarn verify` passed with zero-warning lint, 27 files/179 tests, zero production advisories across 193 packages, and a successful 13-route build.
- The then-active desktop/mobile home, home-to-PDP/catalog, About, and credentials-disabled Preview checks passed. That evidence remains historical under `test_reports/cp-fitness-cycle-12/` and is not current visual proof.

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
- Review recomputes the Cycle 14 variant and full-envelope fingerprints, rejects noncanonical/tampered/duplicate/malformed facts, and requires capability evidence exactly matching a ready `shopify-storefront-product-read` decision.
- Product Owner/designee approval must bind the exact observation fingerprint and expected handle. An accepted review returns only a schema-validated candidate release patch; no apply operation exists and tests prove Draft records remain unchanged.
- Fixture and simulation observations remain local, non-authoritative, unapprovable as Shopify truth, and incapable of producing a candidate patch.
- The server product loader initially attached sanitized pending-observation metadata. Cycle 15 retains the complete sanitized envelope server-side so runtime policy can recompute integrity without exposing raw Shopify references.
- `yarn verify` passed with zero-warning lint, 28 files/204 tests, zero production advisories across 193 packages, and a successful 13-route build. No UI changed, so existing Cycle 13 browser evidence remains applicable. Evidence is stored under `test_reports/cp-fitness-cycle-14/`.

## Cycle 15 verification

- Product Observation now has three explicit fingerprints: stable variant identity, canonical commerce facts, and the immutable complete review/audit envelope.
- The full observation fingerprint continues to bind timestamp, environment, capability evidence, product, and variants for exact approval. Runtime does not compare a fresh read against that historical instance fingerprint.
- Preview and production validate the complete fresh envelope, then compare its variant identity and commerce-facts fingerprints to reviewed Product Release Record bindings. Unchanged reads remain eligible across new timestamps and the correct runtime environment.
- Changed title, price, currency, availability, or variant facts are withheld. Variant identity mismatch has a distinct reason; malformed/tampered observations return no payload.
- Catalog resolution isolates stale and malformed candidates while preserving truthful counts and any other eligible product.
- The Hoodie Draft now explicitly records missing commerce-facts and full-observation review bindings. Staging has seven exact blockers and remains denied.
- `yarn verify` passed with zero-warning lint, 29 files/216 tests, zero production advisories across 193 packages, and a successful 13-route build. Evidence is stored under `test_reports/cp-fitness-cycle-15/`. No route presentation changed, so new browser capture was not required.

## Cycle 16 verification

- Media Registry assets now carry an explicit nullable Shopify storefront binding. A current approved binding hashes media identity, type, canonical URL, and preview URL plus durable evidence; raw Shopify media IDs/URLs are not persisted in the manifest.
- The server strips unapproved, unprovenance-bound, rights/quality-incomplete, duplicate, wrong-kind, stale-URL, and unregistered media individually before the product view model. Registry alt text and modality labels replace unreviewed Shopify presentation metadata.
- Preview may keep an otherwise eligible product visible with only its matched approved subset. The PDP exposes an explicit incomplete media-review state and remains non-commerce.
- Production denies the entire product if the current matched set does not cover every required non-waived modality or an approved motion/3D fallback. An unapproved extra is discarded without failing an otherwise complete approved set.
- The current Hoodie front candidate has no storefront binding and remains pending; the two unverified details remain quarantined. No live media or approval was invented.
- `yarn verify` passed with zero-warning lint, 30 files/231 tests, zero production advisories across 193 packages, and a successful 13-route build. Desktop/mobile local fixture PDP and home regression passed with no console warning/error, overlay, checkout link, or horizontal overflow; purchasing remained disabled. Full verification and browser evidence are stored under `test_reports/cp-fitness-cycle-16/`.

## Cycle 17 verification

- The canonical Product Observation now requires plain description, vendor, product type, derived tagline, and ordered details alongside title, price, currency, availability, and variants. All are included in commerce-facts and full-envelope fingerprints.
- Preview/production release products are constructed from the validated observation rather than by spreading the normalized Shopify adapter object. Only the current media array crosses that boundary, then immediately passes through the independent Media Registry filter.
- Outer title/name/description/vendor/type/tagline/details/story/HTML edits cannot replace reviewed presentation. A real change inside a fresh observation produces `PRODUCT_COMMERCE_FACTS_STALE`, withholds the entire product payload, and requires a newly reviewed and separately applied binding.
- Shopify `descriptionHtml`, raw product IDs, raw variant mappings, and arbitrary outer fields are absent from the release product. The plain description remains React-escaped presentation data.
- View-model and PDP status copy derives from source, environment, and release reason. Preview is private review; production Released says product facts are released while purchasing remains separately disabled. A neutral unavailable story replaces both outer story text and the former false pending-approval fallback.
- Focused verification passed with zero-warning lint and 10 files/124 tests. Full `yarn verify` passed with 30 files/246 tests, zero production advisories across 193 packages, and a successful 13-route build. Fresh desktop/mobile PDP and home regression found no console warning/error, overlay, checkout link, or horizontal overflow; purchasing remained disabled. Evidence is under `test_reports/cp-fitness-cycle-17/`.

## Cycle 18 verification

- Shopify-backed PDP option review now uses exact sanitized variant combinations rather than independently flattened color and size lists. Each combination retains canonical selected dimensions, current availability, and reviewed price/currency.
- `cp.variant-presentation.v1` binds the current/release variant fingerprint and product currency, requires one canonical non-empty unique option-name schema, and rejects duplicate signatures/references, missing or extra dimensions, non-canonical order, malformed price/currency, and authority flags.
- The release whitelist constructs this presentation from the validated Product Observation. Injected outer `shopifyVariants` or `variantPresentation` objects are discarded.
- Every combination is disabled review information. The view contains no add-to-cart or checkout action, and opaque reference hashes are not displayed.
- Cart activation now separates the available reviewed-combination gate from an eighth evidence-backed server-only resolver gate. No resolver is currently wired, so a hash or raw outer mapping cannot become mutation authority.
- Product Owner reconfirmed the existing 30-app Shopify inventory and reported a logged-in Product Owner browser. This remains reported-installed evidence only: the agent's Admin/Storefront/custom-app/CLI/app-private access is unverified. The durable audit now defines one narrow CP Admin/Storefront connector path plus only selected Apliiq/media/workflow access, records duplicate groups and usage-fee exposure, and preserves exact human authentication/approval gates.
- Focused verification passed across 10 files/155 tests. Full `yarn verify`
  passed with zero-warning lint, 31 files/276 tests, zero production
  advisories across 193 packages, and a successful 13-route Next.js 15.5.21
  build. Direct desktop PDP plus a temporary localhost-only 390×844 responsive
  frame passed with meaningful fixture content, purchasing disabled, no
  add/cart/checkout action, no error overlay, and no horizontal overflow.
  Collection and home navigation also passed. The selected in-app browser had
  no viewport override, so the temporary proxy stripped framing headers only
  from copied local responses; it was stopped and is absent from the final
  repository diff.

## Cycle 19 verification

- `cp.variant-resolution-decision.v1` defines sanitized readiness evidence for
  the eighth cart gate. The evaluator requires exact environment, handle,
  current/release fingerprint, an evidence-bound Storefront product-read
  decision, and the locally verified CP resolver implementation.
- The resolver re-creates the canonical Product Observation from fresh
  server-ephemeral raw variants and proves every reviewed opaque hash has one
  current match. Changed identity, changed facts, duplicates, missing variants,
  evidence mismatch, wrong surface, wrong handle, and wrong environment fail
  closed.
- Registry `local` means the deterministic implementation is locally proven;
  decision `server_only` means runtime containment. The upstream server-only
  Storefront loader necessarily sees raw references first. The new wrapper is
  only the sole production entry for readiness computation.
- The readiness decision returns no raw ID or selected mutation target and
  explicitly denies cart mutation and checkout. The obsolete flattened
  `shopifyVariants` and first-variant shortcuts were removed from product
  normalization.
- A real production readiness decision passes cart gate 6 only when every
  exact schema field is intact. Public routes, views, activation summaries,
  and durable decision evidence contain no raw reference.
- Cart activation remains intentionally unwired with
  `variantResolverDecision: null`; no Shopify read/write, selection, cart,
  checkout, order, or other external action was performed.
- Focused verification passed across 6 files/98 tests with zero-warning lint.
  Full `yarn verify` passed with zero-warning lint, 32 files/308 tests, zero
  production advisories across 193 packages, and a successful 13-route
  Next.js 15.5.21 build. No customer-visible route changed, so Cycle 18 remains
  the current browser-regression evidence.

## Production cutover verification — 2026-08-03

- Canonical PR #3 merged the production-aligned storefront and PostCSS security patch to `main` as `85b6f8f`.
- A production deployment built from that exact merge commit and reached READY on the working Vercel team.
- The stale `www.carlophillips.com` binding was removed from the disabled legacy project, then both apex and `www` were bound to the new production deployment. The temporary redirect loop was eliminated.
- HTTP checks passed for `/`, `/shop`, `/products/signature-hoodie`, and `/bag`; apex redirects once to `www`.
- Direct desktop and mobile browser checks passed. At 390×844 the document width equals the viewport width and no product image is broken. Screenshots and the concise record are under `test_reports/cp-production-cutover-2026-08-03/`.
- This proves hosting and the approved visual direction, not live Shopify commerce. Product, cart, checkout, payment, and fulfillment remain fail-closed pending authenticated Shopify evidence and credentials.
- The misleading permanent `carlophillips-preview.vercel.app` project alias and obsolete legacy `staging.carlophillips.com` binding were removed. Staging evidence uses immutable temporary-branch Preview deployment URLs only.

## External blockers

### Authenticated Shopify POC audit — 2026-08-04

- The in-app Shopify Admin session is authenticated. A read-only audit observed 33 installed apps, the Draft `CARLOPHILLIPS Signature Hoodie`, the active native Headless storefront connection, app permission surfaces, selected dashboards, and current billing boundaries without exposing secrets or changing Shopify.
- The minimum POC stack is Apliiq for Hoodie POD, Modelize for reviewed still imagery, one provisional spin worker (Spin Studio), native Shopify Headless for Next.js commerce truth, Flow for an approval gate, and the CP Next.js storefront for presentation.
- Apliiq opens to provider sign-in; Modelize has used 3/3 free images but contains three completed Hoodie outputs; Spin Studio is disabled and has no Hoodie spin; ZS-Spin-View/MyDesigns request new theme permissions; the CP Flow exists but is inactive.
- Native Shopify Headless, not the broken `Carlophillips Headless` custom app or embedded Codex/CLI/Claude connector shells, is the supported storefront path.
- Follow-through proved exactly where the Modelize allowance went: one Auto Mode job (`#137843f7`) generated three Signature Hoodie images from one reference at 2026-07-11 16:16; all three remain unpublished.
- Spin Studio is inactive because its required Online Store theme app embed is off. Its documented default installation targets a Shopify theme and replaces a product-gallery image; no export, API, or CP Next.js integration was exposed, so enabling the embed would not activate 360 media on the headless storefront.
- Shopify Agentic is a future sales channel, not an agent-control surface. Shopify reports Agentic Storefronts unavailable, ChatGPT/Copilot/other channels inactive, and zero products in Shopify Catalog.
- The existing native Headless storefront has a usable public Storefront credential and checked product-listing/checkouts scopes. A secret-free live query returned HTTP 200 with no GraphQL errors and correctly withheld the Signature Hoodie because it is Draft. No credential was persisted, rotated, or recorded.
- Shopify Basic is $39/month. The upcoming bill was $0 at observation time. Modelize generation and several usage-fee apps remain cost-gated.
- Full evidence, screenshots, app dispositions, blockers, and the exact POC sequence are in `test_reports/cp-shopify-audit-2026-08-04/audit-report.md`.

### Read-only Shopify configuration

Human action: an authorized owner supplies valid read-only Storefront domain/token values to the intended local or Preview environment without sharing them in reports.

Resume point: mark `shopify-storefront-product-read` ready only with its durable evidence reference, set `COMMERCE_DATA_MODE=shopify`, generate the sanitized product observation, and review approval against its exact full fingerprint/handle. The accepted patch binds variant identity, commerce facts, full audit fingerprint, and review evidence. Keep it unapplied until separate authorization, and keep purchasing disabled.

### Shopify app capability/access audit

Observed blocker: Shopify Admin is now authenticated and audited. Apliiq accepted a password-reset request, but both owner-supplied candidate passwords were rejected; no provider product/variant mapping was observed. Modelize requires a plan for new generations. Spin Studio's theme embed is disabled and a headless/export path is unproven.

Human action: complete the newest Apliiq password-reset email link, confirm the new password on Apliiq, and sign in without accepting charges or changing configuration; then signal `Apliiq open`. Approve any Modelize spend, Flow activation, spin configuration, Shopify write/publication, Preview deployment, merge, or production action separately.

Resume point: observe the exact Hoodie mapping in Apliiq read-only. The native Headless credential is callable, but the Draft Hoodie is intentionally unavailable to Storefront API; obtain an explicit controlled publication/channel decision before any Shopify write, then bind reviewed Shopify/POD/media evidence before generating a Vercel Preview.

### Production and commerce operations

Human action: separately approve any future Shopify catalog mutation or checkout/order test with operational impact. Future merges and production promotions must continue through reviewed temporary-branch evidence.

Resume point: execute only the specifically approved action, capture evidence without secrets/customer data, then update this status.

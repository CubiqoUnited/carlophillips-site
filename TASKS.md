# Delivery Tasks

## Version milestones

- [x] Read and visually inspect all 18 pages of `Recovered-Design-System-Guidance.docx` before changing the v1.2 design-system boundary.
- [x] Preserve v1.2 and implement the standards reconciliation as the bounded v1.2.1 patch.
- [x] Move raw storefront presentation values into one canonical `app/design-tokens.css` source with primitive, semantic, and component tiers under `--cp-*`.
- [x] Cover colour, type, spacing, sizing, shape, depth, motion, media, iconography, accessibility, state, exception, dependency, and project-independence requirements in the maintained contract.
- [x] Refactor active customer surfaces to semantic/component roles without changing approved v1.2 product, media, commerce, or visual hierarchy.
- [x] Add deterministic source/drift/dependency tests and pass full `yarn verify` (35 files / 336 tests, zero vulnerabilities, 13-route build).
- [x] Capture and inspect desktop/mobile headless evidence for home landing/product, media overlay, shop, PDP, bag, and concept routes; prove focus, Escape, reduced motion, token resolution, and zero overflow/errors.
- [x] Compare v1.2.1 evidence against v1.2 and record that the visible runway/`ONE` design is preserved.
- [ ] Product Owner separately decides whether v1.2.1 should be pushed and deployed as a new Vercel Preview. Production remains unchanged.

- [x] Preserve the complete current baseline, including Draft POD concepts and runway-viewer evidence, in a clean local commit and annotated tag `v1.1`.
- [x] Confirm all newly included concepts remain Draft-only and unreferenced by active site code.
- [x] Pass full `yarn verify`, image decode/dimension checks, visual inspection, whitespace review, and secret scan for `v1.1`.
- [x] Audit remaining hardcoded storefront design decisions for the token-led `v1.2` milestone.
- [x] Implement layered semantic design tokens, a shared storefront header, and reusable customer-facing primitives without changing product/media/commerce truth.
- [x] Enforce the semantic boundary across every active customer surface with deterministic source tests.
- [x] Pass full `yarn verify` (35 files / 334 tests, zero vulnerabilities, 13-route build) and 11-route compact/mobile/desktop headless visual regression, including all 11 media slides.
- [x] Commit the tested candidate and create local annotated tag `v1.2`; keep push, merge, Preview/Production deployment, and domains unchanged unless separately requested.
- [ ] Product Owner separately decides whether v1.2 should be pushed and deployed as a new Vercel Preview.

## Current correction: `ONE` upper hierarchy and product attributes

- [x] Move the `Signature Series / 001` and `ONE` group visibly upward at the Product Owner's 584×486 review width and on desktop.
- [x] Preserve a phone-safe offset below the upper-right media control at 390×844.
- [x] Replace the size/generic chips with `Color / Black`, `Material / Structured fleece`, and `Feel / Heavyweight, soft interior`.
- [x] Keep the Signature Hoodie product, variants, PDP, media viewer, and commerce boundaries unchanged.
- [x] Add deterministic component/design-system coverage for the responsive layout and exact attribute contract.
- [x] Pass focused tests and full `yarn verify` (35 files / 333 tests, zero vulnerabilities, optimized build).
- [x] Capture and inspect exact 584×486, 390×844, and 1440×1000 local evidence with no browser/framework errors.
- [x] Commit as `809fedb`, deploy READY Preview `dpl_G1A3CZJ4edFxK46YLMDfjL3Lqvpx`, repeat direct compact/mobile/desktop checks, and prove Production remains unchanged on `dpl_BdasbDdxHCMruKdy7WSsrUibvcgK`.
- [ ] Product Owner reviews the replacement Preview and separately approves or rejects merge/Production promotion.

## Current correction: `ONE` product scene and inset media widget

- [x] Replace the landing asset with the exact Product Owner-supplied 1536×1024 runway PNG and bind its SHA-256 in a deterministic test.
- [x] Present the Signature Hoodie as homepage campaign name `ONE` without changing its underlying product/PDP/commerce identity.
- [x] Reduce the reviewed description to a coherent first sentence, left-align it, and make it a three-line block at 584×486 and 390×844.
- [x] Restore useful tags as factual product information: Black, XS–5XL, Heavyweight fleece, and CP embroidery.
- [x] Remove the media-action forward arrow and place a four-way expand icon between its label and truthful view count.
- [x] Convert the media viewer from a full-viewport canvas to an inset centered overlay card while retaining swipe, keyboard, close, scroll-lock, focus-return, and release gates.
- [x] Pass focused component/design tests and full `yarn verify` (35 files / 333 tests, zero vulnerabilities, optimized build).
- [x] Capture and inspect 1440×1000, exact 584×486, and 390×844 landing/product/overlay evidence with HTTP 200, no overflow, and zero browser/framework errors.
- [x] Commit as `bb9568f`, deploy READY Vercel Preview `dpl_GG8FyXjPuUqyom2vwsYUunGGTggU`, repeat direct browser verification, and prove Production remains on `dpl_BdasbDdxHCMruKdy7WSsrUibvcgK`.
- [ ] Product Owner reviews the replacement Preview and separately approves or rejects merge/Production promotion.

## Current correction: 319×501 homepage simplification

- [x] Dull the Signature Hoodie title without reducing reviewed product readability.
- [x] Move the eligible media viewer action to a compact upper-right scene control.
- [x] Change the visible landing cue to `Scroll and explore`.
- [x] Remove the four meaningless highlight chips and their now-unused derived summary/schema fields.
- [x] Add restrained camera motion to the flattened campaign still and preserve reduced-motion fallback.
- [x] Confirm no real campaign video file exists; require a supplied/exported MP4 or WebM for truthful walking/body motion.
- [x] Pass full `yarn verify` (35 files / 332 tests, zero vulnerabilities, optimized build).
- [x] Capture and inspect exact 319×501, 390×844, and 1440×1000 local evidence with no errors, overlays, or overflow.
- [x] Deploy tested commit `25b2e61` to READY Vercel Preview `dpl_9zwLjHHh9rSLScZoYG9QWVBf5TuK` and repeat direct 319×501/mobile/desktop checks; Production remains unchanged.
- [ ] Product Owner reviews the replacement Preview and separately decides whether to supply a real runway video.

## Current correction: homepage hierarchy and media discovery

- [x] Replace the subtle landing rule with an unmistakable centered scroll label and animated circular down control.
- [x] Reduce the Hoodie title hierarchy and present reviewed human-readable product copy beneath it.
- [x] Initially derive material/construction highlights only from reviewed product description/details; later remove the chips and derived fields after Product Owner review found them meaningless.
- [x] Replace the underlined action with a high-contrast media button and truthful view count.
- [x] Add a direct viewer jump to the disclosed still-derived motion study.
- [x] Remove the redundant lower product/release section so category navigation and footer follow the Hoodie scene.
- [x] Prove selected Modelize/MODA/detail/motion coverage and keep quarantined/superseded assets excluded.
- [x] Pass full `yarn verify` (35 files / 332 tests, zero vulnerabilities, optimized build).
- [x] Capture and inspect exact 641×686, 390×844, and 1440×1000 local evidence with no errors, overlays, or overflow.
- [x] Deploy tested commit `ed917ef` to READY Vercel Preview `dpl_6PWspKMjE5dA8QokMfaYPmR3MGz8` and repeat direct 641×686/mobile/desktop checks plus all-12-frame decoding; Production remains unchanged.
- [ ] Product Owner reviews the new Preview and separately approves or rejects merge/Production promotion.

## Current correction: in-page Signature Hoodie media viewer

- [x] Replace the second-panel Hoodie navigation CTA with an in-page full-screen viewer.
- [x] Support touch swipe, previous/next controls, keyboard arrows, Escape, close, position count, scroll lock, background inertness, and focus return.
- [x] Keep the gallery behind the same catalog/release visibility boundary; denied products expose neither a trigger nor a media payload.
- [x] Keep production limited to eligible release media while Local/Preview may add explicitly disclosed Signature Hoodie visual studies.
- [x] Minimize the home media contract and exclude raw IDs, arbitrary adapter labels, and provider jargon.
- [x] Pass focused tests and full `yarn verify` (34 files / 330 tests, zero vulnerabilities, optimized build).
- [x] Capture and inspect direct 1440×1000 and 390×844 local panel/gallery evidence with no URL change, errors, overflow, or provider-name copy.
- [x] Traverse and decode all 11 current gallery frames in a clean browser session.
- [x] Add and test `.vercelignore` so local credentials, recovered exports, temporary files, and QA evidence cannot enter the deployment upload.
- [x] Deploy this temporary branch to READY Vercel Preview `dpl_AGBftTVy679m6Bz16mYKQKs4C6JX`, repeat desktop/mobile interaction checks, and record the immutable Preview URL.
- [ ] Product Owner reviews the new Preview and separately approves or rejects merge/Production promotion. Production must remain unchanged meanwhile.

## Current correction: runway opener and provider-neutral design system

- [x] Keep the approved coastal runway campaign as the complete first viewport.
- [x] Keep the restored Signature Hoodie hero as the complete second viewport.
- [x] Add a direct, accessible scroll cue from the runway opener to the Hoodie panel.
- [x] Use factual campaign copy: `CARLOPHILLIPS / At the edge of life` and `Runway 001 / Lofoten`; do not invent a public tour or event.
- [x] Centralize the active storefront foundation in semantic CARLOPHILLIPS colour, type, spacing, sizing, motion, and interaction tokens.
- [x] Remove the underlying commerce-provider name from customer-facing copy and metadata while preserving internal integration truth.
- [x] Keep Hoodies active and the four future categories visibly disabled after the Hoodie hero.
- [x] Pass focused component/contract tests and full `yarn verify` (34 files / 325 tests, zero vulnerabilities, optimized build).
- [x] Capture and inspect direct local and Vercel Preview desktop/mobile landing, Hoodie, category, and PDP evidence with zero errors, broken images, provider-name copy, or overflow.
- [x] Deploy only the temporary branch to READY Vercel Preview `dpl_5zYviNwnc8WRFjwbECmnW1pPk8DA`.
- [ ] Product Owner reviews the Preview and explicitly approves or rejects merge to canonical `main` and Production promotion. Production remains on the restored p92-derived artifact until that action.

## Current bounded launch: two-stage runway landing

- [x] Save the approved reusable showcase and POD pipeline locally as `podpipe`.
- [x] Inspect current Vollebak and Zara landing composition without copying their assets or text.
- [x] Preserve the Product Owner-supplied wide coastal runway frame as the opening CARLOPHILLIPS campaign.
- [x] Move the existing three-frame Signature Hoodie runway sequence to the next full-screen panel on scroll.
- [x] Replace internal/process-heavy landing copy with direct premium product language.
- [x] Keep the sticky category rail after the Hoodie panel with Hoodies active and Shirts, Outerwear, Bottoms, and Accessories disabled.
- [x] Add deterministic tests proving campaign → Hoodie → categories ordering and that denied products cannot emit Hoodie runway media or an active category.
- [x] Pass focused tests, full lint, 323 tests, zero-vulnerability production audit, and optimized build.
- [x] Capture direct 1440×1000 and 390×844 campaign, Hoodie, and category evidence with zero broken images, runtime error text, console errors, or horizontal overflow.
- [x] Commit and push corrected candidate `ae57e29`; deploy and verify READY Vercel Preview `dpl_42uuiSoQqUyNnhJBbf35smBsud2n` at desktop and 390×844.
- [ ] Product Owner reviews the corrected Preview and separately authorizes any merge to canonical `main` or Production deployment.

## Current bounded delivery: complete Hoodie media ladder

- [x] Inventory all existing image, GIF, video, and 3D assets; confirm no existing motion or 3D file is available.
- [x] Assign one candidate owner per modality: MODA for multi-angle/on-model/video, Spin Studio for 360, and Instant 3D for the one-product 3D experiment.
- [x] Create and visually review a Preview-only on-body candidate from the Hoodie reference.
- [x] Repair the quarantined macro artifact into a new Preview-only material/embroidery candidate without overwriting the source.
- [x] Add both candidates to the disclosed Hoodie Preview study and keep them absent from production.
- [x] Install MODA and confirm its Shopify-embedded screen opens with 2 credits.
- [x] Create a quarantined AI back-reference hypothesis because no verified back photograph exists; never promote it as product truth.
- [x] Product Owner loaded the prepared MODA front/back files; Codex configured one ten-shot job priced at one displayed credit and generated it without Shopify export.
- [x] Download and visually review all ten MODA originals; select six Preview candidates and reject Shot 10 for a false generated neck-label mark.
- [x] Add the six selected MODA candidates to the Hoodie-only Preview study with an explicit unverified-back disclosure and production exclusion.
- [x] Install Instant 3D and inspect its entry screen.
- [ ] Restore access to the Instant 3D vendor dashboard; its `3dcloud.com.tr` iframe currently refuses the Shopify connection.
- [x] Add a disclosed still-derived animated WebP/GIF Preview study without calling it product video, 360, or 3D.
- [ ] Run one explicitly digital POD 360 experiment from approved product imagery using a compatible free AI-spin path; never describe it as photographed physical-product evidence.
- [ ] Replace broken Instant 3D with a compatible free photo-to-GLB experiment and inspect geometry/textures before headless integration.
- [ ] Obtain exact physical-product macro and on-model photography before treating fabric, fit, or construction as factual release media.
- [ ] Add an interactive headless 3D viewer only after an approved GLB/GLTF/USDZ is available and verified.
- [x] Pass full lint, 320 tests, zero-vulnerability production audit, and optimized build after the expansion.
- [x] Deploy a new Vercel Preview and capture direct 1280×720 and 390×844 evidence for the expanded still/motion sequence.

## Current bounded delivery: Signature Hoodie premium showcase

- [x] Diagnose the gap between the premium layout and the limited two-image product presentation.
- [x] Inspect Modelize, Spin Studio, MyDesigns, and a zero-subscription video/model candidate without accepting charges or broad permissions.
- [x] Publish only the two usable outputs from existing Modelize job `#137843f7`; leave the artifacted close-up unpublished.
- [x] Add a Signature-Hoodie-only Preview editorial study with explicit AI-assisted disclosure and no product-truth claims.
- [x] Prove by component tests that the study cannot render in production, on other products, or include the quarantined asset.
- [x] Pass full lint, 320 tests, zero-vulnerability production audit, and optimized build.
- [x] Capture direct desktop/mobile Preview evidence with all images loaded and no browser errors or overflow.
- [ ] Product Owner reviews the updated Preview; production remains unchanged pending a separate decision.
- [ ] Obtain 16–24 genuine angle images or a real GLB before using Spin Studio; its free one-product tier does not create missing source truth.
- [x] Install MODA after reviewing the Shopify permission screen; run only the bounded free candidate job recorded above and accept no paid plan or credits.

## Current bounded delivery: premium Hobby Preview

- [x] Apply the approved Vollebak/Zara reference direction without copying brand assets or inventing media.
- [x] Remove internal release jargon from live customer-facing home, collection, and PDP states.
- [x] Preserve Shopify as product/price/availability/checkout truth and keep raw identifiers server-only.
- [x] Verify desktop/mobile layouts, live product facts, ordered sizes, zero console errors, and no horizontal overflow.
- [x] Pass full lint, 318 tests, zero-vulnerability production audit, and optimized build.
- [x] Commit and push the tested candidate to the temporary branch.
- [x] Store the existing Shopify Storefront domain/token as sensitive Preview-only variables in Aditya's Hobby project.
- [x] Create and verify a non-production Vercel Preview; do not alter production or domains.
- [ ] Product Owner reviews the Preview and separately approves or rejects production promotion.

## Current bounded launch: one Signature Hoodie

- [x] Activate only the Signature Hoodie in Shopify and publish it to Carlophillips Headless.
- [x] Verify nine current Storefront variants, availability, prices, truthful media, and stable identity/facts fingerprints without exposing raw identifiers.
- [x] Add an exact-handle/fingerprint production launch policy and server-only Shopify cart creation.
- [x] Keep raw variant references off public routes, views, summaries, and evidence.
- [x] Prove a real no-order cart returns a trusted Shopify checkout redirect without payment or order submission.
- [x] Make home, shop, collections, and PDP truthfully reflect live Shopify commerce.
- [x] Pass full lint, 316 tests, dependency audit, build, HTTP routes, desktop/mobile screenshots, and console validation.
- [ ] Product Owner reactivates the suspended Vercel account/payment method and says `Vercel reactivated`.
- [ ] Resume at Vercel environment configuration, Preview deployment/verification, then production deployment under the existing launch authorization.
- [ ] Verify the live domain and Shopify checkout page after deployment; stop before payment/order.

## Current bounded correction: production visual direction

- [x] Recoverably isolate the uncommitted Cycle 20 fulfillment-contract draft without mixing or committing it.
- [x] Identify `9e1f5c3` as the VOLLBAK-aligned production source and `5077e3f` as the editorial detour.
- [x] Remove the editorial shell, `/about`, `/lookbook`, editorial-only copy abstraction, and stale sitemap entry.
- [x] Restore the production-aligned full-height storefront composition while retaining the server catalog/release boundary.
- [x] Keep the archived brand board explicitly separate from product/media proof and keep purchasing disabled.
- [x] Record the one-`main` Git model: temporary PR branches create Vercel Preview staging; Production follows approved `main`.
- [x] Product Owner granted full project authority; push the temporary branch, create PR #3, merge the approved correction to canonical `main`, deploy that exact merge, and restore the production domain.
- [ ] Cycle 20 owner/resume: Product Owner decides whether the isolated stash should be resumed in a later, separately scoped fulfillment-contract task.

## In progress: fitness baseline

- [x] Create `codex/cp-fitness-baseline` from the Hoodie staging-preview commit.
- [x] Establish truthful root governance, product, architecture, status, and task records.
- [x] Declare Yarn-only setup and add a tracked, secret-free `.env.example`.
- [x] Add ESLint and Vitest quality gates.
- [x] Add release-gate and Shopify normalization tests.
- [x] Repair Shopify search typing and bounded rate-limit retry behavior.
- [x] Regenerate `yarn.lock` and prove frozen clean install.
- [x] Run lint, tests, and production build.
- [x] Run local desktop/mobile browser verification and save evidence.
- [x] Review the final diff for architecture/documentation contradictions.

## Completed: server-backed product boundary

- [x] Add a machine-readable Product Release Record schema and validated Draft Hoodie record based only on existing evidence.
- [x] Introduce a server-only Shopify product adapter with explicit configured/unavailable/error states.
- [x] Add contract tests that prohibit mock fallback in release/checkout-capable flows.
- [x] Replace the product wrapper with a reusable, server-rendered, non-buyable PDP.
- [x] Verify local fixture and Shopify-failure states in desktop/mobile browsers.

## In progress: fail-closed cart and intent reconciliation

- [x] Add provider-neutral cart contracts and remove non-local local-cart fallback.
- [x] Add exact HTTPS checkout-host allow-listing and denial tests without creating an order.
- [x] Cover deterministic cart transitions and expired Shopify-cart replacement without printing identifiers.
- [x] Reconcile PRD, architecture, status, and tasks with the recovered original Product Owner intent.
- [x] Preserve the current installed-app snapshot as a capability/access audit backlog without claiming control.
- [x] Add a four-lane PipelineRun schema/state machine with idempotency, blocker isolation, exact resume points, and hard restricted-action gates.
- [x] Save a durable Hoodie local simulation that continues safe work around human blockers.
- [x] Add a machine-validated rich-media requirement matrix and approved-infeasibility release policy; keep the incomplete Hoodie blocked.
- [x] Run production build and desktop/mobile browser verification; save Cycle 3 evidence.
- [x] Keep all purchase, Shopify write, and production actions blocked.

## Completed: executable capability and bag policy

- [x] Validate capability registry evidence, callable surface, exact operations, restrictions, and blockers.
- [x] Replace the visible bag/cart wrappers with dedicated local-preview and unavailable Server Component states.
- [x] Prove Preview/production fixture denial and keep checkout unavailable without verified Shopify cart access.
- [x] Verify local desktop/mobile and Preview desktop browser states with no console errors or checkout links.

## Next bounded cycle: authenticated read-only Shopify audit

- [x] Attempt the existing Google/Shopify browser path before declaring a blocker; preserve the Shopify email-OTP verification tab.
- [x] Classify P0 Storefront/cart, Apliiq, Modelize, Spin Studio/ZS-Spin-View, MyDesigns, Flow, and CS Trending Products Finder by actual callable surface.
- [x] Capture a sanitized live authentication-gate record without revealing the account address/code, accepting charges, or changing Shopify state.
- [x] Update the capability registry and exact PipelineRun blockers/resume points to the observed email-OTP boundary.
- [x] Capture the safely observable current Hoodie Draft product/media facts without writes; exact variant fingerprint remains pending the supported Storefront read path.

## Current bounded POC path: Shopify to VOLLBAK-aligned storefront

- [x] Select the minimum stack: Apliiq, Modelize, one spin candidate, native Shopify Headless, Flow, and the existing CP Next.js storefront.
- [x] Record the 33-app live inventory, duplicate groups, callable surfaces, permissions/billing boundaries, screenshots, and exact blockers.
- [ ] Product Owner signs in to the existing Apliiq account; then observe the Hoodie product/design/variant mapping read-only.
- [x] Prove the existing native Headless public credential and required product/checkouts scopes with a secret-free live HTTP 200 query.
- [ ] Produce a sanitized Storefront Hoodie observation after an explicit controlled publication/channel decision; the current Draft is correctly withheld and must not be made Active implicitly.
- [x] Export the existing completed Modelize job read-only; retain two usable generated candidates for labeled local review and quarantine the artifacted third image.
- [ ] Product Owner approves exact Modelize media for the release and separately approves a plan/credit spend before any additional on-model generation; the free allowance is exhausted.
- [ ] Obtain a real Hoodie angle set and prove Spin Studio export/headless integration before enabling its theme embed; the documented default theme installation does not integrate with the CP Next.js storefront. Keep ZS-Spin-View inactive unless that proof fails.
- [ ] Review the inactive CP Flow, then obtain separate approval before activation or any Shopify write.
- [ ] Bind product, fulfillment, and approved media evidence; deploy a temporary-branch Vercel Preview only after its explicit approval.
- [ ] Run desktop/mobile/console/cart/checkout/rollback verification without submitting an order.
- [ ] Merge to `main`, publish, and activate production only after separate Product Owner approval.

## Current Hoodie media proof — local only

- [x] Render the usable Modelize product portrait and editorial-chair candidate through the existing local fixture/release boundary.
- [x] Keep the flawed Modelize detail output quarantined and absent from the storefront.
- [x] Prove desktop and direct 390×844 home/PDP rendering, loaded images, no horizontal overflow, no console warnings/errors, and no enabled purchase controls.
- [ ] Generate or obtain truthful exact-product on-model media after explicit credit/plan approval.
- [ ] Export one genuine spin/360 set from the selected installed app; do not substitute animation or repeated stills.
- [ ] Obtain real video and exact-product 3D/AR only if supported; otherwise record a Product Owner-approved infeasibility decision instead of fabricating them.
- [ ] Bind approved media plus live Shopify and Apliiq observations to the release record before any Vercel Preview.

## Completed: supported framework migration

- [x] Migrate from end-of-life Next.js `14.2.3` to supported `15.5.21` Maintenance LTS with React/React DOM `19.2.8`.
- [x] Convert dynamic route params to the Next.js 15 async API.
- [x] Prove a clean frozen Yarn install, zero-warning lint, tests, build, and desktop/mobile browser regression.

## Next unblocked local cycle

- [x] Replace permissive framing and wildcard CORS with tested fail-closed page/API response policy.
- [x] Prove same-origin local use, exact allow-list behavior, denied-origin behavior, and desktop/mobile storefront regression.
- [x] Run a production-dependency audit, remove unused vulnerable direct dependencies, and resolve the current advisory set to zero.
- [x] Make the supported-version/dependency audit policy machine-checkable in the normal quality gate.
- [ ] Retire temporary transitive overrides when Next declares patched ranges.
- [x] Define reusable designer-led and trend-led ProductCreationJob contracts; keep external runs, paid sources, Shopify writes, and publication approval-gated.
- [x] Save paired local simulations proving both modes converge on the same release/media/commerce/PipelineRun truth core while safe work continues around a human gate.

## Next unblocked truth-contract cycle

- [x] Strengthen Product Release Record transitions so `approved`/`released` cannot coexist with pending product/media/fulfillment approvals, missing fulfillment fingerprints, missing candidate evidence, or an incomplete media matrix.
- [x] Add explicit Draft/Staged/Approved/Released/Withdrawn transition tests and rollback prerequisites without mutating Shopify or deploying.
- [x] Bind a release-specific withdrawal plan to the Hoodie Draft while keeping rollback verification null and staging denied.

## Next corrective creation-contract cycle

- [x] Separate reusable ProductBrief v1 truth inputs from ProductCreationJob v2 execution metadata; add trigger/cadence, provenance/freshness, brand constraints, reference-use rules, and job idempotency/duplicate-suppression fields.
- [x] Prove scheduled and on-demand sanitized jobs cannot imply publication or product/media truth, and keep external research inaccessible without blocking safe work.

## Next storefront release-binding cycle

- [x] Bind product visibility decisions to the Product Release Record: local fixture stays labeled/non-commerce, Preview permits private staged review, and production denies every product not `released`.
- [x] Prove a Shopify observation alone cannot make an unapproved product customer-visible or checkout-capable in production.

## Next collection release-binding cycle

- [x] Replace the `/shop` and `/collections` editorial-shell wrappers with a release-aware server catalog boundary.
- [x] Include only handle-matched products permitted by the same environment/release policy; never substitute fixtures outside Local.
- [x] Keep collection cards and navigation non-commerce until Shopify cart/checkout capability is directly proven.

## Next storefront composition cycle

- [x] Bind the home featured-product navigation to the release registry so its counts/links cannot diverge from `/shop`.
- [x] Remove the non-PRD home/about/lookbook editorial detour and preserve the one-product Hoodie-first sequence.
- [x] Prove all home-to-catalog/PDP navigation paths stay source-labeled and non-commerce before live cart capability exists.

## Next active-commerce readiness cycle

- [x] Inventory and remove dormant browser-side product/cart modules that bypass the active server Commerce Gateway.
- [x] Retire public catalog-audit API paths and broad Storefront mutation exports.
- [x] Define the Storefront cart capability contract without performing a Shopify write; Cycle 18 separates reviewed variant truth from an eighth server-only mutation-resolution prerequisite.
- [x] Keep bag/checkout unavailable until authorized capability, no-order cart evidence, Released product truth, variant mapping, and Product Owner approval exist.

## Next variant-observation readiness cycle

- [x] Define a sanitized, provider-neutral Shopify Product Observation contract for product/variant/price/availability facts.
- [x] Add deterministic locale-independent variant and full-envelope fingerprint generation plus tamper/mismatch tests without claiming a live observation.
- [x] Require ready product-read capability evidence and approval bound to the exact observation fingerprint and handle.
- [x] Produce only a candidate release patch and prove fixture, simulation, review, and patch outputs do not mutate the Draft record.
- [x] Keep variant controls and cart disabled while live read-only Shopify evidence remains unavailable.

## Next observation-to-visibility cycle

- [x] Require Preview/production Shopify visibility decisions to match current variant-identity and commerce-facts fingerprints to reviewed release bindings.
- [x] Deny and discard stale/missing/malformed observation payloads without affecting other catalog candidates.
- [x] Preserve local fixture review as non-authoritative and non-commerce.
- [x] Prove repeated unchanged dynamic reads remain eligible while price/availability/title changes require a newly reviewed and separately applied binding.

## Next media-to-storefront truth cycle

- [x] Bind rendered Shopify media to the release Media Registry rather than relying only on matching release IDs.
- [x] Withhold unapproved, unprovenance-bound, wrong-product, duplicate, and stale media per asset without weakening catalog isolation.
- [x] Require complete current modality/fallback coverage for production while Preview remains explicitly partial, review-only, and non-commerce.
- [x] Prove raw IDs/unapproved URLs do not enter the view model and no fake spin/3D/video substitution occurs.

## Next customer-visible product-facts cycle

- [x] Extend reviewed commerce facts to every customer-visible Shopify field: description, vendor, product type, and any rendered detail/tagline.
- [x] Derive the release product and view model from reviewed facts so outer adapter payload edits cannot change approved customer copy.
- [x] Prove changed customer-visible copy is withheld until a newly reviewed and separately applied facts binding exists.

## Next option/variant presentation truth cycle

- [x] Replace flattened Shopify color/size lists with a sanitized release-bound variant presentation model that preserves exact canonical combinations, price, and availability.
- [x] Keep all Shopify combination controls disabled and non-commerce; bind fingerprint/currency without exposing a raw reference.
- [x] Prove duplicate/missing/extra dimensions, stale fingerprints/currency, outer raw maps, and opaque hashes cannot imply selection or cart mutation authority.
- [x] Separate an eighth evidence-backed server-only variant resolver gate from reviewed variant presentation.

## Next server-only variant-resolution contract cycle

- [x] Define a non-persisting server-only readiness decision that re-derives current facts and proves every reviewed opaque hash has exactly one current match.
- [x] Require exact environment/handle/fingerprint, evidence-bound Storefront product-read capability, and the locally verified CP resolver implementation.
- [x] Prove raw Shopify references never enter decisions, client summaries, routes, views, logs, durable evidence, or controls and no mutation is performed.

## Next selected-variant server adapter cycle

- [ ] Keep the current runtime unwired until Storefront cart capability, exact Product Owner activation approval, and the server gate are real.
- [ ] After those gates, define a per-request selected-variant server adapter that resolves one reviewed hash without returning the raw reference to the client.
- [ ] Keep checkout, payment, order, and publication authority separate even after cart eligibility.

## Blocked / approval required

- [x] Restore Vercel deployment access and verify Preview plus production desktop/mobile routes.
- [x] Complete Shopify authentication and the read-only Admin/app capability audit without accepting charges.
- [ ] Complete the separate Apliiq sign-in handoff, then inspect the exact Hoodie mapping read-only.
- [ ] Supply/verify Storefront product-read and cart credentials through ignored/Vercel secret storage; then prove live product, cart, and checkout behavior before enabling commerce.
- [ ] Keep Shopify writes, product activation, test orders, paid app actions, and fulfillment activation separately evidenced and fail-closed until tested.

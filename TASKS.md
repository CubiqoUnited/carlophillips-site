# Delivery Tasks

## Current local P0: evidence reconciliation and authority separation

- [x] Re-engage Sushma, Aarti, Richa, Pushpa, and Malti for independent architecture, completion, funnel, operational, and QA audits.
- [x] Reconcile the current fail-closed branch against `origin/main`, live Production observations, the 13-stage capability map, and divergent architecture commit `1f3fc46`; do not merge the destructive monorepo rewrite.
- [x] Preserve historical PipelineRun evidence while classifying current, historical, stale, superseded, conflicting, and missing evidence deterministically against an explicit date.
- [x] Mark the old Shopify authentication blocker superseded by later technical evidence without treating that later evidence as current operating authority.
- [x] Restrict the historical no-order cart proof to `cart-write-test`; keep operational `cart-write`, checkout, payment, and order blocked until exact release-bound activation evidence exists.
- [x] Add Evidence Health to the protected local admin and expose source status, freshness, technical access, operating authority, and blocking dependency without evidence paths or raw provider identifiers.
- [x] Replace implied Orders/Post-sale/Analytics operations with truthful canonical empty states and relabel Audit History as a static PipelineRun projection without durable/hash-chained persistence.
- [x] Add a visible mobile navigation scroll affordance and repair long-token table wrapping at 390×844.
- [x] Pass Yarn Classic 1.22.22 frozen install and full `yarn verify` (40 files / 382 tests, 0 production vulnerabilities, optimized build).
- [x] Pass 538/538 headless admin/public assertions, capture and inspect 58 screenshots at desktop/tablet/mobile, and prove 8/8 public screenshots have zero changed pixels.
- [ ] Product Owner authorizes `Approve CP fail-closed hotfix Preview only`; then create one immutable Preview for the containment candidate and verify it before any separate Production decision.
- [ ] Complete exact Apliiq mapping observation, sample approval/order/delivery, current Shopify release fingerprints, truthful media bindings, release transitions, controlled order, fulfillment/tracking, post-sale, analytics, real admin identity/RBAC, durable event store, and connector controls. None is complete or implied by the local admin.

## Current local P1: sale-to-post-sale lifecycle core

- [x] Define one provider-neutral, sanitized lifecycle event contract for payment/order, POD/production, shipment, support, return/refund, review, and reconciliation transitions.
- [x] Bind every event to opaque aggregate identity plus exact release, variant fingerprint, and environment; reject cross-binding events.
- [x] Enforce deterministic event hashing, previous-hash chaining, monotonic sequence/timestamps, exact idempotency replay, conflicting replay rejection, and event-ID reuse rejection.
- [x] Reject PII, raw order/provider/tracking/support identifiers, unknown fields, malformed money, and unbounded reason/details payloads.
- [x] Require Released/Production/checkout/controlled-order fingerprints before payment/order state and separate refund approval fingerprints before refund state.
- [x] Prove happy path plus payment failure, POD rejection, shipment delay, open/resolved support, return/partial/full refund, review gates, and reconciliation variance.
- [x] Prohibit lifecycle events that claim to approve release, checkout, refund authority, or publication.
- [x] Drive truthful empty and sanitized populated Admin projections from the pure reducer; keep the canonical screen empty because no controlled order exists.
- [x] Register only the local reducer/projection capability; keep signed provider webhook ingress, durable persistence, connectors, customer data, and all external mutations unavailable.
- [x] Pass full Yarn verification (41 files / 400 tests), 538/538 headless assertions, 58 desktop/tablet/mobile screenshots, and 8/8 exact zero-pixel public comparisons.
- [ ] After exact external approvals, configure the local verifier for the approved shop/topics/secret boundary and implement a durable quarantine inbox/outbox without weakening the provider-neutral reducer.
- [ ] Exercise one approved controlled order through payment, POD, delivery, support, return/refund, review eligibility, and reconciliation before changing any readiness stage from blocked/human-required.

## Current local P2: signed Shopify webhook verification boundary

- [x] Verify Shopify HMAC-SHA256 against the exact raw body with timing-safe comparison and no payload parsing before signature acceptance.
- [x] Require allowlisted shop/topic, delivery identity, provider trigger time, bounded replay/future windows, valid JSON, and a configurable one-megabyte maximum body.
- [x] Return only provider/topic plus shop, delivery, and payload fingerprints; exclude payload, raw shop/delivery identity, customer data, and every lifecycle/release/checkout/refund/publication authority.
- [x] Inject replay-claim storage and fail closed for replay or store failure without inventing durable persistence.
- [x] Register the verifier as local-only; keep the webhook inbox unavailable and every end-to-end order/post-sale stage blocked or human-required.
- [x] Pass exact-clean-commit full verification (42 files / 412 tests), 538/538 headless assertions, 58 desktop/tablet/mobile screenshots, and 8/8 exact zero-pixel public comparisons at `f6b6ee0`.
- [x] Bind the complete test/build/browser matrix and offscreen inspection to the exact implementation commit without claiming provider ingress.
- [ ] Product Owner selects exact Shopify topics/shop, secret owner/storage/rotation, privacy/retention policy, durable database/queue, payload sanitizer, retry/dead-letter rules, and incident owner before any listener or subscription is created.
- [ ] Implement and verify the authorized durable quarantine inbox/outbox and an explicit sanitized lifecycle bridge; never route a verified raw payload directly into the lifecycle reducer.

## Current local P3: admin command authorization boundary

- [x] Add a sanitized command-decision contract bound to the canonical reviewed command fingerprint without actor subject or target reference disclosure.
- [x] Require exact authenticated identity, actor/role match, least-privilege capability/operation/environment/side-effect/target grant, and short command TTL.
- [x] Require exact target/environment binding, non-empty unique evidence, capability registry operation/state, required approval records, and fresh connector evidence for any non-local operation.
- [x] Require a fresh command-bound idempotency claim and ready command-bound audit decision; reject unavailable, replayed, conflicting, expired, or mismatched evidence.
- [x] Enforce spend ceilings, rollback for write/publish/Production mutation, and Product Owner role for Production mutation.
- [x] Prove malformed, pending, expired, premature, overlong, identity/RBAC, capability, approval, connector, target, evidence, idempotency, audit, cost, rollback, and Production-owner denials without invoking a connector.
- [x] Pass and bind full Yarn (43 files / 426 tests), 538/538 browser assertions, 58 screenshot inspections, and 8/8 public zero-delta QA to exact clean implementation commit `216cb9d`.
- [x] Add a dedicated protected Commands section with the canonical empty queue and all missing execution dependencies; expose no form, button, endpoint, actor/target data, or synthetic command.
- [x] Bind the expanded 15-reviewer-section plus Product Owner Theme matrix to exact clean commit `25cf7e9`: 43 files / 427 tests, 567/567 browser assertions, 61 inspected screenshots, and 8/8 zero-pixel public comparisons.
- [ ] Product Owner selects identity provider, initial users/roles/grants, session policy, durable database/idempotency/audit/outbox, retention/privacy, connector scopes, retry/dead-letter rules, spend ceilings, and incident owner before any remote admin or executor is wired.
- [ ] Implement one authorized connector command at a time behind the policy and durable attempted/denied/approved/executed/failed/reconciled/rolled-back events; keep every unimplemented domain read-only.

## v1.2.2 design-system release candidate

- [x] Create `codex/cp-v1-2-2-design-system-release` from clean `e3dc7c2` without touching the separate `/Users/edv/Documents/cp` checkout.
- [x] Restore and bind the exact `bb9568f` customer contract: approved Lofoten opener, header/navigation, lower-left `ONE`, four tags, 12-view action, and inset truthful viewer.
- [x] Promote `app/design-tokens.css` as the sole CSS raw-value authority with strict lowercase kebab-case Primitive → Semantic → Component dependency.
- [x] Add one documented runtime serializer mirror and mechanically match its breakpoints, image sizing, theme, viewport, Open Graph, and motion behavior to CSS primitives.
- [x] Enforce naming, tier direction, domain coverage, reference closure/reachability, zero raw declarations, no source inline styles/arbitrary utilities, representative propagation, production content/media/layout, and cleanup boundaries in deterministic tests.
- [x] Exhaustively prove and recoverably remove the unreferenced `components/ui/` scaffold, scaffold-only hooks/helper/config, dormant Tailwind generation, and direct dependencies; preserve every asset, release record, report, and ambiguous file.
- [x] Update design-system guidance, v1.2.2 release notes, cleanup manifest, status/tasks, private package marker, and QA evidence.
- [x] Pass Yarn 1.22.22 frozen install, lint, 346 tests, zero-vulnerability production audit, optimized build, secret scan, dependency/reference/duplicate/dormant-code audit, and all-public-asset decode.
- [x] Capture and inspect 21 local screenshots across 1440×1000, 584×486, and 390×844 for hero, navigation, `ONE`, overlay, shop, PDP, and bag; traverse/decode all 12 views and prove background isolation, focus, Escape, arrows, swipe, scroll lock, reduced motion, zero overflow/errors/broken media/provider leakage.
- [x] Compare the candidate with saved `bb9568f` evidence and record exact geometry/content acceptance plus animation-timing pixel variance.
- [x] Sushma reviews the first committed candidate, publishes PR #8, and records immutable Preview evidence without changing Production.
- [x] Run an independent Preview review; retain its first NO-GO evidence and correct every reported parity offset through named design-system tokens.
- [x] Publish the corrected follow-up as PR #9 after PR #8 merged the superseded candidate without Production promotion.
- [x] Correct the measured Production parity roles through dedicated tokens and pass 222/222 live-Production geometry checks plus the complete interaction/media matrix; retain the subsequent manual Preview UAT NO-GO evidence for its commerce background and accessible media copy.
- [x] Correct the final UAT deltas through dedicated deep-canvas/base and black/PDP component tokens plus provider-neutral AI-assisted accessible-media presentation; pass the 18-route desktop/compact/mobile health/background matrix and save 21 screenshots with nine same-dimension comparisons.
- [x] Publish replacement manual Preview `dpl_5GTRSMYWSodpHrCYoEvnB9DGGiZa`, explicitly metadata-bound to final head `f82733ca`; treat the automatic fork-policy Vercel `FAILURE` as non-runtime evidence.
- [x] Receive independent desktop/compact/mobile UAT GO and Integration GO for that exact commit-bound Preview.
- [x] Merge the exact reviewed PR #9 to canonical `main` as `cd1cd771`, with parents `9b153bf1` and `f82733ca`; verify that merging created no Vercel deployment.
- [ ] Promote an approved artifact only through the separately authorized release path; verify both live aliases and retain the recorded rollback anchor.

## CI/CD bootstrap after PR #9

- [x] Create isolated `codex/cp-cicd-bootstrap` from canonical `main` at `cd1cd771` without touching the dirty primary checkout or display branch.
- [x] Add `CI / Verify` for pull requests and pushes to `main` using read-only permissions, Node.js 24, Yarn Classic 1.22.22, frozen install, concurrency cancellation, and `yarn verify`.
- [x] Add a protected manual immutable Vercel Preview workflow bound to the exact same-repository PR head SHA with Preview semantics, checkout disabled, no production aliases/promotion, protected-route smoke checks, and retained receipts.
- [x] Add a protected manual Vercel release-candidate workflow with pinned CLI, canonical-main binding, Production commerce semantics, checkout disabled, one prebuilt output deployed twice as distinct no-alias `staged-production` and `safe-fallback` artifacts, live Production drift proof, route/PDP smoke checks, and retained pair receipts.
- [x] Add manual Production promotion with required-reviewer and enable-variable gates, shared candidate/promotion concurrency, exact candidate/fallback/main/reviewed-anchor verification, no Production environment pull, no build or redeploy command, exact promoted-source identity proof, fail-closed route/PDP checks, and deterministic promotion of only the verified safe fallback after any attempted-promotion failure.
- [x] Make the captured current Production deployment a compare-and-swap drift anchor only; it is never a rollback target, including the currently observed `dpl_2s61reh2JATSRMCYfXYHnFnXT2bH`.
- [x] Scope the Vercel credential only to Vercel CLI steps in the protected `Preview` and `Production` environments; use protected environment variables for organization/project IDs, expose no deployment authority to pull-request CI, and remove pulled environment data before artifact upload.
- [x] Add deterministic workflow/receipt tests for artifact roles, distinct deployment identities, exact SHA/release bindings, metadata and alias tampering, provider-recorded promotion identity, fallback identity, and rejection of the unsafe current-Production anchor as recovery.
- [x] Parse all four corrected workflow YAML files and executable scripts, pass focused policy fixtures, frozen Yarn 1.22.22 install, full `yarn verify` (44 files / 468 tests), secret/diff audits, and exact integrated headless QA (689/689 findings, 68 screenshots, eight byte-identical public comparisons).
- [ ] Push the automation branch and open a separate draft PR; receive Aarti architecture GO and the first green `CI / Verify` run.
- [ ] After green CI, configure the `main` ruleset requiring PRs, one approval, `CI / Verify`, and blocked force-push/deletion; do not require the stale Vercel fork-policy status.
- [ ] Add required reviewers plus scoped `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` configuration to GitHub `Preview` and `Production`, then set `CP_PRODUCTION_PROMOTION_ENABLED=true` only in `Production`. Workflows alone grant no release authority.

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

- [ ] First remaining physical-media gate: verify the exact existing Apliiq Hoodie mapping read-only, then present one sample item/size/destination/total for explicit Product Owner order approval.
- [ ] After sample delivery, capture front/back/profiles/three-quarter/on-body/detail frames, a short product film, and 24–36 evenly spaced spin angles in one consolidated session.
- [ ] Derive and inspect genuine spin and GLB/USDZ candidates from the verified capture; do not treat AI studies as physical fit, fabric, construction, or fulfillment proof.

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
- [x] Verify authenticated read-only Apliiq access and saved product facts for product `5958463`: blank `IND4000`, black, front embroidery, and the retained artwork; this observation grants no mapping, sample, fulfillment, or release authority.
- [ ] Bind the exact provider variant/SKU fingerprint for the Hoodie mapping read-only, then order and inspect one exact physical sample only after separate Product Owner price approval.
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
- [x] Complete the separate Apliiq sign-in handoff and retain the read-only saved-product observation.
- [ ] Bind the exact Apliiq provider variant/SKU fingerprint and verify one physical sample; keep ordering, fulfillment, and release authority blocked meanwhile.
- [ ] Supply/verify Storefront product-read and cart credentials through ignored/Vercel secret storage; then prove live product, cart, and checkout behavior before enabling commerce.
- [ ] Keep Shopify writes, product activation, test orders, paid app actions, and fulfillment activation separately evidenced and fail-closed until tested.
# Production authority closure (2026-08-14)

- [x] Define all 12 production authorities with source, consumers, owner, validation, gate, failure mode and rollback.
- [x] Record one-main / temporary-PR / Vercel-Preview delivery policy and Preview/Production acceptance criteria.
- [x] Bind local deployment tooling to the read-only verified production Vercel project and reject unrelated linkage.
- [x] Add repository CI for frozen install, lint, tests, production audit, build and test evidence.
- [x] Clarify checkout present-but-denied, Git tag and Product Release Record responsibilities, crawl posture and minimal analytics boundaries.
- [ ] Sushma completes cross-functional review of Pushpa and Malti deliverables and the exact PR #9 candidate.
- [ ] Product Owner assigns human Platform/Security and Account/Billing owners.
- [ ] Authorized GitHub owner makes the exact `CI / Verify` check required on `main`; verify this read-only before release.
- [ ] Run exact-commit Vercel Preview acceptance and capture evidence; no production alias or promotion.
- [ ] Product Owner explicitly approves or rejects merge and Production only after all applicable gates pass.
# Current closure: canonical authority, end-to-end readiness, and protected admin

- [x] Reconcile every identifiable CP Codex task plus Git, GitHub, Vercel, PRD, architecture, status, tasks, release, media, run, and capability evidence.
- [x] Run independent Sushma/Aarti/Richa/Pushpa/Malti architecture, security, evidence, product, funnel, UX, admin, and QA audits.
- [x] Identify the live P0 where a historical single-product launch bypasses the Draft Product Release Record and empty Media Registry bindings.
- [x] Remove the ad-hoc launch config/policy and every synthetic Released/cart/media authority path in the isolated candidate.
- [x] Make `/api/checkout` perform no Shopify read or cart mutation until canonical Released evidence and a separate release-bound checkout authorization exist.
- [x] Require both `cartAllowed` and independent `checkoutAllowed` before rendering any checkout form.
- [x] Add one non-authoritative machine-readable end-to-end readiness index with owners, evidence counts, exact human actions, and resume points.
- [x] Add reviewed admin-command and hash-chained operational-event contract foundations.
- [x] Add explicit capability entries for payment/order, fulfillment, tracking, support, returns/refunds, reviews, analytics, admin identity/audit, webhooks, and durable execution.
- [x] Implement the local-only read-only `/admin` control plane across all required information areas with server access enforcement, noindex, sanitization, and no mutation UI.
- [x] Pass final integrated source checks: zero-warning lint, 39 files / 374 tests, zero production vulnerabilities, and optimized build.
- [x] Capture and inspect reviewer/Product Owner/denied admin plus public-regression evidence at 1440×1000, 1024×768, and 390×844; 459/459 checks cover console, network, decoded media, overflow, accessibility, provider/raw-ID leakage, Theme authorization/API boundaries, and canonical Draft checkout denial.
- [x] Bind the tested integrated candidate at `05d3d72` and its evidence report without touching the unrelated dirty worktree.
- [x] Audit independent architecture commit `1f3fc46`; record why its 312-file, nine-commits-behind monorepo rewrite cannot be directly merged without deleting/conflicting with current admin, Theme, release, and PR #9 parity work.
- [x] Resolve the `1f3fc46` port decision: reject its destructive 1,072-file direct comparison and unsafe raw webhook/PODPIPE authority; selectively implement the higher-priority canonical release-proof bindings without removing the current Admin, Theme, routes, or fail-closed authority.
- [x] Require immutable release/candidate/fingerprint descriptors for observation review, build, staging, rollback, sample, and Production capability evidence.
- [x] Require an exact provider-mapped physical sample with verified fit, colour, artwork placement, finish, and approval evidence before Approved.
- [x] Bind product, media, and fulfillment approvals to the complete release-evidence fingerprint and reject altered manifests, tampered evidence, and cross-release/cross-candidate reuse.
- [x] Require a fresh post-approval Production ACTIVE observation with matching reviewed variant identity and commerce facts before Released.
- [x] Reconcile obsolete Shopify-login capability blockers and make Admin state explicit as `Release: Draft` plus `System: Not end-to-end ready`.
- [x] Pass 43 files / 433 tests, zero-vulnerability audit, optimized build, 669/669 headless checks, 61 screenshots, inspected desktop/mobile release views, and 8/8 exact zero-pixel public comparisons.
- [ ] Product Owner authorizes a new immutable fail-closed Preview; no Preview deployment is implied by this local task.
- [ ] Product Owner reviews exact Preview containment evidence and separately authorizes or rejects Production containment.
- [ ] Verify Apliiq mapping and one physical sample through the sticky handoff; no spend is authorized yet.
- [ ] Select identity/RBAC, durable event/read-model storage, connector owners, privacy/retention, cost, and incident boundaries before remote admin or mutations.
- [ ] Run one separately approved controlled order through payment, POD receipt, fulfillment, shipment, tracking, support, return/refund, and review eligibility before claiming end-to-end readiness.

# Product Owner-only Theme token proposals

- [x] Keep the feature isolated on temporary branch `codex/cp-admin-theme-tokens`; do not merge, push, deploy, publish, or touch Production.
- [x] Add root `theme.json` as the exact four-value authority for accent colour, corner radius, base spacing, and base text weight.
- [x] Bind active semantic/component styling and the derived spacing scale to `theme.json`; keep the intentionally removed Tailwind surface absent.
- [x] Restrict Theme read/write to a distinct server-only Product Owner credential and hide the navigation/direct route from reviewers.
- [x] Enforce same-origin, local/Vercel/commerce-environment, explicit-write, `codex/*` branch, exact-schema, contrast, atomic-write, and stale-revision gates.
- [x] Make the screen state exactly-four/no-layout scope, current/proposed values, local uncommitted proposal semantics, and the mandatory PR → Preview → review → merge path.
- [x] Pass full lint/test/audit/build QA and capture inspected desktop/mobile Theme plus unchanged public storefront comparisons under `test_reports/`.
- [x] Commit the verified scoped candidate and report the exact SHA; no push or deployment.

# Remote Product Owner admin identity

- [x] Add a fail-closed Clerk adapter limited to `/admin/*` and `/api/admin/*`, preserving local reviewer/Product Owner RBAC and public-route isolation.
- [x] Authorize Vercel Preview/Production only for the exact configured immutable Clerk Product Owner subject; reject incomplete configuration, absent sessions, other users, and non-Vercel remote surfaces.
- [x] Add a restricted `/admin/sign-in` entry point that is absent unless all provider and owner-identity configuration is valid.
- [x] Pass full lint/test/audit/build and desktop/tablet/mobile local RBAC shell QA, plus identical-fixture public parity against `f737716`.
- [ ] Product Owner installs Clerk only into the verified Vercel project on a no-cost plan, enables restricted sign-up/MFA, and returns the non-secret immutable `user_...` ID.
- [ ] Sushma integrates the isolated auth commit into the canonical candidate and verifies real unauthenticated, wrong-user, Product Owner, expired-session, and origin/CSRF behavior in an immutable Vercel Preview.
- [ ] Implement and review a least-privilege GitHub adapter that may update only root `theme.json` on a temporary `codex/*` branch and open a draft PR; remote saves stay disabled until then.
- [ ] Merge and Production promotion remain blocked until required GitHub checks/protection, exact Preview evidence, rollback, and Product Owner approval are all recorded.

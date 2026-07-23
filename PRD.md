# CARLOPHILLIPS Product Requirements

Status: working product definition, not a production-readiness claim. Updated 2026-07-22.

## Objective

CARLOPHILLIPS is the first proof of concept for a reusable premium POD-to-publish system. The experience layer is Next.js; Shopify remains commerce truth; approved POD providers supply manufacturable products and fulfillment mappings. The Signature Hoodie is the first complete acceptance journey through that system, not permission to reduce the product to one static PDP. Reusable interfaces and evidence records must support later products and brands without rebuilding the pipeline.

## Coordinated delivery lanes

1. **Product/POD truth:** supplier selection, real blank/SKU, decoration feasibility, variants, price, and fulfillment mapping.
2. **Media truth:** an asset matrix and approved product, model, lifestyle, detail, spin/3D where feasible, and video assets. High-definition rich presentation is required for every production candidate; unsupported effects must not be faked.
3. **Commerce/frontend:** an original, Vollebak-confidence Next.js experience backed by Shopify catalog, cart, and checkout truth with responsive and accessible states.
4. **Agentic orchestration:** research, design brief, provider routing, media jobs, Shopify Draft staging, validation, human approval, publish handoff, logs, retries, and exact blocker/resume records.

The system has two creation modes: designer-led inputs (brand rules, ideas, mockups, references, categories, price position, cadence) and trend/current-affairs-led inputs (fashion signals, news, seasons, culture, and other time-sensitive signals). Both produce Draft-only candidates through the same truth and approval contracts, never autonomous publication. A ProductBrief owns source attribution/freshness, binding brand constraints, inspiration-only reference rules, and candidate truth limits; its ProductCreationJob owns the on-demand/scheduled trigger and duplicate-suppression identity. Inputs do not become product facts: trend signals remain research-only, and neither a schedule nor either mode can approve media, authorize commerce, execute an external/paid tool, write Shopify, or publish without the corresponding evidence and Product Owner gate.

## Required customer path

1. A customer sees an approved product and truthful media in the Next.js storefront.
2. Product title, variant, price, availability, and media resolve from Shopify.
3. Variant selection creates or updates a Shopify cart.
4. Checkout redirects to Shopify Checkout.
5. A test order proves payment, POD handoff, fulfillment, tracking, support, and returns in an approved non-production or controlled production exercise.

No fallback mock product or local-only cart may masquerade as a successful boundary in this path.

## Experience requirements

- Original CARLOPHILLIPS identity with fullscreen, editorial, product-first presentation.
- Responsive desktop and mobile behavior, keyboard access, useful alt text, and explicit loading/error/unreleased states.
- Shopify-native image, video, external-video, and 3D records are rendered when real approved assets exist; each production candidate must satisfy its approved media matrix before release.
- Spin/360, AR, try-on, on-model, campaign, and product-film claims stay absent until their source assets and rights are verified.

## Release gates

- Products are hidden by default.
- Draft review requires both `NEXT_PUBLIC_SHOW_PRODUCTS=true` and `NEXT_PUBLIC_PREVIEW_DRAFT_PRODUCTS=true`.
- A preview is not approval to publish, sell, deploy to production, or change Shopify state.
- A Shopify observation is necessary but never sufficient for visibility: Preview additionally requires matching, evidence-complete Staged-or-later release data; production requires matching, evidence-complete Released data. Neither decision enables purchasing until the cart/checkout journey is separately proven.
- A Shopify product observation must carry durable evidence tied to the exact ready Storefront product-read capability. Its complete review envelope—source, authority, environment, timestamp, capability evidence, product facts, and sanitized variants—is fingerprinted. Acceptance requires approval bound to that exact fingerprint and handle and produces only a candidate patch; applying any patch to a Product Release Record is a separate authorized step.
- Variant fingerprints cover stable variant identity (hashed reference, title, options). Price and availability changes intentionally leave that identity fingerprint stable but change the full observation fingerprint.
- Customer cart UI requires a visible Shopify Gateway decision, matching Released record, an exact match between the current observation fingerprint and the release-bound variant fingerprint, a sellable mapped variant, evidence-backed Storefront `cart-write` capability, explicit Product Owner activation approval, and the server-only environment gate. Credentials, flags, or installed apps cannot satisfy the other prerequisites.
- Checkout, payment, and order authority remain separate from cart eligibility. A cart-eligible decision must still return checkout disabled until a separate approved live proof exists.
- Release records move sequentially through Draft, Staged, Approved, and Released. No state may be skipped. Staged requires immutable candidate/build/private-staging and rollback-plan evidence; Approved requires complete product/media/fulfillment truth and approvals; Released requires a current Active Shopify observation and verified rollback evidence.
- Production requires Product Owner approval plus direct evidence for domain, product/variant truth, checkout, payment, POD mapping, fulfillment, tracking, support, and returns.

## Delivery sequence

The sequence is resolved by Product Owner intent:

1. Move the Signature Hoodie through the complete reusable system: Product/POD truth, required rich media, Shopify-backed private commerce, resumable orchestration, approvals, gated checkout evidence, fulfillment, tracking, support, returns, reviews, and release evidence.
2. Prove reuse with a meaningfully different product using the same contracts, components, provider adapters, media registry, Commerce Gateway, and PipelineRun core.
3. Expand to the broader catalog and future brands only through approved release records. The prior 12-product observation is later reuse/scale input, not a competing current lane and not evidence those products are release-ready.

## Acceptance criteria

- Governance, status, tasks, architecture, setup, and environment documentation agree with runtime behavior.
- Yarn install is reproducible; lint, automated tests, and production build pass.
- The selected product lane uses Shopify-backed product/variant/cart data without silent commerce fallbacks.
- Browser and public API surfaces cannot call low-level Shopify product/cart transports outside the server Commerce Gateway and cart-activation contract.
- Fixture/simulation observations, blocked reviews, accepted review outputs, and candidate patches cannot mutate a Product Release Record without a separate explicit apply operation and authorization.
- `/shop` and `/collections` count and render only individually release-eligible records; denied or unavailable candidates contribute only to withheld counts/reason codes and never leak product payloads.
- Home featured-product navigation and counts are derived from that same catalog decision. When no product is eligible, home exposes only candidate/withheld counts and a catalog-state link—never a product payload or PDP link.
- The first accepted Hoodie release proves all four lanes through a versioned Product Release Record; the next product can reuse the same provider, media, commerce, and approval contracts.
- Required rich media is real, provenance-bound, rights-checked, and approved; missing assets block release rather than trigger simulated frontend effects.
- Shopify/app capabilities have an evidence-backed access classification; an installed app alone is not treated as controllable.
- Local desktop/mobile browser evidence exists with no relevant console errors.
- Preview and production are separately configured and tested.
- External human actions and exact code resume points are recorded.

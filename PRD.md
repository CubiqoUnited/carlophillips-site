# CARLOPHILLIPS Product Requirements

Status: working product definition, not a production-readiness claim. Updated 2026-07-23.

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

## Admin Theme requirements

- Theme editing is Product Owner-only and changes exactly four values: accent colour, corner radius, base spacing, and base text weight.
- The sole editable authority is root `theme.json`; storefront semantic/component CSS must derive those values from it. The screen must never expose layout, component, section, page-structure, commerce, or release controls.
- Accent proposals must preserve at least 4.5:1 contrast against both canonical dark canvases, and status meaning must never rely on accent colour alone.
- A save is a same-origin, local-only, atomic, optimistic-revision-checked, uncommitted `codex/*` branch proposal. QA, commit, pull request, immutable Vercel Preview, Product Owner review, merge, and Production approval remain separate gates.
- General review credentials cannot discover or read the Theme route. Vercel and non-local commerce environments deny Theme reads/writes; no theme action may write Production directly.

## Release gates

- Products are hidden by default.
- Draft review requires both `NEXT_PUBLIC_SHOW_PRODUCTS=true` and `NEXT_PUBLIC_PREVIEW_DRAFT_PRODUCTS=true`.
- A preview is not approval to publish, sell, deploy to production, or change Shopify state.
- A Shopify observation is necessary but never sufficient for visibility: Preview additionally requires matching, evidence-complete Staged-or-later release data; production requires matching, evidence-complete Released data. Neither decision enables purchasing until the cart/checkout journey is separately proven.
- A Shopify product observation must carry durable evidence tied to the exact ready Storefront product-read capability. Its complete review envelope—source, authority, environment, timestamp, capability evidence, product facts, and sanitized variants—is fingerprinted. Acceptance requires approval bound to that exact fingerprint and handle and produces only a candidate patch; applying any patch to a Product Release Record is a separate authorized step.
- Variant fingerprints cover stable variant identity (hashed reference, title, options). Commerce-facts fingerprints cover canonical product and variant facts, including price, currency, and availability, while excluding per-read timestamp/environment/capability metadata. The immutable full observation fingerprint binds all review/audit fields. Runtime freshness compares variant identity and commerce facts to the reviewed release bindings; it does not require a fresh read to reuse the approved observation timestamp.
- Commerce facts also bind every Shopify-sourced customer copy field used or reserved by the active product view: title, plain description, vendor, product type, tagline, and ordered details. The release product is reconstructed from the validated observation, so outer adapter fields, raw HTML, or injected story text cannot override reviewed presentation.
- Product status wording is derived from the environment and release decision, not adapter copy. Preview identifies private review; production Released identifies released product facts while stating that purchasing is separately disabled. No marketing story is inferred when reviewed story evidence is absent.
- Shopify variants are presented only as exact reviewed combinations with canonical dimensions, current availability, price, and opaque reference hashes bound to the release variant fingerprint. Controls remain disabled review information. Raw adapter maps are discarded, and cart mutation additionally requires an evidence-backed server-only resolver for the same fingerprint.
- Resolver readiness consumes raw Shopify references only inside a `server-only` entry, re-derives current observation identity/facts, and proves exact one-to-one coverage. Its sanitized decision exposes no raw reference or selected mutation target and explicitly denies cart, checkout, and order authority. A locally verified resolver implementation is not a verified Storefront write capability.
- The existing Storefront loader necessarily receives raw references before hashing them into an observation. The readiness wrapper is the sole production entry for the resolver computation, not the sole raw-ID recipient. It remains unwired: cart activation passes a null resolver decision until future server orchestration can provide a fresh raw load under every approval gate.
- Cart activation accepts only an exact, current, operationally verified `shopify-storefront-cart` capability decision on the Storefront callable surface; an unrelated ready capability is insufficient. Historical no-order evidence is `cart-write-test` only and must return `evidence_only`, never operational `cart-write` readiness.
- Preview and production withhold missing, malformed, tampered, stale-variant, or stale-commerce-facts observations per product without leaking their payloads or withholding an otherwise eligible catalog candidate.
- Shopify media is independently matched to approved Media Registry assets by a deterministic hash over render-relevant identity, type, canonical URL, and preview/fallback facts. Preview may render only the matched approved subset and must identify missing modalities. Production denies the product unless current approved bindings cover every required non-waived modality and required accessible fallback.
- Customer cart UI requires a visible Shopify Gateway decision, matching Released record, an exact match between the current and release-bound variant fingerprints, a sellable mapped variant, evidence-backed Storefront `cart-write` capability, explicit Product Owner activation approval, and the server-only environment gate. Credentials, flags, or installed apps cannot satisfy the other prerequisites.
- Checkout, payment, and order authority remain separate from cart eligibility. A cart-eligible decision must still return checkout disabled until a separate approved live proof exists.
- Order-to-post-sale events must bind opaque order identity to the exact release, variant fingerprint, and environment; reject PII/raw provider references; preserve idempotency, monotonic sequence, timestamp order, and a recomputed hash chain; and enforce valid payment/order/POD/shipment/support/return/refund/review/reconciliation transitions. Observing a lifecycle event cannot create release, checkout, refund, publication, or Production authority.
- A provider webhook may enter quarantine only after verification over its exact raw bytes, provider signature, allowlisted source/topic, delivery identity, bounded trigger time, body limits, and a durable replay claim. The verifier's result must be fingerprint-only: it returns no payload, raw shop or delivery identity, customer data, or lifecycle/release/checkout/refund/publication authority. Verification cannot itself sanitize a provider payload, create a lifecycle event, or authorize an external side effect.
- An admin command may become an execution candidate only through a deterministic decision bound to the exact command fingerprint, authenticated actor and least-privilege grant, target fingerprint, environment, capability/operation, required approvals and evidence, fresh idempotency claim, ready append-only audit, exact connector evidence, TTL, cost ceiling, rollback where possible, and Product Owner control for Production mutation. The decision exposes no actor subject or target reference, invokes no connector, and creates no release, checkout, refund, or publication authority.
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
- Repeated unchanged Shopify reads remain eligible despite new observation timestamps or a correct environment change; changed title, price, currency, availability, or variant facts require a newly reviewed and separately applied release binding.
- Home featured-product navigation and counts are derived from that same catalog decision. When no product is eligible, home exposes only candidate/withheld counts and a catalog-state link—never a product payload or PDP link.
- The first accepted Hoodie release proves all four lanes through a versioned Product Release Record; the next product can reuse the same provider, media, commerce, and approval contracts.
- Required rich media is real, provenance-bound, rights-checked, and approved; missing assets block release rather than trigger simulated frontend effects.
- Raw or unapproved Shopify media, stale URLs, type mismatches, duplicate bindings, and assets absent from the release manifest never reach the customer view model.
- Shopify/app capabilities have an evidence-backed access classification; an installed app alone is not treated as controllable.
- Local desktop/mobile browser evidence exists with no relevant console errors.
- Preview and production are separately configured and tested.
- External human actions and exact code resume points are recorded.
- Lifecycle duplicate, conflicting replay, tamper, stale/out-of-order, cross-release/variant/environment, PII/raw-reference, missing-authority, payment-failure, POD-rejection, shipment-delay, support, return/refund, review, and reconciliation-variance paths fail closed in deterministic tests before any provider ingress is connected.
- Provider webhook verification fails closed for missing configuration/secret/store, body or HMAC tamper, missing/malformed headers, denied shop/topic, invalid/stale/future time, invalid JSON, replay, and replay-store failure; no network listener or lifecycle mutation is enabled by those tests.
- Admin command policy tests prove malformed/pending/stale/overlong commands, unverified identity, actor/grant mismatch, missing/blocked capability, wrong operation, target/evidence mismatch, replay/conflict/unavailable idempotency, missing audit/connector, approval mismatch, spend ceiling, rollback, and non-owner Production mutation all fail closed before any executor exists.

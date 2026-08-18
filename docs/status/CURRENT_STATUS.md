# Current Status — Fitness Cycle 19

Updated: 2026-07-23. The detailed repository status is maintained in `/STATUS.md`.

## Exists

- Next.js editorial shell and route surfaces.
- Fail-closed product flags and explicit local-only fixture mode.
- Provider-neutral Commerce Gateway, server-only Shopify product adapter, reusable PDP, and explicit unavailable page.
- A server-side release registry binds the Hoodie route to its Product Release Record and Media Registry. Preview requires complete Staged-or-later evidence; production requires complete Released evidence, and purchasing remains disabled.
- `/shop` and `/collections` share a release-aware server catalog boundary. It resolves registry handles individually, discards denied payloads, reports candidate/visible/withheld counts, and supports future multi-product records without activating the dormant catalog fixtures.
- Home consumes that same server catalog decision through a minimized schema-validated summary. Its counts and optional PDP link cannot diverge from `/shop`; denied decisions expose no product payload.
- Draft Hoodie Product Release Record and media manifest.
- Server-owned cart activation contract with eight release/variant-resolution/capability/approval prerequisites and checkout hard-disabled.
- Pure Shopify response normalization plus one server-only, read-only product adapter; broad product/cart clients and mutation exports are removed.
- Canonical Product Observation and review contracts hash raw variant references; separately bind variant identity, commerce facts, and the full review envelope; require evidence tied to a ready product-read capability; and return only a non-applying candidate release patch.
- Preview/production visibility validates the fresh sanitized observation, then compares variant identity and commerce facts to reviewed release bindings. A new read timestamp does not cause false staleness; changed facts, malformed envelopes, and tampering are withheld per candidate.
- Commerce facts now include all Shopify-derived customer copy. The release product is whitelist-derived from the validated observation, so outer title/description/vendor/type/tagline/details/story/HTML cannot override reviewed presentation.
- View-model status language is environment/release-aware: Preview says private review; production Released says facts are released and isolates the still-disabled cart/checkout gate. Story remains neutrally unavailable without reviewed evidence.
- Shopify variant presentation is a fingerprint/currency-bound, review-only exact-combination model. It rejects ambiguous option dimensions and raw adapter mappings; every combination control remains disabled.
- Cart activation now has eight gates because reviewed variant truth and server-only mutation resolution are distinct. A schema-validated readiness evaluator re-derives fresh facts and proves one-to-one hash coverage without returning raw IDs or authority. Its locally verified implementation and `server_only` runtime decision are distinct; cart orchestration remains intentionally unwired and supplies null.
- Shopify media is filtered through approved, evidence-backed, hashed Media Registry bindings before the view model. Preview exposes partial-media review truth; production requires current coverage for every non-waived modality and fallback.
- Provider-neutral Commerce Cart and PipelineRun contracts with local policy/state-machine implementations.
- Executable capability discovery and dedicated source-labeled bag/cart Server Component routes.
- A durable four-lane Hoodie simulation with exact blockers and every restricted approval still pending.
- A ProductCreationJob contract plus paired designer-led/trend-led local simulations that bind the same Product Release Record, Media Registry, Commerce Gateway, and PipelineRun schema.
- ProductBrief v1 now owns publisher/retrieval provenance, deterministic freshness, binding brand constraints, inspiration-only reference use, and truth limits. ProductCreationJob v2 embeds the brief and owns on-demand/scheduled cadence plus retry/equivalent-input duplicate suppression.
- Yarn lockfile, ESLint, Vitest, and production build commands.
- Next.js `15.5.21` Maintenance LTS with React/React DOM `19.2.8`, plus async route-param compatibility.
- Fail-closed page framing/security headers and exact-origin API CORS policy.
- JSON Schemas for Commerce Product, Commerce Cart, Product Media Asset, Release Decision, Product Release Record, Product Creation Job, and PipelineRun.
- Hard Product Owner gates for external execution, spend, credits, samples, Shopify writes, publish, and production. Creation inputs remain candidate-only; fixture/trend evidence cannot become production truth.
- The scheduled trend simulation is explicitly stale, fixture-sourced, research-only, human-pending, and unable to trigger external research; four safe PipelineRun items remain actionable around that blocker.
- A strict release-transition decision contract and non-mutating policy for Draft → Staged → Approved → Released plus rework/withdrawal paths.
- A nine-modality Media Registry gate that requires approved bound assets with verified exact-product match, rights, quality evidence, correct modality type, and accessible fallbacks.
- A Hoodie-specific withdrawal plan and a formally Staged Product Release Record bound to exact Shopify review, build, protected Preview, fulfillment mapping, and rollback-plan evidence.

## Partial

- Signature Hoodie evidence: product/design facts and one recorded front candidate exist; complete media, approvals, Shopify-backed PDP, cart, and operations proof do not.
- Shopify integration: the product route calls the gateway/adapter and release registry, but local read-only configuration is incomplete, so current Shopify product data is not observed.
- Release controls: Draft record exists with missing Shopify variant, commerce-facts, observation-review, and provider bindings plus pending approvals. Staging is explicitly denied until those bindings, immutable commit/build evidence, and private staging evidence exist.
- App capability access: Product Owner reconfirmed 30 installed apps and reports a logged-in Product Owner browser. The agent's managed session and all API/app-private scopes remain unverified and non-callable; the minimum-access model avoids blanket app access.
- Product observations: canonicalization/review behavior is locally proven, but no current live Shopify observation, capability evidence reference, or exact approval exists.
- Media bindings: filtering and production-completeness policy are locally proven, but the Hoodie has no approved current Shopify media binding. Its front remains pending and two details remain quarantined.

## Proposed

- Active Shopify cart operations and fulfillment adapter implementation beyond the recorded mapping.
- A narrow selected-variant Storefront cart adapter only after evidence-backed capability, fresh server orchestration, and activation approval.
- Staged/approved/released workflow transitions after evidence and Product Owner approval.

## Missing

- Successful current Shopify-backed product/variant observation.
- Active Shopify cart/checkout flow.
- Results beyond the email-OTP gate from the authorized authenticated read-only capability/access audit.
- Verified payment, fulfillment, tracking, support, and returns.
- Proven production service availability.

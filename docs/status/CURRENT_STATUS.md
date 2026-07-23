# Current Status — Fitness Cycle 12

Updated: 2026-07-22. The detailed repository status is maintained in `/STATUS.md`.

## Exists

- Next.js editorial shell and route surfaces.
- Fail-closed product flags and explicit local-only fixture mode.
- Provider-neutral Commerce Gateway, server-only Shopify product adapter, reusable PDP, and explicit unavailable page.
- A server-side release registry binds the Hoodie route to its Product Release Record and Media Registry. Preview requires complete Staged-or-later evidence; production requires complete Released evidence, and purchasing remains disabled.
- `/shop` and `/collections` share a release-aware server catalog boundary. It resolves registry handles individually, discards denied payloads, reports candidate/visible/withheld counts, and supports future multi-product records without activating the dormant catalog fixtures.
- Home consumes that same server catalog decision through a minimized schema-validated summary. Its counts and optional PDP link cannot diverge from `/shop`; denied decisions expose no product payload.
- Draft Hoodie Product Release Record and media manifest.
- Dormant Shopify cart/checkout modules.
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
- A Hoodie-specific withdrawal plan and machine-readable staging-readiness denial with five exact blocker/resume records.

## Partial

- Signature Hoodie evidence: product/design facts and one recorded front candidate exist; complete media, approvals, Shopify-backed PDP, cart, and operations proof do not.
- Shopify integration: the product route calls the gateway/adapter and release registry, but local read-only configuration is incomplete, so current Shopify product data is not observed.
- Release controls: Draft record exists with missing variant fingerprints and pending approvals. Staging is explicitly denied until Shopify/provider fingerprints, immutable commit/build evidence, and private staging evidence exist.
- App capability access: Product Owner reports 30 installed apps, but the latest managed-browser attempt reached Shopify login before Admin. The per-app access/authentication/fee-risk matrix remains entirely unverified and non-callable.

## Proposed

- Active Shopify cart operations and fulfillment adapter implementation beyond the recorded mapping.
- Staged/approved/released workflow transitions after evidence and Product Owner approval.

## Missing

- Successful current Shopify-backed product/variant observation.
- Active Shopify cart/checkout flow.
- Results beyond the email-OTP gate from the authorized authenticated read-only capability/access audit.
- Verified payment, fulfillment, tracking, support, and returns.
- Proven production service availability.

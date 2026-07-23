# Current Status — Fitness Cycle 3

Updated: 2026-07-22. The detailed repository status is maintained in `/STATUS.md`.

## Exists

- Next.js editorial shell and route surfaces.
- Fail-closed product flags and explicit local-only fixture mode.
- Provider-neutral Commerce Gateway, server-only Shopify product adapter, reusable PDP, and explicit unavailable page.
- Draft Hoodie Product Release Record and media manifest.
- Dormant Shopify cart/checkout modules.
- Provider-neutral Commerce Cart and PipelineRun contracts with local policy/state-machine implementations.
- A durable four-lane Hoodie simulation with exact blockers and every restricted approval still pending.
- Yarn lockfile, ESLint, Vitest, and production build commands.
- JSON Schemas for Commerce Product, Commerce Cart, Product Media Asset, Release Decision, Product Release Record, and PipelineRun.

## Partial

- Signature Hoodie evidence: product/design facts and one recorded front candidate exist; complete media, approvals, Shopify-backed PDP, cart, and operations proof do not.
- Shopify integration: the product route calls the gateway/adapter, but local read-only configuration is incomplete, so current Shopify product data is not observed.
- Release controls: Draft record exists with missing variant fingerprints and pending approvals.
- App capability access: the Product Owner-supplied installed list is preserved, but callable access/configuration/cost/Draft safety are unverified.

## Proposed

- Active Shopify cart gateway/UI and fulfillment adapter implementation beyond the recorded mapping.
- Staged/approved/released workflow transitions after evidence and Product Owner approval.

## Missing

- Successful current Shopify-backed product/variant observation.
- Active Shopify cart/checkout flow.
- Live read-only capability/access audit of the reported Shopify apps.
- Verified payment, fulfillment, tracking, support, and returns.
- Proven production service availability.

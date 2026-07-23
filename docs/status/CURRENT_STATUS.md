# Current Status — Fitness Cycle 2

Updated: 2026-07-22. The detailed repository status is maintained in `/STATUS.md`.

## Exists

- Next.js editorial shell and route surfaces.
- Fail-closed product flags and explicit local-only fixture mode.
- Provider-neutral Commerce Gateway, server-only Shopify product adapter, reusable PDP, and explicit unavailable page.
- Draft Hoodie Product Release Record and media manifest.
- Dormant Shopify cart/checkout modules.
- Yarn lockfile, ESLint, Vitest, and production build commands.
- JSON Schemas for Commerce Product, Product Media Asset, Release Decision, and Product Release Record.

## Partial

- Signature Hoodie evidence: product/design facts and one recorded front candidate exist; complete media, approvals, Shopify-backed PDP, cart, and operations proof do not.
- Shopify integration: the product route calls the gateway/adapter, but local read-only configuration is incomplete, so current Shopify product data is not observed.
- Release controls: Draft record exists with missing variant fingerprints and pending approvals.

## Proposed

- Provider-neutral cart gateway and fulfillment adapter implementation beyond the recorded mapping.
- Staged/approved/released workflow transitions after evidence and Product Owner approval.

## Missing

- Successful current Shopify-backed product/variant observation.
- Active Shopify cart/checkout flow.
- Verified payment, fulfillment, tracking, support, and returns.
- Proven production service availability.

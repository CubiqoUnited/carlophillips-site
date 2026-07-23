# Current Status — Fitness Cycle 1

Updated: 2026-07-22. The detailed repository status is maintained in `/STATUS.md`.

## Exists

- Next.js editorial shell and route surfaces.
- Fail-closed product flags and a local-only, visibly labeled Hoodie layout fixture.
- Dormant Shopify product/media/cart modules.
- Yarn lockfile, ESLint, Vitest, and production build commands.
- JSON Schemas for Commerce Product, Product Media Asset, Release Decision, and Product Release Record.

## Partial

- Signature Hoodie evidence: product/design facts and one recorded front candidate exist; complete media, approvals, Shopify-backed PDP, cart, and operations proof do not.
- Shopify integration: normalization/query/cart code and contract tests exist but active routes do not call the gateway.
- Release controls: local/preview/production source policy is tested; no canonical real Hoodie release record exists yet.

## Proposed

- Provider-neutral Commerce Gateway and POD adapters.
- Server-backed PDP decomposition and versioned release workflow.

## Missing

- Active Shopify-backed product/variant UI.
- Active Shopify cart/checkout flow.
- Verified payment, fulfillment, tracking, support, and returns.
- Proven production service availability.

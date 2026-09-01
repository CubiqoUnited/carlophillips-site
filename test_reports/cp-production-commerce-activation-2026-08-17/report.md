# CARLOPHILLIPS Production payment activation audit

Date: 2026-08-17

Branch: `codex/cp-shopify-checkout-handoff`

Starting commit: `6f30124bcb352154b1f90f27388022a3e5e30c03`

## Outcome

**NO-GO for leaving real customer charging enabled today.** Shopify Payments and hosted checkout work technically, but the current Production storefront uses an older checkout path that reaches Shopify while the canonical Signature Hoodie Product Release Record is still Draft. Real charging was restored to test mode after this mismatch was proven.

## Authorized actions performed

1. Opened Shopify Payments in the authenticated Shopify Admin session.
2. Turned test mode off and reloaded the page to confirm that the setting persisted.
3. Opened the public Production Hoodie page.
4. Selected Black / XS and continued to hosted Shopify checkout.
5. Confirmed the cart line and USD $128.00 merchandise price.
6. Confirmed hosted payment options: Shop Pay, PayPal, Google Pay, credit/debit card, and additional methods.
7. Entered no payment credentials and submitted no payment.
8. Returned Shopify Payments to test mode and confirmed that no real transactions will be processed.

The checkout probe may remain visible to Shopify as an abandoned cart. It is not an order and triggered no Apliiq manufacturing or fulfillment charge.

## Evidence

- `shopify-payments-live-mode.jpg`: Shopify test mode successfully disabled during the bounded proof.
- `production-pdp-before-activation.jpg`: existing Production Hoodie purchase surface.
- `production-checkout-legacy-path.jpg`: live storefront reached hosted checkout for Black / XS at USD $128.
- `shopify-payments-restored-test-mode.jpg`: final safe state, with test mode restored.

All four screenshots were inspected at original resolution. The restored-state image visibly confirms Shopify's warning that test orders can be placed but no real transactions will be processed. The Production PDP and hosted-checkout images visibly agree on product, Black / XS variant, quantity one, and USD $128.00 merchandise price.

## Repository verification

Full Yarn Classic 1.22.22 verification passed after the final documentation update:

- Design-system lint: passed; active UI values use canonical tokens and components.
- ESLint: passed with zero warnings.
- Vitest: 47/47 files and 494/494 tests passed.
- Production dependency audit: 0 vulnerabilities across 67 packages.
- Next.js 15.5.21 optimized Production build: passed.

The first sandboxed run completed all 494 assertions but could not write Vitest's shared cache (`EPERM`). The exact suite was rerun with the permitted cache write and completed successfully. This was an environment permission issue, not a test failure.

## Release mismatch

The current Production deployment predates the release-bound checkout correction. It exposes checkout even though the canonical release record is incomplete. The newer candidate correctly denies cart mutation unless all of the following are true:

- Product Release Record state is Released.
- Current Shopify identity, customer-facing facts, variants, availability, price, and currency match reviewed fingerprints.
- The chosen Shopify variant resolves server-side from the reviewed opaque variant hash.
- Required media are approved and bound through the Media Registry.
- Physical sample evidence and product/media/fulfillment approvals are complete.
- Operational cart-write and checkout capabilities are ready.
- Exact Product Owner activation approvals and independent environment switches are present.
- Same-origin and Shopify checkout-host controls pass.

## Current blockers

- Physical Hoodie sample is not ordered, delivered, or approved for fit, colour, artwork, and finish.
- The canonical release lacks complete current Shopify observation, variant, commerce-facts, and review fingerprints.
- Required media modalities, rights/quality review, storefront bindings, and Product Owner approval are incomplete.
- Product, media, and fulfillment approvals are pending.
- Immutable candidate, Staging, Production, and rollback evidence are incomplete.
- Operational cart capability is not yet upgraded beyond controlled test evidence.
- The release-bound candidate has not completed the protected review/merge/Production pipeline.
- Apliiq automatic processing is intentionally off; operational fulfillment and post-purchase evidence remain unproven.

## Shortest safe activation sequence

1. Quote and separately approve one exact Apliiq physical sample, including variant, private destination, shipping, tax, and total.
2. Receive and inspect fit, colour, embroidery/artwork, fabric/finish, and construction; capture truthful media.
3. Bind fresh Shopify observations, provider mapping, approved media, and sample evidence to the canonical Product Release Record.
4. Record Product Owner product, media, and fulfillment approvals; advance Draft → Staged → Approved → Released only when validators pass.
5. Obtain the required pull-request review, merge the release-bound implementation to `main`, and build distinct immutable Production and rollback artifacts.
6. Run desktop/mobile public, checkout, console/network, accessibility, security-boundary, and rollback QA on the exact candidate.
7. Promote the approved exact artifact and verify the Production Product, variant, price, availability, cart, and hosted-checkout handoff without submitting payment.
8. Turn Shopify Payments test mode off last.
9. Use a separately approved exact-value real order to verify settlement, Apliiq acceptance, production, tracking, customer updates, and post-purchase handling before claiming end-to-end readiness.

## Final external state

- Shopify Payments: **test mode on**; real transactions cannot be processed.
- Production storefront: unchanged legacy deployment; checkout reachability proven but not approved for live charging.
- Shopify catalog/channels: unchanged.
- Apliiq: no real order or manufacturing action.
- GitHub/Vercel: no merge, deployment, promotion, or alias change.
- Real payment/order: none.

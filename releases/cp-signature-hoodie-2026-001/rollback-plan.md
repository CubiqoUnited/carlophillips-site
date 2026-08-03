# Signature Hoodie Release Withdrawal Plan

Status: plan only; not executed or verified. Product Owner authorization is required before any production, Shopify, hosting, or catalog action.

Release: `cp-signature-hoodie-2026-001`

Strategy: `withdraw-release`

Previous release: none recorded

## Trigger

Use this plan only for the exact released candidate when product truth, media truth, commerce behavior, fulfillment mapping, customer safety, or operational evidence is contradicted after release.

## Authorized sequence

1. Record the incident evidence and exact affected release/variant fingerprints. Do not change another release.
2. Obtain Product Owner approval for the exact withdrawal boundary.
3. Fail the Next.js release decision closed for this release so product visibility, cart creation, and checkout entry are denied.
4. If separately authorized, change only the bound Shopify product/channel state from Active to Draft or otherwise remove its customer sales-channel availability. Do not delete the product, variants, orders, customers, media, or provider mapping.
5. If a previous approved release is later available, restore it only through its own immutable Product Release Record and candidate evidence. This first release currently has no previous release to restore.
6. Preserve the withdrawn record, event log, deployment identifier, Shopify observation, and provider evidence for audit.

## Verification required before recording `withdrawn`

- The live storefront no longer presents the release as purchasable.
- Bag/cart and checkout entry are denied for the withdrawn release.
- The exact Shopify product/channel state is observed read-only after any authorized mutation.
- No unrelated product, order, customer, provider mapping, or release changed.
- Desktop/mobile HTTP and browser evidence plus the rollback actor/time are stored under a release-specific evidence path.

Until that verification exists, `rollback.verificationEvidence` remains `null` and the Product Release Record cannot enter `released` or `withdrawn`.

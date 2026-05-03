# Vendor And Apliiq Workflow

## Rules

- Never trigger real Apliiq production fulfillment without explicit approval.
- Never place Apliiq sample orders without explicit approval.
- Never change Apliiq billing, payment method, production product, or fulfillment settings without explicit approval.
- Prefer a test/sandbox supplier workflow if available.

## Manual Portal QA

When Apliiq or supplier portal checks are requested:

- Confirm the account/store context before changing anything.
- Inspect product sync status, SKU/variant mapping, artwork placement, and fulfillment routing.
- Record all manual actions in `docs/codex-shared-notes.md`.
- Stop before any order submission, payment, fulfillment, billing, or production-setting change unless approved.

## Storefront Relationship

Supplier apps may push products into Shopify. The website should consume Shopify product data unless direct supplier integration is intentionally designed and reviewed.

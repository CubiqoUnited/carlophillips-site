# CARLOPHILLIPS Shopify Draft Guardrail

This local guardrail is for controlled MyDesigns / POD automation tests. Shopify Flow can tag and flag products, but it cannot force a product back to Draft. These scripts use the Shopify Admin GraphQL API to detect risky automation products and, only when explicitly approved with `--enforce`, set matching products to `DRAFT`.

## Required Environment Variables

Use environment variables only. Do not hardcode secrets.

```bash
SHOPIFY_STORE_DOMAIN=carlophillips.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_...
```

Optional configuration:

```bash
SHOPIFY_ADMIN_API_VERSION=2026-07
LOOKBACK_MINUTES=60
TARGET_VENDOR=MyDesigns
TARGET_TITLE_CONTAINS=CARLOPHILLIPS
REQUIRED_CREATED_AFTER=2026-07-03T00:00:00.000Z
```

The scripts also load `.env.local` and `.env` from the project root if the values are not already set in the shell. Secret values are not printed.

## Required Shopify Scopes

- `read_products`
- `write_products`

## Commands

Always run dry-run first:

```bash
node scripts/shopify-draft-guardrail/dry-run-guardrail.js
```

Find risky products, dry-run by default:

```bash
node scripts/shopify-draft-guardrail/find-risky-products.js
```

One-shot product enforcement, only after approval:

```bash
node scripts/shopify-draft-guardrail/force-product-draft.js --product-id gid://shopify/Product/123 --enforce
```

Short watcher for a MyDesigns sync test, only after approval:

```bash
node scripts/shopify-draft-guardrail/watch-new-products.js --minutes 10 --interval-seconds 10 --enforce
```

Without `--enforce`, watcher mode is dry-run and does not modify products.

## Detection Rules

Primary detection:

- Product vendor equals `MyDesigns`

Secondary detection:

- Title contains `CARLOPHILLIPS`
- Tags include `automation-test`, `mydesigns-test`, or `carlophillips-pod-pipeline`
- Product metafield `carlophillips.launch_status` exists
- Created after the configured lookback timestamp

## Safety Rules

- Default mode is dry-run.
- `--enforce` is required before any mutation.
- Products older than the lookback window are skipped unless `--allow-older` is passed.
- Products whose vendor is not `MyDesigns` are skipped unless they carry an automation tag.
- Products from `Apliiq`, `Printful`, `Printify`, or `ShineOn` are always skipped.
- Existing tags are merged, not overwritten.
- The script uses `productUpdate(product: ProductUpdateInput!)` with:
  - `status: DRAFT`
  - review tags
  - metafield `carlophillips.launch_status = needs_review`

## How To Use During MyDesigns Sync Test

1. Run the dry-run script and confirm env readiness.
2. Start the watcher in dry-run mode if you want to observe what it would catch.
3. When explicitly approved, start watcher in enforce mode immediately before the MyDesigns sync test.
4. Run the MyDesigns test.
5. Stop after the configured watcher window.
6. Verify in Shopify Admin that the new product is `Draft`, tagged for review, and has `carlophillips.launch_status = needs_review`.

## Rollback Considerations

If a product is forced to Draft, you can manually review and activate it in Shopify Admin after confirming media, pricing, variants, fulfillment, and storefront readiness.

## Risks / Limitations

- This is polling-based, not a webhook. There can be a short interval between product creation and draft enforcement.
- If the Admin token lacks `write_products`, enforcement will fail.
- If MyDesigns creates products with an unexpected vendor and no automation tags, the guardrail will skip them by design.
- Shopify Flow should remain as a second review marker, but Flow alone is not enough to prevent live publishing.

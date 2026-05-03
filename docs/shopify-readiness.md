# Shopify Readiness

## Source Of Truth

- Shopify is the product source of truth for the storefront.
- Apliiq, Printify, or other POD apps may push products into Shopify.
- Next.js should read website product data from Shopify, not directly from Apliiq, unless a future feature intentionally adds that path.

## Storefront API

Current app variables:

- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN`

The Storefront token is public by design. It must be scoped only for unauthenticated storefront actions such as product reads and cart/checkout creation.

## Admin API

Admin API access is not currently implemented. If added later:

- Use server-side routes only.
- Store `SHOPIFY_ADMIN_API_ACCESS_TOKEN` in Vercel/local ignored env only.
- Never expose Admin API tokens through `NEXT_PUBLIC_`.
- Document exact scopes in `docs/env-and-secrets.md`.

## Webhooks And Revalidation

Implemented routes:

- `POST /api/shopify/webhooks`: verifies `x-shopify-hmac-sha256` with `SHOPIFY_WEBHOOK_SIGNING_SECRET`, accepts product and collection create/update/delete topics, and revalidates the storefront path.
- `GET /api/revalidate` and `POST /api/revalidate`: protected by `REVALIDATION_SECRET`; use for manual revalidation of `/` or a provided `path`/`paths` list.

Required Shopify webhook topics:

- `products/create`
- `products/update`
- `products/delete`
- `collections/create`
- `collections/update`
- `collections/delete`

Use separate preview and production webhook URLs. Production webhook changes require approval.

## Product Data Checklist

- Product handles documented before live rollout.
- Product tags documented before live rollout.
- Collections documented before live rollout.
- Metafields documented if used.
- Variant names standardized, especially `Size` and `Color`.
- Product image aspect ratios checked on mobile, tablet, and desktop.
- Sold-out and unavailable variant behavior checked.
- Pricing display checked.
- Shipping and fulfillment assumptions documented.
- Test product created and verified before live product rollout.

# Product Data Model

## Current Storefront Shape

The app normalizes Shopify products into an internal object with:

- `id`: Shopify product handle.
- `shopifyId`: Shopify product GID.
- `name`: product title.
- `collection`: normalized product type fallback.
- `price`, `compareAtPrice`, `currency`.
- `description`, `descriptionHtml`, `details`.
- `images`, `heroImage`.
- `variants.colors`, `variants.sizes`.
- `shopifyVariants`: lookup keyed as `Color-Size`.
- `firstVariantId`.
- `availableForSale`, `vendor`, `productType`, `tags`.

## Variant Naming

Use consistent Shopify option names:

- `Color`
- `Size`

Avoid mixing `colour`, `sizes`, `shirt size`, or custom labels unless the normalization code is updated.

## Current QA Products

Observed in the current Shopify-connected storefront QA flow:

| Handle | Product | Collection/Product Type | Variant Options | QA Notes |
| --- | --- | --- | --- | --- |
| `cp-offshore-cpo-overshirt` | CP Offshore CPO Overshirt | `outerwear` | `Color`: Black Stone; `Size`: S, M, L, XL, XXL | Apliiq QA candidate used for cart smoke testing. |
| `carlo-houndstooth-runway-polo` | CARLO Houndstooth Runway Polo | `essentials` | Size/color naming should remain `Color` and `Size` | Appears as second product in storefront QA. |

## Current Collection Handles

Fallback/local collection handles used by the app:

- `essentials`
- `outerwear`
- `accessories`
- `home`
- `jewelry`
- `grooming`

The Shopify collection handles should match these where possible, or the storefront mapping should be updated intentionally.

## Required Documentation Before Launch

- Final live product handles.
- Final Shopify collection handles.
- Final product tags.
- Metafields and namespaces, if used.
- Expected image aspect ratios.
- Sold-out behavior.
- Shipping and fulfillment assumptions.

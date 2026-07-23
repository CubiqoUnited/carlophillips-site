# CARLOPHILLIPS Architecture

## Approved direction

```text
Customer browser
  -> Next.js App Router presentation and release gates
  -> Shopify Storefront API: product, media, variant, price, availability, cart
  -> Shopify Checkout: tax, shipping, payment, order
  -> approved POD provider mapping: production and fulfillment
  -> Shopify/app ecosystem: tracking, support, returns, reviews, lifecycle
```

Vollebak is an experience benchmark only. CARLOPHILLIPS content, identity, media, and product design must remain original.

## Runtime today

All public route wrappers re-export the client shell in `app/page.js`. That shell uses pathname inspection to render home, collection, product, about, and bag states. Products fail closed by default. When both preview gates are enabled, one static `signatureHoodiePreview` fixture renders as a disabled staging review page.

Shopify query, normalization, product-service, cart, and checkout modules exist under `lib/`, but the active shell does not call them. Their presence is architectural groundwork, not evidence that commerce works.

## Implementation gap map

| Boundary | Current implementation | Evidence status | Required change |
|---|---|---|---|
| Route composition | Thin wrappers re-export one monolithic client shell | Locally buildable; route-specific data boundaries absent | Move product/collection reads into server-backed route components |
| Product truth | Active Hoodie page reads a labeled local-only fixture; the legacy data service now forbids fixture fallback outside local | POC identity and media partially evidenced; not live Shopify truth | Fetch selected lane from Shopify and return an explicit unavailable state on failure |
| Variant truth | Static size buttons are disabled | No active variant selection | Render available Shopify variants and unavailable states |
| Media truth | Static image list; Shopify normalizer supports rich media | Real images only; no proven video/spin/3D | Use Shopify media records and accessible type-specific renderers |
| Cart | Dormant localStorage/Shopify module; visible bag is empty shell | Normalization covered by automated tests; no browser/API proof | Wire add/update/remove to Shopify cart; do not treat local fallback as checkout-capable |
| Checkout | Dormant checkout URL handling | Not exercised | Redirect only from a verified Shopify cart and validate allowed host |
| POD mapping | Apliiq Hoodie facts exist in reports | Product/design facts partial; no order handoff proof | Record provider/product/decoration mapping in a release record |
| Catalog | Prior audit recorded 12 products with image-only media | Scope choice unresolved | Product Owner chooses Hoodie POC or catalog restoration |
| Hosting | Vercel project linked but public responses are HTTP 402 | External blocker | Restore deployment access, then redeploy approved preview and resume browser proof |

## Environment model

| Environment | Purpose | Data/release policy |
|---|---|---|
| Local | Implementation and evidence | Defaults fail closed; fixture permitted only when visibly labeled and gated |
| Vercel Preview | Private staging/review | Branch deployment, environment-specific values, no production promotion |
| Production | Customer commerce | Approved `main` only; no draft previews; all operational gates directly proven |

## Target decomposition

- Server product adapter: validated Shopify reads with explicit unavailable/error results.
- Product release record: product ID/handle, provider mapping, approval state, media provenance, and gate evidence.
- Route-level product/collection components instead of pathname routing in one client file.
- Client islands for variant selection, cart interaction, and media controls.
- Shopify-native cart only for checkout-capable state.
- Media renderers for actual Shopify `IMAGE`, `VIDEO`, `EXTERNAL_VIDEO`, and `MODEL_3D` records, with accessible fallbacks.

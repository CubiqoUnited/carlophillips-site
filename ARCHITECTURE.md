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

Home, collection, about, and bag wrappers still re-export the client shell in `app/page.js`. The dynamic product route is now separate: a Server Component selects an explicit source through the Commerce Gateway, calls a server-only Shopify adapter in Shopify mode, and passes a normalized view model to a reusable non-buyable PDP.

Products fail closed by default. Local fixture mode is separately gated and visibly labeled; preview/production reject it. Shopify failure returns an unavailable decision and page without fixture substitution. The local Shopify probe currently reports missing configuration, so this implementation proves the boundary and failure policy—not a live product observation.

## Implementation gap map

| Boundary | Current implementation | Evidence status | Required change |
|---|---|---|---|
| Route composition | Product route has a server boundary; remaining wrappers use the client shell | Product route verified; collection/cart decomposition absent | Move collection/cart boundaries only when their active flows are implemented |
| Product truth | Gateway accepts explicit local fixture or read-only Shopify adapter | Failure policy proven; live Shopify config/product observation blocked | Configure authorized read-only environment and bind the observation to the release record |
| Variant truth | Gateway/view model support normalized variants; controls stay disabled | Deterministic tests pass; live variant identity/fingerprint missing | Observe Shopify variants, fingerprint them, then add gated selection |
| Media truth | Gateway/view model render image/video/external-video/model fallback types | Manifest binds one front asset and quarantines two details; live media not observed | Render current Shopify media and require manifest approval before release |
| Cart | Dormant localStorage/Shopify module; visible bag is empty shell | Normalization covered by automated tests; no browser/API proof | Wire add/update/remove to Shopify cart; do not treat local fallback as checkout-capable |
| Checkout | Dormant checkout URL handling | Not exercised | Redirect only from a verified Shopify cart and validate allowed host |
| POD mapping | Draft release record binds Apliiq product `5958463` provider-neutrally | Product/design facts partial; variant fingerprint/order proof missing | Observe exact variant mapping without ordering, then later prove authorized order handoff |
| Catalog | Prior audit recorded 12 products with image-only media | Scope choice unresolved | Product Owner chooses Hoodie POC or catalog restoration |
| Hosting | Vercel project linked but public responses are HTTP 402 | External blocker | Restore deployment access, then redeploy approved preview and resume browser proof |

## Environment model

| Environment | Purpose | Data/release policy |
|---|---|---|
| Local | Implementation and evidence | Defaults fail closed; fixture permitted only when visibly labeled and gated |
| Vercel Preview | Private staging/review | Branch deployment, environment-specific values, no production promotion |
| Production | Customer commerce | Approved `main` only; no draft previews; all operational gates directly proven |

## Target decomposition

- Server product adapter: implemented for no-store Shopify reads with explicit unavailable/error results.
- Product release record: Draft record exists with product/provider/media evidence and missing fingerprints explicit.
- Route-level product component: implemented; collection/cart remain in the client shell.
- Client islands for variant selection, cart interaction, and media controls.
- Shopify-native cart only for checkout-capable state.
- Media renderers for actual Shopify `IMAGE`, `VIDEO`, `EXTERNAL_VIDEO`, and `MODEL_3D` records, with accessible fallbacks.

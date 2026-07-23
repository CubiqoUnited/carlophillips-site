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

The architecture coordinates four lanes—Product/POD truth, Media truth, Commerce/frontend, and Agentic orchestration—through a versioned Product Release Record. That record binds Shopify product/variant evidence, provider fulfillment mappings, a truthful media manifest, human approvals, candidate build/staging evidence, and rollback. Provider and media-tool integrations sit behind capability adapters so no single app becomes the platform boundary.

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
| Cart | Dormant browser adapter now has explicit Shopify/fixture sources; visible bag is empty shell | Local transitions, expired-cart replacement, and preview/production fallback denial pass; no live API proof | Wire add/update/remove only after authorized Shopify observation; keep failures unavailable |
| Checkout | Dormant checkout URL handling now enforces exact HTTPS host policy | Malicious/similar hosts rejected in tests; no returned Shopify URL observed | Redirect only from a verified Shopify cart after authorized no-order browser proof |
| POD mapping | Draft release record binds Apliiq product `5958463` provider-neutrally | Product/design facts partial; variant fingerprint/order proof missing | Observe exact variant mapping without ordering, then later prove authorized order handoff |
| Catalog | Prior audit recorded 12 products with image-only media | Later reuse/scale input; individual release truth unproven | After the complete Hoodie journey, prove a different product through the same cores before catalog expansion |
| Hosting | Vercel project linked but public responses are HTTP 402 | External blocker | Restore deployment access, then redeploy approved preview and resume browser proof |
| Agentic orchestration | Durable release/media records exist; no runnable end-to-end orchestrator | Designer-led and trend-led workflow intent recovered; app access unverified | Implement auditable jobs only after capability/access audit selects supported API, Flow, browser, human, or unavailable paths |

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
- Provider-neutral cart envelope and fail-closed checkout-host policy before activating the bag.
- Media renderers for actual Shopify `IMAGE`, `VIDEO`, `EXTERNAL_VIDEO`, and `MODEL_3D` records, with accessible fallbacks.
- Provider/media capability adapters classified by supported API/webhook, Shopify Admin/Flow, app credentials, approved browser workflow, human-only, or unavailable.
- Agentic workflow state for both designer-led and trend-led creation, always ending at explicit human approval gates for spend, Shopify writes, publish, and production.

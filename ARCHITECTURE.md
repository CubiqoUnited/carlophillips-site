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

Home, collection, and about wrappers still re-export the client shell in `app/page.js`. Product and bag/cart routes are separate Server Component boundaries. The product route selects an explicit source through the Commerce Gateway; the bag route requires an operation-specific capability decision and renders local non-commerce or unavailable states until Shopify cart writes are actually verified.

Products fail closed by default. Local fixture mode is separately gated and visibly labeled; preview/production reject it. Shopify failure returns an unavailable decision and page without fixture substitution. The local Shopify probe currently reports missing configuration, so this implementation proves the boundary and failure policy—not a live product observation.

Product Release Record transitions are also fail-closed. Draft may contain incomplete evidence. Staged requires observed Shopify/provider variant fingerprints, an immutable candidate commit, passing build evidence, private staging evidence, and a release-specific rollback plan. Approved additionally requires product/media/fulfillment approvals and a complete nine-modality Media Registry whose bound assets have verified provenance, exact-product match, rights, quality, approval, and accessible fallbacks. Released additionally requires a dated Shopify `ACTIVE` observation and verified rollback evidence. The transition evaluator changes only a candidate record; it never performs Shopify, deployment, or publication actions.

## Implementation gap map

| Boundary | Current implementation | Evidence status | Required change |
|---|---|---|---|
| Route composition | Product and bag/cart routes have server boundaries; remaining wrappers use the client shell | Product plus local/preview bag policies browser-verified; collection decomposition absent | Move collection when its Shopify-backed flow is implemented |
| Product truth | Gateway accepts explicit local fixture or read-only Shopify adapter | Failure policy proven; live Shopify config/product observation blocked | Configure authorized read-only environment and bind the observation to the release record |
| Variant truth | Gateway/view model support normalized variants; controls stay disabled | Deterministic tests pass; live variant identity/fingerprint missing | Observe Shopify variants, fingerprint them, then add gated selection |
| Media truth | Gateway/view model render image/video/external-video/model fallback types | Manifest binds one front asset and quarantines two details; live media not observed | Render current Shopify media and require manifest approval before release |
| Cart | Dormant browser adapter has explicit sources; visible bag consumes an operation-specific capability decision | Local non-commerce and preview unavailable UI plus lifecycle/fallback tests pass; no live API proof | Audit the authenticated Shopify cart surface, then wire only the operations proven callable |
| Checkout | Dormant checkout URL handling now enforces exact HTTPS host policy | Malicious/similar hosts rejected in tests; no returned Shopify URL observed | Redirect only from a verified Shopify cart after authorized no-order browser proof |
| POD mapping | Draft release record binds Apliiq product `5958463` provider-neutrally | Product/design facts partial; variant fingerprint/order proof missing | Observe exact variant mapping without ordering, then later prove authorized order handoff |
| Catalog | Prior audit recorded 12 products with image-only media | Later reuse/scale input; individual release truth unproven | After the complete Hoodie journey, prove a different product through the same cores before catalog expansion |
| Hosting | Vercel project linked but public responses are HTTP 402 | External blocker | Restore deployment access, then redeploy approved preview and resume browser proof |
| Agentic orchestration | Durable PipelineRun, ProductCreationJob, and executable capability registry exist locally | Designer-led and trend-led local simulations converge on the same truth contracts; idempotency, blocker isolation, external execution/Shopify write/spend/publish gates, and local capability discovery are tested; external app access remains unverified | Run the authorized read-only app audit and bind evidence-backed callable surfaces to registry entries |
| Release state | Draft Hoodie record, strict transition schema/policy, and release-specific withdrawal plan exist | Current Hoodie staging readiness is denied by five exact evidence blockers; no state or external system was changed | Resolve Shopify/provider fingerprints, immutable candidate/build evidence, and private staging evidence before staging |

## Environment model

| Environment | Purpose | Data/release policy |
|---|---|---|
| Local | Implementation and evidence | Defaults fail closed; fixture permitted only when visibly labeled and gated |
| Vercel Preview | Private staging/review | Branch deployment, environment-specific values, no production promotion |
| Production | Customer commerce | Approved `main` only; no draft previews; all operational gates directly proven |

## Target decomposition

- Server product adapter: implemented for no-store Shopify reads with explicit unavailable/error results.
- Product release record: Draft record exists with product/provider/media evidence and missing fingerprints explicit.
- Route-level product and truthful bag-state components: implemented; collection remains in the client shell.
- Client islands for variant selection, cart interaction, and media controls.
- Shopify-native cart only for checkout-capable state.
- Provider-neutral cart envelope and fail-closed checkout-host policy before activating the bag.
- Media renderers for actual Shopify `IMAGE`, `VIDEO`, `EXTERNAL_VIDEO`, and `MODEL_3D` records, with accessible fallbacks.
- Provider/media capability adapters classified by supported API/webhook, Shopify Admin/Flow, app credentials, approved browser workflow, human-only, or unavailable.
- Agentic workflow state for both designer-led and trend-led creation, always ending at explicit human approval gates for spend, Shopify writes, publish, and production.
- ProductCreationJob inputs are candidate evidence only. Trend signals are always `research-only`; neither creation mode can set product truth, approve media, authorize commerce, or publish. Both modes bind the same Product Release Record, Media Registry, Commerce Gateway, and PipelineRun contract.

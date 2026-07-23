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

Home is now a Server Component boundary that consumes the same catalog decision as `/shop` and `/collections`, then passes only counts, message, and an eligible primary review link into the client editorial shell. About and lookbook use that shell without invoking catalog or Shopify reads. Product and bag/cart routes remain separate Server Component boundaries. The product route selects an explicit source through the Commerce Gateway. Product and bag surfaces consume a server-owned cart-activation decision; credentials, release visibility, or a capability record alone cannot enable cart UI.

Products fail closed by default. Local fixture mode is separately gated and visibly labeled; preview/production reject it. Shopify failure returns an unavailable decision and page without fixture substitution. A successful Shopify observation must also resolve to matching Product Release Record and Media Registry evidence. Preview permits only an evidence-complete Staged, Approved, or Released record for private non-commerce review; production requires a complete Released record and still keeps purchasing disabled until the cart/checkout journey is proven. The local Shopify probe currently reports missing configuration, so this implementation proves the boundary and failure policy—not a live product observation.

The read-only adapter now converts Shopify responses into a canonical Product
Observation before they can reach release review. Raw product/variant
references do not enter the durable observation; variant references are hashed.
Locale-independent sorting makes the variant identity fingerprint
deterministic. A commerce-facts fingerprint separately binds canonical product,
variant, title, price, currency, and availability facts while excluding
per-read timestamp, environment, and capability metadata. The immutable
full-envelope fingerprint binds all of those audit fields. Review recomputes
all three fingerprints and requires a ready product-read capability with the
same durable evidence reference plus approval for the exact full fingerprint
and handle. Its output is only a candidate patch; no apply operation exists.

The observation-to-visibility policy validates the fresh sanitized envelope
before Preview or production rendering. Runtime compares stable variant
identity and commerce facts to the reviewed release bindings. It deliberately
does not compare a fresh full-envelope fingerprint to the historical approved
one because each legitimate read has a new timestamp and production has a
different environment. The historical full fingerprint and review evidence
remain immutable audit proof. Stale or malformed candidates return no product
payload and are isolated from other catalog candidates.

The canonical commerce-facts envelope includes title, plain-text description,
vendor, product type, derived tagline, ordered details, price, currency,
availability, and sanitized variants. After validation, the runtime constructs
a new release product from that envelope rather than spreading the transport
adapter object. Media is the sole retained adapter payload and immediately
passes through its independent registry boundary. Consequently, injected outer
copy, HTML, IDs, and stories cannot alter the reviewed storefront presentation.
Release-status language is also system-owned: Local identifies observation or
fixture review, Preview identifies private release review, and production
identifies reviewed Released facts while independently reporting that cart and
checkout remain unproven. Marketing story stays unavailable unless a future
reviewed source contract explicitly binds it.

Variant presentation is a separate non-authoritative projection of an
integrity-validated canonical observation. Raw Shopify option order is
normalized upstream with the locale-independent observation sorter, and the
presentation preserves that canonical order. Its contract binds the reviewed
variant fingerprint and product currency, one canonical non-empty option-name schema, unique exact
combinations, availability, and prices. It exposes opaque reference hashes only
and sets both selection and cart authority false. Cart activation now has eight
gates: an available reviewed combination and an evidence-backed server-only
resolver are distinct, so a hash cannot be mistaken for a mutation target. The
cart-write capability gate accepts only the exact evidence-backed
`shopify-storefront-cart` capability and adapter on the `shopify_storefront`
surface; a generic ready capability cannot activate it.

Media has a separate release boundary. Each approved Media Registry asset may
carry a `shopify-storefront-media` binding whose deterministic hash covers the
sanitized current media identity, kind, canonical asset URL, and preview URL.
The server filters the observed Shopify media array against approved,
provenance/rights/quality-complete bindings and replaces raw IDs and alt text
with registry-owned values before the view model. Preview may remain
non-commerce with a partial approved set and explicit missing-modality state.
Production requires current matches for every non-waived approved modality and
every motion/3D fallback; otherwise the whole product decision is denied.

Product Release Record transitions are also fail-closed. Draft may contain incomplete evidence. Staged requires reviewed Shopify observation, commerce-facts and variant bindings, observed provider variant fingerprints, an immutable candidate commit, passing build evidence, private staging evidence, and a release-specific rollback plan. Approved additionally requires product/media/fulfillment approvals and a complete nine-modality Media Registry whose bound assets have verified provenance, exact-product match, rights, quality, approval, and accessible fallbacks. Released additionally requires a dated Shopify `ACTIVE` observation and verified rollback evidence. The transition evaluator changes only a candidate record; it never performs Shopify, deployment, or publication actions.

## Implementation gap map

| Boundary | Current implementation | Evidence status | Required change |
|---|---|---|---|
| Route composition | Home, product, shop/collections, and bag/cart have server truth boundaries; about/lookbook remain editorial-only | Home receives a minimized shared catalog summary; per-item catalog and PDP filtering remain canonical | Decompose only when a new user flow needs a distinct truth boundary |
| Product truth | Gateway accepts explicit local fixture or capability-evidenced read-only Shopify adapter and resolves Shopify observations against the release registry | Canonical observation/review contracts and failure policy proven; live Shopify capability/config/product observation blocked | Verify read capability, create and approve an exact observation candidate, then separately authorize any release-record patch |
| Variant and commerce-facts truth | Normalization preserves current variants and plain customer copy; observation fingerprints identity, rendered facts, and the full envelope; a disabled combination model binds fingerprint/currency and exact option dimensions | Runtime freshness, copy/price/availability tamper, stale identity, duplicate/missing/extra dimensions, raw-map injection, catalog isolation, and non-mutation tests pass; live evidence remains missing | Observe Shopify, review the exact complete envelope, then separately authorize binding the accepted patch to the Draft release |
| Media truth | Gateway filters Shopify media through hashed, approved registry bindings; PDP exposes partial-review state; production requires current modality/fallback coverage | ID/URL/type tamper, unapproved extra, duplicate binding, partial Preview, complete Released, and missing-production-binding tests pass; Hoodie assets remain unbound/unapproved | Obtain current Hoodie media, provenance/rights/quality approval, and hashed storefront bindings without inventing missing modalities |
| Cart | Browser product/cart services and broad Storefront mutation client are removed; server policy evaluates eight activation prerequisites, separating reviewed variant presentation from evidence-backed server-only mutation resolution | Pure policy, schema, mismatch, raw-map rejection, route-boundary, local fixture denial, and sanitized-summary tests pass; no Shopify write or live API proof | Audit the authenticated Storefront cart surface, prove no-order capability and an exact server-only variant resolver, then add a narrow approved adapter |
| Checkout | Explicitly separate from cart eligibility and hard-false in the current activation contract | No active redirect or public mutation surface exists; no returned Shopify URL observed | Add a separate approved checkout contract only after live cart proof, exact host validation, and operational authorization |
| POD mapping | Draft release record binds Apliiq product `5958463` provider-neutrally | Product/design facts partial; variant fingerprint/order proof missing | Observe exact variant mapping without ordering, then later prove authorized order handoff |
| Catalog | Prior audit recorded 12 products with image-only media | Later reuse/scale input; individual release truth unproven | After the complete Hoodie journey, prove a different product through the same cores before catalog expansion |
| Hosting | Vercel project linked but public responses are HTTP 402 | External blocker | Restore deployment access, then redeploy approved preview and resume browser proof |
| Agentic orchestration | Durable ProductBrief, ProductCreationJob v2, PipelineRun, and executable capability registry exist locally | On-demand designer and scheduled trend simulations converge on the same truth contracts; provenance/freshness, binding brand/reference rules, deterministic duplicate suppression, blocker isolation, and restricted gates are tested; external app access remains unverified | Run the authorized read-only app audit and bind evidence-backed callable surfaces to registry entries |
| Release state | Draft Hoodie record, strict transition schema/policy, route-level release registry, and release-specific withdrawal plan exist | Current Hoodie staging readiness is denied by seven exact evidence blockers; the route denies Draft Shopify observations outside Local | Resolve reviewed Shopify observation/commerce facts, provider fingerprint, immutable candidate/build evidence, and private staging evidence before staging |

## Environment model

| Environment | Purpose | Data/release policy |
|---|---|---|
| Local | Implementation and evidence | Defaults fail closed; fixture permitted only when visibly labeled and gated |
| Vercel Preview | Private staging/review | Branch deployment, environment-specific values, no fixtures, Staged-or-later evidence required, no production promotion |
| Production | Customer commerce | Approved `main` only; no fixtures or unreleased products; complete Released evidence required and all operational gates directly proven |

## Target decomposition

- Server product adapter: implemented for no-store Shopify reads with explicit unavailable/error results.
- Product release record: Draft record exists with product/provider/media evidence and missing fingerprints explicit.
- Route-level home summary, product, release-aware catalog, and truthful bag-state components: implemented; about/lookbook remain editorial-only shell surfaces.
- Client islands for variant selection, cart interaction, and media controls only after server activation decisions authorize their exact inputs.
- Shopify-native cart behind a narrow server-owned adapter only after release, variant, capability, Product Owner, and environment gates pass.
- Provider-neutral cart envelope and fail-closed checkout-host policy before activating the bag.
- Media renderers for actual Shopify `IMAGE`, `VIDEO`, `EXTERNAL_VIDEO`, and `MODEL_3D` records, with accessible fallbacks.
- Provider/media capability adapters classified by supported API/webhook, Shopify Admin/Flow, app credentials, approved browser workflow, human-only, or unavailable.
- Agentic workflow state for both designer-led and trend-led creation, always ending at explicit human approval gates for spend, Shopify writes, publish, and production.
- ProductBrief inputs are candidate evidence only. Trend signals are always `research-only`; neither creation mode can set product truth, approve media, authorize commerce, or publish. ProductCreationJob v2 embeds the validated brief and binds both modes to the same Product Release Record, Media Registry, Commerce Gateway, and PipelineRun contract.
- Job triggers distinguish on-demand from scheduled cadence with an explicit timezone/expression. Every input carries publisher/retrieval provenance and a deterministic freshness classification. Binding CARLOPHILLIPS rules and inspiration-only reference policy prohibit copying or inferred rights/product/media truth. Idempotency keys plus normalized input fingerprints suppress retries/equivalent duplicates; scheduled jobs still require external-execution approval.

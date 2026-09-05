# CARLOPHILLIPS Architecture

## Canonical public-commerce architecture — 2026-08-31

The public storefront is Shopify-authoritative. Product and catalog routes read
current Shopify product data; checkout re-reads the product, resolves the
submitted opaque selection to a current available S/M/L variant, creates a
Shopify cart, and accepts only a trusted HTTPS Shopify checkout URL. Vercel
Preview uses a separate Shopify staging/development store and mimics the
Production hosted-checkout handoff without entering payment or submitting an
order.

Product Release Records, fingerprints, sample state, approval JSON, and
Draft/Staged/Approved/Released transitions are non-runtime historical audit
mechanisms. They cannot hide a current Shopify product or block its cart or
checkout. Later historical sections describing them as public runtime gates are
superseded by this section.

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

The candidate has two deliberately separate presentation surfaces in one repository. Public customer routes remain release-derived. `/admin` is an operational projection over sanitized committed artifacts with no public navigation, raw Shopify/POD references, or commerce/release authority. Local review uses distinct bearer credentials for reviewer and Product Owner QA only. The remote adapter uses Clerk sessions solely on Vercel Preview/Production and authorizes one exact immutable Product Owner subject; missing provider configuration, missing/expired sessions, and every other identity fail closed. Evidence Health separates technical access, freshness, source history, and operating authority, while Commands exposes only the canonical empty queue and missing execution gates. Every operational area remains read-only except the local Product Owner-only Theme proposal. Theme can atomically replace only the validated root `theme.json` on a local `codex/*` branch with optimistic revision protection; it cannot change layout, create a commit/PR/Preview, deploy, publish, or touch Production. Remote Theme writes remain denied until a least-privilege GitHub draft-PR adapter, durable audit evidence, retention policy, and incident owner exist.

The local admin command policy is a separate pure authorization boundary, not a command bus. It fingerprints an exact reviewed command and can return a sanitized execution decision only when authenticated actor identity, least-privilege role grant, target/environment binding, capability and operation, required approvals, evidence, fresh idempotency claim, audit readiness, connector readiness, cost ceiling, rollback, TTL, and Production ownership agree. The decision returns no actor subject or target reference and performs no connector call or external mutation. No real command can be executed because durable role grants, idempotency/audit, connector decisions, and an executor are not wired.

`theme.json` is the single editable authority for accent colour, corner radius, base spacing, and base text weight. A validated server-rendered bridge injects those primitive CSS variables and derives the complete rem spacing scale. `app/design-tokens.css` maps them into existing semantic/component aliases, and active CSS/components consume only those aliases. v1.2.2 deliberately removed dormant Tailwind tooling; any future Tailwind adapter must import this same JSON rather than create a parallel theme.

The historical `production-commerce-launch.json` authority has been removed. No ad-hoc file may synthesize a Released record, cart approval, or Media Registry approval. The checkout server validates only canonical release/media evidence and then still denies with `CHECKOUT_REQUIRES_SEPARATE_RELEASE_BOUND_AUTHORIZATION`; it performs no Shopify read or cart mutation. The PDP additionally requires both `cartAllowed` and independent `checkoutAllowed` before rendering a form. The deployed Production artifact predates this candidate and needs a separately approved containment release or verified-safe rollback.

Home is a Server Component boundary that consumes the same catalog decision as `/shop` and `/collections`, then passes only counts, message, and an eligible primary review link into the client storefront composition. The non-PRD editorial shell and its About/Lookbook routes are removed. Product and bag/cart routes remain separate Server Component boundaries. The product route selects an explicit source through the Commerce Gateway. Product and bag surfaces consume a server-owned cart-activation decision; credentials, release visibility, or a capability record alone cannot enable cart UI.

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
cart-write capability gate accepts only an exact operationally verified
`shopify-storefront-cart` capability and adapter on the `shopify_storefront`
surface; a generic ready capability cannot activate it. The historical
no-order proof is registered only as `cart-write-test`. Discovery returns
`evidence_only` for that test and `human_required` for `cart-write`, so test
access cannot activate customer cart UI.

Variant-resolution readiness has two deliberately different surface labels.
The capability registry reports `local` because the deterministic CP
implementation is locally verified. A runtime `cp.variant-resolution-decision.v1`
reports `server_only` because the sole production entry for the readiness
computation is guarded by `server-only`, consumes raw Storefront IDs only
ephemerally, re-derives the canonical observation, and returns only handle,
fingerprints, counts, and evidence. The upstream server-only Storefront loader
necessarily sees raw IDs first to create the hashed observation. Cart
activation still passes `variantResolverDecision: null`; no live resolver is
wired. A future server orchestration step must supply a fresh raw load without
returning it publicly. The decision proves complete one-to-one mapping but
contains no selected mutation target and authorizes no cart, checkout, or
order. The legacy flattened `shopifyVariants` and first-variant shortcuts are
no longer created by normalization.

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

Sale-to-post-sale state now has a provider-neutral local contract and pure reducer. Sanitized lifecycle events bind an opaque aggregate fingerprint to the exact release fingerprint, variant fingerprint, and environment; require monotonic sequence, idempotency, a recomputed SHA-256 chain, bounded timestamps, whitelisted sources/details, and upstream authority fingerprints; and reject PII/raw references. Strict transitions cover payment success/failure, accepted/cancelled order, POD acceptance/rejection, production, dispatch/delay/delivery, support, return, partial/full refund, review eligibility, and reconciliation/variance. Lifecycle events cannot approve a release, authorize checkout, authorize a refund, or publish.

A separate local Shopify verification boundary proves exact-raw-body HMAC validation, allowlisted shop/topic checks, bounded trigger time, delivery replay claims, JSON/body limits, and fingerprint-only quarantine output. It returns no payload, shop, delivery ID, customer data, raw provider reference, or lifecycle mutation authority. This is an isolated verifier, not webhook ingress: no registered subscription, listener, provider secret, durable replay store, payload sanitizer, inbox/outbox, connector, or external mutation is wired. The admin therefore derives truthful empty states from `no_controlled_order_observed` rather than loading simulations as operational evidence.

## Implementation gap map

| Boundary | Current implementation | Evidence status | Required change |
|---|---|---|---|
| Route composition | Home, product, shop/collections, and bag/cart have server truth boundaries; the editorial-only About/Lookbook detour is removed | Home receives a minimized shared catalog summary; per-item catalog and PDP filtering remain canonical | Decompose only when a new approved user flow needs a distinct truth boundary |
| Product truth | Gateway accepts explicit local fixture or capability-evidenced read-only Shopify adapter and resolves Shopify observations against the release registry | Canonical observation/review contracts and failure policy proven; live Shopify capability/config/product observation blocked | Verify read capability, create and approve an exact observation candidate, then separately authorize any release-record patch |
| Variant and commerce-facts truth | Normalization preserves current variants and plain customer copy; observation fingerprints identity, rendered facts, and the full envelope; a disabled combination model binds fingerprint/currency and exact option dimensions | Runtime freshness, copy/price/availability tamper, stale identity, duplicate/missing/extra dimensions, raw-map injection, catalog isolation, and non-mutation tests pass; live evidence remains missing | Observe Shopify, review the exact complete envelope, then separately authorize binding the accepted patch to the Draft release |
| Media truth | Gateway filters Shopify media through hashed, approved registry bindings; PDP exposes partial-review state; production requires current modality/fallback coverage | ID/URL/type tamper, unapproved extra, duplicate binding, partial Preview, complete Released, and missing-production-binding tests pass; Hoodie assets remain unbound/unapproved | Obtain current Hoodie media, provenance/rights/quality approval, and hashed storefront bindings without inventing missing modalities |
| Cart | Browser product/cart services and broad Storefront mutation client are removed; server policy evaluates eight activation prerequisites, separating reviewed variant presentation from evidence-backed server-only mutation-resolution readiness | The resolver re-derives current facts and proves one-to-one coverage without exposing raw IDs; historical no-order evidence is `cart-write-test`/`evidence_only`, operational `cart-write` is blocked, and no Shopify write or current live API proof exists | After Released/current fingerprints, verify an operational write surface, exact Product Owner activation, server-only selected-variant resolver, and environment gate without weakening the boundary |
| Checkout | Explicitly separate from cart eligibility and hard-false in the current activation contract; historical bypass removed from the candidate | Candidate endpoint performs no Shopify read/mutation and PDP requires `checkoutAllowed`; deployed Production still exposes a checkout CTA | After canonical Released evidence, add a separate time-bound checkout authorization contract, exact host validation, controlled-order approval, and mutation-spy proof |
| POD mapping | Draft release record binds Apliiq product `5958463` provider-neutrally | Product/design facts partial; variant fingerprint/order proof missing | Observe exact variant mapping without ordering, then later prove authorized order handoff |
| Catalog | Prior audit recorded 12 products with image-only media | Later reuse/scale input; individual release truth unproven | After the complete Hoodie journey, prove a different product through the same cores before catalog expansion |
| Hosting | Verified Vercel project and Production/PR #9 Preview were read-only observed `READY`; GitHub PR status still reports a blocked-account Vercel failure | Identity is known but CI/deployment evidence is contradictory and current Production has the checkout-authority defect | Create a new immutable Preview only after approval, bind SHA/deployment/QA, then obtain separate Production containment authorization |
| Agentic orchestration | Durable ProductBrief, ProductCreationJob v2, PipelineRun, and executable capability registry exist locally | On-demand designer and scheduled trend simulations converge on the same truth contracts; provenance/freshness, binding brand/reference rules, deterministic duplicate suppression, blocker isolation, and restricted gates are tested; external app access remains unverified | Run the authorized read-only app audit and bind evidence-backed callable surfaces to registry entries |
| Admin control plane | Overview, Evidence Health, Commands, and 12 other domain sections derive from canonical artifacts; local reviewer/owner credentials remain QA-only; the Vercel adapter verifies Clerk sessions against one immutable Product Owner subject; the four-value Theme proposal remains local branch-only; a pure command policy proves fail-closed decisions | Provider/account is not provisioned or Preview-verified; Commands truthfully shows an empty queue; no durable role grants, idempotency/audit/read model, GitHub proposal adapter, connector decision, executor, or external command exists; remote Theme saves stay denied | Provision the approved no-cost Clerk project, bind the exact owner subject, verify real Preview allow/deny sessions, then add a least-privilege `theme.json` branch/draft-PR adapter and wire reviewed idempotent commands through durable audit one connector at a time |
| Order/post-sale | PII-safe release/variant/environment-bound event schema, pure strict lifecycle reducer, hash chain, idempotency/replay guards, authority checks, sanitized admin projection, and fingerprint-only Shopify HMAC verifier exist locally | Lifecycle happy/exception paths plus signature/shop/topic/time/replay fail-closed paths are proven locally; no webhook subscription/listener, authorized secret, durable inbox/outbox, payload sanitizer, provider/customer data, controlled order, payment, POD fulfillment, shipment, tracking, support, return/refund, review, or reconciliation observation exists | Select one owner/adapter per capability, authorize exact topics/shops/secret custody and privacy/retention, add approved durable ingress/sanitization/inbox/outbox, then exercise exactly one approved order through every terminal state before claiming readiness |
| Release state | Draft Hoodie record, strict transition schema/policy, route-level release registry, and release-specific withdrawal plan exist | Current Hoodie staging readiness is denied by eleven exact evidence blockers; the route denies Draft Shopify observations outside Local | Resolve reviewed Shopify observation/commerce facts, provider variant/mapping fingerprints, immutable candidate/build evidence, media/release fingerprints, and private staging evidence before staging |

## Environment model

| Environment | Purpose | Data/release policy |
|---|---|---|
| Local | Implementation and evidence | Defaults fail closed; fixture permitted only when visibly labeled and gated |
| Vercel Preview | Private staging/review | Branch deployment, environment-specific values, no fixtures, Staged-or-later evidence required, no production promotion |
| Production | Customer commerce | Approved `main` only; no fixtures or unreleased products; complete Released evidence required and all operational gates directly proven |

## Target decomposition

- Server product adapter: implemented for no-store Shopify reads with explicit unavailable/error results.
- Product release record: Draft record exists with product/provider/media evidence and missing fingerprints explicit.
- Route-level home summary, production-aligned storefront composition, product, release-aware catalog, and truthful bag-state components: implemented.
- Client islands for variant selection, cart interaction, and media controls only after server activation decisions authorize their exact inputs.
- Shopify-native cart behind a narrow server-owned adapter only after release, variant, capability, Product Owner, and environment gates pass.
- Provider-neutral cart envelope and fail-closed checkout-host policy before activating the bag.
- Media renderers for actual Shopify `IMAGE`, `VIDEO`, `EXTERNAL_VIDEO`, and `MODEL_3D` records, with accessible fallbacks.
- Provider/media capability adapters classified by supported API/webhook, Shopify Admin/Flow, app credentials, approved browser workflow, human-only, or unavailable.
- Agentic workflow state for both designer-led and trend-led creation, always ending at explicit human approval gates for spend, Shopify writes, publish, and production.
- ProductBrief inputs are candidate evidence only. Trend signals are always `research-only`; neither creation mode can set product truth, approve media, authorize commerce, or publish. ProductCreationJob v2 embeds the validated brief and binds both modes to the same Product Release Record, Media Registry, Commerce Gateway, and PipelineRun contract.
- Job triggers distinguish on-demand from scheduled cadence with an explicit timezone/expression. Every input carries publisher/retrieval provenance and a deterministic freshness classification. Binding CARLOPHILLIPS rules and inspiration-only reference policy prohibit copying or inferred rights/product/media truth. Idempotency keys plus normalized input fingerprints suppress retries/equivalent duplicates; scheduled jobs still require external-execution approval.

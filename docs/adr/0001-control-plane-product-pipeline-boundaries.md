# ADR 0001: Design system, product pipeline, and admin control-plane boundaries

Status: Accepted for selective port

Date: 2026-08-14

This decision separates three concerns that must cooperate but must not own one
another. Commit `1f3fc46` is a migration reference only and must not be merged
wholesale. Canonical Admin, Theme, P0 containment, and PR #9 storefront parity
remain in place while the typed boundaries below are ported selectively.

## Decision

### 1. Experience plane

The design system is the sole visual authority. It owns tokens, themes,
primitives, component states, accessibility behavior, Storybook, and visual
regression fixtures. Storefront and Admin may compose feature components, but
they may not introduce independent colours, spacing, typography, motion,
radii, primitive controls, or runtime CSS authorities.

The current Admin Theme workflow remains a governed Product Owner proposal
surface. It may create an allowlisted, versioned proposal against canonical
token keys. It may not write public runtime CSS or bypass code review, Preview,
visual comparison, and approval.

### 2. Product and release domain plane

`@repo/product-pipeline` is the intended owner of reusable, pure TypeScript
business truth:

- ProductBrief;
- ProductCreationJob and duplicate suppression;
- PipelineRun and work-item evidence;
- the exact seventeen-step PODPIPE delivery workflow;
- the exact eleven-section product display contract;
- Product Release and Media Registry readiness projections;
- evidence reconciliation and release-transition decisions;
- sanitized order, fulfilment, and post-sale lifecycle reducers;
- typed command-intent decisions that grant no execution authority.

The package must import no React, filesystem, environment, network, Shopify,
POD provider, database, or deployment SDK. It receives validated values and
returns deterministic, JSON-serializable decisions.

### 3. Integration plane

Transport packages and server adapters own external communication:

- Shopify transport owns query, observation, normalization, and webhook
  envelope verification;
- POD adapters own provider observations and fulfilment mappings;
- repository adapters own release, media, run, approval, audit, and lifecycle
  persistence;
- deployment adapters own immutable Preview/Production evidence and rollback
  observations.

Adapters produce evidence. They do not approve media, release products, enable
checkout, authorize publication, or supersede the canonical Product Release
Record.

### 4. Experience consumers

The public storefront consumes only release-bound, customer-safe projections.
It must not import Admin components, raw provider references, command services,
or unapproved media.

The Admin portal is the visible operational projection of the complete funnel.
It consumes the same typed product-pipeline decisions and canonical evidence;
it must not maintain a second workflow state. Its sections map as follows:

| Admin section             | Canonical responsibility                                                            |
| ------------------------- | ----------------------------------------------------------------------------------- |
| Overview                  | Derived readiness, blockers, owners, and safe resume points                         |
| Briefs and drops          | ProductBrief provenance and binding constraints                                     |
| Jobs and runs             | ProductCreationJob, PipelineRun, attempts, and evidence                             |
| Product, POD, and samples | Garment/provider mapping and physical-sample gate                                   |
| Media Registry            | Eleven-section requirements, quarantine, approval, and bindings                     |
| Releases                  | Draft → Staged → Approved → Released evidence and rollback                          |
| Evidence and approvals    | Freshness, conflicts, approval targets, and fingerprints                            |
| Publication               | Candidate build, Preview QA, Production approval, and rollback                      |
| Orders and fulfilment     | Payment, order, POD handoff, shipment, and tracking events                          |
| Post-sale                 | Support, return, refund, and review eligibility events                              |
| Analytics                 | Consent-aware measurement and Shopify reconciliation                                |
| Commands                  | Decision-only intents until identity, durable audit, and an approved executor exist |
| Theme                     | Governed token proposal; not product-pipeline state                                 |

Empty or unavailable operational areas remain visible and explicitly labeled.
Absence of an order, connector, approval, or audit store must never be rendered
as readiness.

## Dependency direction

```text
design-system <- storefront UI
design-system <- admin UI

product-pipeline <- storefront server projections
product-pipeline <- admin read-model builder

Shopify/POD/repository/deployment adapters -> validated evidence
validated evidence -> product-pipeline decisions

admin command UI -> pure decision -> disabled executor boundary
```

Dependencies must remain acyclic. The domain package never imports an app or an
adapter. Shopify never imports release authority. Admin never imports
storefront internals.

## Placement and deployment phases

### Current canonical phase

- Preserve the existing protected Admin and Theme implementation.
- Preserve PR #9 customer-facing parity and current containment.
- Selectively port `@repo/product-pipeline` and typed contracts behind existing
  views.
- Keep Admin local/read-only or otherwise within its already reviewed access
  boundary.
- Add payment/order, fulfilment, and post-sale projections before claiming an
  end-to-end operational control plane.

### Future separation phase

A separate `apps/admin` deployment is the preferred long-term trust boundary,
but it is not authorized by this ADR. It requires a separate decision covering
remote identity, least-privilege roles, sessions, CSRF/origin controls,
retention, durable audit, incident ownership, Vercel project/domain placement,
and rollback. Until that approval and parity proof exist, the current Admin
route remains canonical.

## Acceptance gates for every selective port

- canonical Hoodie remains Draft unless a separately approved release record
  passes all gates;
- zero direct Shopify, POD, Vercel, order, payment, or publication mutation;
- schema/type and old/new evaluator parity tests;
- no raw provider identifiers or secrets in browser projections;
- full lint, strict TypeScript, formatting, tests, audit, and build;
- Admin responsive QA at 1440×1000, 1024×768, and 390×844;
- public home, product, shop, and bag screenshot comparison with expected zero
  visual delta;
- payment/order, fulfilment, post-sale, empty, stale, conflict, denied, and
  unavailable states remain explicit.

Passing architecture QA does not authorize Preview promotion, Production,
Shopify writes, orders, fulfilment, refunds, or publication.

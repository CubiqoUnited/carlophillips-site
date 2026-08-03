# CP Fitness Cycle 19 Evidence Package

## 1. Objective and commit

Defined an evidence-only, server-contained variant-resolution readiness
contract for cart gate 6 without selecting a Shopify variant or enabling any
mutation. The local commit is reported by Git at handoff; its parent is
`ca9c5b9`.

## 2. Exact files changed

- Resolver policy/runtime:
  `lib/commerce/variant-resolution-policy.js`,
  `lib/commerce/variant-resolution-server.js`, and
  `contracts/variant-resolution-decision.schema.json`.
- Activation/capability boundaries:
  `lib/commerce/cart-activation-policy.js` and
  `config/capability-registry.json`.
- Raw-map retirement:
  `lib/shopify/normalize.js` and `lib/shopify/types.js`.
- Deterministic coverage: resolver, cart activation, contracts, capability
  registry, Shopify normalization, and active-boundary tests.
- Governance/evidence: root governance/status/task records, durable commerce
  and Shopify access audits, this report, and `verification.json`.

## 3. Tests, commands, and machine-readable artifacts

- Focused resolver/activation/contract verification: 6 files and 98 tests
  passed; ESLint passed with zero warnings.
- Full `yarn verify`: zero-warning ESLint, 32 files/308 tests, zero production
  advisories across 193 packages, and a successful Next.js 15.5.21 build with
  13 routes.
- A real production `VariantResolutionDecision` satisfies cart gate 6 only
  when environment, handle, fingerprint, runtime surface, both evidence
  references, complete nonzero mapping, and false authority flags remain
  intact.
- No customer-visible route changed. Cycle 18 desktop/mobile PDP evidence
  remains the applicable browser regression.

## 4. Exists / Partial / Proposed / Missing changes

- Exists: `cp.variant-resolution-decision.v1` with a strict sanitized schema.
- Exists: re-derivation of current canonical observation identity and commerce
  facts from fresh server-ephemeral raw variants.
- Exists: exact one-to-one coverage between reviewed opaque hashes and current
  raw references, expressed only as a count and completion flag.
- Exists: separate semantics for registry `local` implementation verification
  and runtime `server_only` containment.
- Exists: no raw ID, selected target, selection authority, cart mutation
  authority, or checkout authority in the decision or public summary.
- Exists: obsolete flattened `shopifyVariants` and first-variant shortcuts are
  removed from product normalization.
- Partial: the sole production entry for readiness is server-only, but cart
  activation deliberately still passes a null resolver decision.
- Missing: live Storefront product-read evidence, fresh raw Shopify input,
  verified cart capability, Product Owner activation approval, selected-variant
  orchestration, and operational cart/checkout proof.

Fitness remains **44/50**, not production readiness. Local truth containment is
stronger, while hosted and operational evidence remain the score ceiling.

## 5. Failures and contradictory evidence

- Registry `local` and runtime `server_only` initially risked appearing
  contradictory. They now describe different facts: where the implementation
  is verified versus where raw runtime input is contained.
- A prior cart fixture used a hand-shaped resolver object. Integration coverage
  now feeds the real evaluator output into cart policy and rejects tampering.
- Product normalization still created a flattened option-to-raw-ID map even
  though the release boundary discarded it. That redundant authority-shaped
  payload is removed.
- The readiness wrapper is not the only server code that sees raw IDs: the
  Storefront loader necessarily sees them first to create the hashed
  observation. Documentation now narrows the wrapper claim to the sole
  production entry for readiness computation.

## 6. Human/external blockers and exact resume points

- Shopify product read: establish least-privilege Storefront read access and
  durable evidence, then resume at a fresh sanitized Product Observation.
- Resolver orchestration: after fresh read evidence exists, supply raw input
  only inside server orchestration and retain only the sanitized decision.
- Cart write: verify the exact Storefront cart capability with no-order
  evidence, then separately request Product Owner activation approval.
- Shopify Admin/apps: authenticate the approved agent path without recording
  credentials, then resume at P0 read-only capability classification.
- Vercel 402: restore authorized access, then resume with a Preview-only deploy
  and browser/HTTP verification.
- Spending, billing, writes, orders, publish, merge, deploy, and production
  remain separately human-gated.

## 7. Product Owner decisions required

No new product-sequence decision is required. Human decisions remain the
minimum Shopify connector authentication, exact product/media/fulfillment
approval, cart capability and activation authorization, paid usage,
operational tests, publication, deployment, merge, and production.

This cycle does not ask the Product Owner to approve a mutation target. It
creates only readiness evidence that future orchestration may consume after
all independent gates are real.

## 8. Rollback and next bounded cycle

Rollback by reverting the Cycle 19 commit; no external state changed. The next
safe cycle is a provider-neutral Apliiq Hoodie mapping observation/review
contract: distinguish reported historical IDs from current provider truth,
hash raw provider references, require capability evidence and exact approval,
emit only a non-applying candidate release patch, and perform no provider
access, sample, order, fulfillment, billing, or Shopify write.

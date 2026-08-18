# CP Fitness Cycle 18 Evidence Package

## 1. Objective and commit

Made Shopify variant presentation an exact, disabled, release-bound projection
of canonical Product Observation facts, while keeping cart mutation behind a
separate evidence-backed server resolver and exact Storefront cart capability.
The local commit is reported by Git at handoff; its parent is `ebb7ec3`.

## 2. Exact files changed

- Variant contract and policy:
  `contracts/variant-presentation.schema.json`,
  `lib/commerce/variant-presentation-policy.js`, and
  `lib/commerce/product-observation.js`.
- Release/view boundary:
  `lib/commerce/observation-visibility-policy.js`,
  `lib/commerce/product-view-model.js`, and
  `components/commerce/product-detail.jsx`.
- Cart activation:
  `lib/commerce/cart-activation-policy.js`,
  `lib/commerce/cart-activation-server.js`, and
  `contracts/cart-activation-decision.schema.json`.
- Deterministic coverage: variant presentation, observation, release,
  view-model, component, contract, catalog, media, and cart-activation tests.
- Governance/evidence: root governance/status/task records, durable commerce
  and Shopify access audits, this report, and `verification.json`.

## 3. Tests, commands, and machine-readable artifacts

- Focused policy/contract/component verification: 10 files and 155 tests
  passed.
- Full `yarn verify`: zero-warning ESLint, 31 files/276 tests, zero production
  advisories across 193 packages, and a successful Next.js 15.5.21 build with
  13 routes.
- The raw-order regression proves `createProductObservation` canonicalizes
  non-alphabetical Shopify options before `createVariantPresentation`; the
  presentation then validates as ready review information.
- Direct desktop PDP verification passed in the fixed in-app-browser viewport;
  the full-page evidence is 1274×1700. The selected browser exposed no viewport
  override, so mobile used a temporary localhost-only reverse proxy and an
  actual 390×844 iframe CSS viewport. The copied local response alone had
  framing headers stripped; the application server/security policy was not
  changed. The frame showed meaningful fixture content, purchasing disabled,
  no add/cart/checkout action, no error overlay, and no horizontal overflow.
- Collection and home navigation passed with meaningful content, no error
  overlay, checkout link, or horizontal overflow.
- The proxy and dev server were stopped, the rejected public harness was
  removed, and final diff review proves neither is present in repository
  source. Production/Preview Shopify presentation remains deterministic
  component/policy evidence only because no live read capability is proven.

## 4. Exists / Partial / Proposed / Missing changes

- Exists: one non-empty, case-insensitively unique canonical option-name
  schema shared by every reviewed combination.
- Exists: unique exact option signatures and opaque reference hashes, reviewed
  currency consistency, price validation, and at least one combination.
- Exists: presentation fingerprint equality against both current product facts
  and the Product Release Record.
- Exists: all combination controls are disabled and no add/cart/checkout
  action is rendered.
- Exists: outer `shopifyVariants` and injected `variantPresentation` payloads
  are discarded.
- Exists: the cart-write gate requires the exact evidence-backed
  `shopify-storefront-cart` capability, adapter, and Storefront surface.
- Partial: the server-only resolver is a required decision contract but is
  intentionally not wired.
- Missing: live Storefront variant observation, current resolver evidence,
  Product Owner cart activation approval, and operational cart/checkout proof.

Fitness remains **44/50**, not production readiness. This cycle strengthens
the local commerce truth boundary; hosted and operational evidence remain the
score ceiling.

## 5. Failures and contradictory evidence

- A structurally valid variant list alone could be injected without proving it
  belonged to the reviewed product/release fingerprint.
- Flattened colors/sizes could imply combinations that Shopify never observed.
- Opaque hashes could be mistaken for cart targets without a separate
  server-only resolver.
- A generic fabricated `{ status: "ready" }` capability could previously
  satisfy the pure cart-write gate. The policy now checks exact capability,
  adapter, callable surface, and non-empty durable evidence.
- The Product Owner browser login and installed-app inventory are reported
  evidence only; neither proves agent/API/app-private capability.

## 6. Human/external blockers and exact resume points

- Shopify product read: establish least-privilege Storefront read access and
  durable evidence, then resume at a sanitized current Product Observation.
- Variant resolver: implement and evidence a server-only resolver bound to the
  same reviewed fingerprint; never expose raw Shopify references.
- Cart write: verify the exact Storefront cart capability with no-order
  evidence, then separately request Product Owner activation approval.
- Shopify Admin/apps: authenticate the approved agent path without recording
  credentials, then resume at P0 read-only capability classification.
- Vercel 402: restore authorized access, then resume with a Preview-only deploy
  and browser/HTTP verification.
- Spending, billing, writes, orders, publish, merge, deploy, and production
  remain separately human-gated.

## 7. Product Owner decisions required

No product-sequence decision is required: the Signature Hoodie remains the
first reusable end-to-end proof. Human decisions remain authentication for the
minimum CP connector path, exact product/media/fulfillment approvals,
resolver/cart-write authorization, paid usage, operational tests,
publication, deployment, merge, and production.

The 30 installed apps remain candidates rather than automatic owners. The
minimum model uses the approved CP Admin/Storefront connector, Apliiq for the
Hoodie proof when verified, only one selected media worker per modality, and
optional workers only for explicitly assigned jobs.

## 8. Rollback and next bounded cycle

Rollback by reverting the Cycle 18 commit; no external state changed. The next
bounded cycle is the server-only variant-resolution contract:
prove hashed reviewed identity resolves only on the server to the exact current
Shopify variant, without exposing mutation authority or attempting a write.

# CP Fitness Cycle 17 Evidence Package

## 1. Objective and commit

Bound all Shopify-derived customer copy to the reviewed Product Observation and
removed release-status wording that contradicted a Released production
decision. The local commit is reported by Git at handoff; the parent is
`596ee5b`.

## 2. Exact files changed

- Truth boundary: `lib/commerce/product-observation.js`,
  `lib/commerce/observation-visibility-policy.js`,
  `lib/commerce/product-view-model.js`, and
  `contracts/product-observation.schema.json`.
- Shopify normalization and route presentation:
  `lib/shopify/normalize.js`, `components/commerce/product-detail.jsx`, and
  `app/products/[handle]/page.js`.
- Deterministic coverage: observation, visibility, release, contract,
  normalization, loader, view-model, component, catalog, and media regression
  tests plus shared release fixtures.
- Governance/evidence: root PRD/architecture/status/task records, durable
  status/commerce/capability records, this report, screenshots, and
  `verification.json`.

## 3. Tests, commands, and machine-readable artifacts

- Focused copy/release/view verification: 10 files and 124 tests passed;
  ESLint passed with zero warnings.
- Full `yarn verify`: zero-warning lint, 30 files/246 tests, zero production
  advisories across 193 packages, and a successful Next.js 15.5.21 build with
  13 routes.
- Desktop 1440×1000 and mobile 390×844 local-fixture PDP plus home navigation
  passed with content, no overlay, console warning/error, checkout link, or
  horizontal overflow; purchasing remained disabled.
- The production Released and private Preview copy states are proven by
  deterministic Server Component/view-model tests because live Shopify and
  hosted production remain unavailable.

## 4. Exists / Partial / Proposed / Missing changes

- Exists: canonical title, plain description, vendor, product type, tagline,
  ordered details, price, currency, availability, and variants in the
  commerce-facts fingerprint.
- Exists: whitelist-derived release product; arbitrary outer copy, story,
  HTML, product IDs, and variant mappings do not cross the boundary.
- Exists: Preview/private-review, Local/review, and production/Released status
  language with cart and checkout reported as separate gates.
- Exists: neutral unavailable story when no reviewed story source exists.
- Partial: the contracts are locally proven against sanitized fixtures only.
- Missing: current live Shopify observation, exact approval/application,
  hosted Preview, and operational cart/checkout/fulfillment proof.

Fitness remains **44/50**, not production readiness. This cycle deepens the
already-maximized local architecture category; hosted and operational evidence
remain the score ceiling.

## 5. Failures and contradictory evidence

- The former release product spread the outer normalized adapter object, so
  description/vendor/type/tagline/details and injected title/story text were
  not necessarily the facts represented by the reviewed fingerprint.
- The first corrected whitelist still fed generic UI copy saying “release
  approval pending” and “unresolved release.” That was false for a production
  decision whose reason was `RELEASED_PRODUCT_PURCHASE_FLOW_UNVERIFIED`.
- Final policy derives status language from source, environment, and release
  reason. Released product facts no longer imply that release approval is
  pending, while purchasing remains explicitly disabled.

## 6. Human/external blockers and exact resume points

- Shopify read: establish least-privilege Storefront product-read capability
  and durable evidence, then resume at a sanitized current observation.
- Review/application: approve the exact full fingerprint and handle, then
  separately authorize applying its candidate release patch.
- Shopify Admin/app audit: authenticate without recording authentication data,
  then resume at P0 read-only capability classification.
- Vercel 402: restore authorized access, then resume with Preview-only deploy
  and verification.
- Writes, paid tools, orders, publish, merge, and production remain separately
  approval-gated.

## 7. Product Owner decisions required

No product-sequence decision is required. Human decisions remain live read
access, exact product/media/fulfillment approval, release-record application,
operational tests, paid usage, writes, publication, deployment, merge, and
production. A marketing story requires its own reviewed source rather than a
fallback invented by the storefront.

## 8. Rollback and next bounded cycle

Rollback by reverting the Cycle 17 commit; no external state changed. Next safe
cycle: derive option/variant presentation from reviewed sanitized variants,
preserve valid combinations and availability, discard outer adapter mappings,
and keep selection non-commerce until all seven cart-activation gates pass.

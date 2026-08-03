# CP Fitness Cycle 16 Evidence Package

## 1. Objective and commit

Bound rendered Shopify media to approved Media Registry assets instead of
trusting a matching release ID alone. Preview may show a truthful partial
approved set; production requires complete current non-waived modality and
fallback coverage. The local commit is reported by Git at handoff; the parent
is `a8372e5`.

## 2. Exact files changed

- Media truth: `contracts/media-asset.schema.json`,
  `lib/commerce/media-visibility-policy.js`, and
  `lib/commerce/media-release-policy.js`.
- Runtime/view: `lib/commerce/release-policy.js`,
  `lib/commerce/product-view-model.js`, and
  `components/commerce/product-detail.jsx`.
- Hoodie truth: its three current assets explicitly carry null storefront
  bindings; no approval or current Shopify media was invented.
- Tests: dedicated media-visibility coverage plus media release, product
  release/gateway/catalog, contracts, view-model, and PDP regressions.
- Governance/evidence: root and durable architecture/status/task records,
  capability/commerce inventories, this report, and `verification.json`.

## 3. Tests, commands, and machine-readable artifacts

- Focused media/release/catalog/view verification: 9 files and 108 tests
  passed; ESLint passed with zero warnings.
- Full `yarn verify`: zero-warning lint, 30 files/231 tests, zero production
  advisories across 193 packages, and a successful Next.js 15.5.21 build with
  13 routes.
- Desktop 1440×1000 and mobile 390×844 local-fixture PDP plus home regression
  passed: HTTP content rendered with no overlay, console warning/error,
  checkout link, or horizontal overflow; purchasing stayed disabled and the
  fixture label remained visible. Screenshots are `desktop-pdp.png` and
  `mobile-pdp.png`.
- The Shopify-only partial-media state is proven through deterministic server
  and component tests because live read capability remains unavailable.

## 4. Exists / Partial / Proposed / Missing changes

- Exists: nullable evidence-backed storefront binding per Media Registry asset.
- Exists: deterministic media facts hash over current identity, type, canonical
  URL, and preview URL; only the hash and evidence persist.
- Exists: per-asset filtering that substitutes registry-owned asset IDs, alt
  text, and modality labels before the view model.
- Exists: production denial when current matches do not cover every non-waived
  required modality or a required motion/3D fallback.
- Partial: Preview may show a matched subset with an explicit missing-media
  review state; it remains non-commerce.
- Missing: live Hoodie media observation, bindings, provenance/rights/quality
  approval, complete rich media, hosted Preview, and all operational proof.

Fitness remains **44/50**, not production readiness. The local media boundary
is stronger, but no live or operational gate changed.

## 5. Failures and contradictory evidence

- The former release path validated manifest completeness but passed the entire
  current Shopify media array to the view model. A release-ID match therefore
  did not prove an individual rendered asset was approved.
- The first media-focused run expected malformed media to exclude its entire
  product. The new per-asset policy correctly stripped that media while
  retaining truthful product counts; the regression was updated.
- Review clarified that per-asset quarantine cannot weaken production. The
  final policy permits partial Preview only and denies Released production when
  required current bindings/fallbacks are absent.
- The test fixture records spin as explicitly infeasible-approved because no
  truthful spin renderer is active; it does not simulate a spin.

## 6. Human/external blockers and exact resume points

- Storefront product/media read: authorized owner establishes least-privilege
  server-only access and durable capability evidence. Resume at a current
  sanitized product/media observation.
- Media: verify exact-product provenance, rights, quality, approval, and hashed
  current storefront bindings for each required asset. Keep registry changes
  unapplied until the exact approval boundary is authorized.
- Shopify Admin/app audit: authenticate without recording authentication data,
  then resume at P0 read-only capability classification.
- Vercel 402: authorized owner restores access; resume with Preview-only
  deployment and verification.
- Writes, paid tools, orders, publish, merge, and production remain separately
  approval-gated.

## 7. Product Owner decisions required

No product-sequence decision is required. Human decisions remain exact media
approval/binding, read capability evidence, any registry/release application,
operational tests, paid usage, writes, publication, deployment, merge, and
production.

## 8. Rollback and next bounded cycle

Rollback by reverting the Cycle 16 commit; no external state changed. Next safe
cycle: extend reviewed commerce facts to description, vendor, product type,
details, and any other customer-visible Shopify copy so outer adapter payloads
cannot alter approved presentation.

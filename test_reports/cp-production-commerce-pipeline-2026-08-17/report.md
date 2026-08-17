# CARLOPHILLIPS release-bound Production commerce pipeline

Date: 2026-08-17

Branch: `codex/cp-shopify-checkout-handoff`

Environment changed: none

## Outcome

The repository now contains the missing safe path for eventually enabling Shopify checkout in Production. A staged candidate may request checkout only when an exact-commit preflight proves that the Product Release Record is Released, its complete evidence is valid, operational cart capability exists, and Product Owner Production cart and checkout approvals match. A distinct safe fallback always remains fail-closed.

This does not make the current Hoodie releasable. Its canonical record remains Draft, so Shopify Payments and customer charging remain off.

## Pipeline controls

- Release-candidate workflow input: `checkout_enabled`, default `false`.
- Production workflow input: `expected_candidate_checkout`, default `false`.
- Enabled candidate preflight binds exact full SHA, release ID, release evidence, operational `cart-write`, and Product Owner Production cart/checkout approvals.
- Candidate and safe-fallback receipts independently bind `cpCheckoutEnabled`; fallback must always be `false`.
- Promotion repeats preflight and validates the reviewed candidate/fallback receipt pair before any alias change.
- Candidate smoke requires a checkout form only in enabled mode. Fallback smoke requires a visible denial and no checkout form.

## Current exact preflight result

The real `cp-signature-hoodie-2026-001` record was tested and denied. Its blockers are:

- release state is Draft;
- candidate SHA is not bound to this pipeline commit;
- Shopify product, variant-identity, commerce-facts, and full-observation fingerprints are missing;
- physical sample is not ordered, delivered, inspected, or approved;
- required media, product, fulfillment, candidate, staging, and rollback evidence/approvals are incomplete;
- a fresh matching ACTIVE Production observation is missing;
- rollback verification is incomplete;
- cart capability is test-only (`write_test_verified` / `cart-write-test`), not operational `write_verified` / `cart-write`.

## Source verification

- Design-system lint: pass.
- ESLint, zero warnings: pass.
- Vitest: 48/48 files, 501/501 tests pass.
- Production dependency audit: 0 vulnerabilities across 67 packages.
- Next.js 15.5.21 optimized build: pass.
- Workflow YAML parse: pass.
- Real Draft preflight: expected denial, exit 1, with the blockers above.

## Background browser and screenshot QA

Route: `http://127.0.0.1:3142/products/carlophillips-signature-hoodie`

Mode: local presentation fixture in optimized production mode; fail-closed purchasing

Browser: headless Chromium; no visible window or focus change

| Viewport | HTTP | Purchasing denied | Checkout controls | Overflow | Runtime overlay | Console/page errors | Material visual variance |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1440×1000 | 200 | yes | 0 | no | 0 | 0 | 0.029% |
| 390×844 | 200 | yes | 0 | no | 0 | 0 | 0.065% |

The comparison uses the prior accepted fail-closed Hoodie screenshots as baseline and ignores channel differences of 8/255 or less. Both results are below the 0.1% material-variance limit. Desktop and mobile candidates were also visually inspected and preserve the same disabled-purchase presentation.

Evidence:

- `browser-qa.json`
- `screenshots/desktop-draft-denial.png`
- `screenshots/mobile-draft-denial.png`

## External delivery status

- Canonical `origin/main` observed at `0b23605a7f2a2c4ef98e40e6380927ecd4ac9b10`.
- Existing PR #14 is open and its remote head is `f2d2846d0fe9dcbdcfafd45b063cfe3495ed192d`.
- Latest READY Preview observed at deployment `dpl_CR2pER7GwS6FZQQHaega8aGB79ig`, checkout metadata false.
- Current READY Production observed at deployment `dpl_HkkbWDjJTMVjCZ4bMQ17txwZuwh8`, checkout metadata false.
- The local GitHub CLI credential is expired, so this exact pipeline patch was not pushed or attached to PR #14.

## Read-only Apliiq mapping observation

The authenticated saved design was re-observed after the pipeline commit without changing or saving any provider data. It is provider product `5958463`, Independent Trading Co `IND4000`, black, front embroidery, 2 in × 2 in, 648 stitches. All nine size/SKU mappings from XS through 5XL were present and are now bound through the sanitized evidence file `releases/cp-signature-hoodie-2026-001/apliiq-variant-observation.json`.

The observed dropship unit price was USD $50.45 before shipping and tax. This is not a final sample quote or purchase authority. No size, destination, shipping method, tax, or total was selected.

## Fresh Shopify-native product observation

A credential-free read-only request to Shopify's own public product JSON endpoint returned the current ACTIVE/published Hoodie facts. The server-only adapter normalized that primary response through the same canonical observation model used by the Storefront loader and discarded raw product/variant references after hashing.

- Handle: `carlophillips-signature-hoodie`
- Title: `CARLOPHILLIPS Signature Hoodie`
- Vendor/type: Apliiq / hoodie
- Currency and range: USD $128–$134
- Variants: 9 black sizes, XS through 5XL, all currently available
- Variant fingerprint: `sha256:f7e89925f1119c324cc159444a2c90d645e910555d471bfe77fba2440e348db1`
- Commerce-facts fingerprint: `sha256:c055e02227f425e36a72b7899a804b17bd270e7d22dd18c9fa119dd3840a77ec`
- Full observation fingerprint: `sha256:143a817c9a1d8898faeaee2aa81e05ccc05153f9dfa3ae9497411c44c1cf47f4`
- Review state: pending exact Product Owner approval

Evidence is stored at `releases/cp-signature-hoodie-2026-001/shopify-product-observation.json`; its schema and fingerprint integrity pass, and secret/raw IDs are absent. The blocked review decision at `shopify-observation-review.json` grants no publication or checkout authority.

## Candidate evidence now bound

Candidate source `acd2a0b80d3be24234c41827c35e669c6ad39742` now has exact local build/browser evidence, Media Registry manifest fingerprint `sha256:873a75f8c4a2068cbf1ac6e1a2f518d1da2957389f9015010fcdef211845ddd5`, and a matching candidate-specific rollback-plan binding. This closes the local candidate, manifest, build, and rollback-plan staging blockers without asserting remote staging.

The remaining preflight blockers are exact Shopify observation approval/binding, immutable Staging evidence, the physical sample and three release approvals, incomplete real media coverage, a fresh post-approval Production observation, rollback verification, operational cart capability, and the final Released state.

Post-capture verification passes design-system lint, zero-warning ESLint, 49/49 test files and 507/507 tests, plus the optimized Next.js 15.5.21 build. Package inputs did not change from the recorded zero-vulnerability production audit.

## Remaining human gates

1. Order and physically inspect the exact Apliiq Hoodie sample as recorded in `reports/HUMAN_INTERVENTION_STICKY_RED.md`.
2. Complete and bind the fulfillment, Shopify, media, approval, current Production observation, and rollback evidence until the Product Release Record legitimately reaches Released.
3. Reauthenticate the GitHub delivery session, publish the exact temporary branch, run protected CI and immutable Preview QA, obtain required review, and separately approve Production promotion.
4. Turn Shopify Payments test mode off only as the final supervised activation step after the reviewed Production artifact is live and end-to-end smoke checks pass.

No Production, Shopify catalog, payment, order, fulfillment, Vercel alias, merge, or publication mutation occurred in this work.

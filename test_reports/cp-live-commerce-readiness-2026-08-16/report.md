# CARLOPHILLIPS live commerce readiness audit

Date: 2026-08-16

Mode: authenticated, read-only inspection of the Product Owner's already-open Shopify Admin and Apliiq tabs

Candidate commit before this evidence update: `868472d2daafab63d2ccbb160c6b0c9d2b71fd3a`

## Outcome

The Signature Hoodie is not a Shopify Draft. Shopify currently shows it as **Active**, published to **Online Store** and **Carlophillips Headless**, with nine Black variants from XS through 5XL, a USD 128–134 price range, four media assets, and Apliiq as vendor. All nine variants are selected in the `Apliiq Print On Demand` shipping profile and fulfilled from `Apliiq Dropship Fulfillment`.

Apliiq shows the `carlophillips` Shopify store connected, an existing fulfillment payment method, and the matching Independent Trading Co `IND4000` saved design with nine sizes and one artwork. The saved-design surface also contains a Bone record; the Shopify product observed in this audit exposes only Black.

The website is **not ready for real customer charges yet**:

- Shopify Payments is in test mode and explicitly says it accepts test payments only.
- The Shopify Payments management screen also requires two-step authentication to be enabled on the account before financial settings can be treated as production-secure. The live-payment control was inspected but not submitted.
- Apliiq has no orders in 2026 and no pending or historical first-production mock approval visible in the account.
- The exact Storefront product/variant fingerprints could not be refreshed because Vercel returned the sensitive Preview values as empty local placeholders. No value was exposed or bypassed.
- The exact Apliiq per-variant/SKU mapping fingerprint, physical sample, media approval/bindings, final release approvals, and fresh post-approval Production observation remain missing.
- The repository Product Release Record therefore remains `draft`, even though its stale `statusObserved` field is corrected from `DRAFT` to the currently observed `ACTIVE`.

## Visual comparison

The earlier repository screenshot `test_reports/cp-shopify-audit-2026-08-04/signature-hoodie-draft.png` was compared with `screenshots/shopify-signature-hoodie-active.jpg`.

- Earlier capture: Shopify badge `Draft`, two visible product media items.
- Current capture: Shopify badge `Active`, four visible product media items.
- Product title and core description remain consistent.

The current screenshot was visually inspected and is readable. Repeated Apliiq and Shopify Settings screenshot attempts timed out in the in-app browser's capture layer; the authenticated DOM evidence was retained in the task log and summarized in `live-commerce-observation.json`. No customer order was opened.

## Checkout implementation state

The Next.js storefront already contains the server-only Shopify hosted-checkout handoff. It remains fail-closed until the Product Release Record is Released, current fingerprints match, operational cart authority exists, Product Owner approvals are bound, and the environment switches are enabled. This audit did not enable any switch or create a Shopify cart.

## Safe next actions

1. Capture the exact Shopify Storefront observation inside a protected runtime that has non-empty sensitive variables, then present its sanitized fingerprint envelope for Product Owner review.
2. Capture the exact Apliiq variant/SKU mapping for all nine Black variants.
3. Quote one exact physical Hoodie sample, including size, destination, shipping, tax, and total. Purchase only after the Product Owner approves that exact total.
4. Complete Apliiq's first-production mock approval and inspect the delivered sample.
5. Bind truthful release media, immutable Staging/build/rollback evidence, and product/media/fulfillment approvals.
6. Keep Shopify Payments in test mode while staging checkout is verified. Turning off test mode and enabling customer charges remain separate final Production actions.

## Payment-activation preflight

The Product Owner's explicit request to enable purchases was treated as authorization to inspect the activation path, not as permission to bypass the repository's release and fulfillment controls. The live control is available, but submitting it now would broaden real-payment exposure in Shopify while the CARLOPHILLIPS frontend still correctly denies checkout for the Draft release. The management screen confirms that two-step authentication is not enabled. No toggle or Save action was submitted.

The safe sequence is: enable account two-step authentication; complete the exact Hoodie mapping/sample/release evidence; verify a test-mode Shopify hosted-checkout redirect from immutable Staging; approve that exact release; then enable the Production cart and checkout environment gates and turn off Shopify Payments test mode during the same supervised release window.

No product, sales channel, payment, shipping, order, fulfillment, Vercel environment, deployment, alias, merge, or Production change occurred during this audit.

## Repository verification

- Design-system lint: pass; active UI values remain governed by canonical tokens/components.
- ESLint: pass with zero warnings.
- Vitest: 46/46 files and 491/491 tests pass. The first wrapper run completed all tests but could not write Vitest's cache through the shared read-only `node_modules` symlink; the cache-disabled rerun exited cleanly.
- Production dependency audit: 0 vulnerabilities across 67 packages.
- Next.js 15.5.21 optimized build: pass; 8/8 static pages generated.
- Product Release Record schema/transition coverage: pass. The record remains `draft`; only the stale external `statusObserved` and timestamp were corrected.

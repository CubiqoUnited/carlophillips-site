# Human and External Blockers

## Vercel deployment access

Observed blocker: production and preview returned HTTP 402 `DEPLOYMENT_DISABLED` on 2026-07-22.

Human action: an authorized Vercel owner restores access for `carlophillips-site` or the Product Owner explicitly selects another host.

Resume point: deploy the approved branch to Preview only, configure scoped Preview values, and run HTTP plus desktop/mobile browser/console/network verification. Do not promote production.

## Product/media/fulfillment claims

Human action: Product Owner or designee approves product facts, price, media provenance/customer disclosure, fulfillment mapping, and any operational test.

Resume point: update the versioned Product Release Record and execute only the specifically authorized boundary.

## Read-only Shopify product observation

Observed blocker: the local audit reports the Shopify Storefront environment is incomplete, and Shopify mode returns `SHOPIFY_REQUEST_FAILED` without fixture substitution.

Human action: an authorized owner supplies valid read-only Storefront domain/token values in the intended local or Preview environment.

Resume point: use `COMMERCE_DATA_MODE=shopify`, capture the source-labeled product/variant/price/media response, and update the Draft release record fingerprints while purchasing remains disabled.

## Shopify/app capability access

Observed blocker: installed-app names are reported, but API/Admin/Flow/app-credential/browser access, scopes, billing/credits, Draft safety, and export consequences are not live-verified.

Human action: authorize the selected least-privilege read-only access path and separately approve any paid, credit-consuming, write, sample, or publish boundary.

Resume point: execute the matching P0 row in `/docs/shopify-capability-access-audit.md`, record sanitized findings, and resume the blocked `PipelineRun` work item without stopping other safe work.

## Restricted actions

Shopify writes, product activation, provider contact, paid services/trials, orders/samples, PR merge, DNS/cutover, and production promotion remain separately approval-gated.

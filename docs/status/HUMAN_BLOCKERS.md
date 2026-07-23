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

Observed gap: installed-app names are reported, but API/Admin/Flow/app-credential/browser access, scopes, billing/credits, Draft safety, and export consequences are not live-verified.

Authorized action: use the existing authenticated Shopify browser session in the next cycle for read-only inspection. No paid, credit-consuming, write, sample, publish, order, fulfillment, messaging, or production boundary is authorized.

Resume point: attempt each P0 surface, record sanitized findings or an exact access blocker, update the capability registry, and resume only proven read-only `PipelineRun` work without stopping other safe work.

## Supported framework migration

Observed blocker to production: Next.js `14.2.3` is end-of-life and below current supported security release lines.

Safe action: after the immediately scheduled Shopify read-only audit, migrate locally to a supported release line and run clean install, lint, tests, build, and browser regression.

Resume point: update the Yarn lockfile on this branch, repair compatibility issues without weakening truth gates, and keep deployment/production blocked until the migration evidence passes.

## Restricted actions

Shopify writes, product activation, provider contact, paid services/trials, orders/samples, PR merge, DNS/cutover, and production promotion remain separately approval-gated.

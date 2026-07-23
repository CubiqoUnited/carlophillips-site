# Human and External Blockers

## Vercel deployment access

Observed blocker: production and preview returned HTTP 402 `DEPLOYMENT_DISABLED` on 2026-07-22.

Human action: an authorized Vercel owner restores access for `carlophillips-site` or the Product Owner explicitly selects another host.

Resume point: deploy the approved branch to Preview only, configure scoped Preview values, and run HTTP plus desktop/mobile browser/console/network verification. Do not promote production.

## Product/media/fulfillment claims

Human action: Product Owner or designee approves product facts, price, media provenance/customer disclosure, fulfillment mapping, and any operational test.

Resume point: update the versioned Product Release Record and execute only the specifically authorized boundary.

Current staging decision: `releases/cp-signature-hoodie-2026-001/staging-readiness.json` denies staging until Shopify and Apliiq variant fingerprints, an immutable candidate commit, passing build evidence, and private staging evidence are bound. The release-specific withdrawal plan now exists; its verification remains intentionally null until an authorized live proof.

## Read-only Shopify product observation

Observed blocker: the local audit reports the Shopify Storefront environment is incomplete, and Shopify mode returns `SHOPIFY_REQUEST_FAILED` without fixture substitution.

Human action: an authorized owner supplies valid read-only Storefront domain/token values in the intended local or Preview environment.

Resume point: mark the Storefront product-read capability ready only with its durable evidence reference, use `COMMERCE_DATA_MODE=shopify`, generate the sanitized canonical observation, and review the exact observation fingerprint/handle. The review yields only a candidate patch; apply it to the Draft release record only through a separately authorized step while purchasing remains disabled.

## Shopify/app capability access

Observed blocker: the existing Google account path reached Shopify's six-digit email verification screen before Admin. Installed-app names, API/Admin/Flow/app-credential access, scopes, billing/credits, Draft safety, and export consequences were therefore not live-verified.

Current handoff: the prior verification tab did not persist across the task continuation. A fresh Shopify login tab is open, but no new login/OTP request was triggered.

Human action: in the current Shopify login tab, choose **Continue with Google**, select the existing account, then enter Shopify's one-time code if prompted. Do not share or record the code.

Resume point: start at installed-app inventory, then attempt each named P0 surface, record sanitized findings or an app-specific blocker, and resume only proven read-only `PipelineRun` work without stopping other safe work.

## Restricted actions

External product/media/research tool execution, Shopify writes, product activation, provider contact, paid services/trials, credits, orders/samples, PR merge, DNS/cutover, and production promotion remain separately approval-gated. Resume only at the exact approved adapter/action in candidate-only mode with evidence capture; one denied or human-required item must not stop other safe work.

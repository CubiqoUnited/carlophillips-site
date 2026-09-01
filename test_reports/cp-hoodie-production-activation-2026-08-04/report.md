# Signature Hoodie production-commerce activation evidence

Date: 2026-08-04
Task: `CP-HOODIE-PROD-ACTIVATION-2026-08-04`
Scope: exactly one product, `carlophillips-signature-hoodie`

## Outcome

The Shopify and local application portions of the bounded launch are complete. The Hoodie is Active in Shopify, published to Online Store and Carlophillips Headless, visible across every CP customer route, and connected to a server-only Shopify cart/checkout redirect. Vercel deployment is blocked by the owning account's billing suspension, so this report does not claim the new build is live on `www.carlophillips.com`.

## Shopify evidence

- Authenticated Shopify Admin showed the exact Hoodie as Active after the authorized change.
- Publishing persisted for Online Store and Carlophillips Headless only.
- Nine variants were observed; all nine were available through Storefront.
- Price range: USD 128–134.
- Two current Shopify product images were returned and are the only product media used by the launch UI.
- Shopify Admin showed Apliiq Dropship Fulfillment as the fulfillment location for the inspected variant. This does not replace the pending provider-side mapping audit.
- Sanitized observation: `storefront-observation.json`. Raw product IDs, raw variant IDs, SKUs, credentials, and checkout URLs are excluded.

## Checkout evidence

- A live server-only `cartCreate` was made for one currently available Hoodie variant.
- CP returned HTTP 303 to the trusted `carlophillips.myshopify.com` checkout host.
- No customer details, payment, order, sample, fulfillment request, publication beyond the authorized Hoodie/channel change, or paid app action occurred.
- The browser receives only a SHA-256 opaque reference. A fresh Storefront read revalidates the entire approved identity/facts envelope and resolves the raw variant reference only inside the server boundary.

## Application and visual evidence

- `/`, `/shop`, `/collections`, and `/products/carlophillips-signature-hoodie` returned HTTP 200.
- Shop and collections show one live Shopify product; the PDP shows `Buy with Shopify` and no contradictory disabled/unavailable release copy.
- Desktop: `pdp-desktop-1440x1000.png`.
- Mobile purchase section: `pdp-mobile-purchase-390x844.png`.
- Mobile top/gallery: `pdp-mobile-390x844.png`.
- Direct browser checks found zero console errors. The viewport override was reset after capture.

## Automated verification

- `yarn lint`: passed with zero warnings.
- `yarn test`: 33 files, 316 tests passed.
- `yarn audit --groups dependencies --level moderate`: zero vulnerabilities across 193 production packages.
- `yarn build`: passed; 12 App Router routes including `/api/checkout`.
- `yarn verify`: passed end to end.

## Vercel blocker and exact resume point

The Vercel CLI authenticated as the expected owner and found the linked `carlophillips-site` project. All twelve attempts to add the six required Preview/Production variables were rejected with the same account-suspension response requiring a valid payment method. No value was changed and no deployment was created.

Owner action: resolve the Vercel billing/payment-method screen and say `Vercel reactivated`. Resume by adding the prepared environment variables, deploying this committed temporary branch to Preview, verifying the same routes and no-order checkout, then deploying Production under the Product Owner's existing single-Hoodie authorization.

A direct public check returned HTTP 200 from `https://www.carlophillips.com/`, but the response still contains the previous release-gated storefront and no Hoodie purchase action. This confirms the domain itself resolves while the new candidate remains undeployed.

## Known limitations

- The production domain still serves the prior deployment until Vercel is reactivated.
- Provider-side Apliiq design/mapping details are not authenticated, though Shopify-side fulfillment association is observed.
- No paid checkout/order, POD handoff, tracking, returns, or support lifecycle has been exercised.
- No truthful 3D, spin, video, on-model, or additional detail media exists yet; none is simulated or claimed.

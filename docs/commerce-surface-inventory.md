# Commerce Surface Inventory

Updated: 2026-07-23. This is a runtime ownership record, not evidence that
Shopify cart, checkout, payment, or order operations are available.

## Active read surfaces

| Surface | Owner | Authority |
|---|---|---|
| Home | `app/page.js` → server catalog decision → minimized summary | Counts and an optional review link only |
| Shop/collections | `components/commerce/catalog-boundary.jsx` → server catalog decision | Individually release-filtered product observations |
| Product detail | `app/products/[handle]/page.js` → Commerce Gateway → release/media evidence | Source-labeled product review; never cart authority |
| Shopify product transport | `lib/providers/shopify/storefront-product-adapter.js` | Server-only, one product-by-handle read |
| Product observation | `lib/commerce/product-observation.js` plus `observation-visibility-policy.js` | Sanitized canonical candidate, non-applying review, runtime identity/facts freshness, and whitelist-derived customer copy |
| Storefront media | `lib/commerce/media-visibility-policy.js` plus Media Registry | Per-asset hashed identity/type/URL binding; partial approved Preview, complete required production coverage |
| Bag/cart presentation | `app/bag/page.js` and `/cart` alias | Activation decision only; no cart is fetched or created |
| API health | `app/api/[[...path]]/route.js` | Generic service state; no catalog payload or credential diagnostics |

## Removed bypasses

The following dormant paths were removed from the runtime in Cycle 13 because
they could bypass the active Product Release Record and Commerce Gateway:

- `lib/data/products.js`: returned Shopify or fixture products without
  per-product release decisions.
- `lib/store/cart.js`: created/updated browser carts directly from client
  product objects and public environment configuration.
- `lib/shopify/client.js`, `lib/shopify/index.js`, and
  `lib/shopify/mutations.js`: exposed a broad Storefront client and cart
  mutations outside an approved activation boundary.
- Public `/api/shopify/media-audit` and `/api/shopify/premium-readiness`:
  returned catalog observations without release filtering.

Pure normalization remains in `lib/shopify/normalize.js`. It contains no
transport, credential, cart, checkout, or mutation behavior.

The observation owns Shopify-derived title, plain description, vendor, product
type, tagline, ordered details, price, availability, and option facts. The
release product is rebuilt from those values. Transport-only `descriptionHtml`,
raw product/variant IDs, arbitrary story text, and edited outer copy are not
passed to the view model.

The view model owns release-status language. Local is observation/fixture
review, Preview is private release review, and a production Released decision
states that product facts are released while cart and checkout remain
separately disabled. It uses a neutral unavailable story rather than inventing
marketing copy or trusting an outer payload story.

## Customer cart activation contract

`cp.cart-activation-decision.v1` is evaluated on the server. Every prerequisite
must be satisfied before a UI can be declared cart-eligible:

1. The product came from a visible Shopify Commerce Gateway decision.
2. The matching Product Release Record is `released`.
3. Its current Shopify variant-identity and commerce-facts fingerprints exactly
   match the reviewed values bound to the release record. The full historical
   observation fingerprint remains approval/audit evidence and is not compared
   to a newly timestamped runtime read.
4. At least one observed Shopify variant is available and mapped.
5. `shopify-storefront-cart` has evidence-backed `cart-write` capability,
   including an authorized no-order test.
6. Durable Product Owner approval is explicitly scoped to
   `activate-customer-cart`.
7. The server-only `SHOPIFY_CART_UI_ENABLED` gate is enabled in the approved
   environment.

Credentials or an installed app satisfy none of these gates by themselves.
Local fixtures can never become cart-eligible. Checkout remains false even
after cart eligibility; redirect, payment, and order proof require a separate
contract and explicit authorization.

## Current decision

The Hoodie remains Draft, has no observed variant fingerprint, Shopify cart
capability is unverified, no activation approval exists, and the server gate
defaults off. Therefore product and bag surfaces remain non-commerce. No
Shopify write was issued during this inventory.

The Hoodie Media Registry has no current Shopify storefront bindings. Its front
candidate remains pending and the two unverified detail assets remain
quarantined. They cannot enter a Shopify-backed PDP until exact-product,
rights, quality, approval, and current hashed media bindings exist.

# Shopify cart permalink observation

- Observed: `2026-08-30T09:56:13.156Z`
- Product: `carlophillips-signature-hoodie`
- Reviewed selection: Black / Medium, quantity 1, USD $128.00

Shopify accepted the current reviewed Medium variant and returned HTTP 302 to an
HTTPS checkout on `shop.app`. The check used the release-bound opaque variant
reference hash and did not store or disclose the raw Shopify variant ID.

No customer details, address, payment data, or order were submitted. The request
created only an ephemeral cart and stopped before checkout interaction. This is a
fresh transport observation for the exact item and redirect host. It does not, by
itself, reclassify the repository's end-to-end same-origin cart capability or
authorize a payment, order, fulfillment event, or release transition.

Machine-readable evidence: `cart-permalink-observation.json`.

After the Product Owner's explicit post-risk Production GO, the matching
same-origin request was sent to
`https://www.carlophillips.com/api/checkout`. It returned HTTP 409
`PRODUCT_RELEASE_NOT_RELEASED` before mutation. This proves the public endpoint
accepted the same-origin request envelope but is currently stopped by the
repository release-state decision. It does not turn the independent permalink
observation into release-bound end-to-end proof.

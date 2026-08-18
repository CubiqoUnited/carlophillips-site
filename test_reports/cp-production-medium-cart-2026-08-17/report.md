# Production Medium cart observation

Date: 2026-08-17

## Outcome

The current CARLOPHILLIPS Production storefront created a Shopify cart for the public-offer variant **Black / Medium** and redirected to the exact hosted Shopify checkout. The checkout summary showed one `CARLOPHILLIPS Signature Hoodie`, `black / m`, at USD `$128.00`. Shipping remained uncalculated because no delivery address was entered.

This is current technical evidence for the narrow cart path. It does not reclassify the capability registry, prove or authorize release, enable live payment, submit an order, prove fulfillment, or activate the candidate checkout gates.

## Payment boundary

The authenticated Shopify Payments settings page was inspected read-only in the same verification session. Shopify displayed `Accepting test payments only` and `You can place test orders, but no real transactions will be processed`. A payout account is configured, but test mode remains enabled.

No customer contact, address, card, Shop Pay, PayPal, Google Pay, payment, or order was submitted. The only external mutation was the reversible Shopify cart creation.

## QA and visual evidence

- Production PDP HTTP/render: passed.
- Exact Medium selection: passed.
- Exact hosted checkout host: passed (`carlophillips.myshopify.com`).
- Checkout summary binding: passed for title, Black / Medium, quantity one, and USD `$128.00`.
- Payment-mode audit: passed; Shopify Payments remains test-only.
- Browser screenshot capture: blocked by the in-app browser CDP capture timeout on Shopify Checkout after two attempts (PNG and reduced-quality JPEG). Targeted element capture is unsupported by this browser version. The rendered DOM assertions and checkout text were captured in the active Codex task; no screenshot is claimed.

Resume visual validation by capturing the same no-customer-data order summary in a browser surface whose screenshot API supports Shopify Checkout. Do not enter personal or payment data merely to obtain a screenshot.

Machine-readable receipt: `verification.json`.

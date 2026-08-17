# Production Shopify Payments activation — 2026-08-17

## Outcome

Shopify Payments test mode was turned off with explicit Product Owner authorization. Shopify subsequently reported **Accepting payments** and **Receiving payouts**. The configured payout destination is the existing Shopify Balance USD account ending `4549`; no separate Stripe account was connected or required.

## No-order Production verification

1. Opened `https://www.carlophillips.com/products/carlophillips-signature-hoodie` in a background browser session.
2. Selected Black / Medium at USD $128.
3. Used the Production **Continue to checkout — $128** control.
4. Verified redirect to the exact HTTPS `carlophillips.myshopify.com` checkout host.
5. Verified one CARLOPHILLIPS Signature Hoodie, `black / m`, quantity one, USD $128 subtotal and pre-shipping total.
6. Verified live card fields, Shop Pay, PayPal, and Shopify's secure checkout UI at desktop and mobile widths.

No contact, address, card, or other customer data was entered. The final **Pay now** control was not used. No real payment, order, fulfillment request, catalog mutation, merge, or deployment occurred.

## Evidence

- `shopify-payments-payout-account.jpg`
- `shopify-test-mode-before.jpg`
- `shopify-test-mode-off.jpg`
- `production-checkout-desktop.jpg`
- `production-checkout-mobile.jpg`

## Remaining engineering risk

Live payment acceptance is operational on the historical Production deployment. The newer release-bound source candidate is still on PR #14 and has not been merged or deployed. Its source verification passes, but its Vercel status is blocked by the linked deployment account; canonical `main` and environment-review protections also remain incomplete. This does not prevent Shopify from accepting payments today, but it must be resolved before claiming that Production is running the newer release-governed implementation.

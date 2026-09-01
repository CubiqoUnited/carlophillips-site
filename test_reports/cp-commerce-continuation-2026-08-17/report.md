# CARLOPHILLIPS commerce continuation verification

Date: 2026-08-17

## Story

The CARLOPHILLIPS Headless storefront must create a Shopify checkout, accept payment, route the exact approved variant to Apliiq, and produce fulfillment/tracking evidence before real Production payment is enabled.

## Verified working

- The Shopify product is Active.
- Black sizes S, M, and L exist among nine observed variants.
- A Headless checkout already created Shopify test order `#1002`.
- Shopify labels the order Test order, Paid, and Unfulfilled.
- The test payment total was USD $136.20: USD $128.00 merchandise and USD $8.20 shipping.
- Shopify generated the order-confirmation email.
- Shopify assigns fulfillment to Apliiq Dropship Fulfillment and exposes a fulfillment-request review screen.
- Shopify Payments is still explicitly in test mode, so real customer payments and payouts are not active.

## First broken boundary

The existing test order is Black / XS and uses Shopify's fake test destination. Sending it to Apliiq could cause real production of an invalid sample, so no fulfillment request was submitted.

The Apliiq browser session is signed out. A genuine Medium sample quote requires the Product Owner to sign in privately and enter the actual delivery destination before shipping and tax can be calculated. The exact total then requires separate purchase approval.

## Evidence and safety

The sanitized machine-readable receipt is `verification.json`. It excludes customer data, addresses, account identifiers, raw provider references, credentials, and payment details. No catalog, payment-mode, order, fulfillment, Shopify, Apliiq, Vercel, GitHub, or Production mutation occurred.

Existing immutable Preview desktop/mobile screenshots and CI evidence remain authoritative for the fail-closed storefront UI. This continuation stopped at the first broken external boundary as required; it did not misrepresent a fake test order as physical fulfillment proof.

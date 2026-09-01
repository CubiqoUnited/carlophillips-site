# Shopify test checkout → payment → order → Apliiq ingestion

Date: 2026-08-17
Result: **PASS for the approved test-mode transaction; NOT evidence of live customer payment or Production activation.**

## Verified end-to-end path

1. The Product Owner approved one Shopify test order for the Signature Hoodie.
2. Shopify checkout accepted the Hoodie `black / xs`, SKU `APQ-5958463S5A1`, quantity 1.
3. Shopify Payments processed a **test-mode** Visa transaction ending `4242` for **USD $136.20**: $128.00 merchandise plus $8.20 Standard shipping.
4. Shopify created order **#1002** through `Carlophillips Headless`, confirmation `FMDNGLXPQ`.
5. Shopify Admin showed **Paid**, **Unfulfilled**, and the explicit banner `Your payment gateway is in test mode.`
6. Apliiq received store order **1002** in **Pending orders**, not its production order list. Automatic processing remained off.
7. The expanded Apliiq row matched the same SKU, quantity, synthetic test customer, and showed an observed fulfillment cost of $50.45.
8. The exact Apliiq controls `entityCTA1002` → `li2_1002` (`remove from list`) removed the pending fulfillment. The rendered page then stated `you don't have any unprocessed orders`.

No Apliiq fulfillment-card charge, manufacturing, shipment, Shopify catalog mutation, Production deployment, or real customer charge occurred.

## Evidence

- `shopify-checkout-confirmation-1002.jpg` — Shopify thank-you page and total.
- `shopify-order-1002-test-paid-unfulfilled.jpg` — Admin order detail with test-mode banner, Paid/Unfulfilled status, Hoodie variant and SKU.
- `apliiq-pending-order-1002-before-removal.jpg` — Apliiq manual Pending orders queue before cleanup.
- `verification.json` — sanitized exact facts and before/after state.

The Apliiq page repeatedly timed out during the final CDP screenshot capture. This is recorded rather than hidden. The post-removal state was still verified from the rendered page text after the exact removal action. The successful before screenshot and the machine-readable before/after facts are retained.

## What this proves

- Shopify Headless checkout can reach hosted Shopify checkout.
- Shopify Payments test mode can authorize the checkout and create a Paid Shopify order.
- The product/variant/SKU mapping reaches Apliiq.
- With Apliiq automatic processing off, an order lands in the manual queue and can be removed before production.

## What remains deliberately unproven

- Live-mode customer charges, settlement and payout.
- Production storefront checkout activation.
- Production shipping/tax coverage for real destinations.
- Apliiq paid fulfillment, manufacturing, tracking, delivery, support, returns and refunds.
- Product Release Record promotion from Draft through Released.

Those remain separate approval and release gates. This test must not be described as live commerce readiness.

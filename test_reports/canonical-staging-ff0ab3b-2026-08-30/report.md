# Canonical staging post-merge verification

- Captured: `2026-08-30T10:27:50.362Z`
- Git commit: `ff0ab3b8bd8bd50339fb4437207754d93d1f0cd0`
- Deployment: `dpl_81EeMeruugZwzRF47zrfEPECp8fc`
- Canonical domain: `https://staging.carlophillips.com`
- Vercel state: `READY`
- Vercel alias error: none

## Result

Desktop and mobile home, product, and checkout-rehearsal routes returned HTTP 200 with no console errors, page errors, request failures, framework overlay, or horizontal overflow.

The approved presentation exposed two video controls and `VIEW GALLERY 12 IMAGES`. The product page exposed the twelve Shopify media controls, sizes S/M/L, the `$128` offer, and `REVIEW CHECKOUT $128`.

An exact same-origin POST to `/api/checkout` with an approved Medium reference returned HTTP 303 to `/checkout/confirm?mode=preview`; it did not invoke Shopify checkout writes. The same request from `https://attacker.invalid` returned HTTP 403 with `ORIGIN_REJECTED`.

This is private staging evidence. It is not Production publication, payment, order, or fulfillment evidence.

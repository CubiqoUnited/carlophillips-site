# Apliiq Medium sample quote attempt

Date: 2026-08-17

## Outcome

The Product Owner completed private Apliiq sign-in. The authenticated saved design and the intended one-Medium sample configuration are valid, but Apliiq's Add to cart request failed at the provider boundary. No cart, order, fulfillment request, address submission, or charge was created.

## Verified configuration

- Saved design: `5958463`
- Garment: Independent Trading Co IND4000
- Color: Black
- Decoration: front embroidery, 2×2 inches, estimated 648 stitches
- Size: Medium
- Quantity: one
- Medium stock: above 5,700 during the session
- Release mapping: matches the previously bound S/M/L mapping

## Partial quote

- Estimated unit price: USD $39.45
- Possible one-time first-order digitization fee: USD $11.00
- Shipping: not calculated
- Tax: not calculated
- Final payable total: not calculated

Apliiq warns that embroidery pricing is estimated and may change after digitization.

## Broken boundary

Two controlled cart attempts were made. The first used the normal narrow viewport. The second used a clean authenticated reload at 1280×900 to eliminate the legacy responsive layout and chat-overlay interference. Both attempts produced the same Apliiq browser error: its JavaScript received an HTML document where JSON was expected (`Unexpected token '<'`). The cart remained empty.

This is provider-side behavior, not a CARLOPHILLIPS storefront or Shopify checkout failure. The next safe action is either a manual one-Medium cart attempt by the Product Owner or an approved non-sensitive Apliiq support message. No Production or payment activation may treat this partial quote as fulfilled sample evidence.

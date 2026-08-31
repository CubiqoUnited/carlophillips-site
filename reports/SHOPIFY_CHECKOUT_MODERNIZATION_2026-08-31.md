# Shopify checkout modernization proposal — 2026-08-31

## Root cause

The CARLOPHILLIPS Next.js design system ends when the customer is redirected to
Shopify. The hosted checkout is rendered and configured by Shopify, so CSS,
components, and tokens in this repository cannot restyle it. The live screenshot
shows a healthy one-page checkout with express wallets and a correct $128
product summary, but its active Shopify checkout configuration is close to the
default: a text wordmark, white/gray palette, stock typography, rounded fields,
and a blue primary action. Earlier QA proved reachability and payment-surface
availability; it did not prove the Product Requirements visual treatment.

## Recommended Shopify Admin draft

Create a duplicate checkout configuration and make all changes in the draft:

- Keep Shopify's one-page checkout.
- Upload the approved transparent CARLOPHILLIPS wordmark, aligned left.
- Header: black or near-black with a high-contrast light logo.
- Main and order summary: warm off-white/light neutral for legibility.
- Primary button: near-black; accents/links: near-black or approved brand accent.
- Typography: the closest Shopify-provided neutral grotesk/system option.
- Inputs: white or transparent with high contrast and minimal visual radius.
- Preserve Shop Pay, PayPal, Google Pay, Venmo, and any other eligible dynamic
  accelerated wallet.
- Preview desktop and mobile before publication.

Shopify documents that the standard checkout editor supports logo, header/main
and order-summary colors, input appearance, fonts, button/accent colors, and
one-page/three-page layout. Advanced Checkout Branding API and some checkout
blocks require Shopify Plus. Do not upgrade solely for this remediation.

## Necessary fields

Use Shopify Admin → Settings → Checkout → Form options:

- Contact method: Email.
- First and last name: required.
- Company: omitted.
- Address line 2: optional, so apartment/suite customers are not blocked.
- Shipping phone: omitted unless the carrier requires it.
- Country, address, city, region/state, and postal code: retain because they are
  needed to quote and deliver a physical shipment.
- Guest checkout: retain.

Shopify controls which location-specific address fields appear. The platform
does not provide a standard option to replace first/last name with one custom
full-name field, and hiding shipping-address essentials is not appropriate for a
physical product.

## Policies and trust

The captured checkout footer showed Privacy policy only. Save approved Return,
Shipping, Terms, and Privacy policies in Shopify Admin so Shopify can display the
corresponding checkout links. Policy text requires business-owner approval.

## Staging parity

Use a dedicated Shopify development/staging store for Vercel Preview. Clone the
S/M/L product and shipping configuration, password-protect it, and use Shopify's
test payment method. Never enable test mode on the live Production store because
test mode prevents customers from using live cards. Preview code now reads only
the SHOPIFY_STAGING_* variables and creates a real Shopify test cart.

## Official references

- https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations/checkout-style
- https://help.shopify.com/en/manual/checkout-settings/checkout-form-options
- https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations/active-and-draft-checkouts
- https://help.shopify.com/en/manual/checkout-settings/refund-privacy-tos
- https://help.shopify.com/en/manual/checkout-settings/test-orders/payments-test-mode
- https://shopify.dev/docs/apps/build/stores/development-stores

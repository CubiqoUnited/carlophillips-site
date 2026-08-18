# CARLOPHILLIPS product motion and purchase experience QA

Date: 2026-08-17

## Scope verified

- The post-campaign Signature Hoodie screen keeps the supplied editorial composition and uses the canonical token/component system.
- Main media motion starts only when the section is at least 60% visible, pauses outside the viewport, while the page is hidden, and while gallery/order/bag layers are open, remembers an explicit user pause for the browser session, and begins paused for reduced-motion users.
- The main renderer accepts approved Shopify video media when it exists; until then the current reviewed still sequence remains the visible fallback. It is not represented as genuine filmed garment footage.
- `VIEW GALLERY — 12` opens a manual gallery. Optional `PLAY AUTO` advances every five seconds, exposes progress, pauses on hover/focus/manual navigation/page hiding, and remains off on initial open.
- `ORDER — $128` uses the reviewed Shopify price and the exact S/M/L offer. The right tray includes size selection, Size & Fit, Add to Bag, Buy Now, and posts only the opaque reviewed reference plus quantity to `/api/checkout`.
- Add to Bag opens a confirmation drawer with quantity/subtotal and the same secure checkout endpoint. No checkout submission or order occurred during QA.

## Automated browser result

- Headless Chromium: desktop 1440×1000, tablet 1024×768, mobile 390×844.
- All three widths: exact price CTA, 12-view gallery, motion control, S/M/L selector, enabled order actions, size/fit drawer, bag confirmation, and $128 subtotal present.
- Gallery autoplay advanced after five seconds at all three widths. Hover suspension was separately observed before the non-hover timing run.
- Zero horizontal overflow, console errors, or failed network requests.
- Machine evidence: `verification.json`.
- Visual evidence: fifteen PNGs under `screenshots/` covering runway, gallery, order, size/fit, and bag at all three widths.

## Visual comparison to the supplied references

- Desktop preserves the supplied composition: editorial copy and compact fact tags on the left, full-length model centered, and a restrained two-row Order/Gallery control at upper right.
- The gallery retains the full-screen black editorial frame, centered media, header counter, optional autoplay, arrows, Order entry and close control.
- The order and fit surfaces use the requested narrow right-hand tray on larger screens and a full-width drawer on mobile; the underlying model/gallery remains visually present.
- Mobile keeps the model prominent and adds the requested sticky Select Size / Order Now bar. The bag confirmation uses the supplied image/item/quantity/subtotal/checkout hierarchy.

## Complete source gate

- Design-system lint and zero-warning ESLint passed.
- 53/53 test files and 549/549 assertions passed.
- Production dependency audit passed with zero vulnerabilities across 67 packages.
- Optimized Next.js 15.5.21 build passed. The temporary local QA route used to supply reviewed commerce props was removed before this final build.

## Truth boundary and remaining media input

The interaction system is ready to consume the two requested approved video feeds (professional runway walk; minimal movement/gesture/styling) from product media. Those two genuine files do not exist in the current approved Media Registry or Shopify product media. The current Moda images and still-derived study remain Preview/reference material only. No paid generation, product-media invention, Shopify mutation, checkout submission, Vercel deployment, merge, or Production change was made in this task.

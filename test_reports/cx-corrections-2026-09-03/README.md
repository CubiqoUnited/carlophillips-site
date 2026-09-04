# CX correction visual QA

Date: 2026-09-03  
Target: local production build and local Next.js runtime  
Browser: headless Chromium

## Results

- `yarn lint`: pass
- `yarn test`: pass — 691/691
- `yarn build`: pass
- 28 route/viewport checks: HTTP pass
- Horizontal overflow: none at 320, 390, 768, and 1440 CSS pixels
- `/collections`: redirects to the canonical `/shop` route
- Screenshots: home, shop, product, bag, and aftercare at all four widths

The home Mux stream reports an incompatible-codec console message in the
headless Chromium runtime. The approved poster and controls render; this is
recorded in `browser-results.json` and must be rechecked in canonical Staging.
No customer data, checkout payment, order, or fulfillment action was used.

## Visual samples

| 320 px home | 320 px bag | 320 px shop |
| --- | --- | --- |
| ![Home](screenshots/320-home.png) | ![Bag](screenshots/320-bag.png) | ![Shop](screenshots/320-shop.png) |


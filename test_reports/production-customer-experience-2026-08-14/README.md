# Production customer-experience QA

Date: 2026-08-14

Task: `/root/malti_full_experience`
Mode: local production build, headless/background Chromium, no focus impact

## Result

- 14/14 route and viewport combinations returned HTTP 200.
- Zero axe WCAG 2.1 A/AA violations after remediation.
- Zero browser console errors in the accepted result set.
- Zero horizontal-overflow findings.
- Zero analytics-provider network requests before consent.
- Every route exposed both equal-choice consent actions.
- Canonicals matched each route; bag was `noindex, follow`; the canonical unreleased PDP was `noindex, nofollow`; review-pending policy routes were `noindex, follow`.

Routes: home, collection, canonical Signature Hoodie PDP, bag, privacy, terms and cookie policy. Viewports: 1440×1000 and 390×844.

## Visual comparison

The first automated pass exposed existing low-contrast labels/footer text, a keyboard-inaccessible mobile horizontal region, and mobile policy-heading overflow. Those were remediated through the design-token authority, a keyboard focus target, and a responsive tokenized heading size. The final screenshots replace the failed captures and show:

- readable labels/footer contrast;
- no mobile horizontal clipping;
- a stacked consent notice with equal accept/reject prominence;
- policy review status visible before policy copy;
- commerce routes still visibly fail-closed.

Machine-readable evidence is in `accessibility-verification.json`; final full-page captures are in `screenshots/`.

## Commands

```text
yarn lint
yarn test
yarn audit:prod
yarn build
yarn start
CP_A11Y_BASE_URL=http://127.0.0.1:3000 yarn test:a11y
git diff --check
```

Unit/integration result: 37 files / 353 tests. Production dependency audit: 0 vulnerabilities across 55 packages. Build: successful, 16 route entries including three policy routes.

The final analytics sanity patch validates IDs against a strict GA4 measurement-ID pattern, initializes only from the provider script's `onLoad`, makes readiness an event-effect dependency, disables the provider's automatic page view, and proves with network-free tests that no event emits before readiness and only sanitized passive events emit afterward.

## Remaining external evidence

This is local candidate evidence, not production readiness. Final policy wording still requires the accountable business/legal content owner. Screen-reader walkthrough, approved private Vercel Preview comparison, live account/consent requirements and any enabled analytics provider remain external production gates.

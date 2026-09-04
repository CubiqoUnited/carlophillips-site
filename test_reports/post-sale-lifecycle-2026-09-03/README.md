# Post-sale lifecycle QA — 2026-09-03

## Scope

This evidence covers the PR #67 follow-up that makes post-purchase destinations
environment-specific, prevents review/credit activation without authenticated
Shopify customer facts, makes support delivery operational only when Resend is
configured, and keeps unavailable states truthful.

## Automated result

- Command: `CP_A11Y_OUTPUT_DIR=test_reports/post-sale-lifecycle-2026-09-03 yarn playwright test tests/e2e/member.spec.ts tests/e2e/privacy-network.spec.ts tests/e2e/accessibility.spec.ts`
- Result: 12 passed, 0 skipped, 0 unexpected, 0 flaky.
- Coverage: desktop and mobile Aftercare, `/contact`, homepage and Signature
  Hoodie accessibility; browser console/request health; same-origin support
  intake; no support PII outside `/api/contact`; no horizontal overflow.
- Machine result: `results.json`.
- Sanitized network-origin inventories are under `artifacts/privacy-network-*`.

## Visual comparison

The left side of each comparison is PR #67's prior protected Staging capture;
the right side is the current local candidate.

- `desktop-before-after.png`: 1440 px viewport. Header, hero, lifecycle and fit
  composition are preserved. The unauthenticated CP Credit card is removed and
  Continue Shopping spans the row with no empty grid cell.
- `mobile-before-after.png`: 390 px viewport. Content order, legibility and
  navigation are preserved. Removing the CP Credit card reduces the full-page
  height from 5295 px to 5033 px without clipping or overflow.
- Current captures are `artifacts/member-*/aftercare-desktop.png` and
  `artifacts/member-*/aftercare-mobile.png`.

The comparison was inspected offscreen. No browser window was foregrounded.
The expected visual delta is limited to removal of the unverified credit card,
the authenticated-delivery review copy, and the resulting grid reflow.

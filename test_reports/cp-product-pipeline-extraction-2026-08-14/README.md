# Product-pipeline selective extraction QA

Date: 2026-08-14

Scope: pure `@repo/product-pipeline` contracts, storefront consumer rewiring,
and the Admin/control-plane placement ADR. Commit `1f3fc46` was used only as
the untouched visual baseline; this report does not approve a wholesale merge
or any Preview/Production action.

## Automated verification

- `yarn verify`: passed.
- ESLint, strict TypeScript, Stylelint, Prettier: passed.
- Vitest: 42 files and 375 tests passed.
- Storybook static build: passed.
- Production Next.js build: passed, 14 routes generated.
- Production dependency audit: 0 known vulnerabilities across 67 packages.
- Product-pipeline package purity and sanitized-boundary tests: passed.
- Adversarial Draft/DRAFT readiness, incomplete-media, missing-provider,
  commerce-binding, raw-field leakage, and schema-drift tests: passed.
- Canonical Hoodie evidence remains Draft and unchanged.

## Responsive browser comparison

Headless Chromium compared an untouched detached `1f3fc46` worktree with the
candidate worktree. Continuous campaign animations were paused at the same
timeline position before capture. Every paired PNG is byte-for-byte identical:

| Route | Viewport | Result |
| --- | --- | --- |
| Home | 390×844 | exact |
| Home | 584×486 | exact |
| Home | 768×1024 | exact |
| Home | 1440×1000 | exact |
| Product | 390×844 | exact |
| Product | 1440×1000 | exact |

Both worktrees returned meaningful content with HTTP 200, no horizontal
overflow, no framework overlay, no broken images, no console/page/network
errors, and no checkout-enabled claim. The checkout endpoint returned HTTP 409
with `PRODUCT_RELEASE_NOT_RELEASED` in both environments.

Machine-readable results and screenshots are retained under
`baseline-1f3fc46/` and `candidate/`.

## Boundary not claimed by this report

The existing canonical Admin branch was not changed or deployed here. Its
selective consumption of these typed contracts, plus full Admin responsive QA
for order/payment, fulfilment, post-sale, empty, blocked, stale, conflict, and
denied states, remains a deliberate follow-on integration gate.

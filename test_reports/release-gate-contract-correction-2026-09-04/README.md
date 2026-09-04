# Release gate contract correction QA

Date: 2026-09-04 EDT

Branch: `codex/cx-corrections-2026-09-03`

Pull request: #76 targeting `staging`

## Corrected invariants

- The signed protected receipt is bound to the approved Staging SHA.
- Production accepts a separately produced `main` SHA only through a merged
  same-repository `staging`-to-`main` PR whose recorded head is the approved
  Staging SHA, whose merge commit is the requested Production SHA, with Git
  ancestry and exact tree identity.
- Staging proof stops at a trusted hosted-checkout handoff. It retains no
  private checkout URL, enters no payment, submits no order, queries no order
  data, and performs no fulfillment action.
- The checkout-handoff evidence hash is derived automatically from the exact
  sanitized 1440 px and 390 px browser-proof JSON artifacts.

## Verification

- `yarn format:check`: passed.
- `yarn lint`: passed, including design-system and Production-commerce policy.
- `yarn typecheck`: passed.
- `yarn stylelint`: passed.
- `yarn test`: 81 files, 699 tests passed.
- `yarn build`: passed; 13 static pages generated and dynamic routes compiled.
- `yarn test:e2e`: 28/28 passed across desktop and mobile projects.
- Screenshot comparisons passed for homepage, product detail and bag at both
  desktop and mobile widths. Accessibility, console, network and privacy checks
  also passed.
- `git diff --check`: passed.

The build emitted only the existing non-blocking Browserslist age and Edge
Runtime/static-generation warnings. No Production deployment, payment, order,
private checkout navigation or external commerce mutation occurred during QA.

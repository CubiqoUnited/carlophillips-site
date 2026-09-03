# CARLOPHILLIPS — Master Test Case Execution Evidence

**Date:** 2026-09-03  
**Application candidate:** `6104bdca5e155ae03e7971d04fd35496e8e4b76c`  
**Pull request:** [#67](https://github.com/CubiqoUnited/carlophillips-site/pull/67)  
**Baseline:** `origin/main@eb0e519860222eea700f0968a6e34461991af832`  
**Production:** unchanged and pinned to `dpl_GTkysazmXPKnwK7rHGTYhaWVJYLZ`

## Outcome

The approved application work is implemented on `codex/post-sale-funnel`, all available automated gates pass, and the exact application candidate is live on protected Staging. PR #67 remains open for Product Owner review. No Production deployment, order, payment, fulfilment, customer contact, cancellation, refund, or provider action occurred.

## Pull-request traceability

| PR | State | Head / merge | Current-code result |
|---|---|---|---|
| #54 | Merged | `1ea2099` / `6bb273f` | Shopify-authoritative product/cart/checkout boundary, Storefront API v2026-07, eight-topic zero-PII webhook ingress, durable idempotency, and storefront UI are present in `origin/main` and inherited by #67. |
| #55 | Merged | `09146d3` / `9f991c8` | Strict Staging isolation, runtime preflight, protected commerce checks, durable webhook verification, and Linux/macOS visual baselines are present and inherited by #67. |
| #56 | Merged | `6ca1a14` / `4ad89dc` | Protected `.github/workflows/vercel-staging.yml` is present and executed successfully for #67. |
| #66 | Merged | `eb5a3c4` / `eb0e519` | Evidence-only closure correction is present in `origin/main`. It is not an application implementation. |
| #67 | Open, mergeable | `6104bdc` | Adds the missing truthful customer-facing post-sale/Aftercare journey while keeping Shopify authoritative. |

`origin/staging@ff011904e01b6e803239769cdbb302f89c508ec4` includes the implementation lineage from #54, #55 and #56 but predates the evidence-only #66 and the new #67 candidate. The protected Staging domain is deployed from the exact #67 application commit rather than by merging into this branch.

## Implemented post-sale experience

- `/aftercare` is the customer-facing service hub; `/member` remains a compatible route.
- Shopify remains authoritative for confirmation, payment, fulfilment, carrier tracking, delivery, cancellation, return and refund facts.
- The page explains the complete lifecycle: Confirmed → In production → Dispatched → Delivered → Return or refund.
- The authenticated order-status link is shown only when a safe configured Shopify URL exists; otherwise the UI fails closed and directs the customer to the Shopify confirmation email.
- CP support and Continue Shopping always remain available.
- Returns/exchanges and reviews activate only from safe configured Shopify-backed URLs.
- Review eligibility is delivery-dependent; no unverified review CTA is invented.
- Fit memory stores only size and fit locally on the customer device. It stores no identity, order, payment or address data.
- CP Credit remains hidden until Shopify supplies an authenticated balance; no fake balance is displayed.
- Fake member signup, fake order history and invented €15 credit were removed.

## Files changed by #67

- `.env.example`
- `apps/web/src/app/aftercare/page.tsx`
- `apps/web/src/app/member/page.tsx`
- `apps/web/src/components/layout/StorefrontHeader/index.tsx`
- `apps/web/src/components/member/FitMemory.tsx`
- `apps/web/src/components/member/MemberExperience.tsx`
- `apps/web/src/lib/commerce/post-purchase-policy.ts`
- `packages/design-system/styles/globals.css`
- `reports/HUMAN_INTERVENTION_STICKY_RED.md`
- `tests/e2e/member.spec.ts`
- `tests/member-experience.test.jsx`
- `tests/post-purchase-policy.test.js`

## Verification

### Repository

- `yarn verify`: pass.
- Vitest: **78 files / 657 tests**, all pass.
  - shipped: 18 files / 77 tests
  - tooling: 45 files / 497 tests
  - contracts: 15 files / 83 tests
- Verify includes source boundaries, commerce contracts, ESLint, TypeScript, Stylelint, Prettier, media readiness, Storybook build, dependency audit (**0 vulnerabilities**) and Next.js production build.
- Playwright functional/accessibility suite: **22 passed**.
- Aftercare desktop/mobile Playwright checks: **4 passed**; WCAG A/AA audit clean, no horizontal overflow, links and device-local fit memory verified.
- GitHub Verify: run `33711232613`, success.
- GitHub Checkout E2E and accessibility: run `33711232547`, success.
- Secret scan across changed tracked files: 0 suspicious findings.
- `git diff --check`: clean.

The six legacy Darwin screenshot comparisons pass unchanged on `origin/main`. They fail locally in the linked worktree because that runtime produces text raster/position drift. No baseline was updated, and the live candidate was therefore verified with fresh desktop/mobile captures below.

### Protected Staging

- Workflow run: [33711541963](https://github.com/CubiqoUnited/carlophillips-site/actions/runs/33711541963), success.
- Job: `100511922160`, success.
- Exact validated input SHA: `6104bdca5e155ae03e7971d04fd35496e8e4b76c`.
- Deployment: `dpl_Hwf6ZoR8HJ7i1Ngv8xoy5eefzWzG`, READY.
- Immutable URL: `https://carlophillips-site-11cmvmdcz-cubiqo-projects-d7156840.vercel.app`.
- Protected alias: `https://staging.carlophillips.com`.
- Receipt artifact: `9877176081`, digest `sha256:cee4d0f952a1a45f8b88ec5dbd9d8580d848dda734ab19f5c9b929384fdaba33`.
- Signed PII-free webhook probe: pass.
- Final live desktop and mobile: HTTP 200, expected lifecycle copy present, no horizontal overflow, no browser-console errors and no failed requests.

### Screenshots

Exact directory:

`/Users/edv/Documents/CARLOPHILLIPS-ARCHIVE-2026-09-03/post-sale-funnel`

- `staging-aftercare-desktop-final.png` — 1440 × 1000 viewport, full page.
- `staging-aftercare-mobile-final.png` — 390 × 844 viewport, full page.

Visual comparison: hierarchy, content, cards and controls are consistent across desktop and mobile. The mobile navigation collision discovered during the first Staging review was fixed by retaining the compact `Member` navigation label while routing it to `/aftercare`. The final mobile capture has no overlap or horizontal overflow.

## Production invariants and rollback

- `https://www.carlophillips.com`: HTTP 200.
- Production deployment: `dpl_GTkysazmXPKnwK7rHGTYhaWVJYLZ`, READY.
- Immutable Production URL: `carlophillips-site-qusq0858p-cubiqo-projects-d7156840.vercel.app`.
- No Production alias, environment, Shopify, payment, webhook, domain or deployment mutation was made.
- PR #67 rollback point before merge is `origin/main@eb0e519860222eea700f0968a6e34461991af832`; Staging can be returned to the previous verified deployment if required.

## Honest external blockers

The application does not claim these capabilities are complete. Exact activation steps and risks are maintained at the top of `reports/HUMAN_INTERVENTION_STICKY_RED.md`:

1. Shopify Customer Accounts/order-status URL must be enabled and bound.
2. Shopify-native self-service returns must be configured and tested.
3. A Shopify-integrated reviews provider and verified-delivery rule must be selected.
4. Shopify-backed CP Credit requires a Product Owner policy decision and authenticated balance source.
5. Real Production Apliiq intake, production, tracking and notification proof requires a separately approved real order; Staging correctly has no Apliiq handoff.

Until configured, each unavailable customer action fails closed truthfully and keeps CP support/Shopify authority visible.

## Repository hygiene

The intentional branches are `main`, `staging`, and `codex/post-sale-funnel` while PR #67 is open. The intentional worktrees are `/Users/edv/Documents/cp`, `/Users/edv/Documents/cp-staging`, and `/Users/edv/Documents/cp-postsale`. There is one remote, `origin`. Generated local Playwright output under the main worktree is disposable test output and is removed during final cleanup.


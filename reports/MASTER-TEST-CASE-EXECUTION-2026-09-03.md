# CARLOPHILLIPS — Master Test Case Execution Evidence

**Date:** 2026-09-03  
**Application candidate:** `3bff804b1a55691a38e9406eb1f97d21b5b21a3c`
**Pull request:** [#67](https://github.com/CubiqoUnited/carlophillips-site/pull/67)  
**Baseline:** `origin/main@eb0e519860222eea700f0968a6e34461991af832`  
**Production:** unchanged and pinned to `dpl_GTkysazmXPKnwK7rHGTYhaWVJYLZ`

## Outcome

The application work is implemented on the existing
`codex/post-sale-funnel` branch. All local automated and visual gates pass, and
protected Staging run `33733157896` validated the exact application candidate
and passed its complete repository/E2E gate, then failed safely at Vercel
credential access before build/deploy. PR #67 remains open for Product Owner
review. No Production deployment, order, payment, fulfilment, customer contact,
cancellation, refund or provider action occurred in this follow-up.

## Evidence reconciliation and requirement classification

| Acceptance requirement | Classification | Evidence / exact remaining gap |
|---|---|---|
| Product view reads the Signature Hoodie and offers exact S/M/L at USD 128 | Already proven | Inherited `main` Shopify-authoritative runtime plus 2026-09-02 protected Staging product observation. The runtime re-reads Shopify; no release record gates it. |
| Selected S/M/L reaches the bag with product, size, quantity and USD 128 | Already proven | 2026-09-02 Staging test-payment journey and retained no-order Production checkout handoff prove the bag/checkout summary. |
| Shopify hosted checkout and test payment | Already proven | Protected Staging test payment completed with zero real charge; Production no-order proof stopped before customer/payment submission. |
| CP-branded Shopify confirmation and cancellation/refund notice | Already proven | 2026-09-02 Staging order timeline, cancellation, bogus-gateway refund, restock and branded cancellation notice. |
| Customer can authenticate and view only their order/status | External proof missing | PR #67 binds a safe environment-specific account entry, but Staging Customer Accounts and a synthetic authenticated order-view proof are not configured. |
| Shopify owns order, cancellation, refund and notifications | Already proven | Existing webhook/runtime boundary plus Staging cancellation/refund evidence; Aftercare displays no local order state. |
| Eligible fulfilment, Apliiq production, dispatch, tracking and delivery | External proof missing | Not safely testable through the development store. Staging must not call Apliiq Production; a separately authorized low-risk Production order is required. |
| Shopify-native return/exchange | External proof missing | Safe dedicated Staging returns binding is implemented. Shopify return rules, public entry and a fulfilled zero-charge test return remain human/provider work. |
| CP support works when configured and never reports false success | Code/config missing → implemented; external proof missing | Resend delivery now requires key/sender/recipient and provider acceptance. A monitored Staging mailbox and synthetic receipt proof remain unconfigured. |
| Review only after verified delivery | Code/config missing → implemented; external proof missing | Public URL/flag activation was removed. CTA now requires an authenticated Shopify delivered-order fact; Customer Account API/provider access and proof remain unconfigured. |
| Fit preference only when genuinely available | Already proven | Device-local S/M/L and fit storage is functional and explicitly not an order/customer fact. |
| CP Credit only from authenticated Shopify truth | Code/config missing → implemented; currently not applicable | The unauthenticated card and enable flag were removed. No CP Credit offer exists until Product Owner approves it and authenticated `StoreCreditAccount` authority is implemented. |
| Preview uses separate Shopify store and never triggers Apliiq Production | Already proven | `SHOPIFY_STAGING_*` runtime isolation is inherited from `main`; PR #67 adds the same no-fallback rule to account/returns. No provider action occurred. |
| Production promotion | Not applicable to this candidate | Production remains on its prior verified deployment until canonical Staging review and separate approval. |

Repository reconciliation at start: `origin/main@eb0e519`,
`origin/staging@ff01190`, PR #67 head `9bcef06`. The 2026-09-02 release
closure proves the Shopify Staging checkout/payment/notification subset but not
customer accounts, native returns, monitored support, reviews, credit or the
Production Apliiq delivery chain. This follow-up extends PR #67 rather than
creating a competing route or pull request.

## Pull-request traceability

| PR | State | Head / merge | Current-code result |
|---|---|---|---|
| #54 | Merged | `1ea2099` / `6bb273f` | Shopify-authoritative product/cart/checkout boundary, Storefront API v2026-07, eight-topic zero-PII webhook ingress, durable idempotency, and storefront UI are present in `origin/main` and inherited by #67. |
| #55 | Merged | `09146d3` / `9f991c8` | Strict Staging isolation, runtime preflight, protected commerce checks, durable webhook verification, and Linux/macOS visual baselines are present and inherited by #67. |
| #56 | Merged | `6ca1a14` / `4ad89dc` | Protected `.github/workflows/vercel-staging.yml` is present and executed successfully for #67. |
| #66 | Merged | `eb5a3c4` / `eb0e519` | Evidence-only closure correction is present in `origin/main`. It is not an application implementation. |
| #67 | Open | `3bff804` | Preserves the truthful Aftercare journey, adds operational configured support, environment-isolated account/returns bindings, authenticated delivery gating for reviews and authenticated credit gating. |

`origin/staging@ff011904e01b6e803239769cdbb302f89c508ec4` includes the implementation lineage from #54, #55 and #56 but predates the evidence-only #66 and the new #67 candidate. The protected Staging domain is deployed from the exact #67 application commit rather than by merging into this branch.

## Implemented post-sale experience

- `/aftercare` is the customer-facing service hub; `/member` remains a compatible route.
- Shopify remains authoritative for confirmation, payment, fulfilment, carrier tracking, delivery, cancellation, return and refund facts.
- The page explains the complete lifecycle: Confirmed → In production → Dispatched → Delivered → Return or refund.
- The account/order-status link is shown only from the current environment's
  safe server configuration; Preview never reads the Production destination.
- CP support and Continue Shopping always remain reachable. Support reports sent
  only after the configured Resend provider accepts delivery.
- Returns/exchanges activate only from the current environment's safe
  Shopify-owned entry URL.
- Review eligibility requires authenticated delivered-order truth; no public
  URL or environment flag can unlock the CTA.
- Fit memory stores only size and fit locally on the customer device. It stores no identity, order, payment or address data.
- CP Credit is absent until authenticated Shopify credit-account truth is
  supplied; no fake card, enable flag or balance is displayed.
- Fake member signup, fake order history and invented €15 credit were removed.

## Files changed by #67

- `.env.example`
- `apps/web/src/app/aftercare/page.tsx`
- `apps/web/src/app/member/page.tsx`
- `apps/web/src/components/layout/StorefrontHeader/index.tsx`
- `apps/web/src/components/member/FitMemory.tsx`
- `apps/web/src/components/member/MemberExperience.tsx`
- `apps/web/src/components/support/ContactForm.tsx`
- `apps/web/src/lib/commerce/post-purchase-policy.ts`
- `apps/web/src/lib/support/contact-intake.ts`
- `apps/web/src/lib/support/support-delivery.ts`
- `packages/design-system/styles/globals.css`
- `reports/HUMAN_INTERVENTION_STICKY_RED.md`
- `tests/e2e/member.spec.ts`
- `tests/member-experience.test.jsx`
- `tests/post-purchase-policy.test.js`
- `tests/apps-web-contact-route.test.js`
- `tests/e2e/privacy-network.spec.ts`
- `test_reports/post-sale-lifecycle-2026-09-03/`

## Verification

### Repository

- `yarn verify`: pass.
- Vitest: **78 files / 664 tests**, all pass.
  - shipped: 18 files / 84 tests
  - tooling: 45 files / 497 tests
  - contracts: 15 files / 83 tests
- Verify includes source boundaries, commerce contracts, ESLint, TypeScript, Stylelint, Prettier, media readiness, Storybook build, dependency audit (**0 vulnerabilities**) and Next.js production build.
- Relevant Playwright Aftercare/accessibility/privacy suite: **12 passed**;
  WCAG A/AA audit clean, no horizontal overflow, links, device-local fit memory,
  browser console/request health and support PII boundary verified.
- GitHub Verify: run `33733142601`, success for application SHA `3bff804`.
- GitHub Checkout E2E and accessibility: run `33733142623`, success for
  application SHA `3bff804`.
- Secret scan across changed tracked files: 0 suspicious findings.
- `git diff --check`: clean.

The six legacy Darwin screenshot comparisons pass unchanged on `origin/main`. They fail locally in the linked worktree because that runtime produces text raster/position drift. No baseline was updated, and the live candidate was therefore verified with fresh desktop/mobile captures below.

### Protected Staging

- Current workflow run:
  [33733157896](https://github.com/CubiqoUnited/carlophillips-site/actions/runs/33733157896).
- Exact validated input SHA:
  `3bff804b1a55691a38e9406eb1f97d21b5b21a3c`.
- Result: failed safely at `Pull isolated Preview settings` because the Staging
  `VERCEL_TOKEN` does not have access to the canonical Cubiqo scope/project.
- No Vercel build, deployment, alias, webhook probe or receipt occurred. The
  existing Staging alias remains HTTP 200 on the previous candidate.
- Required credential rebinding, risk, completion signal and exact resume point
  are at the top of `reports/HUMAN_INTERVENTION_STICKY_RED.md`. The gate contract
  was sent to release-gate work item
  `01a06651-0436-7a21-ac5e-e7ef913e3f9f` rather than duplicating workflow edits.
- Previous rollback anchor: deployment
  `dpl_Hwf6ZoR8HJ7i1Ngv8xoy5eefzWzG`, exact application SHA
  `6104bdca5e155ae03e7971d04fd35496e8e4b76c`.

### Screenshots

Exact directory: `test_reports/post-sale-lifecycle-2026-09-03/`.

- Current Aftercare captures use 1440 px and 390 px viewports.
- `desktop-before-after.png` and `mobile-before-after.png` compare PR #67's
  previous protected Staging capture on the left with the current candidate on
  the right.
- Visual inspection confirms preserved header, hero, lifecycle, fit form and
  mobile content order. The expected delta removes unauthenticated CP Credit,
  tightens review copy and spans Continue Shopping across the desktop row.
- No clipping, collision or horizontal overflow is present. The 390 px page
  becomes 262 px shorter because the false credit card is absent.

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
3. Resend sender/recipient/key and monitored receipt proof must be configured.
4. A Shopify-integrated reviews provider, protected-data access and
   authenticated delivered-order adapter must be selected/configured.
5. Shopify-backed CP Credit requires a Product Owner policy decision and
   authenticated credit-account source.
6. Real Production Apliiq intake, production, tracking and notification proof
   requires a separately approved real order; Staging correctly has no Apliiq
   handoff.

Until configured, each unavailable customer action fails closed truthfully and keeps CP support/Shopify authority visible.

## Repository hygiene

The intentional branches are `main`, `staging`, and `codex/post-sale-funnel` while PR #67 is open. The intentional worktrees are `/Users/edv/Documents/cp`, `/Users/edv/Documents/cp-staging`, and `/Users/edv/Documents/cp-postsale`. There is one remote, `origin`. Generated local Playwright output under the main worktree is disposable test output and is removed during final cleanup.

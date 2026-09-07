# Phase 1 Executability and Dependency Audit

- Date: 2026-09-07 EDT
- Delivery owner: Sushma
- Technical owner: Aarti
- Business owner: Pushpa
- Canonical baseline: `staging@5c5e2cb26e9fa7f2cc70e84bbe6932b801c3c82f`
- Purpose: determine whether Phase 1 is globally stalled, without treating PR
  #116 as a dependency where none exists

## Result

Phase 1 was **not globally stalled** at the start of this audit. The
representative exception tabletop remained executable and was resumed on the
prepared controlled-lifecycle branch. A safe public Staging cart/checkout probe
was also resumed: the storefront created a Medium cart, but Shopify redirected
the checkout to the dedicated Staging store password gate. No payment, order,
customer data, private checkout URL retention, or Apliiq action occurred.

PR #116 is documentation/governance only. It is the blocker for governance
activation, but it is not a technical prerequisite for PR #117 or PR #118.
Those code tranches have independent review and live-configuration gates. PR
#119 is stacked on PR #118 and therefore depends on #118, not on #116's runtime.

## Complete Phase 1 tranche map

| Epic/tranche | Current state | Classification | Exact dependency reason | Owner and next executable action |
|---|---|---|---|---|
| Governance operating model and durable state | Implemented in PR #116; the pre-audit head passed required checks and no runtime files are changed | Blocked by #116 | Independent approval is required, the author cannot self-approve, and every later head must rerun required checks | `CubiqoUnited` approves the latest green head; Sushma merges, runs protected Staging verification, then follows the normal Production path |
| Storefront, product, S/M/L variant, cart and Shopify checkout handoff | Canonical Staging/Production HTTP 200; live no-charge cart and trusted Shopify handoff evidence exists | Already complete | Phase 1 still requires ongoing stability, but no unresolved implementation task is proven here | Aarti/Production Watch preserve coverage; reopen on failed live evidence |
| Support delivery code and failure recovery | PR #117 adds bounded retry, sanitized failure telemetry, tests and runbook; exact-head checks green | Blocked by another human gate | Independent PR #117 approval is required; live activation also lacks verified Resend sender/domain, monitored recipient and three Vercel variables | Reviewer approves #117; config owner supplies verified Preview values; Aarti deploys and drills; Pushpa accepts |
| Shopify Customer Accounts and native returns entry | Existing code fails closed on environment-specific URLs; Vercel inventory proves both Preview URLs absent | Blocked by another human gate | Shopify admin must enable/configure Staging Customer Accounts and native returns and supply the two safe public URLs | Shopify/Vercel owner activates; Aarti runs account-isolation and eligible/ineligible returns drills; Pushpa accepts |
| Staging test payment/order and native cancel/refund/restock proof | Historical evidence exists, but no current exact-SHA proof closes this baseline. Current public probe reached `carlophillips-staging.myshopify.com/password` | Blocked by another human gate | The dedicated Staging store password is not available to the test harness; exact test-payment/admin operating access is also required | Shopify Staging owner provides protected storefront/test access; Aarti executes a no-charge test order and native exception drill |
| Controlled Production payment/order → Apliiq → fulfillment → tracking → customer status | Runbook/preflight prepared; no current real lifecycle proof | Requires live transaction | One real low-risk order creates payment/manufacturing obligations and requires a named human operator, approved instrument, total and expiry | Boss authorizes the bounded order; human submits payment; Aarti verifies technical chain; Pushpa accepts; Sushma closes |
| Cancellation, return, refund, replacement and post-production exception rules | Pushpa rules accepted in `CP-DEC-004`; synthetic reducer/tests and controlled runbook cover representative cases | Executable now | Tabletop/business-response proof needs no external mutation; live/native execution still depends on Staging access/config and, where applicable, the controlled order | Sushma/Pushpa complete and record the representative exception tabletop now; later run native Staging drills |
| Authenticated webhook ingress, durable idempotency and sanitized observation | Canonical implementation and protected evidence exist; PR #118 corrects durable-store outage handling to retryable 503 | Blocked by another human gate | The corrective PR #118 needs independent review; real subscription inventory and alert delivery need Shopify/Vercel admin access | Reviewer approves #118; Aarti verifies protected Staging and real subscription delivery/failure recovery |
| Per-topic business action, Flow alerts and reconciliation | Native-first proposal maps all eight topics; CP correctly claims observation only | Blocked by another human gate | Shopify/Apliiq current behavior and Flow must be inspected/configured by an authenticated admin before custom code can be justified; no Admin token/session is available to this task | Shopify/Flow owner grants or performs read/config access; Aarti verifies native actions, configures smallest missing alerts/reconciliation and records gaps |
| Continuous storefront/cart/checkout Production Watch | PR #118 implements a 30-minute real-cart/trusted-handoff check with P0 issue create/update/recovery | Blocked by another human gate | PR #118 review/merge and normal protected Production promotion are required; #116 is an agreed ordering preference, not a runtime dependency | Reviewer approves #118; Sushma releases; Aarti observes first schedule and induced/recovered alert behavior |
| Continuous support watch | Failure signal/runbook prepared in #117; support is unconfigured | Blocked by another human gate | Depends on #117 approval plus verified sender, monitored mailbox and operator alert destination | Config owner supplies identities; Aarti wires/tests alert; Sushma confirms routing |
| Paid-order/Apliiq progress, fulfillment-delay, missing-tracking and reconciliation watch | Thresholds/routing are defined; native-first design prepared; not live | Blocked by another human gate | Needs Shopify/Apliiq/Flow operational access and an alert recipient; the real lifecycle later supplies strongest end-to-end evidence | Admin owner enables access/config; Aarti implements the smallest demonstrated gap and runs safe fixtures before controlled-order observation |
| Synthetic exception workflow and evidence receipt | PR #119 workflow/runbook/tests are green on its current stacked head but no manual artifact can be authoritative before branch reconciliation | Blocked by another human gate | PR #119 depends on #118, then must be retargeted/reconciled, reviewed and merged before the repository workflow can be manually dispatched from the accepted branch | After #118, Sushma retargets; reviewer approves; Aarti runs exact-SHA workflow and retains explicitly synthetic receipt |
| Production policy publication | Defaults defined; preference-return postage/original-shipping treatment remains conditional | Blocked by another human gate | Policy publication and out-of-policy financial liability are Boss decisions | Boss/Pushpa confirm policy; Aarti applies exact approved copy/config through Staging UAT |
| Phase 1 final acceptance and closure | Exit criteria not all operationally verified | Blocked by another human gate | Requires accumulated technical verification, Pushpa business acceptance, protected release evidence and Boss Staging validation where required; it cannot precede the live/config gates above | Sushma reconciles criterion-by-criterion only after upstream evidence exists |

## Dependency conclusions

1. PR #116 blocks only governance activation and its protected promotion.
2. PRs #117 and #118 can be independently reviewed against `staging`; they do
   not import or execute PR #116 code.
3. PR #119 is technically stacked on #118 and must follow it.
4. Support/account/returns, Shopify Flow/subscriptions and Staging test-order
   proof are blocked by distinct external-admin/configuration gates.
5. The real Apliiq lifecycle is blocked by a separately authorized live
   transaction, not by #116.
6. The non-live exception tabletop was the only newly identified safe tranche
   executable without one of those gates, so it was resumed immediately.

Synthetic/tabletop proof must never be reclassified as live Staging, Production,
payment, order, Apliiq, tracking, mailbox or operator-alert proof.

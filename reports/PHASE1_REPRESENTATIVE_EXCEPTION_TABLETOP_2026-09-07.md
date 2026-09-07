# Phase 1 Representative Exception Tabletop

- Date: 2026-09-07 EDT
- Delivery/incident lead: Sushma
- Technical owner: Aarti
- Business acceptance: Pushpa
- Evidence class: tabletop and synthetic only
- External systems mutated: no
- Payment/order/fulfillment/refund attempted: no

## Scope and acceptance

This drill applies the accepted Phase 1 rules in `CP-DEC-004` and the controlled
commerce lifecycle runbook. It verifies that the team has one unambiguous
response, authority and closure condition for representative exceptions. It
does not prove that Shopify, Apliiq, Resend, Flow, Vercel alerts or a monitored
mailbox executed the response.

| Drill | Severity and first response | Authority/owner | Closure evidence | Tabletop result |
|---|---|---|---|---|
| Customer pays but Apliiq never receives the order | P0 for an active paid order. Sushma opens the incident; Aarti reconciles payment and exactly-one Shopify order before any retry or manual recreation | Shopify is payment/order authority; Apliiq is fulfillment provider | Exactly one paid Shopify order is either accepted once by Apliiq or receives an approved Shopify-recorded remedy; duplicate risk is zero | Pass |
| Shopify says fulfilled but CP/customer path has no tracking | P1 at 24 hours without a valid customer-visible path, raised to P0 if material active-customer impact warrants it. Alert Operations and contact Apliiq | Shopify fulfillment/tracking remains authoritative; Aarti diagnoses, Sushma coordinates, Pushpa owns customer remedy | Valid tracking appears in Shopify/customer status or an approved remedy and customer communication are recorded | Pass |
| Support form returns 503 | P1 for support unavailability; P0 only when support is completely unavailable during an active critical incident. Never show success; retain safe customer input for retry and route order help to Shopify status | Aarti restores system; Sushma coordinates; Pushpa owns fallback/SLA | Provider delivery and monitored-mailbox receipt succeed, failure alert reaches the operator, and fallback remains usable | Pass, live alert/mailbox proof pending |
| Checkout works on desktop but fails on mobile | P0 when mobile customers are broadly unable to checkout/pay; otherwise hold at P1 only if impact is demonstrably narrow with a viable path | Sushma incident lead; Aarti technical lead; Pushpa verifies mobile business path | Real mobile cart, trusted checkout handoff and payment surface recover; monitoring/prevention updated | Pass |
| Webhook is authenticated but the intended business action never happened | Receipt success is not business success. Re-read Shopify truth, classify the missing action by customer impact, and reconcile before acknowledging operational completion | Shopify owns commerce state; Aarti owns ingress/recovery; Sushma owns incident closure | Authoritative action completes or an explicit exception/remedy is recorded; CP receipt remains `externalActionApplied: false` when observation-only | Pass |
| Production is healthy but Staging differs | No promotion. Reconcile branch, configuration, store isolation and exact deployment provenance first | Sushma owns release; Aarti verifies; Pushpa accepts behavior | Approved Staging SHA/config/path is proven and the Production candidate has intended tree provenance | Pass |
| Monitoring is green but a real cart cannot be created | Customer-path evidence wins. Open P0/P1 according to impact and treat the monitor as insufficient | Sushma coordinates; Aarti fixes monitor and cart path | A real no-charge cart and trusted checkout handoff work again; monitor catches the original failure mode | Pass |
| Shopify and CP disagree on order state | Shopify wins. CP does not overwrite Shopify; investigate stale observation/reconciliation | Shopify is authoritative; Aarti diagnoses; Pushpa decides customer remedy | CP view/observation is reconciled to fresh Shopify truth with no unexplained variance | Pass |
| Apliiq starts production before cancellation arrives | Do not promise cancellation. Stop duplicate actions and apply the accepted post-production return, replacement or refund rule | Apliiq owns production fact; Shopify owns cancellation/refund; Pushpa owns remedy | Customer receives the approved remedy and Shopify records the resulting authoritative state | Pass |
| Refund requested but only CP UI state changes | Refund is incomplete. Keep case open and execute/reconcile through Shopify | Shopify is refund authority; Aarti resolves system path; Pushpa accepts outcome | Shopify records the intended full/partial refund to the original method; customer communication avoids claiming bank settlement | Pass |

## Cross-scenario recovery rules

- Never recreate a paid order or provider job before checking duplicate risk.
- Never treat an authenticated webhook, local reducer event, UI status or green
  monitor as proof that the business action completed.
- Never allow Staging configuration or test mode to affect Production Shopify.
- Preserve the active phase resume point when a P0/P1 incident interrupts work.
- Record the authoritative final state, operator action, customer remedy and
  prevention/monitoring improvement before Sushma closes an incident.

## Decision

**Pushpa business-rule/tabletop acceptance: PASS.** The responses conform to
the accepted Phase 1 defaults and identify Boss-only policy/financial decisions.

**Sushma drill-readiness decision: PASS for tabletop preparation only.** The
team may use these response contracts during Staging fixtures and the controlled
order. Live support delivery, native cancellation/refund, Apliiq handoff,
tracking return, Flow alerts and reconciliation remain open until their exact
external evidence is observed.

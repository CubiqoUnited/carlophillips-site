# Controlled Commerce Lifecycle Runbook

- Delivery owner: Sushma
- Technical owner: Aarti
- Business acceptance: Pushpa
- Live financial/manufacturing authority: Boss or an explicitly authorized human operator
- Status: Prepared only; no current real-order authority

## Purpose

Prove the native operating chain once, with the smallest controlled Production order:

`CP storefront → Shopify cart → Shopify checkout/payment → one Shopify order → Apliiq acceptance/production → Shopify fulfillment/tracking → customer status/notification`

This runbook does not authorize a purchase, payment credential, manufacturing charge, fulfillment request, cancellation, return, refund, customer contact, or Production configuration change.

## Authority gate

Before checkout submission, the Human Intervention Queue must record all of:

- exact product, size, quantity, shipping destination and maximum approved total;
- named human operator and permitted payment instrument;
- confirmation that the instrument is not being used by an agent;
- expected taxes, shipping, provider/manufacturing cost and refund exposure;
- whether Apliiq automatic processing is enabled or the order will enter an approved hold/manual-review state;
- authorized stop/cancel window;
- evidence-retention and PII-redaction owner;
- explicit expiry time and one-order limit.

The repository's historical `config/shopify-controlled-order-authorization.json` expired on 2026-08-24 and authorizes checkout preparation only. It cannot authorize the real order described here.

## Preflight — no spend

Sushma records the exact Production branch SHA, immutable Vercel deployment, canonical aliases, rollback deployment, owners, and incident channel.

Aarti verifies, without exposing secrets or customer data:

1. Production storefront, product, S/M/L variants, USD 128 approved offer, cart and checkout handoff are healthy.
2. Shopify Payments is live on the Production store; Staging/test payment settings are not applied to Production.
3. The chosen Shopify variant/SKU maps to the intended Apliiq product and fulfillment location.
4. Apliiq processing/hold behavior and cancellation semantics are known for this order.
5. Shopify Customer Accounts/order status, customer notifications, tracking path, support destination and operator alert route are configured.
6. Required Shopify webhook subscriptions, durable observation store, Flow alerts and reconciliation checks are active or their exact absence is recorded.
7. No active P0 affects storefront, checkout, payment, orders, Apliiq, support, tracking or refund operations.

Pushpa verifies the displayed product, price, shipping/tax/total, support SLA, cancellation cutoff, return rules, refund method, missing-tracking remedy, and customer communications.

Any mismatch stops only the affected live-order action. Synthetic drills and corrective preparation continue.

## Execution — authorized human only

1. Open the exact verified Production product and select the authorized variant and quantity.
2. Add to cart; verify Shopify-derived item, variant, unit price, quantity and total.
3. Continue to Shopify checkout and verify shipping, tax, total, merchant identity and payment surface.
4. The authorized human enters the permitted payment details and submits exactly one order.
5. Immediately record sanitized facts: time, environment/SHA, order-reference hash, displayed totals, Shopify status and whether a duplicate order exists. Never store payment data, customer address, private checkout URL or private order-status URL.
6. Confirm exactly one Shopify order and the expected payment state.
7. Confirm exactly one Apliiq receipt and its accepted/held/rejected state. If duplicate or unexpected automatic production appears, Sushma opens an incident and follows the stop rules.
8. Observe real production progress without substituting CP-local state.
9. Confirm Apliiq posts fulfillment and tracking to Shopify.
10. Confirm Shopify exposes tracking through the authorized customer status/notification path.
11. Reconcile the controlled window: payment, order, Apliiq receipt, fulfillment, tracking and customer status have no unexplained variance.
12. Aarti records technical verification, Pushpa records business acceptance, and Sushma closes only when evidence satisfies Phase 1 criteria.

## Stop and incident rules

- Duplicate payment/order, lost paid order, wrong item/variant/price, or active-order Apliiq handoff failure: P0; stop lower-priority work and contain immediately.
- Apliiq rejects or fails to receive the order: do not manually recreate it until Shopify payment/order truth and duplicate risk are reconciled.
- Apliiq starts production before an authorized cancellation: do not promise cancellation; apply Pushpa's post-production return/replacement/refund rule.
- Shopify says fulfilled but no valid tracking appears after 24 hours: P1 unless current customer/material impact raises it to P0; alert Operations and contact Apliiq.
- Shopify and CP disagree: Shopify wins for commerce state. Investigate CP observation/reconciliation without overwriting Shopify.
- A CP webhook returns 200 with `externalActionApplied: false`: receipt succeeded, but no business action is claimed.
- Refund/cancellation is incomplete until Shopify records the intended authoritative state. CP UI or local lifecycle state cannot close it.

## Evidence package

The sanitized report must bind:

- exact `main` SHA and immutable Production deployment;
- approved authorization record and expiry;
- product handle, size, quantity and money values without raw Shopify variant IDs;
- payment status and a one-way order-reference fingerprint;
- exactly-one Shopify order evidence;
- exactly-one Apliiq acceptance evidence and subsequent production state;
- Shopify fulfillment and tracking presence;
- customer status/notification observation without private URLs or PII;
- webhook/Flow/monitor timestamps and sanitized identifiers;
- reconciliation result and every variance;
- Aarti technical acceptance, Pushpa business acceptance and Sushma closure.

No screenshot or artifact may contain payment data, customer address, email, phone, raw order/provider IDs, private URLs, tokens or secrets.

## Representative exception drills

These drills do not require the physical order to experience every failure. Use the strongest safe environment and clearly label synthetic evidence.

After release, the manual `Phase 1 synthetic exception drills` workflow runs the repository-defined support, webhook, lifecycle, return/refund, reconciliation, and customer-routing cases against an exact SHA. Its receipt is always labelled `synthetic_only` and `liveOperationalProof: false`; it cannot replace the live gates in the table below.

| Scenario | Safe proof | Required result | Live proof still required? |
|---|---|---|---|
| Support provider unavailable | Mock provider timeout/5xx plus Staging alert drill | bounded retry, no false success, fallback, operator alert | Yes: monitored mailbox delivery and alert route |
| Duplicate webhook | Signed duplicate synthetic delivery | one observation/action, safe duplicate acknowledgement | Yes: real subscription inventory and environment delivery |
| KV unavailable | Injected durable-store failure | retryable 503 and sanitized alert | Yes: protected environment alert routing |
| Paid order lacks Apliiq progress | Test-store/Flow fixture or read-only reconciliation fixture | P0/P1 incident created with Shopify order as authority | Yes: controlled real order handoff |
| Fulfillment delayed | Flow test data or controlled operational drill | alert after provider/customer promise plus one business day | Yes: live workflow/recipient proof |
| Missing tracking | Fulfilled test order without tracking or safe simulation | alert after 24 hours; Operations remedy | Yes: real Apliiq tracking return |
| Cancellation before production | Shopify test order and documented Apliiq hold drill | native cancellation attempted once and states reconciled | Yes if Production/Apliiq timing differs materially |
| Cancellation after production | Tabletop drill | no false cancellation promise; support remedy selected | No physical exception required if business/ops drill is accepted |
| Return/refund | Shopify test-store eligible/ineligible/refund scenarios | Shopify records decision and refund; CP never overrides | Yes only for Production financial operation, not Phase 1 exception simulation |
| Partial refund failure | Mock/API failure or tabletop with Shopify test order | remains open, alerts operator, reconciles before closure | No real loss required if technical and operational proof is accepted |

## Closure decision

The native lifecycle is operationally proven only after the authorized controlled Production order reaches fulfillment/tracking/customer status and reconciliation completes. Representative exceptions may close through test-store, synthetic, simulated or operational-drill evidence where Pushpa and Sushma accept that evidence as equivalent for the specific failure path.

If the controlled order cannot be authorized, all preparation and exception drills continue, but payment/order, real Apliiq production, real tracking return and full Phase 1 closure remain blocked.

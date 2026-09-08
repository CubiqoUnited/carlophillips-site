# Phase 1 Webhook and Reconciliation Proposal

- Date: 2026-09-07 EDT
- Technical owner: Aarti
- Business owner: Pushpa
- Operations owner: Sushma
- Status: Proposed; native configuration and live evidence required

## Architecture decision

Keep Shopify authoritative for order, payment, cancellation, refund, fulfillment, and tracking. Keep Apliiq responsible for its Shopify-connected production/fulfillment duties. CP webhook ingress remains a sanitized, authenticated observation boundary; receipt does not become permission to mutate Shopify or Apliiq.

Use this order:

1. verify Apliiq's existing Shopify fulfillment service and tracking behavior;
2. use Shopify Flow for staff alerts, scheduled late-fulfillment queries, and workflow-error alerts;
3. use CP's existing signed webhook observations for independent receipt/dedup evidence;
4. add a narrow read-only Shopify reconciliation check only if Flow cannot expose the required exception;
5. add a custom worker, queue, dead-letter store, or replay UI only after a demonstrated business action cannot be completed or recovered through the preceding layers.

Official Shopify evidence supports this boundary: Flow is available on paid plans and can trigger from orders, query fulfillment orders on a schedule, send internal staff email, and monitor Flow errors. Shopify customer tracking remains driven by fulfillment/tracking stored in Shopify. Fulfillment-service apps can receive fulfillment/cancellation requests and update or expose tracking through Shopify.

References:

- <https://shopify.dev/docs/apps/build/flow>
- <https://shopify.dev/docs/apps/build/webhooks/verify-deliveries>
- <https://shopify.dev/changelog/updates-to-webhook-retry-mechanism>
- <https://help.shopify.com/en/manual/shopify-flow/reference/actions/send-email>
- <https://help.shopify.com/en/manual/shopify-flow/reference/actions/get-fulfillment-order-data>
- <https://help.shopify.com/en/manual/fulfillment/setup/order-status-page/order-tracking>
- <https://shopify.dev/docs/api/admin-rest/latest/resources/fulfillmentservice>

## Current CP boundary

- `apps/web/src/app/api/webhooks/shopify/route.ts` accepts eight allowlisted Shopify topics after runtime, HMAC, shop, topic, timestamp, body, and replay verification.
- `webhook-idempotency.ts` requires an environment-namespaced durable Upstash/KV claim. The short processing claim is atomically replaced in the same key by the sanitized observation, which then remains for 30 days.
- Authenticated delivery timestamps are accepted for five hours so Shopify's documented four-hour retry schedule can reuse the original timestamp without being rejected at the final boundary. The processing claim itself remains a separate 30-second lease.
- A delivery returns duplicate success only when that durable key contains a completed observation. A claimed-but-unrecorded or unreadable state returns retryable 503 and cannot masquerade as success.
- New valid receipts return `externalActionApplied: false`; this proves authenticated observation, not completion of a downstream business process.
- The protected webhook probe proves signed receipt and duplicate suppression but is manual and Staging-bound.
- No live subscription inventory, per-topic operating behavior, missing-event reconciliation, operator alert, or Production end-to-end observation is currently proven.

## Topic routing

| Topic                 | Authoritative business action               | CP behavior after receipt    | Recovery/reconciliation                                                                                  |
| --------------------- | ------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| `orders/create`       | Shopify creates the order                   | Store sanitized receipt only | Flow/operator checks that a payable order enters the intended fulfillment path                           |
| `orders/paid`         | Shopify records payment                     | Store sanitized receipt only | Flow alerts on paid orders; scheduled exception check finds paid orders without fulfillment progress     |
| `orders/cancelled`    | Shopify records cancellation                | Store sanitized receipt only | Verify Apliiq/native cancellation state; alert if production already started or state diverges           |
| `orders/fulfilled`    | Shopify records fulfillment                 | Store sanitized receipt only | Confirm customer tracking path exists; alert after the accepted 24-hour missing-tracking threshold       |
| `orders/updated`      | Shopify holds current order state           | Store sanitized receipt only | Use as observation, not an event-sourced state rebuild; query Shopify for current truth when reconciling |
| `fulfillments/create` | Shopify/Apliiq records fulfillment          | Store sanitized receipt only | Check tracking presence and assigned fulfillment location                                                |
| `fulfillments/update` | Shopify/Apliiq updates fulfillment/tracking | Store sanitized receipt only | Recheck missing/stale tracking and customer-visible status                                               |
| `refunds/create`      | Shopify records the refund                  | Store sanitized receipt only | Reconcile that the intended full/partial refund exists in Shopify; CP UI state cannot close it           |

## Minimum Phase 1 configuration

### Shopify/Apliiq native

- Prove the installed Apliiq fulfillment service receives the intended Production SKU/order and returns fulfillment/tracking to Shopify.
- Confirm cancellation behavior before and after Apliiq production begins; retain the Pushpa policy when native cancellation is no longer available.
- Keep customer shipment notifications and order status sourced from Shopify.

### Shopify Flow

- Paid order alert or tag for Operations.
- Scheduled query/summary for paid or open fulfillment orders beyond the accepted provider/customer promise.
- Fulfilled-without-valid-tracking alert after 24 hours.
- Order-cancelled and refund-created staff notification for exception oversight.
- Flow-workflow-error notification to Operations.

Flow setup must use a monitored staff destination and must be tested. A configured workflow or green run without a real exception drill is not operational proof.

### CP observation

- Register only the topics actually used for independent evidence/alerts.
- Preserve HMAC verification, shop allowlist, environment isolation, durable atomic deduplication, and PII-free storage.
- Emit sanitized ingress/storage failure signals to the selected monitoring tool.
- Add a scheduled signed no-PII Production ingress probe only if a protected secret can run without recurring human approval and without weakening secret boundaries.

## Failure semantics

- Missing webhook: Shopify/Apliiq native business state remains authoritative; Flow or scheduled Shopify reconciliation must surface the missing expected progress.
- Duplicate webhook: acknowledge safely, record no second observation/action.
- CP 200 with `externalActionApplied: false`: receipt succeeded; no external business action is claimed.
- KV unavailable: return 503 so Shopify can retry; emit a sanitized technical alert.
- Observation-write plus claim-release failure: keep returning 503 for the
  incomplete claim; never acknowledge it as a completed duplicate. The short
  30-second processing lease prevents an orphaned claim from occupying the
  30-day completed-observation window, while the five-hour authenticated
  delivery window permits Shopify's documented four-hour retry sequence.
- Authenticated receipt but missing business outcome: treat as an open exception, query Shopify current state, then inspect Apliiq/Flow; do not call it success.
- Tracking absent/stale: alert Operations and follow the Pushpa remedy; do not create a second carrier database by default.
- Reconciliation mismatch: Shopify wins for commerce state; Sushma opens a P1 or P0 according to active-order/customer impact and Aarti investigates the integration path.

## Evidence required for closure

- Exact subscription inventory for Staging and Production, including topic, endpoint, shop, and active status without exposing secrets.
- Signed delivery plus duplicate test in each intended environment.
- One induced durable-store failure proving 503/retry and operator alert.
- One paid-order/Apliiq lifecycle showing native receipt, production, fulfillment, tracking returned to Shopify, and customer-visible status.
- Controlled drills for missing tracking, delayed fulfillment, cancellation timing, refund reconciliation, duplicate delivery, and authenticated-receipt/business-action mismatch.
- Flow configuration/run evidence and proof that its failure notification reaches Operations.
- A reconciliation receipt showing no unexplained paid-order/fulfillment/tracking variance for the controlled window.

## Readiness recommendation

**GO** for read-only subscription inventory, Flow design/configuration in the test store, sanitized failure telemetry, and synthetic exception drills.

**NO-GO** for a custom processor/queue/DLQ and for Production lifecycle claims until native Apliiq behavior, Flow coverage, real subscriptions, and a controlled authorized order demonstrate the remaining gap.

## Candidate implementation evidence

- Durable processing and completion now share one environment-namespaced key:
  a short `claimed` lease is atomically replaced with the sanitized observation
  and a 30-day completion TTL.
- Duplicate delivery returns 200 only for `recorded`; `claimed`, missing, or
  unreadable state returns retryable 503. Regression coverage proves that an
  observation-write failure followed by a release failure cannot turn the next
  same-ID retry into false duplicate success. A retry carrying its original
  timestamp remains acceptable after the processing lease expires, and a
  completed duplicate remains a harmless 200.
- A recovered Production commerce check comments on the open P0 but leaves it
  open for Sushma to verify recovery, prevention and closure. One green run no
  longer closes the incident automatically.
- Expanded targeted webhook/store/watch tests pass with TypeScript and
  Production-commerce lint green. Live subscriptions, alert delivery, first
  scheduled Production execution, native Flow/Apliiq behavior and controlled
  lifecycle evidence remain separate operational gates.

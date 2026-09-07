# Support Delivery Runbook

Owner: Aarti (technical), Pushpa (support process), Sushma (incident coordination)

## Configuration contract

The deployed `apps/web` support path requires these server-only values in each intended Vercel environment:

- `RESEND_API_KEY`
- `CP_SUPPORT_FROM_EMAIL`
- `CP_SUPPORT_TO_EMAIL`

Do not put values in source, logs, screenshots, reports, workflow inputs, or chat. Preview and Production configuration must be verified separately. The sending identity must be valid for the selected Resend project, and the destination must be a monitored operational mailbox.

## Detection

Create an alert from the structured runtime signal `cp.support.delivery_failed`. Route it to Sushma and the accountable technical responder. The signal is intentionally PII-free and contains the CP request reference, failure class, attempt count, environment, route, and timestamp.

The alert must be tested in Preview by inducing a safe provider failure. A log existing in Vercel is not proof that a human receives an alert.

## Customer behavior

- 200 with a CP reference means Resend accepted the request; it does not prove an operator read or resolved it.
- 503 means delivery configuration is absent. The page directs the customer to the secure Shopify order-status path and must display the approved monitored fallback once configured.
- 502 means the provider rejected the request or remained unavailable after the bounded retry. No success message is shown.

## Response and recovery

1. Confirm environment, request reference, failure class, and time without retrieving customer content into logs.
2. Check Resend service/delivery status and the configured sender/domain binding.
3. Confirm the monitored mailbox and alert route are staffed.
4. Restore the provider or environment binding; do not redirect Production messages to an unapproved personal address.
5. Run one synthetic no-PII submission and confirm both provider acceptance and monitored-mailbox receipt.
6. Record recovery evidence and close only after Pushpa confirms the customer fallback/process remains acceptable.

If mailbox-based operations repeatedly miss SLA or cannot reconcile requests, evaluate an established Shopify-integrated helpdesk before proposing custom ticket storage.

## Staging proof checklist

- Protected candidate SHA and Preview environment recorded.
- Configuration presence checked without displaying values.
- Synthetic submission returns one CP reference.
- Resend accepts the message and the monitored mailbox receives it.
- Induced failure produces no success state and triggers the human alert route.
- Logs and captured evidence contain no customer email, message, order reference, token, or provider payload.
- Pushpa records business UAT; Sushma records readiness or the exact remaining blocker.

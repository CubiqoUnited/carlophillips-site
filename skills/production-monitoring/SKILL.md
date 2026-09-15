production-monitoring/
production-monitoring/
	•	Monitor inventory: DNS/domain, storefront, product availability, cart, checkout handoff, payment surface, Shopify webhook ingress, support delivery, paid-orders-without-fulfillment, missing tracking, POD failures.
	•	Each monitor: threshold, alert route, immediate trigger action, mapped P0/P1/P2 severity — not generic.
	•	Absorbs the existing reports/PHASE1_WEBHOOK_RECONCILIATION_PROPOSAL.md design rather than starting new.
	•	Thresholds are already defined, not open questions: three Shopify Flow automations — “CP — In Production Customer Notice” (2hr, PAID + UNFULFILLED → customer email), “CP — Stale Order Alert 2hr” (2hr → ops owner), “CP — Stale Order Escalation 48hr” (48hr → escalation).
	•	Drill procedure is part of the skill, not improvised: temporarily set the 2hr flow to 10 minutes, place a test order, leave it unfulfilled, confirm the alert lands, manually add tracking, confirm the shipping notification fires, then reset both waits to 2hr/48hr and record the drill.
	•	Still genuinely open: the per-monitor P0/P1/P2 severity mapping for the wider monitor inventory above — the three order-staleness flows have numbers; DNS, storefront, webhook-ingress and the rest do not yet.
	•	Feeds production-incident/ on trigger; does not itself perform recovery.
	•	Actual cron schedules and alert rules live in Vercel scheduled functions + Shopify Flow — cloud config, never duplicated here as data.

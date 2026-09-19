Class EVOLVING · Owner Sushma · Writers all active roles append; Sushma reconciles · Read standing, second file read every session · v3.5interim (2026-09-17)

# Blockers (Categorized Ledger)

One append-safe ledger. A blocker pauses the affected action, not the whole project. Every record: item ID, category (HUMAN / INTERNAL_AGENT / EXTERNAL / RESOLVED), workflow state retained, owner, evidence, exact action required, resume trigger, parallel work, opened time, review time, resolution.

## HUMAN

### H-007 — Programmatic access to the STAGING store is gone
- Affected work: D-013 staging dispatch change (manual-location configuration); any staging store verification
- Retained workflow state: BLOCKED (external access)
- Owner: Boss / coordinator
- Evidence: the reconnected connector points at **production** (carlophillips.myshopify.com). One connection, one store.
- Consequence: the D-013 manual-location change must be made **by hand in the Shopify admin or via the authenticated browser pane, not by API.** Aarti cannot script it.
- Resume trigger: the change applied and verified by whatever surface is available, or a second connection established.
- Opened: 2026-09-18

### H-005 — Shopify connector DISCONNECTED — RESOLVED 2026-09-18
- Resolution: reconnected by Boss, now pointed at **PRODUCTION** — `carlophillips.myshopify.com`, plan **"Basic"** (a real paid plan, distinct from staging's "Basic App Development"). This was the first time production was inspected, and it immediately surfaced a live P0 (D-027).
- Consequence carried forward as H-007: staging is no longer reachable programmatically.
- Opened: 2026-09-18 · Resolved: 2026-09-18

### H-005 original entry (retained)
- Affected work: all live store verification — D-019 gateway confirmation, D-013 dispatch fix, D-018 happy-path execution, D-017 catalogue creation, and confirming the D-016 curation stopgap
- Retained workflow state: BLOCKED (external access / credential class)
- Owner: **Boss — only Boss can reconnect.**
- Evidence: revoked 2026-09-18 by the coordinator while attempting to switch the connection to the production store. Distinct from H-003, which was a stale token behind a UI that still read "connected"; this one is a known, deliberate revocation.
- Exact action required: Boss reconnects the Shopify connector, and states which store the connection targets (staging or production) — the switch attempt that caused this is itself unfinished business.
- Resume trigger: a successful Admin API read recorded with its date.
- Parallel work: requirements drafting, Sidekick questions (D-021, routed via Boss anyway), and all governance work continue unaffected.
- Note: this is now the second access outage today. Every launch blocker except D-020 needs live store access to close, so this is the practical gate on the whole launch list.
- Opened: 2026-09-18

### H-006 — Gmail connector invalidated
- Affected work: verifying the Apliiq design-confirmation email that underpins the FR-6 demonstration in D-025
- Retained workflow state: BLOCKED (external access / credential class)
- Owner: Boss
- Evidence: coordinator attempted verification 2026-09-18 and could not — connector invalidated.
- Consequence: the FR-6 design-email evidence is **Boss-reported only** and must never be cited as a first-hand read. FR-6's other leg (Apliiq fulfilment service on the order) is verified and unaffected.
- Resume trigger: successful Gmail read recorded, or Boss confirms the email directly from his account.
- Opened: 2026-09-18

### H-001 — 58 vs 45 file-count reconciliation
- Affected work: any Gate closure that cites scripts/check-agent-docs output as evidence
- Retained workflow state: BLOCKED (governance validation)
- Owner: Boss / Aarti
- Evidence: scripts/check-agent-docs reports 58 tracked items; the file authority matrix (v3.7 Appendix A) defines 45 named items + 3 patterns. Gap never reconciled.
- Exact action required: Aarti diffs the 58 vs 45+3, explains the 10-item gap, updates matrix or validator
- Resume trigger: reconciliation committed and reviewed
- Opened: 2026-09-15 (carried forward from prior audit)

(H-004 closed as INVALID 2026-09-18 — see Resolved. H-002 moved to Deferred on 2026-09-18 by Boss decision — see below. H-003 resolved 2026-09-18 — see Resolved.)

## Internal Agent

None currently open.

## External

None currently open.

## Deferred (Boss decision — not resolved, not actionable)

### H-002 — Phase 1 real-commerce closure — TABLED this cycle
- Affected work: any claim that Phase 1 is fully closed
- Retained workflow state: DEFERRED (product) — was BLOCKED (product)
- Owner: Boss (re-entry authority). No role is dispatched against this.
- Boss decision: 2026-09-18 — do not pursue real orders, Apliiq handoff, or tracking/support/returns validation in this cycle. Recorded at state/PROPOSALS.md `2026-09-18T000000Z-boss-phase1-real-commerce-closure-tabled`. The decision stands.
- Basis — CORRECTED 2026-09-18 (superseding the earlier "UNVERIFIED" wording): store state is NOW VERIFIED. H-003 cleared, live read taken the same day.
- Verified store state (2026-09-18): store "CARLOPHILLIPS Staging" / carlophillips-staging.myshopify.com / Basic App Development plan / USD / EDT. 4 products — 2 leftover Shopify demo snowboards, plus Apliiq Signature Hoodie and Rapid Logo Tee, both ACTIVE with totalInventory 0. 5 orders.
- **Finding: NO real customer order exists.** Four refunded test orders, plus order #1005 which is itself a test order — GraphQL shows `test: true`, `paymentGatewayNames: ["bogus"]` (Shopify's test gateway), single transaction gateway "bogus", test true, kind SALE, amount 19.30. No money moved. No real customer was charged.
- **Correction history — kept deliberately so the reversal is legible.** (i) 2026-09-18 first basis: store state UNVERIFIED (connector down). (ii) Same day, second basis: asserted that #1005 was "a real order that went end-to-end" — **this was WRONG**. (iii) Same day, third and current basis: retracted on gateway evidence via first-hand GraphQL. The "real customer order" claim was asserted, then retracted. The original instinct behind tabling H-002 was sound; the intermediate correction made the record worse, not better.
- Net effect on the decision: none. The deferral stands and is, if anything, better supported — there is no real-commerce activity to examine.
- Exact action required: none on the deferral itself. This item must not be worked, and must not be cited as closed.
- **UPDATE 2026-09-18 (SK-004):** shipping labels purchased on TEST orders are **charged for real**. The staging dispatch leak therefore may have cost actual money even if no garment was manufactured — which the D-025 inference did not cover, since it reasoned about manufacturing rather than label purchase. **A real financial reconciliation of the Apliiq account is owed**, and it sits inside this deferred item. Owner Boss (only he can access the Apliiq account). Not a launch blocker; do not let it be forgotten.
- Re-entry trigger (any one): Boss reopens it in state/PROPOSALS.md; the first genuine non-test customer order is placed (gateway is not "bogus" and `test` is false); or Apliiq/fulfilment enters state/SCOPE.md Included.
- Parallel work: unaffected — Gate 12 and all governance work proceed.
- Opened: 2026-09-16 · Deferred: 2026-09-18 · Review: on re-entry trigger only (no calendar review)

## Resolved

### H-004 — Order #1005 "FULFILLED with empty fulfillments" — CLOSED INVALID 2026-09-18 (opened and closed same day)
- Original claim: order #1005 showed fulfillmentStatus FULFILLED with an EMPTY `fulfillments` array — therefore no tracking, no carrier.
- Retraction: the array is NOT empty. First-hand GraphQL returns one fulfillment, `gid://shopify/Fulfillment/4468221083854`, status SUCCESS, carrier USPS, tracking number 9400150899563505738795, with a tracking URL. There is no defect. Nothing is wrong with this order's fulfilment.
- Root cause: the `get-order` MCP convenience tool does not populate the `fulfillments` field. The empty array was an artifact of the read surface, not a fact about the store. A defect was opened against a tool's omission.
- Disposition: CLOSED INVALID. Not deferred, not fixed — it never existed. No work is owed by Pushpa or Aarti on this.
- Downstream: Pushpa built acceptance criteria and P1 defect D-FUL-001 on this false premise. D-FUL-001 must be withdrawn and CP-COM-001 revised. Retraction sent to her directly by the coordinator.
- Opened: 2026-09-18 · Closed invalid: 2026-09-18

### STANDING RULE (three instances now, same failure class)
**Verify against the authoritative API — and confirm what a field MEANS in context before grading on it.**
- Third instance, 2026-09-18: the Tee's `inventoryQuantity: -1` was graded a P1 defect. The item is `tracked: false` on `inventoryPolicy: CONTINUE`, so that counter is meaningless, not a stock level. Nothing was oversold. Retired, never a defect.
- A field's presence or value is not self-interpreting.
- H-003: a connector UI displayed "connected" while its OAuth token was dead. Displayed status contradicted actual access.
- H-004: an MCP convenience tool returned an empty field it simply does not populate. A summary contradicted the authoritative record.
- Consequence for every role: a convenience tool's output is a lead, never evidence. Before a blocker is opened, a defect raised, acceptance criteria written, or a gate cited, the claim must be confirmed against the authoritative source (GraphQL for Shopify; a successful API call for access). Absence of data in a summary surface is not evidence of absence in the system.
- This rule is cited in state/DECISIONS-LOG.md and applies to Boss decision requests as well: an option or impact resting on an unverified convenience read is an incomplete request.

### H-003 — Shopify connector invalidated — RESOLVED 2026-09-18 (opened and closed same day)
- Original symptom: `get-shop-info` returned "The user's connection to this connector was invalidated. The user needs to reconnect it from connector settings." Session was non-interactive, so OAuth could not be re-run at that moment.
- Resolution: connector reconnected; live read succeeded 2026-09-18 (coordinator, first-hand) returning "CARLOPHILLIPS Staging" / carlophillips-staging.myshopify.com / Basic App Development plan / USD / EDT.
- Root cause worth keeping, because this will otherwise be re-litigated: a STALE OAUTH TOKEN sitting behind a connector the app still displayed as "connected". The UI said connected; the token was dead. "Shows connected but isn't" is the failure mode — connector UI state is not evidence of working access. A successful API read is.
- Standing consequence: any future claim of Shopify access must cite a successful call, never the connector's displayed status.
- Opened: 2026-09-18 · Resolved: 2026-09-18

Prior BLOCKERS.md entries (pre-migration) are quarantined at .quarantine/2026-09-17/BLOCKERS-legacy.md for reference.

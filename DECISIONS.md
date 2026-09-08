# CARLOPHILLIPS Decision Log

Use this file for durable product and architecture decisions that affect multiple tasks or owners. Detailed implementation evidence belongs in `reports/` or `test_reports/`.

## Current decisions

### CP-DEC-001 — Instruction and role hierarchy

- **Status:** Accepted
- **Decision:** Apply universal rules, then CP project rules, then the explicitly invoked CP role file, then Boss's current instruction.
- **Reason:** Keep universal behavior role-neutral while version-controlling CP ownership and routing with the project.
- **Consequence:** `agents/` contains role definitions only; changing project state belongs in `STATUS.md`, `TASKS.md`, `TEAM-BOARD.md`, this log, or evidence reports.

### CP-DEC-002 — Durable team memory

- **Status:** Accepted
- **Decision:** Chats are working conversations; repository state files are the durable inter-agent handoff truth.
- **Reason:** New tasks and agents must reconstruct current state without depending on chat history.
- **Consequence:** Material operational changes update the appropriate shared state and evidence files.

### CP-DEC-003 — CP ownership and acceptance flow

- **Status:** Accepted
- **Decision:** Pushpa defines and accepts business behavior; Aarti confirms feasibility, implements, and technically verifies; Sushma coordinates QA/UAT, incidents, release, and closure. Richa supplies evidence; Malti owns approved market execution and interpretation.
- **Reason:** Separate business, technical, research, market, and delivery accountability.
- **Consequence:** No role substitutes its approval for another role's required acceptance.

### CP-DEC-004 — Phase 1 post-sale operating defaults

- **Date:** 2026-09-07
- **Status:** Accepted for next-tranche design; Production policy publication and real financial execution remain conditional
- **Owner:** Pushpa — business rules and acceptance
- **Context:** The approved Phase 1 readiness gate requires only the business decisions needed for the next operational tranche, while preserving Shopify/Apliiq native authority and avoiding premature custom infrastructure.
- **Decision:** Support responds within 1–2 business days, with paid-order and fulfillment exceptions prioritized within one business day. Failed delivery never shows success; Production requires retry, a monitored alternate route, Shopify account/order-status guidance, and an Operations alert. Cancellation is eligible only while Shopify permits it and Apliiq has not begun production. Once production starts, support applies the approved return/replacement/refund remedy. Returns default to 30 calendar days after confirmed delivery for unworn/unused goods; verified wrong, damaged, defective, materially misdescribed, or carrier-lost items use the merchant-fault exception path. Phase 1 uses return then new Shopify order for preference/size exchanges; replacements cover verified merchant/vendor/carrier faults when viable. Refunds use Shopify and the original payment method; CP UI alone never proves a refund. Fulfillment delay uses the customer promise/provider SLA plus one business day; missing tracking alerts when Shopify shows fulfillment without a valid customer path after 24 hours or tracking exceeds the carrier movement promise. Operators may investigate, communicate, resend notices, initiate native pre-production cancellation, and apply published remedies within evidence and authority; policy changes, out-of-policy/high-value exceptions, new paid tools, reserved Production gates, and any real controlled purchase using Boss's instrument require Boss.
- **Controlled-order acceptance:** Prove the approved environment/SHA and offer; reviewed price/shipping/tax/total; one authorized payment and exactly one Shopify order; exactly-once Apliiq receipt and acceptance; native production/fulfillment/tracking returned to Shopify and the customer path; sanitized evidence without secrets/PII; no unexplained reconciliation variance; and representative support/cancellation/return-refund/delay/missing-tracking/webhook-failure drills. Pushpa records business acceptance, Aarti technical verification, and Sushma closure.
- **Boss decisions:** Before Production publication or real execution, approve preference-return postage/original-shipping treatment, authorize any real controlled payment through an approved human/payment method, and approve exceptions outside policy or above the original order value.
- **Consequence:** Aarti may design the support/customer-account tranche now. No CP event platform, carrier database, or custom exception engine is implied.
- **Verification or review trigger:** Revisit after the first controlled commerce lifecycle, a material policy change, or evidence that native Shopify/Apliiq behavior is insufficient.

## New decision template

```markdown
### CP-DEC-NNN — Title

- **Date:** YYYY-MM-DD
- **Status:** Proposed | Accepted | Superseded
- **Owner:**
- **Context:**
- **Options considered:**
- **Decision:**
- **Reason:**
- **Consequences/risks:**
- **Verification or review trigger:**
- **Evidence:**
```

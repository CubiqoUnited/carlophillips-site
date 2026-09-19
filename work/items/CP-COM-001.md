Class EVOLVING · Owner Sushma (state) · Writers Pushpa writes product sections; Sushma reconciles state · v3.5interim (2026-09-18) · Happy path: CP-HP-DELTA v2.3 on CP-TFRD-1.0 + UI-SPEC-v1 incl. V1.2 Addendum (see §17, §21, §22) · Policies: CP-POLICY-v1.0

# CP-COM-001 — Commerce Integrity Requirements (finalized against live store state)

**State:** REQUIREMENTS_DRAFTED — awaiting Boss approval + Aarti ADR before any build.
**Product owner section author:** Pushpa
**Ground truth basis:** first-hand Shopify Admin read, 2026-09-18, CORRECTED by direct GraphQL re-read the same day (see section 0), store `carlophillips-staging.myshopify.com` ("CARLOPHILLIPS Staging", Basic App Development plan, USD, EDT). 4 products, 5 orders.

> **Scope note (rewritten 2026-09-18, revision 2).** H-002 (broader real-order / Apliiq / tracking / support / returns *execution* proof) remains TABLED by Boss and is NOT re-opened here.
>
> **Why this item sits outside H-002:** defining what correct behavior *is* is a requirements activity. It requires no order to exist, real or test — an acceptance criterion is a standard, and a standard can be written before anything is measured against it. H-002 covers *execution and verification*; this item covers *specification only*. Nothing here dispatches a real order, an Apliiq handoff, or a tracking/support/returns test.
>
> This argument deliberately does **not** rest on order #1005's existence or status. An earlier version of this note claimed #1005 was "a real, paid, fulfilled customer order" and used that to justify the scope boundary. **That claim is false and is retracted — #1005 is `test: true` on the "bogus" gateway (see R-2 in section 0).** The scope boundary holds without it.
>
> Where live data *is* used below, it is used to identify gaps worth specifying (misconfigured POD inventory, cost-basis pricing, demo data), never as proof that any behavior has been verified.

---

## 0. REVISION 2 — retractions (2026-09-18)

Two facts in the original brief were wrong. Both were corrected by a direct GraphQL read against order #1005. Retractions are kept visible below rather than deleted, so the reversal stays legible.

### R-1 — RETRACTED: D-FUL-001 "fulfilled order with empty fulfillments"
**INVALID. There is no such defect.** Order #1005 has one fulfillment: `gid://shopify/Fulfillment/4468221083854`, status SUCCESS, tracking company USPS, tracking number 9400150899563505738795, working tracking URL.

**Root cause of the false defect:** the empty array came from the `get-order` MCP convenience tool, which does not populate the `fulfillments` field. It was an artifact of the read path, not a property of the store. **Standing lesson, same shape as H-003's "connector UI said connected but the token was dead": an absent field from a convenience tool is not evidence of an absent record. Confirm a negative against the source API before grading it a defect.**

What this changes: I graded a P1 defect against a real named customer on the strength of a field a tool never fills in. The grading was wrong, not merely premature.

What survives from section 2: the AC-FUL criteria themselves remain valid as *requirements* — they are the standard #1005 now demonstrably meets, rather than the standard it failed. Section 2 is retained on that basis and re-scoped, not deleted. No remediation of #1005 is needed.

### R-2 — RETRACTED: "#1005 is a real customer order"
**It is a TEST order.** Live values: `test: true`, `paymentGatewayNames: ["bogus"]`; its single transaction is gateway "bogus", test true, kind SALE, status SUCCESS, amount 19.30. "bogus" is Shopify's test gateway. No money moved. No real customer was charged. Aditya Vyas is the store owner's own account, not a third-party customer.

**Consequence — C-4 is REOPENED.** I closed "checkout/payment/order capture proven by a genuine order, not a simulation." It was proven by a simulation, which is exactly what I had ruled out. This is the error I most need to own: I treated the presence of a customer name and a shipping address as proof of genuineness and never checked the `test` flag.

The PRD already governs this directly and I should have applied it: *"Historical no-order evidence is `cart-write-test` only and must return `evidence_only`, never operational `cart-write` readiness."* A test-gateway order is `evidence_only`. It is not operational payment-capture readiness.

**Guard against over-closing the other way:** fulfillment and tracking are demonstrably working *on a test order*. That is real evidence and better than nothing, but it is not proof that a live-gateway order produces a fulfillment with tracking. Both C-4 and fulfillment integrity are now OPEN-as-evidence_only, not CLOSED and not FAILED.

### R-3 — RETRACTED: "negative POD inventory is a P1 defect" (Revision 5, 2026-09-18)
**INVALID. Retract entirely.** Direct GraphQL: Signature Hoodie `tracksInventory: false`, all 9 variants `inventoryPolicy: CONTINUE`, `inventoryItem.tracked: false`, `availableForSale: true` despite `totalInventory: 0`. Rapid Logo Tee identical, including `availableForSale: true` on the black/m variant at `inventoryQuantity: -1`.

**Root cause:** `inventoryQuantity` on an **untracked** item is a meaningless counter, not a stock level. I read it as stock. Nothing is blocked, nothing is oversold, the variant is sellable. The "-1" is harmless residue of a *correctly configured* POD product.

**THIRD finding this session invalidated by the same error.** R-1: an empty `fulfillments` array from a convenience tool read as an absent record. R-2: a customer name and address read as proof of a real order, without checking `test`. R-3: a counter on an untracked item read as stock. Also H-003: a connector's green light read as working access. **Standing lesson for my UAT practice — confirm a negative against authoritative state before grading it.** A summary or convenience field carries only the meaning its configuration gives it; absence, zero, and negative are not findings until the authoritative record says so. I will apply this before grading, not after being corrected.

**Retired by R-3:** O-2 as a defect; AC-INV-1/-2/-4/-6/-7 were already retired to Shopify config in 0b.2 and are now **satisfied, not pending** (SC-1 and SC-2 are met, not outstanding). **AC-INV-3** ("`totalInventory 0` must not render as sold out") — retired: the code paths read `availableForSale`, not inventory counts (`lib/commerce/shopify-checkout-server.js`, `lib/commerce/variant-presentation-policy.js`), so the criterion describes a risk that does not exist. **AC-INV-5** (no scarcity copy on made-to-order) — **SURVIVES**: it is a rule about copy we must not write, independent of inventory configuration, and "only 2 left" would be untruthful on a made-to-order item however Shopify is configured. Pricing re-grade (15.4, LB-3) is unaffected and stands.

**POSITIVE FINDING — add to reconciliation: both products are correctly configured for POD.** Untracked + CONTINUE + `availableForSale: true`. This **de-risks HP-3 and HP-4** and removes LB-adjacent doubt from the happy path. It also sets the standard for new items (AC-CAT-4).

### R-4 — RETRACTED: "cost-basis pricing is LAUNCH-BLOCKING" (Revision 6, 2026-09-18, Boss override)
**Boss has overruled the P1 grading. LB-3 is withdrawn.** Recorded plainly: the push to re-grade P2→P1 came from the **coordinator**, not from me; the coordinator has stated that push was wrong and asked that the reversal be attributed to them. I accepted the argument without testing it, so the failure to challenge it is mine.

**Boss's basis, and the evidence supports it:** the Rapid Logo Tee was a test run — created only to prove we could add and order a product, never intended as retail, now DRAFT and parked on open Apliiq design questions. The **Signature Hoodie is $128.00 uniformly across all 9 variants** — deliberate retail pricing. The Tee is $13.34–$16.34 varying by size, the Apliiq cost-table shape. **The real product is priced correctly; the disposable one is not.** The argument I ran with — that the Apliiq→Shopify price path is unguarded and the next 5–10 products would arrive mispriced — does not survive that. One mispriced sample, and it is the sample built to be thrown away, is not a pattern.

**Why this is the most instructive entry in the R-series.** R-1, R-2 and R-3 were all grading a **defect** on thin evidence: an empty array, a customer name, a negative counter. R-4 is grading a **risk** on thin evidence — one anomalous price treated as a systemic intake failure. **No tool misled us this time. We reasoned past the evidence on our own**, which is the harder version to catch, because there is no artifact to go back and re-read. My R-3 lesson needs extending: absence, zero and negative are not findings until the authoritative record says so — **and neither is a single data point a pattern.** Before grading a systemic risk I must be able to name more than one instance of it.

**What survives, and it is small:** a price sanity check when a catalogue item is added. Folded into **AC-CAT-4** per-item readiness. Not a blocker, not its own requirement group. Sections 4 and 15.4 are superseded; original text retained for trace.

---

## 0b. REVISION 3 — re-derivation against the Boss architectural directive (2026-09-18)

**Directive:** "Shopify is the authoritative engine; we are just a frontend." Shopify owns commerce logic, inventory, fulfilment, tax, payment gateways, POD customization, governance and security. The app is a Next.js frontend that connects to Shopify and its embedded apps. Anything Shopify does not do, we custom-engineer — nothing of that kind identified yet. Known deviation: Shopify offers many sizes, we want S/M/L, plus possibly a few more curation choices of that shape.

**Environment rule (governing):** Staging supports a full end-to-end happy path, independent of production, **TEST payments only, and MUST NOT dispatch**. Production uses real payments and real dispatch.

**Verified store state after Boss's executed decisions:** exactly 2 products. Signature Hoodie ACTIVE, 9 variants, $128, totalInventory 0. Rapid Logo Tee DRAFT (parked on Apliiq design questions), 6 variants, cost-basis prices, one variant still -1. Both demo snowboards permanently DELETED.

### 0b.1 The governing test I am now applying to my own criteria

For each criterion: **does it tell our frontend what to do, or does it tell Shopify what to be?** If the latter, it is not an app acceptance criterion. It is either a Shopify *configuration* requirement (still needed, different artifact, different owner) or it is nothing at all.

And the sharper risk the directive exposes, which I had not stated anywhere: **any criterion where our frontend asserts a commerce fact independently is a divergence risk.** If we compute, cache, infer, or hard-code something Shopify owns, we will eventually contradict the authority. Several of my criteria were drifting that way. That makes this re-derivation a correction, not just a trim.

### 0b.2 RETIRED — Shopify owns these; re-specifying them is duplicated work and a divergence risk

- **AC-INV-1, -2, -4, -6, -7 (POD inventory semantics)** → RETIRED as app criteria. "Inventory tracking off / continue-selling on / classify fulfilment mode / fix the -1" are Shopify product configuration. We do not implement them; we do not validate them in our code. **Reclassified as Shopify configuration requirements (see 0b.5).** The -1 on the Tee is a Shopify data-fix, not an engineering task.
- **AC-TAX-3, -4, -5 (tax configuration, jurisdictions, exemption basis, product tax class)** → RETIRED as app criteria. Shopify's tax engine owns all of it. I was specifying a tax system we are not building.
- **AC-FUL-2 (fulfilment record completeness: carrier, tracking, timestamp)** → RETIRED as an app criterion. Shopify and the fulfilment app produce that record. We consume it.
- **AC-PRICE-1, -3, -6, -7 (cost/retail boundary, price > cost, fingerprint invalidation, attributed writes)** → RETIRED as app criteria. Price lives in Shopify; the cost/retail boundary is an Apliiq-app concern. Our frontend renders the price Shopify returns and must never adjust it.
- **AC-CAP-1..3 as *gates we implement*** → RETIRED in that form. There is a jump from our frontend to Shopify's payment gateway; we do not hold a capture gate. **Survives only as the non-assertion rule in 0b.3.**
- **AC-DEMO-1..5 / O-4 entirely** → **SATISFIED AND CLOSED.** Boss permanently deleted both snowboards; store is exactly 2 products. See 0b.6 for the fixture consequence.
- **The whole release-record/fingerprint apparatus this item leaned on** → I am flagging, not retiring (not my call): if Shopify is authoritative, the elaborate observation/fingerprint/release-record machinery in PRD.md is re-specifying Shopify's own state. That tension is Aarti's and Boss's to resolve in an ADR; I note only that CP-COM-001 no longer depends on it.

### 0b.3 SURVIVES — genuinely ours

The coordinator's read was "thin, mostly presentational plus curation." **That read is correct in shape but understates one category.** Ours is: curation, presentation, non-assertion, and environment separation.

**(A) Curation — the real deviation.** S/M/L out of 9 variants. ACTIVE vs DRAFT product selection. Any future "Shopify offers many, we want few" choice. This is genuinely ours because Shopify has no opinion about which of its options our brand sells. Fully specified in section 11.

**(B) Presentation of Shopify state.** Survives essentially unchanged and is the bulk of what is left: AC-FUL-1, -3, -4, -5, -6 (never show shipped without a fulfilment record; array beats status; degrade truthfully; no constructed tracking URLs; entitlements gate on delivery). AC-INV-3 and **AC-INV-5** (never render `totalInventory 0` as sold out for made-to-order; **no scarcity copy — "only N left" is ours to not write**). AC-TAX-2 ("$0.00 tax" must be distinguishable from "not calculated"). AC-REF-1..4. All of these are rules about *our rendering*, and Shopify does not own them.

**(C) Non-assertion — new, and the directive's sharpest consequence.** I am adding this as its own group because it is the discipline the directive actually demands:
- **AC-AUTH-1** The frontend MUST NOT compute, estimate, derive, or hard-code any value Shopify owns: price, tax, availability, inventory, fulfilment state, refund state, order totals.
- **AC-AUTH-2** Where Shopify returns no value, the frontend MUST render absence truthfully. It MUST NOT substitute a default, a zero, or a last-known value.
- **AC-AUTH-3** Where the frontend and Shopify disagree, **Shopify wins and the frontend surfaces the disagreement** rather than silently reconciling.
- **AC-AUTH-4** No commerce fact may be cached past its read without a freshness rule that fails closed.
- **AC-AUTH-5** A `test: true` order MUST NOT be presented as, or counted as, a real order. *(This is all that survives of AC-CAP.)*
- E-AUTH-1 Shopify field missing → render absence, never 0. E-AUTH-2 Shopify unreachable → fail closed, no stale commerce facts. E-AUTH-3 Shopify returns a price differing from the rendered one → Shopify wins, customer told. E-AUTH-4 frontend-only "sold out" badge derived from inventory → prohibited outright.

**(D) Environment separation.** Staging must use only staging Shopify credentials, never fall back to production. This survives and is strengthened by the environment rule.

### 0b.4 WEAKENS OR DISSOLVES under the directive

- **O-3 pricing (Tee cost-basis) — DEFERRED, not fixed.** See section 12; the Tee is DRAFT.
- **O-7 live-gateway capture** — survives as a *production* question only. Staging is test-payments-only **by rule now**, so "staging cannot prove live capture" stops being a finding and becomes the intended design. Re-graded P1 → **not a defect at all**; it is simply production-only verification, inside tabled H-002.
- **X-2 (PRD "no order submission")** — effectively dissolved. The environment rule now explicitly blesses a full end-to-end staging happy path on test payments. My D-1 recommendation (amend the PRD to permit test-gateway orders) is now **confirmed by Boss directive rather than merely proposed.** D-1 closes.
- **X-3 ("unchanged inventory" as a staging criterion)** — dissolved. A full end-to-end staging flow necessarily moves inventory. The PRD criterion is simply obsolete.

### 0b.5 Shopify configuration requirements (NOT app criteria — different artifact, Boss/Aarti owned)

Retired criteria do not vanish; they change owner. Recorded here so nothing is lost:
- SC-1 Hoodie and Tee: inventory tracking off or continue-selling on (made-to-order). **ALREADY SATISFIED (R-3)** — verified untracked with CONTINUE.
- ~~SC-2 Tee variant `APQ-6083483S7A1` corrected from -1.~~ **WITHDRAWN per R-3** — nothing to correct; the counter is inert on an untracked item.
- SC-3 Tax collection configured for all accepted jurisdictions; apparel tax class set per product.
- SC-4 Apliiq cost values never written to Shopify price fields.
- SC-5 Staging store's fulfilment path incapable of dispatch (see section 13).

### 0b.6 Replacement for the lost U-DEMO-1 fixture

Boss deleted both snowboards without first running U-DEMO-1, so the vendor-allowlist guard lost its only fixture. **It should not get a real one back** — keeping junk in a live store to test a guard is the wrong trade. Replacement:
- **U-DEMO-1R (replaces U-DEMO-1):** a **synthetic fixture** product with a non-allowlisted vendor, in the repo's test fixtures, asserted against the catalog-eligibility path in an automated test. No store data required, runs every CI run instead of once, and cannot be deleted out from under the test.
- **U-DEMO-2R:** an assertion that the live store contains only allowlisted vendors — a *monitor*, not a fixture. Currently passes: 2 products, both Apliiq.
- The guard itself is untested as of now. Until U-DEMO-1R exists, vendor-allowlist enforcement is **UNVERIFIED** — I am recording that rather than treating the deletion as having closed it.

---

## 1. Live-state reconciliation — what the data settled

### 1.1 CLOSED (verified against live data, no further discovery needed)

- **C-1 Store exists and is the correct dedicated Staging development store.** `carlophillips-staging.myshopify.com`, Basic App Development plan, USD. Satisfies the PRD "Shopify-mimic Staging digital QA boundary" requirement that Staging use its own development store. H-003's "store state UNVERIFIED" condition is discharged for store identity, product set, and order set as of 2026-09-18.
- **C-2 Signature Hoodie exists, is ACTIVE, is USD 128.00.** Matches PRD "S/M/L at USD 128" on price and currency.
- **C-6 Both products are correctly configured for print-on-demand** (verified 2026-09-18, R-3): `tracksInventory: false`, `inventoryPolicy: CONTINUE`, `inventoryItem.tracked: false`, `availableForSale: true` on every variant. `totalInventory: 0` and the Tee's `-1` are inert. CLOSED and positive.
- **C-3 A second product exists in the same store (Rapid Logo Tee, ACTIVE, Apliiq vendor, 6 variants),** so the catalog is not single-product. The PRD assumption that the Hoodie is the only live commerce candidate is superseded.
- ~~**C-4 Checkout, payment, and order capture work end-to-end.**~~ **RETRACTED — see R-2. REOPENED as O-7.** #1005 is `test: true` on gateway "bogus". Order capture, fulfillment creation, and USPS tracking are demonstrated through the **test** gateway only. Under the PRD's own rule this is `evidence_only`, never operational readiness. Live-gateway payment capture is UNPROVEN.
- **C-5 Refund path executes** — DOWNGRADED. Orders #1001–#1004 are REFUNDED, but they sit in the same test store and are presumed test-gateway too (not separately verified). Treat as `evidence_only`.

### 1.2 INVALIDATED ASSUMPTIONS (previously written or implied, now contradicted by live data)

- **X-1 "Hoodie is S/M/L only."** PRD asserts the Signature Hoodie "remains scoped to S/M/L". Live data shows **9 variants**. Any acceptance test, resolver coverage proof, or variant fingerprint built on a 3-variant assumption is invalid. Requires PRD correction (proposed, see PROPOSALS entry).
- **X-2 "Staging never submits an order."** SUBSTANTIALLY WEAKENED by R-2, but not withdrawn. PRD lines 42 and 55 say QA "must not enter payment, **submit an order** or retain a private checkout URL" — unqualified, with no test-order carve-out. An order was submitted, so the text is still contradicted on its face. But the *harm* premise is gone entirely: no real customer, no real charge, test gateway. This is now a documentation/authorization tidy-up (does the PRD intend to permit test-gateway orders?), **not** a blocking integrity failure. Re-graded P3. See D-1 as revised.
- **X-3 "Inventory unchanged" as a Staging pass criterion.** STANDS, unaffected by both retractions. PRD requires proof of "unchanged inventory." Inventory has changed and one variant is at -1. A *test* order still decremented real inventory — which is itself part of the POD misconfiguration in O-2. The criterion is not testable in this store as written.
- **X-4 "Store contents are POD-only / brand-only."** Two Shopify demo snowboard products persist. Any catalog-count, `/shop` eligibility, or "12-product observation" reasoning that assumed a clean product set is unverified.
- **X-5 "Single canonical price per product."** Rapid Logo Tee prices are split across variants ($13.34/$14.34/$15.34) with no approved rationale. Commerce-facts fingerprinting assumed a coherent price per reviewed product.

### 1.3 OPEN (defined here, not yet satisfied)

O-2 POD inventory semantics · O-3 pricing correctness · O-4 demo-data removal · O-5 tax · O-6 refund correctness · **O-7 live-gateway payment capture (reopened from C-4 per R-2)**. O-1/D-FUL-001 fulfillment integrity is retracted per R-1 and survives only as a requirements standard, not as an open defect.

---

## 2. ~~DEFECT D-FUL-001~~ → RETRACTED. Retained as fulfillment/tracking **presentation** requirements.

> **Revision 3 scope cut:** AC-FUL-2 retired to Shopify (0b.2). AC-FUL-1/3/4/5/6 survive as presentation rules (0b.3B).

> **D-FUL-001 IS INVALID AND WITHDRAWN (see R-1).** Order #1005 carries fulfillment `gid://shopify/Fulfillment/4468221083854`, status SUCCESS, USPS, tracking 9400150899563505738795, working URL. The empty array was an artifact of the `get-order` MCP tool, which does not populate that field. No defect, no customer impact, no remediation required. My P1 grading was wrong.

**What this section is now:** the acceptance standard for shipped-order truth. #1005 is the worked example that **meets** it, through the test gateway. Status: requirements APPROVED-PENDING-BOSS, evidence `evidence_only` (test gateway, per O-7).

### Story
As a customer whose order is marked shipped, I need a carrier and a trackable reference, so that "shipped" means something I can verify.

### Acceptance criteria — AC-FUL
- **AC-FUL-1** An order MUST NOT present a fulfilled/shipped state to any customer surface unless at least one fulfillment record exists for it.
- **AC-FUL-2** A fulfillment record is complete only when it carries: (a) the fulfilled line items, (b) a carrier/company identifier, (c) a tracking number or an explicit approved "no tracking available" reason code, and (d) a fulfillment timestamp.
- **AC-FUL-3** When `fulfillmentStatus` and the `fulfillments` array disagree, the **fulfillments array is authoritative** for customer presentation. Status alone is never sufficient.
- **AC-FUL-4** An order in the AC-FUL-3 disagreement condition MUST be surfaced to support/ops as a reconciliation exception with the order's opaque identity — it must not be silently normalized, silently hidden, or silently downgraded to "processing" without an exception record.
- **AC-FUL-5** The customer-facing copy for an unevidenced fulfillment MUST degrade to a truthful non-committal state (e.g. "preparing your order") and MUST NOT display a tracking control, a carrier name, or a delivery estimate.
- **AC-FUL-6** Delivery-gated entitlements (per PRD: review eligibility) MUST NOT unlock from `fulfillmentStatus` alone. They require a delivery confirmation traceable to a fulfillment record.
- ~~**AC-FUL-7** Order #1005 must be remediated.~~ **WITHDRAWN per R-1** — #1005 already satisfies AC-FUL-1 through AC-FUL-4. Nothing to remediate.
- **AC-FUL-8** (replaces AC-FUL-7) Fulfillment/tracking behavior MUST be re-verified on a **live-gateway** order before it counts as operational. Test-gateway evidence is `evidence_only` per PRD. This verification is inside the tabled H-002 scope and is NOT dispatched here.

### Edge and negative cases — E-FUL
- E-FUL-1 Partial fulfillment: 2 of 3 line items fulfilled. Expect per-line-item truth, no order-level "shipped".
- E-FUL-2 Multiple fulfillments across carriers on one order. Expect all shown, none collapsed.
- E-FUL-3 Fulfillment exists but `trackingInfo` is empty. Expect "shipped, tracking pending", no fake link.
- E-FUL-4 Fulfillment exists with a tracking number but no carrier. Expect no constructed tracking URL — an unattributed number must not be linked out.
- E-FUL-5 Tracking URL points to a non-allowlisted host. Expect the link suppressed, number shown as text.
- E-FUL-6 Fulfillment cancelled after creation. Expect revert to pre-shipped truth plus an exception record; expect no silent re-show of stale tracking.
- E-FUL-7 Order REFUNDED and UNFULFILLED simultaneously (this is orders #1001–#1004). Expect no shipping language at all on those orders.
- E-FUL-8 Fulfilled quantity exceeds ordered quantity. Expect reconciliation exception, fail closed.
- E-FUL-9 Fulfillment timestamp earlier than order creation. Expect rejection as invalid, not display.
- E-FUL-10 `fulfillments` array present but every entry has zero line items. Treat as the AC-FUL-3 disagreement condition.

### UAT — U-FUL
- U-FUL-1 **REWRITTEN per R-1.** Open order #1005 on the customer order-status surface. PASS = shipped state shown with USPS and tracking 9400150899563505738795 via an allowlisted link. FAIL = missing/absent tracking, or a constructed link to a non-allowlisted host. (The prior version of this test asserted the opposite and was based on the retracted defect.)
- U-FUL-2 Simulate the AC-FUL-3 disagreement condition on a scratch order; confirm the array wins and an ops exception is raised.
- U-FUL-3 Confirm review eligibility is gated on **delivery**, not on `fulfillmentStatus` — #1005 is shipped, not confirmed delivered, so review must stay locked.
- U-FUL-4 Confirm no customer-facing surface treats a `test: true` order as a real order for entitlements, credit, or reviews.
- Evidence: sanitized screenshots + the order-status API response with the order identity redacted to an opaque reference. No customer PII, no private order-status URL, in any evidence artifact (PRD constraint).

---

## 3. POD inventory semantics — O-2

> **RETRACTED IN FULL — see R-3.** Both products are correctly configured for POD; the counts below are inert. Only AC-INV-5 (no scarcity copy) survives. Original text retained for trace.

**Observed:** Both Apliiq (made-to-order) products report `totalInventory 0`; Rapid Logo Tee variant black/m (SKU `APQ-6083483S7A1`) reports `inventoryQuantity = -1`. Note the decrement came from a **test** order (#1005) — a test-gateway order still moved real inventory, which is itself part of the misconfiguration.

**Product judgment:** This IS wrong. Negative inventory on a made-to-order item is not a stock fact — it is the signature of Shopify inventory tracking being enabled on items that have no stock to track. One unit moved against a zero balance (order #1005, test gateway) and the count went negative.

**Product risk:** `totalInventory 0` on an ACTIVE POD product can render the product as sold out / unavailable, suppressing a sellable item. CP's release gates test "current availability" — an availability signal derived from a meaningless inventory number will make wrong release and cart decisions.

### Acceptance criteria — AC-INV
- **AC-INV-1** Products fulfilled by an approved POD provider MUST be classified as made-to-order. Availability for a made-to-order variant is derived from **provider manufacturability**, never from a Shopify inventory quantity.
- **AC-INV-2** For made-to-order variants, inventory tracking MUST be off, or continue-selling MUST be on. A made-to-order variant MUST NOT become unpurchasable because of an inventory count.
- **AC-INV-3** `totalInventory 0` on a made-to-order product MUST NOT be presented as "sold out" and MUST NOT withhold the product from `/shop`, home featured, or catalog counts.
- **AC-INV-4** A negative inventory quantity is ALWAYS a configuration defect. It MUST raise an ops exception and MUST NOT be shown to a customer in any form, including "0 left" or "low stock".
- **AC-INV-5** Stock-scarcity messaging ("only N left", "low stock", "selling fast") is PROHIBITED on made-to-order products. There is no scarcity to report and claiming one is untruthful.
- **AC-INV-6** Every product MUST carry an explicit fulfillment-mode classification (made-to-order vs stocked). An unclassified product fails closed — it is withheld from release, not guessed.
- **AC-INV-7** `APQ-6083483S7A1` must be corrected to a non-negative state as part of remediation.

### Edge and negative cases — E-INV
- E-INV-1 Mixed cart: one stocked item + one made-to-order item. Expect per-line availability rules, no cart-wide collapse.
- E-INV-2 Made-to-order variant with tracking on and quantity 0, continue-selling off. Expect it to be flagged, not silently unavailable.
- E-INV-3 Inventory goes further negative (-2, -5). Expect no customer-visible change; escalating ops exception.
- E-INV-4 Provider reports the blank/SKU discontinued while Shopify still shows purchasable. Expect provider truth to win and the variant to be withheld.
- E-INV-5 Quantity 1–5 cart bound (PRD) against a made-to-order item with zero inventory. Expect all of 1–5 to be addable.
- E-INV-6 A future genuinely stocked product with real inventory 0. Expect a truthful sold-out state — AC-INV-3 must not leak into stocked goods.
- E-INV-7 Inventory tracking flipped on mid-session. Expect a fresh read to govern; no stale sellability cached past the resolver's freshness window.

### UAT — U-INV
- U-INV-1 Add Rapid Logo Tee black/m (the negative-inventory variant) to bag at qty 1 and qty 5. PASS = both succeed, no scarcity copy, no sold-out state.
- U-INV-2 Confirm both Apliiq products appear in `/shop` and catalog counts despite `totalInventory 0`.
- U-INV-3 Confirm no customer surface anywhere renders a negative or numeric stock figure for a POD item.

---

## 4. Pricing correctness — O-3

**Observed:** Rapid Logo Tee variant prices are $14.34 (s/m/l), $13.34 (xl), $15.34 (xxl), next to the Signature Hoodie at $128.00. All from vendor Apliiq.

**Product judgment:** These are almost certainly Apliiq **cost/wholesale** figures, not CARLOPHILLIPS retail. Two independent tells: (1) the odd `.34` cents pattern, which is a cost-derived number, not a chosen retail price point; (2) XL is *cheaper* than S/M/L, which inverts normal retail sizing and matches a cost table where size upcharges landed on the wrong rows. A premium brand whose hoodie is $128 does not sell a tee at $13.34. Order #1005 captured $13.34 as the unit price — but on the **test** gateway, so **no one was actually charged and there is no revenue consequence yet** (corrected per R-2; an earlier version of this paragraph claimed a real customer had been charged). What #1005 does show is that the cost-basis price flows all the way through to order capture unchallenged, so the first live-gateway sale would lock in the loss.

**Severity: RE-GRADED P1 → P2 (per R-2).** The concern itself stands unchanged — the `.34` cents pattern and XL priced below L both still read as an Apliiq cost table. What changes is urgency: **no real customer was ever charged.** #1005 was the test gateway, so there is no revenue loss and no refund owed. This is a latent defect on an ACTIVE product that WOULD cause real loss on the first live-gateway sale, not an incident in progress. Still must be fixed before live selling; no longer an emergency.

### Acceptance criteria — AC-PRICE
- **AC-PRICE-1** Provider cost/wholesale values MUST NEVER be written to a Shopify customer-facing price field. Cost and retail are separate fields with a one-way boundary.
- **AC-PRICE-2** Every ACTIVE product's retail price MUST be an explicitly approved figure recorded against its release record. A price that no approval record covers fails closed and blocks release.
- **AC-PRICE-3** Retail price MUST be strictly greater than recorded provider cost for the same variant. A price at or below cost is rejected, not published.
- **AC-PRICE-4** Variant price differences within one product MUST be justified by an approved size/option upcharge rule. Unexplained per-variant price divergence is a defect.
- **AC-PRICE-5** Size upcharges MUST be monotonic non-decreasing across the approved size ladder (S ≤ M ≤ L ≤ XL ≤ XXL). XL priced below L is invalid by construction — this alone would have caught the live state.
- **AC-PRICE-6** A price change on an ACTIVE product MUST invalidate the commerce-facts fingerprint and require re-review before the product remains customer-visible (this is already PRD behavior; it is restated because live data shows prices arriving from a sync path rather than an approval path).
- **AC-PRICE-7** Any automated price write MUST be attributable to a named source and a Product Owner approval. An unattributed price write is rejected.

### Edge and negative cases — E-PRICE
- E-PRICE-1 Price 0 or null. Expect product withheld, never "free".
- E-PRICE-2 compareAtPrice ≤ price. Expect no fake discount rendered.
- E-PRICE-3 Currency other than USD on a variant. Expect withheld, no conversion invented.
- E-PRICE-4 Price changes between PDP render and cart add. Expect the cart to reflect fresh Shopify truth and the customer to be told, never a silent swap.
- E-PRICE-5 Price changes between cart and checkout. Expect checkout truth to win with disclosure.
- E-PRICE-6 Provider raises cost above current retail. Expect an ops exception; do NOT auto-raise the customer price.
- E-PRICE-7 Two variants with identical options but different prices. Expect rejection as ambiguous.
- E-PRICE-8 A historical order priced at the old/cost figure. Expect the order to retain its captured price — orders are immutable records; correcting the catalog must not rewrite order #1005's $13.34.
- E-PRICE-9 A `test: true` order MUST NOT be counted in revenue, AOV, or any pricing-performance figure. All five current orders are test or refunded; reported revenue for this store is $0.

### UAT — U-PRICE
- U-PRICE-1 Audit all 6 Rapid Logo Tee variants against approved retail. PASS = every price matches an approval record and the ladder is monotonic.
- U-PRICE-2 Attempt to publish a variant priced below recorded cost. PASS = blocked with a reason code.
- U-PRICE-3 Confirm order #1005 still displays $13.34 after any catalog correction.

---

## 5. Demo-data removal — O-4 — **CLOSED 2026-09-18**

> Both snowboards permanently deleted by Boss; store is exactly 2 products, both Apliiq-vendor. AC-DEMO-1..5 satisfied. Fixture consequence and replacement at 0b.6. Original text retained below for trace.

**Observed:** "The Archived Snowboard" (ARCHIVED, $629.95, inv 50) and "The Draft Snowboard" (DRAFT, $2629.95, inv 20), vendor "Snowboard Vendor" — leftover Shopify sample data, in a store that is wired to ACTIVE products and has processed orders through to fulfilment (test gateway).

**Product judgment:** Wrong, and worth fixing, but **P2**, not P1. ARCHIVED and DRAFT products are not customer-visible through normal storefront paths, so there is no live customer exposure. The real harm is to evidence integrity: every product count, catalog decision, `/shop` withheld-count, and inventory total in this store is contaminated by 70 units of fictional snowboard stock and a foreign vendor name. Any gate that cites a product count from this store is citing a polluted number.

### Acceptance criteria — AC-DEMO
- **AC-DEMO-1** A store carrying ACTIVE, customer-facing products MUST contain no sample/demo catalog data. (Earlier wording conditioned this on "has processed a real customer order" — that premise was retracted per R-2, and the rule is better stated without it: demo data is unacceptable alongside live catalogue regardless of order history.)
- **AC-DEMO-2** Both snowboard products MUST be deleted (not merely archived — ARCHIVED is how one of them already hides while still polluting counts).
- **AC-DEMO-3** Every product in the store MUST have an approved vendor from the approved-provider list. "Snowboard Vendor" is not one.
- **AC-DEMO-4** Product counts, catalog decisions, and inventory totals used as gate evidence MUST be recomputed after removal; any prior count is superseded.
- **AC-DEMO-5** No demo product may ever satisfy a release, media, or catalog-eligibility check, regardless of status.

### Edge and negative cases — E-DEMO
- E-DEMO-1 An ARCHIVED demo product still returned by a catalog query. Expect exclusion from counts and from withheld-counts alike.
- E-DEMO-2 A DRAFT demo product surfacing under `NEXT_PUBLIC_PREVIEW_DRAFT_PRODUCTS=true`. Expect it excluded by vendor allowlist, not by luck of status. **This is a live exposure path** — draft preview is exactly the mode that would render The Draft Snowboard at $2,629.95.
- E-DEMO-3 Deletion attempted on a product with order history. Expect the deletion blocked and escalated (neither snowboard has order history; the guard must still exist).
- E-DEMO-4 Demo data reappears after a store reset/reinstall. Expect a recurring check, not a one-time cleanup.

### UAT — U-DEMO
- U-DEMO-1 Enable draft preview; confirm no snowboard renders anywhere. (Run this BEFORE deletion — it tests the guard, not the cleanup.)
- U-DEMO-2 After deletion, confirm product count is exactly 2 and both are Apliiq-vendor.

---

## 6. Tax — O-5 — **MOSTLY RETIRED to Shopify (0b.2)**

> Survives as AC-TAX-1 (never compute tax ourselves) and AC-TAX-2 (distinguish $0.00 from not-calculated). AC-TAX-3/4/5 → SC-3. E-TAX-1 remains worth running as a Shopify-config check.

**Observed:** Order #1005 shipped to 20 Heather Ln, Colonia NJ 07067, subtotal $13.34, **tax $0.00**, total $19.30.

**Product judgment:** Open, and I am NOT calling it a defect. New Jersey exempts most clothing from sales tax, so $0.00 tax on an apparel shipment to NJ is plausibly correct. But I cannot confirm from the data whether it is correct-by-exemption or correct-by-accident (tax collection simply not configured). Those look identical on this order and diverge immediately on a non-exempt product or a non-exempt state. Needs a positive-control test, not a judgment call.

### Acceptance criteria — AC-TAX
- **AC-TAX-1** Tax MUST be calculated by Shopify's tax engine. CP MUST NOT compute, estimate, or display a tax figure it did not receive from Shopify.
- **AC-TAX-2** A $0.00 tax line MUST be distinguishable from an absent/uncalculated tax line in the data model. Never render "$0.00 tax" when the true state is "tax not calculated".
- **AC-TAX-3** Tax collection MUST be configured for every jurisdiction the store accepts orders from before that store processes customer orders.
- **AC-TAX-4** Where a $0.00 tax results from a product exemption, the exemption basis MUST be recorded against the order.
- **AC-TAX-5** Product tax classification (apparel vs non-apparel) MUST be set per product, not defaulted.

### Edge and negative cases — E-TAX
- E-TAX-1 **Positive control:** an order to a state that taxes clothing (e.g. PA on certain items, or any non-exempt category). Expect non-zero tax. If this also returns $0.00, AC-TAX-3 has failed and NJ's zero was accidental. This is the decisive test.
- E-TAX-2 NJ shipment of a non-apparel item (if catalog expands). Expect non-zero tax.
- E-TAX-3 Tax engine unavailable at checkout. Expect fail-closed, not a $0.00 default.
- E-TAX-4 Refund of a taxed order. Expect proportional tax refund.
- E-TAX-5 International destination. Expect duties/tax handling stated, not silently zero.

### UAT — U-TAX
- U-TAX-1 Run E-TAX-1 in Staging. PASS = non-zero tax returned. FAIL (any $0.00) = escalate as a P1 revenue/compliance defect.
- U-TAX-2 Confirm the order surface distinguishes "no tax due" from "tax not calculated".

---

## 6b. Live-gateway payment capture — O-7 (REOPENED from C-4)

Reopened per R-2. Order capture, fulfillment, and tracking are proven on the **test** gateway only.

- **AC-CAP-1** Payment-capture readiness MUST be evidenced by a live-gateway transaction. A `test: true` order or a "bogus"-gateway transaction returns `evidence_only` and MUST NEVER satisfy an operational capture gate (PRD, cart-activation clause).
- **AC-CAP-2** Every order record MUST carry its `test` flag and gateway through to any surface that reasons about it. A test order MUST NOT count toward revenue, entitlements, CP Credit, review eligibility, or release evidence.
- **AC-CAP-3** No release, gate, or closure claim may cite an order as proof of commerce readiness without stating its `test` flag and gateway.
- E-CAP-1 Mixed test and live orders in one store → all reporting must segregate them. E-CAP-2 Test order refunded → no real refund expected; must not appear in financial reconciliation. E-CAP-3 Store still has the test gateway enabled when live selling begins → must fail closed.
- U-CAP-1 Confirm all 5 current orders are flagged test/refunded and store revenue reports $0.
- **Execution of a live-gateway order is inside tabled H-002 and is NOT dispatched by this item.** Only the standard is defined.

## 7. Refund correctness — O-6

Four of five orders are REFUNDED + UNFULFILLED. Execution is proven (C-5); correctness is not.

- **AC-REF-1** A refunded order MUST present as refunded on every customer surface, with refunded amount and date.
- **AC-REF-2** A refunded, never-fulfilled order MUST NOT display shipping, tracking, or delivery language (see E-FUL-7).
- **AC-REF-3** A refund MUST NOT unlock delivery-gated entitlements (review eligibility, CP Credit).
- **AC-REF-4** Partial refund MUST be distinguishable from full refund.
- E-REF-1 Refund exceeding order total → reject. E-REF-2 Refund on a fulfilled order (#1005 shape) → expect return/RMA flow, not a bare refund. E-REF-3 Duplicate refund webhook → idempotent, single customer-visible refund.

---

## 8. Priority grading (Pushpa's independent grading)

| ID | Item | Grade | Basis |
|----|------|-------|-------|
| ~~D-FUL-001~~ | ~~Fulfilled order, empty fulfillments~~ | **RETRACTED** | Invalid — MCP tool artifact, not a store property (R-1) |
| O-7 | Live-gateway payment capture unproven | **P1** | Reopened from C-4; all evidence is test-gateway `evidence_only` (R-2) |
| ~~O-3~~ | ~~Cost-basis pricing~~ | **WITHDRAWN** | Boss override (R-4): Hoodie correctly priced; Tee is a parked test artifact |
| ~~O-2~~ | ~~Negative inventory / POD tracking misconfig~~ | **RETRACTED** | Not a defect — untracked + CONTINUE + availableForSale true (R-3) |
| O-5 | NJ zero tax | **P1 if E-TAX-1 fails, else P3** | Undetermined until positive control runs |
| O-6 | Refund presentation correctness | **P2** | Execution works; presentation unverified |
| O-4 | Demo snowboard data | **P2** | No live customer exposure; pollutes all count evidence; E-DEMO-2 is the one real exposure path |
| X-1 | PRD says 3 variants, store has 9 | **P2** | Documentation-vs-live drift; invalidates variant-coverage proofs |
| X-2 | PRD "no order submission" vs a test order | **DISSOLVED** | Environment rule blesses test-payment staging orders (Rev 3) |
| O-4 | Demo snowboard data | **CLOSED** | Both deleted by Boss 2026-09-18; guard now untested (0b.6) |
| Q-1 | USPS tracking on a staging test order | **P1 pending triage** | May indicate a real dispatch from staging (section 13) |
| AC-CUR | Hoodie 9 variants vs S/M/L, enforced only in frontend | **P1** | Frontend hiding does not prevent purchase of an unsold size |
| O-7 | Live-gateway capture | **NOT A DEFECT** | Staging is test-only by rule; production-only, inside tabled H-002 |

---

## 9. Boss decisions required

- **D-1 — NO LONGER BLOCKING, and I say that plainly.** It does not fully dissolve, but it collapses from an integrity crisis to a wording question. The harm premise is gone: test gateway, no money moved, store owner's own account. What remains is only that PRD lines 42/55 say QA "must not... submit an order" with no test-order carve-out, while a test-gateway order exists. **Recommendation: amend the PRD to permit test-gateway orders explicitly** (they are the normal way to exercise a POD path safely) rather than treat this as a violation. Low priority, P3. I can sign off staging acceptance without waiting on this. Caveat retained from state/BLOCKERS.md H-002: the verified store is the STAGING store; production store state is unread and nothing here asserts otherwise.
- ~~**D-2:** Remediation of order #1005.~~ **WITHDRAWN per R-1** — there is no defect to remediate. #1005 has a valid USPS fulfillment with tracking.
- ~~**D-3:** Approved retail price for the Rapid Logo Tee.~~ **DEFERRED per section 12** — Tee is DRAFT and parked on Apliiq design questions; pricing it now would be deciding it twice. Re-raise on reactivation.
- ~~**D-4:** Authorization to delete the two demo products.~~ **CLOSED** — executed by Boss 2026-09-18.
- **D-7 (new, replaces the retired D-1/D-2/D-3/D-4 set as the top item):** Q-1 — did order #1005 cause a real USPS dispatch from staging? Needs Aarti + Apliiq triage. Blocks environment-rule sign-off.
- **D-8:** Confirm the exact 6 Hoodie variants to curate out, and approve Shopify-side enforcement (AC-CUR-1) — now LB-2, launch-blocking.
- **D-9 (new, Revision 4):** Confirm what "category" means for the 5–10 target (my working definition: garment type = Shopify collection, section 16). This sets launch volume, so it is needed before catalogue work starts.
- ~~**D-10:** Accept or reject the re-grade of cost-basis pricing to LAUNCH-BLOCKING.~~ **WITHDRAWN — Boss answered in the opposite direction (R-4).** Not launch-blocking.
- **D-3 (re-scoped per R-4):** approved retail figures apply only to **genuinely new** products added under AC-CAT-4. They do not apply to the parked Tee, which needs no price until it returns from its Apliiq design questions.
- **D-5:** Whether running E-TAX-1 (a test order in Staging) is authorized, given H-002 is tabled. Without it, AC-TAX-3 stays UNKNOWN indefinitely. My read is now **stronger** after R-2: #1005 proves test-gateway orders are already the working practice in this store, so E-TAX-1 costs nothing and charges no one. Recommend authorizing it.
- **D-6 (new):** O-7 — a live-gateway order is the only thing that can prove operational payment capture, and it sits squarely inside tabled H-002. Boss should decide whether the tabling is intended to leave payment capture unproven for this cycle. I am not requesting re-entry; I am flagging that "commerce works" cannot be claimed until this happens.

## 10. Dependencies
- Aarti ADR required before any build against this item (product-fit approval is mine; technical design is not).
- Nothing here authorizes a production change, a store mutation, or a paid action.


---

## 11. CURATION — Signature Hoodie S/M/L restriction (Revision 3, the genuine deviation)

**Live state:** Hoodie is ACTIVE with **9 variants**. Boss wants **S/M/L only**. The other 6 (XS, XL, XXL, XXXL and any remaining option combinations — the exact list must be enumerated from a fresh read before implementation) are not sold.

### The enforcement question, answered directly

**Frontend filtering alone is NOT sufficient, and this is the most important point in the revision.** If the frontend merely hides XL while Shopify still has XL purchasable, then a direct cart permalink, a stale link, a crawler, a saved checkout, or Shopify's own surfaces can still put XL into a real checkout — and Shopify, as the authority, will accept the order. **We would then be contractually obliged to ship a size we do not sell.** Hiding is not restricting.

So, consistent with the directive: **the authority must enforce it.**

- **AC-CUR-1** The S/M/L restriction MUST be enforced **in Shopify** as the authoritative layer. The 6 unsold variants MUST be made genuinely unpurchasable — deleted, or unavailable such that Shopify checkout itself rejects them. Which mechanism is Aarti's ADR call; that it happens in Shopify is not optional.
- **AC-CUR-2** The frontend MUST additionally surface only the approved S/M/L set — defence in depth, **never the sole enforcement**.
- **AC-CUR-3** The approved variant set MUST be explicit and reviewable (an allowlist of approved option values), not implied by whatever Shopify happens to return. "Show everything Shopify has" is exactly what we are deviating from.
- **AC-CUR-4** A variant Shopify returns that is NOT on the allowlist MUST be withheld silently — no greyed-out size, no "unavailable" chip, no evidence the size exists. Boss's intent is that we do not sell those sizes, not that they are out of stock. Rendering them as unavailable tells a false story.
- **AC-CUR-5** An allowlisted variant that Shopify does NOT return MUST fail closed and raise an exception — that means the catalogue changed under us.
- **AC-CUR-6** The same allowlist mechanism MUST generalise to future curation choices ("Shopify offers many, we want few"), since Boss anticipates more of this shape.
- **AC-CUR-7** Curation is a **product decision recorded in this item**, never an engineering default and never inferred from Shopify state.

**Answering "hidden, unpublished, or never surfaced?" plainly: all three, in that order of authority.** Unpurchasable in Shopify (authoritative), absent from the frontend's approved set (defence in depth), and never surfaced in any form to the customer (presentation). Any one alone is insufficient; the first is the one that actually protects us.

### Edge and negative cases — E-CUR
- E-CUR-1 Direct cart permalink for XL. Expect Shopify checkout rejection, not a frontend 404 masking a live purchasable variant. **This is the decisive test of AC-CUR-1.**
- E-CUR-2 Shopify adds a 10th variant. Expect it withheld by default (allowlist, not blocklist).
- E-CUR-3 Shopify renames "M" to "Medium". Expect fail-closed mismatch + exception, not a silent drop of a sold size.
- E-CUR-4 All three approved variants unavailable. Expect a truthful product-level state, not an empty silent picker.
- E-CUR-5 A curated-out variant appears in an existing customer's order history. Expect it rendered honestly — historical orders are immutable.
- E-CUR-6 Frontend allowlist and Shopify availability disagree. Expect Shopify to win per AC-AUTH-3.
- E-CUR-7 Someone edits the allowlist to include a variant Shopify made unpurchasable. Expect fail-closed, not a broken add-to-cart.

### UAT — U-CUR
- U-CUR-1 PDP shows exactly three sizes, S/M/L. No fourth control in any state.
- U-CUR-2 Attempt direct checkout of a curated-out variant. PASS = Shopify itself refuses. FAIL = order accepted (this would be the real defect).
- U-CUR-3 Confirm no curated-out size appears in DOM, structured data, sitemap, or API responses.

---

## 12. Rapid Logo Tee pricing (D-3 / "D-005") — **DEFER**

**My answer: defer, do not decide now.** The Tee is DRAFT, parked on open Apliiq design questions, and not customer-visible. Setting a retail price now would be deciding it twice — the design questions plausibly change the blank, the decoration, and therefore the cost basis the price must clear. A price approved today would be stale before the product returns.

- **AC-TEE-1** The Tee MUST NOT return to ACTIVE until an approved retail price exists (AC-PRICE-2, -4, -5 still apply at that point).
- **AC-TEE-2** ~~The -1 inventory (SC-2) and~~ **[the -1 clause is withdrawn per R-3 — it was never a defect]** the cost-basis prices are **a parked defect, not a resolved one.** They must be cleared before reactivation. DRAFT status contains the risk; it does not remove it.
- **AC-TEE-3** Tee reactivation is a Boss product decision requiring a fresh product-fit review from me.
- **Risk if this is forgotten:** flipping DRAFT→ACTIVE is one click and would immediately expose cost-basis pricing to customers. That is the single highest-consequence latent issue in the store.

---

## 13. Environment rule reconciliation — "Staging MUST NOT dispatch"

**Conflicts found in my own prior text — declared:**
- AC-FUL-8 ("re-verify fulfilment on a live-gateway order") — **amended**: that verification is **production-only**. Staging can never satisfy it, by rule.
- My staging UAT tests assumed staging could exercise fulfilment. **Amended**: staging may exercise fulfilment *presentation* against existing/simulated data, never fulfilment *execution*.
- O-7's framing as a defect — resolved in 0b.4; staging being unable to prove live capture is the design, not a gap.

**"Does not dispatch" needs a concrete definition, because Apliiq is a real fulfiller who will really print and really ship:**
- **AC-ENV-1** No staging action may cause an Apliiq production order, a physical print, a carrier label purchase, or a shipment.
- **AC-ENV-2** The staging Shopify store MUST NOT have a dispatch-capable Apliiq connection. Either no fulfilment app, or an Apliiq sandbox/test mode confirmed by Apliiq to produce no physical output. "We won't click fulfil" is not a control.
- **AC-ENV-3** Staging fulfilment MUST be manual/simulated only, so a staging order can reach a fulfilled *state* for happy-path testing without anything physical occurring.
- **AC-ENV-4** Staging MUST accept test payments only; a live gateway on staging is a defect.
- **AC-ENV-5** Staging MUST NOT hold production Shopify or Apliiq credentials, and MUST fail closed rather than fall back.
- **AC-ENV-6** Production is the only environment for real payments and real dispatch.

**Q-1 — ANSWERED 2026-09-18 (supersedes the open question below).** Order #1005's fulfilment service is **"Apliiq Dropship Fulfillment"**, USPS tracking, created 2026-09-17. **Possibility (c) is what happened: staging handed a test order to a real fulfiller.** The `test: true` flag protected the *payment* and protected nothing else — Apliiq is downstream of the gateway and never saw it. Still open: whether Apliiq charged us and whether a garment was physically produced. Full launch grading at section 15.3. Original wording retained below for trace.

**~~OPEN QUESTION — Q-1~~, raised now, needs an answer before the environment rule can be called satisfied.** Order #1005 was a **staging, test-gateway** order, and it carries a fulfilment with **USPS tracking number 9400150899563505738795**. A real-looking carrier tracking number on a staging order is exactly the shape of a dispatch that should not have been possible. Three possibilities and they are not equally benign: (a) a manually entered / simulated tracking number, harmless; (b) an Apliiq sandbox artefact, harmless; (c) **a real USPS label was purchased and something physically shipped from staging** — which would mean the "staging must not dispatch" rule was already violated before it was written. I cannot distinguish these from order data alone. Aarti should determine which, with Apliiq if needed. Until then AC-ENV-1/-2 are **UNVERIFIED**, and I am not signing off the environment rule.

### Edge and negative cases — E-ENV
- E-ENV-1 Apliiq app installed on staging in production mode → defect, block.
- E-ENV-2 A staging test order auto-routes to a fulfilment provider → must be impossible, not merely unlikely.
- E-ENV-3 Staging credentials silently fall back to production → fail closed.
- E-ENV-4 A real gateway enabled on staging → defect.
- E-ENV-5 Production accidentally in test-payment mode → defect in the opposite direction; real customers not charged.

### UAT — U-ENV
- U-ENV-1 Complete the staging happy path end to end: browse → S/M/L select → cart → test checkout → paid → fulfilled state. PASS = completes with zero physical output.
- U-ENV-2 Audit staging's installed apps and fulfilment configuration for dispatch capability.
- U-ENV-3 Resolve Q-1 for order #1005.


---

## 14. ~~THE CANONICAL HAPPY PATH~~ — **CP-HP v1.0, SUPERSEDED by §17 (Revision 7)**

> **This section is a reinvention of CP-TFRD-1.0 §4 (FR-1..FR-9), which already specifies the end-to-end lifecycle and which I had not read when I wrote it.** The canonical happy path is the TFRD. Only four deltas survive, all carried in §17.2. Original text retained below for trace.

Boss posture: a working happy-path flow on staging.carlophillips.com and www.carlophillips.com, ASAP. **If we are not blocked by a P1 or showstopper, we launch.** This section is now the centre of CP-COM-001; everything else is secondary to it.

**HP-0 Preconditions (both environments):** environment-correct Shopify credentials, no production fallback (AC-ENV-5); exactly one ACTIVE, launch-ready product minimum; curation enforced per section 15.2.

| # | Step | Pass criteria (both environments unless noted) |
|---|------|-----------------------------------------------|
| **HP-1** | Browse — land on home, reach catalogue | Home renders; catalogue lists every ACTIVE launch-ready product and nothing else. No DRAFT, no curated-out item, no demo data. Counts match Shopify. Desktop + mobile, no console errors. |
| **HP-2** | Product — open PDP | Title, description, price, vendor, media all resolve from Shopify (AC-AUTH-1). Price renders exactly as Shopify returns it. No fabricated copy, no placeholder image. |
| **HP-3** | Variant select | **Exactly the curated set is offered** (S/M/L for the Hoodie). Curated-out variants absent from UI, DOM, and structured data (AC-CUR-4). Selection is keyboard-reachable. No scarcity copy; `totalInventory 0` does not render sold-out (AC-INV-3/-5). |
| **HP-4** | Cart | Shopify cart created/updated. Selected variant, qty, and current Shopify price preserved. Qty 1–5 all succeed against a made-to-order item. Cart total equals Shopify's total — never computed by us. |
| **HP-5** | Checkout handoff | Redirect to Shopify-hosted checkout on a trusted host. Cart contents carry over intact. **STAGING:** test gateway only; a live gateway here is a defect (AC-ENV-4). **PRODUCTION:** real gateway; test mode here is a defect (E-ENV-5). |
| **HP-6** | Payment | **STAGING:** test payment succeeds, `test: true`, no money moves. **PRODUCTION:** real card charged, real money captured, correct amount and currency. Tax line comes from Shopify's engine and is distinguishable from "not calculated" (AC-TAX-2). |
| **HP-7** | Order confirmation | Order created in Shopify. Customer sees a confirmation with order reference, line items, and totals matching Shopify exactly. Confirmation email sent by Shopify. **STAGING:** order flagged test and never counted as real (AC-AUTH-5). |
| **HP-8** | Fulfilment | **PRODUCTION:** order routes to Apliiq Dropship Fulfillment; garment produced and dispatched; fulfilment record created. **STAGING: MUST NOT DISPATCH.** Fulfilment state reached by manual/simulated fulfilment only, with **zero physical output and zero Apliiq production order** (AC-ENV-1/-2/-3). This is the one step that genuinely differs, and it is where the current leak sits (15.3). |
| **HP-9** | Customer-visible tracking | Shipped state shown only when a fulfilment record exists (AC-FUL-1); array beats status (AC-FUL-3); carrier + tracking number rendered, link only to an allowlisted host (E-FUL-5); no constructed URL from an unattributed number (E-FUL-4). **STAGING:** tracking is visibly simulated and must not reference a real carrier consignment. |

**U-HP-1 / U-HP-2:** execute HP-1→HP-9 end to end on staging and on production respectively, capturing sanitized evidence per step. **Neither has been run.** No happy-path evidence exists in this repo today — that is the single biggest gap between current state and launch.

---

## 15. LAUNCH GRADING (Revision 4)

Single question per item: **does this stop us launching, or does it just make us less tidy?** I am applying it honestly in both directions, including against my own work.

### 15.1 LAUNCH-BLOCKING — RE-ISSUED (Revision 6, LB-3 removed)

- **LB-1 — The happy path has never been executed (U-HP-1/U-HP-2).** We cannot launch a flow nobody has run once. Highest priority.
- **LB-2 — Curation minimum enforcement (see 15.2).** Real money + a purchasable size we don't sell = an order we owe and cannot fill.
- ~~**LB-3 — Cost-basis pricing.**~~ **WITHDRAWN per R-4 (Boss override).** Not launch-blocking, not P1. The Hoodie — the actual launch product — is correctly priced at $128.00 uniformly. The Tee is a parked test artifact. Survives only as a price sanity check inside AC-CAT-4.
- **LB-4 — Staging→Apliiq dispatch leak (see 15.3).** Blocks *staging* happy-path use, which is itself a launch deliverable.
- **LB-5 — Minimum viable catalogue (section 16).** One ACTIVE product is not the launch Boss described.
- **LB-6 — Production gateway is real and staging gateway is test.** Either inverted is a showstopper: real customers uncharged, or test orders taking real money.

### 15.2 Curation: minimum enforcement vs full requirement

**Minimum before production takes real money (LAUNCH-BLOCKING):** every curated-out Hoodie variant must be **genuinely unpurchasable in Shopify** — so a permalink, stale link, or crawler cannot create an order we owe. That is one Shopify-side action on 6 variants. Nothing else in section 11 is required to launch.

**POST-LAUNCH (full requirement, section 11):** the generalised reviewable allowlist (AC-CUR-3/-6), fail-closed drift detection (AC-CUR-5, E-CUR-3/-7), DOM/structured-data/sitemap absence (U-CUR-3). These make curation *maintainable*; they do not protect the launch. The permalink test **E-CUR-1 / U-CUR-2 is the one that must pass** before real money.

### 15.3 Apliiq dispatch leak — showstopper or operational leak?

**Confirmed:** staging dispatched a real order to Apliiq Dropship Fulfillment (#1005, USPS, 2026-09-17).

**My grading, split deliberately because a single label would mislead:**
- **For PRODUCTION launch — NOT a showstopper.** Production dispatch is *intended*. This incident is accidental evidence that Shopify→Apliiq→USPS works end to end, which is the HP-8 capability we need. It de-risks production rather than blocking it.
- **For STAGING — LAUNCH-BLOCKING (LB-4).** Boss wants a staging happy path ASAP. If staging still routes to Apliiq, **every happy-path test manufactures and ships a real garment at real cost.** We cannot run U-HP-1 even once safely. This must be fixed before staging testing resumes, not after.

**Minimum control production needs, given dispatch there is intended:**
- **AC-DIS-1** Exactly one environment may hold a dispatch-capable Apliiq connection: production. Staging must have it removed or sandboxed (AC-ENV-2). The `test` flag does not protect fulfilment — it never reaches Apliiq.
- **AC-DIS-2** Production must have a visible order→dispatch record: which orders routed to Apliiq, when, at what cost. Dispatch must never be silent.
- **AC-DIS-3** A cancellation/intervention window before a production order becomes an irreversible Apliiq print.
- **AC-DIS-4** Reconcile Apliiq charges against Shopify orders; an Apliiq order with no matching paid Shopify order is an exception.
- **Still open:** whether Apliiq charged us and whether a garment was physically produced for #1005 — chase, but it does not gate launch.

### 15.4 ~~Cost-basis pricing — P1 LAUNCH-BLOCKING~~ — **SUPERSEDED BY R-4 (Boss override)**

> The re-grade below is withdrawn. The Hoodie is uniformly $128.00 across 9 variants; the Tee is a disposable test product, DRAFT and parked. One mispriced sample is not a pattern, and AC-PRICE-LB1/-LB2/-LB3 are withdrawn as launch gates — they survive only as the AC-CAT-4 price sanity check. Original text retained for trace.

### 15.4 (superseded) Cost-basis pricing — RE-GRADED P2 → P1 LAUNCH-BLOCKING

**Superseding my own section 4 grading.** I graded it P2 on the reasoning that the Tee is DRAFT so nothing is chargeable. That reasoning fails the moment it meets the launch posture: **DRAFT→ACTIVE is one click, and that click IS the launch action.** I graded the product's state today instead of its state at launch — exactly the error of grading a latent defect by its dormancy. Worse, section 16 requires a 5–10 item catalogue, which *means* activating parked products. The condition I treated as hypothetical is the plan.

Cost-basis prices ($13.34–$15.34 against a $128 Hoodie) meeting a live gateway means **every sale loses money on contact.** A revenue-negative launch is worse than a late one — it scales the damage with success.

- **AC-PRICE-LB1 (LAUNCH-BLOCKING)** No product may be ACTIVE in production with an unapproved price. Every ACTIVE item's price is confirmed retail, not provider cost, before real payments are enabled.
- **AC-PRICE-LB2** The monotonic size ladder (AC-PRICE-5) must hold on every ACTIVE product. XL below L would have caught this.
- **AC-PRICE-LB3** Tee reactivation requires approved retail pricing — AC-TEE-1/-2 are now launch gates, not parking notes.
- **Supersedes section 12's "defer":** deferring the *price decision* while the Tee stays DRAFT remains correct; deferring it while activating the Tee for catalogue count does not. The decision is deferred only as long as the Tee is not launched.

### 15.5 POST-LAUNCH — moved down, plainly

Most of what I wrote does not block launch, and I am saying so rather than defending it:
- **AC-AUTH-1..5 non-assertion** — correctness discipline; nothing currently violates it. Post-launch.
- **AC-FUL-3/-4/-5/-6 edge handling** (status/array disagreement, exception surfacing, truthful degradation, delivery-gated entitlements) — real, rare. Post-launch.
- ~~AC-INV-2/-4, the Tee's -1~~ — **RETIRED ENTIRELY per R-3**, not merely post-launch. Not a defect at any stage.
- **AC-TAX-2..5, E-TAX-1** — NJ apparel exemption makes $0.00 plausibly correct; tax is Shopify's engine. Post-launch, with E-TAX-1 run before selling into a taxing jurisdiction.
- **AC-REF-1..4 refund presentation** — no launch-day refunds exist. Post-launch.
- **U-DEMO-1R vendor-allowlist fixture** — store is clean. Post-launch.
- **O-7 live-gateway capture as a separate proof** — subsumed by HP-6 production. Retired as a standalone item.
- **All 40 original edge/negative cases** — they define correct behaviour, not launch readiness. Post-launch, except E-CUR-1 (promoted to LB-2) and E-ENV-1/-2 (promoted to LB-4).
- **X-1 9-variant PRD drift, X-2, X-3** — documentation hygiene. Post-launch.

---

## 16. CATALOGUE READINESS (new group, Revision 4)

Boss wants **5–10 merchandise items per category** with the site up. Store today: 2 products, 1 ACTIVE. This is LB-5.

**"Category" — definition, needing Boss confirmation (D-9).** No category taxonomy exists in the store today. My working definition: a **garment type** — hoodies, tees, and whatever else the line includes — mapped to a Shopify collection, since Shopify collections are the authoritative grouping and the directive says use Shopify's constructs rather than invent our own. On that reading, current state is 2 categories (hoodie, tee) with 1 and 0 launch-ready items. Boss should confirm before items are built against it, because the definition sets the launch volume.

- **AC-CAT-1** Every category is a Shopify collection. No frontend-invented grouping.
- **AC-CAT-2 (minimum viable catalogue — LAUNCH-BLOCKING):** at least **one category with at least 5 launch-ready items**. A category with fewer is not displayed rather than shown thin — an empty-looking store reads worse than a smaller one. 5–10 is the target; 5 in one category is the floor.
- **AC-CAT-3** A category is displayed only when it meets its floor. Partial categories are withheld, not padded.
- **AC-CAT-4 (per-item readiness — every item, no exceptions):** ACTIVE status; approved **retail** price — **price sanity check (per R-4): the price must be a deliberate retail figure, not a provider cost figure. Tells: cost-table cents patterns, per-size variation that is not an approved upcharge, or a price implausible against the $128.00 Hoodie benchmark. This is the whole of what survives the pricing finding — a per-item check at intake, not a gate.**; at least one real approved product image with useful alt text — no placeholder, no fabricated render; a real description, not lorem or vendor boilerplate; variants curated to the approved set and curated-out variants unpurchasable in Shopify (15.2); vendor on the approved list; **POD inventory configured exactly as the two existing products are — `tracksInventory: false`, `inventoryPolicy: CONTINUE`, `inventoryItem.tracked: false`, yielding `availableForSale: true` (per R-3). A new item left tracked with a DENY policy and zero stock will behave differently from the Hoodie and Tee and will not be sellable.**
- **AC-CAT-5** An item failing any AC-CAT-4 element stays DRAFT. **Partial readiness is not readiness** — this is the standard that replaces adding items ad hoc.
- **AC-CAT-6** The Hoodie is the reference implementation: whatever makes it launch-ready is the template for items 2–10.
- E-CAT-1 Item ACTIVE with no image → withheld, never a broken/placeholder tile. E-CAT-2 Item ACTIVE at cost-basis price → blocked by AC-PRICE-LB1. E-CAT-3 Category drops below floor after a withdrawal → category withheld. E-CAT-4 Item in two categories → counted once per category, no double-count to reach a floor. E-CAT-5 Item ACTIVE with uncurated variants → blocked.
- U-CAT-1 Audit every ACTIVE item against AC-CAT-4; PASS only if all elements hold. U-CAT-2 Confirm displayed category counts match Shopify collection membership.

**Honest read of the gap:** reaching 5 launch-ready items in one category needs 4 more products built to AC-CAT-4 — real images, real descriptions, approved retail prices, curated variants. That is a content-and-sourcing effort, not an engineering one, and it is the largest single distance between now and the launch Boss described.

---

## 17. RECONCILIATION AGAINST THE REFERENCE DOCUMENTS (Revision 7, 2026-09-18)

**Boss flagged that I wrote section 14 without consulting existing reference documents. He is right, and the correction is substantive, not cosmetic.** All three documents in `docs/reference/` have now been read in full.

| Doc | What it actually is | Status |
|---|---|---|
| `CP-TFRD-v1-2026-09-14.docx` | CP-TFRD-1.0, 13 Sep 2026, "Draft for review". Techno-functional requirements: BR-1..3, **FR-1..FR-9 (an end-to-end lifecycle)**, AR-1..5, NFR-1..5, ER-1..3, DEF-1..2, APP-01..33, GAP-1..9, RL-1..3, SR-01..27, TC-1..4, RTM. I am named as its business owner. | Read in full |
| `UI-SPEC-v1-2026-09-14.pdf` | "Screen Inventory Review Workbook", 60pp. Screens 01–12 (landing → discovery → gallery → grids → cart → checkout → confirmation → email) + Appendices 13–28 (exception and support states). Presentation only; no commerce rules. | Read in full (text layer extracted; the page imagery is design reference, not requirements) |
| `v3.7.js-v1-2026-09-14.docx` | **Not a product document.** It is the operating-model / context-engineering spec v3.7 (file classes, roles, lanes, gate states, execution loops). Relevant to *how* I work, not *what* the happy path is. | Read; no happy-path content |

### 17.1 Versioning decision (Boss's explicit ask)

- **Section 14 as written = CP-HP v1.0 (Revision 4). SUPERSEDED. Retained for trace, not deleted.**
- **The canonical happy path is CP-TFRD-1.0 §4, FR-1..FR-9.** I do not restate it and CP-COM-001 does not own it.
- **This section is CP-HP-DELTA v2.0, 2026-09-18, built on top of CP-TFRD-1.0 (13 Sep 2026) and UI-SPEC-v1 (14 Sep 2026).** It carries deltas only. Where a delta is accepted it should be folded into CP-TFRD-1.1 by that document's owners — **not** kept as a parallel spec here.
- The reference documents are **inputs and have not been edited.**

### 17.2 HP-1..HP-9 reconciled — three outcomes, stated per step

**ALREADY SPECIFIED — defer to the TFRD. My version is a reinvention and is withdrawn as a spec.**

| Mine | Theirs | Verdict |
|---|---|---|
| HP-1 Browse | **FR-1** Discover + SR-01..07, SR-12/13, SR-17..19 | Duplicate. Theirs is more specific (named screens). Defer. |
| HP-2 PDP | **FR-2** + SR-20, SR-08 | Duplicate. Defer. |
| HP-3 Variant select | **FR-2** + **UI-SPEC screen 04: "SIZES S / M / L: Selects product variant"** + Appendix 22 Size Guide (S/M/L only) | Duplicate. See 17.3 — this materially changes my "curation is the genuine deviation" claim. |
| HP-4 Cart | **FR-3** + SR-22/23, UI-SPEC screen 09, Appendices 23/24 | Duplicate. Defer. |
| HP-5 Checkout handoff | **FR-4** + NFR-1 (server creates cart, returns trusted checkout URL; browser never holds credentials) + SR-26 | Duplicate, and **NFR-1 is stricter than my HP-5.** Defer. |
| HP-6 Payment | **FR-5** ("safe payment creates one Shopify order; no duplicate") + GAP-2 | Duplicate. **FR-5's no-duplicate/idempotency clause is absent from my HP-6** — theirs is better. Defer. |
| HP-7 Order confirmation | **FR-5** + UI-SPEC screens 11/12 | Duplicate. Defer. |
| HP-8 Fulfilment | **FR-6** + GAP-3 | Duplicate **except the no-dispatch staging rule** (17.4). |
| HP-9 Tracking | **FR-7** + GAP-4 + UI-SPEC Appendix 27 | Duplicate, and Appendix 27 is **contradicted** (17.5). |

**MY HAPPY PATH WAS ALSO INCOMPLETE.** The TFRD lifecycle runs two stages past mine:
- **FR-8 Support / cancellation / return / refund** (GAP-5, GAP-6; UI-SPEC screen 13 + Appendix 26) — I stopped at tracking. My AC-REF-1..4 exist but were graded post-launch and were never part of the happy path. The TFRD treats support+refund as **in-scope Phase 1, P1**.
- **FR-9 Missing/stale order recovery** (GAP-7) — **absent from my work entirely.** Genuine omission on my side.

I therefore have no grounds to treat section 14 as the primary deliverable. It restated nine stages that already existed and missed two that did not.

**GENUINELY NET-NEW (survives as v2.0 delta, four items only):**
1. **Test-gateway evidence discipline** — `test: true` / "bogus" gateway is `evidence_only`; never operational readiness (AC-AUTH-5, AC-CAP-1..3, R-2). The TFRD asks for "one safe controlled order" (GAP-2) but never defines what makes the evidence count. This is the gap R-2 was written from.
2. **Staging MUST NOT DISPATCH** (AC-ENV-1/-2/-3, AC-DIS-1..4). Not in the TFRD at any point — see 17.4, where it actively conflicts.
3. **Shopify-side curation enforcement** (AC-CUR-1, E-CUR-1/U-CUR-2 permalink test). The UI-SPEC specifies S/M/L as *presentation*; nothing in either document makes the other six variants unpurchasable in the authority. See 17.3.
4. **Launch posture / grading** (section 15, LB-1..LB-6) and **AC-CAT-4 per-item readiness**. The TFRD has a priority register (GAP-1..9) but no launch/no-launch cut. See 17.6, where the posture conflicts with NG-3.

Everything else in sections 14 and 15 is either a restatement of FR-1..FR-9 or presentation detail already fixed by SR-01..27 and the UI-SPEC screens.

### 17.3 Curation was already specified — my "genuine deviation" claim is corrected

Section 11 opened with "S/M/L is **the** genuine deviation... a product decision recorded in this item". **That is wrong as stated.** UI-SPEC screen 04 specifies a three-control S/M/L selector and Appendix 22's size guide lists only S, M, L, dated 2026-09-14; TFRD BR-1 says "select S/M/L". The decision predates me by four days and is recorded in two approved documents. I should have cited them; instead I re-derived the decision and called it mine.

What genuinely survives from section 11: **AC-CUR-1, that enforcement must sit in Shopify, not in the frontend.** Both reference documents specify only the *selector*. A three-control picker over a nine-variant Shopify product is exactly the "hiding is not restricting" hole. That argument, and E-CUR-1/U-CUR-2, are the net-new part. AC-CUR-3/-5/-6 (reviewable allowlist, drift detection, generalisation) also remain net-new but stay post-launch per 15.2.

**Live-state note (unverified this run — connector DISCONNECTED, no store read performed).** Per the coordinator: the six non-S/M/L Hoodie variants have been set to inventory policy DENY + tracked, so `availableForSale` is false. Two consequences I am recording without asserting anything new about the store:
- This is a **stopgap that partially satisfies LB-2** — it makes the variants unpurchasable in Shopify, which is AC-CUR-1's actual requirement, so the launch-blocking hole is plausibly closed pending verification.
- It **conflicts with AC-CUR-4**: a DENY/tracked variant renders as "sold out", which tells the customer the size exists and might return. Boss's stated intent is that we do not sell those sizes. Boss is already querying this with Shopify Sidekick; I am not proposing a mechanism (that is Aarti's ADR call), only recording that the stopgap and AC-CUR-4 disagree.
- It also **diverges from AC-CAT-4's POD configuration standard** (untracked + CONTINUE, per R-3). Two Hoodie variants groups now sit on opposite inventory configurations. That is acceptable as a deliberate curation mechanism; it is not acceptable as an accident, and AC-CAT-4 must not be read as requiring CONTINUE on curated-out variants.

### 17.4 CONFLICT — flagged, not resolved: staging no-dispatch vs the TFRD release rule

This is the sharpest contradiction found, and it is **not mine to settle.**

- **TFRD §1.1 release rule:** "prove the same customer outcome in Staging first; then promote and independently verify Production." **GAP-2** next-feature story: "Staging evidence first; Production only after release alignment and UAT." **ER-2** gates Staging on Pushpa UAT.
- **Boss environment rule (post-dates the TFRD):** staging is test-payments-only and **MUST NOT dispatch**.
- **The collision:** FR-6 (Apliiq acceptance), FR-7 (tracking returns to Shopify/customer) and FR-9 (recovery from a stalled Apliiq handoff) **cannot be proven in staging at all** if staging cannot dispatch. The TFRD requires staging-first proof of stages that the environment rule makes unprovable there. GAP-3 and GAP-4 are both P1 and both sit on the wrong side of this line.
- Two coherent resolutions exist and they are different products: (a) staging proves FR-1..FR-5 only and FR-6..FR-9 are **production-first by design**, with the "staging first" rule explicitly carved back; or (b) staging gets an Apliiq sandbox that produces a real fulfilment record with zero physical output, restoring staging-first. **(b) is what AC-ENV-2/-3 assume, and neither document confirms such a mode exists.** Decision for Boss + Aarti; I am flagging, not picking.
- Related and already recorded: #1005 shows staging **did** hand a test order to Apliiq Dropship Fulfillment (Q-1, 15.3). So today staging is in neither posture.

### 17.5 What D-011 (Shopify authoritative, we are a frontend) has now invalidated in these documents

Both reference documents predate the directive. Four items in them are now non-compliant. Recorded as **flags to their owners**, not as edits:

- **TFRD AR-5 "CP observation layer — signed event observation, reconciliation/alerts".** Same tension I flagged at 0b.2 against PRD.md's fingerprint apparatus. Under "we are just a frontend", a CP-side signed event layer is a second record of Shopify's lifecycle. The TFRD guards it ("must not own: mutation of Shopify lifecycle truth"), and NFR-3 is admirably careful ("reconciliation and recovery are required outcomes—not automatic custom-build mandates"). Still: **FR-9 recovery has no owner if CP does not build one.** This is the single largest unresolved architecture question the reconciliation surfaced. Aarti's ADR.
- **UI-SPEC Appendix 27 "Order Tracking" — CP-rendered four-step ladder (ORDER CONFIRMED / IN PRODUCTION / SHIPPED / DELIVERED) against order number "CP-0001".** Two violations: a **CP order-numbering scheme** parallel to Shopify's (#1005), and a **CP-derived status model**, including an "IN PRODUCTION" state Shopify does not have. Directly contradicts AC-AUTH-1/-3 and TFRD NG-1 ("no second tracking authority") — the UI-SPEC contradicts the TFRD here, independently of D-011. **My HP-9 and AC-FUL-1/-3 are the correct behaviour; Appendix 27 is not.** Flagging the conflict rather than picking: the states may be legitimate *if* every one maps 1:1 to a Shopify fulfilment fact and none is inferred, but as drawn it is a second authority.
- **UI-SPEC Appendix "Cart — Optional CP Recognition"** (passwordless email recognition, "CP ACCOUNT OR STORE CREDIT"). A CP-side identity and **store-credit balance** is a second commerce authority under AR-2/NG-1; Shopify Customer Accounts and store credit own both. Also TFRD GAP-9/NG-3 defers member work past Phase 1. **Post-launch at best, and needs re-specifying as Shopify-native before it is built.**
- **UI-SPEC screen 09 cart "APPLY: Validates discount".** Discount validation is Shopify's. Must be a pass-through to Shopify's discount engine, never a CP-side validation. Low risk, worth naming.

### 17.6 What the launch posture has now invalidated, and one conflict it creates

- **CONFLICT — TFRD NG-3 vs my LB-5 / section 16.** NG-3 explicitly puts "growth, **broad merchandising** and optional membership work" out of scope **until the customer lifecycle is proven**. My LB-5 makes a 5–10 item catalogue launch-blocking, i.e. it makes broad merchandising a precondition for launch. **These are opposite orderings of the same work.** The TFRD says prove one product end to end first; the launch posture says get a stocked-looking store up. Boss owns this; D-9 should be widened to include it. My own read, offered not asserted: NG-3 is the safer sequence and my LB-5 is the weaker of my six blockers.
- **TFRD GAP-8 (Media CX, 8 assets observed vs a 12-view target) is graded P2 and assigned to me to confirm.** I never answered it. Under the launch posture it partly promotes: **AC-CAT-4 requires at least one real approved image per item**, which is satisfied at 8 — so GAP-8 stays P2 and **my answer is 8 is sufficient for launch, 12 is a post-launch target.** UI-SPEC screen 03 advertises "VIEW GALLERY — 12 IMAGES" and the gallery overlay shows "01 / 14"; those counts must not be hard-coded ahead of real assets (AC-AUTH-2, NFR-5 "do not invent"). Recording this as my GAP-8 answer.
- **CONFLICT internal to the references — UI-SPEC gallery spec vs TFRD media rules.** UI-SPEC screen 06 requires "AI-assisted 360 or physically verified 3D rotation" and an "optional 2.5D GLB viewer". TFRD NFR-5 says "do not invent video, spin, 3D, AR, on-model or lifestyle proof" and APP-20/21/22 say do not claim unsupported spin or models. **The two documents contradict each other on media.** NFR-5 wins on truthfulness grounds and the launch posture makes it moot: no 360/GLB asset exists, so none ships. Flagged for whoever reconciles the docs.
- **CONFLICT on price and currency, between the references themselves.** TFRD BR-1: "the authoritative USD 128 Shopify offer." UI-SPEC cart/added-to-bag screens: "Size M / **EUR 180**". Verified store state is **USD 128.00** (C-2). The UI-SPEC figure is design placeholder, not an approved price — but it is the kind of placeholder that reaches production as copy. **AC-AUTH-1 governs: no price is ever hard-coded; every figure renders from Shopify.** Flagging rather than choosing, though the store settles it in practice.
- **TFRD DEF-1 and DEF-2 — P1 release items I never accounted for.** DEF-1: main/staging diverged with an undeployed media-label fix. DEF-2: **the staging-specific label is exposed on Production** (SR-27). DEF-2 is customer-visible environment leakage on the live site. Under the launch posture I grade it **launch-blocking — new LB-7**, on the same footing as LB-6: it is an environment-truth defect on the production surface. It is Sushma's and Aarti's to execute; it was already known to them and absent from my grading because I did not read this document.
- **Superseded by verified state:** TFRD §1.2 "Payment → Shopify order: not yet controlled end-to-end proof" is now partly answered — order #1005 exists with fulfilment and USPS tracking, but on the **test** gateway, so under my own AC-CAP-1 it closes GAP-2 only as `evidence_only`. GAP-3/GAP-4 are likewise evidenced-not-proven. TFRD §9's app inventory is dated 4 August 2026 and its own caveat applies ("reconfirm before relying on any app"); I have not re-read it and assert nothing about current installations.

### 17.7 What I am asking for

- **Accept the supersession:** CP-COM-001 §14 stops being the happy-path spec; CP-TFRD-1.0 §4 is. This section carries only the four deltas in 17.2.
- **Resolve 17.4** (staging-first vs no-dispatch) — Boss + Aarti. Blocks U-HP-1 and the ER-2 UAT gate alike.
- **Resolve 17.6's NG-3 vs LB-5 ordering** — Boss. Sets whether launch waits on a catalogue.
- **Route 17.5's four items** to the TFRD/UI-SPEC owners for a v1.1, and to Aarti's ADR where architecture is implicated (AR-5 / FR-9 recovery ownership is the big one).
- **Nothing in this section was verified against the live store.** The Shopify connector is disconnected; every store fact cited here is carried from the verified record in sections 0–1 of this item, and the DENY/tracked curation state in 17.3 is recorded on the coordinator's report, explicitly unverified by me.

---

## 18. CP-HP-DELTA v2.1 — LAUNCH-BLOCKING REQUIREMENTS (Revision 8, 2026-09-18)

**Version:** CP-HP-DELTA **v2.1**, superseding v2.0 (§17), built on **CP-TFRD-1.0** (canonical) and **UI-SPEC-v1**. Deltas only — FR-1..FR-9 are not restated. **Written for Aarti as the primary reader**: every requirement names the Shopify field or object it binds to, or says explicitly that it does not know.

**Verification status:** the Shopify connector is disconnected. **Nothing below was verified against the live store, and nothing below asserts any new fact about it.** Field names are from the Shopify Admin/Storefront GraphQL schema and must be confirmed against the actual API version in use before build.

---

### 18.1 CONFLICT #1 — staging-first proof vs staging no-dispatch. Two options, neither chosen.

**The problem restated for Boss.** CP-TFRD-1.0 §1.1 requires "prove the same customer outcome in Staging first; then promote and independently verify Production", and ER-2 gates promotion on my Staging UAT. The Boss environment rule forbids staging from dispatching. **FR-6 (Apliiq acceptance), FR-7 (tracking returns to Shopify/customer) and FR-9 (stalled-handoff recovery) are therefore provable in no environment at all** — staging is forbidden to produce the evidence, and production is forbidden to be the first place it is produced. GAP-3 and GAP-4 are both P1 and both sit on this line. **This is not a documentation inconsistency; it is a hole in the release process, and it blocks LB-1.**

Both options below are coherent. **They produce different requirements, so acceptance is specified separately for each.** I am not choosing.

#### OPTION A — Split the lifecycle. Staging proves FR-1..FR-5; FR-6..FR-9 are production-first by design.

The TFRD's staging-first rule is **explicitly carved back** to the pre-dispatch stages. Production becomes the first and only place Apliiq acceptance, tracking and recovery are ever proven, under a controlled first-order protocol.

- **AC-OPT-A1** Staging's happy-path scope is FR-1..FR-5 **only**. A staging order terminates at a paid Shopify order (`order.id` exists, `order.displayFinancialStatus = PAID`, `order.test = true`). Staging MUST NOT be expected to produce a fulfilment.
- **AC-OPT-A2** Staging MUST have **no dispatch-capable fulfilment path** (AC-ENV-2). Concretely, for every product in the staging store, no variant's `inventoryItem` may be assigned to a fulfilment service whose `fulfillmentService.serviceName` is Apliiq, and the Apliiq app must be uninstalled or in a confirmed non-producing mode. **Absence of the app is verifiable; "sandbox mode" is not, unless Apliiq confirms it in writing** (Sidekick Q3/Q4).
- **AC-OPT-A3** FR-6/FR-7/FR-9 acceptance is **re-scoped to production** and executed once, as a **controlled first order**: a single real-gateway order placed by a named internal operator to an internal address, treated as the FR-6/FR-7 proof, with the cancellation window of AC-DIS-3 available before it becomes an irreversible print.
- **AC-OPT-A4** Because the first production dispatch is also the first proof, production MUST carry AC-DIS-2 (order→dispatch record) and AC-DIS-4 (Apliiq charge reconciliation) **before** the controlled order, not after. Under Option A these stop being post-launch hygiene and become **launch gates**.
- **AC-OPT-A5** My ER-2 UAT sign-off is **split into two gates**: a staging sign-off covering FR-1..FR-5, and a separate production sign-off covering FR-6..FR-9. I MUST NOT sign a combined "lifecycle proven" statement from staging evidence. (This matches v3.7's gate-state rule that UAT PASS in staging is never OPERATIONALLY PROVEN.)
- **AC-OPT-A6** FR-9 (recovery) under Option A can only be drilled in production or against a simulated Shopify state. A **fault-injection drill in staging** — an order deliberately left with an open `fulfillmentOrder` and no fulfilment — MUST still be possible, because detection and alerting are CP-side and need no dispatch. **Detection is testable in staging even when dispatch is not.** This is the part of FR-9 Option A keeps.

**Impact of A.** Fastest to launch; requires no new Apliiq capability; costs one real garment. **Cost:** production's first customer-path exercise is unrehearsed for four of nine stages, and any FR-6/FR-7 defect is discovered with real money and a real customer promise in flight. Also reverses a governing TFRD rule, which needs Boss's explicit approval, not an inference.

#### OPTION B — Non-producing staging fulfilment. Staging-first is preserved for all nine stages.

Staging gains a fulfilment path that creates a **real Shopify fulfilment record with real tracking semantics and zero physical output**, so FR-6/FR-7/FR-9 are genuinely exercised in staging.

- **AC-OPT-B1** Staging MUST reach `order.displayFulfillmentStatus = FULFILLED` via a fulfilment that is **created in Shopify but produced by nothing** — a manual fulfilment against a non-Apliiq staging location, or an Apliiq sandbox account confirmed by Apliiq to produce no print and no label purchase.
- **AC-OPT-B2** The staging fulfilment MUST carry `fulfillment.trackingInfo.company` and `.number`, so FR-7 presentation is exercised — but the number MUST be **non-resolvable** and MUST NOT correspond to a purchased carrier consignment. **A real USPS number on a staging order is a dispatch-leak indicator, not test data** (this is exactly Q-1 / #1005).
- **AC-OPT-B3** Staging tracking MUST be **visibly labelled as simulated** on every customer-facing surface. Under AC-AUTH-2 an unmarked simulated tracking state is a false commerce fact, even in staging.
- **AC-OPT-B4** FR-6 acceptance in staging is satisfied by the **fulfilment-order handoff**, not by production: `fulfillmentOrder.status` moving OPEN → IN_PROGRESS and `fulfillmentOrder.requestStatus` reaching ACCEPTED against the staging (non-producing) assigned location. **This is the closest Shopify-native analogue to "Apliiq accepted the order" and it is the field Aarti should build against** (Sidekick Q1/Q2).
- **AC-OPT-B5** FR-9 recovery is fully drillable in staging: an order whose `fulfillmentOrder` remains OPEN past a defined threshold, or a fulfilment that never appears, MUST raise the reconciliation exception, with the drill run end to end.
- **AC-OPT-B6** A staging fulfilment path MUST be **structurally incapable** of reaching the production Apliiq account — separate credentials, separate Apliiq account or sandbox, fail-closed (AC-ENV-5). "Configured not to" is not a control.
- **AC-OPT-B7** Production MUST still be independently verified (TFRD §1.1, ER-3). Option B removes the *unrehearsed* first dispatch; it does not remove the production proof obligation.

**Impact of B.** Preserves the TFRD release rule intact, rehearses all nine stages, makes FR-9 properly drillable, and is the only option under which my staging UAT means what ER-2 says it means. **Cost:** depends entirely on whether a non-producing fulfilment path exists — **an unverified assumption, and the reason Sidekick Q1–Q4 exist.** If no such mode exists, B collapses into A.

**AC-CONF-1 (applies under both).** Until Boss selects an option, **U-HP-1 (staging end-to-end) MUST NOT be executed**, because today staging is in neither posture: #1005 shows it handed a test order to Apliiq Dropship Fulfillment. Running the happy path now manufactures a garment per run. This is LB-4 and it gates LB-1.

---

### 18.2 STRIP THE SECOND COMMERCE AUTHORITY — four replacements (D-011)

Boss's question this session was whether we are building things we should not. **These four are the clearest instances in the corpus.** Each is stated as: what the UI-SPEC draws → why it violates D-011 → what the frontend displays instead, and from which field.

**UI-SPEC-v1 is an input and has NOT been edited. The amendments below are requests to its owner, listed at 18.2.5.**

#### 18.2.1 Order number — replace "CP-0001" with Shopify's order name

- **Draws:** UI-SPEC Appendix 27 shows "ORDER CP-0001".
- **Violates:** AR-2, NG-1, AC-AUTH-1. A CP order-numbering scheme is a second order identity. Customer says "CP-0001", support searches Shopify, finds nothing. It also implies a CP-side sequence generator — a commerce record we would own.
- **AC-ID-1** The customer-facing order reference MUST be Shopify's **`order.name`** (the store-formatted number, e.g. "#1005"), rendered verbatim, including its prefix/suffix as Shopify formats it. The frontend MUST NOT generate, pad, re-prefix, or re-sequence it.
- **AC-ID-2** The internal reference MUST be **`order.id`** (the GID). It MUST NOT be shown to customers and MUST NOT appear in evidence artifacts (PRD PII/opaque-reference constraint).
- **AC-ID-3** Order lookup by a customer MUST resolve against `order.name`. No CP-side order table, no CP-side mapping between a CP reference and a Shopify order.
- **AC-ID-4** If a "CP-" prefix is wanted as branding, it MUST be configured as Shopify's **order name prefix in store settings** so Shopify itself generates it — the presentation layer never manufactures it. *(That is a store-configuration requirement, SC-6, not an app requirement.)*

#### 18.2.2 The four-step tracking ladder — replace with Shopify fulfilment fields

- **Draws:** Appendix 27 shows ORDER CONFIRMED / IN PRODUCTION / SHIPPED / DELIVERED, each labelled "Recorded" or "Pending update".
- **Violates:** NG-1 and AC-AUTH-1/-3 **as drawn**. The ladder is a CP-derived state model. Three of four steps do have Shopify sources; **"IN PRODUCTION" has no Shopify order-level equivalent**, and inferring it is precisely the invented commerce fact D-011 forbids.
- **The ladder is salvageable only if every step maps 1:1 to a Shopify fact and none is inferred.** Mapping, for Aarti to confirm against the live schema:

| Step | Source of truth | Requirement |
|---|---|---|
| ORDER CONFIRMED | **`order.displayFinancialStatus`** (PAID / PENDING / REFUNDED...) + `order.processedAt` | **AC-TRK-1** Shown only when Shopify reports a paid/authorised financial status. Never from a client-side "checkout returned successfully". |
| IN PRODUCTION | **No order-level Shopify field exists.** Nearest native analogue: **`fulfillmentOrder.status`** (OPEN → IN_PROGRESS) and **`fulfillmentOrder.requestStatus`** (SUBMITTED → ACCEPTED) for the fulfilment order assigned to the Apliiq fulfilment service. | **AC-TRK-2** This step MUST bind to `fulfillmentOrder.requestStatus`/`status`, or it MUST NOT be displayed at all. It MUST NOT be inferred from elapsed time since payment, from the absence of a fulfilment, or from any CP-side timer. **If Aarti cannot bind it to a real field, the correct product answer is to delete the step** — three truthful states beat four with one fabricated. Sidekick Q2 asks whether Apliiq surfaces a production state natively. |
| SHIPPED | **`order.fulfillments[]`** existing, with **`fulfillment.status = SUCCESS`** and `fulfillment.createdAt`; tracking from **`fulfillment.trackingInfo{company, number, url}`** | **AC-TRK-3** Shown only when at least one fulfilment record exists (this is AC-FUL-1). **`order.displayFulfillmentStatus` alone is NOT sufficient** — the array is authoritative (AC-FUL-3). |
| DELIVERED | **`fulfillment.displayStatus`** reaching DELIVERED, and/or a **`fulfillment.events`** entry with `status = DELIVERED` | **AC-TRK-4** Shown only from a carrier-sourced delivery event surfaced by Shopify. **MUST NOT** be inferred from an estimated delivery date, from `fulfillment.estimatedDeliveryAt`, or from time elapsed since shipment. This is what gates review eligibility (AC-FUL-6). |

- **AC-TRK-5** "Pending update" is the correct copy for a step Shopify has no data for, and it MUST mean exactly that — **absence, not a negative assertion** (AC-AUTH-2). A step MUST NOT render as "Recorded" from a default or a last-known value.
- **AC-TRK-6** The ladder MUST NOT persist step state CP-side. Each render reads Shopify; a step that was "Recorded" and is no longer sourced (e.g. fulfilment cancelled, E-FUL-6) MUST revert and raise an exception, not stay lit.
- **AC-TRK-7** No CP-side tracking database, no carrier polling, no AfterShip-style second tracking authority (TFRD APP-15 "avoid second authority", §9.3 "Apliiq → Shopify → customer"). The chain is one-directional and CP is the last hop.

#### 18.2.3 "CP Recognition" / store credit — replace with Shopify Customer Accounts

- **Draws:** UI-SPEC cart appendix, "HAVE A CP ACCOUNT OR STORE CREDIT? Enter your email for passwordless recognition. / RECOGNISE ME / CONTINUE AS GUEST".
- **Violates:** AR-2 and NG-1 twice over — a CP identity record **and** a CP-held monetary balance. A store-credit balance we compute is money we are asserting independently of the authority. It is also TFRD GAP-9/NG-3 work, deferred past Phase 1.
- **AC-ACC-1** Customer identity MUST be **Shopify Customer Accounts**. Shopify already provides passwordless email-code login natively, so the drawn UX needs no custom build — **AC-ACC-1 is a use-the-native-thing requirement, not a build requirement** (Sidekick Q5 confirms the current mechanism).
- **AC-ACC-2** Store credit MUST be **Shopify store credit** (`customer.storeCreditAccounts` / store-credit account balance). The frontend renders the balance Shopify returns and MUST NOT compute, cache, decrement, or reconcile it (AC-AUTH-1/-4). Any CP-side credit ledger is prohibited.
- **AC-ACC-3** Credit MUST be redeemed **inside Shopify checkout**, by Shopify. The frontend MUST NOT apply, reserve, or preview a credit deduction against a cart total.
- **AC-ACC-4** **LAUNCH POSTURE: this entire screen is POST-LAUNCH and MUST NOT ship.** Guest checkout is the launch path. It is not launch-blocking; it is launch-*excluded*. Shipping it would be building exactly what Boss asked whether we should be building.
- **AC-ACC-5** Until it ships, no CP surface may reference "CP account", "CP Credit", or a stored balance, because none exists. (My own earlier text referenced "CP Credit" as a delivery-gated entitlement in AC-FUL-6/AC-REF-3 — **those references are conditional on AC-ACC-2 being implemented Shopify-natively and assert no CP-owned balance.**)

#### 18.2.4 Cart discount validation — pass through, never validate

- **Draws:** UI-SPEC screen 09, "APPLY: Validates discount."
- **Violates:** AR-2/AC-AUTH-1 if "validates" means CP evaluates the code. Discount eligibility, stacking, expiry and value are Shopify's.
- **AC-DSC-1** A discount code MUST be applied by submitting it to the Shopify cart (**`cartDiscountCodesUpdate`**) and rendering the result. The frontend MUST NOT parse, pattern-match, pre-validate, or maintain any list of valid codes.
- **AC-DSC-2** Validity MUST be read from **`cart.discountCodes[].applicable`**, and the effect from **`cart.discountAllocations`** / the recomputed `cart.cost`. A code that is `applicable: false` renders a truthful rejection sourced from Shopify.
- **AC-DSC-3** The discounted total MUST be **`cart.cost.totalAmount`** as returned. The frontend MUST NOT compute a discounted price (AC-AUTH-1), even for display.
- **AC-DSC-4** **LAUNCH POSTURE: no discount campaign exists.** The control MUST be hidden at launch rather than shipped non-functional or shipped validating client-side. A non-functional APPLY button is a truthfulness defect (NFR-4, no fake-success state).

#### 18.2.5 Amendments requested to UI-SPEC-v1 (for its owner; I have not edited it)

1. **Appendix 27** — replace "CP-0001" with Shopify `order.name`; re-label the ladder against the 18.2.2 field map; **resolve or delete "IN PRODUCTION"**.
2. **Cart — Optional CP Recognition** — mark POST-LAUNCH and re-spec as Shopify Customer Accounts + Shopify store credit.
3. **Screen 09** — change "APPLY: Validates discount" to "APPLY: Submits the code to Shopify and renders Shopify's result"; hidden at launch.
4. **Screens 09/23 and cart appendix** — the "EUR 180" figures are placeholders; see 18.6.
5. **Screen 03 / gallery overlay** — "12 IMAGES" and "01 / 14" MUST NOT be hard-coded counts; render the actual approved media count (TFRD NFR-5, GAP-8; my answer at §17.6 is that 8 is sufficient for launch).
6. **Screen 06** — the 360 / AI-assisted 360 / 2.5D GLB requirements contradict TFRD NFR-5 and APP-20/21/22. No such asset exists; none ships at launch.

---

### 18.3 LB-1 — HAPPY PATH EXECUTION REQUIREMENTS (FR-1..FR-9, per environment)

**These are execution/evidence requirements for the TFRD's flow. The flow itself is CP-TFRD-1.0 §4 and is not restated.** TC-1..TC-4 is the existing test pack; this specifies what a PASS must contain.

- **AC-EXE-1 (governing)** LB-1 is satisfied only when FR-1..FR-9 have each been executed and evidenced **in the environment where that stage is provable under the resolution Boss selects in 18.1.** Until that selection, LB-1 cannot be closed by any amount of testing — the target is undefined. **This makes 18.1 the true top of the critical path, ahead of everything else in this item.**
- **AC-EXE-2** Every stage's evidence MUST record: environment, deployed SHA (TFRD ER-3/v3.7 DEPLOYED gate), timestamp, `order.test` and `order.paymentGatewayNames` where an order exists, and the Shopify object ID the assertion reads from. **An evidence artifact that does not name its source field is not evidence** (R-1's lesson: a convenience-tool field is not the record).
- **AC-EXE-3** Evidence MUST be sanitized: no customer PII, no private order-status URL, order identity as an opaque reference (PRD constraint).

**Staging run (U-HP-1), scope conditional on 18.1:**
- **AC-EXE-4** FR-1..FR-5 in all cases: discovery → PDP → S/M/L selection → bag → Shopify-hosted checkout → **test payment** → exactly one Shopify order, `order.test = true`, gateway is the test gateway, `order.displayFinancialStatus = PAID`. **FR-5's no-duplicate clause is part of the pass:** one order per checkout, verified by count, not assumed.
- **AC-EXE-5** Desktop **and** mobile (TC-1 requires both; my v1.0 said "no console errors", which is weaker than the TFRD's requirement).
- **AC-EXE-6** **Under Option A:** the run terminates at AC-EXE-4 and FR-6..FR-9 are marked NOT-PROVABLE-HERE, not FAILED. **Under Option B:** the run continues through AC-OPT-B1..B5, and the pass additionally requires **zero physical output and zero Apliiq production order**, evidenced by the absence of an Apliiq order and the absence of a purchased label — **evidenced, not assumed** (the #1005 lesson).
- **AC-EXE-7** The staging run MUST NOT begin until AC-CONF-1 is discharged.

**Production run (U-HP-2):**
- **AC-EXE-8** FR-1..FR-5 with the **real gateway**, `order.test = false`, correct amount and currency, tax line sourced from Shopify's engine and distinguishable from "not calculated" (AC-TAX-2).
- **AC-EXE-9** FR-6/FR-7: the order reaches the Apliiq fulfilment service, a fulfilment record is created with `trackingInfo`, and tracking renders per 18.2.2. **Under Option A this is also the first-ever proof and requires AC-OPT-A3/A4 in place first.**
- **AC-EXE-10** FR-8: a controlled support case and a controlled refund, with the refund recorded in Shopify (GAP-5/GAP-6). **This stage was entirely absent from CP-HP v1.0 and is in TFRD Phase 1 scope at P1.** AC-REF-1..4 are its acceptance criteria and are hereby **promoted from post-launch to part of the LB-1 production run** — but only for a refund that actually occurs; no launch-day refund is manufactured to satisfy it.
- **AC-EXE-11** FR-9: the recovery drill (GAP-7). Detection is CP-side and drillable in staging under both options (AC-OPT-A6/B5). **Ownership of the detection mechanism is unresolved — TFRD AR-5 assigns it to a "CP observation layer", which D-011 puts in tension. Aarti's ADR; flagged, not specified here.**
- **AC-EXE-12** Production sign-off is mine and is **independent of the staging sign-off** (AC-OPT-A5). I MUST NOT infer production from staging (v3.7 gate states; TFRD ER-3 "independent proof").

---

### 18.4 REMAINING LAUNCH BLOCKERS

#### LB-6 — gateway per environment
- **AC-GW-1** Production MUST have a live gateway and MUST NOT have test mode enabled (AGENTS.md: "never enable test mode on Production Shopify"). Verified by `order.test = false` and `paymentGatewayNames` on the controlled production order.
- **AC-GW-2** Staging MUST have **only** a test gateway. A live gateway on staging is a defect (AC-ENV-4).
- **AC-GW-3** The check MUST be a **pre-launch verification against each store's payment settings, plus an assertion on the first order in each environment.** Either inversion is a showstopper: real customers uncharged, or test orders taking real money.
- **AC-GW-4** The frontend MUST NOT infer environment from a build flag alone when reasoning about payment (AC-AUTH-1); the `test` flag on the resulting order is the authority (AC-AUTH-5).

#### LB-4 — staging→Apliiq dispatch leak
- **AC-LEAK-1** Discharged only by AC-OPT-A2 (app removed / no Apliiq-assigned fulfilment service) or AC-OPT-B6 (structurally separate non-producing path). **It cannot be discharged by process discipline.** The `test` flag protects the payment and nothing downstream — Apliiq sits below the gateway and never sees it (Q-1 / 15.3).
- **AC-LEAK-2** Still open and chase-but-do-not-gate: whether Apliiq charged us and whether a garment was physically produced for #1005 (AC-DIS-4 reconciliation is where this lands).
- **AC-LEAK-3** Blocks U-HP-1 (AC-CONF-1), therefore blocks LB-1, therefore is on the critical path.

#### LB-7 — DEF-2, staging label exposed on Production
- Carried from CP-TFRD-1.0 DEF-1/DEF-2 and SR-27. **I graded this launch-blocking in §17.6; the requirement follows.**
- **AC-DEF-1** No environment-specific wording may appear on any Production customer surface. This is environment-truth leakage on the live site, in the same family as LB-6.
- **AC-DEF-2** Per DEF-1, the fix MUST be deployed to Staging, **visually verified**, then reconciled to main — not merged blind. Execution is Sushma's and Aarti's; the acceptance is mine.
- **AC-DEF-3** Verification is a visual check on both environments post-deploy, not a diff review. A corrected string in the repo is not a corrected string on the page.

#### The "sold out" wording problem — six curated-out Hoodie variants
Per the coordinator, the six non-S/M/L variants are set to inventory policy DENY + tracked, so `availableForSale` is false. **Unverified by me this run.** Boss is querying the display consequence with Sidekick separately.
- **AC-CUR-8** The stopgap **does** satisfy AC-CUR-1's substance — Shopify itself now refuses the variant, which is the launch-blocking part of LB-2. **I am not asking for it to be undone.**
- **AC-CUR-9** It does **not** satisfy AC-CUR-4: an `availableForSale: false` variant renders as "sold out", which tells the customer the size exists and may return. Boss's intent is that we do not sell those sizes at all.
- **AC-CUR-10** The frontend MUST render only the approved allowlist (S/M/L) and MUST withhold non-allowlisted variants entirely — no greyed control, no "sold out" chip, no DOM/structured-data presence (AC-CUR-4, U-CUR-3). **This is a frontend requirement and it is sufficient for launch:** the customer never sees the six, regardless of how Shopify configures them.
- **AC-CUR-11** Because AC-CUR-10 is frontend-only, it is **defence in depth over a Shopify-side control, not instead of one** — the ordering AC-CUR-1/-2 already require. Both are present under the stopgap. **LB-2 is therefore satisfiable at launch by AC-CUR-10 + the existing DENY configuration, pending verification** (U-CUR-1/-2/-3 when the connector returns).
- **AC-CUR-12** The DENY+tracked configuration is a **deliberate curation mechanism and an explicit exception to AC-CAT-4's POD standard** (untracked + CONTINUE, per R-3). AC-CAT-4 applies to *sellable* variants. This MUST be recorded so a future reader does not "fix" the six variants back to CONTINUE and silently re-open LB-2.
- **AC-CUR-13** Whether DENY+tracked or variant deletion is the right long-run mechanism is **Aarti's ADR call informed by Sidekick Q6**, not mine. My requirement is the outcome: unpurchasable in Shopify, invisible in the frontend.

---

### 18.5 LB-5 CATALOGUE — ~~CONFLICT FLAGGED, NOT EXPANDED~~ — **partly SUPERSEDED by §21.1 (R-5)**

> The depth target is **specified**, not a Boss judgement: UI-SPEC p.51 "HOODIES / 6 ITEMS", p.50 "CATEGORIES / 6 GROUPS". My claim that no count appears anywhere was false (R-5). **The NG-3 conflict below stands unchanged and still needs Boss.**

**Per instruction, I am stating this and stopping.**

- **CP-TFRD-1.0 NG-3** puts "growth, **broad merchandising** and optional membership work" out of scope **until the customer lifecycle is proven**.
- **The launch posture** targets 5–10 merchandise items per category, which my §16 graded launch-blocking as LB-5.
- **These are opposite orderings of the same work.** NG-3 says prove one product end to end, then merchandise. LB-5 says merchandise, then launch. Both cannot be first.
- **This is a Boss decision.** It is folded into D-9 (which already asks what "category" means — that question is downstream of this one and should not be answered first).
- **I am not expanding §16 and not writing further catalogue requirements until Boss rules.** Recorded consequence either way: if NG-3 wins, LB-5 is withdrawn as a blocker and launch proceeds on the Hoodie alone; if the 5–10 target wins, NG-3 needs explicit amendment and the catalogue work is a content-and-sourcing effort, not an engineering one (§16 closing note).

---

### 18.6 USD 128 vs EUR 180 — my answer

**USD 128 is authoritative. This does not need Boss.** Basis, in order:
1. **CP-TFRD-1.0 BR-1** states "the authoritative USD 128 Shopify offer" — a requirements statement in the canonical document.
2. **Verified store state (C-2, recorded 2026-09-18 before the connector was revoked):** Signature Hoodie ACTIVE, USD 128.00 uniformly across all 9 variants, store currency USD. Boss confirmed this as deliberate retail pricing in R-4.
3. **The UI-SPEC "EUR 180" appears only in cart/added-to-bag mockup copy alongside placeholder product text** ("Product description copy will render here", "SIGNATURE SERIES / 001"). It is design placeholder, not an approved price.

- **AC-CCY-1** The authoritative price and currency are whatever Shopify returns — **`variant.price.amount` / `.currencyCode`**, and cart totals from **`cart.cost.totalAmount`**. No figure is ever hard-coded (AC-AUTH-1). *This is the requirement; "USD 128" is today's value of it, not a constant to embed.*
- **AC-CCY-2** The UI-SPEC's "EUR 180" and "!180" strings MUST NOT reach any built surface, and no EUR presentation may exist while the store's currency is USD (E-PRICE-3: a non-store currency on a variant means withhold, never invent a conversion).
- **AC-CCY-3** UI-SPEC-v1 needs a placeholder-vs-approved-value annotation pass (18.2.5 item 4) — **a documentation amendment for its owner, not a Boss decision.**
- **The one thing that would need Boss:** a genuine decision to sell in EUR or to a European market. Nothing in either document proposes that, so I am not raising it as a question.

---

### 18.7 CRITICAL PATH, stated plainly for Aarti and Sushma

1. **18.1 — Boss selects Option A or B.** Everything else in LB-1 is undefined until this lands. Sidekick Q1–Q4 exist to inform it.
2. **LB-4 (AC-LEAK-1)** — discharge the dispatch leak under the selected option. Gates U-HP-1.
3. **LB-1** — execute the happy path (18.3), staging then production, scoped by the selection.
4. **LB-6, LB-7** — verifiable in parallel; neither depends on 18.1.
5. **18.2** — 18.2.3 and 18.2.4 are *removals* (do not ship), so they cost nothing and reduce scope. 18.2.1 and 18.2.2 are real build work and should be sized before the UI is built against Appendix 27 as drawn.
6. **LB-5** — parked on Boss (18.5).

---

## 19. DRAFT SIDEKICK QUESTIONS (Revision 8)

For Boss to put to Shopify Sidekick. **Each is self-contained and answerable by someone who knows Shopify but not this project.** I have deliberately excluded anything that is business judgment, anything readable from the Admin API, and anything about our specific store's current state (the connector is disconnected and I assert nothing about it).

**Q1 — Non-producing fulfilment in a development store. [HIGHEST VALUE — gates 18.1]**
> In a Shopify development store used for staging, we need to exercise the full order lifecycle through to a fulfilment with tracking, **without any physical production or dispatch occurring** and without purchasing a shipping label. The production store uses a print-on-demand fulfilment service app. What is the supported Shopify pattern for reaching a genuine FULFILLED order state with tracking information in a development store, while guaranteeing no external fulfilment service receives the order? Specifically: does assigning inventory to a location that has no fulfilment service attached, and fulfilling manually, reliably prevent any connected fulfilment-service app from receiving the fulfilment order? Is there a supported "test mode" for fulfilment, comparable to the test payment gateway, or is manual fulfilment at a non-service location the only mechanism?

**Q2 — Native equivalent of "in production" for a POD order.**
> For an order routed to a print-on-demand fulfilment service, we want to show the customer a status between "order confirmed" and "shipped" — roughly "your item is being made". Does Shopify expose a native field for this, or is `fulfillmentOrder.status` (OPEN / IN_PROGRESS) together with `fulfillmentOrder.requestStatus` (SUBMITTED / ACCEPTED) the correct and only native source? Are those values reliably set when a third-party fulfilment service accepts a fulfilment order, and is there any additional production-state signal a fulfilment service can write back to Shopify that a storefront could read? We want to avoid inventing a status that Shopify does not actually know.

**Q3 — Does the order `test` flag reach fulfilment services?**
> When an order is created in a development store through the test payment gateway (so the order carries `test: true`), is that flag propagated to a connected third-party fulfilment service app, and are fulfilment services expected or required to suppress production for test orders? Put differently: is the `test` flag a protection only for payment, or does it also protect against downstream fulfilment? If it does not, what is the supported mechanism for preventing a development store from sending orders to a live fulfilment service?

**Q4 — Guaranteeing a development store cannot dispatch.**
> What is the recommended configuration for a Shopify development store used for QA, such that it is **structurally incapable** of causing a physical dispatch — no fulfilment-service handoff, no shipping-label purchase, no carrier consignment? We are looking for controls that hold by configuration rather than by operator discipline. Which of these actually provide that guarantee: uninstalling the fulfilment app; unassigning variants' inventory from the fulfilment service location; disabling the shipping/label purchase capability; something else?

**Q5 — Native passwordless customer identity and store credit.**
> We want customers to be recognised by email without a password, and to hold and redeem store credit. Does Shopify provide both natively today — passwordless/email-code login through Customer Accounts, and a native store-credit balance that can be redeemed in checkout? Which API surfaces expose a customer's store-credit balance for display on a headless storefront, and is store-credit redemption handled entirely within Shopify checkout, or does a headless storefront need to do anything to apply it? We want to avoid building any customer or credit record of our own.

**Q6 — Making specific variants permanently unsellable without showing them as sold out.**
> A product has nine size variants in Shopify but we only sell three. We need the other six to be genuinely unpurchasable — so that a direct cart permalink or a stale checkout link cannot create an order for them — but we do **not** want them presented as "sold out", because that implies they may return. Setting them to tracked with an inventory policy of DENY and zero stock makes them unpurchasable but also makes `availableForSale` false, which reads as "sold out" on storefront surfaces. What is the recommended Shopify pattern here: deleting the variants, unpublishing them from the sales channel, using a different product, or something else? Which options preserve historical order records that reference those variants?

**Q7 — Order name as the single customer-facing reference.**
> For a headless storefront, is `order.name` the correct and only field to show a customer as their order reference, and can its prefix/suffix be configured in store settings so that the store itself generates a branded order number (for example "CP-1001")? We want to avoid maintaining any separate order-numbering scheme outside Shopify.

**Q8 — Distinguishing "no tax due" from "tax not calculated".**
> On a Shopify order or checkout, how can a headless storefront reliably distinguish a genuine zero-tax outcome (for example an apparel exemption) from tax simply not having been calculated or configured for that jurisdiction? Is there a field that indicates tax was evaluated, separate from the tax amount being zero? *(Lower priority — post-launch per §15.5, but it is the one tax question Shopify genuinely determines.)*

**Deliberately NOT asked:** whether the Tee should be priced at retail (business judgment); how many products we should launch with (Boss decision, §18.5); what our store currently contains (Admin API, and the connector is disconnected); whether to launch (Boss).

---

## 20. D-020 / D-017 — what the reference documents already say about categories and navigation (Revision 9, 2026-09-18)

**Answering a direct question. Reporting what the documents say; not designing.** Third time these documents have pre-empted work I re-derived — see §17.3 (curation) and §17.2 (happy path).

### 20.1 SPECIFIED — categories are Shopify collections, and the nav is drawn

- **A category is a Shopify Collection.** CP-TFRD-1.0 §12.1 screen index, verbatim: **SR-17 "Shop collection"**, **SR-18 "Collections alias"**, **SR-19 "Hoodies collection route"**. All three trace to FR-1. The word used is *collection*, and SR-19 names a per-collection **route**. Nothing anywhere calls a category a product type, a tag, or a CP-side grouping. **My §16 AC-CAT-1 working definition was correct but was re-derived rather than cited.**
- **Navigation is fully drawn.** UI-SPEC-v1 **Appendix 21, "Menu — Navigation"**, lists the top-level nav verbatim: **DISCOVERY · ALL CATEGORIES · ALL HOODIES · CONTACT US · PRIVATE LIST**, with the note "CONTACT US opens the Support form."
- **Two category listing screens exist in SR-01..27.** **SR-12 "All categories"** (UI-SPEC screen **07, "Discovery — All Categories Grid"**) and **SR-13 "All Hoodies"** (UI-SPEC screen **08, "Discovery — Product Grid (All Hoodies)"**). Both P1, both trace to FR-1. Plus SR-17/18/19 as the collection routes and **SR-21 "Legacy products alias"**.
- **The drill-down is specified.** UI-SPEC screen 07 CTA map: *"CATEGORY CARD: Opens category product grid."* Screen 08: *"PRODUCT CARD: Opens product detail / selection."* So: All Categories grid → category product grid → PDP (SR-20).
- **Exactly one category is named anywhere: Hoodies.** It appears four times (Appendix 21 "ALL HOODIES"; screen 08 "All Hoodies"; SR-13; SR-19 "Hoodies collection route").

### 20.2 SILENT — genuinely absent from both documents

- **The category list.** "ALL CATEGORIES" is drawn as a grid of cards, but **no second category is named in either document.** The set is silent.
- **Any count.** Neither document states how many products a category holds, a floor, a target, or anything resembling 5–10. **My §16 AC-CAT-2 floor of 5 is mine, not theirs.**
- **Thin or empty category rendering.** Silent in both. The UI-SPEC specifies truthful-failure states carefully elsewhere — SR-14 video unavailable, SR-15 gallery unavailable, SR-16 selected size unavailable, Appendix 24 **cart** empty ("Your bag is empty. Discover the current collection.") — **but there is no empty-category, thin-category, or empty-grid state anywhere.** Given how deliberate the other empty states are, I read this as an omission rather than an intentional silence, but that is my inference and I flag it as such.
- **Category-to-collection mapping in Shopify** (handles, which collections exist, smart vs manual). Silent — and it is an Admin-API question, not a spec question.

### 20.3 CONSEQUENCE — D-020 largely dissolves; D-017 does not

- **D-020 "what is a category" is ANSWERED by the documents: a Shopify Collection, surfaced at SR-17/18/19, listed at SR-12, drilled at SR-13.** It should be closed as "read the spec" rather than escalated. **No Boss decision is needed on the definition.** What remains of D-020 is only: *which collections exist beyond Hoodies* — a merchandising question, not a definitional one.
- **D-017 catalogue depth is NOT answered.** The 5–10 target appears in neither document; the only count-adjacent statement is **NG-3**, which defers broad merchandising until the lifecycle is proven. So the §18.5 conflict stands **unchanged and still needs Boss** — the documents do not resolve it, and if anything NG-3 is the only written position.
- **Immediately relevant to production state as relayed** (1 ACTIVE product, Hoodie; Tee now DRAFT — **not verified by me, connector disconnected**): the single specified category, Hoodies, would hold exactly one item, and **neither document says how that should render.** My §16 AC-CAT-3 ("a category below its floor is withheld, not shown thin") is **my rule, not the spec's**, and it is worth Boss knowing that a one-item Hoodies grid is un-specified rather than approved. This is the one genuine new question this review surfaces.
- **Catalogue *structure* work can start now** on the documented shape (collections + SR-12/13/17/18/19 + Appendix 21 nav). Catalogue *depth* cannot, and is still behind Boss.

### 20.4 Context updates recorded (not verified by me)

- **Production inspected for the first time:** 2 products; Hoodie ACTIVE with **3 variants, S/M/L, $128 — already correctly curated in production**; Tee DRAFT. Recorded as relayed. **If confirmed, LB-2 is satisfied in production on its merits** — production never had the 9-variant exposure staging has. AC-CUR-10 (frontend withholds non-allowlisted variants) still applies; AC-CUR-8/-9/-12 concern the **staging** store's DENY stopgap only.
- **Boss has ruled the Apliiq connection ESTABLISHED, no further acceptance test; FR-6 closes on retrospective documentation of #1005.** Recorded. Consequences: GAP-3 closes by ruling rather than by the dispatch proof the TFRD asked for; **AC-EXE-9's FR-6 element is satisfied by documentation**; and under §18.1 this **materially shrinks Option A's cost** — Apliiq acceptance no longer needs a first-ever production proof. **It does not close FR-7 (tracking to customer) or FR-9 (recovery), and it does not discharge LB-4** — staging must still not dispatch, regardless of the connection being accepted in production. §18.1 remains open on FR-7/FR-9 alone.

---

## 21. REVISION 10 (2026-09-18) — R-5 retraction, and the V1.2 Addendum

### R-5 — RETRACTED: "only one category is named" and "no count appears anywhere" (§20.2)

**Both statements are FALSE. Retract entirely.** Verified myself with pypdf against the source PDF (59 pages), after the coordinator produced the verbatim text:

- **UI-SPEC p.50, screen 07, DESIGN SPEC · WORKBOOK, verbatim:** *"CATEGORIES / 6 GROUPS": Hoodies, Jackets, Knitwear, Trousers, Accessories, Footwear.* **Six categories are named explicitly.**
- **UI-SPEC p.51, screen 08, verbatim:** *"HOODIES / 6 ITEMS" — a 2×3 grid of six distinct hoodie products, each with its own name and price.* **A per-category item count is specified.**

**Root cause — and this is the fourth time.** I extracted the PDF with a hand-rolled zlib/regex scraper because `pdftotext` was unavailable. It silently dropped the content streams for the **V1.2 Addendum, pp.47–58**. I then asserted a flat negative — "no second category exists in either document" — **from the absence of a string in my own tool's output, without confirming against the source.** `pypdf` was installed the whole time and I did not look for it.

**This is exactly the standing lesson I wrote at R-1 and restated at R-3: _confirm a negative against the authoritative record before grading it._** R-1 was an empty array from a convenience tool. R-3 was a counter on an untracked item. **R-5 is a missing page range from a scraper I wrote myself** — and it is the worst of the series, because I had already written the rule, had already been corrected twice on it, and had even flagged in §17 that I was working from an "extracted text layer". I noted the caveat and then reasoned as if it did not exist. **A caveat I do not act on is not honesty, it is decoration.**

**Operational change, not just an apology:** when a document is the basis for a "the spec does not say X" claim, I use a real parser, and I state which tool and which page range the negative is drawn from. Applied below.

### 21.1 CORRECTED — what the addendum actually specifies (pypdf, pp.47–59, verified)

- **Six categories:** Hoodies, Jackets, Knitwear, Trousers, Accessories, Footwear (p.50).
- **Six items per category:** "HOODIES / 6 ITEMS", 2×3 grid, each with its own name and price (p.51).
- **D-017 catalogue depth is therefore SPECIFIED, not a Boss judgement** — six per category, which sits inside the 5–10 target rather than competing with it. **§18.5's "flag only, do not expand" is withdrawn**; catalogue requirements can now be written against a written standard. §16's AC-CAT-2 floor of 5 was mine; **the spec's number is 6 and supersedes my invented floor.**
- **§20.2's "no count appears anywhere" is struck. §20.3's "which collections exist is a merchandising question" is struck** — the six are named.

**S/M/L framing — adopted and corrected.** UI-SPEC screen 04 specifies "SIZES S / M / L: Selects product variant." **S/M/L was always the design; it is not our deviation and not a curation choice we made.** §17.3 already conceded this; any surviving "the genuine deviation" language in §11 is superseded. What remains ours is only **enforcement** (AC-CUR-1: Shopify must refuse the other variants) — never the selection itself.

**USD vs EUR — my §18.6 answer is confirmed by the document.** p.49, verbatim: *"Pricing is in USD, not EUR as specified throughout the workbook (€180 → $128)."* The addendum itself records EUR as a workbook-wide artefact and USD 128 as live truth. AC-CCY-1/-2 stand unchanged; this needs no Boss.

**GAP-8 media — confirmed.** p.49: *"gallery is 8 images vs. the spec'd 12"*, and the 360 Showcase video *"reports 'unavailable' in the live player"*. My §17.6 answer (8 sufficient for launch, 12 post-launch) holds and is now sourced.

### 21.2 STILL SILENT — verified with pypdf across all 59 pages

The empty/thin-category observation **survives and is sharpened**:

- There is **no empty-category, thin-category, or below-floor grid state** anywhere in 59 pages. Confirmed by full-document search, not by a partial scrape this time.
- The spec is otherwise **exhaustive** about unavailability. Pages 15–19 are four appendix spreads of "Product Availability / Order & Cart / Address Validation / Shipping & Payment Recovery / Session & Post-Purchase" widgets: *Video unavailable · Gallery unavailable · **Selected size unavailable** · Your bag is empty · Discount code not recognised · Review shipping details · Shipping unavailable · Payment could not be completed · Checkout expired · **Tracking pending***.
- **It covers an empty bag and an unavailable size, but never an empty or one-item category.** Against that level of coverage, the omission is conspicuous.
- **The addendum confirms it independently:** p.50 notes the live category tiles show *"an unspec'd '1 PIECE' count styling"* — **the workbook's own auditor recorded the current thin-category rendering as unspecified.** So this is not my inference any more; it is the document's finding.
- **This is the current storefront**, not a hypothetical: drafting the Tee emptied Tshirts, leaving one category, Hoodies, at 1 piece.
- **AC-CAT-3 (withhold below floor) remains MY rule, correctly flagged as mine.** The spec does not authorise it, and with a floor of 6 and a live count of 1 it would withhold the only category we have — which cannot be right at launch. **This needs Boss, and it is the one genuinely open product question here.**

**A direct assignment to me I had missed:** every widget on pp.15–19 carries a blank line reading *"Requirement / owner: ______"*. The spec is explicitly handing those states to a product owner to fill in. That is mine, and it is unstarted. Note p.19's "Tracking pending — *Your order is confirmed. Tracking will appear when the shipment is handed to the carrier*" is already the truthful-degradation copy my AC-FUL-5 asks for — **approved copy exists and I should use it rather than write my own.**

### 21.3 The V1.2 Addendum is a defect register — and half of it must NOT be "fixed"

The addendum audits the live build against the workbook, captured **2026-09-13**, live reference **carlophillips.com**. It is written as deviations-from-spec. **Under D-011, several of those deviations are the frontend being CORRECT and the spec being wrong.** Classifying before anyone works the list, because "close the gaps" here would rebuild exactly what §18.2 removes:

| Addendum finding (verbatim, p.) | Classification |
|---|---|
| "The custom in-brand order-tracking screen (order number + status timeline) is **not built**"; Aftercare points customers to "the secure order-status link in the Shopify confirmation email" (p.59) | **NOT A DEFECT — this is compliant.** It is precisely §18.2.1/18.2.2. The live site already does the right thing. **Do not build Appendix 27 as drawn.** |
| "Discount-code entry is **not present** on the live cart" (p.52) | **NOT A DEFECT.** Matches AC-DSC-4 (hide it; no discount campaign exists). |
| "Self-service returns **not configured**; routes returns to manual support" (p.59) | **NOT A DEFECT at launch** — truthful per NFR-4. Feeds FR-8/GAP-6. |
| "Size chart not implemented — live panel is a stub: *'Size guidance is currently unavailable in Shopify'*" (p.57) | **DEFECT, low.** Truthful, so not launch-blocking, but it leaks an internal system name to customers. Copy fix. |
| Checkout "is the default light Shopify template", no custom 3-step indicator (p.53) | **NOT A DEFECT — compliant and required.** TFRD FR-4/SR-26 mandate Shopify-hosted checkout. **A "fully custom CARLOPHILLIPS-branded checkout" as the workbook specifies would be a D-011 violation and a PCI question.** The spec is wrong here; flag to its owner. |
| "Private List entirely unbuilt, replaced by a 'coming soon' placeholder" (p.55) | **NOT A DEFECT.** TFRD GAP-9/NG-3 defer it past Phase 1. |
| Nav: four unspec'd items — "Home", "All Tshirts", "Aftercare", "Account"; grouped under DISCOVERY / MORE (p.56) | **~~DEFECT, real~~ — RETRACTED per R-6, see §22.1. Partly STALE.** The "All Tshirts" entry is no longer rendered. **AC-NAV-1 survives as a standing rule** (see §22.2), not as a finding against current state. |
| Landing pre-morph state not built; text-only brand mark; no "JOIN THE LIST" shortcut; circular scroll arrow replaces "ENTER →" (p.48) | **Design debt, post-launch.** Not commerce truth. |
| "No 'BUY NOW' button — only 'ADD TO BAG' / 'CHOOSE A SIZE'" (p.49) | **Not launch-blocking.** BUY NOW is a convenience path; its absence removes a checkout route, it does not falsify one. |
| Contact form: no Name, no Order Number, topic dropdown replaces free-text Subject (p.54) | **DEFECT, low.** Order Number absence hurts FR-8 support triage. Feeds GAP-5. |
| "'COMPLIMENTARY SHIPPING & RETURNS' softened to 'SHIPPING & RETURNS AVAILABLE AT CHECKOUT'" (p.49); "'Secure checkout · taxes included' line is missing" (p.52) | **NOT DEFECTS — these are corrections.** Both original strings assert commerce facts (free shipping, tax-inclusive pricing) that Shopify determines at checkout. AC-AUTH-1. **The softened copy is right.** |

**AC-ADD-1** The V1.2 Addendum MUST NOT be worked as a flat "restore the spec" list. Each item is classified above; the "compliant, do not build" rows are the ones that matter, because working them would re-introduce the second commerce authority §18.2 exists to remove.

**AC-ADD-2** The addendum audits **production as of 2026-09-13** and predates the Tee being drafted. It is evidence of the live build at a point in time, not current state. **I verified none of it against the store** (connector disconnected).

### 21.4 What now needs Boss — revised

1. **Thin/empty category rendering at launch.** Spec floor is 6; live is 1. AC-CAT-3 as I wrote it would withhold the only category. **Genuinely unspecified — Boss.**
2. **NG-3 vs six-groups-of-six. The conflict STANDS and is now sharper**, because the UI-SPEC's number is explicit: TFRD NG-3 defers broad merchandising until the lifecycle is proven, while the UI-SPEC specifies 36 products. Two approved documents, opposite orderings. **Boss.**
3. **D-020 is CLOSED** — a category is a Shopify Collection (SR-17/18/19), the six are named, the nav is drawn (Appendix 21). No decision needed; read the spec.
4. **D-017 is ANSWERED by the spec at six per category** — subject only to item 2 above deciding *when*.

---

## 22. REVISION 11 (2026-09-18) — R-6, and the V1.2 Addendum sorted into three buckets

### R-6 — RETRACTED: "New real defect: nav exposes 'All Tshirts' — now an empty category"

**FALSE as a statement of current state. Retract.** Verified in a browser on www.carlophillips.com by the coordinator on 2026-09-18, after the Tee went DRAFT: the MENU overlay renders exactly two catalogue entries, **ALL CATEGORIES** and **ALL HOODIES**. There is no "All Tshirts". `/collections/tshirts` and `/collections/all-tshirts` do 404, but **nothing links to them**, so no customer can reach a dead link. **The navigation is data-driven and self-corrected when the product was drafted.** That is the frontend behaving correctly, and I reported it as a defect.

**Root cause — the same shape as R-5, one step removed.** I took a finding from the V1.2 Addendum, an audit **captured 2026-09-13**, and reported it as **current state on 2026-09-18**. It was true five days ago. I had *already written* in AC-ADD-2 that the addendum "audits production as of 2026-09-13 ... is not current state" — and then, in the same report, treated one of its findings as current. **I wrote the rule and broke it in the same breath.**

**The distinct lesson, because R-5's does not cover it.** R-1/R-3/R-5 were all *confirm a negative against the authoritative record*. **R-6 is different: a document can be accurate and still be stale.** The addendum was not wrong; it was old. Nothing in it is a statement about today unless re-verified today. Age is a property I must check as routinely as provenance — **a verified fact carries the date it was verified, and loses force as that date recedes.**

**Operational rule, applied below:** **no item in the V1.2 Addendum may become work until it has been re-verified against the live site, with the check named and dated.** A finding from that register is a hypothesis about the present, not a defect.

### 22.1 THE V1.2 ADDENDUM REGISTER — sorted into three buckets

**Nobody should touch this list until it is sorted this way,** because working it as written would rebuild exactly what §18.2 removes. Supersedes the flat table at §21.3.

**Verification key:** `[LIVE-2026-09-18]` = re-verified in a browser by the coordinator this session. `[UNVERIFIED]` = addendum finding, captured 2026-09-13, **not re-checked; may have drifted exactly as the nav item did.** I verified nothing myself — the Shopify connector is disconnected and I have no browser.

#### BUCKET 1 — SPEC-IS-WRONG. Amend the spec, change no code. (The important bucket.)

These are the frontend being **correct under D-011** and the workbook being wrong. **Building any of them re-introduces the second commerce authority.**

| # | Addendum finding | Why the spec is wrong |
|---|---|---|
| S-1 | Custom in-brand order-tracking screen (order number + status timeline) **not built**; Aftercare routes to the Shopify order-status link (p.59) `[UNVERIFIED]` | This is §18.2.1/18.2.2 already satisfied. "CP-0001" is a second order identity; "In Production" has no Shopify field. **Do not build Appendix 27 as drawn.** |
| S-2 | Discount-code entry **not present** on live cart (p.52) `[UNVERIFIED]` | AC-DSC-4: no discount campaign exists; a non-functional APPLY is a truthfulness defect (NFR-4). |
| S-3 | Checkout is the **default Shopify template**, no custom 3-step indicator (p.53) `[UNVERIFIED]` | TFRD FR-4/SR-26 **mandate** Shopify-hosted checkout. The workbook's "fully custom CARLOPHILLIPS-branded checkout" is a D-011 violation and a PCI question. |
| S-4 | Private List **entirely unbuilt**, "coming soon" placeholder (p.55) `[UNVERIFIED]` | TFRD GAP-9 / NG-3 defer it past Phase 1. |
| S-5 | Self-service returns **not configured**, routed to manual support (p.59) `[UNVERIFIED]` | Truthful per NFR-4. Feeds FR-8/GAP-6; not a launch defect. |
| S-6a | "Secure checkout · taxes included" line **missing** (p.52) `[UNVERIFIED]` | **SPEC-IS-WRONG, stands.** Tax inclusion is a commerce fact Shopify determines, and the NJ apparel exemption makes asserting it doubly unsafe. AC-AUTH-1. |
| S-6b | "COMPLIMENTARY SHIPPING & RETURNS" → "SHIPPING & RETURNS AVAILABLE AT CHECKOUT" (p.49) `[UNVERIFIED]` | **RECLASSIFIED to BUCKET 3 — REAL DEFECT (2026-09-18).** I graded the softening a correction while free shipping and free returns were *undecided*. **Boss has now decided both: returns are free, shipping is free on eligible orders.** The original assertion is therefore true, and the live copy **understates a decided policy and a real trust signal**. Fix per AC-POL-5. See `docs/policies/CP-POLICIES-v1-2026-09-18.md` §3. |
| S-7 | Cart — Optional CP Recognition (p.30), account + store credit | §18.2.3. Second identity and second monetary authority. POST-LAUNCH and re-spec as Shopify-native. |
| S-8 | Gallery spec: 360 / AI-assisted 360 / 2.5D GLB (screen 06) | Contradicts TFRD NFR-5 and APP-20/21/22. No such asset exists. |
| S-9 | "EUR 180" / "€180" throughout the workbook | **Settled with a source, not an inference:** p.49 records *"Pricing is in USD, not EUR as specified throughout the workbook (€180 → $128)."* Confirms §18.6. AC-CCY-1/-2 stand. **Closed — no Boss needed.** |

**AC-ADD-3** Bucket 1 items generate **amendment requests to UI-SPEC-v1's owner** and **zero engineering tickets**. Any ticket arising from Bucket 1 is scope that should not exist.

#### BUCKET 2 — STALE. Already resolved; cite the re-verification.

| # | Addendum finding | Live status |
|---|---|---|
| T-1 | Nav exposes "All Tshirts" (p.56) | **RESOLVED.** `[LIVE-2026-09-18]` MENU renders only ALL CATEGORIES and ALL HOODIES. Nav is data-driven and self-corrected on drafting the Tee. Dead routes 404 but are unlinked. See R-6. |
| T-2 | "Catalogue breadth is 2 categories / 2 total SKUs live (Tshirts, Hoodies)" (p.50) | **STALE.** Superseded by the Tee going DRAFT; now one category, Hoodies. `[LIVE-2026-09-18]` per coordinator. |
| T-3 | Gallery 8 images vs spec'd 12 (p.49) | **Accurate but re-scoped, not a defect.** `[LIVE-2026-09-18]` live Hoodie reports 8 IMAGES. Confirms GAP-8; my §17.6 answer stands — 8 sufficient for launch, 12 post-launch. |

**AC-ADD-4** The three remaining nav findings — **"Home", "Aftercare", "Account"** (p.56) — are `[UNVERIFIED]` and **MUST be re-checked before being graded at all.** T-1 proves this register drifts. **"Account" is the one to check first:** if a live account surface exists it engages §18.2.3, and if it does not, the finding is stale like T-1.

#### BUCKET 3 — REAL DEFECT. Re-verify, then work.

| # | Addendum finding | Grade |
|---|---|---|
| D-1 | Size chart not implemented; live panel reads *"Size guidance is currently unavailable in Shopify"* (p.57) `[UNVERIFIED]` | **Low, not launch-blocking.** Truthful, so it does not falsify anything — but it **leaks an internal system name to customers**. Copy fix. The approved S/M/L chest/length table already exists in the workbook (Appendix 22) and can simply be rendered. |
| D-2 | Contact form: no Name field, no Order Number field, free-text Subject replaced by a topic dropdown (p.54) `[UNVERIFIED]` | **Low.** The missing **Order Number** field hurts FR-8 support triage — it is how a support case binds to a Shopify order. Feeds GAP-5. |
| D-3 | Landing pre-morph state unbuilt; text-only brand mark; no "JOIN THE LIST" shortcut; circular arrow replaces "ENTER →" (p.48) `[UNVERIFIED]` | **Design debt, post-launch.** No commerce truth involved. |
| D-4 | No "BUY NOW" button; only ADD TO BAG / CHOOSE A SIZE (p.49) `[UNVERIFIED]` | **Not launch-blocking.** Removes a convenience checkout route; falsifies nothing. |
| D-5 | Category tiles show unspec'd **"1 PIECE"** count styling (p.50) `[LIVE-2026-09-18]` | **Not a defect — an unspecified state.** This is the empty/thin-category question, which is **Boss's call** (§21.2/§21.4). Do not "fix" it by inventing a rule. |

**Bucket 3 is small, and none of it blocks launch.** That is the headline: a register that reads as ~20 deviations contains **zero launch-blocking defects**, nine spec-is-wrong items, and three already stale.

### 22.2 AC-NAV-1 — survives as a standing rule, not as a finding

Detached from the retracted T-1, because the rule is sound even though the instance was stale:
- **AC-NAV-1** Navigation MUST NOT expose a category, collection, or route with no purchasable items. The nav MUST be derived from live Shopify collection membership, never from a static list.
- **AC-NAV-2** Navigation MUST NOT expose an account, credit, or member surface that does not exist (§18.2.3).
- **AC-NAV-3** A collection route with no purchasable items SHOULD return a truthful state rather than a bare 404 — **but what that state is depends on Boss's thin/empty-category ruling (§21.4 item 1), so this is specified only as far as the ruling allows.**
- **Current behaviour appears to satisfy AC-NAV-1 already** `[LIVE-2026-09-18, coordinator]`: the nav self-corrected on drafting. Recorded as a **positive finding** — the data-driven nav is doing the right thing unprompted.

### 22.3 BACKLOG RECORDED, NOT STARTED — the "Requirement / owner" fields, UI-SPEC pp.15–19

**Per instruction: recorded so they are findable, not started. Post-launch under the current posture.**

UI-SPEC-v1 pp.15–19 contain five appendix spreads of availability/recovery widgets. **Every one carries a blank line reading `Requirement / owner: ______`** — the workbook is explicitly handing these to a product owner, which is me. **Ten states, no requirements written:**

| Page | Widget states awaiting a requirement + owner |
|---|---|
| p.15 — Media / Product Availability | Video unavailable · Gallery unavailable |
| p.16 — Order & Cart | Selected size unavailable · Your bag is empty |
| p.17 — Cart & Address Validation | Discount code not recognised · Review shipping details |
| p.18 — Shipping & Payment Recovery | Shipping unavailable · Payment could not be completed |
| p.19 — Session & Post-Purchase | Checkout expired · Tracking pending |

- **BKLG-1** Write `Requirement / owner` for all ten. **Owner: Pushpa. Status: NOT STARTED. Trigger: post-launch, or earlier if a state becomes reachable in the happy path.**
- **Note for whoever picks this up:** the workbook already contains **approved copy** for several — p.19's *"Your order is confirmed. Tracking will appear when the shipment is handed to the carrier"* is exactly the truthful degradation AC-FUL-5 asks for. **Use the approved copy; do not write new.** Three of the ten (discount not recognised, size unavailable, bag empty) already have requirements in this item at AC-DSC-2, AC-CUR-10/E-CUR-4 and SR-16 — those need reconciling, not re-writing.
- **BKLG-2** These ten are the spec's *unavailability* coverage. **None of them is a thin- or empty-category state** — which is the §21.2 gap, still open with Boss.


---

## 23. CUSTOMER-FACING POLICIES (Revision 12, 2026-09-18)

**Authored as Product Owner at Boss's assignment. Artifact:** `docs/policies/CP-POLICIES-v1-2026-09-18.md` (**CP-POLICY-v1.0**) — that file is the **source of truth** for published policy text; the Shopify admin is a render target.

**Scope:** Return and refund policy, Shipping policy, Terms of service, Contact information. The Privacy policy is already published and was **not** rewritten (flagged only).

**Status: DRAFTED — NOT PUBLISHED.** Publication is Boss's step; it was correctly blocked as a shared-resource change, which is the right control for legal text. The artifact carries a publication record table to be filled on the day.

### 23.1 Standing requirements — AC-POL-1..6, U-POL-1

Specified in full at §5 of the artifact. Summary, because these are **launch requirements, not hygiene**:

- **AC-POL-1** All four policies published + Contact information set. **A missing policy is launch-blocking** — per SK-005, Shopify's chargeback guidance lists the refund policy as evidence for exactly the dispute types we would face, and with nothing published there is nothing to submit. At $128 with no restockable inventory, a lost dispute costs the garment, the shipping and the fee.
- **AC-POL-2** Policies render as reachable links in the checkout footer — **verified visually on the live checkout, not from the admin settings page.** Same discipline as AC-DEF-3: text saved in an admin is not proof a customer can reach it.
- **AC-POL-3** Published text matches the versioned file exactly; drift is a defect and corrects file → Shopify.
- **AC-POL-4 / E-POL-1** No customer-facing copy may name or imply an external producer, or use made-to-order / final-sale / personalised-goods language to limit returns. **Sourced, not invented:** `docs/design-system.md` production composition contract item 6 already requires "provider-neutral customer copy".
- **AC-POL-5** Shipping/returns copy on product and checkout surfaces must not understate free shipping or free returns now that both are decided (drives S-6b).
- **U-POL-1** Pre-launch verification. **Unverified as of 2026-09-18** — connector disconnected; nothing asserted about the live store.

### 23.2 Reconciliation

Checked against AC-REF-1..4, AC-FUL-5, AC-AUTH-1, AC-TAX-2, AC-CUR-4 and AC-ACC-4 — all consistent (table at §3 of the artifact). Two notes worth carrying here:
- The shipping policy's tracking sentence **deliberately reuses the approved workbook copy at UI-SPEC p.19** ("Tracking will appear when the shipment is handed to the carrier") rather than inventing new copy — per BKLG-1's standing note, use the approved copy.
- **AC-REF-3 is satisfied by omission, deliberately:** the policy makes no entitlement, credit or review-unlock promise, because §18.2.3 defers all of that.

### 23.3 Open for Boss — blocks publication

1. **Return destination (largest gap).** Free prepaid labels require an address returns physically go to and someone to check them before refund. **Unknown; not assumed.** This is the one item that could make the published policy untrue.
2. **`[[DISPATCH_WINDOW]]`** — I will not invent a dispatch time. An unmeetable dispatch promise is a "product not received" chargeback risk.
3. **Support alias** — recommend `support@carlophillips.com` over the personal Gmail, which appears five times across the policies. Trust, continuity, and chargeback evidence. **Also engages TFRD GAP-5**, still open on exactly this point.
4. **`[[FREE_SHIPPING_THRESHOLD]]`** — undecided per constraint. The paragraph takes the figure without rewriting, and an all-orders alternative is supplied so publication is not gated on it.
5. **Legal name casing** ("carlophillips" vs CARLOPHILLIPS) — confirm so all four policies agree.

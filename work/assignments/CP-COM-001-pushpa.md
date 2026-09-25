Class EVOLVING · Owner Sushma (dispatch) · Writers Sushma dispatches; Pushpa records results · v3.5interim (2026-09-18)

# Dispatch — Pushpa · CP-COM-001 / LB-1 rewrite

**From:** Sushma · **Date:** 2026-09-18 · **Basis:** D-025 lifecycle re-grade in state/DECISIONS-LOG.md

## What changed

Your LB-1 is graded "the happy path has never been executed". That is no longer accurate and it is making the item look larger than it is.

**Rewrite LB-1 around this position:**

| Stage | Status | Cite this |
|---|---|---|
| FR-1..FR-4 | **Proven** | Production, real browser, 2026-09-18 — PDP, S/M/L-only selection, CTA transition, add-to-bag, /bag at $128 |
| FR-5 | **Proven** | Staging, test gateway (#1005) |
| FR-6 | **Demonstrated** | Apliiq design-confirmation email — **BOSS-REPORTED, NOT VERIFIED** — plus the verified "Apliiq Dropship Fulfillment" service on the order |
| FR-7 | **Demonstrated** | Verified USPS tracking returned into Shopify |
| FR-8 | **Demonstrated** | Refunds on #1002/#1003/#1004 |
| FR-9 | **Not demonstrated**, but mimickable | A paid order left unfulfilled *is* the stalled state |

**The two things that matter for your rewrite:**

1. **Staging can mimic FR-7/FR-8/FR-9** using manual fulfilment at a manual location with a typed tracking number. Under D-011 the app is a frontend that only reads Shopify state — it cannot tell a manually-entered fulfilment from an Apliiq one. Your acceptance criteria should be written against Shopify state, not against who produced it.
2. **FR-6 and FR-7 have prior demonstration to cite** rather than being treated as unknowns. They ran accidentally, never deliberately, and were never captured as evidence.

**So LB-1 is not "can we do this" — it is "we have never done it once, on purpose, with evidence captured."** The gap is evidence discipline, not capability. Please re-scope it to require a single deliberate end-to-end run with captured artifacts, and drop the framing that treats post-checkout as an unknown.

## Provenance rules for this rewrite — non-negotiable

- The Apliiq design email is **Boss-reported**. The Gmail connector is invalidated and it could not be verified. Do not write it as a first-hand read, and do not let a criterion depend on it as fact.
- There is a **labelled inference** in D-025 that the job sat in pre-production and the dispatch leak has cost nothing so far. It is reasoning, not fact — Boss's Apliiq account is the only authority and is unchecked. Do not build a criterion on it, and do not treat the leak as costless.
- This session produced five findings from reading one surface and concluding about another. Cite the evidence class next to every claim.

## UPDATE 2026-09-18 — Boss decision D-026: Apliiq connection ESTABLISHED

**No further Apliiq acceptance test. Do not write one, and do not carry one as owed.**

**FR-6 acceptance criteria are satisfied by retrospective documentation of #1005, not by a new test.** Write the evidence record from what already exists:
- the order's fulfilment service ("Apliiq Dropship Fulfillment") — verified
- the fulfilment ID `gid://shopify/Fulfillment/4468221083854` — verified
- tracking number 9400150899563505738795, USPS — verified
- Boss's design-confirmation email — **cite as BOSS-REPORTED**, Gmail connector down (H-006), unverified

Under the launch posture that is sufficient. The gap was never capability; it was that this ran accidentally and was never captured.

**Carry SK-003's six fidelity gaps as KNOWN AND ACCEPTED limitations of staging rehearsal — not as open defects.** State plainly in the launch record that the **request→accept round-trip, Apliiq's writeback shape, and FulfillmentOrder intermediate states will never be exercised in rehearsal.** Sidekick named FulfillmentOrder intermediate states **the most likely source of live-vs-staging divergence for a headless frontend** — that one deserves its own line, not a footnote. This is accepted risk with reasoning recorded in D-026, so write it as a stated limitation a reader can weigh, not as something we overlooked.

**Useful from SK-003 for your criteria:** manual fulfilment yields an identical readable state — real `Fulfillment` object, `status: SUCCESS`, `displayFulfillmentStatus: FULFILLED`, populated `trackingInfo`. A reading app cannot tell the source. Stall detection (FR-9) is native via Flow: on *Order paid*, wait 24h, check `fulfillmentStatus != FULFILLED`.

## UPDATE 2026-09-18 — the UI spec answers things we have been deciding

`docs/reference/UI-SPEC-v1-2026-09-14.pdf` (59pp) has been read. **Read it yourself before revision 5** — it resolves several open questions and contradicts one of your framings.

**S/M/L WAS NEVER OUR DEVIATION — this one is yours to correct.** You have been treating S/M/L as a curation decision we made against Shopify's many sizes, and D-011 recorded it as "the known small deviation". **The spec always required S / M / L on the order widget.** It is not a deviation from the design; it *is* the design. Rewrite AC-CUR-* accordingly: enforcing S/M/L is **implementing the spec**, not curating away from a default. That also strengthens D-016 — a purchasable XXXL is a spec violation, not a tidiness preference.

**Categories and volume are specified, so stop treating them as open.** Screen 07: 6 groups — Hoodies, Jackets, Knitwear, Trousers, Accessories, Footwear. Screen 08: 6 items per category. Your D-9 is closed by the document, not by Boss.

**The happy path is specified too:** Landing → discovery → order/size selection → cart → checkout → confirmation → email. Reconcile your FR chain against it rather than deriving it again.

**Appendix 21:** Menu navigation is a **flat list** — Navigation, Discovery, All Categories, All Hoodies, Contact Us, Private List.

### NEW ASSIGNMENT — reconcile the V1.2 addendum gap list
A **V1.2 addendum captured 2026-09-13 against the live site** already audited production and nobody worked through it. It is a ready-made defect register. Reconcile every item, grading each launch-blocking or post-launch under D-014:
- catalogue breadth: 2 categories / 2 SKUs live (Tshirts, Hoodies) vs 6 categories mocked — now **1 category / 1 SKU**, see below
- category tiles showing an unspec'd "1 PIECE" count styling
- four navigation items absent from the spec: **Home, All Tshirts, Aftercare, Account**
- navigation grouped under DISCOVERY / MORE headings instead of the specified flat list

Note the date. That audit is from the same day the mispriced Tee went live. Production was examined and the findings were not acted on — the same failure that let a cost-basis product sell for five days. Work the list.

**CORRECTION 2026-09-18 — re-verify that register before working it.** I previously flagged that "All Tshirts" in the nav would be off-spec *and* point at nothing. **That is wrong and I am withdrawing it.** Verified in a real browser on live production: the MENU overlay renders exactly two catalogue entries, ALL CATEGORIES and ALL HOODIES. There is no "All Tshirts". The 404 collection routes exist but nothing links to them, so no customer can reach a dead link — the navigation self-corrected when the Tee went to DRAFT.

**So the addendum is PARTIALLY STALE. Re-verify "Home", "Aftercare" and "Account" against the live site before treating any of them as open.** One of its four findings has already resolved itself without anyone touching it. A five-day-old audit is a snapshot, not current state — working it as though it were current means fixing things that are already fixed, which wastes the same effort as missing things that are broken.

**Current live state:** drafting the Tee removed the Tshirts category; `/shop` shows one category, HOODIES, "1 piece". Thinner than this morning, and the right trade. But note the storefront is **not** presenting as broken — the Hoodie renders as "SIGNATURE SERIES / 001" with VIEW GALLERY at 8 images and a SHOP THE HOODIE CTA. Judge catalogue urgency on merchandising depth, not on appearance.

**Catalogue target, now concrete:** spec is 6 × 6 = 36 products. Live is 1. Minimum credible launch under your own withhold-don't-pad rule is **one category done properly — Hoodies at 5–6 products**, i.e. 4–5 more with real images, descriptions and approved retail prices. Sourcing and content, not engineering.

## UPDATE 2026-09-18 (SK-004) — gateway closed, plus two findings for your criteria

**LB-6 / D-019 is CLOSED, verified:** production Shopify Payments test-mode toggle read directly as OFF in the admin. Method matters — a direct read of the setting, not an inference from order flags.

**Write this failure mode into your acceptance criteria, because it is the dangerous shape:** with test mode ON, no real payment is captured, **but express checkout (Apple Pay / Google Pay) still completes with no visible error** because those use real cards. The customer sees a normal confirmation and believes they bought a $128 piece; we hold an order with a test banner and no money. **A silent failure presenting as a successful sale.** Any criterion that checks "did checkout succeed" must also check that money actually moved — success signals are not payment evidence.

**POD trap for your fulfilment criteria:** shipping labels purchased on **test** orders are charged for real. Test orders are not free.

**Scope simplification — the store is US-ONLY.** Markets has exactly one enabled market, so all international shipping zones are unreachable and policy text needs no international clauses. Drop any international edge cases from your register; they are unreachable states.

**Still true and still yours:** FR-5 is proven on staging's test gateway only. **No live-gateway transaction has ever completed on production.** Your happy-path criteria should distinguish "proven on test gateway" from "proven live" and never let the former satisfy the latter.

## ROUTED TO YOU — SK-006, returns and dispatch (2026-09-18)

**Process change first (D-029, Boss):** Sidekick answers now come **to you first**. I own the channel — I carry the exchange and log it as SK-NNN — but deciding what an answer means for requirements, acceptance criteria and register entries is yours, not mine. Aarti receives it after you, for technical solutioning. Answers had been going to me and onward to Boss, skipping the PO; that is the error being corrected. Full text of SK-006 is in state/DECISIONS-LOG.md — read it there, not this summary.

**YOUR BLOCKER #1 IS REAL AND IRREDUCIBLE. You were right to raise it.** Sidekick: *"The address still needs to be a real place where somebody can receive and handle returned packages. Shopify does not provide a virtual return mailbox or a physical returns facility."* This is not a configuration gap you can specify around — it is a real-world decision. I have raised it as **D-030** for Boss with Sidekick's three options (our own address/office; a third-party returns facility; the POD supplier's address — which Sidekick explicitly cautions against, since the customer should not see the supplier). Do not design around it and do not treat it as pending config. Write criteria that assume a saved Shopify location exists, and treat the address value as a Boss input.

**YOUR POLICY-DRIFT GUARD IS VINDICATED — by Shopify's own behaviour.** *"Shopify's written return-policy template is separate from the return rules, and Shopify does not automatically insert the rules into the prose of your policy. You should keep the policy wording aligned manually."* You bound policy text to your acceptance criteria to prevent exactly this. **Make it explicit:** the configured return RULES and the policy PROSE must be **verified against each other as an acceptance criterion**, never assumed consistent. This is the one place where a Shopify-native workflow does *not* keep itself honest.

**Returns are otherwise fully Shopify-native** — no separate app. Rules and eligibility windows, self-serve requests via customer accounts and the order status page, merchant approve/decline, Shopify-generated labels, tracking, inspection, refunds, exchanges, optional restocking. Note the flow is **not unattended**: customer submits, we review, we send the label. That is an operational commitment, so your criteria should cover the review step, not just the happy automated path.

**Free prepaid returns are native for US orders** (fulfilment location and customer both US — and we are US-only). **Pay-on-scan billing: Shopify charges only if the carrier actually scans the package, billed to us, never collected from the customer.** That materially lowers the cost of promising free returns — it is a genuine product option, not an aspiration. Worth a recommendation from you either way.

**Setup sequence for your criteria:** (1) return rule — window + free return shipping; (2) enable self-serve returns under Settings → Customer accounts; (3) real saved location as default return-label destination; (4) approve and send label; (5) inspect, then refund or exchange. A location can be a plain street address, need not be a warehouse, and can have "available to fulfil online orders" disabled. Changing it later affects only **newly purchased** labels.

**DISPATCH — `[[DISPATCH_WINDOW]]` cannot be resolved from Shopify.** Shopify gives native checkout delivery estimates, but there is **no documented per-product processing-time field**, so different lead times per product are not natively expressible. Workable for one active product; not a made-to-order system. Sidekick's bottom line: it *"does not automatically write your policy, does not guarantee support for every POD integration, and does not replace a supplier-specific production-time system."*

So your placeholder needs **a number Boss can actually meet** — a commitment, not a lookup. Recommended approach: conservative custom fulfilment time reflecting the real POD production window, plus real transit time, then **verify the checkout display with a test order**. Flag the number you need to Boss through me; do not invent it.

## Also for CP-COM-001 revision 5

- **D-016 is MITIGATED, not resolved** — purchase route closed, but the six curated-out sizes now display "sold out", which is untrue. SK-001 confirms our stopgap fails the "not shown as sold out" test.
- **SK-001 caveat:** its layer 1 assumes per-variant sales-channel unpublishing. Shopify channel publishing is believed to be product-level. **Unverified — do not write criteria that assume layer 1 works.**
- **AC-CAT-4** now carries the per-item price sanity check folded in from the superseded D-015.
- New products must be created **untracked / CONTINUE** to match the existing two, or they will behave differently.
- Only `apps/web` is deployed. Criteria referencing root `app/`, `lib/commerce/` or `contracts/` describe code that does not run.

## Return signal
`ITEM: CP-COM-001 | RESULT: READY_FOR_PO | EVIDENCE: revision 5 ... | NEXT: ... | OWNER: ... | RESUME: ...`
Sidekick questions go to Sushma as `READY_FOR_SIDEKICK` per state/STATUS-SCHEMA.md. Do not contact Sidekick directly.

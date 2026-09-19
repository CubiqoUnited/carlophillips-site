Class CONTROLLED · Owner Pushpa · Writers Pushpa proposes own; Sushma reconciles · v3.5interim (2026-09-17)

# Pushpa — Daily/Checkpoint Checklist

Every result: PASS/FAIL/UNKNOWN/BLOCKED/N-A + what was checked + what was found + evidence location.

- Cold start completed.
- Assigned module or item is Boss-approved before work proceeds.
- Requirement-to-release trace intact for active items.
- Acceptance criteria are observable, not vague.
- Negative and edge cases covered for active stories.
- Test/UAT backlog current.
- PRD.md-vs-live drift checked.
- Staging evidence and corrections verified against the approved story, not assumed.
- Measurable stop condition in state/SCOPE.md checked — flag drift into unscoped hardening.
- Independent P1/P2 grading of relevant backlog items, recorded in this checklist's own findings, not overwriting another role's grading.

---

## Findings — 2026-09-18 live-store requirements finalization

Basis: first-hand Shopify Admin read 2026-09-18 (H-003 cleared). Full requirements at `work/items/CP-COM-001.md`. H-002 remains TABLED and was not re-opened; only *required behavior* was defined, not real-order execution proof.

- Cold start completed — PASS (AGENTS.md, SCOPE, BLOCKERS, PROPOSALS, PRD, canonical-requirements read).
- Assigned module Boss-approved before work proceeds — PASS (Boss-directed finalization against live data).
- Requirement-to-release trace intact — PARTIAL. Traceable for the Hoodie lane; BROKEN for the Rapid Logo Tee, which is ACTIVE and has taken a real order with no release record, no approved price, and no approved variant set in the repo. Evidence: live store read vs. absence of any Tee release record.
- Acceptance criteria observable, not vague — PASS. AC-FUL, AC-INV, AC-PRICE, AC-DEMO, AC-TAX, AC-REF each state an observable pass/fail condition.
- Negative and edge cases covered — PASS. 40 edge/negative cases recorded (E-FUL 1-10, E-INV 1-7, E-PRICE 1-8, E-DEMO 1-4, E-TAX 1-5, E-REF 1-3).
- Test/UAT backlog current — PASS. U-FUL 1-3, U-INV 1-3, U-PRICE 1-3, U-DEMO 1-2, U-TAX 1-2 added. All UNRUN — none of these are claimed as executed.
- PRD.md-vs-live drift checked — ~~**FAIL**~~ **[SUPERSEDED by Revision 2 below — re-graded PARTIAL; drift (2)'s "real paid order" premise is retracted]**. Three confirmed drifts: (1) PRD scopes the Signature Hoodie to S/M/L; live store shows 9 variants. (2) PRD guarantees Staging never submits an order or enters payment; order #1005 is a real paid order with a real customer and shipping address. (3) PRD requires "unchanged inventory" as a Staging pass criterion; inventory has changed and one variant is negative. Correction proposed at `state/PROPOSALS.md` `2026-09-18T120000Z-pushpa-prd-live-state-corrections`. I did not edit PRD.md — not my file.
- Staging evidence verified against approved story, not assumed — **FAIL for order #1005**. `fulfillmentStatus FULFILLED` with an empty `fulfillments` array is not evidence of fulfillment. Graded P1 (D-FUL-001), matches open blocker H-004.
- Measurable stop condition in state/SCOPE.md checked — PASS, with a flag. SCOPE's stop condition is the Gate 12 migration; this commerce work is NOT inside SCOPE Included and must not be built against until Boss adds it or approves CP-COM-001 as the one module run through the Boss→Pushpa→ADR→build loop. Requirements definition is in my lane; build is not authorized by this document.
- Independent P1/P2 grading recorded — PASS. P1: D-FUL-001 fulfillment integrity, cost-basis pricing, POD inventory misconfiguration. P1-conditional: NJ zero tax, pending the E-TAX-1 positive control. P2: refund presentation, demo-data removal, PRD variant drift. This grading is mine and overwrites no other role's.

Blocking Boss decisions **[SUPERSEDED by Revision 2 below — D-1 no longer blocking, D-2 withdrawn, D-6 added]**: D-1 (Staging store holds a real paid customer order, contradicting the PRD no-order rule — unenforceable until resolved), D-2 (#1005 remediation, touches a real customer), D-3 (approved Tee retail price), D-4 (authorization to delete demo products), D-5 (whether the E-TAX-1 positive control is authorized under the H-002 deferral).

Product-fit approval status: NOT GRANTED for any build. No ADR exists for this scope yet.

### Revision 2 — 2026-09-18, same day: two findings retracted

Corrected by direct GraphQL read of order #1005, superseding the `get-order` MCP convenience-tool read the original findings rested on.

- **RETRACTED — "Staging evidence verified against approved story: FAIL for #1005."** That FAIL is withdrawn. #1005 carries fulfillment `gid://shopify/Fulfillment/4468221083854`, SUCCESS, USPS, tracking 9400150899563505738795, working URL. The empty `fulfillments` array was an artifact of a tool that does not populate the field. **I graded a P1 defect against a named customer on a field a tool never fills in — the grading was wrong, not merely premature.** Standing lesson, structurally identical to H-003: an absent field from a convenience tool is not evidence of an absent record; confirm a negative against the source API before grading it. H-004 should be closed as invalid.
- **RETRACTED — "#1005 is a real customer order."** It is `test: true`, gateway "bogus", no money moved, store owner's own account. I treated a customer name and shipping address as proof of genuineness and never checked the `test` flag.
- **Consequence — closure reopened.** I had CLOSED "payment/order capture proven by a genuine order, not a simulation." It was a simulation, which is what I explicitly ruled out. Reopened as O-7, graded P1. PRD's own cart-activation clause already governs it: test evidence is `evidence_only`, never operational readiness. Not over-closing the other way either — fulfillment/tracking do work, on a test order.
- **PRD-vs-live drift — re-graded FAIL → PARTIAL.** Drift (1) 9 variants vs S/M/L stands. Drift (3) "unchanged inventory" stands (a test order still drove a variant to -1). Drift (2) the no-order guarantee weakens to P3: the PRD text is contradicted on its face, but with no real customer and no charge it is a wording question, not an integrity failure.
- **Re-graded:** cost-basis pricing P1 → P2 (concern stands in full; no one was charged, so latent rather than active). Negative POD inventory P1 — stands. Demo snowboards P2 — stands. NJ tax restraint — stands, and R-2 strengthens the case for authorizing E-TAX-1.
- **Boss decisions now:** D-1 no longer blocking (recommend amending the PRD to permit test-gateway orders); D-2 withdrawn; D-3 (Tee retail price), D-4 (delete demo products), D-5 (authorize E-TAX-1, now recommended) stand; **D-6 new** — O-7 live-gateway capture sits inside tabled H-002; flagging only, not requesting re-entry.
- Staging acceptance sign-off: not blocked by D-1 any longer, but still NOT GRANTED — O-2, O-3, O-4, O-7 remain open and no ADR exists.

### Revision 3 — 2026-09-18: re-derived against the Boss architectural directive

Directive: "Shopify is the authoritative engine; we are just a frontend." Plus the environment rule (staging = full happy path, test payments only, MUST NOT dispatch; production = real payments, real dispatch). Full re-derivation at `work/items/CP-COM-001.md` section 0b.

- **Test applied to my own criteria:** does this tell our frontend what to do, or tell Shopify what to be? The latter is not an app acceptance criterion.
- **RETIRED (Shopify owns them; re-specifying is duplicated work and a divergence risk):** AC-INV-1/-2/-4/-6/-7, AC-TAX-3/-4/-5, AC-FUL-2, AC-PRICE-1/-3/-6/-7, AC-CAP-1..3 as implemented gates. Reclassified as Shopify *configuration* requirements SC-1..SC-5 — different owner, not deleted.
- **SURVIVES as genuinely ours:** curation (S/M/L, ACTIVE/DRAFT), presentation of Shopify state (AC-FUL-1/3/4/5/6, AC-INV-3/-5, AC-TAX-2, AC-REF-1..4), environment separation, and a NEW group AC-AUTH-1..5 (non-assertion: never compute/cache/default a value Shopify owns; Shopify wins disagreements and we surface them). The coordinator's "thin, presentational plus curation" read was right in shape; non-assertion is the category it understated, and it is the discipline the directive actually demands.
- **O-4 demo data — CLOSED** (both snowboards deleted by Boss). But the vendor-allowlist guard lost its only fixture and is now **UNVERIFIED**. Replacement U-DEMO-1R: a synthetic non-allowlisted-vendor fixture in repo test fixtures, running every CI run — not a real junk product kept in a live store.
- **Curation graded P1.** Frontend hiding of XL/XXL/etc. is NOT enforcement: a direct cart permalink would still produce a real Shopify order for a size we do not sell, and we would owe the customer that shipment. AC-CUR-1 requires Shopify-side enforcement; frontend allowlist is defence in depth only. Curated-out sizes are withheld silently, never shown greyed-out (we do not sell them; they are not out of stock).
- **Environment rule conflicts in my own prior text — declared and amended:** AC-FUL-8 is now production-only; staging UAT may exercise fulfilment *presentation*, never *execution*. O-7 re-graded from P1 defect to not-a-defect (staging test-only is the design).
- **NEW Q-1, P1 pending triage:** staging test order #1005 carries USPS tracking 9400150899563505738795. A real carrier tracking number on a staging order is the shape of a dispatch that should have been impossible. Could be simulated, an Apliiq sandbox artefact, or a real label purchase — I cannot tell from order data. **Environment rule sign-off withheld until resolved.**
- **D-3 Tee price — DEFERRED.** Tee is DRAFT and parked on Apliiq design questions; pricing it now decides it twice, since those questions may change the cost basis. Recorded AC-TEE-2: the -1 inventory and cost-basis prices are *parked*, not fixed — DRAFT→ACTIVE is one click and would expose them instantly.
- Decisions now: **D-7** (Q-1 dispatch triage, blocking), **D-8** (confirm the 6 curated-out variants + approve Shopify-side enforcement), D-5 (E-TAX-1, still recommended). D-1/D-2/D-4 closed; D-3 deferred; D-6 folded into O-7's re-grade.
- Staging acceptance sign-off: still NOT GRANTED — Q-1 unresolved, curation unenforced, no ADR.

### Revision 4 — 2026-09-18: launch posture re-grade

Boss posture: working happy path on staging.carlophillips.com and www.carlophillips.com ASAP; 5-10 items per category; **if not blocked by a P1 or showstopper, we launch.** Full text at `work/items/CP-COM-001.md` sections 14-16.

- **Happy path written (section 14)** — HP-1..HP-9, browse → product → variant → cart → checkout → payment → confirmation → fulfilment → tracking, with pass criteria per step and STAGING/PRODUCTION variants. It did not exist as an artifact before. HP-8 is the only step that genuinely differs between environments, and it is where the leak sits. **Neither U-HP-1 nor U-HP-2 has ever been run — no happy-path evidence exists in this repo. That is the largest gap to launch.**
- **LAUNCH-BLOCKING:** LB-1 happy path never executed · LB-2 curation minimum (curated-out variants unpurchasable in Shopify) · LB-3 cost-basis pricing · LB-4 staging→Apliiq dispatch leak · LB-5 minimum viable catalogue · LB-6 correct gateway per environment.
- **I was wrong on pricing and am re-grading my own P2 → P1 LAUNCH-BLOCKING.** I graded the Tee's dormancy, not its state at launch. DRAFT→ACTIVE is one click and that click is the launch action; worse, the 5-10 item target *requires* activating parked products, so the condition I called hypothetical is the plan. Cost-basis prices on a live gateway lose money on every sale — a revenue-negative launch scales damage with success.
- **Q-1 ANSWERED:** #1005's fulfilment service is Apliiq Dropship Fulfillment, USPS, 2026-09-17. Staging did dispatch to a real fulfiller. The `test: true` flag protected the payment and nothing downstream — Apliiq sits past the gateway and never saw it. **Split grading:** not a production showstopper (dispatch there is intended, and this is accidental proof Shopify→Apliiq→USPS works), but launch-blocking for staging, because every happy-path test would otherwise manufacture and ship a real garment. Added AC-DIS-1..4 for production dispatch control. Open: whether Apliiq charged or produced.
- **Curation split:** minimum (6 variants unpurchasable in Shopify; E-CUR-1/U-CUR-2 permalink test passes) is launch-blocking. The generalised allowlist, drift detection, and DOM/sitemap absence are post-launch.
- **Moved to POST-LAUNCH, plainly, including my own work:** AC-AUTH-1..5, AC-FUL-3/4/5/6 edge handling, AC-INV-2/-4, all tax criteria and E-TAX-1, AC-REF-1..4, U-DEMO-1R, and all 40 original edge/negative cases except E-CUR-1 and E-ENV-1/-2 which I promoted. Most of what I wrote does not block launch and I am not defending it.
- **New: catalogue readiness (section 16, LB-5).** "Category" = garment type = Shopify collection (needs Boss confirmation, D-9). Floor: one category with 5 launch-ready items; thin categories withheld, not padded. AC-CAT-4 per-item standard: ACTIVE, approved retail price, real image with alt text, real description, variants curated and curated-out ones unpurchasable, approved vendor, POD inventory configured. Partial readiness is not readiness. Honest gap: 4 more products need real images, descriptions, and approved prices — a content and sourcing effort, not engineering.
- Decisions: D-7 closed (Q-1 answered), **D-8** (curate-out list + Shopify enforcement, now launch-blocking), **D-9** (category definition, sets launch volume), **D-10** (accept the pricing re-grade). D-5 post-launch.

### Revision 5 — 2026-09-18: negative-inventory finding retracted

- **RETRACTED — "negative POD inventory, P1."** Both products: `tracksInventory: false`, `inventoryPolicy: CONTINUE`, `inventoryItem.tracked: false`, `availableForSale: true` on every variant including the black/m at -1. Root cause: `inventoryQuantity` on an **untracked** item is a meaningless counter, not a stock level. Nothing blocked, nothing oversold.
- **Third invalidated finding this session, all one error class.** Empty `fulfillments` array (tool artifact) · customer name read as a real order without checking `test` · a counter on an untracked item read as stock. Plus H-003's connector green light. **Standing lesson I am adopting into my own practice: confirm a negative against authoritative state before grading it.** Absence, zero, and negative are not findings until the authoritative record says so. Three corrections is enough evidence that this is my failure mode, not bad luck — I will verify before grading rather than after being corrected.
- **AC-INV-3 retired** — code reads `availableForSale`, not inventory counts, so it describes a non-existent risk. **AC-INV-5 survives** — "only N left" on a made-to-order item is untruthful regardless of configuration; it is a rule about copy we must not write. SC-1 satisfied; SC-2 withdrawn.
- **Positive finding recorded as C-6:** both products correctly configured for POD. De-risks HP-3 and HP-4. Folded into AC-CAT-4 — new items must be untracked with CONTINUE policy or they will not be sellable like the existing two.
- **Unaffected:** LB-3 cost-basis pricing re-grade to P1 launch-blocking stands. LB-1, LB-2, LB-4, LB-5, LB-6 stand.

### Revision 6 — 2026-09-18: pricing grading overruled by Boss; LB-3 withdrawn

- **RETRACTED — LB-3 "cost-basis pricing is P1 launch-blocking."** The push to re-grade P2→P1 came from the coordinator, who has stated that push was wrong and asked the reversal be recorded as theirs. Recorded. My own part: I accepted the argument without testing it.
- **Boss's basis, supported by the evidence:** the Signature Hoodie — the actual launch product — is **$128.00 uniformly across all 9 variants**, deliberate retail pricing. The Tee is $13.34-$16.34 varying by size, the Apliiq cost-table shape, and it was a test run built to prove we could add and order a product. The real product is priced correctly; the disposable one is not. "The Apliiq→Shopify price path is unguarded, so the next 5-10 products arrive mispriced" does not survive that — one mispriced sample, and it is the throwaway sample, is not a pattern.
- **R-4 is the most instructive entry in my R-series.** R-1/R-2/R-3 graded a *defect* on thin evidence (empty array, customer name, negative counter). R-4 graded a *risk* on thin evidence. **No tool misled us this time — we reasoned past the evidence on our own**, which is harder to catch because there is no artifact to re-read. Extending my R-3 lesson: absence, zero and negative are not findings until the authoritative record says so, **and a single data point is not a pattern.** Before grading a systemic risk I must name more than one instance of it.
- **Survives, small:** a price sanity check at item intake, folded into AC-CAT-4 (deliberate retail figure, not a provider cost figure; tells are cost-table cents patterns, unapproved per-size variation, implausibility against the $128.00 benchmark). Not a blocker, not its own group. AC-PRICE-LB1/-LB2/-LB3 withdrawn as gates.
- **LAUNCH-BLOCKING, re-issued:** LB-1 happy path never executed · LB-2 curation minimum · LB-4 staging→Apliiq dispatch leak · LB-5 minimum viable catalogue · LB-6 correct gateway per environment. **LB-3 removed.**
- **Decisions:** D-10 withdrawn (Boss answered opposite). D-3 re-scoped — approved retail figures apply only to genuinely new products, not the parked Tee. D-8 and D-9 stand.

---

**Run format is binding: `governance/CHECKLIST_RUN_PROTOCOL.md`.** Write the run to
`state/checklist-runs/{YYYY-MM-DD}/{role}.md`, one line per check:
`- [VERDICT] C-n — <checked> — FOUND: <found> — EVIDENCE: <pointer>`.
Verdicts are PASS / FAIL / UNKNOWN / BLOCKED / N-A. `EVIDENCE:` is mandatory on
every line including PASS — an unevidenced PASS is counted as UNKNOWN.

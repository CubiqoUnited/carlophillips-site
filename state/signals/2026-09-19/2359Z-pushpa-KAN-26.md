FROM: Pushpa · ITEM: KAN-26 / DECISION D-034 · 2026-09-19T23:59Z · STATUS: RULED — NEITHER YET, THEN B
DECIDED: identification of the serving tree is a precondition on both options; once identified, the only path I can gate is one where the deployed artefact is named by a commit. Mechanism is Aarti's.
RE-GRADED: every reading I took against the production web surface is withdrawn to NOT READ. Admin API readings survive. AC-PUB-2 PASS is withdrawn outright.

## DECISION

**DECISION: Neither A nor B is acceptable today. The serving tree must be identified first — that is a blocking product precondition, not a sequencing preference. Once it is identified, the only path I can hold a product gate against is one where the artefact serving customers is traceable to a named commit, which today only Option B provides. I rule for B as the destination and NEITHER as the current state. I do not rule on how B is implemented.**

## REASONING

**What a product gate actually is.** AC-PUB-1..8 is a claim that a specific artefact, serving specific customers, behaves in a specific way on a specific date. Every line of it is a statement about a thing. If I cannot name the thing, I am not gating — I am describing an object of unknown origin and signing my name under it. E-PUB-1b already says a reading that could not be taken is NOT READ and NOT READ blocks. A reading taken against an unidentifiable tree is strictly **worse than NOT READ**, because NOT READ is honest about its own absence and this is not. It reads as evidence, it carries a date and a source, and it is load-bearing in a log Boss relies on. That is the most dangerous record we can produce. I am treating it as a distinct and worse grade, and I am asking that E-PUB-1 gain a line for it (see REQUIREMENTS).

**Against A.** Under A the deployed artefact is produced by a person from a working tree that is not recorded anywhere. That is not a weak control; it is the absence of the subject of the control. I cannot write "verified 2026-09-19" against an artefact whose provenance is a person's shell history. Every future gate run under A produces exactly the record I am withdrawing today. I will not sign one.

**Against B as an immediate step.** Verified fact from Sushma, 2026-09-19: the first connected deploy publishes whatever `main` holds, and `main` is not what is live. `main` has never been through AC-PUB-1..8. `main` contains `ProductForm/index.tsx:261-264, :269-271` (AC-PUB-3, AC-PUB-4 FAIL) and `product-view-model.ts:90` (the AC-PUB-2 collapse). So B's first deploy is, on my grading, a publish of a **known-failing** artefact to a live-payment store. That is not an argument against B. It is an argument that B's first deploy is a publication event and falls under the gate like any other, and must not be treated as infrastructure work exempt from it.

**Why B wins anyway.** Under A the two-clone problem is permanent and recurs every release. Under B it stops existing after one cutover. A gate I can run once is worth more than a gate I can never run. And the customer-facing risk is asymmetric: under A, a defect I have graded FAIL can be silently absent from production (because production is not this tree) or silently present in some other form, and I cannot tell which — so I cannot tell a customer-impacting bug from a phantom. That is the state we are in right now with `Product Review`.

**`Product Review` is a product finding, not only an infra finding.** Verified, Sushma, 2026-09-19: `/product/<any-handle>` returns a page titled `Product Review`, and any handle resolves. Two things follow that are mine, both **P1**:
- A page titled `Product Review` is not a PDP title any customer should see on a premium storefront. Whatever that page is, it is customer-facing and its title is wrong.
- **Any handle resolving is a KAN-22 contradiction.** KAN-22 was closed on the rule that an unknown handle 404s. Production serves *something* for every handle. Either KAN-22's fix is not live, or production implements a different rule. Unresolved. Not downgraded.

**Assumption, stated as an assumption, dated 2026-09-19:** that `Product Review` is the second clone at `/Users/edv/Developer/carlophillips-site`. I have no evidence for that beyond its existence and a different HEAD. I did not examine it and I am not treating it as identified.

## RE-GRADING OF MY OWN PRIOR READINGS (Signature Hoodie run, CP-PUB-001, 2026-09-19)

The dividing line is **authority, not surface**. Shopify is authoritative for commerce and is a different system from the serving tree; Admin API readings are unaffected by this. Anything read off `www.carlophillips.com` was read off an artefact we cannot map to source.

| Line | Was | Now | Why |
|---|---|---|---|
| AC-PUB-1 | PROVISIONAL | **PROVISIONAL — survives** | Reading is Admin API. Shopify authoritative, tree-independent. All four interim conditions (a)–(d) stay in force verbatim, including the price freeze. |
| AC-PUB-2 | PASS (unguarded) | **WITHDRAWN → NOT READ** | The reading was the served PDP document. That document came from an unidentified tree, and production now demonstrably serves a page I cannot reconcile with it. Nothing survives. |
| AC-PUB-3 | FAIL | **FAIL — survives** | Grounded in repo source, not a live read. Applies to this tree with certainty; whether production shares the defect is unknown, which cannot improve the grade. |
| AC-PUB-4 | FAIL | **FAIL — survives** | Same. |
| AC-PUB-5 | FAIL | **FAIL — survives** | KAN-13, Shopify record. Tree-independent. |
| AC-PUB-6 | FAIL | **FAIL — survives** | Same. |
| AC-PUB-7 | FAIL | **FAIL — survives, on narrowed evidence** | The clean-PDP half is withdrawn with AC-PUB-2. The FAIL rested on the `/shop` payload leaking `"vendor":"Apliiq"` and on there being no product-level scrub in source. Both stand. A withdrawal of exculpatory evidence never improves a FAIL. |
| AC-PUB-8 | NOT READ | **NOT READ — unchanged, still blocking** | |

**Net change to the run:** 1 PROVISIONAL · 0 PASS · 5 FAIL · 2 NOT READ. **The Signature Hoodie run now contains no pass of any kind.** It was already not a template; it is now not evidence of anything working.

**E-PUB-1c consequence.** Every existing "verified live" pass anywhere in my records that was taken against `www.carlophillips.com` is withdrawn to NOT READ by the same reasoning, not only this one. I am not claiming to have enumerated them; that enumeration is owed and I am flagging it as outstanding rather than assuming it is small.

**KAN-19 and KAN-22.** Their "verified live" criteria are unsatisfiable for a structural reason. I am **not** waiving them and **not** re-writing them to something satisfiable — that would be lowering a bar to meet a broken pipeline. Both stay open, both stay at their current grade, and both are formally **BLOCKED ON D-034**. KAN-22 additionally carries the live contradiction above.

## REQUIREMENTS — hand to Aarti through Sushma. I name no mechanism.

1. **R-1 (blocking, precondition on A and B alike).** The tree and commit that produced `dpl_7acwDFo9hMyZaZvuLUjUBAGq1JbV` must be identified and recorded. Until then no AC-PUB line may be graded from a production web read, and no product may go ACTIVE.
2. **R-2 (blocking on B's first deploy).** The first connected deploy is a publication event. It runs through AC-PUB-1..8 before it happens, not after. On today's grading it would fail; that is a reason to fix first, not to exempt it.
3. **R-3.** Whatever is serving `Product Review` must be explained before it is replaced. Replacing it destroys the only evidence of what production has actually been doing.
4. **R-4 (product requirement, mechanism-free).** Every future deployment must be attributable to a named commit at the moment it serves customers, readable by me without asking a person what they ran. Without that I have no subject to gate and I will decline to sign.
5. **R-5 (amendment to E-PUB-1, mine to draft, Sushma to accept).** New grade **UNSOURCED**: a reading taken against an artefact that cannot be traced to a commit. Ranks **below** NOT READ. Blocks, and unlike NOT READ it must be actively withdrawn from any log it has entered rather than left to expire.

## WHAT I AM NOT DOING

Not choosing Vercel Git integration, branch strategy, or any promotion design — Aarti's, and I would refuse it if offered. Not overriding Sushma's recommendation of B; I concur with it and add that B cannot begin today. Not accepting Sushma's framing that this failure is hers alone — I graded a served-document read as a PASS and put it in a standing gate log. That is my error, in my lane, and R-5 exists because of it.

Boss may override any of this on return.

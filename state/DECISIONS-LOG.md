---
id: DECISIONS-LOG
owner: sushma
class: evolving
version: 1.0
last_updated: 2026-09-18
last_verified: 2026-09-18
review_frequency: every decision raised or answered
budget_lines: none (append-only history)
---

Class EVOLVING · Owner Sushma (sole writer of new entries; Boss writes DECISION lines) · Writers roles propose via Sushma · Read standing for Boss · v3.5interim (2026-09-18)

# Decisions Log

**This is the single home for Boss decision requests.** Established 2026-09-18 by Boss operating instruction. Not a scratchpad, not a duplicate of state/PROPOSALS.md.

## Operating rule (durable — applies to every role, every cycle, not a one-off)

No role may ask Boss an open-ended question. Every decision request MUST contain, in this order:

1. **QUESTION** — one line, answerable.
2. **OPTIONS** — at least two, spelled out concretely. "Do it or don't" is not two options unless both are described in full.
3. **IMPACT** — per option, what it costs and what it unblocks.
4. **RECOMMENDATION** — the asking role's own call, with reasoning. A request without a recommendation is incomplete and should be returned.

Format rules:
- **Newest entry on top**, directly under this section. The log reads as a sequence, most recent first.
- Append-only. Never rewrite or delete an entry. A changed answer is a NEW entry that references the old ID.
- Entry ID: `D-NNN` sequential, plus UTC timestamp.
- Boss answers by appending a `**DECISION:**` line to the entry. That is the only in-place edit permitted, and it only ever adds.
- Status is one of: `OPEN` / `DECIDED` / `SUPERSEDED`.

**Source ranking (added 2026-09-18 with D-021):** verified Admin API read > Sidekick answer > convenience/summary tool > displayed UI status. A Sidekick answer that contradicts a verified API read loses. Sidekick is external input, never authority, and never overrides a Boss decision. A "confirmed with Sidekick" claim is valid only with a recorded round trip (question as asked, date, answer) — Boss is the only one who can reach Sidekick.

**Interpretation rule (strengthened 2026-09-18 after a THIRD instance — negative inventory graded P1 against an untracked counter).** A field's presence or value is not self-interpreting. Confirm what a field *means in its configuration context* before grading on it. Three instances now: a connector's green light over a dead token; an empty `fulfillments` array a tool never populates; an `inventoryQuantity` of -1 on an untracked item, which is a meaningless counter and not a stock level. All three produced confident gradings of things that were not true. The rule below still applies; this extends it from *where you read* to *what the reading means*.

**Evidence rule (added 2026-09-18, from H-003 and H-004):** every OPTION and IMPACT must rest on an authoritative-source read, not a convenience or summarizing surface. Two same-day failures established this — a connector UI reading "connected" over a dead OAuth token, and an MCP convenience tool returning an empty `fulfillments` array it simply does not populate, which caused a P1 defect to be raised against nothing. A convenience tool's output is a lead, never evidence. Absence in a summary is not absence in the system. A decision request built on an unverified convenience read is incomplete and is returned.

Relationship to other files: `state/PROPOSALS.md` holds proposed *text changes* to governed files. This log holds *decisions Boss must make*. If a decision results in a file change, it goes to PROPOSALS.md afterward and cites the D-number.

**Single numbering scheme.** `D-NNN` in this file is the only valid decision ID. Role-local schemes (e.g. Pushpa's `D-1`…`D-6` inside work/items/CP-COM-001.md §9) are reconciled here and must not be cited as decision IDs elsewhere.

---

# RANKED OPEN DECISIONS — read this section first

**Re-graded 2026-09-18T050000Z under the D-014 launch posture, re-ranked T060000Z.** One test applied to everything: *does this stop us launching, or cost real money/obligation on contact?* If no, it is post-launch.

## LAUNCH-BLOCKING — Boss must answer these to unblock a launch

**Three blocking** (re-ranked T150000Z; D-019 closed verified).

## LAUNCH READINESS — Sushma's assessment, confirmed not assumed

**Largely yes: no P0 remains, and no item that costs money on contact remains.** D-019 was the last true showstopper and it is verified closed. The launch call is substantially Boss's judgement now rather than a blocked state. **Three qualifications I will not round off:**

1. **D-024 is still live on production right now.** I re-checked at T150000Z: `/checkout-design-review` returns **200** carrying "Private staging review" and "Draft". It costs credibility rather than money, so under Boss's own test it is **not** a showstopper — but "launch decision is Boss's judgement" should not be read as "the site is clean". It is one fix away and nobody is blocked on it.
2. **No live-gateway transaction has ever completed on production.** D-019 proves the toggle, not the path. FR-5 is proven on staging's *test* gateway only. The first real customer will be the first real transaction — and per SK-004 the express-checkout failure modes are exactly the silent kind. **Recommend one real low-value live purchase, by us, before or immediately at launch.** That is a reserved Boss gate (real payment) and therefore his call, not mine to dispatch.
3. **The Apliiq account may hold real charges** — SK-004: shipping labels on test orders are charged for real. This is a financial reconciliation, not housekeeping, and it is unchecked.

**None of the three blocks a launch. All three should be seen before choosing to launch, not after.**

**Standing practice added earlier: before raising a decision, read `docs/reference/`.** D-020 was escalated to Boss when the answer sat in a 59-page spec in the repo.

**Where the launch actually stands.** Production is now inspected: Hoodie ACTIVE, correctly curated S/M/L at $128; Tee DRAFT. **D-017 catalogue depth is confirmed as the dominant blocker** — production carries exactly one sellable product against a 5–10-per-category target, and it is the longest-lead item on the board. That confirmation is now based on a production read rather than an assumption, which is the distinction D-027 was about.

**But it is not the only one, and three things stop me calling it so:**
- **D-024** is a live defect on production this minute — staging language customer-reachable on www — and needs no store access, so it remains the most movable item.
- **D-019** is genuinely unknown, not merely unfinished: the production payment gateway has **not** been confirmed live. Do not grade it either way. If it is inverted, that is a showstopper, and D-027 is what happens when an unexamined thing is assumed fine.
- **D-013** is now harder, not easier: H-007 means the staging change must be made by hand, since the connector points at production.

(Earlier re-grade T080000Z.) **Two gates dominate everything else:** H-005 — Boss must reconnect the Shopify connector, since every store-facing blocker needs it; and D-023, which needs no store access at all and is therefore the one thing that can proceed right now.

| Rank | ID | One line | Why it stops a launch |
|---|---|---|---|
| 1 | **D-017** | Catalogue depth — **the whole remaining substantive gap** | Spec: 6 categories × 6 items = **36 products**. Live: **1 category, 1 product**. Minimum credible launch = Hoodies at 5–6, i.e. **4–5 more hoodies with real images, descriptions and approved retail prices**. Sourcing and content, not engineering. **Urgent for merchandising depth, NOT for launch appearance** — the Hoodie presents deliberately ("SIGNATURE SERIES / 001", 8 images), so the store reads intentional rather than broken (D-028). |
| 2 | **D-024** | DEF-2 — staging language reachable on the production site | `/checkout-design-review` returns 200 on production carrying "Private staging review · Draft". Customer-reachable. Verified twice. Most movable item — no store access needed. Owner Aarti. |
| 3 | **D-013** | Staging dispatch — the ENABLER for FR-7/FR-9 rehearsal | SK-002's manual-location pattern. **Now by hand only (H-007)** — connector points at production, so Aarti cannot script it. Unblocks D-018. |
| 3 | **D-018** | Happy path — one deliberate run with captured evidence | Mechanically straightforward once D-013 lands; FR-6 now closed by retrospective documentation (D-026). Execution + evidence capture, no unknowns. |
| — | **D-020** | What is a "category"? | **CLOSED — answered by `docs/reference/UI-SPEC-v1-2026-09-14.pdf`.** 6 named groups; 6 items each. Never needed a decision. |
| 5 | **D-018** | Happy path — one deliberate run with captured evidence | Mechanically straightforward once D-013 lands; FR-6 closed by retrospective documentation (D-026). Execution + evidence capture, no unknowns. |
| — | **D-019** | Production gateway LIVE | **CLOSED, VERIFIED** — test-mode toggle read directly as OFF in the admin. Proves the setting, not a completed live transaction. |
| — | **D-016** | Curated-out variants | **MITIGATED 2026-09-18** — six variants set DENY/tracked/`availableForSale: false`, purchase route closed. No longer launch-blocking. Not resolved: they now display "sold out", which is untrue. Pending the first Sidekick question. |
| — | **D-005** | Approved retail figures — **genuinely new products only** | Narrowed by the D-015 supersession: the parked Tee does not need pricing. Applies to what D-017 creates. Boss must supply numbers. |

**SUPERSEDED — D-015** (cost-basis pricing as a blocker). Boss overruled; evidence supports him. The Hoodie is $128.00 uniformly across all 9 variants — the real product is priced correctly and only the disposable test product is not. My "unguarded intake path" argument generalised from n=1 past a counter-example in the same store. What survives folds into Pushpa's AC-CAT-4 per-item check; no gate, no board row. Full reasoning in the D-015 entry.

**CLOSED — D-012a, not a risk.** `totalInventory: 0` cannot cause a false "sold out": the commerce code reads `availableForSale`, not inventory counts (`lib/commerce/shopify-checkout-server.js` lines 268/284/432/454, `lib/commerce/variant-presentation-policy.js`), and Shopify reports `availableForSale: true` on all 9 Hoodie variants because the product is `tracksInventory: false` with every variant on `inventoryPolicy: CONTINUE`. Correct POD configuration. Well-formed question, clean answer, no work needed.

## POST-LAUNCH — real, but does not stop a launch

| ID | One line | Disposition |
|---|---|---|
| **D-013** | Staging dispatched to Apliiq Dropship (confirmed, #1005, USPS 2026-09-17) | Cost leak, not showstopper — but fix before *repeated* staging rehearsal, since cost scales with the happy-path testing D-014 mandates. Store-settings change, cheap enough to just do. |
| **D-010** | Register DECISIONS-LOG in AGENTS.md | Governance hygiene. Was rank 1; honestly downgraded — it does not stop a customer buying a hoodie. |
| **D-002** | H-001 58-vs-45 reconciliation | Governance hygiene. Downgraded. |
| **D-003** | BOSS-001 structure acceptance | Governance hygiene. Downgraded. |
| **D-001** | Gate 13 scope | Downgraded; still parked behind D-012b. |
| **D-012b** | Full audit-and-retire of the 184K custom commerce layer | Duplicated code is untidy, not blocking. |
| **D-008** | Is payment capture intended to stay unproven? | Flag only. Note: Production launch with real payments answers it in practice. |
| **D-009** | PRD 42/55 wording | P3. Substance already resolved by D-011's environment rule. |
| **D-007** | Authorize E-TAX-1 | Answered in principle by D-011. Tax is Shopify's under the directive. |

**Gate 12 itself is now post-launch.** It is structural governance and blocks nothing a customer touches. Recorded so the downgrade is explicit rather than implied.

## Decided

| ID | Outcome |
|---|---|
| **D-011** | GOVERNING DIRECTIVE — Shopify authoritative, we are a frontend. Binding on all roles. |
| **D-006** | Approved, demo snowboards permanently deleted. Vendor-allowlist fixture lost as a consequence — recorded in the entry. |
| **D-005** | Tee set to DRAFT/parked; price question survives for when it returns to ACTIVE. |
| **D-004** | Recorded reversal — commerce facts asserted then retracted. |

## Cross-reference — Pushpa's local numbering → canonical IDs

A reader who sees `D-3` in `work/items/CP-COM-001.md` §9 lands here:

| CP-COM-001 §9 | Canonical | Subject |
|---|---|---|
| D-1 | **D-009** | PRD "no order submission" wording (P3, downgraded) |
| D-2 | — | **WITHDRAWN.** #1005 remediation; died with D-FUL-001 (R-1). Not carried as open. |
| D-3 | **D-005** | Rapid Logo Tee retail price |
| D-4 | **D-006** | Demo snowboard deletion |
| D-5 | **D-007** | E-TAX-1 authorization |
| D-6 | **D-008** | Live-gateway capture, inside tabled H-002 — flag only |

---

## SK-004 · 2026-09-18 · Sidekick — production payment gateway mode
**Asked by:** Sushma (channel owner) · **Source:** Shopify Sidekick · **Grading:** exemplary — it refused to guess

**Recorded as a positive precedent for how this channel should work.** Sidekick declined to answer and said why: *"I can't read it, and you shouldn't take my word either way... I queried the payments account and got nothing back, so I have no evidence of live or test."* It then **gave us the method to check rather than an answer it could not support**, and independently confirmed our own reasoning that the June/August `test: true` orders show the switch was on *then*, not now.

After a session in which six findings came from treating a readable surface as a meaningful one, an external source that says "I cannot support this claim" is worth more than one that answers confidently. **This is the behaviour to expect and to reward.**

### The failure mode it described — the operationally important part
With test mode ON, no real payments are captured, **but customers can still complete checkout through express options like Apple Pay or Google Pay**. Those use real cards, so **the transaction completes with no visible error**. The shopper sees a normal confirmation and believes they bought a $128 piece; we hold an order with a test banner and no money.

**A silent failure that presents as a successful sale.** This is why "probably fine" was never an acceptable grade for D-019, and it retrospectively justifies refusing to grade it in either direction.

### NEW FINDING — POD trap, routed to Aarti and Pushpa
**Shipping labels purchased on TEST orders are charged for real.** Do not let Apliiq auto-fulfil a test order.

This bears directly on **D-013**: the staging dispatch leak **may have cost actual money even if no garment was manufactured.** It sharpens "check the Apliiq account" from housekeeping to a **real financial reconciliation**, and it undercuts the labelled inference in D-025 that the leak has cost nothing — that inference reasoned about manufacturing, not about label purchase. Noted against **H-002** as well, since deferred real-commerce closure now has a possible real charge sitting inside it.

### Duplicate market — CLOSED, no action
"USA" (handle `usd`) is active and primary; "United States" (handle `united-states`) is inactive; both contain only the US. Sidekick's guidance: safe to delete, but deactivating is the safer tidy — **and it is already deactivated. The safe state is the current state.** Closed rather than carried as an open cleanup item.

### Context — the store is US-ONLY
Markets has exactly **one** enabled market. Therefore: all international shipping zones in the Apliiq delivery profile are **unreachable**, and policy text needs **no international clauses**. Three missing policies have been redrafted US-only and handed to Boss to paste. Publishing was blocked as a shared-resource change — **correct guardrail**, since customer-facing legal text authored by an agent should not self-publish.

---

## D-019 · CLOSED 2026-09-18T150000Z — production Shopify Payments is in LIVE mode
**Status:** CLOSED, VERIFIED · **Method matters: a direct read of the setting itself, not an inference from order flags.**

**Evidence:** Shopify admin, store `carlophillips` (production), Settings → Payments → Shopify Payments. The **"Test mode" toggle is OFF** — rendered grey and unset, visually identical to the "Email confirmation" toggle beside it, which is also off. Corroborating: Sidekick stated the admin shows a persistent banner while test mode is active, and **no such banner is present**. Also visible: payout account Shopify Balance ending 4549, payout schedule Daily, CVV verification on.

**This was the last genuine showstopper and it clears.** It is also the one item this session that was graded correctly by refusing to grade it — see SK-004 for why "probably fine" would have been dangerous rather than merely sloppy.

**What it does NOT establish, recorded so the closure is not over-read:** it proves the *setting* is live. **No live-gateway transaction has ever been completed on production.** FR-5 is proven on staging's test gateway only. That gap is now D-018's, not D-019's.

---

## D-028 · 2026-09-18T140000Z · VERIFIED NEGATIVE — the dead-nav-link concern did not materialise
**Status:** CLOSED, not-a-defect · **Recorded by:** Sushma · **Class:** verified negative + supporting evidence

**Recorded as a finding in its own right, because a suspicion that was checked and found false is evidence, not an absence of news.**

**The concern (Sushma, T130000Z):** with the Tee drafted, "All Tshirts" in the navigation would be off-spec *and* point at nothing.

**It does not materialise.** Verified in a real browser on live production (coordinator): the MENU overlay renders exactly two catalogue entries — **ALL CATEGORIES** and **ALL HOODIES**. There is no "All Tshirts" item. `/collections/tshirts` and `/collections/all-tshirts` do return 404 — Sushma independently confirmed `/collections/tshirts` → **404** — but **nothing in the live navigation links to them, so no customer can reach a dead link.** The navigation self-corrected when the Tee went to DRAFT.

*Evidence note: the menu overlay is client-rendered, so the browser check is the authoritative one; Sushma's check of the `/shop` markup found no "All Tshirts" string but is weaker evidence and is not claimed as equivalent.*

### Consequence 1 — the V1.2 addendum is PARTIALLY STALE
Its finding that four off-spec nav items exist — "Home", "All Tshirts", "Aftercare", "Account" — is no longer current. **"All Tshirts" has gone on its own.** Pushpa must **re-verify the other three against the live site before working that register.** An audit is a snapshot; this one is five days old and demonstrably drifted. Treating it as current would mean fixing things that already fixed themselves — the inverse of today's characteristic error, and equally a waste.

### Consequence 2 — SUPPORTING EVIDENCE FOR D-011, deliberately recorded
The navigation **derives itself from live catalogue state**. The frontend behaved as a projection of Shopify rather than asserting its own structure, and corrected itself with no code change when the store changed. **That is precisely what the frontend-only directive requires, working in practice.**

This is logged with intent. Today's record is heavily weighted toward violations, retractions and defects — six instances of one error class, a P0, two connector outages. Comparatively little of what is *working* has been written down, and that imbalance will mislead anyone reading this log later into thinking the system is in worse shape than it is. **Confirming evidence deserves the same discipline as disconfirming evidence.**

### Accuracy note on the "thinner storefront" record
The landing/shop page presents the Hoodie as **"SIGNATURE SERIES / 001"** with a VIEW GALLERY control reporting **8 IMAGES** and a **SHOP THE HOODIE** call to action (Sushma confirmed "SIGNATURE SERIES" and "SHOP THE HOODIE" present in the live markup). **The single active product is not thinly presented, even though the catalogue is thin — the storefront reads as deliberate rather than broken.**

**This changes how D-017's urgency should be read**, and the distinction is worth keeping separate: D-017 is urgent for **merchandising depth**, not for **launch appearance**. A one-product store that looks intentional is a defensible launch; a broken-looking store is not. Under the D-014 posture that argues for shipping sooner with a small, well-presented catalogue rather than holding the launch for volume alone.

---

## D-020 · CLOSED 2026-09-18T130000Z — RESOLVED BY EXISTING DOCUMENT, not by a Boss decision
**Status:** CLOSED · **Source:** `docs/reference/UI-SPEC-v1-2026-09-14.pdf` (59pp), read directly

**The question was already answered in writing.** No decision was needed; the document was not read.

- **Categories are specified.** Screen 07 "Discovery — All Categories Grid": **"CATEGORIES / 6 GROUPS"** — Hoodies, Jackets, Knitwear, Trousers, Accessories, Footwear. A category is a garment group, and the six are named.
- **Items per category are specified.** Screen 08 "Discovery — Product Grid (All Hoodies)": **"HOODIES / 6 ITEMS"**, a 2×3 grid of six distinct products each with its own name and price. Six per category sits inside Boss's 5–10 target, so **D-017's number is specified, not a judgement call.**
- **The happy path is specified**: Landing → discovery → order/size selection → cart → checkout → confirmation → email.
- **S/M/L is specified** on the order widget. See the correction below.
- **Appendix 21** specifies Menu navigation as a **flat list**: Navigation, Discovery, All Categories, All Hoodies, Contact Us, Private List.

**Process lesson, and it is the cheaper twin of D-027's.** We spent this session escalating a question to Boss that a reference document in the repo already answered. Boss's instruction — read the reference documents rather than keep asking — is now standing practice: **before raising a decision, check `docs/reference/`.** D-027 was failing to look at production; this was failing to look at the spec. Same shape, lower cost.

### CORRECTION — S/M/L was never our deviation
D-011 recorded curation to S/M/L as "the known small deviation" from Shopify's many sizes, and CP-COM-001 frames it as a curation decision of ours. **That framing is wrong.** The UI spec always required S/M/L on the order widget. It is not a deviation from the design — it *is* the design. The deviation, if any, is Shopify offering more sizes than the product was ever specified to have. This changes how D-016 should be argued: enforcing S/M/L is **implementing the spec**, not curating away from a default.

### V1.2 ADDENDUM — production was already audited five days ago
An addendum captured **2026-09-13 against the live site** exists and nobody worked through it. It records: catalogue breadth **2 categories / 2 total SKUs live** (Tshirts, Hoodies) versus 6 categories mocked; category tiles showing an unspec'd **"1 PIECE"** count styling; and **four navigation items not in the spec** — "Home", "All Tshirts", "Aftercare", "Account" — with navigation grouped under DISCOVERY / MORE headings instead of the specified flat list. **This is a ready-made defect register.** Assigned to Pushpa to reconcile. Note the date: the same day the mispriced Tee went live. Production was audited and the audit was not acted on — which is D-027's lesson a second time.

---

## D-027 · 2026-09-18T120000Z · P0 FOUND AND FIXED — mispriced, over-sized product live on production for five days
**Status:** FIXED 2026-09-18, root-cause recorded · **Found by:** coordinator on first production inspection · **Class:** incident record

**What was live.** The CARLOPHILLIPS Rapid Logo Tee was **ACTIVE and PUBLISHED on production since 2026-09-13 — five days** — at **$14.34, Apliiq cost-basis pricing**. All six variants `availableForSale: true`, including **XL, XXL and XXXL**, which violate the S/M/L rule. Listed on www.carlophillips.com/shop; product page served 200. **Production password protection is DISABLED**, so the store was publicly reachable. It was not sitting behind a pre-launch gate.

**Three compounding problems:** every sale loses money; sizes we do not sell were purchasable; and Boss had described this product as a test run with open Apliiq design questions, so it should not have been sellable at all.

**Fix, with Boss's approval:** Tee set to DRAFT on production. **Verified after, independently by Sushma:** `/shop` returns 200 listing only the Signature Hoodie at $128, with no Tee present. Production catalogue is now **Hoodie ACTIVE (3 variants, S/M/L, $128 — already correctly curated on production, no change needed)** and **Tee DRAFT**.

### Root cause — the same error class as the other five, and this one had teeth

The Tee was set to DRAFT **on staging** and the matter treated as closed. When Boss said the Tee was "just a test run", the cost-basis pricing concern was dropped entirely. **Correct about staging, wrong about production — which had never been examined.**

**Recorded plainly: the P2 downgrade of the pricing concern was itself the error.** D-015 was superseded on the argument that the only mispriced product was disposable and therefore harmless. That argument was sound about the store we had looked at and false about the store that takes money. Two of us reasoned from the examined environment to the unexamined one — the sixth instance today of reading one surface and concluding about another, and the only one that reached customers.

**What caught it:** production finally being inspected. Nothing else would have. The standing caveat that the verified store was STAGING and that production state was unread — carried in H-002 and CP-COM-001 since this morning — was correct and was not acted on for hours. **A recorded caveat is not a control.** An unexamined environment must generate an action, not a footnote.

**Consequence for grading, standing:** "not examined" may never be graded as "fine". A downgrade justified by facts from one environment is valid only for that environment.

### P3, not urgent — soft 404
The Tee's URL returns **HTTP 200 carrying 404 content** (independently confirmed by Sushma: `/product/carlophillips-rapid-logo-tee` → 200). SEO hygiene; a search engine will index an unavailable product as a live page. Not a launch blocker.

---

## SK-003 · 2026-09-18 · Sidekick — can manual fulfilment substitute for Apliiq in staging rehearsal?
**Asked by:** Sushma (channel owner) · **Source:** Shopify Sidekick · **Grading:** high confidence on the readable-state answer; its fidelity caveats are the valuable part

**Answer, recorded:** **manual fulfilment produces an identical readable state** — a real `Fulfillment` object, `status: SUCCESS`, `displayFulfillmentStatus: FULFILLED`, populated `trackingInfo`. **A reading app cannot distinguish the source.** Stall detection is natively achievable via Shopify Flow: on *Order paid*, wait 24h, check `fulfillmentStatus != FULFILLED`.

**Both points confirm the staging approach works** — the app is a frontend reading Shopify state (D-011), so a state it cannot distinguish is a state that rehearses correctly.

**Its six fidelity gaps** are carried as **KNOWN AND ACCEPTED** limitations of staging rehearsal (see D-026), not as open defects. Three worth naming: the request→accept round-trip, Apliiq's writeback shape, and **FulfillmentOrder intermediate states** — Sidekick named the last **the most likely source of live-vs-staging divergence for a headless frontend**. That belongs stated plainly in the launch record rather than buried.

---

## D-026 · 2026-09-18T110000Z · Apliiq connection is ESTABLISHED — no further acceptance test
**Status:** DECIDED by Boss 2026-09-18 · **Recorded by:** Sushma

**Decision:** the Apliiq connection is considered **established**. No further Apliiq acceptance test is to be run for now.

**Basis:** order #1005 demonstrates the full handshake — Apliiq Dropship Fulfillment as the fulfilment service on the order (**verified**, GraphQL); Apliiq emailed Boss for design confirmation (**Boss-reported, unverified** — Gmail connector down, H-006); USPS tracking returned into Shopify (**verified**). FR-6 and FR-7 completing. It happened accidentally and was never captured as evidence — **that is the gap, not capability.**

**WHAT THIS RETIRES — recorded as a decision, not an omission.** SK-003 suggested a controlled live Apliiq order on staging, held or cancelled before production, to close the request→accept fidelity gap. **That test leaves the critical path and is not owed work.**

**Consciously accepted risk, with the reasoning, so a future reader sees a choice:** we are accepting that the request→accept round-trip, Apliiq's writeback shape, and FulfillmentOrder intermediate states **will never be exercised in rehearsal**. Sidekick identified the third as the most likely live-vs-staging divergence for a headless frontend. The trade is deliberate: a live Apliiq test costs a real garment, real money and real turnaround for a handshake that has already completed once, against a residual risk that first shows up on a real customer order. Under the D-014 launch posture — ship unless blocked by a P1 or showstopper — that is an acceptable trade. **It is accepted, not solved.** If a live order later exhibits a fulfilment-state anomaly, this entry is where to look first.

**Consequences:**
- **Pushpa:** FR-6 acceptance criteria are satisfied by **retrospective documentation of #1005**, not a new test — fulfilment service, fulfilment ID, tracking number, and Boss's design email cited as Boss-reported. Under the launch posture that is sufficient.
- **Aarti:** the manual-location change is now a **one-way change, not a toggle**. No scenario requires Apliiq reattached to staging, so it is one configuration to design, not two.

**DECISION:** issued by Boss. Binding.

---

## D-025 · 2026-09-18T100000Z · Lifecycle re-grade — FR-6..FR-9 are demonstrated, not unknown
**Status:** RECORDED · **Raised by:** Boss · **Reconciled by:** Sushma · Re-grades D-018 and re-frames D-013

**Provenance is separated deliberately. Read the labels.**

**BOSS-REPORTED, NOT VERIFIED:** Boss received an email from Apliiq requesting **design confirmation** for the order. The coordinator attempted to verify this in Gmail and **could not — the Gmail connector is also invalidated.** This is a Boss report, and it is recorded as one. Nobody may cite it as a first-hand read.

**Why it matters if true:** Apliiq received order #1005, parsed it, and engaged on the artwork. That is the **FR-6 handshake** — a fulfilment service accepting a mapped paid order — actually completing.

**VERIFIED FIRST-HAND (coordinator):** the USPS tracking number returned into Shopify, and the order's fulfilment service is "Apliiq Dropship Fulfillment". That is **FR-7**.

**INFERENCE, LABELLED AS SUCH — not a finding:** if Apliiq paused to confirm design, the job likely sat in pre-production rather than being manufactured. POD services commonly pre-generate carrier labels at order acceptance, which would explain a tracking number existing with no garment arriving, and would mean the staging dispatch leak **has cost nothing so far**. **This is reasoning, not fact.** Boss's Apliiq account is the only authority and remains unchecked. Given this session's record, an inference this convenient deserves more suspicion than usual, not less. Nobody may act as though the leak is costless.

**RE-GRADED LIFECYCLE POSITION:**
| Stage | Status | Basis |
|---|---|---|
| FR-1..FR-4 | **Proven** | Production, real browser, today |
| FR-5 | **Proven** | Staging, test gateway |
| FR-6 | **Demonstrated** | Boss-reported design email + verified Apliiq fulfilment service on the order |
| FR-7 | **Demonstrated** | Verified USPS tracking in Shopify |
| FR-8 | **Demonstrated** | Refunds on #1002/#1003/#1004 |
| FR-9 | **Not demonstrated** | Mimickable on staging — a paid order left unfulfilled *is* the stalled state |

**The correction I am accepting:** the earlier framing — everything past checkout unproven, the largest launch unknown — was wrong. Because the app is a frontend and Shopify is authoritative (D-011), **staging can mimic FR-7/FR-8/FR-9 with manual fulfilment at a manual location and a typed tracking number**; the app only reads Shopify state and cannot tell the difference. And FR-6 is not merely mimickable — it has already happened.

**What remains, stated precisely:** none of this was a single deliberate end-to-end run with captured evidence. **The gap is evidence discipline, not capability.** That is a materially smaller problem, and D-018 is re-scoped to require exactly that run.

---

## D-024 · 2026-09-18T090000Z · DEF-2 — staging language live on the production site
**Status:** OPEN · **Raised by:** Aarti · **LAUNCH-BLOCKING, RANK 1** · Owner: Aarti

**QUESTION:** How is the environment gate fixed so that staging-only surfaces and copy cannot render on production?

**Evidence:** `https://www.carlophillips.com/checkout-design-review` returns **200** carrying "Private staging review · Draft" — Sushma independently confirmed the 200. This is customer-reachable staging language on the live domain. Source located by Aarti: `catalog-state.tsx` L45/48, `home-catalog-summary.ts` L12, `checkout-design-review/page.tsx` L8/28, all keyed on `getCommerceEnvironment()`, **which ignores `VERCEL_ENV`**.

**OPTIONS:**
- **A — Fix `getCommerceEnvironment()` to honour `VERCEL_ENV`,** then confirm every surface keyed on it. Addresses the shared root cause, so sibling leaks fix together.
- **B — Route-level guard on `/checkout-design-review` only.** Fastest; leaves the other three call sites on the same faulty gate.
- **C — Accept for launch.** A review page and draft labelling on a live storefront.

**IMPACT:**
- A: one fix, all four call sites. The concerning part is not this page — it is that an environment gate everyone assumes works does not, so other surfaces may be misbehaving in ways nobody has loaded yet.
- B: closes the one URL we happened to find. The gate stays broken.
- C: a customer reaching a page labelled "Private staging review" on www is a credibility problem on launch day, and D-014 runs social traffic in parallel.

**RECOMMENDATION (Sushma):** A. It is now the top blocker — the only one not gated on H-005, so it is also the only one that can move right now. Two of Boss's three "not blocked, we launch" conditions are satisfied on production; this is the one genuine showstopper left on the production path.

**DECISION:** _(pending)_

---

## D-023 · 2026-09-18T080000Z · Production env misconfiguration — **RETRACTED. NOT A DEFECT.**
**Status:** CLOSED INVALID 2026-09-18T090000Z · Owner: was Aarti · **Removed from the blocking list**

### RETRACTION — production is live and healthy

**Evidence:** `https://www.carlophillips.com/product/carlophillips-signature-hoodie` returns **HTTP 200**, 35,885 bytes, rendering the Hoodie at $128 with S/M/L and `"environment":"production"` in the payload. Sushma independently re-checked the status code: **200**. Because `product-page-server.ts` calls `assertRuntimePreflight` before returning, a 200 PDP carrying live Shopify facts is only possible if **preflight PASSED**.

**Root cause of the false defect:** `CP_RELEASE_ID` and `CP_RELEASE_COMMIT_SHA` are **deployment-scoped**, injected by the GitHub workflows at deploy time (`vercel deploy … --env CP_RELEASE_ID --env CP_RELEASE_COMMIT_SHA="$GITHUB_SHA"`). `vercel env ls production` lists only **project-scoped** variables. Their absence from that listing is **the designed state, not a gap**. One surface was read and a conclusion drawn about a different one.

**This is the FIFTH instance of that failure class today** — after the connector's green light, the empty `fulfillments` array, the untracked `-1` inventory, and the over-graded pricing. It is now unmistakably the dominant failure mode of this session, and it cost a rank-1 launch blocker. **Aarti caught it by loading the actual site** — the cheap, obvious, end-to-end check that outranks every inference from a configuration listing. Worth stating as practice: when a claim is about whether the thing works, load the thing.

**Consequence for the previously-unreadable conditions:** they are confirmed **mutually consistent**, because each has its own throw path inside a validator that is running in production and not throwing. The validator is the oracle. **But this does NOT prove `SHOPIFY_STORE_DOMAIN` points at the store we intend** — a validator can pass against a consistently-configured wrong store. That specific question still needs H-005.

---

### Original entry (retained, append-only) — the retracted "CONFIRMED DEFECT" grading
### Claimed against live production configuration, 2026-09-18

**www.carlophillips.com cannot serve a product page in its current configuration.** This is verified, not predicted.

**Evidence (first-hand, Vercel CLI):** authenticated as `aditya-7307`, scope `cubiqo-projects-d7156840`, project `carlophillips` (https://carlophillips-cubiqo-projects-d7156840.vercel.app). `vercel env ls production` returns 24 variables. **Two required ones are ABSENT: `CP_RELEASE_ID` and `CP_RELEASE_COMMIT_SHA`.**

**Why fatal rather than cosmetic:** in `apps/web/src/lib/config/runtime-preflight.ts` both names are in the `required` array checked by `requireNames`, **and** each carries a format validator — `CP_RELEASE_ID` must match `^[A-Za-z0-9._-]+$`, `CP_RELEASE_COMMIT_SHA` must match `^[a-f0-9]{40}$`. Absent values fail both checks, producing four errors: RUNTIME_CONFIG_MISSING_CP_RELEASE_ID, RUNTIME_CONFIG_MISSING_CP_RELEASE_COMMIT_SHA, RUNTIME_CONFIG_RELEASE_ID_INVALID, RUNTIME_CONFIG_RELEASE_COMMIT_SHA_INVALID. `assertRuntimePreflight` throws on a non-empty error list. Callers: `instrumentation.ts` (boot), `app/api/cart/route.ts`, `app/api/webhooks/shopify/route.ts`, `lib/commerce/product-page-server.ts`.

**What PASSES — recorded because it narrows the fix to exactly two variables:** `CP_COMMERCE_ENVIRONMENT`, `CP_DURABLE_STORE_ID`, `CP_EXPECTED_PRODUCTION_DURABLE_STORE_ID`, `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_CHECKOUT_HOSTS`, `SHOPIFY_WEBHOOK_SECRET`, `SHOPIFY_WEBHOOK_ALLOWED_SHOPS`, `SHOPIFY_STOREFRONT_TOKEN`, `SHOPIFY_CART_UI_ENABLED`, `SHOPIFY_CHECKOUT_ENABLED`, `NEXT_PUBLIC_SHOW_PRODUCTS` all present; the KV branch is satisfied by `KV_REST_API_URL` + `KV_REST_API_TOKEN`, so the Upstash pair is not required.

**UNREADABLE, NOT PASSING — and the distinction is the whole lesson of today.** Two values are encrypted at rest and could not be read. Therefore these remain **UNVERIFIED**, and no one may record them as passing: (a) `CP_COMMERCE_ENVIRONMENT` actually matching `'production'`; (b) `CP_DURABLE_STORE_ID` equalling `CP_EXPECTED_PRODUCTION_DURABLE_STORE_ID`; (c) the allowed-shops exact-match rule. Present ≠ correct. This session produced four bad gradings from treating a readable surface as a meaningful one; "the variable exists" is that same move.

**THE FIX IS A PIPELINE QUESTION, NOT TWO MISSING SETTINGS.** A release ID and a 40-character commit SHA are per-deployment values that CI injects. Aarti must determine **whether the pipeline is meant to set them and is failing to**, not hand-add them. **Hand-adding a static SHA would make the check pass while destroying the thing it exists to verify** — the preflight's purpose is to prove the running build is the build we think it is, and a frozen constant asserts that falsely on every future deploy. That would be worse than the current failure, because the current failure is loud.

**NEXT ACTION:** Aarti — determine the intended release-stamping mechanism in the deploy pipeline, fix at source, then re-run `vercel env ls production` as evidence. Separately confirm the three unreadable conditions by a means that does not depend on reading encrypted values.

**Working-tree note:** `vercel link` created `.env.local` and `.vercel/`. Both confirmed gitignored — Sushma verified independently via `git check-ignore -v` (`.gitignore:59` `.env*`, `.gitignore:35` `.vercel`) and neither appears in `git status`. No accidental-commit risk.

---

### Original entry (retained, append-only) — raised as a predicted risk
**QUESTION:** Is the production Vercel environment fully configured, and what verifies that before we launch rather than during?

**Evidence (CP-side code, verified):** `apps/web/src/lib/config/runtime-preflight.ts#assertRuntimePreflight` **throws** when required env vars are absent, and it is called from `instrumentation.ts` at boot, the cart API route, the Shopify webhook route, and `product-page-server.ts`. Separately `product-visibility.ts` gates SHOW_PRODUCTS on `NEXT_PUBLIC_SHOW_PRODUCTS === 'true'`. So a production deploy with incomplete env configuration yields **a throwing storefront or an empty one** — and the empty case is the nastier of the two, because it looks like a successful deploy.

**OPTIONS:**
- **A — Verify production and staging Vercel env against the required set now,** before launch, and record the result. Owner Aarti.
- **B — Deploy and find out.** The failure surfaces on launch day, on the live domain.
- **C — Relax the preflight** so missing config degrades instead of throwing.

**IMPACT:**
- A: cheap, and it is a read, not a change. Aarti calls this the highest-probability launch failure and I agree — it is the only blocker where the *default* outcome is failure rather than success.
- B: the failure mode is a dead or empty www.carlophillips.com in front of whatever social traffic D-014's parallel campaign sends.
- C: would hide exactly the misconfiguration we want surfaced. The preflight is doing its job; the config is what is unverified.

**RECOMMENDATION (Sushma):** A, and note this is **not a Shopify question** — no Sidekick, no store access needed. It is therefore the one launch blocker that is **not gated on H-005** and can proceed immediately. That makes it the best available next action.

**DECISION:** _(pending)_

---

## SK-002 · 2026-09-18 · Sidekick — preventing staging dispatch
**Asked by:** Sushma (channel owner) · **Source:** Shopify Sidekick · **Grading:** plausible, architecturally sound, unverified against our store

**Question as asked:** what Shopify configuration prevents a staging store from dispatching to a fulfilment provider?

**Answer:** no single setting gives a complete architectural guarantee. The strongest structural control is to **remove Apliiq as the fulfilment service from test products and assign test-product inventory to a MANUAL location only** — Shopify routes fulfilment requests by which service owns the inventory location, so if Apliiq owns no location for a product it is never contacted. Secondary defences: auto-fulfilment OFF, and fulfilment holds.

**Sushma's grading:** this is the useful shape of answer — a **data-model guarantee rather than a process rule**, which is exactly what was wanted. A rule saying "don't fulfil in staging" is only as good as everyone remembering it; a location Apliiq does not own cannot route to Apliiq. Adopt as the intended approach for D-013, still to be verified against our store once H-005 clears. Note it honestly contradicts nothing we know and admits its own incompleteness, which raises rather than lowers my confidence in it.

---

## SK-001 · 2026-09-18 · Sidekick — restricting a POD product to S/M/L
**Asked by:** Sushma (channel owner) · **Source:** Shopify Sidekick · **Grading:** partially unverified — see caveat, which is load-bearing

**Question as asked:** what is the correct way to permanently restrict a POD (Apliiq) product to S/M/L without the unwanted sizes displaying as "sold out"?

**Answer:** **DO NOT DELETE the variants.** Re-syncs would recreate them, and there is a small risk Apliiq's internal mapping references those variant IDs. Recommended three-layer pattern: (1) unpublish the unwanted variants from sales channels; (2) filter to S/M/L in the Next.js frontend; (3) watch for Apliiq re-sync republishing them, via Shopify Flow. It graded our current DENY + qty 0 stopgap as **passing** "cannot be purchased" and "survives sync", and **failing** "not shown as sold out" — which matches our own MITIGATED grading of D-016 exactly.

**CAVEAT — RECORDED ALONGSIDE THE ANSWER, NOT BURIED.** Layer 1 assumes **per-variant** sales-channel unpublishing exists. Shopify channel publishing is, to our knowledge, **product-level**. That is unverified either way and it is precisely the case the source-ranking rule covers: **Sidekick loses to a verified Admin API read.** **Nobody builds layer 1 until per-variant channel publishing is confirmed against the API.** If it does not exist, layer 1 collapses and the pattern reduces to frontend filtering plus a re-sync watch — which would leave the "sold out" display problem unsolved and D-016 open.

**What is safely usable now:** the "do not delete" verdict (it explains a failure mode we would not have predicted) and the Flow-based re-sync watch. Those stand independent of the caveat.

---

## D-022 · 2026-09-18T080000Z · GOVERNING — Sushma owns the Sidekick channel
**Status:** DECIDED by Boss 2026-09-18 · **Recorded by:** Sushma · **Class:** operating model change · Amends D-021

**Boss's instruction:** all communication with Shopify Sidekick consolidates through Sushma as orchestrator. **Pushpa and Aarti do not talk to it.** When either has a question they raise a status-change request to Sushma, who carries the conversation.

**Status value defined:** `READY_FOR_SIDEKICK`, added to state/STATUS-SCHEMA.md with its request format — ITEM / QUESTION / WHY IT MATTERS / ALREADY CHECKED / BLOCKS. **ALREADY CHECKED is mandatory**: if the Admin API can answer it, the API answers it, and a request that skipped an available read is returned. This is the guard that stops the channel becoming a way to avoid looking things up.

**Mechanism, recorded accurately as it now stands:** the browser pane is authenticated to the Shopify admin, so the coordinator can drive Sidekick directly on Sushma's behalf — **Sushma composes the question, the coordinator enters it and returns the answer.** This replaces D-021's Boss-in-the-loop relay, which existed only because no authenticated surface was available. Boss is no longer a required hop.

**Unchanged from D-021:** Sidekick is external input, not authority; it never overrides a Boss decision; it loses to a verified Admin API read; and "confirmed with Sidekick" is invalid without a recorded `SK-NNN` exchange.

**Why consolidating helps, beyond tidiness:** one voice to an external source means one place where its answers get graded rather than three roles each forming a private impression of Shopify's behaviour. SK-001 below is the case in point — its recommendation contains an unverified assumption that would have been easy to adopt silently.

**DECISION:** issued by Boss. Binding. No Boss action required on this entry.

---

## D-021 · 2026-09-18T070000Z · GOVERNING PRACTICE — consult Shopify Sidekick before build
**Status:** DECIDED by Boss 2026-09-18 · **Recorded by:** Sushma · **Class:** durable operating practice, binding on all roles

**Boss's instruction, as issued:** any agent may contact Shopify Sidekick to confirm requirements. Better still, **requirements should be run by Sidekick before build**, so we are confident we are not developing something we do not intend to. Motivation is the one running through this whole session — avoid unnecessary work, and avoid building what Shopify already does, or does differently.

**AMENDED 2026-09-18T080000Z — the loop below is SUPERSEDED. See D-022: Sushma owns the channel, and the browser pane is now authenticated so the coordinator can drive Sidekick directly. Original text retained per append-only.**

**The actual mechanics, written honestly, because they constrain the practice.** Sidekick lives in the Shopify admin web UI. **No role in this operating model can reach it.** Sushma, Pushpa and Aarti have files and shell only; the coordinator's browser is not authenticated to Boss's admin session. The loop is therefore:

> role drafts the question → coordinator relays to Boss → **Boss** puts it to Sidekick → answer returns → the asking role records it, with the date and the question as asked.

**This matters more than it looks.** If anyone writes "confirmed with Sidekick" into a checklist without that round trip having actually happened, the claim is false. Given this session's history — three findings graded on misread fields, plus one over-grading — that failure mode is live, not hypothetical. A Sidekick citation without a recorded round trip is a bare PASS under governance/EVIDENCE_AND_DONE.md and is invalid.

**Sidekick's standing: external input, not authority.** Its answers are evidence about how Shopify behaves, from a source that can be wrong. They do not override Boss decisions. **A Sidekick answer that contradicts a verified Admin API read loses to the API read.** This folds into the existing interpretation rule at the top of this file rather than competing with it — same principle, one more source to rank.

**Trigger point:** before build, at the requirements stage. **Pushpa is the entry gate**, since requirements are written first. Aarti escalates technical ambiguity by the same route.

**What it is FOR — this determines what is worth asking:**
- Good: "is this the right way to do X in Shopify", "does Shopify already do this".
- Not for business judgment — that is Boss's.
- Not for facts we can verify ourselves through the Admin API — that is cheaper, faster and more reliable.

**First question already in flight:** the correct way to permanently restrict a POD product to S/M/L without the unwanted sizes displaying as "sold out".

**DECISION:** issued by Boss. Binding. No Boss action required on this entry.

---

## D-017 · 2026-09-18T050000Z · Catalogue depth — the concrete launch prerequisite
**Status:** OPEN · **Raised by:** Sushma · **LAUNCH-BLOCKING** · **Rank 2**

**QUESTION:** Who builds the 5–10 merchandise items per category, in which categories, and by when?

**Live state, first-hand:** the store holds **2 products**, one ACTIVE (Signature Hoodie) and one DRAFT (Tee, parked). Boss's target is 5–10 per category. Nothing on the board tracks this, and it is the single largest gap between today and a launch. Every other launch item is a guard on a catalogue that does not yet exist.

**OPTIONS:**
- **A — Define categories and commission the catalogue now,** as a tracked board item with an owner, running in parallel with the happy-path work.
- **B — Launch with what exists** (1 ACTIVE product) and grow the catalogue after.
- **C — Set a lower launch bar** (e.g. one category at 5 items) and expand post-launch.

**IMPACT:**
- A: matches Boss's stated target. It is also the longest-lead item here — product creation, POD setup, imagery and pricing approval per item — so starting it late makes it the thing that delays launch while the tidy items get argued about.
- B: fastest to a live site, but a one-product store is not the launch Boss described.
- C: a real middle path and probably the honest one, but it is Boss's call what "launch" means, not mine.

**RECOMMENDATION (Sushma):** A, and treat it as the critical path. Under the launch posture, this is the only open item where the answer is "build something" rather than "check something" — and it needs a category list from Boss before anyone can start. I am tracking it as **CP-CAT-001** on the board with no owner pending this answer.

**DECISION:** _(pending)_

---

## D-016 · 2026-09-18T050000Z · Curated-out variants remain purchasable in Shopify
**Status:** OPEN · **Raised by:** Sushma · **LAUNCH-BLOCKING for Production** · **Rank 3**

**QUESTION:** Before Production takes real payments, are non-curated variants removed at Shopify, or only hidden by our frontend?

**The problem, stated plainly:** the Signature Hoodie has **9 variants** live in Shopify; we intend to sell S/M/L. Under D-011 Shopify is the authoritative engine and the frontend is not a security boundary — a Shopify permalink, a cached link, or a direct cart URL to a size we do not sell will produce a **real, paid order we are contractually obliged to fulfil**, at a size we never intended to offer. Frontend curation cannot prevent this because the order never touches our frontend.

**OPTIONS:**
- **A — Curate at Shopify.** Delete or deactivate the non-S/M/L variants in the store. The authoritative engine then cannot sell what we do not offer.
- **B — Frontend-only curation.** Hide them in the UI, accept the permalink path.
- **C — Accept and handle.** Sell all 9 sizes.

**IMPACT:**
- A: consistent with D-011 — curation is named as our one known deviation, so it belongs in the engine that owns the catalogue, not in the layer above it. Cheap: a store edit, no code.
- B: leaves a live path to an order we must honour. On real payments this is money and a fulfilment obligation, not an aesthetic issue.
- C: no engineering at all, but it discards the curation decision.

**UPDATE 2026-09-18T070000Z — MITIGATED, not resolved.** The Hoodie has been curated to S/M/L: the other six variants are now `inventoryPolicy: DENY`, tracked, `availableForSale: false`, verified before the connector disconnect (H-005). **The purchase route is closed** — the permalink-to-an-unsold-size risk that made this launch-blocking is gone, which is the part that cost real money.

**Why MITIGATED and not RESOLVED:** the stopgap makes those six sizes display as **"sold out"**, which is untrue. We are not out of stock of XS; we do not sell XS. Telling a customer otherwise is a false statement on a live storefront, and it invites "will it be back?" support contacts about a size that will never exist. It is a truthfulness defect, not a money defect — so it does not re-block the launch, but it should not be recorded as fixed either.

**Pending:** the first Sidekick question (D-021) asks exactly this — the correct way to permanently restrict a POD product to S/M/L without the unwanted sizes showing as sold out. Resolution waits on that answer.

**RECOMMENDATION (Sushma):** A, and it is genuinely launch-blocking for Production rather than tidy-up — it fails the test Boss set, because it costs real money on contact rather than merely looking untidy. It is also one of the cheapest items on this list. Staging can launch without it.

**DECISION:** _(pending)_

---

## D-015 · 2026-09-18T050000Z · Cost-basis pricing is a launch showstopper, re-graded from P2
**Status:** SUPERSEDED 2026-09-18T060000Z by Boss — see the closure note immediately below. Original entry retained in full, unaltered, per append-only.

### CLOSURE — SUPERSEDED. Boss overruled, and the evidence supports him.

**What I got wrong.** I escalated this to rank-1 launch-blocking on the argument that #1005 proved an *unguarded intake path*, so the next 5–10 catalogue products would arrive mispriced too. That argument does not survive the Hoodie. The Signature Hoodie is **$128.00 uniformly across all 9 variants** — clean, deliberate retail pricing. The Tee is $13.34–$16.34 varying by size, the Apliiq cost-table shape. So of the two products in the store, the real one is priced correctly and the throwaway one is not. One mispriced sample — and it is the sample explicitly created to be disposable — is not a pattern. I generalised from n=1 while the counter-example sat in the same store, unexamined.

**Boss's point, recorded as issued:** the Rapid Logo Tee was a test run. It existed only to prove we could add and order a product. Its prices were never intended as retail.

**Chain of the error, recorded rather than quietly re-ranked:** I raised the "next eight arrive mispriced" framing; the coordinator adopted it and carried it to Boss; Boss checked it against the Hoodie and it collapsed. Two of us compounded it. The log should show why the rank changed, not just that it did.

**What survives, and it is much smaller:** a price sanity check at the point a catalogue item is added. Folded into Pushpa's **AC-CAT-4** per-item readiness standard. Not a decision of its own, not a gate, no board row.

**Effect on D-005:** approved retail figures are now required only for genuinely new products, not for the parked Tee. The Tee is DRAFT and disposable; nobody needs to price it before it is either revived or discarded.

**Worth noting for its own sake.** This is the first correction of the session that came from Boss rather than from a tool read, and it ran the opposite way from every other one — we had been **over**-grading, not under-grading. Our failure mode all session has been treating thin evidence as a finding. An over-grading built on one sample is that same mistake wearing different clothes, and it is harder to catch because it looks like diligence. The interpretation rule at the top of this file should be read as covering both directions.

---

### D-015 original entry (retained, append-only)
**Status when written:** OPEN · **Raised by:** Sushma · **LAUNCH-BLOCKING** · **Rank 1** · Superseded the P2 grading in D-005

**QUESTION:** What control guarantees that no product reaches a live gateway carrying Apliiq cost-basis prices?

**Re-grading, stated honestly:** D-005 graded this P2 because the Tee is DRAFT and therefore not chargeable. That grading is only safe while nobody launches. **DRAFT → ACTIVE is one click, and it is precisely the launch action.** A P2 that becomes a P1 the moment you do the thing you are planning to do is a P1.

**The larger point, which matters more than the Tee:** the concern is not one mispriced product. Order #1005 showed cost-basis prices flowing through to order capture unchallenged, which means the price path — Apliiq sync into Shopify price fields — is unguarded. D-017 will add 5–10 products per category through that same path. Fixing the Tee's numbers and leaving the path open just means the next eight products arrive mispriced. Every live sale then loses money on contact: a revenue-negative launch, which is worse than a late one.

**OPTIONS:**
- **A — Guard the path, then price.** Establish the rule that no product goes ACTIVE without an approved retail price on record (AC-PRICE-2), monotonic size ladder (AC-PRICE-5), price strictly above recorded cost (AC-PRICE-3). Apply it to the Tee and to every product D-017 creates. Under D-011 the natural home is Shopify-side discipline plus a pre-launch check, not a custom policy module.
- **B — Fix the Tee only.** Set approved prices on the 6 variants; leave the sync path as-is.
- **C — Launch Hoodie-only** and defer all Tee/catalogue pricing. Note the Hoodie at $128 shows no cost-basis signature.
- **D — Accept the risk** and correct prices after the first sales.

**IMPACT:**
- A: the only option that survives D-017. Cost is a rule plus a pre-activation check, not a system.
- B: safe for one product, reopens on the next. Given the catalogue is about to grow 5×, this fails almost immediately.
- C: technically launchable today and genuinely the lowest-risk immediate posture, but incompatible with the 5–10-per-category target.
- D: loses money per unit, irreversibly, on every sale until noticed. Refunding and repricing after the fact costs more than the check.

**RECOMMENDATION (Sushma):** A. This is the item I would hold a launch for, and the only one on the board I would say that about. Boss still needs to supply the approved retail figures (that part of D-005 stands) — but the decision here is about the guard, not the numbers.

**DECISION:** _(pending)_

---

## D-014 · 2026-09-18T050000Z · GOVERNING — Launch posture: ship unless blocked by a P1 or showstopper
**Status:** DECIDED by Boss 2026-09-18 · **Recorded by:** Sushma · **Class:** governing — re-grades every open item

**Boss's posture, as issued:**
- What is wanted ASAP is a working happy-path flow on **staging.carlophillips.com** and **production www.carlophillips.com**.
- Vercel and Shopify analytics are sufficient for now; heavy analytics comes later.
- Target: **5–10 merchandise items per category**, site up. That is a launch.
- Social media and related work runs in parallel.
- **The rule: if we are not blocked by a P1 or a showstopper, we launch.**

**How Sushma is applying it (rigorously, in both directions):** the default disposition for every open item is now NOT-BLOCKING. An item earns LAUNCH-BLOCKING only by answering yes to one question — *does this stop us launching, or cost real money/obligation on contact?* Everything else gets a post-launch disposition, not a gate. The re-graded split is at the top of this file and mirrored on state/BOARD.md.

**Downgraded by this posture (honestly — these are my own previously-blocking items):** D-010 AGENTS.md registration, D-002 H-001 reconciliation, D-003 structure acceptance, D-001 Gate 13 scope, and Gate 12 closure itself. None of them stop a customer buying a hoodie. They are governance hygiene and they are now post-launch.

**Upgraded by this posture:** D-015 cost-basis pricing (P2 → launch-blocking) and D-016 curated-out variants (previously untracked → launch-blocking for Production). Both cost real money on contact.

**DECISION:** issued by Boss. Binding. No Boss action required on this entry.

---

## D-012 · 2026-09-18T040000Z · Does the Shopify-authoritative directive make our custom commerce layer unnecessary?
**Status:** OPEN · **RE-SCOPED under D-014, 2026-09-18T050000Z** · **Raised by:** Sushma · **Rank 5**

**RE-SCOPED AGAIN 2026-09-18T080000Z — LARGELY MOOT. Aarti's ADR-001 finding, independently verified:** `vercel.json` sets `outputDirectory` to `apps/web/.next` and builds only that workspace. **Only `apps/web` is deployed.** Root `app/`, `components/`, `lib/commerce/` (184K), `lib/releases/` and `contracts/` are **never built or served**.

Consequences, which reframe this entry and part of the board:
- **D-012a closes doubly.** Already closed as not-a-risk on the `availableForSale` evidence; it is now moot for a second, stronger reason — that code cannot break the happy path because **it never executes**. Two independent reasons to close is a good position.
- **D-012b changes character entirely:** from "audit and retire 184K of duplicated commerce logic" to **NEVER-BUILD guidance for the deployed app**. There is no deletion task blocking anything, because nothing is shipping that code. The risk was never runtime divergence; it is that someone spends a week extending an undeployed tree.
- The **second-tracking-authority** concern lands the same way: `/track`, the CP order ladder, CP Recognition and discount validation live **only in the undeployed tree**. Not a competing authority in production — a competing authority in a directory nobody serves.
- **Standing consequence worth stating:** any future work must target `apps/web`, and any evidence cited from the root tree is evidence about code that does not run. That is a live trap — it is the same shape as this session's other errors, a real-looking artifact that does not mean what it appears to.

**Post-launch disposition:** record the never-build boundary, decide later whether the undeployed tree is deleted or left dormant. Neither is urgent.

---

**RE-SCOPE (earlier, T050000Z):** the full audit-then-retire is **POST-LAUNCH**. Under the launch posture, duplicated code is untidy, not blocking — untidy does not stop a launch. What is launch-relevant is a much narrower question, split out here:

> **D-012a (launch-relevant):** does any part of `lib/commerce` or `lib/releases` actively **break or block** the happy path — e.g. a policy module that withholds the Hoodie from `/shop`, fails a cart-activation check, or gates a release on evidence we no longer intend to produce? Note `totalInventory 0` on the ACTIVE Hoodie is exactly the shape of input that an availability policy could turn into a false "sold out". Owner: Aarti. This is a targeted check on one path, not an audit.
>
> **D-012b (post-launch):** the full 184K / 23-module classification and retire list, per the original entry below.

**RECOMMENDATION (Sushma), revised:** run D-012a before launch — it is a day's check on a real failure mode, and a storefront that hides its only product is a showstopper. Defer D-012b. Original entry retained below unaltered.

---

### D-012 original entry (retained, append-only)
**Blocking:** was YES — superseded by the re-scope above

**QUESTION:** Under D-011, how much of the repo's custom commerce gating, validation, policy and governance code should be retired in favour of Shopify's own behaviour?

**What is actually at stake (first-hand file read, not a summary):** `lib/commerce/` is 184K across 23 policy modules — `cart-activation-policy`, `cart-policy`, `product-offer-policy`, `release-policy`, `variant-resolution-policy`, `media-release-policy`, `production-launch-policy`, `observation-visibility-policy` and more. `lib/releases/` adds 56K including `production-commerce-preflight`, `protected-release-gate`, `evidence-only-descendant`. `contracts/` holds 24 JSON schemas, many of them commerce decision records (`cart-activation-decision`, `catalog-decision`, `variant-resolution-decision`, `release-transition-decision`, `commerce-cart`, `commerce-product`). If Shopify is authoritative for commerce, inventory, fulfilment, tax, payments, security and governance, a large share of this is a second opinion about facts Shopify already owns.

**OPTIONS:**
- **A — Audit then retire.** Aarti inventories every module in `lib/commerce`, `lib/releases`, and `contracts/` against the directive and classifies each as (i) duplicates Shopify, retire; (ii) genuine frontend presentation concern, keep; (iii) the identified curation deviation (S/M/L only), keep and name explicitly. Retirement proceeds per class.
- **B — Keep everything, add a divergence guard.** Retain the custom layer, add tests asserting it never contradicts Shopify truth.
- **C — Freeze and defer.** Write no new commerce policy code; decide the fate of the existing layer next cycle.

**IMPACT:**
- A: the only option that actually realises the directive. Highest one-off cost; ends the divergence risk permanently. Risk is retiring something load-bearing that was never documented as such — which is why it is an audit, not a delete.
- B: cheapest now, worst long-run. Every Shopify behaviour change becomes a two-place update, and the duplicated layer is precisely where "our answer disagrees with the engine's answer" bugs live. It also keeps paying maintenance on code the directive says should not exist.
- C: defers a question that is already generating work today — Pushpa is re-deriving requirements against the directive right now, and CP-COM-001's AC-INV/AC-PRICE/AC-TAX families are exactly the overlap zone.

**RECOMMENDATION (Sushma):** A, scoped as an audit that produces a classification, with Boss approving the retire list before any deletion. Two cautions I would not want lost: (1) "Shopify provides governance and security" is about *commerce* governance — it does not replace this repo's delivery governance (gates, blockers, this log), and the audit must not be read as licence to retire those; (2) the directive says nothing custom has been identified as needed *yet*, which is a statement about the present, not a guarantee — the audit will likely surface one or two genuine gaps, and those should be named rather than assumed absent.

**DECISION:** _(pending)_

---

## D-011 · 2026-09-18T040000Z · GOVERNING DIRECTIVE — Shopify is the authoritative engine; we are a frontend
**Status:** DECIDED by Boss 2026-09-18 · **Recorded by:** Sushma · **Class:** governing — binds all roles and all future items

**Boss's decision, recorded as issued:**
- Shopify owns commerce logic, inventory, fulfilment, tax, and the payment gateways.
- There is a jump from our frontend to Shopify's payment gateway.
- Shopify also provides any governance and security required for commerce.
- Print-on-demand customization is via Shopify.
- We connect to Shopify and use its embedded applications.
- The app is a Next.js frontend; Shopify is the authoritative engine behind it.
- Anything Shopify does NOT do, we custom-engineer — **but nothing of that kind has been identified yet.**
- Known deviation: Shopify offers many sizes; we want S/M/L only. A few more curation choices of that shape may exist.

**Environment rule, also governing:**
- Staging must support a full end-to-end happy-path flow, independent of Production.
- Staging uses TEST payments only.
- **Staging must NOT dispatch.**
- Production uses real payments and real dispatch.

**Immediate consequences Sushma is recording, not deciding:**
- The environment rule resolves D-009's substance: test-gateway orders in Staging are not merely permitted, they are required for the end-to-end happy path. D-009 becomes a straightforward PRD-wording alignment.
- It also answers D-007's authorization question in principle — E-TAX-1 is a test-payment Staging flow, which is exactly what Staging is now mandated to support.
- "Staging must NOT dispatch" is a new constraint with no current control behind it. Order #1005 produced a real USPS fulfillment with tracking in the Staging store. Whether that was a dispatch, and what prevents the next one, is unestablished. Raised as its own item below.
- This directive bears on Gate 13 (D-001 still open) and potentially Gate 12's scope. Flagged, not rescoped — see the amendments on D-001.

**DECISION:** issued by Boss. Binding. No Boss action required on this entry.

---

## D-013 · 2026-09-18T040000Z · What enforces "Staging must NOT dispatch"?
**Status:** OPEN · **Raised by:** Sushma · **Blocking:** NO, but unguarded · **Rank 4**

**QUESTION:** What control prevents the Staging store from dispatching, given it demonstrably produced a real USPS fulfillment with tracking on order #1005?

**OPTIONS:**
- **A — Verify and enforce at the Shopify/Apliiq boundary.** Aarti establishes whether #1005's fulfillment was a real dispatch or a simulated one, then configures Staging so no fulfilment request reaches a provider.
- **B — Policy-only.** Document the rule; rely on nobody triggering fulfilment in Staging.
- **C — Treat as already satisfied** on the basis that #1005 was a test order.

**IMPACT:**
- A: the only option that makes the rule real. Also answers a question nobody has asked — whether a physical item was actually printed and shipped for #1005.
- B: an unguarded rule that the store has already appeared to violate once.
- C: assumes what needs checking. `test: true` governs the *payment* gateway; it does not by itself prove no fulfilment request reached Apliiq. That inference is the same shape as the two errors already made today.

**RECOMMENDATION (Sushma):** A. This is cheap to check and it is the one place where the new environment rule and the existing evidence visibly disagree.

**UPDATE 2026-09-18T050000Z — question answered, disposition re-argued under D-014.** No longer "did staging dispatch?" — it did. Order #1005's fulfilment service is confirmed **"Apliiq Dropship Fulfillment"** with USPS tracking created 2026-09-17. Staging handed a test order to a real fulfiller. A test *payment* produced a real *dispatch*, which is precisely the gap D-011's environment rule names.

**Is it a launch showstopper? I'll argue both sides, then call it.**

*For showstopper:* it is a live breach of a governing rule Boss just issued. It spends real money and real garments with no approval — arguably a financial transaction, which is a reserved Boss gate under governance/AUTHORITY_AND_GATES.md. And it gets worse with use: D-014 mandates a full happy-path flow on staging, so we are about to run this path repeatedly. Every rehearsal prints and ships a garment.

*Against showstopper:* it does not touch a customer, does not stop the site going up, does not lose a sale, and does not affect Production. The cost is one garment per staging order — real, but bounded and small. Under Boss's own test it makes us untidy and slightly poorer; it does not block a launch.

**CALL (Sushma): NOT a launch showstopper — POST-LAUNCH, but with one pre-launch condition I would not waive.** Fix it before staging is used for *repeated* happy-path rehearsal, because the cost scales with exactly the activity D-014 asks for. Concretely: either disconnect the Apliiq fulfilment service from the staging store, or set it to manual fulfilment there. That is a store-settings change, not engineering, and under D-011 it belongs in Shopify anyway. If that change is cheap enough to make today — and I believe it is — then the distinction is moot and it should simply be done before the first rehearsal run.

**Ownership note:** this is a Shopify store configuration change, so it sits with whoever holds store admin, not with Aarti's codebase work.

---

## D-010 · 2026-09-18T030000Z · Register DECISIONS-LOG in AGENTS.md (LOCKED)
**Status:** OPEN · **Asked by:** Sushma · **Blocks:** Gate 12 stop condition · **Rank 1**

**QUESTION:** May `state/DECISIONS-LOG.md` be added to AGENTS.md's "Where things live" state/ line?

**OPTIONS:**
- **A — Approve.** Boss edits the LOCKED line (or approves the PROPOSALS entry `2026-09-18T010000Z-sushma-agents-md-register-decisions-log`). One-line change.
- **B — Decline and put decisions somewhere already registered.** The log is folded into an existing registered file; this file is deleted.

**IMPACT:**
- A: closes the gap immediately. Gate 12's stop condition requires every file in "Where things live" to exist with a class/owner header — an unregistered live state file is the mirror-image failure and will be caught at review.
- B: satisfies registration without a LOCKED edit, but the only unregistered-free homes are BOSS-BRIEF (class RUNTIME, script-generated, would be overwritten) or PROPOSALS (different purpose — proposed text changes, not decisions). Both degrade the single-place requirement Boss set.

**RECOMMENDATION (Sushma):** A. This is a one-line edit standing between Gate 12 and a clean close.

**DECISION:** _(pending)_

---

## D-009 · 2026-09-18T030000Z · PRD lines 42/55 vs test-gateway orders *(was Pushpa D-1)*
**Status:** OPEN · **Asked by:** Pushpa, reconciled by Sushma · **Blocking:** NO (P3) · **Rank 8**

**QUESTION:** PRD lines 42/55 say QA "must not enter payment, submit an order or retain a private checkout URL" with no test-order carve-out, yet a test-gateway order exists — amend the PRD, or treat the order as a violation?

**OPTIONS:**
- **A — Amend the PRD** to explicitly permit test-gateway orders in Staging.
- **B — Treat it as a violation** and prohibit all order submission in Staging, including test gateway.
- **C — Leave the contradiction** unresolved.

**IMPACT:**
- A: the text matches actual, safe practice. Test-gateway orders are the normal way to exercise a POD path without charging anyone.
- B: removes the only cheap mechanism for exercising checkout, tax, and fulfilment in Staging. Would also retroactively make #1005 a violation and block D-007.
- C: a PRD contradicted on its face keeps getting re-litigated, as it already has been twice.

**RECOMMENDATION (Pushpa):** A — amend the PRD. The harm premise is gone: test gateway, no money moved, store owner's own account. Downgraded from blocking to P3; she can sign off staging acceptance without waiting on this.

**RECOMMENDATION (Sushma):** Agree with A, with one addition — the amendment should require the `test` flag and gateway to be stated wherever an order is cited as evidence. The PRD's existing `evidence_only` rule was already sufficient to catch the #1005 misgrading and was simply not applied. Permitting test orders without tightening how they are cited fixes the wording and leaves the actual failure mode intact.

**DECISION:** _(pending)_

---

## D-008 · 2026-09-18T030000Z · Is payment capture intended to stay unproven this cycle? *(was Pushpa D-6)*
**Status:** OPEN · **Asked by:** Pushpa, reconciled by Sushma · **Blocking:** NO · **Rank 5**

**FLAG, NOT A RE-ENTRY REQUEST.** Pushpa is explicitly not asking to reopen H-002 and this entry must not be read as doing so. It makes a dependency visible.

**QUESTION:** Does tabling H-002 intentionally leave operational payment capture (O-7) unproven for this cycle?

**OPTIONS:**
- **A — Yes, intentionally.** H-002 stays tabled; payment capture remains unproven; no role may claim "commerce works" or cite an order as capture readiness.
- **B — No, carve O-7 out.** A single live-gateway order is authorized as a narrow exception while the rest of H-002 stays tabled. Note this is a real financial transaction and therefore a reserved Boss gate under governance/AUTHORITY_AND_GATES.md.

**IMPACT:**
- A: costs nothing; the constraint is simply named, and the AC-CAP standards still get written. The only consequence is a claim nobody may make.
- B: proves the one thing no test order can prove, but spends a reserved gate and partially reopens what was just deliberately tabled.

**RECOMMENDATION (Pushpa):** Not requesting re-entry. Flagging that "commerce works" cannot be claimed until a live-gateway order exists.

**RECOMMENDATION (Sushma):** A. Choosing the constraint explicitly is worth more than leaving it implicit — it is exactly the claim that got over-stated twice today. Answering A costs nothing and closes the ambiguity.

**DECISION:** _(pending)_

---

## D-007 · 2026-09-18T030000Z · Authorize the E-TAX-1 positive-control test order *(was Pushpa D-5)*
**Status:** OPEN · **Asked by:** Pushpa, reconciled by Sushma · **Blocking:** NO · **Rank 7**

**QUESTION:** May a test-gateway order be placed to a clothing-taxing jurisdiction, to determine whether #1005's $0.00 NJ tax was exemption-correct or collection-not-configured?

**OPTIONS:**
- **A — Authorize.** Run E-TAX-1 on the test gateway. Non-zero tax = NJ's zero was a correct exemption. $0.00 = AC-TAX-3 has failed and tax collection is unconfigured, a P1 revenue/compliance defect.
- **B — Decline.** AC-TAX-3 stays UNKNOWN indefinitely; the store cannot be said to be tax-configured.
- **C — Defer** until D-009 settles whether test orders are permitted at all.

**IMPACT:**
- A: costs nothing and charges no one — test gateway, no money moves. Resolves a P1-or-P3 ambiguity with one action.
- B: leaves an unknown that only surfaces as a real tax liability on the first non-exempt live sale.
- C: couples a decisive cheap test to a P3 wording question. Slow for no gain.

**RECOMMENDATION (Pushpa):** Authorize — her position strengthened after R-2. #1005 proves test-gateway orders are already working practice in this store, so E-TAX-1 costs nothing and charges no one.

**RECOMMENDATION (Sushma):** Agree. Also note it is not a reserved gate: no real payment and no Production push, so under governance/AUTHORITY_AND_GATES.md this is inside standing authorization — the only reason it needs Boss is that H-002's tabling made the boundary ambiguous. Answering A also clarifies that boundary for similar tests.

**DECISION:** _(pending)_

---

## D-006 · 2026-09-18T030000Z · Delete the two demo snowboard products *(was Pushpa D-4)*
**Status:** OPEN · **Asked by:** Pushpa, reconciled by Sushma · **Blocking:** NO (P2) · **Rank 6**

**QUESTION:** May "The Archived Snowboard" (ARCHIVED, $629.95, inv 50) and "The Draft Snowboard" (DRAFT, $2,629.95, inv 20) be deleted from the Staging store?

**OPTIONS:**
- **A — Authorize deletion.** Both removed; product counts and inventory totals recomputed as gate evidence.
- **B — Leave them.** Counts stay contaminated by 70 units of fictional stock and a non-allowlisted vendor.
- **C — Archive-only / no change.** One is already ARCHIVED and still pollutes counts, so this is effectively B.

**IMPACT:**
- A: destructive store mutation, outside Pushpa's authority, hence the ask. Every product count, `/shop` eligibility check, and inventory total in this store becomes trustworthy.
- B/C: any gate citing a product count from this store is citing a polluted number. One real exposure path remains — `NEXT_PUBLIC_PREVIEW_DRAFT_PRODUCTS=true` would render a $2,629.95 snowboard.

**RECOMMENDATION (Pushpa):** Authorize. P2 — no live customer exposure, but it pollutes all count evidence.

**RECOMMENDATION (Sushma):** Agree, with sequencing — run U-DEMO-1 (draft preview shows no snowboard) BEFORE deletion. It tests the vendor-allowlist guard; deleting first destroys the only fixture that can prove the guard works, and the guard is what protects against demo data reappearing after a store reset.

**DECISION (Boss, 2026-09-18): APPROVED — delete permanently.** Executed same day via `productDelete`, both products confirmed gone by follow-up read. Store now holds exactly 2 products.

**Consequence recorded honestly rather than dropped:** the sequencing recommendation was NOT followed. Deletion came first, so the vendor-allowlist guard (E-DEMO-2 / U-DEMO-1 — the `NEXT_PUBLIC_PREVIEW_DRAFT_PRODUCTS=true` exposure path) no longer has a fixture to test against. That check is now unverifiable in this store until someone creates a replacement non-allowlisted-vendor product to test it. This is a real, if small, loss of test coverage and it should not be discovered later as a surprise. It does not change the correctness of the deletion decision — the counts are clean now, which was the point. Follow-up belongs to Pushpa/Aarti when CP-COM-001 is re-derived.

---

## D-005 · 2026-09-18T030000Z · Approved retail price for the Rapid Logo Tee *(was Pushpa D-3)*
**Status:** OPEN · **Asked by:** Pushpa, reconciled by Sushma · **Blocking:** NO (P2, latent) · **Rank 4**

**QUESTION:** What is the approved CARLOPHILLIPS retail price for the Rapid Logo Tee's 6 variants?

Live state: $14.34 (s/m/l), $13.34 (xl), $15.34 (xxl) — almost certainly Apliiq cost/wholesale. Two tells: the `.34` cents pattern, and XL priced *below* L, which inverts retail sizing and matches a cost table with upcharges on the wrong rows. The Signature Hoodie is $128.00.

**OPTIONS:**
- **A — Boss sets an approved retail price and ladder now.** Pushpa enforces AC-PRICE-*; the ladder must be monotonic non-decreasing.
- **B — Deactivate the Tee** until a price is approved. Removes the latent loss; removes the product.
- **C — Leave as-is.** Product stays ACTIVE at cost-basis prices.

**IMPACT:**
- A: closes it. Only Boss can set the number.
- B: safe but removes the catalog's second product, which is the only thing making it non-single-product.
- C: no loss today — no live gateway, so nothing can be charged. But #1005 showed the cost-basis price flows through to order capture unchallenged, so the first live-gateway sale locks in the loss.

**RECOMMENDATION (Pushpa):** She can enforce the criteria but cannot set the number. Re-graded P1 → P2 after R-2: latent defect, not an incident in progress, since no real customer was ever charged.

**RECOMMENDATION (Sushma):** A, and answer it before D-008/O-7 rather than after. If a live-gateway order is ever authorized, it would be the first real charge — at a cost-basis price if this is still unanswered. These two are sequenced even though neither is individually blocking.

**DECISION (Boss, 2026-09-18): PARTIALLY ANSWERED — Tee set to DRAFT (hidden), executed and confirmed.** Rationale: the Tee existed only to prove a product could be added and ordered; the order was never intended as a real purchase, and design questions with Apliiq are pending. Parked, not cancelled. The price question is therefore **no longer urgent** — a DRAFT product is not customer-purchasable, so the cost-basis prices cannot be charged. **Still open for when the Tee returns to ACTIVE:** the approved retail figure and a monotonic size ladder. Re-rank to non-blocking, revisit on un-parking. The Signature Hoodie stays ACTIVE and unchanged at $128.

---

## D-004 · 2026-09-18T020000Z · Recorded reversal — commerce facts asserted then retracted
**Status:** DECIDED (no Boss action required; logged so the sequence is legible) · **Recorded by:** Sushma

Within a single day the commerce picture was stated three ways: (i) UNVERIFIED, connector down; (ii) VERIFIED, one real customer order exists; (iii) VERIFIED, NO real customer order exists — #1005 is `test: true` on the "bogus" gateway. Version (ii) was wrong and is retracted on first-hand GraphQL evidence. Separately, defect H-004 was opened against an empty `fulfillments` array that was an MCP convenience-tool artifact; the order in fact has a SUCCESS fulfillment with USPS tracking 9400150899563505738795. H-004 is closed INVALID.

**Standing consequence:** the H-002 deferral never changed across all three versions and still stands. The original instinct to table it was correct. What moved was the quality of the evidence, twice, in both directions. No gate position and no Gate 12 item was altered on account of any of this, deliberately — governance work does not depend on commerce facts.

**DECISION:** recorded. Evidence rule above is now binding on all roles.

---

## D-003 · 2026-09-18T000000Z · BOSS-001 — V3.5interim structure acceptance
**Status:** OPEN · **Asked by:** Sushma · **Blocks:** Gate 12 closure

**QUESTION:** Is the installed V3.5interim compact hierarchy acceptable as-is, or do you want changes before Gate 12 is locked?

**OPTIONS:**
- **A — Accept as-is.** Gate 12 proceeds to its remaining checks (Aarti's verification, the six P1 repairs, H-001, and the one-module end-to-end run) with the structure frozen.
- **B — Accept with named changes.** You list the changes; Aarti implements them inside Gate 12 before lock; Gate 12's checkpoint moves out accordingly.
- **C — Reject / redesign.** The hierarchy is reworked before any further gate work. Gate 13 stays undefined and unstarted.

**IMPACT:**
- A: fastest path to lock. Risk is freezing a structure you haven't examined closely; changing it later costs a migration.
- B: modest delay, bounded by how many changes you name. Lowest regret.
- C: Gate 12's work to date is largely re-done. Only worth it if the hierarchy is structurally wrong, not merely imperfect.

**RECOMMENDATION:** B. The structure is working in practice — this log, the categorized blocker ledger, and the board all sit in it cleanly — but it has not had a Boss read. Name your changes now while it is cheap rather than after lock.

**DECISION:** _(pending)_

---

## D-002 · 2026-09-18T000000Z · H-001 — 58-vs-45 validator/matrix reconciliation ownership
**Status:** OPEN · **Asked by:** Sushma · **Blocks:** any Gate 12 closure citing `scripts/check-agent-docs`

**QUESTION:** Who owns reconciling the 58-tracked-files-vs-45-defined-in-matrix gap, and must it clear before Gate 12 locks?

**OPTIONS:**
- **A — Assign Aarti, blocking.** She diffs 58 vs 45+3, explains the 10-item gap, updates matrix or validator. Gate 12 does not lock until done.
- **B — Assign Aarti, non-blocking.** Same work, but Gate 12 locks on its other evidence and this lands after.
- **C — Defer with a trigger.** No work now; returns when the validator is next cited as gate evidence.

**IMPACT:**
- A: Gate 12 lock slips by the length of the diff, likely short. Removes the single most-cited evidence weakness in the repo.
- B: Gate 12 locks sooner, but locks while its own validator is known-unreconciled.
- C: cheapest now, but `governance/EVIDENCE_AND_DONE.md` names this exact discrepancy as the precedent failure that the no-bare-PASS rule exists to prevent. Deferring it is deferring the thing the rule was written about.

**RECOMMENDATION:** A. B and C both let Gate 12 close on evidence the governance documents themselves flag as unsound. This is a small, bounded diff, not a project.

**DECISION:** _(pending)_

---

## D-001 · 2026-09-18T000000Z · Gate 13 scope definition
**Status:** OPEN · **Asked by:** Sushma · **Blocks:** Gate 13 dispatch

**QUESTION:** What is Gate 13, or does it stay deferred indefinitely?

**OPTIONS:**
- **A — Define Gate 13 as commerce correctness.** Scope it around the now-verified store state: the H-004 fulfilment defect, the 2 leftover demo snowboards, and the two real products sitting ACTIVE at totalInventory 0. Owners Pushpa (criteria) then Aarti (fix).
- **B — Define Gate 13 as governance completion.** Scope it to the SCOPE.md stop condition Gate 12 does not yet satisfy — running one module fully through Boss→Pushpa→ADR→build.
- **C — Leave deferred.** No Gate 13 until after Gate 12 locks and you re-rank.

**IMPACT:**
- A: addresses live production-data problems, including a real fulfilled order with no fulfillment record. But it reopens commerce work adjacent to the H-002 territory you just tabled — you would be choosing to look at commerce correctness while still deferring commerce *closure proof*. Those are separable, but the boundary needs stating.
- B: completes what is already started and satisfies a stop condition we are otherwise going to trip over at Gate 12 review.
- C: zero cost now; leaves the H-004 defect and the 0-inventory ACTIVE products unowned.

**RECOMMENDATION:** B for Gate 13, and handle H-004 as a standalone defect outside the gate sequence rather than bundling it. Gate 12's own stop condition is unmet; adding scope before satisfying it is how gates stop meaning anything. H-004 is real but small and does not need a gate wrapper.

**AMENDMENT 2026-09-18T040000Z — the D-011 directive changes this question and I am flagging, not rescoping.** If Shopify is authoritative for commerce, then option A ("Gate 13 = commerce correctness") is substantially narrower than when written: inventory semantics, tax, fulfilment and payment behaviour are Shopify's to get right, not ours to gate. What would remain of option A is the curation layer (S/M/L only) and frontend presentation truth. Meanwhile D-012's audit may itself be the right content for Gate 13. **Revised recommendation (Sushma): answer D-012 before D-001.** Gate 13's scope is partly a function of what survives the audit, and scoping it first would be guessing. Gate 12 is structural governance only and I do not believe the directive touches it — but that is my read, and if Boss intends "Shopify provides governance" to reach delivery governance, Gate 12's scope changes materially and Boss should say so explicitly.

**AMENDMENT 2026-09-18T020000Z (appended, original text above unaltered):** H-004 is closed INVALID — it was never a defect (see D-004). The recommendation is unchanged and now stronger: **B**. Option A's stated rationale is also weakened, since the "real fulfilled order" that made commerce correctness look urgent does not exist; the only live commerce facts left are 2 leftover demo snowboards and two ACTIVE products at totalInventory 0, both of which are tidy-up, not a gate.

**DECISION:** _(pending)_

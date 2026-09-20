# CP-REQ-001 — Consolidated requirement position for the open set

- Owner (product): Pushpa
- Date: 2026-09-19
- Authority: Boss directive — "document all open items, pass to Pushpa, resolve any requirement
  conflict, get consensus, then Pushpa works with Aarti." Aarti derives the technical change set
  from this document.
- Constraint honoured: no architecture, no deployment, no code. Where a ruling implies a
  technical approach I name the requirement and hand the approach to Aarti.

## 0. Evidence basis and what I could not read

**I could not read the KAN-2 register.** No Jira tool is available in my session. This position is
derived from `state/NOW.md`, `state/BOARD.md`, `docs/policies/CP-POLICIES-v1`, my own work items,
and Sushma's summary of the eight candidate conflicts.

**Consequence, stated rather than worked around:** for conflict 6 I do not know what KAN-10 and
KAN-7 contain. I decline to rule on them and give the deciding test instead. That is "not
examined", and it is not "fine" — it is one of two gaps in this position.

**Verified facts carried into this ruling, each with its date:**

| # | Fact | Date verified | By |
|---|---|---|---|
| V-1 | Signature Hoodie on production: 3 variants, black s/m/l, $128.00, all `availableForSale: true`. Admin API read. | 2026-09-19 | Aarti |
| V-2 | Production today reads `inventoryPolicy CONTINUE`, `tracked false`, `availableForSale true`. The opposite of KAN-6's founding premise. | 2026-09-19 | Sushma |
| V-3 | `NEXT_PUBLIC_CLARITY_PROJECT_ID` is UNSET on the Production Vercel project. Session replay does not fire on www. Vercel CLI. | 2026-09-19 | Sushma |
| V-4 | Production Shopify Payments is in LIVE mode — test-mode toggle read directly as OFF, not inferred. | 2026-09-18 | Sushma (D-019) |
| V-5 | Rapid Logo Tee is DRAFT, 6 variants s..xxxl, still $14.34 cost-basis. | 2026-09-19 | Sushma |
| V-6 | Store is US-only, one enabled market; international zones unreachable. | 2026-09-18 | Sushma |
| V-7 | CP-POLICIES-v1 §0: all four authored policies NOT PUBLISHED, Contact information NOT SET and flagged Required. | 2026-09-19 | Pushpa |
| V-8 | `ProductForm/index.tsx:261-264, 269-271` hardcode "S, M and L" and "this hoodie" into copy shown for every product. | 2026-09-19 | Pushpa |
| V-9 | `product-view-model.ts:90` coerces absent price to `0`, rendering `$128`-style `money()` output as `$0` on an enabled add-to-bag button. | 2026-09-19 | Pushpa |
| V-10 | No `/privacy`, `/terms`, `/returns`, `/shipping` route and **no site footer component** anywhere in `apps/web`. | 2026-09-19 | Pushpa |
| V-11 | HP-1..HP-4 proven on production in a real browser; stopped deliberately before checkout. | 2026-09-18 | Sushma |

**Assumptions, flagged:**
- **A-1.** That `NEXT_PUBLIC_GA4_MEASUREMENT_ID` is also unset on production. V-3 covers Clarity
  only. **Not examined. Aarti's read, one command, and it moves a grade — see R-3.**
- **A-2.** That no ACTIVE product other than the Signature Hoodie exists on production.
- **A-3.** That Boss's free-returns decision (CP-POLICIES-v1 §3) is unrescinded. One document,
  one date, never re-confirmed.

**Confirming evidence, recorded deliberately:** prohibited sale language is clean in `apps/web`
(zero hits, 2026-09-19); the `apliiq` denylist in `public-product-json-adapter.ts:61` is a control
working as designed; US-only posture is clean in copy with no international, customs or
multi-currency language; `/checkout/confirm` asserts no commerce fact and correctly defers to
Shopify; the pre-payment disclosure note is intact; all three negative purchase states carry
`aria-live` feedback. The navigation self-corrected when the Tee was drafted, with no code change —
the frontend behaving as a projection of Shopify, which is what D-011 requires.

---

# 1. THE SINGLE POSITION

Everything below is one requirement in five parts. The sequence is implied by the requirements,
not imposed on them.

> **No customer-facing surface may assert a fact the store cannot honour. Where the fact is
> unknown, the requirement is omission — never invention, and never a promise deferred to a page
> that does not exist.**

That sentence resolves seven of the eight candidate conflicts, because every one of them is a
version of the same question: what do we say when we do not yet know? The answer is always the
same. Say less. Never say something we would have to retract to a paying customer.

The five parts, in the order the requirements themselves demand:

**Part A — Stop asserting what we cannot honour.** (Highest. Costs money on contact today.)
**Part B — Make the surfaces we do have reachable.** (The footer is the shared dependency.)
**Part C — Gate publication before adding depth.** (AC-PUB. Prevents the next instance.)
**Part D — Add catalogue depth through the gate.** (KAN-13, the dominant launch blocker.)
**Part E — Governance instruments.** (One requirement, not two.)

Part C precedes Part D because the remedy for D is the trigger for every defect C prevents. That
ordering is not a preference; it is the conflict.

---

# 2. RULINGS ON THE EIGHT

## R-1 · KAN-13 vs KAN-18 + AC-PUB — CONFIRMED, and revised in one respect

**Confirmed:** do not publish the Rapid Logo Tee to reach catalogue depth. Fix the Signature
Hoodie's collection membership first. Publishing a product that fails eight gates to fix a
discovery defect trades one defect for four live-store defects on a store in live payment mode
(V-4).

**Revised, now that I can see the whole set:** I previously implied AC-PUB was a gate to be run
manually per product. Seeing ADR-0001, that is wrong and wasteful. **AC-PUB-3 and AC-PUB-4 are the
same requirement as ADR-0001's AC-18**, which I already approved and which is IN_BUILD. Aarti must
build it **once**. AC-18 landing satisfies AC-PUB-3 and AC-PUB-4 for every product, permanently,
and converts them from a manual check into a structural property.

**The resulting requirement sequence for catalogue depth — this is what Aarti derives from:**

1. **Hoodie into collections.** Zero code, zero risk, store-side. Closes KAN-13's "zero
   collections" leg without publishing anything.
2. **AC-18 lands** (ADR-0001, already approved, already IN_BUILD). Size and product-type copy
   derives from actual curated option values. Satisfies AC-PUB-3, AC-PUB-4.
3. **AC-PUB-2 lands** — absent price renders the unavailable state, never `$0` on a live button
   (V-9). This is a **requirement, not a defect fix**: there is no customer-facing circumstance in
   which `$0` is correct for this store.
4. **Boss sets the Tee's retail price.** I am naming this **D-032** because it is not currently a
   numbered decision and it silently blocks catalogue depth. $14.34 is a cost. I will not infer a
   retail price; that is inventing product intent.
5. **Tee publishes through AC-PUB-1..8**, two-person per E-PUB-1.

**One suspension I am imposing:** AC-PUB-5's escape hatch — "or an explicit recorded Boss decision
that the product is direct-URL-only" — **is suspended until KAN-22 closes.** With
`/product/<anything>` returning 200 titled "Product Review", a direct-URL-only product is not a
category we can safely have. Until then AC-PUB-5 is absolute: collection membership or no
publication.

## R-2 · KAN-14 vs D-030 and D-031 — SPLIT INTO TWO TRANCHES, and **I reverse my own D-031 ruling**

**I previously stated `[[DISPATCH_WINDOW]]` is a hard blocker on publishing the shipping policy
with no escape hatch. That was wrong and I withdraw it.**

The error was treating "we cannot state a dispatch window" as "we cannot publish a shipping
policy". Those are different. **Omission is honest; invention is not — but omission was always
available to me and I did not take it.** The Dispatch section can be published without a window:

> You will receive a confirmation email when you order, and a second email with tracking when your
> order is handed to the carrier.

That states only what is true, promises no timing, and matches the tracking-truthfulness clause
already drafted at §2.2. **D-031 therefore drops from blocking to desirable.** It should still be
answered — a stated dispatch window is a conversion asset and a dispute defence — but it blocks
nothing. Sushma: take D-031 off the blocking list.

**Tranche 1 — publishes now, needs no Boss decision beyond the paste:**
Terms of service (§2.3, complete), Contact information (§2.4, complete, and Shopify flags it
**Required** and unset — V-7), and **Shipping policy** (§2.2 with the Dispatch section reduced as
above, and the "calculated at checkout" opening, which requires no threshold).

**Tranche 2 — waits on D-030 only:** Return and refund policy. A free-prepaid-label promise with
no destination is an untrue policy on a live-payment store, and it is precisely the document that
would be submitted as chargeback evidence. **This remains blocking and I do not soften it.**

**The minimum honest customer-facing position in the meantime — this is the requirement:**

- PDP purchase-support copy is the interim approved string: **`Shipping is calculated at checkout.
  Read our shipping policy.`** with `shipping policy` resolving to a live 200.
- **No returns promise appears on any customer surface until the returns page is published.**
  Silence on returns is legally safe. An unhonourable returns promise is not. This is the one
  place where saying less is strictly better, and it is the direct application of the single
  position.
- `WorkbookReplica.tsx:223` — `SHIPPING & RETURNS AVAILABLE AT CHECKOUT` — **holds unchanged until
  Tranche 2.** Fixing it upward now would recreate KAN-14's fault on a second surface. Recorded so
  no one "helpfully" corrects it.
- **This does not breach AC-POL-5.** AC-POL-5 forbids *understating* a decided benefit. It cannot
  be understatement to omit a promise that has no published terms behind it.

## R-3 · KAN-21 vs KAN-14 — **I do not overrule you. P2 is correct.** But the footer is P1.

**I accept the downgrade.** V-3 removes the session-replay leg, which was the load-bearing half of
my P1. Tested against D-014 honestly: a missing privacy page does not stop a launch and does not
cost money on customer contact. **P2 is the right grade and I was carrying the wrong one.** I
raised it to P1 yesterday on a premise that is now disproved; I am not going to defend the grade
because it was mine.

**Two things survive, and one of them is P1:**

1. **The footer is a KAN-14 dependency and inherits KAN-14's P1.** There is no site footer at all
   (V-10). My AC-1 requires the returns and shipping policies to be reachable from the PDP before
   add-to-bag *and from the site footer*. The footer is not privacy work that can wait — it is the
   delivery mechanism for the policy reachability that KAN-14 is blocked on. **Aarti should build
   it once, for KAN-14, and KAN-21's privacy link is then a single additional entry.** That is the
   efficiency the two-conflict framing was hiding.
2. **The privacy page itself stays P2**, and **A-1 is open**: GA4's env var has not been read. If
   GA4 *is* set on production, we are running analytics with no published notice on the brand
   domain — still not launch-blocking, but it changes the urgency. **One command, Aarti's.** Until
   it is read this is "not examined", not "fine".

## R-4 · KAN-6 — the old requirement CLOSES; a different requirement OPENS

**Premise confirmed stale.** KAN-6 was written against variants in DENY / tracked /
`availableForSale: false` — hidden, unsellable variants. Production reads the exact opposite (V-2).
**The original requirement closes. It describes a state that no longer exists, and keeping it open
would have us defend against an inverted condition.**

**What replaces it — AC-OVS-1, and it is a genuine new requirement:** `inventoryPolicy CONTINUE` +
`tracked false` means **the store will sell unlimited units regardless of stock**. For this
fulfilment model that is correct and deliberate, and I am not asking for it to change.

The requirement is about what we then **say**:

- **No customer-facing surface may assert or imply scarcity, stock level, or limited availability.**
  No "only N left", no "low stock", no "selling fast". With `tracked false` every such claim is
  fabricated.
- **"Sold out" must never be derived from an inventory count.** It is only permitted when the
  variant list is non-empty and every entry is genuinely `availableForSale: false`.
- **Empty or failed variant data must render an unavailable state, not a stock claim.** This is my
  M-2, and R-4 is where it belongs: we currently render "currently unavailable in every size" for
  three different realities, including a data-load failure. Asserting a stock fact we do not have
  is the same defect class as the $0 price.

Note the interaction, because it is the sharpest thing in this document: **AC-OVS-1 and AC-PUB-2
are the same failure.** Continue-selling means a product with an unresolved price is not merely
displayed wrong — it is *purchasable* at `$0` with no stock limit to stop the bleeding. Those two
must be fixed together.

## R-5 · KAN-9 vs D-026 — SUPERSEDED as an acceptance test; survives as a recorded risk

Boss established the Apliiq connection and retired the controlled live-Apliiq staging order from
the critical path (D-026). **I do not reopen a Boss decision, and there is no live product
requirement here.** KAN-9 closes as a product concern.

**What must not be lost when it closes** — NOW.md already records this and I am restating it so it
survives the ticket: the request→accept round-trip, Apliiq's writeback shape, and FulfillmentOrder
intermediate states will never be exercised in rehearsal. That is a **consciously accepted risk,
not a solved problem**, and it is the first place to look if a live order shows a fulfilment-state
anomaly. Carry that sentence into whatever closes KAN-9. A closed ticket that drops its caveat
turns an accepted risk into an invisible one.

## R-6 · KAN-10 vs KAN-18, KAN-7 vs ADR-0001 — **I decline to rule. I cannot read them.**

I will not grade two items as duplicates on a summary. **Here is the test to apply, and whoever can
read KAN-2 can apply it in minutes:**

> **An item closes as a symptom only if fixing its parent necessarily fixes it, and it carries no
> acceptance criterion the parent does not already carry.** If it carries even one AC the parent
> does not, it survives as an independent requirement — narrowed, not closed.

Specifically: if KAN-10 asserts anything about price *presentation* rather than the price *value*,
it is **not** a KAN-18 symptom — it is M-1/AC-PUB-2, which is a separate requirement. And if KAN-7
concerns catalogue *discovery* rather than sizing/nav, ADR-0001 does not cover it.

**Do not close either without applying that test and recording the result.** Closing an item as a
duplicate is the cheapest way to lose a requirement, and it leaves no trace.

## R-7 · KAN-11 vs KAN-12 — **ONE requirement, two instruments. Not two requirements.**

Boss's rule is singular: *a Jira issue ties to every push, merge and deploy.* That is one
requirement. KAN-12 is the commit/push/merge leg; KAN-11 is the deploy leg. They do not overlap in
scope — they are two instruments serving one mandate, and the mandate is not met until both report.

**The load-bearing requirement, restated from my ADR-0002 gate comment and unchanged:**

> **A report counts as evidence only if it is graded, never merely printed.** For a deploy report:
> HTTP 202, `acceptedDeployments` contains our record, and `rejectedDeployments`,
> `unknownIssueKeys` and `unknownAssociations` are all empty. Anything less is NOT REPORTED.

This is the whole point of the pairing. The Jira GitHub app harvests Deployments; our workflows
emit Environments. Once the app is installed, commits and PRs will appear on KAN issues and it will
*look* like the mandate is satisfied while the deploy leg is silently missing — indistinguishable
from "nothing has shipped yet". **KAN-12 succeeding is exactly what will make KAN-11's absence
invisible.** That is the conflict, and it is a real one: they must land together or KAN-12 alone
produces a false green.

**Status, stated plainly: ADR-0002 is PROPOSED with my CHANGES_REQUESTED, and C1-C4 are not
written in. It is not approved and no build should start from it.** Once C1-C4 are in, it is
approved without another round — I said so in the gate comment and I hold to it. C1-C4 and the
four Boss inputs (site hostname, cloud ID, the **two** OAuth values, project key confirmation) are
the remaining path.

**Priority:** P3 under D-014. It is governance. It does not stop a customer buying a hoodie.

## R-8 · KAN-15 vs D-019 — CONFIRMED CLOSED on the production leg

**Production leg closes.** D-019 verified Shopify Payments in LIVE mode by reading the test-mode
toggle directly, not by inferring from order flags (V-4). That is an authoritative read and it
settles the production gateway question.

**Staging leg survives, and it is not a formality.** D-011's environment rule is explicit: staging
uses TEST payments and **must not dispatch**. It has already been breached once — order #1005 was a
test payment that produced a real Apliiq dispatch with real USPS tracking, and SK-004 records that
shipping labels on TEST orders are charged for real. **That is a live money leak, not housekeeping.**
The staging leg must confirm both halves: gateway is TEST **and** dispatch cannot occur. Confirming
the gateway alone is exactly the half-check that let #1005 through.

---

# 3. CONFLICTS SUSHMA DID NOT NAME

**X-1 · ADR-0001 AC-18 and AC-PUB-3/4 are the same requirement.** Build once. Already folded into
R-1 and it is the single largest saving in this document.

**X-2 · KAN-22 vs AC-PUB-5.** `/product/<anything>` returning 200 means "direct-URL-only product"
is not a safe category. AC-PUB-5's escape hatch is **suspended until KAN-22 closes** (R-1).

**X-3 · KAN-22 and the Tee soft-404 are probably the same defect.** NOW.md line 29 records the Tee
URL returning 200 carrying 404 content and grades it P3 SEO hygiene. KAN-22 reports the same shape
at P1. **They cannot both be right.** My ruling on the product question: **200-with-404-content is
not an SEO issue, it is a truthfulness issue** — the store tells a customer a product exists when it
does not, and under AC-OVS-1's logic that is an asserted fact we cannot honour. Grade it on the
customer harm, not the crawler. Apply R-6's test and merge them.

**X-4 · CP-COM-001 is STALE and Aarti must not derive from it.** BOARD.md grades revision 2 stale
because D-011 superseded most of its AC-INV / AC-TAX / AC-FUL / AC-CAP families, and its store-state
facts are wrong (4 products became 2; the Tee it prices is DRAFT). **It is mine and it is not
re-derived.** Until it is, **CP-REQ-001 — this document — supersedes CP-COM-001 for anything Aarti
builds.** I am stating that explicitly so no one resolves the ambiguity by guessing. Re-deriving it
is my next task after this one.

**X-5 · The two-person publication rule needs a named verifier who is not the coordinator.**
E-PUB-1 says Pushpa verifies and Boss makes ACTIVE. AC-PUB-7 (vendor scrubbed from the payload) and
AC-PUB-1 (authoritative price read) both require **store and payload reads I cannot perform**. The
rule as written is unexecutable by me alone. **Requirement: Aarti supplies the AC-PUB-1, -2, -7
readings as evidence; I grade them and record; Boss activates.** Three roles, not two. I would
rather correct my own rule now than discover it is unrunnable at the first publication.

---

# 4. OPEN BOSS DECISIONS — each with the interim requirement that holds

**No gap is left saying "waiting". Every line below has a rule in force today.**

| ID | Decision | Blocks | **Interim requirement, in force now** |
|---|---|---|---|
| **D-030** | Physical return destination | Returns policy publication; the PDP returns promise | **No returns promise on any customer surface.** Shipping half of the PDP string ships alone. `WorkbookReplica` holds unchanged. Silence, not a promise we cannot honour. |
| **D-031** | Dispatch window | **Nothing — downgraded by R-2** | Publish the shipping policy with the Dispatch section stating confirmation and tracking emails and **no timing**. Omission, never invention. |
| **D-032** (new — Pushpa naming it) | Rapid Logo Tee retail price | Catalogue depth via the Tee | **Tee stays DRAFT.** Depth comes from Hoodie collection membership first. $14.34 is a cost and must never go ACTIVE. |
| **D-033** (new — Pushpa naming it) | Policy hosting: `apps/web`, Shopify, or both | KAN-14 and KAN-21 link targets | **Both, one source — my recommendation below.** Interim: policy text is authored only in `docs/policies/CP-POLICIES-<version>.md`. No policy text may be authored anywhere else, so no drift can start while Boss decides. |
| **A-1** (not a decision — a read) | Is GA4 set on production? | KAN-21's urgency | Treat as **set** until read. Costs nothing; assuming unset would be assuming the safe case, which is the error pattern this project keeps repeating. |

**D-033 recommendation, for Boss as a single question:** policy text is authored **once** in the
versioned repo file and rendered to **two** targets — policy routes in `apps/web` on the brand
domain, and Shopify Settings → Policies. Shopify-only fails my AC-1, because a policy that lives in
checkout is unreachable before add-to-bag, which is when the customer needs it. `apps/web`-only
leaves Settings → Policies empty, which fails Shopify's Required flag and leaves the chargeback
file empty. Redirecting to the `myshopify.com` domain is ruled out: it drops the customer off the
brand at the moment they are deciding to trust us with $128. Drift is answered by AC-POL-3 and
AC-POL-6 — two render targets are safe precisely because neither is a source.

**Put one question, not two: "Policy text authored once in the repo, published to both the
storefront and Shopify — approve?"**

---

# 5. WHAT AARTI DERIVES FROM THIS — requirements only, no approach

Handed in requirement order. The technical approach for every line is his.

| # | Requirement | Source ruling | Grade |
|---|---|---|---|
| 1 | Absent or unresolvable price MUST render the unavailable state. A product MUST NOT present a purchasable PDP without a resolved price. `$0` is never correct. | AC-PUB-2, R-4 | P1 |
| 2 | "Sold out" is permitted only when the variant list is non-empty and every entry is genuinely unavailable. Empty or failed variant data renders unavailable, not a stock claim. | AC-OVS-1, R-4 | P2 |
| 3 | No surface may assert scarcity, stock level or limited availability. `tracked false` makes every such claim fabricated. | AC-OVS-1, R-4 | P2 |
| 4 | Size and product-type copy MUST derive from the product's actual curated option values. No hardcoded garment type, no hardcoded size set. | AC-18 = AC-PUB-3/4, R-1, X-1 | P1 |
| 5 | A site footer MUST exist and MUST carry policy links. It is KAN-14's delivery mechanism, not privacy hygiene. | R-3 | P1 |
| 6 | PDP policy references MUST be live links returning 200 with the policy text rendered on the brand domain. A bare `<span>` or a `#` href fails. | AC-4, R-2 | P1 |
| 7 | Vendor field MUST be scrubbed from every client payload, verified **per product, every time**. | AC-PUB-7, KAN-19 | P1 |
| 8 | No image filename may carry a vendor or fulfilment tell. | AC-PUB-8, KAN-17 | P1 |
| 9 | A product URL that does not resolve to a real published product MUST NOT return 200 with product-shaped content. | R-6/X-3, KAN-22 | P1 |
| 10 | Jira deploy reporting MUST grade, not print. 202 carrying unknown or rejected keys is NOT REPORTED. | R-7, C1 | P3 |
| 11 | The storefront menu MUST derive its entries from live catalogue categories. A category with fewer than 3 products earns no menu entry; its products stay reachable on `/shop`. | AC-NAV-1/2, §7.1 | P1 (blocks catalogue depth) |
| 12 | A derived category slug MUST reconcile against an approved vocabulary and fail closed if unrecognised. Discipline is not a control. | AC-NAV-3, §7.1 | P1 |
| 13 | Tests asserting the two-category menu MUST be rewritten to assert AC-NAV-1/2/3, never deleted. | §7.1 | P1 |

**Two reads I need from Aarti before I can close items, not build requests:** GA4's production env
var (A-1, moves R-3's urgency), and the AC-PUB-1/-2/-7 readings for the Signature Hoodie, which has
never been run through the gate and whose AC-PUB-7 is **known to fail today** via KAN-19 (X-5).

---

# 6. CONSENSUS POSITION

I need agreement on five things. The rest is mine to assert.

1. **D-031 drops from blocking** — my own reversal. Shipping policy publishes with no dispatch
   window stated.
2. **KAN-21 stays P2** — I accept Sushma's downgrade and withdraw my P1 — **but the footer inherits
   KAN-14's P1** as its delivery mechanism.
3. **KAN-6 closes and AC-OVS-1 opens** in its place. Not the same requirement.
4. **AC-18 and AC-PUB-3/4 are one build**, not two.
5. **CP-REQ-001 supersedes CP-COM-001** for anything built before I re-derive it.

**Not agreed and deliberately unresolved: conflict 6.** I will not rule on KAN-10 and KAN-7 from a
summary. Apply R-6's test and bring me the result.

---

# 7. ADDENDUM — 2026-09-19, having now READ the KAN-2 register and KAN-7

I was given Jira read access and read the register and KAN-7 directly. This section closes the two
gaps I declared in §0 and regrades what the reading changed. **Every ruling in §2 and §3 survives
unchanged except where named below.** The register did not overturn a position taken blind; it
narrowed one, closed one, and promoted one.

## 7.1 Conflict 6 — ruled, both legs

R-6's test, applied as written: *an item closes as a symptom only if fixing its parent necessarily
fixes it, and it carries no acceptance criterion the parent does not already carry.*

### KAN-7 vs ADR-0001 — **INDEPENDENT REQUIREMENT. It does not close.**

**Fails the test on both halves.**

*Half one — the parent does not necessarily fix it.* ADR-0001 is sizing and navigation. KAN-7 is
**catalogue discovery**: `apps/web/src/lib/navigation/storefront-menu.ts` fixes
`DEFAULT_STOREFRONT_MENU_CATEGORIES` to `tshirts` and `hoodies`, so four of the six `UI-SPEC-v1`
categories — Jackets, Knitwear, Trousers, Accessories, Footwear — have no menu entry and cannot be
reached. ADR-0001 could land complete and correct with every one of those still unreachable. That is
the exact test in R-6 and it fails it.

*Half two — it carries acceptance criteria the parent does not.* Three of them, and they are mine:

- **AC-NAV-1 — minimum depth 3 before a category earns a menu entry.** **I adopt the depth-3 rule
  and I own it as a product decision.** A depth-1 category renders "1 PIECE" and reads as a broken
  store; a customer who clicks a top-level category and finds one item concludes the store is empty,
  which is worse than never offering the category. This is **merchandising judgement, not a derived
  fact** — the ticket says so and it is right to say so. It raises the launch bar from "5–10 items
  per category" to at least 3 per *visible* category. **Boss may overrule it and I will not treat an
  overrule as a defect.** Interim in force while he is out: depth 3.
- **AC-NAV-2 — no product becomes unreachable.** Products in a below-threshold category stay
  reachable on `/shop`. AC-NAV-1 hides a *menu entry*, never a product. A rule that hid inventory
  would be a worse defect than the one it fixes.
- **AC-NAV-3 — derived category slugs reconcile against an approved vocabulary.** The ticket records
  that ADR §6.5 offered "listing discipline" as the guard against a mistyped `productType` minting a
  category. **Discipline is not a control** — that is a standing rule here and I apply it without
  hesitation. An unrecognised slug fails closed: no menu entry, and it raises rather than renders.
  This is AC-CUR-3 and AC-CUR-5 generalised from variants to categories, exactly the generalisation
  AC-CUR-6 anticipated.

**Ruling: KAN-7 survives as an independent requirement, narrowed.** It is a *clipped* generalisation,
not a missing one — the machinery already resolves live categories and generates labels, then
discards the result. So it is **delivered inside ADR-0001's build** as a matter of sequencing
convenience, and **graded, tracked and closed on its own criteria.** Do not close it when ADR-0001
closes. The approach is Aarti's and I name none of it.

**Two things I attach, neither of them technical:**

1. **The tests that assert the defect get rewritten, never deleted.** The ticket records
   `tests/storefront-menu-navigation.test.tsx:15-17,:47` asserting the two-element href array and the
   no-argument call site. A test deleted to make a change pass is how a requirement disappears with
   no trace. Rewritten, they become the AC-NAV-1/2/3 evidence.
2. **Grade: P1, and it rises with catalogue depth.** Today, with one ACTIVE product, no customer is
   harmed by four missing menu entries. The moment Part D adds depth, this becomes the defect that
   makes the depth invisible. It is P1 as a *blocker on the catalogue work*, not as live harm today,
   and I state that distinction rather than borrowing urgency it does not have.

### KAN-10 vs KAN-18 — **CLOSES, but not as a duplicate and not as fixed.**

The Rapid Logo Tee is **ARCHIVED on production, 2026-09-19** (Sushma, at Boss's instruction).
KAN-10's soft-404 and KAN-18's cost price **cannot fire**. Both close as *no longer firing*.

**What must not be lost, and this is the whole reason I insisted on the test:** KAN-10's shape —
a product URL returning 200 with 404 content — is **KAN-22**, which returns 200 titled "Product
Review" for `/product/<any-handle>`. **KAN-22 is untouched by the archive and stays P1.** X-3 stands:
that is a truthfulness defect, not SEO hygiene — the store tells a customer a product exists when it
does not. Requirement 9 in §5 carries it.

And KAN-18's requirement survives the product: **AC-TEE-1 and AC-PUB-1 bind on any reactivation.**
$14.34 is a cost and must never go ACTIVE. **Archival is containment, not a fix** — the same
distinction AC-TEE-2 already made about DRAFT status, and the archive does not change it.
**D-032 (Tee retail price) drops from blocking to dormant.** It is owed before reactivation, not
before launch. Sushma: take D-032 off the blocking list, do not delete it.

## 7.2 Regradings from the new facts — including downward

| Item | Was | Now | Basis, dated |
|---|---|---|---|
| **A-1 (GA4)** | open assumption, treat as set | **CLOSED as a read** | `NEXT_PUBLIC_GA4_MEASUREMENT_ID` NOT SET on Production, Vercel CLI, Aarti, 2026-09-19 |
| **KAN-21** | P2 on one leg | **P2 on two legs** | Clarity unset (V-3) and GA4 unset. Neither tag fires on www. The grade does not move; its foundation does |
| **KAN-18** | P1, blocked on D-032 | **DORMANT** | Tee ARCHIVED, 2026-09-19. Conditions travel with the product |
| **KAN-10** | open defect | **CLOSED, not firing** | Tee ARCHIVED. Shape survives as KAN-22 |
| **KAN-19** | P1 | **P1, scope corrected** | Leak is on the `/shop` listing payload; the PDP payload is clean. Per-surface, not per-product. **Not a downgrade** — see 7.3 |
| **KAN-9** | closed as a product concern, risk recorded | **REOPENS. P1 money leak** | See below |
| **KAN-7** | not ruled | **P1, independent** | 7.1 |

**KAN-9 — I correct my own R-5 rather than let a compliment stand.** Sushma credits me with refusing
to let D-026 supersede KAN-9. **I did not refuse. I closed it as a product concern and preserved the
risk in prose.** What was right was preserving the caveat; a closed ticket that drops its caveat
turns an accepted risk into an invisible one. The new facts are what reopen it, not my foresight.

*Verified 2026-09-19:* production holds exactly **two orders, both `test: true`, both UNFULFILLED,
zero fulfillment records.** *Reported by Boss:* a live tee was shipped. It is not in the production
store. **Inference, and I mark it as one:** the dispatch went through staging. The inference is
strong — those are the only two stores — but it is an inference, and the confirming read is a staging
order-and-fulfilment read that **has not been taken.** Not examined is not fine: **that read is owed.**

**This is AC-ENV-1 breached a second time**, not once. Order #1005 was the first: a TEST payment that
produced a real Apliiq dispatch with real USPS tracking, and SK-004 records that shipping labels on
TEST orders are **charged for real**. One instance is not a pattern; **two is.** I held that standard
against myself in R-4 and I apply it here in the direction that costs us.

**The requirement, and it is not an acceptance test — it is a control:** *no staging action may cause
an Apliiq production order, a physical print, a carrier label purchase, or a shipment.* R-8's
staging leg must confirm **both halves — gateway is TEST and dispatch cannot occur.** Confirming the
gateway alone is exactly the half-check that let #1005 through. D-026 retired the *controlled
rehearsal order*; it never authorised uncontrolled dispatch, and I do not read it as having done so.

## 7.3 Confirming evidence, recorded deliberately

- **AC-PUB-2 passes on the Signature Hoodie PDP** — price resolves at $128.00 across three variants,
  2026-09-19. Recorded **unguarded**: `product-view-model.ts:90` is unchanged, so the pass is a
  property of the payload, not a control.
- **AC-PUB-7 passes on the Signature Hoodie PDP** — zero `apliiq` occurrences, case-insensitive,
  2026-09-19. **The absence of a mechanism is the finding.** One product's PDP being clean on one
  date does not establish that the PDP path scrubs anything.
- **`NEXT_PUBLIC_STAGING_REVIEW` is not set on Production**, 2026-09-19 — the `/media-lab` 404 on www
  is correct **by configuration, not by luck.** That is a real control and it deserves recording.
- **The one-product store is correctly configured for POD** — untracked, CONTINUE,
  `availableForSale: true`. Deliberate and correct for this fulfilment model.
- **Aarti reported AC-PUB-2 as NOT READ rather than inferring it from the listing payload.**
  E-PUB-1b exists because that refusal worked. Recorded as a control that fired, not as a delay.

**One piece of my own confirming evidence is WITHDRAWN.** In §0 I recorded, as a positive finding,
that *"the navigation self-corrected when the Tee was drafted, with no code change — the frontend
behaving as a projection of Shopify, which is what D-011 requires."* KAN-7 contradicts it directly:
`storefront-menu.ts:90-92` discards the resolved live categories and returns the hardcoded constant,
which predicts `ALL TSHIRTS` renders from the constant regardless of what Shopify holds. **A menu
that cannot change cannot have self-corrected.**

I am not grading which is true — that is a build-versus-tree question and it is Aarti's. **What is
mine is that I took a frontend observation as proof of approved behaviour and wrote it down as a
positive finding.** The frontend is discovery input, not proof. **The line is withdrawn and must not
be cited.** If the deployed build does differ from this tree, then ADR-0001's file:line facts may not
describe what serves customers, and that is a larger problem than one withdrawn bullet — flagged
here, handed to Aarti, not graded by me.

## 7.4 D-030 — the interim holds, and indefinite deferral makes it MORE correct, not less

Asked directly whether my interim survives the deferral becoming indefinite rather than short.
**It does, and the reasoning strengthens.**

**In force now, unchanged:** no returns promise on any customer surface; `WorkbookReplica.tsx:223`
holds unchanged and no one "helpfully" corrects it upward; the shipping tranche publishes without it.

A short deferral is the case where an interim is *tempting to skip* — you can argue the promise will
be true by the time anyone reads it. An indefinite deferral removes that argument entirely. A
free-prepaid-label promise with no destination, on a live-payment store, is the exact document that
would be submitted as chargeback evidence, and it would be submitted as **an untrue policy**. Silence
on returns is legally safe. **Omission is honest; invention is not**, and this is where saying less is
strictly better.

**One thing the indefinite horizon does change, and I add it rather than restate the old rule:**
an interim with no end date drifts into being read as the settled position. **AC-RET-INT-1: the
no-returns-promise interim is re-stated to Boss at every launch-readiness review and at any
publication of policy text, and is recorded as INTERIM, never as decided.** The failure mode of an
indefinite interim is not that it is wrong — it is that it stops being visible.

**A-3 stays flagged and is now sharper:** Boss's free-returns decision rests on one document, one
date, never re-confirmed. With D-030 tabled indefinitely, the benefit it promises has no operational
path at all. **Not examined.** Do not build the returns page against it without a re-confirmation.

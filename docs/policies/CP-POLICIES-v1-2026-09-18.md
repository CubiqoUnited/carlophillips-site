Class CONTROLLED · Owner Pushpa (Product Owner) · Writers Pushpa proposes; Boss approves and publishes · v1.0 (2026-09-18)

# CARLOPHILLIPS — Customer-Facing Store Policies

**THIS FILE IS THE SOURCE OF TRUTH FOR THE PUBLISHED POLICY TEXT.**
If the text in Shopify and the text here ever differ, this file is correct and Shopify is stale. Do not edit policy copy in the Shopify admin directly; change it here, re-version, and re-paste.

**Artifact ID:** CP-POLICY-v1.0 · **Date:** 2026-09-18 · **Author:** Pushpa · **Status:** DRAFTED — NOT PUBLISHED

**AMENDMENT 2026-09-19 — §6 added (AC-PUB-1..8, pre-publish gate).** This does **not** trigger AC-POL-6's new-dated-file rule and does not re-version the artifact. AC-POL-6 governs **published customer-facing policy text**; §6 is an internal standing-criteria block and **no paste block in §2 was touched**. The policy text of v1.0 is unchanged and remains NOT PUBLISHED per §0.
**Supersedes:** the coordinator's unblocking draft (raw input, replaced in full, not edited).
**Applies to:** the production store only. Policies are customer-facing legal text and are not staging artifacts.

---

## 0. Publication record — Boss's step

Publication was correctly blocked as a shared-resource change. **Boss pastes; I do not publish.**

| Policy | Shopify location | Status | Published on | By |
|---|---|---|---|---|
| Return and refund policy | Settings → Policies | NOT PUBLISHED | — | — |
| Shipping policy | Settings → Policies | NOT PUBLISHED | — | — |
| Terms of service | Settings → Policies | NOT PUBLISHED | — | — |
| Contact information | Settings → Policies (flagged **Required**, unset) | NOT SET | — | — |
| Privacy policy | Settings → Policies | **ALREADY PUBLISHED** — not authored here; see §5 | — | — |

**When Boss publishes, fill the two right-hand columns in this table and commit.** That is the record; a policy published without this table updated is an untracked change.

---

## 1. Standards applied

**Brand register — from `docs/design-system.md` and the UI-SPEC copy conventions.**
The workbook's customer copy is short, declarative, second person, and unadorned: *"Your bag is saved. Start a new checkout when you are ready."* · *"No payment was taken. Please try another method or return to your bag."* · *"Measurements are garment measurements."* · *"We will respond within 1-2 business days."*

Rules I wrote to:
- Sentence-case body under plain headings. No exclamation marks. No marketing adjectives — nothing is "amazing", "hassle-free" or "world-class".
- Second person, present tense, active voice. Short sentences. One idea per sentence.
- State what happens, not how we feel about it. The workbook never reassures; it informs.
- No legalese padding ("heretofore", "at our sole and absolute discretion"). Plain English is the register and is also more defensible.
- Numerals for time and money, matching the workbook ("1-2 business days", "30 days").

**Provider neutrality — binding, and sourced.** `docs/design-system.md`, Production composition contract, item 6: **"Provider-neutral customer copy and truthful disclosures."** This is already the design system's own rule, not a new constraint. Our supply chain is invisible to the customer. **Nothing below names, implies, or hints at an external producer**, and nothing uses made-to-order, final-sale, personalised-goods, or custom-manufacture language. The customer is buying a designed piece at $128 from CARLOPHILLIPS.

**Truthfulness — TFRD NFR-4 and AC-AUTH-1.** The policy must not assert commerce facts that Shopify determines at checkout (tax, shipping cost, final totals). Where a figure is Shopify's, the copy defers to checkout rather than stating a number.

**US only — constraint 2, verified.** Markets has one enabled market (USA, primary, region US). International checkout is impossible, so **no international, customs, duties, or cross-border clauses appear**. Writing them would describe unreachable states, which is the same error as rendering an unreachable UI state.

---

## 2. PASTE BLOCKS

One block per policy. Clean HTML, no commentary inside. Paste into Settings → Policies.

**Two placeholders exist and are deliberate.** Both are listed in §4 and must be resolved before publication:
- `[[FREE_SHIPPING_THRESHOLD]]` — Boss has not set the eligibility threshold (constraint 4). The paragraph is written so the figure drops in without rewriting anything around it. **§2.2 also carries an alternative opening sentence** to use if Boss decides free shipping applies to all orders, so publication is not gated on the threshold.
- `[[DISPATCH_WINDOW]]` — see §4.2. I will not invent a dispatch time.

---

### 2.1 Return and refund policy

```html
<p>You have 30 days from the day your order is delivered to return it.</p>

<p>Returns are free. We provide a prepaid return label. There is no restocking fee and no return shipping charge.</p>

<h2>Condition</h2>
<p>Items must be unworn and unwashed, with the original tags attached. We cannot accept an item that has been worn, washed, altered or damaged after delivery.</p>

<h2>How to return an item</h2>
<p>Email <a href="mailto:av.loy07@gmail.com">av.loy07@gmail.com</a> with your order number. We will send you a prepaid return label and instructions. We respond within 1-2 business days.</p>

<h2>Refunds</h2>
<p>We issue your refund to the original payment method once your return is received and checked. This normally takes 3-5 business days from receipt. Your bank may take a further few days to show it.</p>
<p>Your refund includes any shipping you paid on the original order.</p>

<h2>Damaged or faulty items</h2>
<p>If your item arrives damaged, faulty or incorrect, we cover it in full. Email <a href="mailto:av.loy07@gmail.com">av.loy07@gmail.com</a> within 30 days of delivery with your order number and photographs showing the problem. We will replace the item or refund it in full, whichever you prefer.</p>
<p>The 30-day condition requirements above do not apply to a damaged, faulty or incorrect item. In most cases we will not ask you to send it back.</p>

<h2>Exchanges</h2>
<p>To exchange a size, return the item for a refund and place a new order. This is the fastest way to get the size you want.</p>

<h2>Cancelling an order</h2>
<p>Email us as soon as possible after ordering and we will cancel it if it has not yet shipped. If it has already shipped, return it under the 30-day terms above.</p>
```

---

### 2.2 Shipping policy

```html
<p>We ship within the United States.</p>

<h2>Shipping cost</h2>
<p>Shipping is free on eligible orders over [[FREE_SHIPPING_THRESHOLD]]. Shipping costs for all other orders are calculated at checkout, before you pay.</p>

<h2>Dispatch</h2>
<p>Orders are prepared and dispatched within [[DISPATCH_WINDOW]] business days. You will receive a confirmation email when you order, and a second email with tracking when your order is handed to the carrier.</p>

<h2>Delivery</h2>
<p>Delivery times depend on the carrier and your address. Your tracking link is the most accurate guide once your order has shipped.</p>

<h2>Tracking</h2>
<p>Tracking appears when the shipment is handed to the carrier. Until then your order status reads as confirmed.</p>

<h2>Incorrect addresses</h2>
<p>Please check your shipping address at checkout. If an order is returned to us because the address was incomplete or incorrect, we will contact you to arrange redelivery.</p>

<h2>Lost or delayed shipments</h2>
<p>If your tracking has not updated for 7 business days, email <a href="mailto:av.loy07@gmail.com">av.loy07@gmail.com</a> with your order number and we will resolve it.</p>
```

**Alternative opening for §2.2 if Boss decides free shipping applies to every order** — replace the Shipping cost paragraph with:
```html
<h2>Shipping cost</h2>
<p>Shipping is free on all orders within the United States.</p>
```

---

### 2.3 Terms of service

```html
<p>These terms apply to your use of this website and to any order you place with CARLOPHILLIPS.</p>

<h2>Who we are</h2>
<p>carlophillips, 7 Nelson Avenue #2, Jersey City, NJ 07307, United States. Contact: <a href="mailto:av.loy07@gmail.com">av.loy07@gmail.com</a>.</p>

<h2>Where we sell</h2>
<p>We currently sell and ship within the United States only.</p>

<h2>Orders</h2>
<p>Your order is an offer to buy. We accept it when we send your order confirmation. If we cannot fulfil an order, we will tell you and refund you in full.</p>
<p>We may cancel an order if the item is unavailable, if the price or description was published in error, or if we suspect fraud. If we cancel, we refund you in full.</p>

<h2>Prices and payment</h2>
<p>Prices are in US dollars. Taxes and any shipping charges are calculated and shown at checkout before you pay. Payment is taken at checkout.</p>

<h2>Products</h2>
<p>We describe our products as accurately as we can. Colours can vary slightly between screens. Garment measurements are given in the size guide.</p>

<h2>Returns</h2>
<p>Our return and refund policy forms part of these terms. You have 30 days from delivery to return an item, and returns are free.</p>

<h2>Your account and conduct</h2>
<p>You agree not to misuse this website, interfere with its operation, or attempt to access it other than through the interface we provide.</p>

<h2>Intellectual property</h2>
<p>The CARLOPHILLIPS name, designs, images and site content belong to us and may not be reproduced without our permission.</p>

<h2>Liability</h2>
<p>Nothing in these terms limits any right you have under applicable law, including your rights in respect of faulty goods.</p>

<h2>Privacy</h2>
<p>Our privacy policy explains how we handle your information.</p>

<h2>Changes and governing law</h2>
<p>We may update these terms. The version published here at the time of your order applies to that order. These terms are governed by the laws of the State of New Jersey, United States.</p>

<h2>Contact</h2>
<p>Email <a href="mailto:av.loy07@gmail.com">av.loy07@gmail.com</a>. We respond within 1-2 business days.</p>
```

---

### 2.4 Contact information (Settings → Policies, flagged Required)

```html
<p>carlophillips<br>
7 Nelson Avenue #2<br>
Jersey City, NJ 07307<br>
United States</p>
<p>Email: <a href="mailto:av.loy07@gmail.com">av.loy07@gmail.com</a><br>
We respond within 1-2 business days.</p>
```

---

## 3. Reconciliation against our own acceptance criteria

**A policy that contradicts our UAT is worse than none.** Checked line by line against CP-COM-001:

| Criterion | Policy text | Result |
|---|---|---|
| **AC-REF-1** refunded order presents as refunded with amount and date | Refund section states method, timing and that original shipping is included | **Consistent** |
| **AC-REF-2** refunded, never-fulfilled order shows no shipping language | Cancellation clause separates "not yet shipped" from "already shipped" | **Consistent** |
| **AC-REF-3** refund must not unlock delivery-gated entitlements | Policy makes no entitlement promise. No CP Credit, no store credit, no review unlock | **Consistent by omission — deliberate** |
| **AC-REF-4** partial refund distinguishable from full | Policy describes full refunds only; no partial-refund promise is made | **Consistent** |
| **AC-FUL-5** truthful degradation, no tracking control before a fulfilment exists | Shipping policy: *"Tracking appears when the shipment is handed to the carrier. Until then your order status reads as confirmed."* — **deliberately mirrors the approved workbook copy at UI-SPEC p.19** | **Consistent, and sourced** |
| **AC-AUTH-1** never assert a value Shopify owns | Tax and shipping cost defer to checkout; no figure stated | **Consistent** |
| **AC-TAX-2** $0.00 tax distinguishable from not calculated | Policy says taxes are "calculated and shown at checkout" and asserts no exemption | **Consistent** |
| **AC-CUR-4** no signal that unsold sizes exist | Policy never enumerates sizes; defers to the size guide | **Consistent** |
| **§18.2.3 AC-ACC-4** no account or store-credit surface at launch | Terms reference no account balance or credit. "Your account and conduct" is a conduct clause only | **Consistent** |
| **SK-005 / chargeback evidence** | Return window, condition, free label and refund timing are all explicit and dated — this is the "terms the customer agreed to at checkout" line | **Now satisfiable** |

**One genuine conflict found and resolved in the policy's favour:**
- **UI-SPEC V1.2 addendum, p.49** records that *"COMPLIMENTARY SHIPPING & RETURNS"* was softened to *"SHIPPING & RETURNS AVAILABLE AT CHECKOUT"*. **Under Boss's free-shipping and free-returns decisions that softening is now wrong.** I previously classified that softening as a correction (§21.3 / §22.1 row S-6) on the grounds that it avoided asserting a commerce fact. **That reasoning held only while free shipping and free returns were undecided. They are now decided, so the original assertion is true and the softened copy understates a real trust signal.**
- **S-6 is therefore SPLIT:** the *"Secure checkout · taxes included"* half remains **SPEC-IS-WRONG** (tax inclusion is a commerce fact Shopify determines, and NJ apparel exemption makes it doubly unsafe). The *"COMPLIMENTARY SHIPPING & RETURNS"* half is **reclassified as a REAL DEFECT — the live copy understates a decided policy.** Recorded in the register at §22.1, not silently changed.
- **AC-POL-5** below carries the fix forward.

---

## 4. FLAGGED FOR BOSS — five items, in priority order

### 4.1 Free returns need a physical return destination — the largest operational gap
The policy promises a **free prepaid return label**. That requires an address a returned garment is actually sent to, and someone to receive and check it before the refund is issued ("once your return is received and checked"). **I do not know where returns physically go, and I have not assumed.** The registered business address is a Jersey City residential-format address. **This is a decision and an operational commitment, not a copy question**, and it is the one item that could make the published policy untrue. **Boss must confirm the return destination before publication.** If returns are to be refunded without requiring the item back, the copy changes materially and I will rewrite §2.1.

### 4.2 `[[DISPATCH_WINDOW]]` — I will not invent a dispatch time
Constraint 1 forbids revealing our supply chain, but it does not license a guess. **I have no verified dispatch window** and the connector is disconnected, so I assert nothing. Boss supplies a number of business days and I will publish it. **A published dispatch promise we cannot meet is a chargeback risk in the same category SK-005 describes** — "product not received" — so an honest longer window beats a flattering short one.

### 4.3 Support alias instead of a personal address — **yes, this is needed, and I recommend it**
`av.loy07@gmail.com` appears **five times** across the three policies and is flagged Required in Contact information. Three reasons to change it before launch:
1. **Trust.** A personal Gmail on the legal policies of a $128 premium brand is a visible mismatch with the brand register everything else is written in.
2. **Continuity.** A personal address cannot be handed over, shared, or covered when one person is unavailable. Our own SLA — "1-2 business days" — depends on someone reading it.
3. **Evidence.** SK-005's chargeback line needs a support trail tied to the business, not to an individual's inbox.
**Recommendation: `support@carlophillips.com`, forwarding wherever Boss wants for now.** The alias can be created and forwarded in minutes and every occurrence in this file updated in one pass. **It also engages TFRD GAP-5, which is still open on exactly this point ("destination/controlled case incomplete").** Boss's call; flagged, not assumed.

### 4.4 Business name casing
The published privacy policy names the business **"carlophillips"** (lowercase). Every customer surface uses **CARLOPHILLIPS**. I have used the lowercase legal name in the "Who we are" and Contact blocks, where it should match registration, and the brand form elsewhere. **Confirm the registered legal name is correct as-is** so the four policies agree with each other.

### 4.5 Privacy policy not authored here
The existing privacy policy is already published and **I have not rewritten it**. It is outside this assignment and it is the one policy with real regulatory exposure. **Flagging only:** it should be read once against the other three for consistency of business name, address and contact route, especially if 4.3 changes the contact address.

---

## 5. STANDING REQUIREMENTS — so this cannot quietly regress

Added to CP-COM-001's criteria set. These are launch requirements, not hygiene.

- **AC-POL-1** The production store MUST have a published Return and refund policy, Shipping policy, Terms of service, and Privacy policy, and MUST have Contact information set. **A missing policy is a launch-blocking defect**, on the SK-005 chargeback-evidence basis: with nothing published there is nothing to submit against a "credit not processed" or "product unacceptable" dispute, and at $128 a unit with no restockable inventory a lost dispute costs the garment, the shipping and the fee.
- **AC-POL-2** Those policies MUST render as reachable links in the Shopify checkout footer. **Verification is a visual check on the live checkout**, not an admin-settings check — the settings page showing text saved is not proof the customer can reach it.
- **AC-POL-3** The published text MUST match `docs/policies/CP-POLICIES-<version>.md` exactly. **This file is the source of truth; the Shopify admin is a render target.** Drift is a defect, and the direction of correction is always file → Shopify.
- **AC-POL-4** No customer-facing policy, product, or support copy may name or imply an external producer, or use made-to-order, final-sale, or personalised-goods language to limit returns. Sourced from `docs/design-system.md` ("Provider-neutral customer copy"). **E-POL-1:** any such phrase reaching a customer surface is a defect regardless of where it originated.
- **AC-POL-5** Customer-facing shipping and returns copy MUST match the published policy. **Specifically, PDP/checkout copy MUST NOT understate free shipping or free returns once decided** (see §3, S-6 split).
- **AC-POL-6** A policy change is a **versioned artifact change**: new dated file, Boss publishes, §0 table updated in the same commit.
- **U-POL-1** Before launch: confirm all four policies plus Contact information are published, and open a live checkout to confirm the footer links resolve. **Unverified as of 2026-09-18 — the connector is disconnected and I have asserted nothing about the live store.**

---

## 6. STANDING REQUIREMENTS — PRE-PUBLISH GATE FOR ANY PRODUCT GOING ACTIVE

**Added 2026-09-19. Accepted by Sushma in the LAUNCH-CHECKLIST consensus round; carried to Boss alongside the P1 set.**

**Why this block exists.** KAN-13 (1 ACTIVE product, zero collection memberships, 10 empty collections) and KAN-18 (Rapid Logo Tee priced at $14.34, a cost price, six sizes S-XXXL, DRAFT today) are not two bugs. They are one missing rule. The fix proposed for KAN-13 — publish the Tee to reach catalogue depth — is a single admin click, and that click fires **four** defects at once on a live-payment store:

1. the $14.34 cost price becomes a live retail price (KAN-18);
2. the PDP tells a six-size tee customer *"Choose S, M or L before adding this **hoodie** to your bag"* and *"available in S, M and L"* — hardcoded at `apps/web/src/components/product/ProductForm/index.tsx:261-264` and `:269-271`, a direct breach of **AC-CUR-4** (no signal that unsold sizes exist);
3. the product joins zero collections, so it is reachable only by direct URL;
4. the product carries no category metafield, so ADR-0001's sweep cannot see it.

**A product that is ACTIVE but invisible to our own catalogue logic is not published. It is merely switched on.**

### The gate

**AC-PUB-1..AC-PUB-8. No product may be set ACTIVE on the production store until every line passes.** Verification is a read of the **authoritative Shopify Admin API record**, not the admin UI badge and not a convenience surface. This follows the standing source ranking: a displayed status is the weakest evidence available.

- **AC-PUB-1 — Price is a retail price, confirmed by Boss against intended margin.** Not a cost, not a placeholder, not a figure inherited from a supplier record. **KAN-18 exists because no one owned this line.**
- **AC-PUB-2 — Price resolves on the rendered PDP and is not `$0`.** `product-view-model.ts:90` coerces an absent price to `0`, which renders as `$0` on an enabled add-to-bag button. A product whose price does not resolve MUST NOT render a purchasable PDP; it renders the unavailable state. **There is no customer-facing circumstance in which `$0` is correct for this store.**
- **AC-PUB-3 — Every size named in customer copy is a size the product actually sells, and no size it does not sell is named anywhere on the surface.** This is **AC-CUR-4** at publication time. It currently **fails for every product that is not an S/M/L hoodie.**
- **AC-PUB-4 — Product-type-neutral copy.** No customer-facing string may hardcode a garment type. *"this hoodie"* must not appear on a tee. Strings must derive from the product's own option values and type.
- **AC-PUB-5 — At least one collection membership**, or an explicit recorded Boss decision that the product is direct-URL-only, with the reason.
- **AC-PUB-6 — Category metafield present**, so ADR-0001's sweep can see the product.
- **AC-PUB-7 — Vendor field scrubbed from every client payload for that product.** **Per-product verification, every time — never a one-time check.** KAN-19 (Apliiq in the live production `/shop` payload) is exactly what happens when scrubbing is assumed rather than verified per product.
- **AC-PUB-8 — At least one image, and no image filename carries a vendor or fulfilment tell.** Precedent: `01-factual-apliiq-front.png` (KAN-17). The asset path is a customer-reachable surface.

### E-PUB-1 — Publication is a THREE-role act (revised 2026-09-19, supersedes the two-person form)

**The two-person form is withdrawn. It was unexecutable as written and is corrected here rather than discovered broken at the first publication.** AC-PUB-1, -2 and -7 require Shopify Admin API and served-payload reads that Pushpa cannot perform. A rule its own owner cannot run is not a control.

**The three roles, and none of them is optional:**

- **Aarti — instrument.** Supplies the AC-PUB readings. He gains no authority by doing so; he does not grade and does not publish.
- **Pushpa — grader.** Grades each reading against AC-PUB-1..8 and records the result with the date verified in the CP-PUB-001 verification log.
- **Boss — activator.** Sets the product ACTIVE. Only Boss.

**E-PUB-1a — Every reading carries a date and a source.** A reading without both is not evidence and MUST NOT be graded. The source names the surface read (Admin API record, served PDP document, served listing payload) — never "the store" or "the site", because AC-PUB-7 is decided per surface.

**E-PUB-1b — A reading that could not be taken blocks the gate; it never passes it.** NOT READ is a blocking state, not a neutral one. This is Aarti's condition on accepting the instrument role and it is normative: *not examined is never fine.* A gate line may be marked PASS, FAIL or NOT READ. There is no fourth value and NOT READ stops publication.

**E-PUB-1c — A PASS is a property of the payload read, not of the mechanism.** Where a line passes because a given payload happened to be clean, and no code path enforces it, the log MUST record the pass as **unguarded**. An unguarded pass expires at the next change to that product or that surface and must be re-read. A denylist, an allowlist and a per-render derivation are not equivalent evidence, and the log says which one backed the pass.

**E-PUB-1d — Boss out of the loop does not create a fourth path.** Where a gate line requires a Boss input he has not given, the line is graded on the objective evidence available and recorded as **PROVISIONAL**, with the exact input still owed and the interim rule in force named beside it. PROVISIONAL permits an already-ACTIVE product to remain ACTIVE. It NEVER permits a new product to go ACTIVE. Nothing in this gate is ever recorded as waiting.

A product set ACTIVE without a recorded AC-PUB verification is an **untracked change to a live-payment commerce surface**, in the same class as a policy published without the §0 table updated (AC-POL-6).

### Sequencing ruling — Pushpa, 2026-09-19

**Do not publish the Rapid Logo Tee in order to fix KAN-13.** Fixing an empty-catalogue discovery defect by publishing a product that fails four gates trades one defect for four live-store defects, and does so on a store taking live payment.

Two acceptable paths:
1. **Fix the Signature Hoodie's collection membership first.** That resolves KAN-13's "zero collections" without publishing anything new, and it is the lower-risk move.
2. **Run the Tee through AC-PUB-1..8 and publish it clean.**

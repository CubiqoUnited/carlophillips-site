# CP-COPY-001 — PDP purchase-support copy: prohibited "final sale" language and the assertion that encodes it

- Owner (product): Pushpa
- Implementer: Aarti
- Raised by: Sushma (CI block, PR #153)
- Date: 2026-09-19
- Status: PRODUCT VERDICT ISSUED — awaiting Aarti implementation

## Context

`tests/monorepo-home-commerce.test.js:165` asserts `ProductForm` contains:

```
Final sale · Shipping details available at checkout
```

That string was removed from `apps/web/src/components/product/ProductForm/index.tsx`
by commit `3f1d634`. 1 failed / 137 passed. The failure was masked because
`format:check` aborts the `verify` chain before `test:categories`.

## 1. Verdict — is the copy prohibited?

**Yes. Prohibited. The component is correct; the test is stale.**

Settling line, `CLAUDE.md` § Project:

> Apliiq is print-on-demand **behind the scenes and invisible to the customer** — never reveal it in customer-facing copy, and never lean on made-to-order or **final-sale** language.

This is unambiguous and names "final-sale" explicitly. Two independent faults in
the removed string:

1. **"Final sale"** — directly named as prohibited. It is also a POD tell: it is
   the standard concession a print-on-demand storefront makes because it cannot
   restock or resell a personalised unit. Shipping it both violates the mandate
   and leaks the fulfilment model.
2. **"Shipping details available at checkout"** — defers a material pre-purchase
   term to checkout. For a US-only premium apparel PDP this is below standard:
   the customer should know the shipping posture before committing to a size and
   pressing add-to-bag, not after entering the funnel.

**The test assertion must change. The component must not be reverted.**

## 2. What the assertion should test instead

The shipped replacement copy at `ProductForm/index.tsx:229-231` is:

```
Free shipping on eligible orders · Returns accepted — see policy
```

That copy is **directionally correct but not yet approvable as-is** — see §3.
Therefore the assertion should be written in two layers so CI protects the rule
rather than one fragile sentence.

### AC-1 — Assert the prohibition (must pass, permanent)

The negative assertion is the one that carries the mandate. Add to the same test:

```js
expect(source).not.toMatch(/final sale/i);
expect(source).not.toMatch(/made[ -]to[ -]order/i);
```

This is the load-bearing guard. It must never be removed.

### AC-2 — Assert presence of purchase-support copy structurally, not verbatim

Replace the line 165-167 assertion. Do **not** substitute another exact sentence
— copy will move again and CI should not be hostage to wording. Assert the
container instead:

```js
expect(source).toContain('cp-purchase-support');
```

...plus the two stable semantic anchors:

```js
expect(source).toMatch(/shipping/i);
expect(source).toMatch(/returns/i);
```

Rationale: the product rule is "shipping posture and returns posture are both
stated on the PDP before add-to-bag". That rule survives rewording. The exact
sentence does not.

### AC-3 — Existing assertions unchanged

`name="referenceHash"`, `<QuantityStepper`, `ADD TO BAG -`, `'CHOOSE A SIZE'`,
`data-purchase-state="sold-out"`, `SOLD OUT`, and the two `not.toContain` guards
stay exactly as they are. This item touches only the line 165-167 assertion and
adds AC-1.

## 3. Does removal leave a product obligation unmet?

**Yes — two open obligations. Neither is caused by the removal, but the removal
makes them visible and one of them is now a live-payment risk.**

### OBL-1 (P1) — "Returns accepted — see policy" points at no policy

Verified: there is **no returns policy page and no shipping policy page anywhere
in `apps/web/src/app`**. The string "see policy" sits in a bare `<span>`, not a
link. The customer is told a policy exists and is given no way to read it.

This compounds with **D-030 (real return address) still open with Boss**. The
store is in **live payment mode**. We are currently asserting "Returns accepted"
to paying customers while having no published terms and no confirmed address to
accept a return at. That is a commitment we cannot presently honour.

This is worse than the copy it replaced. "Final sale" was prohibited, but at
least it was not a promise we would fail.

**AC-4:** `Returns accepted — see policy` must link to a real returns page, or
the returns clause must be reduced to non-committal wording until D-030 closes.
Pushpa's recommendation is to keep the returns promise and unblock D-030, because
suppressing returns language on a premium US apparel PDP costs conversion and
edges back toward the final-sale posture we are forbidden from taking.

**AC-5:** Until D-030 closes and a policy page exists, `Returns accepted — see
policy` is **not cleared for production**. It is cleared for staging.

### OBL-2 (P2) — "Free shipping on eligible orders" is an unverified claim

"Eligible orders" is undefined to the customer. No threshold is stated and I have
no evidence of the Shopify shipping profile that would substantiate it. A price
claim with an undefined qualifier is the kind of thing that invites a chargeback
argument.

**AC-6:** Before production, the free-shipping threshold must be confirmed against
the authoritative Shopify shipping profile for the production store and either
(a) stated numerically in the copy, or (b) the claim softened to remove the
unqualified "free". Verification is Aarti's or Sushma's lane; the copy decision
returns to me once the threshold is known.

**AC-7 (satisfied already):** The final `cp-purchase-note` — "You will review
delivery and payment on a secure checkout before placing the order." — correctly
covers the pre-payment disclosure the removed string was gesturing at. No gap
there.

## 4. Does the language survive elsewhere in `apps/web`?

Searched `apps/web` for `final sale`, `made to order`, `non-refundable`,
`no returns`, `all sales final`, `print on demand`, `apliiq`.

**Prohibited sale language: clean.** Zero remaining occurrences of
final-sale / made-to-order / non-refundable / all-sales-final in `apps/web`.
The test at line 165 is the **only** surviving instance in the repo, and it is
in test code, not shipped copy.

**Apliiq is named in two places:**

1. `apps/web/src/lib/providers/shopify/public-product-json-adapter.ts:61` —
   `'apliiq'` appears in what reads as a redaction/denylist. Not customer-facing
   copy; it is the mechanism that keeps the vendor out of the public payload.
   **No action. This is the control working.** Aarti should confirm it is a
   strip-list and not an allow-list.

2. `apps/web/src/app/media-lab/signature-hoodie-media-lab.tsx:9` — visible label
   `Front — factual Apliiq/POD source`. This **is** rendered text and it names
   both the vendor and the fulfilment model.

   Mitigated, not clean: `apps/web/src/app/media-lab/page.tsx` calls `notFound()`
   unless the environment is `local` or `NEXT_PUBLIC_STAGING_REVIEW === 'true'`,
   and sets `robots: { index: false, follow: false }`. So it 404s in production
   today.

   **Residual risk (P2):** the gate is a single env var. If
   `NEXT_PUBLIC_STAGING_REVIEW=true` is ever set on the production deployment,
   the Apliiq label ships to a public URL. The mandate says *invisible to the
   customer*, and a label reading "factual Apliiq/POD source" is the most direct
   possible violation.

   **AC-8:** Rename the media-lab labels to drop the vendor and the POD model.
   Proposed: `Front — factual source` and, for the others, keep `AI-assisted
   Draft` as-is. This costs nothing internally — the team knows what the source
   is — and removes the leak regardless of how the env gate is configured.
   Defence in depth: do not rely on the env var alone.

## Acceptance criteria summary (for Aarti)

| ID | Criterion | Blocking PR #153 | Env |
|----|-----------|------------------|-----|
| AC-1 | Add `not.toMatch(/final sale/i)` and `not.toMatch(/made[ -]to[ -]order/i)` to the ProductForm test | Yes | all |
| AC-2 | Replace test line 165-167 with `cp-purchase-support` + `/shipping/i` + `/returns/i` assertions | Yes | all |
| AC-3 | Leave all other assertions in that test untouched | Yes | all |
| AC-4 | `see policy` must resolve to a real returns page, or returns wording softened | No | prod |
| AC-5 | Current returns copy not cleared for production until D-030 closes | No | prod |
| AC-6 | Verify free-shipping threshold against Shopify shipping profile; restate or soften | No | prod |
| AC-7 | Pre-payment disclosure note — already satisfied, do not remove | — | all |
| AC-8 | Strip `Apliiq`/`POD` from media-lab visible labels | No | all |

**Do not revert the component.** The removal in `3f1d634` was correct and is
upheld by this verdict.

## Product-fit position

The CI failure is a stale test, not a regression. AC-1 through AC-3 unblock
PR #153. AC-4 through AC-6 are production gates that I am flagging now because
the store is in live payment mode — they are not PR #153's problem and should not
be used to hold it.

---

# PART 2 — KAN-14: the policy pages and the approved PDP string (2026-09-19)

**ID COLLISION NOTICE — read before implementing.** Everything above this line is
the **Part 1** series. From here down, **AC-1..AC-12 are the KAN-14 series**. When
referring to the Part 1 criteria, cite them as **P1-AC-1..P1-AC-8**. Part 1 is
unchanged and still stands; Part 2 does not supersede it.

## P2.0 What changed since the 084500Z signal

**The material new fact: the policy text already exists.** It is not missing — it
is **drafted, approved-in-register, and unpublished**.

`/Users/edv/Developer/local-canonical-carlophillips/docs/policies/CP-POLICIES-v1-2026-09-18.md`
is declared the source of truth for published policy text (its §0 and AC-POL-3).
It carries finished paste blocks for Return and refund, Shipping, Terms of
service, and Contact information, and it already contains the standing criteria
AC-POL-1..AC-POL-6 and U-POL-1.

This **narrows** KAN-14. I am not authoring returns and shipping policy from
scratch. The gap is publication, two unresolved placeholders, a return
destination, and a PDP link target. Part 2 below is written against that file and
must not contradict it.

### VERIFIED FACTS (all read directly by me, 2026-09-19)

| # | Fact | Source |
|---|---|---|
| V-1 | `CP-POLICIES-v1-2026-09-18.md` §0 records all four authored policies as **NOT PUBLISHED**, and Contact information as **NOT SET** and flagged Required by Shopify. Privacy policy is recorded as already published and was **not** authored in that file. | that file, §0 |
| V-2 | Two deliberate unresolved placeholders exist in the paste blocks: `[[FREE_SHIPPING_THRESHOLD]]` (§2.2) and `[[DISPATCH_WINDOW]]` (§2.2 Dispatch). Both are Boss decisions; the file explicitly refuses to invent either. | that file, §2 preamble, §4.2 |
| V-3 | The drafted returns policy states a **30-day window from delivery**, **free returns with a prepaid label**, **no restocking fee**, refund to original payment method in **3-5 business days from receipt**, and **original shipping refunded**. | that file, §2.1 |
| V-4 | The drafted shipping policy states **US-only shipping**, defers non-eligible shipping cost to checkout, and carries an **alternative opening** to use if Boss decides free shipping applies to every order — so publication is *not* gated on the threshold. | that file, §2.2 and the block following it |
| V-5 | The return **destination** is explicitly unresolved and is flagged as the largest operational gap, on the grounds that a prepaid-label promise requires an address and a person to receive and check the item. This is the same open item as D-030. | that file, §4.1 |
| V-6 | Standing criterion **AC-POL-4** already prohibits made-to-order, final-sale and personalised-goods language, and any naming or implying of an external producer, on *any* customer surface — sourced to `docs/design-system.md` "Provider-neutral customer copy". **E-POL-1** makes any such phrase a defect regardless of origin. | that file, §5 |
| V-7 | Standing criterion **AC-POL-5** requires PDP/checkout copy to **not understate** free shipping or free returns *once decided*. §3 of that file records free returns as **decided** by Boss; the free-shipping **threshold** is recorded as **not set**. | that file, §3 and §5 |
| V-8 | **AC-POL-2** requires policy reachability to be verified as a **visual check on the live checkout**, explicitly not an admin-settings check. | that file, §5 |
| V-9 | `state/NOW.md` records D-030 as open with Boss, notes Shopify offers no virtual return mailbox (SK-006), grades it not launch-blocking but time-sensitive, and records that a plain street address with fulfilment disabled is acceptable. | `state/NOW.md` line 36 |
| V-10 | `state/NOW.md` records the store as US-only, one enabled market, so **no international, customs or duties clauses are required** in either policy. | `state/NOW.md` line 37 |
| V-11 | Confirming evidence, carried forward from the 084500Z signal and re-affirmed: `apps/web` contains **zero** occurrences of final-sale / made-to-order / non-refundable / all-sales-final in shipped code. The prohibition is presently clean in the app tree. | prior grep, 2026-09-19 |

### ASSUMPTIONS — flagged, not verified by me

- **B1.** That the Shopify-hosted policy URLs (`/policies/refund-policy`,
  `/policies/shipping-policy`) are reachable from the headless storefront domain,
  or that an equivalent route exists in `apps/web`. **I have not verified this and
  it is not mine to solve — it is routing. Handed back to Sushma for Aarti.**
  AC-4 below is written so the link target is named as a requirement, not as a
  chosen mechanism.
- **B2.** That Boss's "free returns" decision recorded in that file's §3 is
  current and unrescinded. One recorded decision in one document; I have not seen
  it re-confirmed since 2026-09-18.
- **B3.** That the existing **published privacy policy** is consistent with the
  three unpublished ones on business name, address and contact route. That file's
  §4.5 flags this as unchecked. Still unchecked as of today.
- **B4.** That no free-shipping threshold is configured in the production Shopify
  shipping profile. Still **unverified either way** — carried unchanged from
  assumption A4 in the 084500Z signal. One document's silence is not a reading.

---

## P2.1 Acceptance criteria — the two policy pages

Scope: what each page must state for a premium US-only apparel store taking live
payments. These build on CP-POLICIES-v1; where that file already satisfies a
criterion I say so rather than restating the text.

### Returns / refund policy page

**AC-1 — Reachability before purchase.**
The returns policy MUST be reachable from the PDP **before add-to-bag**, from the
site footer, and from the checkout footer. Checkout-only reachability does **not**
satisfy this criterion: a PDP that references a policy before the customer commits
to a size must resolve that reference at that moment. Verification per AC-POL-2 is
a visual check on the live checkout **plus** a click-through from a live PDP.

**AC-2 — Mandatory content.** The page MUST state, unambiguously:
1. the return window and what it runs from — **30 days from delivery** (V-3);
2. that returns are **free**, with a prepaid label, **no restocking fee** and no
   return shipping charge (V-3, and required by AC-POL-5 not to understate);
3. the **condition requirements** — unworn, unwashed, original tags attached;
4. **how to start a return**, with a named contact route and a stated response SLA;
5. **where the item goes** — see AC-5, blocked on D-030;
6. **refund method and timing** — original payment method, 3-5 business days from
   receipt, plus the bank-settlement caveat;
7. that **original shipping paid is refunded**;
8. **damaged, faulty or incorrect items** handled separately, with the condition
   requirements expressly disapplied;
9. **exchanges** — how a size change is actually achieved;
10. **order cancellation** before dispatch.

CP-POLICIES-v1 §2.1 satisfies items 1,2,3,4,6,7,8,9,10 as drafted. **Item 5 is the
only content gap.**

**AC-3 — Prohibited content (hard, permanent).**
The page MUST NOT contain, in any form: made-to-order, make-to-order, final sale,
all sales final, personalised-goods or custom-manufacture language; any naming or
implying of an external producer or print-on-demand fulfilment; any returns
limitation justified by how the garment is produced. This restates AC-POL-4 /
E-POL-1 at page level. **Any such phrase is a defect regardless of origin, and it
is a defect even if it is factually true.**

**AC-4 — The PDP reference must resolve.**
The words in the PDP purchase-support line that name a policy MUST be live links
resolving to the published returns policy and the published shipping policy
respectively, returning HTTP 200 with the policy text rendered. A bare `<span>`,
a `#` href, or a link to a page that 404s each fail this criterion. **The link
mechanism is Aarti's call (see B1); the requirement that it resolves is mine.**

**AC-5 — Return destination is a named placeholder, BLOCKED ON D-030.**
The returns page MUST state a physical destination for returned goods, or MUST
state that a prepaid label carrying the destination is supplied and the customer
need not know it in advance. Until Boss answers **D-030**, that destination is the
named placeholder **`[[RETURN_DESTINATION_ADDRESS]]`**.

**What cannot ship until D-030 lands — stated explicitly, as required:**
- The **returns policy MUST NOT be published** to the production store with
  `[[RETURN_DESTINATION_ADDRESS]]` unresolved. A published free-prepaid-label
  promise with no destination is an untrue policy on a live-payment store, and it
  is precisely the document that would be submitted as chargeback evidence.
- The **PDP returns promise MUST NOT ship to production** while the returns page
  is unpublished. This upholds P1-AC-5 unchanged.
- **Staging is not blocked.** Both may ship to staging with the placeholder
  visibly unresolved.
- Everything else in Part 2 — the shipping page, the PDP string's shipping half,
  the test assertion, the link plumbing — is **not** blocked by D-030 and should
  proceed now.

### Shipping policy page

**AC-6 — Mandatory content.** The page MUST state:
1. **where we ship** — United States only, with no international, customs or
   duties clauses, since those states are unreachable (V-10);
2. **shipping cost** — either the eligibility threshold as a number, or that
   shipping is free on all US orders, or that cost is calculated at checkout.
   Exactly one of these three, chosen by Boss. See AC-8;
3. **dispatch window** in business days — placeholder `[[DISPATCH_WINDOW]]`,
   Boss's number, not invented (V-2);
4. **what the customer receives and when** — order confirmation on purchase,
   tracking email on carrier handover;
5. **tracking truthfulness** — tracking appears only once a shipment exists, and
   what the order reads as until then;
6. **incorrect or incomplete addresses** and what we do;
7. **lost or stalled shipments** — a stated trigger and a contact route.

CP-POLICIES-v1 §2.2 satisfies all seven **subject to the two placeholders**.

**AC-7 — Prohibited content.** As AC-3, applied to the shipping page. In addition,
the dispatch window MUST NOT be explained, qualified, or justified by reference to
how or where the garment is produced.

**AC-8 — No unresolved placeholder may be published.**
Neither `[[FREE_SHIPPING_THRESHOLD]]` nor `[[DISPATCH_WINDOW]]` may reach a
customer surface. Publication of the shipping policy requires both resolved.
**Note the asymmetry, already anticipated in CP-POLICIES-v1:** the threshold has a
drafted alternative paragraph, so if Boss elects free shipping on all US orders
the threshold placeholder disappears without a rewrite. `[[DISPATCH_WINDOW]]` has
no such escape — it is a hard blocker on publishing the shipping page.

**AC-9 — Policy and PDP must agree.**
Shipping and returns copy on the PDP MUST be consistent with the published pages,
and MUST NOT understate free shipping or free returns once decided (AC-POL-5).
Divergence in either direction is a defect. Direction of correction is always
policy file → Shopify → PDP.

**AC-10 — Publication record.**
Publication MUST update the §0 table in CP-POLICIES-v1 in the same commit
(AC-POL-6). A policy published without that table updated is an untracked change
to a legal surface.

---

## P2.2 The approved PDP purchase-support string

Replacing `Free shipping on eligible orders · Returns accepted — see policy`.

### APPROVED — literal string

```
Free returns within 30 days. Shipping is calculated at checkout. Read our shipping policy and returns policy.
```

**Link targets — two links, inside the third sentence only:**

| Link text | Resolves to |
|---|---|
| `shipping policy` | the published shipping policy |
| `returns policy` | the published returns policy |

The first two sentences carry **no links**. "Free returns within 30 days" is a
plain assertion, not a reference, so it does not need to resolve — which is
exactly the fault in the string it replaces.

**Why this wording:**
- It matches the brand register set out in CP-POLICIES-v1 §1 — short, declarative,
  second person, no marketing adjectives.
- It asserts only what the drafted policy asserts. Nothing here states a figure
  Shopify owns.
- It names the policies in the words the customer will see at the top of those
  pages, so the reference and the destination agree.
- It contains the tokens `shipping` and `returns`, so it satisfies the structural
  test in P1-AC-2 without the test having to know the sentence.

**AC-11 — Gating on the approved string.**
The **returns half** of the string ships to production only when AC-5's D-030 gate
is cleared **and** the returns page is published. The **shipping half** and both
links may ship as soon as the pages are published. If the returns page is not yet
published at deploy time, the interim production string is the shipping half
alone:

```
Shipping is calculated at checkout. Read our shipping policy.
```

That interim string **understates nothing that is currently published**, so it
does not breach AC-POL-5. It is an interim state, not an acceptable end state.

---

## P2.3 The "eligible" qualifier — my ruling

**RULING: REMOVE the qualifier, and remove the free-shipping claim from the PDP
entirely. Do not define eligibility.** This closes my own P2 (OBL-2 / P1-AC-6).

Three reasons:

1. **I cannot define it without inventing product intent.** The threshold is
   Boss's open decision — `[[FREE_SHIPPING_THRESHOLD]]`, recorded unset (V-2). A
   PO inventing a dollar threshold on a live-payment store is a fabricated
   commerce fact, and it would immediately be the authoritative one, because
   CP-POLICIES-v1 declares itself source of truth.
2. **An undefined qualifier is worse than no claim.** "Free shipping on eligible
   orders" tells the customer a benefit exists and withholds the condition. On a
   $128 unit that is the exact shape of a disputable representation, and unlike
   the returns promise it buys us nothing — the customer still cannot tell whether
   it applies to them.
3. **Removing it costs nothing that is currently true.** No free-shipping
   threshold is verified as configured (B4). The trust signal the PDP needs is
   carried by **free returns**, which *is* decided (V-7) and which is the stronger
   signal for apparel anyway, because the real purchase anxiety is fit.

**AC-12 — Reinstatement condition.**
If and when Boss sets the threshold, or elects free shipping on all US orders,
the PDP string MUST be revised to state it, because at that point silence
*understates* a decided benefit and breaches AC-POL-5. The revised wording returns
to me. Until then, the PDP defers shipping cost to checkout.

**Aarti and Sushma: the Shopify shipping-profile read requested at item 3 of the
084500Z NEXT list is still worth doing**, but it is no longer blocking this copy.
If it comes back showing a configured threshold that we are silently not stating,
that is a new finding under AC-12, and it routes to me.

---

## P2.4 Approved assertion string for `tests/monorepo-home-commerce.test.js:165-167`

For Aarti, so no product copy has to be invented in a test file.

**The replacement for lines 165-167:**

```js
expect(source).toContain('cp-purchase-support');
expect(source).toMatch(/shipping/i);
expect(source).toMatch(/returns/i);
```

**Plus the permanent prohibition guard (P1-AC-1), which is the load-bearing one:**

```js
expect(source).not.toMatch(/final sale/i);
expect(source).not.toMatch(/made[ -]to[ -]order/i);
```

**Do not assert the approved sentence verbatim.** The string in P2.2 has a
conditional interim form (AC-11) and a reinstatement condition (AC-12). A verbatim
assertion would fail CI on an approved copy change, which trains the team to edit
the guard. The structural assertion encodes the durable product rule: **shipping
posture and returns posture are both stated inside `cp-purchase-support` before
add-to-bag, and prohibited fulfilment language never appears.**

Note the interim string in AC-11 still contains `shipping` but **not** `returns`.
If Aarti ships that interim form, the `/returns/i` assertion fails — **correctly**.
That failure is the gate telling us the returns promise is suppressed. It must be
resolved by publishing the returns page, not by deleting the assertion.

---

## P2.5 Part 2 acceptance criteria summary

| ID | Criterion | Blocked by | Env |
|----|-----------|-----------|-----|
| AC-1 | Returns policy reachable from PDP pre-add-to-bag, site footer and checkout footer | publication | prod |
| AC-2 | Returns page states all 10 mandatory items; only item 5 is a gap today | D-030 | prod |
| AC-3 | Returns page carries no prohibited fulfilment or final-sale language | — | all |
| AC-4 | PDP policy references resolve to live 200 pages | B1 (routing, Aarti) | prod |
| AC-5 | Return destination as `[[RETURN_DESTINATION_ADDRESS]]`; MUST NOT publish unresolved | **D-030** | prod |
| AC-6 | Shipping page states all 7 mandatory items | placeholders | prod |
| AC-7 | Shipping page carries no prohibited language; dispatch window unexplained | — | all |
| AC-8 | No unresolved placeholder may be published; `[[DISPATCH_WINDOW]]` is a hard blocker | Boss | prod |
| AC-9 | PDP copy agrees with published policy; no understatement | — | all |
| AC-10 | §0 publication table updated in the same commit | — | prod |
| AC-11 | Returns half of PDP string gated on D-030 + publication; interim form defined | D-030 | prod |
| AC-12 | Reinstate free-shipping claim if Boss sets a threshold; wording returns to Pushpa | Boss | prod |

## P2.6 Handed back to Sushma — not mine to solve

1. **Link target mechanism (B1)** — whether Shopify `/policies/*` URLs resolve on
   the headless storefront domain, or whether `apps/web` needs its own routes.
   **Architecture. Aarti's lane. AC-4 states the requirement only.**
2. **D-030 to Boss** — now blocks publication of the returns policy, not just an
   operational detail. Recommend closing before the next production deploy.
3. **`[[DISPATCH_WINDOW]]` to Boss** — a hard blocker on publishing the shipping
   page, and it has no drafted escape hatch the way the threshold does. This one
   is not currently on the board as far as I can see. **Raise it.**
4. **Publication itself** — Boss pastes, per CP-POLICIES-v1 §0. Not Pushpa,
   not Aarti.
5. **Privacy-policy consistency check (B3)** — still unchecked since 2026-09-18.

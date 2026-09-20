# CP-PUB-001 — Pre-publish gate for any product going ACTIVE (AC-PUB-1..8)

- Owner (product): Pushpa
- Raised by: Pushpa, in the LAUNCH-CHECKLIST consensus round
- Accepted by: Sushma, 2026-09-19 ("YES to AC-PUB-1..8")
- Date: 2026-09-19
- Status: STANDING GATE — ACTIVE FROM NOW
- Canonical text: `docs/policies/CP-POLICIES-v1-2026-09-18.md` §6
- Relates to: KAN-13, KAN-18, KAN-19, KAN-17, M-1 (absent price → `$0`), AC-CUR-4

## Why this exists

KAN-13 and KAN-18 are one missing rule, not two bugs. The remediation proposed for
KAN-13 — publish the Rapid Logo Tee to reach catalogue depth — is a single admin
click that fires four defects simultaneously on a live-payment store: the $14.34
cost price goes retail; the PDP tells a six-size tee customer *"Choose S, M or L
before adding this hoodie to your bag"*; the product joins zero collections; and it
carries no category metafield, so ADR-0001's sweep cannot see it.

**The gate is worth more than the individual bugs**, because the bugs are instances
and the gate is the rule. Fixing KAN-18's price without this gate leaves the next
product to repeat it.

## The gate — summary

Full normative text lives in CP-POLICIES-v1 §6. Verification is a read of the
**authoritative Shopify Admin API record**, never the admin UI badge.

| ID | Criterion | Currently failing? |
|----|-----------|--------------------|
| AC-PUB-1 | Price is a retail price, Boss-confirmed against margin — not a cost, not a placeholder | **Yes — KAN-18** |
| AC-PUB-2 | Price resolves on the PDP and is not `$0`; unresolvable price renders unavailable, not purchasable | **Yes — M-1** |
| AC-PUB-3 | Every size named in copy is sold; no unsold size is named (AC-CUR-4) | **Yes — for any non-S/M/L product** |
| AC-PUB-4 | Product-type-neutral copy; no hardcoded garment type | **Yes — `ProductForm/index.tsx:261-264, 269-271`** |
| AC-PUB-5 | At least one collection membership, or a recorded direct-URL-only decision | **Yes — KAN-13** |
| AC-PUB-6 | Category metafield present so ADR-0001's sweep sees it | **Yes — KAN-13** |
| AC-PUB-7 | Vendor scrubbed from every client payload, verified **per product, every time** | **Yes — KAN-19** |
| AC-PUB-8 | At least one image; no vendor or fulfilment tell in any image filename | **Yes — KAN-17 precedent** |

**E-PUB-1 — THREE-role act (revised 2026-09-19; the two-person form is withdrawn).**
Aarti supplies the readings as instrument; Pushpa grades and records with the date
verified; Boss makes the product ACTIVE. Every reading carries a date and a source.
A reading that could not be taken is NOT READ, and NOT READ **blocks** the gate.
A pass backed by no enforcing code path is recorded **unguarded** and expires at the
next change. Where a line needs a Boss input he has not given, it is graded
PROVISIONAL on objective evidence — which keeps an already-ACTIVE product active and
never lets a new one go ACTIVE. Full normative text: CP-POLICIES-v1 §6, E-PUB-1a..1d.

## Sequencing ruling

**Do not publish the Rapid Logo Tee to fix KAN-13.** Trading an empty-catalogue
discovery defect for four live-store defects is the wrong trade on a store taking
live payment.

1. **Preferred:** fix the Signature Hoodie's collection membership. Resolves KAN-13's
   "zero collections" without publishing anything new. Lower risk.
2. **Or:** run the Tee through AC-PUB-1..8 and publish it clean.

## Verification log

Every ACTIVE product gets a dated row. Empty rows are not passes.

| Product | Date verified | AC-PUB-1..8 | Verified by | Boss set ACTIVE |
|---|---|---|---|---|
| Signature Hoodie | 2026-09-19 (partial) | **1 PROVISIONAL · 2 PASS (unguarded) · 7 FAIL · 3,4 FAIL · 5,6 FAIL · 8 NOT READ** | readings Aarti + Sushma; graded Pushpa | already ACTIVE, pre-gate |
| Rapid Logo Tee | 2026-09-19 | **NOT RUN — ARCHIVED on production, do not publish** | Sushma (archive action) | — |

### Signature Hoodie — first run of the gate, graded 2026-09-19 by Pushpa

Product was ACTIVE before this gate existed. This is its first grading, and it is a
**partial** run: three of eight lines were read, three are already settled by standing
findings, and one was never read at all.

**AC-PUB-1 — PROVISIONAL, per E-PUB-1d. Not a pass.**
Reading: 3 variants at `$128.00`, uniform, Admin API, 2026-09-19 (Aarti; corroborated
by the PDP document read, Sushma, same date). Objective evidence that this is a retail
figure and not a cost figure: it is **uniform across all variants**, whereas the one
product on this store known to carry Apliiq cost-table pricing (Rapid Logo Tee) varied
$13.34–$16.34 **by size** — the cost-table shape. A uniform figure cannot have come
from a per-size cost table.
What is still owed: the criterion is *Boss-confirmed against intended margin*, and
cost-shaped-or-not is not margin. Boss is out of the loop. **No inference from shape is
a margin confirmation and I am not recording one.**
**Interim requirement in force now:** (a) the Signature Hoodie stays ACTIVE at $128.00;
(b) **its price MUST NOT be changed by anyone while AC-PUB-1 is PROVISIONAL** — a price
move would consume the only evidence this grade rests on; (c) **no other product may use
"the figure looks like retail" to satisfy AC-PUB-1.** For any new product AC-PUB-1 is
unmet until Boss states the figure, and unmet blocks ACTIVE; (d) Boss's margin
confirmation for this product is owed at first contact, not at next publication.

**AC-PUB-2 — PASS, and recorded UNGUARDED per E-PUB-1c.**
Reading: served PDP document `https://www.carlophillips.com/product/carlophillips-signature-hoodie`,
HTTP 200, 2026-09-19 (Sushma). `"price":{"amount":"128.00"}` on all three variants,
rendering visibly as `$128`. Price resolves; it is not `$0`.
**Why unguarded:** `product-view-model.ts:90` still collapses `undefined`, `null`, `''`
and a legitimate `0` into one value. Nothing in the render path distinguishes "price
unresolved" from "price is zero". This payload carried a price, so the defect did not
fire. **The pass is a property of the data on 2026-09-19, not of a control.** It expires
on the next change to this product or to that path, and Aarti's requirement 1 in
CP-REQ-001 §5 is unaffected and stays P1.

**AC-PUB-7 — FAIL. Per-product across every client payload, and one surface leaks.**
Readings, both correct, different surfaces, both 2026-09-19:
- served PDP document: **zero** occurrences of `apliiq`, case-insensitive (Sushma) — clean.
- served `/shop` listing payload: `"vendor":"Apliiq"` present for this product (Aarti) — leaking.

**The criterion says *every* client payload. One clean surface does not carry a leaking
one, and I will not grade this per-product-per-best-surface.** FAIL stands. This is
KAN-19 and it is the reason KAN-19 does not downgrade: the PDP being clean is the
**absence of the field in that payload**, not the presence of a scrub. There is no
product-level field scrub anywhere; the `apliiq` denylist at
`public-product-json-adapter.ts:61` operates on tags only, inside `customerTagline()`.
**Recorded as a scope correction to KAN-19 — per-surface, not per-product — and
explicitly not a downgrade.**
I also hold Aarti's dispute inside our agreement: **AC-PUB-7 must not be folded into
AC-18 by analogy.** AC-18 is enforced on every render and cannot silently lapse; a
denylist is only as good as its last update. Different evidence classes, separate builds.

**Lines settled without a fresh read, recorded so the run is not read as cleaner than it is:**
- **AC-PUB-3 and AC-PUB-4 — FAIL.** `ProductForm/index.tsx:261-264, :269-271` hardcode
  "S, M and L" and "this hoodie" for every product (2026-09-19). They happen to be true
  of this product, which is exactly why the defect has never been visible. Closed
  permanently by AC-18, not by this product.
- **AC-PUB-5 and AC-PUB-6 — FAIL.** KAN-13: this product is in **zero** collections and
  carries **no category metafield** (2026-09-19). The one ACTIVE product on the store is
  invisible to our own catalogue logic.
- **AC-PUB-8 — NOT READ, and per E-PUB-1b that is a blocking state.** No one has read
  this product's image filenames for a vendor or fulfilment tell. KAN-17 is the precedent
  on staging (`apliiq-front.png`). **Not examined is not fine.** One read, Aarti's.

**Net:** the single ACTIVE product on a live-payment store fails or cannot pass six of
eight gate lines. **It does not get de-activated over this** — de-activating the only
product is a worse customer outcome than the defects, and AC-PUB is a gate on *going*
ACTIVE. What it forbids is treating this product as a passed reference. **The Signature
Hoodie is not a template. Nothing may be published "like the Hoodie".**

## What is not mine

- Deriving the PDP size and product-type strings from real option values (AC-PUB-3,
  AC-PUB-4) is implementation. **Aarti's.**
- Payload scrubbing verification per product (AC-PUB-7) is a store read. **Aarti's.**
- Price decisions (AC-PUB-1) are **Boss's**. I verify the figure is a retail figure;
  I do not set it.

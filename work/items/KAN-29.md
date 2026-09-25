# KAN-29 — Money presentation returns to two fraction digits

Owner of this file: Pushpa (Product / Acceptance / UAT).
Written 2026-09-19. Product gate file for dispatch to BUILD.

---

## PUSHPA_CONFIRMED

**Actual (verified 2026-09-19, by direct read of the four source files listed
below):** every active price formatter is configured
`minimumFractionDigits: 0` with `maximumFractionDigits: 2`. Cents are therefore
conditional. A $14.34 product renders `$14.34`; a $128.00 product renders
`$128`. Both forms can and do appear in the same grid, the same cart, the same
PDP block.

**Expected:** every money value on every customer-facing storefront surface
renders with exactly two fraction digits, always, regardless of whether the
cents are zero. `$128.00`, not `$128`. `$14.34` unchanged.

This is a product-presentation defect, not a cosmetic preference. I confirm it
as stated and I am not conditioning the confirmation on anything further.

### Three grounds

1. **Ragged money within one surface.** Conditional cents means the decimal
   point lands in a different place on adjacent items in the same list. Money
   read down a column is compared by the customer; a column that does not align
   is read as sloppy before it is read as cheap. This is the ground that does
   not depend on any other system.

2. **Divergence from Shopify at the moment of truth.** Shopify checkout is the
   commerce authority and it renders `$128.00`. The storefront renders `$128`.
   The customer therefore sees the price change form between the product page
   and the payment page. Even where the number is identical, a changed
   presentation at checkout is the single worst place in the funnel to
   introduce doubt. Shopify's presentation is not ours to argue with; ours must
   match it.

3. **Premium positioning.** CARLOPHILLIPS is premium US-only apparel. Truncated
   money is a discount-retail idiom. Full cents are the convention of every
   store we are asking to be compared with. Weakest of the three grounds on its
   own; decisive alongside them.

Ground 1 and ground 2 each independently justify the revert. Ground 3 does not
need to carry weight.

---

## SOLUTION_CONSENSUS

**Option B: `minimumFractionDigits` returns to `2` in all four files.**

Four files, all of them, in one change:

- `apps/web/src/components/product/ProductInfo/index.tsx` (line 20)
- `apps/web/src/components/product/ProductForm/index.tsx` (line 17)
- `apps/web/src/components/editorial/WorkbookReplica.tsx` (line 79)
- `apps/web/src/components/commerce/catalog-state.tsx` (line 23)

`maximumFractionDigits: 2` is already correct in all four and does not change.

**All four or none.** Reverting a subset is strictly worse than the current
state: today the storefront is uniformly conditional, which is one wrong rule
applied consistently. A partial revert produces two different money rules on
one storefront, and ground 1 then bites harder than it does now. If any of the
four cannot be changed in this pass, the correct action is to change none of
them and come back to me.

**Aarti holds the approach.** I am specifying the rendered outcome, not the
implementation. If Aarti concludes the four call sites should be collapsed
behind a single shared formatter rather than edited in four places, that is his
call and I do not need to be re-consulted — provided the rendered outcome is
two fraction digits on all four surfaces. The acceptance is on output, not on
the diff shape.

### A fifth surface Aarti must handle — flagged, not ruled

`tests/storefront-price-formatting.test.ts` currently asserts the defect:

- line 14: `expect(formatCatalogPrice(128, 'USD')).toBe('$128')`
- line 20: `expect(source).toContain('minimumFractionDigits: 0')` for three of
  the four files

That test will fail on a correct revert, and it will fail *correctly* — it is
pinning the behaviour we are removing. It must be updated to expect `$128.00`
and `minimumFractionDigits: 2`. It is a test file, outside my four, and how it
is restructured is Aarti's. I record it here so nobody resolves a red CI by
reverting the revert. Verified by read, 2026-09-19.

---

## Acceptance criteria

- **AC-29-1** Every money value on PDP, product form, workbook/editorial and
  catalogue surfaces renders with exactly two fraction digits.
- **AC-29-2** A whole-dollar price renders `$128.00` on the storefront and
  `$128.00` at Shopify checkout — identical strings.
- **AC-29-3** A price with non-zero cents is unchanged: `$14.34`.
- **AC-29-4** No surface renders a truncated form. A single `$128` anywhere is
  a fail of the whole item.

Negative/edge cases I expect covered: `$0.00`; a price ending `.50` rendering
`$X.50` and not `$X.5`; a four-figure price rendering thousands separator plus
cents; any discounted or compare-at price rendering under the same rule as the
primary price.

**UAT:** staging, after deploy, by me. Four surfaces, at least one whole-dollar
and one cents-bearing product each, plus the checkout handoff for AC-29-2.

---

## 1. R-2 waiver — ruling

**The waiver as written is VOID. I re-issue it, scoped, in the same breath.**

My KAN-14 text says: *"If any copy, component or policy text moves in this
release, the waiver is void and R-2 applies unchanged."* This revert moves four
components. By the literal terms I wrote, the waiver is void. I will not
pretend otherwise, and Sushma was right to refuse to interpret it.

But the clause exists to stop *copy or policy text* riding into production on a
waiver granted for a test-file change. That risk is not present here. So:

**Re-issued waiver, scoped to KAN-29:** R-2 is waived against this deploy on
the ground that KAN-29 changes number *formatting configuration* only. It
publishes no product, adds no string, alters no policy surface, and introduces
no presentation that was not previously approved — it restores presentation
that was. Specifically `WorkbookReplica.tsx:223` is untouched; only line 79
moves in that file.

**Condition, and it is not a formality:** if the shipped diff touches any
string literal on any customer-facing surface, or any line of
`WorkbookReplica.tsx` other than line 79, this re-issued waiver is void and R-2
gates the release. Aarti or Sushma must show me the diff scope if there is any
doubt. Tranche 2 is untouched and holds in full: no returns promise on any
customer surface until the returns policy is published and D-030 lands.

No fresh R-2 gate is required for KAN-29 on these terms. Production sign-off
still requires my staging UAT — that gate is not waived and never was.

---

## 2. Baseline authorisation — ruling

**Conditional. I want Aarti's alignment scan back before the authorisation is
live.**

My authorisation was granted on a pixel delta consisting of exactly one
change: the Maker-card deletion. The expectation is that after this revert the
delta collapses back to that single item.

**That is an assumption, not a verified fact, as of 2026-09-19.** It is a
well-founded one — restoring a previously-approved rendering should restore the
previously-approved pixels — but money strings get wider by three characters
when cents come back, and a wider string is exactly the kind of thing that
reflows a card, wraps a line, or shifts a grid. I am not going to assert that
it collapses cleanly when the whole point of the mechanism is that I do not
assert pixel facts I have not seen.

So: **send me the post-revert alignment scan.** If it shows the delta is the
Maker-card deletion and nothing else, my existing authorisation covers the
regeneration with no widening, and I will say so in one line without a further
gate. If it shows anything additional — any reflow, wrap or shift attributable
to the wider money strings — that is new scope and I re-verify before the
baseline regenerates.

This does not block BUILD. Aarti reverts now; the scan comes back after.

---

## Facts and assumptions

**Verified 2026-09-19, by direct read of the repository:**
- All four named files carry `minimumFractionDigits: 0`, at the lines given.
- `tests/storefront-price-formatting.test.ts` asserts `'$128'` and
  `minimumFractionDigits: 0`, and will fail on a correct revert.
- KAN-14's waiver clause voids on component movement, as quoted above.

**Assumption, dated 2026-09-19, flagged as such:**
- That Shopify checkout renders `$128.00`. This is Shopify's standard money
  presentation and I have no reason to doubt it, but I have not personally
  re-read it in either store today. If it is somehow configured otherwise,
  ground 2 falls and grounds 1 and 3 still carry the revert. I will confirm it
  directly during staging UAT under AC-29-2.
- That the post-revert pixel delta collapses to the Maker-card deletion. See
  section 2.

---

## 2a. Baseline authorisation — CLEARED (2026-09-19, post-scan)

Scan received against commit 6df18f6. **My existing baseline authorisation
covers the regeneration with no widening. Proceed.**

Reasoning, because the caveat deserves an answer rather than a nod: Aarti is
right that the catalogue-card and workbook money formatters are unevidenced by
rendered pixels, and right to say so before I cleared. But the baselines are
generated from the same fixture environment the scan ran against. A surface
that renders no money string in fixture mode also renders no money string into
the baseline image. There is no pixel there for this change to widen. The
unevidenced surfaces are unevidenced *and* uncaptured, and holding the baseline
would not buy evidence about them — only the staging UAT does that.

So I decline the hold. The delta on every surface the baseline actually
captures is the single Maker-card deletion, plus a money string on the PDP
whose bounding box is byte-identical pre and post. That is precisely the
authorisation I granted, and nothing has widened it.

**What stays open, and is not covered by this clearance:** rendered evidence
for catalogue-card and workbook money presentation, and for `$128.00` in USD
specifically. Both are unit-test-backed and source-verified, neither is
pixel-verified. They come to me at staging UAT under AC-29-1 and AC-29-2. If
staging shows a money-driven reflow on a card surface, that is a new finding
against the baseline and I will say so then — clearing the regeneration now
does not spend that objection.

Shopify checkout `$128.00` remains my open assumption, dated 2026-09-19,
confirmable only at UAT. Unchanged by this scan.

---

## Next

Generate the linux baselines and merge. On green staging, send me the UAT
dispatch — I owe rendered confirmation on the catalogue, workbook and checkout
surfaces this scan could not reach.

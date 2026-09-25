---
id: ADR-0001
title: Catalogue sizing generalisation and live-derived storefront navigation
owner: aarti
status: PROPOSED — no build authorised. Requires Pushpa product-fit gate, then Sushma readiness gate.
date: 2026-09-19
item: CP-CAT-001
governing: D-011 (Shopify authoritative), D-014 (launch posture), ADR-001 (only apps/web is deployed), AGENT_COMMUNICATION_PROTOCOL Rules 6/7/8
supersedes: nothing
verification: code facts verified by reading apps/web/src at HEAD on branch ship-envgate. NO live store read performed in this session — every store-side statement is marked NEEDS-LIVE-VERIFICATION.
---

# ADR-0001 — Catalogue sizing and navigation

Scope boundary: everything below is in `apps/web/`. Per ADR-001 that is the only tree
built and served. No product scope is added here; this ADR removes two code constraints
that are currently forcing product decisions.

---

## 1. VERIFIED FACTS (read at HEAD, file:line)

**F1 — The size filter is a module constant, not configuration.**
`apps/web/src/lib/providers/shopify/product-loader.ts:29`
```ts
const PHASE_ONE_SALE_SIZES = new Set(['S', 'M', 'L']);
```
Applied in `customerFacingVariants()` at `product-loader.ts:218-234`:
- `:221-226` — if the product has **no** option named `size`, **all** variants are returned untouched.
- `:228-233` — if it has a `size` option, only variants whose size value uppercases into the set survive.

**F2 — An empty survivor list degrades silently, it does not error.**
In `toObservedProduct` (`product-loader.ts:143-216`):
- `:152-157` — when `offeredVariants` is empty, price falls back to `product.priceRange` (the *unfiltered* Shopify range), so the page shows a price for a variant the customer cannot select.
- `:195-197` — `variants.sizes` falls back to the literal `['One Size']`.
- `:199-208` — `observedVariants` is `[]`, so there is no variant ID to add to bag.
- `:209-211` — `availableForSale` is `false`.
Net: a numeric-sized or One-Size product with a `Size` option renders as a priced, sized-looking, unbuyable page. That is worse than an empty state, because it looks purchasable.

**F3 — `One Size` is specifically caught by the filter.** A product whose option is literally named `Size` with value `One Size` takes the `:228` branch and is stripped, while an identical product with the option omitted entirely takes the `:221` pass-through. The failure is driven by option *naming*, not by product kind.

**F4 — Navigation is a two-element constant, and the resolver cannot widen it.**
`apps/web/src/lib/navigation/storefront-menu.ts:20-33` defines `DEFAULT_STOREFRONT_MENU_CATEGORIES` = `tshirts`, `hoodies`.
`resolveStorefrontMenuCategories()` at `:58-93` accepts live categories, builds a map at `:63-68`, writes every caller-supplied category into it at `:70-88` — and then at `:90-92` **projects the result back over the two hardcoded keys**:
```ts
return DEFAULT_STOREFRONT_MENU_CATEGORIES.map(
  (category) => resolved.get(category.key) || category
);
```
Anything the caller supplies outside `tshirts`/`hoodies` is computed, stored, and discarded. The `formatCategoryLabel` and `ALL …` label-generation code at `:82-86` and `:95-104` is therefore dead for every third category — the generalisation was written and then clipped at the return.

**F5 — Live category state already exists upstream of the menu, in two places.**
- `apps/web/src/lib/commerce/home-catalog-summary.ts:69-81` derives `categories` from `decision.products` by `productType`, with hoodie/sweatshirt and tee/tshirt normalisation. Arbitrary types slugify at `:77`.
- `apps/web/src/components/commerce/catalog-state.tsx:108-111` builds `categoryLinks` from live categories and passes them at `:137` to `StorefrontHeader`, which calls the resolver at `apps/web/src/components/layout/StorefrontHeader/index.tsx:30`.
So on `/shop` the truthful data reaches the resolver and is thrown away at F4. **No new data source is needed.**

**F6 — The landing-page menu passes nothing.**
`apps/web/src/components/editorial/WorkbookReplica.tsx:860` calls `resolveStorefrontMenuCategories()` with **no argument**, hitting the `:61` early return of the raw constant — even though the same component already computed live categories as `availableCategories` at `:397-399` from `catalogSummary.categories`. This is a wiring gap, not a data gap.

**F7 — Tests pin the current behaviour and will fail on change.**
`tests/storefront-menu-navigation.test.tsx:15-17` asserts the exact two-element href array; `:47` asserts the source string `resolveStorefrontMenuCategories().map(` in `WorkbookReplica.tsx`. Both are intentional change-detectors and must be rewritten as part of this work, not deleted.

**F8 — There is no test runner inside `apps/web`.** Root `vitest.config.ts` aliases `@` to `apps/web/src`; all unit tests live in `tests/` at the repo root and run via `yarn test` / `yarn test:categories`. E2E is Playwright at `tests/e2e`.

**F9 — Price rendering amplifies any variant-set change.** `product-loader.ts:152-157` computes min/max **from the surviving variants**. Widening the surviving set changes `compareAtPrice` for any product that is not single-priced, which is exactly the fake-"was"-price failure CP-CAT-001 §0 C3 warns about.

## 2. ASSUMPTIONS (not verified — must be closed before build)

- **A1** The Signature Hoodie's Shopify record contains **only** S/M/L size values (NOW.md records 9 variants at $128, "correctly curated to S/M/L"). If true, removing the filter is a behavioural no-op for it. **NEEDS-LIVE-VERIFICATION by authoritative API read of the product's variant `selectedOptions`.** This single fact selects between Option A and Option B in §4 and is the gating input to the whole ADR.
- **A2** No other deployed code re-applies a size restriction. `grep` found the constant only at `product-loader.ts:29,232`; `apps/web/src/components/product/ProductForm/index.tsx:23` carries a full XXS–5XL ordering table, which suggests the UI was always built for wider sizing. Not exhaustively traced through `variant-presentation-policy`.
- **A3** NOW.md:33 states the live menu renders only ALL CATEGORIES and ALL HOODIES, self-corrected from live state. **That does not match F4+F6**, which predict ALL TSHIRTS would also render on the landing page from the constant. Either the deployed build differs from this tree, or the observation was of a different surface. Recorded as a contradiction to resolve, not as a finding.

---

## 3. Why the S/M/L filter exists

Reconstructed from the record, stated as reconstruction: it is **Phase-1 sale curation** — `PHASE_ONE` in the name. The Rapid Logo Tee carried XL/XXL/XXXL variants that were not to be sold, and the storefront suppressed them in code. NOW.md:31 further records that S/M/L on the order widget was in `UI-SPEC-v1` from the start, so the *presentation* is design intent.

The design error is not the curation. It is that curation was expressed as a **global storefront-wide constant in a data-loading module**, which under D-011 puts a commerce policy in the frontend where Shopify is meant to be authoritative. One product's merchandising rule became every product's ceiling. SK-001 already recorded the correct Shopify-side lever (do not delete variants; per-variant channel unpublishing UNVERIFIED) — but that lever is unproven, so it cannot be the whole answer today.

**Consequence to preserve:** whatever replaces the filter, the Signature Hoodie must continue to offer exactly S/M/L. Regressing it would put previously-suppressed variants on the live, live-payments store — the same class of event as the Rapid Logo Tee P0.

---

## 4. Decision — sizing

**Replace the global filter with a per-product, Shopify-declared curation, defaulting to "offer what Shopify offers".**

Options considered:

- **A — Delete the filter outright.** Correct under D-011; safe only if A1 holds. If A1 is false it silently exposes suppressed variants on a live store. Cannot be chosen before the live read.
- **B — Per-product allowlist declared in Shopify** (`custom.sale_sizes`, single-line text, comma-separated, e.g. `S,M,L`). Absent or blank ⇒ no filtering. Present ⇒ filter to exactly those values, case-insensitive, trimmed. Curation stays a merchandising act performed in Shopify by whoever owns the listing; the frontend only reads it.
- **C — Per-category size vocabularies in code** (apparel S/M/L, footwear numeric, accessories One Size). Rejected: it re-encodes commerce policy in the frontend, is the same mistake at larger scale, and breaks the moment a product type is named differently.

**Chosen: B, with A as its own degenerate case.** B is a strict superset of today's behaviour, is authored in Shopify (D-011), is per-product, and makes the Hoodie's curation explicit and auditable rather than an invisible global. If the live read confirms A1, the Hoodie needs no metafield at all and B reduces to A for it — but B is still the right shape, because the next curated product will need it and the constant must not come back.

Required changes, all in `apps/web`:
1. `packages/shopify` `PRODUCT_FRAGMENT` gains `custom.sale_sizes` alongside the five existing `custom` metafields, surfaced on the transport type.
2. `customerFacingVariants` (`product-loader.ts:218`) takes the allowlist from the product instead of the module constant. Delete `PHASE_ONE_SALE_SIZES` at `:29`.
3. **Fail loud instead of degrading, and only on misconfiguration — never on stock.** Per §10.3, exclusion must key on curation configuration, not on availability:
   - Compute `curatedVariants` (the allowlist match against the product's actual variant sizes) separately from `availableVariants` (curated ∩ in-stock). If `curatedVariants` is non-empty but all are out of stock, the product still renders normally with `availableForSale: false` and a truthful sold-out state — this is the existing CP-CAT-001 §3 behaviour and must not regress.
   - Only when `curatedVariants` is empty **and** the unfiltered product has variants (i.e. the configured allowlist matches nothing on the product) is the product a misconfigured listing: exclude it (return `null` from `loadProduct`, `product-loader.ts:70` already does this cleanly; filter it out of the mapped array in `loadProducts`, `product-loader.ts:124`, which today maps every transport unconditionally and must skip nulls instead).
   - **Exclusion must never be silent (§10.3(b)).** Every exclusion logs/surfaces server-side the product handle and the rejected `sale_sizes` value, so a mistyped metafield is an observable event, not a vanished product. Placement is an implementation choice (structured log line from `toObservedProduct`/`loadProducts`, or an equivalent server-side signal) — the requirement is that it exists and carries handle + rejected value, not its exact mechanism.
   - This applies identically to the `/shop` grid, the home catalogue, and menu-category counts — all read from the same excluded set, so there is one place this is decided, not three.
4. Keep the `:221` no-`Size`-option pass-through unchanged. It is what makes `One Size` and numeric sizing work today when the option is simply not named `Size`, and it stays correct.
5. Re-check min/max price derivation (F9) against C3: when a product's variants differ in price, do not emit `compareAtPrice` as a fake "was". Out of scope to redesign here; in scope to not make worse — record the behaviour explicitly in the test suite.

This ADR does **not** decide sizing *vocabulary* per category (what sizes Footwear or Trousers should carry). That is product, and belongs to Pushpa on CP-CAT-001 §4.

---

## 5. Decision — navigation

**Make the menu a projection of live catalogue state, with the constant demoted to an empty-catalogue fallback.**

1. `resolveStorefrontMenuCategories` (`storefront-menu.ts:58`) returns **the resolved live categories**, deleting the clipping projection at `:90-92`. Ordering: a stable declared order for known keys (`hoodies`, `tshirts`) first, then remaining live categories alphabetically, so the menu does not reshuffle between deploys as inventory changes.
2. `DEFAULT_STOREFRONT_MENU_CATEGORIES` is renamed to reflect what it becomes — a fallback used **only** when no live categories are supplied (`:61`). It stops being the ceiling and becomes the floor.
3. Label generation already exists at `:82-86`/`:95-104` and becomes live code: `Trousers` ⇒ `ALL TROUSERS`. `formatCategoryLabel` keeps its `T-shirts`/`Hoodies` special cases.
4. `WorkbookReplica.tsx:860` passes its already-computed `availableCategories` (`:397-399`) into the resolver, closing F6. The landing menu and the `/shop` menu then read from one source.
5. Category key derivation stays where it already is (`home-catalog-summary.ts:69-81`). Do not duplicate the hoodie/tee normalisation into the navigation module — one authority for the slug.
6. **Minimum depth of 3 (§10.4(a)).** `resolveStorefrontMenuCategories` admits a live category into the returned menu only when its ACTIVE product count is ≥ 3. Below that threshold the category is omitted from the menu entirely — its products remain reachable on `/shop` and by direct product URL, they are simply not advertised as a category. This is a merchandising floor owned by Pushpa (§10.4(a)), not a technical constant to be tuned freely; changing it is a product decision.
7. **Approved category vocabulary (§10.4(b)).** Before a live category's slug is admitted, it is reconciled against an approved vocabulary (today: `hoodies`, `tshirts`; extended as Pushpa approves each new category per CP-CAT-001 §4). A slug not on the vocabulary gets no menu entry — it is not minted — and is reported (same observability mechanism as §4 item 3's exclusion logging: surfaced server-side with the unrecognised slug and the source `productType`). The depth check (item 6) and the vocabulary check (item 7) are independent gates; a slug must pass both to earn a menu entry.
8. Ordering (item 1) and the depth/vocabulary gates (items 6–7) apply in the same pass: derive live categories → filter to approved vocabulary → filter to depth ≥ 3 → order (declared-known-first, then alphabetical) → merge with fallback if the result is empty.

**This is the D-011-correct shape** and it is what NOW.md:33 already credits the frontend with doing: the navigation self-corrects when Shopify changes, with no deploy. Today that is true of `/shop`'s data and false of the menu's output.

---

## 6. Migration

No data migration; no schema change outside Shopify metafields. Sequence:

1. **Live read first (blocking), covering every status (§10.2).** Authoritative Admin API read of **every product in each store regardless of status — ACTIVE and DRAFT alike**, not "every ACTIVE production and staging product" as originally scoped. This closes the gap Pushpa identified: the Rapid Logo Tee is DRAFT with six variants `s..xxxl` at $14.34 cost-basis, and today's global constant is a silent second safety net over it — removing that constant without sweeping DRAFT products means the Tee going ACTIVE by anyone, at any time, publishes cost-basis xl/xxl/xxxl the moment it does. Record the full variant `selectedOptions` set per product, per status, with the date read. **The Rapid Logo Tee is named explicitly as in scope and must carry `custom.sale_sizes` before the global filter is deleted**, even though it is not currently ACTIVE. This closes A1 and A2 and is the evidence that Option A-vs-B is decided on fact.
2. If any product — ACTIVE or DRAFT — has size values outside its intended sale set, author `custom.sale_sizes` **in Shopify first**, and verify it reads back through the Storefront API — **before** the filter code is removed. Metafield in place, then code change. Never the reverse; the reverse order exposes variants on a live store for the length of a deploy. The Rapid Logo Tee's `custom.sale_sizes` must be authored and read back under this step even though the product will still be DRAFT at the time.
3. Ship in an isolated worktree (Protocol Rule 7), through `staging`, on a remote SHA (Rule 8). No local-SHA grading.
4. Verify on staging against a deliberately built probe set: one S/M/L curated product, one numeric-sized product, one `One Size` product with the option named `Size`, one third-category product. Then re-verify the Signature Hoodie on **production** after promotion — the P0 lesson: staging-correct is not production-correct.
5. New categories appear in the menu the moment a product of that type goes ACTIVE. That is the intent, and it means **the menu becomes a live blast radius of Shopify edits** — call it out to Pushpa and Boss: a mistyped `productType` will mint a menu entry. Mitigation is listing discipline (CP-CAT-001 §1.2 already says be consistent), not code.

## 7. Rollback

- **Code:** both changes are additive and confined to three files plus the shopify fragment. Revert the merge commit; the constant returns and behaviour is bit-identical to today. No stored state depends on the change.
- **Data:** `custom.sale_sizes` is inert to a reverted build — unread metafields are invisible (CP-CAT-001 §1.3). It can be left in place; no cleanup required for rollback.
- **Instant non-deploy lever:** if a product renders wrong sizes after release, set it to DRAFT in Shopify. That removes it from the storefront in seconds without a deploy, and is the first response — faster and safer than a revert.
- **Trigger:** any production product offering a variant outside its intended sale set is an immediate rollback, not an investigation.

## 8. Test strategy

Per Rule 6, each of these must produce a named command or file:line as evidence; "tests pass" is not a signal.

**Unit — `tests/` at repo root (F8), run by `yarn test`:**
- Curated product: `sale_sizes = S,M,L` on a record carrying S/M/L/XL ⇒ exactly 3 sizes, XL absent from `observedVariants`. **This is the Signature Hoodie non-regression test and it is the most important test in this change.**
- Uncurated numeric product (`28/30/32`) ⇒ all three survive, correct min price, `availableForSale` true.
- `One Size` with the option literally named `Size` ⇒ survives. Direct coverage of F3.
- No `Size` option ⇒ pass-through unchanged (guards the `:221` branch).
- Curation matching nothing ⇒ product is excluded, **and specifically does not emit a priced unbuyable page** (asserts F2 is dead).
- Multi-price variants ⇒ documented `compareAtPrice` behaviour, so F9 is pinned rather than discovered later.

**Navigation unit:**
- Rewrite `tests/storefront-menu-navigation.test.tsx:15-17` and `:47` (F7) — they currently assert the defect. Replace with: four live categories in ⇒ four menu entries out, in declared-then-alphabetical order; empty in ⇒ fallback out; label generation `Trousers ⇒ ALL TROUSERS`; and a source assertion that `WorkbookReplica` passes `availableCategories` rather than calling with no argument.

**Integration / E2E (`tests/e2e`, Playwright):** on staging, PDP for each of the four probe products — size options rendered, add-to-bag produces the exact selected variant, price at checkout equals the price on the page. Menu shows every probe category.

**Production verification after promotion (manual, evidenced):** Signature Hoodie PDP shows exactly S, M, L; menu entries match the live ACTIVE category set; no product renders a price without a selectable size. Rendered page, not an Admin badge.

**Explicitly not covered:** whether the sizes Pushpa chooses per category are correct merchandising, and any Apliiq-side sizing constraint on numeric or footwear sizing — that is unknown to me and must not be assumed satisfied. Flagged as an open question for the product-fit gate.

---

## 9. Open questions for the gates

1. **Pushpa (product fit):** does per-product Shopify-declared curation match how listings will actually be authored, and which products must stay curated beyond the Signature Hoodie?
2. **Pushpa:** size vocabulary per category — this ADR deliberately does not decide it.
3. **Sushma (readiness):** the live variant read (§6.1) is a store read, and store reads route through the channel she owns. It is the blocking input to the build.
4. **Unknown to me:** whether Apliiq supports the non-S/M/L sizes implied by four new categories. If it does not, the code change is correct and still unlocks nothing. Worth answering before, not after.

---

## 10. Product-fit gate — Pushpa

**Verdict: CHANGES_REQUESTED.**
Date: 2026-09-19. Reviewer: Pushpa (Product / BA). Scope: product fit only —
no comment on technical design, which is Aarti's and is not edited here.

The shape is right. §4 Option B and §5 live-derived navigation both move
curation into Shopify where D-011 says it belongs, and both are the correct
answer to constraints C1 and C2 that I wrote into CP-CAT-001 as blockers. I am
not asking for a different design. I am asking for three product rules that the
ADR currently leaves to discipline rather than to a control, one of which
re-creates the exact conditions of the D-027 P0.

### 10.1 Signature Hoodie preservation — SATISFIED, and A1 is closed

NOW.md's 2026-09-19 authoritative Admin API read records the Hoodie as three
variants only: Color `["black"]`, Size `["s","m","l"]`, all `$128.00`, all
`availableForSale: true`. Removing `PHASE_ONE_SALE_SIZES` is therefore a no-op
for it. Assumption **A1 is closed as TRUE** and Option B is safe for the one
product that currently takes money.

Case handling also holds. `product-loader.ts:232` compares
`size.toUpperCase()` against the uppercase constant, so the lowercase `s/m/l`
option values survive today — this closes NOW.md's open "not yet read in code"
observation. **Product requirement carried forward:** the per-product allowlist
must remain case-insensitive and whitespace-trimmed on both sides of the
comparison, because the store's own values are lowercase and the metafield will
be typed by a human. §4 Option B already states this; it must be asserted by a
test, not assumed.

### 10.2 CHANGE 1 (blocking) — the DRAFT Rapid Logo Tee is unprotected

**This is the D-027 P0 in waiting and it is why this gate is not an approval.**

Verified from NOW.md's 2026-09-19 re-read: the Rapid Logo Tee is DRAFT with six
variants `s`..`xxxl` at **$14.34 cost-basis**. Today the global filter is a
silent second safety net — if that product were set ACTIVE by anyone, the
storefront would still show only S/M/L. After this change that net is gone, and
setting it ACTIVE publishes `xl/xxl/xxxl` at cost-basis pricing on a store in
live payment mode.

ADR §6.2 scopes the metafield sweep to "every ACTIVE production and staging
product". The Tee is DRAFT and falls outside it. That is the precise error
pattern already recorded: correct about the environment examined, silent about
the one that takes money.

**Required:** §6.2's sweep covers **every product in each store regardless of
status — ACTIVE and DRAFT.** Any product whose variant size set exceeds its
intended sale set must carry `custom.sale_sizes` authored in Shopify and read
back through the Storefront API **before** the filter is deleted. The Rapid Logo
Tee is named explicitly as in scope. Pricing remains a separate open matter; this
change must not be the thing that decides it.

### 10.3 CHANGE 2 (blocking) — "zero survivors excludes the product" is the right
rule, but it is under-specified in two product-visible ways

The direction is correct and I endorse it. F2's priced, sized-looking, unbuyable
page is worse than absence: it advertises a price the customer cannot pay, which
is a trust failure and, on a live-payments store, close to a misrepresentation.
Excluding is the right call. Two conditions must be pinned before it is built.

**(a) Exclusion must key on curation, never on availability.** A product whose
curated sizes are all *out of stock* is a legitimate sold-out product and must
still render its page with a truthful unavailable state. CP-CAT-001 §3 already
requires that behaviour and it must survive. Only the case Aarti names —
curation yields zero while the unfiltered product has variants, i.e. a
misconfigured listing — may remove the product. If the two are conflated, a
temporary stock-out silently deletes a live product URL we may be advertising.

**(b) Silent exclusion is not acceptable.** A mistyped metafield would remove a
product from the storefront with no error, no alarm and no page — the failure
would present as "the product just isn't there", which is exactly the kind of
absence that goes unnoticed for days. Exclusion must be observable to us
(logged/surfaced server-side with the handle and the rejected curation value).
The customer sees nothing; we must see everything. How it is surfaced is Aarti's
call — that it is surfaced is a product requirement.

Note for the build, not a design instruction: `loadProduct` at
`product-loader.ts:70` already returns `null` cleanly, but the list path at
`:124` maps every transport unconditionally. Exclusion must work on both, and the
`/shop` grid and home catalogue must omit the product rather than fail.

### 10.4 CHANGE 3 (blocking) — live navigation must not mint a category on its own

The risk is real but smaller than it looks, and I want the record accurate on
that: a category only appears when a product of that type is ACTIVE, and going
ACTIVE is already gated by CP-CAT-001 §3's Definition of Done. So the control
against "a category before its products are ready" exists. **Two gaps remain.**

**(a) Depth-1 categories.** One ACTIVE product mints a full menu category
rendering "1 PIECE". NOW.md already records both the unspec'd "1 PIECE" tile and
the credibility cost of the thin storefront. A customer clicking ALL TROUSERS and
finding a single item reads as a broken store, not a curated one. **Required
product rule: a category earns a menu entry at a minimum depth of 3 ACTIVE
products.** Below that the products remain reachable on `/shop` and by direct
URL — they are not hidden, they are merely not advertised as a category. This is
the merchandising floor; it is not a technical constraint and I own it.

**(b) A typo must not be able to create a category.** ADR §6.5 correctly flags
that a mistyped `productType` mints a menu entry, and proposes listing discipline
as the mitigation. Discipline is not a control — a recorded caveat never is.
**Required: the derived slug set is reconciled against an approved category
vocabulary** (today: `hoodies`, `tshirts`; the spec's Jackets, Knitwear,
Trousers, Accessories, Footwear added as each is approved). An unrecognised slug
does not get a menu entry and is reported to us. The catalogue stays live-derived
— Shopify still decides *what exists*; we decide *what is advertised as a
category*, which is a merchandising act, not a data one.

### 10.5 Acceptance criteria — all must hold before this may be graded done

Numbered so they can be cited individually. Each needs a named command or
`file:line`; bare PASS is prohibited.

**Non-regression — the most important criteria in this change**
- AC-1 Signature Hoodie on **production**, rendered page not Admin badge: exactly
  S, M and L offered, `$128.00`, add-to-bag yields the exact selected variant,
  checkout price equals page price.
- AC-2 A product record carrying S/M/L/XL with `sale_sizes = S,M,L` offers
  exactly three sizes; XL is absent from `observedVariants`.
- AC-3 Lowercase store values (`s`,`m`,`l`) against an uppercase, space-padded
  metafield (` S, M , L `) resolve correctly. Pins §10.1.
- AC-4 No product anywhere in either store offers a size outside its intended
  sale set. Rapid Logo Tee explicitly included while DRAFT (§10.2).

**Curation and exclusion**
- AC-5 Absent or blank `sale_sizes` ⇒ every Shopify variant is offered. Default
  is "sell what the store sells".
- AC-6 Curation matching nothing ⇒ product excluded from PDP, `/shop` grid, home
  catalogue and menu-category counts, and **no priced page is emitted**. F2 dead.
- AC-7 Curated sizes all out of stock ⇒ product still renders with a truthful
  unavailable state. §10.3(a). AC-6 and AC-7 must both pass in the same suite.
- AC-8 Every exclusion is recorded server-side with handle and rejected value.
- AC-9 `One Size` with the option literally named `Size` survives, and a product
  with no `Size` option is unchanged. C1 in CP-CAT-001 is retired by this.

**Navigation**
- AC-10 A third category with ≥3 ACTIVE products gets a menu entry with a
  correctly generated label (`Trousers` ⇒ `ALL TROUSERS`).
- AC-11 The same category with 1 or 2 ACTIVE products gets **no** menu entry, and
  its products remain reachable on `/shop` and by direct URL.
- AC-12 An unrecognised slug gets no menu entry and is reported. §10.4(b).
- AC-13 Landing-page menu and `/shop` menu show the identical category set,
  proving F6 closed and one source of truth.
- AC-14 Empty live catalogue ⇒ fallback renders; no empty menu, no crash.
- AC-15 Menu order is stable across two consecutive deploys with unchanged
  inventory.

**Pricing honesty**
- AC-16 No product renders a `compareAtPrice` that is not a genuine former price.
  A fake "was" is discount language we did not author and §2.3 of CP-CAT-001
  prohibits it. If the widened variant set would produce one, suppress it.

**Copy**
- AC-17 No surface introduced by this change emits made-to-order, lead-time,
  final-sale or production-partner language. Applies to empty and excluded
  states, which is where placeholder copy usually leaks in.

### 10.6 What must be verified on staging before production

Staging first, on `carlophillips-staging.myshopify.com`, on a remote SHA
(Protocol Rule 8), against Aarti's four probe products plus two I require:

1. Curated S/M/L product with XL present in Shopify — AC-2, AC-3.
2. Numeric-sized product (`28/30/32`), uncurated — AC-5.
3. `One Size` with the option named `Size` — AC-9.
4. Third category at depth 3 — AC-10, AC-13.
5. **New: same category reduced to depth 1** — AC-11.
6. **New: product with a deliberately wrong `sale_sizes` (e.g. `XXL`)** — AC-6,
   AC-8; and the same product with valid curation but zero stock — AC-7.

Each on mobile and desktop. Add-to-bag through to the Shopify checkout screen on
at least probes 1 and 2 — stop before payment.

Then, and only then, production: AC-1 and AC-4 re-verified on the rendered
production storefront after promotion. **Staging-correct is not
production-correct** — that is the D-027 lesson and it is not negotiable here.

### 10.7 Answers to §9's open questions

- **§9.1** Yes, per-product Shopify-declared curation matches how listings will be
  authored — CP-CAT-001 §1 already has listings filled in Shopify Admin, and
  `sale_sizes` becomes one more field in that form. Products requiring curation
  beyond the Signature Hoodie: **Rapid Logo Tee (DRAFT, §10.2)**, and any future
  product whose Apliiq blank carries sizes we do not intend to sell. The Hoodie
  itself needs no metafield.
- **§9.2** Size vocabulary per category is mine and is **not blocking this ADR**.
  It is required before any Trousers/Footwear/Accessories listing is written, not
  before this code ships. I will deliver it against CP-CAT-001 §4.
- **§9.4 Apliiq sizing** — correctly flagged, and correctly **not** a blocker for
  this ADR. This change unlocks code, not merchandising; if Apliiq cannot supply
  numeric or footwear sizing, the code change is still correct and still removes a
  wrong constraint. It must be answered before copy or photography spend is
  committed to those categories. Route via Sushma's channel; not for this gate.

### 10.8 Consequential updates I own once this merges

CP-CAT-001 §0 C1 and C2 become false the moment this ships and must not be left
standing — they are currently instructions to authors. C1 is replaced by the
`sale_sizes` rule, C2 by the depth-3 vocabulary rule, C3 by AC-16. §4's Option C
("blocked on engineering") is re-scored. I will revise on merge, not before —
the item file must describe the deployed behaviour, never the intended one.

### 10.9 A1/A2/A3 disposition

- **A1 CLOSED TRUE** by the NOW.md verified read (§10.1).
- **A2 still open** — "no other code re-applies a size restriction" is not
  exhaustively traced. Not mine to close; it is a technical verification and must
  be closed before build, not assumed by this gate.
- **A3 still open** — the ADR is right to record the F4/F6-vs-NOW.md:33
  contradiction as a contradiction rather than a finding. I do not resolve it and
  I do not treat the live site as proof of approved behaviour. **It must be
  resolved before build**: if the deployed build differs from this tree, the
  file:line facts this ADR rests on may not describe what is serving customers.

**Summary: CHANGES_REQUESTED on §10.2, §10.3 and §10.4.** Make those three
changes and the product-fit gate is APPROVED without further review — the design
is not in question, the missing controls are.

---

## 11. Design revision in response to §10 (Aarti, 2026-09-19)

§10 is Pushpa's product-fit gate record and is not edited above. This section
records how the design in §4/§5/§6 was revised to satisfy §10.2, §10.3 and
§10.4, and closes A2.

### 11.1 §10.2 satisfied — sweep scope widened to every status

§6 migration step 1 is revised: the live read and the metafield-authoring step
now cover **every product regardless of status (ACTIVE and DRAFT)** in both
stores, not ACTIVE-only. The Rapid Logo Tee is named explicitly and must carry
`custom.sale_sizes` before `PHASE_ONE_SALE_SIZES` is deleted, even though it is
currently DRAFT. This removes the silent-second-net gap: once the filter is
gone, the Tee's protection is the metafield, authored ahead of the code change,
not the sequencing accident of "it happened to still be DRAFT."

### 11.2 §10.3 satisfied — exclusion keyed on curation, never on stock; never silent

§4 item 3 is revised to distinguish `curatedVariants` (allowlist match against
actual variant sizes) from `availableVariants` (curated ∩ in-stock):

- Curated-but-sold-out ⇒ product renders normally with `availableForSale: false`
  and a truthful unavailable state (CP-CAT-001 §3 behaviour preserved, AC-7).
- Curation matches nothing against the product's real variants ⇒ genuine
  misconfiguration ⇒ excluded (AC-6). This is the only condition that excludes.
- Every exclusion is logged/surfaced server-side with the product handle and
  the rejected `sale_sizes` value (AC-8) — both `loadProduct`
  (`product-loader.ts:70`, already returns `null` cleanly) and `loadProducts`
  (`product-loader.ts:124`, currently maps every transport unconditionally and
  must be changed to filter out nulls) are in scope, as must the `/shop` grid,
  home catalogue, and menu-category counts that read from the same set.

### 11.3 §10.4 satisfied — depth floor and approved vocabulary

§5 gains two admission gates ahead of ordering: a minimum-depth-of-3
ACTIVE-product floor before a category earns a menu entry (§10.4(a); below
depth, products stay reachable on `/shop` and by direct URL), and reconciliation
of the derived slug against an approved category vocabulary — `hoodies`,
`tshirts` today, extended only as Pushpa approves a new one (§10.4(b)). An
unrecognised slug mints no menu entry and is reported via the same
server-side observability mechanism as §10.3's exclusion logging. Both gates
must pass independently for a category to appear.

### 11.4 A2 — closed. No other code re-applies a size restriction.

Grepped `apps/web/src` (excluding tests) at HEAD on `ship-envgate` for
`PHASE_ONE_SALE_SIZES`, `SALE_SIZES`, `sale_sizes`, and size-list/size-filter
shaped patterns. Findings, each read in full and classified:

- `apps/web/src/lib/providers/shopify/product-loader.ts:29,232` — the constant
  itself and its one call site. This is the filter being replaced by this ADR;
  not a second instance.
- `apps/web/src/components/product/ProductForm/index.tsx:23` — `SIZE_ORDER`, a
  `Map` of all ten sizes (`XXS`…`5XL`) used only at `:49-52` to **sort**
  `available` combinations for display. It does not remove or filter any
  variant; every element of `presentation.combinations` that is
  `availableForSale` is rendered (`:46-47`). Not a restriction.
- `apps/web/src/components/member/FitMemory.tsx:6` — `const sizes = ['S', 'M',
  'L']`, a fit-quiz/member-preference component, not on the product-loading or
  purchase path. Not a catalogue restriction.
- `apps/web/src/fixtures/signature-hoodie-preview.ts:24` — a fixture literal for
  preview/test data, not runtime filtering logic.
- `apps/web/src/lib/commerce/home-catalog-summary.ts:139` — trims and filters
  blank strings out of `product.sizes`, which is the already-curated size list
  passed in; it does not apply a size allowlist of its own.

**No second size-restriction control exists in `apps/web`.** A2 is CLOSED:
`product-loader.ts:29,232` is the only place a size allowlist is applied to
what variants a customer can buy, and it is exactly the site this ADR revises.

One adjacent, non-blocking finding surfaced during the grep and is recorded for
completeness rather than as a blocker: `ShopifyCheckoutForm`
(`apps/web/src/components/product/ProductForm/index.tsx:261,268`) hardcodes the
strings "available in S, M and L" and "Choose S, M or L before adding this
hoodie to your bag" as static copy, independent of the product's actual
curated sizes. This is not a size-restriction control — it does not affect
which variants are offered — but it will read as wrong copy the first time a
non-S/M/L-curated product ships (e.g. a numeric or third-category product).
Flagged for Pushpa/Aarti to correct as part of implementation; not a gate
blocker for this ADR revision.

---

## 12. Product-fit gate re-review — Pushpa

**Verdict: APPROVED — product-fit gate cleared.**
Date: 2026-09-19. Reviewer: Pushpa (Product / BA). Scope: whether §11 satisfies
the three blocking changes in §10. Not a re-review of technical design.

### 12.1 §10.2 — SATISFIED

§11.1 widens the sweep to every product regardless of status, in both stores,
names the Rapid Logo Tee explicitly, and keeps the required sequencing
(metafield authored and read back in Shopify before `PHASE_ONE_SALE_SIZES` is
deleted). This closes the silent-second-net gap I raised — the Tee's
protection becomes the metafield, not an accident of its current status.

### 12.2 §10.3 — SATISFIED

§11.2 distinguishes `curatedVariants` from `availableVariants` and keys
exclusion only on curation matching nothing, not on stock — a curated,
sold-out product still renders truthfully (AC-7 preserved). Exclusion is
required to be logged server-side with handle and rejected value, and the
scope is stated as both `product-loader.ts:70` and `:124`, plus the `/shop`
grid, home catalogue and menu-category counts that read the same set. That is
exactly what I asked for in §10.3(a) and (b).

### 12.3 §10.4 — SATISFIED

§11.3 adds the depth-3 ACTIVE-product floor and the approved-vocabulary
reconciliation as two independent gates ahead of ordering, with unrecognised
slugs reported through the same observability mechanism as §10.3's exclusion
logging. Below-depth products stay reachable on `/shop` and by direct URL,
which is what I required rather than hiding them outright.

All three blocking changes are addressed at the design level. This ADR is
PROPOSED, not built — §10.5/§10.6's acceptance criteria and staging
verification remain the bar for calling the eventual build done, and nothing
here substitutes for that.

### 12.4 A2's adjacent finding — added to the AC list, not left as a bare follow-up

The `ProductForm` hardcoded "S, M and L" copy (`index.tsx:261,268`) is not a
size-restriction control and does not block this ADR. But it is a
product-facing correctness issue, not a code-quality one: the moment a
numeric-sized or third-category product ships under this same design, that
copy will assert something false about the product a customer is looking at,
on a live-payments store. That is squarely product meaning, not a technical
follow-up to leave to discretion.

**Adding AC-18 to §10.5:** the size-selection prompt and validation copy in
`ProductForm`/`ShopifyCheckoutForm` must derive from the product's actual
curated size set, not a hardcoded S/M/L string. Required before the build that
introduces the first non-S/M/L curated product may be graded done; not
required to unblock the Signature-Hoodie-only slice of this work, since S/M/L
is accurate for that product today. Owner: Aarti to implement, Pushpa to
verify the rendered copy on the first non-S/M/L probe product in §10.6.

**Summary: §10.2, §10.3 and §10.4 are all satisfied by §11. Product-fit gate
is APPROVED. AC-18 added to §10.5 for the ProductForm copy; it gates the first
non-S/M/L product, not this ADR.**

## 13. A3 closure (Aarti, 2026-09-19)

**Method:** git-only, per Sushma dispatch. No Vercel/Shopify access in this
session; nothing below is a live-deployment check.

**Verified facts:**
- Local HEAD is `9ba7aefcde6c5fe97e1ab0d0bddf1efa338d2cec` on `ship-envgate`,
  with uncommitted changes to `agents/watchdog.md`, this ADR, `state/BOARD.md`
  (per `git status`) — none of those touch the four cited files.
- `github` remote (`CubiqoUnited/carlophillips-site.git`) is the real GitHub;
  `origin` is a local directory clone, not evidence of anything pushed.
- `git diff HEAD github/main` and `git diff HEAD github/staging`, scoped to
  the four cited files (`product-loader.ts`, `storefront-menu.ts`,
  `home-catalog-summary.ts`, `ProductForm/index.tsx`), are **empty** — byte-
  identical content on both remote branch tips as of `github/main`
  `d5ac7deb` (2026-09-18T05:07:08-04:00) and `github/staging` `355de306`
  (2026-09-18T05:06:22-04:00).
- The Gate 10 production/staging proof SHAs recorded in NOW.md
  (`9981291c…` / `73dd67d9…`) are both valid commits in this repo, and
  `9981291c…` is a verified ancestor of current `github/main` — main has
  moved forward from that point, not diverged.
- Local HEAD is 8 commits ahead of `github/ship-envgate` (unpushed); those 8
  commits do not touch the four cited files.

**Assumption, not verified:** that `github/main`'s tip is what Vercel is
actually serving as the Production deployment right now. I cannot check
that from git/filesystem alone.

**This is the open item, and it is NOT new** — NOW.md already records it
as unresolved: "**DEPLOYMENT DRIFT, unresolved:** ... the deployment
actually serving production differs from the ID recorded below ... treat
the Production deployment ID below as stale," with Production
`dpl_E3ZfoZuKRzaXMp8GJr5hTdpo83ty` marked **SUSPECT**.

**Verdict: A3 STILL OPEN.** The code-identity half is closed: the tree this
ADR cites is byte-identical to both `github/main` and `github/staging` tips,
so the file:line facts in §1–§12 are not contradicted by anything pushed.
What remains open is the half A3 actually worried about — whether that
pushed tree is what production is serving — and that is exactly the
pre-existing NOW.md drift note, not a new gap this review found.

**Closes only when:** Aarti (or a Deployment Observer) supplies the actual
serving deployment ID with its source command (not a UI badge, not
`x-vercel-id`, per NOW.md's own rule), Sushma reconciles it against
`dpl_E3ZfoZuKRzaXMp8GJr5hTdpo83ty` and updates NOW.md, or Boss/Sushma's
Vercel access confirms it directly. Until then, build may proceed on the
strength of the code-identity match above, but this ADR's file:line facts
should still be read with the standing caveat that "verified against the
pushed tree" is not the same claim as "verified against what customers are
being served."

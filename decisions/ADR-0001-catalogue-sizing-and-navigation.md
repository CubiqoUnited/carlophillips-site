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
3. **Fail loud instead of degrading.** If curation yields zero variants while the unfiltered product has variants, that is a misconfigured listing: treat the product as not renderable (return `null` from the loader / exclude from the catalogue decision) rather than emitting the priced-but-unbuyable page of F2. A listing error must remove the product, not produce a broken purchase surface.
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

**This is the D-011-correct shape** and it is what NOW.md:33 already credits the frontend with doing: the navigation self-corrects when Shopify changes, with no deploy. Today that is true of `/shop`'s data and false of the menu's output.

---

## 6. Migration

No data migration; no schema change outside Shopify metafields. Sequence:

1. **Live read first (blocking).** Authoritative Storefront/Admin API read of every ACTIVE production and staging product's variant `selectedOptions`. Record the full size set per product with the date read. This closes A1 and A2 and is the evidence that Option A-vs-B is decided on fact.
2. If any ACTIVE product has size values outside its intended sale set, author `custom.sale_sizes` **in Shopify first**, and verify it reads back through the Storefront API — **before** the filter code is removed. Metafield in place, then code change. Never the reverse; the reverse order exposes variants on a live store for the length of a deploy.
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

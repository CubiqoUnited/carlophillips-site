# CP-CAT-001 — Product Listing Template

**Owner:** Pushpa (Product / BA)
**Status:** Proposed — awaiting Boss approval
**Date:** 2026-09-19
**Purpose:** One fill-in form per product so no listing is invented from scratch.

Shopify is authoritative. Everything below is entered **in Shopify Admin**. The
Next.js storefront is a projection — it renders only the fields listed in §1.
Anything not in §1 will not appear on the site no matter how well it is written.

---

## 0. Before you fill this in — three hard constraints

These are code facts, not preferences. Violating them produces a broken listing.

**C1 — Sizes are locked to S / M / L.**
`apps/web/src/lib/providers/shopify/product-loader.ts` filters every variant
through `PHASE_ONE_SALE_SIZES = new Set(['S','M','L'])`. If a product has an
option named `Size`, **only S, M and L survive**. A product whose sizes are
`One Size`, `28/30/32`, `US 9`, or `XS/XL` will have **zero** customer-facing
variants: no price, no sizes, `availableForSale: false`, unbuyable.
→ Either use exactly S/M/L, or give the product **no option named "Size" at all**.

**C2 — Navigation only has two categories.**
`apps/web/src/lib/navigation/storefront-menu.ts` hardcodes
`DEFAULT_STOREFRONT_MENU_CATEGORIES` to `tshirts` and `hoodies`, and
`resolveStorefrontMenuCategories` maps every resolved category back onto that
fixed pair. A product in a third category is reachable on `/shop` but **does not
get a menu entry**.

**C3 — One price per product.**
The storefront shows `min variant price` as the price and `max variant price` as
`compareAtPrice`. If your variants differ in price, the site will render a fake
"was" price. Keep every variant of a product at the same price.

If a product you want needs to break C1 or C2, it is an engineering change
(Aarti), not a listing. Raise it; do not work around it.

---

## 1. The field list — fill one block per product

### 1.1 Shopify core fields

| # | Field | Shopify location | Rule | Your value |
|---|---|---|---|---|
| 1 | **Title** | Title | 2–5 words, Title Case. Becomes `name`. | |
| 2 | **Handle** | URL handle | lowercase-hyphenated. Permanent — never edit after ACTIVE. Live URL is `/product/<handle>`. | |
| 3 | **Product type** | Product type | Drives the category slug: lowercased, spaces→hyphens. See §1.2. | |
| 4 | **Vendor** | Vendor | Always `CARLOPHILLIPS`. | |
| 5 | **Price (USD)** | Variant price | Same on every variant (C3). Currency must be USD. | |
| 6 | **Sizes** | Option `Size` | Exactly `S`, `M`, `L` — or omit the Size option entirely (C1). | |
| 7 | **Colour(s)** | Option `Color` | Option must be named `Color`. Omit if single colour. | |
| 8 | **Inventory** | Per variant | Every S/M/L variant tracked and in stock, or the size reads unavailable. | |
| 9 | **Description** | Description | See §2. Whitespace is collapsed to single spaces on render. | |
| 10 | **Tags** | Tags | Free text. **Read but not used for gating or display.** Internal only. | |
| 11 | **Status** | Active / Draft | ACTIVE only after §3 passes. | |
| 12 | **Sales channel** | Headless / Storefront API | Must be enabled or the product is invisible. | |
| 13 | **Market** | United States | US-only. | |

### 1.2 Category → what the customer actually sees

`productType` is lowercased and hyphenated to form the collection slug. The home
page additionally normalises it (`home-catalog-summary.ts`):

| Enter this `productType` | Slug | Menu entry? |
|---|---|---|
| `Hoodie` (or anything matching hoodie/sweatshirt) | `hoodies` | Yes |
| `T-Shirt` (or tshirt / tee) | `tshirts` | Yes |
| Anything else (`Jacket`, `Knitwear`, `Trousers`, …) | slugified as typed | **No** (C2) |

Be consistent: every hoodie gets the **same** `productType` string, or you will
split one category into two.

### 1.3 Metafields the frontend reads — VERIFIED

Namespace `custom`, all `single_line_text_field` (multi_line acceptable for care).
Source: `packages/shopify/src/queries.ts` `PRODUCT_FRAGMENT`.

| # | Namespace.key | Renders as | Required | Your value |
|---|---|---|---|---|
| 14 | `custom.tagline` | Eyebrow line above title. **If empty, falls back to `productType` in UPPERCASE.** | Strongly recommended | |
| 15 | `custom.material` | Details row "Material" | Yes | |
| 16 | `custom.fit` | Details row "Fit" | Yes | |
| 17 | `custom.care` | Details row "Care" | Yes | |
| 18 | `custom.size_guide` | Details row "Size guide" (note: **`size_guide`**, snake_case) | Yes | |

Empty metafields are silently dropped from the details list — the row simply
disappears. No error, no placeholder. **There are no other metafields.** Any
metafield not on this list is invisible to the storefront.

### 1.4 Images and media

Query limits: `images(first: 10)`, `media(first: 20)`.

| # | Field | Rule | Your value |
|---|---|---|---|
| 19 | **Image count** | Minimum 4, target 6, maximum 10. | |
| 20 | **Position 1** | Hero. Product-only, no model, plain ground. This is the card image and the home hero. | |
| 21 | **Position 2** | Front, full garment, straight on. | |
| 22 | **Position 3** | Back or three-quarter angle. | |
| 23 | **Position 4** | Material or construction close-up. | |
| 24 | **Positions 5–6** | On-model or lifestyle. Optional. | |
| 25 | **Alt text** | Every image. Falls back to the product title if blank — always write it. Describe the garment, not the brand. | |
| 26 | **Treatment** | Consistent neutral ground, consistent crop and scale across the whole catalogue. Same light, same distance. | |

**Ordering is the only control you have.** Media position in Shopify *is* the
gallery order. The `modality` tags in the codebase are not populated from
Shopify and cannot be set by you.

---

## 2. Copy rules

### 2.1 Voice
Premium, plain, declarative. Describe the garment: material, construction, fit,
weight, feel. Short sentences. Confidence without adjectives stacked up.
Second person sparingly. No exclamation marks. No emoji.

### 2.2 Length
- **Tagline:** 2–5 words. No end punctuation.
- **Description:** 40–70 words, 2–3 sentences.
- **Material / Fit / Care / Size guide:** one line each, under 120 characters.

### 2.3 Never appears — non-negotiable
- **Apliiq**, print-on-demand, POD, printer, production partner, drop-ship.
- **Made to order**, made-on-demand, printed when you order, produced to order.
- **Final sale**, non-returnable, no returns, all sales final.
- Any lead-time or production-time claim ("ships in 7–10 days", "allow 2 weeks").
- Scarcity or urgency invented by us ("limited drop", "only 3 left", "last chance").
- Discount or comparison pricing language.
- Country-of-manufacture claims unless verified in writing.
- Care or fibre claims that contradict the Shopify variant record.

### 2.4 Worked example — Signature Hoodie

Copy the *shape* of this, not the words.

```
Title:          Signature Hoodie
Handle:         carlophillips-signature-hoodie
Product type:   Hoodie
Vendor:         CARLOPHILLIPS
Price:          128.00 USD  (every variant)
Sizes:          S, M, L
Image count:    6

custom.tagline     THE SIGNATURE
custom.material    Heavyweight 400gsm cotton fleece, brushed interior.
custom.fit         Relaxed through the body. True to size; size down for a closer fit.
custom.care        Machine wash cold, inside out. Tumble dry low. Do not iron the embroidery.
custom.size_guide  Chest, S 42" / M 45" / L 48". Body length, S 27" / M 28" / L 29".

Description
A heavyweight hoodie built to hold its shape. The 400gsm cotton fleece is
brushed on the inside and set with a double-layer hood, ribbed cuffs and a
reinforced kangaroo pocket. The embroidered signature sits at the left chest.
Cut relaxed through the body with a shoulder that sits where it should.
```

Note what is absent: no production language, no urgency, no lead time, no return
terms. Note the tagline is set explicitly — left blank it would render `HOODIE`.

---

## 3. Definition of Done — must all be true before ACTIVE on production

Tick every line. Any unticked line blocks ACTIVE.

**Shopify record**
- [ ] Title, handle, `productType`, vendor set per §1.1.
- [ ] Handle is final and has never been live under a different value.
- [ ] Status is Draft, and the headless / Storefront API sales channel is enabled.
- [ ] Market is United States.
- [ ] Every variant is the same price, in USD, greater than zero.
- [ ] Size option is exactly S/M/L, or there is no option named `Size` (C1).
- [ ] Colour option, if present, is named `Color`.
- [ ] Every sellable variant is inventory-tracked with stock greater than zero.
- [ ] All five `custom` metafields populated (§1.3), correct keys, none blank.
- [ ] Between 4 and 10 images, ordered per §1.4, every one with alt text.
- [ ] Image treatment matches the rest of the catalogue.

**Copy**
- [ ] Description 40–70 words, passes §2.3 prohibited-terms check.
- [ ] Tagline set explicitly, not left to the `productType` fallback.
- [ ] Material / fit / care claims match the physical product record.

**Staging proof — on `carlophillips-staging.myshopify.com`, not local**
- [ ] Product renders at `/product/<handle>` with the correct title and price.
- [ ] All three sizes appear and are selectable.
- [ ] Details panel shows all four rows: Material, Fit, Care, Size guide.
- [ ] Tagline renders as written, not as an uppercased product type.
- [ ] Gallery shows every image in the intended order, hero first.
- [ ] Product appears on `/shop` and, if hoodie or t-shirt, in the menu category.
- [ ] Add to bag → Shopify checkout opens for the **exact** selected variant.
- [ ] Price at checkout equals the price on the product page.
- [ ] Selecting an out-of-stock size shows a truthful unavailable state.
- [ ] Mobile and desktop both checked.

**Release**
- [ ] Pushpa staging acceptance recorded.
- [ ] Set ACTIVE on production, then re-verify title, price and checkout on the
      production storefront. A Shopify Admin badge is not proof — verify the
      rendered page.

---

## 4. Minimum credible launch set — recommendation

**QUESTION**
How many products, in which categories, for a credible catalogue given one is live?

**The spec's number is not currently buildable.** `UI-SPEC-v1` describes 6
categories × 6 items = 36. Four of those categories (Trousers, Accessories,
Footwear, and to a degree Knitwear) cannot be listed correctly today: Trousers
and Footwear need numeric sizing and Accessories need One Size, all of which C1
strips out; and none of the four get a menu entry under C2.

**OPTIONS**

- **A — Ship what the code supports: 8 items.** 4 Hoodies (incl. Signature) +
  4 T-shirts. No code change. Both categories get a populated menu entry.
- **B — 12 items across 2 categories.** 6 Hoodies + 6 T-shirts. Matches the
  spec's per-category depth for the categories that work. No code change.
- **C — Chase the full 36.** Requires Aarti to lift the S/M/L filter, generalise
  sizing per category, and make the menu data-driven first.

**IMPACT**
- A: fastest. A two-category store with 4 each reads thin but honest. Lowest risk.
- B: a browsable catalogue — a customer can compare within a category and the
  grid fills. Cost is 11 more full listings at roughly 6 images each.
- C: blocked on engineering. Weeks, not days, and it re-opens variant and
  checkout behaviour that is currently proven.

**RECOMMENDATION — Option B: 6 Hoodies + 6 T-shirts.**

Reasoning: it is the largest credible catalogue reachable with **zero code
change**, so it cannot destabilise the one proven purchase path. Two categories
at six deep looks deliberate; two categories at four deep looks unfinished. It
also matches the spec's own per-category depth, so the remaining four categories
become a later phase rather than a compromise. Sequence it as Hoodies first
(reuses Signature Hoodie's photography setup and copy patterns), T-shirts
second.

Footwear, Trousers, Accessories and Knitwear should be raised as a separate
engineering item against C1 and C2 before any copy is written for them.

---

## 5. Blank form — copy this block per product

```
PRODUCT: ___________________________________

Title             ______________________________
Handle            ______________________________
Product type      ______________________________   (Hoodie | T-Shirt)
Vendor            CARLOPHILLIPS
Price (USD)       ______________  (same on all variants)
Sizes             S / M / L       (or: no Size option)
Colours           ______________________________
Inventory         S ____   M ____   L ____

custom.tagline    ______________________________   (2-5 words)
custom.material   ______________________________
custom.fit        ______________________________
custom.care       ______________________________
custom.size_guide ______________________________

Description (40-70 words)
____________________________________________________________
____________________________________________________________
____________________________________________________________

Images (4-10, in order, each with alt text)
1 hero, product only      ______________________________
2 front, full garment     ______________________________
3 back / three-quarter    ______________________________
4 material close-up       ______________________________
5 on-model (optional)     ______________________________
6 lifestyle (optional)    ______________________________

Prohibited-terms check passed   [ ]
Definition of Done §3 complete  [ ]
Staging accepted by Pushpa      [ ]  date ____________
Set ACTIVE on production        [ ]  date ____________
```

# LAUNCH-CHECKLIST-PUSHPA — deep product / acceptance / UAT sweep

- Owner (product): Pushpa
- Date: 2026-09-19
- Dispatched by: Sushma, on Boss's instruction
- Scope: customer-facing copy on every route, policy completeness, purchase-journey
  acceptance incl. edge and negative cases, stale acceptance criteria, US-only posture.
- Out of scope by hard limit: architecture, deployment, code changes. Items needing
  either are named and handed back.

---

## 0. Method and evidence basis — read this before the gradings

**Every fact below was read directly from repository source on 2026-09-19.** I made no
live-store reads in this run. That is deliberate and it is the correct posture given the
`environment = preview` finding: repository source is environment-independent, so none of
the findings below are contaminated by which Shopify store the storefront was talking to.

**Re-grading under the `preview` finding.** Two of my prior positions depended on
production-store facts and must be re-graded rather than re-asserted:

| Prior position | Status now |
|---|---|
| CP-COPY-001 B4 — "no free-shipping threshold is verified as configured" | **Unchanged and still unverified.** I never read the production shipping profile, so nothing here was invalidated. My P2.3 ruling (remove the free-shipping claim) stands and is in fact *strengthened* — if the connector was pointed at staging, any shipping-profile read taken before today describes the wrong store. |
| CP-COPY-001 §4 "media-lab 404s in production today" | **WITHDRAWN AS STATED.** That sentence asserted a production behaviour from a source-code gate. The gate keys off `getCommerceEnvironment()`, which is the exact function now known to have resolved `preview` on production. I should have graded it "not examined", not "mitigated". See F-2 and F-3. |

Anything in this file sourced to a live store is marked as such. There is nothing so
marked.

---

## 1. VERIFIED FACTS (all read by Pushpa from source, 2026-09-19)

| # | Fact | Source |
|---|---|---|
| V-1 | There is **no `/privacy`, `/terms`, `/returns`, `/shipping` or `/policies/*` route** anywhere in `apps/web/src/app`. Full route inventory taken by glob. | `apps/web/src/app/**` |
| V-2 | There is **no site footer component** rendered on the storefront. Grep for `footer` across `apps/web/src` returns exactly one hit — `cp-member-footer` inside `MemberExperience` — and no policy links anywhere. | `apps/web/src/components/**` |
| V-3 | GA4 and **Microsoft Clarity** are injected in the root layout, unconditionally whenever their env vars are set, with **no consent gate, no cookie banner and no notice-at-collection**. Clarity is a session-replay product. | `apps/web/src/app/layout.tsx:152-181` |
| V-4 | `/contact` collects **email, order number and free-text message**, posts to `/api/contact`, and carries **no privacy notice and no link to a privacy policy**. | `apps/web/src/components/support/ContactForm.tsx:119-203` |
| V-5 | PDP purchase-support copy is still the unapproved string `Free shipping on eligible orders · Returns accepted — see policy`, in a bare `<span>`, **not a link**. My approved replacement (CP-COPY-001 P2.2) is not implemented. | `apps/web/src/components/product/ProductForm/index.tsx:229-231` |
| V-6 | The PDP size-guide **default** body asserts, for *every* product lacking a size-guide value: *"This piece is cut true to size and available in S, M and L."* | `ProductForm/index.tsx:261-264` |
| V-7 | The PDP size-required validation message is hardcoded: *"Choose S, M or L before adding this **hoodie** to your bag."* It renders on every product regardless of type or size set. | `ProductForm/index.tsx:269-271` |
| V-8 | Price is coerced with `price: Number(product.price \|\| 0)`. An absent or unparseable price becomes **0** and is rendered by `money()` as **`$0`** on the add-to-bag button, which stays enabled. | `apps/web/src/lib/commerce/product-view-model.ts:90`, `ProductForm/index.tsx:13-20,196` |
| V-9 | A product whose variant list contains **no `availableForSale` entry — including a product with zero variants** — renders the sold-out branch: an **empty** size row plus `SOLD OUT` and *"This piece is currently unavailable in every size."* | `ProductForm/index.tsx:75-105` |
| V-10 | `/media-lab` renders the visible label **`Front — factual Apliiq/POD source`** and an image path containing `01-factual-apliiq-front.png`. Its gate is `getCommerceEnvironment() !== 'local' && NEXT_PUBLIC_STAGING_REVIEW !== 'true'`. | `apps/web/src/app/media-lab/page.tsx:14-19`, `signature-hoodie-media-lab.tsx:8-9` |
| V-11 | `/checkout-design-review` is guarded **only** by `if (getCommerceEnvironment() === 'production') notFound()`. Its own source comment records that it **"returned 200 on www.carlophillips.com"**. It renders `Internal review · Draft` and a list of payment methods: Credit card, Shop Pay, PayPal, Apple Pay, Google Pay. | `apps/web/src/app/checkout-design-review/page.tsx:14-30,38-41` |
| V-12 | `/private-list` metadata sells *"private releases, early access and selected notes"*; the page body says only *"Early-access registration is being prepared."* No capture, no date. | `apps/web/src/app/private-list/page.tsx:5-24` |
| V-13 | `WorkbookReplica` still renders **`SHIPPING & RETURNS AVAILABLE AT CHECKOUT`** — the softened copy that CP-POLICIES-v1 §3 reclassified as a **REAL DEFECT** under AC-POL-5 once free returns were decided. Not fixed. | `apps/web/src/components/editorial/WorkbookReplica.tsx:223` |
| V-14 | `CP-POLICIES-v1-2026-09-18.md` §0 still records all four authored policies **NOT PUBLISHED** and Contact information **NOT SET**. No publication row has been filled. | that file, §0 |
| V-15 | **Confirming:** zero occurrences of `final sale` / `made-to-order` / `non-refundable` / `all sales final` / `print on demand` in `apps/web`. The prohibition holds in shipped copy. | grep, 2026-09-19 |
| V-16 | **Confirming:** `apliiq` appears in `public-product-json-adapter.ts:61` as a denylist entry — the control working, not a leak. | that file |
| V-17 | **Confirming:** no international, worldwide, customs, duties or multi-currency copy exists on any route. `money()` is pinned to `en-US`; currency comes from Shopify. US-only posture is clean **in copy**. | grep + `ProductForm/index.tsx:13-20` |
| V-18 | **Confirming:** `/checkout/confirm` is correctly non-committal — it explicitly states it does not create or confirm an order and defers payment and status to Shopify. No commerce fact asserted. Satisfies AC-AUTH-1. | `apps/web/src/app/checkout/confirm/page.tsx` |
| V-19 | **Confirming:** the pre-payment disclosure note *"You will review delivery and payment on a secure checkout before placing the order."* is present and intact (P1-AC-7). | `ProductForm/index.tsx:276-279` |
| V-20 | **Confirming:** sold-out, add-to-bag-failure and size-required states all have live-region feedback (`aria-live="polite"`, `role="status"`). Negative-path messaging exists and is announced. | `ProductForm/index.tsx:100-102, 268-275` |

## 2. ASSUMPTIONS — flagged, not verified

- **A1.** That `NEXT_PUBLIC_STAGING_REVIEW` is set to `true` on the staging deployment.
  Inferred from KAN-17 reporting `/media-lab` publicly reachable on
  staging.carlophillips.com. I did not read the deployment env.
- **A2.** That GA4 and Clarity env vars are actually set on production. If they are not,
  F-1 drops to P3. **Reading them is Aarti's lane — handed back.**
- **A3.** That the production catalogue contains at least one product that is not a hoodie
  or not sold in exactly S/M/L. Grounded in CP-CAT-001 being an active catalogue-expansion
  item, but not verified against a store. F-5's grade depends on this.
- **A4.** That Boss's "free returns" decision (CP-POLICIES-v1 §3) is unrescinded. Carried
  unchanged from CP-COPY-001 B2. One document, one date, never re-confirmed.
- **A5.** That the published Shopify privacy policy exists and is reachable *inside Shopify
  checkout*. I have never read its text. See F-1 / §4.

## 3. NOT EXAMINED — explicitly not graded "fine"

- The **text of the published privacy policy**. I cannot read the Shopify admin. B3 —
  consistency of business name, address and contact route across the four policies —
  **remains unclosed** and I will not close it by inference. What I *can* now say is that
  the consistency question is no longer the interesting one: see F-1. **To close B3 I need
  the privacy policy text pasted into the repo.** That is a Boss/Sushma fetch.
- The live production and staging DOM. No route was loaded in a browser by me.
- Shopify checkout itself: footer links, policy reachability, payment methods actually
  enabled. AC-POL-2 and U-POL-1 remain **unverified**.
- The admin surface (`/admin/*`) — internal, out of product-copy scope this run.
- `/runwaymodels`, `/hero-preview*`, `/collections`, `/cart` copy read only in passing.
  Not swept line by line. Not graded.

---

## 4. FINDINGS

### F-1 · P1 · No privacy surface on a storefront that runs session replay and collects PII

- **Issue:** The storefront has no privacy policy page, no link to one, no cookie or
  consent control, and no notice at the point of collection — while loading Microsoft
  Clarity (session replay) and GA4 on every page, and collecting email plus free-text
  message on `/contact`. The Shopify-hosted privacy policy exists but lives inside
  checkout; a customer browsing, being recorded, and emailing support never enters
  checkout and is never shown it. (V-1, V-2, V-3, V-4)
- **Environment:** production and staging. Conditional on A2 for production.
- **Impact:** CPRA notice-at-collection and opt-out exposure on a live-payment US store,
  plus a session-replay tool recording form interaction with no disclosure. This is the
  one finding in the sweep with regulatory rather than commercial consequence.
- **Blocking:** launch, in my judgement. A store taking live payment should not be
  recording sessions with no published notice.
- **Now:** either (a) remove `NEXT_PUBLIC_CLARITY_PROJECT_ID` from production until a
  notice ships — a config change, Aarti's lane, and the fastest de-risk — or (b) ship a
  privacy route and a footer link. I can write the notice-at-collection copy within a day
  once Boss picks.
- **Later:** full consent management, and the B3 consistency pass once I have the text.
- **This closes out the old P3.** The privacy-consistency gap was graded P3 when the
  question was "do four policy documents agree". That was the wrong frame and the grade
  was too low. The real gap is that the storefront publishes **no privacy surface at all**
  while tracking. **Re-graded P3 → P1.** The consistency question survives beneath it as
  P3 and is still unclosed (§3).

### F-2 · P1 · `/checkout-design-review` is an internal draft with a payment-method list, guarded only by the function known to have misresolved

- **Issue:** The page's sole guard is `getCommerceEnvironment() === 'production'`. That is
  the function now reported to have been resolving `preview` on production. Its own source
  comment records it already returned 200 on www.carlophillips.com. It shows
  "Internal review · Draft" and advertises Credit card, Shop Pay, PayPal, Apple Pay and
  Google Pay as available — a payment-method claim I have no evidence is true of the
  production store. (V-11)
- **Environment:** production, if the `preview` resolution is confirmed. Staging regardless.
- **Impact:** Two harms, not one. Brand — an internal draft page on the public store.
  Commercial — a customer who sees PayPal advertised and then cannot use it at checkout has
  a live misrepresentation, and on a $128 unit that is the shape of a disputable claim.
- **Blocking:** launch.
- **Now:** confirm whether the page is currently reachable on www. If it is, remove or
  hard-gate it — **deployment and architecture, handed to Sushma for Aarti.** The product
  ruling I can give without waiting: **this route must not be publicly reachable in any
  environment that a customer can reach, and the payment-method list must never appear on a
  customer surface until verified against the production store.**
- **Later:** if the payment-method list is ever wanted publicly, it returns to me as copy
  with a verified Admin-API read behind it.

### F-3 · P1 · `/media-lab` renders the vendor name at a publicly reachable URL (KAN-17)

- **Issue:** Visible label `Front — factual Apliiq/POD source`, plus an image filename
  containing `apliiq`, at staging.carlophillips.com/media-lab, which is publicly reachable.
  This is the most direct possible breach of the mandate and of my own AC-POL-4 / E-POL-1.
  (V-10, A1)
- **Environment:** staging, verified reachable. Production **not examined** — and my prior
  "it 404s in production today" is withdrawn (§0), because that claim rested on the same
  `getCommerceEnvironment()` that misresolved.
- **Impact:** The supply chain is discoverable by anyone, including a competitor or a
  customer who finds the staging host. `robots: noindex` prevents ranking, not reading.
- **Blocking:** launch. It is already live on a public host.
- **Now:** **implement AC-8, which I raised on 2026-09-19 and which is still open.** Rename
  the labels to `Front — factual source` and rename the asset file to drop `apliiq`. This
  is a text change with zero product cost — the team knows what the source is. Do it
  independently of any env-gate or access-control work, because defence in depth is the
  point: the gate is one env var and it has already failed once elsewhere.
- **Later:** access control on the staging host — **architecture, not mine.**

### F-4 · P1 · PDP promises a returns policy that does not exist, and a free-shipping benefit with an undefined condition

- **Issue:** `Free shipping on eligible orders · Returns accepted — see policy` is still
  shipped, in a bare span, pointing at nothing. No returns page, no shipping page, no
  published policy. My approved replacement string and my ruling to drop the "eligible"
  qualifier (CP-COPY-001 P2.2 / P2.3, issued 2026-09-19) are **not implemented**.
  (V-5, V-1, V-14)
- **Environment:** production and staging. Production is in **live payment mode**, which is
  what makes it P1 rather than P2.
- **Impact:** We are telling paying customers a returns policy exists, giving them no way to
  read it, with no published terms and **no confirmed physical return destination** (D-030
  still open). It is a commitment we cannot presently honour, and it is precisely the
  document that would be submitted as chargeback evidence — which we would not have.
- **Blocking:** launch, on the returns half. The shipping half is fixable today.
- **Now:** ship the interim approved string — `Shipping is calculated at checkout.` — which
  understates nothing currently published and breaches no criterion. That unblocks today
  without waiting on Boss. Then Boss answers **D-030** (return destination) and
  **`[[DISPATCH_WINDOW]]`**, publishes the four policies, and the full approved string
  follows.
- **Later:** AC-12 — reinstate a free-shipping statement if and when Boss sets a threshold.

### F-5 · P2 · The PDP hardcodes "hoodie" and "S, M and L" into copy shown for every product

- **Issue:** The size-guide default asserts *"cut true to size and available in S, M and L"*
  for any product without a size-guide value, and the validation message reads *"Choose S,
  M or L before adding this **hoodie** to your bag."* Both render regardless of product type
  or actual size set. (V-6, V-7)
- **Environment:** all.
- **Impact:** On a single-product hoodie catalogue this is invisible. The moment CP-CAT-001
  lands a second product it becomes a false statement on a live PDP, and it **breaches
  AC-CUR-4** — "no signal that unsold sizes exist" — by naming three sizes we may not stock.
  A customer told L is available who cannot buy L is a support contact and a trust loss.
- **Blocking:** CP-CAT-001 catalogue expansion. Not launch, *if* the catalogue is one hoodie
  in S/M/L today — which is A3 and unverified.
- **Now:** treat this as a gate on CP-CAT-001, not on launch. Derive both strings from the
  product's actual option values.
- **Later:** a per-product size-guide value so the default is never the thing a customer
  reads.
- **Grade honesty:** this is P2 only because of A3. **If the production catalogue already
  holds a non-hoodie or a non-S/M/L product, it is P1 today** — false product facts on a
  live PDP. Verifying the catalogue is a store read; **handed back.**

### F-6 · P2 · A product with no price renders `$0` on an enabled add-to-bag button

- **Issue:** `Number(product.price || 0)` silently turns an absent, empty or unparseable
  price into 0, which `money()` renders as `$0`. The button stays enabled and the item can
  be added. (V-8)
- **Environment:** all. Reachable via direct URL to any product whose price has not been set.
- **Impact:** The storefront displays a price that is not the price Shopify will charge.
  Shopify is authoritative, so the customer is quoted $0 and charged $128. That is the
  cleanest possible misrepresentation and an obvious dispute.
- **Blocking:** not launch *today* on a curated one-product catalogue. Blocking on any
  uncurated or direct-URL product access.
- **Now:** absent price must be a **failure state**, not zero. My acceptance ruling:
  **a product with no resolvable price MUST NOT render a purchasable PDP.** It renders the
  unavailable state. There is no customer-facing circumstance in which `$0` is correct for
  this store.
- **Later:** same rule applied at collection and bag surfaces.

### F-7 · P2 · A product with zero purchasable variants renders "sold out in every size" with an empty size row

- **Issue:** The `!available.length` branch covers three distinct realities — genuinely
  sold out, no variants configured, and variant data failed to load — and renders the same
  sold-out message for all three. With zero variants the size row renders **empty** and the
  copy still says *"unavailable in every size."* (V-9)
- **Environment:** all.
- **Impact:** We assert a stock fact we do not have. "Sold out" tells the customer the piece
  exists and will return; a data failure tells us nothing of the kind. It also suppresses a
  real product: a genuinely buyable single-variant or no-variant item presents as sold out
  and cannot be bought. That is lost revenue presenting as a stock condition, which is the
  worst kind because nobody reports it.
- **Blocking:** not launch. Blocking on any catalogue containing a no-variant product.
- **Now:** **distinguish "sold out" from "unavailable".** Sold-out copy is only permitted
  when the variant list is non-empty and every entry is genuinely unavailable. Empty or
  failed variant data renders the unavailable state, not a stock claim. This restates
  AC-AUTH-1 at component level: never assert a value Shopify owns.
- **Later:** single-variant products should not render a size chooser at all.

### F-8 · P2 · `SHIPPING & RETURNS AVAILABLE AT CHECKOUT` — a defect I already raised and that is still shipped

- **Issue:** CP-POLICIES-v1 §3 reclassified this softened string as a **REAL DEFECT** under
  AC-POL-5 (it understates decided free returns). It is still rendered. (V-13)
- **Environment:** all.
- **Impact:** Understates a decided trust signal on the editorial surface, and contradicts
  whatever the PDP says. Two customer surfaces disagreeing about returns is itself the harm.
- **Blocking:** nothing hard. But it cannot be fixed *upward* until the returns page is
  published (F-4), or we re-create F-4's fault on a second surface.
- **Now:** hold. Fix in the same pass as F-4, not before.
- **Later:** final copy returns to me once policies are published.

### F-9 · P3 · `/private-list` sells a list nobody can join

- **Issue:** Page metadata and search-result description promise *"private releases, early
  access and selected notes"*; the page offers no registration and no date. (V-12)
- **Environment:** all.
- **Impact:** Small. A promise in a search snippet with nothing behind it.
- **Blocking:** nothing.
- **Now:** nothing.
- **Later:** either ship capture — which pulls in F-1, because capture without a privacy
  notice is the same defect again — or align the metadata with the page.

### F-10 · P3 · Privacy-policy consistency (B3) — still open, re-scoped

- **Issue:** The published privacy policy has never been read against the three unpublished
  policies for business name, address and contact route. Unchanged since 2026-09-18.
- **Environment:** production.
- **Impact:** Four legal documents that may disagree about who we are and how to reach us.
  Low on its own; it compounds F-1 and §4.3 of CP-POLICIES-v1 (the personal Gmail address).
- **Blocking:** nothing.
- **Now:** nothing — but **I cannot close this by inference and will not.** It needs the
  policy text in the repo.
- **Later:** I close it in one pass, same day I get the text, together with the §4.3 support
  alias decision so the contact route only changes once.

---

## 5. Stale or never-validated acceptance criteria

| Criterion | State |
|---|---|
| CP-COPY-001 **P1-AC-4, P1-AC-5, P1-AC-6** | Written 2026-09-19. **None implemented.** All three are restated by F-4. |
| CP-COPY-001 **P1-AC-8** (strip Apliiq from media-lab labels) | Written 2026-09-19. **Not implemented.** Now escalated to P1 by KAN-17 → F-3. |
| CP-COPY-001 **P2 AC-1..AC-12** | Written today; awaiting publication and D-030. Not stale, not yet actionable. |
| CP-POLICIES-v1 **AC-POL-1..AC-POL-6** | Standing. AC-POL-1 unmet (nothing published), AC-POL-2 **never verified**, AC-POL-5 breached at V-13. |
| CP-POLICIES-v1 **U-POL-1** | **Never executed.** Requires a live checkout. Still unverified. |
| **AC-CUR-4** (no signal that unsold sizes exist) | **Now breached in code** by the hardcoded S/M/L strings — F-5. This AC was written before the copy existed; it is not stale, it is violated. |
| CP-COPY-001 §4 claim "media-lab 404s in production today" | **STALE AND WITHDRAWN.** Depended on `getCommerceEnvironment()`. See §0. |

---

## 6. Handed back — needs architecture, deployment or a store read

1. **Read GA4 / Clarity env vars on production** (A2). Determines whether F-1 is P1 or P3.
2. **Confirm `/checkout-design-review` reachability on www** (F-2).
3. **Access control on the staging host** (F-3). Architecture.
4. **Verify the production catalogue's product types and size sets** (A3). Determines
   whether F-5 is P1 or P2.
5. **Link-target mechanism for policy pages** — Shopify `/policies/*` vs `apps/web` routes.
   Carried from CP-COPY-001 B1. Still unresolved and now blocking F-4.
6. **To Boss: D-030** (return destination) and **`[[DISPATCH_WINDOW]]`**. Both block
   publication. `[[DISPATCH_WINDOW]]` has no drafted escape hatch.
7. **To Boss: paste the published privacy policy text into the repo** so F-10 can close.

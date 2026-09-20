# SIGNAL — pushpa — CP-COPY-001

**ITEM:** CP-COPY-001 — PDP purchase-support copy; prohibited "final sale" language blocking CI on PR #153.

**RESULT:** STALE TEST CONFIRMED — component correct, assertion must change. Not a bare pass: two production obligations found open, one of them P1 against a live-payment store.

- The string `Final sale · Shipping details available at checkout` is **prohibited copy**. CLAUDE.md § Project: "never reveal it in customer-facing copy, and never lean on made-to-order or **final-sale** language." Named explicitly.
- `tests/monorepo-home-commerce.test.js:165-167` is the **only** surviving instance of that language in the repo, and it is in test code.
- **Do not revert the component.** Commit `3f1d634` was correct.
- P1 discovered: shipped replacement copy promises "Returns accepted — see policy" and **no returns or shipping policy page exists in `apps/web/src/app`**. "see policy" is a bare `<span>`, not a link. Store is in live payment mode; D-030 (real return address) still open with Boss. We are promising returns we cannot currently honour.
- P2: "Free shipping on eligible orders" — "eligible" undefined, threshold unverified against Shopify shipping profile.
- P2: `media-lab` renders visible label `Front — factual Apliiq/POD source`. Gated by `notFound()` unless local or `NEXT_PUBLIC_STAGING_REVIEW=true`, plus `robots: index:false`. 404s in production today. Single env var is the only thing between the vendor name and a public URL.

**EVIDENCE:**

VERIFIED FACTS
1. `/Users/edv/Developer/local-canonical-carlophillips/CLAUDE.md` § Project contains the literal token "final-sale" in a prohibition sentence. Read directly, 2026-09-19.
2. `/Users/edv/Developer/local-canonical-carlophillips/tests/monorepo-home-commerce.test.js:165-167` asserts the prohibited string. Read directly.
3. `/Users/edv/Developer/local-canonical-carlophillips/apps/web/src/components/product/ProductForm/index.tsx` — full file read, 282 lines. The prohibited string is absent. Lines 229-231 carry the replacement: `Free shipping on eligible orders · Returns accepted — see policy`, inside a `<span>` in `div.cp-purchase-support`. No `<a>`, no `<Link>` on "see policy".
4. Line 276-279 carries `You will review delivery and payment on a secure checkout before placing the order.` — pre-payment disclosure present.
5. Repo-wide grep of `apps/web` for `final sale|made to order|non-refundable|no returns|all sales final` returned **zero** matches in shipped code.
6. Grep of `apps/web` for `apliiq|print on demand` returned exactly two: `src/lib/providers/shopify/public-product-json-adapter.ts:61` (string `'apliiq'`, reads as a redaction list) and `src/app/media-lab/signature-hoodie-media-lab.tsx:9` (rendered label).
7. `/Users/edv/Developer/local-canonical-carlophillips/apps/web/src/app/media-lab/page.tsx` lines 14-19: `notFound()` unless `getCommerceEnvironment() !== 'local'` is false or `NEXT_PUBLIC_STAGING_REVIEW === 'true'`. Line 11: `robots: { index: false, follow: false }`.
8. Grep of `apps/web/src` for `policy|policies|/returns|/shipping` returned only library/engineering identifiers — `media-release-policy`, `auth-policy`, `variant-presentation-policy`, `truthPolicy` etc. **No route, page or document serving a customer returns or shipping policy.**

ASSUMPTIONS (flagged, not verified by me)
A1. That `'apliiq'` at `public-product-json-adapter.ts:61` is a strip/denylist entry rather than an allow-list. Inferred from the file name and surrounding intent; I did not read the surrounding function. Aarti should confirm. If it is an allow-list the grading changes.
A2. That the CI failure is exactly the line 165 assertion and nothing else in that test. Taken from Sushma's dispatch (1 failed / 137 passed); I did not execute the suite.
A3. That no returns/shipping policy is served from outside `apps/web` — e.g. a Shopify-hosted policy page surfaced only at checkout. Plausible and would partly mitigate OBL-1, but a checkout-only policy does not satisfy a PDP that says "see policy" before add-to-bag. Needs a verified Admin API read of the production store's policy settings.
A4. That "eligible orders" corresponds to a configured Shopify free-shipping threshold at all. It may be aspirational copy with nothing behind it. Unverified either way.

**NEXT:**
1. Aarti implements AC-1 (add `not.toMatch(/final sale/i)` and `not.toMatch(/made[ -]to[ -]order/i)`), AC-2 (replace the 165-167 assertion with `cp-purchase-support` + `/shipping/i` + `/returns/i`), AC-3 (leave the rest of the test alone). This unblocks PR #153.
2. Aarti confirms A1 — denylist vs allow-list at `public-product-json-adapter.ts:61`.
3. Aarti or Sushma performs a verified Admin API read of the production store's shipping profile and policy pages, resolving A3 and A4. Result routes back to me for the copy decision.
4. Sushma raises to Boss: D-030 now blocks a **live-payment** returns promise, not just an operational detail. Recommend closing it before the next production deploy.
5. AC-8 (strip `Apliiq`/`POD` from media-lab labels) — low cost, do it whenever Aarti is next in that file. Not a blocker.

**OWNER:** Aarti for AC-1/2/3 (test edit, her lane — I did not touch the test or the component). Sushma for the Boss decision on D-030 and for the Admin API verification routing. Pushpa retains the copy call on AC-4 and AC-6 once threshold and policy-page facts land.

**RESUME:** PR #153 is unblocked by AC-1 through AC-3 alone. AC-4 through AC-6 are production gates and must **not** be used to hold PR #153. Re-enter this item when either (a) the Admin API read returns the shipping threshold and policy-page status, or (b) Boss answers D-030 — whichever first. Standing position: current returns copy is cleared for staging, not cleared for production.

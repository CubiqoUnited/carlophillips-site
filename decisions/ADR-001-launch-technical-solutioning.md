---
id: ADR-001
title: Launch technical solutioning — staging-proof contradiction, tracking authority, commerce layer, curation, DEF-2
owner: aarti
status: PROPOSED (no build authorised; Boss decision required on §1)
date: 2026-09-18
governing: D-011, D-014, D-021; CP-TFRD-1.0 §4 (FR-1..FR-9); CP-COM-001 §17 (CP-HP-DELTA v2.0)
verification: NO live store access (H-005). Every store-side statement below is marked NEEDS-LIVE-VERIFICATION.
---

# ADR-001 — Launch technical solutioning

## Build-topology fact that governs everything below

`vercel.json` sets `outputDirectory: apps/web/.next`; root `package.json` `build` = `yarn workspace @repo/web build`.
**The deployed application is `apps/web/` only.** The root-level `app/`, `components/`, `lib/commerce/` (24 modules, 184K),
`lib/releases/` (56K) and `contracts/` (160K) are NOT built or served. `apps/web` reaches outside its tree for exactly four
JSON config files and nothing else. Any claim about "what the site does" must be made against `apps/web/src`.

## 1. Staging-first proof vs staging-must-not-dispatch (TOP BLOCKER — Boss + Sidekick)

Conflict: TFRD §1.1 / GAP-2 require staging-first proof; D-011 bans staging dispatch; FR-6/FR-7/FR-9 are therefore provable nowhere.
Five options, no winner picked. See report body; costs and residual-unproven per option recorded there.

- **A — Apliiq sandbox / test mode** (existence UNCONFIRMED; Sidekick Q1/Q2). Proves FR-6/FR-7 wiring if a real fulfilment+tracking record is written to Shopify with no garment. Leaves unproven: real production, real carrier, real transit.
- **B — Production dry-run with immediate cancellation.** Real order, real Apliiq acceptance, cancel inside the provider's cancellation window. Proves FR-5/FR-6 genuinely. Leaves FR-7 tracking and FR-9 unproven; costs real money if the window is missed; needs Boss financial authority.
- **C — Manual fulfilment on staging (disconnect the Apliiq fulfilment service from the staging store).** Zero cost, store-settings only, closes D-013 immediately. Proves FR-1..FR-5 end to end plus Shopify-side fulfilment/tracking *presentation* by manually posting a tracking number. Proves nothing about Apliiq.
- **D — Mocked fulfilment service on staging (CP-built).** Rejected on D-011 grounds unless Boss overrides: a CP service writing fulfilments is a second fulfilment authority (AR-2/NG-1), and it is build work the launch posture forbids.
- **E — Production-only proof with a controlled first order** (Boss/staff order, real payment, real dispatch to a CP address). Proves FR-5..FR-9 completely and truthfully. Costs one garment + real money; the proof happens on the live store after launch, so the TFRD "staging first" rule must be explicitly carved back by Boss.

**Aarti's recommendation:** C immediately (it is free and closes D-013), then A if Sidekick confirms a sandbox exists, else E under a written Boss authorisation. D is a D-011 violation. B is E with extra failure modes.

## 2. Second tracking authority — implemented vs spec-only

**Deployed (`apps/web`): NONE of it is implemented.** No `/track` route, no CP order-number generation, no four-step ladder rendered,
no discount-validation control, no store-credit/CP Recognition form. `apps/web/src/lib/commerce/post-purchase-policy.ts`
exports `postPurchaseJourney` (Confirmed / In production / Dispatched / Delivered / Return-refund) but **no component imports it**
— its only consumer is `tests/post-purchase-policy.test.js`. Each entry names Shopify as authority and states production is shown
only after the provider reports back, so even if wired it asserts no CP-owned state.

**Undeployed root tree: implemented, and it is the spec's version.**
- `app/track/page.js` + `components/commerce/order-outcome.jsx` render the four-step ladder from `lib/operations/order-tracking.js`
  (`confirmed/production/shipped/delivered`) — `production/shipped/delivered` hard-coded `recorded: false`.
- Order reference is taken from the `?order=` query string and echoed as `Order #{reference}` — **there is no CP-0001 generator anywhere in the repo.**
- `components/commerce/cart-drawer.jsx` renders the CP Recognition block ("Have a CP account or store credit?") and the discount Apply control;
  `lib/commerce/client-bag.js` `applyDiscount()` validates against `config/storefront-discounts.json`, whose `recognisedCodes` array is **empty by design**,
  so every code is rejected and no total is ever altered client-side.

**Disposition:** this is a **never-build decision for `apps/web`, plus a deletion task confined to the undeployed tree.** Nothing
customer-facing changes. It is not launch-blocking. UI-SPEC Appendix 27's CP order number and "IN PRODUCTION" state should be
struck at the document level (TFRD NG-1 already forbids them, independently of D-011).

## 3. `lib/commerce/` against D-011 — narrow launch question

The 184K root `lib/commerce/`, `lib/releases/` and `contracts/` are **not in the deployed build** (see topology above). They cannot
break the happy path because they never execute. Answer to the narrow question: **no**. Full audit stays post-launch (D-012b).

**However, the deployed `apps/web` equivalent contains a hard launch gate that is a real risk:**
`apps/web/src/lib/config/runtime-preflight.ts` — `assertRuntimePreflight()` **throws** on any non-local environment unless ~12
environment variables are present and mutually consistent, including `CP_RELEASE_COMMIT_SHA` matching `/^[a-f0-9]{40}$/`,
`CP_DURABLE_STORE_ID === CP_EXPECTED_PRODUCTION_DURABLE_STORE_ID`, a KV/Upstash credential pair, `SHOPIFY_CART_UI_ENABLED === 'true'`
and `SHOPIFY_CHECKOUT_ENABLED === 'true'`. It is called from `product-page-server.ts`, i.e. on every PDP render.
Additionally `apps/web/src/lib/config/product-visibility.ts` `SHOW_PRODUCTS` is **false on production** unless
`NEXT_PUBLIC_SHOW_PRODUCTS === 'true'`, and `product-page-server.ts` disables checkout on production unless
`SHOPIFY_CHECKOUT_ENABLED === 'true'`.

These are CP-side release-governance assertions, not Shopify facts — squarely the D-011 concern — and **two of them will present a
blank/unavailable production storefront on launch day if the Vercel production env vars are not set.** NEEDS-LIVE-VERIFICATION of
the Vercel production environment variables; this is the single highest-probability launch-day failure found.

## 4. Curation enforcement

- **Allowlist exists but is dead in the deployed app.** `config/shopify-product-offer.json` (`allowedSizes: ["S","M","L"]` +
  three `allowedReferenceHashes`) and `lib/commerce/product-offer-policy.js` are consumed only by the undeployed
  `components/commerce/shopify-checkout-form.jsx`. The file's own `evidence` field says so: "Deprecated legacy UI compatibility only.
  The deployed apps/web checkout ignores this reference list and re-resolves current Shopify variants server-side."
- **The deployed buy control filters correctly.** `apps/web/src/components/product/ProductForm/index.tsx` builds its size buttons from
  `presentation.combinations.filter(item => item.availableForSale)`. With the six variants on DENY+tracked, they are **absent**, not "sold out".
  So the customer does not see a sold-out size in the purchase path today.
- **Two leaks worth naming (both small, neither launch-blocking):**
  1. `apps/web/src/components/product/ProductInfo/index.tsx` `liveSizes` (~line 137) maps **all** combinations with no
     `availableForSale` filter, so the "Sizes" fact row can print the curated-out sizes.
  2. The non-live `VariantPresentation` fallback in the same file lists all nine combinations with "Unavailable in source".
- **Durable pattern (proposed, pending Sidekick Q3/Q4):** enforcement stays in Shopify (AC-CUR-1), but the mechanism should be one
  that makes the variant *not exist for the storefront* rather than exist-and-be-unavailable — either deleting the six variants, or a
  single-option product whose only option values are S/M/L. Frontend contributes only `availableForSale` filtering, applied
  consistently everywhere variants are listed, never a CP allowlist. The current DENY+tracked stopgap is acceptable to launch on.

## 5. DEF-2 — staging label on production

Three deployed strings assert environment to the customer:
- `apps/web/src/components/commerce/catalog-state.tsx` ~L45/L48 — "Private live-commerce staging" / "...private staging verification."
- `apps/web/src/lib/commerce/home-catalog-summary.ts` L12 — "...active in private staging."
- `apps/web/src/app/checkout-design-review/page.tsx` L8/L28 — "Private staging review · Draft" (a review route; should not be public at all).

Mechanism: the copy is keyed on `getCommerceEnvironment()` returning `'preview'`, which
`apps/web/src/lib/config/product-visibility.ts` returns whenever `NEXT_PUBLIC_STAGING_REVIEW === 'true'` or
`NEXT_PUBLIC_COMMERCE_ENVIRONMENT === 'preview'` — **regardless of `VERCEL_ENV`**. So a stale production env var reproduces DEF-2 exactly.

**Fix (two parts, both cheap):** (a) delete environment-naming from all customer-facing copy — no customer string should reference an
environment in any environment; keep the environment switch only for behaviour, not wording; (b) remove/guard
`/checkout-design-review` from public routing. Part (a) is the durable fix and makes the env-var state irrelevant.
NEEDS-LIVE-VERIFICATION: current Vercel production values of `NEXT_PUBLIC_STAGING_REVIEW` and `NEXT_PUBLIC_COMMERCE_ENVIRONMENT`.

---

# ADDENDUM A — CP-ENV-001 / D-023: the release-stamping defect is NOT confirmed. Production is serving.

**Date:** 2026-09-18 · **Author:** Aarti · **Status:** retraction of a predicted defect, on first-hand behavioural evidence.

## A.1 Production is healthy. The PDP renders.

First-hand, this session, over the public internet (no Shopify connector involved):

| Probe | Result |
|---|---|
| `GET https://www.carlophillips.com/` | 200, 33,202 bytes |
| `GET https://www.carlophillips.com/shop` | 200, 49,021 bytes |
| `GET https://www.carlophillips.com/product/carlophillips-signature-hoodie` | **200**, 35,885 bytes |
| PDP body | live `ShopifyCheckoutForm` — `role="group" aria-label="Choose a size"`, exactly three buttons **S / M / L**, price **$128** |
| `vercel inspect www.carlophillips.com` | `dpl_7acwDFo9hMyZaZvuLUjUBAGq1JbV`, target `production`, **readyState READY** |

`product-page-server.ts` calls `assertRuntimePreflight(environment)` **before** it returns a decision, and `instrumentation.ts`
calls it at every lambda boot. A 200 PDP carrying live Shopify facts is only possible if **preflight passed**.
**Production can serve a product page. It is doing so right now.** My §3 prediction was of a latent risk; it has not fired.

## A.2 Why `vercel env ls production` did not show the two variables — and why that is expected

`vercel env ls production` lists **project-level** environment variables. The release workflows stamp these values as
**deployment-scoped** variables at deploy time, not project-level ones:

- `.github/workflows/vercel-release-candidate.yml` L176-177 — `vercel deploy ... --env CP_RELEASE_ID="$RELEASE" --env CP_RELEASE_COMMIT_SHA="$GITHUB_SHA"`
- identically in `vercel-staging.yml` L170-171 and `vercel-preview.yml` L164-165
- `.github/workflows/vercel-production.yml` does **not** build. It is a **promotion**: `vercel promote "$CANDIDATE"` (L179). The promoted
  deployment carries the stamp applied when the candidate was built.

So a correctly CI-promoted production deployment **will always** have these two variables absent from `vercel env ls production`
and present on the deployment. **Their absence from that listing is the designed state, not a defect.** Reading a project-level
listing and concluding a deployment-scoped value is missing is the same conflation class as the connector's green light over a dead
token — a summary surface answering a question it was not asked.

**CI is supposed to stamp these, and the evidence is that it did.**

## A.3 Proposed fix at source — a hardening, not a repair

Nothing is broken, so no fix is owed. One genuine fragility remains and should go to Boss as a *choice*, not a defect:
**if anyone ever deploys production outside these workflows** (Vercel Git auto-deploy, or `vercel --prod` by hand), no stamp is
applied and production goes dark at boot. Options: (a) leave as is — the loud failure is the guard, and it is working; (b) fall back
to Vercel's native `VERCEL_GIT_COMMIT_SHA` when `CP_RELEASE_COMMIT_SHA` is unset — note `shopify-cart-server.ts` L53-54 **already does
exactly this**, so the codebase is internally inconsistent about which is authoritative; (c) disable Vercel's Git auto-deploy to
production so the workflow is the only path. My recommendation: (c), then (a). **(b) I advise against** — it would silently
substitute a build-time SHA for a reviewed release SHA and weaken the provenance the check exists to assert.
**Hand-adding static values remains the wrong answer and is not proposed.** No implementation without Boss approval.

## A.4 The three unreadable conditions — all three are now confirmed PASSING, behaviourally

They cannot be read (encrypted), but each has its own throw path through `assertRuntimePreflight`, and preflight demonstrably
passed on the live production deployment (A.1). Therefore:

- `CP_COMMERCE_ENVIRONMENT === 'production'` — else `RUNTIME_CONFIG_COMMERCE_ENVIRONMENT_MISMATCH`. **Passing.**
- `CP_DURABLE_STORE_ID === CP_EXPECTED_PRODUCTION_DURABLE_STORE_ID` — else `RUNTIME_CONFIG_DURABLE_STORE_ID_MISMATCH`. **Passing.**
- `SHOPIFY_WEBHOOK_ALLOWED_SHOPS` normalises to exactly one entry equal to normalised `SHOPIFY_STORE_DOMAIN` — else
  `RUNTIME_CONFIG_ALLOWED_SHOP_MISMATCH`. **Passing.**

This is the verification method that does not require reading encrypted values: **the validator is the oracle.** It runs in
production, it throws on any failure, and production is not throwing. This proves the conditions are *mutually consistent*; it does
not reveal the values, and it does not prove `SHOPIFY_STORE_DOMAIN` points at the store we intend — that last one still needs a live
store read (H-005) and must not be recorded as passing.

## A.5 Two live observations, recorded not acted on

- The PDP serves **exactly S / M / L**. Curation is working in production with no "sold out" size shown to a customer. This is the
  first behavioural confirmation of §4 and it did not need the Shopify connector.
- `https://www.carlophillips.com/checkout-design-review` returns **200 on production** — an internal review surface, publicly
  reachable, carrying the "Private staging review · Draft" wording. That is the live half of DEF-2 (§5) and is real. `/track` returns
  404, confirming §2: the second tracking authority is not deployed.
- The production deployment is `dpl_7acwDFo9hMyZaZvuLUjUBAGq1JbV`, which is **not** the ID recorded as canonical in `state/NOW.md`.
  Flagged to Sushma; not mine to write.

## A.6 Correction to my own §3

§3 stated these gates "will present a blank/unavailable production storefront on launch day if the Vercel production env vars are not
set". That conditional was sound. What I did not do was check whether they were set *on the deployment*, and I offered a
project-level listing as the place to look. **The risk is real in the abstract and absent in fact.** CP-ENV-001 / D-023 should be
closed as NOT A DEFECT, on the same footing as H-004.

---

# ADDENDUM B — D-024 / CP-DEF2-001: environment gate corrected + customer copy de-environmented

**Date:** 2026-09-18 · **Author:** Aarti · **Status:** IMPLEMENTED in working tree. **Not deployed, not committed.** All changes in `apps/web/` only.

## B.1 The gate was genuinely broken, but not in the way production currently shows

`getCommerceEnvironment()` in `apps/web/src/lib/config/product-visibility.ts` consulted, in order:
`NEXT_PUBLIC_COMMERCE_ENVIRONMENT` → `NEXT_PUBLIC_STAGING_REVIEW` → `VERCEL_ENV === 'preview'` → `NODE_ENV`.
`VERCEL_ENV === 'production'` was **never consulted at all**, so the platform's own statement of where the code is running was
outranked by two project variables that can go stale. One wrong variable on the Production project makes the entire codebase
believe Production is a preview. That is the defect: a gate that cannot distinguish environments.

**Correction:** `VERCEL_ENV` is now consulted **first** — `'production'` returns `production`, `'preview'` returns `preview` —
before any `NEXT_PUBLIC_*` override. Rationale is in a comment at the function.

**Honest qualification.** Production today is *not* mis-reporting. `vercel-release-candidate.yml` L49/L171 sets
`NEXT_PUBLIC_COMMERCE_ENVIRONMENT=production` and builds with `--prod`, so the gate already returns `production`, which is why
`/shop` carries no staging wording. The fix removes the *possibility*, not a live symptom.

## B.2 Audit of every consumer — what changes when the gate returns the right answer

All 13 consumers reviewed (`instrumentation.ts`, `api/cart/route.ts`, `api/webhooks/shopify/route.ts`, `product/[handle]/page.tsx`,
`bag/page.tsx`, `aftercare`, `member`, `media-lab`, `catalog-server.ts`, `cart-policy.ts`, `bag-decision.ts`, `product-gateway.ts`,
`storefront-product-adapter.ts`).

**Nothing shifts, and this is verifiable from the workflows rather than asserted:**
- Production (`vercel-release-candidate.yml` L162/170, `vercel build --prod` / `vercel deploy --prod`) → `VERCEL_ENV=production`.
  Old logic returned `production` via the explicit override; new logic returns `production` via VERCEL_ENV. **Same.**
- Staging (`vercel-staging.yml` L164, `vercel deploy` with **no** `--prod`) → `VERCEL_ENV=preview`, and L51/165 set
  `NEXT_PUBLIC_COMMERCE_ENVIRONMENT=preview`. Old returned `preview`; new returns `preview`. **Same.**
- Local (no `VERCEL_ENV`) → falls through to the unchanged tail. **Same.**

The paths that *would* have shifted are exactly the broken ones — a production deployment carrying a stale
`NEXT_PUBLIC_STAGING_REVIEW=true` or `NEXT_PUBLIC_COMMERCE_ENVIRONMENT=preview`. Those would have flipped `preview`→`production`,
which would change: `assertRuntimePreflight`'s variable prefix (`SHOPIFY_STAGING_*` → `SHOPIFY_*`), fixture-data eligibility
(already false in both), and the catalog copy branch. **This is the load-bearing consequence to be aware of:** if a production
deployment ever *was* running on staging Shopify credentials because of that stale flag, this change makes it fail preflight loudly
at boot instead of quietly serving the wrong store. That is the correct behaviour and it is the reason to deploy this to staging first.

**`SHOW_PRODUCTS` / `PREVIEW_DRAFT_PRODUCTS` deliberately left untouched.** They read `VERCEL_ENV === 'preview'` directly and do not
route through `getCommerceEnvironment()`. Changing them would risk switching products off on production, whose
`NEXT_PUBLIC_SHOW_PRODUCTS` *value* we cannot read. Out of scope, recorded, not touched.

## B.3 Customer-facing copy — environment wording removed regardless of the gate

- `apps/web/src/components/commerce/catalog-state.tsx` — "Private live-commerce staging" → "Private preview";
  "…private staging verification" / "private Preview catalog" → environment-neutral wording.
- `apps/web/src/lib/commerce/home-catalog-summary.ts` — "active in private staging." → "active in this private preview.";
  "private Staged-or-later release candidate" → "private release candidate".
- `apps/web/src/app/checkout-design-review/page.tsx` — metadata "Private staging review…" → "Private internal review…";
  header chip "Staging review · Draft" → "Internal review · Draft".

## B.4 The route guard, added as defence in depth and explicitly not as the fix

`/checkout-design-review` returned **200 on www.carlophillips.com** — an internal design surface on the live storefront.
`notFound()` is now called when `getCommerceEnvironment() === 'production'`. The page is statically rendered, so a production build
emits a 404 for it. This is secondary: the gate fix is the repair, and guarding the route alone would have hidden the symptom while
leaving the gate broken for the other twelve consumers.

## B.5 Verification status — stated plainly

`node_modules` is not installed in this tree (`tsc` and `vitest` both unavailable), so **I have run neither the typecheck nor the
test suite.** These edits are string/branch changes with no signature changes, but that is reasoning, not evidence. **Required before
deploy:** `yarn typecheck`, `yarn test`, then staging deploy and a re-probe of `/shop`, `/`, and `/checkout-design-review`.

Note for whoever runs the suite: `tests/product-visibility.test.js` imports `../lib/config/product-visibility.js` — the **root,
undeployed** module, not the `apps/web` one I changed. It therefore neither covers nor is broken by this fix. The deployed gate has
**no test coverage at all**; a test against `apps/web/src/lib/config/product-visibility.ts` asserting VERCEL_ENV precedence should be
added before this ships.

## B.6 Serving production deployment ID — for Sushma

**`dpl_7acwDFo9hMyZaZvuLUjUBAGq1JbV`**

Exact command, run from the repo root, CLI `vercel@56.1.0`, scope `cubiqo-projects-d7156840`, project `carlophillips`:

    vercel inspect www.carlophillips.com --format=json

Authoritative fields returned: `id: dpl_7acwDFo9hMyZaZvuLUjUBAGq1JbV`, `target: production`, `readyState: READY`,
`url: carlophillips-50msongfq-cubiqo-projects-d7156840.vercel.app`, `createdAt: 2026-09-15T18:52:56.737Z`,
`aliases: ["carlophillips-cubiqo-projects-d7156840.vercel.app"]`, `meta: {}` (no git metadata — consistent with a
CLI/prebuilt deploy rather than a Git-integration deploy).

This resolves the alias through Vercel's own API, not a response header. **Two things worth Sushma's attention, flagged not resolved:**
the `aliases` array does not itself list `www.carlophillips.com`, and `meta` carries no `githubCommitSha`, so this deployment's ID is
authoritative but its **source commit is not established from this read**. If provenance to a commit is needed, that is a separate
question and I have not answered it.

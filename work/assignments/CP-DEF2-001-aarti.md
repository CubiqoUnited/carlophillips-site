Class EVOLVING · Owner Sushma (dispatch) · Writers Sushma dispatches; Aarti records results · v3.5interim (2026-09-18)

# Dispatch — Aarti · CP-DEF2-001 (now) and the staging-proof problem (re-scoped)

**From:** Sushma · **Date:** 2026-09-18 · **Basis:** D-024, D-025, SK-002 in state/DECISIONS-LOG.md

## 1. NEXT ACTION — CP-DEF2-001, start here

`/checkout-design-review` returns **200 on production** carrying "Private staging review · Draft". Independently confirmed by Sushma. Customer-reachable staging language on the live domain.

Source you located: `catalog-state.tsx` L45/48, `home-catalog-summary.ts` L12, `checkout-design-review/page.tsx` L8/28 — all keyed on `getCommerceEnvironment()`, which ignores `VERCEL_ENV`.

**Fix the gate, not the route.** Guarding the one URL leaves the same faulty gate under three other call sites. The concerning part is not this page — it is that an environment gate everyone assumes works does not, so other surfaces may be misbehaving in ways nobody has loaded yet. Confirm all four call sites after the fix.

This is the **top launch blocker** and the only one not gated on H-005, so it is the only thing that can move right now.

## 2. Your staging-proof option set has collapsed — good news

Do not spend design effort here. Per D-025 and SK-002:

- **Manual fulfilment at a manual location handles everything except a repeat FR-6.** Because the app is a frontend that only reads Shopify state (D-011), a manually-created fulfilment with a typed tracking number is indistinguishable to the app from an Apliiq one. That covers FR-7, FR-8 and FR-9.
- **FR-6 already has one instance** — Apliiq accepted and parsed order #1005. (The design-confirmation email is **Boss-reported, not verified**; the Apliiq fulfilment service on the order **is** verified.) You do not need to engineer a way to re-prove it.
- **FR-9 needs no mechanism at all**: a paid order left unfulfilled *is* the stalled state.

## 3. D-013 is re-framed — it is now an enabler, not just a safety control

SK-002's pattern — remove Apliiq as the fulfilment service from test products, assign test-product inventory to a **MANUAL location only** — was recorded as a dispatch-leak defence. It is also **the thing that makes staging able to mimic FR-7/FR-9 at all.** Shopify routes fulfilment requests by which service owns the inventory location, so if Apliiq owns no location for a product it is never contacted, and manual fulfilment becomes available. One change, two purposes. Secondary defences: auto-fulfilment OFF, fulfilment holds.

Blocked on H-005 (connector disconnected, Boss must reconnect) before you can apply it.

## 3b. UPDATE 2026-09-18 — Boss decision D-026 simplifies this further

**Proceed with the manual-location change on staging as the single configuration:** Apliiq removed as fulfilment service for staging products, inventory assigned to a manual location only.

**It is a one-way change, not a toggle.** Boss has declared the Apliiq connection established, and no further Apliiq acceptance test will be run — so **there is no scenario requiring Apliiq to be reattached to staging.** Design one configuration, not two. No reversibility requirement, no mode switch, no feature flag.

SK-003 confirms the approach: manual fulfilment produces a real `Fulfillment` object with `status: SUCCESS`, `displayFulfillmentStatus: FULFILLED` and populated `trackingInfo` — a reading app cannot distinguish it from an Apliiq fulfilment. FR-9 stall detection is native via Flow (*Order paid* → wait 24h → check `fulfillmentStatus != FULFILLED`), so it needs no application code either.

Accepted limitation you should know rather than try to solve: the request→accept round-trip, Apliiq's writeback shape, and **FulfillmentOrder intermediate states** will never be exercised in rehearsal. Sidekick flagged the last as the most likely live-vs-staging divergence for a headless frontend. This is consciously accepted risk (D-026), not an oversight — do not engineer around it, but if a live order later shows a fulfilment-state anomaly, that is the first place to look.

## 3c. UPDATE 2026-09-18 (SK-004) — POD trap that sharpens D-013

**Shipping labels purchased on TEST orders are charged for real.** Do not let Apliiq auto-fulfil a test order.

Two consequences for your work:
- The manual-location change (3b) is now justified on **cost** grounds as well as fidelity and safety. Every staging rehearsal that reaches Apliiq may buy a real label.
- The earlier inference that the dispatch leak "has cost nothing so far" is **weakened** — it reasoned about manufacturing, not label purchase. Do not rely on it. The Apliiq account reconciliation is Boss's (account access), but treat the leak as potentially costly, not free.

**Context you can rely on:** the store is **US-ONLY** — Markets has exactly one enabled market. All international shipping zones in the Apliiq delivery profile are unreachable. Do not build or test international paths.

## 4. Standing constraints

- **Only `apps/web` is deployed.** `vercel.json` sets `outputDirectory` to `apps/web/.next`. Root `app/`, `components/`, `lib/commerce/` (184K), `lib/releases/`, `contracts/` are never built or served — treat as **NEVER-BUILD**, not as a deletion task. `/track` returning 404 confirms it. Evidence cited from the root tree describes code that does not run.
- **Deployment drift, owed by you:** the serving production deployment ID differs from `dpl_E3ZfoZuKRzaXMp8GJr5hTdpo83ty` recorded in state/NOW.md. I marked it SUSPECT rather than overwriting one unverified ID with another. Supply the serving ID **with the command that produced it** and I will update NOW.md and the Gate 10 provenance citing it.
- **CP-ENV-001 is retracted** — not a defect. `CP_RELEASE_ID`/`CP_RELEASE_COMMIT_SHA` are deployment-scoped and injected by the GitHub workflow; `vercel env ls production` lists project-scoped vars only. Your check — loading the actual site — is what caught it. That was the fifth instance today of reading one surface and concluding about another; prefer the end-to-end check.
- Still open and **not** settled by the validator passing: whether `SHOPIFY_STORE_DOMAIN` targets the intended store. A validator passes fine against a consistently-configured wrong store. Needs H-005.
- Sidekick questions go to Sushma as `READY_FOR_SIDEKICK` per state/STATUS-SCHEMA.md. Do not contact Sidekick directly.

## Return signal
`ITEM: CP-DEF2-001 | RESULT: READY_FOR_<STATE> / BLOCKED / FAILED | EVIDENCE: <commit, response codes for all four call sites> | NEXT: ... | OWNER: ... | RESUME: ...`

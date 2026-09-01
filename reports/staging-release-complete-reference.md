# CARLOPHILLIPS — Staging Release Reference (Post-PR #54)

**Single source of truth for Shopify-authoritative release. Records deployed state, PR #54 candidate, pending Staging gates, and deployment sequence.**

**Baseline:** `origin/main@e31eb59` (pre-PR #54) → PR #54 code-approved at `2d32e3a` → Staging deployment → live happy-path test → release approval.

---

## Master Table of Contents

### [I. Deployed Main State](#i-deployed-main-state--what-is-live)

Current production and staging builds, verified 2026-08-31.

### [II. PR #54 Candidate — Code-Ready](#ii-pr-54-candidate--code-ready-for-staging)

All implementation in place and verified by CI. Ready for protected Staging deployment.

### [III. Staging Gates — External Blockers](#iii-staging-gates--external-blockers-before-release)

Vercel project selection, GitHub/Vercel variables, Shopify webhooks, live happy-path test.

### [IV. Architecture & Implementation](#iv-architecture--implementation)

Shopify authority boundary, Next.js presentation, implementation disposition, authority-boundary tests.

### [V. Deployment Sequence](#v-deployment-sequence)

GitHub Preview setup → Vercel Staging deploy → webhook registration → happy-path test → merge PR #54 → Production.

### [VI. Evidence & Rollback](#vi-evidence--rollback-identifiers)

Known-good commits, emergency revert procedure.

---

# I. Deployed Main State — what is live

**Commit:** `origin/main@e31eb59`  
**Date verified:** 2026-08-31  
**Status:** Pre-PR #54; Shopify-authoritative foundation, partial integration

### Current Capabilities

| Capability | Status | Evidence |
|---|---|---|
| Custom landing hero (Lofoten) | ✅ Live | HeroMorphPreview.tsx, design tokens @layer pattern, no hardcoded colors |
| Shopify product page | ✅ Live | Storefront API **2025-10** (main); **PR #54 upgrades to 2026-07**; force-dynamic, no caching |
| Product variants (S/M/L) | ✅ Live | Three variants, availableForSale true, $128 USD; variant hash matching via referenceHash |
| Shopify product images | ✅ Live | 12 images from Shopify CDN, rendered in gallery |
| Design system & responsive UI | ✅ Live | Approved components, typography, spacing, accessibility |
| Shopify cart creation | ❌ Blocked | cartCreate mutation exists; cart/checkout flow not wired to form |
| Shopify-hosted checkout | ❌ Blocked | Shopify checkout URL exists; ProductForm submit not connected |
| Webhook ingress | ❌ Missing | No route; PR #54 adds endpoint |
| Durable idempotency store | ❌ Missing | Infrastructure not configured |
| Shopify-native order notifications | ✅ Partial | Shopify sends confirmations; custom branding not yet applied |

### Known Limitations (Pre-PR #54)

- ProductForm sends to nowhere (event.preventDefault() cancels submission)
- No cart ↔ Shopify sync on product page
- No webhook subscriptions registered
- No order confirmation branding
- No persistent cart recovery across sessions

---

# II. PR #54 Candidate — Code-Ready for Staging

**Branch:** `codex/shopify-authoritative-release-go`  
**Head:** `2d32e3a` (docs: distinguish implementation commit from PR head)  
**Status:** ✅ **Code-approved.** CI green. All checks pass. Ready for protected Vercel Staging deployment.  
**Approval level:** Code implementation verified. NOT final release approval (pending live Staging test).

### Shipped Implementation

| Component | Solution | Evidence |
|---|---|---|
| ProductForm → cart flow | ✅ KEEP | Submit to `/api/cart` with opaque `referenceHash`. No event.preventDefault(). |
| Cart mutations (add/update/remove) | ✅ KEEP | shopify-cart-server.ts handles all cart operations against live Shopify |
| Checkout handoff | ✅ KEEP | Read persistent Shopify cart, redirect to Shopify `checkoutUrl` (303) |
| Webhook POST ingress | ✅ KEEP | Signed HMAC verification, allowed shop validation, lifecycle recording |
| Durable idempotency store | ✅ KEEP | Redis/Upstash mandatory. Throws if not configured (fail-closed). |
| Product discovery | ✅ KEEP | Shopify Storefront API, force-dynamic reads. No local file discovery. |
| Environment variables | ✅ KEEP | .env.example documents complete Shopify, webhook, and Redis contract |

### Superseded or Deferred

| Component | Disposition | Reason |
|---|---|---|
| Custom checkout server (`shopify-checkout-server.ts`) | Superseded | Use shopify-cart-server.ts instead. Shopify-hosted checkout is authoritative. |
| Release registry filesystem discovery | Deferred | Use Shopify Storefront API discovery. Release JSON remains audit-only. |
| Custom order confirmation (Resend) | Deferred | Shopify sends natively. Brand the template in Admin instead. |
| outputFileTracingIncludes | Not needed | No runtime file reads. Storefront has no release-file dependency. |

### Verification

- ✅ Source boundary: no hardcoded GIDs, Shopify authority clear
- ✅ Cart/runtime/authority tests: 14/14 passed
- ✅ CI and browser checks: green
- ✅ Durable idempotency: required, not optional

---

# III. Staging Gates — External Blockers Before Release

PR #54 is code-ready, but these must be completed before staging deployment and live testing can begin.

### Prerequisite: Canonical Vercel Project Selection

**Required decision:** Which Vercel project is the staging/production target?  
**Current state:** Unknown. Two same-named projects exist; GitHub Preview variables not configured.

**Action:** Select the canonical project and record its IDs.

### GitHub Preview Environment Configuration

**Required variables:**
- `VERCEL_ORG_ID` — canonical Vercel organization ID
- `VERCEL_PROJECT_ID` — canonical staging/production project ID
- Secret: `VERCEL_TOKEN` — Vercel API authorization token

**Status:** ❌ Not configured. Enables vercel-preview.yml to deploy PR head to Staging.

### Vercel Preview Environment Configuration (Staging)

**Required variables:**
- `SHOPIFY_STAGING_STORE_DOMAIN` — test store domain
- `SHOPIFY_STAGING_STOREFRONT_TOKEN` — test store Storefront API token
- `SHOPIFY_STAGING_CHECKOUT_HOSTS` — trusted checkout hosts (test store)
- `SHOPIFY_STAGING_WEBHOOK_SECRET` — shared secret for incoming webhooks
- `SHOPIFY_WEBHOOK_ALLOWED_SHOPS` — comma-separated list of allowed shop domains
- `UPSTASH_REDIS_REST_URL` — Redis endpoint for durable webhook idempotency
- `UPSTASH_REDIS_REST_TOKEN` — Redis authentication token

**Status:** ❌ Not configured in canonical project. Blocks webhook idempotency and durable storage.

### Shopify Staging Webhook Subscriptions

**Required topics (8 total):**
- orders/create
- orders/paid
- orders/cancelled
- orders/fulfilled
- orders/updated
- fulfillments/create
- fulfillments/update
- refunds/create

**Endpoint:** `https://<staging-domain>/api/webhooks/shopify` (HTTPS, verified HMAC)

**Status:** ❌ Not registered. Requires Shopify Admin access after Staging deployment.

### Live Happy-Path Test (Staging)

**Sequence:**
1. Add product to bag
2. Proceed to checkout (Shopify-hosted)
3. Complete payment with test card
4. Shopify order created and paid
5. Order confirmation email received
6. Webhook trigger: orders/paid recorded
7. Fulfillment tracking visible (if Apliiq integrated)

**Status:** ⏳ Blocked on Vercel/Shopify configuration above.

**Result:** Must pass before PR #54 can be merged to main.

---

# IV. Architecture & Implementation

## Principle

**Shopify owns:** Products, variants, cart, checkout, orders, customer notifications, inventory.  
**Next.js owns:** UI, hero, presentation, form handling, accessibility, branding overlays.

## Implementation Disposition (13 Items)

| # | Proposed module | PR #54 solution |
|---|---|---|
| 1 | `shopify-checkout-server.ts` | **Supersede.** Use shipped `shopify-cart-server.ts`. Never implement duplicate checkout. |
| 2 | `ProductForm/index.tsx` | **Keep.** Submit to `/api/cart` with opaque `referenceHash`. Never expose GID to client. |
| 3 | `product/[handle]/page.tsx` + metafields | **Keep.** Render Shopify data + all 5 metafield queries (custom.tagline, custom.material, custom.fit, custom.care, custom.size_guide). No code-owned release approval filters. |
| 4 | `product-release-registry.ts` | **Defer.** Do not implement findReleasesDirectory(). Use Shopify discovery. Release JSON audit-only. |
| 5 | Shopify webhook POST route | **Keep.** HMAC verification, allowed shop/topic validation, lifecycle recording. |
| 6 | Webhook idempotency (durable) | **Keep.** Redis/Upstash mandatory. Prohibit in-memory fallback. Throws if not configured. |
| 7 | `order-confirmation.ts` | **Defer.** Shopify sends natively. Brand the template in Admin. |
| 8 | `shopify-order-payload.ts` | **Defer.** Add only if PO-approved custom sender. Never store raw payload. |
| 9 | `notifications/provider.ts` | **Defer.** Do not build second system unless Shopify cannot satisfy. Support delivery is separate. |
| 10 | `next.config.js` tracing | **No change.** Do not package releases/**/*.json. No runtime file dependency. |
| 11 | `.env.example` | **Keep.** Complete Shopify, webhook, Redis variable contract. |
| 12 | Observation script | **Audit-only.** Use capture-shopify-product-observation.mjs. Never control availability. |

## Authority-Boundary Tests (Shipped Code)

✅ Source boundary: no hardcoded GIDs, Shopify authority clear  
✅ Cart/runtime: persistent cart from Shopify, mutations via SDK  
✅ Checkout: redirect to Shopify `checkoutUrl`, never touch payment data  
✅ Webhook: HMAC verified, allowed shops enforced, durable storage required  

---

# V. Deployment Sequence

### Phase 1: Vercel & Shopify Configuration (Prerequisites)

1. **Select canonical Vercel project** (record IDs)
2. **Configure GitHub Preview environment:** VERCEL_ORG_ID, VERCEL_PROJECT_ID, VERCEL_TOKEN
3. **Configure Vercel Preview environment (staging):** 7 Shopify + Redis variables
4. **Provision Upstash Redis** (or equivalent KV store)

### Phase 2: Protected Staging Deployment (PR #54 head)

1. Keep PR #54 **open** (required by vercel-preview.yml CI)
2. Manually dispatch protected Staging workflow with exact PR head commit
   - Automatic Vercel preview branch is build evidence only (not the Staging deployment)
   - Protected workflow explicitly deploys to isolated Staging environment
3. Verify build succeeds and site loads at staging domain

### Phase 3: Shopify Webhook Integration (Staging)

1. **Register all 8 webhook topics** in staging Shopify store
   - Endpoint: `https://<staging-domain>/api/webhooks/shopify`
   - HMAC secret: `SHOPIFY_STAGING_WEBHOOK_SECRET`
2. **Test webhook delivery** by creating a test order in staging store

### Phase 4: Live Happy-Path Test (Staging)

1. Add CARLOPHILLIPS Signature Hoodie to bag (size S, M, or L)
2. Proceed to Shopify-hosted checkout
3. Complete payment with test credit card (Shopify test mode)
4. Verify order created in Shopify Admin
5. Verify order confirmation email received
6. Verify webhook recorded in durable store (if observable)
7. Verify fulfillment path (if Apliiq integrated)

**Result:** ✅ Pass → Proceed to merge. ❌ Fail → Debug and retry.

### Phase 5: Merge PR #54

1. After happy-path test passes, **approve and merge PR #54** to main
2. Tag merged commit: `staging-release-2026-08-31` (or date of merge)
3. Record commit SHA for rollback reference

### Phase 6: Production Deployment (After PR #54 merged, requires Staging evidence + dual PO approvals)

**Prerequisites:**
- ✅ Staging happy-path test passed (all 7 steps above)
- ✅ Staging evidence documented (order created, confirmation received, fulfillment tracked)

**Pre-build (configuration first):**
1. **Obtain PO approval to configure Production** (environment variables for build)
2. Configure Vercel Production environment: production Shopify + Redis credentials
   - `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN`, `SHOPIFY_WEBHOOK_SECRET`
   - `SHOPIFY_WEBHOOK_ALLOWED_SHOPS`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

**Build & verify (no domains yet):**
3. Build exact merged `main` SHA as production **candidate** with `SHOPIFY_CART_UI_ENABLED=true` and `SHOPIFY_CHECKOUT_ENABLED=true` using configured Production environment
4. Build distinct safe-fallback artifact from the same exact merged `main` SHA with `SHOPIFY_CART_UI_ENABLED=false` and `SHOPIFY_CHECKOUT_ENABLED=false`
   - Safe-fallback is a checkpoint built simultaneously with candidate; both from same code, different safety gates
5. Verify both artifacts build and boot correctly (no Production domains assigned yet)
6. Record both deployment IDs for rollback reference

**Obtain approvals:**
7. **Obtain explicit PO promotion approval** (to deploy candidate to Production)
8. **Obtain separate explicit PO payment approval** (to accept real payments)

**Promotion (after both approvals obtained):**
9. Promote exact candidate to Production (checkout-enabled, with Production domain)
10. Verify endpoint is live and responsive
11. Register same 8 webhook topics in production Shopify store immediately (endpoint now reachable)
12. **Run controlled test order** (separately approved transaction to verify fulfillment)
13. Monitor live order flow for 1 business day
14. Record production candidate and safe-fallback deployment IDs for rollback reference

---

# VI. Evidence & Rollback Identifiers

## Deployed State

| Commit | Branch | Status | Notes |
|---|---|---|---|
| e31eb59 | origin/main | Previous production (pre-PR #54) | Recovery anchor for emergency rollback only; Shopify-authoritative foundation; cart/checkout not wired |
| 2d32e3a | codex/shopify-authoritative-release-go | Code-approved candidate | PR #54; CI green; pending Staging gates |

## Emergency Rollback

**Safe-fallback artifact:** Distinct Vercel deployment pre-built before production go-live with checkout-disabled (see Phase 6 above)

**If Production fails:**
1. Promote checkout-disabled safe-fallback artifact to Vercel Production (single click, no build)
   - Prevents new payments while keeping durable webhook ingestion active
2. Notify team and Shopify support
3. Keep Production webhooks active (do NOT disable)
   - Webhooks continue recording lifecycle events (orders/paid, orders/fulfilled, etc.)
   - Durable store preserves event record for later reconciliation
4. Investigate root cause in git history
5. Once root cause resolved, either:
   - Promote corrected candidate (rebuild from merge commit)
   - Restore previous known-good deployment (if candidate is unsalvageable)
6. Do NOT rebuild and redeploy arbitrary commits—always use pre-tested artifacts

## Post-Release Cleanup (After successful Production deployment, 24+ hours monitoring)

1. Archive PR #54 branch (keep tag reference)
2. Per each worktree in `git worktree list`:
   - Run `git status --porcelain` (verify no uncommitted changes)
   - Review unpushed commits (merge, archive, or document reason for keeping)
   - If safe, remove: `git worktree remove <path>`
3. Delete merged branches except `main` and `staging` (both protected)
4. Remove remote-tracking branches for deleted remotes
5. Verify clean state: `git status --porcelain` (empty), `git branch` (2 only), `git worktree list` (1 only)
6. Prune stale metadata: `git gc`
7. Record final release SHA and fallback identifier in release notes

---

## How to Use This Document

**For Staging deployment:** Sections III–V (prerequisites, gates, sequence)  
**For architecture review:** Section IV (disposition table, authority boundary)  
**For rollback:** Section VI (identifiers, emergency procedure)  
**For historical context:** `staging-release-pre-pr54-analysis-2026-08-31.md` (archived pre-PR analysis)

---

**Last updated:** 2026-08-31  
**PR #54 status:** Code-approved, open, mergeable (2d32e3a)  
**Staging status:** ❌ Prerequisites not configured; gates pending configuration and live test

---

**⚠️ Repository Status**

Both reference documents remain **untracked**:
- `staging-release-complete-reference.md` (post-PR #54 canonical)
- `staging-release-pre-pr54-analysis-2026-08-31.md` (historical archive)

Until committed to the repository, these are not repository-level sources of truth. They should be reviewed, approved, and committed before Phase 1 (configuration) begins.

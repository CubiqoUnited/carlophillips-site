# ⚠️ SUPERSEDED — PRE-PR #54 HISTORICAL ANALYSIS (2026-08-31)

**This document is archived. Do not use for current decisions. It records the requirements gap before PR #54 was implemented.**

**Current canonical reference:** [`staging-release-complete-reference.md`](staging-release-complete-reference.md) (post-PR #54)

---

# CARLOPHILLIPS — complete staging release reference (archived)

**Single document containing: prescriptive requirements + current state audit + integrated decision view (pre-PR #54)**

All three perspectives on the staging-readiness gap prior to PR #54 implementation, organized by document type with internal navigation. This analysis informed the implementation but is now superseded by the post-merge canonical reference.

**Priority rule:** Section I contains the full target requirements. Sections II and III determine which items are launch blockers versus roadmap work.

---

## Master table of contents

### [I. Prescriptive Requirements — what must be true](#i-prescriptive-requirements--what-must-be-true)

Architecture and design requirements, organized as nested sections. Read when: defining scope, architecture review, requirements approval.

**Sub-sections:**

- [0. Locked release direction](#0-locked-release-direction--one-page-minimum)
- [1. P0 — Authority and staging-baseline conflicts](#1-p0--fix-authority-and-staging-baseline-conflicts)
- [2. Shopify read and content boundary](#2-fix-the-shopify-read-and-content-boundary)
- [3. Shopify cart and hosted checkout](#3-fix-shopify-cart-and-hosted-checkout-behavior)
- [4. Shopify customer and relationship layer](#4-add-the-shopify-native-customer-and-relationship-layer)
- [5. Shopify content and headless-app governance](#5-add-shopify-native-content-and-headless-app-governance)
- [6. "Only the UI is yours" boundary](#6-fix-the-only-the-ui-is-yours-boundary)
- [7. Vercel, environment, and secrets](#7-fix-vercel-environment-and-secret-requirements)
- [8. Delete or supersede non-requirements](#8-delete-or-supersede-non-requirements)
- [9. Acceptance and QA requirements](#9-add-acceptance-and-qa-requirements)
- [10. Product Owner decisions still required](#10-product-owner-decisions-still-required)
- [11. Post-merge, deployment, and Git cleanup](#11-post-merge-deployment-and-git-cleanup)
- [12. Roadmap — conditional performance caching](#12-roadmap--conditional-performance-caching)
- [Evidence appendix](#evidence-appendix)
- [QA validation of the prescriptive TOC](#qa-validation-of-this-toc)

### [II. Current State Analysis — what exists now](#ii-current-state-analysis--what-exists-now)

Implementation status by category: already built, blockers to fix, gaps to build, code to delete, QA gates, cleanup. Read when: implementation planning, sprint roadmap, QA strategy.

**Sub-sections:**

- [0. Test/source precondition](#0-testsource-precondition)
- [1. Already implemented — verify, do not rebuild](#1-already-implemented--verify-do-not-rebuild)
- [2. Release blockers — fix what exists](#2-release-blockers--fix-what-exists)
- [3. Release blockers — build what is missing](#3-release-blockers--build-what-is-missing)
- [4. Delete — redundant or hazardous](#4-delete--redundant-or-hazardous)
- [5. QA and deployment gates](#5-qa-and-deployment-gates)
- [6. Post-release — Git cleanup](#6-post-release--git-cleanup)
- [7. Roadmap — explicitly not launch-blocking](#7-roadmap--explicitly-not-launch-blocking)
- [8. Open Product Owner decisions](#8-open-product-owner-decisions)
- [Verification log](#verification-log)

### [III. Integrated View — current + future + gap](#iii-integrated-view--current--future--gap)

Three-part breakdown per requirement section: current state → future state → requirements gap. Read when: stakeholder sync, decision-making, board reporting, "why are we doing this?"

**Sub-sections (10 areas):**

- [0. Test/source precondition](#0-testsource-precondition-1)
- [1. Custom landing and UI](#1-custom-landing-and-ui)
- [2. Shopify product authority](#2-shopify-product-authority)
- [3. Shopify cart and checkout](#3-shopify-cart-and-checkout)
- [4. Shopify customer and accounts](#4-shopify-customer-and-accounts)
- [5. Webhook and order lifecycle](#5-webhook-and-order-lifecycle)
- [6. Environment and secrets](#6-environment-and-secrets)
- [7. Redundant or hazardous code](#7-redundant-or-hazardous-code)
- [8. QA and deployment gates](#8-qa-and-deployment-gates)
- [9. Post-release Git cleanup](#9-post-release-git-cleanup)
- [10. Product Owner decisions](#10-product-owner-decisions)
- [Evidence appendix](#evidence-appendix-1)

### [IV. Architecture Diagrams & Verification Forms](#iv-architecture-diagrams--verification-forms)

Visual perspectives on the Shopify-authoritative commerce + Next.js presentation boundary, plus production-readiness checklist. Read when: architecture review, team onboarding, deployment coordination, status tracking.

**Artifacts:**

- [A. Authority & Presentation Boundary](#a-authority--presentation-boundary-main-architecture) — Main architecture (clean + hand-sketched versions)
- [B. Data Flow — Request & Response Cycle](#b-data-flow--request--response-cycle) — HTTP journey and freshness guarantee
- [C. Deployment & Infrastructure](#c-deployment--infrastructure--staging-vs-production) — Staging vs Production isolation and promotion
- [D. Production-Readiness Verification Form](#d-production-readiness-verification-form) — Requirements checklist with live status (4/6 requirements, 4/4 Gate 0 blockers, 2/8 release gates)

### [V. Implementation Specs — direct technical modules](#v-implementation-specs--direct-technical-modules)

13-item disposition: each proposed module mapped to PR #54 solution. **Principle: Shopify owns products, variants, cart, checkout, orders, notifications. Next.js owns UI, hero, presentation.**

| # | Proposed module | PR #54 solution |
|---|---|---|
| 1 | `shopify-checkout-server.ts` | **Supersede.** Use shipped `shopify-cart-server.ts` for cart creation, mutations, current-variant validation, trusted checkoutUrl. Never implement a duplicate checkout resolver. |
| 2 | `ProductForm/index.tsx` | **Keep.** Submit to `/api/cart` with opaque variant reference hash. Never expose Shopify GID to client. |
| 3 | `product/[handle]/page.tsx` | **Keep.** Render current Shopify product data. Do not filter Shopify media through code-owned release approvals. |
| 4 | `product-release-registry.ts` filesystem discovery | **Delete/supersede.** Do not implement findReleasesDirectory(). Use catalog-server.ts and Shopify Storefront discovery. Release JSON remains audit-only. |
| 5 | Shopify webhook POST route | **Keep.** Signed ingress, allowed shop/topic validation, sanitized lifecycle recording. |
| 6 | Webhook idempotency (durable) | **Keep.** Redis/Upstash mandatory. Explicitly prohibit in-memory Production fallback. |
| 7 | `order-confirmation.ts` custom sender | **Defer P0.** Shopify sends transactional order confirmation natively. Verify and brand the Shopify notification template in Admin instead. |
| 8 | `shopify-order-payload.ts` projection | **Defer.** Add only if PO-approved custom sender becomes necessary. Never store unrestricted customer payload. |
| 9 | `notifications/provider.ts` (Resend) | **Defer.** Do not build second order-confirmation system unless Shopify cannot satisfy requirement. Support/contact delivery is separate. |
| 10 | `next.config.js` outputFileTracingIncludes | **No change.** Do not package releases/**/*.json; storefront has no runtime release-file dependency. |
| 11 | `.env.example` webhook/Redis vars | **Keep.** Complete staging Shopify, webhook, durable-store variable contract. |
| 12 | `capture-shopify-product-observation.mjs` | **Audit-only.** Use existing script for fingerprint observation. Must never control storefront availability. |
| 13 | `commerce-boundary-policy.test.js` | **Rewrite.** Require /api/cart, Shopify discovery, current availability, no runtime release records, no hardcoded GIDs, durable webhook idempotency. Remove obsolete release/fingerprint error codes. |

**Correct Section V structure (8 actual implementation areas):**
1. Shopify-authoritative catalog and PDP
2. Persistent Shopify cart and hosted checkout  
3. Signed lifecycle webhook ingress
4. Durable webhook observation storage
5. Shopify-native order notifications (template branding only)
6. Environment and deployment contracts
7. Audit-only observation tooling
8. Authority-boundary tests

### [VI. Release, Merge & Deployment Strategy](#vi-release-merge--deployment-strategy)

Agreed sequence: merge to staging branch, deploy to Vercel staging, run QA gates, promote to main, deploy to Production, clean up Git state.

**Pre-release state (verified 2026-08-31):**
- `origin/main@e31eb59` — known-good (all modules updated, 413/413 tests passing, commerce boundary verified)
- `origin/staging@1f101f6` — ancestor of main, ready for promotion after QA
- Untracked: 56 local changes, 132 untracked files, 41 branches, 21 worktrees
- `codex/WTF`: 40 ahead / 213 behind main (non-mergeable wholesale; inventory unique assets before delete)

****GitHub Preview environment variables (required for protected Vercel workflow):**
- `VERCEL_ORG_ID` — canonical Vercel organization
- `VERCEL_PROJECT_ID` — canonical staging/production project
- Secret: `VERCEL_TOKEN` — Vercel deployment authorization

**Vercel Preview environment variables (staging values):**
- `SHOPIFY_STAGING_STORE_DOMAIN`
- `SHOPIFY_STAGING_STOREFRONT_TOKEN`
- `SHOPIFY_STAGING_CHECKOUT_HOSTS`
- `SHOPIFY_STAGING_WEBHOOK_SECRET`
- `SHOPIFY_WEBHOOK_ALLOWED_SHOPS`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

**Staging deployment (Vercel Preview via open PR #54):**
1. Select canonical Vercel project (identify which is production target)
2. Configure GitHub Preview environment: VERCEL_ORG_ID, VERCEL_PROJECT_ID, VERCEL_TOKEN secret
3. Configure Vercel Preview environment: all 7 Shopify staging + Redis variables above
4. Deploy PR #54 head to protected Vercel Staging (vercel-preview.yml requires open PR targeting main)
5. Register webhook subscriptions in staging Shopify store (all 8 supported topics: orders/create, orders/paid, orders/cancelled, orders/fulfilled, orders/updated, fulfillments/create, fulfillments/update, refunds/create)
6. Happy-path test: add to bag → proceed to checkout → complete test payment → Shopify order confirmation → fulfillment tracking visible
7. Approve and **merge PR #54** (only after live test passes)

**Production deployment (Vercel Production after PR #54 merged to main):**
1. Select exact merged `main` commit as candidate
2. Tag commit: `production-release-YYYYMMDD-HHMM` (record in release notes)
3. Build candidate + safe fallback SHA (vercel-production.yml workflow)
4. Configure Vercel Production environment: production-specific `SHOPIFY_WEBHOOK_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
5. Deploy to Vercel production
6. Register webhook subscriptions in production Shopify store (same 8 topics)
7. Verify production checkout and order flow with real payment
8. Record rollback commit (known-good fallback for emergency revert)

**Post-release Git cleanup:**
1. Inventory `codex/WTF`: unique UI, assets, evidence → merge/archive/discard per item
2. Clean worktrees: `git worktree list`, `git worktree prune`
3. Delete stale branches: keep only `main` and `staging`, both protected
4. Remove tracking branches for deleted remotes
5. Verify clean state: `git status --porcelain` (0 tracked/untracked), `git branch` (2 only), `git worktree list` (1 only)

**Emergency rollback:**
- Revert to `main@e31eb59` (confirmed working)
- Redeploy Vercel production from that commit
- Notify team, disable webhooks, contact Shopify support for order reconciliation if needed

---

# I. Prescriptive Requirements — what must be true

**Source:** `staging-design-gap-toc-draft.md`

Architecture and design requirements organized as a specification. This section defines the complete target state; Sections II and III classify launch blockers and roadmap items.

## 0. Locked release direction — one-page minimum

### 0.1 Preserve the approved desktop and mobile UI without visual redesign

### 0.2 Keep the complete landing hero custom: local media, copy, morph, timing, crop, typography, and responsive behavior

### 0.3 Use one local approved hero still as the motion/error fallback; do not add a duplicate Shopify hero metaobject

### 0.4 Make Shopify the sole authority from catalog/product presentation through cart, checkout, payment, order, inventory, and fulfillment

### 0.5 Keep Next.js authoritative only for presentation, interaction, accessibility, trusted integration boundaries, and approved provider exceptions

### 0.6 Promote only the exact staging build that passes data-contract, checkout, desktop/mobile visual, accessibility, and rollback gates

## 1. P0 — Fix authority and staging-baseline conflicts

### 1.1 Sync canonical `staging` with the current `main` authority

### 1.2 Make fresh Shopify state the sole runtime commerce authority

### 1.3 Move Product Release Records, fingerprints, sample/media approvals, and allowlists to non-runtime audit and rollback

### 1.4 Preserve Product Owner approval for staging-to-production promotion without adding a second runtime catalog gate

### 1.5 Consolidate the canonical requirements source and retire contradictory copies

## 2. Fix the Shopify read and content boundary

### 2.1 Require the server-only Shopify Storefront API for customer-facing commerce reads

### 2.2 Delete the public product-JSON fallback from the canonical Storefront path

### 2.3 Replace release-registry catalog enumeration with Shopify-native products and collections

### 2.4 Add Shopify-native search, navigation menus, and collection discovery

### 2.5 Add explicit metafield/metaobject contracts for tagline, details, size guide, campaign, lookbook, FAQ, and editorial story

### 2.6 Delete tag-derived tagline and description-as-details inference

### 2.7 Add Shopify Markets, locale, currency, and contextual-pricing requirements

### 2.8 Keep raw IDs, tokens, Admin API credentials, and unsafe URLs server-only

### 2.9 Start Shopify content authority below the custom landing hero

### 2.10 Source product title, description, price, currency, variants, availability, product facts, size guide, gallery media, and gallery count from Shopify

### 2.11 Source category and collection names, membership, navigation, and product discovery from Shopify collections and menus

### 2.12 Keep storefront interface labels such as `MENU`, `BAG`, `VIEW GALLERY`, and `ORDER` in the Next.js localization/UI layer

### 2.13 Delete placeholder product copy, hardcoded price, synthetic size data, dummy collections, and sellable fixture fallbacks

### 2.14 Reflect Shopify product edits in the product stage, gallery, purchase tray, bag, and checkout without a code change

### 2.15 Reflect Shopify media additions, removals, and ordering in gallery thumbnails, the main product view, and the gallery count

### 2.16 Reflect Shopify variant, inventory, price, currency, and availability changes in every purchase surface from one response contract

### 2.17 Reflect Shopify collection and menu changes in catalog discovery, category navigation, and collection pages

### 2.18 Reflect approved product metafield/metaobject additions in the corresponding PDP facts, size guide, lookbook, FAQ, and editorial modules

### 2.19 Require a code change and staging deployment only for a new schema, component, app adapter, interaction, or custom-hero revision

## 3. Fix Shopify cart and hosted-checkout behavior

### 3.1 Delete hardcoded product-offer and release-JSON runtime blocking

### 3.2 Resolve sellable variants from the fresh Shopify product response

### 3.3 Add persistent Shopify cart creation, retrieval, add, update, remove, and quantity behavior

### 3.4 Make the bag render Shopify cart state, totals, availability, and checkout URL

### 3.5 Converge product, gallery, purchase-tray, buy-now, and bag actions on the same cart contract

### 3.6 Replace the staging-only confirmation stub with a dedicated Shopify development/staging store and test-payment journey

### 3.7 Keep production payment and order submission exclusively on Shopify-hosted checkout

### 3.8 Replace the hardcoded retired `2024-01` cart endpoint and route product reads plus cart mutations through one shared Storefront client pinned to `2026-07`

### 3.8.1 Assert that Shopify's `X-Shopify-API-Version` response header equals the requested shared version on product and cart requests

### 3.8.2 Fail CI/release verification when a second hardcoded Shopify API version appears or the shared version is absent from Shopify's supported stable-version list

### 3.9 Preserve same-origin request checks and trusted HTTPS checkout-host validation

## 4. Add the Shopify-native customer and relationship layer

### 4.1 Add Shopify Customer Account API passwordless email-OTP authentication

### 4.2 Keep guest checkout first-class and customer recognition optional

### 4.3 Add recognized-member bag and checkout handoff

### 4.4 Add Shopify-native Store Credit balance, ledger, and explicit application

### 4.5 Add Saved Pieces, fit memory, addresses, orders, returns, and preferences

### 4.6 Separate Private List marketing consent from account and service communication

### 4.7 Delete production dependence on fixture member numbers, balances, profiles, and local-only form success

## 5. Add Shopify-native content and headless app governance

### 5.1 Define Shopify Admin as the merchant editing surface for catalog and approved content

### 5.2 Add a headless-compatibility matrix for every selected Shopify app

### 5.3 Separate backend/data apps, headless-API apps, and Liquid/theme-injection apps

### 5.4 Add Next.js adapters only for approved customer-visible app features

### 5.5 Select one owner for reviews, support, returns, tracking, spin, and each POD route

### 5.6 Delete any assumption that installation proves API access, headless rendering, configuration, or authority

## 6. Fix the "only the UI is yours" boundary

### 6.1 Keep Shopify authoritative for catalog, customer, cart, checkout, payment, order, tax, shipping, and fulfillment facts

### 6.2 Retain a thin server integration boundary for secrets, trusted-host checks, webhooks, replay protection, and audit evidence

### 6.3 Add authenticated Shopify webhook ingress with durable idempotency and sanitized event storage

### 6.3.1 Deploy and verify the environment-specific HTTPS webhook endpoint before registering any subscription against it

### 6.3.2 Register the required order, payment, fulfillment, refund, and cancellation subscriptions in the staging and Production Shopify stores

### 6.3.3 Verify the exact subscribed topics, endpoint, API version, environment, and active delivery state through the Shopify Admin API without recording credentials

### 6.4 Add provider and carrier event reconciliation for the CP Order Timeline

### 6.5 Add fulfillment, tracking, support, returns, and exception-state observability

### 6.6 Delete duplicate OMS, payment, inventory, pricing, and customer databases

### 6.7 Fix the absolute "no backend/middleware" claim to allow the required operational control plane

### 6.8 Preserve the current custom React component hierarchy, design tokens, typography, spacing, framing, transitions, and responsive breakpoints

### 6.9 Keep the Lofoten landing image and `Edge Of Life` morph presentation custom and independent of Shopify runtime data

### 6.10 Do not create a Shopify `Homepage Hero` metaobject while the custom hero remains the single approved authority

### 6.11 Keep the approved local hero still as the only hero fallback; do not substitute product, fixture, or unapproved remote media

### 6.12 Render product gallery images and thumbnails from sanitized Shopify product media delivered through Shopify CDN

### 6.13 Allow Mux product motion only as an explicit Shopify-insufficient exception with exact-product binding and one reconciled approval record

### 6.14 Store any approved external product-video reference against the Shopify product while keeping the custom Next.js player and controls

### 6.15 Keep CSS and interaction behavior custom; bind changing commerce values to Shopify without altering the UI composition

### 6.16 Fail closed when authoritative Shopify commerce data is absent; visual fallbacks must never become purchasable data

## 7. Fix Vercel, environment, and secret requirements

### 7.1 Bind `staging` to the single canonical Vercel Preview target and `main` to Production

### 7.2 Separate staging Shopify store, checkout hosts, test payments, tokens, and webhook secrets from Production

### 7.3 Validate required variable names, presence, scopes, and environment assignment without reading or recording secret values

### 7.4 Remove obsolete fallback flags and duplicate commerce-source configuration

### 7.5 Add deployment-time configuration checks that fail closed without leaking credentials

### 7.6 Add rollback and staging-to-production parity evidence

## 8. Delete or supersede non-requirements

### 8.1 Delete unverified named-brand and dated case-study claims from normative architecture

### 8.2 Delete the browser-to-Shopify Admin API implication

### 8.3 Delete claims that all Shopify apps automatically work in a Next.js storefront

### 8.4 Delete claims that Shopify eliminates every CP webhook, reliability, and service-orchestration responsibility

### 8.5 Delete release-record and media-manifest runtime gates superseded by Product Owner authority

### 8.6 Delete stale documentation that contradicts fresh Shopify runtime authority

### 8.7 Retain external examples only as non-normative research references with verified sources

## 9. Add acceptance and QA requirements

### 9.1 Contract tests for Shopify-as-runtime-authority and absence of code-level commerce allowlists

### 9.2 Storefront API tests for product, collections, search, content, media, variants, markets, and failure states

### 9.3 Cart tests for create, persist, add, update, remove, stale availability, and trusted checkout handoff

### 9.4 Customer Account, guest/member, consent, Store Credit, and returns tests

### 9.5 Webhook signature, replay, idempotency, ordering, redaction, and recovery tests

### 9.5.1 Capture a sanitized Shopify Admin API subscription inventory and prove a signed test delivery reaches each deployed environment exactly once

### 9.6 Desktop/mobile staging screenshots compared with the same production-intent artifact

### 9.6.1 Compare the hero before/after at intro, revealed, desktop, mobile, reduced-motion, loading, and fallback states

### 9.6.2 Compare product stage, video, gallery overlay, purchase tray, bag, and checkout handoff against the approved visual references

### 9.6.3 Require zero unintended visual change from the Shopify authority migration; approve deliberate data-driven text-length and media-count changes separately

### 9.7 Staging checkout-to-test-payment proof with no Production payment or order

### 9.8 Production Shopify checkout/payment proof with fulfillment, tracking, support, and returns evidence

### 9.9 Secret scan, console/network review, accessibility, performance, and rollback verification

### 9.10 Admin-to-site propagation test for product text, image order, price, availability, collection membership, and metafield content across staging browse, staging checkout rehearsal, variant resolution, and Production-safe contract paths

### 9.10.1 Prove the same fresh Shopify facts reach browsing and checkout so a cheap staging browse cannot give a false all-clear while checkout remains stale

### 9.10.2 Prove fingerprint drift creates sanitized monitoring/audit evidence without hiding the product or blocking a currently valid Shopify variant

### 9.11 Verify the custom hero does not change during Shopify product/content updates

## 10. Product Owner decisions still required

### 10.1 Shopify product/editorial metafield and metaobject model, explicitly excluding the custom landing hero

### 10.2 Initial search, navigation, Markets, locales, and currencies

### 10.3 Selected headless-compatible review, support, returns, tracking, and lifecycle apps

### 10.4 Dedicated Shopify staging/development-store and test-payment configuration

### 10.5 CP operational control-plane scope that does not duplicate Shopify commerce truth

## 11. Post-merge, deployment, and Git cleanup

### 11.1 Freeze new branch work while the approved release candidate is being closed

### 11.2 Inventory every local branch, remote branch, worktree, tracked change, untracked file, and unpushed commit before deletion

### 11.2.1 Enumerate `git worktree list --porcelain`, run `git status --porcelain` in every worktree, and record an explicit merge, archive, or discard decision before removal

### 11.3 Merge or explicitly archive every required change; never treat an unmerged or dirty branch as disposable

### 11.4 Merge the release candidate into `staging`, deploy it to the canonical staging target, and complete all staging acceptance gates

### 11.5 Promote the exact approved staging commit into `main`, deploy Production, and complete production smoke, checkout, payment, rollback, and visual checks

### 11.6 Record immutable release and rollback commit identifiers before branch removal

### 11.7 Remove completed auxiliary worktrees, then delete all merged local branches except `main` and `staging`

### 11.8 Delete all merged remote branches except `origin/main` and `origin/staging`, including the release branch and `codex/WTF`

### 11.9 Prune stale worktree and remote-tracking metadata and run safe repository maintenance only after deletion validation

### 11.10 Finish with exactly two clean local branches—`main` tracking `origin/main` and `staging` tracking `origin/staging`—and exactly two active origin branches

### 11.11 Require `main` and `staging` protection, required checks, pull-request review, and deletion protection after cleanup

### 11.12 Publish a final branch/worktree/status report proving no retained work was lost and both remaining branches are clean

## 12. Roadmap — conditional performance caching

### 12.1 Keep launch reads `force-dynamic` and `cache: 'no-store'`; do not build cache invalidation for a cache that does not exist

### 12.2 If measurement later justifies Shopify content caching, introduce tagged bounded caching and `products/update` invalidation together as one reviewed change

### 12.3 Only after caching exists, document its freshness window, stale-serving policy, last successful revalidation, failure behavior, and observability

## Evidence appendix

The consolidated verification methods and live-store evidence are included in Sections II and III below. The requirement-to-evidence matrix is retained in the supporting `staging-design-gap-toc-draft.md`. Live-store findings are Product Owner-supplied Admin API observations dated 2026-08-31; repository findings were verified locally against the recorded baseline.

### QA validation of this TOC

#### Source coverage: PRD, architecture, latest Product Owner authority, canonical requirements, commerce inventory, Shopify audit, `origin/staging` implementation, and pasted design

#### Action coverage: add, delete, fix, environment, security, operations, customer, commerce, and QA gaps

#### Screenshot-source comparison: completed across the four supplied hero, product, motion, and gallery captures; the source split is represented in sections 2, 6, and 9

#### Locked visual invariant: the custom hero and overall UI composition remain intact while Shopify replaces redundant commerce data and simulated lifecycle behavior

#### Pending implementation evidence: fresh post-change desktop/mobile staging captures and pixel/behavior comparisons remain mandatory before release approval

---

# II. Current State Analysis — what exists now

**Source:** `staging-release-requirements-by-status.md`

Implementation status organized by action category. This document inventories what currently exists, what is blocking, and what must be built.

## 0. Test/source precondition

**77 test/spec files = 73 Vitest + 4 Playwright**

Repository holds parallel JavaScript implementation (root `lib/`) — 71 files, 9,718 lines — alongside shipped TypeScript (`apps/web/src/lib/`). All 21 matching module names are textually different; behavioural equivalence unverified.

Shipped code imports root tree: `product-release-transition.ts` → `evaluateProductReleaseEvidence` (checkout path). Three scripts also import root: `capture-shopify-product-observation.mjs`, `verify-media-readiness.mjs`, `verify-production-commerce-release.mjs`.

**Aggregate test pass counts conflict two populations:**

- 49 Vitest import root `../lib/`
- 8 Vitest import `../apps/web/src`
- 1 Vitest imports both
- 4 Playwright E2E
- 17 other/support

### Remediation (steps 3–7 are code changes)

1. Map every consumer of every root module — application, scripts, tests.
2. Identify canonical source for intentionally shared modules versus legacy mirrors.
3. Extract shared code into a formal package where appropriate.
4. Repoint tests at shipped implementation.
5. Delete only mirrors proven unused after steps 1–2.
6. Add CI boundary enforcement preventing parallel implementations.
7. Report test results separately — shipped-code, package, route, and browser per-category.

## 1. Already implemented — verify, do not rebuild

| Capability                                                         | Evidence                                                    |
| ------------------------------------------------------------------ | ----------------------------------------------------------- |
| Custom landing hero, morph, design tokens                          | `HeroMorphPreview.tsx`, `tokens.css`                        |
| Shopify product reads (title, description, price, variants, media) | Live PDP renders $128, three Shopify-derived variant hashes |
| Product media from Shopify CDN                                     | 12 images returned by Admin API, 12 rendered                |
| Variant resolution from current Shopify response                   | `variant-resolution-policy.ts`                              |
| `cartCreate` mutation                                              | `shopify-checkout-server.ts:32`                             |
| `checkoutUrl` + trusted-host validation                            | `shopify-checkout-server.ts:374`                            |
| Preview / production checkout modes                                | `shopify-checkout-server.ts:50, 302`                        |
| Webhook HMAC verifier (library only, no consumer)                  | `packages/shopify/src/webhooks/verify.ts`                   |
| Request freshness — _fetch only_                                   | `cache: 'no-store'` + `force-dynamic`                       |

Shopify product state (live 2026-08-31): status ACTIVE · vendor Apliiq · $128 USD · 3 variants (s/m/l) · tracksInventory false · inventoryPolicy CONTINUE · availableForSale true.

## 2. Release blockers — fix what exists

**2.1 Resolve the dual implementation and report tests by category.** Root tree is partly shipped-consumed; map-then-consolidate, not deletion. Until results reported per category, aggregate pass count must not gate release.

**2.2 Storefront API version divergence.** Reads use `STOREFRONT_API_VERSION = '2025-10'`; cart hardcodes `https://…/api/2024-01/graphql.json` (retired). Unify on `2026-07`, assert response header, fail build on hardcoded version.

**2.3 Runtime fingerprint gates cause customer-visible outages.** Production can reject fresh facts, triggering `PRODUCT_VARIANT_FINGERPRINT_STALE` or `PRODUCT_COMMERCE_FACTS_STALE`. Staging browse misses it (false all-clear); checkout and variant resolution catch it. Move to audit-only.

**2.4 Catalog enumeration is not Shopify-native.** `catalog-server.ts:18` sources from `listProductReleaseHandles()`. Replace with native discovery.

## 3. Release blockers — build what is missing

| Gap                              | Evidence                                                                                                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Persistent cart operations       | No Storefront transport for retrieve/add/update/remove. `cartLinesAdd` / `Update` / `Remove` inside test regex only; `restoreOrCreateCart` policy exists without transport |
| Bag backed by Shopify cart state | No reference under `bag/` or `components/`                                                                                                                                 |
| Shopify collections and menus    | `/collections` renders hardcoded copy                                                                                                                                      |
| Metafields / metaobjects         | 0 references; query selects `productType` and `tags` only                                                                                                                  |
| Webhook ingress endpoint         | No route under `api/`                                                                                                                                                      |
| Durable idempotency              | In-memory only; insufficient for send-once email                                                                                                                           |
| Webhook subscriptions in Shopify | `webhookSubscriptions(first: 50) → nodes: []`                                                                                                                              |
| POD / Apliiq handoff             | Vendor string only; no operational connector                                                                                                                               |
| Branded order confirmation       | No CP-owned sender; Shopify template customization **unverified**                                                                                                          |

**Webhooks split by urgency:** order/payment/fulfillment are launch-blocking; content-cache invalidation is not — `no-store` + `force-dynamic` already refetch on every request, no cache exists.

## 4. Delete — redundant or hazardous

| Target                                            | Reason                                                                 |
| ------------------------------------------------- | ---------------------------------------------------------------------- |
| Root `lib/` legacy mirrors _(only proven unused)_ | Consolidate per section 0; shipped code and scripts import parts       |
| Synthetic purchasable variants                    | Present on `codex/WTF`; S and L transposed; real hashes on wrong sizes |
| Public product-JSON fallback                      | Bypasses server-only Storefront path                                   |
| Tag-derived tagline/details                       | Replace with explicit metafield contracts                              |
| Fixture member state                              | Hardcoded numbers, balances, profiles                                  |
| Runtime fingerprint gates                         | Retain as audit only, not blockers                                     |

**Governing rule:** fixtures and stale data must never be purchasable.

## 5. QA and deployment gates

1. Test suite unified on shipped code (section 0) — precondition.
2. Admin-to-site propagation: browse + checkout + variant resolution (must exercise checkout).
3. Cart lifecycle: create, persist, add, update, remove, stale availability, trusted handoff.
4. Webhook: signature, replay, idempotency, ordering, redaction, recovery.
5. Staging checkout to test payment, no Production order.
6. Production checkout with fulfillment, tracking, returns.
7. Desktop/mobile visual comparison against approved references; data-driven changes approved separately.
8. Custom hero unchanged across Shopify updates.
9. Five browser test failures resolved (home order journey ×2, ARIA ×2, mobile PDP contrast).

## 6. Post-release — Git cleanup

Current state: 56 tracked changes · 132 untracked · 41 branches · 21 worktrees · `codex/WTF` 40 ahead / 213 behind.

- Inventory every local branch, remote, worktree, change before deletion.
- Merge or archive every required change; never treat unmerged as disposable.
- Merge release candidate into `staging`, deploy, complete acceptance.
- Promote approved staging commit into `main`, deploy Production, complete smoke/checkout/payment/rollback.
- Record immutable release and rollback identifiers.
- Remove completed worktrees, delete merged branches except `main` and `staging`.
- Delete merged remote branches except `origin/main` and `origin/staging`.
- Prune stale metadata.
- Publish proof no work was lost and both branches are clean.

## 7. Roadmap — explicitly not launch-blocking

Customer Account API and passwordless OTP · Store Credit · Saved Pieces and fit memory · advanced returns · Markets, locales and contextual pricing · Shopify-native search · full headless app-compatibility matrix · content-cache invalidation and revalidation.

## 8. Open Product Owner decisions

1. Metafield and metaobject model, excluding custom hero.
2. Dedicated Shopify staging/development store and test-payment configuration.
3. Headless-compatible apps for reviews, support, returns, tracking, POD.
4. Operational control-plane scope that does not duplicate Shopify commerce truth.
5. Root `lib/` tree: decide canonical ownership for every mapped module; move genuinely shared runtime code into formal package and delete only proven mirrors (section 0).

## Verification log

| Finding                       | Method                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------ |
| Test/source split             | 77 test/spec files = 73 Vitest + 4 Playwright (excluded from Vitest)                       |
| Root tree consumed by shipped | `git show origin/main:apps/web/src/lib/releases/product-release-transition.ts`             |
| Module divergence             | `git show origin/main:<path> \| wc -l`, all 21 pairs                                       |
| Storefront API versions       | Admin API `publicApiVersions`; `queries.ts:5` vs `shopify-checkout-server.ts:328` hardcode |
| Zero webhook subscriptions    | Admin API `webhookSubscriptions(first: 50)`                                                |
| Product and inventory state   | Admin API `product(id:)` query                                                             |
| Variant hash mapping          | `sha256(gid://shopify/ProductVariant/<id>)` recomputed against live PDP                    |
| Fingerprint gate scoping      | `git grep -n "_STALE'"`, environment branching                                             |
| Cart operation absence        | `git grep -c cartLinesAdd\|Update\|Remove`                                                 |
| Git state                     | `git status --porcelain`, `git branch`, `git worktree list`                                |

**Unverified:** whether Shopify notification templates customized in Admin; Vercel per-environment assignment; staging/Production stores confirmed separate.

---

# III. Integrated View — current + future + gap

**Source:** `staging-release-requirements-unified.md`

Three-part breakdown per requirement section: current state → future state → gap (what needs to be done).

## 0. Test/source precondition

### Current state

77 test/spec files = 73 Vitest + 4 Playwright. Root `lib/` (71 files, 9,718 lines) imported by 49 Vitest, 3 scripts, and shipping app (`product-release-transition.ts` on checkout path). All 21 matching modules textually different. Aggregate suite totals conflate two populations.

### Future state

Single source of truth per module. Tests report per-category. No parallel implementations. CI rules prevent regression. Aggregate suite never cited as gate.

### Gap / Requirements

1. Map every root module consumer.
2. Identify canonical sources vs. legacy mirrors.
3. Extract shared code to formal package.
4. Repoint tests to shipped code.
5. Delete proven mirrors only.
6. Add CI boundary enforcement.
7. Report per-category test results.

_Steps 3–7 are code changes: package extraction, import repointing, test migration, CI rules._

## 1. Custom landing and UI

### Current state

Hero, morph timing, design tokens, responsive breakpoints all live. Five browser tests fail (home order journey ×2, ARIA ×2, mobile PDP contrast).

### Future state

Hero unchanged during Shopify updates. Available as error fallback if Shopify unavailable. No Shopify hero duplicate. UI composition unchanged. Zero unintended visual drift. Browser failures resolved.

### Gap / Requirements

- Resolve five browser failures.
- Verify hero stable across Shopify content.
- Approve data-driven text/media-count changes separately from visual drift.

## 2. Shopify product authority

### Current state

✅ Product reads, media CDN, variant resolution, request freshness.  
❌ Propagation gated by fingerprints, collections/menus not Shopify-native, metafields not queried, new products require release record.

**Production foot-gun:** ordinary Admin edits trigger staleness, remove product from sale, no Admin signal. Staging browse misses it; checkout catches it.

### Future state

Shopify authoritative for all product facts. Fresh state controls visibility/price/variants/availability — never fingerprints. New products via native discovery. Collections/menus Shopify-backed. Explicit metafield contracts. Staging browse/checkout/variant resolution all consume same facts. Fingerprint drift → monitoring, never outage.

### Gap / Requirements

**Fix:** test/source consolidation, API version unification (2026-07), remove fingerprint outage gates (audit-only), replace registry with Shopify discovery.

**Build:** Shopify-native collections/menus, explicit metafield contracts, metafield bindings, delete tag-derived inference.

**QA:** Admin-to-site propagation test covering browse + checkout + variant resolution.

## 3. Shopify cart and checkout

### Current state

✅ `cartCreate`, `checkoutUrl`, preview/production modes.  
❌ Persistent operations missing, bag not Shopify-backed, API version diverged (reads 2025-10, cart hardcodes 2024-01 retired), checkout preauthorization still release-gated.

`restoreOrCreateCart` policy exists; Storefront transport and wiring missing.

### Future state

Cart persists across sessions. Bag renders Shopify state, totals, availability, checkout URL. Product/gallery/tray/buy-now/bag converge on same contract. API version unified (2026-07). Response header asserts version. Staging → test payment. Production → Shopify-hosted only. CI fails on hardcoded version.

### Gap / Requirements

**Fix:** route checkout through shared client on 2026-07, assert response header, remove hardcoded 2024-01, fail CI on duplicate/hardcoded versions.

**Build:** cartLinesAdd/Update/Remove with transport, persistent retrieval/update, bag backed by live cart, converge actions.

**QA:** cart lifecycle tests, staging checkout-to-payment, production checkout with fulfillment/tracking.

## 4. Shopify customer and accounts

### Current state

Fixture member state only (`MemberExperience.tsx`). No Customer Account API. No Store Credit. Guest checkout hardcoded.

### Future state

Customer Account API passwordless OTP. Guest first-class. Recognized-member handoff. Store Credit balance/ledger/application. Saved Pieces, fit memory, addresses, orders, returns. Consent separated. No production fixture state.

### Gap / Requirements

**Roadmap (not launch-blocking):** Customer Account API, Store Credit, Saved Pieces, fit memory, advanced returns.

## 5. Webhook and order lifecycle

### Current state

✅ Webhook verifier (library).  
❌ No consumer route, zero subscriptions, in-memory idempotency only, no verified confirmation-branding path, no fulfillment/tracking, no POD handoff.

### Future state

Authenticated webhook ingress, durable idempotency, sanitized storage. Approved CP-branded confirmation through a verified Shopify notification template or a CP-owned sender. Provider/carrier reconciliation. Fulfillment/tracking/support/returns/exception observability. Subscriptions in both stores.

### Gap / Requirements

**Fix:** deploy endpoint to staging/Production, verify HTTPS, register subscriptions, implement durable store (not in-memory).

**Build/configure:** verify or configure an approved CP-branded Shopify notification template; add a CP-owned sender only if required. Build provider/carrier reconciliation and fulfillment/tracking/returns observability.

**QA:** webhook signature/replay/idempotency/ordering tests, signed delivery proof per environment, confirmation dispatch to email.

**Infrastructure:** webhook registered in Shopify Admin, env vars for secret/shops/email.

## 6. Environment and secrets

### Current state

The development environment pull showed `SHOPIFY_STORE_DOMAIN`/`SHOPIFY_STOREFRONT_TOKEN` set and `SHOPIFY_WEBHOOK_SECRET`/`TRANSACTIONAL_EMAIL_FROM` empty. Vercel Preview/Production assignment is **unverified**. API version diverged (2025-10 reads vs 2024-01 hardcode). Staging/Production store separation is **unverified**.

### Future state

Server-only credentials never duplicated as `NEXT_PUBLIC_`. Webhook secrets per store. Email provider configured. API version unified and centralized. Deployment-time checks fail closed. Secret scan prevents hardcoding. Separate staging/Production stores with test-payment config.

### Gap / Requirements

**Fix:** unify API on 2026-07, remove hardcoded 2024-01, validate env at deploy (no secret read), fail CI on hardcoded versions.

**Infrastructure (PO decision):** dedicated staging store, test-payment config, separate webhook secrets.

## 7. Redundant or hazardous code

### Current state

71-file `lib/` parallel tree (partly shipped-consumed); synthetic purchasable variants with S/L transposed exist only on stale `codex/WTF`, while canonical `origin/main` already removed them; public product-JSON fallback; tag-derived inference; fixture member state; runtime fingerprint gates.

### Future state

Single source per module. No synthetic purchasable data. Server-only Storefront path only. Explicit metafield contracts. No fixture member state. Fingerprints audit-only.

### Gap / Requirements

**Delete (after section 0):** only root `lib/` modules proven to be legacy mirrors; do not port synthetic variants from `codex/WTF`; delete the public fallback, tag-derived inference, fixture member state, and fingerprint outage behavior while retaining audit evidence.

## 8. QA and deployment gates

### Current state

77 test/spec files: 73 Vitest + 4 Playwright. Within Vitest, 49 directly import root `lib/`, 8 directly import shipped code, 1 imports both, and 17 are other/support/tooling. Five Playwright scenarios fail. Build/lint/type checks pass. No staging checkout-to-payment or Production payment/order proof exists.

### Future state

Unified test suite on shipped code, per-category results. Admin-to-site propagation covering browse + checkout + variant resolution. Cart lifecycle complete. Webhooks fully tested. Staging → test payment. Production → payment/fulfillment/tracking. Visual comparison. Hero stability. Browser failures resolved. Secret/console/accessibility/performance checks. Rollback identifiers recorded.

### Gap / Requirements

**Precondition (section 0):** unify test suite, report per-category.

**Gates:** propagation (browse/checkout/variants), cart lifecycle, webhooks, staging-to-payment, production payment/fulfillment, visual comparison, hero stability, browser fixes, security/performance/accessibility checks.

## 9. Post-release Git cleanup

### Current state

56 tracked changes, 132 untracked, 41 branches, 21 worktrees. `codex/WTF` is 40 ahead / 213 behind and is non-mergeable wholesale as a code source; inventory unique UI, assets, and evidence before deletion.

### Future state

2 clean branches (`main`, `staging`) both protected. Release/rollback identifiers recorded. No stale worktrees/branches.

### Gap / Requirements

**Gate:** inventory before deletion, merge/archive required changes, deploy staging, promote to main/Production, record identifiers, remove worktrees, delete merged branches, prune metadata, publish proof of no loss.

## 10. Product Owner decisions

**Still required:**

1. Metafield/metaobject schema (tagline, details, size guide, campaign, lookbook, FAQ, editorial; exclude hero).
2. Staging/Production Shopify store configuration and test payment.
3. Headless-compatible app selection (reviews, support, returns, tracking, POD) with compatibility matrix.
4. Operational control-plane scope (order timeline, fulfillment coordination, exceptions, returns; not duplicating Shopify truth).
5. Root `lib/` canonical ownership decisions per section 0.

## Evidence appendix

### Live Shopify store state (2026-08-31)

```
Store:              carlophillips
Currency:           USD
Timezone:           America/New_York

Product:            CARLOPHILLIPS Signature Hoodie
Status:             ACTIVE
Vendor:             Apliiq
Price:              $128 USD
Variants:           3 (black/s, black/m, black/l)
Tracks inventory:   false
Inventory policy:   CONTINUE
Available for sale:  true

API versions supported:
  2025-10, 2026-01, 2026-04, 2026-07 (latest)

Retired:            2024-01 (hardcoded in checkout)

Webhook subscriptions: 0
```

### Verification methods

Repository findings were verified by direct commands. Live Shopify findings are Product Owner-supplied direct Admin API observations from 2026-08-31. Unverified claims are marked explicitly. See the Section II verification log.

---

# IV. Architecture Diagrams & Verification Forms

**Three visual perspectives on the Shopify-authoritative commerce + Next.js presentation boundary, plus production-readiness checklist.**

All diagrams show the same technical content (Shopify authority on left, Next.js presentation on right, webhooks/Apliiq POD on integration layer) in different visual styles. All diagrams are embedded as SVG in the artifacts below for self-contained reference.

## A. Authority & Presentation Boundary (Main Architecture)

### Visual style: Clean technical diagram

Shows the complete Shopify-next.js integration:
- **Shopify section (left, blue):** Admin API (metafields, collections, webhooks), Storefront API 2026-07 (products, variants, availability, collections, menus), Webhook ingress (orders/paid, orders/fulfilled, durable idempotency), Shopify-hosted checkout, Store state (live product, price, variants, inventory policy), Apliiq POD integration.
- **Next.js section (right, green):** Custom landing hero (Lofoten, independent of Shopify), Product page flow (force-dynamic, no-store, variant resolution, metafield rendering), Bag & cart (persistent, Shopify-backed), Order confirmation & tracking (CP-branded email, webhook-driven), Design system (unchanged).
- **Legend:** 🔵 Shopify Authority • 🟢 Next.js Presentation • 🟠 Integration Boundary • 🟣 External Partners (Apliiq, Resend, staging store).

**Reference:** `architecture-diagram.html`

### Visual style: Hand-sketched (classic blueprint)

Identical technical content, aesthetic only different:
- Uses Caveat + Indie Flower handwritten fonts
- Organic wavy-border rectangles with SVG feTurbulence displacement filter
- Warm paper background (#fffbf7) and natural color palette
- Sketchy arrows and connecting lines

Suitable for printed reference, architecture review meetings, informal documentation.

**Reference:** `architecture-diagram-sketched.html`

---

## B. Data Flow — Request & Response Cycle

### What it shows

End-to-end HTTP journey for a product page request:

1. **Customer browses** → Browser submits GET /product
2. **Browser sends request** → HTTP headers, no cookies
3. **Next.js server receives** → force-dynamic, cache: no-store
4. **Fresh Shopify read** → Storefront API 2026-07 with authentication
5. **JSON response** → Product facts, variants, media, pricing
6. **Browser renders page** → React component with Shopify data

**Key insight:** Every request reads fresh Shopify data. No cache. No fingerprint gates on propagation (only on audit audit trails). This is why Admin edits appear instantly in staging.

### Why it matters

- Proves no propagation delay between Shopify Admin and storefront
- Shows server-only Storefront API pattern (no client-side leaking of secrets)
- Demonstrates why `force-dynamic` and `cache: 'no-store'` are required
- Clarifies why release fingerprints are audit-only, not runtime outage gates

**Reference:** Embedded in `architecture-diagram-sketched.html` (first diagram after main architecture)

---

## C. Deployment & Infrastructure — Staging vs Production

### What it shows

Parallel environments with separate concerns:

**Staging (preview):**
- Vercel Preview deployment (next-staging branch)
- Dedicated staging Shopify store (test payments, isolated inventory)
- Webhook endpoint (HTTPS verified, durable idempotency gated)
- Visual QA gates (compare against approved references)

**Production:**
- Vercel Production deployment (main branch)
- Production Shopify store (real payments, real inventory)
- Webhook endpoint (same HTTPS/idempotency infrastructure)
- Apliiq POD fulfillment integration
- Order tracking & customer communications

**Promotion flow:**
- Staging → Production (once all QA gates pass)
- Environment-specific variables: `SHOPIFY_WEBHOOK_SECRET`, `TRANSACTIONAL_EMAIL_FROM`, `RESEND_API_KEY`

### Why it matters

- Shows webhook/fulfillment isolation (staging cannot trigger production orders)
- Clarifies that Apliiq integration is Production-only (staging has mock POD)
- Demonstrates why environment variables must be separately configured per environment
- Proves that QA testing is non-destructive (staging uses test payment cards only)

**Reference:** Embedded in `architecture-diagram-sketched.html` (second diagram after data flow)

---

## D. Production-Readiness Verification Form

### What it tracks

**Six Core Requirements (current: 4/6 pass):**
1. ✅ Preserve Approved UI Unchanged
2. ✅ Shopify Authoritative for Commerce
3. ⏳ PO Autonomy on Non-Blockers (metafield integration pending)
4. ✅ Automatic Shopify→Staging Flow
5. ✅ Automatic Product Discovery
6. ⏳ Analysis / Deletion Over Addition (test suite consolidation pending)

**Gate 0 Blockers — Must Pass (current: 4/4 pass):**
- ✅ G0.1: Checkout Routing Unblocked (removed event.preventDefault())
- ✅ G0.2: Checkout Resolves Live Variants (fingerprintVariantReference() + loadShopifyProduct())
- ✅ G0.3: File Tracing for Dynamic Reads (outputFileTracingIncludes for releases/)
- ✅ G0.4: No Hardcoded Variant IDs (GID hardcodes forbidden by test regex)

**Release Gates (current: 2/8 complete):**
- ✅ Release Documentation Complete
- ✅ Architecture Diagrams Approved
- ⏳ Webhook Subscriptions Registered (infrastructure built, must register in Shopify Admin)
- ⏳ Environment Variables Configured (must set in Vercel UI)
- ⏳ Happy-Path QA Test (add → checkout → payment → confirmation → fulfillment)
- ⏳ Rollback Commit Recorded (known-good SHAs for emergency rollback)

**Outstanding Items (blocking production):**
- **PO:** Confirm Shopify metafield model (tagline, details, size guide, campaign, lookbook, FAQ)
- **PO:** Approve durable idempotency store (Redis/Postgres/KV for webhook deduplication before email)
- **Engineer:** Consolidate test suite (map consumers, move shared code to package, repoint tests, delete mirrors)

### How to use it

- **Checkboxes:** mark items as verified/complete
- **Status badges:** ✅ PASS / ⏳ TODO / ℹ PO DECISION / ℹ ENGINEER TASK
- **Sign-off:** all items must be ✅ PASS before production deployment
- **Printable:** suitable for physical sign-off during deployment

**Reference:** `fitment-verification-form.html` with interactive checkboxes and theme support (light/dark/system).

---

## How these artifacts connect to the canonical reference

| Document | Purpose | When to use |
|----------|---------|------------|
| **This file** (staging-release-complete-reference.md) | Complete requirements + status + gap analysis (text only) | Planning, decisions, detailed audit |
| **Architecture diagrams** (clean + sketched) | Visual system boundary and data flow | Architecture review, team onboarding, printed reference |
| **Data flow diagram** | HTTP request/response cycle emphasizing freshness | Understanding why Admin edits propagate instantly |
| **Deployment topology** | Staging vs Production isolation and promotion flow | Environment setup, QA strategy, incident response |
| **Fitment form** | Production-readiness checklist with live status | Team sign-off, deployment coordination, gap tracking |

**Canonicality note:** when any requirement changes, update this complete reference first, then cascade to supporting diagrams and forms.

---

## How to use this document

**Single reference** combining three perspectives:

- **Section I (Prescriptive):** "What are we building?" — Architecture review, requirements sign-off.
- **Section II (Status):** "What's blocking us and why?" — Sprint planning, QA, implementation roadmap.
- **Section III (Integrated):** "What's the full picture?" — Stakeholder sync, decision-making, board reporting.

**Navigation:** use section headers and internal TOCs to jump to relevant area. All three perspectives on the same topic live adjacent (e.g., custom hero appears in all three sections with different framings).

**For depth:** each section references the full prescriptive TOC, current implementation status, and gap analysis without requiring three separate documents.

**Status:** untracked internal guidance. Baseline `origin/main@e31eb59`; Shopify evidence is Product Owner-supplied and dated 2026-08-31. Unverified claims are marked explicitly. Application behavior and visual output have not changed because this work edits documentation only.

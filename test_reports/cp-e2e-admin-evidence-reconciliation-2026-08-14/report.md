# Evidence reconciliation and admin truth QA

Date: 2026-08-14
Branch: `codex/cp-e2e-admin-control-plane`
Source state: exact clean implementation commit `1ea82ef581b65377c50e503d8ea68b8953eda2bc`
Environment: local only; no GitHub, Vercel, Shopify, POD, payment, order, or Production mutation

## Outcome

The local candidate passes its implementation and visual gates. It does **not** make the CARLOPHILLIPS funnel end-to-end ready. The canonical release remains Draft, all 13 readiness stages remain open, Production still requires separately authorized containment, and every external POD-to-post-sale action remains blocked or human-required.

The P0 truth defect is closed locally:

- historical technical access and current operating authority are separate;
- the July Shopify authentication blocker is retained as history and marked superseded by later technical evidence;
- the August observation is stale/historical and grants no release or operating authority;
- the no-order cart test exposes only `cart-write-test` and discovery returns `evidence_only`;
- operational `cart-write` returns `human_required` with `CART_ACTIVATION_AUTHORITY_REQUIRED`;
- release observation binding reports all three missing canonical Shopify fingerprints;
- the audit page says it is static PipelineRun history, not durable append-only/hash-chained storage;
- Orders, Post-sale, and Analytics present canonical empty states.

## Deterministic verification

- Yarn Classic: `1.22.22`
- Frozen install: passed; existing lockfile remained authoritative
- Lint: zero warnings
- Tests: 40 files / 382 tests passed
- Production dependency audit: 0 vulnerabilities across 55 audited packages
- Next.js optimized build: passed
- Whitespace: `git diff --check` passed before evidence commit

## Headless browser verification

Final result: 538/538 findings passed, 0 failures, 58 screenshots.

The protected reviewer matrix covers 14 admin sections at 1440×1000, 1024×768, and 390×844. Product Owner Theme, reviewer denial, unauthenticated denial, same-origin/cross-origin API behavior, Draft checkout denial, and public home/shop/PDP/bag routes are included. Checks cover:

- HTTP status and private/noindex behavior;
- no forms/buttons on read-only reviewer pages;
- no raw Shopify/POD references or provider leakage;
- truthful Evidence, Orders, Post-sale, Analytics, Capabilities, and Audit copy;
- visible mobile navigation scroll affordance and final-section reachability;
- no viewport overflow, broken decoded images, console errors, or failed requests;
- no critical or serious Axe violations;
- Product Owner Theme focus, exact-four-controls boundary, and unchanged/cross-origin write behavior;
- checkout remains denied with `PRODUCT_RELEASE_NOT_RELEASED`.

The responsive Overview contact sheet, 14-section desktop contact sheet, and full mobile Evidence capture were inspected offscreen. No clipping, hierarchy, contrast, wrapping, or disclosure defect remained after the final pass.

## Public visual comparison

Eight same-dimension screenshots—home, shop, Signature Hoodie PDP, and bag at desktop and mobile—were compared byte-for-pixel against the prior integrated fail-closed/admin/Theme candidate. All eight have identical dimensions and exactly zero changed pixels.

Machine-readable evidence:

- `verification.json`
- `public-zero-delta-comparison.json`
- `comparisons/admin-overview-responsive.png`
- `comparisons/admin-sections-desktop-contact-sheet.png`
- `screenshots/`

## Remaining blockers

The local admin is still a protected review projection, not an external operational control plane. Missing work includes real identity/RBAC, durable event storage, reviewed connector commands, current Shopify fingerprints, exact POD mapping, physical sample, truthful approved media, immutable Preview, release transitions, cart/checkout activation, controlled payment/order, fulfillment/tracking, support/returns/refunds/reviews, analytics/reconciliation, and a second-product reuse proof.

The exact human intervention and safe resume signals remain in `reports/HUMAN_INTERVENTION_STICKY_RED.md`.

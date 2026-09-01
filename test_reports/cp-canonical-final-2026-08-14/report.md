# CARLOPHILLIPS canonical consolidation QA

Date: 2026-08-14
Candidate: `ee5ebaece14fe75356461bce3e02292b55d29ef6`
Branch: `codex/cp-e2e-admin-control-plane`
Disposition: **GO for canonical pull-request integration; NO-GO for Preview/Production until the recorded identity and repository-authority actions are complete**

## Integrated scope

- Canonical release, media, cart, checkout, lifecycle, webhook, command-policy, and admin containment.
- Product Owner-only four-token Theme proposal with no direct publication authority.
- Clerk Vercel adapter restricted to one immutable Product Owner subject and fail-closed when unconfigured.
- Manual immutable Preview receipt workflow plus distinct staged Production candidate and verified same-SHA safe fallback.
- Apliiq sign-in blocker removed; exact provider variant/SKU fingerprint, sample, fulfillment, and release evidence remain blocked.

## Source and workflow verification

- Yarn Classic 1.22.22 frozen install passed.
- ESLint passed with zero warnings.
- Vitest passed: 44 files / 468 tests.
- Production dependency audit passed: zero vulnerabilities across 67 packages.
- Next.js 15.5.21 optimized build passed.
- `ci.yml`, `vercel-preview.yml`, `vercel-release-candidate.yml`, and `vercel-production.yml` parse successfully.
- Changed receipt, fallback, and browser QA scripts pass Node syntax checks.
- Whitespace and staged secret-pattern scans passed.

## Browser and visual verification

- Headless Chromium: 689/689 findings, zero failures, 68 screenshots.
- Widths: 1440×1000, 1024×768, and 390×844.
- Covered all admin sections, Product Owner Theme, reviewer/unauthenticated concealment, unconfigured-Vercel concealment, accessibility, console/network failures, horizontal overflow, raw provider references, public navigation, and fail-closed checkout.
- Offscreen inspection found no clipping, overlap, misleading release state, or exposed admin/provider vocabulary in denied states.
- Eight public home/shop/Hoodie/bag desktop/mobile screenshots are byte-identical to the exact pre-auth integrated baseline.

Machine evidence: `verification.json`; visual summaries: `comparisons/admin-overview-responsive.png` and `comparisons/admin-sections-desktop-contact-sheet.png`.

## Deployment and access truth

- Verified Vercel target: team `adityas-projects-261b17a9`, project `carlophillips-site` (`prj_9VHD0AhhQnuml8frfNDsmFLHXcq1`). The duplicate Cubiqo project is not authorized.
- The current canonical GitHub permission is pull-only; protected Preview requires a same-repository PR and therefore cannot execute from the fork.
- Clerk keys and the exact Product Owner `user_...` allowlist subject are not provisioned. Unconfigured Preview/Production admin correctly returns a non-disclosing 404.
- After provisioning and real-session Preview QA, the Product Owner access path is `/admin/sign-in`, then `/admin` or `/admin/theme`.
- Theme Save remains local and uncommitted only. A least-privilege GitHub adapter that edits only root `theme.json` on a temporary branch and opens a draft PR is still required for remote write.
- Production remains on the previously observed unsafe artifact; no deployment, alias, Shopify mutation, product publication, order, charge, or Production change occurred in this run.

## Shopify app/access audit

- Authenticated read-only Shopify Admin audit found 33 installed apps.
- Selected minimum stack: Apliiq, native Shopify Headless, Modelize, one spin candidate, Shopify Flow, and the CP Next.js storefront.
- Apliiq account access and saved-product facts are evidenced. The remaining blocker is exact variant/SKU fingerprint binding plus a separately approved and inspected physical sample.
- Modelize existing outputs are accessible but the free allowance is exhausted. Spin Studio is installed but disabled and lacks a proven headless export. Flow exists but is inactive. Other installed apps remain installation evidence only until callable scopes and authority are verified.

## Remaining end-to-end gaps

The readiness map remains 0/13 complete. A sellable release still requires exact Shopify/POD bindings, physical sample approval, complete approved media, immutable staging/release evidence, approvals, cart/checkout activation, one controlled payment/order, POD fulfillment, tracking, delivery, support, return/refund, review eligibility, and analytics reconciliation.

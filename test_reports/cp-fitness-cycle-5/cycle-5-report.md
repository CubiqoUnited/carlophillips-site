# CP Fitness Cycle 5 Evidence Package

## 1. Objective completed and commit

The existing Shopify/Google browser path was attempted read-only and stopped truthfully at Shopify email OTP. The blocker was isolated while the unblocked framework lane migrated from unsupported Next.js 14.2.3 to Next.js 15.5.21 Maintenance LTS with React/React DOM 19.2.8. The local cycle commit is reported by Git at handoff.

## 2. Exact files changed

- Runtime/tooling/security resolutions: `package.json`, `yarn.lock`.
- Next.js 15 compatibility: `app/api/[[...path]]/route.js`, `app/products/[handle]/page.js`.
- Capability/run/tooling truth: `config/capability-registry.json`, `runs/cp-hoodie-local-sim-001/run.json`, `tests/capability-registry.test.js`, `tests/contracts.test.js`, `tests/tooling-policy.test.js`.
- Governance/status: `README.md`, `STATUS.md`, `TASKS.md`, `docs/shopify-capability-access-audit.md`, `docs/status/CURRENT_STATUS.md`, `docs/status/HUMAN_BLOCKERS.md`, `docs/status/NEXT_ACTIONS.md`.
- Evidence: `test_reports/cp-fitness-cycle-5/*`.

## 3. Tests, commands, and machine-readable artifacts

- Clean temporary tree: `yarn install --frozen-lockfile --non-interactive` — passed.
- `yarn lint` — passed with zero warnings.
- `yarn test` — 17 files and 85 tests passed.
- `yarn audit --groups dependencies --level moderate` — zero production-dependency advisories after remediation (193 packages audited).
- `yarn build` — passed on Next.js 15.5.21; 13 routes generated.
- `yarn verify` composes lint, tests, the production audit, and build. Yarn Classic reserves `yarn check`, so that misleading script name was removed.
- Browser: 1440×1000 desktop and 390×844 mobile Hoodie flows; source labels present, purchase disabled, zero console/page errors, no mobile horizontal overflow.
- Bag: local/fixture/checkout-disabled, zero checkout links and zero console/page errors.
- Machine evidence: `verification.json`, `shopify-readonly-audit.json`, capability registry, and PipelineRun.

## 4. Exists / Partial / Proposed / Missing changes

- Exists: supported Maintenance LTS framework, React 19.2.8, async route params, reproducible Yarn lock, zero-advisory production dependency audit, and passing regression evidence.
- Partial: authenticated Shopify path is proven through existing Google account selection, but Admin and every app surface remain behind email OTP.
- Proposed: one read-only classification per P0 app after OTP, followed by app-specific least-privilege tests.
- Missing: verified Storefront/cart, Apliiq mapping, app capabilities/billing boundaries, live Hoodie facts, Preview/production, checkout, fulfillment, and operations proof.

## 5. Failures and contradictory evidence

- The stated “already authenticated Shopify session” did not open directly into Admin. The existing Google account was available, but Shopify required an additional email OTP. This is an authentication-step correction, not evidence that access is unavailable.
- The Product Owner-supplied installed-app snapshot remains candidate inventory because the live UI was not reached.
- Initial local browser checks used the wrong Hoodie handle once and returned the expected `LOCAL_FIXTURE_NOT_FOUND`; the canonical handle then passed. No fallback occurred.
- Executing `yarn check` proved that Yarn Classic shadows a package script with its built-in dependency-tree check. The composed project gate was renamed to `yarn verify` and then executed end-to-end.
- The first production-dependency audit found 38 advisories (1 critical, 15 high, 21 moderate, 1 low). Removing unused Axios/UUID dependencies and upgrading lodash/PostCSS/sharp reduced the final audit to zero.
- PostCSS `8.5.22` and sharp `0.35.3` are temporary Yarn security resolutions beyond Next 15.5.21's declared versions. Frozen install warns about the range mismatch, but lint, tests, audit, production build, and browser regression pass. Retire the overrides when Next's supported line declares patched ranges.
- Build warnings remain for stale Browserslist data and an existing Edge-runtime static-generation notice; neither failed build or changed commerce truth.

## 6. Human/external blockers and exact resume points

- Shopify OTP: enter the code in the preserved verification tab and click Verify without sharing or recording it. Resume at installed-app inventory, then the named P0 surfaces.
- Storefront values: authorized owner configures read-only values in ignored local/Preview environment. Resume at source-labeled Shopify product observation.
- Vercel 402: authorized owner restores project access. Resume at Preview-only deployment and regression; do not promote production.
- Writes/spend/publish: separately approve the exact action. Resume only the named reversible boundary.

## 7. Product Owner decisions required

No product-scope decision is required: the Signature Hoodie remains the first complete reusable-system journey. Human action is required only to complete Shopify OTP and separately approve any future credential, cost, sample, write, publish, deployment, or production boundary.

## 8. Rollback and next bounded cycle

Rollback is a normal revert of this cycle commit; no Git history rewrite, external mutation, deployment, or Shopify change occurred. After OTP, resume the live read-only inventory/app audit at the exact preserved tab. Until then, continue with the next safe local cycle: tighten permissive response/security headers, add machine-checkable supported-version/dependency evidence, and define designer-led/trend-led job contracts with hard cost/publish gates.

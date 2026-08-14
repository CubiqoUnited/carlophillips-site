# CARLOPHILLIPS CI/CD operator runbook

The workflows automate verification and create auditable deployment receipts. They do not authorize a release. Product Owner approval, reviewed evidence, and the repository/environment gates remain mandatory.

## Workflows

- `CI / Verify`: runs on every pull request and push to `main`. Node.js 24 and Yarn Classic 1.22.22 perform frozen install, `yarn verify`, accessibility/privacy network audit, and evidence upload with read-only repository permission and no Vercel credential.
- `Vercel Preview Review / Deploy exact immutable Preview`: manual and protected by the `Preview` environment. It accepts only the exact head of an open same-repository pull request targeting `main`, builds with Preview semantics and checkout disabled, creates one unaliased `immutable-preview` deployment, and has no promotion path.
- `Vercel Release Candidate / Build staged Production candidate and safe fallback`: manual from canonical `main` and protected by `Production`. It builds once with Production semantics and checkout disabled, then creates two distinct unaliased deployments from the exact same SHA and release: `staged-production` and `safe-fallback`.
- `Vercel Production Promotion / Promote exact staged candidate with safe fallback`: manual from canonical `main`. It re-verifies both reviewed deployments and the current Production drift anchor before promoting only the candidate. Any failure after a recorded promotion attempt reconciles Production to the verified safe fallback, never to the prior live deployment.

Preview is review evidence, not a Production artifact. Preview and Production product-visibility policies differ, so the Preview deployment is never promoted. The staged Production pair follows Vercel's `--prod --skip-domain` contract: Production environment semantics with no live-domain assignment, followed by exact-artifact promotion after review.

## Required protected configuration

Configure these separately in both GitHub environments without copying values into Git, issue comments, logs, screenshots, or reports:

| Environment | Required protection | Secret | Variables |
| --- | --- | --- | --- |
| `Preview` | At least one required reviewer; administrator bypass disabled where repository policy permits | `VERCEL_TOKEN` | `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` |
| `Production` | At least one required reviewer; administrator bypass disabled where repository policy permits | `VERCEL_TOKEN` | `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`; time-bounded `CP_PRODUCTION_PROMOTION_ENABLED=true` only for the approved promotion window |

The Preview token is exposed only to Vercel CLI pull, deploy, inspect/list, and protected-deployment smoke steps. The Production token is exposed only to Vercel CLI pull, deploy, inspect/list, candidate promotion, safe-fallback promotion, and live smoke steps. Checkout, dependency installation, tests, application build, and receipt verification receive no deployment credential.

Preview explicitly uses `NEXT_PUBLIC_COMMERCE_ENVIRONMENT=preview`, `COMMERCE_DATA_MODE=shopify`, and `SHOPIFY_CART_UI_ENABLED=false`. The staged Production pair explicitly uses `NEXT_PUBLIC_COMMERCE_ENVIRONMENT=production`, `COMMERCE_DATA_MODE=shopify`, and `SHOPIFY_CART_UI_ENABLED=false`. Provider credential values must never be printed or committed.

## Safe enablement order

1. Open the consolidation pull request and wait for exact-head `CI / Verify` to pass.
2. Protect `main`: require pull requests, at least one approval, exact check `CI / Verify`, and blocked force-push/deletion. Do not require the stale Vercel fork-policy status.
3. Create/protect `Preview`, add its reviewer, IDs, and secret, then dispatch only after explicit approval for the exact pull request and SHA.
4. Accept the immutable Preview only after receipt, browser, accessibility, checkout-denial, and screenshot-comparison evidence pass.
5. Merge the approved source without rewriting its audited history; wait for `CI / Verify` on the exact resulting `main` SHA.
6. Protect `Production`, add its reviewer, IDs, and secret, and confirm the release-pair workflow fails closed on absent/mismatched inputs.
7. Dispatch the release-pair workflow for the exact `main` SHA. Review both unaliased deployment IDs, metadata roles, route smoke, and receipt.
8. Add `CP_PRODUCTION_PROMOTION_ENABLED=true` only for the separately approved promotion window. Remove or disable it immediately after the supervised release attempt.
9. Keep Vercel Git integration disconnected unless the Product Owner intentionally changes this manual-promotion policy.

Until every applicable step passes, no Production promotion is authorized.

## Immutable Preview dispatch

Run `Vercel Preview Review` from the exact pull-request branch and supply:

- `expected_sha`: full 40-character current PR head SHA; it must equal the selected workflow SHA and checked-out commit.
- `pull_request`: open same-repository PR number whose base is `main` and whose head branch/SHA exactly match the workflow ref.
- `release`: letters/numbers/dot/dash/underscore review identifier.

The workflow rejects `main`, forks, closed/wrong-base PRs, SHA/ref drift, missing reviewer protection, and mismatched project identity. It builds without `--prod`, deploys with `--skip-domain`, records `cpArtifactKind=immutable-preview`, `cpBuildEnvironment=preview`, `cpCheckoutEnabled=false`, and the exact PR/SHA, and proves Production remains on the same drift anchor. Protected route smoke uses `vercel curl`; the Hoodie HTML may not expose checkout continuation, `/api/checkout`, or an enabled submit form.

## Staged Production release-pair dispatch

Run `Vercel Release Candidate` from canonical `main` and supply the exact current `expected_sha` and `release`.

One verified Production build is deployed twice with distinct immutable identities and roles:

- candidate: `cpArtifactKind=staged-production`;
- safe fallback: `cpArtifactKind=safe-fallback`.

Both must be `READY`, Production-targeted, unaliased, linked to the expected project, same SHA/release/build environment, and checkout-disabled. Their IDs and URLs must differ. Neither may equal the current Production drift anchor. Production must remain unchanged across staging. Both immutable URLs receive the same fail-closed route smoke, including absence of checkout endpoint/action/submit authority.

The resulting `candidate-release-pair-receipt-<sha>` is the only input source for Production review. The current live deployment ID is recorded solely for compare-and-swap drift detection; it is not a rollback or recovery target.

## Production dispatch and safe-fallback reconciliation

Run `Vercel Production Promotion` from `main` and supply the receipt's exact:

- `candidate_deployment`;
- `safe_fallback_deployment`;
- `expected_sha`, which must equal current `main`;
- `expected_production_anchor`, used only to reject concurrent Production drift;
- `release`.

The workflow re-inspects both artifacts, rejects role/SHA/release/checkout/alias/distinctness tampering, and rechecks the drift anchor immediately before candidate promotion. It performs no build or deploy. Exact promotion identity accepts either the original staged deployment ID or Vercel's provider-recorded promotion envelope whose `action=promote` and `originalDeploymentId` bind it to that exact reviewed source.

After any recorded candidate-promotion attempt, a CLI failure, identity mismatch, metadata error, smoke failure, or receipt-publication failure activates safe-fallback reconciliation. The workflow selects the already verified `safe-fallback` ID, explicitly rejects the Production drift anchor as that ID, promotes the safe fallback, re-verifies provider promotion identity and metadata, reruns fail-closed live smoke, and uploads an incident receipt. There is no `vercel rollback` command and no path that restores the captured unsafe Production artifact.

If safe-fallback promotion or verification fails, treat it as a live incident. Do not manually promote the prior Production drift anchor. Use the retained candidate/fallback inspections and contact the designated Platform/Release owner for an exact reviewed recovery decision.

## Evidence retained

- Protected-environment response and exact PR envelope for Preview.
- Preview inspection/list, normalized receipt, Production before/after proof, and fail-closed PDP HTML.
- Candidate and safe-fallback inspections, shared deployment list, distinct-role receipt, Production before/after proof, and both fail-closed PDP captures.
- Immediate pre-promotion drift proof, selected release-pair receipt, Production inspection/list, exact promotion receipt, and live PDP HTML.
- On failure: live pre-fallback state, safe-fallback plan, post-fallback inspection/list, normalized exact-source receipt, and fail-closed PDP HTML.

The Preview and release-pair workflows remove pulled `.vercel` data before artifact upload. Production promotion never pulls environment data. No receipt grants product, Shopify, checkout, order, sample, billing, or Production authority by itself.

# CARLOPHILLIPS CI/CD operator runbook

The workflows automate verification and create auditable deployment receipts. They do not authorize a release. Product Owner approval, reviewed evidence, and the repository/environment gates remain mandatory.

## Workflows

- `CI / Verify`: runs on every pull request and every push to `main`. It uses Node.js 24, Yarn Classic 1.22.22, a frozen install, and `yarn verify`. It has read-only repository permission and receives no Vercel credential.
- `Vercel Release Candidate / Build staged Production candidate`: manual only and restricted to canonical `main`. It builds with Production commerce semantics, forces checkout UI off, and uses `vercel deploy --prebuilt --prod --skip-domain` so the immutable candidate receives no CARLOPHILLIPS Production domain.
- `Vercel Production Promotion / Promote exact staged candidate`: manual only. It accepts one exact staged candidate and assigns the Production domains only after canonical-main, metadata, environment-reviewer, explicit-enable, fail-closed, and receipt checks pass. It does not rebuild or redeploy the candidate.

The release-candidate model is intentionally not a Preview-to-Production promotion. Preview and Production product-visibility policies differ. Building a Preview artifact and promoting it unchanged could carry Preview visibility decisions into Production. The staged Production build follows Vercel's documented `--prod --skip-domain` contract: Production environment semantics, no live-domain assignment, then exact-artifact promotion after review.

## Required protected configuration

Configure these only in the GitHub `Production` environment, without copying values into Git, issue comments, logs, screenshots, or reports:

- Secret: `VERCEL_TOKEN`
- Variable: `VERCEL_ORG_ID`
- Variable: `VERCEL_PROJECT_ID`
- Promotion-enable variable, added only at the final enablement step: `CP_PRODUCTION_PROMOTION_ENABLED=true`

Both Vercel workflows use the protected `Production` environment. The environment must have at least one required reviewer before the credential is added. Pull-request CI cannot read the credential, and neither deployment workflow uses `pull_request` or `pull_request_target`. The token is injected only into the individual Vercel CLI capture/mutation steps after repository verification; install, lint, tests, application build, checkout, receipt-verifier, and route-smoke steps do not receive it.

The Vercel Production environment must retain the approved server-only commerce configuration. Both the build process and deployed candidate explicitly override `NEXT_PUBLIC_COMMERCE_ENVIRONMENT=production`, `COMMERCE_DATA_MODE=shopify`, and `SHOPIFY_CART_UI_ENABLED=false`. Credential values and Shopify provider values must never be printed or committed.

## Safe enablement order

1. Open the CI/CD pull request and wait for its first green `CI / Verify` run.
2. Add a `main` ruleset requiring pull requests, at least one approval, required check `CI / Verify`, and blocking force-push and deletion. Do not require the stale Vercel fork-policy status.
3. Add at least one required reviewer to the GitHub `Production` environment. Keep administrator bypass disabled if repository policy permits.
4. Add `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` as `Production` environment variables and `VERCEL_TOKEN` as a `Production` environment secret.
5. Verify the environment and first candidate workflow fail closed. Only then add `CP_PRODUCTION_PROMOTION_ENABLED=true` to `Production`.
6. Leave Vercel Git integration disconnected unless the Product Owner intentionally changes the manual-promotion policy.

Until steps 2–5 are complete, no Production promotion is authorized. A missing credential, reviewer, identifier, or enable variable must stop the workflow.

## Release-candidate dispatch

Run `Vercel Release Candidate` from canonical `main` and supply:

- `expected_sha`: the full 40-character current `main` SHA selected in the workflow picker.
- `release`: a letters/numbers/dot/dash/underscore release identifier.

The workflow runs the full repository gate, pulls Production project settings, forces Production commerce semantics with checkout UI off, and builds one prebuilt artifact. It records the exact SHA, release, artifact kind, build environment, workflow run, and checkout-disabled markers. Deployment uses `--prod --skip-domain`; before and after staging, the workflow proves `www.carlophillips.com` still resolves to the same prior deployment.

The candidate verifier additionally requires:

- Vercel target `production` and state `READY`.
- The candidate to belong to the linked project deployment list.
- Exact SHA and release metadata.
- `cpArtifactKind=staged-production`.
- `cpBuildEnvironment=production`.
- `cpCheckoutEnabled=false`.
- No domain alias; review uses only the candidate's immutable deployment URL.
- A distinct, unchanged current Production rollback anchor.

The workflow smoke-tests `/`, `/shop`, `/collections`, the Signature Hoodie PDP, and `/bag` against the immutable candidate URL. The PDP must show `Selection disabled` and `Purchasing disabled`, and must expose neither `Continue to checkout` nor an enabled submit form. Review the candidate URL, browser evidence, and `candidate-release-receipt-<sha>` artifact before requesting promotion.

## Production dispatch

Run `Vercel Production Promotion` from `main` and supply:

- `candidate_deployment`: the exact `dpl_...` identifier or immutable `.vercel.app` URL from the approved candidate receipt.
- `expected_sha`: the candidate receipt SHA, which must equal current canonical `main`.
- `expected_production_anchor`: the exact `productionBeforeDeploymentId` from the reviewed candidate receipt.
- `release`: the exact release identifier from the candidate receipt.

The candidate and promotion workflows share one non-cancelling concurrency lock, so staging and promotion cannot overlap. Promotion links the exact Vercel organization/project identifiers without running `vercel pull`, so the runner does not download Production environment values. It rechecks that current Production still equals the rollback anchor recorded in the reviewed candidate receipt, then verifies the same anchor again immediately before promotion. Drift stops the workflow before `vercel promote` is invoked. The exact candidate is promoted only after the protected environment approval and explicit enable variable pass. The workflow invokes no build or deploy command. After promotion, `www.carlophillips.com` must resolve to the same deployment ID that was reviewed, with both CARLOPHILLIPS Production aliases and all fail-closed metadata intact.

## Post-promotion gate and rollback

After promotion, the workflow verifies identity and tests `/`, `/shop`, `/collections`, the Signature Hoodie PDP, and `/bag`. The PDP must contain both `Selection disabled` and `Purchasing disabled`; it must contain neither `Continue to checkout` nor an enabled submit form.

The workflow writes a durable in-run marker immediately before invoking the promotion command. The command is treated as potentially ambiguous: even when the CLI reports a timeout or failure, a recorded attempt forces live-domain inspection. A non-success command outcome, identity mismatch, metadata failure, smoke failure, or receipt-publication failure after that attempt triggers the rollback gate. The gate reads the live domain again, restores the captured prior deployment when necessary, verifies it, and uploads rollback evidence. If rollback itself fails, treat it as a live incident and manually restore the `production-before.json` deployment from the workflow artifacts.

## Evidence retained

- Candidate inspection, metadata list, and normalized candidate receipt.
- Production before/after-staging inspection proving no domain change.
- Immediate pre-promotion anchor inspection and normalized drift receipt.
- Fail-closed candidate PDP HTML.
- Production environment protection response.
- Selected-candidate receipt.
- Production before/after inspection and deployment list.
- Fail-closed Production PDP HTML.
- Normalized Production receipt or rollback receipt.

The candidate workflow removes its pulled `.vercel` directory before any third-party artifact-upload action runs. The promotion workflow never pulls environment data.

No receipt grants product, Shopify, checkout, order, sample, billing, or Production authority by itself.

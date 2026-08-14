# CI/CD bootstrap verification evidence

Date: 2026-08-14

Baseline: canonical `main` at `cd1cd771fdd6d22e49d772acf8850599e2dad692`

Candidate: automation-only `codex/cp-cicd-bootstrap`

## Scope and boundaries

The candidate changes GitHub/Vercel automation, deterministic policy tests, governance documentation, and this evidence only. Runtime application source, dependencies, lockfiles, public assets, Shopify/provider code and data, Vercel project configuration, domains, and Production were not changed.

PR #9 was merged separately as `cd1cd771`; the merge created no deployment. Production remained on READY deployment `dpl_2s61reh2JATSRMCYfXYHnFnXT2bH`, sourced from approved artifact `bb9568f`.

## Visual regression proof

Two disposable local servers rendered the same canonical application source from the detached baseline and automation candidate. Headless system Chrome captured both at 1440×1000 and 390×844. `browser-verification.json` records HTTP 200, meaningful content, zero framework overlay, zero horizontal overflow, 2/2 decoded images, and no console, page, or request failures for all four captures.

The baseline/candidate PNGs are byte-identical:

- Desktop SHA-256: `4c63a3bc7d87d5a00bc264f0566306dbad9b62d4c7ee8227ac2beb567c74ba3`
- Mobile SHA-256: `906931706bafb285becf1094466bc858cfc32d5e649af918c0125f1561f2f5e6`

Files:

- `screenshots/desktop-main.png`
- `screenshots/desktop-candidate.png`
- `screenshots/mobile-main.png`
- `screenshots/mobile-candidate.png`
- `comparisons/desktop-main-candidate.png`
- `comparisons/mobile-main-candidate.png`
- `browser-verification.json`
- `browser-qa.mjs`

The first harness attempt stopped before capture because the Playwright-managed browser binary was not installed. The retry used the existing system Chrome executable in headless mode. That retry then treated a Next.js speculative `_rsc` request aborted during context shutdown as a generic request failure. The final harness narrows the exception to the exact same-origin `_rsc` plus `net::ERR_ABORTED` shutdown case; all other request failures remain fatal. The final run passed.

## Corrected deployment contract

Architecture review rejected the first local draft because it built a Preview-semantics artifact and proposed promoting it unchanged. Product visibility differs by environment: Preview may admit staged/approved release records while Production requires released evidence. The corrected workflow therefore:

1. Runs only from canonical `main` behind the protected GitHub `Production` environment.
2. Pulls Production project settings and explicitly builds with Production commerce semantics and checkout UI disabled.
3. Uses `vercel deploy --prebuilt --prod --skip-domain` to create an immutable staged Production candidate without assigning any domain alias.
4. Proves the current Production deployment is unchanged before and after staging.
5. Requires the exact Production anchor recorded in the reviewed candidate receipt, then rechecks that anchor immediately before promotion; any drift stops before mutation.
6. Promotes that same deployment ID only after separate reviewer, metadata, main-SHA, explicit-enable, browser/UAT, and Product Owner gates.
7. Records the command attempt, inspects the live domain even if `vercel promote` reports failure or times out, then restores the captured prior Production deployment on any ambiguous command outcome, identity, metadata, smoke, or receipt failure.

`VERCEL_TOKEN` is injected only into the Vercel CLI capture/mutation steps that require it, after the repository verification gate. Checkout, dependency installation, tests, CLI installation, the application build, receipt-verifier, and route-smoke steps do not receive the token.

The promotion workflow writes a permission-restricted `.vercel/project.json` from protected organization/project identifiers instead of running `vercel pull`; it therefore does not download Production environment values merely to inspect or promote an existing deployment.

Candidate staging and Production promotion share one non-cancelling concurrency lock. The candidate workflow deletes the pulled `.vercel` directory before any third-party artifact-upload action can run.

No deployment workflow was dispatched while producing this evidence.

## Repository verification

- Frozen Yarn Classic 1.22.22 install: pass.
- Focused CI/CD plus tooling policy: 2 files / 22 tests pass.
- Full `yarn verify`: zero-warning lint; 37 files / 364 tests; zero production vulnerabilities across 55 audited packages; successful 13-route optimized build.
- Workflow syntax: all three YAML files parse; both Node receipt/rollback verifiers pass syntax validation.
- High-confidence changed-file secret scan: clean; only `${{ secrets.VERCEL_TOKEN }}` references exist.
- Foreign lockfiles: none.
- Protected runtime diff: none across `package.json`, `yarn.lock`, `public/`, `app/`, `components/`, `lib/`, `next.config.js`, and `vercel.json`.
- Visual proof: four checks pass and both same-viewport PNG pairs are byte-identical.
- Disposable local servers: ports 3124 and 3125 have no listener after QA. The unrelated pre-existing server on port 3001 was not touched.

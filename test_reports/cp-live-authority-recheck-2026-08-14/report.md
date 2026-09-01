# Live Git, Vercel, and Production authority recheck

Observed: 2026-08-14, read-only through Git/Vercel CLI and direct HTTP. No browser window was opened. No deployment, alias, domain, environment variable, catalog, checkout, order, Git branch, pull request, or Production state was changed.

## Canonical Git

- Canonical repository: `https://github.com/CubiqoUnited/carlophillips-site.git`
- `origin/main`: `cd1cd771fdd6d22e49d772acf8850599e2dad692`
- Local containment branch before this correction: `93442bec13b89d664db5b858d68b13b047addfa2`
- Branch relationship at observation: 20 branch-only commits and one remote-main merge commit not present locally
- The merge base corresponds to PR #9 head `f82733cae1db9683801fe8dd1c38fad19bb7cf43`.

## Verified Vercel identity

- CLI identity: `aditya-7307`
- Team: `aditya's projects` (`team_8ABMxicIAtMyzgNYsJawFad0`)
- Project: `carlophillips-site` (`prj_9VHD0AhhQnuml8frfNDsmFLHXcq1`)
- Runtime configuration observed: Node.js 24.x, project root `.`

## Latest READY Preview

- Deployment: `dpl_5GTRSMYWSodpHrCYoEvnB9DGGiZa`
- URL: `https://carlophillips-site-l7eiu8m3n-adityas-projects-261b17a9.vercel.app`
- Git commit: `f82733cae1db9683801fe8dd1c38fad19bb7cf43`
- Git branch: `codex/cp-v1-2-2-design-system-release`

This Preview does not contain the local fail-closed containment/admin branch and is not evidence for this candidate.

## Current READY Production

- Deployment: `dpl_2s61reh2JATSRMCYfXYHnFnXT2bH`
- URL: `https://carlophillips-site-eosfa22gl-adityas-projects-261b17a9.vercel.app`
- Aliases include the apex and `www` domains
- Git commit: `bb9568f46bd60b587f3fc16b82513ae5ea220026`
- Git branch: `codex/cp-runway-wording-design-system`

A fresh direct HTTP read of the live Signature Hoodie PDP still contained both `action="/api/checkout"` and `Continue to checkout`. The canonical local Product Release Record is Draft and has no current release-bound approval envelope. The Production authority defect therefore remains live.

## Decision

- Local fail-closed candidate: technically eligible for a separately authorized immutable Preview.
- Existing Preview: not candidate evidence.
- Production: NO-GO for release, promotion, or customer sales until containment and canonical release gates are separately approved and verified.
- Exact Preview-only authorization signal remains: `Approve CP fail-closed hotfix Preview only`.

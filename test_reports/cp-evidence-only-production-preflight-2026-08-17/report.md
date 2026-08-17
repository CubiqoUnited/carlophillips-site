# Evidence-only descendant Production preflight — 2026-08-17

## Authorization and scope

The Product Owner explicitly authorized: `Approve evidence-only descendant Production preflight`.

The correction removes an impossible self-reference: a release record cannot contain the SHA of the commit that contains that same updated record. It does not relax the selected-artifact rule. Protected workflows still require the requested SHA to equal checked-out canonical `main` `HEAD`.

## Implemented boundary

- The reviewed candidate and selected SHA must be full lowercase commit SHAs that exist in Git.
- The selected SHA must equal checked-out `HEAD`.
- A different selected SHA is accepted only when the candidate is its actual Git ancestor.
- Git rename detection is disabled so a forbidden deletion cannot be hidden as a rename into an allowed evidence path.
- Every endpoint difference must match an explicit allowlist of release/evidence records, status documents, QA reports and named release tests.
- Changed symlinks, malformed paths and path escapes are denied.
- Storefront, component, checkout, media registry/assets, workflow, script, configuration and theme changes are denied.
- Both Production workflows fetch complete history before running the verifier.

## Verification

- Focused tests: 3/3 files, 59/59 assertions passed.
- Full verification: design-system lint passed; ESLint passed with zero warnings; 51/51 test files and 532/532 assertions passed; zero vulnerabilities across 67 audited production packages; optimized Next.js build passed.
- Negative coverage: non-ancestor, missing candidate/selected commit, wrong HEAD, malformed/path escape, symlink, application, component, checkout, media manifest/assets, configuration, workflow, script and mismatched source-envelope denial.
- Real history check: candidate `4ee088cd39cfa9b967bde32893f0dc2a33325904` to selected evidence head `9754a6cf65de337b30bc30e03f97f073fdd151b2` is accepted with zero forbidden or symlink paths.
- Commerce result remains denied for the nine independent release, sample, approval, media, Production observation, rollback and operational-cart blockers.

## Visual regression

The preflight module is referenced only by the server-side verifier and tests; no storefront route imports it. A rebuilt closed local PDP was captured before and after at 1440×1000 and 390×844.

- Desktop before/after SHA-256: `e2257d89e50ca15a23eddb31b6bd5eead5d612ffbd5bdb2d053c06e9f89ad4b8` — exact byte match.
- Mobile before/after SHA-256: `50865b14feade5cef44d76a3d658cbd18f6615f106e045bd2dbb6c78611a4a24` — exact byte match.
- Both routes returned HTTP 200 with zero console/page errors, zero horizontal overflow, the fail-closed unavailable boundary visible, and no checkout action.
- Machine-readable evidence is in `visual-verification.json`; retained before/after captures are under `screenshots/`.

This local comparison is UI-regression evidence only. It is not represented as authenticated Shopify Staging evidence.

## External-state result

No workflow was dispatched. No PR was merged. No Vercel deployment or alias changed. No Shopify/Apliiq catalog, cart, checkout, payment, order, fulfillment or billing mutation occurred.

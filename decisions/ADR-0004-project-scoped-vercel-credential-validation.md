---
id: ADR-0004
title: Validate Vercel CI credentials against the exact configured project
owner: aarti
status: IMPLEMENTED — both gates approved; technical verification green; awaiting PR review, staging release, regression, and Pushpa UAT.
date: 2026-09-24
item: KAN-33
governing: work/items/KAN-33.md R-KAN33-1..4 and AC-KAN33-1..12
implementer: aarti
supersedes: the user-profile-first validation design in .github/scripts/verify-vercel-ci-token.mjs
---

# ADR-0004 — Project-scoped Vercel credential validation

## 1. Root cause

The current validator makes two sequential requests:

1. `GET /v2/user`, labelled `VERCEL_USER_AUTH`.
2. `GET /v9/projects/{VERCEL_PROJECT_ID}?teamId={VERCEL_ORG_ID}`, labelled
   `VERCEL_PROJECT_ACCESS`.

The first request is not a prerequisite for the deployment capability being
validated. A project-scoped credential can be authorised for the configured
project while being denied user- and team-level resources. The validator turns
that intentional least-privilege boundary into a hard failure, so it rejects a
credential before reaching the authoritative project-access check.

The prior protected run's `VERCEL_USER_AUTH_FAILED_404` therefore proves only
that the credential could not read the user resource. It does not prove that
the token was malformed, expired, revoked, or unable to deploy the configured
project.

This is a validator contract defect. It is not evidence of a bad replacement
secret and does not justify broadening the token.

## 2. Decision

Replace the user/team-oriented preflight with one fail-closed capability check:

`GET https://api.vercel.com/v9/projects/{encodeURIComponent(VERCEL_PROJECT_ID)}`

using `Authorization: Bearer <VERCEL_TOKEN>`, a 15-second timeout, and no
`teamId`, team slug, user endpoint, team endpoint, retry, or cached success.

Success requires all of the following in the current process invocation:

1. `VERCEL_TOKEN` is present and non-empty.
2. `VERCEL_PROJECT_ID` is present and non-empty.
3. The request completes before the timeout.
4. The response is HTTP success.
5. The body parses as JSON.
6. The body is an object whose `id` exactly equals `VERCEL_PROJECT_ID`.

Every other outcome fails before the existing install/build/deploy/alias/
receipt/UAT steps. `VERCEL_ORG_ID` remains required by the surrounding release
workflow and project-link verification, but it is not an input to credential
capability validation.

The success message will state only that the credential can access the exact
configured project. It will not claim account, team, deployment, alias,
regression, receipt, or UAT success.

## 3. Failure taxonomy and secret safety

The validator emits stable capability-specific codes without response bodies,
request headers, token values, or token substrings:

| Condition                         | Diagnostic                              |
| --------------------------------- | --------------------------------------- |
| Missing token                     | `VERCEL_TOKEN_REQUIRED`                 |
| Missing project id                | `VERCEL_PROJECT_ID_REQUIRED`            |
| HTTP 401                          | `VERCEL_PROJECT_AUTH_FAILED_401`        |
| HTTP 403/404 or other non-success | `VERCEL_PROJECT_ACCESS_FAILED_<status>` |
| Timeout/network failure           | `VERCEL_PROJECT_REQUEST_FAILED`         |
| Invalid JSON or non-object body   | `VERCEL_PROJECT_RESPONSE_INVALID`       |
| Missing or different project id   | `VERCEL_PROJECT_ID_MISMATCH`            |

The project id may appear in a mismatch diagnostic because it is configuration,
not secret material. Response bodies never appear in thrown messages. Tests use
sentinel credentials and assert that neither the full sentinel nor a reusable
fragment reaches stdout/stderr.

## 4. Options considered

### A — Exact project check without account/team context (chosen)

This directly proves the capability required by R-KAN33-1, permits least-
privilege project tokens, and provides an authoritative identity to compare.

### B — Keep `/v2/user`, tolerate 403/404, then check project (rejected)

This retains an unnecessary request and ambiguous network dependency. It also
normalises selected failures from an endpoint irrelevant to deployability.

### C — Require a broader team/account token (rejected)

This makes the credential conform to a defective validator by increasing blast
radius. It contradicts the project-scoped product rule.

### D — Treat any 2xx project response as success (rejected)

This cannot detect a malformed or mismatched response and violates the exact-
project and fail-closed criteria.

## 5. Implementation boundary

Change only:

- `.github/scripts/verify-vercel-ci-token.mjs`
- a dedicated test file for its observable process/network contract
- the existing CI policy assertion that currently mandates `/v2/user` and
  `teamId=`

No workflow ordering, permissions, environment protection, timer, release tuple,
cleanup flag, visual-baseline flag, build, deployment, alias, receipt, regression,
UAT, or production behaviour changes. The same script remains before expensive
steps in all workflows that already invoke it.

## 6. Test design and acceptance trace

The script stays executable as a child process. Tests inject a local `fetch`
stub through a Node preload module and inspect exit code, requested URL, stdout,
and stderr. This avoids exporting production-only internals or making live
Vercel calls.

| Test                                                                                           | Criteria               |
| ---------------------------------------------------------------------------------------------- | ---------------------- |
| Exact project response succeeds; only one URL requested                                        | AC-1, AC-2, AC-3, AC-4 |
| Different id and absent id fail                                                                | AC-2, AC-7, AC-8       |
| Missing/empty token fails before fetch                                                         | AC-5                   |
| 401 fails as authentication failure                                                            | AC-6, AC-9             |
| 403/404 and wrong-project access fail                                                          | AC-7, AC-9             |
| 500, timeout/network error, invalid JSON, null/array body fail                                 | AC-8                   |
| Sentinel token and fragments absent from all output                                            | AC-9                   |
| Policy assertions retain validator placement before expensive steps and prove no user/team URL | AC-3, AC-4, AC-5..10   |

AC-11 and AC-12 cannot be closed by unit tests. They require Sushma's fresh
protected staging run at the exact governed SHA, immutable receipt and green
regression, followed by Pushpa's independent UAT.

## 7. Rollback and observability

Rollback is a revert of the implementation commit before rerunning the protected
lane. No persistent data is changed by the validator.

The protected run log is the operational evidence. It must show the stable
success line and advance to the next workflow step, or show exactly one
secret-safe failure code and stop before downstream side effects. A run log is
reviewed for token leakage before retention.

## 8. Approval gates

### Pushpa product-fit

**APPROVED — product-fit gate cleared.**

Date: 2026-09-24. Reviewer: Pushpa (Product / Acceptance / UAT). This verdict
approves expected behaviour and acceptance coverage; it does not approve a
particular code implementation or claim staging/UAT evidence exists.

- **R-KAN33-1 and AC-KAN33-1..4 — SATISFIED.** §2 checks the exact configured
  project in one request, removes `/v2/user`, `teamId`, team slug and all user or
  team endpoints, and rejects broadening the token in §4. A project-scoped token
  denied user/team access can pass only by proving access to the configured
  project.
- **R-KAN33-2 and AC-KAN33-5..8 — SATISFIED.** §2 requires token, project id,
  timely HTTP success, valid object JSON and an exact id match. §3 fails closed
  for missing input, authentication denial, access denial, timeout/network
  error, invalid response and mismatch. §6 supplies positive and negative test
  coverage, including fail-before-fetch for missing input and policy assertions
  preserving placement before expensive steps.
- **R-KAN33-3 and AC-KAN33-10..12 — SATISFIED AS DESIGN; OPERATIONAL PROOF
  PENDING.** §2 limits the success claim to configured-project access. §5 changes
  no workflow ordering, protection, timer, release tuple, cleanup, baselines,
  build, deploy, alias, receipt, regression, UAT or production behaviour. §6
  correctly reserves AC-KAN33-11 and AC-KAN33-12 for a fresh protected staging
  run and independent Pushpa UAT. They cannot close from this approval.
- **R-KAN33-4 and AC-KAN33-9 — SATISFIED.** §3 prohibits response bodies,
  headers, token values and substrings in diagnostics; §6 requires sentinel and
  fragment non-disclosure assertions; §7 requires run-log leakage review before
  retention.

No product-fit changes requested. Sushma's readiness gate remains mandatory
before build. Pushpa returns after the fresh protected staging run to grade the
deployed artifact, immutable receipt, full regression and exact-SHA evidence
against AC-KAN33-11 and AC-KAN33-12.

### Sushma readiness

**APPROVED — solution-readiness gate cleared.**

Date: 2026-09-24. Reviewer: Sushma (Delivery / Release). The plan is isolated
on `/Users/edv/Developer/cp-worktrees/kan-33` from `github/staging` `65e8e50`;
its boundary is limited to the validator, dedicated tests, and the existing
policy assertion. Exact-project identity and stable fail-closed diagnostics are
testable and observable. Rollback is a pre-release revert. Protected ordering,
environment gates and timers, `cleanup=false`, `update_visual_baselines=false`,
receipt, regression, and independent Pushpa UAT remain unchanged. Production is
out of scope.

Both approval gates are recorded as APPROVED. BUILD is authorised.

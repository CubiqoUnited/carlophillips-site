---
id: ADR-0004
title: Validate the exact Vercel project before the approved team-scoped CLI pipeline
owner: aarti
status: REVISION 2 PROPOSED — exact-project validator remains implemented; Pushpa solution consensus approved; awaiting Sushma revision-readiness and protected-secret rotation before rerun.
date: 2026-09-24
item: KAN-33
governing: work/items/KAN-33.md Revision 2, including amended R-KAN33-1, AC-KAN33-1A/1B, AC-KAN33-3A/4A, and AC-KAN33-13..15
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

## 9. Revision 2 — complete CLI-pipeline credential contract (controlling)

Date: 2026-09-25. Trigger: protected Staging run
[`36098244788`](https://github.com/CubiqoUnited/carlophillips-site/actions/runs/36098244788).

This section supersedes §§1, 2, 4, 6, and 8 only where those sections describe
a project-only token as sufficient for the **complete release pipeline**. The
implemented exact-project validator, its failure taxonomy, its tests, and its
position before expensive work remain unchanged.

### 9.1 Operational RCA

Run `36098244788` established two separate facts in sequence:

1. The custom validator passed against the configured project and repository
   verification completed successfully. The validator now proves the capability
   it claims without requiring user/team-profile access.
2. Pinned Vercel CLI `56.1.0` then failed at `vercel pull --scope` with
   `Not able to load user ... User not found (404)`. Build, deploy, inspect,
   alias, receipt, regression, and UAT did not run.

Primary CLI source at tag `vercel@56.1.0` explains the behavior:

- `packages/cli/src/index.ts` resolves every explicit `--scope` by calling
  `getUser()` and then loading teams before dispatching `pull`, `deploy`,
  `inspect`, `list`, or `alias`.
- Removing `--scope` does not make the lane project-only. `pull` calls
  `ensureLink()`; `getLinkedProject()` concurrently resolves the linked org via
  `/teams/{VERCEL_ORG_ID}` and the project via
  `/v9/projects/{VERCEL_PROJECT_ID}`.
- Pre-writing `.vercel/project.json` selects the link but still follows that
  org/project resolution path.
- `deploy --prebuilt` also calls `ensureLink()` before reading the prebuilt
  output, so it has the same org-resolution requirement.

The current published CLI (`60.0.1` at investigation time) is not an evidenced
repair. Its published source still user-resolves explicit scopes. Its app-token
fallback is feature-flagged and applies to `NOT_AUTHORIZED`; the protected run
observed a 404 for this project-only token. Upgrading merely to test a theory
would weaken the pinned-tool control and is rejected.

### 9.2 Revised decision

The complete approved staging lane uses a **classic Vercel token scoped to the
exact Cubiqo team that owns `VERCEL_PROJECT_ID`**. This is the least-privilege
credential class evidenced to support the existing Vercel CLI sequence.

The custom validator remains intentionally narrower and first:

`GET https://api.vercel.com/v9/projects/{VERCEL_PROJECT_ID}`

It must still return the exact configured project id before repository
verification or any Vercel CLI action. Team-level CLI capability supplements
this project assertion; it never replaces it. A broad token that cannot access
the exact configured project still fails closed.

No source or workflow architecture change is required by Revision 2. In
particular:

- keep Vercel CLI pinned at `56.1.0`;
- keep `--scope="$VERCEL_SCOPE"` and the existing `VERCEL_ORG_ID`/project-link
  checks;
- keep `vercel pull`, local prebuilt build/deploy, inspect, list, curl, and alias
  operations unchanged;
- do not introduce a raw REST deployment implementation under KAN-33;
- do not use or modify Production.

The remaining mutation is external configuration: Boss replaces the protected
Staging `VERCEL_TOKEN` with the exact-team-scoped classic token. Its value is
never recorded. Sushma then reruns the canonical workflow with catalogue cleanup
and visual-baseline updates both false.

### 9.3 Alternatives re-evaluated

| Option                                                | Disposition           | Evidence                                                                                                                          |
| ----------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Remove `--scope`                                      | Rejected              | Avoids only the top-level lookup; link resolution still reads the owning team and project.                                        |
| Pre-link `.vercel/project.json`                       | Rejected              | Selects ids but does not bypass `getLinkedProject()` org resolution.                                                              |
| Upgrade the CLI                                       | Rejected              | No primary-source evidence that the observed 404 becomes a supported project-token path; it also changes the pinned release tool. |
| Replace CLI operations with raw REST                  | Rejected under KAN-33 | Would replace pull/build/deploy/inspect/list/alias semantics and needs a separate ADR and release proof.                          |
| Exact-team classic token plus exact-project preflight | Chosen                | Preserves the approved CLI architecture while keeping project identity fail-closed.                                               |

### 9.4 Revised acceptance and evidence

The controlling product criteria are `work/items/KAN-33.md` Revision 2:

- AC-KAN33-1A/1B: supported exact-team classic credential plus exact-project
  match;
- AC-KAN33-3A/4A: the custom validator stays free of user/team endpoints while
  the CLI may perform its required constrained team resolution;
- AC-KAN33-13/14: no architecture substitution, no secret exposure, protected
  Staging only;
- AC-KAN33-15: only a full green protected run proves acceptance.

The earlier 15 validator tests remain correct because they test the custom
validator's deliberately narrow contract. No test may relabel their success as
proof that the downstream CLI can run. Operational acceptance requires a fresh
exact-SHA run in which validation, `pull`, prebuilt build/deploy, inspect, alias,
full regression, immutable receipt, and Pushpa UAT all succeed.

### 9.5 Revision approvals

#### Pushpa solution consensus — APPROVED

Recorded 2026-09-25 in `work/items/KAN-33.md` Revision 2 and
`state/signals/2026-09-25/kan-33-pushpa-solution-consensus-revision.md`. Pushpa
approved the exact-team classic credential for the unchanged CLI lane, retained
the exact-project validator, and rejected a raw REST rewrite under KAN-33.

#### Sushma revision readiness — PENDING

Sushma must confirm that this is a configuration-only recovery with unchanged
workflow architecture and release controls, that the protected secret rotation
is the exact remaining external action, and that the next run remains Staging-
only with cleanup and visual-baseline updates false.

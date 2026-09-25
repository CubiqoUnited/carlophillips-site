# KAN-33 — Accept project-scoped Vercel credentials without weakening the deployment gate

Owner of this document: Pushpa (product definition, acceptance, UAT)
Written 2026-09-24. Workflow unit: PO_DEFINE.

## Evidence status and boundary

Reported to Pushpa by Sushma/The Hand and accepted as the governed defect context:

- The protected staging workflow validates `VERCEL_TOKEN` by calling Vercel's
  user-profile endpoint before checking the configured project.
- The Boss supplied a Vercel token scoped to the Cubiqo `carlophillips` project.
- Vercel's current token contract permits a project-scoped token to use the CLI
  and REST API for that project, while user-level and team-level resources are
  outside that token's scope.
- The prior protected run failed at the user-profile call with
  `VERCEL_USER_AUTH_FAILED_404`; it never reached build or deployment.

Pushpa has not handled, read, or inspected the credential value. No credential
value belongs in this artifact or its evidence.

This document defines expected behaviour only. Endpoint choice, response
parsing, script structure, and test implementation belong to Aarti's ADR.

## Product rule

**R-KAN33-1.** A Vercel credential is acceptable for the staging release lane
when it can authenticate to Vercel and access the one configured Vercel project
the lane is authorised to deploy. Access to a Vercel user profile, account-wide
resources, unrelated teams, or unrelated projects is not required and must not
be used as a proxy for deployability.

**R-KAN33-2.** The credential gate remains fail-closed. It must reject an absent,
empty, malformed, expired, revoked, or wrong-project credential before expensive
verification, build, deployment, alias mutation, receipt generation, or UAT.

**R-KAN33-3.** Passing credential validation proves only access to the configured
project. It does not prove a deployment occurred, an alias moved, regression
passed, or UAT passed; those existing gates remain separate and unchanged.

**R-KAN33-4.** The validator and its evidence must never expose the token or a
useful fragment of it. A failure may identify the failed capability and the
configured project identifier, but not secret material.

## Acceptance criteria

- **AC-KAN33-1 — valid project scope passes.** Given a valid token scoped only to
  the configured `VERCEL_PROJECT_ID`, credential validation succeeds even when
  that token cannot read Vercel user-profile or team-level resources.
  Evidence: automated test of the project-scoped response contract plus one
  protected staging run reaching the next workflow step.

- **AC-KAN33-2 — project identity is asserted.** Success requires the Vercel
  resource returned by the authoritative project-access check to identify the
  exact configured `VERCEL_PROJECT_ID`. A successful response for a different
  project is a failure.
  Evidence: positive exact-match test and wrong-project negative test.

- **AC-KAN33-3 — no user-profile dependency.** The validation path does not call,
  require, or infer success from a user-profile endpoint. A project-scoped token
  denied user-profile access remains eligible to pass AC-KAN33-1 and AC-KAN33-2.
  Evidence: test that fails if a user-profile request is attempted.

- **AC-KAN33-4 — no team-profile dependency.** Validation does not require access
  to a team listing or team profile. Project access may be checked using the
  configured project identifier and the token's own scope; lack of broader team
  access is not itself a failure.
  Evidence: project-scoped fixture with team/account endpoints denied.

- **AC-KAN33-5 — missing token fails before side effects.** An unset or empty
  `VERCEL_TOKEN` fails with a stable, capability-specific error before build,
  deploy, alias, receipt, or UAT steps execute.
  Evidence: negative workflow/script test with all downstream side effects
  asserted absent.

- **AC-KAN33-6 — invalid or expired token fails before side effects.** A token
  Vercel rejects for authentication fails closed before every downstream side
  effect named in AC-KAN33-5.
  Evidence: rejected-auth fixture and downstream non-execution assertions.

- **AC-KAN33-7 — wrong-project token fails before side effects.** A valid Vercel
  token that cannot access the configured project, or can access only a different
  project, fails closed before every downstream side effect named in AC-KAN33-5.
  Evidence: inaccessible-project and mismatched-project fixtures.

- **AC-KAN33-8 — transient or malformed responses do not pass.** Network errors,
  timeouts, non-success status codes, malformed JSON, and responses without an
  exact project identity all fail closed; none are rounded to success.
  Evidence: one automated negative test per response class.

- **AC-KAN33-9 — secret-safe diagnostics.** Test output and a protected staging
  run log contain no token and no reusable token fragment. Diagnostics state the
  capability that failed and distinguish authentication failure, configured-
  project denial, project mismatch, and invalid response.
  Evidence: log redaction assertion plus review of the protected run log.

- **AC-KAN33-10 — existing release controls survive.** The change does not bypass
  exact-SHA/release-tuple checks, protected Staging environment gates or timers,
  `cleanup=false`, `update_visual_baselines=false`, build/regression, immutable
  receipt verification, or Pushpa UAT. Production remains untouched.
  Evidence: workflow diff review and protected staging run record.

- **AC-KAN33-11 — staging proof is end-to-end.** The item is not accepted merely
  because the validator unit tests pass. The exact approved staging commit must
  pass credential validation, build, deploy, alias verification, full regression,
  and immutable receipt verification before it reaches Pushpa UAT.
  Evidence: one run URL/id tied to the exact SHA and release id, with every named
  stage green and the receipt retained.

- **AC-KAN33-12 — UAT gate remains independent.** Pushpa signs off only after the
  deployed staging artifact and receipt identify the exact approved SHA and the
  governed staging regression is green. A validator pass alone cannot satisfy
  UAT or close KAN-33.
  Evidence: dated Pushpa UAT signal referencing the run, deployment, receipt, and
  regression evidence.

## Edge and negative cases

1. Token is valid but scoped to an unrelated project: fail.
2. Token accesses the configured project but receives 403/404 from `/v2/user`:
   pass credential validation; the profile result is irrelevant and should not
   be requested.
3. Token authenticates but the project response names a different id: fail.
4. Token authenticates and the project response omits identity: fail.
5. Project response is cached, stale, malformed, or timed out: fail; never reuse
   a prior run's success.
6. Error output accidentally includes an Authorization header or token fragment:
   fail the test suite and do not retain or publish that log.
7. Credential check passes but deployment later fails: KAN-33's validator
   behaviour may be correct, but staging/UAT remains not green and the release
   stays open.

## PO_DEFINE disposition

READY_FOR_RCA. The expected behaviour is now unambiguous: validate the capability
the release actually needs — access to the exact configured project — and retain
fail-closed handling for every missing, invalid, ambiguous, or wrong-project
case. Aarti owns root-cause confirmation, the ADR, implementation, and technical
tests. Pushpa returns for product-fit on the ADR and for staging UAT only.

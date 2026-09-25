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

---

## Revision 2 — 2026-09-25: full-pipeline credential ruling after protected run 36098244788

### New verified boundary

The original definition described the REST validator correctly but described the
release credential too narrowly.

- Run `36098244788` proved the repaired exact-project REST validator works: it
  passed against the project-scoped token, and repository verification passed.
- The same protected run then failed at pinned Vercel CLI `56.1.0` during
  `vercel pull --scope`, because the CLI loads `/v2/user` while resolving its
  user/team context.
- Aarti's follow-on RCA against primary CLI source found that removing `--scope`
  or pre-linking does not remove the dependency: `pull`, `deploy`, `inspect`, and
  `alias` still resolve team/org context. The latest CLI available in the RCA
  provides no evidence that a project-only token can execute the approved
  prebuilt release pipeline.
- Replacing those CLI operations with raw REST calls is not a credential repair.
  It is a different release architecture and would require a new ADR, build,
  regression plan, rollback plan, and release proof.

The protected run therefore disproves **AC-KAN33-1 as a credential requirement
for the complete pipeline**. It does not disprove the exact-project validator or
its tests; those are useful fail-closed controls, but they cannot by themselves
prove the CLI can execute.

### Product ruling

**R-KAN33-1 is amended.** The staging release credential MUST use the least-
privilege credential class that the complete approved Vercel CLI pipeline
actually supports. For the current pipeline, that class is a **team-scoped
classic Vercel token for the exact Cubiqo team that owns the configured
`VERCEL_PROJECT_ID`**. A project-only token is insufficient for this pipeline and
must not be represented as release-capable merely because the REST preflight
passes.

The larger raw-REST deployment redesign is **not authorised under KAN-33**. The
release architecture remains the approved prebuilt Vercel CLI path. If a future
item proposes removing the team-scoped credential requirement, it must treat the
REST rewrite as a new architecture and pass the full governed ADR/build/staging
sequence independently.

### Amended acceptance criteria

- **AC-KAN33-1A — supported credential class.** The protected Staging
  `VERCEL_TOKEN` is a classic token scoped to the exact configured Cubiqo team,
  and the full pinned-CLI pipeline can use it. A project-only token is not an
  acceptable production-like release credential for this pipeline.
- **AC-KAN33-1B — exact project remains mandatory.** The repaired REST preflight
  must still retrieve and exactly match `VERCEL_PROJECT_ID`. Team-level access
  does not permit deploying an arbitrary project, and a broad account/team check
  cannot replace the exact-project assertion.
- **AC-KAN33-3A — user lookup is an operational dependency, not the acceptance
  target.** The custom validator must not reintroduce `/v2/user`; however, the
  Vercel CLI may perform the user/team resolution its supported pipeline
  requires. The credential is accepted only when the subsequent CLI operations
  actually succeed.
- **AC-KAN33-4A — team context is constrained.** The configured
  `VERCEL_ORG_ID`/scope must identify the exact team that owns the configured
  project. A token capable of resolving an unrelated team, without access to the
  exact configured project, fails under AC-KAN33-1B.
- **AC-KAN33-13 — no architecture substitution.** KAN-33 may change the
  credential class and retain the repaired REST preflight; it may not replace
  `vercel pull`, prebuilt build/deploy, inspect, or alias operations with raw REST
  implementations.
- **AC-KAN33-14 — protected containment.** The token remains only in the protected
  Staging environment secret, is never printed or persisted in an artifact, and
  receives no production use under this item. Rotation/expiry follows the
  credential record without recording the value.
- **AC-KAN33-15 — operational proof supersedes preflight proof.** Acceptance now
  requires one fresh protected run in which exact-project REST validation,
  `vercel pull`, prebuilt build/deploy, inspect, alias, regression, immutable
  receipt, and Pushpa UAT all succeed for the exact approved SHA. A green REST
  preflight followed by CLI failure is a failed KAN-33 run.

All original criteria remain in force except where explicitly amended above:
AC-KAN33-1 is replaced by AC-KAN33-1A/1B; AC-KAN33-3 and AC-KAN33-4 continue to
govern the custom validator but no longer prohibit the Vercel CLI's own required
user/team resolution. AC-KAN33-2 and AC-KAN33-5..12 remain unchanged.

### SOLUTION_CONSENSUS revision

**APPROVED:** retain ADR-0004's exact-project REST validator as the first
fail-closed check, keep the approved prebuilt Vercel CLI release architecture,
and use the least-privilege supported credential class: an exact-team-scoped
classic token. **NOT APPROVED:** a raw REST rewrite of pull/deploy/inspect/alias
under KAN-33.

This ruling changes credential acceptance, not code architecture. No production
action is authorised. Pushpa returns for UAT only after AC-KAN33-15 is green.

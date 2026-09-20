---
id: ADR-0002
title: Report Vercel deployments to the Jira Deployments API
owner: aarti
status: PROPOSED — C1-C4 written into the normative body (rev 2, 2026-09-19). Pushpa product-fit gate PASSED with C1-C4 required and now incorporated (§4.1, §4.2, §8.6, §10). Awaiting Sushma readiness gate. No build authorised; implementer is Sushma per §9.
date: 2026-09-19
item: KAN-11
governing: AGENT_COMMUNICATION_PROTOCOL Rule 9a (Jira tied push-to-deploy), Rule 8 (delivery proven by remote SHA), D-014 (launch posture)
implementer: sushma — `.github/workflows/**` and `.github/scripts/**` are the deployment lane and Aarti is denied writes there (see §9)
supersedes: nothing
verification: API shape verified against developer.atlassian.com on 2026-09-19. Workflow facts verified by reading the three files at HEAD on branch KAN-3-tightening-agents-access. No Jira tenant, cloud ID or credential was available in this session — everything tenant-side is marked ASSUMPTION.
---

# ADR-0002 — Jira deployment events from the three Vercel workflows

Scope: **the deploy leg only.** Push, branch, commit, PR and merge linkage is delivered by
the Jira GitHub app once Boss installs it, and requires no code in this repository. Nothing
below duplicates that.

---

## 1. Correction to the dispatch premise — VERIFIED

The dispatch stated the three workflows "handle GitHub Deployments today". **They do not.**

- No workflow calls the GitHub Deployments API. `grep -n 'createDeployment\|deployment_status\|actions/github' .github/workflows/*.yml` returns zero matches for any deployment-creating call.
- None of the three grants `deployments: write`. The permission blocks are `actions: read, contents: read, pull-requests: read` — `.github/workflows/vercel-production.yml:39-42`, `.github/workflows/vercel-staging.yml:29-32`, `.github/workflows/vercel-preview.yml:28-31`.
- What each *does* use is a GitHub **Environment** (`Production`/`Staging`/`Preview`), which is a protection-and-approval construct, not a Deployments API record: `.github/workflows/vercel-production.yml:53-55`, `.github/workflows/vercel-staging.yml:44-46`, `.github/workflows/vercel-preview.yml:43`.

**Consequence, and it is the central design consequence of this ADR:** the Jira GitHub app
cannot infer our deployments from GitHub Deployments, because none exist. The reporting step
specified here is not optional garnish — without it the deploy leg of Rule 9a has no carrier
at all.

Two ways forward. This ADR takes the first and records the second.

- **Chosen — post directly to the Jira Deployments API.** One self-contained step per workflow. No dependency on what the Jira GitHub app does or does not infer.
- **Rejected for now — create GitHub Deployments and let the Jira GitHub app harvest them.** Cheaper to write, but it requires widening `permissions` to `deployments: write` in all three release workflows, and its Jira behaviour is undocumented from here. Widening a permission on the production promotion workflow to gain instrumentation is the wrong trade. Revisit only if §3 proves unworkable.

---

## 2. The API — VERIFIED shape, ASSUMED tenant values

### 2.1 Verified (developer.atlassian.com, read 2026-09-19)

- Endpoint, documentation form: `POST /rest/deployments/0.1/bulk`.
- Endpoint, **OAuth 2.0 form we must use**: `POST https://api.atlassian.com/jira/deployments/0.1/cloud/{cloudId}/bulk`. The docs state the translation explicitly: "`POST /rest/builds/0.1/bulk` translates to `POST https://api.atlassian.com/jira/builds/0.1/cloud/<cloud ID>/bulk`".
- Scope required: `write:deployment-info:jira`.
- **Auth is NOT a Jira API token.** It is OAuth 2.0 2LO, JWT-bearer/client-credentials: `POST https://api.atlassian.com/oauth/token` with `{"audience":"api.atlassian.com","grant_type":"client_credentials","client_id":…,"client_secret":…}`, returning a bearer token. Docs: token "expires after a period of time… set to 15 minutes". A single-call CI step never needs to refresh it.
- Credentials are created by a **site admin** under Jira → OAuth credentials for self-hosted/on-premises tools, and are granted the deployments permission explicitly. They are system-to-system and not bound to the admin's account.
- Cloud ID is obtained from `https://<site>.atlassian.net/_edge/tenant_info`.
- Identity of a deployment record is the triple `pipelineId` + `environmentId` + `deploymentSequenceNumber`. Re-posting the same triple **replaces** the record only if the incoming `updateSequenceNumber` is greater than the stored one.
- Response is `202 Accepted` with body `{acceptedDeployments[], rejectedDeployments[], unknownIssueKeys[], unknownAssociations[]}`. Submission is asynchronous.
- **A 202 does not mean Jira accepted your issue keys.** Keys Jira does not recognise come back in `unknownIssueKeys` inside a 202. Any test that asserts only on HTTP status is worthless — see §6.
- Payload fields confirmed present in the documented request: `deploymentSequenceNumber`, `updateSequenceNumber`, `issueKeys[]`, `associations[]`, `displayName`, `url`, `description`, `lastUpdated`, `label`, `duration`, `state`, `pipeline{id,displayName,url}`, `environment{id,displayName,type}`, `schemaVersion: "1.0"`, plus top-level `properties{}` and `providerMetadata{product}`. `"state": "in_progress"` appears in the documented example, so that literal is verified.

### 2.2 ASSUMPTION — must be confirmed before build

- The full `state` enum is assumed to be `unknown | pending | in_progress | cancelled | failed | rolled_back | successful`. Only `in_progress` is verified. **Verification step, cheap:** post one record with `"state":"successful"` and read `rejectedDeployments` in the 202 body; a bad enum is rejected there, not by a non-2xx.
- The `environment.type` enum is assumed to be `unmapped | development | testing | staging | production`. Same verification method.
- Jira site hostname, cloud ID, and that the project key is `KAN`, are all assumed. Boss supplies.

---

## 3. What each workflow reports, and exactly where

### 3.1 The release moment — VERIFIED `file:line`

| Workflow | The moment the artifact becomes live | Identity available at that point |
|---|---|---|
| Production | `Promote exact candidate`, step id `promotion`, `.github/workflows/vercel-production.yml:173-179` (`vercel promote`), proven live by `verification` at `:181` | `inputs.candidate_deployment`, `inputs.expected_sha`, `production-after.json` written at `:188` |
| Staging | `Deploy without aliases`, step id `staging`, `.github/workflows/vercel-staging.yml:157-179`, becomes reachable at `Assign protected Staging domain` `:208-212` | `steps.staging.outputs.url` (`:179`), `inputs.expected_sha`, `staging-inspect.json` (`:186`) |
| Preview | `Deploy PR Preview without shared Staging alias`, step id `preview`, `.github/workflows/vercel-preview.yml:151-176` | `steps.preview.outputs.url` (`:176`), `preview-inspect.json` (`:183`) |

**Do not hang the post on those steps.** Post once, at the end, with the real outcome known.
Each workflow already has a terminal `if: always()` region that is the correct anchor:

- Production — insert immediately **before** `- name: Require complete successful promotion` at `.github/workflows/vercel-production.yml:259`. That placement matters: `:259-265` is the step that fails the job, and `always()` on our step is not enough if it sits after a step that aborts the job. Placing it before `:259` means it runs on the success path and, with `if: always()`, on the failure path too.
- Staging — insert immediately **before** the terminal `- uses: actions/upload-artifact@v4` at `.github/workflows/vercel-staging.yml:287`.
- Preview — insert immediately **before** `- name: Upload immutable Preview receipt` at `.github/workflows/vercel-preview.yml:250`.

The second `verify-existing-preview` job (`.github/workflows/vercel-preview.yml:268`) creates
nothing and **must not** post. It re-tests an existing Preview URL.

### 3.2 Field mapping

| Jira field | Production | Staging | Preview |
|---|---|---|---|
| `pipeline.id` | `carlophillips-production` | `carlophillips-staging` | `carlophillips-preview` |
| `pipeline.displayName` | `Vercel Production Promotion` | `Protected Vercel Staging` | `Vercel Preview Review` |
| `pipeline.url` | run URL `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}` | same | same |
| `environment.id` / `displayName` | `production` / `Production` | `staging` / `Staging` | `preview-pr-<n>` / `Preview PR #<n>` |
| `environment.type` | `production` | `staging` | `testing` |
| `deploymentSequenceNumber` | `GITHUB_RUN_NUMBER` | `GITHUB_RUN_NUMBER` | `GITHUB_RUN_NUMBER` |
| `updateSequenceNumber` | `GITHUB_RUN_ATTEMPT` (integer) | same | same |
| `state` | mapped, §3.4 | mapped | mapped |
| `url` | `https://www.carlophillips.com` | `https://staging.carlophillips.com` | the immutable Preview URL |
| `label` | `inputs.release` | `inputs.release` | `inputs.release` |
| `displayName` | `Production <release> <sha7>` | `Staging <release> <sha7>` | `Preview PR#<n> <sha7>` |
| `description` | Vercel deployment ID + SHA + run URL | same | same |
| `lastUpdated` | ISO-8601 UTC at post time | same | same |
| `issueKeys` | §3.3 | §3.3 | §3.3 |

Both the **released SHA** and the **Vercel deployment ID** are required by the dispatch and
neither has a first-class Jira field. Carry them in `description` (human-readable in the Jira
issue) **and** in top-level `properties` as `{"commit":"<sha40>","vercelDeploymentId":"<dpl_…>","runId":"<id>"}`,
which is machine-queryable via `bulkByProperties`. Source of the Vercel ID, never re-derived:
production `production-after.json` written at `vercel-production.yml:188`; staging
`staging-inspect.json` at `vercel-staging.yml:186`; preview `preview-inspect.json` at
`vercel-preview.yml:183`. Read `.id`, falling back to `.originalDeploymentId` — the production
workflow already treats those as interchangeable identity at `vercel-production.yml:193`.

This satisfies Rule 8: the Jira record carries the SHA that CI actually ran on, not a local one.

### 3.3 Issue key resolution — and the warn-not-fail rule

Regex, applied case-insensitively then upper-cased: `[A-Z][A-Z0-9]+-[0-9]+`. Deduplicate.

**These workflows are all `workflow_dispatch`** (`vercel-production.yml:4`, `vercel-staging.yml:4`,
`vercel-preview.yml:4`), so they run from a ref that may carry no key at all — production runs
from `main`. `GITHUB_REF_NAME` alone is therefore insufficient. Sources, in order, union of all
that resolve:

1. The PR title **and** head branch of the bound PR(s), via `gh api`. The existing
   `pull-requests: read` permission already covers this — no permission widening.
   - Production: `inputs.source_pr` (`vercel-production.yml:26-28`) and `inputs.production_pr` (`:29-31`).
   - Staging: `inputs.pr_number` (`vercel-staging.yml:6-9`). The workflow already fetches PR JSON to `staging-pr.json` (uploaded at `:292`) — reuse it, do not re-fetch.
   - Preview: `inputs.pull_request` (`vercel-preview.yml:10-13`). Already fetched to `pull-request.json` (`:259`).
2. `GITHUB_REF_NAME`.
3. `inputs.release`.

If the union is empty: **warn and post nothing.** Write a line to `$GITHUB_STEP_SUMMARY`
("Jira deployment not reported: no issue key resolvable from PR #n / branch / release"), exit
0. Do not post a keyless record — Jira rejects it, and a rejected post is a worse record than
no post. **This never fails the job.**

### 3.4 Outcome mapping — the record must be able to say "it broke"

An instrumentation step that only reports successes is a log of good news, not evidence.

- Production: `successful` when `steps.promotion.outcome == 'success' && steps.verification.outcome == 'success' && steps.receipt.outcome == 'success'`; `rolled_back` when the restore step at `vercel-production.yml:236` ran and the anchor check at `:244` succeeded; `failed` otherwise. Note `promotion` and `verification` carry `continue-on-error: true` (`:175`, `:180`), so their outcomes are readable at the end of the job — this is why the anchor in §3.1 works.
- Staging: `successful` if every prior step succeeded, else `failed`.
- Preview: same as staging.
- `cancelled` when `job.status == 'cancelled'`.

---

## 4. Failure posture — NON-NEGOTIABLE

**A failed Jira post must never fail a release.** Reporting is instrumentation; the release path
does not depend on it.

Enforced by four independent mechanisms, not one:

1. `continue-on-error: true` on the step.
2. `if: always()` on the step.
3. The script itself is total: every network call, JSON parse and file read is wrapped; the process exits `0` on every path including auth failure, non-2xx, timeout, and malformed response.
4. Hard timeouts — 10s connect, 20s total, per call, both for the token call and the bulk call. No retry beyond one. A hung Jira must not extend a production promotion.

**Structural guarantee, and it is the strongest of the four:** the step is placed *after* every
gate and *before only* the artifact upload. In production it sits before `:259`, whose own
`test` assertions are what decide the job. Our step cannot influence those assertions because
it writes no step outcome they read. Nothing downstream reads our step's outcome — Sushma must
verify that at review, because a future `if:` referencing our step id would silently break this
guarantee.

Every failure path writes a visible line to `$GITHUB_STEP_SUMMARY`. A silent no-op is not
acceptable — it would let the Rule 9a chain rot unnoticed.

### 4.1 The summary line GRADES, it does not print — NORMATIVE (C1)

Adopted from the Pushpa product-fit gate, §12.3 C1. This is a requirement of the step, not a
presentation preference.

The step writes **exactly one** of these two lines to `$GITHUB_STEP_SUMMARY`. The wording is
fixed so it can be grepped and so no reader has to interpret a JSON dump:

- `JIRA DEPLOYMENT REPORTED — <env> <state> — keys: <KEY[,KEY...]>` — only when §12.2 1-5 all hold.
- `JIRA DEPLOYMENT NOT REPORTED — <reason>` — in **every** other case.

`NOT REPORTED` explicitly includes: a 202 carrying a non-empty `unknownIssueKeys`; a 202
carrying a non-empty `rejectedDeployments`; auth failure; timeout; unparseable response; and
no resolvable issue key.

**A 202 carrying unknown keys is NOT REPORTED.** It must never be summarised as a success
because the HTTP call succeeded. Raw counts may be printed underneath; they are not the line
a human reads.

This is the same defect class as R-7: a mechanism that reports success while the record it was
meant to create does not exist is a green light over a gap.

### 4.2 Enablement preconditions — NORMATIVE (C2, C3)

- **C2 — enum proof gates enablement.** §2.2 flags the `state` and `environment.type` enums as
  ASSUMPTIONS and §6 T2 closes them. That ordering is now **binding**: **T2 PASS is a
  precondition of setting `CP_JIRA_DEPLOY_REPORTING=true` on any environment.** A bad enum is
  rejected inside a 202 via `rejectedDeployments`, never by a non-2xx. Without §4.1 that is
  invisible; with §4.1 it is visible but still yields a run that deployed and recorded nothing.
  Neither is acceptable on production.
- **C3 — T5 is mandatory and must cover `rolled_back`.** Not a nice-to-have. §3.4 maps
  `rolled_back` off the restore step at `vercel-production.yml:236`. A rollback is the single
  most valuable event this instrument carries — it is exactly the case where Boss needs Jira to
  disagree with a green pipeline. **Until a non-`successful` state has been observed in Jira,
  the integration is UNPROVEN for its most valuable case** and must not be treated as
  operational. An instrumentation step that only reports successes is a log of good news, not
  evidence.

---

## 5. Credential handling

Two values, not one. Boss creates them in Jira as OAuth 2.0 credentials for self-hosted tools,
grants the deployments permission, and stores them as **repository secrets**:

- `JIRA_DEPLOY_CLIENT_ID`
- `JIRA_DEPLOY_CLIENT_SECRET`

Plus a non-secret repository **variable** `JIRA_CLOUD_ID` (it is not sensitive; keeping it a
variable makes it visible in review and avoids a masked value nobody can diff).

Rules:

- Never in the repository. Never in an ADR, a receipt, a signal file, or an artifact.
- Injected only via the step's `env:` block, never as a CLI argument — arguments are visible in `ps` on the runner and are echoed by `set -x`.
- No `set -x` in the step. No `echo` of any env var. No `curl -v`.
- `curl` must use `--silent --show-error` and write the response body to a file, and the script prints **only** `status`, counts of `acceptedDeployments`/`rejectedDeployments`, and `unknownIssueKeys`. It must never print the response of the **token** call, which contains the bearer token.
- The bearer token is held in a variable for the life of the step and never written to disk, never to `$GITHUB_OUTPUT`, never to `$GITHUB_ENV`, never to a `test_reports/` or artifact path. Check the artifact path lists (`vercel-production.yml:268-283`, `vercel-staging.yml:287-305`, `vercel-preview.yml:250-265`) — no new file is added to any of them by this ADR, deliberately.
- GitHub masks registered secrets in logs automatically, but that masking is a backstop, not the control. The control is that the values are never emitted.
- Rotation is recorded in `state/ACCESS_REGISTRY.md` by reference only — name, owner, date rotated. Never the value.
- Least privilege: the credential grants deployment-info write only. It cannot transition issues, comment, or read issue content.

---

## 6. Test strategy

Nothing here is graded operational on "configured". Configured is not operational.

**T1 — credential and tenant reachability.** One manual `curl` by Sushma against
`https://api.atlassian.com/oauth/token`, then a single record posted to the bulk endpoint with
a known-good key. PASS = HTTP 202 **and** the key appears in `acceptedDeployments` **and**
`unknownIssueKeys` is empty. Evidence: response body with the token redacted.

**T2 — enum confirmation (closes §2.2).** Post with `state: "successful"` and
`environment.type: "production"`. PASS = empty `rejectedDeployments`. This is the only cheap
way to confirm the enums without a published enum list.

**T3 — the record is visible in Jira.** Open the KAN issue and see the deployment panel showing
environment, state and the link back to the run. **An API 202 is not this test.** Submission is
asynchronous, and a 202 with the key in `unknownIssueKeys` looks identical at the HTTP layer.
Evidence: screenshot plus the issue key and timestamp.

**T4 — a deliberately broken post does not break a release.** The required proof, run on
**Preview only** — never first on production. Three runs:
- T4a: set `JIRA_CLOUD_ID` to a garbage value for one run. Expect: bulk call 404/401, step logs the failure to the summary, **job conclusion `success`**, Preview URL live, receipt artifact uploaded intact.
- T4b: point the token URL at an unroutable host to force the 20s timeout. Expect: same, and total job time increased by less than ~25s.
- T4c: run from a branch and PR title carrying no issue key. Expect: warning in summary, no post attempted, **job conclusion `success`**.
PASS for all three = job `success` and the artifact unchanged. Evidence: three run URLs and
their conclusions.

**T5 — outcome fidelity.** Force a Preview failure after the artifact step and confirm Jira
shows `failed`, not `successful`. Without T5 the integration can only ever report good news.

**T6 — idempotence.** Re-run the same workflow run (attempt 2). `GITHUB_RUN_ATTEMPT` increments,
so `updateSequenceNumber` increases and the record is replaced rather than duplicated. PASS =
one deployment entry in Jira, not two.

Gate order: T1→T2→T3→T4→T5→T6 on Preview; then staging; production last, and production's first
run is observed live by Sushma.

---

## 7. Rollback

Three levels, cheapest first. None touches the release path.

1. **Disable without editing a workflow.** Delete the repository secret `JIRA_DEPLOY_CLIENT_SECRET`. The step then fails its token call, logs a warning, exits 0. The release path is unaffected. Instant, and available to Boss alone. This is the intended kill switch.
2. **Disable by variable.** Guard the step with `if: always() && vars.CP_JIRA_DEPLOY_REPORTING == 'true'`. Setting the variable to anything else skips the step entirely. Matches the existing pattern at `vercel-staging.yml:351` (`vars.CP_STAGING_CAPTURE_SHOPIFY_SNAPSHOT == 'true'`) and the `CP_PRODUCTION_PROMOTION_ENABLED` gate in the production workflow. **Recommended: ship it off, with the variable unset, and turn it on per environment as each passes its gate.**
3. **Remove.** Delete the one step from each workflow and delete `.github/scripts/report-jira-deployment.mjs`. Because the step adds no file to any artifact list, no `needs:`, no `permissions:` change, no job-level `env:` and no step id referenced elsewhere, removal is a pure deletion with no follow-on edits. That property is a design requirement, not a coincidence — Sushma should reject any implementation that breaks it.

---

## 8. Exact step content for the implementer

Identical in all three files apart from the five `JIRA_*` values. Insert at the §3.1 anchors.

```yaml
      - name: Report deployment to Jira
        id: jira_deployment
        if: always() && vars.CP_JIRA_DEPLOY_REPORTING == 'true'
        continue-on-error: true
        env:
          JIRA_CLOUD_ID: ${{ vars.JIRA_CLOUD_ID }}
          JIRA_CLIENT_ID: ${{ secrets.JIRA_DEPLOY_CLIENT_ID }}
          JIRA_CLIENT_SECRET: ${{ secrets.JIRA_DEPLOY_CLIENT_SECRET }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          JIRA_PIPELINE_ID: carlophillips-production      # staging | preview
          JIRA_ENVIRONMENT_ID: production                 # staging | preview-pr-${{ inputs.pull_request }}
          JIRA_ENVIRONMENT_TYPE: production               # staging | testing
          JIRA_ENVIRONMENT_URL: https://www.carlophillips.com
          JIRA_PULL_REQUESTS: ${{ inputs.source_pr }},${{ inputs.production_pr }}
          JIRA_RELEASE: ${{ inputs.release }}
          JIRA_COMMIT_SHA: ${{ inputs.expected_sha }}
          JIRA_INSPECT_FILE: production-after.json        # staging-inspect.json | preview-inspect.json
          JIRA_JOB_STATUS: ${{ job.status }}
          JIRA_OUTCOMES: >-
            promotion=${{ steps.promotion.outcome }},
            verification=${{ steps.verification.outcome }},
            receipt=${{ steps.receipt.outcome }},
            rollback=${{ steps.rollback.outcome }}
        run: node .github/scripts/report-jira-deployment.mjs
```

Per-file substitutions:

- `vercel-staging.yml`: pipeline `carlophillips-staging`, env id/type `staging`/`staging`, URL `https://staging.carlophillips.com`, `JIRA_PULL_REQUESTS: ${{ inputs.pr_number }}`, inspect `staging-inspect.json`, `JIRA_OUTCOMES` omitted (job-status mapping only).
- `vercel-preview.yml`: pipeline `carlophillips-preview`, env id `preview-pr-${{ inputs.pull_request }}`, type `testing`, `JIRA_ENVIRONMENT_URL: ${{ steps.preview.outputs.url }}`, `JIRA_PULL_REQUESTS: ${{ inputs.pull_request }}`, `JIRA_COMMIT_SHA: ${{ inputs.expected_sha }}`, inspect `preview-inspect.json`. Add to the `deploy-preview` job only, **not** `verify-existing-preview` (`vercel-preview.yml:268`).

New file `.github/scripts/report-jira-deployment.mjs`, Node built-ins only (no dependency
added — the runner has Node and the repo already runs `.mjs` scripts from this directory, e.g.
`vercel-staging.yml:263`). Contract:

1. Wrap the entire body in try/catch; `process.exit(0)` on every path. Never `process.exitCode = 1`.
2. Resolve issue keys per §3.3 via `gh api` on each PR number in `JIRA_PULL_REQUESTS` (title + `headRefName`), plus `GITHUB_REF_NAME` and `JIRA_RELEASE`. Empty ⇒ warn to `$GITHUB_STEP_SUMMARY`, exit 0.
3. Read `JIRA_INSPECT_FILE` for `.id || .originalDeploymentId`. Missing or unparseable ⇒ omit the ID, still post.
4. Token call, then bulk call. `AbortController` timeout 20s each.
5. Print status, `acceptedDeployments.length`, `rejectedDeployments` (message only), `unknownIssueKeys`. **Never** print request headers or the token response.
6. Write **exactly one** summary line per §4.1, using those two fixed wordings. Grade the 202
   body before choosing the line: a non-empty `unknownIssueKeys` or `rejectedDeployments` is
   `NOT REPORTED`, never `REPORTED`. (C1)

---

## 9. Lane constraint — why this ADR contains no workflow edit

`.github/workflows/**` and `.github/scripts/**` are the deployment lane, owned by Sushma.
Enforced boundaries deny Aarti writes there — verified live today by real denied calls, per
commit `454daad` ("Boundaries verified live; stop filtering real denials"), and confirmed again
during the writing of this ADR when a shell heredoc whose body quoted those paths was refused.
**No workflow edit was attempted and none should be.** A refused call there is the control
working, not a fault to route around.

Handoff is therefore: Aarti designs (this document), Sushma implements the four edits —
three workflow insertions at the §3.1 anchors with the §8 step content, plus the one new
script — and Sushma executes §6. Aarti is available for technical review of her diff and for
reading the T4 evidence, and does not touch the files.

Per Rule 7, if any part of this ever grows an `apps/web` component, that part builds in an
isolated worktree. As specified, none of it does.

---

## 10. Open questions for the gates

- **Pushpa (product fit): ANSWERED 2026-09-19 — Previews are IN. (C4)** Include Preview with
  `environment.type: testing`, as designed. Her reasoning, and it is a product reason rather than
  a tidiness one: the question Boss asks of a KAN issue is "where can I see this"; before staging
  exists the Preview URL is the only answer, and if it is not in Jira, Jira cannot answer the
  question the mandate was created to answer. Panel noise is the accepted cost —
  `environment.type: testing` keeps Previews out of the production and staging rows, so a noisy
  Preview history cannot be mistaken for a release history. **The `verify-existing-preview` job
  must not post** (§3.1, `vercel-preview.yml:268`): it creates nothing, and a record for a
  deployment that did not happen is the same false green in a different costume. This question is
  closed; no further product round is required.
- **Sushma (readiness):** confirm no downstream `if:` or artifact list references `steps.jira_deployment` after implementation (§4), and confirm the Jira GitHub app is installed before T3, since the issue-side panel presentation may depend on it.
- **Boss:** the Jira site hostname and cloud ID, the two OAuth credential values as repository secrets, and confirmation the project key is `KAN`.

---

## 11. Decision

PROPOSED. Post directly to the Jira Deployments API from a single terminal, `always()`,
`continue-on-error`, variable-gated step in each of the three Vercel workflows; ship the
variable unset; enable per environment only after that environment's tests in §6 pass, with
T4 proven on Preview before production is ever enabled.

No build until Pushpa's product-fit gate and Sushma's readiness gate both clear.

---

## 12. Product-fit gate — Pushpa (2026-09-19)

**VERDICT: CHANGES_REQUESTED.** Four changes, all small, all in the reporting semantics
rather than the architecture. The design is sound and I am not asking for a redesign. I am
asking that the thing it produces be evidence rather than a claim. On re-submission with
§12.3 C1–C4 written in, this is APPROVED without a further round.

### 12.1 Does it serve Boss's mandate? — YES, and it is the only thing that does

Boss's mandate (Rule 9a) has three legs: push, merge, deploy. Aarti's verified finding is
that the three workflows emit GitHub **Environments**, not GitHub **Deployments**
(`vercel-production.yml:39-42`, `vercel-staging.yml:29-32`, `vercel-preview.yml:28-31` —
no `deployments: write` anywhere). A GitHub Environment is an approval-and-protection
construct. The Jira GitHub app harvests Deployments. It will therefore harvest **nothing**
from this repository's release lane, however correctly it is installed.

Product consequence, and it is the one that matters: installing the Jira GitHub app and
seeing branches, commits and PRs appear on KAN issues will look like the mandate is
satisfied. It will not be. The deploy leg will be silently absent, and absent in the most
dangerous way — indistinguishable from "nothing deployed yet". This step is the sole
carrier. I record that as the product justification for building it at all.

The rejected alternative (widen to `deployments: write` and let the app harvest) is
correctly rejected on product grounds too, not only technical ones: widening a permission
on the workflow that promotes to production, in order to gain a dashboard, is spending
launch risk on instrumentation.

### 12.2 Can it report a false green? — YES, as currently specified. This is the gate.

The failure mode is precise and it is the reason for CHANGES_REQUESTED.

`202 Accepted` is returned for a submission Jira has taken, not for one it has **linked**.
A key Jira does not recognise — wrong project key, typo, a `KAN-` number that does not
exist, an issue in a project the credential cannot see — returns inside the 202 body as
`unknownIssueKeys`. At the HTTP layer a fully-linked deployment and a completely
unlinked one are byte-identical in status.

§8 contract step 5 says the script *prints* `unknownIssueKeys`. Printing is not asserting.
A printed non-empty `unknownIssueKeys` alongside a step that concluded green, in a job
that concluded green, reads to every human who looks at it as "reported". The board then
says a release was recorded in Jira when Jira dropped it. **A board that says "Deployed to
production" when the key was silently dropped is worse than no board**, because it
converts an absence of evidence into a positive claim, and Boss will stop checking.

**What must be asserted for a deploy report to count as evidence.** All five, together.
Anything less is a claim.

1. HTTP status is `202`.
2. `acceptedDeployments` contains exactly one entry, and its
   `pipelineId`/`environmentId`/`deploymentSequenceNumber` are the triple we sent.
3. `rejectedDeployments` is empty. A non-empty value means a field was malformed — which
   is how a bad `state` or `environment.type` enum surfaces (§2.2).
4. `unknownIssueKeys` is empty. If it is not, the deployment exists in Jira attached to
   nothing, which is the false green.
5. `unknownAssociations` is empty.

Only when 1–5 all hold may the run be described as reported. Anything else is
**NOT REPORTED**, in those words.

### 12.3 Required changes — C1 to C4

**C1 — The step summary must grade, not print.** Exactly one of two lines is written to
`$GITHUB_STEP_SUMMARY`, and the words are fixed so they can be grepped and so no reader
has to interpret a JSON dump:

- `JIRA DEPLOYMENT REPORTED — <env> <state> — keys: KAN-11` when §12.2 1–5 all hold.
- `JIRA DEPLOYMENT NOT REPORTED — <reason>` in every other case, including 202 with a
  non-empty `unknownIssueKeys`, non-empty `rejectedDeployments`, auth failure, timeout,
  unparseable response, and no resolvable issue key.

A 202 carrying unknown keys is a **NOT REPORTED**. It must never be summarised as a
success because the HTTP call succeeded. Raw counts may still be printed underneath; they
are not the line a human reads.

**C2 — `state` and `environment.type` must be proven before any environment is enabled,
not assumed.** §2.2 flags both as assumptions and §6 T2 closes them. Make that ordering
binding: T2 PASS is a precondition of setting `CP_JIRA_DEPLOY_REPORTING=true` on any
environment. Reason: a bad enum returns inside a 202 via `rejectedDeployments`. Without
C1, that is invisible; with C1 it is visible but still produces a run that deployed and
recorded nothing. Neither is acceptable on production.

**C3 — T5 is mandatory, not a nice-to-have, and must also cover `rolled_back`.** §3.4
already maps `rolled_back` off the restore step at `vercel-production.yml:236`. A rollback
is the single most important event this instrument can carry — it is precisely the case
where Boss needs Jira to disagree with a green pipeline. Aarti's line "an instrumentation
step that only reports successes is a log of good news, not evidence" is the right product
principle and I am adopting it as an acceptance condition. Until a non-`successful` state
has been observed in Jira, the integration is unproven for its most valuable case.

**C4 — Previews are IN. Answering §10.** Include Preview, with `environment.type:
testing`, as designed. Reasoning, and it is a product reason rather than a tidiness one:
the question Boss asks of a KAN issue is "where can I see this". Before staging exists,
the Preview URL is the only answer, and if it is not in Jira, Jira cannot answer the
question the mandate was created to answer. Panel noise is the acceptable cost —
`environment.type: testing` keeps Previews out of the production and staging rows, so a
noisy Preview history cannot be mistaken for a release history. The `verify-existing-preview`
job must not post, as §3.1 already states; it creates nothing, and a record for a
deployment that did not happen is the same false green in a different costume.

### 12.4 Failure posture — my answer, one answer

**Keep it. A failed Jira post must never fail a release.** Aarti's §4 is the correct
product call and I am not softening it.

The opposing view — "a release that cannot be recorded is a release that did not happen" —
is disciplined and wrong here, for one reason: it inverts the risk. It makes the
availability of a third-party reporting API a dependency of shipping to production. A Jira
outage, an expired credential, a tenant migration, or a 20-second timeout would then block
a release, including a release that is itself a fix for a live customer-facing fault. We
would be trading a real, immediate customer impact against a bookkeeping gap. Posture is
launch-forward (D-014); instrumentation does not get a veto over delivery.

**But the two things must be separated, and this is the part that makes the posture safe.**
The release does not fail. The **item** does not reach done.

- The deploy **proceeds** regardless of the Jira post. Non-negotiable, as written.
- The item is **not graded done** until a run exists whose summary carries
  `JIRA DEPLOYMENT REPORTED` per C1 and whose Jira record is visible per T3.
- A release that shipped with `JIRA DEPLOYMENT NOT REPORTED` is a **P2 defect on the
  record**, raised by Sushma at the next activation. It is not a rollback trigger and it is
  not a release blocker. It is a gap in evidence that must be closed by hand — the run URL,
  SHA and Vercel deployment ID written into the KAN issue as a comment.

That way the mandate is enforced on the record rather than on the release path, and no
absence goes unnoticed. Silence is what Rule 9a was written against; a failed deploy is not.

### 12.5 Acceptance criteria — written for Sushma's hand

`.github/workflows/**` and `.github/scripts/**` are Sushma's lane; Aarti is denied there
(§9). These are written to be implemented and graded by her, and each is independently
checkable.

**AC-1.** Each of the three workflows carries exactly one `Report deployment to Jira` step,
inserted at the §3.1 anchors — before `vercel-production.yml:259`, before
`vercel-staging.yml:287`, before `vercel-preview.yml:250`. The `verify-existing-preview`
job (`vercel-preview.yml:268`) carries no such step.
*Evidence:* the diff.

**AC-2.** Every step carries all three of `if: always() && vars.CP_JIRA_DEPLOY_REPORTING ==
'true'`, `continue-on-error: true`, and no step id referenced by any later `if:`,
`needs:`, artifact path list or job output.
*Evidence:* `grep -rn 'jira_deployment' .github/` returns only the step definitions
themselves.

**AC-3.** The variable `CP_JIRA_DEPLOY_REPORTING` is **unset** when the change merges. No
environment is enabled by the act of merging.
*Evidence:* repository variables list at merge time.

**AC-4.** The script exits `0` on every path. No `process.exitCode = 1`, no unhandled
rejection, no `throw` that escapes the top-level try/catch.
*Evidence:* the source, plus the T4a/T4b/T4c run conclusions.

**AC-5.** Every run of the step writes exactly one of the two C1 lines to
`$GITHUB_STEP_SUMMARY`. A 202 with non-empty `unknownIssueKeys` or non-empty
`rejectedDeployments` writes the `NOT REPORTED` line.
*Evidence:* the T4 run summaries, and one deliberately-wrong-key run showing `NOT
REPORTED` on a 202.

**AC-6.** No secret value is written anywhere. No `set -x`, no `curl -v`, no `echo` of any
`JIRA_*` value, credentials passed only via the step `env:` block and never as a CLI
argument, the token response never printed, the bearer token never written to
`$GITHUB_OUTPUT`, `$GITHUB_ENV`, disk or any artifact. No new file is added to any of the
three artifact lists.
*Evidence:* the diff, plus one full run log read end to end.

**AC-7.** T1 and T2 PASS before any environment is enabled. T2 PASS means `state:
"successful"` and `environment.type: "production"` both return an empty
`rejectedDeployments`, closing the §2.2 assumptions. (C2)
*Evidence:* the two 202 bodies, bearer token redacted.

**AC-8.** T3 PASS — the deployment is visible in the Jira panel on a real KAN issue,
showing environment, state and the link back to the run. An API 202 is explicitly not this
test.
*Evidence:* screenshot, issue key, timestamp.

**AC-9.** T4a, T4b and T4c all PASS on **Preview**, before staging or production is
enabled: job conclusion `success`, the deployment still live, the receipt artifact
unchanged, and T4b adding less than ~25s to total job time.
*Evidence:* three run URLs and their conclusions.

**AC-10.** T5 PASS — a forced Preview failure appears in Jira as `failed`, not
`successful`; and the production `rolled_back` mapping is confirmed at least once, by a
staged rollback or by a dry post carrying `state: "rolled_back"` if a real rollback cannot
be safely induced. (C3)
*Evidence:* the Jira record and the run it came from.

**AC-11.** T6 PASS — re-running the same run (attempt 2) replaces the record rather than
duplicating it; the Jira panel shows one entry for that triple, not two.
*Evidence:* screenshot after attempt 2.

**AC-12.** The commit SHA and Vercel deployment ID appear in the Jira record, in
`description` and in `properties` as `{"commit":…,"vercelDeploymentId":…,"runId":…}`, and
the SHA matches the SHA CI ran on (Rule 8). The Vercel ID is read from the inspect file,
never re-derived.
*Evidence:* one production-shaped record read back from Jira, its SHA compared against the
run.

**AC-13.** Enablement is per environment and in order — Preview, then staging, then
production. Production's first enabled run is observed live by Sushma. No environment is
enabled before its own AC-7 through AC-11 hold for it.
*Evidence:* the order of variable changes and the run URLs.

**AC-14.** Removal remains a pure deletion — deleting the three steps and the one script
requires no other edit, no `permissions:` revert, no artifact-list change. (§7 level 3.)
*Evidence:* stated by Sushma at review against the diff.

### 12.6 What this gate does not cover

Not my call and not assessed here: the choice of the Deployments API over GitHub
Deployments, the anchor line numbers, the OAuth 2LO mechanism, the timeout values, and the
script's internal structure. Those are Aarti's design and Sushma's readiness gate.

**Still outstanding to Boss, unchanged from §10:** the Jira site hostname, the cloud ID,
the two OAuth credential values as repository secrets, and confirmation that the project
key is `KAN`. AC-7 cannot start until all four land.

— Pushpa, product-fit gate, 2026-09-19.

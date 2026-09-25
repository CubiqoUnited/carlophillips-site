ITEM: KAN-11 — tie Jira to the release leg (ADR only, no build)

RESULT: `decisions/ADR-0002-jira-deployment-events.md` written, status PROPOSED.
Designed for Sushma to implement: three workflow insertions plus one new script.
One material correction to the dispatch premise — see VERIFIED FACT 1.

EVIDENCE

VERIFIED FACTS

1. The three workflows do NOT use the GitHub Deployments API today. The dispatch's
   premise is wrong. Permission blocks are `actions: read, contents: read,
   pull-requests: read` only — `.github/workflows/vercel-production.yml:39-42`,
   `.github/workflows/vercel-staging.yml:29-32`,
   `.github/workflows/vercel-preview.yml:28-31`. No `deployments: write`, no
   create-deployment call anywhere. What exists is GitHub *Environments*
   (`vercel-production.yml:53-55`, `vercel-staging.yml:44-46`,
   `vercel-preview.yml:43`) — an approval construct, not a Deployments record.
   Consequence: the Jira GitHub app has nothing to harvest. This step is the only
   carrier for the release leg of Rule 9a, not an optional extra.

2. The release moment, per workflow:
   - production `vercel-production.yml:173-179` (`vercel promote`, id `promotion`),
     proven live at `:181-197` (id `verification`).
   - staging `vercel-staging.yml:157-179` (id `staging`), live at `:208-212`.
   - preview `vercel-preview.yml:151-176` (id `preview`).

3. Correct insertion anchors (ADR §3.1), chosen so the step runs on both paths:
   - before `vercel-production.yml:259` (`Require complete successful promotion` —
     the step that decides the job).
   - before `vercel-staging.yml:287` (terminal upload-artifact).
   - before `vercel-preview.yml:250` (`Upload immutable Preview receipt`).
   The `verify-existing-preview` job at `vercel-preview.yml:268` must NOT post.

4. Jira Deployments API shape, read from developer.atlassian.com 2026-09-19:
   `POST https://api.atlassian.com/jira/deployments/0.1/cloud/{cloudId}/bulk`;
   scope `write:deployment-info:jira`; identity triple
   pipelineId+environmentId+deploymentSequenceNumber with `updateSequenceNumber`
   ordering; 202 body `{acceptedDeployments, rejectedDeployments,
   unknownIssueKeys, unknownAssociations}`.

5. Auth is NOT a Jira API token. OAuth 2.0 2LO client_credentials against
   `https://api.atlassian.com/oauth/token`, ~15-minute token. **Boss must supply TWO
   secrets, not one** (`JIRA_DEPLOY_CLIENT_ID`, `JIRA_DEPLOY_CLIENT_SECRET`) plus a
   non-secret `JIRA_CLOUD_ID` variable. ADR §5.

6. A 202 does not mean the issue keys landed — unrecognised keys return inside the
   202 as `unknownIssueKeys`. Any test asserting only on HTTP status proves nothing.
   ADR §6 T1/T3.

7. `continue-on-error: true` is already on `promotion` (`vercel-production.yml:175`)
   and `verification` (`:180`), so their outcomes are readable at job end. That is
   what makes honest outcome mapping possible (ADR §3.4) rather than
   success-only reporting.

8. The boundary denying Aarti writes under `.github/` is live. A heredoc write of
   this ADR was refused mid-task because its body quoted those paths. Recorded in
   ADR §9. No workflow file was touched.

ASSUMPTIONS (flagged in the ADR, must close before build)

A. `state` enum assumed `unknown|pending|in_progress|cancelled|failed|rolled_back|
   successful`. Only `in_progress` is verified — it appears in the documented
   request example. Closes via ADR §6 T2.
B. `environment.type` enum assumed `unmapped|development|testing|staging|production`.
   Unverified. Same test closes it.
C. Jira site hostname, cloud ID, and that the project key is `KAN`. Not verifiable
   from here — no tenant access in this session.
D. That the Jira GitHub app, once installed, covers push/branch/commit/PR/merge with
   no code. Taken from the dispatch, not independently verified.

NEXT
1. Pushpa product-fit gate — one question only, ADR §10: do Previews belong in the
   Jira deployment panel, or staging and production only?
2. Sushma readiness gate.
3. Boss supplies the two secrets, the cloud ID and the project key.
4. Then Sushma implements §8 and runs §6 in order, T4 on Preview before production
   is ever enabled.

OWNER: Sushma for implementation (deployment lane). Aarti for technical review of
the diff and of the T4 evidence.

RESUME: on Pushpa's gate result, or on Sushma's readiness gate, whichever lands
first. Aarti resumes only to review — not to edit `.github/`.

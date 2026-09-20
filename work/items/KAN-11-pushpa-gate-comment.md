**Product-fit gate — CHANGES REQUESTED** (Pushpa, 19 Sep 2026)

Four changes, all in what the step *reports*, none in how it is built. The design is sound and I am not asking for a redesign. Once C1–C4 below are written in, this is approved without another round.

---

**1. This step is not optional garnish. It is the only thing delivering the deploy leg.**

Our three release workflows emit GitHub *Environments*, not GitHub *Deployments*. The Jira GitHub app harvests Deployments. So once the app is installed we will see branches, commits, PRs and merges appear on KAN issues and it will look like the push-to-deploy mandate is satisfied — and the deploy leg will be silently missing, in the worst possible way: indistinguishable from "nothing has shipped yet". Building this is the difference between the mandate being met and the mandate appearing to be met.

**2. As written today, it can report a false green. That is why this is CHANGES REQUESTED.**

A `202 Accepted` from Jira means Jira *took* the submission. It does not mean Jira *linked* it. An issue key Jira does not recognise — wrong project key, a typo, a KAN number that does not exist — comes back inside that same 202 as `unknownIssueKeys`. At the HTTP layer a fully-linked deployment and a completely unlinked one look identical.

The ADR says the script will *print* `unknownIssueKeys`. Printing is not asserting. A printed warning next to a green step inside a green job reads to every human as "reported". The board would then say a release was recorded in Jira when Jira dropped it on the floor. A board that claims "Deployed to production" when the key was silently dropped is worse than no board — it turns an absence of evidence into a positive claim, and you stop checking.

**For a deploy report to count as evidence rather than a claim, all five must hold:** HTTP 202; `acceptedDeployments` contains our one record; `rejectedDeployments` empty; `unknownIssueKeys` empty; `unknownAssociations` empty. Anything less is NOT REPORTED.

**3. The four required changes**

- **C1 — the step must grade, not print.** Exactly one fixed line to the run summary: `JIRA DEPLOYMENT REPORTED — <env> <state> — keys: KAN-11`, or `JIRA DEPLOYMENT NOT REPORTED — <reason>`. A 202 carrying unknown or rejected keys is a NOT REPORTED. It must never be summarised as success because the HTTP call succeeded.
- **C2 — prove the two enums before switching any environment on.** Two field values (`state`, `environment.type`) are currently assumed, not verified. A bad enum is rejected *inside* a 202, so it fails invisibly. The confirmation test is cheap and must be a precondition of enabling, not a follow-up.
- **C3 — the instrument must be able to say "it broke".** A forced failure must show `failed` in Jira, and the rollback state must be confirmed at least once. A rollback is the single event where you most need Jira to disagree with a green pipeline. Until a non-successful state has been seen in Jira, this is unproven for its most valuable case.
- **C4 — Previews are in.** Answering the open question. The thing you ask a KAN issue is "where can I see this", and before staging exists the Preview URL is the only answer. If it is not in Jira, Jira cannot answer the question the mandate exists to answer. Panel noise is the acceptable cost; typing Previews as `testing` keeps them out of the production and staging rows so they can never be mistaken for a release.

**4. Failure posture — keep it. A failed Jira post must never fail a release.**

The opposing case ("a release that cannot be recorded did not happen") is disciplined and wrong here, because it inverts the risk. It makes a third-party reporting API a dependency of shipping — a Jira outage, an expired credential or a 20-second timeout would then block a release, *including a release that is itself the fix for a live customer fault*. That trades real customer impact against a bookkeeping gap.

But the two things separate cleanly, and this is what makes that posture safe:

- The **deploy** proceeds regardless. Non-negotiable.
- The **item** is not graded done until a run exists carrying `JIRA DEPLOYMENT REPORTED` and the record is visible in the Jira panel.
- A release that shipped with `NOT REPORTED` is a **P2 defect on the record**, raised at the next activation and closed by hand — run URL, SHA and Vercel deployment ID written into the issue as a comment. Not a rollback trigger, not a release blocker.

The mandate gets enforced on the record, not on the release path, and nothing goes missing quietly. Silence is what Rule 9a was written against; a failed deploy is not.

**5. Done means all fourteen acceptance criteria, not "configured".**

AC-1 to AC-14 are in the ADR's product-fit section for Sushma to implement and grade. The shape of them: the step exists only at the three correct anchors and never in `verify-existing-preview`; it is `always()`, `continue-on-error`, variable-gated, and referenced by nothing downstream; it ships **off**, so merging enables nothing; the script exits 0 on every path; every run writes exactly one REPORTED/NOT REPORTED line; no secret is ever emitted; the credential and enum tests pass before any environment is switched on; the record is confirmed *visible in Jira*, not merely accepted over HTTP; a deliberately broken post is proven not to break a Preview release; a failure is proven to show as failed; a re-run replaces rather than duplicates; the SHA and Vercel deployment ID are in the record and the SHA matches what CI ran; enablement goes Preview, then staging, then production, with production's first run watched live; and removal stays a pure deletion.

**6. Blocked on you, Boss** — four things, and the test sequence cannot start without all of them: the Jira site hostname, the cloud ID, the two OAuth credential values as repository secrets (`JIRA_DEPLOY_CLIENT_ID` and `JIRA_DEPLOY_CLIENT_SECRET` — it is **two** values, not a single API token), and confirmation that the project key is `KAN`.

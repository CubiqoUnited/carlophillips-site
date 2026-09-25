ITEM: KAN-11 — product-fit gate on ADR-0002 (Jira deployment events)

RESULT: **CHANGES_REQUESTED.** Not a redesign — four changes (C1–C4) in reporting
semantics only, plus 14 acceptance criteria written for Sushma's hand. On
re-submission with C1–C4 written in, this is APPROVED without a further round.
Verdict recorded at `decisions/ADR-0002-jira-deployment-events.md` §12. Aarti's
§1–§11 untouched. Jira comment at `work/items/KAN-11-pushpa-gate-comment.md`.

EVIDENCE

VERIFIED FACTS

1. The ADR carries no product-fit approval section. I created §12 by appending
   after §11 (`decisions/ADR-0002-jira-deployment-events.md:330`). No edit to any
   of Aarti's sections §1–§11 — confirmed by the single-anchor Edit on the closing
   line of §11 only.

2. The false-green path is real and is specified into the design, not a
   hypothetical. ADR §8 contract step 5 says the script *prints* `unknownIssueKeys`.
   ADR §2.1:54 and §6 T1/T3 both establish that unrecognised keys return **inside**
   a 202. A printed value next to a `continue-on-error: true` step in a green job
   is not an assertion. Nothing in §1–§11 converts that read into a grade.
   This is the whole basis of CHANGES_REQUESTED.

3. Enum risk compounds the same path. ADR §2.2:59-60 flags `state` and
   `environment.type` as ASSUMPTION with only `in_progress` verified, and states a
   bad enum surfaces via `rejectedDeployments` inside the 202 rather than a non-2xx.
   Same invisible-failure shape as fact 2.

4. Aarti's central finding independently re-read and confirmed from the ADR's own
   cited lines: permission blocks are `actions: read, contents: read,
   pull-requests: read` at `vercel-production.yml:39-42`,
   `vercel-staging.yml:29-32`, `vercel-preview.yml:28-31`; GitHub Environments at
   `vercel-production.yml:53-55`, `vercel-staging.yml:44-46`, `vercel-preview.yml:43`.
   Product consequence: the Jira GitHub app harvests nothing from the release lane,
   so this step is the sole carrier of the deploy leg of Rule 9a.

5. Open question §10 (Previews in the panel?) is answered: **IN**, typed
   `testing`. Product reason recorded at §12.3 C4. `verify-existing-preview`
   (`vercel-preview.yml:268`) must not post — it creates nothing, and a record for a
   deployment that did not happen is the same false green in different costume.

6. Failure posture: **one answer given, not two.** Aarti's §4 stands unchanged — a
   failed Jira post must never fail a release. The item-level consequence is
   separated out at §12.4: deploy proceeds; the *item* is not graded done until a
   run carries `JIRA DEPLOYMENT REPORTED` and T3 confirms the record is visible;
   a release that shipped NOT REPORTED is a P2 on the record, not a release blocker.

7. Acceptance criteria AC-1..AC-14 at §12.5, each with named evidence, written for
   Sushma because `.github/workflows/**` and `.github/scripts/**` are her lane and
   Aarti is denied there (ADR §9, commit `454daad`).

8. No `work/items/KAN-11*.md` existed before this gate — `Glob work/items/KAN-11*`
   returned no files. The Jira comment file is the first item artefact for KAN-11.

ASSUMPTIONS

A. That the Jira deployment panel renders `environment.type: testing` separately
   from production and staging rows. My C4 noise argument depends on it. Not
   verifiable without tenant access. If it does not separate them, C4 should be
   revisited before Preview is enabled — it does not change the verdict.

B. That the KAN-11 Jira issue exists and is the correct issue for this comment.
   Taken from the dispatch; I have no Jira access.

C. Aarti's assumptions A–D from `195650Z-aarti-KAN-11.md` are carried forward
   unclosed. C2 makes closing his A and B a precondition of enabling any
   environment; his C (hostname, cloud ID, project key) is Boss's to supply and
   blocks AC-7.

D. I did not independently open the three workflow files. Aarti's `file:line`
   citations are taken as given for the anchors and permission blocks. My verdict
   does not turn on any line number — it turns on the reporting semantics in §8,
   which I read directly.

NEXT
1. Aarti or Sushma writes C1–C4 into the ADR. C1 is the only one touching the
   script contract (§8 step 5/6); C2–C4 are ordering and scope.
2. Sushma readiness gate (ADR §10) — confirm nothing downstream references
   `steps.jira_deployment`.
3. Boss supplies hostname, cloud ID, the two OAuth secrets, and the project key.
   AC-7 cannot start without all four.
4. Sushma carries `work/items/KAN-11-pushpa-gate-comment.md` into the KAN-11
   comment thread. I have no Jira access.

OWNER: Sushma — implementation, §6 test execution, and the Jira comment.
Pushpa returns only to re-gate C1–C4 and to sign off AC-8/AC-10 evidence.

RESUME: on C1–C4 being written in, or on Boss overriding the failure-posture call
at §12.4.

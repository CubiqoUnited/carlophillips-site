# HUMAN INTERVENTION REQUIRED — SIGNATURE HOODIE SAMPLE FIRST

Updated: 2026-08-09

## Product Owner decision

The first remaining physical-media gate is one exact Signature Hoodie sample. Do not spend on additional image credits, video, 360, or 3D generation before this sample path is confirmed.

## Exact action and safe order

1. Complete the newest Apliiq password-reset link and sign in to the existing Apliiq account without accepting a plan, charge, or configuration change.
2. Signal `Apliiq open` in the active Codex task.
3. Codex resumes with a read-only check of the existing Hoodie product, blank, decoration placement, artwork, and Shopify variant mapping. A reported `IND4000` resemblance is not sufficient to place an order.
4. After the exact item is verified, Codex reports the one-sample item, selected size, shipping destination requirement, total price, and any risk. The Product Owner must approve that exact order and total before checkout.
5. After delivery, capture the sample in one consolidated session: front, back, both profiles, both three-quarter views, on-body fit, walking/turning video, 24–36 evenly spaced spin angles, embroidery macro, outer fleece, inner fleece, hood/drawcord, pocket/seams, cuffs, and hem.

## Cost and risk

- A physical sample, shipping, and possibly tax will incur a real charge; no amount is approved yet.
- Do not order a guessed blank, size, decoration, or unverified provider mapping.
- Do not accept paid media-app plans or generation credits as part of this handoff.
- No production publish, customer order, bulk inventory, or live-site change is authorized by this sample-first decision.

## Resume points

- After provider sign-in: `Apliiq open` → inspect the mapping read-only.
- After exact sample quote: Product Owner approves or rejects the named item and exact total.
- After delivery/capture: `Hoodie sample media uploaded` → ingest, curate, produce the genuine spin/video/3D derivatives, verify desktop/mobile, and stage in Vercel Preview before any separate Production decision.

The previously requested runway-motion file remains optional and secondary to the physical Hoodie sample.

---

# HUMAN INTERVENTION REQUIRED — ENABLE CI/CD PROTECTION AFTER FIRST GREEN RUN

Added: 2026-08-14

Status: **WAIT FOR THE CI/CD PULL REQUEST AND ITS FIRST GREEN `CI / Verify` RUN.** Do not configure Production enablement before that evidence exists.

## Exact safe order

1. Review the separate CI/CD pull request from `codex/cp-cicd-bootstrap` and confirm `CI / Verify` is green.
2. In GitHub repository rulesets, protect `main`: require pull requests, at least one approval, required status `CI / Verify`, and block force-push and deletion. Do not require the stale Vercel fork-policy status.
3. In GitHub Environments → `Production`, add at least one required reviewer. Disable administrator bypass if repository policy permits.
4. In `Production`, add `VERCEL_TOKEN` as an environment secret. Add `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` as environment variables. Do not share or print any credential value.
5. Only after the reviewer rule is visible, add `CP_PRODUCTION_PROMOTION_ENABLED=true` as a `Production` environment variable.
6. Return to the active Codex task and signal `CI/CD protection configured`. Do not dispatch the release-candidate workflow without approval to create that exact no-domain Vercel candidate. Do not dispatch Production promotion without the candidate receipt's exact deployment ID, SHA, release, and `productionBeforeDeploymentId`, review of that exact candidate, and a separate Product Owner release decision.

## Cost and risk

- GitHub/Vercel configuration has no intended charge, but Vercel use remains subject to the account plan.
- A wrong secret scope can expose deployment authority; keep `VERCEL_TOKEN` only in the protected `Production` environment and never place it in pull-request jobs or repository files.
- A required status configured before its first check exists can deadlock merges. That is why the green run comes first.
- The Production workflow automatically rolls back after a failed post-promotion gate, but workflows do not replace Product Owner approval or live-release supervision.

## Resume point

After `CI/CD protection configured`, verify the ruleset, environment reviewer, variable names, and secret name read-only. Do not reveal values. A release candidate must be a staged Production build with no CARLOPHILLIPS domain aliases. Production remains unchanged until a separately approved promotion dispatch.

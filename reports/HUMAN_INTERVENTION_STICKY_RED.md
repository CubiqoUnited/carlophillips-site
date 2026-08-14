# HUMAN INTERVENTION REQUIRED — CONTAIN LIVE CHECKOUT AUTHORITY DEFECT

Updated: 2026-08-14

## What is blocked

The live Signature Hoodie PDP was independently observed showing `Continue to checkout` while the canonical Product Release Record is Draft, required fingerprints and approvals are missing, rollback verification is null, and the Media Registry has zero storefront bindings. A historical single-product launch file bypassed the canonical release and media gates.

The tested candidate on branch `codex/cp-e2e-admin-control-plane` (source commit `05d3d72`) removes that authority path, denies checkout before any Shopify read or cart mutation, and requires an independent `checkoutAllowed` decision before the PDP can render a checkout form. It also contains the local Product Owner-only Theme proposal screen. Source QA passes 39 files / 374 tests and the integrated browser matrix passes 459/459 checks. This local change does not alter Production.

## Exact human action

1. Boss decides whether to authorize a fail-closed hotfix deployment from a new immutable reviewed candidate, or to authorize a rollback only after the proposed rollback artifact is verified not to contain the same bypass.
2. If authorizing the hotfix, signal exactly: `Approve CP fail-closed hotfix Preview only`. Sushma may then prepare and verify a Vercel Preview; this signal does not authorize merge or Production.
3. After exact Preview QA visibly proves no checkout CTA, no unbound media, no Shopify mutation, and a safe rollback, Boss may separately signal: `Approve CP fail-closed Production containment`.
4. If considering rollback instead, signal: `Review CP rollback candidate`. Sushma will verify the artifact read-only and return an evidence-bound recommendation before any alias or deployment change.

Do not open Shopify, GitHub settings, Vercel, or any browser screen for Codex. If a visible screen is later necessary, Boss must manually open it or explicitly approve that exact visible action first.

## Cost and risk

- A Preview deployment should not change the live site, but account/build usage may apply.
- Production containment changes customer purchase availability and therefore needs explicit Product Owner approval.
- An unverified rollback could restore the same bypass or older defects. No rollback is safe merely because it is older.
- No Shopify catalog, channel, order, payment, fulfillment, or billing change is authorized.

## Resume point

Resume from the isolated branch by creating one immutable candidate commit, verifying Local and exact Preview at 1440×1000, 1024×768, and 390×844, and binding the results to the Product Release Record. Production remains a separate approval.

---

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

# HUMAN INTERVENTION REQUIRED — PRODUCTION AUTHORITY CLOSURE

Updated: 2026-08-14

## Exact actions

1. Boss nominates one human Platform/Security owner and one Account/Billing owner in the active CARLOPHILLIPS task.
2. The business/legal content owner reviews the technical drafts at `/privacy`, `/terms`, and `/cookie-policy`, supplies the missing seller/contact/retention/processor/order/returns language, and signals `CP policy content approved` only after the exact text is accepted.
3. An authorized GitHub administrator opens repository Settings → Branches/Rulesets for `CubiqoUnited/carlophillips-site`, requires the `Quality` check and pull-request review on `main`, and signals `CP main protection enabled`. Do not change the production branch or merge a pull request as part of this action.
4. An authorized account owner performs the read-only RBAC, 2FA/recovery, billing-alert and spend-ceiling review for the verified Vercel project, GitHub repository, Shopify account and selected POD provider, then signals `CP account audit complete`. Do not buy, upgrade, rotate credentials, or change configuration without separate approval.
5. After the current branch is integrated with PR #9 and a new immutable Vercel Preview exists, Boss approves a manual screen-reader/keyboard walkthrough and signals `CP Preview ready for manual accessibility review`.

## Location and identity guard

- Verified production Vercel team: `aditya's projects` (`team_8ABMxicIAtMyzgNYsJawFad0`).
- Verified production Vercel project: `carlophillips-site` (`prj_9VHD0AhhQnuml8frfNDsmFLHXcq1`).
- Do not use the duplicate same-named project under the Cubiqo Vercel team.
- `yarn verify:vercel-link --require-link` must pass before any future deploy command.

## Cost and risk

- The owner nominations, content review, branch protection and read-only account audit should not themselves incur a charge.
- A Vercel/GitHub/security-plan upgrade, analytics provider, Shopify/POD action or other paid capability requires a separate exact-price approval.
- Wrong-project linking, premature policy approval, enabling trackers without approved consent requirements, or merging/promoting before integrated QA can affect the live site and must not occur in this handoff.

## Completion signal and resume point

Use the exact signals above. Sushma then records the evidence, integrates the selected candidate on a temporary branch, runs the complete CI-equivalent and Preview QA, and returns a go/no-go brief. No signal by itself authorizes merge, Production promotion, tracking enablement, Shopify publication, checkout, purchase, or billing changes.

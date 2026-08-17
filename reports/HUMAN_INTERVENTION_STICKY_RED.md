# HUMAN INTERVENTION REQUIRED — FINISH FIRST-PRODUCTION PROOF AND REAL-PAYMENT ACTIVATION

Updated: 2026-08-17

## Current shortest path — verified 2026-08-17

1. **Use the existing storefront order path; do not depend on Apliiq's separate sample cart.** Shopify cart/checkout and test order `#1002` already prove the CARLOPHILLIPS → Shopify → Apliiq handoff. The isolated candidate adds a Product Owner-only action that prepares exactly one Medium Shopify checkout at the reviewed USD $128 item subtotal. It does not charge or submit an order. Before payment, the Product Owner must review and approve the exact shipping, tax, final total, and live-payment exposure shown by Shopify.
2. **The delivered sample must be inspected.** Fit, colour, artwork placement, and finish require real evidence. Shopify being Active and checkout working cannot substitute for this physical fulfillment proof.
3. **A canonical repository administrator must restore the release guardrails.** PR #14 is mergeable and `CI / Verify` is green at `e38837d7667f8925193f7e490ad32f3f15c90823`, but the repository has no active `main` ruleset and GitHub environments `Preview` and `Production` have no required reviewers. The connected Codex identity is pull-only and cannot configure or merge them.
4. **Do not promote the current live deployment as the candidate or rollback.** `www.carlophillips.com` is on historical feature-branch commit `bb9568f`; it is healthy in the observed runtime sample but is only the captured drift anchor.
5. After sample/media/product/fulfillment approval, capture the fresh Shopify Production observation, verify a distinct Production candidate and safe fallback, merge the exact reviewed PR through protected `main`, then turn off Shopify Payments test mode as the final activation action. Run one separately approved exact-value real order to prove payment settlement, Apliiq acceptance, tracking, and customer email before declaring Production commerce complete.

## What is complete

The isolated checkout candidate now implements the server-only Shopify hosted-checkout handoff requested by the Product Owner. It accepts only an opaque reviewed variant hash, re-reads current Shopify facts on the server, rejects stale or unavailable variants, creates a Shopify cart, and redirects only to an exact configured HTTPS Shopify checkout host. Same-origin POST enforcement, separate cart/checkout Product Owner approvals, environment kill switches, and foreign-host denial are covered by tests.

Source QA passes design-system lint, zero-warning code lint, 51 test files / 532 tests, zero production-dependency vulnerabilities, and the optimized Next.js build. Headless desktop 1440×1000 and mobile 390×844 evidence for the immutable candidate returns HTTP 200 with no console errors, runtime overlay, or overflow. The protected Preview returns HTTP 409 `PRODUCT_RELEASE_NOT_RELEASED` for checkout and creates no Shopify cart.

The 2026-08-16 authenticated read-only account audit also proves that the external product itself is no longer a Shopify Draft. It is Active on Online Store and Carlophillips Headless, has nine Black variants from XS through 5XL at USD 128–134, and all nine variants are assigned to Apliiq Dropship Fulfillment. Apliiq shows the Shopify store connected and a fulfillment payment method present.

The 2026-08-17 continuation audit additionally proves that Shopify hosted checkout and test payment already work end to end. Shopify order `#1002` is explicitly labeled **Test order**, **Paid**, and **Unfulfilled**; it originated from Carlophillips Headless, charged USD $128.00 plus USD $8.20 shipping for a USD $136.20 test total, and generated the order-confirmation email. Shopify offers a fulfillment request to Apliiq, but that order uses Shopify's intentionally fake test destination and the XS variant. It must not be submitted to Apliiq or treated as physical-sample evidence.

The same read-only audit reconfirms the Hoodie is Active, all nine Black sizes exist, S/M/L are present, and Shopify Payments remains explicitly in test mode with live payouts unavailable.

The Product Owner subsequently completed private Apliiq sign-in. The authenticated saved design was reverified as black IND4000 with front 2×2-inch, 648-stitch embroidery; the S/M/L mappings still match the Staged release. Apliiq showed Medium stock above 5,700 and accepted local form state for exactly one Medium sample. The quote form displayed an estimated USD $39.45 unit price, warned of a possible one-time USD $11 first-order digitization fee, and warned that the final embroidery price may change after digitization. Shipping and tax remain unknown.

Apliiq did not create the quote cart. Two controlled Add to cart attempts—one in the normal browser viewport and one after a clean authenticated desktop-width reload—both caused Apliiq's own JavaScript to receive an HTML error document where JSON was expected (`Unexpected token '<'`). The cart remained empty after both attempts. No address, order, fulfillment request, or charge was submitted. This provider-side cart failure is now the first external boundary.

The Product Owner approved the support reply address and message. Codex submitted the exact cart-error report to Apliiq Customer Service, but this route is now retired as a release dependency. The recurring inbox monitor was deleted. Any later provider reply is informational only; it does not block or authorize the controlled Shopify order.

Separately, the current Production storefront successfully created a Shopify cart for **Black / Medium** at USD $128 and redirected to `carlophillips.myshopify.com`. The hosted order summary matched one Medium Hoodie and exposed the configured payment methods. No contact, address, payment data, or order was submitted. This is additional technical observation evidence only; it does not reclassify the capability registry or authorize release/payment activation. Evidence: `test_reports/cp-production-medium-cart-2026-08-17/`.

On 2026-08-17 the Product Owner approved exact Shopify observation `sha256:143a817c9a1d8898faeaee2aa81e05ccc05153f9dfa3ae9497411c44c1cf47f4`. That approval is bound to immutable candidate `4ee088cd39cfa9b967bde32893f0dc2a33325904`, and the canonical Product Release Record is formally **Staged**. The initial customer offer remains exactly Small, Medium and Large; the other observed Shopify sizes were not deleted or changed.

## What is blocked

Customer payment is **not live**. Shopify Payments is explicitly in test mode. The Staged release still lacks an approved delivered physical sample and inspection, final product/media/fulfillment approvals, the complete required release-bound media matrix, a fresh post-approval ACTIVE Production observation, verified rollback execution, and operational `cart-write` authority. The cart capability remains `write_test_verified` with only `cart-write-test`; it is not operational public `cart-write` authority. The Preview and Production public checkout switches remain off. The new controlled-order switch is separate and may prepare only one Product Owner Medium checkout; it cannot enable customer purchasing.

The Product Owner approved the Production-preflight correction on 2026-08-17. The implementation accepts a later selected `main` SHA only when Git proves that the reviewed candidate is its ancestor and every endpoint difference is confined to the explicit evidence-only allowlist. Storefront, component, checkout, media manifest/assets, workflow, script, configuration, theme, malformed-path and symlink changes remain forbidden. This correction is not merged or deployed to Production; its fresh immutable Preview must be reviewed before candidate binding.

Exact source commit `d713f8449487f2c6cd342976499ab283c66bf779` is pushed to PR #14, repository CI is green, and its clean immutable Preview is `https://carlophillips-site-q2jxpnkvz-adityas-projects-261b17a9.vercel.app` (`dpl_DfPkQ7XVYWMQs4GK2JUDmQYn8N5f`). It is READY Preview, has no aliases or dirty marker, keeps checkout disabled, passes eight protected routes, and returns `PRODUCT_RELEASE_NOT_RELEASED` for a valid S/M/L checkout selection. Production remains unchanged. Product Owner visual/release review of this exact Preview is the next candidate-binding action.

## Exact human action

1. Shopify Payments management currently shows the payout account and test mode without a visible two-step setup warning. Keep test mode on. If Shopify later prompts for two-step authentication during final activation, complete it privately and do not send recovery codes, one-time codes, passkeys, or phone details to Codex.
2. Preserve the captured Apliiq per-variant/SKU mapping and verify it against the Staged release. The initial public offer is S/M/L only; Shopify's other variants remain unchanged.
3. After the controlled-order candidate is deployed to protected Staging and `SHOPIFY_CONTROLLED_ORDER_ENABLED=true` is provisioned there, sign in as the Product Owner, open `/admin/orders`, and choose **Open controlled Shopify checkout**. The server fixes the cart to one Medium and verifies the reviewed USD $128 item subtotal. Enter private contact/shipping/payment details only inside Shopify. Before pressing Shopify's final pay button, record and approve the exact shipping, tax, total, and live-payment exposure. Do not submit test order `#1002` for fulfillment: it is XS and uses a fake test destination.
4. Supply or approve the missing truthful release media and bindings; generated candidates cannot be recorded as physical-product proof.
5. After the remaining evidence and approvals are complete, let Codex capture a fresh sanitized ACTIVE Shopify Production observation inside an approved protected runtime. The reviewed Staging observation is already bound; the Production observation must be newer than the final approvals.
6. Review the immutable Staging candidate and separately approve the product, media, and fulfillment evidence for that exact candidate.
7. Keep Shopify Payments in test mode while the hosted-checkout staging proof is verified. Turning off test mode, enabling `SHOPIFY_CHECKOUT_ENABLED`, and accepting real customer charges require the final Released evidence and a separate Production authorization.
8. Review the fresh immutable Preview for the approved preflight correction after PR CI passes. Preview approval does not approve merge, payment, order or Production release.
9. Signal `Controlled Medium Shopify checkout ready — total [AMOUNT]` after Shopify displays the final review total. This is the point for exact spend approval. Do not send credentials, address, payment data, or verification codes in chat.

Do not paste Shopify tokens, payment details, customer data, or provider IDs into chat. Do not enable the two Vercel checkout switches manually while the Product Release Record remains Staged.

Read-only Vercel inspection confirms `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN`, and `SHOPIFY_CART_UI_ENABLED` already exist by name for Preview and Production. `SHOPIFY_CONTROLLED_ORDER_ENABLED`, `SHOPIFY_CHECKOUT_ENABLED`, and `SHOPIFY_CHECKOUT_HOSTS` are not yet provisioned. The first switch enables only the Product Owner controlled checkout in protected Staging; the public checkout switch stays off until the release/capability gates pass. The checkout-host allowlist is the exact comma-separated trusted host list (for example `www.carlophillips.com`).

## Cost and risk

- Code work and read-only observation have no intended purchase cost.
- The physical sample, shipping, tax, and any provider plan are separate costs and require exact approval before purchase.
- Enabling checkout before the release record passes could sell a stale, unverified, or incorrectly fulfilled variant. The candidate therefore remains fail-closed.

## Resume point

After the protected admin action reaches the exact Medium Shopify checkout, present the final one-order cost approval and continue the Staged → Approved → Released sequence. Do not enable public customer charging until the delivered sample, exact release, and operational cart evidence pass.

---

# HUMAN INTERVENTION REQUIRED — PRODUCT OWNER ADMIN SIGN-IN

Updated: 2026-08-14

## What is blocked

The Theme screen is implemented and locally verified, but the admin portal deliberately denies every Vercel Preview and Production request. The verified Vercel project has no remote identity provider or Product Owner identity configuration. Deploying the current code would therefore leave `/admin/theme` inaccessible, and replacing that boundary with a shared bearer token would not establish a named Product Owner identity.

## Exact human action

1. Manually open Vercel Dashboard → team **aditya's projects** → project **carlophillips-site** (`prj_9VHD0AhhQnuml8frfNDsmFLHXcq1`) → Integrations/Marketplace → Clerk. Do not use the duplicate same-named project under the Cubiqo Vercel team.
2. Install Clerk only for this project and only on a no-cost plan. If Vercel or Clerk requests payment, an upgrade, broader team access, or access to another project, stop and report the exact price and permission request instead of accepting it.
3. In Clerk Dashboard, set sign-up mode to **Restricted**, create or invite only the Product Owner account, enable MFA for that account, and keep public sign-up disabled. Do not paste Clerk secret keys into Codex or commit them; the Marketplace integration should provision encrypted environment variables.
4. Copy the Product Owner's non-secret immutable Clerk user ID (format `user_...`) from Clerk Dashboard → Users.
5. Signal completion in the active CARLOPHILLIPS task as: `CP Clerk Product Owner ready: user_...`.

Do not ask Codex to foreground either dashboard. Boss must open these screens manually unless Boss explicitly approves that exact visible action.

## Cost and risk

- The intended setup uses Clerk's no-cost tier, but pricing and plan limits are external and may change. No paid plan or charge is authorized by this handoff.
- Installing the integration creates an external authentication application and encrypted Vercel environment variables for the selected project.
- Public sign-up, email/domain-wide allowlisting, a mutable email-only authorization check, or installing into the duplicate Vercel project could expose the private admin surface.

## Resume point

After the exact completion signal, Sushma resumes from the immutable integration candidate, binds the supplied Clerk user ID to the Product Owner allowlist, verifies unauthenticated/wrong-user/Product Owner access and CSRF/origin behavior in a real Vercel Preview, and returns the Preview evidence before merge and exact-artifact Production promotion.

---

# HUMAN INTERVENTION REQUIRED — CANONICAL GITHUB DELIVERY AUTHORITY

Updated: 2026-08-14

## What is blocked

The canonical integration candidate is locally verified, but the authenticated GitHub identity `avloy07-eng` has `pull=true` and `push=false` on `CubiqoUnited/carlophillips-site`. The protected Preview workflow intentionally rejects fork-owned code, so a fork pull request alone cannot receive protected Vercel credentials or become canonical `main`.

## Exact human action

1. Manually open GitHub → `CubiqoUnited/carlophillips-site` → Settings → Collaborators/Teams and grant `avloy07-eng` the minimum repository role that permits pushing a temporary `codex/*` branch and updating its pull request. Do not grant organization administration.
2. Configure the `Preview` and `Production` environments and `main` ruleset exactly as recorded later in this file: required reviewers, `CI / Verify`, blocked force-push/deletion, and environment-scoped Vercel secret/variable names only.
3. Signal completion in the active CARLOPHILLIPS task as: `CP canonical GitHub delivery ready`.

If permission cannot be granted, a current repository maintainer must push the exact candidate commit to a same-repository `codex/*` branch and own the protected PR/merge. Do not copy files manually or merge the fork branch without preserving the exact SHA and checks.

## Cost and risk

- No charge is intended.
- Repository write access can alter source and workflows. Keep branch protection and required review enabled; do not grant admin or bypass rights.

## Resume point

Sushma rechecks permissions read-only, pushes the exact candidate, opens/updates the canonical PR, runs `CI / Verify`, and only then dispatches the protected immutable Preview after Clerk provisioning is complete.

---

# HUMAN INTERVENTION REQUIRED — CONTAIN LIVE CHECKOUT AUTHORITY DEFECT

Updated: 2026-08-14

## What is blocked

The current superseding candidate is exact commit `ee5ebaece14fe75356461bce3e02292b55d29ef6`. Its frozen verification passes 44 files / 468 tests, and exact headless QA passes 689/689 findings with 68 screenshots and eight byte-identical public comparisons. Boss has requested staging and Production delivery, but the request does not bypass the missing canonical GitHub write path, Clerk Product Owner provisioning, protected Preview evidence, or safe candidate/fallback receipts.

The live Signature Hoodie PDP was independently observed showing `Continue to checkout` while the canonical Product Release Record is Draft, required fingerprints and approvals are missing, rollback verification is null, and the Media Registry has zero storefront bindings. A historical single-product launch file bypassed the canonical release and media gates.

The tested candidate on branch `codex/cp-e2e-admin-control-plane`, exact clean implementation commit `1ea82ef`, removes that authority path, denies checkout before any Shopify read or cart mutation, and requires an independent `checkoutAllowed` decision before the PDP can render a checkout form. It also contains the local Product Owner-only Theme proposal screen and an Evidence Health reconciliation view. Historical cart proof is now `cart-write-test` evidence-only; it cannot satisfy operational `cart-write`. Source QA passes 40 files / 382 tests and the integrated browser matrix passes 538/538 checks with 58 screenshots and an 8/8 exact zero-pixel public comparison. This local change does not alter Production.

A subsequent local-only lifecycle core at exact clean implementation commit `0a4485a` validates and projects sanitized payment-to-post-sale events, but it has no webhook listener, provider credential, durable database, customer data, connector, payment/order/refund authority, or external mutation. It does not reduce any human action below and does not make the live funnel ready.

A further local-only Shopify webhook verifier at exact clean implementation commit `f6b6ee0` validates exact-body HMAC, allowlisted shop/topic, trigger-time/replay bounds, and fingerprint-only quarantine evidence. It still has no registered webhook, authorized secret, durable replay store, payload sanitizer, inbox/outbox, lifecycle mutation, or external call. It does not reduce the intervention or authorize connecting Shopify.

A local admin command policy at exact clean implementation commit `216cb9d` additionally proves fail-closed authorization decisions, but it has no real identity/RBAC, durable idempotency/audit, approval service, connector evidence, executor, or external mutation. It does not make the admin operational, reduce this intervention, or authorize any Shopify/Vercel/GitHub/provider action.

The protected Commands portal at exact clean implementation commit `25cf7e9` makes those unavailable gates visible but adds no control, command, endpoint, or authority. It does not reduce the intervention or authorize external access.

Exact clean implementation commit `98a23f2` also hardens canonical release proof: physical-sample inspection, provider mapping, observation review, media manifest, build/staging/rollback evidence, exact approval targets, and a fresh post-approval Production observation now have immutable release/candidate/fingerprint gates. Provider-specific capability blockers and the Admin's release/system labels are corrected. Exact-commit QA passes 43 files / 433 tests, 669/669 headless findings, 61 screenshots, and eight exact zero-pixel public comparisons. This creates no missing external evidence and does not reduce the Preview or Production approval steps below.

Fresh read-only Vercel and HTTP checks on 2026-08-14 confirm that the latest READY Preview is still commit `f82733c`, READY Production is still commit `bb9568f`, and the live Hoodie PDP still contains `action="/api/checkout"` plus `Continue to checkout`. The containment defect therefore remains live.

The corrected local CI/CD path now requires a separate immutable Preview and a paired no-alias staged Production candidate plus distinct same-SHA/same-release safe fallback. The captured current Production deployment `dpl_2s61reh2JATSRMCYfXYHnFnXT2bH` is a drift anchor only. It is not verified safe and must never be selected as a rollback target. No workflow was dispatched and Production is unchanged.

## Exact human action

1. Boss decides whether to authorize a fail-closed hotfix deployment from a new immutable reviewed candidate. Any staged Production candidate must be accompanied by a distinct same-SHA/same-release no-alias safe fallback that independently passes receipt and smoke verification.
2. If authorizing the hotfix, signal exactly: `Approve CP fail-closed hotfix Preview only`. Sushma may then prepare and verify a Vercel Preview; this signal does not authorize merge or Production.
3. After exact Preview QA visibly proves no checkout CTA, no unbound media, and no Shopify mutation, Boss may separately signal: `Approve CP fail-closed Production containment`.
4. Before any Production promotion, Sushma must return receipt proof for both the distinct staged candidate and distinct safe fallback, plus proof that Production still matches the captured drift anchor. If recovery is needed after an attempted promotion, only that verified safe fallback may be promoted.

Do not open Shopify, GitHub settings, Vercel, or any browser screen for Codex. If a visible screen is later necessary, Boss must manually open it or explicitly approve that exact visible action first.

## Cost and risk

- A Preview deployment should not change the live site, but account/build usage may apply.
- Production containment changes customer purchase availability and therefore needs explicit Product Owner approval.
- An unverified rollback could restore the same bypass or older defects. The current Production drift anchor is not a recovery artifact; only the distinct verified safe fallback may be promoted after an attempted-promotion failure.
- No Shopify catalog, channel, order, payment, fulfillment, or billing change is authorized.

## Resume point

Resume from the isolated branch by creating one immutable candidate commit, verifying Local and exact Preview at 1440×1000, 1024×768, and 390×844, and binding the results to the Product Release Record. Production remains a separate approval.

---

# HUMAN INTERVENTION REQUIRED — SIGNATURE HOODIE SAMPLE FIRST

Updated: 2026-08-09

## Product Owner decision

The first remaining physical-media gate is one exact Signature Hoodie sample. Do not spend on additional image credits, video, 360, or 3D generation before this sample path is confirmed.

## Exact action and safe order

1. Treat authenticated Apliiq access and saved product `5958463` as already evidenced read-only: blank `IND4000`, black, front embroidery, and the retained artwork. This grants no order, fulfillment, or release authority.
2. Record the exact provider variant/SKU mapping fingerprint for the Hoodie without changing configuration, accepting a plan, or placing an order; then signal `Apliiq variant mapping captured` in the active Codex task.
3. Codex binds that exact fingerprint to the release evidence and checks it against the intended Shopify variant mapping. Saved-product resemblance alone is not sufficient to place an order.
4. After the exact item and mapping are verified, Codex reports the one-sample item, selected size, shipping destination requirement, total price, and any risk. The Product Owner must approve that exact order and total before checkout.
5. After delivery, capture and inspect the sample in one consolidated session: front, back, both profiles, both three-quarter views, on-body fit, walking/turning video, 24–36 evenly spaced spin angles, embroidery macro, outer fleece, inner fleece, hood/drawcord, pocket/seams, cuffs, and hem.

## Cost and risk

- A physical sample, shipping, and possibly tax will incur a real charge; no amount is approved yet.
- Do not order a guessed blank, size, decoration, or unverified provider mapping.
- Do not accept paid media-app plans or generation credits as part of this handoff.
- No production publish, customer order, bulk inventory, or live-site change is authorized by this sample-first decision.

## Resume points

- After exact mapping capture: `Apliiq variant mapping captured` → bind and verify the provider/Shopify variant fingerprint read-only.
- After exact sample quote: Product Owner approves or rejects the named item and exact total.
- After delivery/capture: `Hoodie sample media uploaded` → ingest, curate, produce the genuine spin/video/3D derivatives, verify desktop/mobile, and stage in Vercel Preview before any separate Production decision.

The previously requested runway-motion file remains optional and secondary to the physical Hoodie sample.

---

# HUMAN INTERVENTION REQUIRED — PRODUCTION AUTHORITY CLOSURE

Updated: 2026-08-14

## Exact actions

1. Boss nominates one human Platform/Security owner and one Account/Billing owner in the active CARLOPHILLIPS task.
2. The business/legal content owner reviews the technical drafts at `/privacy`, `/terms`, and `/cookie-policy`, supplies the missing seller/contact/retention/processor/order/returns language, and signals `CP policy content approved` only after the exact text is accepted.
3. An authorized GitHub administrator opens repository Settings → Branches/Rulesets for `CubiqoUnited/carlophillips-site`, requires the exact `CI / Verify` check and pull-request review on `main`, and signals `CP main protection enabled`. The authenticated Codex account `avloy07-eng` has pull-only access and received GitHub API `403 Must have push access`; it cannot perform this administrator action. Do not change the Production branch or merge a pull request as part of this configuration action.
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

---

# HUMAN INTERVENTION REQUIRED — ENABLE CI/CD PROTECTION AFTER FIRST GREEN RUN

Added: 2026-08-14

Status: **PR #10 is merged and the first `CI / Verify` run on `main` was reported green. Repository/environment protection must still be verified and configured before Production workflow enablement.**

## Exact safe order

1. Verify PR #10 is merged as `cd5c64d24481311b2ca195768e2250ed28eff2c6` and the `CI / Verify` run on that exact `main` commit is green.
2. In GitHub repository rulesets, protect `main`: require pull requests, at least one approval, required status `CI / Verify`, and block force-push and deletion. Do not require the stale Vercel fork-policy status.
3. In GitHub Environments → `Preview`, add at least one required reviewer. Add `VERCEL_TOKEN` as an environment secret and `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` as environment variables. This environment is only for exact-PR-head Preview deployments with Preview semantics and no Production alias.
4. In GitHub Environments → `Production`, add at least one required reviewer. Disable administrator bypass if repository policy permits.
5. In `Production`, add `VERCEL_TOKEN` as an environment secret. Add `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` as environment variables. Do not share or print any credential value.
6. Only after the reviewer rule is visible, add `CP_PRODUCTION_PROMOTION_ENABLED=true` as a `Production` environment variable.
7. Return to the active Codex task and signal `CI/CD protection configured`. Do not dispatch Preview or release-candidate workflows without approval for those exact immutable artifacts. Do not dispatch Production promotion without the pair receipt's exact candidate ID, safe-fallback ID, SHA, release, and `productionBeforeDeploymentId`, review of both artifacts, and a separate Product Owner release decision.

## Cost and risk

- GitHub/Vercel configuration has no intended charge, but Vercel use remains subject to the account plan.
- A wrong secret scope can expose deployment authority; keep `VERCEL_TOKEN` only in the protected `Preview` and `Production` environments and never place it in pull-request jobs or repository files.
- A required status configured before its first check exists can deadlock merges. That is why the green run comes first.
- After an attempted-promotion failure, the Production workflow promotes only the separately verified safe fallback. It never promotes the captured current Production drift anchor. Workflows do not replace Product Owner approval or live-release supervision.

## Resume point

After `CI/CD protection configured`, verify the ruleset plus both environment reviewer/variable/secret-name configurations read-only. Do not reveal values. A release-candidate run must create distinct same-SHA/same-release `staged-production` and `safe-fallback` deployments with no CARLOPHILLIPS domain aliases. Production remains unchanged until a separately approved promotion dispatch.

# RED — PROTECTED STAGING VERCEL AUTHORITY BLOCKS THE RELEASE GATE

Updated: 2026-09-03 EDT

## What is blocked

Protected Staging run `33733157896` for PR #67 at exact lifecycle candidate
`3bff804b1a55691a38e9406eb1f97d21b5b21a3c` passed pull-request/SHA
validation and the full repository verification, then failed safely at
`vercel pull --environment=preview --scope=cubiqo-projects-d7156840` with
`You do not have access to the specified account`.

No Vercel build, deployment, alias change, webhook probe, Shopify test order,
or protected release receipt occurred. Production and the cleanup work item
remain locked. The 2026-09-02 test-gateway order is historical evidence only;
it is not bound to the new combined lifecycle-plus-gate commit and must not be
reused as this release's receipt.

PR #67 has since advanced to the authoritative remote head
`fcc836e3b7b33fe6bf7c917ee52abb46d6a5557c`; CI run `33734041715` and
Playwright run `33734041704` passed. The earlier `3bff804…` attempt is a
historical failure record only. Any PR #67 retry before merge must bind exactly
to `fcc836e3b7b33fe6bf7c917ee52abb46d6a5557c`; the final release-gate proof
must instead bind the combined lifecycle-plus-gate merge commit on `main`.

## Exact human action

1. Manually open GitHub → `CubiqoUnited/carlophillips-site` → Settings →
   Environments → **Staging**. Do not ask Codex to foreground this screen.
2. Replace or reauthorize only the Staging environment secret `VERCEL_TOKEN`
   so it can access canonical team `team_Q25fvpJOPiIeoG3hfxtCVkhW`, project
   `prj_9VHD0AhhQnuml8frfNDsmFLHXcq1`, and scope
   `cubiqo-projects-d7156840`. Keep the token environment-scoped and do not
   paste its value into chat, source, workflow inputs, logs, or this file.
3. Do not point the workflow at another same-named Vercel project and do not
   bypass the Staging reviewer protection. Confirm the configured non-secret
   `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, and `VERCEL_SCOPE` still identify the
   canonical values above.
4. Signal completion in the active task with:
   `CP canonical Staging Vercel token ready`.

## Cost and risk

No charge is intended. A Vercel token can deploy and change aliases within its
scope, so grant only the minimum canonical Cubiqo project/team access and keep
Production approval and promotion disabled. Using a different project/token
would produce invalid evidence and is not an authorized workaround.

## Resume point

After the completion signal, rebase the release-gate work onto the merged PR
#67 lifecycle candidate, run the protected workflow for the exact combined
`main` SHA, and require the immutable deployment/alias, isolated Shopify
development-store snapshot, 1440/390 browser/a11y evidence, signed duplicate
probe, and unchanged checkout-enabled Production receipt. Only then may the
protected synthetic test payment, confirmation/order-status capture,
cancellation/refund, and inventory restoration be performed. Record that
separate human payment intervention before entering test checkout data.

---

# CURRENT — POST-SALE CAPABILITY ACTIVATION (HUMAN-OWNED)

Updated: 2026-09-03 04:31 EDT

## Blocking protected Staging credential binding

Protected Staging run `33733157896` validated open PR #67 and exact candidate
`3bff804b1a55691a38e9406eb1f97d21b5b21a3c`, then passed the complete
repository/E2E gate. It failed safely before Vercel build, deployment, alias,
webhook probe or receipt when `vercel pull` returned `You do not have access to
the specified account` for scope `cubiqo-projects-d7156840`, organization
`team_Q25fvpJOPiIeoG3hfxtCVkhW` and project
`prj_9VHD0AhhQnuml8frfNDsmFLHXcq1`. Production was not changed.

Exact human action:

1. Manually open **Vercel → Cubiqo team → Account Settings → Tokens** and
   create or select a least-privilege automation token that can access only the
   canonical Cubiqo project above. Do not paste the token into Codex, a report,
   a shell command, a screenshot or Git.
2. Manually open **GitHub → CubiqoUnited/carlophillips-site → Settings →
   Environments → Staging → Environment secrets** and replace `VERCEL_TOKEN`
   with that encrypted value. Keep `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` and
   `VERCEL_SCOPE` bound to the exact identifiers above; do not broaden the
   token to another team or project.
3. Signal completion with: `CP Staging Vercel token rebound`.

Risk/cost: this token can create Preview deployments and move the protected
Staging alias in the canonical project. A wrong team/project binding can deploy
to or expose the wrong environment. No paid-plan acceptance is authorized; stop
if Vercel requests payment, Production access or a broader account grant.

Resume point: release-gate work item
`01a06651-0436-7a21-ac5e-e7ef913e3f9f` reruns **Protected Vercel Staging** for
PR `67`, exact SHA `3bff804b1a55691a38e9406eb1f97d21b5b21a3c` and release
`cp-post-sale-lifecycle-2026-09-03`. Require READY immutable deployment, protected
alias, route checks, signed PII-free webhook probe and retained receipt before
claiming Staging complete. Do not retry with a different SHA or change the
workflow/lifecycle implementation to bypass the credential boundary.

## What the application now does

PR #67 adds a truthful `/aftercare` customer journey. Shopify remains the
authority for order, payment, fulfillment, tracking, cancellation, refund and
credit. Preview reads only dedicated `SHOPIFY_STAGING_ACCOUNT_URL` and
`SHOPIFY_STAGING_RETURNS_URL` destinations and never falls back to Production.
Query-bearing, fragment-bearing, credential-bearing or non-HTTPS destinations
are rejected. Reviews cannot be enabled by a URL or environment flag: the CTA
requires an authenticated Shopify customer fact that the order is delivered.
CP Credit is absent from the page unless an authenticated Shopify credit
account exists. The support form delivers through Resend only when its three
server-side settings are valid, and reports success only after the provider
accepts the message.

## Exact human actions still required

1. Manually open **CARLOPHILLIPS Staging Shopify Admin → Settings → Customer
   accounts**. Activate the intended customer-account experience and obtain its
   public account entry URL. Add it only to Vercel Preview as the encrypted
   server variable `SHOPIFY_STAGING_ACCOUNT_URL`, redeploy the exact protected
   candidate, sign in as a synthetic test customer and prove that only that
   customer's test order/status is visible. Do not paste or retain a private
   order-status URL. Signal: `CP Staging customer account proven`.
2. Manually open **CARLOPHILLIPS Staging Shopify Admin → Settings → Policies /
   Customer accounts returns**. Approve the return rules and operator routing,
   enable Shopify-native self-service returns, and add only the public entry URL
   to Vercel Preview as `SHOPIFY_STAGING_RETURNS_URL`. Use an already fulfilled
   zero-charge Staging test order to submit and close one return. Signal:
   `CP Staging returns proven`.
3. Manually open **Vercel → Cubiqo → carlophillips-site → Settings → Environment
   Variables** and the approved **Resend** project. Verify a CP sending identity
   and monitored support recipient, then add encrypted Preview values for
   `RESEND_API_KEY`, `CP_SUPPORT_FROM_EMAIL`, and `CP_SUPPORT_TO_EMAIL`. Submit
   one synthetic no-PII Staging support message and confirm receipt in the
   monitored mailbox. Signal: `CP Staging support delivery proven`.
4. Product Owner selects and approves a Shopify-integrated reviews provider,
   including price and protected customer/order data access. Configure
   delivered-order eligibility in Staging. The application must then complete
   Shopify Customer Account API authentication and pass an authenticated
   delivered-order fact to the existing policy; a public review URL alone will
   remain rejected. Signal: `CP Staging verified reviews authority ready`.
5. Product Owner decides whether CP Credit is offered. If approved, configure
   Shopify store credit and Customer Account API access in Staging. The
   application must then pass authenticated `StoreCreditAccount` availability
   to the existing policy; there is deliberately no enable flag. Signal:
   `CP Staging credit authority ready`.
6. Apliiq production, tracking and delivery cannot be proved in Shopify's
   development-store test payment alone. Under separate real-order authority,
   place one low-risk Production order using a mapped Production SKU, verify
   Apliiq acceptance/hold, production, tracking returned to Shopify and
   Shopify's CP-branded dispatch/delivery communication. Signal:
   `CP Production Apliiq lifecycle proven`.

## Cost and risk

- Customer Accounts and Shopify-native returns should not create a real charge,
  but publishing policy/account changes affects customer behavior; verify in
  Staging first. A fulfilled test order is required for Shopify return
  eligibility; do not create a Production order for this proof.
- Resend may process customer email, order reference and message content. Use
  synthetic data for Staging proof, confirm the recipient is monitored and stop
  if setup requests a paid plan or broader data/project access.
- A reviews app may request customer/order data or a paid subscription. No app,
  data grant or charge is authorized until the Product Owner selects it.
- Store credit is a financial liability. Do not invent, issue or migrate a
  balance without Product Owner approval and Shopify records.
- Apliiq has no complete production sandbox. The final provider proof may create
  a real garment, charge and customer/provider communication, so it remains a
  separately approved Production action.

## Resume point

After each exact signal, resume PR #67 at its current head, bind only the
corresponding Staging capability, rerun protected Staging plus desktop/mobile
and console/network QA, and retain Shopify/Vercel evidence without customer PII.
Reviews and credit additionally require a server-authenticated Customer Account
API implementation; do not substitute public flags. Production remains
unchanged until Product Owner reviews canonical Staging and separately approves
promotion.

---

# CURRENT — RELEASE CLOSURE STATUS (AUTHORITATIVE)

Updated: 2026-09-02 22:45 EDT

## Completed

- PRs #55 and #65 are merged; the Production application baseline is
  `main@7cbde6b43526428ec2dd40a1a9b9099a4364b2d6` and protected Staging is
  `staging@ff011904e01b6e803239769cdbb302f89c508ec4`.
- Protected Staging run `33708272754` passed for exact commit
  `ff011904e01b6e803239769cdbb302f89c508ec4` and deployed
  `dpl_7jwf7wZrgWdgi4wmNoGfSSGkDXDQ` to `staging.carlophillips.com` in the
  canonical Cubiqo project. Its signed zero-PII webhook probe passed.
- The isolated Shopify development-store product has 12 ready media assets,
  approved description, Black S/M/L variants, USD 128 pricing, test-only SKUs,
  and 25 units per size.
- A zero-charge Shopify Test Payment Gateway order proved cart, checkout,
  payment, native confirmation, signed webhook ingestion, cancellation,
  bogus-gateway refund, inventory restock, and native cancellation notice.
  The order is canceled, refunded, archived, and requires no fulfillment.
- Local and remote Git now retain only `main` and `staging`; exactly two clean
  worktrees remain. All removed work is recoverable from
  `/Users/edv/Documents/CARLOPHILLIPS-ARCHIVE-2026-09-02`.
- Production was restored after an unintended Git deployment returned HTTP 500.
  `www.carlophillips.com` is healthy on checkout-enabled deployment
  `dpl_GTkysazmXPKnwK7rHGTYhaWVJYLZ`.
- Production-target deployment `dpl_9v24z9tSApfdBy1qtL8hiQyFM7EE`, started by
  the evidence-only merge, was canceled before it became live. The canonical
  Vercel project now has `link: null`, `gitRepository: null`, and Git deployment
  creation disabled.

## External convergence completed

The canonical Cubiqo project is `team_Q25fvpJOPiIeoG3hfxtCVkhW` /
`prj_9VHD0AhhQnuml8frfNDsmFLHXcq1` and now owns Production plus isolated
protected Staging. After exact-domain, environment, deployment, workflow and
Git-link inventory, redundant Aditya project
`prj_i51hiKpEKrwaqblD2vaO6zhXUDCs` was deleted by ID. Staging and Production
both returned HTTP 200 after deletion; apex and `www` remained on verified
checkout-enabled Production deployment `dpl_GTkysazmXPKnwK7rHGTYhaWVJYLZ`.

No Apliiq Staging handoff was configured or triggered. Production Apliiq
intake/tracking still requires a separately approved real Production order;
the development store cannot prove provider production fulfillment.

---

# SUPERSEDED — SHOPIFY CLOSURE STAGING ISOLATION

Updated: 2026-09-02

## What is blocked

The isolated infrastructure now exists:

- Shopify development store `carlophillips-staging.myshopify.com` was created with Shopify test data and its bogus test gateway.
- Vercel Upstash resource `cp-commerce-webhooks-staging` was created and bound only to Preview; Production KV associations were removed from Preview without changing Production.
- Preview-only store identity, checkout-host, allowed-shop, durable-store identity, webhook-secret, and purchase-enable variables were added.

Protected Staging still cannot deploy because two browser permission boundaries and one GitHub owner action remain:

- Shopify's official free Headless channel is ready to install on the development store, after which a persistent Storefront API token must be created and bound to Preview.
- The existing `CodexAutomation5` app must be installed on the development store before Staging webhook subscriptions can be registered.
- GitHub has no `Staging` environment. Chrome and CLI are authenticated as `avloy07-eng`, which GitHub does not permit to open repository Environment settings. The repository collaborator API identifies `CubiqoUnited` as the administrator, and no second GitHub account is currently connected in the browser account switcher.

Current authentication handoff: Shopify accepted the authorized Google identity and is waiting at **Verify with your passkey**. Boss must open the preserved Chrome tab and complete the device fingerprint, face recognition, or PIN prompt; Sushma cannot read or bypass that local authenticator. After Shopify returns to `CARLOPHILLIPS Staging`, tell Sushma `CP Shopify passkey complete`. GitHub owner authentication follows after the Shopify tab is released.

The new runtime correctly refuses this unsafe configuration. Do not point Staging at the Production Shopify store, enable Shopify test mode on Production, or share the Production durable store.

## Exact human action

1. Give action-time confirmation in the active task for Sushma to install Shopify's official Headless channel and the existing `CodexAutomation5` app on **CARLOPHILLIPS Staging only**, and to create the Staging Storefront API token. These are persistent app/access grants; no Production store is in scope.
2. In the preserved GitHub Chrome tab, choose **Add account** and authenticate as repository administrator `CubiqoUnited`; then tell Sushma `CP GitHub owner session ready`. Sushma will create `Staging`, add the required reviewer, and bind only the required environment secrets/variables. Alternatively, that administrator can create it manually with `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `SHOPIFY_STAGING_WEBHOOK_SECRET`, and `SHOPIFY_STAGING_STORE_DOMAIN`.
3. After the protected deployment is live, configure the Signature Hoodie S/M/L test product, Shopify notification branding, eight webhook subscriptions, and the Apliiq hold/manual-review test behavior in the development store. No provider production job or real payment is authorized.

Signal completion with: `CP isolated Staging bindings ready`.

## Cost and risk

The development store cannot process a real payment. The dedicated Upstash resource uses the authorized Pay As You Go plan ($0.20 per 100,000 commands) with automatic upgrades disabled. Shopify app installation creates persistent access to the development store, which is why action-time confirmation is required. Apliiq production submission, a Shopify paid plan, real payment, Production promotion, or broader Production access remains excluded.

## Resume point

After the two confirmations above, finish the Preview token binding, protect the GitHub environment, dispatch `Protected Vercel Staging` for the exact head SHA of open PR #55, register the eight implemented topics only after endpoint/probe success, and complete the test-payment, branded Shopify notification, duplicate delivery, refund/cancel and supported Apliiq hold/manual-review evidence. Keep PR #55 open for the independent reviewer and merger.

---

# RED — CURRENT CUSTOMER-READY EXTERNAL CONFIGURATION

Updated: 2026-08-31

> **CURRENT VERCEL IDENTITY WARNING (supersedes older same-name project
> assumptions below):** two different Vercel projects are named
> `carlophillips-site`. The GitHub PR integration currently deploys to
> `aditya's projects` / `prj_i51hiKpEKrwaqblD2vaO6zhXUDCs`, while
> `carlophillips.com` is currently served by the Cubiqo project
> `prj_9VHD0AhhQnuml8frfNDsmFLHXcq1`. Do not add, copy, delete, or rotate
> credentials and do not move domains until the Product Owner/platform owner
> selects one canonical project. The detailed safe handoff is in the final
> section of this file.

Repository release-record, fingerprint, sample, and approval-JSON gates are no
longer part of public commerce. Three external service actions remain before
the full customer-ready claim can be signed off.

## 1. Shopify Preview checkout parity

Manually create or select a dedicated Shopify development/staging store, clone
the Signature Hoodie S/M/L product and shipping configuration, and enable only
Shopify test payments there. Add these encrypted Vercel Preview variables:
`SHOPIFY_STAGING_STORE_DOMAIN`, `SHOPIFY_STAGING_STOREFRONT_TOKEN`, and
`SHOPIFY_STAGING_CHECKOUT_HOSTS`. Never enable test mode on the Production
store. Signal completion with `CP Shopify staging checkout ready`.

Cost/risk: the intended development store and test gateway should not process a
real charge; stop if a paid plan or real payment activation is requested.

## 2. Contact delivery

Manually accept the Resend terms for the CARLOPHILLIPS/Vercel project, verify a
sending domain/address, nominate a monitored customer-support recipient, and
add encrypted Production/Preview values for `RESEND_API_KEY`,
`CP_SUPPORT_FROM_EMAIL`, and `CP_SUPPORT_TO_EMAIL`. Signal completion with
`CP support delivery ready`.

Cost/risk: customer email, message text, and an optional order number will be
sent to the configured support mailbox after submission. Do not enable this
until the monitored recipient and handling process are approved. No customer
data is transmitted while the variables are absent; the API truthfully returns 503.

## 3. Shopify-hosted checkout appearance and fields

Manually open Shopify Admin → Settings → Checkout → Customize, duplicate the
active configuration, and edit the draft. Use the approved transparent
CARLOPHILLIPS wordmark; keep one-page checkout; use the black/off-white brand
palette, near-black primary button, high contrast, and minimal radius. Configure
Email contact; first and last name required; Company omitted; shipping phone
omitted unless the carrier requires it; Address line 2 optional; guest checkout
and available accelerated wallets retained. Add approved Return, Shipping,
Terms, and Privacy policies. Review desktop and mobile and signal
`CP checkout draft ready for Pushpa` before publication.

Cost/risk: Shopify's standard editor supports these changes on current plans;
do not upgrade to Plus or accept a paid app solely for styling. Publishing the
draft changes the live hosted checkout appearance.

Do not foreground these dashboards. Boss opens them manually unless the active
task explicitly approves that exact visible action.

---

# HISTORICAL RECORD — SIGNATURE HOODIE LIVE OBSERVATION

Updated: 2026-08-30

## No launch intervention is required

The approved staging presentation is live at `https://www.carlophillips.com` from
Production commit `7c0fd6cb92d61c9a74cc83e64eb4291c31f0fd8c`. The storefront displays the
approved two videos and twelve images, the reviewed USD $128 offer, and Small, Medium,
and Large selections. Its same-origin checkout creates the exact approved Shopify cart
and redirects to the trusted Shopify-hosted checkout/payment page.

The final desktop and mobile checks returned HTTP 200 with no page errors, overlays, or
horizontal overflow. A no-order checkout check returned HTTP 303 from the CARLOPHILLIPS
endpoint and HTTP 200 at Shopify Checkout. It showed one Black / Medium Hoodie at USD
$128 and the live payment controls. No customer data, payment, order, or fulfillment
request was submitted.

The Product Owner explicitly rejected the agent-authored physical-sample condition for
this exact launch. It is not a launch gate. Do not instruct the Product Owner to order
or inspect a Hoodie, and do not reintroduce that requirement under another label. The
truthful record is simply that no sample was ordered or inspected.

The two videos are already delivered by the approved storefront media registry, so no
Shopify Admin upload or browser-extension permission is required for this launch.
Future-product authorization remains separate from this exact Product Owner-approved
Hoodie offer.

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

# RED — MEDIA GENERATION ACTIVATION DECISIONS REQUIRED

The feature-flagged Admin review workspace can be tested in protected Staging without external effects. Do **not** enable paid generation, upload candidates, or activate any mutating control until the Product Owner records all of the following:

1. Private Draft/quarantine storage provider, retention period, deletion policy, and expected cost.
2. Initial fashion provider (MODA or Modelize), initial 3D provider (Instant 3D or Spacecheck), ProductSpin access method, and exact Runway access boundary.
3. Per-run and monthly credit ceilings, including whether approval is required for every run.
4. Numerical tolerances for colour, logo shape/scale, artwork placement, silhouette, fit, and construction.
5. Rights evidence accepted for each source and provider.
6. Roles allowed to generate/regenerate versus quarantine, approve, assign, upload, and release.
7. Confirmation that “80–90% slow motion” means playback at `0.8–0.9×`, plus approval of the final 7–8 second edit.

Cost/risk: provider calls may consume credits; storage may incur recurring cost; inaccurate generated media can misrepresent a garment. Shopify upload/publication affects customer-visible product media and must remain separately approved.

Completion signal: reply with `Media Generation activation decisions recorded` and the approved provider/storage/cost/tolerance/role details. Until then, Staging remains review-only and Production remains off.

---

# RED — FUNNEL 2 PROVIDER AUTHENTICATION AND CREDIT BOUNDARIES

Updated: 2026-08-18

## What is complete

- Both existing Hoodie MP4s are now Product Owner-approved for the feature-flagged Staging presentation.
- The Runway derivative is 7.79 seconds at 0.9× playback with the first two seconds removed; the Fit & Silhouette derivative is 5.04 seconds.
- Both are checksum-bound, format-verified and truthfully classified as AI editorial. This supersedes the earlier request for two additional motion feeds for Staging UAT only; it does not claim physical verification or Production media publication.
- A sanitized Admin connection registry now covers Modelize, MODA, Sugata, TAYLA, Raspberry AI, ProductSpin AI, Instant 3D, Spacecheck and Runway without exposing secrets or spending credits.

## What remains blocked

No named Funnel 2 provider currently has a verified server-to-server authenticated handshake. Runway has an official API contract but the Vercel project has no `RUNWAYML_API_SECRET`. MODA is a Shopify app review/install path. Modelize and Sugata are browser-session paths. TAYLA requires provider access discussion. Official supported APIs for Raspberry AI, ProductSpin AI, Instant 3D and Spacecheck are not yet bound to this project.

## Exact human actions

1. Choose the initial paid fashion provider and approve its exact plan/credit ceiling. Do not install or purchase a plan merely to clear this record.
2. For Runway, create a least-privilege API key only after approving a per-run and monthly maximum. Add it as the encrypted Vercel environment variable named `RUNWAYML_API_SECRET` for Preview only; never paste the value into chat, GitHub, reports or screenshots.
3. For MODA, manually review the Shopify app scopes and price before installation. Stop if it requests catalog write, publication, order, customer or billing access outside the approved Draft-media boundary.
4. For ProductSpin AI and the selected 3D provider, supply the exact commercial product URL and official API documentation or enterprise contact response. Similar names and research projects are not integration authority.
5. Signal completion as: `Funnel 2 provider access ready — [PROVIDER] — max [AMOUNT]/run and [AMOUNT]/month`.

## Cost and risk

Provider generation can incur real charges and can create inaccurate product media. Authentication alone does not authorize generation, Shopify upload, publication or Production use. Every generated result remains quarantined until accuracy QA and Product Owner approval.

## Resume point

Run a read-only authentication probe for the named provider, capture a sanitized receipt, then enable only the corresponding Draft generation control in protected Staging. Do not call other providers or spend beyond the approved ceiling.

---

# RED — VERCEL AND SHOPIFY ANALYTICS ACTIVATION CHECK

Updated: 2026-08-18

The code path for Vercel Web Analytics and Speed Insights is prepared for public routes and excludes `/admin`; query strings are removed before page events are sent. Shopify remains authoritative for checkout, orders, conversion, revenue and payment reporting.

If the Staging deployment does not start accepting the Vercel analytics beacons automatically, manually open Vercel Dashboard → `aditya's projects` → `carlophillips-site` → Analytics and enable Web Analytics and Speed Insights for that exact project. Do not accept a paid upgrade without reporting the exact price first. Signal `CP Vercel analytics enabled` after the dashboard confirms data collection. No consent banner should be added for this technical implementation.

Resume by verifying the public beacon responses, confirming Admin exclusion at desktop/mobile, and checking that Shopify order analytics remain separate from Vercel traffic/performance analytics.

---

# RED — SHOPIFY-AUTHORITATIVE STAGING ENVIRONMENT AND WEBHOOK DELIVERY

Added: 2026-08-31

## What Codex completed

- Branch `codex/shopify-authoritative-release-go` implements Shopify-authoritative catalog/PDP data, current-variant validation, a persistent Storefront Cart API bag, hosted checkout handoff, Storefront API `2026-07` response verification, and signed durable webhook ingress.
- Full repository verification and 20/20 headless desktop/mobile browser checks pass locally.
- Pull request #54 is open from the release branch. Repository verification,
  checkout E2E/accessibility, and the Git-integrated Vercel build all pass.
- Vercel currently contains two different projects named
  `carlophillips-site`:
  - `aditya's projects` (`team_8ABMxicIAtMyzgNYsJawFad0`) /
    `prj_i51hiKpEKrwaqblD2vaO6zhXUDCs` receives the GitHub PR Preview. That
    Preview is `READY`, but the project has no Preview or Production
    environment variables, so it is build evidence only and is **not** a
    Shopify Staging deployment.
  - Cubiqo (`cubiqo-projects-d7156840`) /
    `prj_9VHD0AhhQnuml8frfNDsmFLHXcq1` currently serves
    `carlophillips.com` and `www.carlophillips.com`. It has existing
    environment configuration, but the dedicated Staging and durable webhook
    values required below are not complete.

## Exact human actions required before Staging deployment

1. Manually open Vercel Dashboard and select one canonical project. The safest
   consolidation direction is to retain the Cubiqo project that already owns
   the public domains and move/fix the GitHub Preview integration there, but
   the Product Owner/platform owner must approve the choice because it changes
   deployment authority. Do not delete the other project until domains,
   variables, Git integration, Preview, and Production are verified on the
   chosen project. Signal `CP canonical Vercel project selected` with the team
   slug and project ID only—never secret values.
2. In the selected canonical project → Settings → Environment Variables, add
   these **Preview-only** encrypted values from a dedicated Shopify
   development/test store: `SHOPIFY_STAGING_STORE_DOMAIN`,
   `SHOPIFY_STAGING_STOREFRONT_TOKEN`, `SHOPIFY_STAGING_CHECKOUT_HOSTS`, and
   `SHOPIFY_STAGING_WEBHOOK_SECRET`. Do not point these names at the Production
   store and do not paste values into Codex, GitHub, screenshots, or reports.
3. In that Shopify test store, keep test payments enabled and confirm no real
   customer/payment data will be used. The store must expose the intended test
   products, variants, images/video, and the `custom.tagline`,
   `custom.material`, `custom.fit`, `custom.care`, and `custom.size_guide`
   product metafields to the Storefront API.
4. Provision a durable Redis-compatible REST store for webhook idempotency.
   Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (or the
   corresponding `KV_REST_API_*` names) to Vercel Preview and Production. Do
   not accept a paid plan until Boss approves its exact price and ceiling.
5. Add `SHOPIFY_WEBHOOK_ALLOWED_SHOPS` to Preview and Production with only the
   exact test and Production `*.myshopify.com` domains. Add
   `SHOPIFY_WEBHOOK_SECRET` to Production. Add
   `SHOPIFY_CHECKOUT_ENABLED=true` to Production; the release workflow still
   creates a separate checkout-disabled emergency artifact.
6. Signal `CP Shopify staging environment ready`. Codex will deploy the exact
   branch SHA to protected Staging, test catalog → PDP → selected Shopify
   variant → bag add/update/remove → isolated Shopify checkout, and verify the
   executed API version header.
7. Only after the Staging endpoint exists, register signed Shopify webhook
   subscriptions for `orders/create`, `orders/paid`, `orders/cancelled`,
   `orders/fulfilled`, `orders/updated`, `fulfillments/create`,
   `fulfillments/update`, and `refunds/create` against
   `/api/webhooks/shopify`. Signal `CP Shopify webhooks registered` after a
   signed test delivery reaches the correct environment exactly once.
8. In Shopify/Apliiq Admin, verify the current product/variant fulfillment
   mapping without placing an order or enabling a new paid service. A real
   controlled order, payment, POD intake, fulfillment, cancellation, or refund
   requires separate approval for its exact product, shipping destination,
   tax, total cost, and rollback plan.

## Cost and risk

- Creating or using a test store and a durable Redis service may be plan-dependent. Report any non-zero price before purchase or upgrade.
- Copying credentials or moving domains between the two same-named Vercel
  projects can expose Production data or route public traffic to the wrong
  artifact. Consolidate one resource at a time and retain rollback evidence.
- Using Production Shopify credentials in Preview could create real carts/orders or expose customer data. Keep the stores isolated.
- Registering subscriptions before the endpoint is deployed creates a false configured state; deploy first, register second, then prove signed delivery.
- Production promotion remains separately Product Owner-approved. These setup actions do not authorize a purchase, fulfillment, refund, merge, Production deployment, or branch deletion.

## Resume point

After both completion signals, rerun environment-name verification without printing values, execute protected Staging happy paths and screenshot comparison, capture the immutable deployment/SHA receipt, and request the separate Product Owner Production go/no-go decision.

## 2026-08-31 progress and remaining owner actions

The Product Owner authorized Cubiqo as the canonical Vercel project without
exposing secret values. Codex completed these background-only changes:

- Linked the clean PR worktree to Cubiqo project
  `prj_9VHD0AhhQnuml8frfNDsmFLHXcq1`.
- Added the non-secret `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` variables to
  the GitHub `Preview` and `Production` environments.
- Added the existing local Vercel CLI credential directly to the GitHub
  `VERCEL_TOKEN` environment secrets without printing or reading its value.
- Verified that the required dedicated Shopify Staging values do not exist in
  the canonical Vercel Preview environment; no Production Shopify value was
  copied or repurposed.
- Selected Upstash Redis plan `free`, Preview only, with `autoUpgrade=false`
  and `prodPack=false`. Vercel stopped before resource creation because the
  Upstash Marketplace terms have not been accepted. No resource or charge was
  created.

Three human actions remain and must be completed without pasting any secret
value into chat:

1. A GitHub repository administrator must open
   `CubiqoUnited/carlophillips-site` → Settings → Environments. Add a required
   reviewer to both `Preview` and `Production`; limit Preview deployments to
   `codex/*` and Production deployments to `main`. Codex's authenticated user
   received HTTP 403 on these four policy changes, although variable and
   secret configuration succeeded.
2. A Cubiqo Vercel owner must manually open
   `https://vercel.com/cubiqo-projects-d7156840/~/integrations/accept-terms/upstash?source=cli`,
   review and accept the Upstash Marketplace terms. The prepared retry uses
   only the free plan, Preview environment, `autoUpgrade=false`, and
   `prodPack=false`. Signal: `CP Upstash terms accepted`.
3. A Shopify owner must create or identify the dedicated development/test
   store and app, then add these Preview-only encrypted values to the canonical
   Cubiqo Vercel project: `SHOPIFY_STAGING_STORE_DOMAIN`,
   `SHOPIFY_STAGING_STOREFRONT_TOKEN`, `SHOPIFY_STAGING_CHECKOUT_HOSTS`, and
   `SHOPIFY_STAGING_WEBHOOK_SECRET`. The webhook secret must be the matching
   Shopify app client secret; Codex must not invent it. Signal: `CP Shopify
staging environment ready`.

Do not dispatch the manual Staging workflow until all three actions are
verified. A Git-integrated Preview build is not the protected Staging release
gate.

### Verification after reported completion signals

At 2026-08-31, Codex rechecked all three signals without reading values. None
was observable at the required target:

- GitHub environments `Preview`, `Preview – carlophillips-site`, `Production`,
  and `Production – carlophillips-site` all report zero protection rules and no
  deployment branch policy.
- Cubiqo Vercel project `prj_9VHD0AhhQnuml8frfNDsmFLHXcq1` Preview still has
  none of the four required `SHOPIFY_STAGING_*` variable names.
- Retrying the Upstash free-plan install as Vercel CLI user `aditya-7307`
  still returns `integration_terms_acceptance_required`; installation and
  resource counts remain zero.

Repeat the actions in the exact GitHub environments and Cubiqo Vercel team
listed above. For Upstash, ensure the terms are accepted while signed into the
same Cubiqo member account represented by the CLI authorization. Do not send
secret values. Resume only after the dashboard itself shows the policies and
variable names and the terms page reports acceptance.

### Product Owner simplification — supersedes the three-signal Staging block

The Product Owner subsequently directed: every release candidate goes to
Staging; the Product Owner reviews Staging and separately tells the agent when
to promote. GitHub environment reviewers are therefore not a Staging blocker.
The PR-bound workflow must still prove an open same-repository PR, exact head
SHA, immutable receipt, and no Production-domain assignment.

The application now accepts Vercel environment-scoped `SHOPIFY_STORE_DOMAIN`,
`SHOPIFY_STOREFRONT_TOKEN`, `SHOPIFY_CHECKOUT_HOSTS`, and
`SHOPIFY_WEBHOOK_SECRET` in Preview. The `SHOPIFY_STAGING_*` names remain
optional overrides, not required duplicates. This lets Codex use sensitive
Vercel values without retrieving or displaying them.

Staging UI, catalog, bag, and checkout-handoff review may proceed before Redis
and webhook registration. Webhook ingress continues to fail closed until the
Shopify signing secret and a durable Redis store exist. Upstash still reports
that its Marketplace terms are unaccepted for CLI user `aditya-7307`; Codex
cannot create that resource until the account-level acceptance is observable.

### Staging implementation receipt and remaining Vercel-owner actions

Implementation commit `00695b949a12d84e7b06dbc1db77261c6503bfb6` passed
repository CI, checkout/accessibility, Vercel build, and headless desktop visual
QA. Its Cubiqo Preview deployment is
`carlophillips-site-o31q3r9gj-cubiqo-projects-d7156840.vercel.app`. Live testing
proved Shopify S/M/L selector → test bag → `$128` line → Shopify-hosted checkout
redirect. Testing stopped before payment. Production remained on deployment
`dpl_CTG5gJCWVhCimCPb5a8qadS5hMdp`.

The Cubiqo CLI member can deploy Preview but received HTTP 403 when creating a
project-scoped CI token and lacks permission to assign
`staging.carlophillips.com`. A Cubiqo Vercel owner must:

1. Create a project-scoped token for `prj_9VHD0AhhQnuml8frfNDsmFLHXcq1` at
   Vercel Account Settings → Tokens and replace GitHub environment secret
   `VERCEL_TOKEN` in `Preview` and `Production` without exposing the value.
2. Assign `staging.carlophillips.com` to the exact reviewed Cubiqo deployment,
   or grant the CLI member domain-alias permission. Do not alter
   `carlophillips.com` or `www.carlophillips.com`.
3. Accept the Upstash terms in the Cubiqo team, then allow Codex to retry the
   free Preview-only resource with `autoUpgrade=false`.
4. Add the environment-scoped Shopify app signing secret directly in Vercel so
   Codex can register and prove webhook delivery. Do not paste it into chat.

Signal: `CP Vercel staging owner actions complete`. Production promotion still
requires the Product Owner's separate explicit instruction after review.

### 2026-09-02 — current protected-Staging handoff (supersedes earlier setup blockers)

The dedicated Shopify development store, isolated Preview Upstash resource,
Preview-only Shopify/Vercel configuration, and protected GitHub `Staging`
environment now exist. GitHub `Staging` requires reviewer `avloy07-eng` and
permits deployments only from `codex/shopify-closure-safety`. PR #55 remains
open; its exact head SHA must be read from GitHub immediately before dispatch.
The implementation checks were green before this handoff-only documentation
update, and the updated head must complete the same required checks.

GitHub rejected the protected-Staging dispatch before execution because a
`workflow_dispatch` workflow must first exist on the default branch. The
minimal bootstrap is isolated in PR #56:

`https://github.com/CubiqoUnited/carlophillips-site/pull/56`

Human action required:

1. Independently review PR #56. It must contain only
   `.github/workflows/vercel-staging.yml`.
2. Confirm it requires an open same-repository PR targeting `main`, exact PR
   head SHA, the protected `Staging` environment, isolated Preview settings,
   verification before domain aliasing, and the signed PII-free webhook probe.
3. Merge PR #56 only after its own required checks pass.
4. Signal: `CP staging workflow bootstrap merged`.

After that signal, Codex can dispatch the workflow from
`codex/shopify-closure-safety` for PR #55, wait for the Staging reviewer gate,
verify the immutable deployment, assign only `staging.carlophillips.com`, and
continue Shopify Staging webhook registration and happy-path validation.

Do not merge PR #55, change Production, or clean release branches during this
handoff.

### 2026-09-02 — GitHub owner re-authentication required for Vercel token repair

The failed Preview deployment proved that the encrypted `VERCEL_TOKEN` in the
GitHub `Preview` environment is invalid. The local Vercel CLI credential was
validated successfully without displaying its value. Sushma attempted to
replace `VERCEL_TOKEN` in GitHub environments `Preview` and `Production`, but
GitHub stopped both updates at an owner `Confirm access` dialog requiring the
`CubiqoUnited` passkey. The old secret timestamps remain unchanged; no token
replacement was saved.

Human action required:

1. In the already-open Chrome GitHub tab, complete the `Confirm access` dialog
   for `@CubiqoUnited` using the passkey. This authorizes access to repository
   secret settings; it does not deploy, merge, or promote anything.
2. Return to this Codex task and signal: `CP GitHub passkey confirmed`.

After the signal, Sushma will immediately replace only the encrypted
`VERCEL_TOKEN` secrets in `Preview` and `Production`, verify their update
timestamps, clear transient clipboard/runtime values, and rerun the failed
Preview deployment gate. Never paste the token into chat.

Resolution: Boss completed the GitHub passkey confirmation. Sushma replaced
both encrypted secrets and verified current update timestamps. The rerun then
proved the credential by passing `vercel pull`, Production inspection, and the
Vercel build. A separate workflow defect was exposed: Vercel CLI 56 rejects
`--skip-domain` on non-Production deployments. The Preview and protected
Staging workflows and their CI contract tests were corrected to omit that flag;
the Production candidate retains `--prod --skip-domain`.

# STAGING CATALOG ACTION CONFIRMATION — 2026-09-02

The isolated Shopify development store is connected correctly, but it contains only Shopify sample snowboard products. The canonical CARLOPHILLIPS handle therefore renders unavailable and cannot expose Add to Bag.

Required external action: create and publish a Staging-only `CARLOPHILLIPS Signature Hoodie` product to the Headless sales channel with handle `carlophillips-signature-hoodie`, black S/M/L variants, `$128.00` test pricing, and clearly test-only SKUs. Do not install or trigger the Production Apliiq handoff for this record.

Risk: saving/publishing changes the external Shopify Staging catalog. It does not touch Production, charge a customer, or create an Apliiq production job. Signal completion by explicitly confirming the Staging-only Shopify Save/Publish action in the active Codex task.

# PRODUCTION CONFIGURATION NO-GO — 2026-09-02

Do not build or promote PR #55 to Production yet. A read-only check of the
canonical Cubiqo Vercel project confirmed that Production is missing runtime
bindings required by PR #55's fail-closed startup preflight:

- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_STOREFRONT_TOKEN`
- `CP_COMMERCE_ENVIRONMENT=production`
- `CP_DURABLE_STORE_ID`
- `CP_EXPECTED_PRODUCTION_DURABLE_STORE_ID`
- one complete Production durable-store credential pair (`KV_REST_API_URL` +
  `KV_REST_API_TOKEN`, or the supported Upstash equivalent)

The current live deployment remains available because Vercel captured its
environment at build time. The next Production build from PR #55 would fail
startup preflight or lose Shopify/durable webhook connectivity if promoted
without provisioning these bindings.

Required owner action, performed in Vercel Production scope without exposing
values in chat:

1. Restore the Production Shopify domain and a valid Production Storefront
   token.
2. Set the Production commerce marker and matching durable-store identity
   markers.
3. Attach a Production-only durable KV/Upstash resource and credentials.
4. Build a new immutable Production candidate without assigning live domains.
5. Prove startup preflight, product visibility, Add to Bag, `/api/cart`, and
   durable signed-webhook ingestion on that candidate.
6. Preserve the current checkout-enabled live deployment ID as the rollback
   anchor. Promotion still requires separate Product Owner approval.

Signal completion with: `CP Production bindings restored and candidate verified`.
This Production blocker does not prevent merging PR #56 or deploying the open
PR #55 head to isolated Staging.

Update: the Production Shopify domain, Storefront token, commerce marker,
matching durable-store IDs, and Production-only Upstash bindings have been
restored without exposing values. The Production application build succeeds.
No Production deployment or promotion has occurred.

# GITHUB STAGING BRANCH-POLICY CORRECTION — 2026-09-02

PR #56 is merged and the protected Staging workflow is callable from `main`.
Two exact-head dispatches for PR #55 failed before any job step because the
GitHub `Staging` environment permits only branch
`codex/shopify-closure-safety`, while `workflow_dispatch` must execute from
the default branch `main`. The workflow itself separately enforces the open
same-repository PR, target branch, and exact PR head SHA.

Required owner action: add `main` to the GitHub `Staging` environment's custom
deployment branches. Do not remove the existing PR-branch rule until the
successful Staging receipt is captured. The local `gh` identity received HTTP
403 for this repository-admin operation; an authenticated GitHub owner session
is required.

After correction, rerun `.github/workflows/vercel-staging.yml` with PR `55`,
expected SHA `3a28d6540927881d4083dd9e2be86adfa877df1e`, and a new immutable release
identifier. No Production action is authorized by this correction.

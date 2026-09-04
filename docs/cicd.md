# CARLOPHILLIPS protected release runbook

The workflows create evidence; they never grant Product Owner approval. A
build or Add-to-Bag check alone is not a release.

## Release invariant

One exact Staging commit must be all of the following through Product Owner
review:

- current `staging` and the merge commit of the reviewed source PR;
- the source of the protected, immutable Staging deployment;
- the commit stamped into every new Shopify Staging cart;
- the commit in the signed PII-free protected Staging receipt;

Production promotion remains a later, separately approved operation. Before
that operation, the release tooling must prove how the accepted Staging tree is
transferred to `main` without changing the reviewed application content.

The protected receipt requires the Shopify-authoritative Signature Hoodie in
Black S/M/L at USD 128, bag truth, a trusted HTTPS hosted Staging checkout
handoff, an automatically generated hash of the sanitized handoff proof,
HMAC-verified synthetic webhook handling, durable duplicate suppression with
one recorded observation and zero external action, unchanged inventory, no
payment attempt, no order submission and no retained private checkout URL.

The Staging SHA and the later `main` SHA are branch-specific commits and may
differ. Production therefore verifies provenance rather than requiring SHA
identity: the signed receipt is bound to the approved Staging SHA; the
Production PR must be a merged `staging`-to-`main` PR whose recorded head is that
Staging SHA and whose merge commit is the requested `main` SHA; the Staging SHA
must be an ancestor of the `main` SHA; and both commits must have the exact same
Git tree. Any application, workflow, configuration, documentation or evidence
drift fails the gate.

## Workflows

- `CI / Verify` and `Playwright checkout gate` run on pull requests. They use
  Yarn Classic 1.22.22, frozen dependencies, lint, typecheck, stylelint, tests,
  build, E2E, accessibility, privacy/network checks and screenshot comparisons.
- `Protected Vercel Staging` runs only for the exact current `staging` merge SHA
  of the supplied PR. It requires the protected `Staging` environment, proves
  Production is healthy and checkout-enabled, deploys one
  unaliased immutable Preview artifact, verifies it before assigning
  `staging.carlophillips.com`, runs 1440 px and 390 px functional/a11y/browser
  checks against the dedicated Shopify Staging Storefront API and hosted
  checkout, sends a signed PII-free webhook twice to prove duplicate
  suppression, and proves Production remained unchanged. An opt-in second job,
  isolated from the deployment job and its Vercel credential, can then use the
  read-only Staging Admin credential to capture the exact read-only S/M/L
  inventory state in the same successful workflow run. The snapshot job is
  bound to the release ID and current `staging` SHA and creates no
  cart/order/payment, deployment or alias change.
- `Protected Staging Release Proof` downloads the exact Staging artifact and
  read-only Shopify snapshot, rechecks S/M/L inventory without mutation,
  validates the sanitized desktop/mobile checkout-handoff proof and synthetic
  duplicate webhook probe, and HMAC-signs a PII-free receipt. It does not enter
  payment, submit an order, query order data or retain the hosted checkout URL.
- `Vercel Production Candidate` accepts current `main` only after it downloads
  and verifies that signed receipt and proves the approved Staging tree was
  promoted unchanged by a merged `staging`-to-`main` PR. It builds one
  checkout-enabled Production artifact with `--prod --skip-domain`, leaves
  Production unchanged and records the current verified checkout-enabled
  deployment as the rollback anchor.
- `Vercel Production Promotion` requires a second protected `Production`
  approval. It re-verifies the signed Staging receipt, candidate metadata,
  current Production/rollback identity and checkout health. A promotion CLI
  failure, promoted-source mismatch, live health/checkout failure, receipt
  generation failure or receipt upload failure restores the last verified
  checkout-enabled deployment and verifies its identity and checkout health.

## Protected configuration

Never print or commit secret values. The canonical Vercel identity is team
`team_Q25fvpJOPiIeoG3hfxtCVkhW`, project
`prj_9VHD0AhhQnuml8frfNDsmFLHXcq1`, scope
`cubiqo-projects-d7156840`.

The `Staging` GitHub environment requires a Product Owner reviewer. The
Shopify-mimic deployment gate requires:

- secrets: `VERCEL_TOKEN`, `VERCEL_AUTOMATION_BYPASS_SECRET`, and
  `SHOPIFY_STAGING_WEBHOOK_SECRET`;
- variables: canonical `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_SCOPE`,
  `SHOPIFY_STAGING_STORE_DOMAIN`, and `SHOPIFY_STAGING_CHECKOUT_HOSTS`.

The later protected release proof additionally requires a read-only Shopify
Admin credential, `CP_RELEASE_RECEIPT_SIGNING_SECRET`, `SHOPIFY_PRODUCTION_STORE_DOMAIN`,
`CP_EXPECTED_PREVIEW_DURABLE_STORE_ID`, and
`CP_EXPECTED_PRODUCTION_DURABLE_STORE_ID`.

Set the repository configuration variable
`CP_STAGING_CAPTURE_SHOPIFY_SNAPSHOT=true` only for the protected Staging run
that must produce the read-only snapshot, then reset it to `false` after the
run. When the flag is absent or false, the read-only snapshot job is skipped.

The two Shopify domains and durable-store IDs must differ. Preview must use a
Shopify partner development store, test-only product/inventory and its
own webhooks/records. Production customer data, real payment, Production order
creation and Apliiq submission are prohibited from this gate.

The Staging Admin token must be read-only for this proof and able to observe the
product and inventory. The collector has no order query and requires inventory
to remain unchanged between the snapshot and the signed proof.

The `Production` environment requires a separate Product Owner reviewer, the
canonical Vercel secret/variables, the same receipt-signing secret, and a
time-bounded `CP_PRODUCTION_PROMOTION_ENABLED=true` only for the approved
promotion window.

## Operator order

1. Merge the fully green source PR into `staging` without rewriting the reviewed
   history and wait for `CI / Verify` on the exact resulting `staging` SHA.
2. Dispatch `Protected Vercel Staging` from that `staging` SHA with its merged PR
   number and release ID. Stop on any Vercel account/project mismatch; never
   substitute a same-named project or broader token.
3. Review the immutable deployment, 1440/390 screenshots and preliminary
   artifact. Reject any proof that includes a private checkout URL, payment
   attempt, order submission or customer data.
4. Enable the repository snapshot flag, dispatch `Protected Vercel Staging` for
   that exact SHA/release/source PR, confirm the same successful run contains
   both named artifacts, and immediately reset the flag to `false`.
5. After Product Owner Staging review, dispatch `Protected Staging Release
   Proof` with the exact Staging run. The workflow derives the sanitized
   checkout-handoff hash from its browser artifacts. Accept only a passing
   signed artifact named `protected-release-proof-<staging-sha>`.
6. Merge an exact `staging`-to-`main` Production PR with no tree changes. Record
   the approved Staging SHA, resulting `main` SHA and Production PR number.
7. Dispatch `Vercel Production Candidate` with both SHAs, both PR numbers,
   release and proof run. The workflow must prove ancestry and exact tree
   identity before building. Review the unaliased candidate and recorded
   checkout-enabled rollback anchor.
8. Obtain the separate Production approval, briefly enable the promotion
   switch and dispatch `Vercel Production Promotion` with those exact inputs.
   Disable the switch immediately after the attempt.
9. Verify public Production health, checkout controls, promoted source and
   receipt. If any acceptance step failed, treat a verified rollback as the
   outcome and do not describe the release as successful.

## Current hard blocker — 2026-09-03

Run `33733157896` for PR #67 at
`3bff804b1a55691a38e9406eb1f97d21b5b21a3c` failed at the canonical
`vercel pull` with `You do not have access to the specified account`. It made
no deployment or alias change and produced no receipt. The Staging environment
token must be rebound to the canonical identity before retry. Production and
cleanup stay locked.

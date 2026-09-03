# CARLOPHILLIPS protected release runbook

The workflows create evidence; they never grant Product Owner approval. A
build or Add-to-Bag check alone is not a release.

## Release invariant

One exact Staging commit must be all of the following through Product Owner
review:

- current `staging` and the merge commit of the reviewed source PR;
- the source of the protected, immutable Staging deployment;
- the commit stamped into every new Shopify Staging cart and test order;
- the commit in the signed PII-free protected Staging receipt;

Production promotion remains a later, separately approved operation. Before
that operation, the release tooling must prove how the accepted Staging tree is
transferred to `main` without changing the reviewed application content.

The protected receipt requires the Shopify-authoritative Signature Hoodie in
Black S/M/L at USD 128, bag truth, a trusted HTTPS hosted Staging checkout,
Shopify test payment, paid test order, redacted CP-branded confirmation and
order/status evidence, HMAC-verified lifecycle events, durable idempotency,
duplicate suppression with one recorded observation and zero external action,
cancellation, full refund, inventory restoration and no Apliiq Production job.

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
  suppression, and proves Production remained unchanged. This deployment gate
  does not request Shopify Admin, order, customer, payment or fulfillment data.
- `Protected Staging Release Proof` runs after the synthetic order has been
  paid through Shopify's test gateway, reviewed, cancelled and refunded with
  restock. It downloads the exact Staging artifact, queries only non-customer
  Shopify order fields, correlates the order to the cart's release/SHA
  attributes, reads the separate Staging durable event store, confirms the
  required signed topics and final state, and HMAC-signs a PII-free receipt.
- `Vercel Production Candidate` accepts current `main` only after it downloads
  and verifies that signed receipt. It builds one checkout-enabled Production
  artifact with `--prod --skip-domain`, leaves Production unchanged and records
  the current verified checkout-enabled deployment as the rollback anchor.
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

The later protected synthetic-order release proof additionally requires a
read-only Shopify Admin credential, the isolated Upstash REST URL/token,
`CP_RELEASE_RECEIPT_SIGNING_SECRET`, `SHOPIFY_PRODUCTION_STORE_DOMAIN`,
`CP_EXPECTED_PREVIEW_DURABLE_STORE_ID`, and
`CP_EXPECTED_PRODUCTION_DURABLE_STORE_ID`.

The two Shopify domains and durable-store IDs must differ. Preview must use a
Shopify partner development store, test-only product/inventory/payment and its
own webhooks/records. Production customer data, real payment, Production order
creation and Apliiq submission are prohibited from this gate.

The Staging Admin token must be read-only for this proof and able to observe
products, orders, inventory, locations, and merchant/third-party fulfillment
orders. The collector rejects an empty or partial fulfillment-order view and
requires every test-order fulfillment request to remain `UNSUBMITTED`, with no
Apliiq-assigned location.

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
   artifact. Do not use the 2026-09-02 order for a later SHA.
4. Before any payment entry, record the human action, risk, signal and resume
   point in `reports/HUMAN_INTERVENTION_STICKY_RED.md`. Use synthetic data and
   Shopify Test Payment Gateway only. Capture redacted confirmation and
   order/status evidence hashes, then cancel/refund/restock and archive the
   test order. Never trigger fulfillment.
5. After Product Owner Staging review, dispatch `Protected Staging Release
Proof` with the exact Staging run and evidence hashes. Accept only a passing
   signed artifact named `protected-release-proof-<sha>`.
6. Dispatch `Vercel Production Candidate` for the same current `main` SHA,
   release, PR and proof run. Review the unaliased candidate and recorded
   checkout-enabled rollback anchor.
7. Obtain the separate Production approval, briefly enable the promotion
   switch and dispatch `Vercel Production Promotion` with those exact inputs.
   Disable the switch immediately after the attempt.
8. Verify public Production health, checkout controls, promoted source and
   receipt. If any acceptance step failed, treat a verified rollback as the
   outcome and do not describe the release as successful.

## Current hard blocker — 2026-09-03

Run `33733157896` for PR #67 at
`3bff804b1a55691a38e9406eb1f97d21b5b21a3c` failed at the canonical
`vercel pull` with `You do not have access to the specified account`. It made
no deployment or alias change and produced no receipt. The Staging environment
token must be rebound to the canonical identity before retry. Production and
cleanup stay locked.

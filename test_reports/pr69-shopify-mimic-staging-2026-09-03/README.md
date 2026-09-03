# PR #69 Shopify-mimic Staging QA

Date: 2026-09-03 EDT

## Scope

This evidence covers the combined PR #69 candidate through the safe Shopify
Staging checkout handoff. It does not contain a checkout URL, customer data,
payment attempt, order submission or Apliiq Production fulfilment request.

Real Apliiq manufacture, dispatch, carrier tracking and physical delivery are
deferred to the next research/delivery iteration. Production was not changed.

## Repository verification

- `yarn verify`: passed.
- Shipped tests: 19 files, 89 tests passed.
- Tooling tests: 46 files, 515 tests passed.
- Contract tests: 15 files, 85 tests passed.
- Storybook build: passed.
- Production dependency audit: 0 vulnerabilities.
- Next.js production build: passed.
- `yarn test:e2e`: 28/28 tests passed across desktop and mobile Chromium.
- Darwin and Linux PDP screenshots were reviewed and refreshed only for the
  intentional responsive blank-space removal; homepage and bag baselines did
  not change.

## Exact deployed-candidate browser proof

Candidate checked before the final documentation/test commit:
`0cd0cbc99b4998e2cb7b76a841e935ccf5883305`.

Immutable URL checked:
`https://carlophillips-8phe95n6y-cubiqo-projects-d7156840.vercel.app`.

The protected browser gate passed at 1440 px and 390 px. It verified:

- Shopify-authoritative Signature Hoodie;
- exactly S/M/L at USD 128;
- Medium selection and Shopify-backed bag truth;
- HTTP 303 to the allowlisted dedicated Staging Shopify host;
- WCAG A/AA checks;
- no unexpected console, HTTP or network failures;
- no retained private checkout URL;
- no customer data, payment or order.

The `artifacts/` directory contains the sanitized PDP/bag screenshots and one
`browser-proof.json` per viewport. The final merged `staging` SHA must repeat
this gate before canonical Staging acceptance.

## Remaining external acceptance

The safe automated gate does not authorize or perform a Shopify test payment or
order. The exact canonical Staging commit still requires the synthetic,
zero-charge Shopify test-order, confirmation, authenticated order view,
webhook, cancellation/return, refund, restock and notification evidence
described in `reports/HUMAN_INTERVENTION_STICKY_RED.md`.

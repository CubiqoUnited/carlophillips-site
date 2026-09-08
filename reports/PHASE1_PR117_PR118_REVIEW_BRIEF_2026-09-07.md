# Phase 1 PR #117 / #118 Review Brief

- Date: 2026-09-07 EDT
- Coordinator: Sushma
- Scope: code/readiness review only; not live operational acceptance

## Decision

| PR | Immutable reviewed head | Required checks | Aarti | Pushpa | Sushma |
|---|---|---|---|---|---|
| [#117](https://github.com/CubiqoUnited/carlophillips-site/pull/117) | `ee71bbde03ac9fbda527c4a5f5678cd3fe68a2b8` | `Verify` pass; `Checkout E2E and accessibility` pass | APPROVE — technical/code readiness | ACCEPT — business/code readiness | **APPROVE for independent GitHub review** |
| [#118](https://github.com/CubiqoUnited/carlophillips-site/pull/118) | `fb4bdfe607f380ce6ad772d3cceecad2942fcefd` | `Verify` pass; `Checkout E2E and accessibility` pass | APPROVE — technical/code readiness | ACCEPT — business/code readiness | **APPROVE for independent GitHub review** |

PR #116 is not a technical-review dependency for either decision. Each PR still
requires an eligible independent GitHub approval. If canonical `staging` moves
before merge, reconcile the candidate, rerun required exact-head checks and
bind review to the resulting head.

## #117 evidence and remaining gates

The support route uses one Resend idempotency key and an identical payload
across bounded retries, including ambiguous transport failure. It fails
truthfully when delivery is not accepted. This closes the code-readiness issue;
it does not configure or prove Resend, the monitored mailbox/fallback, human
alert delivery, Shopify Customer Accounts/native returns, Staging UAT or
Production operation.

## #118 evidence and remaining gates

Production recovery comments without auto-closing the P0, preserving Sushma's
closure authority. Webhook receipt distinguishes a short in-progress claim from
a durably recorded observation: incomplete states return retryable 503 and only
a completed observation returns duplicate 200. A five-hour authenticated
timestamp window covers Shopify's documented four-hour retry schedule while the
processing claim remains a separate 30-second lease. The route continues to
report `externalActionApplied: false`.

This closes code/architecture readiness only. Remaining proof includes protected
deployment, first scheduled Production run, induced failure/recovery and human
alert receipt, live webhook subscriptions and durable-store behavior, Shopify
Flow/Apliiq/tracking operation, reconciliation, and the separately authorized
controlled order.

## Next executable action

An eligible independent reviewer records latest-head approval for #117 and
#118. Sushma then reconciles each with canonical `staging` if needed, preserves
exact-SHA checks, and advances it through the protected Staging path. External
configuration and live-transaction gates remain parked until their named human
owners provide access or authority.

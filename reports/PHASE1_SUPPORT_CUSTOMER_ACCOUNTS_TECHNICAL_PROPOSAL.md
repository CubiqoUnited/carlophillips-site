# Phase 1 Support and Customer Accounts — Technical Execution Proposal

- Date: 2026-09-07 EDT
- Technical owner: Aarti
- Business owner: Pushpa
- Delivery owner: Sushma
- Status: Bounded retry/telemetry implementation in progress; no live activation proven

## Decision

Use Shopify Customer Accounts and Shopify-native returns as the customer/order authority, and retain the existing `apps/web` Resend support boundary. Do not build a CP account database, ticketing platform, return engine, or second order authority. Close the smallest demonstrated gaps: delivery retry, operational alerting, safe fallback guidance, environment configuration, and live Staging proof.

The canonical deployed application is `apps/web`; similarly named root `app/`, `components/`, and `lib/` support files are legacy/non-deployed evidence and must not be changed or used as proof for this tranche.

## Gap-to-solution plan

| Gap | Current state | Proposed solution | Native/tool/custom | Owner | Dependency | Verification |
|---|---|---|---|---|---|---|
| Support intake | `apps/web/src/app/api/contact/route.ts` validates same-origin requests and reports success only after Resend accepts delivery | Keep the existing route and Resend adapter | Existing CP + Resend | Aarti | None for code/test work | Unit/route tests prove validation, fail-closed behavior, and provider acceptance semantics |
| Transient support failure | One Resend attempt; timeout/rejection returns 502 | Add a small bounded retry for transient transport/429/5xx failures only, preserving one customer submission and one CP request reference | Existing CP custom boundary | Aarti | None | Deterministic tests for retryable and non-retryable responses; no false success |
| Support failure visibility | Failure reaches the customer but no operator alert or recurring health proof is established | Emit a sanitized structured failure signal and use established Vercel/observability alerting; add a no-PII synthetic delivery check only if the provider supports a safe test recipient | Existing tooling first | Aarti | Monitoring destination/access; monitored mailbox | Induced failure triggers the operator path without exposing message, email, order reference, or secrets |
| Customer fallback | UI advises retry/order-status email, but no monitored alternate contact is configured | Publish the monitored alternate route after Pushpa confirms it; keep secure Shopify order-status guidance | Shopify + operating process | Pushpa/Aarti | Monitored alternate mailbox/channel | Staging failure drill displays the approved fallback and the operator receives the alert |
| Support configuration | Code requires `RESEND_API_KEY`, `CP_SUPPORT_FROM_EMAIL`, `CP_SUPPORT_TO_EMAIL`; current live presence is not proven | Bind distinct Preview/Production values through protected Vercel configuration; never copy or expose secret values | Vercel + Resend | Aarti; human config owner where required | Verified sender/domain and monitored recipient | Read-only config-presence check plus synthetic Staging submission confirmed in the monitored mailbox |
| Customer account access | `post-purchase-policy.ts` fails closed and uses environment-specific safe HTTPS account URLs | Activate Shopify Customer Accounts and bind only the public environment-specific entry URL | Shopify native | Aarti; Pushpa accepts | Shopify admin authority | Synthetic Staging customer sees only its order; no private order URL retained |
| Returns entry | Existing policy fails closed and accepts only environment-specific safe HTTPS return URLs | Enable Shopify-native self-service returns using Pushpa's accepted rules; bind its public entry URL | Shopify native | Pushpa/Aarti | Shopify policy/admin authority; final Production policy decisions | Eligible/ineligible Staging scenarios route correctly; Shopify remains authoritative |
| Recovery and reconciliation | No durable CP ticket store is intended; provider receipt alone does not prove mailbox handling | Use provider delivery records plus monitored-mailbox checks and an operations runbook; adopt a ticketing tool only if volume/evidence shows mailbox operations are insufficient | Native/tool before custom | Aarti/Pushpa/Sushma | Operator access and escalation contact | Drill missing delivery, duplicate customer submission, provider outage, and delayed operator response |

## Failure and recovery contract

- Invalid or cross-origin submissions fail before delivery.
- Missing configuration returns 503 and never claims success.
- A provider rejection or exhausted transient retry returns 502 and shows the approved fallback.
- Retry must be bounded and must not occur for normal 4xx validation/provider rejection responses except 429.
- Logs and alerts contain only a generated request reference, failure class, environment, route, and timestamp; never customer message, email, order number, token, or provider payload.
- Duplicate customer submissions may create separate support requests; the operator runbook reconciles by request reference and Shopify order. Do not add a database solely for deduplication without demonstrated harm.
- If Resend or mailbox operations prove insufficient, reevaluate an established helpdesk before custom ticket infrastructure.

## Implementation order

1. Add bounded transient retry and sanitized failure telemetry to the deployed `apps/web` support adapter.
2. Extend route/unit tests for 429/5xx retry, timeout exhaustion, non-retryable rejection, sanitized telemetry, and exactly one customer-visible outcome.
3. Confirm the existing customer-account/returns URL contract against the current Shopify native entry points; change code only if the real native contract demonstrates a mismatch.
4. Prepare a no-secret environment checklist and operational runbook for support failure, customer fallback, and mailbox ownership.
5. Bind Preview configuration through the protected human/admin path and execute Staging support, account-isolation, and returns drills.
6. Pushpa performs business UAT; Sushma verifies evidence and decides whether Production promotion is ready.
7. Bind Production configuration through its protected gate, deploy the exact approved tree, and run a sanitized post-deploy proof.

## Authority and dependencies

Agents may autonomously implement and test the bounded retry, telemetry boundary, truthful UI state, config-presence checks, and runbook using mocks/synthetic data. Live sender verification, monitored mailbox access, Shopify admin activation, protected environment values, unresolved Production return-postage policy, and any real financial action remain human/Boss gates recorded in the Human Intervention Queue.

## Exit evidence for this tranche

- Technical: targeted tests and full repository verification pass on the exact candidate SHA.
- Staging support: one synthetic no-PII request is accepted by Resend and observed in the monitored mailbox; an induced failure produces no false success and reaches the operator alert/fallback path.
- Staging accounts: a synthetic customer can securely reach only its Shopify order state.
- Staging returns: eligible and ineligible test-order scenarios follow Pushpa's accepted rules in Shopify.
- Business: Pushpa records support SLA/fallback and customer/returns UAT acceptance.
- Operations: Sushma records owner, alert route, failure drill, recovery action, and exact Production gate.
- Production: the same approved code/config contract is deployed and minimally verified without exposing PII or performing an unauthorized financial action.

Mock, unit, synthetic, and Staging evidence must remain explicitly labelled; none of it proves a real Production mailbox workflow or customer order lifecycle until the corresponding live verification is observed.

## Readiness recommendation

**GO for bounded implementation and synthetic verification.**

**NO-GO for live Staging activation** until the verified Resend sender/monitored recipient and Shopify Staging account/returns admin actions are available. This blocks only live activation and proof, not code, tests, monitoring boundaries, or runbook preparation.

## Implementation evidence

- Candidate implementation adds one bounded retry for Resend 429, 5xx, timeout, or transport failure. Ordinary provider 4xx responses are not retried.
- Final failure emits one sanitized `cp.support.delivery_failed` signal containing only the generated request reference, failure class, attempt count, environment, route, and timestamp.
- The customer still receives exactly one truthful success or failure result; the same request reference is retained across a retry.
- Targeted support and post-purchase tests, lint, Production-commerce lint, design-system lint, and TypeScript checks pass locally. Live provider delivery, alert routing, mailbox receipt, Shopify account isolation, and returns remain unproven.

## Protected environment presence audit

A read-only Vercel CLI inventory on 2026-09-07 identified the canonical project as
`Cubiqo/carlophillips` (`prj_9VHD0AhhQnuml8frfNDsmFLHXcq1`). The project reports
root directory `.` and output directory `apps/web/.next`, consistent with
`apps/web` being the deployed Next.js application. Only variable names and scopes
were inspected; no values were printed, copied, or retained.

The existing Preview inventory contains the isolated Shopify Staging commerce,
webhook, checkout, durable-store, and Clerk variables. The Production inventory
contains the corresponding live Shopify commerce, webhook, checkout,
durable-store, and Clerk variables. Neither inventory contains the post-purchase
activation variables below:

| Required variable | Preview/Staging | Production | Effect while absent |
|---|---|---|---|
| `RESEND_API_KEY` | Missing | Missing | Support delivery remains unconfigured and returns no false success |
| `CP_SUPPORT_FROM_EMAIL` | Missing | Missing | No verified CP sender is available |
| `CP_SUPPORT_TO_EMAIL` | Missing | Missing | No monitored support recipient is available |
| `SHOPIFY_STAGING_ACCOUNT_URL` | Missing | N/A | Staging customer-account entry remains fail-closed |
| `SHOPIFY_STAGING_RETURNS_URL` | Missing | N/A | Staging self-service returns entry remains fail-closed |
| `SHOPIFY_ACCOUNT_URL` | N/A | Missing | Production customer-account entry remains fail-closed |
| `SHOPIFY_RETURNS_URL` | N/A | Missing | Production self-service returns entry remains fail-closed |

This is configuration-presence evidence only. It does not establish that any
existing encrypted commerce variable contains the correct value, that Shopify
Customer Accounts or native returns are enabled, or that Resend and the monitored
mailbox work. The exact next activation step remains: provision verified Preview
values through the protected owner path, deploy the approved SHA to canonical
Staging, then run the support/account/returns drills before any Production values
are added.

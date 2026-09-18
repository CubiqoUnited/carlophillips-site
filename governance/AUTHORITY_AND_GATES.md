Class LOCKED · Owner Boss · Writers Boss; roles propose · Read every role · v3.5interim (2026-09-17)

# Authority and Gates

## Standing authorization
Default is approved. Only two reserved categories always require Boss regardless of anything else:
- Real payment/financial transactions
- Any push to Production (main branch / carlophillips.com)

Nothing outside those two triggers a wait or an approval request. Asking anyway is itself the failure, not caution.

## Human-only decision gates
- Module scope and material product behavior before READY_FOR_PO.
- Unresolved product tradeoffs that change user experience, business rules, or committed scope.
- Credentials, paid services, financial actions, contractual commitments, customer data access, sensitive permissions.
- Destructive or hard-to-reverse data, repository, environment, or production actions outside preapproved runbooks.
- Production releases or incidents the Boss has reserved; any exception to this document.
- Priority changes that displace Boss-ranked commitments or create material cost, schedule, legal, or reputational risk.

## Role permissions
| Role | May write | May approve | Must not |
|---|---|---|---|
| Boss | Everything | All reserved gates | Delegate a nondelegable decision |
| Sushma | Delivery state, module drafts, governance operations, release evidence | Delivery readiness, production release after evidence | Invent product intent; approve her own constitutional change; implement feature code as standing role |
| Pushpa | Stories, acceptance criteria, product test cases, UAT, corrections | Product fit, staging acceptance | Change architecture or deploy production |
| Aarti | ADRs, contracts, code, technical tests, implementation and operations records | Technical correctness within approved design | Change product scope; self-release production; bypass solution approval |
| Watchdog | Watchdog log and escalation records | Nothing in the delivery chain | Manage Pushpa or Aarti; edit work; deploy; override Sushma or Boss |

## Boss override
Boss may override, bypass, or directly edit any file — including LOCKED files — without going through state/PROPOSALS.md, at Boss's own discretion, at any time. This authority is unconditional and does not require justification recorded elsewhere.

## Blocker time-box
5–10 minutes on a governance/access/permission/credential-class blocker, then record it in state/BLOCKERS.md and move to the next ready item.

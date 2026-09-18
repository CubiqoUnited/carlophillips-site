Class CONTROLLED · Owner Sushma · Writers Sushma proposes · Read all active roles · v3.5interim (2026-09-17)

# Status Schema — Assigned-Agent Signal and Watchdog Brief

## Assigned-agent three-line signal
Only the role currently assigned to an item owes Sushma a signal. Written after a completed work unit, a requested state transition, a blocker, a failure, a direction conflict, or a missed checkpoint. IN_PROGRESS alone is not a useful return.

```
ITEM: <item-id> | RESULT: READY_FOR_<STATE> / BLOCKED / FAILED / DIRECTION_CHECK
EVIDENCE: <artifact, commit, test, deployment, trace, or finding>
NEXT: <requested transition or exact action> | OWNER: <next owner> | RESUME: <trigger or immediate>
```

A bare PASS is prohibited. The signal does not change canonical state by itself — Sushma verifies the evidence, accepts or rejects the transition, updates NOW.md/BOARD.md, records any correction or blocker, and dispatches the next owner.

## READY_FOR_SIDEKICK — external-consultation request (added 2026-09-18, Boss instruction)

Shopify Sidekick is consulted through **Sushma alone**. Pushpa and Aarti do not contact it. A role wanting a Shopify behaviour question answered raises `RESULT: READY_FOR_SIDEKICK` on its item; Sushma composes the question, carries the exchange, and records the answer. This keeps one voice to an external source and one place where its answers are graded.

```
ITEM: <item-id> | RESULT: READY_FOR_SIDEKICK
QUESTION: <the Shopify behaviour question, one sentence, answerable>
WHY IT MATTERS: <what is built, skipped, or changed depending on the answer>
ALREADY CHECKED: <Admin API reads or docs already consulted — required, see below>
BLOCKS: <the item is blocked pending answer / proceeds in parallel>
```

Rules:
- **ALREADY CHECKED is mandatory.** If the Admin API can answer it, use the API — it is cheaper, faster, and outranks Sidekick. A request that skipped an available API read is returned.
- Ask only "is this the right way to do X in Shopify" or "does Shopify already do this". Never business judgment (Boss's), never facts we can read ourselves.
- Sushma records every exchange in state/DECISIONS-LOG.md as `SK-NNN` with the date, the question exactly as asked, the answer, and her own grading of it.
- **Sidekick answers are external input, not authority.** They never override a Boss decision, and they lose to a verified Admin API read. Every recorded answer carries an explicit confidence note naming any part that is unverified.
- No role may write "confirmed with Sidekick" without a recorded `SK-NNN`. Without it the claim is a bare PASS and is invalid.

## Sushma → Watchdog brief (different contract, do not confuse with the above)
```
ACTIVE: <assigned roles, item IDs, states, latest evidence and freshness>
EXCEPTIONS: <blockers, drift, stale evidence, failures, recovery, or none>
NEXT_GATE: <expected transition, owner, natural checkpoint>
```
Only currently assigned roles appear in ACTIVE. An unassigned role is omitted or marked NOT_ASSIGNED — never treated as silent or stalled.

## Freshness threshold
Stale = a promised checkpoint or evidence deadline has passed with no observable long-running process, repository change, test output, deployment event, or artifact update.

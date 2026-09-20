---
id: BUG-LIFECYCLE
owner: boss
class: locked
version: 1.0
last_updated: 2026-09-19
last_verified: 2026-09-19
---

Class LOCKED · Owner Boss · Writers Boss writes; Sushma proposes · Read standing for all roles · v1.0 (2026-09-19)

# Bug lifecycle — report to closure

Boss mandate, 2026-09-19. Binds every defect **reported by anyone**, including
Boss, Sushma, a role's own sweep, a customer, or a monitor. A defect that has not
travelled this path is not closed, whatever its Jira status says.

## The rule that makes the rest work

**No direct role-to-role contact.** Pushpa and Aarti never talk to each other.
Every handoff is a **signal to Sushma**, who reconciles it and dispatches onward.
A role that believes it needs the other's answer raises the signal and stops.

Enforced by construction: neither role holds `SendMessage`, and their tool
allowlists contain no outbound channel. There is no path for them to reach each
other even by accident.

## Stages

Exactly one item is in flight per dispatch record. Stages advance in order and
never skip.

| # | Stage | Owner | Exit condition |
|---|---|---|---|
| 1 | `TRIAGE` | Sushma | Item recorded with reporter, surface, and the observation as stated — not as interpreted |
| 2 | `PO_DEFINE` | Pushpa | **Actual vs expected behaviour** written to `work/items/<KEY>.md`, with the correct behaviour stated as a requirement |
| 3 | `CONFIRMED_BUG` | Sushma | Pushpa's confirmation recorded. **Until this stage, it is a report, not a bug.** A report Pushpa does not confirm is closed as not-a-defect, with her reasoning |
| 4 | `RCA` | Aarti | Root cause identified **and a solution proposed**. No code written |
| 5 | `SOLUTION_CONSENSUS` | Sushma | Pushpa has product-fit on the proposed solution; Aarti holds the approach. Both recorded. Disagreement returns to `RCA` |
| 6 | `BUILD` | Aarti | Fix implemented, verified by observed behaviour, `READY_FOR_RELEASE` signalled |
| 7 | `UAT` | Pushpa | Validated against the requirement she wrote at stage 2 — never against the fix's own description |
| 8 | `SIGNOFF` | Pushpa | Explicit sign-off recorded |
| 9 | `CLOSED` | Sushma | Release executed, evidence recorded, Jira closed |

## What each stage may not do

- **Pushpa never** chooses the technical approach or grades a root cause.
- **Aarti never** writes the expected behaviour, and **never writes application
  code before stage 6**. Stages 4 and 5 are analysis and proposal only.
- **Sushma never** writes the expected behaviour, never proposes the solution,
  and never decides what gets fixed. She records, dispatches, gates and releases.
- **Nobody marks a report a bug except Pushpa**, and nobody closes except Sushma.

## Routine updates

Every dispatched role returns a **three-line signal** — `ITEM` / `RESULT` /
`EVIDENCE` — on completion and at any point it becomes blocked. Sushma sets the
checkpoint per item, conservatively: a defect that is live on a customer surface
carries a shorter checkpoint than one that is contained.

A role that cannot take a reading **reports it as not taken and stops**. "Not
examined" is never graded "fine", and a stage never advances on an untaken read.

## Enforcement

Stages 2–6 are enforced by `.claude/hooks/boundaries.mjs`, not by discipline:

- **Aarti cannot mutate `apps/**` or `packages/**` while the active dispatch is
  at any stage other than `BUILD`.** The hook reads
  `state/dispatch/current.json` and denies the write, naming the stage it is
  actually in.
- **Sushma cannot advance a dispatch to `BUILD`** unless `work/items/<KEY>.md`
  records both Pushpa's bug confirmation and the solution consensus. Sushma
  writes the dispatch record, so the gate that stops her skipping stages must
  bind her at the moment she writes it.

Every denial is appended to `state/activity.jsonl` with the stage and the reason.

**Enforcement covers ordering, not judgement.** The hook can prove that Aarti did
not build before consensus. It cannot prove the consensus was sound. That remains
the roles' obligation and Boss's override.

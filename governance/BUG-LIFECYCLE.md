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

**Amended by Boss, 2026-09-19.** The earlier rule was that Pushpa and Aarti never
contact each other at all and every handoff routes through Sushma. That is
superseded.

**Pushpa and Aarti collaborate in the Jira comment thread.** Consensus is reached
there, in the open, in their own words. The comment section is the working
surface.

**Sushma does not participate in that thread.** She reconciles the settled
outcome into the issue's **main section** — the description, the canonical
record — and she interjects only on two grounds:

- the collaboration is **directionally wrong**, or
- it rests on an **incorrect fact**.

She does not arbitrate taste, re-open settled points, or add her voice to a
discussion that is going correctly. Silence from Sushma on a thread is not
absence; it is the reconciler declining to interfere with work that is sound.

**This is already how the tools are configured**, which is why the split is
enforceable rather than aspirational:

- Pushpa and Aarti hold **comment** access. They cannot create, edit,
  transition or delete an issue — so they cannot write the main section.
- Sushma holds issue authorship. **The description is hers and only hers.**
- Neither role holds `SendMessage` or any outbound channel. There is still no
  peer-to-peer path — collaboration happens **through the record**, where it is
  dated, attributed and auditable, not in a side channel.
- The lane content gates follow them into the comment box: Aarti cannot write
  acceptance criteria there, Pushpa cannot prescribe implementation there.
  Widening *who may speak* did not widen *what each may say*.

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

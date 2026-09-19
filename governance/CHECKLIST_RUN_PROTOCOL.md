---
id: CHECKLIST_RUN_PROTOCOL
owner: sushma
class: CONTROLLED
version: 1.0
last_updated: 2026-09-19
last_verified: 2026-09-19
---

Class CONTROLLED · Owner Sushma · Writers roles append their own runs · Read standing before any checklist run · v3.5interim (2026-09-19)

# Checklist Run Protocol

## What running a checklist means, and why it is not a formality

The V3.5interim model makes one claim repeatedly: **a label without evidence is
invalid and cannot satisfy a gate.** The checklists are where that claim is
enforced. A checklist run is the moment a role stops reporting what it believes
and starts reporting what it can show.

This matters here for a specific reason. In a single working day this project
produced six wrong gradings, a launch-blocking fix that sat unshipped because
"committed" was read as "delivered", a connector showing green over a dead
token, and a `P1` raised against an empty array that a tool simply never
populates. Every one of those was a confident statement that no one had checked.
The checklist is the scheduled, unavoidable check.

A run is therefore **not** a status report. It is an audit of the role against
its own environment, and its output is admissible only with evidence attached.

## Verdict vocabulary — five values, and they are not interchangeable

| Verdict | Means | Never use it for |
|---|---|---|
| `PASS` | Checked, and the expected condition holds | Something not examined |
| `FAIL` | Checked, and the condition does not hold | A thing you merely suspect |
| `UNKNOWN` | Could not be determined with the access available | A quiet substitute for PASS |
| `BLOCKED` | A recorded blocker prevents the check | An excuse for not trying |
| `N-A` | Genuinely does not apply this cycle | Anything inconvenient |

**`UNKNOWN` is a real and respectable answer.** The rule that produced this
document — *"not examined" may never be graded "fine"* — exists because a
caveat was carried all day and treated as a control. `UNKNOWN` is how a role
says so out loud, where Boss can see it.

## Run format — one line per check, machine-readable

Each role writes its run to:

```
state/checklist-runs/{YYYY-MM-DD}/{role}.md
```

Each check is exactly one line:

```
- [VERDICT] C-n — <what was checked> — FOUND: <what was found> — EVIDENCE: <pointer>
```

Worked example:

```
- [PASS] C-2 — NOW, BOARD, BLOCKERS and SCOPE agree with assignment truth — FOUND: all four name CP-CAT-001 as P1 with Pushpa assigned — EVIDENCE: state/NOW.md:64, state/BOARD.md:19
- [FAIL] C-7 — branch and PR hygiene — FOUND: 10 commits on ship-envgate not on github/staging; no PR open — EVIDENCE: git rev-list --count github/staging..HEAD
- [UNKNOWN] C-8 — ACCESS_REGISTRY verification dates — FOUND: file lists no dates for the Apliiq entry; cannot confirm from this session — EVIDENCE: state/ACCESS_REGISTRY.md
```

**`EVIDENCE:` is mandatory on every line, including `PASS`.** A `PASS` with no
pointer is rejected by the reconciler and by the dashboard, which counts it as
`UNKNOWN`. That is deliberate: an unevidenced pass is indistinguishable from a
guess.

Begin the file with a single header line so a run can be identified:

```
RUN: {role} | DATE: {YYYY-MM-DD} | TIER: daily | ITEMS: {n}
```

`TIER` is `daily` (every activation) or `deep` (the deeper periodic review).

## What happens to a run

1. The role writes its run file and nothing else — it does **not** change the
   board. Per the communication protocol, a role changes a file and requests a
   state change.
2. The role files its three-line signal to Sushma naming the run file.
3. Sushma reads the run, verifies a sample of the evidence rather than the
   labels, and reconciles anything material into `state/NOW.md`,
   `state/BOARD.md` or `state/BLOCKERS.md`.
4. Any `FAIL` or `BLOCKED` becomes a blocker record with a category, an owner,
   an exact action and a resume trigger. It does not survive as a line in a run
   file alone.
5. Any `UNKNOWN` that matters is converted into work to obtain the evidence, or
   recorded as an accepted limitation with the reason. It is never rounded to
   `PASS`.

## Significance, stated plainly

The checklist is the only routine mechanism in this model that can catch a role
being confidently wrong about its own environment. Dispatch cannot do it — a
dispatch asks for work, not for verification. The board cannot do it — the board
records what it is told. Boss should not have to do it.

Its significance is that it is **scheduled and unavoidable**, and that its output
is auditable line by line long after the session that produced it has gone.

---
id: AGENT_COMMUNICATION_PROTOCOL
owner: sushma
class: LOCKED
version: 1.0
last_updated: 2026-09-19
last_verified: 2026-09-19
review_frequency: every material gate
---

Class LOCKED · Owner Boss · Writers Boss writes; Sushma proposes · Read standing for every role · v3.5interim (2026-09-19)

# Agent Communication Protocol — CANONICAL AND ENFORCED

Established by Boss, 2026-09-19. This document is binding on all agentic work in
this repository. It supersedes any dispatch habit that contradicts it.

---

## RULE 1 — No agent-to-agent communication. None.

Pushpa and Aarti do not talk to each other. They do not talk to Watchdog. They
do not receive each other's output as narrative. There is no exception.

**Why:** direct agent chatter burns tokens reproducing context that already
exists on disk, and every restatement is a chance for the facts to drift. Two
agents holding two slightly different versions of the truth is how a fix gets
graded shipped while sitting unpushed in a local clone.

**Permitted communication, exhaustively:**

| From | To | Channel |
|---|---|---|
| Boss | Sushma | direct |
| Sushma | Boss | direct — brief, ranked, with recommendation |
| Sushma | Pushpa / Aarti | dispatch: a pointer to files, never a payload |
| Pushpa / Aarti | Sushma | a three-line signal file + evidence on disk |
| Watchdog | Sushma | exception report only |

Everything else is prohibited. Sushma is the only hub.

---

## RULE 2 — Dispatch is a pointer, not a payload.

A dispatch names the item file and the state files to read. It does not restate
their contents.

**Prohibited dispatch:** three paragraphs of verified facts, store state, prior
decisions and constraints pasted into the prompt.

**Required dispatch:**

```
Read state/NOW.md, then work/items/{id}.md.
Do the work defined there.
Write your signal to state/signals/{role}-{id}.md.
Write evidence to evidence/{id}/.
```

If an agent needs context that is not in those files, the context is missing
from the record and must be written there first. That is Sushma's job, and it
is the point: **the board is the memory, not the prompt.**

---

## RULE 3 — Handoff is by file and state, never by conversation.

A role never hands work to another role. A role changes a file and requests a
state change from Sushma. Sushma verifies the evidence and moves the board. The
board then dispatches the next role.

```
Pushpa writes AC  →  signal to Sushma  →  Sushma verifies  →  BOARD = READY_FOR_SOLUTION
                                                                      ↓
                                                              Sushma dispatches Aarti
```

Aarti never learns of Pushpa's work from Pushpa. He reads the item file.

---

## RULE 4 — Every state change writes an event.

`state/events.jsonl` is append-only and is written on every transition, by the
actor who caused it. A transition with no event did not happen.

```json
{"id":"EVT-{ITEM}-{NNN}","type":"...","actor":"sushma","item_id":"...","prev_state":"...","new_state":"...","evidence":"...","ts":"2026-09-19T00:00:00Z"}
```

**Verified failure this established (2026-09-19):** the log's last entry was
2026-09-18 04:49, across a full day containing a rebase, a push, two commits, a
quarantine and four dispatches. None of it is in the record.

---

## RULE 5 — Every decision to Boss gets a D-number before it is asked.

Append to `state/DECISIONS-LOG.md` first, newest on top, with QUESTION /
OPTIONS / IMPACT / RECOMMENDATION. Then ask. A decision raised in conversation
and not logged does not exist.

**Verified failure this established (2026-09-19):** D-031 was put to Boss,
answered, and appears zero times in the log.

---

## RULE 6 — Bare PASS is prohibited.

A signal carries the command or `file:line` that is its evidence, and separates
**verified fact** from **assumption**. "Tests pass" is not a signal. A recorded
caveat is not a control. "Not examined" may never be graded "fine".

---

## RULE 7 — Build happens in an isolated worktree.

Aarti builds in a worktree, not on a shared branch. Sushma deletes it at
release. **Verified gap (2026-09-19):** one worktree exists; all work today ran
directly on the branch.

---

## RULE 8 — Delivery is proven by a remote SHA.

No item is graded built or shipped on a local commit SHA. The evidence is the
SHA that CI ran on. This rule exists because four commits — including a
launch-blocking fix — sat in a clone whose `origin` was a local directory and
never entered CI.

---

## Enforcement

Sushma checks Rules 1–8 on every activation and reports violations to Boss in
the brief, ranked with everything else. A violation is a P2 by default and a P1
when it has already cost delivery time.

---

## RULE 9 — Two standing mandates (Boss, 2026-09-19)

### 9a. Jira is tied from push to deploy. Every change.

Nothing is pushed or deployed without a Jira issue that carries the specifics
and the evidence, and the issue and the change must reference each other.

- The **branch name carries the issue key** (`KAN-3-tightening-agents-access`).
- The **PR title and body reference the key**, and the issue gets the PR URL
  written back into it.
- The **deploy reports to Jira**, so the issue shows what shipped and where.
  Tracked as KAN-11; not yet built.

**Jira is the ongoing source of truth for what was done and why.** A change with
no issue is not ready to move, however finished the code looks.

**Why:** a launch-blocking fix sat unshipped for a full day because "committed"
was read as "delivered", and nothing outside one machine could see otherwise.

### 9b. The status board shows live agent movement, always.

`governance/dashboard/` runs against real repository state, recorded by the
harness on every tool call rather than self-reported. It shows which role is
active, which of the three phases it is in, which files it is touching, and
every dispatch and status-change request between roles.

It is **not** a report anyone writes. It cannot be flattered, and the board
never appears in its own feed — building it is instrumentation, not delivery.

**Division of labour, as Boss set it:** the dashboard is for live activity in
the moment; Jira is the durable record. Neither replaces the other, and
`state/BOARD.md` remains canonical for delivery state.

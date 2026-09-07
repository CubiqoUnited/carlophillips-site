# CARLOPHILLIPS Decision Log

Use this file for durable product and architecture decisions that affect multiple tasks or owners. Detailed implementation evidence belongs in `reports/` or `test_reports/`.

## Current decisions

### CP-DEC-001 — Instruction and role hierarchy

- **Status:** Accepted
- **Decision:** Apply universal rules, then CP project rules, then the explicitly invoked CP role file, then Boss's current instruction.
- **Reason:** Keep universal behavior role-neutral while version-controlling CP ownership and routing with the project.
- **Consequence:** `agents/` contains role definitions only; changing project state belongs in `STATUS.md`, `TASKS.md`, `TEAM-BOARD.md`, this log, or evidence reports.

### CP-DEC-002 — Durable team memory

- **Status:** Accepted
- **Decision:** Chats are working conversations; repository state files are the durable inter-agent handoff truth.
- **Reason:** New tasks and agents must reconstruct current state without depending on chat history.
- **Consequence:** Material operational changes update the appropriate shared state and evidence files.

### CP-DEC-003 — CP ownership and acceptance flow

- **Status:** Accepted
- **Decision:** Pushpa defines and accepts business behavior; Aarti confirms feasibility, implements, and technically verifies; Sushma coordinates QA/UAT, incidents, release, and closure. Richa supplies evidence; Malti owns approved market execution and interpretation.
- **Reason:** Separate business, technical, research, market, and delivery accountability.
- **Consequence:** No role substitutes its approval for another role's required acceptance.

## New decision template

```markdown
### CP-DEC-NNN — Title

- **Date:** YYYY-MM-DD
- **Status:** Proposed | Accepted | Superseded
- **Owner:**
- **Context:**
- **Options considered:**
- **Decision:**
- **Reason:**
- **Consequences/risks:**
- **Verification or review trigger:**
- **Evidence:**
```

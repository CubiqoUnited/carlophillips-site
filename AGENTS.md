Class LOCKED  ·  Owner Boss  ·  Writers Boss only — proposals via PROPOSALS.md  ·  Read standing — every role  ·  Cadence rarely  ·  Budget 200–250 lines (now 443)  ·  v3.8 (2026-09-16)
CP project rules
	•	Instruction order: universal AGENTS.md → this file → invoked role file → Boss's current instruction.
	•	Standing authorization: default is approved. Only two reserved categories always require Boss regardless of anything else — real payment/financial transactions, and any push to Production. Nothing outside those two triggers an approval request or a wait; asking anyway is itself the failure, not caution.
	•	v3.8: Continue through executable work. When authorized for an outcome, continue through the next executable action until the measurable stop condition, a reserved authority gate, or a genuine project blocker is reached. A status update is not a stopping condition.
	•	Scope discipline: a role identifying work outside SCOPE.md's Included list — extra governance, security hardening, tooling nobody asked for — logs it as an INTAKE candidate or a PROPOSALS.md entry. It does not build it first and explain later. Good intentions don't exempt unscoped work from this.
	•	Blocker time-box: 5–10 minutes on a governance/access/permission/credential-class blocker, then TABLE it and move to the next lane item. This is a number, not a feeling — open-ended “keep trying” on the same blocker is the failure this exists to prevent.
	•	v3.8: Blocker scope is the action, not the project. A blocker pauses only the affected action. Record the owner, resolution action and resume trigger, then continue all independent executable work.
	•	v3.8: Editor vs. executing-agent separation. The executing agent owns reasoning and delivery. The approved local editor is only the workspace and file-editing surface unless a separate editor-agent is explicitly authorized.
	•	v3.8: Recoverable stale-file quarantine authority. A role may move clearly stale, domain-relevant material into the recoverable seven-day quarantine (.quarantine/{date}/ with a MANIFEST.md recording source, destination, reason, date, deletion-review date). Permanent deletion remains a separate reviewed action, never automatic.
	•	v3.8: Independent cross-role review. Roles may review and comment on other roles' outputs, agreeing or disagreeing with evidence. They must respect file-writer authority and record their assessment in their own rundown. Each role independently grades relevant backlog items P1/P2; Sushma reconciles the combined assessments.
	•	Repo files are durable team memory; chats are not. Update state/NOW.md, state/BLOCKERS.md, the applicable execution plan, rundown/session record, and release/decision record when project truth changes — not the legacy STATUS.md/TASKS.md/TEAM-BOARD.md, which the clean control plane replaces.
	•	When files disagree: verify against live evidence, correct the stale one, record the reconciliation. Never treat chat alone as authoritative.
	•	No tool-specific instruction file may restate role, priority, or governance content. If a tool requires its own config format (.cursorrules, .antigravity/*, copilot-instructions.md, or a future one), that file may contain only a pointer back to AGENTS.md and agents/*.md — never a parallel copy. Sushma, Aarti, Pushpa, Richa, Malti are project-level roles defined once, addressed by name regardless of which model or tool executes the work.
	•	Same principle one layer up, at the global (user-level) config: ~/.claude/CLAUDE.md, ~/.gemini/GEMINI.md, and any other vendor global file are thin adapters pointing at ~/.codex/AGENTS.md — not separate copies of universal rules. One canonical file per layer, project and global alike.
	•	AGENTS.md, agents/*.md, and DECISIONS.md are never autonomously edited by any lane, including HARDENING. A backlog entry that touches these files is a proposal only — draft on a branch, Boss reviews and approves the diff, then it merges. No role treats ‘it’s on the backlog’ as authorization to rewrite the rules that govern it.
	•	Enforced technically, not just stated: a GitHub CODEOWNERS entry requires Boss as required reviewer on any PR touching AGENTS.md, agents/*.md, or DECISIONS.md. A written-only rule is optional; a required-reviewer gate is not.
	•	Any role's recommended change to a governed file goes into state/PROPOSALS.md — never directly into the file itself, never chat-only.
	•	See docs/overview.md for narrative orientation — read once, never part of required reading before a task.
	•	Every revision of this document is diffed against an actual listing of the repository and the global layer — not only against its own previous version. Self-review detects contradictions; it cannot detect an omission, because a missing entry leaves no trace in the text. Four real files went unlisted through nine revisions for exactly this reason. scripts/check-agent-docs automates the check.
	•	Any role with a genuine Shopify-capability question may consult Shopify's own agentic assistant directly — this is a native-first source, not a workaround. The chat itself is ephemeral and never authoritative on its own; the finding gets logged into that role's rundown or the relevant decision record, same discipline as any other evidence. A chat nobody wrote down didn't happen, for project-truth purposes.
Role routing
	•	Sushma → agents/sushma.md — delivery coordination and closure.
	•	Aarti → agents/aarti.md — Technical Architect and Developer.
	•	Pushpa → agents/pushpa.md — Business Analyst and Product Owner.
	•	Richa → agents/richa.md — research and evidence.
	•	Malti → agents/malti.md — marketing and customer-market interface.
	•	Calling Sushma alone does not invoke the whole team.
	•	User Story = 1 testable feature, broad enough to represent the feature. That's the sizing rule Pushpa writes Story/AC/DoD against — not a task, not an epic, one testable customer-visible unit.
	•	Custom-engineering Boss gate: custom code for governance, tokens, WebSockets, URLs, or keys — anything the system would work fine without — requires Boss approval before Aarti builds it. This is stricter than the general native-first order; it's a named gate, not a preference.
Delivery priorities
INCIDENT (P0/P1) → current deployment blocker → PHASE (active gate) → INTAKE (scoped) → KTLO/BAU → HARDENING
	•	Severity = customer/business/operational impact, not implementation difficulty. Uncertain → use the higher level.
	•	5 lanes, one active item each — see Part 3, “Active lanes.”
Environment rules
	•	Local → dev/isolated testing. staging → staging.carlophillips.com, canonical Staging. main → Production, carlophillips.com.
	•	Tooling path: code edited in Cursor (or equivalent local editor) on a feature branch → committed/pushed to GitHub → Vercel builds and deploys the alias. No environment is edited by hand outside this path.
	•	Staging-first: branch → technical verification → staging → Sushma QA → Pushpa UAT → Boss validation when required → main → Production verification.
	•	Staging mirrors Production payment surface via dedicated Shopify dev store + test payments. Never enable test mode on Production Shopify.
	•	Only main and staging persist on origin. Temporary branches removed after verified merge.
	•	Production requires known rollback path and post-deployment verification.
Commerce ownership
	•	Shopify is authoritative for products, variants, price, availability, cart, checkout, payment, orders, refunds, fulfillment state.
	•	Apliiq owns physical production and fulfillment. Next.js owns customer experience/orchestration only.
	•	No second commerce authority without an intentional architecture decision.
	•	Evaluation order: native Shopify/Apliiq → existing CP capability → Shopify Flow/platform tooling → established third party → custom code.
	•	Tracking chain: Apliiq → Shopify fulfillment/tracking → customer. CP exposes and monitors it; does not become a second tracking authority.
Gate states — not interchangeable
	•	IMPLEMENTED — the code exists. Nothing more is claimed.
	•	TECHNICALLY VERIFIED — Aarti has proven it behaves correctly under test.
	•	DEPLOYED — it is running in a named environment at a known SHA.
	•	UAT PASS — Pushpa has independently confirmed the business behavior in that environment.
	•	OPERATIONALLY PROVEN — it has worked on a real customer path with real evidence, not a test fixture.
	•	DEFERRED — consciously not being done now, with an owner and a re-entry trigger recorded.
	•	BLOCKED — cannot proceed, with the exact external action and resume trigger named.
	•	COMPLETE — every applicable state above has been reached and Sushma has closed it.
	•	These are never used as synonyms. “It’s implemented” is not “it works”; “it’s deployed” is not “customers can use it”; “UAT passed in Staging” is not “proven in Production.” Most false ‘done’ claims are this substitution, not deception.
Phase model
	•	Phase 1 — Site/commerce readiness: complete until support + checkout + payment/order + Apliiq handoff + tracking + cancellation/return/refund + monitoring/reconciliation + controlled E2E proof are all operational.
	•	Phase 1 exit requires a retrospective (Keep/Change/Stop/Add) before Phase 2 opens.
	•	Phase 2 — Production operations: monitor → detect → triage → assign → fix → UAT → release → verify → close.
	•	Phase 3 — Merch/growth: research → hypothesis → positioning → merch/design → Apliiq → Shopify → Next.js → release → measure → scale/iterate/pause/kill.
Execution loops
	•	Development program — drives the active phase to its exit criteria.
	•	Production Watch — permanent, condition-driven; monitors/alerts trigger incident work, resume phase work after closure.
	•	Daily product/operations review — surfaces P1/P2, friction, anomalies into the backlog without displacing higher-severity work.
	•	An external/Boss-only blocker pauses only that action, not the whole phase. Park it, record resume trigger, keep moving.
	•	15-minute continuity watchdog: a standing check, separate from the daily standup and daily rundowns, that only intervenes if an agent is directionally wrong or has stalled with executable work remaining. It redirects; it doesn't replace the actual work loops or add a sixth cadence to plan around.
Model / effort controller
	•	Optimizes Total Cost = AI cost + Time + Rework + Delay — not AI cost alone. A cheaper model that loops for an hour costs more than a stronger one that finishes in ten minutes.
	•	Role sets the default: Sushma — lower model, low effort. Pushpa — lower model, low effort. Aarti — stronger model, higher effort as needed. Richa/Malti follow Sushma's default unless a task's difficulty says otherwise.
	•	Escalate when: loops + retries + wrong direction + no progress > the cost of a stronger model. Path is Low → Higher Effort → Stronger Model, in that order — not a straight jump to the top.
	•	Scale back down once resolved. Staying on a stronger model after the hard part is done is the same waste as under-provisioning was.

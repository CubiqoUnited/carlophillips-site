Sushma — delivery rundown  ·  v3.8 (2026-09-16)
	•	Cold start: state/NOW.md → state/BLOCKERS.md → state/SCOPE.md → highest-priority owned READY item in docs/exec-plans/active/phase-1.md → agents/sushma.md → this checklist. No owned READY item means silent exit.
	•	v3.8: Continue through executable work — after any status update, immediately select and work the next executable action rather than stopping. Stop only at a measurable stop condition, a reserved authority gate (real payment, Production push), or a genuine blocker.
	•	v3.8: Coordinator reconciliation on delegated completion — when a sub-agent/role reports work done, read the result, update NOW.md with current truth, close or reopen the relevant gate, and immediately select the next executable action. Do not let a completed delegation sit unread until prompted.
	•	CREDENTIALS.md expiry scan — any next-rotation-date approaching or passed, escalated before it causes an outage. This is the proactive half that was missing; the ledger only logged after the fact.
	•	v3.8: Required access/service inventory verification — confirm state/CREDENTIALS.md's non-secret service inventory (service, permitted access level, owner, access state, verification date) is current; flag any runtime browser permission that doesn't correspond to an inventory entry.
	•	5-lane status accuracy — is each lane's “active item” still correct, is any lane silently idle.
	•	BLOCKERS.md trigger check — a blocker whose resume trigger cleared but nobody picked back up.
	•	Branch/PR hygiene — abandoned branches outside main/staging, stale open PRs.
	•	v3.8: Closure cleanup — at initiative closure, retain only durable branches/deployments, remove merged temporary branches, confirm obsolete documents are absent (or quarantined per AGENTS.md quarantine rule), and retain the verified rollback deployment.
	•	Release cadence — commits accumulating with no new docs/releases/ entry.
	•	HI Queue accuracy — an “open” item that's actually already resolved.
	•	Aggregates Aarti's, Pushpa's, Richa's, and Malti's new P1s into NOW.md.
	•	v3.8: Cross-role assessment reconciliation — read each role's independent P1/P2 grading (per their own rundown) alongside their findings; reconcile disagreements into one combined severity view in NOW.md.

Aarti — technical rundown  ·  v3.8 (2026-09-16)
	•	Cold start: state/NOW.md → state/BLOCKERS.md → state/SCOPE.md → highest-priority owned READY item in docs/exec-plans/active/phase-1.md → agents/aarti.md → this checklist. No owned READY item means silent exit.
	•	v3.8: Continue through executable work — same rule as Sushma's checklist: a status update is not a stopping condition; continue to the next executable action until stop condition, authority gate, or genuine blocker.
	•	Repo structure vs package.json workspace declaration — catches exactly the app-root duplication finding.
	•	v3.8: Stale-file quarantine scan — identify clearly stale, domain-relevant files (verify by last-commit date, not just presence); move to .quarantine/{date}/ with MANIFEST.md entry (source, destination, reason, date, deletion-review date = +7 days). Never delete directly.
	•	Dependency audit — vulnerabilities, critical packages past EOL.
	•	CI/CD last-N-runs — a silent red run nobody triaged.
	•	Monitor/cron firing check — a defined alert that's actually gone quiet.
	•	v3.8: Live automation verification — an automation counts as operational only after scheduled execution, target access, prompt delivery, decision branches, and resulting behavior have been verified live. Configuration existing in operations/*.yaml is not sufficient evidence on its own.
	•	Test suite health — skipped/flaky tests accumulating unnoticed.
	•	Environment parity — Staging config drifted from Production.
	•	Architecture-drift scan — a second implementation of something Shopify/Apliiq already owns.
	•	v3.8: Closure cleanup (technical side) — confirm merged temporary branches removed, obsolete documents absent or quarantined, verified rollback deployment retained.

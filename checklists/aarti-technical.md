Aarti — technical rundown
	•	Cold start: state/NOW.md → state/BLOCKERS.md → state/SCOPE.md → highest-priority owned READY item in docs/exec-plans/active/phase-1.md → agents/aarti.md → this checklist. No owned READY item means silent exit.
	•	Repo structure vs package.json workspace declaration — catches exactly the app-root duplication finding.
	•	Dependency audit — vulnerabilities, critical packages past EOL.
	•	CI/CD last-N-runs — a silent red run nobody triaged.
	•	Monitor/cron firing check — a defined alert that's actually gone quiet.
	•	Test suite health — skipped/flaky tests accumulating unnoticed.
	•	Environment parity — Staging config drifted from Production.
	•	Architecture-drift scan — a second implementation of something Shopify/Apliiq already owns.

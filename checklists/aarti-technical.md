Aarti — technical rundown
	•	Reads NOW.md first — a Pushpa or Malti finding may already point at the technical root cause before Aarti goes looking.
	•	Repo structure vs package.json workspace declaration — catches exactly the app-root duplication finding.
	•	Dependency audit — vulnerabilities, critical packages past EOL.
	•	CI/CD last-N-runs — a silent red run nobody triaged.
	•	Monitor/cron firing check — a defined alert that's actually gone quiet.
	•	Test suite health — skipped/flaky tests accumulating unnoticed.
	•	Environment parity — Staging config drifted from Production.
	•	Architecture-drift scan — a second implementation of something Shopify/Apliiq already owns.

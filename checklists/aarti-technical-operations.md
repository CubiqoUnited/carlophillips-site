Class CONTROLLED · Owner Aarti · Writers Aarti proposes own; Sushma reconciles · v3.5interim (2026-09-17)

# Aarti — Daily/Checkpoint Checklist

Every result: PASS/FAIL/UNKNOWN/BLOCKED/N-A + what was checked + what was found + evidence location.

- Cold start completed.
- Approved ADR exists with both sign-offs (Pushpa product-fit, Sushma readiness) before any build work.
- Branch/worktree isolated per implementation stream.
- Repo structure vs package.json workspace declaration.
- Dependency audit: vulnerabilities, critical packages past EOL.
- CI/CD last-N-runs reviewed; no silent red run.
- Test suite health: skipped/flaky tests accumulating unnoticed.
- Environment parity: staging config drifted from Production.
- Stale-file quarantine scan (verify by last-commit date, move to .quarantine/{date}/ with MANIFEST.md, never delete directly).
- Live automation verification: operational only after scheduled execution, target access, prompt delivery, decision branches, and behavior all verified live — configuration existing in operations/*.yaml is not sufficient evidence on its own.
- Monitoring, cron, and rollback readiness for anything already in production.

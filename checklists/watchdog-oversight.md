Class CONTROLLED · Owner Watchdog · Writers Watchdog proposes own; Boss reconciles · v3.5interim (2026-09-17)

# Watchdog — Heartbeat Checklist

Every result: PASS/FAIL/UNKNOWN/BLOCKED/N-A + what was checked + what was found + evidence location.

- Independent identity confirmed (this run is not Sushma, not a delivery-chain session).
- Only Sushma interface used this cycle — no direct contact with Pushpa or Aarti.
- Assigned-role scope checked against state/WATCHDOG-BRIEF.md's ACTIVE line.
- ACTIVE, EXCEPTIONS, NEXT_GATE all present and internally consistent.
- Liveness evidence checked (commit/artifact/test/deployment timestamps vs. expected checkpoint).
- Direction evidence checked against approved scope/AC/ADR, not just activity volume.
- Any claimed blocker in the brief independently validated against state/BLOCKERS.md.
- Recovery effectiveness checked if a prior exception is still open.
- Quiet-or-escalate decision recorded in audit/WATCHDOG.md either way.

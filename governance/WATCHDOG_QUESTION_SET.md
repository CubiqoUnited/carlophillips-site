Class LOCKED · Owner Boss · Writers Boss writes · Read Watchdog only · v3.5interim (2026-09-18)

# Standing Question Set (Watchdog → Auditor)

Asked every heartbeat, in full, regardless of what Sushma reports. Sushma's report may add follow-up questions; it may never remove or replace one of these. The Watchdog only learns what it thinks to ask, so this set — not the narrative — is the floor of what gets checked.

## Liveness
1. Any commit in the last 24h? FACT = count, latest SHA, timestamp.
2. Any commit touching `apps/web` in the last 24h? FACT = count.
3. How many files are modified or untracked in the working tree? FACT = count.
4. Latest modification time across `state/*.md`? FACT = file + timestamp.
5. Is the newest working-tree change older than the newest commit? FACT = both timestamps.

## Direction
6. Does `state/BOARD.md` contain a row whose State is IN_BUILD? FACT = count of such rows.
7. Does every `work/assignments/*.md` have a matching `work/items/*.md`? FACT = count of orphans.
8. Do any board rows carry a freshness value of STALE? FACT = count and item IDs.
9. Is there any P1 item with State NOT_STARTED? FACT = count and item IDs.

## Integrity
10. Does `state/WATCHDOG-BRIEF.md` carry all three lines ACTIVE, EXCEPTIONS, NEXT_GATE? FACT = which are missing.
11. Is `state/WATCHDOG-BRIEF.md` older than `state/NOW.md`? FACT = both timestamps.
12. Has `audit/WATCHDOG.md` gained an entry since the previous heartbeat? FACT = entry count.
13. Does `state/BLOCKERS.md` contain any HUMAN blocker without a recorded resolution? FACT = count and IDs.
14. Has any LOCKED file changed in the last 24h? FACT = paths.

## Escalation triggers
15. Does any open blocker name credentials, payment, or production? FACT = IDs.
16. Does `state/NOW.md` contain a value marked SUSPECT or UNVERIFIED? FACT = count.

## Known limitation, recorded deliberately
This set covers repository evidence only. It cannot see live store state, deployment serving IDs, or anything outside the tree — the live mispriced product found on 2026-09-18 would NOT have been caught by any question above. Deployment state is now covered by the declared Deployment Observer (agents/deployment-observer.md), which screenshots GitHub/Vercel and reports to the Watchdog, with every access logged to audit/WATCHDOG.md. LIVE STORE state — product status, pricing, orders — remains covered by NOTHING but Sushma's testimony. That gap is open.

## Goodhart note
This file lives in the repository, so the working roles can read it. Questions are therefore invariants worth satisfying on their own merits, never proxies that could be gamed cheaply. If a question becomes something a role optimizes for rather than a genuine health signal, replace it.

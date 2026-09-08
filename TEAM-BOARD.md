# CARLOPHILLIPS Team Board

> Concise inter-agent handoff board. Detailed truth remains in `STATUS.md`, `TASKS.md`, `DECISIONS.md`/`docs/adr/`, and `reports/`.

```yaml
ACTIVE PHASE: "Phase 1 — Site/commerce readiness"
CURRENT P0/P1: "P0: none currently verified. P1: support/account setup; controlled Shopify-to-Apliiq lifecycle proof; post-sale operations; reliability/alerts; continuous Production watch"
CURRENT OWNER: "Sushma delivery/incident arbitration; Aarti technical delivery and Production Watch; Pushpa business rules/UAT"
IN PROGRESS: "PR #116 merged to staging@ce2bb181. Credential regression is attributed to an eight-hour CLI session token copied into GitHub on September 6. A durable project-only token was created/rebound, but unchanged CLI 56.1.0 rejects that credential class; run 34184480979 attempt 3 failed safely before build/deploy/alias. PR #117 carries the durable-credential governance correction; #118/#119 remain ordered afterward"
BOSS ACTIONS: "HI-P1-POLICY; HI-P1-ORDER"
ADMIN / EXTERNAL ACCESS: "HI-P1-STAGING-VERCEL; HI-P1-SUPPORT-ACCOUNTS; HI-P1-STAGING-ORDER; HI-P1-NATIVE-OPS"
INDEPENDENT GITHUB APPROVAL: "None for staging; main retains one independent approval"
WORK CONTINUING: "Protected-merge reconciliation preparation and live-authority preflight documentation; no broad custom post-payment platform and no real transaction"
WAITING ON: "A Vercel-supported durable credential path that remains project-only and works with the exact protected CLI flow, or explicit authority for the smallest alternate scope/authentication change; later support/native configuration, Production policy and controlled-real-order authorities"
RECENT DECISIONS: "CP-DEC-004 defines next-tranche support, cancellation, return/refund, tracking-remedy, operator-authority, and controlled-order acceptance defaults"
NEXT AUTONOMOUS ACTION: "Aarti resolves project-token/CLI compatibility without architecture change or silent scope expansion; Sushma rebinds and reruns exact 34184480979 inputs, then verifies receipt/alias. Make PR #117 exact-head green and hold merge until ce2bb181 protected Staging succeeds"
RESUME TRIGGERS: "HI-P1-STAGING-VERCEL: scoped token corrected → rerun 34184480979 inputs; #117/#118/#119: predecessor verified plus green exact-head checks → merge/verify; HI-P1-SUPPORT-ACCOUNTS: five Preview variables plus native Shopify activation/operator ownership → Staging drills; HI-P1-STAGING-ORDER: protected store/test access → no-charge order/native exception proof; HI-P1-NATIVE-OPS: authenticated native inspection/config plus alert recipient → subscriptions/Flow/reconciliation proof; HI-P1-POLICY and HI-P1-ORDER: explicit decisions/authority → Production policy/live-order proof"
```

## Handoff format

```yaml
FROM:
TO:
RESULT:
FILES_CHANGED:
VERIFICATION:
BLOCKER:
NEXT_ACTION:
EVIDENCE:
```

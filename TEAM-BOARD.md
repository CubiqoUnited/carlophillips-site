# CARLOPHILLIPS Team Board

> Concise inter-agent handoff board. Detailed truth remains in `STATUS.md`, `TASKS.md`, `DECISIONS.md`/`docs/adr/`, and `reports/`.

```yaml
ACTIVE PHASE: "Phase 1 — Site/commerce readiness"
CURRENT P0/P1: "P0: none currently verified. P1: support/account setup; controlled Shopify-to-Apliiq lifecycle proof; post-sale operations; reliability/alerts; continuous Production watch"
CURRENT OWNER: "Sushma delivery/incident arbitration; Aarti technical delivery and Production Watch; Pushpa business rules/UAT"
IN PROGRESS: "PR #117 merged to staging@42aade89 and protected Staging run 34203965788 passed on READY deployment dpl_7yoVoFWzorpEZDdPiyz6nSpjUCpM. PR #118 is reconciled onto that verified state; #119 remains ordered afterward"
BOSS ACTIONS: "HI-P1-POLICY; HI-P1-ORDER"
ADMIN / EXTERNAL ACCESS: "HI-P1-SUPPORT-ACCOUNTS; HI-P1-STAGING-ORDER; HI-P1-NATIVE-OPS"
INDEPENDENT GITHUB APPROVAL: "None for staging; main retains one independent approval"
WORK CONTINUING: "Protected-merge reconciliation preparation and live-authority preflight documentation; no broad custom post-payment platform and no real transaction"
WAITING ON: "Support/native configuration, Production policy and controlled-real-order authorities; none blocks PR #118 exact-head CI, merge and protected Staging verification"
RECENT DECISIONS: "CP-DEC-004 defines next-tranche support, cancellation, return/refund, tracking-remedy, operator-authority, and controlled-order acceptance defaults"
NEXT AUTONOMOUS ACTION: "Pass PR #118 exact-head required checks, merge to staging, run protected exact-SHA deployment and verify the canonical alias; then reconcile PR #119"
RESUME TRIGGERS: "#117/#118/#119: predecessor verified plus green exact-head checks → merge/verify; HI-P1-SUPPORT-ACCOUNTS: five Preview variables plus native Shopify activation/operator ownership → Staging drills; HI-P1-STAGING-ORDER: protected store/test access → no-charge order/native exception proof; HI-P1-NATIVE-OPS: authenticated native inspection/config plus alert recipient → subscriptions/Flow/reconciliation proof; HI-P1-POLICY and HI-P1-ORDER: explicit decisions/authority → Production policy/live-order proof"
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

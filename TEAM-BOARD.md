# CARLOPHILLIPS Team Board

> Concise inter-agent handoff board. Detailed truth remains in `STATUS.md`, `TASKS.md`, `DECISIONS.md`/`docs/adr/`, and `reports/`.

```yaml
ACTIVE PHASE: "Phase 1 — Site/commerce readiness"
CURRENT P0/P1: "P0: none currently verified. P1: support/account setup; controlled Shopify-to-Apliiq lifecycle proof; post-sale operations; reliability/alerts; continuous Production watch"
CURRENT OWNER: "Sushma delivery/incident arbitration; Aarti technical delivery and Production Watch; Pushpa business rules/UAT"
IN PROGRESS: "PR #116 is green/CLEAN and awaits recorded role decisions before Staging merge. PRs #117/#118 are green/CLEAN with role decisions recorded. PR #119 remains ordered after #118"
BOSS ACTIONS: "HI-P1-POLICY; HI-P1-ORDER"
ADMIN / EXTERNAL ACCESS: "HI-P1-SUPPORT-ACCOUNTS; HI-P1-STAGING-ORDER; HI-P1-NATIVE-OPS"
INDEPENDENT GITHUB APPROVAL: "None for staging; main retains one independent approval"
WORK CONTINUING: "Protected-merge reconciliation preparation and live-authority preflight documentation; no broad custom post-payment platform and no real transaction"
WAITING ON: "#116 role decisions and release sequencing; later configuration/access, Production policy and controlled-real-order authorities"
RECENT DECISIONS: "CP-DEC-004 defines next-tranche support, cancellation, return/refund, tracking-remedy, operator-authority, and controlled-order acceptance defaults"
NEXT AUTONOMOUS ACTION: "Record #116 role decisions; merge green/CLEAN tranches to staging in dependency order; continue live-authority preflight without crossing access, policy or transaction gates"
RESUME TRIGGERS: "#116: role PASS/APPROVE recorded → governance merge/protected release; #117/#118/#119: dependency order and green exact-head checks → merge/verify; HI-P1-SUPPORT-ACCOUNTS: five Preview variables plus native Shopify activation/operator ownership → Staging drills; HI-P1-STAGING-ORDER: protected store/test access → no-charge order/native exception proof; HI-P1-NATIVE-OPS: authenticated native inspection/config plus alert recipient → subscriptions/Flow/reconciliation proof; HI-P1-POLICY and HI-P1-ORDER: explicit decisions/authority → Production policy/live-order proof"
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

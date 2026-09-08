# CARLOPHILLIPS Team Board

> Concise inter-agent handoff board. Detailed truth remains in `STATUS.md`, `TASKS.md`, `DECISIONS.md`/`docs/adr/`, and `reports/`.

```yaml
ACTIVE PHASE: "Phase 1 — Site/commerce readiness"
CURRENT P0/P1: "P0: none currently verified. P1: support/account setup; controlled Shopify-to-Apliiq lifecycle proof; post-sale operations; reliability/alerts; continuous Production watch"
CURRENT OWNER: "Sushma delivery/incident arbitration; Aarti technical delivery and Production Watch; Pushpa business rules/UAT"
IN PROGRESS: "PR #116 governance activation is parked at independent approval. PR #119 tabletop is reconciled onto #118's accepted head and exact-head green. Aarti/Pushpa/Sushma code-readiness decisions for green PRs #117/#118 are complete and await independent GitHub approval"
BOSS ACTIONS: "HI-P1-POLICY; HI-P1-ORDER"
ADMIN / EXTERNAL ACCESS: "HI-P1-SUPPORT-ACCOUNTS; HI-P1-STAGING-ORDER; HI-P1-NATIVE-OPS"
INDEPENDENT GITHUB APPROVAL: "HI-116-APPROVAL; HI-117-APPROVAL; HI-118-APPROVAL; HI-119-APPROVAL"
WORK CONTINUING: "Protected-merge reconciliation preparation and live-authority preflight documentation; no broad custom post-payment platform and no real transaction"
WAITING ON: "Independent latest-head approvals for #116/#117/#118; #117/#118 review readiness is independent of #116. Later: configuration/access, Production policy and controlled-real-order authorities"
RECENT DECISIONS: "CP-DEC-004 defines next-tranche support, cancellation, return/refund, tracking-remedy, operator-authority, and controlled-order acceptance defaults"
NEXT AUTONOMOUS ACTION: "Keep #116/#117/#118/#119 approval gates ready; continue live-authority preflight without crossing access, policy or transaction gates"
RESUME TRIGGERS: "HI-116-APPROVAL: approval recorded → governance merge/protected release; HI-117/118/119-APPROVAL: required review/predecessor gate → merge/verify; HI-P1-SUPPORT-ACCOUNTS: five Preview variables plus native Shopify activation/operator ownership → Staging drills; HI-P1-STAGING-ORDER: protected store/test access → no-charge order/native exception proof; HI-P1-NATIVE-OPS: authenticated native inspection/config plus alert recipient → subscriptions/Flow/reconciliation proof; HI-P1-POLICY and HI-P1-ORDER: explicit decisions/authority → Production policy/live-order proof"
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

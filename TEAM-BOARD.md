# CARLOPHILLIPS Team Board

> Concise inter-agent handoff board. Detailed truth remains in `STATUS.md`, `TASKS.md`, `DECISIONS.md`/`docs/adr/`, and `reports/`.

```yaml
ACTIVE PHASE: "Phase 1 — Site/commerce readiness"
CURRENT P0/P1: "P0: none currently verified. P1: support/account setup; controlled Shopify-to-Apliiq lifecycle proof; post-sale operations; reliability/alerts; continuous Production watch"
CURRENT OWNER: "Sushma delivery/incident arbitration; Aarti technical delivery and Production Watch; Pushpa business rules/UAT"
IN PROGRESS: "PR #116 governance activation is parked at independent approval. PR #117 support reliability, PR #118 Production Watch/webhook recovery, and stacked PR #119 controlled-lifecycle/synthetic drills are prepared without live activation claims"
HUMAN BLOCKERS: "HI-116/117/118/119-APPROVAL; HI-P1-SUPPORT-ACCOUNTS; HI-P1-STAGING-ORDER; HI-P1-NATIVE-OPS; HI-P1-POLICY; HI-P1-ORDER — authoritative details in reports/HUMAN_INTERVENTION_STICKY_RED.md"
WORK CONTINUING: "Representative exception tabletop on PR #119; protected-merge reconciliation preparation and live-authority preflight documentation; no broad custom post-payment platform and no real transaction"
WAITING ON: "PR #116 latest-head independent approval first; follow-on PR reviews after canonical staging reconciliation; later Production policy and controlled-real-order authorities"
RECENT DECISIONS: "CP-DEC-004 defines next-tranche support, cancellation, return/refund, tracking-remedy, operator-authority, and controlled-order acceptance defaults"
NEXT AUTONOMOUS ACTION: "Complete and verify the PR #119 representative exception tabletop, then re-evaluate every gate; PR #116 does not block independent review of #117/#118"
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

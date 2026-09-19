Class EVOLVING · Owner Sushma · Writers Sushma only · Read standing · v3.5interim backend (2026-09-17)

# Board

Canonical per-item record. Sushma is the sole reconciler — do not hand-edit a row without a corresponding work/items/{id}.md and event trail. Board rows are a projection of work/items/*; if they disagree, work/items/* wins.

Required fields per item: Item ID, Module, Priority, Canonical workflow state, Assigned role, Blocker overlay, Latest evidence, Evidence timestamp, Promised checkpoint, Next permitted transition, Transition owner, Freshness condition.

A blocked item retains its real lifecycle state as a compound value, e.g. `IN_BUILD + BLOCKED_HUMAN` — never collapses to just `BLOCKED`.

| Item ID | Module | Priority | State | Assigned | Blocker overlay | Evidence | Evidence @ | Checkpoint | Next transition | Owner | Freshness |
|---|---|---|---|---|---|---|---|---|---|---|---|
**DEPLOYMENT BOUNDARY (ADR-001, verified 2026-09-18): only `apps/web` is deployed.** `vercel.json` sets `outputDirectory` to `apps/web/.next` and builds that workspace alone. Root `app/`, `components/`, `lib/commerce/`, `lib/releases/`, `contracts/` are never built or served. All work targets `apps/web`; evidence cited from the root tree is evidence about code that does not run.

**LAUNCH POSTURE (D-014, Boss 2026-09-18): if we are not blocked by a P1 or a showstopper, we launch.** Priorities below are graded against one question — does this stop a launch, or cost real money on contact? Governance work is deliberately P3 under this posture, not because it stopped mattering, but because it does not stop a customer buying a hoodie.

| CP-CAT-001 | Catalogue | P1 LAUNCH — **dominant blocker** | READY | Boss/Pushpa — sourcing + content, not engineering | none — unblocked, spec supplies the target | UI-SPEC: 6 categories × 6 items = 36; live = 1 category, 1 product. Min credible launch: 4–5 more hoodies with images, copy, approved prices | 2026-09-18T00:00:00Z | 5–10 items per category | READY_FOR_PO | Boss | FRESH |
| CP-VARIANT-001 | Commerce | P2 | IN_BUILD + MITIGATED | store admin | BLOCKED_HUMAN (H-005) | 6 variants DENY/tracked/availableForSale false, verified pre-disconnect | 2026-09-18T00:00:00Z | Sidekick answer on permanent S/M/L restriction | READY_FOR_PO | Pushpa | STALE — unverifiable while H-005 open |
| CP-GATE12 | Governance migration | P3 POST-LAUNCH | IN_BUILD | Aarti/Sushma | none | PR #150 commit 402a324 | 2026-09-17T00:00:00Z | PR merge | READY_FOR_STAGING | Sushma | FRESH |
| CP-COM-001 | Commerce integrity | P2 POST-LAUNCH | REQUIREMENTS_DRAFTED | Pushpa | none | work/items/CP-COM-001.md rev 2, live GraphQL read | 2026-09-18T00:00:00Z | re-derivation against D-011 + D-014 | REQUIREMENTS_DRAFTED (rev 3) | Pushpa | STALE — premise changed twice |
| CP-DEF2-001 | Environment gating | P1 LAUNCH | NOT_STARTED | Aarti | none — NOT blocked by H-005 | /checkout-design-review returns 200 on production with "Private staging review · Draft"; getCommerceEnvironment() ignores VERCEL_ENV | 2026-09-18T00:00:00Z | gate honours VERCEL_ENV, all 4 call sites confirmed | IN_BUILD | Aarti | FRESH |
| CP-HAPPYPATH-001 | Launch | P1 LAUNCH | IN_BUILD (production partial) | Pushpa/Aarti | staging leg BLOCKED by CP-STAGING-DISPATCH + H-005 | HP-1..HP-4 PROVEN on production in a real browser, 2026-09-18 | 2026-09-18T00:00:00Z | HP-5 checkout handoff | READY_FOR_PO | Pushpa | FRESH |

**HP-1..HP-4 PROVEN on production (real browser, not curl), 2026-09-18.** PDP loads with correct price and copy; size selection offers only S/M/L; CTA moves "CHOOSE A SIZE" → "ADD TO BAG - $128"; add-to-bag succeeds with "Added to bag.", header Bag (1), no console errors; /bag shows black/m, $128, subtotal $128, CHECKOUT CTA present. **Deliberately stopped before CHECKOUT** — past that is Shopify's real checkout and real payment, a reserved Boss gate. HP-5 is ready-but-unexecuted.
**Read this for exactly what it is:** it proves the **production storefront path only**. It says nothing about the staging path, and nothing about FR-6..FR-9. It does not make the happy path "done".
| CP-GATEWAY-001 | Commerce | P1 LAUNCH | NOT_STARTED | store admin | none | unverified — prod LIVE / staging TEST (Pushpa LB-6) | 2026-09-18T00:00:00Z | confirm before launch | IN_BUILD | Sushma | FRESH |
| CP-STAGING-DISPATCH | Environment | P1 LAUNCH | NOT_STARTED | store admin | none | #1005 fulfilment service "Apliiq Dropship Fulfillment", USPS tracking created 2026-09-17 | 2026-09-18T00:00:00Z | before repeated staging rehearsal | IN_BUILD | Sushma | FRESH |

**Directive impact (D-011, 2026-09-18):** CP-COM-001 revision 2 is graded STALE, not wrong. It was derived before Shopify was declared authoritative for inventory, fulfilment, tax and payments — which is most of what its AC-INV / AC-TAX / AC-FUL / AC-CAP families specify. Pushpa is re-deriving. Its store-state facts are also superseded: 4 products became 2, and the Tee it prices is now DRAFT. No build may be dispatched against revision 2.

## Not on the active board (deliberately, so the board carries no dead weight)

- **Phase 1 real-commerce closure (H-002)** — DEFERRED by Boss decision 2026-09-18. No row, no owner, no checkpoint. Basis corrected twice same day; current and verified basis: NO real customer order exists (all five orders are test/refunded). Deferral stands. Not closed: Phase 1 must not be described as fully closed.
- **Shopify connector (H-003)** — RESOLVED 2026-09-18. Stale OAuth token behind a connector displaying as "connected".
- **Order #1005 fulfilment (H-004)** — CLOSED INVALID 2026-09-18. Never a defect; the empty array was an MCP convenience-tool artifact. No board row, no owner, no work owed.
- **CP-PRICE-001 (cost-basis pricing)** — REMOVED 2026-09-18. Boss superseded D-015: the Hoodie is $128.00 uniformly across 9 variants, so the only mispriced product is the disposable test one. No pattern, no gate. Survives as a per-item price sanity check inside Pushpa's AC-CAT-4, which needs no board row.
- **D-FUL-001** — WITHDRAWN with H-004. Never a defect. CP-COM-001 revision 2 is clean of both retracted premises and is now a live board row above.
- **58-vs-45 validator/matrix reconciliation (H-001)** — open, owner Aarti. Not yet a board row because it is a precondition inside CP-GATE12 evidence, not separable work. Promote to its own row if Gate 12 is otherwise ready and this alone holds it.

See state/STATUS-SCHEMA.md for the freshness condition values (FRESH / DUE / STALE) and governance/WORKFLOW_AND_STATES.md for the canonical state list and compound blocker-overlay notation.

---
id: PROPOSALS
owner: boss
class: evolving
version: 1.1
last_updated: 2026-09-15
review_frequency: as raised
---

Class EVOLVING  ·  Owner Boss reviews  ·  Writers all roles append their own entries  ·  Read standing for Boss; on-demand for roles  ·  Cadence as raised  ·  Budget —

- Every role may append its own entry; no role edits or deletes another role's entry or writes the governed target directly.
- Entry heading/ID: `YYYY-MM-DDTHHMMSSZ-<role>-<slug>` in UTC. Timestamp, role, and task slug make concurrent appends collision-safe.
- Each entry contains: author role, target file/section, current text, proposed text, reason, status `pending`, and any supporting immutable record path.
- Entries are append-only after creation. Boss records approval or decline without rewriting the proposal; only an approved entry becomes a PR.

## 2026-09-15T093616Z-sushma-file-authority-matrix-alignment

- Author role: Sushma
- Target files/sections: `state/BLOCKERS.md`; `scripts/check-agent-docs`; the Gate 12 changes to `AGENTS.md`, `agents/*.md`, `checklists/*.md`, and `state/SCOPE.md`
- Current text/state: the Gate 12 feature branch makes `BLOCKERS.md` Sushma-only; the validator does not enforce the complete File Authority Matrix; agent-authored changes are present in LOCKED and CONTROLLED paths without a matrix-form proposal and approval record.
- Proposed text/action: restore `BLOCKERS.md` to all-five-role append-only ownership; extend validation to enforce the complete matrix, append-only/runtime/versioning rules, and deployed-registry drift; do not merge agent-authored LOCKED changes; treat CONTROLLED changes as proposed until Boss approval; have Boss supply or apply any required LOCKED-file changes.
- Reason: align Gate 12 with the authoritative CARLOPHILLIPS File Authority Matrix v3.7 and prevent a false closure.
- Status: pending
- Supporting immutable record: current PR `#145`, commit `1a2c55457d23801e8a6b1ce556713b191867f4eb`; matrix supplied by Boss on 2026-09-15.

## 2026-09-15T100000Z-boss-file-authority-matrix-alignment-approval

- Proposal: `2026-09-15T093616Z-sushma-file-authority-matrix-alignment`
- Decision: approved
- Authority: Boss
- Approved scope: controlled checklist, SCOPE, and `scripts/check-agent-docs` changes required to align Gate 12 to the File Authority Matrix; no LOCKED-file changes.
- Recorded separately so the append-only proposal entry above remains unchanged.

## 2026-09-18T000000Z-boss-phase1-real-commerce-closure-tabled

- Author role: Boss (decision relayed via coordinator; recorded by Sushma as sole state writer)
- Target files/sections: `state/BLOCKERS.md` H-002; `state/NOW.md` Current position; `state/SCOPE.md` Deferred (already consistent)
- Current text/state: H-002 open under HUMAN, awaiting a Boss decision on whether to pursue real-commerce proof now or defer.
- Decision: **TABLED / DEFERRED for this cycle.** Do not pursue real orders, Apliiq handoff, or tracking/support/cancellation/return/refund validation in this cycle. No work, evidence gathering, or dispatch against Phase 1 real-commerce closure is authorized.
- Standing consequence: no role may claim or imply Phase 1 is fully closed. Phase 1 closure remains scoped to its explicitly trimmed, non-transactional scope.
- Basis of decision — stated plainly: this was decided WITHOUT live commerce ground truth. The intended Shopify-side sanity check could not run; the connector is invalidated (`get-shop-info` returns "connection to this connector was invalidated... reconnect from connector settings") and this session is non-interactive, so OAuth could not be completed. Store existence, products, collections, orders, and customers are all UNVERIFIED — not confirmed empty. This entry must not be read as "we checked the commerce state and decided to defer."
- Re-entry precondition: Shopify connector reconnected and store state verified (see H-003).
- Re-entry trigger (precondition above, plus any one): (a) Boss explicitly reopens it in state/PROPOSALS.md; (b) a real customer order is placed against the production store; (c) Apliiq integration or fulfilment work is added to state/SCOPE.md Included; (d) verified store state materially alters what Phase 1 must cover.
- Status: decided — deferred
- Supporting immutable record: state/BLOCKERS.md H-002 (moved to Deferred), state/SCOPE.md v2.0 Deferred section.
- **Correction appended 2026-09-18** (original entry unchanged above, per append-only rule): the "without live commerce ground truth / UNVERIFIED" basis is SUPERSEDED. The Shopify connector was reconnected the same day and store state is now VERIFIED — see state/BLOCKERS.md H-002 corrected basis and H-003 resolution. The deferral decision itself is unchanged and still stands; only its basis is corrected. Material new fact: a real, paid, fulfilled customer order (#1005) already exists.
- **Second correction appended 2026-09-18 — the correction immediately above is RETRACTED.** #1005 is NOT a real order: first-hand GraphQL shows `test: true`, `paymentGatewayNames: ["bogus"]` (Shopify test gateway), transaction gateway "bogus" / test true / SALE / 19.30. No money moved, no customer charged. Correct standing basis: store state VERIFIED, and verification shows NO real customer order exists — four refunded test orders plus one test-gateway order. Both prior basis lines are left in place unaltered so the assert-then-retract sequence stays legible. The Boss deferral decision has never changed across all three basis versions and still stands.

## 2026-09-18T010000Z-sushma-agents-md-register-decisions-log

- Author role: Sushma
- Target file/section: `AGENTS.md` (LOCKED) — "Where things live", the `state/` line
- Current text: `- state/ — SCOPE, NOW, BOARD, BLOCKERS (categorized), PROPOSALS, ACCESS_REGISTRY, generated briefs, signals/, sessions/`
- Proposed text: `- state/ — SCOPE, NOW, BOARD, BLOCKERS (categorized), PROPOSALS, DECISIONS-LOG, ACCESS_REGISTRY, generated briefs, signals/, sessions/`
- Reason: Boss instructed 2026-09-18 that all Boss decision requests live in ONE append-only place with a fixed QUESTION/OPTIONS/IMPACT/RECOMMENDATION format. `state/DECISIONS-LOG.md` is created and populated. AGENTS.md is LOCKED, so Sushma cannot register it there directly; without registration the file is invisible to the entry map and to the Gate 12 stop condition ("every file in AGENTS.md's Where things live exists with a class/owner header").
- Status: pending
- Supporting immutable record: state/DECISIONS-LOG.md v1.0.

## 2026-09-18T120000Z-pushpa-prd-live-state-corrections

- Author role: Pushpa
- Target files/sections: `PRD.md` — "Canonical runtime authority" (Hoodie variant scope); "Shopify-mimic Staging digital QA boundary" (no-order guarantee, unchanged-inventory criterion); "Customer purchase and aftercare acceptance" (fulfilment/tracking truth)
- Current text/state:
  1. "The Signature Hoodie remains scoped to S/M/L" — live store shows **9 variants**.
  2. "QA must not enter payment, submit an order or retain a private checkout URL" and "The proof is generated without entering payment, submitting an order or querying order data" — the Staging store contains order **#1005, PAID and FULFILLED, real customer, real NJ shipping address**.
  3. "signed synthetic webhook observation and unchanged inventory" — inventory has changed; one variant is at **-1**.
  4. PRD has no rule covering a fulfilment status that is unsupported by a fulfilment record, which is the live condition of #1005 (blocker H-004).
- Proposed text/action:
  1. Replace the S/M/L scope sentence with the approved live variant set, or record why 6 of 9 variants are unapproved. Any variant-coverage or resolver proof citing 3 variants should be marked superseded.
  2. Boss decides D-1 first (amend the rule, record an exception, or reclassify the store's role); PRD text then follows that decision. I am not proposing specific wording ahead of the decision because all three outcomes produce different text.
  3. Replace "unchanged inventory" with a criterion that is testable in a store with live orders, and exclude made-to-order variants from inventory-delta assertions entirely (see AC-INV-1/AC-INV-2).
  4. Add: an order must not present a fulfilled/shipped state on any customer surface unless a fulfilment record with carrier and tracking (or an approved no-tracking reason code) exists; where status and the fulfilments array disagree, the array is authoritative (AC-FUL-1 through AC-FUL-6).
- Reason: PRD-vs-live drift confirmed by a first-hand Shopify read on 2026-09-18. These are not stylistic edits — items 2 and 4 mean an acceptance criterion currently in the PRD cannot be satisfied by the store it governs, so staging sign-off is not possible against the text as written.
- Status: pending
- Supporting immutable record: `work/items/CP-COM-001.md` (sections 1.2, 2, 3, 9); `checklists/pushpa-product-uat.md` findings 2026-09-18; `state/BLOCKERS.md` H-004.

## 2026-09-18T140000Z-pushpa-prd-live-state-corrections-revision2

- Author role: Pushpa
- Relates to: `2026-09-18T120000Z-pushpa-prd-live-state-corrections` (append-only; that entry stands unedited, this one corrects it)
- Correction: two facts underpinning the earlier entry were wrong, confirmed by direct GraphQL read of order #1005.
  1. Item 4 of the earlier proposal (a PRD rule for fulfilment status unsupported by a fulfilment record) was motivated by a defect that **does not exist**. #1005 has fulfilment `gid://shopify/Fulfillment/4468221083854`, SUCCESS, USPS, tracking 9400150899563505738795. The empty array was an artifact of the `get-order` MCP tool. The proposed AC-FUL wording is still worth adding as a general truthfulness rule, but its stated justification is withdrawn — it is preventive, not remedial.
  2. Item 2 rested on #1005 being a real paid customer order. It is `test: true`, gateway "bogus". **Revised proposal: amend PRD lines 42/55 to explicitly permit test-gateway orders in the Staging store**, rather than treat the existing order as a violation. This is the opposite recommendation to the earlier entry, which implied an exception or reclassification might be needed.
- New proposed addition: make PRD's `evidence_only` doctrine explicit for orders — a `test: true` or test-gateway order is `evidence_only` and may never satisfy an operational payment-capture, revenue, entitlement, or release gate.
- Items 1 and 3 of the earlier entry (9-variant drift; "unchanged inventory" criterion) are UNCHANGED and still proposed.
- Status: pending (supersedes the earlier entry's items 2 and 4)
- Supporting immutable record: `work/items/CP-COM-001.md` section 0 (R-1, R-2); `checklists/pushpa-product-uat.md` Revision 2.

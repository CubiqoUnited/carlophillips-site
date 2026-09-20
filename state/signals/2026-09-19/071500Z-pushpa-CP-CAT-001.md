ITEM: CP-CAT-001 / ADR-0001 — product-fit gate re-review
RESULT: APPROVED — product-fit gate cleared
EVIDENCE: decisions/ADR-0001-catalogue-sizing-and-navigation.md §12 (verdict); reviewed against §11 (Aarti's revision) and my own §10

VERIFIED FACTS
- §11.1 satisfies §10.2: sweep widened to every product regardless of status (ACTIVE + DRAFT) in both stores, Rapid Logo Tee named explicitly, metafield-before-code-deletion sequencing preserved.
- §11.2 satisfies §10.3: curatedVariants vs availableVariants split means exclusion keys on curation-mismatch only, never stock (sold-out curated product still renders truthfully). Exclusion logging (handle + rejected value) scoped to both product-loader.ts:70 and :124, plus /shop grid, home catalogue, menu-category counts.
- §11.3 satisfies §10.4: depth-3 ACTIVE-product floor and approved-vocabulary reconciliation added as two independent gates; below-depth products stay reachable on /shop and by direct URL; unrecognised slugs reported via the same observability mechanism as §10.3.
- A2 closed by Aarti's grep (§11.4): product-loader.ts:29,232 is the only size-restriction control in apps/web.

NEW — AC-18 added to §10.5
Aarti's A2 grep surfaced ProductForm/index.tsx:261,268 hardcoding "S, M and L" copy independent of actual curated sizes. Not a blocker for this ADR (accurate for the Hoodie today), but it is product-facing correctness, not a code-quality note — the first non-S/M/L curated product ships false copy on a live-payments store. Added as AC-18: size-selection prompt/validation copy must derive from the product's curated size set. Gates the first non-S/M/L probe product in §10.6, not this ADR.

NEXT: Sushma's readiness gate (§6.1 live-status-inclusive read via her channel), then build in isolated worktree per §6.3. AC-1..AC-18 and §10.6 staging plan (six probes) are the definition of done. A3 (F4/F6 vs NOW.md:33 contradiction) still open — technical, not mine, must resolve before build is graded.
OWNER: Sushma (readiness gate + store read), then Aarti (build)
RESUME: Pushpa resumes at staging acceptance against AC-1..AC-18, including AC-18 on the first non-S/M/L probe.

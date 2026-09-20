ITEM: CP-CAT-001 / ADR-0001 — product-fit gate
RESULT: CHANGES_REQUESTED — design endorsed, three missing product controls block build
EVIDENCE: decisions/ADR-0001-catalogue-sizing-and-navigation.md §10 (verdict, AC-1..AC-17, staging plan)

VERIFIED FACTS
- Hoodie preservation holds. NOW.md:62 Admin API read: 3 variants, black/s,m,l, $128, all availableForSale. A1 CLOSED TRUE; removing the filter is a no-op for the Hoodie.
- Case handling already correct: apps/web/src/lib/providers/shopify/product-loader.ts:232 compares size.toUpperCase() against the uppercase set, so lowercase s/m/l survive. Closes NOW.md:65's "not yet read in code" observation.
- Exclusion has two paths, not one: product-loader.ts:70 already returns null cleanly; product-loader.ts:124 maps every transport unconditionally. Both must exclude.
- Rapid Logo Tee is DRAFT, 6 variants s..xxxl at $14.34 (NOW.md:66). ADR §6.2 scopes its metafield sweep to ACTIVE products only, so the Tee is outside it.

BLOCKING CHANGES
1. §10.2 — the global filter is today a silent second net over the DRAFT Tee. Deleting it means setting that product ACTIVE publishes xl/xxl/xxxl at cost basis on a live-payments store. This is D-027 in waiting. Sweep must cover ACTIVE *and* DRAFT in both stores; metafield authored and read back before code ships.
2. §10.3 — "zero survivors excludes the product" is the right rule and I endorse it; F2's priced-unbuyable page is a trust failure. Two conditions: exclusion keys on curation never on stock (a sold-out product must still render a truthful unavailable state, CP-CAT-001 §3), and exclusion must be observable to us, not silent.
3. §10.4 — live-derived navigation. Risk is smaller than it looks: ACTIVE is already gated by CP-CAT-001 §3 DoD, so a category cannot appear before its product passes acceptance. Two gaps: a depth-1 category renders "1 PIECE" and reads broken — require minimum depth 3 for a menu entry, products still reachable on /shop; and a mistyped productType must not mint a category — reconcile derived slugs against an approved vocabulary. ADR §6.5 offers "listing discipline" as mitigation; discipline is not a control.

ASSUMPTIONS / NOT CLOSED BY ME
- A2 (no other code re-applies a size restriction) is a technical verification, not mine. Must be closed before build, not assumed by this gate.
- A3 (F4/F6 vs NOW.md:33 contradiction) unresolved. If the deployed build differs from this tree, the file:line facts the ADR rests on may not describe what serves customers. I did not treat the live site as proof of approved behaviour.
- Apliiq's support for numeric/footwear sizing is unknown. Correctly NOT a blocker for this ADR — it unlocks code, not merchandising — but must be answered before copy or photography spend on those categories.
- Depth-3 is my merchandising judgement, not a derived fact. Boss may overrule it.

NEXT: Aarti revises §10.2/§10.3/§10.4 into the ADR; on those three changes the product-fit gate is APPROVED without further review. A2 and A3 close before build. CP-CAT-001 §0 C1/C2/C3 are mine to retire on merge, not before.
OWNER: Aarti (ADR revision), then Sushma (delivery-readiness gate + §6.1 store read via her channel)
RESUME: Pushpa resumes at staging acceptance against AC-1..AC-17, on a remote SHA.

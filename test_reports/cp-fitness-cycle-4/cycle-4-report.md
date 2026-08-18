# CP Fitness Cycle 4 Evidence

## 1. Objective completed and revision

Converted the static capability inventory into executable exact-operation policy and replaced `/bag` plus `/cart` monolithic-shell wrappers with source-labeled Server Component states. Local remains visibly non-commerce; Preview/production fail unavailable until Shopify cart writes are directly verified.

Branch: `codex/cp-fitness-baseline`

Base: `0731472`

Cycle commit: returned by Git in the cycle handoff. No push, PR, deployment, Shopify/provider mutation, purchase, credit use, order, message, or production action occurred.

## 2. Exact changed-file groups

- Capability policy: `contracts/capability-registry.schema.json`, `config/capability-registry.json`, `lib/orchestration/capability-registry.js`.
- Bag policy/presentation: `lib/commerce/bag-decision.js`, `components/commerce/bag-state.jsx`, `app/bag/page.js`, `app/cart/page.js`, `app/page.js`.
- Tests: `tests/capability-registry.test.js`, `bag-decision.test.js`, `bag-state.test.jsx`, `contracts.test.js`.
- Governance/status: `ARCHITECTURE.md`, `README.md`, `STATUS.md`, `TASKS.md`, `docs/shopify-capability-access-audit.md`, and `docs/status/*`.
- Evidence: this report, `verification.json`, and three browser screenshots in this directory.

## 3. Tests, commands, and artifacts

- `yarn lint`: passed with zero warnings.
- `yarn test`: 16 files / 81 tests passed.
- `yarn build`: passed; 12 routes; `/bag` and `/cart` first-load JS 94 kB versus the remaining 101 kB client-shell wrappers.
- Local desktop/mobile: `local_preview`, fixture source, checkout disabled, no console errors/overlays/checkout links/overflow.
- Preview desktop: `unavailable`, unavailable source, no false empty-Shopify-cart claim, no fallback, console error, overlay, or checkout link.
- Machine evidence: `verification.json`; executable registry: `config/capability-registry.json`.

## 4. Exists / Partial / Proposed / Missing changes

- Executable capability discovery: Proposed -> Exists locally with schema/invariant tests.
- Dedicated truthful bag/cart route: Missing -> Exists locally for local and unavailable states.
- Shopify cart operation access: remains Missing; selected adapter is explicitly insufficient.
- Live authenticated app/access audit: remains Missing but is now authorized for the immediately following cycle.
- Active Shopify cart, checkout, and order: remain Missing and fail-closed.
- Supported framework: Missing. Next.js `14.2.3` is end-of-life and must migrate before production.

Indicative fitness: **4.5/10 (Partial local foundation)**. G0 is locally strong; G1 remains Partial until the live access audit; G2–G7 remain incomplete.

## 5. Failures and contradictory evidence

- The first component test exposed the React 18/Vitest transform requirement for an explicit React import; fixed without changing runtime behavior.
- Existing prose described the bag as an empty shell. It is now a truthful decision surface and docs were reconciled.
- Official Next.js sources observed on 2026-07-22 identify supported security releases as 15.5.21 Maintenance LTS or 16.2.11 Active LTS. The tracked `14.2.3` version is therefore not a fit production base even though build/tests pass.
- The authenticated Shopify session has not yet been inspected in this cycle; no app access claim was upgraded.

## 6. Human/external blockers and exact resume points

- Shopify/app audit: Product Owner authorized existing authenticated-browser read-only inspection. Resume next cycle with Storefront/cart, Apliiq, Modelize, Spin tools, MyDesigns, Flow, and Trending Finder; capture sanitized settings/access/billing evidence and make no changes.
- Cart: after the audit, add only evidence-proven operations to the registry. A no-order cart write test remains separately approval-sensitive if it would mutate Shopify state.
- Framework: after the immediately scheduled audit, migrate locally from Next.js 14.2.3 to a supported line and run clean install/lint/test/build/browser regression before deployment.
- Vercel remains HTTP 402. Resume only at approved Preview deployment after account restoration and supported-framework evidence.

## 7. Product Owner decisions required

- No decision is needed to attempt the authorized read-only Shopify browser audit.
- Separate approval remains required for charges/credits, writes, cart mutation tests, samples/orders, provider activation, app/Flow changes, publish, deployment, merge, and production.
- Later product/media/fulfillment/policy approvals remain pending.

## 8. Rollback and next bounded cycle

Rollback is a Git revert of the Cycle 4 commit; no external state changed.

Immediate next cycle: use the existing authenticated Shopify browser session for the P0 live read-only inventory/readiness audit, update the registry and blockers from actual evidence, and continue safe local work around inaccessible surfaces. The following local cycle migrates the end-of-life Next.js stack to a supported security line.

Official security references consulted:

- `https://nextjs.org/blog/july-2026-security-release`
- `https://nextjs.org/blog/security-update-2025-12-11`
- `https://github.com/vercel/next.js/security/advisories/GHSA-f82v-jwr5-mffw`

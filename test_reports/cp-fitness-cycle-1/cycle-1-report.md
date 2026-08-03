# CP Fitness Cycle 1 Evidence

## 1. Objective and revision

Objective completed: establish a truthful local baseline, minimal source/release contracts, fixture isolation, and reproducible quality gates without Shopify mutation, deployment, procurement, merge, or production action.

Branch: `codex/cp-fitness-baseline`  
Base: `425f50babb18668fa7a12e7bf4ea9d4d99c1b84b`  
Cycle commit: reported by Git after this evidence package is committed.

## 2. Changed-file groups

- Governance/status: root `AGENTS.md`, `PRD.md`, `ARCHITECTURE.md`, `STATUS.md`, `TASKS.md`; `docs/status/*`.
- Truthful entry/release docs: `README.md`, `QUICKSTART.md`, `DEPLOYMENT.md`; historical warnings in `memory/PRD.md` and the dated Vollebak comparison.
- Tooling: `package.json`, `yarn.lock`, `.eslintrc.json`, `.env.example`, `.gitignore`.
- Contracts/policy: `contracts/*.schema.json`, `lib/commerce/release-policy.js`, product visibility and legacy data-source policy.
- Shopify repairs: bounded 429 retry, requested search `__typename`, lint-safe service naming.
- Fixture/media isolation: local fixture under `fixtures/`; two unverified detail images moved out of `public/`.
- Tests/evidence: `tests/*.test.js` and this evidence directory.

## 3. Commands and artifacts

- Fresh `yarn install --frozen-lockfile`: pass.
- `yarn lint`: pass, zero warnings.
- `yarn test`: pass, 5 files / 21 tests.
- `yarn build`: pass, 12 routes generated.
- Browser: desktop and mobile HTTP 200, no console errors or framework overlay, no mobile horizontal overflow.
- Machine-readable result: `verification.json`.
- Screenshots: `local-home-desktop.png`, `local-hoodie-desktop.png`, `local-hoodie-mobile.png`.

## 4. Evidence-status changes

- Governance/tooling: Missing/Changing -> Exists locally.
- Truth contracts and release policy: Missing -> Exists locally with contract tests.
- Fixture isolation: Partial/Unsafe -> Exists for product reads; fixtures are local-only and non-commerce.
- Hoodie media truth: Partial -> clearer Partial; one recorded front candidate renders, unverified detail images are quarantined.
- Active Shopify browsing/cart/checkout: remains Missing.
- Product Release Record schema: Exists; a real canonical Hoodie release record remains Missing pending evidence binding.

## 5. Failures and contradictions

- Initial Yarn install failed because the existing dependency tree contained pnpm state and a stale Yarn cache entry. A fresh tree and isolated Yarn cache passed; the old tree is recoverable under `/tmp/cp-node-modules-backup.6NugTj` for this machine session.
- First lint/build correctly rejected non-hook functions named `useShopify*`; they were renamed and zero-warning lint now passes.
- Historical docs asserted production readiness, destructive cutover, live cart/checkout, and Printify completion. Current docs supersede or clearly mark those claims historical.
- A successful build still does not prove active commerce, deployment reachability, or operational readiness.

## 6. Human/external blockers

- Vercel: authorized owner restores `carlophillips-site` access. Resume at an approved Preview-only deployment and browser/network verification; do not promote production.
- Shopify/POD/operations: Product Owner separately authorizes any write, activation, order, sample, paid action, or provider contact. Resume only at the specifically approved boundary and update the release record.

## 7. Product Owner decisions

- Select Signature Hoodie one-product proof or broader 12-product catalog restoration.
- Later approve product facts, price, media/disclosure, fulfillment mapping, test commerce, merge, and production independently.

## 8. Rollback and next cycle

Rollback: revert the Cycle 1 commit on its feature branch. The previous source state remains at `425f50b`; no external system was changed. The quarantined images can be restored by Git if provenance is later proven.

Next bounded cycle: put the existing read-only Shopify client behind a server-only Commerce Gateway, add sanitized adapter/error tests, create a draft Hoodie release record only from observed evidence, and render one reusable non-buyable Shopify-backed PDP. Product scope remains configurable and no Shopify write or deployment is included.

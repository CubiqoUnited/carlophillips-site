# Repository layout and discipline decision

Status: accepted for the current single-storefront phase  
Date: 2026-08-14

## Decision

CARLOPHILLIPS will adopt the attached proposal's boundary discipline without migrating the current repository into an `apps/` and `packages/` monorepo now.

The repository currently has one Next.js deployable, one Yarn Classic lockfile, one Vercel project, and no independently released package or second application. Moving the same code into workspace folders would add build, import, deployment-root, caching, and release complexity without creating a new authority boundary. A monorepo becomes eligible only when a second real deployable or an independently versioned and consumed package exists.

## Current authoritative mapping

| Concern in the proposal | CARLOPHILLIPS authority now | Decision |
| --- | --- | --- |
| Visual tokens and themes | `app/design-tokens.css`, governed by `docs/design-system.md` | Keep. This is the sole raw presentation-value authority. Do not create parallel TypeScript token truth. |
| Design-system runtime exceptions | `lib/design-system/runtime-contract.js` | Keep as the documented, mechanically tested serializer mirror only. |
| Shared and feature components | `components/storefront/`, `components/commerce/`, and `components/privacy/` | Keep feature-oriented boundaries. Do not restore the deleted generic `components/ui/` scaffold without a proven consumer. |
| Shopify integration | `lib/shopify/`, behind `lib/commerce/` and `lib/providers/shopify/` | Keep. Shopify commerce truth must not be imported from styling or presentation code. |
| Media approval and viewer input | `lib/media/`, Media Registry bindings, Product Release Records, and the release-aware view model | Keep. `podpipe` describes the reusable process and customer sequence; it is not a new package or permission to publish candidate media. |
| Product/POD release authority | `releases/`, `lib/releases/`, and versioned Product Release Records | Keep separate from Git tags, UI state, Shopify observations, and media tooling. |
| Production-system governance | `config/production-authorities.json` and `docs/production-closure-brief.md` | Keep as the operating registry for the 12 production authority areas. |
| CI and repository commands | `package.json`, `yarn.lock`, and `.github/workflows/quality.yml` | Keep Yarn Classic 1.22.22. Do not add pnpm/npm lockfiles or workspace configuration. |

## Adopted controls

1. Raw storefront colours, type, spacing, geometry, radii, shadows, motion, breakpoints, and stacking values remain prohibited outside the canonical CSS tokens and the one documented runtime mirror.
2. Feature code may consume the design-system contract but may not create styling truth, commerce truth, media approval, or release authority.
3. Shopify theme app blocks and theme embeds are not valid integration mechanisms for the custom Next.js storefront. Any app needs an explicit headless API, webhook, server adapter, or deliberately approved client integration.
4. Only release-eligible Media Registry assets may feed customer media. A target 12-view slot is presentation structure, not evidence that twelve truthful assets exist.
5. Strict TypeScript is not currently enforced: active source is JavaScript/JSX, no strict `tsconfig.json` or `checkJs` contract exists, and CI has no independent typecheck. If approved, type safety should begin at new Shopify/POD adapters, schemas, and release boundaries, then add an explicit CI typecheck; it must not be claimed from the TypeScript dependency or Next.js build alone.
6. ESLint, deterministic policy tests, dependency audit, build, accessibility/privacy-network automation, and visual QA are the current shared validation surfaces. Prettier, Stylelint, EditorConfig, Husky, lint-staged, and Commitlint are not currently configured and must not be reported as gates.
7. Commit hooks are developer convenience, not release authority. CI on the exact commit is the enforceable shared gate. Commitlint/Husky may be proposed later only if their maintenance cost and failure behavior are justified.
8. A blanket ban on all numeric literals is rejected. Domain constants need named authorities and tests; ordinary indices, counts, protocol values, and algorithmic literals are assessed by context.

## `podpipe` interpretation

The saved `podpipe` note is the approved reusable POD-to-publish operating pattern and experience sequence. It does not certify live product facts or require every product to expose exactly twelve assets. For the Signature Hoodie, physical sample approval, exact provider mapping, truthful modality evidence, Shopify observation, release binding, desktop/mobile QA, and rollback remain independent gates.

The viewer may truthfully show fewer approved assets. Missing video, genuine 360, 3D, AR, back, material, or lifestyle evidence must stay absent or explicitly identified as a private candidate; it cannot be manufactured by filling a slot.

## Monorepo trigger and migration gate

A future migration requires all of the following:

- a second deployable or an independently consumed/versioned package;
- named ownership and public APIs for each proposed package;
- a dependency graph proving no circular or cross-authority imports;
- a Vercel root/build/output and environment migration plan;
- Yarn Classic-compatible workspace and frozen-lockfile proof, unless a separately approved package-manager migration exists;
- CI, caching, rollback, and secret-boundary evidence;
- desktop/mobile parity and accessibility evidence showing no customer-visible regression.

Until that gate is met, the current root structure is authoritative.

## Validation and visual applicability

This decision changes documentation only. It creates no route, component, style, media, commerce, build, or runtime change, so a new screenshot comparison is not applicable. The integrated candidate's existing desktop/mobile and accessibility evidence remains under `test_reports/production-authority-pr9-integration-2026-08-14/`. Any future structural migration must repeat the full route and viewport comparison against the approved baseline.

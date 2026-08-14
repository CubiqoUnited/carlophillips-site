# Final Architecture Compliance — 2026-08-14

This is the implementation checklist for the CARLOPHILLIPS Headless + PODPIPE
directive. It is an architecture and QA record, not a Product Release approval.

| Directive                  | Implemented evidence                                                                                                                                                | Release implication                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Canonical monorepo runtime | `apps/web/src` owns the Next.js app; root commands delegate to `@repo/web`; the former root runtime trees are removed                                               | None                                                                     |
| Visual control room        | `packages/design-system` owns typed tokens, the dark theme, Button/Text/Media/Layout primitives, global semantic CSS, and Storybook                                 | Token review evidence is still required for each major release candidate |
| Shared configuration       | `packages/config` exports strict TypeScript, ESLint visual/import restrictions, Prettier, Stylelint, and token-backed Tailwind configuration                        | CI/pre-commit policy only; no commerce authority                         |
| Shopify transport          | `packages/shopify` owns the pinned query-only Storefront client, queries, generated-style transport types, normalization, and observation-only webhook verification | Cannot approve media, release, cart, checkout, or publication            |
| Controlled media           | `apps/web/src/lib/media` accepts only approved Media Registry assets and preserves registry identity, authority, modality, pose/detail, and motion roles            | Unapproved assets are withheld                                           |
| Approved public root       | `apps/web/public/media` is compared exactly with approved registry paths and hashes; candidate files outside the app public root are not served                     | Storage is not approval; registry evidence remains authoritative         |
| Twelve-view viewer         | `components/product/MediaViewer` caps the customer projection at twelve approved views and supports swipe, keyboard arrows, Escape, focus, and disabled boundaries  | Viewer cannot expand eligibility                                         |
| Eleven-section display     | `components/product/Sequence` renders the exact ordered PODPIPE projection from campaign opening through fulfilment facts                                           | Missing required truth renders withheld and blocks approval              |
| Real 360                   | The media/release contracts require a physical multi-angle source, at least 24 frames, and rotation-test evidence                                                   | Missing for the current Hoodie                                           |
| Verified 3D/AR             | GLB and load-test evidence are mandatory; USDZ and AR-test evidence are additionally mandatory when AR is claimed                                                   | No 3D is rendered for the current Hoodie                                 |
| Seventeen-step delivery    | `podpipe-delivery.ts`, its JSON schema, and the release evidence record implement sequential steps and exact external/spend/write/publish/production approvals      | Current Hoodie authorizes zero external steps                            |
| Release states             | Canonical transition policy and PODPIPE workflow jointly gate Draft → Staged → Approved → Released                                                                  | Current Hoodie remains Draft                                             |
| P0 containment             | The standalone production-launch configuration/policy is removed; production visibility and checkout resolve only canonical release evidence                        | Draft is denied before Shopify cart work                                 |
| Continuous verification    | Lint, strict typecheck, Stylelint, formatting, unit/contract tests, Storybook build, production build, audit, and background responsive screenshots are mandatory   | Passing architecture QA is not Product Owner release approval            |

## Current Signature Hoodie blockers

- physical sample fit, colour, artwork placement, and finish are pending;
- reviewed Shopify observation and variant/commerce fingerprints are missing;
- the Media Registry has zero approved storefront bindings;
- real 360 and verified 3D/AR evidence are missing;
- approved production, delivery, care, returns, and fulfilment facts are missing;
- immutable candidate, Preview, responsive, performance, token-regression, and rollback evidence are incomplete;
- Product Owner release approval, production deployment approval, and live
  Shopify/POD/checkout verification are absent.

Therefore this implementation must not be described as product-ready,
release-ready, checkout-ready, or production-ready.

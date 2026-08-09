# CP `ONE` upper hierarchy and attribute correction

Date: 2026-08-09
Branch: `codex/cp-runway-wording-design-system`
Scope: second homepage product scene only

## Outcome

The `Signature Series / 001` and `ONE` group is now anchored in the upper-left visual zone on compact and desktop layouts. The phone layout keeps a larger top offset so it cannot collide with the upper-right media control.

The visual facts now answer the Product Owner's requested questions and omit size:

- `Color / Black`
- `Material / Structured fleece`
- `Feel / Heavyweight, soft interior`

These values are supported by the existing reviewed product description. No fiber percentage or provider-specific material claim was added. The Signature Hoodie product title, handle, PDP, variants, release policy, media set, and commerce behavior are unchanged.

## Product Owner annotations closed

1. `ONE` group: moved to the top visual zone. At 584×486 and 1440×1000 its upper edge is 40px higher than the preceding Preview composition.
2. Attribute chips: size is removed. The set is exactly Color, Material, and Feel, with explicit label/value semantics.

## Visual comparison

- Before, compact: `../cp-home-one-overlay-2026-08-09/screenshots/preview-compact-product.png`
- After, compact: `screenshots/local-compact-product.png`
- After, mobile: `screenshots/local-mobile-product.png`
- After, desktop: `screenshots/local-desktop-product.png`

The compact and desktop captures place the information group above its former position and keep the model unobscured. The phone capture retains clear vertical separation from the media control. The three attribute rows fit without horizontal overflow.

## Automated verification

Focused tests passed: 2 files / 11 tests.

Full `yarn verify` passed:

- ESLint with zero warnings;
- 35 test files / 333 tests;
- zero production dependency vulnerabilities across 193 packages;
- successful Next.js 15.5.21 optimized build with all 12 routes.

The first sandboxed audit attempt could not resolve `registry.yarnpkg.com`. The unchanged full command was rerun with permitted network access and passed. This was an execution-environment restriction, not a project failure.

## Local browser verification

Headless background Chrome checked:

- exact compact review: 584×486;
- mobile: 390×844;
- desktop: 1440×1000.

All three checks returned meaningful content with zero console errors, page errors, or framework overlays. Each showed the three requested attributes and zero exact `XS–5XL` attribute labels. At 584×486 the copy group begins at y=128 and the media control begins at y=144 in the separate right column. At 390×844 the copy begins at y=272, safely below the media control ending near y=204. At 1440×1000 the copy begins at y=160.

Structured local results are in `verification.json`.

## Vercel Preview

Pending from the tested temporary-branch commit. No Production deployment, alias, or domain action is included.

## Known limits and boundary

This is a presentation refinement only. The local fixture's media count may differ from Preview because the eligible media inputs differ by environment; the control remains runtime-derived. No Shopify/provider state, catalog data, order, billing, `main`, or Production state changed.

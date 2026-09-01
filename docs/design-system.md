# CARLOPHILLIPS Storefront Design System

Status: v1.3 candidate. The token authority, tier direction and governance are unchanged from v1.2.2;
the customer composition is superseded by the *Screen Inventory Review Workbook*.

Visible baseline: the workbook's 28 screens plus its exception appendix. The binding composition is
the Lofoten `At the edge of life` opener behind a black morph panel that translates left on `ENTER`,
persistent Menu / wordmark / Bag header, a three-column discovery stage with a 4:5 product video,
`VIEW GALLERY` / `ORDER` stack, the overlay gallery, category and product grids, and the cart →
checkout → confirmation → tracking path. The gap register and its scope exclusions are in
`docs/screen-inventory-gap-analysis.md`.

## Authority and dependency

`theme.json` is the sole Product Owner-editable source for accent colour, corner radius, base spacing, and base text weight. Its validated server-rendered CSS bridge supplies those primitives (and the spacing scale derived from base spacing) before `app/design-tokens.css` maps them into the established semantic and component tiers. `app/design-tokens.css` remains the authority for every other active CARLOPHILLIPS presentation decision. The dependency is strict and one-way:

```text
 theme.json controlled values
   -> --cp-primitive-* controlled roots/derived spacing
 --cp-primitive-* static values
  -> --cp-semantic-*
    -> --cp-component-*
      -> app/globals.css cp-* rules
        -> active app/components surfaces
```

The naming grammar is `--cp-[tier]-[category]-[concept]-[variant]-[state]`. Every token is lowercase kebab-case under `--cp-*`. Primitive declarations contain raw values and no token references. Semantic declarations reference primitives only. Component declarations reference semantics only. Active CSS may consume semantic or component roles, never primitives.

Active JSX uses `cp-*` classes only. Inline styles, arbitrary utility values, literal `sizes`/responsive-media contracts, icon stroke props, raw visual colours, and raw CSS dimensions or motion values are prohibited by deterministic tests. The only dynamic style object is the contained Theme-screen proposal preview; it receives validated proposed values and cannot change page structure.

Tailwind and its configuration were deliberately removed as dormant v1.2.2 tooling. The current storefront has no active Tailwind surface. Any future Tailwind adapter must read the same root `theme.json`; it may not introduce a second theme value source.

## Domain coverage

| Domain | Authority |
| --- | --- |
| Colour/depth | Neutral and reset colours; canvas, copy, rules, scrims, overlays, opacity, blur, shadow, and stacking roles. |
| Typography | Families, weights, sizes, line heights, tracking, wrapping, clamping, labels, display, editorial, and product roles. |
| Space/size | Spacing scale, negative offsets, gutters, controls, touch targets, panels, copy measures, viewport, and Open Graph geometry. |
| Shape/border | Sharp card/control/dialog roles, round affordances, hairlines, focus, and disabled states. |
| Layout | Display, position, grid, alignment, scrolling, overflow, object fit/position, reset, and responsive component projections. |
| Motion | Durations, delays, easing, transforms, keyframes, and reduced-motion suppression. |
| Media | Aspect ratios, panel geometry, focal positions, truthful disclosures, gallery navigation, and browser `sizes` mirrors. |
| Runtime | Breakpoint, metadata, responsive image, viewport, and Satori serialization mirrors bound back to CSS by tests. |

Every token is reachable from an active CSS rule, canonical keyframe, breakpoint/image serializer, or Open Graph serializer. Unreachable declarations fail the test suite.

## Responsive and runtime contract

CSS custom properties cannot drive media-query conditions. The canonical responsive values are declared as primitives and repeated only as the four literal conditions in `app/design-tokens.css`:

- small: `40rem` / 640px;
- tablet: `48rem` / 768px;
- desktop: `64rem` / 1024px;
- wide: `80rem` / 1280px.

`lib/design-system/runtime-contract.js` is the only permitted raw runtime mirror. It supplies browser `sizes`, `<source media>`, theme metadata, viewport metadata, and `ImageResponse` style objects that cannot resolve CSS custom properties. Tests convert the CSS breakpoint values to pixels, verify the max-width boundary, and bind runtime colours, image widths, and Open Graph geometry back to canonical primitives. No second design authority is created.

## Production composition contract

The workbook implementation preserves these exact customer-facing decisions:

1. `CARLO PHILLIPS`, `Lofoten · Norway`, `At the edge of life.`, and `Runway 001 / Lofoten` carried on
   a black panel over the exact approved runway asset. `ENTER` translates the panel left; the hero
   beneath never fades, flashes, or goes fullscreen.
2. Persistent CARLOPHILLIPS header with Menu, wordmark, Bag, and `Join the list` before entry.
3. Discovery as three columns: `Signature Series / 001` and `ONE` with its reviewed first description
   sentence and the three disclosure chips `Color`, `Material`, `Feel`; a centred 4:5 video stage; and
   the `VIEW GALLERY` / `ORDER` stack that the order panel replaces in place.
4. A product stage with play/pause, progress and three clip dashes, muted autoplay for two complete
   runs, a hold on the final frame behind a centred Play, and **no fullscreen affordance anywhere**.
5. A centred inset gallery over a dimmed/blurred backdrop, with `01 / NN`, position dashes, the
   same-model / merchandise / detail / 2.5D category rail, and a thumbnail rail.
6. Provider-neutral customer copy and truthful `Product view`, `AI-assisted preview`, `AI-assisted
   still-derived motion`, and `Unverified back visualisation` disclosures.
7. The appendix exception states as one shared widget, with the workbook's exact copy.

The superseded v1.2.2 full-bleed runway composition — bottom-left `ONE`, the corner `Explore media`
control with its expand affordance, the four `Black` / `XS–5XL` / `Heavyweight fleece` /
`CP embroidery` tags, and the side-drawer order tray — is no longer the production contract.

## Media readiness

No customer surface chooses its own motion asset. `lib/media/media-readiness.js` declares the landing
hero (16:9 desktop, 9:16 mobile) and the three approved product clips, and returns `ready` /
`poster-only` / `not-ready` per slot with a machine-readable reason. `ready` requires **both** an
evidenced source and a verified first-frame poster, because the workbook needs the poster for instant
render and for the reduced-motion fallback. Unknown is never ready.

`yarn verify:media-readiness` writes the report to `test_reports/media-readiness/`; the home route
passes the same decision into the view; and a runtime media error raises the appendix
`Video unavailable` widget rather than leaving a broken player on the page.

## Measured Production parity roles

The corrected v1.2.2 candidate keeps typography and geometry roles independent so a gallery or shared-control change cannot move an unrelated surface:

- homepage product facts use their own 8px role while gallery and information labels remain 10px;
- compact/mobile commerce body copy resolves to 26px line-height and resolves to 28px at 40rem and above;
- general actions use 10px/15px type, 0.24em tracking, and 24px inline padding, while catalog actions retain their dedicated 56px height and 20px padding;
- catalog edition labels remain 9px/13.5px and catalog titles retain -0.035em tracking;
- PDP price, description, checkout label/disclosure, and form controls have dedicated roles that preserve Production line-heights and document coordinates;
- Information and Editorial titles, supporting copy, section padding, and editorial measure use component-specific responsive roles rather than shared heading/body aliases.

The Production-parity harness compares the exact PR #9 Preview DOM plus the local candidate CSS against live Production without deploying or submitting commerce forms. All 222 role/property checks pass at 1440×1000, 584×486, and 390×844. Screenshot pixel variance caused by Production lazy-media/animation timing is non-authoritative once decoded media, DOM geometry, route health, and representative visual review pass.

## Interaction and accessibility

- Menu and media dialogs lock background scroll, isolate background interaction, close with Escape, and return focus to their opener.
- The media panel supports previous/next controls, keyboard arrows, native horizontal swipe, scroll snap, and a direct motion-study jump.
- Controls retain visible focus and minimum touch geometry.
- Reduced motion disables campaign drift, runway sequencing, scroll prompting, and image transition motion.
- Product/media eligibility remains fail-closed. Local/Preview studies never become production truth through presentation code.

## Governance

- A raw visual value added outside `theme.json` or `app/design-tokens.css` is a release blocker unless it is an unavoidable serializer literal added to `runtime-contract.js`, documented here, and mechanically bound back to CSS.
- Token changes require naming, direction, closure, reachability, representative propagation, full tests/build, and screenshot comparison.
- Customer composition changes require Product Owner approval and a new visual baseline; a token refactor alone must preserve the current approved pixels and behavior.
- Removed scaffold is recoverable through Git and recorded in `docs/cleanup-manifest-v1.2.2.md`.
- This design system is CARLOPHILLIPS-specific. It is not a cross-project package, Figma publication, or commerce authority.

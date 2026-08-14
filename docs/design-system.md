# CARLOPHILLIPS Storefront Design System

Status: v1.2.2 candidate. This release corrects and expands v1.2.1; it is not a redesign.

Visible baseline: approved production artifact `bb9568f`. The binding composition is the Lofoten `At the edge of life` opener, persistent header/navigation, bottom-left `ONE` hierarchy, the four tags `Black`, `XS–5XL`, `Heavyweight fleece`, and `CP embroidery`, `Explore media / 12 views`, and the inset truthful media viewer.

## Authority and dependency

`app/design-tokens.css` is the sole canonical raw-value source for active CARLOPHILLIPS presentation decisions. The dependency is strict and one-way:

```text
--cp-primitive-*
  -> --cp-semantic-*
    -> --cp-component-*
      -> app/globals.css cp-* rules
        -> active app/components surfaces
```

The naming grammar is `--cp-[tier]-[category]-[concept]-[variant]-[state]`. Every token is lowercase kebab-case under `--cp-*`. Primitive declarations contain raw values and no token references. Semantic declarations reference primitives only. Component declarations reference semantics only. Active CSS may consume semantic or component roles, never primitives.

Active JSX uses `cp-*` classes only. Inline styles, arbitrary utility values, literal `sizes`/responsive-media contracts, icon stroke props, raw visual colours, and raw CSS dimensions or motion values are prohibited by deterministic tests.

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

The v1.2.2 implementation preserves these exact customer-facing decisions from `bb9568f`:

1. `CARLOPHILLIPS / At the edge of life`, `At the edge of life.`, and `Runway 001 / Lofoten` over the exact approved runway asset.
2. Persistent CARLOPHILLIPS header with Menu and Bag navigation.
3. `ONE` in the lower-left product scene, with its reviewed first description sentence and the four approved tags.
4. A compact upper-right `Explore media` control with a truthful 12-view count for the current four eligible fixture views plus eight disclosed Preview studies.
5. A centered inset media panel over a dimmed/blurred backdrop, with page context still visible around it.
6. Provider-neutral customer copy and truthful `Product view`, `AI-assisted preview`, `AI-assisted still-derived motion`, and `Unverified back visualisation` disclosures.

The superseded v1.2.1 three-label experiment (`Color`, `Material`, `Feel`), its 11-view evidence, and its upper product-copy placement are not the production contract.

## Interaction and accessibility

- Menu and media dialogs lock background scroll, isolate background interaction, close with Escape, and return focus to their opener.
- The media panel supports previous/next controls, keyboard arrows, native horizontal swipe, scroll snap, and a direct motion-study jump.
- Controls retain visible focus and minimum touch geometry.
- Reduced motion disables campaign drift, runway sequencing, scroll prompting, and image transition motion.
- Product/media eligibility remains fail-closed. Local/Preview studies never become production truth through presentation code.

## Governance

- A raw visual value added outside `app/design-tokens.css` is a release blocker unless it is an unavoidable serializer literal added to `runtime-contract.js`, documented here, and mechanically bound back to CSS.
- Token changes require naming, direction, closure, reachability, representative propagation, full tests/build, and screenshot comparison.
- Customer composition changes require Product Owner approval and a new visual baseline; a token refactor alone must preserve the current approved pixels and behavior.
- Removed scaffold is recoverable through Git and recorded in `docs/cleanup-manifest-v1.2.2.md`.
- This design system is CARLOPHILLIPS-specific. It is not a cross-project package, Figma publication, or commerce authority.

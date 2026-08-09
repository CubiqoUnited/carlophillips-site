# CARLOPHILLIPS Storefront Design System

Status: active v1.2.1 storefront presentation contract, reconciled against `Recovered-Design-System-Guidance.docx` on 2026-08-09.

The storefront uses a restrained, media-led system: black canvas, white type, quiet rules, generous full-viewport panels, sparse copy, and one clear action per scene. The visual direction is inspired by premium technical-fashion and runway retail references while remaining an original CARLOPHILLIPS implementation.

## Product discovery and scope

CARLOPHILLIPS is an independent editorial, media-led commerce product. Its visual job is to establish a premium clothing world, present truthful product media at cinematic scale, and make purchasing actions predictable without importing dashboard, social-feed, subscription-community, or unrelated Codex-project conventions.

- Primary users: fashion customers reviewing a small premium release on touch and pointer devices.
- Reference traits: oversized media, controlled whitespace, sparse typography, restrained controls, product storytelling, and clear product/purchasing actions.
- Technical boundary: Next.js 15 App Router, React 19, Tailwind CSS 3, server-owned commerce decisions, and client interaction only where the media viewer or menu requires it.
- Responsive boundary: mobile, tablet, and desktop browsers; keyboard, pointer, swipe, reduced-motion, reflow, and zoom behavior are required.
- Project separation: CP owns its tokens, components, documentation, tests, and versioning. It does not import a universal cross-project design package.

## Token architecture

The sole raw-value source is `app/design-tokens.css` under the `--cp-*` namespace. `app/globals.css` imports it and contains semantic component rules, not a second raw-value source. The naming grammar is `--cp-[category]-[concept]-[variant]-[state]`.

```text
app/design-tokens.css
  Tier 1 primitives
    -> Tier 2 semantic intent
      -> Tier 3 component aliases
        -> app/globals.css cp-* classes
          -> active storefront components and routes
```

- primitives: neutral palette, font, type, spacing, shape, border, and motion scales;
- semantic roles: canvas, panels, copy, rules, overlays, typography, layout, media, motion, focus, touch targets, opacity, and stacking layers;
- component aliases: actions, cards, dialogs, scroll controls, product titles, media controls, headers, and menus.

Rendered customer components consume semantic `cp-*` classes. Ordinary Tailwind utilities may express non-visual structure; CSS-variable-backed arbitrary utilities may consume a named token; content-specific object positions may describe an image crop. Raw customer-facing colour utilities, CSS colour literals, inline JSX styles, un-tokenized arbitrary Tailwind values, primitive-token consumption by component CSS, and one-off tracking values are prohibited by deterministic tests.

`StorefrontHeader` is the shared collection, bag, and product chrome. Reusable classes provide shells, sections, labels, headings, copy tiers, rules, cards, actions, commerce states, variant controls, and the private concept surface. The noindex `/concept-preview` route uses the explicit editorial-font role, while its campaign media remains Draft-only and outside product/release truth.

## Domain coverage

| Domain | CP decision |
| --- | --- |
| Colour | Neutral primitives feed semantic canvas, surface, copy, rule, overlay, focus, selection, and disabled roles. CP is intentionally dark-only; light/high-contrast themes are not currently supported. |
| Typography | Sans, editorial, and mono families; weights, responsive scales, line heights, tracking, text roles, wrapping, and clamping are tokenized. |
| Spacing/layout | Primitive spacing scale plus semantic gutters, section rhythm, content/copy widths, viewport/header geometry, and responsive layout classes. |
| Sizing | Controls, touch targets, media panels, copy, and viewport dimensions are defined. |
| Shape | `none`, `small`, `medium`, `large`, and `full` primitives feed control/card/dialog/round aliases. The storefront remains sharp; circular affordances use the round alias. |
| Depth | Rules, scrims, overlays, backdrop, blur, copy/dialog shadows, opacity, and named stacking layers are defined. |
| Motion | Standard/image/campaign/runway durations, easing, frame delays, scroll prompting, and reduced-motion behavior are defined. |
| Media | Product aspect ratios, panel geometry, focal-position conventions, captions, controls, placeholders, truthful disclosures, and contrast scrims are defined. |
| Iconography | Lucide icons inherit `currentColor`, retain accessible control names, and use restrained shared sizing/stroke conventions. |
| Data visualization | Not applicable to the active fashion storefront. Dormant generic chart scaffolding is not a customer surface. |

## Required component states

- Actions: default, hover, focus-visible, active browser behavior, and disabled.
- Media viewer: closed/open, first/middle/last position, previous/next disabled, swipe, keyboard arrows, Escape, and focus return.
- Catalog/product/bag: available, unavailable, empty, local review, private Preview, Released, checkout-disabled, and source-error.
- Media: approved, partial private review, absent, external video, static 3D fallback, and reduced motion.
- Responsive: mobile/tablet/desktop layout, long-copy wrapping, overflow prevention, touch targets, and zoom/reflow.

## Governance and documented exceptions

- `app/design-tokens.css` is the only raw CP visual-value source. Generated cross-project packages, Figma synchronization, and npm publication are intentionally not introduced.
- CSS media-query breakpoints remain literal technical boundaries because custom properties cannot drive `@media` conditions. They are documented and tested as responsive contracts.
- `app/layout.js` viewport theme colour and `app/opengraph-image.js` Satori styles require serialized values outside browser CSS. They are documented framework-output exceptions and must visually match the canonical neutral palette.
- The generic `components/ui` scaffold retains framework compatibility tokens but is not an active CP storefront surface. A dormant component must be migrated to CP semantic/component roles before customer use.
- Token renames, removals, or semantic changes require a migration note, deterministic tests, and screenshot comparison. Unrelated projects never inherit CP values automatically.

## Product media viewer

The Signature Hoodie action on the homepage opens a full-screen viewer instead of navigating away. The viewer uses the same canvas, ink, rule, label, motion, gutter, header-height, overlay, and control-size tokens as the rest of the storefront.

- Touch users move through media with native horizontal swipe and scroll snap.
- Pointer and keyboard users receive previous/next controls; Escape and the close control dismiss the viewer.
- Opening the viewer locks page scrolling and makes the page behind it inert. Closing returns focus to the opening action.
- Media position is always shown. Captions remain short, provider-neutral, and truthful about Preview-only visual studies.
- When a disclosed motion asset exists, a compact `Motion study` control jumps directly to it. A still-derived loop is never labeled as real product video, 360, or 3D.
- The viewer never expands product eligibility. Production receives release-eligible media only; Local/Preview studies remain environment-gated and disclosed.

## Homepage sequence

1. `CARLOPHILLIPS / At the edge of life` runway campaign opener.
2. A centered bordered label and animated circular down control link directly to the first product scene.
3. The Signature Hoodie runway panel presents a muted title, reviewed product description, and one compact upper-right media action.
4. The category rail identifies Hoodies as active and visually mutes future categories.
5. The footer follows the category rail. The separate lower product/release stage is intentionally omitted because it duplicated the Hoodie scene.

## Product-scene hierarchy

- Product titles use `cp-product-title`, capped by the shared title scale and resolved through the `copy-soft` role, so imagery remains the dominant element.
- Product descriptions use `cp-product-review` and must come from the minimized reviewed catalog summary. They cannot be invented in the client component.
- Product-scene attributes use the shared fact pattern and contain only reviewed descriptive facts: `Color / Black`, `Material / Structured fleece`, and `Feel / Heavyweight, soft interior`. Size stays in the commerce/variant experience instead of posing as a material attribute.
- The primary scene action uses `cp-product-media-button-corner`: a compact dark-glass upper-right control with its media count. It remains visually distinct from copy and does not resemble an underlined text link.

## Customer language

The commerce provider is an implementation detail and is not named in customer-facing headings, body copy, calls to action, status labels, or page metadata. Customer copy uses `secure checkout`, `store`, and `product facts`. Internal code, tests, evidence, and server integrations retain precise provider names where operational truth requires them.

## Motion and accessibility

- The runway sequence, campaign-camera drift, and scroll prompt respect `prefers-reduced-motion`.
- A flattened campaign still may receive slow camera push/pan only. Actual model movement requires a real video asset and must not be implied by the still-image animation.
- All actions retain visible keyboard focus.
- The scroll cue is a real anchor with a descriptive accessible label.
- Text contrast is intentionally tiered but never relies on color alone for action meaning.

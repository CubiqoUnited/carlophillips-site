# CARLOPHILLIPS Storefront Design System

Status: active v1.2 storefront presentation contract.

The storefront uses a restrained, media-led system: black canvas, white type, quiet rules, generous full-viewport panels, sparse copy, and one clear action per scene. The visual direction is inspired by premium technical-fashion and runway retail references while remaining an original CARLOPHILLIPS implementation.

## Token architecture

The canonical presentation tokens live in `app/globals.css` under the `--cp-*` namespace. v1.2 separates implementation values from customer-facing decisions:

- primitives: black, charcoal, grey, paper, and white values;
- semantic colour roles: canvas, panels, ink, copy tiers, rules, overlays, and glass;
- typography roles: sans, editorial, and mono families; display, title, body, label, tracking, weight, and leading;
- spacing and layout roles: a shared scale, shell widths, responsive gutter, section rhythm, header and viewport dimensions;
- effects and interaction roles: scrims, shadows, blur, control size, motion duration, and easing.

Rendered customer components consume semantic `cp-*` classes. They may retain utility classes only for structure, responsive grid behavior, media aspect ratios, and content-specific image positioning. Raw customer-facing colour utilities, CSS colour literals, and one-off letter-spacing values are prohibited by deterministic tests.

`StorefrontHeader` is the shared collection, bag, and product chrome. Reusable classes provide shells, sections, labels, headings, copy tiers, rules, cards, actions, commerce states, variant controls, and the private concept surface. This keeps changes such as a copy-contrast adjustment or rule-strength adjustment centralized in one token instead of repeated across routes.

The noindex `/concept-preview` route is included in the same system but uses the explicit editorial-font role. Its campaign media remains Draft-only and does not become product, release, or Production truth.

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

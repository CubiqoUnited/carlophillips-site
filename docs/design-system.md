# CARLOPHILLIPS Storefront Design System

Status: active storefront presentation contract.

The storefront uses a restrained, media-led system: black canvas, white type, quiet rules, generous full-viewport panels, sparse copy, and one clear action per scene. The visual direction is inspired by premium technical-fashion and runway retail references while remaining an original CARLOPHILLIPS implementation.

## Token source

The canonical presentation tokens live in `app/globals.css` under the `--cp-*` namespace. They cover:

- canvas, panel, paper, ink, copy, muted text, and rule colors;
- the approved sans-serif stack;
- maximum content width and responsive page gutter;
- navigation and viewport-panel dimensions;
- label and display typography;
- standard motion duration and easing.

Components should consume a semantic `cp-*` class or a `--cp-*` token before adding a literal value. Literal values remain acceptable for content-specific art direction, media aspect ratios, responsive breakpoints, and isolated layout geometry that is not a reusable design decision.

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

- Product titles use `cp-product-title`, capped at 6.25rem and muted to 62% white, so imagery remains the dominant element.
- Product descriptions use `cp-product-review` and must come from the minimized reviewed catalog summary. They cannot be invented in the client component.
- Product-scene highlight chips are intentionally omitted; the reviewed description carries the material and feel narrative without duplicative tags.
- The primary scene action uses `cp-product-media-button-corner`: a compact dark-glass upper-right control with its media count. It remains visually distinct from copy and does not resemble an underlined text link.

## Customer language

The commerce provider is an implementation detail and is not named in customer-facing headings, body copy, calls to action, status labels, or page metadata. Customer copy uses `secure checkout`, `store`, and `product facts`. Internal code, tests, evidence, and server integrations retain precise provider names where operational truth requires them.

## Motion and accessibility

- The runway sequence, campaign-camera drift, and scroll prompt respect `prefers-reduced-motion`.
- A flattened campaign still may receive slow camera push/pan only. Actual model movement requires a real video asset and must not be implied by the still-image animation.
- All actions retain visible keyboard focus.
- The scroll cue is a real anchor with a descriptive accessible label.
- Text contrast is intentionally tiered but never relies on color alone for action meaning.

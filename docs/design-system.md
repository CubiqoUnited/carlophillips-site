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
- The viewer never expands product eligibility. Production receives release-eligible media only; Local/Preview studies remain environment-gated and disclosed.

## Homepage sequence

1. `CARLOPHILLIPS / At the edge of life` runway campaign opener.
2. A labeled scroll cue links directly to the first product scene.
3. The Signature Hoodie runway panel remains the first product release.
4. The category rail identifies Hoodies as active and visually mutes future categories.
5. The release section follows the same source and commerce eligibility policy as the product page.

## Customer language

The commerce provider is an implementation detail and is not named in customer-facing headings, body copy, calls to action, status labels, or page metadata. Customer copy uses `secure checkout`, `store`, and `product facts`. Internal code, tests, evidence, and server integrations retain precise provider names where operational truth requires them.

## Motion and accessibility

- The runway sequence and scroll prompt respect `prefers-reduced-motion`.
- All actions retain visible keyboard focus.
- The scroll cue is a real anchor with a descriptive accessible label.
- Text contrast is intentionally tiered but never relies on color alone for action meaning.

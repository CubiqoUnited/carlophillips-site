# CARLOPHILLIPS Runway Wording and Design-System Evidence

Date: 2026-08-08

Branch: `codex/cp-runway-wording-design-system`

Base: `origin/main` at `d874e20`

## Outcome

The homepage is now an intentional two-screen opening sequence:

1. The supplied CARLOPHILLIPS coastal runway campaign fills the landing viewport.
2. `Discover the Signature Hoodie / Scroll down` links to the preserved Signature Hoodie full-screen hero.
3. The category rail follows with Hoodies active and four future categories disabled.

The campaign uses the factual labels `CARLOPHILLIPS / At the edge of life` and `Runway 001 / Lofoten`. It does not claim that a real public tour or runway event occurred.

## Design-system correction

- `app/globals.css` defines semantic `--cp-*` tokens for the active storefront foundation.
- `cp-*` classes consume shared colour, type, gutter, content-width, header, panel, display, label, motion, and interaction decisions.
- `docs/design-system.md` records the usage rule and deliberate exceptions for responsive art direction and unique media geometry.
- The scroll prompt respects reduced-motion preferences and provides a descriptive accessible label.

## Customer language

The underlying commerce platform remains the internal product/cart/checkout implementation, but its brand name no longer appears in customer-facing headings, body copy, status labels, calls to action, or route metadata. The active action reads `Continue to checkout`; the product facts panel reads `Secure encrypted checkout`.

## Automated verification

`yarn verify` completed successfully using Yarn Classic 1.22.22:

- ESLint: zero warnings.
- Vitest: 34 files, 325 tests passed.
- Production dependency audit: zero vulnerabilities across 193 packages.
- Next.js 15.5.21 optimized build: 12 routes generated successfully.

Focused tests additionally prove:

- campaign → Hoodie → category ordering;
- the opening anchor targets `#signature-runway`;
- the Hoodie action remains `View the Signature Hoodie` in every eligible state;
- the active rendered home, catalog, bag, review, unavailable, and checkout states contain no customer-facing commerce-provider name;
- the semantic design-token contract is present and consumed.

## Browser evidence

Local and deployed Preview checks used headless Chrome and did not touch the Product Owner's visible browser. Viewports: 1440×1000 and 390×844.

Both widths proved:

- HTTP 200 on the homepage and Signature Hoodie PDP;
- campaign at viewport one and Hoodie at viewport two;
- working scroll-anchor transition;
- one active Hoodies category and four disabled future categories;
- zero framework error overlays and console/page errors;
- zero broken images;
- zero horizontal overflow;
- zero visible commerce-provider-name matches.

Evidence files:

- `home-desktop-landing.png`
- `home-mobile-landing.png`
- `home-desktop-hoodie-panel.png`
- `home-mobile-hoodie-panel.png`
- `preview-desktop-landing.png`
- `preview-mobile-landing.png`
- `preview-desktop-hoodie-panel.png`
- `preview-mobile-hoodie-panel.png`
- `preview-desktop-categories.png`
- `preview-mobile-categories.png`
- `preview-desktop-pdp.png`
- `preview-mobile-pdp.png`

## Vercel state

- Preview: `dpl_5zYviNwnc8WRFjwbECmnW1pPk8DA`
- Status: READY
- URL: `https://carlophillips-site-l04jfxxzx-adityas-projects-261b17a9.vercel.app`
- Target: Preview only
- Production remains unchanged: `dpl_BdasbDdxHCMruKdy7WSsrUibvcgK` serves `www.carlophillips.com`.

## Deferred material

Recovered local reference exports at `chat-images/`, `tmp/`, and `tmp_make_chat_pdf.py` are preserved and ignored. They are not application source and are not part of this correction diff.

## Product Owner demo release note

What changed: runway campaign first, Signature Hoodie second, direct scroll cue, category rail after the Hoodie, provider-neutral customer language, and a documented token-led storefront foundation.

Checks passed: lint, 325 tests, dependency audit, optimized build, direct desktop/mobile home/PDP requests, image decoding, scroll, category state, console/overlay, wording, and overflow checks.

Known limitations: future categories remain intentionally disabled; richer exact-product video, genuine 360, and verified interactive 3D remain separate media work; Production still serves the restored p92-derived version until explicit approval of this Preview.

Preview/staging URL: `https://carlophillips-site-l04jfxxzx-adityas-projects-261b17a9.vercel.app`

Exact remaining action: Product Owner reviews this Preview, then explicitly authorizes merge to canonical `main` and Production promotion of the reviewed artifact. No direct production deploy should bypass `main`.

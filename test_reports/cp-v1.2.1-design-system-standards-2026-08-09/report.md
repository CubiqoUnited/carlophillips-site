# CP v1.2.1 design-system standards evidence

Date: 2026-08-09

Branch: `codex/cp-runway-wording-design-system`

Baseline: local tag `v1.2` / commit `c01b471`

## Scope and source

The attached `Recovered-Design-System-Guidance.docx` was rendered to 18 pages and visually inspected in full. Source SHA-256: `7874be3f6c8c8a1fa7ce782c39538721ece65716882a57dab404e2712d616b5e`.

The bounded patch applies its project-independent, discovery-led, three-tier, domain-complete, state-aware, accessible, governed design-system requirements to CP without changing product, media, commerce, external service, or deployment state.

## Standards reconciliation

| Standard | Evidence |
| --- | --- |
| Independent project system | `docs/design-system.md` explicitly prohibits a shared universal package; CP owns its system/versioning. |
| Discovery before tokenization | Product, users, references, stack, responsive boundary, and exclusions are recorded. |
| Three token tiers | `app/design-tokens.css` declares Tier 1 primitives, Tier 2 semantic intent, and Tier 3 component aliases under `--cp-*`. |
| Canonical source | `app/globals.css` imports the token file; tests reject a second raw-value source on active surfaces. |
| Complete domains | Colour, type, spacing/layout, sizing, shape, depth, motion, media, iconography, accessibility, and N/A data visualization are documented. |
| Component/state contract | Actions, media viewer, catalog/PDP/bag, media truth, responsive, focus, Escape, swipe, and reduced-motion states are specified. |
| Drift/dependency controls | Deterministic tests reject raw colours, inline styles, un-tokenized arbitrary values, primitive leakage, and broken representative dependency chains. |
| Change propagation | Colour, radius, and spacing chains are tested from primitive/semantic roles to active component aliases/classes. |
| Visual regression | New desktop/mobile evidence was inspected against v1.2; the approved runway and `ONE` hierarchy remain intact. |

## Automated verification

`yarn verify` passed:

- ESLint: zero warnings.
- Vitest: 35 files, 336 tests passed.
- Production audit: 0 vulnerabilities, 193 packages audited.
- Next.js 15.5.21 build: successful, 13 routes.

Non-blocking tool output: the existing Browserslist dataset is old; Yarn reports the repository's existing `postcss`/`sharp` resolution compatibility warnings; Next reports the existing edge-runtime static-generation advisory. None changed the successful result.

## Browser and visual verification

Background headless Google Chrome checked:

- `/` landing and `#signature-runway` product scene at 1440×1000 and 390×844;
- `/shop` at 1440×1000 and 390×844;
- `/products/carlophillips-signature-hoodie` at 1440×1000 and 390×844;
- `/bag` at 390×844;
- `/concept-preview` at 1440×1000 and 390×844;
- the mobile Hoodie media dialog and reduced-motion mode.

All route requests returned HTTP 200. Checks recorded zero horizontal overflow, provider-name customer copy, broken images, console errors, page errors, or framework overlays. Keyboard focus reached an interactive element. The 390px media panel measured 358.8px, exposed 11 slides, closed with Escape, and did not overflow. Reduced-motion mode resolved both campaign and scroll animation names to `none`.

Machine-readable results: `browser-verification.json`. Screenshots are under `screenshots/`.

## Visual comparison conclusion

The v1.2.1 screenshots were inspected beside `test_reports/cp-v1.2-token-system-2026-08-09/screenshots/`. Layout, hierarchy, crop, copy, media control, commerce states, and the private concept route remain materially unchanged. Differences are limited to normal independent browser rasterization; no intentional redesign is present.

## Boundaries

- No push, PR, Preview, Production deployment, domain change, Shopify/provider write, order, billing action, or merge.
- Untracked `public/products/at-edge-of-life/` and `public/products/pod-capsule/` are concurrent Product Owner assets. They were not read into, modified by, staged with, or claimed by this patch.

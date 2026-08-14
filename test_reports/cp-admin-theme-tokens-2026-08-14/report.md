# Product Owner Theme token proposal — QA report

Date: 2026-08-14

Candidate branch: `codex/cp-admin-theme-tokens`

Execution: local Next.js production server, Playwright Chromium, headless/background

Production impact: none

## Result

PASS. The candidate implements a repository-local, Product Owner-only proposal editor for exactly four canonical values in root `theme.json`: accent colour, corner radius, base spacing, and base text weight. It does not expose layout, component, section, page-structure, commit, pull-request, Preview, merge, publication, Shopify, or Production authority.

The final source gate passes zero-warning lint, 39 test files / 373 tests, zero production dependency vulnerabilities, and the optimized Next.js build. `git diff --check` and the scoped secret scan pass. Browser evidence in `verification.json` records 442 passing findings, zero failures, and 55 screenshots.

## Automated browser matrix

- Product Owner Theme screen: 1440×1000, 1024×768, and 390×844.
- Reviewer admin matrix: all 13 non-Theme sections at desktop, tablet, and mobile; Theme is absent from navigation.
- Reviewer direct `/admin/theme`: 404 with no Theme vocabulary.
- Public `/`, `/shop`, `/products/carlophillips-signature-hoodie`, and `/bag`: desktop and mobile.
- Checkout containment: `/api/checkout` remains denied with canonical `409 PRODUCT_RELEASE_NOT_RELEASED`.
- Theme API integration: exact-origin Product Owner unchanged POST returns `200 THEME_UNCHANGED`; a foreign Origin returns `403 ORIGIN_REJECTED`; both leave `theme.json` byte-for-byte unchanged.
- Every checked page has no horizontal overflow, serious/critical accessibility violation, browser console error, failed request, provider leak, raw identifier leak, or framework overlay.

## Theme acceptance checks

- The first Theme viewport states `Exactly four token values. No layout changes.`
- Exactly four controls are rendered, with current and proposed values.
- The save action is honestly named `Save branch proposal` and is disabled while unchanged.
- Changing the radius enables the action and updates only the contained preview to the expected 8 px computed radius.
- The screen states that the result is local and uncommitted and that Production remains unchanged.
- The status is `branch proposal`, never a Product Release Record status.
- Theme is the second navigation item and remains visible/focusable at 390 px.
- The stale-revision path presents a deterministic reload action.
- Accent choices are contrast-validated against both canonical dark canvases; meaning is never carried by accent alone.

## Visual inspection and comparison

- `screenshots/desktop-1440x1000-theme-default.png` and `screenshots/mobile-390x844-theme-default.png`: pristine canonical values, clear scope boundary, all four controls, current/proposed split, contained live preview, and mandatory PR/Preview workflow are visible without ambiguity.
- `screenshots/desktop-1440x1000-theme.png` and `screenshots/mobile-390x844-theme.png`: the deliberately unsaved radius proposal updates only the contained preview; navigation remains discoverable, controls stack without clipping, workflow remains readable, and no horizontal overflow is present.
- `screenshots/public-desktop-1440x1000-home.png` and `screenshots/public-mobile-390x844-home.png`: the first viewport preserves the retained customer-experience baseline composition, typography, spacing, and consent surface.
- `screenshots/public-desktop-1440x1000-products-carlophillips-signature-hoodie.png` and `screenshots/public-mobile-390x844-products-carlophillips-signature-hoodie.png`: the PDP preserves the v1.2.2 local fixture baseline composition and explicit non-live-data labelling. The desktop candidate matches `test_reports/cp-v1.2.2-design-system-release-2026-08-14/screenshots/desktop-pdp.png`; the mobile candidate matches the first viewport of its retained `mobile-pdp.png` baseline.
- The older live-Production capture intentionally shows the fail-closed unavailable state, so it is authority evidence rather than a pixel baseline for the local presentation fixture.

`public-baseline-comparison.json` compares the default-theme candidate directly with pre-feature commit `f566ef7` for `/`, `/shop`, the Hoodie PDP, and `/bag` at 1440×1000 and 390×844. All eight equal-size pairs have identical rendered-body structure hashes, text hashes, element counts, computed body styles, key rectangles, and route status. Every pair is pixel-exact: mean absolute channel difference `0` and changed pixels above threshold 8 `0%`. The sole intentional document-level difference is one governed head bridge, `<style data-cp-theme-tokens="theme.json">`; inert Next transport scripts are excluded from rendered-body structure hashing.

Default-token parity is additionally deterministic in source QA: generated runtime primitives reproduce the previous white accent, zero radius, 1 rem base spacing/derived scale, and 300 base text weight exactly.

## Security and authority checks

- Product Owner and reviewer credentials are distinct, server-only bearer values compared in constant time.
- Read/write is denied on Vercel, non-local hosts, production commerce, non-`codex/*` branches, missing explicit write enablement, cross-origin requests, stale fingerprints, malformed/extra/out-of-range fields, and symlink/path escape targets.
- The canonical write is an atomic replace of only root `theme.json`; unchanged submissions do not write.
- No Tailwind surface was reintroduced. Documentation binds any future Tailwind adapter to the same canonical JSON.
- A broadened hardcoding scan covers all active source under `app/` and `components/` for the four governed property classes.

## Evidence

- Machine report: `verification.json`
- Screenshots: `screenshots/` (55 PNG files), plus eight pre-feature and eight same-run candidate comparison PNGs
- Exact pre-feature comparison: `public-baseline-comparison.json`, `baseline-f566ef7/`, and `comparison-candidate/`
- Baseline comparison: `test_reports/cp-v1.2.2-design-system-release-2026-08-14/screenshots/`

No Preview, Production deployment, push, merge, Shopify mutation, order, purchase, or external write was performed.

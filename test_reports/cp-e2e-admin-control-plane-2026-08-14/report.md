# CP end-to-end admin control-plane verification

Date: 2026-08-14

Source commit: `c79d40f33231a6daf95854c21b5a1428245cb6c2`

Branch: `codex/cp-e2e-admin-control-plane`

Environment: local production build, read-only fixture mode

Browser: Playwright Chromium, headless/background/offscreen

## Verdict

**PASS for the local-only, read-only control-plane candidate and fail-closed checkout containment.**

This is not acceptance of remote admin, live commerce, end-to-end order operations, Preview, Production, Shopify/POD writes, or production deployment. The canonical Product Release Record remains Draft.

## Automated source gates

- `yarn install --frozen-lockfile`: passed with Yarn Classic 1.22.22.
- `yarn lint`: zero warnings.
- `yarn test`: 38 test files / 364 tests passed.
- `yarn audit --groups dependencies --level moderate`: 0 vulnerabilities across 55 production packages.
- `yarn build`: passed; `/admin/[[...section]]` is dynamic and server-rendered.
- `git diff --check`: passed.

## Browser matrix

All 13 admin areas were exercised at:

- 1440×1000 desktop
- 1024×768 tablet
- 390×844 mobile

Coverage: Overview, Briefs & drops, Jobs & runs, Products/POD/samples, Media, Releases, Approvals, Preview/publication, Orders/fulfillment, Post-sale, Analytics, Capabilities, and Audit.

Additional coverage:

- unauthenticated `/admin` at 1024×768;
- public home, shop, Hoodie PDP, and bag at 1440×1000;
- checkout denial for the exact canonical Draft release;
- responsive overview comparison and desktop all-sections contact sheet.

The machine-readable report records **344/344 passed findings** and no failures in `verification.json`.

## Verified behavior

- Authorized local admin routes returned HTTP 200.
- Unauthenticated admin returned HTTP 404 with generic copy and no operational vocabulary.
- Every admin route emitted `noindex` metadata.
- Admin contained no forms or buttons and exposed no raw Shopify/POD references.
- Admin and public routes had no horizontal viewport overflow.
- Every admin route had a labelled active navigation state.
- Axe reported no critical or serious WCAG 2 A/AA violations.
- Tablet data tables are keyboard-focusable scroll regions.
- Admin/public matrices emitted no console errors or unexpected failed requests.
- Public images were traversed, decoded, and verified with zero broken media.
- Public routes contained no admin navigation, provider names, raw provider IDs, or Shopify GIDs.
- `/api/checkout` returned HTTP 409 `PRODUCT_RELEASE_NOT_RELEASED`; the candidate contains no Shopify `cartCreate` surface.

## Visual comparison review

- Desktop preserves a stable left navigation rail, compact status hierarchy, and two-column blocker cards.
- Tablet preserves the same counts, state, owners, and primary information hierarchy; wide tables scroll through a keyboard-focusable region.
- Mobile converts the navigation to a horizontal rail, metrics to one-column cards, status rows to stacked layouts, and tables to labelled cards without clipping or horizontal page overflow.
- Statuses always include visible text and border treatment; no status depends on color alone.
- The denied state is intentionally generic and visually separate from the operational control plane.
- The local PDP visibly identifies fixture truth, keeps purchasing disabled, and uses provider-neutral customer captions.

## Evidence

- `verification.json`: route-by-route HTTP, privacy, accessibility, overflow, console/network, image, provider-leak, and checkout findings.
- `screenshots/`: 44 authorized, denied, and public-regression captures.
- `comparisons/admin-overview-responsive.png`: desktop/tablet/mobile comparison.
- `comparisons/admin-sections-desktop-contact-sheet.png`: all 13 admin areas.

## Remaining external acceptance

The following require separate Product Owner decisions and evidence: fail-closed Vercel Preview/Production containment, Apliiq mapping, physical sample and media, Shopify release bindings, identity/RBAC, durable audit/read-model persistence, connectors, controlled payment/order, fulfillment/tracking, support, return/refund, review eligibility, and analytics reconciliation.

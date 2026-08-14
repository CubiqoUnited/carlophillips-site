# Integrated end-to-end containment, admin, and Theme QA

Date: 2026-08-14  
Branch: `codex/cp-e2e-admin-control-plane`  
Tested source commit: `05d3d72c4b32f4b119f1ed86c438762a8f9d3f10`  
Candidate state during capture: working tree; the only post-source changes were the reusable baseline-label option in the QA harness and this retained evidence/documentation.

## Scope

This evidence covers the reconciled local candidate: canonical-release fail-closed checkout containment, provider-neutral public presentation, the local-only admin read model, and the Product Owner-only four-token `theme.json` proposal workflow. It is not a Vercel Preview, Production deployment, Shopify write, POD action, order, or publication approval.

## Source verification

- Yarn Classic `1.22.22` `yarn verify`: passed.
- ESLint: passed with zero warnings.
- Vitest: 39 files / 374 tests passed.
- Production dependency audit: 0 vulnerabilities across 55 packages.
- Next.js `15.5.21` optimized build: passed, including dynamic `/admin/[[...section]]`, `/api/admin/theme`, and `/api/checkout` routes.

## Headless browser verification

- Playwright Chromium, background/headless only: 459/459 checks passed.
- 55 screenshots captured across 13 reviewer sections, Product Owner Theme default/proposed states, unauthorized and reviewer-denied states, and public home/shop/PDP/bag routes.
- Viewports: 1440×1000, 1024×768, and 390×844 for admin; desktop/mobile for public regression.
- Checks include HTTP state, noindex, role isolation, same-origin unchanged save, cross-origin denial, byte-stable unchanged `theme.json`, Draft checkout denial, no public admin links, no provider/raw-ID leakage, decoded media, console/network health, horizontal overflow, keyboard focus, and serious/critical Axe findings.
- Offscreen visual inspection passed for the responsive Overview comparison, 13-section desktop contact sheet, and Theme at desktop/mobile widths.

## Public before/after comparison

The clean pre-Theme integrated baseline `ade03e6` was rebuilt in an isolated disposable worktree and compared with the integrated candidate on `/`, `/shop`, `/products/carlophillips-signature-hoodie`, and `/bag` at 1440×1000 and 390×844.

- 8/8 comparisons passed.
- Rendered body structure, text, element counts, body styles, key rectangles, and overflow state match.
- Every pair reports 0 mean absolute channel difference and 0% changed pixels at threshold 8.
- The only intentional document-head change is one validated `style[data-cp-theme-tokens="theme.json"]` bridge.

## Evidence index

- `verification.json`: complete 459-check record.
- `public-baseline-comparison.json`: eight exact public comparisons.
- `comparisons/admin-overview-responsive.png`: desktop/tablet/mobile Overview sheet.
- `comparisons/admin-sections-desktop-contact-sheet.png`: all 13 reviewer sections.
- `screenshots/*-theme-default.png` and `screenshots/*-theme.png`: Product Owner Theme states.
- `screenshots/reviewer-theme-denied-1024x768.png` and `screenshots/denied-1024x768.png`: non-disclosing denial evidence.

## Remaining gates

The overall system remains RED / NOT END-TO-END READY. Production still runs the older checkout-capable artifact until a separately authorized containment release. Shopify/POD mapping, the physical sample, approved media bindings, immutable Preview evidence, Product Owner approvals, remote identity/RBAC, durable persistence, live checkout/payment/order evidence, fulfillment/tracking, support/returns/refunds/reviews, and analytics reconciliation remain unproven or externally blocked.

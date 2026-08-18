# CARLOPHILLIPS Staging UAT — Final Hoodie Media, Funnel 2 and Analytics

Date: 2026-08-18  
Candidate branch: `codex/cp-uat-final-media-analytics`  
Base: exact `origin/staging` commit `ad3f690fc9f3493747d795ca224b3926ae9635ba`  
Production changed: **No**

Permanent Staging: `https://carlophillips-site-staging-adityas-projects-261b17a9.vercel.app`

Deployment: `dpl_ApCs7WpJvTTbreH9qj4BaEaH6SQ8` (`READY`, target `preview`)

Deployed source: `3d8cefd5bb8a0df47a736e609c6cb8ccfa42fa92`

## Decision

**GO for protected Staging review of the media, Admin and analytics candidate. NO-GO for claiming released commerce or promoting Production.**

The two exact Product Owner-selected videos are implemented as final Staging media and pass deterministic plus live-browser UAT. Funnel 2 exists inside the same Admin portal without interrupting Funnel 1. Vercel public-site observability is wired and Admin is excluded. The remaining red item is real commerce: the canonical Product Release Record is `staged`, so the release-bound server correctly withholds Order and Shopify checkout.

## Requirements checked

| Requirement | Result | Evidence / truth |
|---|---|---|
| Default Hoodie panel uses final Runway motion | PASS | Exact `runway-motion-final.mp4`; 7.791667s, H.264, 832×1104, checksum-bound |
| Remove closed-eye opening | PASS | First two source seconds removed |
| Subtle 80–90% slow motion | PASS | 0.9× playback |
| Steps, stop, quarter-turn, confident hold | PASS | Contact-sheet and live playback inspection |
| Autoplay muted only while visible | PASS | 60% intersection threshold; page/modal/bag/order suspension |
| Stop at end; Play/Pause/Replay | PASS | `loop=false`; live end-state and replay control verified |
| Reduced-motion fallback | PASS | Video remains paused at `0s` at all reduced-motion QA |
| Modal opens on factual image | PASS | First slide image=1, video=0 at desktop/tablet/mobile |
| Separate Runway and Fit & Silhouette videos | PASS | Both selectors and exact video slides verified |
| Remove video caption text | PASS | No bottom caption rendered for the two final videos |
| Desktop/tablet/mobile and media delivery | PASS | 1440×1000, 768×1024, 390×844; all media range reads HTTP 206 |
| Product text/tags use design system | PASS | Existing component consumes primitive→semantic→component token chain; hardcoded-value lint passes |
| Product and gallery mock comparison | PASS WITH EXPLAINED DELTA | Structure, hierarchy and controls compared side-by-side. The live frame is intentionally a moving video frame, not the static mock frame. Order controls are absent because release authority is incomplete. |
| Funnel 1 remains operational | PASS | Existing POD-to-publish code path is unchanged |
| Funnel 2 in same Admin portal | PASS | Product Owner-only `/admin/media-generation`, feature flag, same release and Media Registry |
| Product Owner allow; reviewer/anonymous deny | PASS | Admin HTTP 200 at three widths; both denial cases HTTP 404 |
| Generate/regenerate/approve/publish do not mutate | PASS | Only read-only Compare is enabled; all mutating actions fail closed |
| Requested provider connections represented | PASS | Nine-provider readiness registry shown in Admin |
| Authenticated provider handshakes | BLOCKED | No supported credential/contract exists except a defined Runway API key boundary; no false connection claim |
| Vercel Web Analytics + Speed Insights | PASS | Permanent Staging public scripts and endpoints return HTTP 200; Admin route loads neither hook |
| Shopify analytics responsibility | PASS | Shopify remains source for checkout/order/conversion/revenue/payout reporting |
| Production payment lint | PASS | Primary Production candidate must set cart+checkout true; protected preflight and checkout-disabled fallback remain mandatory |
| Live Order tray, bag and Shopify checkout | BLOCKED | Browser shows zero purchase controls; same-origin server probe returns 409 `PRODUCT_RELEASE_NOT_RELEASED` |
| Staging deployment | PASS | Permanent alias points to READY Preview deployment `dpl_ApCs7WpJvTTbreH9qj4BaEaH6SQ8` |
| Production deployment | NOT AUTHORIZED | Production remains unchanged |

## Browser results

- Public site: 3/3 responsive viewports returned HTTP 200 with no overflow, framework overlay, console error or genuine failed request.
- Runway video: exact source, muted, non-looping, advances while visible, and stops at the end at all three widths.
- Gallery: factual image first, separate Runway and Fit selectors, both videos decoded and delivered with HTTP 206 range responses.
- Accessibility: 14 public route/viewport combinations passed WCAG 2 A/AA/2.1 A/AA automated checks with no consent banner and no third-party marketing trackers.
- Admin: Product Owner route passed at 1440×1000, 1024×768 and 390×844 with zero overflow/errors. Reviewer and anonymous direct access each returned concealed 404.
- Observability: permanent Staging public pages load both Vercel Analytics and Speed Insights scripts with HTTP 200 responses; Admin requests neither.
- Remote Admin boundary: `/admin/sign-in` returns 200; anonymous `/admin/media-generation` returns concealed 404. Product Owner allow was verified locally at three widths; the final remote authenticated session remains a manual UAT item.
- Checkout boundary: a same-origin permanent-Staging POST returns HTTP 409 `PRODUCT_RELEASE_NOT_RELEASED`; no Shopify cart was created.

## Complete source gate

- Yarn Classic: 1.22.22
- Design-system lint: passed
- Production-commerce lint: passed
- ESLint: passed with zero warnings
- Tests: 57/57 files, 564/564 assertions
- Production dependency audit: 0 vulnerabilities across 69 packages
- Next.js: 15.5.21 optimized build passed

## Mock comparisons

- `compare-runway-desktop.png`: supplied desktop product-motion mock beside the current Hoodie panel.
- `compare-runway-mobile.png`: supplied mobile product mock beside the current Hoodie panel.
- `compare-gallery-desktop.png`: supplied gallery mock beside the factual-image-first current gallery.

The comparison is visual and structural, not a misleading pixel-equality claim: one side is a saved static reference while the other contains an approved moving video at capture time. The remaining visible difference with commercial meaning is the missing Order control, which is intentionally governed by the release server and cannot be introduced as decoration.

## Provider handshake status

The Admin covers Modelize, MODA, Sugata, TAYLA, Raspberry AI, ProductSpin AI, Instant 3D, Spacecheck and Runway. Current statuses are deliberately conservative:

- Runway: official API boundary defined; encrypted `RUNWAYML_API_SECRET` and approved read-only authentication probe required.
- MODA: Shopify app review/plan/scope approval required.
- Modelize and Sugata: approved human browser sessions only; no server API claimed.
- TAYLA: supported provider contract/API/pricing required.
- Raspberry AI, ProductSpin AI, Instant 3D and Spacecheck: exact commercial service and official supported API documentation must be supplied before integration.

No provider credit, catalog write, Shopify upload, publication or Production mutation occurred.

## Why commerce is still red

The test order and hosted-checkout evidence prove that CARLOPHILLIPS → Shopify → Apliiq can work technically. They do not change the canonical release state. The current record still lacks complete physical-sample evidence, production-bound media approvals, product/media/fulfillment approvals, a fresh Production observation and verified rollback evidence. Because of that, the release-bound source correctly refuses cart creation. This is the exact behavior the production-payment lint and release policy are intended to protect.

## Evidence index

- Machine result: `uat-results.json`
- Public screenshots: `runway-*.png`, `gallery-factual-*.png`, `gallery-runway-*.png`, `gallery-fit-*.png`
- Reduced motion: `runway-mobile-reduced-motion.png`
- Mock comparisons: `compare-*.png`
- Accessibility: `accessibility/accessibility-verification.json` and screenshots
- Admin: `admin-media/verification.json` and screenshots
- Human/provider activation record: `../../reports/HUMAN_INTERVENTION_STICKY_RED.md`
- Deployment receipt: `staging-deployment.json`

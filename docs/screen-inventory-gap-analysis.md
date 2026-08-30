# Screen Inventory Review Workbook — Current State, Future State, Gap Register

Source requirement: *CARLOPHILLIPS Screen Inventory Review Workbook — desktop + mobile mock reference,
specification workspace, and exception-state appendix* (45 pages, 28 numbered screens plus the
media/order/cart/shipping/session exception appendix and an exploratory colour study).

This document is the analysis gate that precedes implementation. It records what the storefront does
today, what the workbook requires, and the delta that the implementation must close. It is written
against the design-system authority described in `docs/design-system.md`: `theme.json` controls the
four Product Owner primitives, `app/design-tokens.css` owns every other presentation value, and no
customer surface may carry a raw visual literal.

## 0. Scope decisions taken from the workbook itself

| Workbook signal | Decision |
| --- | --- |
| Pages 24–28 are stamped `EXPLORATORY COLOUR STUDY — NOT AN ACTIVE THEME TOKEN` | The cream/paper palette is **not** adopted. The active theme stays the black canvas. No token values change from the study. |
| "Approved source masters remain in private versioned storage; the site stores only Mux playback ID and poster reference" | Media identity stays a *reference*, never a committed master. The storefront renders only assets a readiness gate has confirmed. |
| "Three approved clips: Runway Motion, Fit & Silhouette, and 360 Showcase" | Three declared slots. Only clips the readiness check confirms are offered; unconfirmed slots are withheld rather than faked (AGENTS.md: do not invent video/spin/3D evidence). |
| `FULLSCREEN: Not available` on screens 03/04 | The existing fullscreen/expand affordance on the video stage is removed. |
| Appendix exception widgets carry `Requirement / owner: ____` blanks | Every exception state is implemented as a real, reachable component; ownership blanks are recorded in `TASKS.md`, not rendered. |

## 1. Current state

### 1.1 Composition

The customer storefront is a single scrolling page (`components/storefront/home-storefront.jsx`,
1231 lines) plus a small set of secondary routes.

| Surface | Where | What it does today |
| --- | --- | --- |
| Landing | `CampaignHero` | Static `next/image` of `/campaigns/lofoten-runway-hero.png`, headline `At the edge of life.`, eyebrow, `Runway 001 / Lofoten` caption, and a scroll cue anchored to `#signature-runway`. |
| Discovery | `ProductRunwayHero` | Full-bleed background video that fills the panel, product copy pinned bottom-left, a corner stack with `Order — €180` and `View gallery`, and a motion control group (play/pause, timestamp, timeline). |
| Gallery | `ProductMediaOverlay` | Centred inset dialog, horizontal scroll-snap track, prev/next arrows, thumbnail rail, autoplay toggle, `NN / NN` counter, per-item captions. |
| Order | `OrderTray` | Right side drawer: price, copy, S/M/L radio group, Size & Fit link, Add to bag, Buy now (posts to `/api/checkout`). |
| Size guide | `SizeFitDrawer` | Nested drawer with prose fit guidance and two `<details>` disclosures. No measurement table. |
| Bag | `BagDrawer` + `/bag` | Drawer shows one just-added line with quantity stepper and subtotal. `/bag` renders `CommerceBagState`, a policy/decision page, not a cart. |
| Menu | `MenuOverlay` | Left overlay listing six product categories. |
| Catalog | `/shop`, `/collections` | `CommerceCatalogState` — a release-gated card grid page. |
| PDP | `/products/[handle]` | `ProductDetail` — separate full page. |
| Footer | `Footer` | Wordmark plus six policy/nav links. |

### 1.2 Media

* `public/media/signature-hoodie/videos/` holds `runway-motion-final.mp4` and `fit-silhouette-final.mp4`
  (both checksum-bound by `tests/signature-hoodie-video-assets.test.js`), plus superseded non-`-final` cuts.
* The third motion slot is filled by `still-derived-motion-study.gif` — a still-derived loop, not a 360 clip.
* Posters exist as `.jpg` only; there is no AVIF/WebP first-frame poster.
* There is **no landing hero video asset at all**; the landing is a still.
* `releases/cp-signature-hoodie-2026-001/media-manifest.json` records `video: candidate` (two asset ids)
  and `spin-360: missing`.
* Nothing verifies at build or request time that a referenced video file is present, non-empty, has a
  poster, or matches its declared aspect. A missing file degrades to a silently broken `<video>`.

### 1.3 Design system

Healthy and strictly governed: three token tiers, 205 component tokens, deterministic tests for naming,
tier direction, reference closure, token reachability, raw-literal prohibition, and the four canonical
breakpoints. `scripts/lint-design-system.mjs` blocks raw colours and untokenised governed properties.
This analysis assumes that governance is preserved, not relaxed.

## 2. Future state (as attached)

### 2.1 Screen flow

Happy path: **Landing → Discovery → order / size selection → Cart → Checkout → Confirmation → Email.**

| # | Screen | Required composition |
| --- | --- | --- |
| 01 | Landing — Pre-Morph | Full-screen hero video behind a black morph panel. Panel carries crest, `CARLO PHILLIPS`, `at the / Edge Of / Life`, `LOFOTEN · NORWAY`, and `ENTER →`. Header shows `JOIN THE LIST` and the menu glyph. |
| 02 | Landing — Post-Morph | `ENTER` translates the black panel leftward; logo, copy and CTA travel with it. Video is stationary beneath — no fade, flash or fullscreen. Header resolves to Menu / wordmark / Join the list / Bag. |
| 03 | Discovery — Default [Video Stage] | Three-column stage. Left: `SIGNATURE SERIES / 001`, `ONE`, description, three disclosure chips `COLOR —`, `MATERIAL —`, `FEEL —`. Centre: portrait 4:5 video panel, `MODEL VIDEO` caption, play/pause + progress bottom-left, three video dashes bottom-centre, **no fullscreen**. Right: stacked `VIEW GALLERY · 12 IMAGES` and `ORDER — €180 →`. Lower right: `ALL CATEGORIES`, `ALL HOODIES`, and a vertical position rail. Bottom-left: thumbnail strip. |
| 04 | Discovery — Order CTA Active | The right stack is replaced in place by an order panel: `ORDER` + close, description, `€180`, `SELECT SIZE` S/M/L, `SIZE GUIDE`, filled `ADD TO BAG`, outline `BUY NOW`, `COMPLIMENTARY SHIPPING & RETURNS`. |
| 05 | Discovery — Overlay Gallery | Centred overlay over a dimmed discovery page. Top: `ORDER — €180` pill and `×`. Sides: `←` / `→`. Bottom: `01 / 14`, position dashes, and a dense thumbnail rail. |
| 06 | Overlay Gallery + Order active | Gallery overlay and order panel coexist; gallery narrows. Category rail `SAME-MODEL / MERCHANDISE / DETAIL / 2.5D`. |
| 07 | All Categories Grid | Overlay: `CATEGORIES · 6 GROUPS`, `×`, 3×2 cards with name and item count; the active group is outlined and marked `(VIEWING)`. |
| 08 | Product Grid (All Hoodies) | Same overlay geometry: `HOODIES · 6 ITEMS`, cards with product name and price, active card marked `(VIEWING)`. |
| 09 | Cart — Default | Right drawer `YOUR BAG (3)` + `×`. Lines: thumbnail, name, `SIZE M · COLOR: BLACK`, `− 1 +`, price, `REMOVE`. Footer: discount field + `APPLY`, `SUBTOTAL`, `SHIPPING — CALCULATED AT CHECKOUT`, `TOTAL`, filled `PROCEED TO CHECKOUT`, `SECURE CHECKOUT · TAXES INCLUDED`. |
| 10 | Checkout — Default | Wordmark bar, step rail `INFORMATION / ② SHIPPING & PAYMENT / CONFIRMATION`. Left: contact, shipping address, payment (method chips, card fields) with a hosted-checkout notice. Right: order summary with quantity badges, discount row, subtotal / shipping / tax / total. |
| 11 | Order Confirmation | Centred check disc, `THANK YOU`, `Your order is confirmed`, confirmation copy, `ORDER #CP-20482` button, order summary card, shipping block, `CONTINUE SHOPPING`. |
| 12 | Confirmation Email | Dark transactional email: wordmark, order confirmed headline, summary, totals, shipping address, delivery estimate, `VIEW YOUR ORDER`, footer links. |
| 13 | Contact Us — Support | `SUPPORT` / `CONTACT US`, 1–2 business-day promise, Name, Email, Order number (optional), Subject, Message, `SUBMIT REQUEST`. |
| 14 | Payment Could Not Be Completed | `TRY ANOTHER PAYMENT METHOD`, `RETURN TO BAG`, `CONTACT SUPPORT`. |
| 15 | Checkout Expired | `START NEW CHECKOUT`, `RETURN TO BAG`, `CONTACT SUPPORT`. |
| 16–18, 28 | Private List | Sign-up, confirmation, validation, already-registered. |
| 19–20 | Discovery / Gallery reference | Mobile stacking: stage on top, copy and full-width `ORDER` / `VIEW GALLERY` rows beneath. |
| 21 | Menu — Navigation | Left panel: `NAVIGATION`, `DISCOVERY`, `ALL CATEGORIES`, `ALL HOODIES`, `CONTACT US`, `PRIVATE LIST`, plus the footnote `CONTACT US opens the Support form.` |
| 22 | Size Guide | `SIZE / CHEST / LENGTH` table — S 48/66, M 52/69, L 56/72 — `Measurements are garment measurements.`, `CLOSE`. |
| 23 | Added to Bag | Small confirmation widget: `ADDED TO BAG`, `ONE / Size M / EUR 180`, filled `VIEW BAG`, quiet `Continue shopping`. |
| 24 | Cart — Empty | `Your bag is empty.` / `Discover the current collection.` / `CONTINUE SHOPPING`. |
| 25 | Processing Payment | `PROCESSING PAYMENT`, `Please do not close or refresh this page.`, disabled `PAYMENT IN PROGRESS`. |
| 26 | Contact — Success and Validation | `REQUEST SENT` → `RETURN TO DISCOVERY`; `CHECK REQUIRED FIELDS` → `UPDATE REQUEST`. |
| 27 | Order Tracking | `TRACK ORDER`, `ORDER CP-0001`, four-step timeline: Order confirmed, In production, Shipped, Delivered, each `Recorded` or `Pending update`. |
| 30 | Cart — Optional CP Recognition | `HAVE A CP ACCOUNT OR STORE CREDIT?`, email field, `RECOGNISE ME`, `CONTINUE AS GUEST`. |

### 2.2 Media requirements

**Landing video hero.** Full-screen adaptive HLS behind the black morph panel. Separately composed
16:9 desktop and 9:16 mobile masters; H.264, SDR Rec.709, 24 fps, muted. Optimised local AVIF/WebP
first-frame poster for instant render and reduced-motion fallback. The panel translates; the video does
not fade, flash, or go fullscreen. Site stores playback ID and poster reference only.

**Default product video.** Central portrait stage composed at 4:5. Three approved clips — Runway Motion,
Fit & Silhouette, 360 Showcase. Muted autoplay plays **two complete runs**, then **stops on the final
frame with a centred Play**. Play/pause, progress, and three video dashes are shown while playing.
No fullscreen. Optimised local AVIF/WebP first-frame poster and reduced-motion fallback.

**Gallery categories.** Same-model (stills + 1–2 short loops); Merchandise (stills + verified 360);
Detail (close-ups + truthful fabric motion); Interactive (optional, visibly-labelled approximate 2.5D GLB).

### 2.3 Exception states (appendix)

Video unavailable · Gallery unavailable · Selected size unavailable · Bag empty · Discount not
recognised · Review shipping details · Shipping unavailable · Payment could not be completed ·
Checkout expired · Tracking pending.

## 3. Gap register

Severity: **B** blocks the workbook contract · **C** composition delta · **S** state/behaviour delta.

| # | Gap | Sev | Current | Required | Resolution |
| --- | --- | --- | --- | --- | --- |
| G-01 | Landing has no morph panel or `ENTER` | B | Static image + scroll cue | Black panel translating left over a stationary video | New `LandingMorph` surface with pre/post-morph states, panel transform, and `ENTER` |
| G-02 | Landing hero is a still, not video | B | `next/image` only | Video hero with poster-first render | Hero video slot driven by the readiness gate; poster-only render when not ready |
| G-03 | No `JOIN THE LIST` entry point | C | Absent | Header CTA on landing | Header action opening the Private List |
| G-04 | Discovery is full-bleed, not a 4:5 stage | B | Background video fills the panel | Centred portrait 4:5 panel with side columns | Three-column discovery layout with a dedicated stage |
| G-05 | No video dashes | B | Single motion control | Three dashes switching clips | Dash control bound to the ready clip set |
| G-06 | Autoplay does not stop after two runs | B | Cycles the sequence indefinitely | Two complete runs, stop on final frame, centred Play | Run counter + final-frame hold + centred replay control |
| G-07 | Fullscreen affordance present | B | `Expand` icon on the gallery button | `FULLSCREEN: Not available` | Remove the expand affordance from the stage |
| G-08 | No `COLOR / MATERIAL / FEEL` disclosure chips | C | Static fact list | Three expandable chips | Disclosure chips with expandable values |
| G-09 | No `ALL CATEGORIES` / `ALL HOODIES` corner entries or position rail | C | Absent | Present bottom-right | Corner control group + vertical position rail |
| G-10 | No discovery thumbnail strip | C | Absent | Bottom-left strip | Stage thumbnail strip bound to the gallery |
| G-11 | Order is a drawer, not an in-place panel | C | Right side drawer | Panel replacing the right stack | In-place order panel on desktop; drawer retained at mobile width |
| G-12 | Order panel lacks the shipping/returns line | C | Checkout note only | `COMPLIMENTARY SHIPPING & RETURNS` | Added to the order panel |
| G-13 | Gallery has no category rail | C | Flat list | `SAME-MODEL / MERCHANDISE / DETAIL / 2.5D` | Category rail filtering gallery media |
| G-14 | Gallery has no position dashes | C | Counter only | `01 / 14` + dashes | Dash rail beneath the frame |
| G-15 | No categories overlay | B | Absent | Screen 07 | `CategoryGridOverlay` |
| G-16 | No product grid overlay | B | Absent | Screen 08 | `ProductGridOverlay` |
| G-17 | Cart is a single-line drawer | B | One just-added line | Multi-line cart with quantity, remove, discount, totals | Full cart drawer over a client bag store |
| G-18 | No discount capture | B | Absent | Field + `APPLY` + invalid state | Discount row with validation state |
| G-19 | No checkout surface | B | Posts straight to `/api/checkout` | Screen 10 with step rail and summary | `/checkout` route mirroring the workbook, handing payment to the hosted checkout |
| G-20 | No confirmation surface | B | Absent | Screen 11 | `/checkout/confirmation` |
| G-21 | No confirmation email template | B | Absent | Screen 12 | Dark email template module |
| G-22 | No support form | B | Absent | Screens 13 / 26 | `/contact` with success and validation states |
| G-23 | No private list | B | Absent | Screens 16–18 / 28 | `/private-list` with four states |
| G-24 | No order tracking | B | Absent | Screen 27 | `/track` timeline with `Tracking pending` |
| G-25 | Menu lacks the workbook entries | C | Six categories | Discovery / All categories / All hoodies / Contact us / Private list + footnote | Menu rebuilt to screen 21 |
| G-26 | Size guide has no measurement table | C | Prose only | S/M/L × chest/length table | Table + garment-measurement note |
| G-27 | No `ADDED TO BAG` widget | C | Drawer opens directly | Small confirmation widget | Added-to-bag widget before the cart |
| G-28 | No empty-cart state | C | Absent | Screen 24 | Empty state in the cart drawer |
| G-29 | No exception widgets | B | Absent | Ten appendix states | Shared exception-widget component + call sites |
| G-30 | No media readiness check | B | Assets referenced blind | Readiness gate for the hero and the default product video | Readiness module + build script + runtime boundary |
| G-31 | Posters are `.jpg`, not AVIF/WebP | S | `.jpg` posters | Optimised AVIF/WebP first-frame posters | Poster references declared per format with graceful fallback; readiness reports the format actually present |
| G-32 | No `PROCESSING PAYMENT` state | S | Absent | Screen 25 | Submitting state on the checkout action |
| G-33 | No CP recognition block | S | Absent | Screen 30 | Optional recognition block in the cart |

### 3.1 Explicitly out of scope, and why

| Item | Reason |
| --- | --- |
| Mux adaptive HLS delivery | Requires a Mux account, playback IDs, and signed keys that this repository does not hold. The media layer is written to carry a `playbackId` reference so the switch is configuration, not a rewrite; local MP4 sources remain the rendered fallback until an ID is provisioned. |
| 360 Showcase clip | No approved 360 master exists (`spin-360: missing`). Fabricating one would breach AGENTS.md. The slot is declared, reported `not-ready`, and withheld from the dash rail. |
| 2.5D GLB viewer | Marked *optional* in the workbook and has no approved GLB asset. The category is declared and reports empty. |
| Real payment capture on the checkout screen | Card fields are presentational; payment is handed to the hosted secure checkout, as the workbook's own payment notice states. |
| Cream colour study tokens | Stamped *not an active theme token*. |

## 4. Media readiness check (requirement 2)

A single contract covers both required checks.

**Declared slots**

| Slot | Kind | Aspect | Source | Poster |
| --- | --- | --- | --- | --- |
| `landing-hero-desktop` | landing hero | 16:9 | playback ID or local master | first-frame poster |
| `landing-hero-mobile` | landing hero | 9:16 | playback ID or local master | first-frame poster |
| `product-runway-motion` | default product video | 4:5 | `/media/signature-hoodie/videos/runway-motion-final.mp4` | `/media/signature-hoodie/posters/runway-motion-final.*` |
| `product-fit-silhouette` | default product video | 4:5 | `/media/signature-hoodie/videos/fit-silhouette-final.mp4` | `/media/signature-hoodie/posters/fit-silhouette-final.*` |
| `product-360-showcase` | default product video | 4:5 | not provisioned | not provisioned |

**Checks per slot** — declared source present; source non-empty and a real ISO-BMFF/MP4 (`ftyp` box)
when local; poster present; poster format recorded (AVIF / WebP / JPEG) with a reduced-motion still
guaranteed; declared aspect present; readiness verdict `ready` / `poster-only` / `not-ready` with a
machine-readable reason.

**Three consumers**

1. `scripts/verify-media-readiness.mjs` — CI/preflight gate writing a JSON report under `test_reports/`.
2. Server render — the discovery stage is built only from `ready` clips; the landing renders the hero
   video only when its slot is `ready`, poster-only otherwise.
3. Runtime — a play failure or media error demotes the slot and raises the **Video unavailable**
   exception widget (`TRY AGAIN` / `VIEW GALLERY`), leaving product details and gallery available,
   exactly as the appendix specifies.

**Fail-closed rule.** Unknown is not ready. A slot with no evidence is withheld; it never renders a
broken player and never implies media that does not exist.

## 5. Implementation order

1. Tokens for the new surfaces (no value changes to existing roles).
2. Media readiness module, script, and exception boundary.
3. Landing morph + hero video slot.
4. Discovery stage, order panel, corner controls, thumbnail strip.
5. Gallery overlay rework; categories and product grid overlays.
6. Cart drawer, checkout, confirmation, email template, tracking.
7. Support form, private list, size guide, remaining exception widgets.
8. Lint, tests, build, desktop + mobile visual evidence.

## 6. Acceptance

* Every workbook screen has a reachable implementation or a recorded scope exclusion in §3.1.
* No raw visual literal on any customer surface; `yarn lint:design-system` passes.
* `yarn lint`, `yarn test`, and `yarn build` pass.
* The readiness report shows the landing hero and default product video slots with an explicit verdict,
  and the storefront renders only what that report marks renderable.

# CP Signature Hoodie media-expansion report

Date: 2026-08-08  
Branch: `codex/cp-shopify-poc-audit`  
Scope: truthful Preview media expansion; no paid credits, production publication, order, theme activation, or fabricated physical evidence.

## Required showcase matrix

| Modality | Current evidence | Selected worker | Exact next gate |
| --- | --- | --- | --- |
| Factual product stills | Two current Shopify product images | Shopify/Apliiq source | Retain as the factual gallery; add verified back/detail views |
| Product-alone 2D | Flat-lay and chair Modelize visualisations | Modelize/current local assets | Keep disclosed as AI-assisted; do not claim physical accuracy |
| Fabric/embroidery macro | New repaired AI-assisted macro candidate | Physical sample shoot for final truth | Review Preview candidate; replace with exact-product macro before factual release |
| On-body stills | New AI-assisted full-body candidate | MODA | Install manually; generate free draft set; inspect logo, seams, fit, and hands |
| Multi-angle stills | Missing | MODA | Generate ten draft angles from one input, but never treat them as genuine spin-source photography |
| Short video | Missing | MODA | Generate one free-credit draft; export and inspect frame-by-frame before Preview use |
| GIF/motion | Preview-only still-derived animated WebP plus GIF download | Local derivative of disclosed candidate stills | Keep labeled as still-derived motion; do not call it video, spin, or physical movement |
| 360 spin | Missing; Spin Studio installed | Spin Studio | Supply 16–24 genuine angle photos or an inspected GLB |
| Interactive 3D/AR | Missing; Instant 3D installed but vendor iframe refuses connection | Instant 3D candidate | Restore vendor-dashboard access, then generate/export one draft and inspect geometry/textures before headless integration |

## New local candidates

- `public/products/signature-hoodie/candidates/ai-assisted/on-model-front-study.png`: generated from the exact Hoodie product reference; full-body dark-studio study. It is not evidence of physical fit.
- `public/products/signature-hoodie/candidates/ai-assisted/material-embroidery-study.png`: non-destructive repair of the previously quarantined Modelize macro. It is not evidence of the physical material specification.
- `public/products/signature-hoodie/candidates/ai-assisted/back-flatlay-hypothesis.png`: quarantined AI back-view hypothesis created only to satisfy MODA's required draft input. No verified product back photograph exists, so this cannot become factual release media.
- `public/products/signature-hoodie/candidates/ai-assisted/still-derived-motion-study.webp` and `.gif`: animated sequence derived from the four disclosed still candidates. It is motion presentation only, not product video, 360, 3D, or evidence of physical movement.
- The original artifacted macro remains quarantined and unchanged.

The built-in image-generation path was used. The on-body and macro prompts required preservation of the black pullover silhouette, kangaroo pocket, drawstrings, small CP embroidery, and no additional branding; the macro edit was constrained to removal of the white artifact. The later back-view prompt explicitly prohibited invented branding and treated the result as a hypothesis. All outputs were visually inspected before use or quarantine.

## App findings

- MODA official listing: https://apps.shopify.com/moda-ai. MODA is now installed and its embedded screen opens with 2 credits. The job requires front/back local file uploads, but the in-app-browser automation surface does not expose file upload. Exact manual loading instructions are in the sticky handoff; no generation or credit use occurred.
- Instant 3D official listing: https://apps.shopify.com/instant-3d. Instant 3D is installed, but its embedded dashboard at `3dcloud.com.tr` refuses the Shopify iframe connection. No model, widget, credit use, or product-media mutation occurred.
- FreakoutAI was checked as a possible fallback; Shopify reports the app is incompatible with this store, so it was not installed.
- Spin Studio remains installed and free for one product, but it needs 16–24 genuine angles or a GLB. That input does not currently exist.
- Modelize remains installed with its free 3/3 allowance exhausted. Its paid entry point is $19/month and was not accepted.

## Code boundary

The two new assets render only when `environment === 'preview'` and the exact handle is `carlophillips-signature-hoodie`. Production and all other product handles omit the complete editorial-study section. Existing component tests also require the old quarantined filename to remain absent.

## Verification

- Focused product-detail suite: 6/6 passed.
- Full `yarn verify`: passed — zero-warning lint, 33 files / 320 tests, zero production vulnerabilities across 193 packages, and a successful 12-route optimized build.
- Vercel Preview `dpl_5oTCaMM9JutdmSnFtUCJhJacMeGP`: READY at `https://carlophillips-site-pgt28xwy7-adityas-projects-261b17a9.vercel.app`.
- Direct 1280×720 and 390×844 Hoodie checks: the motion panel is present; animated WebP decodes at 540×675; disclosure and GIF link are visible; no horizontal overflow or framework error overlay.
- The browser proof deliberately records `videoCount: 0` and `modelViewerCount: 0`. The Preview does not imply that missing video or 3D work is complete.
- New durable captures: `motion-preview-desktop.png` and `motion-preview-mobile.png`. Earlier expanded-page/on-model/macro captures remain in the same evidence directory.
- Vercel inspection confirms target `preview`; `https://www.carlophillips.com/` continues to return HTTP 200 from the unchanged production route.

## Honest conclusion

The expanded Preview can now demonstrate product-alone, on-body, macro, and explicitly still-derived motion storytelling, but it cannot truthfully claim complete competitive media coverage. Real product video, 360, interactive 3D, physical fabric macro, and physical on-model imagery remain separate deliverables with named workers and exact source gates.

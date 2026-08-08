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
| GIF/motion | Missing | Derived only from approved video/stills | Create a lightweight derivative after the source video/stills pass review; label it accurately |
| 360 spin | Missing; Spin Studio installed | Spin Studio | Supply 16–24 genuine angle photos or an inspected GLB |
| Interactive 3D/AR | Missing | Instant 3D candidate | Manually install free tier; generate/export one draft; inspect geometry and textures before headless integration |

## New local candidates

- `public/products/signature-hoodie/candidates/ai-assisted/on-model-front-study.png`: generated from the exact Hoodie product reference; full-body dark-studio study. It is not evidence of physical fit.
- `public/products/signature-hoodie/candidates/ai-assisted/material-embroidery-study.png`: non-destructive repair of the previously quarantined Modelize macro. It is not evidence of the physical material specification.
- The original artifacted macro remains quarantined and unchanged.

The built-in image-generation path was used. Prompts required preservation of the black pullover silhouette, kangaroo pocket, drawstrings, small CP embroidery, and no additional branding; the macro edit was constrained to removal of the white artifact. Both outputs were visually inspected before integration.

## App findings

- MODA official listing: https://apps.shopify.com/moda-ai. Advertises ten on-model angles from one input, short product video, 20 free images, and two free styled products without a subscription. Data access includes Products and Shopify Admin. The authenticated Install button did not advance after normal and forced semantic clicks; no permission or installation occurred.
- Instant 3D official listing: https://apps.shopify.com/instant-3d. Advertises photo-to-3D, one free model, and six one-time AI generation credits. It can edit Products. The authenticated Install button also did not advance; no permission, installation, model, or widget occurred.
- Spin Studio remains installed and free for one product, but it needs 16–24 genuine angles or a GLB. That input does not currently exist.
- Modelize remains installed with its free 3/3 allowance exhausted. Its paid entry point is $19/month and was not accepted.

## Code boundary

The two new assets render only when `environment === 'preview'` and the exact handle is `carlophillips-signature-hoodie`. Production and all other product handles omit the complete editorial-study section. Existing component tests also require the old quarantined filename to remain absent.

## Verification

- Focused product-detail suite: 6/6 passed.
- Full `yarn verify`: passed — zero-warning lint, 33 files / 320 tests, zero production vulnerabilities across 193 packages, and a successful 12-route optimized build.
- New Vercel Preview desktop/mobile evidence: pending.

## Honest conclusion

The expanded Preview can now demonstrate product-alone, on-body, and macro storytelling, but it cannot truthfully claim complete competitive media coverage. Real video, GIF, 360, interactive 3D, physical fabric macro, and physical on-model imagery remain separate deliverables with named workers and exact source gates.

# CP Homepage Simplification Evidence

Date: 2026-08-08

Branch: `codex/cp-runway-wording-design-system`

## Product Owner comments addressed

1. Signature Hoodie title changed from full white to 62% white.
2. Media viewer action moved from the bottom of product copy to the upper-right of the Hoodie scene.
3. Visible landing cue changed to `Scroll and explore`.
4. Runway still receives slow camera push/pan; actual model movement remains unavailable without a real video file.
5. Four boxed material/construction chips removed, including their unused derived summary/schema contract.

## Media truth

The campaign source is one 1672×941 flattened JPEG. No MP4, WebM, MOV, GLB, GLTF, or USDZ campaign source exists under `public/`. CSS can move the camera framing but cannot produce truthful walking, garment deformation, or independent body motion. A supplied/exported video remains the exact resume point for that enhancement.

## Automated verification

`yarn verify` passed:

- ESLint: zero warnings;
- Vitest: 35 files / 332 tests;
- production dependency audit: zero vulnerabilities across 193 packages;
- Next.js 15.5.21 optimized build: successful, 12 routes.

## Local browser evidence

Headless Chrome loaded `http://127.0.0.1:3000/` with HTTP 200 at 319×501, 390×844, and 1440×1000.

At every width:

- cue text was `SCROLL AND EXPLORE`;
- campaign computed transforms differed after 1.4 seconds, proving active camera motion;
- title computed colour was `rgba(255, 255, 255, 0.62)`;
- media button was within the first 100 pixels of the Hoodie section and within 60 pixels of its right edge;
- no highlight-chip selector rendered;
- reviewed product description remained intact;
- document width equalled viewport width;
- framework overlay count and browser error arrays were zero.

Screenshots are stored as `local-{feedback|mobile|desktop}-{01-landing|02-landing-motion|03-hoodie}.png` in this folder.

## Deployment boundary

Replacement Vercel Preview and direct deployed verification are pending the tested implementation commit. Production, domains, commerce data, orders, apps, billing, canonical `main`, and remote Git state were not changed by the local correction.

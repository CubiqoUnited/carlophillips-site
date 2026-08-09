# CP Homepage Hierarchy Refinement Evidence

Date: 2026-08-08

Branch: `codex/cp-runway-wording-design-system`

Scope: Product Owner browser comments 1–5 on the runway landing and Hoodie media viewer

## Outcome

The first-screen scroll direction is explicit; the second-screen Hoodie copy no longer overwhelms the product image; its description and material/construction highlights come from reviewed product fields; the media action is a filled button with a view count; the motion frame has a direct jump; and the redundant third product section is removed.

The resulting sequence is:

1. runway campaign;
2. Signature Hoodie scene and same-page media action;
3. active/disabled category rail;
4. footer.

## Product copy boundary

The homepage summary now carries only a minimized reviewed description plus deterministic highlights. Current rendered copy is:

> Heavyweight black pullover hoodie with restrained CP chest embroidery. Built as a premium core layer with structured fleece, a soft interior, and minimal front-chest branding.

Highlight labels appear only when the reviewed description/details contain supporting facts. Outer adapter copy does not control this scene.

## Media coverage

The deterministic Preview composition covers:

- both selected/published Modelize product views when present in the eligible catalog media;
- all six selected MODA frames;
- the material/embroidery study;
- the disclosed still-derived animated WebP, with the companion GIF retained.

It excludes the quarantined `back-flatlay-hypothesis.png` and the superseded built-in `on-model-front-study.png`. The latter is not an embedded-app output and is superseded by the selected MODA set.

There is no MP4/WebM/MOV product video, genuine 16–24-angle 360 set, or GLB/GLTF/USDZ model in the repository. The viewer therefore says `Still-derived motion loop`; it does not claim video, 360, 3D, or physical fabric/fit proof.

## Automated verification

`yarn verify` passed:

- ESLint: zero warnings;
- Vitest: 35 files / 332 tests;
- production dependency audit: zero vulnerabilities across 193 packages;
- Next.js 15.5.21 optimized build: successful, 12 routes.

Focused contract/component coverage includes truthful description minimization, evidence-derived highlights, removed duplicate section, high-contrast media action, Motion Study jump, selected asset coverage, exclusion of quarantined/superseded assets, and absence of fabricated motion modalities.

## Browser and screenshot evidence

Headless Chrome loaded `http://127.0.0.1:3000/` with HTTP 200 at:

- exact Product Owner feedback viewport: 641×686;
- mobile: 390×844;
- desktop: 1440×1000.

At all three widths:

- landing cue text and circular arrow were visible and the anchor reached `#signature-runway`;
- the title measured 51.28 px at 641 px, 48 px at 390 px, and 100 px at 1440 px;
- reviewed description and all four supported highlights rendered;
- the complete filled media button was visible;
- Motion Study centered the still-derived animated WebP;
- the only homepage panels were the runway campaign and Signature Hoodie runway;
- the category rail and footer directly followed;
- document width equaled viewport width;
- framework overlay count was zero and console/page error arrays were empty.

Screenshots:

- `feedback-01-landing.png`, `feedback-02-hoodie.png`, `feedback-03-motion.png`, `feedback-04-page-end.png`;
- `mobile-01-landing.png`, `mobile-02-hoodie.png`, `mobile-03-motion.png`, `mobile-04-page-end.png`;
- `desktop-01-landing.png`, `desktop-02-hoodie.png`, `desktop-03-motion.png`, `desktop-04-page-end.png`.

## Deployment boundary

The replacement Vercel Preview and direct deployed verification are pending the tested implementation commit. Production, domains, Shopify data, orders, apps, billing, and canonical `main` were not changed by this local correction.

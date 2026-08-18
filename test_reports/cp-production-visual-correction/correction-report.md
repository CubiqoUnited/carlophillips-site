# CP production visual correction evidence

Date: 2026-07-23

Temporary branch: `codex/restore-production-visual-direction`

Base: `85b62e1b2a7c2bdd8544c8ff543432ce65bc5f2a`

## 1. Scope isolation

The paused Cycle 20 fulfillment-contract draft is not in this diff. It is
recoverably isolated as:

- stash: `stash@{0}`
- object: `ab3f004119ac28547d0ecddb50634a9e9d7806e4`
- message: `paused-cycle-20-fulfillment-contract-draft-2026-07-23`

No provider, Shopify write, deployment, publication, merge, or production
action occurred.

## 2. Source comparison

Read-only Git history establishes:

- `9e1f5c3`: last production-aligned implementation with source sections
  explicitly named VOLLBAK-style. It supplied the quiet fixed navigation,
  full-height split hero, product staging, and restrained type direction.
- `5077e3f`: replaced the 2,411-line product-led home with an approximately
  400-line empty editorial shell and removed related presentation CSS.
- remote `main`: `d172cfb`, carrying the editorial shell.
- active fitness base: `85b62e1`, carrying the same editorial composition plus
  later fail-closed server commerce/release work.

The correction restores the visual language, not the unsafe legacy runtime.
The old mock catalog, invented Unsplash product-media fallbacks, client cart,
checkout redirect, and broad browser-side Shopify helpers remain absent.

## 3. Exact deletion and route list

Deleted:

- `components/editorial/app-shell.jsx`
- `app/about/page.js`
- `app/lookbook/page.js`
- `lib/content/index.js`
- `lib/content/site-content.js`
- `tests/editorial-route-policy.test.js`

Removed from discovery:

- `/about` from the sitemap and robots allow-list
- `/lookbook` from the robots allow-list

Preserved active routes:

- `/`
- `/shop`
- `/collections`
- `/products/[handle]`
- `/bag`
- `/cart`
- `/api/[[...path]]`

Direct browser checks returned the Next.js 404 page for `/about` and
`/lookbook`. `/shop` remained available with the truthful
“No release-eligible products” state and no purchase action.

## 4. Corrected implementation

`app/page.js` still calls the shared server catalog decision and converts it to
the minimized home summary. The new
`components/storefront/home-storefront.jsx` consumes only that summary.

The home now uses:

- the `9e1f5c3` full-height black split composition;
- quiet two-level navigation and restrained typography;
- the Hoodie-first product-led heading;
- a release-derived catalog call to action;
- a release stage whose product link and counts come only from the server
  summary.

The archived drop board is labeled
“Visual-system reference · not product or media proof.” It does not enter the
Product Release Record or Media Registry and cannot make a product visible or
purchasable.

## 5. Branch and deployment evidence

- Canonical remote HEAD resolves to `main`.
- Read-only remote refs observed before the correction:
  - `main`: `d172cfb70e7eb2d2bf0f690b477070656c66ce86`
  - `staging`: `d172cfb70e7eb2d2bf0f690b477070656c66ce86`
  - `fix-signature-hoodie-staging-preview`: `425f50babb18668fa7a12e7bf4ea9d4d99c1b84b`
- Read-only Vercel history showed production sourced from `main`; deployments
  sourced from `staging` and the feature branch were Preview targets.
- The inspected Vercel production, Preview, and historical production URLs
  returned HTTP 402 `DEPLOYMENT_DISABLED`.

Target model:

1. `main` is the only permanent branch.
2. A temporary PR branch produces the Vercel Preview used as staging.
3. Production follows approved `main` only.
4. Temporary branches may be deleted after an approved merge.

No remote ref, Vercel setting, deployment, or alias changed in this task.

## 6. Verification

`yarn verify` passed:

- ESLint: zero warnings
- Vitest: 32 files, 309 tests passed
- production dependency audit: 0 vulnerabilities across 193 packages
- Next.js 15.5.21 production build: passed
- generated routes: 11; `/about` and `/lookbook` absent

Focused correction suite:

- 3 files, 13 tests passed
- home release summary and withheld-payload behavior
- archived-board truth label and no purchase copy
- deleted-route/file invariants
- active runtime isolation from legacy Shopify/cart paths

Browser checks against the production build:

- desktop viewport override: 1440×1000
- mobile viewport override: 390×844 (384 CSS-pixel content width after the
  existing 6-pixel scrollbar)
- no horizontal overflow
- no browser console warnings or errors
- no About/Lookbook navigation
- no “Add to bag” or checkout action
- visual reference label visible

## 7. Visual evidence

- `browser/01-historical-9e1f5c3-desktop.png`: production-aligned source
- `browser/02-editorial-detour-85b62e1-desktop.png`: active detour before correction
- `browser/03-historical-9e1f5c3-mobile.png`: historical mobile source
- `browser/04-editorial-detour-85b62e1-mobile.png`: detour mobile baseline
- `browser/05-corrected-storefront-desktop.png`: corrected desktop candidate
- `browser/06-corrected-storefront-mobile.png`: corrected mobile candidate

The hosted visual comparison could not be performed because Vercel returns
402. The comparison therefore uses locally rendered immutable Git sources and
the locally built correction.

## 8. Safe PR/merge cleanup plan

1. Product Owner reviews the local candidate commit and visual evidence.
2. Only with explicit approval, push this temporary branch.
3. Let Vercel create a Preview from this branch; use that URL as staging and
   repeat the browser gate when account access is restored.
4. Open a focused PR into `main`; do not merge until the Product Owner approves
   the visual and release-boundary evidence.
5. After approved merge and production verification, delete temporary branches
   including any obsolete remote `staging` branch only with explicit approval.
6. Resume Cycle 20 only as a separately scoped task from its isolated stash.

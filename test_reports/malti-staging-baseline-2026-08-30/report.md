# Malti + independent QA baseline — canonical staging

Captured 2026-08-30 against `https://staging.carlophillips.com` with no deployment, push, commit, source edit, form submission, cart mutation, Shopify write, or payment attempt.

## Git baseline

- Initial worktree state was clean: `## codex/staging-production-blockers-20260830...origin/staging`.
- Initial `HEAD`: `7db1898bcfd13e56d12104ec5fcdcb1027d7650b`.
- Local tracking ref `origin/staging`: the same full SHA.
- Read-only `git ls-remote origin refs/heads/staging`: the same full SHA.
- The approved comparison commit `62261ffdf79cc1b2068c25a8456037a8897114e8` is the merge base.
- The unrelated `codex/WTF` worktree remained separate at `/Users/edv/Documents/cp`, commit `aec23e007e3feb9708e2871af49db1500e5b3ff4`, and was not touched.

### Complete 62261ff → 7db1898 inventory

There is one non-merge commit:

```text
7db1898 fix(commerce): specify explicit .js extension for release-policy import
```

It changes exactly two tracked files with two insertions and two deletions:

1. `lib/commerce/product-gateway.js`: changes the import from `./release-policy` to `./release-policy.js`.
2. `test_reports/media-readiness/media-readiness.json`: refreshes only `generatedAt`, from `2026-08-29T14:04:42.077Z` to `2026-08-29T20:09:19.376Z`.

The exact patch is in `approved-62261ff-to-staging-7db1898.diff`.

After this baseline was captured, parallel implementation work appeared in eight source/test files. This report does not attribute or alter those edits, and Prettier was not rerun on them:

```text
lib/commerce/cart-activation-policy.js
lib/commerce/cart-activation-server.js
lib/commerce/shopify-checkout-server.js
scripts/lint-production-commerce.mjs
tests/cart-activation-policy.test.js
tests/checkout-route.test.js
tests/commerce-boundary-policy.test.js
tests/shopify-checkout-server.test.js
```

## Prettier discovery baseline

The repository does not configure Prettier:

- no Prettier dependency in `package.json` or `yarn.lock`;
- no Prettier package script;
- no `.prettierrc`, `.prettierignore`, or `prettier.config.*`;
- `docs/architecture-layout-decision.md` explicitly says Prettier is not a configured gate.

The prescribed Yarn attempt used Yarn Classic 1.22.22 and failed without changing the worktree:

```text
yarn run prettier --list-different .
error Command "prettier" not found.
exit 1
```

The requested npm fallback is unavailable because this runtime has no `npx` executable:

```text
npx --no-install prettier --version
zsh: command not found: npx
exit 127
```

A read-only cached Prettier 3.9.6 executable was then used to establish the exact baseline without installation:

```text
node <cached-prettier>/bin/prettier.cjs --list-different .
exit 1
```

It reports **335 files**, not four. The complete exact list is `prettier-list-different-7db1898.txt`:

| Category | Files |
| --- | ---: |
| JavaScript (`.js`) | 164 |
| JSON (`.json`) | 69 |
| ESM JavaScript (`.mjs`) | 38 |
| JSX (`.jsx`) | 31 |
| Markdown (`.md`) | 26 |
| CSS (`.css`) | 3 |
| TSX (`.tsx`) | 2 |
| TypeScript (`.ts`) | 1 |
| CommonJS (`.cjs`) | 1 |

Formatting categories observed in representative 7db1898 files:

- JavaScript/JSX/TS: default double-quote conversion, print-width wrapping, multiline imports/objects/arrays/function parameters, arrow-parameter parentheses, and JSX child/attribute line breaking.
- JSON: array/object compaction and line wrapping.
- CSS: quote conversion, selector splitting, whitespace cleanup, declaration/value wrapping, and one-line rule expansion.
- Markdown: table alignment and cell-padding normalization.

Because there is no repository Prettier policy, applying Prettier 3.9.6 defaults globally would be a broad 335-file style migration, not a four-file blocker fix. No formatting was performed.

## Exact repository QA command set

Required by `AGENTS.md`, `package.json`, and CI:

```bash
yarn install --frozen-lockfile
yarn verify
```

`yarn verify` expands to:

```bash
yarn lint
yarn verify:media-readiness
yarn test
yarn audit:prod
yarn build
```

`yarn lint` expands to:

```bash
yarn lint:design-system
yarn lint:production-commerce
eslint . --max-warnings=0
```

CI then performs the rendered accessibility/privacy-network gate against the production build:

```bash
yarn playwright install --with-deps chromium
yarn start
yarn test:a11y
```

For a release/deployment candidate, repository policy additionally requires:

```bash
yarn verify:vercel-link --require-link
```

Production checkout release verification is separately invoked with the exact release and SHA:

```bash
node scripts/verify-production-commerce-release.mjs --release <release> --expected-sha <full-sha>
```

The full suite was not run during this baseline because dependencies were absent and parallel source edits began after the clean-state capture. Running it now would test an in-progress shared diff rather than the pristine 7db1898 baseline.

## Live staging headless QA

Evidence was captured in fully headless Google Chrome at desktop 1440×1000 and mobile 390×844. Every route returned HTTP 200. No console error/warning, page error, HTTP error response, or horizontal overflow was observed. Several Next.js RSC link-prefetch requests ended as `net::ERR_ABORTED`; they were client-aborted speculative prefetches, not HTTP failures.

### Product

Route: `/products/carlophillips-signature-hoodie`

- Both widths render `This piece is currently unavailable.`
- There is no product title, variant, price, media, purchase button, add-to-bag button, checkout form, or `/api/checkout` form action.
- Desktop and mobile keep the CTA inside the viewport and do not clip horizontally.
- The mobile heading wraps to three lines versus two on desktop; its scale remains readable, but the entire surface is a dead-end availability state rather than the approved product journey.

### Bag

Route: `/bag`

- Both widths render `SOURCE Unavailable`, `CHECKOUT Disabled`, and `The bag cannot be opened safely.`
- There is no cart or checkout form.
- Desktop uses a two-column diagnostic panel; mobile stacks the same content without overflow.
- `COMMERCE TRUTH`, `VIEW RELEASE STATE`, environment/source fields, and capability-verification language expose internal release-system terminology to customers. This is a high-confidence clarity and conversion problem.
- `RETURN HOME` has materially lower contrast/prominence than the outlined release-state action, prioritizing internal diagnostics over recovery.

### Checkout entry

Route: `/checkout`

- Both widths render `YOUR BAG IS EMPTY` and no form.
- The phrase `Continue to checkout` appears only inside explanatory copy (`Add a product to continue to checkout.`), not as an enabled checkout action.
- Desktop keeps the three progress steps on one row; mobile wraps step 3 to a second row, reducing progress scanability, but there is no overlap or horizontal clipping.
- The empty-state card and `CONTINUE SHOPPING` recovery action are visually consistent at both widths.

### What this proves—and does not prove

This proves that the current public staging domain serves stable HTTP/rendered exception states at both target widths. It does **not** prove live commerce, Shopify product truth, a successful cart, a successful hosted-checkout redirect, payment, POD fulfillment, or that staging is deployed from 7db1898. Public HTML/headers expose no commit SHA, and no authenticated immutable Vercel deployment receipt was available in this read-only pass.

## Screenshot comparison record

The six screenshots were visually inspected in paired desktop/mobile comparisons:

| Surface | Desktop SHA-256 | Mobile SHA-256 | Comparison result |
| --- | --- | --- | --- |
| Product | `b77168ae30a8b0ff3f2d4ed0131c22951b40d46476b71b649bd04337d7115b48` | `52c99e1328f6f2b9ec76f69860f07651fe4cf3a6ee0aa263d4ae36dd0008f9ac` | Same unavailable-state content; responsive heading reflow; no clipping. |
| Bag | `e958543757da9595c3a0dfcc1c2b12782a3ecde50bd6279cb9cee8db523890f5` | `21c2633a26b2b3f345bc3ff8a34b95c74b929cba5d4894bde823af507976216d` | Same disabled-commerce content; two-column → stacked; internal jargon remains prominent. |
| Checkout | `0b18b52689a27b6d7565d1d214d913f053380194b2410453c26be71e375be9db` | `aff55480e9698633a186be662c2763250a56bea5f68b18c0a8a6eae26575ca32` | Same empty-bag content; mobile stepper wraps step 3; recovery CTA remains usable. |

Structured DOM/console/network evidence is in `browser-evidence.json`.

## Baseline blockers

1. Live staging exposes no usable product or bag path, so no checkout success path can be exercised from the customer journey.
2. The direct checkout route only proves an empty-bag recovery state, not Shopify checkout.
3. Staging deployment identity cannot be tied to 7db1898 from unauthenticated public evidence.
4. The claimed four-file Prettier failure is contradicted by the canonical repo: Prettier is not a configured gate and unconfigured Prettier 3.9.6 reports 335 files.
5. A clean full QA run must wait until the parallel source edits settle or be run in a separate pristine 7db1898 worktree with dependencies installed.

No formatting action is authorized or recommended until the root task decides whether to introduce an explicit repository-wide Prettier policy or limit formatting to a named changed-file set.

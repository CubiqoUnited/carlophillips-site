# CARLOPHILLIPS

CARLOPHILLIPS is a Next.js 15 presentation layer intended to use Shopify as the source of truth for product, variant, price, availability, cart, and checkout data, with approved POD providers handling production and fulfillment.

The repository is **not production-ready**. The editorial shell keeps products hidden by default. Home, product, catalog (`/shop` and `/collections`), and bag routes use source-labeled server boundaries: explicit local fixture mode supports layout review, Preview permits only evidence-complete Staged-or-later private review, and production denies every product without a complete Released Product Release Record. Home receives a minimized summary from the same catalog decision, so its featured link and counts cannot bypass catalog policy. A Shopify observation alone never authorizes visibility or commerce. Cart operations and checkout remain inactive. See `STATUS.md` for verified facts and blockers.

## Current product state

- One real Apliiq/Shopify Signature Hoodie POC is documented as Draft with purchasing disabled.
- A prior Shopify audit recorded 12 products with image-only media, but the broader catalog is later reuse/scale input and is not active or release-proven in the current UI.
- The resolved sequence is Signature Hoodie through the complete reusable system first, then a meaningfully different product, then approved catalog expansion.
- Vercel production and preview were last observed returning HTTP 402 `DEPLOYMENT_DISABLED`; local work continues while hosting access is restored.

## Stack

- Next.js 15.5.21 Maintenance LTS App Router and React/React DOM 19.2.8
- Tailwind CSS 3 and Framer Motion
- Shopify Storefront GraphQL modules for product/media/cart operations
- Yarn Classic 1.22.22
- ESLint and Vitest

## Setup

Prerequisites: Node.js 18.18 or newer and Yarn 1.22.22. With a Corepack-enabled Node distribution, run `corepack enable` once.

```bash
yarn --version
yarn install --frozen-lockfile
cp .env.example .env.local
yarn dev
```

Open `http://localhost:3000`. Defaults are fail-closed: no product is visible and no purchase flow is active.

For a local-only review of the Hoodie fixture, select fixture mode, set both flags in `.env.local`, and restart the server:

```bash
COMMERCE_DATA_MODE=fixture
NEXT_PUBLIC_SHOW_PRODUCTS=true
NEXT_PUBLIC_PREVIEW_DRAFT_PRODUCTS=true
```

This exposes a labeled, disabled review page. It does not fetch the Hoodie from Shopify and does not authorize publication or checkout.

## Quality gates

```bash
yarn lint
yarn test
yarn audit:prod
yarn build
```

Run all gates with `yarn verify`; it includes the production-dependency audit. Do not name this script `check`: Yarn Classic reserves `yarn check` for its own dependency-tree command. A clean dependency proof uses `yarn install --frozen-lockfile`; do not add npm or pnpm lockfiles.

## Environment variables

Copy `.env.example` and supply values only in ignored local files or the appropriate Vercel environment. Do not commit real values.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_BASE_URL` | Environment-specific storefront URL |
| `NEXT_PUBLIC_COMMERCE_ENVIRONMENT` | Policy boundary: `local`, `preview`, or `production` |
| `COMMERCE_DATA_MODE` | Server-only data source: `fixture` or `shopify` |
| `NEXT_PUBLIC_SHOW_PRODUCTS` | Top-level product visibility gate |
| `NEXT_PUBLIC_PREVIEW_DRAFT_PRODUCTS` | Secondary static draft-review gate |
| `SHOPIFY_STORE_DOMAIN` | Preferred server-only Shopify Storefront domain |
| `SHOPIFY_STOREFRONT_TOKEN` | Preferred server-only Storefront API token |
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | Shopify Storefront domain |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` | Public Storefront API token; never put the actual value in reports |
| `CORS_ORIGINS` | Exact comma-separated HTTP(S) origins allowed to call `/api` cross-origin; wildcards and paths are rejected |

## Response security

Storefront pages deny third-party framing with both `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'`. Global CORS headers are intentionally absent. API requests without an `Origin` header and same-origin requests remain available; a cross-origin request must exactly match `CORS_ORIGINS` or it receives `403 CORS_ORIGIN_DENIED` before route work. Production adds HSTS only when the deployment environment is explicitly production.

## Repository map

```text
app/                 routes; home, product, catalog, and bag/cart have dedicated server boundaries
components/editorial/ client editorial shell receiving minimized server truth
components/commerce/ reusable, non-buyable product/catalog and truthful bag presentation
contracts/           machine-readable truth and release schemas
releases/            evidence-bound release records and media manifests
lib/config/          release and Shopify configuration
lib/commerce/        provider-neutral product/catalog gateways, policy, and view models
lib/providers/       server-only provider adapters
lib/data/            legacy data service with local-only fixture fallback
lib/shopify/         Storefront queries, mutations, normalization, client
lib/store/           dormant local/Shopify cart module
lib/orchestration/   creation jobs, PipelineRun state, capability policy
lib/releases/        non-mutating release-transition policy and exact blockers
runs/                durable local simulations and blocker/resume evidence
tests/               automated fitness and commerce-contract tests
test_reports/        historical and generated verification evidence
```

Start with `AGENTS.md`, `PRD.md`, `ARCHITECTURE.md`, `STATUS.md`, and `TASKS.md` before making delivery changes.

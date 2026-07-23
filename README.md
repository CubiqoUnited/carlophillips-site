# CARLOPHILLIPS

CARLOPHILLIPS is a Next.js 14 presentation layer intended to use Shopify as the source of truth for product, variant, price, availability, cart, and checkout data, with approved POD providers handling production and fulfillment.

The repository is **not production-ready**. The active UI is currently an editorial shell with products hidden by default. A gated static Signature Hoodie page exists for staging review, while the Shopify commerce modules are not yet wired into the active routes. See `STATUS.md` for verified facts and blockers.

## Current product state

- One real Apliiq/Shopify Signature Hoodie POC is documented as Draft with purchasing disabled.
- A prior Shopify audit recorded 12 products with image-only media, but the broader catalog is not active in the current UI.
- The Product Owner must choose the immediate lane: one-product Hoodie proof or restoration of the 12-product catalog. `PRD.md` presents the tradeoff without making the decision.
- Vercel production and preview were last observed returning HTTP 402 `DEPLOYMENT_DISABLED`; local work continues while hosting access is restored.

## Stack

- Next.js 14.2.3 App Router and React 18
- Tailwind CSS 3 and Framer Motion
- Shopify Storefront GraphQL modules for product/media/cart operations
- Yarn Classic 1.22.22
- ESLint and Vitest

## Setup

Prerequisites: Node.js 18 or newer and Yarn 1.22.22. With a Corepack-enabled Node distribution, run `corepack enable` once.

```bash
yarn --version
yarn install --frozen-lockfile
cp .env.example .env.local
yarn dev
```

Open `http://localhost:3000`. Defaults are fail-closed: no product is visible and no purchase flow is active.

For a local-only review of the static Hoodie fixture, set both flags in `.env.local` and restart the server:

```bash
NEXT_PUBLIC_SHOW_PRODUCTS=true
NEXT_PUBLIC_PREVIEW_DRAFT_PRODUCTS=true
```

This exposes a labeled, disabled review page. It does not fetch the Hoodie from Shopify and does not authorize publication or checkout.

## Quality gates

```bash
yarn lint
yarn test
yarn build
```

Run all gates with `yarn check`. A clean dependency proof uses `yarn install --frozen-lockfile`; do not add npm or pnpm lockfiles.

## Environment variables

Copy `.env.example` and supply values only in ignored local files or the appropriate Vercel environment. Do not commit real values.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_BASE_URL` | Environment-specific storefront URL |
| `NEXT_PUBLIC_SHOW_PRODUCTS` | Top-level product visibility gate |
| `NEXT_PUBLIC_PREVIEW_DRAFT_PRODUCTS` | Secondary static draft-review gate |
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | Shopify Storefront domain |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` | Public Storefront API token; never put the actual value in reports |
| `CORS_ORIGINS` | Allowed API origin for the environment |

## Repository map

```text
app/                 route wrappers and current client shell
lib/config/          release and Shopify configuration
lib/data/            static fixture, mock data, and dormant data service
lib/shopify/         Storefront queries, mutations, normalization, client
lib/store/           dormant local/Shopify cart module
tests/               automated fitness and commerce-contract tests
test_reports/        historical and generated verification evidence
```

Start with `AGENTS.md`, `PRD.md`, `ARCHITECTURE.md`, `STATUS.md`, and `TASKS.md` before making delivery changes.

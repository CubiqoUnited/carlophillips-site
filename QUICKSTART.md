# Local Quick Start

This guide starts the current development shell. It does not make the project live or production-ready.

```bash
yarn install --frozen-lockfile
cp .env.example .env.local
yarn dev
```

Visit `http://localhost:3000`.

## Expected default behavior

- Home/about editorial routes render.
- Shop and collection routes explain that the first drop is not released.
- Product routes show an unreleased state.
- Bag/cart routes show an empty, non-checkout shell.

## Optional static Hoodie review

To review the existing static POC locally, set both values in `.env.local`, restart `yarn dev`, and open `/products/carlophillips-signature-hoodie`:

```bash
NEXT_PUBLIC_SHOW_PRODUCTS=true
NEXT_PUBLIC_PREVIEW_DRAFT_PRODUCTS=true
```

The page remains disabled for purchasing. Its static price, sizes, and media are review content, not proof of current Shopify data.

## Verify before handing off

```bash
yarn lint
yarn test
yarn build
```

Then verify the relevant route at desktop and mobile widths, including browser console and network errors. See `TASKS.md` for the current cycle.

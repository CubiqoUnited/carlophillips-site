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
- Product routes show an explicit unavailable state while visibility is closed.
- Bag/cart routes show an empty, non-checkout shell.

## Optional static Hoodie review

To review the local POC fixture, set these values in `.env.local`, restart `yarn dev`, and open `/products/carlophillips-signature-hoodie`:

```bash
COMMERCE_DATA_MODE=fixture
NEXT_PUBLIC_COMMERCE_ENVIRONMENT=local
NEXT_PUBLIC_SHOW_PRODUCTS=true
NEXT_PUBLIC_PREVIEW_DRAFT_PRODUCTS=true
```

The page remains disabled for purchasing. Its static price, sizes, and media are review content, not proof of current Shopify data.

To exercise the read-only Shopify boundary, use `COMMERCE_DATA_MODE=shopify`. If server-only Shopify configuration or product access is absent, the route intentionally shows “cannot be shown truthfully” and never substitutes the fixture.

## Verify before handing off

```bash
yarn lint
yarn test
yarn build
```

Then verify the relevant route at desktop and mobile widths, including browser console and network errors. See `TASKS.md` for the current cycle.

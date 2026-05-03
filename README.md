# CARLOPHILLIPS Storefront

Next.js storefront for CARLOPHILLIPS with Shopify Storefront API product, cart, and checkout integration.

## Local Setup

1. Install dependencies:

```bash
npm ci
```

2. Create a local env file:

```bash
cp .env.example .env.local
```

3. Fill `.env.local` with non-production Shopify/Vercel values where possible.

4. Run the dev server:

```bash
npm run dev
```

5. Build before handing off:

```bash
npm run build
```

## Vercel

Authenticate and link locally before preview checks:

```bash
npx vercel login
npx vercel link
```

Keep `.vercel/` ignored. Confirm the selected Vercel project before preview or production operations.

## Safety

- Use Shopify dev/test store credentials for local and Vercel preview where possible.
- Do not use production Admin API, payment, fulfillment, or supplier credentials unless explicitly approved.
- Do not submit real orders/payments or trigger supplier fulfillment without explicit approval.

See `AGENTS.md` and the `docs/` readiness files for the full workflow.

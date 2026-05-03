# Environment And Secrets

## Local Development

Use `.env.local` for local values. The repo also currently has `.env`; it is ignored by Git, but `.env.local` is preferred for Next.js conventions.

Use non-production values whenever possible.

## Vercel Preview

Use Shopify dev/test store credentials for preview deployments.

Required preview variables:

- `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN`

Future server-side variables:

- `SHOPIFY_ADMIN_API_ACCESS_TOKEN`
- `SHOPIFY_WEBHOOK_SIGNING_SECRET`
- `REVALIDATION_SECRET`
- `GOOGLE_SHEETS_WEBHOOK_URL`

Required once webhook/revalidation routes are enabled:

- `SHOPIFY_WEBHOOK_SIGNING_SECRET` in Preview and Production.
- `REVALIDATION_SECRET` in Preview and Production.

## Vercel Production

Production variables must use live store values only after approval. Production env changes require approval and a redeploy.

## Secret Rules

- No Admin API, webhook, revalidation, payment, or fulfillment secret may use `NEXT_PUBLIC_`.
- `.env.example` contains variable names only, never real values.
- Store secrets in Vercel or ignored local env files, not GitHub repo files.
- Do not put live Admin API, payment, or fulfillment credentials in Cloud Codex unless absolutely needed and approved.

## Newsletter Storage

Newsletter signups post to `/api/newsletter`. The route can save to MongoDB and optionally forward to a Google Apps Script webhook through `GOOGLE_SHEETS_WEBHOOK_URL`.

Because newsletter submissions contain email addresses and user-agent data, treat the webhook URL as server-side configuration and document any manual Google Sheets/App Script changes in `docs/codex-shared-notes.md`.

# Vercel Environment Setup

The Vercel project is linked locally as:

- Team: `Cubiqo` (`team_Q25fvpJOPiIeoG3hfxtCVkhW`)
- Project: `folderforcpsite` (`prj_xj3rXVLG6FpsRsSeClyawDJzE1CC`)
- Production domain: `www.carlophillips.com`

Preview variables have been configured for branches `qa` and `codex/readiness-checklist` where local values existed. `REVALIDATION_SECRET` and `SHOPIFY_WEBHOOK_SIGNING_SECRET` were generated for those Preview branches.

## Required Variables

Preview should use Shopify dev/test-store values where possible.

Production should use live values only after approval.

| Variable | Environment | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_BASE_URL` | Preview, Production | Public site base URL for metadata and links. |
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | Preview, Production | Storefront domain only. |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` | Preview, Production | Public Storefront API token. |
| `MONGO_URL` | Preview, Production | Server-side. |
| `DB_NAME` | Preview, Production | Server-side. |
| `GOOGLE_SHEETS_WEBHOOK_URL` | Preview, Production if used | Server-side newsletter sink. |
| `SHOPIFY_WEBHOOK_SIGNING_SECRET` | Preview, Production | Server-side only. Required for `/api/shopify/webhooks`. |
| `REVALIDATION_SECRET` | Preview, Production | Server-side only. Required for `/api/revalidate`. |
| `SHOPIFY_ADMIN_API_ACCESS_TOKEN` | Only if Admin API routes are added | Server-side only. Not currently used. |

Still missing until a deployed Google Apps Script web app URL is available:

- `GOOGLE_SHEETS_WEBHOOK_URL`

## CLI Commands

Use `vercel env add <NAME> preview` and `vercel env add <NAME> production`.

Do not paste production payment, fulfillment, or Admin API secrets unless the exact use is approved.

After env changes:

```bash
vercel env ls
vercel --prod
```

Production deployment still requires explicit approval.

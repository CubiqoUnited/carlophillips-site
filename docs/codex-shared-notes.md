# Codex Shared Notes

Use this file for handoffs, manual QA notes, and any browser/admin actions taken during readiness work.

## Current Readiness Pass - 2026-05-03

- Branch: `qa`.
- GitHub remote: `https://github.com/CubiqoUnited/carlophillips-site.git`.
- Local Vercel link: `.vercel/project.json` created for Vercel project `folderforcpsite` (`prj_xj3rXVLG6FpsRsSeClyawDJzE1CC`) in team `Cubiqo` (`team_Q25fvpJOPiIeoG3hfxtCVkhW`). The project has domain `www.carlophillips.com`.
- Vercel CLI: authenticated locally as `aditya-7307`; `vercel project ls` sees `folderforcpsite`.
- Vercel preview: latest QA deployment `dpl_GkXhBAhiVPu5v7rEGjERZHGi9ymN` is Ready at `https://folderforcpsite-5uh80g0ks-cubiqo-projects-d7156840.vercel.app`; `vercel curl / --deployment folderforcpsite-5uh80g0ks-cubiqo-projects-d7156840.vercel.app` can access protected preview content.
- Vercel env audit: `vercel env ls` reports no environment variables configured for `folderforcpsite`; add Shopify/Mongo/newsletter vars in Vercel before relying on preview/production runtime integrations.
- Vercel env setup checklist added at `docs/vercel-env-setup.md`; no local secret values were transmitted to Vercel in this pass.
- GitHub branch protection API: still blocked with `403` because GitHub requires Pro or a public repo for branch protection on this private repository.
- Env file present locally: `.env`; `.env.local` was created from it for Next.js local development. Keep both ignored.
- Storefront integration present: Shopify Storefront API products, collections, cart operations, checkout URL redirect.
- Webhook/revalidation integration: implemented with `POST /api/shopify/webhooks` and protected `GET|POST /api/revalidate`; Vercel still needs `SHOPIFY_WEBHOOK_SIGNING_SECRET` and `REVALIDATION_SECRET` values configured before use.
- Admin API integration: not implemented yet.
- Newsletter storage: `/api/newsletter` saves to MongoDB and optionally forwards to `GOOGLE_SHEETS_WEBHOOK_URL`; `scripts/google-sheets-newsletter-webhook.js` contains the matching Google Apps Script template with placeholder IDs only.
- Manual browser/admin changes made in this pass: none.
- Browser QA performed against `http://127.0.0.1:3102`, then the dev server was restarted at `http://127.0.0.1:3103` after a stale `.next` dev chunk error caused by running a production build while the dev server was active.
- Browser console errors/warnings during tested storefront flows: none observed.
- Storefront smoke: homepage loaded, product list loaded from Shopify, product detail displayed images/variants/pricing, add-to-cart created a Shopify Storefront cart, quantity update worked, remove item returned cart to empty state.
- Checkout safety: checkout button was visible but not clicked; no checkout redirect, payment, order placement, or fulfillment was triggered.
- Responsive note: narrow mobile header overlap was found and fixed by using compact mobile brand text and hiding the mobile brand switcher on very narrow widths.
- Current local dev URL after restart: `http://127.0.0.1:3103`.
- Real order/payment/fulfillment actions taken in this pass: none.

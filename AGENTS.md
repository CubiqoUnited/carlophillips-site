# Agent Operating Notes

This repository is a Next.js storefront with Shopify Storefront API integration. Treat Shopify, payment, fulfillment, and vendor-admin actions as high-risk.

## Required Safety Rules

- Never submit real orders or payments unless the user explicitly approves the exact action.
- Never trigger real Apliiq, Printify, or other supplier fulfillment unless explicitly approved.
- Never change Shopify live products, inventory, themes, apps, payment settings, shipping settings, or production webhooks without approval.
- Use a Shopify dev/test store and Shopify test payment/Bogus Gateway for QA whenever possible.
- Keep Admin API, webhook, payment, fulfillment, and supplier credentials server-side only. No secret may use `NEXT_PUBLIC_`.
- Store secrets in Vercel or local ignored env files, not in Git.
- Document any manual browser/admin changes made during QA in `docs/codex-shared-notes.md`.

## Expected Workflow

1. Create a feature branch for code changes.
2. Read `docs/codex-shared-notes.md` and the relevant readiness docs before changing Shopify/Vercel integration behavior.
3. Make code-only changes unless browser/admin work is specifically requested and approved.
4. Run the available checks before completion. At minimum run `npm run build`; run lint/typecheck/test scripts if they are added later.
5. Open a PR and use the Vercel preview for browser QA.
6. Do not merge or deploy production without user approval.

## Local Status Notes

- The local repo currently has no `.vercel/project.json`; link with `vercel link` before relying on Vercel project state.
- The app currently uses Shopify Storefront API for product data/cart/checkout redirects. Admin API and webhook revalidation are not implemented yet.
- `.env.local` should be used locally. Existing `.env` files are ignored by Git and should be migrated to `.env.local` when convenient.

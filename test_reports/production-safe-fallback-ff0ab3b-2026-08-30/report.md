# Production-mode safe-fallback verification

- Captured: `2026-08-30T10:36:41.505Z`
- Git commit metadata: `ff0ab3b8bd8bd50339fb4437207754d93d1f0cd0`
- Deployment: `dpl_H62KvG3eV9MtyZCbYTAMAoL1vRt5`
- Immutable URL: `https://carlophillips-site-fwu227m0p-cubiqo-projects-d7156840.vercel.app`
- Artifact kind: `safe-fallback`
- Build environment: `production`
- Cart UI enabled: `false`
- Checkout enabled: `false`
- Vercel state: `READY`

## Result

The fallback was built from the tracked tree at the canonical staging commit. The worktree had untracked QA outputs, dependencies, and pulled Vercel settings; those did not alter the tracked source commit. No CARLOPHILLIPS customer domain was assigned to this deployment.

Desktop and mobile home and product routes returned HTTP 200 with no console errors, page errors, request failures, framework overlay, or horizontal overflow. The home retained the approved campaign hero and both video controls while the product was visibly unavailable. The product route displayed `This piece is currently unavailable.`

An exact same-origin POST to `/api/checkout` with an approved Medium reference returned HTTP 409 with `PRODUCT_RELEASE_NOT_RELEASED`. No Shopify cart, customer, payment, or order was created.

Before and after fallback deployment, `www.carlophillips.com` resolved to existing Production deployment `dpl_6D6ekBNhZLJwvcMZxCzUoZLQ2mzr` at commit `1b5c6ceb01699d622be1f4ade3ce172d4404991a`. The fallback therefore proves a deployable, checkout-disabled withdrawal target without altering the customer-facing Production domain.

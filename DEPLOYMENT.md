# Deployment and Environment Policy

No deployment action is authorized by this document. It records the safe path and current blockers.

## Environments

| Environment | Source | Purpose | Required policy |
|---|---|---|---|
| Local | temporary feature branch | implementation and local evidence | fail closed by default; secrets only in ignored `.env.local` |
| Vercel Preview | pull-request branch | private staging and review | environment-scoped values; no production aliases; no Shopify writes |
| Production | approved `main` | customer storefront | explicit Product Owner approval and all commerce/operations gates proven |

The canonical repository is `https://github.com/CubiqoUnited/carlophillips-site.git`. `main` is production intent. Feature branches must be temporary and reviewed through pull requests; do not merge or promote without approval.

## Required pre-deployment evidence

```bash
yarn install --frozen-lockfile
yarn lint
yarn test
yarn build
```

Also require:

- clean or fully explained Git diff;
- no tracked environment files or secret values;
- release gates appropriate to the target environment;
- desktop/mobile browser, console, and network evidence;
- explicit product/media provenance;
- a rollback point and reviewer approval.

## Current Vercel blocker

Project: `carlophillips-site`.

Production and the Hoodie preview were diagnosed on 2026-07-22 as HTTP 402 with `x-vercel-error: DEPLOYMENT_DISABLED`. A deployment may exist in Vercel while public HTTP remains disabled.

Human action: an authorized Vercel account owner must restore deployment access or explicitly choose another hosting path.

Exact resume point:

1. Deploy the approved feature branch as a Preview only.
2. Configure Preview environment variables without exposing their values.
3. Keep draft review and purchasing fail-closed except for the specifically approved test.
4. Verify Preview HTTP, desktop/mobile rendering, console, network, and the selected Shopify boundary.
5. Record evidence in `test_reports/` and update `STATUS.md`.

Do not attach production aliases, merge to `main`, or promote the preview as part of that resume step.

## Production gates

Production cannot be described as ready until directly proven:

- `www.carlophillips.com` serves the approved commit;
- product, variants, prices, availability, and media match Shopify;
- a controlled approved checkout proves payment and order creation;
- the correct POD provider receives the correct order mapping;
- fulfillment, tracking, support, and returns are exercised;
- monitoring and rollback ownership are documented.

Shopify writes, product activation, paid services, test orders with external impact, `main` merges, and production promotion each require explicit Product Owner approval.

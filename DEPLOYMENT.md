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

## Verified Vercel target and current release boundary

Read-only inspection on 2026-08-14 supersedes the historical 2026-07-22 HTTP 402 diagnosis. The production target is team `aditya's projects` (`team_8ABMxicIAtMyzgNYsJawFad0`), project `carlophillips-site` (`prj_9VHD0AhhQnuml8frfNDsmFLHXcq1`). `www.carlophillips.com` was observed on deployment `dpl_2s61reh2JATSRMCYfXYHnFnXT2bH`, commit `bb9568f46bd60b587f3fc16b82513ae5ea220026`.

A separate same-named Cubiqo-team project is not the live-domain target. Before any Vercel command capable of deployment, run `yarn verify:vercel-link --require-link`; it aborts unless ignored local linkage matches the exact verified organization and project IDs.

PR #9 was observed open and mergeable with a READY Preview for head `f82733c`, but neither status grants merge or Production authority. Resume at exact-commit cross-functional Preview QA and Product Owner review. Do not attach production aliases, merge, or promote without the explicit approval and gates in `docs/production-closure-brief.md`.

## Production gates

Production cannot be described as ready until directly proven:

- `www.carlophillips.com` serves the approved commit;
- product, variants, prices, availability, and media match Shopify;
- a controlled approved checkout proves payment and order creation;
- the correct POD provider receives the correct order mapping;
- fulfillment, tracking, support, and returns are exercised;
- monitoring and rollback ownership are documented.

Shopify writes, product activation, paid services, test orders with external impact, `main` merges, and production promotion each require explicit Product Owner approval.

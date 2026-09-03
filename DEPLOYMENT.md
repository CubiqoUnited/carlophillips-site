# Deployment and Environment Policy

No deployment action is authorized by this document. It records the safe path and current blockers.

## Environments

| Environment       | Source                          | Purpose                                                                | Required policy                                                          |
| ----------------- | ------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Local             | temporary feature branch        | implementation and local evidence                                      | fail closed by default; secrets only in ignored `.env.local`             |
| Vercel Preview    | pull-request branch             | private review                                                         | environment-scoped values; no Production aliases                         |
| Protected Staging | exact reviewed `main` merge SHA | isolated Shopify development-store test order and Product Owner review | test payment only; separate webhooks/records; signed PII-free receipt    |
| Production        | approved `main`                 | customer storefront                                                    | explicit Product Owner approval and all commerce/operations gates proven |

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

## Canonical Vercel target and current release boundary

The canonical target is Cubiqo team `team_Q25fvpJOPiIeoG3hfxtCVkhW`, project
`prj_9VHD0AhhQnuml8frfNDsmFLHXcq1`, scope
`cubiqo-projects-d7156840`. A same-named project is never an acceptable
substitute.

Protected Staging run `33733157896` for PR #67 at
`3bff804b1a55691a38e9406eb1f97d21b5b21a3c` failed before build/deploy because
its environment-scoped token could not access that canonical account. No
deployment, alias, webhook, test order or receipt resulted. See the top of
`reports/HUMAN_INTERVENTION_STICKY_RED.md`; Production and cleanup remain
locked.

The full release sequence and exact receipt inputs are in `docs/cicd.md`.

## Production gates

Production cannot be described as ready until directly proven:

- `www.carlophillips.com` serves the approved commit;
- product, variants, prices, availability, and media match Shopify;
- a protected isolated Staging checkout proves test payment, order creation,
  branded confirmation, order status, cancellation/refund and restock;
- signed lifecycle events and durable duplicate suppression are bound to the
  exact release SHA;
- Production candidate and last checkout-enabled rollback identities are
  verified before promotion;
- monitoring and rollback ownership are documented.

Shopify writes, product activation, paid services, test orders with external impact, `main` merges, and production promotion each require explicit Product Owner approval.

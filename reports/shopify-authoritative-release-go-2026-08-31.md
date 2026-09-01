# Shopify-authoritative release implementation

Date: 2026-08-31

Branch: `codex/shopify-authoritative-release-go`

Baseline: `origin/main@e31eb59`

## Implemented

- Preserved `WorkbookReplica` and `HeroMorphPreview` as the custom landing/hero UI.
- Removed the inactive 1,000-line legacy homepage commerce simulation.
- Made Shopify Storefront API authoritative for catalog discovery, PDP title/description, price/currency, media order, current variants, availability, and structured product metafields.
- Removed active Product Release Record, product-offer size allowlist, synthetic size, stale fingerprint, and agent-authorization runtime gates.
- Added persistent Shopify cart read/create/add/update/remove and hosted `checkoutUrl` handoff with an HttpOnly cart cookie.
- Pinned reads and mutations to Storefront API `2026-07` and reject responses executed on any other version.
- Added signed webhook ingress with replay protection and mandatory durable idempotency for order/payment/fulfillment/refund/cancellation observations.
- Removed the duplicate one-shot `/api/checkout` route and unreachable shipped policy modules.
- Enforced a source boundary: shipped `apps/web/src` cannot import the root tooling `lib/` tree.
- Split verification into shipped, tooling, and contract categories.

## Verification

- `yarn verify`: passed.
- Shipped: 14 files / 60 tests passed.
- Tooling: 45 files / 497 tests passed.
- Contracts: 15 files / 80 tests passed.
- Storybook and Next.js production builds: passed.
- Production dependency audit: 0 vulnerabilities.
- Playwright: 20/20 desktop/mobile checks passed, including WCAG A/AA, browser health, local fail-closed PDP/cart, origin rejection, member, privacy, and screenshots.

## Visual result

- Custom hero component, morph sequence, typography, spacing, header, bag control, and black runway composition remain in place.
- No design-system or stylesheet replacement was made.
- Intentional content changes are limited to Shopify-authoritative product text/media/variants and truthful empty/unavailable states.
- Local screenshot evidence is in `test_reports/shopify-authoritative-release-go/playwright-rerun/`.

## External release blockers

Pull request [#54](https://github.com/CubiqoUnited/carlophillips-site/pull/54)
is open at `dbd4eae6cfe3027536c5223146817cc2c3813528`. Repository verification,
checkout E2E/accessibility, and the Vercel build check pass.

The automatic PR Preview is `READY`, but it belongs to the Git-integrated
`aditya's projects` Vercel project (`prj_i51hiKpEKrwaqblD2vaO6zhXUDCs`),
which has no Preview or Production environment variables. The public domains
currently resolve through the separate Cubiqo project
(`prj_9VHD0AhhQnuml8frfNDsmFLHXcq1`). Therefore the automatic Preview is valid
build evidence, not a Shopify Staging deployment.

Staging deployment is intentionally withheld until the Product Owner/platform
owner chooses one canonical Vercel project, the Git integration and domains are
aligned to it, and dedicated Shopify test-store variables plus the durable
webhook store exist there. Exact actions and risks are recorded in
`reports/HUMAN_INTERVENTION_STICKY_RED.md` under
“SHOPIFY-AUTHORITATIVE STAGING ENVIRONMENT AND WEBHOOK DELIVERY.”

Production promotion remains separately gated by immutable Staging evidence and an explicit Product Owner decision.

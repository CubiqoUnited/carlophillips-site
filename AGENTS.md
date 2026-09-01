# CARLOPHILLIPS Repository Rules

## Current customer-ready delivery authority — 2026-08-30

- Boss grants Sushma continuing project authority to complete the active
  CARLOPHILLIPS customer-ready remediation without requesting repeated routine
  confirmations. This includes the exact S/M/L Shopify observation and approval
  rebinding, sanitized no-order checkout-handoff proof, temporary branch/PR,
  canonical Preview, Pushpa Product Owner review, merge, Production deployment,
  verification, rollback on failed verification, and temporary-branch cleanup.
- This project authority applies to Claude and Codex agents and remains valid
  until Aditya Vyas explicitly revokes or replaces it.
- Shopify Admin is the business source of truth for the live product, variants,
  price, inventory, availability, cart, and hosted checkout. The current approved
  offer is the Signature Hoodie in S/M/L at USD 128.
- Product Owner decisions govern product scope and launch requirements. Agents
  must not invent sample, inspection, draft, approval, media-manifest, variant,
  price, inventory, or release gates that the Product Owner did not request.
- Shopify Admin is the sole runtime commerce authority. Customer-facing routes,
  media, variant visibility, cart creation, and hosted checkout must use a fresh
  Shopify read and must not be blocked by a code-level Product Release Record,
  fingerprint, sample status, approval JSON, or agent-authored allowlist.
- Product Release Records may remain as deployment audit and rollback evidence,
  but they are non-runtime records and never override current Shopify ACTIVE,
  price, inventory, availability, media, cart, or checkout state.
- This standing project authority never permits submitting or exposing customer
  data, following or retaining a private checkout URL during QA, submitting
  payment or an order, invoking fulfillment, ordering a physical sample,
  accepting paid-plan charges or third-party legal terms, weakening generic
  same-origin/trusted-host security, printing secrets, or visibly taking over the
  user's screen. Those boundaries remain hard stops.

## Source of truth

- Canonical repository: `https://github.com/CubiqoUnited/carlophillips-site.git`.
- `main` is the production-intent branch. Feature work uses temporary branches and pull requests.
- **Branch Lifecycle Governance:** Only `main` (Production) and `staging` (Staging) may persist as long-lived branches on `origin`. Any temporary working/task branch created by an agent (e.g. `codex/*`, `copilot/*`, `feature/*`, `cp-staging-*`) MUST be deleted immediately after its pull request or changes are merged into `main` or `staging`. No unmerged, stale, or abandoned feature branches may be left on remote.
- Current product requirements live in `PRD.md`; architecture lives in `ARCHITECTURE.md`; execution state lives in `STATUS.md` and `TASKS.md`.
- Shopify is the intended source of truth for products, variants, prices, availability, cart, and checkout. Static or mock data must be visibly identified and must never be presented as proof of live commerce.
only 1-2 original pod image - rest AI generated acceptable
- Product Release Records are optional non-runtime audit/rollback evidence. Their
  state, fingerprints, approvals, media bindings, and sample fields must not gate
  the public storefront, cart, or checkout.
- Canonical commerce facts include every Shopify-sourced customer copy field used by the storefront: title, description, vendor, product type, tagline, and details. Release views are whitelist-derived from the validated observation; outer adapter fields and `descriptionHtml` are never presentation authority.
- Customer-visible system status derives from current Shopify state and the
  environment. No release-record fallback may contradict current Shopify truth.
all look and feel, UI, theme shape size font color and assets for componenets, all run by design system and hardcoded values in staging or production, every thing via tokens and componenets

## Safety


- Do not promote production without Product Owner approval in staging - and only one staging 
- staqging and production needs be same always, when a change request is submitted - agent makes the change and PO approve in the cannonical staging and then the change is deployed in production 
- Never print, document, or commit secret values. Store local values only in ignored environment files.
- Do not claim production readiness until the live domain, Shopify checkout, payment, POD fulfillment, tracking, support, and returns are directly verified.
- Do not invent video, spin, 3D, AR, on-model, or lifestyle evidence. Render only media backed by real approved assets.
the production payment shoud be enabled at all times fromn checkout to payment AND the staging will mimic the production checkout to payment - but the actual paym,ent only possible in production
## Tooling and verification

- Use Yarn Classic 1.22.22, as declared by `package.json` and locked by `yarn.lock`. Do not add npm or pnpm lockfiles.
- Install with `yarn install --frozen-lockfile` and verify with `yarn lint`, `yarn test`, and `yarn build`.
- For UI changes, verify the relevant route at desktop and mobile widths and capture browser/console evidence under `test_reports/`.
- Update `STATUS.md` and `TASKS.md` when a material gate changes. Record external blockers with the exact human action and resume point.

## Environment boundaries

- Local development is disposable and may use a gated static fixture for review, but it must be labeled as such.
- Vercel Preview is the canonical web staging target. Its checkout must connect
  to a dedicated Shopify staging/development store using test payments; it must
  never enable test mode on the Production Shopify store.
- Production is `www.carlophillips.com` from approved `main` changes only. Production actions remain blocked until explicitly authorized and verified.

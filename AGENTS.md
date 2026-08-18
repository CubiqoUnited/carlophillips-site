# CARLOPHILLIPS Repository Rules

## Source of truth

- Canonical repository: `https://github.com/CubiqoUnited/carlophillips-site.git`.
- `main` is the production-intent branch. Feature work uses temporary branches and pull requests.
- Current product requirements live in `PRD.md`; architecture lives in `ARCHITECTURE.md`; execution state lives in `STATUS.md` and `TASKS.md`.
- Shopify is the intended source of truth for products, variants, prices, availability, cart, and checkout. Static or mock data must be visibly identified and must never be presented as proof of live commerce.
only 1-2 original pod image - rest AI generated acceptable
- A versioned Product Release Record binds product/POD truth, media truth, Shopify truth, approvals, candidate build evidence, and rollback for each candidate.
- Product Release Records advance only through Draft → Staged → Approved → Released. Staging requires immutable build/staging and rollback-plan evidence; approval additionally requires complete truth and approvals; release additionally requires an ACTIVE Shopify observation and verified rollback path.
- Product observations keep variant identity, canonical commerce facts, and the immutable full review envelope as separate fingerprints. Preview/production compare current identity and facts to reviewed release bindings; the full fingerprint remains exact approval/audit evidence because legitimate fresh reads have new timestamps.
- Canonical commerce facts include every Shopify-sourced customer copy field used by the storefront: title, description, vendor, product type, tagline, and details. Release views are whitelist-derived from the validated observation; outer adapter fields and `descriptionHtml` are never presentation authority.
- System status copy derives from the release decision and environment. Preview is private review; a Released production decision says facts are released while cart/checkout remain separately disabled. No outer story/status text or generic “pending approval” fallback may contradict that state.
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
- Vercel preview is the only staging target currently defined; it is not production and must keep draft product and checkout gates explicit.
- Production is `www.carlophillips.com` from approved `main` changes only. Production actions remain blocked until explicitly authorized and verified.

# CARLOPHILLIPS Repository Rules

## Source of truth

- Canonical repository: `https://github.com/CubiqoUnited/carlophillips-site.git`.
- `main` is the production-intent branch. Feature work uses temporary branches and pull requests.
- Current product requirements live in `PRD.md`; architecture lives in `ARCHITECTURE.md`; execution state lives in `STATUS.md` and `TASKS.md`.
- Shopify is the intended source of truth for products, variants, prices, availability, cart, and checkout. Static or mock data must be visibly identified and must never be presented as proof of live commerce.

## Safety

- Keep products and purchasing fail-closed unless their release gates are explicitly enabled in the intended environment.
- Do not publish Shopify products, alter catalog/order data, enable sales channels, purchase services, accept plans, merge to `main`, or promote production without Product Owner approval.
- Never print, document, or commit secret values. Store local values only in ignored environment files.
- Do not claim production readiness until the live domain, Shopify checkout, payment, POD fulfillment, tracking, support, and returns are directly verified.
- Do not invent video, spin, 3D, AR, on-model, or lifestyle evidence. Render only media backed by real approved assets.

## Tooling and verification

- Use Yarn Classic 1.22.22, as declared by `package.json` and locked by `yarn.lock`. Do not add npm or pnpm lockfiles.
- Install with `yarn install --frozen-lockfile` and verify with `yarn lint`, `yarn test`, and `yarn build`.
- For UI changes, verify the relevant route at desktop and mobile widths and capture browser/console evidence under `test_reports/`.
- Update `STATUS.md` and `TASKS.md` when a material gate changes. Record external blockers with the exact human action and resume point.

## Environment boundaries

- Local development is disposable and may use a gated static fixture for review, but it must be labeled as such.
- Vercel preview is the only staging target currently defined; it is not production and must keep draft product and checkout gates explicit.
- Production is `www.carlophillips.com` from approved `main` changes only. Production actions remain blocked until explicitly authorized and verified.

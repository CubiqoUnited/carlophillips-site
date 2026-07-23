# CARLOPHILLIPS Repository Rules

## Source of truth

- Canonical repository: `https://github.com/CubiqoUnited/carlophillips-site.git`.
- `main` is the production-intent branch. Feature work uses temporary branches and pull requests.
- Current product requirements live in `PRD.md`; architecture lives in `ARCHITECTURE.md`; execution state lives in `STATUS.md` and `TASKS.md`.
- Shopify is the intended source of truth for products, variants, prices, availability, cart, and checkout. Static or mock data must be visibly identified and must never be presented as proof of live commerce.
- The Signature Hoodie is the first end-to-end POC for a reusable POD-to-publish system, not the final product scope or a static-page objective.
- A versioned Product Release Record binds product/POD truth, media truth, Shopify truth, approvals, candidate build evidence, and rollback for each candidate.
- Product Release Records advance only through Draft → Staged → Approved → Released. Staging requires immutable build/staging and rollback-plan evidence; approval additionally requires complete truth and approvals; release additionally requires an ACTIVE Shopify observation and verified rollback path.
- Product observations keep variant identity, canonical commerce facts, and the immutable full review envelope as separate fingerprints. Preview/production compare current identity and facts to reviewed release bindings; the full fingerprint remains exact approval/audit evidence because legitimate fresh reads have new timestamps.
- Canonical commerce facts include every Shopify-sourced customer copy field used by the storefront: title, description, vendor, product type, tagline, and details. Release views are whitelist-derived from the validated observation; outer adapter fields and `descriptionHtml` are never presentation authority.
- System status copy derives from the release decision and environment. Preview is private review; a Released production decision says facts are released while cart/checkout remain separately disabled. No outer story/status text or generic “pending approval” fallback may contradict that state.
- Shopify option presentation is a disabled, review-only projection of canonical observed combinations. It binds the current/release variant fingerprint and currency, preserves exact dimensions/availability/price, and carries only opaque hashes. Those hashes never grant cart mutation authority; a separately evidenced server-only resolver is an independent activation gate.
- Variant-resolution readiness re-derives the current canonical observation from server-ephemeral raw references and proves one-to-one hash coverage without returning a raw ID. Registry surface `local` means the resolver implementation is locally verified; decision surface `server_only` means raw inputs and runtime evaluation never cross the server boundary. Readiness authorizes no selection, cart mutation, checkout, or order.
- Shopify media may reach the PDP only through an approved Media Registry asset whose hashed storefront binding covers current identity, type, canonical URL, and preview facts. Preview may show a truthful partial approved set; production must cover every non-waived modality and required fallback.
- Designer-led and trend-led inputs use the same ProductCreationJob and PipelineRun truth core. Inputs are candidate evidence only; trend signals are research-only and cannot become product/media/commerce truth or publication authority.
- Every ProductCreationJob binds a validated ProductBrief. The job records on-demand/scheduled cadence and deterministic duplicate suppression; the brief owns attributed source provenance/freshness, binding brand constraints, and inspiration-only reference rules. A schedule is not authority to invoke external research or any restricted action.

## Safety

- Keep products and purchasing fail-closed unless their release gates are explicitly enabled in the intended environment.
- Do not publish Shopify products, alter catalog/order data, enable sales channels, purchase services, accept plans, merge to `main`, or promote production without Product Owner approval.
- Do not invoke external product, media, research, or orchestration tools without approval for the exact access, cost/credit, and side-effect boundary. Keep every output Draft-only until its truth and release gates pass.
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

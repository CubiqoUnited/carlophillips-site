# CP Fitness Cycle 6 Evidence Package

## 1. Objective completed and commit

The storefront and API response policy was changed from permissive framing and wildcard CORS to a tested fail-closed policy. Same-origin local behavior, exact configured cross-origin behavior, denied-origin behavior, and desktop/mobile commerce truth were verified. The local cycle commit is reported by Git at handoff.

## 2. Exact files changed

- Runtime policy: `next.config.js`, `lib/http/cors-policy.js`, `app/api/[[...path]]/route.js`.
- Tests: `tests/security-policy.test.js`.
- Configuration/governance: `.env.example`, `README.md`, `STATUS.md`, `TASKS.md`, `docs/shopify-capability-access-audit.md`, `docs/status/CURRENT_STATUS.md`, `docs/status/HUMAN_BLOCKERS.md`, `docs/status/NEXT_ACTIONS.md`.
- Pipeline evidence: `config/capability-registry.json`, `runs/cp-hoodie-local-sim-001/run.json`.
- Cycle evidence: `test_reports/cp-fitness-cycle-6/*`.

## 3. Tests, commands, and machine-readable artifacts

- Focused security policy tests: 10 passed, including early denial for unlisted GET, POST, and DELETE requests.
- Live HTTP: page `200` with framing denied and no framework header; exact configured cross-origin GET `200`; same-origin GET `200` without a cross-origin grant; denied origin `403`; allowed preflight `204`.
- Browser: home, Hoodie desktop/mobile, and bag passed with no error overlays or console/page errors. Purchasing and checkout remain disabled; mobile has no horizontal overflow.
- Full `yarn verify`: zero-warning lint, 18 files/95 tests, zero production advisories across 193 packages, and successful Next.js 15.5.21 build with 13 routes.

## 4. Exists / Partial / Proposed / Missing changes

- Exists: anti-framing policy, MIME-sniffing protection, strict-origin referrer policy, sensitive-capability opt-outs, hidden framework header, exact-origin API CORS, and production-only HSTS configuration.
- Partial: CSP currently enforces `frame-ancestors` only. A full nonce/hash-based script/style policy requires a separate compatibility cycle.
- Proposed: reusable designer-led and trend-led job contracts converging on the same release/media/commerce truth.
- Missing: live Preview/production header observation, live Shopify app audit beyond login, Shopify-backed PDP/cart, and operational proof.

## 5. Failures and contradictory evidence

- The first live same-origin probe returned `403` because Next dev normalized `request.url` to `0.0.0.0` while the browser-facing Host was `localhost`. The policy now derives same-origin identity from the Host header and protocol; focused and live regression pass.
- The browser-verification skill's expected `agent-browser` executable is unavailable. Equivalent Playwright checks were run with exact viewports and saved evidence.
- The prior Shopify OTP tab did not persist across the task-continuation boundary. A fresh Shopify login tab is open; no account was selected and no new OTP was requested.
- HSTS is unit/configuration-proven but cannot be live-observed until an explicitly production environment is available. Production remains blocked.

## 6. Human/external blockers and exact resume points

- Shopify: in the current login tab choose **Continue with Google**, select the existing account, and enter the one-time code if prompted. Resume at installed-app inventory; do not share the code or change Shopify state.
- Vercel 402: authorized owner restores access. Resume at Preview-only deployment and header/browser verification.
- Storefront values: authorized owner supplies scoped read-only values in an ignored environment. Resume at Shopify-backed product observation.
- Writes, spend, samples, publish, orders, fulfillment, merge, and production remain separately approval-gated.

## 7. Product Owner decisions required

No product-scope decision is required. The Signature Hoodie remains the first complete reusable-system journey. Human action is required only for Shopify authentication and separately authorized credential, cost, write, publish, deployment, or production boundaries.

## 8. Rollback and next bounded cycle

Rollback is a normal revert of this cycle commit. No external system was mutated. Next local cycle: implement designer-led and trend-led job/brief contracts and simulate both paths through the same Product Release Record, Media Registry, Commerce Gateway, and PipelineRun approval core.

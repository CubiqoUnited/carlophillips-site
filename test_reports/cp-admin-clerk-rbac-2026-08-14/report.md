# Product Owner admin identity QA

Date: 2026-08-14
Candidate: isolated working tree on `codex/cp-admin-theme-tokens` after `f737716`
Disposition: **NO-GO for Preview/Production until Clerk is provisioned and real-session QA passes**

## Implemented boundary

- Clerk middleware is scoped only to `/admin/*` and `/api/admin/*`.
- Remote access is considered only on Vercel Preview or Production.
- All three configured inputs are mandatory: Clerk publishable key, server secret key, and one immutable Clerk `user_...` Product Owner subject.
- Missing configuration/session, a different authenticated user, and non-Vercel remote surfaces fail closed.
- Local reviewer/Product Owner bearer QA remains local-only and preserves Theme concealment from reviewers.
- Remote Theme saving remains disabled. The existing Save action creates only a local uncommitted `theme.json` proposal and creates no commit, PR, Preview, publication, or Production change.

## Automated verification

- `yarn verify`: passed.
- ESLint: zero warnings.
- Vitest: 39/39 files and 376/376 tests passed.
- Production dependency audit: zero vulnerabilities.
- Next.js optimized build: passed with dynamic admin and sign-in routes plus admin-only middleware.
- Headless Chromium RBAC/regression QA: 462/462 findings passed; 62 screenshots.
- Allow/deny captures cover 1440×1000, 1024×768, and 390×844. Inspected captures show the full Product Owner Theme UI and indistinguishable 404 states for unauthenticated/reviewer access without Theme vocabulary.
- A simulated unconfigured Vercel Preview returns the same indistinguishable 404 for `/admin/theme` and `/admin/sign-in` at all three viewport sizes.
- Same-origin unchanged Theme POST, bad-origin denial, accessibility, console, request-failure, overflow, raw-ID, checkout-denial, and public-navigation checks passed.

## Public parity

The working tree and `f737716` were rebuilt with the same local fixture flags and compared at desktop/mobile for home, shop, Signature Hoodie PDP, and bag.

- 8/8 route/viewport pairs passed.
- 16 public parity screenshots were captured: baseline and candidate for each pair.
- DOM structure, text, element count, governed theme bridge, body styles, key rectangles, and overflow state all match.
- No pixel changed above channel threshold 8. Home, shop, and bag are exact zero-delta; PDP mean absolute channel deltas are 0.0132 desktop and 0.0470 mobile with zero pixels above threshold.

Machine evidence: `verification.json` and `public-auth-parity-comparison.json` in this directory.

## External blocker and owner action

No Clerk provider or admin identity environment variables exist in the verified Vercel project. Follow the exact no-cost/restricted-sign-up/MFA handoff at `reports/HUMAN_INTERVENTION_STICKY_RED.md` and signal:

`CP Clerk Product Owner ready: user_...`

Do not paste secret keys. If Clerk requests payment, a plan upgrade, broader project access, or installation into a different project, stop and report the exact request. Sushma must then integrate this isolated auth commit and capture real Clerk session/Preview evidence before merge or Production.

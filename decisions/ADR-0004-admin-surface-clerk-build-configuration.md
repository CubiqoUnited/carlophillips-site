# ADR-0004 — Admin surface reachability and provable build-time Clerk configuration

Item: KAN-23. Author: Aarti. Date: 2026-09-21. Status: Accepted, implemented,
NOT yet verified on staging.

Product fit held by Pushpa (`work/items/KAN-23.md` §5 PUSHPA_CONFIRMED, §6
SOLUTION_CONSENSUS). Technical approach mine. This ADR records the decisions and,
as importantly, the two places where her rulings changed my design.

## Context

### Verified by me, 2026-09-21, against source in this repository

1. `resolveAdminClerkConfiguration` in
   `apps/web/src/lib/admin/clerk-config.ts` read the publishable key off an
   injected `environment` parameter, defaulting to `process.env`. Next.js
   substitutes `NEXT_PUBLIC_*` only where the literal member expression
   `process.env.NEXT_PUBLIC_X` appears in source. A property access on an
   injected object is not that expression, so it is never substituted.
   Consequence: our readiness guard resolved the RUNTIME value while
   `@clerk/nextjs` resolved its BUILD-INLINED constant. The two answer the same
   question from two different sources of truth, and the guard was therefore
   free to say "ready" about an artifact that cannot serve.
2. The middleware matcher was `['/admin/:path*', '/api/admin/:path*']`.
   `:path*` matches children, not the segment itself, so `/admin` and
   `/api/admin` were not matched by their own entries.
3. No route exists anywhere under `apps/web/src/app/api/admin/`. The reported
   500s on `/api/admin` and `/api/admin/health` came from the middleware
   answering for paths that were never built.
4. The admin page answered every access denial with `notFound()`, including the
   ordinary case of an anonymous caller on a correctly configured environment.

### Reported to me, not verified by me

- The production runtime log of 2026-09-21 showing
  `[Error: @clerk/nextjs: Missing publishableKey]` at edge-middleware with
  responseStatusCode 500. Sushma's report. I have not read that log.
- That the serving deployment was built from prebuilt CI output.

### Assumption, mine, dated 2026-09-21

That finding 1 is the whole mechanism of the observed 500 in production. It is
sufficient to produce it and it is a real defect in our code either way, but I
have not reproduced the 500 itself; my local repro produced 404 (keyless) and
200 (keyed), never 500. Until staging evidence exists, "this fixes production"
is an assumption, not a fact.

## Decisions

### D1 — the guard reads the same inlined constant the library reads

A module-scope `inlinedPublishableKey` constant holds the literal
`process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` read, and that constant is the
default source. The `environment` parameter survives as an explicit TEST
OVERRIDE only; passing an argument is now the opt-in, not the default path.
The secret stays a runtime lookup and is deliberately never inlined, because
inlining it would compile it into a readable bundle (AC-ADM-1, R-ADM-3).

Consequence, and this is the point: a keyless artifact now fails closed rather
than letting the library throw at the edge. Pushpa accepted that as the outcome
R-ADM-4 asks for.

### D2 — a build-time gate, run inside the build that makes the artifact

`scripts/verify-admin-clerk-build-config.mjs`. It fails the build when the
publishable key is absent, empty or malformed (AC-ADM-5), and when a staging
build carries a production key or vice versa (AC-ADM-4).

The asymmetry is deliberate and must not be "simplified": the publishable key is
printed IN FULL because it is public by design and printing it is what makes
AC-ADM-4 checkable; the secret is reported only as `present: true|false` and its
`sk_test`/`sk_live` class, never as value, prefix, suffix, length or hash.

The opt-out `CP_ADMIN_CLERK_OPTIONAL=true` downgrades failure to a loud warning
for a developer building locally without Clerk access. It is inert on Vercel; if
it worked there it would recreate the exact defect it guards.

### D3 — a re-runnable deployed-artifact probe

`scripts/verify-admin-surface.mjs`. It observes a deployment that already
exists; it does not deploy. It refuses to run without `--base` and
`--deployment`, because evidence that does not name the artifact it came from is
how the 2026-09-19 error happened — one surface read, another concluded about.
Re-runnability is AC-ADM-12: one passing deployment is not a pattern.

### D4 — the redirect, and what I did NOT build

The blanket `notFound()` becomes `redirect('/admin/sign-in')` for exactly one
denial reason, `authenticated_session_required`. Every other denial keeps the
fail-closed 404, which Pushpa asked to keep.

I did NOT create `/api/admin` or `/api/admin/health`. Pushpa ruled them out of
scope and NEEDS BOSS APPROVAL (§7), and withdrew AC-ADM-8 and AC-ADM-9 rather
than grade them passed on a 404. Her reasoning is worth preserving: she wrote
those criteria believing the paths existed because they served 500, my finding 3
showed the premise false, and she refused to convert a correction of her own bad
premise into authority to create product surface nobody has specified. After D1
those two paths return 404 from the api catch-all, and that is the accepted
outcome for this item. AC-ADM-1, AC-ADM-2, AC-ADM-10 and AC-ADM-13 still bind on
them whatever they return.

The middleware matcher is widened to name `/admin` and `/api/admin` explicitly.
`/admin.rsc` reaching the matcher depends on Next normalising the RSC suffix,
which I have not verified against Next 15.5.24; naming `/admin` removes the
dependence on that assumption rather than resting on it.

### D5 — the gate runs in `prebuild`, and the proof is bound to the artifact

Wired into `apps/web` `prebuild`, so it executes in the same process tree as the
`next build` that inlines the value. This is the shape-independence argument:
the proof describes the serving artifact whether CI uploads prebuilt output or
Vercel builds from source, so Pushpa's staging-build-shape assumption stops
blocking sign-off.

She accepted it on one condition, and the condition is built in: the gate FAILS
an otherwise-valid Vercel build that carries no `VERCEL_DEPLOYMENT_ID`,
`VERCEL_URL`, `VERCEL_GIT_COMMIT_SHA` or `GITHUB_SHA`. Untied, in her words, the
proof is "a settings listing in a different hat", and her rejection of settings
listings stands. The receipt carries the binding and is written into `.next/`, so
it travels with the uploaded artifact rather than surviving only as scrollback.
It is a file inside the output, NOT a served route — a served endpoint that
discloses configuration is precisely what §7 put out of scope.

## Rejected

- **Requiring `CLERK_SECRET_KEY` at build time.** It is a runtime value.
  Demanding it in a build environment pushes an operator into widening the very
  log surface AC-ADM-1 exists to protect. Its absence at build time is confirmed,
  not failed.
- **Evidence from `vercel env ls`.** It describes project settings, not the
  artifact, and on the deployment under investigation the two had diverged. This
  is the 2026-09-19 error and it is explicitly rejected by AC-ADM-3.
- **Removing the fail-closed 404.** It is a sane safety behaviour. Only the one
  case where it was dishonest was changed.
- **Creating the two API routes to make red tests green.** See D4.

## Amendments to my own tests, and why they are not self-serving

Two suites were written red on purpose before the rulings, and both were changed
after them. I record this rather than quietly re-running:

- `tests/admin-surface-contract.test.js` asserted that `/api/admin` and
  `/api/admin/health` must EXIST. That assertion demanded unspecified product
  surface into existence. It is rewritten to assert the honest state — the
  routes are absent, the catch-all answers a chosen 404, and that fallthrough
  discloses no configuration. Four tests in, four tests out.
- `tests/shipped-admin-auth.test.ts` pinned the old matcher as a string literal.
  It is rewritten to assert the intent it was protecting — Clerk stays scoped to
  admin paths and nothing else, exactly four entries — so a superset change does
  not silently weaken it.

## Verification status

Local, 2026-09-21, verified by me: 24 build-config tests green (21 as designed,
3 added for the binding condition); 16 contract tests green, including the 10
that were red by design; `tsc --noEmit` clean for `apps/web`; both scripts
exercised in a passing and a failing direction.

NOT verified, and not to be graded as fine: everything on staging. No deployment
was made and none may be made by me. The local probe runs were against a stub
HTTP server in a scratch directory; a stub result is not staging evidence and is
not offered as any. KAN-23 stays open until real staging evidence and Pushpa's
UAT exist.

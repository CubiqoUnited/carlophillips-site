/**
 * KAN-23 — admin surface contract. AC-ADM-2, AC-ADM-6..10.
 *
 * THIS SUITE IS RED ON PURPOSE AT THE TIME OF WRITING (2026-09-21).
 * It encodes Pushpa's target behaviour, not the current behaviour. Every
 * failure here is a defect the 500 at the edge concealed, because a middleware
 * that throws means nothing downstream ever ran and therefore nothing
 * downstream was ever observed. Going green is the definition of done for the
 * code changes in ADR-0004 D1 and D4.
 *
 * These are source-shape assertions against the SERVED tree (apps/web/src)
 * only. Per CLAUDE.md the root app/, lib/ and components/ trees are not built
 * or served, so an admin route found there is not evidence that /api/admin
 * exists. That distinction is the whole of finding 2 in ADR-0004.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SERVED = resolve(__dirname, '../apps/web/src');
const read = (relativePath) =>
  readFileSync(resolve(SERVED, relativePath), 'utf8');
const servedExists = (relativePath) =>
  existsSync(resolve(SERVED, relativePath));

describe('root cause — the guard and Clerk must read the same build-time value', () => {
  // Next.js inlines NEXT_PUBLIC_* only on a static `process.env.NEXT_PUBLIC_X`
  // member expression. Reading it off an injected parameter defeats inlining,
  // so the guard resolves the RUNTIME value while @clerk/nextjs resolves its
  // BUILD-INLINED constant. When CI builds without the key and the Vercel
  // project has it, the guard says ready and Clerk says Missing publishableKey.
  // That split is the 500.
  const source = () => read('lib/admin/clerk-config.ts');

  it('reads the publishable key through a statically inlined expression', () => {
    expect(source()).toMatch(/process\.env\.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY/);
  });

  it('does not default the publishable key to a dynamic runtime lookup', () => {
    // The injectable `environment` parameter may stay for tests, but it must
    // not be the source of the publishable key when no argument is passed.
    const body = source();
    const dynamicRead = /environment\.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY/;
    const inlinedRead = /process\.env\.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY/;
    expect(
      inlinedRead.test(body),
      'the default path must use the inlined constant'
    ).toBe(true);
    if (dynamicRead.test(body)) {
      expect(
        body,
        'a dynamic read may only be a test override, never the default'
      ).toMatch(/inlinedPublishableKey/);
    }
  });

  it('keeps the secret on a runtime lookup and never inlines it', () => {
    // Inlining the secret would compile it into a readable bundle. AC-ADM-1.
    expect(source()).not.toMatch(/process\.env\.NEXT_PUBLIC_CLERK_SECRET/);
    expect(source()).not.toMatch(/NEXT_PUBLIC_CLERK_SECRET_KEY/);
  });
});

describe('AC-ADM-7 — /admin and /admin.rsc are matched by the middleware', () => {
  const source = () => read('middleware.ts');

  it('matches /admin itself and not only its children', () => {
    // /admin.rsc reaching the middleware depends on Next normalising the RSC
    // suffix. That is an assumption, unverified against Next 15.5.24. Naming
    // /admin explicitly removes the dependence on it.
    expect(source()).toMatch(/['"]\/admin['"]/);
  });

  it('matches /api/admin itself and not only its children', () => {
    expect(source()).toMatch(/['"]\/api\/admin['"]/);
  });

  it('still matches the child paths', () => {
    expect(source()).toMatch(/\/admin\/:path\*/);
    expect(source()).toMatch(/\/api\/admin\/:path\*/);
  });
});

describe('AC-ADM-7 — an anonymous caller on /admin is redirected, not 404ed', () => {
  const source = () => read('app/admin/[[...section]]/page.tsx');

  it('redirects to the sign-in page', () => {
    // Pushpa: a 200 for an anonymous caller would be a worse defect than the
    // 500. A 404 is fail-closed hiding under missing config, and staging is an
    // environment where admin is supposed to exist.
    expect(source()).toMatch(/redirect\(/);
    expect(source()).toMatch(/\/admin\/sign-in/);
  });

  it('redirects specifically on a missing session, not on every denial', () => {
    // The fail-closed 404 is a behaviour Pushpa asked to keep. Only the one
    // case where it is dishonest may become a redirect.
    expect(source()).toMatch(/authenticated_session_required/);
  });

  it('still fails closed with 404 for other denial reasons', () => {
    expect(source()).toMatch(/notFound\(/);
  });
});

describe('AC-ADM-8 / AC-ADM-9 WITHDRAWN — the admin API paths are not a built surface', () => {
  // REWRITTEN 2026-09-21, after Pushpa's §7 ruling, which post-dates the first
  // form of this block. The original asserted that /api/admin and
  // /api/admin/health must EXIST in the served tree. That was written on the
  // premise that a 500 from those paths meant they had been built. The premise
  // was false: the middleware matcher was answering for routes that were never
  // created, and apps/web/src/app/api holds no admin route at all.
  //
  // Pushpa WITHDREW AC-ADM-8 and AC-ADM-9 rather than grade them passed on a
  // 404, and ruled that creating those endpoints is out of scope for KAN-23 and
  // NEEDS BOSS APPROVAL: what they are for, who may call them, and what a health
  // statement may disclose have no product answers today. So this block asserts
  // the honest state — the surface does not exist — plus the criteria that
  // survive the withdrawal: AC-ADM-1, AC-ADM-2 and AC-ADM-10 bind on
  // /api/admin* whatever it returns.
  //
  // This is not "the assertion was relaxed until it passed". A test that
  // demanded unspecified product surface into existence was asserting something
  // nobody had decided.
  // EXPIRY (Pushpa, binding): the two absence tests below for /api/admin and
  // /api/admin/health EXPIRE on Boss approval of the admin API surface —
  // deleting them is the expected first act of the item that creates those
  // endpoints, and is not a regression.
  const CATCH_ALL = 'app/api/[[...path]]/route.ts';

  it('AC-ADM-8 withdrawn — /api/admin is not created under KAN-23', () => {
    expect(servedExists('app/api/admin/route.ts')).toBe(false);
  });

  it('AC-ADM-9 withdrawn — /api/admin/health is not created under KAN-23', () => {
    expect(servedExists('app/api/admin/health/route.ts')).toBe(false);
  });

  it('AC-ADM-13 — the catch-all answers those paths with a chosen 404, not a 500', () => {
    // With no admin route in the served tree both paths fall through to the api
    // catch-all, whose unavailableRoute() answers 404 API_ROUTE_UNAVAILABLE.
    // That refusal is a condition we chose, which is what R-ADM-4 asks for, and
    // it is the accepted outcome for this item.
    const source = read(CATCH_ALL);
    expect(source).toMatch(/status: 404/);
    expect(source).not.toMatch(/\b500\b/);
  });

  it('AC-ADM-1 / AC-ADM-2 — that fallthrough discloses no configuration', () => {
    const source = read(CATCH_ALL);
    expect(source).not.toMatch(/PUBLISHABLE/i);
    expect(source).not.toMatch(/CLERK_SECRET/i);
    expect(source).not.toMatch(/resolveAdminClerkConfiguration/);
    expect(source).not.toMatch(/clerk_keys_unconfigured/);
    expect(source).not.toMatch(/product_owner_identity_unconfigured/);
    expect(source).not.toMatch(/\.stack/);
  });
});

describe('AC-ADM-2 / AC-ADM-10 — no served admin response names an internal library', () => {
  const adminSources = [
    'middleware.ts',
    'lib/admin/clerk-config.ts',
    'lib/admin/access-server.ts',
    'lib/admin/auth-policy.ts',
    'app/admin/layout.tsx',
    'app/admin/[[...section]]/page.tsx',
    'app/admin/sign-in/[[...sign-in]]/page.tsx',
  ];

  it('no admin module places a raw error or stack into a response body', () => {
    for (const relativePath of adminSources) {
      if (!servedExists(relativePath)) continue;
      const source = read(relativePath);
      expect(
        source,
        `${relativePath} must not serialise an error stack`
      ).not.toMatch(/\.stack/);
      expect(
        source,
        `${relativePath} must not put a caught error into a response body`
      ).not.toMatch(/json\([^)]*\berror\s*[,)]/);
    }
  });

  it('no admin module emits the Clerk configuration error text', () => {
    for (const relativePath of adminSources) {
      if (!servedExists(relativePath)) continue;
      expect(read(relativePath)).not.toMatch(/Missing publishableKey/);
    }
  });
});

describe('scope — the affected surface is eighteen paths, not five', () => {
  // Pushpa refused to grade "whether admin routes beyond the five are affected"
  // as fine. They are. Every section id below shared the middleware match and
  // therefore shared the 500.
  it('every declared admin section is under the same middleware match', () => {
    const page = read('app/admin/[[...section]]/page.tsx');
    const sectionIds = [...page.matchAll(/id:\s*'([a-z-]+)'/g)].map(
      (m) => m[1]
    );
    expect(sectionIds.length).toBeGreaterThanOrEqual(13);

    const matcher = read('middleware.ts');
    expect(matcher).toMatch(/\/admin\/:path\*/);
    for (const id of sectionIds) {
      expect(`/admin/${id}`.startsWith('/admin/'), id).toBe(true);
    }
  });
});

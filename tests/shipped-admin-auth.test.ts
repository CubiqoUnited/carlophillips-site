import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  evaluateLocalAdminAccess,
  evaluateRemoteProductOwnerAccess,
  resolveAdminRuntimeSurface,
} from '../apps/web/src/lib/admin/auth-policy';
import { resolveAdminClerkConfiguration } from '../apps/web/src/lib/admin/clerk-config';

const reviewToken = 'review-token-that-is-at-least-thirty-two-characters';
const ownerToken = 'owner-token-that-is-distinct-and-thirty-two-characters';

describe('shipped Admin authentication', () => {
  it('fails closed for missing, undefined, short, equal, and malformed local tokens', () => {
    const base = {
      authorization: `Bearer ${reviewToken}`,
      expectedToken: reviewToken,
      expectedProductOwnerToken: ownerToken,
      reviewEnabled: true,
      runtimeSurface: 'local' as const,
    };

    expect(
      evaluateLocalAdminAccess({
        ...base,
        authorization: 'Bearer undefined',
        expectedToken: undefined,
        expectedProductOwnerToken: undefined,
      }).allowed
    ).toBe(false);
    expect(
      evaluateLocalAdminAccess({ ...base, expectedToken: 'short' }).allowed
    ).toBe(false);
    expect(
      evaluateLocalAdminAccess({
        ...base,
        expectedProductOwnerToken: reviewToken,
      }).reason
    ).toBe('role_tokens_must_be_distinct');
    expect(
      evaluateLocalAdminAccess({
        ...base,
        authorization: `Bearer ${reviewToken} extra`,
      }).allowed
    ).toBe(false);
    expect(
      evaluateLocalAdminAccess({ ...base, reviewEnabled: false }).allowed
    ).toBe(false);
  });

  it('permits exact local roles only on the local surface', () => {
    const base = {
      expectedToken: reviewToken,
      expectedProductOwnerToken: ownerToken,
      reviewEnabled: true,
      runtimeSurface: 'local' as const,
    };
    expect(
      evaluateLocalAdminAccess({
        ...base,
        authorization: `Bearer ${reviewToken}`,
      })
    ).toMatchObject({ allowed: true, role: 'reviewer' });
    expect(
      evaluateLocalAdminAccess({
        ...base,
        authorization: `Bearer ${ownerToken}`,
        requiredRole: 'product_owner',
      })
    ).toMatchObject({ allowed: true, role: 'product_owner' });
    expect(
      evaluateLocalAdminAccess({
        ...base,
        authorization: `Bearer ${reviewToken}`,
        runtimeSurface: 'vercel-preview',
      }).allowed
    ).toBe(false);
  });

  it('requires complete Clerk configuration and the exact remote Product Owner', () => {
    const ownerId = 'user_productowner123';
    expect(resolveAdminClerkConfiguration({})).toMatchObject({
      ready: false,
      productOwnerUserId: null,
    });
    expect(
      resolveAdminClerkConfiguration({
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_example123',
        CLERK_SECRET_KEY: 'sk_test_example123',
        CP_ADMIN_PRODUCT_OWNER_USER_ID: ownerId,
      })
    ).toEqual({ ready: true, reason: 'ready', productOwnerUserId: ownerId });
    expect(
      evaluateRemoteProductOwnerAccess({
        authenticatedUserId: ownerId,
        expectedProductOwnerUserId: ownerId,
        identityProviderReady: true,
        runtimeSurface: 'vercel-preview',
      })
    ).toMatchObject({ allowed: true, role: 'product_owner' });
    expect(
      evaluateRemoteProductOwnerAccess({
        authenticatedUserId: 'user_someone_else',
        expectedProductOwnerUserId: ownerId,
        identityProviderReady: true,
        runtimeSurface: 'vercel-production',
      }).allowed
    ).toBe(false);
  });

  it('protects the shipped route before rendering and scopes Clerk middleware', () => {
    const route = readFileSync(
      'apps/web/src/app/admin/[[...section]]/page.tsx',
      'utf8'
    );
    const middleware = readFileSync('apps/web/src/middleware.ts', 'utf8');
    expect(route).toContain('await requireAdminAccess');
    expect(route).not.toContain('Bearer ${process.env.');
    expect(route.indexOf('await requireAdminAccess')).toBeLessThan(
      route.indexOf('adminSections.find')
    );
    expect(middleware).toContain(
      "matcher: ['/admin/:path*', '/api/admin/:path*']"
    );
    expect(
      resolveAdminRuntimeSurface({
        vercelEnvironment: 'production',
        commerceEnvironment: 'local',
      })
    ).toBe('vercel-production');
  });
});

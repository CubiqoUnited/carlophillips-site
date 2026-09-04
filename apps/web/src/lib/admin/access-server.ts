import 'server-only';

import { headers } from 'next/headers';
import {
  evaluateLocalAdminAccess,
  evaluateRemoteProductOwnerAccess,
  resolveAdminRuntimeSurface,
} from './auth-policy';
import { resolveAdminClerkConfiguration } from './clerk-config';

export async function evaluateAdminRequest(
  requestHeaders: Headers,
  { requiredRole = null }: { requiredRole?: 'product_owner' | null } = {}
) {
  const runtimeSurface = resolveAdminRuntimeSurface({
    vercelEnvironment: process.env.VERCEL_ENV,
    commerceEnvironment: process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT,
  });

  if (runtimeSurface === 'local') {
    return evaluateLocalAdminAccess({
      authorization: requestHeaders.get('authorization'),
      expectedToken: process.env.CP_ADMIN_REVIEW_TOKEN,
      expectedProductOwnerToken: process.env.CP_ADMIN_PRODUCT_OWNER_TOKEN,
      reviewEnabled: process.env.CP_ADMIN_REVIEW_ENABLED === 'true',
      runtimeSurface,
      requiredRole,
    });
  }

  const configuration = resolveAdminClerkConfiguration();
  if (!configuration.ready) {
    return evaluateRemoteProductOwnerAccess({
      authenticatedUserId: null,
      expectedProductOwnerUserId: configuration.productOwnerUserId,
      identityProviderReady: false,
      runtimeSurface,
    });
  }

  try {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    return evaluateRemoteProductOwnerAccess({
      authenticatedUserId: userId,
      expectedProductOwnerUserId: configuration.productOwnerUserId,
      identityProviderReady: true,
      runtimeSurface,
    });
  } catch {
    return { allowed: false as const, reason: 'identity_verification_failed' };
  }
}

export async function requireAdminAccess(options = {}) {
  const requestHeaders = await headers();
  return evaluateAdminRequest(requestHeaders, options);
}

import 'server-only';

import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import {
  evaluateAdminAccess,
  evaluateRemoteProductOwnerAccess,
  resolveAdminRuntimeSurface,
} from './access-policy';
import { resolveAdminClerkConfiguration } from './clerk-config';

export function evaluateLocalAdminRequest(requestHeaders, { requiredRole = null } = {}) {
  return evaluateAdminAccess({
    authorization: requestHeaders.get('authorization'),
    expectedToken: process.env.CP_ADMIN_REVIEW_TOKEN,
    expectedProductOwnerToken: process.env.CP_ADMIN_PRODUCT_OWNER_TOKEN,
    reviewEnabled: process.env.CP_ADMIN_REVIEW_ENABLED === 'true',
    runtimeSurface: resolveAdminRuntimeSurface({
      vercelEnvironment: process.env.VERCEL_ENV,
      commerceEnvironment: process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT,
    }),
    requiredRole,
  });
}

export async function evaluateAdminRequest(requestHeaders, options = {}) {
  const runtimeSurface = resolveAdminRuntimeSurface({
    vercelEnvironment: process.env.VERCEL_ENV,
    commerceEnvironment: process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT,
  });

  if (runtimeSurface === 'local') {
    return evaluateLocalAdminRequest(requestHeaders, options);
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
    return { allowed: false, reason: 'identity_verification_failed' };
  }
}

export async function requireAdminAccess(options = {}) {
  const requestHeaders = await headers();
  const decision = await evaluateAdminRequest(requestHeaders, options);

  if (!decision.allowed) notFound();
  return decision;
}

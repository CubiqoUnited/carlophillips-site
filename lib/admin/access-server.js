import 'server-only';

import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { evaluateAdminAccess, resolveAdminRuntimeSurface } from './access-policy';

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

export async function requireLocalAdminAccess(options = {}) {
  const requestHeaders = await headers();
  const decision = evaluateLocalAdminRequest(requestHeaders, options);

  if (!decision.allowed) notFound();
  return decision;
}

import 'server-only';

import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { evaluateAdminAccess } from './access-policy';

export async function requireLocalAdminAccess() {
  const requestHeaders = await headers();
  const runtimeSurface = process.env.VERCEL_ENV ? `vercel-${process.env.VERCEL_ENV}` : 'local';
  const decision = evaluateAdminAccess({
    authorization: requestHeaders.get('authorization'),
    expectedToken: process.env.CP_ADMIN_REVIEW_TOKEN,
    reviewEnabled: process.env.CP_ADMIN_REVIEW_ENABLED === 'true',
    runtimeSurface,
  });

  if (!decision.allowed) notFound();
  return decision;
}

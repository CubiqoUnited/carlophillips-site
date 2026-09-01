import { NextResponse } from 'next/server';
import { evaluateAdminRequest } from '@/lib/admin/access-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function noStoreJson(body, status) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store, private' },
  });
}

function isSameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export async function POST(request) {
  const access = await evaluateAdminRequest(request.headers, {
    requiredRole: 'product_owner',
  });
  if (!access.allowed) return noStoreJson({ error: 'Not found' }, 404);
  if (!isSameOrigin(request)) return noStoreJson({ error: 'ORIGIN_REJECTED' }, 403);

  return noStoreJson({ error: 'CONTROLLED_SAMPLE_ORDER_REMOVED' }, 410);
}

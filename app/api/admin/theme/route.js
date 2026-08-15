import { NextResponse } from 'next/server';
import { evaluateAdminRequest } from '@/lib/admin/access-server';
import { saveThemeCandidate } from '@/lib/theme/theme-repository';
import { isSameOriginRequest } from '@/lib/theme/theme-workflow';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function noStoreJson(body, status) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store, private' },
  });
}

export async function POST(request) {
  const access = await evaluateAdminRequest(request.headers, {
    requiredRole: 'product_owner',
  });
  if (!access.allowed) return noStoreJson({ error: 'Not found' }, 404);

  if (!isSameOriginRequest(
    request.url,
    request.headers.get('origin')
  )) {
    return noStoreJson({ error: 'Request origin denied', code: 'ORIGIN_REJECTED' }, 403);
  }

  if (!String(request.headers.get('content-type') || '').startsWith('application/json')) {
    return noStoreJson({ error: 'JSON body required', code: 'CONTENT_TYPE_REQUIRED' }, 415);
  }
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 4096) {
    return noStoreJson({ error: 'Request too large', code: 'REQUEST_TOO_LARGE' }, 413);
  }

  let body;
  try {
    const serialized = await request.text();
    if (serialized.length > 4096) {
      return noStoreJson({ error: 'Request too large', code: 'REQUEST_TOO_LARGE' }, 413);
    }
    body = JSON.parse(serialized);
  } catch {
    return noStoreJson({ error: 'Invalid JSON', code: 'INVALID_JSON' }, 400);
  }

  if (
    !body
    || typeof body !== 'object'
    || Array.isArray(body)
    || Object.keys(body).sort().join(',') !== 'expectedFingerprint,theme'
  ) {
    return noStoreJson({ error: 'Invalid request envelope', code: 'INVALID_REQUEST' }, 400);
  }

  try {
    const result = saveThemeCandidate({
      candidate: body.theme,
      expectedFingerprint: body.expectedFingerprint,
    });
    return noStoreJson(result, result.status);
  } catch {
    return noStoreJson({ error: 'Theme proposal could not be saved', code: 'THEME_WRITE_FAILED' }, 500);
  }
}

import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;

function getRequestedPaths(request, body) {
  const url = new URL(request.url);
  const requested = body?.paths || body?.path || url.searchParams.get('path') || '/';
  const paths = Array.isArray(requested) ? requested : [requested];

  return paths
    .map((path) => String(path || '').trim())
    .filter(Boolean)
    .map((path) => (path.startsWith('/') ? path : `/${path}`));
}

function isAuthorized(request, body) {
  if (!REVALIDATION_SECRET) {
    return false;
  }

  const url = new URL(request.url);
  const providedSecret =
    request.headers.get('x-revalidation-secret') ||
    body?.secret ||
    url.searchParams.get('secret');

  return providedSecret === REVALIDATION_SECRET;
}

async function handleRevalidation(request) {
  let body = {};

  if (request.method === 'POST') {
    try {
      body = await request.json();
    } catch {
      body = {};
    }
  }

  if (!isAuthorized(request, body)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const paths = getRequestedPaths(request, body);
  paths.forEach((path) => revalidatePath(path));

  return NextResponse.json({
    ok: true,
    revalidated: paths,
  });
}

export async function GET(request) {
  return handleRevalidation(request);
}

export async function POST(request) {
  return handleRevalidation(request);
}

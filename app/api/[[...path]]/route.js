import { NextResponse } from 'next/server';
import { evaluateCorsRequest } from '../../../lib/http/cors-policy';

function corsDecision(request) {
  const requestUrl = new URL(request.url);
  const requestHost = request.headers.get('host');
  const requestOrigin = requestHost
    ? `${requestUrl.protocol}//${requestHost}`
    : requestUrl.origin;

  return evaluateCorsRequest(
    request.headers.get('origin'),
    process.env.CORS_ORIGINS,
    requestOrigin
  );
}

function deniedCorsResponse(decision) {
  return NextResponse.json(
    {
      error: 'Forbidden',
      code: 'CORS_ORIGIN_DENIED',
      message: 'The request origin is not allowed.',
    },
    { status: 403, headers: decision.headers }
  );
}

function jsonWithCors(request, body, init = {}) {
  const decision = corsDecision(request);
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...decision.headers,
      ...(init.headers || {}),
    },
  });
}

function unavailableRoute(request) {
  return jsonWithCors(
    request,
    {
      error: 'Not found',
      code: 'API_ROUTE_UNAVAILABLE',
      message: 'Commerce reads and writes are available only through the release-aware server gateway.',
    },
    { status: 404 }
  );
}

export async function OPTIONS(request) {
  const decision = corsDecision(request);
  if (!decision.allowed) return deniedCorsResponse(decision);
  return new NextResponse(null, { status: 204, headers: decision.headers });
}

export async function GET(request, { params }) {
  const decision = corsDecision(request);
  if (!decision.allowed) return deniedCorsResponse(decision);

  const { path = [] } = await params;
  const pathString = path.join('/');

  if (pathString === '' || pathString === 'health') {
    return jsonWithCors(request, {
      status: 'ok',
      service: 'CARLOPHILLIPS Headless API',
      commerceBoundary: 'release-aware-server-gateway',
      commerceWrites: 'disabled',
      timestamp: new Date().toISOString(),
      version: '1.1.0',
    });
  }

  return unavailableRoute(request);
}

export async function POST(request) {
  const decision = corsDecision(request);
  if (!decision.allowed) return deniedCorsResponse(decision);
  return unavailableRoute(request);
}

export async function DELETE(request) {
  const decision = corsDecision(request);
  if (!decision.allowed) return deniedCorsResponse(decision);
  return unavailableRoute(request);
}

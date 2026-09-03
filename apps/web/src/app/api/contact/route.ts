import { NextResponse } from 'next/server';
import { evaluateCorsRequest } from '@/lib/http/cors-policy';
import { validateSupportRequest } from '@/lib/support/contact-intake';
import { deliverSupportRequest } from '@/lib/support/support-delivery';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProtocol = request.headers.get('x-forwarded-proto');
  const publicOrigin = forwardedHost
    ? `${forwardedProtocol === 'http' ? 'http' : 'https'}://${forwardedHost}`
    : requestUrl.origin;
  const cors = evaluateCorsRequest(
    request.headers.get('origin'),
    undefined,
    publicOrigin
  );
  if (!cors.allowed)
    return NextResponse.json({ error: 'ORIGIN_REJECTED' }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 });
  }
  const validation = validateSupportRequest(body);
  if (!validation.valid)
    return NextResponse.json(
      { error: 'INVALID_FIELDS', fields: validation.fields },
      { status: 400 }
    );

  const delivery = await deliverSupportRequest(validation.request);
  if (delivery.delivered) {
    return NextResponse.json({ ok: true, requestId: delivery.requestId });
  }
  if (delivery.reason === 'not-configured') {
    return NextResponse.json(
      { error: 'SUPPORT_DESTINATION_NOT_CONFIGURED' },
      { status: 503 }
    );
  }
  return NextResponse.json(
    { error: 'SUPPORT_DELIVERY_FAILED' },
    { status: 502 }
  );
}

import { NextResponse } from 'next/server';
import {
  privateListDestination,
  supportDestination,
  validateEmailSignup,
  validateSupportRequest,
} from '@/lib/site/contact-intake';

export const dynamic = 'force-dynamic';

/*
 * Support and private-list intake.
 *
 * The route never reports a request as delivered unless a configured destination accepted it. With
 * no destination provisioned it answers CHANNEL_UNCONFIGURED, and the form tells the visitor plainly
 * rather than showing a success state for a message nobody received.
 */
async function forward(destination, payload) {
  const response = await fetch(destination, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.ok;
}

function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export async function POST(request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'ORIGIN_REJECTED' }, { status: 403 });

  let body = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 });
  }

  if (body?.intent === 'private-list') {
    if (!validateEmailSignup(body.email)) return NextResponse.json({ error: 'INVALID_EMAIL' }, { status: 400 });
    const destination = privateListDestination();
    if (!destination) return NextResponse.json({ error: 'CHANNEL_UNCONFIGURED' }, { status: 503 });
    const delivered = await forward(destination, { intent: 'private-list', email: String(body.email).trim() });
    return delivered
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: 'DELIVERY_FAILED' }, { status: 502 });
  }

  const validation = validateSupportRequest(body);
  if (!validation.valid) return NextResponse.json({ error: 'INCOMPLETE', missing: validation.missing }, { status: 400 });

  const destination = supportDestination();
  if (!destination) return NextResponse.json({ error: 'CHANNEL_UNCONFIGURED' }, { status: 503 });

  const delivered = await forward(destination, {
    intent: 'support',
    name: String(body.name).trim(),
    email: String(body.email).trim(),
    orderNumber: String(body.orderNumber || '').trim(),
    subject: String(body.subject || '').trim(),
    message: String(body.message).trim(),
  });

  return delivered
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: 'DELIVERY_FAILED' }, { status: 502 });
}

import { createHmac, timingSafeEqual } from 'crypto';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SHOPIFY_WEBHOOK_SIGNING_SECRET = process.env.SHOPIFY_WEBHOOK_SIGNING_SECRET;

const REVALIDATION_TOPICS = new Set([
  'products/create',
  'products/update',
  'products/delete',
  'collections/create',
  'collections/update',
  'collections/delete',
]);

function verifyShopifyHmac(rawBody, hmacHeader) {
  if (!SHOPIFY_WEBHOOK_SIGNING_SECRET || !hmacHeader) {
    return false;
  }

  const digest = createHmac('sha256', SHOPIFY_WEBHOOK_SIGNING_SECRET)
    .update(rawBody, 'utf8')
    .digest('base64');

  const expected = Buffer.from(digest, 'utf8');
  const received = Buffer.from(hmacHeader, 'utf8');

  return expected.length === received.length && timingSafeEqual(expected, received);
}

function revalidateStorefront() {
  revalidatePath('/');
}

export async function POST(request) {
  const rawBody = await request.text();
  const hmac = request.headers.get('x-shopify-hmac-sha256');
  const topic = request.headers.get('x-shopify-topic') || '';

  if (!verifyShopifyHmac(rawBody, hmac)) {
    return NextResponse.json({ error: 'Invalid Shopify webhook signature' }, { status: 401 });
  }

  if (!REVALIDATION_TOPICS.has(topic)) {
    return NextResponse.json({ ok: true, ignored: true, topic });
  }

  revalidateStorefront();

  return NextResponse.json({
    ok: true,
    topic,
    revalidated: ['/'],
  });
}

export async function GET() {
  return NextResponse.json({ ok: true, route: 'shopify-webhooks' });
}

import { NextResponse } from 'next/server';
import {
  ShopifyWebhookVerificationError,
  verifyShopifyWebhook,
} from '@repo/shopify';
import { getCommerceEnvironment } from '@/lib/config/product-visibility';
import { createDurableWebhookStore } from '@/lib/commerce/webhook-idempotency';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TOPICS = new Set([
  'orders/create',
  'orders/paid',
  'orders/cancelled',
  'orders/fulfilled',
  'orders/updated',
  'fulfillments/create',
  'fulfillments/update',
  'refunds/create',
]);

export async function POST(request: Request) {
  const environment = getCommerceEnvironment();
  const secret =
    environment === 'preview'
      ? process.env.SHOPIFY_STAGING_WEBHOOK_SECRET || ''
      : process.env.SHOPIFY_WEBHOOK_SECRET || '';
  const allowedShops = new Set(
    (process.env.SHOPIFY_WEBHOOK_ALLOWED_SHOPS || '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );
  let store;
  try {
    store = createDurableWebhookStore();
  } catch {
    return NextResponse.json(
      { error: 'DURABLE_IDEMPOTENCY_REQUIRED' },
      { status: 503 }
    );
  }

  let verified;
  try {
    verified = await verifyShopifyWebhook({
      rawBody: new Uint8Array(await request.arrayBuffer()),
      headers: request.headers,
      secret,
      allowedTopics: TOPICS,
      allowedShops,
      idempotencyStore: store,
    });
  } catch (error) {
    if (
      error instanceof ShopifyWebhookVerificationError &&
      error.code === 'SHOPIFY_WEBHOOK_REPLAYED'
    ) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    const code =
      error instanceof ShopifyWebhookVerificationError
        ? error.code
        : 'SHOPIFY_WEBHOOK_REJECTED';
    return NextResponse.json({ error: code }, { status: 401 });
  }

  try {
    await store.record(verified.webhookId, {
      schemaVersion: 'cp.shopify-webhook-event.v1',
      topic: verified.topic,
      shop: verified.shop,
      triggeredAt: verified.triggeredAt,
      observedAt: verified.observedAt,
      payloadHash: verified.payloadHash,
    });
  } catch {
    await store.release(verified.webhookId).catch(() => undefined);
    return NextResponse.json(
      { error: 'WEBHOOK_EVENT_STORE_FAILED' },
      { status: 503 }
    );
  }
  return NextResponse.json({ ok: true });
}

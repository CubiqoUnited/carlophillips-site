import { NextResponse } from 'next/server';
import {
  ShopifyWebhookVerificationError,
  verifyShopifyWebhook,
} from '@repo/shopify';
import { getCommerceEnvironment } from '@/lib/config/product-visibility';
import { resolveShopifyWebhookConfig } from '@/lib/config/shopify-environment';
import { assertRuntimePreflight } from '@/lib/config/runtime-preflight';
import { createDurableWebhookStore } from '@/lib/commerce/webhook-idempotency';
import { createSanitizedWebhookObservation } from '@/lib/commerce/shopify-webhook-observation';

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

function reportWebhookFailure(
  event: 'configuration_failed' | 'idempotency_failed' | 'storage_failed',
  environment: string,
  topic?: string
) {
  console.error('cp.shopify_webhook.failed', {
    event: `shopify_webhook_${event}`,
    environment,
    route: '/api/webhooks/shopify',
    topic: topic && TOPICS.has(topic) ? topic : null,
    occurredAt: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const environment = getCommerceEnvironment();
  try {
    if (environment === 'local') throw new Error('WEBHOOK_LOCAL_REJECTED');
    assertRuntimePreflight(environment);
  } catch (error) {
    const code =
      error instanceof Error ? error.message : 'RUNTIME_CONFIG_INVALID';
    reportWebhookFailure('configuration_failed', environment);
    return NextResponse.json({ error: code }, { status: 503 });
  }
  const webhookConfig = resolveShopifyWebhookConfig(environment);
  const secret = webhookConfig.secret;
  const allowedShops = new Set(
    webhookConfig.allowedShops
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );
  let store;
  try {
    store = createDurableWebhookStore(environment);
  } catch {
    reportWebhookFailure('configuration_failed', environment);
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
      try {
        const webhookId = request.headers.get('x-shopify-webhook-id') || '';
        if ((await store.status(webhookId)) === 'recorded') {
          return NextResponse.json({
            ok: true,
            duplicate: true,
            externalActionApplied: false,
          });
        }
      } catch {
        // Fall through to a retryable response; never acknowledge uncertain state.
      }
      reportWebhookFailure(
        'idempotency_failed',
        environment,
        request.headers.get('x-shopify-topic') || undefined
      );
      return NextResponse.json(
        { error: 'WEBHOOK_PROCESSING_INCOMPLETE' },
        { status: 503 }
      );
    }
    if (error instanceof ShopifyWebhookVerificationError) {
      return NextResponse.json({ error: error.code }, { status: 401 });
    }
    reportWebhookFailure(
      'idempotency_failed',
      environment,
      request.headers.get('x-shopify-topic') || undefined
    );
    return NextResponse.json(
      { error: 'WEBHOOK_IDEMPOTENCY_UNAVAILABLE' },
      { status: 503 }
    );
  }

  try {
    await store.record(
      verified.webhookId,
      createSanitizedWebhookObservation(verified)
    );
  } catch {
    await store.release(verified.webhookId).catch(() => undefined);
    reportWebhookFailure('storage_failed', environment, verified.topic);
    return NextResponse.json(
      { error: 'WEBHOOK_EVENT_STORE_FAILED' },
      { status: 503 }
    );
  }
  return NextResponse.json({
    ok: true,
    duplicate: false,
    externalActionApplied: false,
  });
}

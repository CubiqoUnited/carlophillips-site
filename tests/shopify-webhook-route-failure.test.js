import { createHmac, randomUUID } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const originalEnvironment = { ...process.env };
const shop = 'staging-shop.myshopify.com';
const secret = 'staging-webhook-secret';

beforeEach(() => {
  Object.assign(process.env, {
    NEXT_PUBLIC_COMMERCE_ENVIRONMENT: 'preview',
    VERCEL_ENV: 'preview',
    CP_COMMERCE_ENVIRONMENT: 'preview',
    CP_DURABLE_STORE_ID: 'preview-store',
    CP_EXPECTED_PREVIEW_DURABLE_STORE_ID: 'preview-store',
    CP_RELEASE_ID: 'cp-test-release',
    CP_RELEASE_COMMIT_SHA: 'a'.repeat(40),
    SHOPIFY_STAGING_STORE_DOMAIN: shop,
    SHOPIFY_STAGING_STOREFRONT_TOKEN: 'storefront-token',
    SHOPIFY_STAGING_CHECKOUT_HOSTS: `${shop},checkout.shopify.com`,
    SHOPIFY_STAGING_WEBHOOK_SECRET: secret,
    SHOPIFY_WEBHOOK_ALLOWED_SHOPS: shop,
    SHOPIFY_CART_UI_ENABLED: 'true',
    SHOPIFY_CHECKOUT_ENABLED: 'true',
    UPSTASH_REDIS_REST_URL: 'https://redis.example.test',
    UPSTASH_REDIS_REST_TOKEN: 'redis-token',
  });
});

afterEach(() => {
  process.env = { ...originalEnvironment };
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.resetModules();
});

function webhookRequest(body = JSON.stringify({ id: 1001 })) {
  return new Request('https://staging.carlophillips.com/api/webhooks/shopify', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-shopify-hmac-sha256': createHmac('sha256', secret)
        .update(body)
        .digest('base64'),
      'x-shopify-topic': 'orders/paid',
      'x-shopify-shop-domain': shop,
      'x-shopify-webhook-id': randomUUID(),
      'x-shopify-triggered-at': new Date().toISOString(),
    },
    body,
  });
}

describe('deployed Shopify webhook failure semantics', () => {
  it('returns retryable 503 rather than authentication 401 when the durable claim fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 503 }))
    );
    const report = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { POST } =
      await import('../apps/web/src/app/api/webhooks/shopify/route');

    const response = await POST(webhookRequest());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: 'WEBHOOK_IDEMPOTENCY_UNAVAILABLE',
    });
    expect(report.mock.calls[0][1]).toMatchObject({
      event: 'shopify_webhook_idempotency_failed',
      environment: 'preview',
      topic: 'orders/paid',
    });
    expect(JSON.stringify(report.mock.calls)).not.toContain(shop);
    expect(JSON.stringify(report.mock.calls)).not.toContain('1001');
  });

  it('releases the claim and returns 503 when sanitized observation storage fails', async () => {
    const durable = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ result: 'OK' }), { status: 200 })
      )
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ result: 1 }), { status: 200 })
      );
    vi.stubGlobal('fetch', durable);
    const report = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { POST } =
      await import('../apps/web/src/app/api/webhooks/shopify/route');

    const response = await POST(webhookRequest());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: 'WEBHOOK_EVENT_STORE_FAILED',
    });
    expect(durable).toHaveBeenCalledTimes(3);
    expect(report.mock.calls[0][1]).toMatchObject({
      event: 'shopify_webhook_storage_failed',
      topic: 'orders/paid',
    });
  });
});

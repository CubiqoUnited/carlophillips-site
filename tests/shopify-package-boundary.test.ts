import { createHmac } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  GET_PRODUCT_BY_HANDLE,
  SHOPIFY_PACKAGE_AUTHORITY,
  STOREFRONT_API_VERSION,
  StorefrontTransportError,
  createStorefrontClient,
  createWebhookObservationInput,
  normalizeStorefrontProduct,
  verifyShopifyWebhook,
} from '../packages/shopify/src/index';
import type {
  GetProductByHandleQuery,
  Product,
} from '../packages/shopify/src/types';
import type { WebhookIdempotencyStore } from '../packages/shopify/src/webhooks/verify';

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? sourceFiles(path) : [path];
  });
}

function productFixture(): Product {
  return {
    id: 'gid://shopify/Product/1',
    handle: 'signature-hoodie',
    title: 'Signature Hoodie',
    description: 'Observed description',
    descriptionHtml: '<p>Transport only</p>',
    productType: 'Hoodies',
    tags: ['signature'],
    vendor: 'CARLOPHILLIPS',
    priceRange: {
      minVariantPrice: { amount: '128.00', currencyCode: 'USD' },
      maxVariantPrice: { amount: '128.00', currencyCode: 'USD' },
    },
    images: { edges: [] },
    media: {
      edges: [
        {
          node: {
            __typename: 'MediaImage',
            id: 'gid://shopify/MediaImage/1',
            alt: 'Observed front',
            previewImage: null,
            image: {
              url: 'https://cdn.example/front.jpg?width=1200',
              altText: 'Front',
              width: 1200,
              height: 1500,
            },
          },
        },
      ],
    },
    variants: {
      edges: [
        {
          node: {
            id: 'gid://shopify/ProductVariant/1',
            title: 'Black / M',
            availableForSale: true,
            price: { amount: '128.00', currencyCode: 'USD' },
            selectedOptions: [
              { name: 'Color', value: 'Black' },
              { name: 'Size', value: 'M' },
            ],
            image: null,
          },
        },
      ],
    },
    options: [],
  };
}

class MemoryIdempotencyStore implements WebhookIdempotencyStore {
  readonly claims = new Map<string, Date>();

  async claim(webhookId: string, expiresAt: Date): Promise<boolean> {
    if (this.claims.has(webhookId)) return false;
    this.claims.set(webhookId, expiresAt);
    return true;
  }
}

const webhookSecret = 'test-only-secret';
const rawWebhookBody = JSON.stringify({ id: 1, title: 'Observed product' });
const now = new Date('2026-08-14T16:00:00.000Z');

function webhookHeaders(
  overrides: Readonly<Record<string, string>> = {}
): Record<string, string> {
  return {
    'x-shopify-hmac-sha256': createHmac('sha256', webhookSecret)
      .update(rawWebhookBody)
      .digest('base64'),
    'x-shopify-topic': 'products/update',
    'x-shopify-shop-domain': 'cp-test.myshopify.com',
    'x-shopify-webhook-id': 'webhook-001',
    'x-shopify-triggered-at': '2026-08-14T15:59:30.000Z',
    ...overrides,
  };
}

function webhookOptions(
  overrides: Partial<Parameters<typeof verifyShopifyWebhook>[0]> = {}
) {
  return {
    rawBody: rawWebhookBody,
    headers: webhookHeaders(),
    secret: webhookSecret,
    allowedTopics: new Set(['products/update']),
    allowedShops: new Set(['cp-test.myshopify.com']),
    idempotencyStore: new MemoryIdempotencyStore(),
    now: () => now,
    ...overrides,
  };
}

describe('@repo/shopify package boundary', () => {
  it('is pinned, server-only, query-only, and independent of release authority', () => {
    expect(STOREFRONT_API_VERSION).toBe('2025-10');
    expect(GET_PRODUCT_BY_HANDLE).toContain('query GetProductByHandle');
    expect(SHOPIFY_PACKAGE_AUTHORITY).toEqual({
      transport: 'query-only',
      webhooks: 'observation-only',
      mayApproveRelease: false,
      mayApproveMedia: false,
      mayAuthorizeCart: false,
      mayPublish: false,
    });

    const runtimeEntries = [
      'packages/shopify/src/index.ts',
      'packages/shopify/src/client.ts',
      'packages/shopify/src/normalize.ts',
      'packages/shopify/src/queries.ts',
      'packages/shopify/src/webhooks/verify.ts',
    ];
    for (const entry of runtimeEntries) {
      expect(readFileSync(entry, 'utf8'), entry).toContain(
        "import 'server-only'"
      );
    }

    const sources = sourceFiles('packages/shopify/src')
      .map((path) => readFileSync(path, 'utf8'))
      .join('\n');
    expect(sources).not.toMatch(/lib\/(?:commerce|releases)|commerceAllowed/);
  });

  it('uses an injected fetch, returns typed query data, and refuses mutations', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ data: { product: null } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
    );
    const client = createStorefrontClient({
      storeDomain: 'cp-test.myshopify.com',
      storefrontAccessToken: 'test-token-not-a-secret',
      fetchImpl,
    });
    const data = await client.query<
      GetProductByHandleQuery,
      { handle: string }
    >({
      document: GET_PRODUCT_BY_HANDLE,
      variables: { handle: 'signature-hoodie' },
    });

    expect(data).toEqual({ product: null });
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(fetchImpl.mock.calls[0]?.[0]).toBe(
      'https://cp-test.myshopify.com/api/2025-10/graphql.json'
    );
    await expect(
      client.query({
        document:
          'mutation CartCreate { cartCreate { userErrors { message } } }',
        variables: {},
      })
    ).rejects.toMatchObject<Partial<StorefrontTransportError>>({
      code: 'SHOPIFY_QUERY_ONLY_BOUNDARY',
    });
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it('normalizes only a transport input and grants no customer authority', () => {
    const normalized = normalizeStorefrontProduct({
      product: productFixture(),
    });
    expect(normalized).toMatchObject({
      schemaVersion: 'cp.shopify-product-transport-input.v1',
      authority: 'transport-only',
      source: 'shopify-storefront',
      handle: 'signature-hoodie',
    });
    expect(normalized?.media).toHaveLength(1);
    expect(normalized?.variants).toHaveLength(1);
    expect(normalized?.variants[0]?.rawReference).toContain('ProductVariant');
    expect(JSON.stringify(normalized)).not.toMatch(
      /commerceAllowed|releaseAllowed|mediaApproved|cartAllowed/
    );
  });

  it('verifies HMAC and headers, claims idempotency, and creates observation-only input', async () => {
    const store = new MemoryIdempotencyStore();
    const verified = await verifyShopifyWebhook(
      webhookOptions({ idempotencyStore: store })
    );
    const observation = createWebhookObservationInput(verified);

    expect(verified).toMatchObject({
      authority: 'observation-only',
      webhookId: 'webhook-001',
      topic: 'products/update',
      shop: 'cp-test.myshopify.com',
      observedAt: now.toISOString(),
    });
    expect(observation).toMatchObject({
      schemaVersion: 'cp.shopify-webhook-observation-input.v1',
      authority: 'observation-only',
      source: 'shopify-webhook',
    });
    expect(JSON.stringify(observation)).not.toMatch(
      /releaseAllowed|mediaApproved|cartAllowed|publishAllowed/
    );
    expect(store.claims.get('webhook-001')?.getTime()).toBeGreaterThan(
      now.getTime()
    );

    await expect(
      verifyShopifyWebhook(webhookOptions({ idempotencyStore: store }))
    ).rejects.toMatchObject({ code: 'SHOPIFY_WEBHOOK_REPLAYED' });
  });

  it('rejects tampering, stale/future deliveries, and invalid topic/shop headers', async () => {
    await expect(
      verifyShopifyWebhook(
        webhookOptions({
          rawBody: `${rawWebhookBody} `,
        })
      )
    ).rejects.toMatchObject({ code: 'SHOPIFY_WEBHOOK_HMAC_INVALID' });

    await expect(
      verifyShopifyWebhook(
        webhookOptions({
          headers: webhookHeaders({
            'x-shopify-triggered-at': '2026-08-14T15:50:00.000Z',
          }),
        })
      )
    ).rejects.toMatchObject({ code: 'SHOPIFY_WEBHOOK_STALE' });

    await expect(
      verifyShopifyWebhook(
        webhookOptions({
          headers: webhookHeaders({
            'x-shopify-triggered-at': '2026-08-14T16:02:00.000Z',
          }),
        })
      )
    ).rejects.toMatchObject({ code: 'SHOPIFY_WEBHOOK_FROM_FUTURE' });

    await expect(
      verifyShopifyWebhook(
        webhookOptions({
          headers: webhookHeaders({ 'x-shopify-topic': 'orders/create' }),
        })
      )
    ).rejects.toMatchObject({ code: 'SHOPIFY_WEBHOOK_TOPIC_DENIED' });

    await expect(
      verifyShopifyWebhook(
        webhookOptions({
          headers: webhookHeaders({
            'x-shopify-shop-domain': 'other.myshopify.com',
          }),
        })
      )
    ).rejects.toMatchObject({ code: 'SHOPIFY_WEBHOOK_SHOP_DENIED' });

    await expect(
      verifyShopifyWebhook(
        webhookOptions({
          headers: webhookHeaders({ 'x-shopify-webhook-id': '' }),
        })
      )
    ).rejects.toMatchObject({ code: 'SHOPIFY_WEBHOOK_HEADERS_MISSING' });
  });
});

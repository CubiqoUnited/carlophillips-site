import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { getProductPageDecision } from '../apps/web/src/lib/commerce/product-page-server';

const originalEnvironment = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnvironment };
});

function configureRuntime(environment) {
  const preview = environment === 'preview';
  const prefix = preview ? 'SHOPIFY_STAGING_' : 'SHOPIFY_';
  const store = preview ? 'preview.myshopify.com' : 'production.myshopify.com';
  process.env.CP_COMMERCE_ENVIRONMENT = environment;
  process.env.CP_DURABLE_STORE_ID = `${environment}-store`;
  process.env[
    preview
      ? 'CP_EXPECTED_PREVIEW_DURABLE_STORE_ID'
      : 'CP_EXPECTED_PRODUCTION_DURABLE_STORE_ID'
  ] = `${environment}-store`;
  process.env[`${prefix}STORE_DOMAIN`] = store;
  process.env[`${prefix}STOREFRONT_TOKEN`] = `${environment}-token`;
  process.env[`${prefix}CHECKOUT_HOSTS`] = store;
  process.env[`${prefix}WEBHOOK_SECRET`] = `${environment}-secret`;
  process.env.SHOPIFY_WEBHOOK_ALLOWED_SHOPS = store;
  process.env.UPSTASH_REDIS_REST_URL = `https://${environment}-redis.example`;
  process.env.UPSTASH_REDIS_REST_TOKEN = 'redis-token';
  process.env.SHOPIFY_CART_UI_ENABLED = 'true';
  process.env.SHOPIFY_CHECKOUT_ENABLED = 'true';
  process.env.CP_RELEASE_ID = 'runtime-authority-test';
  process.env.CP_RELEASE_COMMIT_SHA = 'a'.repeat(40);
}

function shopifyProduct() {
  return {
    id: 'hoodie',
    handle: 'hoodie',
    availableForSale: true,
    observedVariants: [
      {
        id: 'gid://shopify/ProductVariant/1',
        title: 'M',
        availableForSale: true,
        price: { amount: '180.00', currencyCode: 'EUR' },
        selectedOptions: [{ name: 'Size', value: 'M' }],
      },
    ],
    media: [],
  };
}

describe('product page runtime authority', () => {
  it('enables Production commerce from current Shopify facts when release safety flags are on', async () => {
    configureRuntime('production');
    const result = await getProductPageDecision({
      environment: 'production',
      mode: 'shopify',
      handle: 'hoodie',
      loadShopifyProduct: vi.fn(async () => shopifyProduct()),
    });
    expect(result.cartActivation).toMatchObject({
      status: 'eligible',
      cartAllowed: true,
      checkoutAllowed: true,
      reason: 'CURRENT_SHOPIFY_PRODUCT_AVAILABLE',
    });
  });

  it('rejects a non-purchasable Production runtime instead of booting a disabled store', async () => {
    configureRuntime('production');
    process.env.SHOPIFY_CHECKOUT_ENABLED = 'false';
    await expect(
      getProductPageDecision({
        environment: 'production',
        mode: 'shopify',
        handle: 'hoodie',
        loadShopifyProduct: vi.fn(async () => shopifyProduct()),
      })
    ).rejects.toThrowError('RUNTIME_CONFIG_CHECKOUT_NOT_ENABLED');
  });

  it('allows an isolated and fully enabled Preview checkout rehearsal', async () => {
    configureRuntime('preview');
    const result = await getProductPageDecision({
      environment: 'preview',
      mode: 'shopify',
      handle: 'hoodie',
      loadShopifyProduct: vi.fn(async () => shopifyProduct()),
    });
    expect(result.cartActivation.checkoutAllowed).toBe(true);
  });
});

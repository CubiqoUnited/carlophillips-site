import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const originalEnvironment = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnvironment };
  vi.restoreAllMocks();
  vi.resetModules();
});

function configureIncompletePreview() {
  process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT = 'preview';
  process.env.VERCEL_ENV = 'preview';
  process.env.SHOPIFY_CART_UI_ENABLED = 'true';
  process.env.SHOPIFY_CHECKOUT_ENABLED = 'true';
  delete process.env.SHOPIFY_STAGING_STORE_DOMAIN;
  delete process.env.SHOPIFY_STAGING_STOREFRONT_TOKEN;
  delete process.env.SHOPIFY_STAGING_CHECKOUT_HOSTS;
  delete process.env.SHOPIFY_STAGING_WEBHOOK_SECRET;
}

describe('runtime preflight route boundary', () => {
  it('blocks cart work before any Shopify network request', async () => {
    configureIncompletePreview();
    const network = vi.spyOn(globalThis, 'fetch');
    const { POST } = await import('../apps/web/src/app/api/cart/route');
    const form = new FormData();
    form.set('cartAction', 'add');
    form.set('handle', 'hoodie');
    form.set('referenceHash', `sha256:${'0'.repeat(64)}`);
    form.set('quantity', '1');
    const response = await POST(
      new Request('https://staging.carlophillips.com/api/cart', {
        method: 'POST',
        body: form,
      })
    );
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({
      error: expect.stringContaining(
        'RUNTIME_CONFIG_MISSING_SHOPIFY_STAGING_STORE_DOMAIN'
      ),
    });
    expect(network).not.toHaveBeenCalled();
  });

  it('blocks webhook parsing and durable-store access before any network request', async () => {
    configureIncompletePreview();
    const network = vi.spyOn(globalThis, 'fetch');
    const { POST } =
      await import('../apps/web/src/app/api/webhooks/shopify/route');
    const response = await POST(
      new Request('https://staging.carlophillips.com/api/webhooks/shopify', {
        method: 'POST',
        body: '{"customer":"must-not-be-parsed"}',
      })
    );
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      error: expect.stringContaining(
        'RUNTIME_CONFIG_MISSING_SHOPIFY_STAGING_STORE_DOMAIN'
      ),
    });
    expect(network).not.toHaveBeenCalled();
  });
});

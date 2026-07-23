import { afterEach, describe, expect, it, vi } from 'vitest';

async function loadProductService(environment) {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_COMMERCE_ENVIRONMENT', environment);
  vi.stubEnv('NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN', '');
  vi.stubEnv('NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN', '');
  return import('../lib/data/products.js');
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('legacy product data boundary', () => {
  it('allows explicit empty fixture data locally', async () => {
    const service = await loadProductService('local');
    await expect(service.getProducts()).resolves.toEqual([]);
  });

  it.each(['preview', 'production'])('fails closed without Shopify in %s', async environment => {
    const service = await loadProductService(environment);
    await expect(service.getProducts()).rejects.toMatchObject({
      code: 'COMMERCE_SOURCE_UNAVAILABLE',
    });
  });
});

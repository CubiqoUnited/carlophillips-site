import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { createShopifyProductLoader } from '../apps/web/src/lib/providers/shopify/product-loader';

describe('monorepo Shopify public product loader fallback', () => {
  it('creates a canonical observation without a Storefront token', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: 10,
        handle: 'observed-hoodie',
        title: 'Observed Hoodie',
        description: '<p>Observed description</p>',
        vendor: 'CARLOPHILLIPS',
        type: 'Hoodie',
        tags: [],
        price_min: 12800,
        price_max: 12800,
        options: [{ name: 'Color' }, { name: 'Size' }],
        images: ['https://cdn.shopify.com/test/product.png'],
        variants: [
          {
            id: 100,
            title: 'black / m',
            available: true,
            price: 12800,
            option1: 'black',
            option2: 'm',
            option3: null,
          },
        ],
      }),
    });
    const loadProduct = createShopifyProductLoader({
      storeDomain: 'example.myshopify.com',
      storefrontToken: undefined,
      fetchImpl,
      environment: 'preview',
      observedAt: () => '2026-08-30T08:40:45Z',
      capabilityEvidence: 'evidence/shopify-public-product-read.json',
    });

    const product = await loadProduct('observed-hoodie');

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://example.myshopify.com/products/observed-hoodie.js',
      { method: 'GET', cache: 'no-store' }
    );
    expect(product).toMatchObject({
      handle: 'observed-hoodie',
      name: 'Observed Hoodie',
      price: 128,
      currency: 'USD',
      availableForSale: true,
      observedVariants: [
        {
          id: 'gid://shopify/ProductVariant/100',
          title: 'black / m',
          availableForSale: true,
        },
      ],
      observation: {
        source: 'shopify',
        environment: 'preview',
        authority: 'candidate',
      },
    });
    expect(product.variantFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(product.observation.commerceFactsFingerprint).toMatch(
      /^sha256:[a-f0-9]{64}$/
    );
  });
});

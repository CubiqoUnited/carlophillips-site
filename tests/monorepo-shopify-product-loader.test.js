import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { createShopifyProductLoader } from '../apps/web/src/lib/providers/shopify/product-loader';

describe('monorepo Shopify Storefront product loader', () => {
  it('fails closed without a Storefront token', () => {
    expect(() =>
      createShopifyProductLoader({
        storeDomain: 'example.myshopify.com',
        storefrontToken: undefined,
      })
    ).toThrowError(expect.objectContaining({ code: 'SHOPIFY_NOT_CONFIGURED' }));
  });

  it('canonicalizes authenticated GraphQL customer copy identically', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'x-shopify-api-version': '2026-07' }),
      json: async () => ({
        data: {
          product: {
            id: 'gid://shopify/Product/10',
            handle: 'observed-hoodie',
            title: 'Observed Hoodie',
            description: 'Line one\n\nLine two',
            vendor: 'CARLOPHILLIPS',
            productType: 'Hoodie',
            tags: [],
            tagline: { value: 'Signature Series' },
            material: { value: '500 gsm cotton' },
            fit: { value: 'Relaxed' },
            care: { value: 'Cold wash' },
            sizeGuide: { value: 'Use your normal size.' },
            priceRange: {
              minVariantPrice: { amount: '128.0', currencyCode: 'USD' },
              maxVariantPrice: { amount: '128.0', currencyCode: 'USD' },
            },
            media: { edges: [] },
            variants: {
              edges: [
                {
                  node: {
                    id: 'gid://shopify/ProductVariant/100',
                    title: 'black / m',
                    availableForSale: true,
                    price: { amount: '128.0', currencyCode: 'USD' },
                    selectedOptions: [
                      { name: 'Color', value: 'black' },
                      { name: 'Size', value: 'm' },
                    ],
                  },
                },
              ],
            },
          },
        },
      }),
    });
    const loadProduct = createShopifyProductLoader({
      storeDomain: 'example.myshopify.com',
      storefrontToken: 'sanitized-test-token',
      fetchImpl,
      environment: 'preview',
      observedAt: () => '2026-08-30T08:40:45Z',
      capabilityEvidence: 'evidence/shopify-storefront-read.json',
    });

    const product = await loadProduct('observed-hoodie');

    expect(product).toMatchObject({
      description: 'Line one Line two',
      tagline: 'Signature Series',
      details: [
        ['Material', '500 gsm cotton'],
        ['Fit', 'Relaxed'],
        ['Care', 'Cold wash'],
        ['Size guide', 'Use your normal size.'],
      ],
      observedVariants: [
        {
          price: { amount: '128.00', currencyCode: 'USD' },
        },
      ],
    });
  });
});

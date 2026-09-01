import { describe, expect, it, vi } from 'vitest';
import { createShopifyProductLoader } from '../lib/providers/shopify/product-loader.js';

describe('server Shopify product loader contract', () => {
  it('requires configuration before making a request', () => {
    expect(() =>
      createShopifyProductLoader({ storeDomain: '', storefrontToken: '' })
    ).toThrowError(expect.objectContaining({ code: 'SHOPIFY_NOT_CONFIGURED' }));
  });

  it('requests one product by handle and normalizes the response', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          product: {
            id: 'gid://shopify/Product/1',
            handle: 'observed-hoodie',
            title: 'Observed Hoodie',
            description: 'Observed description',
            productType: 'Hoodie',
            tags: [],
            priceRange: {
              minVariantPrice: { amount: '128.00', currencyCode: 'USD' },
              maxVariantPrice: { amount: '128.00', currencyCode: 'USD' },
            },
            images: { edges: [] },
            media: { edges: [] },
            variants: {
              edges: [
                {
                  node: {
                    id: 'gid://shopify/ProductVariant/1',
                    title: 'Default Title',
                    availableForSale: true,
                    price: { amount: '128.00', currencyCode: 'USD' },
                    selectedOptions: [
                      { name: 'Title', value: 'Default Title' },
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
      observedAt: () => '2026-07-23T05:00:00Z',
      capabilityEvidence: 'evidence/shopify-storefront-read-001',
    });

    const product = await loadProduct('observed-hoodie');

    expect(product).toMatchObject({
      id: 'observed-hoodie',
      handle: 'observed-hoodie',
      name: 'Observed Hoodie',
      price: 128,
      currency: 'USD',
      observation: {
        source: 'shopify',
        authority: 'candidate',
        observedAt: '2026-07-23T05:00:00Z',
        review: { status: 'pending' },
      },
    });
    expect(product.variantFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(product.observation.commerceFactsFingerprint).toMatch(
      /^sha256:[a-f0-9]{64}$/
    );
    const request = fetchImpl.mock.calls[0];
    expect(request[0]).toBe(
      'https://example.myshopify.com/api/2024-01/graphql.json'
    );
    expect(JSON.parse(request[1].body).variables).toEqual({
      handle: 'observed-hoodie',
    });
    expect(request[1].cache).toBe('no-store');
  });

  it('turns Shopify GraphQL errors into an explicit adapter error', async () => {
    const loadProduct = createShopifyProductLoader({
      storeDomain: 'example.myshopify.com',
      storefrontToken: 'sanitized-test-token',
      fetchImpl: vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ errors: [{ message: 'Deliberate test error' }] }),
      }),
    });

    await expect(loadProduct('observed-hoodie')).rejects.toMatchObject({
      code: 'SHOPIFY_GRAPHQL_ERROR',
    });
  });
});

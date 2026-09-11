import { createHash } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { createShopifyProductLoader } from '../apps/web/src/lib/providers/shopify/product-loader';

const currentStagingVariantIds = {
  S: 'gid://shopify/ProductVariant/48353314865358',
  M: 'gid://shopify/ProductVariant/48353314898126',
  L: 'gid://shopify/ProductVariant/48353314930894',
};

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
      variantPresentation: {
        schemaVersion: 'cp.variant-presentation.v1',
        combinations: [
          {
            title: 'black / m',
            availableForSale: true,
            selectedOptions: [
              { name: 'Color', value: 'black' },
              { name: 'Size', value: 'm' },
            ],
            price: { amount: '128.00', currency: 'USD' },
          },
        ],
      },
    });
    expect(product.variantPresentation.combinations[0].referenceHash).toMatch(
      /^sha256:[a-f0-9]{64}$/
    );
    expect(JSON.stringify(product.variantPresentation)).not.toContain(
      'gid://shopify'
    );
  });

  it('offers only the approved S/M/L sizes while resolving current Shopify variant IDs', async () => {
    const variant = (size, id, availableForSale = true) => ({
      node: {
        id,
        title: `black / ${size.toLowerCase()}`,
        availableForSale,
        price: { amount: '128.00', currencyCode: 'USD' },
        selectedOptions: [
          { name: 'Color', value: 'black' },
          { name: 'Size', value: size },
        ],
      },
    });
    const edges = [
      variant('XS', 'gid://shopify/ProductVariant/48353314832590'),
      ...Object.entries(currentStagingVariantIds).map(([size, id]) =>
        variant(size, id)
      ),
      variant('XL', 'gid://shopify/ProductVariant/48353314963662'),
      variant('XXL', 'gid://shopify/ProductVariant/48353314996430'),
      variant('XXXL', 'gid://shopify/ProductVariant/48353315029198'),
      variant('4XL', 'gid://shopify/ProductVariant/48353315061966'),
      variant('5XL', 'gid://shopify/ProductVariant/48353315094734'),
    ];
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'x-shopify-api-version': '2026-07' }),
      json: async () => ({
        data: {
          product: {
            id: 'gid://shopify/Product/10',
            handle: 'carlophillips-signature-hoodie',
            title: 'CARLOPHILLIPS Signature Hoodie',
            description: 'Heavyweight black pullover.',
            vendor: 'Apliiq',
            productType: 'Hoodie',
            tags: [],
            tagline: null,
            material: null,
            fit: null,
            care: null,
            sizeGuide: null,
            priceRange: {
              minVariantPrice: { amount: '128.00', currencyCode: 'USD' },
              maxVariantPrice: { amount: '128.00', currencyCode: 'USD' },
            },
            media: { edges: [] },
            variants: { edges },
          },
        },
      }),
    });
    const product = await createShopifyProductLoader({
      storeDomain: 'example.myshopify.com',
      storefrontToken: 'sanitized-test-token',
      fetchImpl,
      environment: 'preview',
      observedAt: () => '2026-09-11T12:00:00Z',
      capabilityEvidence: 'shopify-storefront-runtime',
    })('carlophillips-signature-hoodie');

    expect(product.observedVariants.map((item) => item.title)).toEqual([
      'black / s',
      'black / m',
      'black / l',
    ]);
    expect(product.variants.sizes).toEqual(['S', 'M', 'L']);
    expect(product.variantPresentation.combinations).toHaveLength(3);
    expect(JSON.stringify(product)).not.toContain('48353314832590');
    expect(JSON.stringify(product)).not.toContain('48353314963662');
    for (const id of Object.values(currentStagingVariantIds)) {
      expect(JSON.stringify(product.variantPresentation)).not.toContain(id);
      expect(
        product.variantPresentation.combinations.some(
          (item) =>
            item.referenceHash ===
            `sha256:${createHash('sha256').update(id).digest('hex')}`
        )
      ).toBe(true);
    }
  });
});

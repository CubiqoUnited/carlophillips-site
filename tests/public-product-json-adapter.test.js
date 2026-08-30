import { describe, expect, it } from 'vitest';
import { normalizePublicShopifyProduct } from '../lib/providers/shopify/public-product-json-adapter.js';

const payload = {
  id: 9432704909549,
  handle: 'carlophillips-signature-hoodie',
  title: 'CARLOPHILLIPS Signature Hoodie',
  description: '<div>Heavyweight &amp; structured.</div>',
  vendor: 'Apliiq',
  type: 'hoodie',
  tags: ['Signature'],
  price_min: 12800,
  price_max: 13000,
  images: ['https://cdn.shopify.com/hoodie.jpg'],
  media: [
    {
      id: 40883299221741,
      media_type: 'image',
      src: 'https://cdn.shopify.com/hoodie.jpg',
      alt: 'Signature Hoodie front',
      preview_image: {
        src: 'https://cdn.shopify.com/hoodie.jpg',
        width: 944,
        height: 1440,
      },
    },
  ],
  options: [{ name: 'Color' }, { name: 'Size' }],
  variants: [
    {
      id: 1,
      title: 'black / xs',
      option1: 'black',
      option2: 'xs',
      price: 12800,
      available: true,
    },
    {
      id: 2,
      title: 'black / xxl',
      option1: 'black',
      option2: 'xxl',
      price: 13000,
      available: false,
    },
  ],
};

describe('Shopify public product JSON adapter', () => {
  it('normalizes canonical facts while keeping raw variant references server-ephemeral', () => {
    const product = normalizePublicShopifyProduct(payload);
    expect(product).toMatchObject({
      handle: payload.handle,
      name: payload.title,
      description: 'Heavyweight & structured.',
      vendor: 'Apliiq',
      productType: 'hoodie',
      price: 128,
      compareAtPrice: 130,
      currency: 'USD',
      availableForSale: true,
      variants: { colors: ['black'], sizes: ['xs', 'xxl'] },
    });
    expect(product.observedVariants).toHaveLength(2);
    expect(product.observedVariants[0].id).toBe(
      'gid://shopify/ProductVariant/1'
    );
    expect(product.media).toEqual([
      expect.objectContaining({
        id: 'gid://shopify/MediaImage/40883299221741',
        type: 'image',
        url: 'https://cdn.shopify.com/hoodie.jpg',
      }),
    ]);
  });

  it.each([
    ['invalid product id', { id: 'bad' }],
    ['missing variants', { variants: [] }],
    [
      'invalid variant id',
      { variants: [{ ...payload.variants[0], id: 'bad' }] },
    ],
    ['invalid price', { price_min: -1 }],
  ])('rejects %s', (_label, override) => {
    expect(() =>
      normalizePublicShopifyProduct({ ...payload, ...override })
    ).toThrow();
  });
});

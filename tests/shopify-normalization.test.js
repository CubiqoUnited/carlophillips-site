import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
import { normalizeStorefrontProduct } from '@repo/shopify';

describe('Shopify transport normalization', () => {
  it('preserves query-only product, variant, price, and rich-media truth', () => {
    const product = normalizeStorefrontProduct({
      product: {
        id: 'gid://shopify/Product/1',
        handle: 'signature-hoodie',
        title: 'Signature Hoodie',
        description: 'Heavyweight hoodie\nEmbroidered chest mark',
        descriptionHtml: '<p>Heavyweight hoodie</p>',
        productType: 'Hoodie',
        vendor: 'Apliiq',
        tags: ['Signature'],
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
                id: 'media-image',
                alt: 'Front view',
                previewImage: {
                  url: 'https://cdn.example/front.jpg',
                  altText: 'Front view',
                  width: 800,
                  height: 800,
                },
                image: {
                  url: 'https://cdn.example/front.jpg',
                  altText: 'Front view',
                  width: 800,
                  height: 800,
                },
              },
            },
            {
              node: {
                __typename: 'Video',
                id: 'media-video',
                alt: 'Product film',
                previewImage: {
                  url: 'https://cdn.example/film.jpg',
                  altText: 'Film poster',
                  width: 800,
                  height: 800,
                },
                sources: [
                  {
                    url: 'https://cdn.example/film.mp4',
                    mimeType: 'video/mp4',
                    format: 'mp4',
                  },
                ],
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
      },
    });

    expect(product).toMatchObject({
      schemaVersion: 'cp.shopify-product-transport-input.v1',
      authority: 'transport-only',
      handle: 'signature-hoodie',
      title: 'Signature Hoodie',
      priceRange: {
        minimum: { amount: '128.00', currency: 'USD' },
        maximum: { amount: '128.00', currency: 'USD' },
      },
    });
    expect(product.media.map((item) => item.type)).toEqual(['image', 'video']);
    expect(product.variants[0].rawReference).toBe(
      'gid://shopify/ProductVariant/1'
    );
    expect(product).not.toHaveProperty('releaseState');
    expect(product).not.toHaveProperty('cartAllowed');
  });
});

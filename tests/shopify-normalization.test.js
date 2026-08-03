import { describe, expect, it } from 'vitest';
import { normalizeCart, normalizeProduct } from '../lib/shopify/normalize.js';

describe('Shopify normalization', () => {
  it('preserves product, variant, and real rich-media truth', () => {
    const product = normalizeProduct({
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
              id: 'media-image',
              mediaContentType: 'IMAGE',
              alt: 'Front view',
              previewImage: { url: 'https://cdn.example/front.jpg', width: 800, height: 800 },
              image: { url: 'https://cdn.example/front.jpg', width: 800, height: 800 },
            },
          },
          {
            node: {
              id: 'media-video',
              mediaContentType: 'VIDEO',
              alt: 'Product film',
              previewImage: { url: 'https://cdn.example/film.jpg' },
              sources: [{ url: 'https://cdn.example/film.mp4', mimeType: 'video/mp4' }],
            },
          },
        ],
      },
      variants: {
        edges: [{ node: {
          id: 'gid://shopify/ProductVariant/1',
          availableForSale: true,
          selectedOptions: [
            { name: 'Color', value: 'Black' },
            { name: 'Size', value: 'M' },
          ],
        } }],
      },
    });

    expect(product.id).toBe('signature-hoodie');
    expect(product.handle).toBe('signature-hoodie');
    expect(product.price).toBe(128);
    expect(product.currency).toBe('USD');
    expect(product).toMatchObject({
      description: 'Heavyweight hoodie\nEmbroidered chest mark',
      vendor: 'Apliiq',
      productType: 'Hoodie',
      tagline: 'SIGNATURE',
      details: ['Heavyweight hoodie', 'Embroidered chest mark'],
    });
    expect(product.media.map(item => item.type)).toEqual(['image', 'video']);
    expect(product).not.toHaveProperty('shopifyVariants');
    expect(product).not.toHaveProperty('firstVariantId');
    expect(product.observedVariants[0].id).toBe('gid://shopify/ProductVariant/1');
    expect(product.availableForSale).toBe(true);
  });

  it('maps a Shopify cart into the storefront cart contract', () => {
    const cart = normalizeCart({
      id: 'gid://shopify/Cart/1',
      checkoutUrl: 'https://checkout.example/cart/1',
      totalQuantity: 2,
      cost: {
        subtotalAmount: { amount: '256.00' },
        totalAmount: { amount: '256.00' },
      },
      lines: {
        edges: [{ node: {
          id: 'line-1',
          quantity: 2,
          merchandise: {
            id: 'variant-1',
            price: { amount: '128.00' },
            image: { url: 'https://cdn.example/front.jpg' },
            selectedOptions: [
              { name: 'Color', value: 'Black' },
              { name: 'Size', value: 'M' },
            ],
            product: { handle: 'signature-hoodie', title: 'Signature Hoodie' },
          },
        } }],
      },
    });

    expect(cart.totalQuantity).toBe(2);
    expect(cart.total).toBe(256);
    expect(cart.items[0]).toMatchObject({
      key: 'signature-hoodie-Black-M',
      variantId: 'variant-1',
      lineItemId: 'line-1',
      quantity: 2,
    });
    expect(cart.checkoutUrl).toBe('https://checkout.example/cart/1');
  });
});

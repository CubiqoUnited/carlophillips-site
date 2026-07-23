import { describe, expect, it } from 'vitest';
import { toProductViewModel } from '../lib/commerce/product-view-model.js';

describe('product view model', () => {
  it('normalizes Shopify product and media fields without changing the source', () => {
    const model = toProductViewModel({
      source: 'shopify',
      commerceAllowed: false,
      reason: 'SHOPIFY_PRODUCT_OBSERVED_RELEASE_NOT_APPROVED',
      product: {
        id: 'hoodie',
        name: 'Observed Hoodie',
        price: 128,
        currency: 'USD',
        availableForSale: true,
        variants: { colors: ['Black'], sizes: ['M'] },
        media: [{ id: 'front', type: 'image', url: 'https://cdn.example/front.jpg', alt: 'Front' }],
      },
    });

    expect(model).toMatchObject({
      source: 'shopify',
      title: 'Observed Hoodie',
      colors: ['Black'],
      sizes: ['M'],
      commerceAllowed: false,
    });
    expect(model.media[0]).toMatchObject({ id: 'front', type: 'image', url: 'https://cdn.example/front.jpg' });
  });

  it('returns null for an unavailable decision', () => {
    expect(toProductViewModel({ product: null })).toBeNull();
  });
});

import { createHash } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  addShopifyCartLine,
  removeShopifyCartLine,
  trustedCartCheckoutUrl,
  updateShopifyCartLine,
} from '../apps/web/src/lib/commerce/shopify-cart-server';

const variantId = 'gid://shopify/ProductVariant/100';
const referenceHash = `sha256:${createHash('sha256').update(variantId).digest('hex')}`;
const previousEnv = { ...process.env };

function response(data) {
  return new Response(JSON.stringify({ data }), {
    headers: { 'x-shopify-api-version': '2026-07' },
  });
}

function productData(availableForSale = true) {
  return {
    product: {
      id: 'gid://shopify/Product/10',
      handle: 'signature-hoodie',
      title: 'Signature Hoodie',
      description: 'Heavyweight black pullover.',
      descriptionHtml: '<p>Heavyweight black pullover.</p>',
      productType: 'Hoodie',
      tags: [],
      vendor: 'CarloPhillips',
      priceRange: {
        minVariantPrice: { amount: '180.00', currencyCode: 'EUR' },
        maxVariantPrice: { amount: '180.00', currencyCode: 'EUR' },
      },
      images: { edges: [] },
      media: { edges: [] },
      options: [{ id: 'size', name: 'Size', values: ['M'] }],
      variants: {
        edges: [
          {
            node: {
              id: variantId,
              title: 'M',
              availableForSale,
              price: { amount: '180.00', currencyCode: 'EUR' },
              selectedOptions: [{ name: 'Size', value: 'M' }],
              image: null,
            },
          },
        ],
      },
    },
  };
}

function cart(id = 'gid://shopify/Cart/1') {
  return {
    id,
    checkoutUrl: 'https://example.myshopify.com/checkouts/1',
    totalQuantity: 1,
    cost: {
      subtotalAmount: { amount: '180.00', currencyCode: 'EUR' },
      totalAmount: { amount: '180.00', currencyCode: 'EUR' },
    },
    lines: { edges: [] },
  };
}

beforeEach(() => {
  process.env.SHOPIFY_STORE_DOMAIN = 'example.myshopify.com';
  process.env.SHOPIFY_STOREFRONT_TOKEN = 'test-token';
  process.env.SHOPIFY_CHECKOUT_HOSTS = 'checkout.example.com';
});

afterEach(() => {
  process.env = { ...previousEnv };
});

describe('Shopify cart runtime', () => {
  it('resolves the current Shopify variant and creates a persistent cart', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(response(productData()))
      .mockResolvedValueOnce(
        response({ cartCreate: { cart: cart(), userErrors: [] } })
      );

    await expect(
      addShopifyCartLine({
        cartId: null,
        handle: 'signature-hoodie',
        selectionReferenceHash: referenceHash,
        quantity: 1,
        environment: 'production',
        fetchImpl,
      })
    ).resolves.toMatchObject({ id: 'gid://shopify/Cart/1', totalQuantity: 1 });
    expect(JSON.parse(fetchImpl.mock.calls[1][1].body).variables).toEqual({
      input: { lines: [{ merchandiseId: variantId, quantity: 1 }] },
    });
  });

  it('rejects stale or unavailable variants before any cart mutation', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response(productData(false)));
    await expect(
      addShopifyCartLine({
        cartId: null,
        handle: 'signature-hoodie',
        selectionReferenceHash: referenceHash,
        quantity: 1,
        environment: 'production',
        fetchImpl,
      })
    ).rejects.toMatchObject({ code: 'VARIANT_UNAVAILABLE_OR_STALE' });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('uses Shopify cart line update and removal mutations', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        response({ cartLinesUpdate: { cart: cart(), userErrors: [] } })
      )
      .mockResolvedValueOnce(
        response({ cartLinesRemove: { cart: cart(), userErrors: [] } })
      );
    await expect(
      updateShopifyCartLine({
        cartId: 'cart-id',
        lineId: 'line-id',
        quantity: 2,
        environment: 'production',
        fetchImpl,
      })
    ).resolves.toMatchObject({ id: 'gid://shopify/Cart/1' });
    await expect(
      removeShopifyCartLine({
        cartId: 'cart-id',
        lineId: 'line-id',
        environment: 'production',
        fetchImpl,
      })
    ).resolves.toMatchObject({ id: 'gid://shopify/Cart/1' });
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body).variables.lines).toEqual(
      [{ id: 'line-id', quantity: 2 }]
    );
    expect(
      JSON.parse(fetchImpl.mock.calls[1][1].body).variables.lineIds
    ).toEqual(['line-id']);
  });

  it('allows only configured HTTPS Shopify checkout hosts', () => {
    expect(trustedCartCheckoutUrl(cart(), 'production')).toContain(
      'example.myshopify.com/checkouts/1'
    );
    expect(() =>
      trustedCartCheckoutUrl(
        { ...cart(), checkoutUrl: 'https://attacker.example/pay' },
        'production'
      )
    ).toThrowError('SHOPIFY_CHECKOUT_URL_REJECTED');
  });
});

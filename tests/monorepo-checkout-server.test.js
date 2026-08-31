import { createHash } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { createShopifyCheckout } from '../apps/web/src/lib/commerce/shopify-checkout-server';
import productOffer from '../config/shopify-product-offer.json';

const variantId = 'gid://shopify/ProductVariant/100';
const referenceHash = `sha256:${createHash('sha256')
  .update(variantId)
  .digest('hex')}`;

function capabilityRegistry() {
  return {
    capabilities: [
      {
        capability: 'shopify-storefront-product-read',
        selectedAdapter: 'shopify-storefront-product',
        accessState: 'read_only_verified',
        callableSurface: 'shopify_storefront',
        evidenceRef: 'evidence/product-read.json',
        allowedOperations: ['product-read'],
      },
      {
        capability: 'shopify-storefront-cart',
        selectedAdapter: 'shopify-storefront-cart',
        accessState: 'write_test_verified',
        callableSurface: 'shopify_storefront',
        evidenceRef: 'evidence/cart-write.json',
        allowedOperations: ['cart-write-test'],
      },
    ],
  };
}

function product({ size = 'M', available = true } = {}) {
  return {
    handle: productOffer.handle,
    availableForSale: available,
    observedVariants: [
      {
        id: variantId,
        availableForSale: available,
        selectedOptions: [{ name: 'Size', value: size }],
      },
    ],
  };
}

function options(environment = 'production', productOptions = {}) {
  return {
    handle: productOffer.handle,
    referenceHash,
    quantity: 1,
    environment,
    storeDomain: 'example.myshopify.com',
    storefrontToken: 'test-token',
    capabilityRegistry: capabilityRegistry(),
    loadProductImpl: vi.fn(async () => product(productOptions)),
    fetchImpl: vi.fn(async () => ({
      ok: true,
      json: async () => ({
        data: {
          cartCreate: {
            cart: {
              checkoutUrl: 'https://example.myshopify.com/checkouts/test',
              totalQuantity: 1,
            },
            userErrors: [],
          },
        },
      }),
    })),
  };
}

describe('monorepo checkout boundary', () => {
  it('creates a trusted Shopify cart from a current Production variant', async () => {
    const input = options();

    await expect(createShopifyCheckout(input)).resolves.toEqual({
      ok: true,
      checkoutUrl: 'https://example.myshopify.com/checkouts/test',
      mode: 'production',
    });
    expect(input.fetchImpl).toHaveBeenCalledTimes(1);
    expect(input.fetchImpl.mock.calls[0][1].body).toContain(variantId);
  });

  it('uses a trusted Shopify cart permalink when no Storefront token exists', async () => {
    const input = options();
    input.storefrontToken = undefined;

    await expect(createShopifyCheckout(input)).resolves.toEqual({
      ok: true,
      checkoutUrl: 'https://example.myshopify.com/cart/100:1?checkout',
      mode: 'production',
    });
    expect(input.fetchImpl).not.toHaveBeenCalled();
  });

  it('creates a real isolated Shopify cart in Preview', async () => {
    const input = options('preview');

    await expect(createShopifyCheckout(input)).resolves.toEqual({
      ok: true,
      checkoutUrl: 'https://example.myshopify.com/checkouts/test',
      mode: 'preview',
    });
    expect(input.loadProductImpl).toHaveBeenCalledTimes(1);
    expect(input.fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('does not require release records, fingerprints, or approval states', async () => {
    const input = options();
    input.releaseRecord = { state: 'draft' };
    input.mediaManifest = null;
    input.checkoutAuthorization = null;

    await expect(createShopifyCheckout(input)).resolves.toEqual({
      ok: true,
      checkoutUrl: 'https://example.myshopify.com/checkouts/test',
      mode: 'production',
    });
  });

  it('rejects a size outside the configured S/M/L product scope', async () => {
    const input = options('production', { size: 'XL' });
    await expect(createShopifyCheckout(input)).resolves.toEqual({
      ok: false,
      reason: 'VARIANT_UNAVAILABLE_OR_STALE',
    });
    expect(input.fetchImpl).not.toHaveBeenCalled();
  });

  it('rejects a variant Shopify currently marks unavailable', async () => {
    const input = options('production', { available: false });
    await expect(createShopifyCheckout(input)).resolves.toEqual({
      ok: false,
      reason: 'SHOPIFY_PRODUCT_UNAVAILABLE',
    });
    expect(input.fetchImpl).not.toHaveBeenCalled();
  });

  it('denies checkout when the technical cart capability is unavailable', async () => {
    const input = options();
    input.capabilityRegistry.capabilities[1].allowedOperations = [];

    await expect(createShopifyCheckout(input)).resolves.toEqual({
      ok: false,
      reason: 'SHOPIFY_CART_CAPABILITY_NOT_READY',
    });
    expect(input.fetchImpl).not.toHaveBeenCalled();
  });

  it('rejects an untrusted checkout host', async () => {
    const input = options();
    input.fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        data: {
          cartCreate: {
            cart: {
              checkoutUrl: 'https://attacker.example/checkout',
              totalQuantity: 1,
            },
            userErrors: [],
          },
        },
      }),
    }));

    await expect(createShopifyCheckout(input)).resolves.toEqual({
      ok: false,
      reason: 'SHOPIFY_CHECKOUT_URL_REJECTED',
    });
  });
});

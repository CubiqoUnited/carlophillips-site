import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { getProductPageDecision } from '../apps/web/src/lib/commerce/product-page-server';

const originalCartFlag = process.env.SHOPIFY_CART_UI_ENABLED;
const originalCheckoutFlag = process.env.SHOPIFY_CHECKOUT_ENABLED;

afterEach(() => {
  if (originalCartFlag === undefined)
    delete process.env.SHOPIFY_CART_UI_ENABLED;
  else process.env.SHOPIFY_CART_UI_ENABLED = originalCartFlag;
  if (originalCheckoutFlag === undefined)
    delete process.env.SHOPIFY_CHECKOUT_ENABLED;
  else process.env.SHOPIFY_CHECKOUT_ENABLED = originalCheckoutFlag;
});

function shopifyProduct() {
  return {
    id: 'hoodie',
    handle: 'hoodie',
    availableForSale: true,
    observedVariants: [
      {
        id: 'gid://shopify/ProductVariant/1',
        title: 'M',
        availableForSale: true,
        price: { amount: '180.00', currencyCode: 'EUR' },
        selectedOptions: [{ name: 'Size', value: 'M' }],
      },
    ],
    media: [],
  };
}

describe('product page runtime authority', () => {
  it('enables Production commerce from current Shopify facts when release safety flags are on', async () => {
    process.env.SHOPIFY_CART_UI_ENABLED = 'true';
    process.env.SHOPIFY_CHECKOUT_ENABLED = 'true';
    const result = await getProductPageDecision({
      environment: 'production',
      mode: 'shopify',
      handle: 'hoodie',
      loadShopifyProduct: vi.fn(async () => shopifyProduct()),
    });
    expect(result.cartActivation).toMatchObject({
      status: 'eligible',
      cartAllowed: true,
      checkoutAllowed: true,
      reason: 'CURRENT_SHOPIFY_PRODUCT_AVAILABLE',
    });
  });

  it('keeps the distinct emergency artifact visibly and server-side disabled', async () => {
    process.env.SHOPIFY_CART_UI_ENABLED = 'false';
    process.env.SHOPIFY_CHECKOUT_ENABLED = 'false';
    const result = await getProductPageDecision({
      environment: 'production',
      mode: 'shopify',
      handle: 'hoodie',
      loadShopifyProduct: vi.fn(async () => shopifyProduct()),
    });
    expect(result.cartActivation).toMatchObject({
      status: 'disabled',
      cartAllowed: false,
      checkoutAllowed: false,
      reason: 'SHOPIFY_CART_SAFETY_DISABLED',
    });
  });

  it('allows isolated Preview checkout rehearsal without a Production checkout flag', async () => {
    process.env.SHOPIFY_CART_UI_ENABLED = 'true';
    delete process.env.SHOPIFY_CHECKOUT_ENABLED;
    const result = await getProductPageDecision({
      environment: 'preview',
      mode: 'shopify',
      handle: 'hoodie',
      loadShopifyProduct: vi.fn(async () => shopifyProduct()),
    });
    expect(result.cartActivation.checkoutAllowed).toBe(true);
  });
});

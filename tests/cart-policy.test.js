import { describe, expect, it, vi } from 'vitest';
import {
  addLocalCartLine,
  assertLocalCartAllowed,
  createEmptyCart,
  parseCheckoutHosts,
  removeLocalCartLine,
  restoreOrCreateCart,
  updateLocalCartLine,
  validateCheckoutUrl,
} from '../lib/commerce/cart-policy';

const line = {
  key: 'hoodie-black-m',
  productId: 'hoodie',
  name: 'Signature Hoodie',
  price: 125,
  quantity: 1,
};

describe('commerce cart policy', () => {
  it('applies deterministic add, update, and remove transitions without mutating input', () => {
    const empty = createEmptyCart();
    const added = addLocalCartLine(empty, line);
    const incremented = addLocalCartLine(added, { ...line, quantity: 2 });
    const updated = updateLocalCartLine(incremented, line.key, 2);
    const removed = removeLocalCartLine(updated, line.key);

    expect(empty.items).toEqual([]);
    expect(added).toMatchObject({
      total: 125,
      subtotal: 125,
      totalQuantity: 1,
    });
    expect(incremented).toMatchObject({ total: 375, totalQuantity: 3 });
    expect(updated).toMatchObject({ total: 250, totalQuantity: 2 });
    expect(removed).toMatchObject({ items: [], total: 0, totalQuantity: 0 });
  });

  it('rejects invalid local quantities', () => {
    expect(() =>
      addLocalCartLine(createEmptyCart(), { ...line, quantity: 0 })
    ).toThrow(TypeError);
    expect(() => updateLocalCartLine(createEmptyCart(), line.key, 1.5)).toThrow(
      TypeError
    );
  });

  it.each(['preview', 'production'])(
    'forbids local carts in %s',
    (environment) => {
      expect(() => assertLocalCartAllowed(environment)).toThrow(
        expect.objectContaining({
          code: 'LOCAL_CART_FORBIDDEN',
        })
      );
    }
  );

  it('restores a valid Shopify cart', async () => {
    const getCart = vi.fn().mockResolvedValue({ id: 'opaque-cart', items: [] });
    const createCart = vi.fn();
    const result = await restoreOrCreateCart({
      cartId: 'opaque-cart',
      getCart,
      createCart,
    });
    expect(result.disposition).toBe('restored');
    expect(createCart).not.toHaveBeenCalled();
  });

  it.each([
    ['missing', null],
    ['expired', new Error('expired')],
  ])(
    'creates a Shopify cart when the stored cart is %s',
    async (_label, restoredValue) => {
      const getCart =
        restoredValue instanceof Error
          ? vi.fn().mockRejectedValue(restoredValue)
          : vi.fn().mockResolvedValue(restoredValue);
      const createCart = vi
        .fn()
        .mockResolvedValue({ id: 'new-opaque-cart', items: [] });
      const result = await restoreOrCreateCart({
        cartId: 'old-opaque-cart',
        getCart,
        createCart,
      });
      expect(result).toMatchObject({
        disposition: 'replaced',
        cart: { id: 'new-opaque-cart' },
      });
    }
  );

  it('allows only exact HTTPS checkout hosts', () => {
    const hosts = parseCheckoutHosts('checkout.shopify.com, shop.example.com');
    expect(
      validateCheckoutUrl('https://checkout.shopify.com/c/abc', hosts)
    ).toBe('https://checkout.shopify.com/c/abc');
    expect(
      validateCheckoutUrl('http://checkout.shopify.com/c/abc', hosts)
    ).toBe('');
    expect(
      validateCheckoutUrl('https://checkout.shopify.com.evil.test/c/abc', hosts)
    ).toBe('');
    expect(validateCheckoutUrl('not a url', hosts)).toBe('');
  });
});

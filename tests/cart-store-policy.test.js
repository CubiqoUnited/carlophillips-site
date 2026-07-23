import { afterEach, describe, expect, it, vi } from 'vitest';

const product = {
  id: 'hoodie',
  name: 'Signature Hoodie',
  price: 125,
  images: ['/fixture.jpg'],
};

function localStorageDouble() {
  const values = new Map();
  return {
    getItem: vi.fn(key => values.get(key) ?? null),
    setItem: vi.fn((key, value) => values.set(key, value)),
    removeItem: vi.fn(key => values.delete(key)),
  };
}

function localStorageWithCart(cart) {
  const storage = localStorageDouble();
  storage.setItem('carlophillips_cart', JSON.stringify(cart));
  return storage;
}

async function loadStore(environment) {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_COMMERCE_ENVIRONMENT', environment);
  vi.stubEnv('NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN', '');
  vi.stubEnv('NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN', '');
  vi.stubGlobal('window', {});
  vi.stubGlobal('localStorage', localStorageDouble());
  return import('../lib/store/cart.js');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('legacy cart store environment policy', () => {
  it.each(['preview', 'production'])('does not invent a local cart in %s', async environment => {
    const store = await loadStore(environment);
    await expect(store.addToCart(product, 'Black', 'M')).rejects.toMatchObject({
      code: 'LOCAL_CART_FORBIDDEN',
    });
  });

  it.each(['preview', 'production'])('rejects a stored fixture even when Shopify is configured in %s', async environment => {
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_COMMERCE_ENVIRONMENT', environment);
    vi.stubEnv('NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN', 'store.example.com');
    vi.stubEnv('NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN', 'public-test-placeholder');
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', localStorageWithCart({
      source: 'fixture',
      items: [],
      total: 0,
      checkoutUrl: '',
    }));
    const store = await import('../lib/store/cart.js');
    expect(() => store.getCart()).toThrow(expect.objectContaining({
      code: 'LOCAL_CART_FORBIDDEN',
    }));
  });

  it('permits an explicitly local, non-checkout fixture cart', async () => {
    const store = await loadStore('local');
    const cart = await store.addToCart(product, 'Black', 'M');
    expect(cart).toMatchObject({ source: 'fixture', totalQuantity: 1, total: 125 });
    expect(store.getCheckoutUrl()).toBe('');
    expect(store.isCheckoutAvailable()).toBe(false);
  });
});

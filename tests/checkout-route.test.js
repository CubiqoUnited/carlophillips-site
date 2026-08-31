import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/commerce/shopify-checkout-server', () => ({
  createShopifyCheckout: vi.fn(async () => ({
    ok: true,
    checkoutUrl: 'https://example.myshopify.com/checkouts/test',
  })),
}));
vi.mock('@/lib/config/product-visibility', () => ({
  getCommerceEnvironment: () => 'production',
}));
import { createShopifyCheckout } from '@/lib/commerce/shopify-checkout-server';
import { POST } from '../app/api/checkout/route.js';

function checkoutRequest(origin) {
  const form = new FormData();
  form.set('handle', 'carlophillips-signature-hoodie');
  form.set('referenceHash', `sha256:${'a'.repeat(64)}`);
  form.set('quantity', '1');
  return new Request('https://preview.example/api/checkout', {
    method: 'POST',
    headers: origin ? { origin } : {},
    body: form,
  });
}

describe('checkout POST boundary', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([
    ['a missing Origin header', undefined],
    ['a cross-origin request', 'https://attacker.example'],
    ['a malformed Origin header', 'not-a-url'],
  ])('rejects %s before cart creation', async (_label, origin) => {
    const response = await POST(checkoutRequest(origin));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: 'ORIGIN_REJECTED',
    });
    expect(createShopifyCheckout).not.toHaveBeenCalled();
  });

  it('accepts the exact same origin and redirects to the sanitized hosted checkout URL', async () => {
    const response = await POST(checkoutRequest('https://preview.example'));

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(
      'https://example.myshopify.com/checkouts/test'
    );
    expect(createShopifyCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        handle: 'carlophillips-signature-hoodie',
        environment: 'production',
        quantity: 1,
      })
    );
  });
});

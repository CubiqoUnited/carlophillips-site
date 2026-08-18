import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/admin/access-server', () => ({
  evaluateAdminRequest: vi.fn(async () => ({ allowed: true, role: 'product_owner' })),
}));
vi.mock('@/lib/commerce/shopify-checkout-server', () => ({
  createControlledMediumCheckout: vi.fn(async () => ({
    ok: true,
    checkoutUrl: 'https://example.myshopify.com/checkouts/controlled',
  })),
}));
vi.mock('@/lib/config/product-visibility', () => ({
  getCommerceEnvironment: () => 'preview',
}));
vi.mock('@/lib/releases/product-release-registry', () => ({
  getProductReleaseEvidence: () => ({ releaseRecord: { releaseId: 'release-1' } }),
}));
vi.mock('@/config/shopify-controlled-order-authorization.json', () => ({
  default: { handle: 'carlophillips-signature-hoodie' },
}));

import { evaluateAdminRequest } from '@/lib/admin/access-server';
import { createControlledMediumCheckout } from '@/lib/commerce/shopify-checkout-server';
import { POST } from '../app/api/admin/controlled-order/route.js';

function request(origin = 'https://preview.example') {
  return new Request('https://preview.example/api/admin/controlled-order', {
    method: 'POST',
    headers: origin ? { origin } : {},
  });
}

describe('Product Owner controlled-order route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    evaluateAdminRequest.mockResolvedValue({ allowed: true, role: 'product_owner' });
  });

  it.each([
    ['anonymous', { allowed: false, reason: 'authenticated_session_required' }],
    ['reviewer', { allowed: false, reason: 'product_owner_required', role: 'reviewer' }],
  ])('conceals the route from %s access', async (_label, decision) => {
    evaluateAdminRequest.mockResolvedValue(decision);
    const response = await POST(request());
    expect(response.status).toBe(404);
    expect(response.headers.get('cache-control')).toBe('no-store, private');
    expect(createControlledMediumCheckout).not.toHaveBeenCalled();
  });

  it.each([
    ['missing origin', null],
    ['cross origin', 'https://attacker.example'],
    ['malformed origin', 'not-a-url'],
  ])('rejects %s after Product Owner authentication', async (_label, origin) => {
    const response = await POST(request(origin));
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: 'ORIGIN_REJECTED' });
    expect(createControlledMediumCheckout).not.toHaveBeenCalled();
  });

  it('passes no user-selected product, size, quantity, or raw variant reference', async () => {
    const response = await POST(request());
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('https://example.myshopify.com/checkouts/controlled');
    expect(createControlledMediumCheckout).toHaveBeenCalledWith(expect.objectContaining({
      environment: 'preview',
      releaseRecord: { releaseId: 'release-1' },
    }));
    const serialized = JSON.stringify(createControlledMediumCheckout.mock.calls[0][0]);
    expect(serialized).not.toContain('variantId');
    expect(serialized).not.toContain('quantity');
    expect(serialized).not.toContain('size');
  });
});

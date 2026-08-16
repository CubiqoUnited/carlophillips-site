import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/admin/access-server', () => ({
  evaluateAdminRequest: vi.fn(),
}));
vi.mock('@/lib/providers/shopify/storefront-product-adapter', () => ({
  loadShopifyProduct: vi.fn(),
}));

import { evaluateAdminRequest } from '@/lib/admin/access-server';
import { loadShopifyProduct } from '@/lib/providers/shopify/storefront-product-adapter';
import { GET } from '../app/api/admin/commerce-observation/route.js';

const fingerprint = `sha256:${'a'.repeat(64)}`;
const observation = {
  schemaVersion: 'cp.product-observation.v1',
  source: 'shopify',
  authority: 'candidate',
  environment: 'preview',
  observedAt: '2026-08-17T00:00:00Z',
  capabilityEvidence: 'evidence/storefront-read.json',
  product: {
    handle: 'carlophillips-signature-hoodie',
    title: 'CARLOPHILLIPS Signature Hoodie',
  },
  variants: [{ referenceHash: fingerprint, title: 'black / xs' }],
  variantFingerprint: fingerprint,
  commerceFactsFingerprint: fingerprint,
  observationFingerprint: fingerprint,
  review: { status: 'pending', owner: 'Product Owner/designee', evidence: null },
};

describe('Product Owner commerce observation endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    evaluateAdminRequest.mockResolvedValue({ allowed: true, role: 'product_owner' });
    loadShopifyProduct.mockResolvedValue({
      id: 'gid://shopify/Product/secret',
      observedVariants: [{ id: 'gid://shopify/ProductVariant/secret' }],
      observation,
    });
  });

  it('returns only the sanitized observation with private no-store headers', async () => {
    const response = await GET(new Request('https://staging.carlophillips.com/api/admin/commerce-observation'));

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store, private');
    await expect(response.json()).resolves.toEqual({
      releaseId: 'cp-signature-hoodie-2026-001',
      handle: 'carlophillips-signature-hoodie',
      observation,
    });
    expect(loadShopifyProduct).toHaveBeenCalledWith('carlophillips-signature-hoodie');
    expect(evaluateAdminRequest).toHaveBeenCalledWith(expect.any(Headers), {
      requiredRole: 'product_owner',
    });
  });

  it('fails closed for an unauthenticated or wrong-role request', async () => {
    evaluateAdminRequest.mockResolvedValue({ allowed: false, reason: 'not_found' });

    const response = await GET(new Request('https://staging.carlophillips.com/api/admin/commerce-observation'));

    expect(response.status).toBe(404);
    expect(loadShopifyProduct).not.toHaveBeenCalled();
  });

  it('does not leak provider errors or return a partial observation', async () => {
    loadShopifyProduct.mockRejectedValue(new Error('token and raw provider error'));

    const response = await GET(new Request('https://staging.carlophillips.com/api/admin/commerce-observation'));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: 'Product observation unavailable',
    });
  });
});

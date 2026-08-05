import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { createProductObservation, attachObservationToProduct } from '../lib/commerce/product-observation.js';
import { evaluateSingleProductLaunch } from '../lib/commerce/single-product-launch-policy.js';
import { createApprovedHoodieCheckout } from '../lib/commerce/shopify-checkout-server.js';

function currentProduct(environment = 'production') {
  const product = {
    id: 'approved-hoodie',
    handle: 'approved-hoodie',
    name: 'Approved Hoodie',
    description: 'Truthful description.',
    vendor: 'Verified provider',
    productType: 'Hoodie',
    tagline: 'HOODIE',
    details: ['Truthful description.'],
    price: 128,
    compareAtPrice: 128,
    currency: 'USD',
    availableForSale: true,
    media: [],
    observedVariants: [{
      id: 'gid://shopify/ProductVariant/test-one',
      title: 'Black / M',
      availableForSale: true,
      price: { amount: '128.00', currencyCode: 'USD' },
      selectedOptions: [{ name: 'Color', value: 'Black' }, { name: 'Size', value: 'M' }],
    }],
  };
  const observation = createProductObservation({
    source: 'shopify',
    environment,
    observedAt: '2026-08-04T20:00:00Z',
    product,
    capabilityEvidence: 'evidence/storefront-read.json',
  });
  return attachObservationToProduct(product, observation);
}

function approvalFor(product) {
  return {
    status: 'approved',
    environment: 'production',
    handle: product.handle,
    scope: 'single-product-shopify-checkout',
    mediaPolicy: 'truthful-current-shopify-media-only',
    approvalOwner: 'Product Owner',
    approvalEvidence: 'durable test approval',
    variantFingerprint: product.observation.variantFingerprint,
    commerceFactsFingerprint: product.observation.commerceFactsFingerprint,
  };
}

describe('single-product production commerce launch', () => {
  it('requires exact current identity and commerce facts', () => {
    const product = currentProduct();
    const approval = approvalFor(product);
    expect(evaluateSingleProductLaunch({ environment: 'production', shopifyProduct: product, approval }).ready).toBe(true);

    const stale = structuredClone(product);
    stale.observation.product.minimumPrice = 129;
    expect(evaluateSingleProductLaunch({ environment: 'production', shopifyProduct: stale, approval }).ready).toBe(false);
    const previewProduct = currentProduct('preview');
    const previewApproval = { ...approvalFor(previewProduct), environment: 'production' };
    expect(evaluateSingleProductLaunch({ environment: 'preview', shopifyProduct: previewProduct, approval: previewApproval }).ready).toBe(true);
  });

  it('creates only a server-side Shopify cart for the exact approved opaque variant', async () => {
    const product = currentProduct();
    const approval = approvalFor(product);
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { cartCreate: { cart: { checkoutUrl: 'https://example.myshopify.com/checkouts/test', totalQuantity: 1 }, userErrors: [] } },
      }),
    });
    const result = await createApprovedHoodieCheckout({
      handle: product.handle,
      referenceHash: product.observation.variants[0].referenceHash,
      quantity: 1,
      storeDomain: 'example.myshopify.com',
      storefrontToken: 'sanitized-test-token',
      fetchImpl,
      loadProductImpl: vi.fn().mockResolvedValue(product),
      launchApproval: approval,
    });

    expect(result).toEqual({ ok: true, checkoutUrl: 'https://example.myshopify.com/checkouts/test' });
    const request = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(request.query).toContain('cartCreate');
    expect(request.variables.input.lines).toHaveLength(1);
    expect(JSON.stringify(result)).not.toContain('gid://');
  });

  it('rejects unknown opaque references without a Shopify mutation', async () => {
    const product = currentProduct();
    const fetchImpl = vi.fn();
    const result = await createApprovedHoodieCheckout({
      handle: product.handle,
      referenceHash: `sha256:${'0'.repeat(64)}`,
      quantity: 1,
      storeDomain: 'example.myshopify.com',
      storefrontToken: 'sanitized-test-token',
      fetchImpl,
      loadProductImpl: vi.fn().mockResolvedValue(product),
      launchApproval: approvalFor(product),
    });
    expect(result).toEqual({ ok: false, reason: 'VARIANT_UNAVAILABLE_OR_STALE' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('fails closed before a read when Shopify is not configured', async () => {
    await expect(createApprovedHoodieCheckout({
      handle: 'approved-hoodie',
      referenceHash: `sha256:${'0'.repeat(64)}`,
      quantity: 1,
      storeDomain: '',
      storefrontToken: '',
    })).resolves.toEqual({ ok: false, reason: 'SHOPIFY_NOT_CONFIGURED' });
  });
});

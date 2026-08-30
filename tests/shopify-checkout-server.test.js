import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { createApprovedHoodieCheckout } from '../lib/commerce/shopify-checkout-server.js';
import {
  createCompleteMediaManifest,
  createCompleteReleaseRecord,
} from './fixtures/release-fixtures.js';

const variantId = 'gid://shopify/ProductVariant/100';
const referenceHash = `sha256:${createHash('sha256').update(variantId).digest('hex')}`;
const originalCheckoutEnabled = process.env.SHOPIFY_CHECKOUT_ENABLED;

afterEach(() => {
  if (originalCheckoutEnabled === undefined) delete process.env.SHOPIFY_CHECKOUT_ENABLED;
  else process.env.SHOPIFY_CHECKOUT_ENABLED = originalCheckoutEnabled;
});

function readyCapabilityRegistry() {
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
        accessState: 'write_verified',
        callableSurface: 'shopify_storefront',
        evidenceRef: 'evidence/cart-write.json',
        allowedOperations: ['cart-write'],
      },
    ],
  };
}

function authorization(record) {
  return {
    status: 'approved',
    owner: 'Product Owner',
    scope: 'shopify-hosted-checkout-redirect',
    releaseId: record.releaseId,
    handle: record.shopify.handle,
    environments: ['preview', 'production'],
    evidence: 'Product Owner checkout approval',
  };
}

function currentProduct(record) {
  return {
    handle: record.shopify.handle,
    availableForSale: true,
    observedVariants: [{ id: variantId, availableForSale: true }],
    observation: {
      variantFingerprint: record.shopify.variantFingerprint,
      commerceFactsFingerprint: record.shopify.commerceFactsFingerprint,
    },
  };
}

function approvedOptions(overrides = {}) {
  const releaseRecord = createCompleteReleaseRecord('released');
  return {
    handle: releaseRecord.shopify.handle,
    referenceHash,
    quantity: 1,
    environment: 'production',
    releaseRecord,
    mediaManifest: createCompleteMediaManifest(),
    checkoutAuthorization: authorization(releaseRecord),
    storeDomain: 'example.myshopify.com',
    storefrontToken: 'test-token',
    capabilityRegistry: readyCapabilityRegistry(),
    productOfferConfig: {
      schemaVersion: 'cp.shopify-product-offer.v1',
      releaseId: releaseRecord.releaseId,
      handle: releaseRecord.shopify.handle,
      allowedSizes: ['M'],
      allowedReferenceHashes: [referenceHash],
      evidence: 'Test-scoped reviewed product offer',
    },
    loadProductImpl: vi.fn(async () => currentProduct(releaseRecord)),
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
    ...overrides,
  };
}

describe('release-bound Shopify checkout handoff', () => {
  it('creates a server-only cart and returns the trusted hosted checkout URL', async () => {
    delete process.env.SHOPIFY_CHECKOUT_ENABLED;
    const options = approvedOptions();
    const result = await createApprovedHoodieCheckout(options);

    expect(result).toEqual({
      ok: true,
      checkoutUrl: 'https://example.myshopify.com/checkouts/test',
    });
    expect(options.fetchImpl).toHaveBeenCalledTimes(1);
    const request = options.fetchImpl.mock.calls[0][1];
    expect(request.headers['X-Shopify-Storefront-Access-Token']).toBe('test-token');
    expect(request.body).toContain(variantId);
    expect(JSON.stringify(result)).not.toContain(variantId);
  });

  it('does not reintroduce the obsolete checkout switch for authorized Production', async () => {
    process.env.SHOPIFY_CHECKOUT_ENABLED = 'false';
    const options = approvedOptions();

    await expect(createApprovedHoodieCheckout(options)).resolves.toEqual({
      ok: true,
      checkoutUrl: 'https://example.myshopify.com/checkouts/test',
    });
    expect(options.fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('denies before any Shopify call when the release is still Draft', async () => {
    const releaseRecord = createCompleteReleaseRecord('draft');
    const fetchImpl = vi.fn();
    const loadProductImpl = vi.fn();
    const result = await createApprovedHoodieCheckout(approvedOptions({
      releaseRecord,
      checkoutAuthorization: authorization(releaseRecord),
      fetchImpl,
      loadProductImpl,
    }));

    expect(result).toEqual({ ok: false, reason: 'PRODUCT_RELEASE_NOT_RELEASED' });
    expect(loadProductImpl).not.toHaveBeenCalled();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('rejects a variant outside the reviewed customer offer before Shopify access', async () => {
    const options = approvedOptions({ referenceHash: `sha256:${'f'.repeat(64)}` });
    const result = await createApprovedHoodieCheckout(options);
    expect(result).toEqual({ ok: false, reason: 'VARIANT_OUTSIDE_APPROVED_OFFER' });
    expect(options.loadProductImpl).not.toHaveBeenCalled();
    expect(options.fetchImpl).not.toHaveBeenCalled();
  });

  it.each([
    ['missing Product Owner authorization', { checkoutAuthorization: null }, 'CHECKOUT_REQUIRES_SEPARATE_RELEASE_BOUND_AUTHORIZATION'],
    ['Preview environment', { environment: 'preview' }, 'CHECKOUT_ENVIRONMENT_REJECTED'],
    ['local environment', { environment: 'local' }, 'CHECKOUT_REQUIRES_SEPARATE_RELEASE_BOUND_AUTHORIZATION'],
    ['unverified cart capability', { capabilityRegistry: { capabilities: [] } }, 'SHOPIFY_CART_CAPABILITY_NOT_READY'],
  ])('fails closed for %s', async (_label, override, reason) => {
    const options = approvedOptions(override);
    const result = await createApprovedHoodieCheckout(options);
    expect(result).toEqual({ ok: false, reason });
    expect(options.fetchImpl).not.toHaveBeenCalled();
  });

  it('rejects a stale current product fingerprint before cart creation', async () => {
    const options = approvedOptions();
    options.loadProductImpl = vi.fn(async () => ({
      ...currentProduct(options.releaseRecord),
      observation: {
        ...currentProduct(options.releaseRecord).observation,
        variantFingerprint: `sha256:${'0'.repeat(64)}`,
      },
    }));
    const result = await createApprovedHoodieCheckout(options);

    expect(result).toEqual({ ok: false, reason: 'SHOPIFY_RELEASE_BINDING_STALE' });
    expect(options.fetchImpl).not.toHaveBeenCalled();
  });

  it('rejects a checkout URL from any host other than the configured Shopify store', async () => {
    const options = approvedOptions();
    options.fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        data: {
          cartCreate: {
            cart: { checkoutUrl: 'https://attacker.example/checkout', totalQuantity: 1 },
            userErrors: [],
          },
        },
      }),
    }));
    const result = await createApprovedHoodieCheckout(options);

    expect(result).toEqual({ ok: false, reason: 'SHOPIFY_CHECKOUT_URL_REJECTED' });
  });

  it('accepts an explicitly configured custom Shopify checkout host', async () => {
    const options = approvedOptions({ checkoutHosts: 'www.carlophillips.com' });
    options.fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        data: {
          cartCreate: {
            cart: { checkoutUrl: 'https://www.carlophillips.com/checkouts/test', totalQuantity: 1 },
            userErrors: [],
          },
        },
      }),
    }));

    await expect(createApprovedHoodieCheckout(options)).resolves.toEqual({
      ok: true,
      checkoutUrl: 'https://www.carlophillips.com/checkouts/test',
    });
  });
});

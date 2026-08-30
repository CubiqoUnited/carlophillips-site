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
  if (originalCheckoutEnabled === undefined)
    delete process.env.SHOPIFY_CHECKOUT_ENABLED;
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

function productionLaunchAuthorization(record) {
  return {
    schemaVersion: 'cp.product-owner-production-launch-authorization.v1',
    status: 'approved',
    owner: 'Product Owner',
    releaseId: record.releaseId,
    handle: record.shopify.handle,
    candidateCommit: record.candidate.gitCommit,
    approvedTargetFingerprint: record.candidate.releaseEvidenceFingerprint,
    environments: ['production'],
    scopes: ['activate-exact-reviewed-offer'],
    commerceActivation: {
      status: 'approved',
      cartWriteEvidence:
        'evidence/shopify/cp-signature-hoodie-production-cart-write-2026-08-30.json',
      allowedReferenceHashes: [referenceHash],
      maximumQuantity: 5,
    },
    evidence: 'Test-scoped exact Product Owner launch authorization',
  };
}

function productionCartWriteProof(record) {
  return {
    schemaVersion: 'cp.shopify-cart-write-proof.v1',
    releaseId: record.releaseId,
    handle: record.shopify.handle,
    candidateCommit: record.candidate.gitCommit,
    approvedTargetFingerprint: record.candidate.releaseEvidenceFingerprint,
    environment: 'production',
    request: { referenceHash, quantity: 1 },
    response: {
      status: 303,
      protocol: 'https:',
      trustedCheckoutHost: 'carlophillips.myshopify.com',
      redirectFollowed: false,
      responseBodyBytes: 0,
    },
    negativeChecks: {
      crossOrigin: { status: 403, reason: 'ORIGIN_REJECTED' },
      unapprovedReference: {
        status: 409,
        reason: 'VARIANT_OUTSIDE_APPROVED_OFFER',
      },
    },
    customerDataProvided: false,
    paymentAttempted: false,
    orderSubmitted: false,
    fulfillmentInvoked: false,
    privateCheckoutUrlRetained: false,
    evidenceBoundary: 'Sanitized test proof without a private checkout URL.',
  };
}

function cartProofCapabilityRegistry() {
  const registry = readyCapabilityRegistry();
  registry.capabilities[1] = {
    ...registry.capabilities[1],
    accessState: 'write_test_verified',
    allowedOperations: ['cart-write-test'],
    blocker: {
      code: 'CART_WRITE_TEST_EVIDENCE_ONLY',
      humanAction: 'Capture a release-bound operational cart proof.',
      resumePoint: 'Reclassify only after the exact proof passes.',
    },
  };
  return registry;
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
    expect(request.headers['X-Shopify-Storefront-Access-Token']).toBe(
      'test-token'
    );
    expect(request.body).toContain(variantId);
    expect(JSON.stringify(result)).not.toContain(variantId);
  });

  it('accepts the exact Shopify Shop checkout host returned by the live cart flow', async () => {
    const options = approvedOptions({ checkoutHosts: 'shop.app' });
    options.fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        data: {
          cartCreate: {
            cart: {
              checkoutUrl: 'https://shop.app/checkout/example',
              totalQuantity: 1,
            },
            userErrors: [],
          },
        },
      }),
    }));

    await expect(createApprovedHoodieCheckout(options)).resolves.toEqual({
      ok: true,
      checkoutUrl: 'https://shop.app/checkout/example',
    });
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

  it('creates carts only for the exact proof-bound offer from Staged Production', async () => {
    const releaseRecord = createCompleteReleaseRecord('staged');
    releaseRecord.approvals.media.owner = 'Product Owner';
    releaseRecord.approvals.fulfillment.owner = 'Product Owner';
    const input = approvedOptions({
      releaseRecord,
      checkoutAuthorization: authorization(releaseRecord),
      capabilityRegistry: cartProofCapabilityRegistry(),
      productionLaunchAuthorization:
        productionLaunchAuthorization(releaseRecord),
      productionCartWriteProof: productionCartWriteProof(releaseRecord),
      loadProductImpl: vi.fn(async () => currentProduct(releaseRecord)),
    });

    await expect(createApprovedHoodieCheckout(input)).resolves.toEqual({
      ok: true,
      checkoutUrl: 'https://example.myshopify.com/checkouts/test',
    });
    expect(input.fetchImpl).toHaveBeenCalledTimes(1);
    expect(input.fetchImpl.mock.calls[0][1].body).toContain(variantId);
  });

  it('denies Staged Production when the proof is not bound to the candidate', async () => {
    const releaseRecord = createCompleteReleaseRecord('staged');
    releaseRecord.approvals.media.owner = 'Product Owner';
    releaseRecord.approvals.fulfillment.owner = 'Product Owner';
    const input = approvedOptions({
      releaseRecord,
      checkoutAuthorization: authorization(releaseRecord),
      capabilityRegistry: cartProofCapabilityRegistry(),
      productionLaunchAuthorization:
        productionLaunchAuthorization(releaseRecord),
      productionCartWriteProof: {
        ...productionCartWriteProof(releaseRecord),
        candidateCommit: 'different-candidate',
      },
      loadProductImpl: vi.fn(async () => currentProduct(releaseRecord)),
    });

    await expect(createApprovedHoodieCheckout(input)).resolves.toEqual({
      ok: false,
      reason: 'PRODUCT_RELEASE_NOT_RELEASED',
    });
    expect(input.loadProductImpl).not.toHaveBeenCalled();
    expect(input.fetchImpl).not.toHaveBeenCalled();
  });

  it('denies before any Shopify call when the release is still Draft', async () => {
    const releaseRecord = createCompleteReleaseRecord('draft');
    const fetchImpl = vi.fn();
    const loadProductImpl = vi.fn();
    const result = await createApprovedHoodieCheckout(
      approvedOptions({
        releaseRecord,
        checkoutAuthorization: authorization(releaseRecord),
        fetchImpl,
        loadProductImpl,
      })
    );

    expect(result).toEqual({
      ok: false,
      reason: 'PRODUCT_RELEASE_NOT_RELEASED',
    });
    expect(loadProductImpl).not.toHaveBeenCalled();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('rejects a variant outside the reviewed customer offer before Shopify access', async () => {
    const options = approvedOptions({
      referenceHash: `sha256:${'f'.repeat(64)}`,
    });
    const result = await createApprovedHoodieCheckout(options);
    expect(result).toEqual({
      ok: false,
      reason: 'VARIANT_OUTSIDE_APPROVED_OFFER',
    });
    expect(options.loadProductImpl).not.toHaveBeenCalled();
    expect(options.fetchImpl).not.toHaveBeenCalled();
  });

  it.each([
    [
      'missing Product Owner authorization',
      { checkoutAuthorization: null },
      'CHECKOUT_REQUIRES_SEPARATE_RELEASE_BOUND_AUTHORIZATION',
    ],
    [
      'Preview environment',
      { environment: 'preview' },
      'CHECKOUT_ENVIRONMENT_REJECTED',
    ],
    [
      'local environment',
      { environment: 'local' },
      'CHECKOUT_REQUIRES_SEPARATE_RELEASE_BOUND_AUTHORIZATION',
    ],
    [
      'unverified cart capability',
      { capabilityRegistry: { capabilities: [] } },
      'SHOPIFY_CART_CAPABILITY_NOT_READY',
    ],
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

    expect(result).toEqual({
      ok: false,
      reason: 'SHOPIFY_RELEASE_BINDING_STALE',
    });
    expect(options.fetchImpl).not.toHaveBeenCalled();
  });

  it('rejects a checkout URL from any host other than the configured Shopify store', async () => {
    const options = approvedOptions();
    options.fetchImpl = vi.fn(async () => ({
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
    const result = await createApprovedHoodieCheckout(options);

    expect(result).toEqual({
      ok: false,
      reason: 'SHOPIFY_CHECKOUT_URL_REJECTED',
    });
  });

  it('accepts an explicitly configured custom Shopify checkout host', async () => {
    const options = approvedOptions({ checkoutHosts: 'www.carlophillips.com' });
    options.fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        data: {
          cartCreate: {
            cart: {
              checkoutUrl: 'https://www.carlophillips.com/checkouts/test',
              totalQuantity: 1,
            },
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

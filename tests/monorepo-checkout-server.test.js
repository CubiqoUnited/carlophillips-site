import { createHash } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { createApprovedHoodieCheckout } from '../apps/web/src/lib/commerce/shopify-checkout-server';
import {
  createCompleteMediaManifest,
  createCompleteReleaseRecord,
} from './fixtures/release-fixtures.js';

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
    evidence: 'Test-scoped Product Owner checkout approval',
  };
}

function product(record) {
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

function options(state = 'released', environment = 'production') {
  const releaseRecord = createCompleteReleaseRecord(state);
  return {
    handle: releaseRecord.shopify.handle,
    referenceHash,
    quantity: 1,
    environment,
    releaseRecord,
    mediaManifest: createCompleteMediaManifest(),
    checkoutAuthorization: authorization(releaseRecord),
    storeDomain: 'example.myshopify.com',
    storefrontToken: 'test-token',
    capabilityRegistry: capabilityRegistry(),
    productOfferConfig: {
      schemaVersion: 'cp.shopify-product-offer.v1',
      releaseId: releaseRecord.releaseId,
      handle: releaseRecord.shopify.handle,
      allowedSizes: ['M'],
      allowedReferenceHashes: [referenceHash],
      evidence: 'Test-scoped reviewed product offer',
    },
    loadProductImpl: vi.fn(async () => product(releaseRecord)),
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
  it('creates a trusted Shopify cart only in authorized Production', async () => {
    const input = options();

    await expect(createApprovedHoodieCheckout(input)).resolves.toEqual({
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

    await expect(createApprovedHoodieCheckout(input)).resolves.toEqual({
      ok: true,
      checkoutUrl: 'https://example.myshopify.com/cart/100:1?checkout',
      mode: 'production',
    });
    expect(input.fetchImpl).not.toHaveBeenCalled();
  });

  it('rehearses a Staged Preview without creating a Shopify cart', async () => {
    const input = options('staged', 'preview');

    await expect(createApprovedHoodieCheckout(input)).resolves.toEqual({
      ok: true,
      checkoutUrl: '/checkout/confirm?mode=preview',
      mode: 'preview',
    });
    expect(input.loadProductImpl).toHaveBeenCalledTimes(1);
    expect(input.fetchImpl).not.toHaveBeenCalled();
  });

  it('denies Draft Preview before product reads or writes', async () => {
    const input = options('draft', 'preview');

    await expect(createApprovedHoodieCheckout(input)).resolves.toEqual({
      ok: false,
      reason: 'PRODUCT_RELEASE_NOT_STAGED',
    });
    expect(input.loadProductImpl).not.toHaveBeenCalled();
    expect(input.fetchImpl).not.toHaveBeenCalled();
  });

  it('denies Production when public cart capability is not evidence-backed', async () => {
    const input = options();
    input.capabilityRegistry.capabilities[1].allowedOperations = [
      'cart-write-test',
    ];

    await expect(createApprovedHoodieCheckout(input)).resolves.toEqual({
      ok: false,
      reason: 'SHOPIFY_CART_CAPABILITY_NOT_READY',
    });
    expect(input.fetchImpl).not.toHaveBeenCalled();
  });

  it('does not treat write-test evidence as operational cart authority', async () => {
    const input = options();
    input.capabilityRegistry.capabilities[1] = {
      ...input.capabilityRegistry.capabilities[1],
      accessState: 'write_test_verified',
      allowedOperations: ['cart-write-test'],
      blocker: {
        code: 'CART_WRITE_TEST_EVIDENCE_ONLY',
        humanAction: 'Capture a release-bound operational cart proof.',
        resumePoint: 'Reclassify only after the exact proof passes.',
      },
    };

    await expect(createApprovedHoodieCheckout(input)).resolves.toEqual({
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

    await expect(createApprovedHoodieCheckout(input)).resolves.toEqual({
      ok: false,
      reason: 'SHOPIFY_CHECKOUT_URL_REJECTED',
    });
  });
});

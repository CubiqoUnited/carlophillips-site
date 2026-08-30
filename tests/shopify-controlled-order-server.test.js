import { createHash } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { createControlledMediumCheckout } from '../lib/commerce/shopify-checkout-server.js';
import { createCompleteReleaseRecord } from './fixtures/release-fixtures.js';

const variantId = 'gid://shopify/ProductVariant/medium';
const referenceHash = `sha256:${createHash('sha256').update(variantId).digest('hex')}`;

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
        accessState: 'write_test_verified',
        callableSurface: 'shopify_storefront',
        evidenceRef: 'evidence/cart-test.json',
        allowedOperations: ['cart-write-test'],
        requiresApproval: ['activation', 'production', 'order'],
        blocker: { code: 'CART_ACTIVATION_AUTHORITY_REQUIRED' },
      },
    ],
  };
}

function stagedRelease() {
  const record = createCompleteReleaseRecord('staged');
  record.shopify.statusObserved = 'ACTIVE';
  record.fulfillmentMappings[0].adapter = 'apliiq';
  record.physicalSample.status = 'not_ordered';
  return record;
}

function authorization(record) {
  return {
    schemaVersion: 'cp.shopify-controlled-order-authorization.v1',
    status: 'approved',
    owner: 'Product Owner',
    scope: 'prepare-one-medium-shopify-checkout',
    releaseId: record.releaseId,
    handle: record.shopify.handle,
    size: 'M',
    quantity: 1,
    maximumItemSubtotal: { amount: '128.00', currency: 'USD' },
    environments: ['preview', 'production'],
    approvedAt: '2026-08-17T00:00:00Z',
    expiresAt: '2026-08-24T23:59:59Z',
    evidence: 'Product Owner approval',
  };
}

function currentProduct(record, overrides = {}) {
  return {
    handle: record.shopify.handle,
    availableForSale: true,
    observation: {
      variantFingerprint: record.shopify.variantFingerprint,
      commerceFactsFingerprint: record.shopify.commerceFactsFingerprint,
    },
    observedVariants: [
      {
        id: variantId,
        title: 'black / m',
        selectedOptions: [
          { name: 'Color', value: 'black' },
          { name: 'Size', value: 'm' },
        ],
        availableForSale: true,
        price: { amount: '128.00', currencyCode: 'USD' },
      },
    ],
    ...overrides,
  };
}

function options(overrides = {}) {
  const releaseRecord = stagedRelease();
  return {
    environment: 'preview',
    releaseRecord,
    controlledOrderAuthorization: authorization(releaseRecord),
    controlledOrderRequested: true,
    storeDomain: 'example.myshopify.com',
    storefrontToken: 'test-token',
    capabilityRegistry: capabilityRegistry(),
    productOfferConfig: {
      schemaVersion: 'cp.shopify-product-offer.v1',
      releaseId: releaseRecord.releaseId,
      handle: releaseRecord.shopify.handle,
      allowedSizes: ['M'],
      allowedReferenceHashes: [referenceHash],
      evidence: 'Test offer',
    },
    now: () => new Date('2026-08-17T12:00:00Z'),
    loadProductImpl: vi.fn(async () => currentProduct(releaseRecord)),
    fetchImpl: vi.fn(async () => ({
      ok: true,
      json: async () => ({
        data: {
          cartCreate: {
            cart: {
              checkoutUrl: 'https://example.myshopify.com/checkouts/controlled',
              totalQuantity: 1,
              cost: {
                subtotalAmount: { amount: '128.00', currencyCode: 'USD' },
              },
            },
            userErrors: [],
          },
        },
      }),
    })),
    ...overrides,
  };
}

describe('Product Owner controlled Medium checkout', () => {
  it('prepares exactly one Medium checkout through the verified Shopify cart path', async () => {
    const input = options();
    const result = await createControlledMediumCheckout(input);

    expect(result).toEqual({
      ok: true,
      checkoutUrl: 'https://example.myshopify.com/checkouts/controlled',
    });
    const request = input.fetchImpl.mock.calls[0][1];
    expect(JSON.parse(request.body).variables.input.lines).toEqual([
      { merchandiseId: variantId, quantity: 1 },
    ]);
    expect(JSON.stringify(result)).not.toContain(variantId);
  });

  it.each([
    [
      'missing authorization',
      { controlledOrderAuthorization: null },
      'CONTROLLED_ORDER_AUTHORIZATION_REQUIRED',
    ],
    [
      'expired authorization',
      { now: () => new Date('2026-08-25T00:00:00Z') },
      'CONTROLLED_ORDER_AUTHORIZATION_REQUIRED',
    ],
    [
      'disabled gate',
      { controlledOrderRequested: false },
      'CONTROLLED_ORDER_ENVIRONMENT_GATE_DISABLED',
    ],
    [
      'local surface',
      { environment: 'local' },
      'CONTROLLED_ORDER_AUTHORIZATION_REQUIRED',
    ],
    [
      'unverified cart evidence',
      { capabilityRegistry: { capabilities: [] } },
      'CONTROLLED_ORDER_CART_CAPABILITY_NOT_VERIFIED',
    ],
  ])('fails closed for %s', async (_label, override, reason) => {
    const input = options(override);
    await expect(createControlledMediumCheckout(input)).resolves.toEqual({
      ok: false,
      reason,
    });
    expect(input.fetchImpl).not.toHaveBeenCalled();
  });

  it('rejects an unreviewed provider mapping before Shopify access', async () => {
    const input = options();
    input.releaseRecord.fulfillmentMappings[0].mappingFingerprintStatus =
      'observed';
    await expect(createControlledMediumCheckout(input)).resolves.toEqual({
      ok: false,
      reason: 'CONTROLLED_ORDER_RELEASE_BINDING_INCOMPLETE',
    });
    expect(input.loadProductImpl).not.toHaveBeenCalled();
    expect(input.fetchImpl).not.toHaveBeenCalled();
  });

  it('rejects stale Shopify facts and a changed Medium price before cart creation', async () => {
    const stale = options();
    stale.loadProductImpl = vi.fn(async () =>
      currentProduct(stale.releaseRecord, {
        observation: {
          variantFingerprint: `sha256:${'0'.repeat(64)}`,
          commerceFactsFingerprint:
            stale.releaseRecord.shopify.commerceFactsFingerprint,
        },
      })
    );
    await expect(createControlledMediumCheckout(stale)).resolves.toEqual({
      ok: false,
      reason: 'SHOPIFY_RELEASE_BINDING_STALE',
    });

    const changedPrice = options();
    changedPrice.loadProductImpl = vi.fn(async () => ({
      ...currentProduct(changedPrice.releaseRecord),
      observedVariants: [
        {
          ...currentProduct(changedPrice.releaseRecord).observedVariants[0],
          price: { amount: '129.00', currencyCode: 'USD' },
        },
      ],
    }));
    await expect(createControlledMediumCheckout(changedPrice)).resolves.toEqual(
      {
        ok: false,
        reason: 'CONTROLLED_MEDIUM_VARIANT_UNAVAILABLE_OR_CHANGED',
      }
    );
    expect(changedPrice.fetchImpl).not.toHaveBeenCalled();
  });

  it('rejects a cart subtotal change and a foreign checkout host', async () => {
    const changedSubtotal = options();
    changedSubtotal.fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        data: {
          cartCreate: {
            cart: {
              checkoutUrl: 'https://example.myshopify.com/checkouts/controlled',
              totalQuantity: 1,
              cost: {
                subtotalAmount: { amount: '129.00', currencyCode: 'USD' },
              },
            },
            userErrors: [],
          },
        },
      }),
    }));
    await expect(
      createControlledMediumCheckout(changedSubtotal)
    ).resolves.toEqual({
      ok: false,
      reason: 'CONTROLLED_CART_CREATE_REJECTED',
    });

    const foreignHost = options();
    foreignHost.fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        data: {
          cartCreate: {
            cart: {
              checkoutUrl: 'https://attacker.example/checkout',
              totalQuantity: 1,
              cost: {
                subtotalAmount: { amount: '128.00', currencyCode: 'USD' },
              },
            },
            userErrors: [],
          },
        },
      }),
    }));
    await expect(createControlledMediumCheckout(foreignHost)).resolves.toEqual({
      ok: false,
      reason: 'SHOPIFY_CHECKOUT_URL_REJECTED',
    });
  });
});

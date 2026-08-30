import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { getServerCartActivationDecision } from '../apps/web/src/lib/commerce/cart-activation-server';
import { isExactProductionCommerceLaunchAuthorized } from '../lib/commerce/production-launch-policy.js';
import activationApproval from '../config/shopify-cart-activation-authorization.json';
import checkoutApproval from '../config/shopify-checkout-authorization.json';
import productOffer from '../config/shopify-product-offer.json';
import releaseRecord from '../releases/cp-signature-hoodie-2026-001/release.json';

const referenceHash = productOffer.allowedReferenceHashes[0];
const variantFingerprint = releaseRecord.shopify.variantFingerprint;

function productDecision() {
  return {
    schemaVersion: 'cp.release-decision.v1',
    environment: 'production',
    status: 'available',
    source: 'shopify',
    visibilityAllowed: true,
    commerceAllowed: false,
    reason: 'PRODUCT_OWNER_APPROVED_PRODUCTION_PRESENTATION_NON_COMMERCE',
    product: {
      id: releaseRecord.shopify.handle,
      handle: releaseRecord.shopify.handle,
      currency: 'USD',
      availableForSale: true,
      variantFingerprint,
      variantPresentation: {
        schemaVersion: 'cp.variant-presentation.v1',
        source: 'reviewed-product-observation',
        variantFingerprint,
        currency: 'USD',
        selectionAllowed: false,
        cartAuthority: false,
        optionNames: ['Color', 'Size'],
        combinations: [
          {
            referenceHash,
            title: 'Black / L',
            selectedOptions: [
              { name: 'Color', value: 'Black' },
              { name: 'Size', value: 'L' },
            ],
            availableForSale: true,
            price: { amount: '128.00', currency: 'USD' },
          },
        ],
      },
    },
  };
}

function resolverDecision() {
  return {
    schemaVersion: 'cp.variant-resolution-decision.v1',
    environment: 'production',
    status: 'ready',
    capability: 'shopify-storefront-variant-resolver',
    adapter: 'server-only-shopify-variant-resolver',
    callableSurface: 'server_only',
    productHandle: releaseRecord.shopify.handle,
    variantFingerprint,
    evidenceRef: 'tests/variant-resolution-policy.test.js',
    productReadEvidenceRef:
      'test_reports/cp-hoodie-production-activation-2026-08-04/storefront-observation.json',
    mappedVariantCount: 3,
    mappingComplete: true,
    rawReferenceExposed: false,
    cartMutationAuthorized: false,
    checkoutAuthorized: false,
    blockers: [],
  };
}

describe('exact Product Owner Production launch policy', () => {
  it('authorizes every exact S/M/L reference for the rebound Shopify observation', () => {
    for (const offeredReference of productOffer.allowedReferenceHashes) {
      expect(
        isExactProductionCommerceLaunchAuthorized({
          environment: 'production',
          releaseRecord,
          productHandle: releaseRecord.shopify.handle,
          referenceHash: offeredReference,
          quantity: 5,
        })
      ).toBe(true);
    }
  });

  it.each([
    ['an unreviewed reference', { referenceHash: `sha256:${'f'.repeat(64)}` }],
    ['quantity above five', { referenceHash, quantity: 6 }],
    ['a different handle', { productHandle: 'different-product' }],
    ['Preview', { environment: 'preview' }],
  ])('rejects %s', (_label, override) => {
    expect(
      isExactProductionCommerceLaunchAuthorized({
        environment: 'production',
        releaseRecord,
        productHandle: releaseRecord.shopify.handle,
        referenceHash,
        quantity: 1,
        ...override,
      })
    ).toBe(false);
  });

  it('allows cart and hosted checkout for the exact approved Production offer', () => {
    const { summary } = getServerCartActivationDecision({
      environment: 'production',
      productDecision: productDecision(),
      releaseRecord,
      variantResolverDecision: resolverDecision(),
      activationApproval,
      checkoutApproval,
    });

    expect(summary).toMatchObject({
      status: 'eligible',
      cartAllowed: true,
      checkoutAllowed: true,
      reason: 'CUSTOMER_CART_ELIGIBLE',
      checkoutReason: 'SHOPIFY_HOSTED_CHECKOUT_AUTHORIZED',
    });
  });
});

import { describe, expect, it } from 'vitest';
import { evaluateCartActivation } from '../apps/web/src/lib/commerce/cart-activation-policy';

const fingerprint = `sha256:${'a'.repeat(64)}`;
const releaseRecord = {
  releaseId: 'cp-test-release-2026-001',
  state: 'staged',
  shopify: {
    handle: 'test-product',
    variantFingerprintStatus: 'observed',
    variantFingerprint: fingerprint,
  },
};
const productDecision = {
  source: 'shopify',
  visibilityAllowed: true,
  product: {
    handle: 'test-product',
    currency: 'USD',
    availableForSale: true,
    variantFingerprint: fingerprint,
    variantPresentation: {
      schemaVersion: 'cp.variant-presentation.v1',
      source: 'reviewed-product-observation',
      variantFingerprint: fingerprint,
      currency: 'USD',
      selectionAllowed: false,
      cartAuthority: false,
      optionNames: ['Size'],
      combinations: [
        {
          referenceHash: fingerprint,
          title: 'M',
          selectedOptions: [{ name: 'Size', value: 'M' }],
          availableForSale: true,
          price: { amount: '128.00', currency: 'USD' },
        },
      ],
    },
  },
};
const capabilityDecision = {
  status: 'ready',
  capability: 'shopify-storefront-cart',
  adapter: 'shopify-storefront-cart',
  callableSurface: 'shopify_storefront',
  evidenceRef: 'evidence/cart-write-test.json',
  blocker: null,
};
const resolver = {
  schemaVersion: 'cp.variant-resolution-decision.v1',
  environment: 'preview',
  status: 'ready',
  capability: 'shopify-storefront-variant-resolver',
  adapter: 'server-only-shopify-variant-resolver',
  callableSurface: 'server_only',
  productHandle: 'test-product',
  variantFingerprint: fingerprint,
  evidenceRef: 'tests/variant-resolution-policy.test.js',
  productReadEvidenceRef: 'evidence/product-read.json',
  mappedVariantCount: 1,
  mappingComplete: true,
  rawReferenceExposed: false,
  cartMutationAuthorized: false,
  checkoutAuthorized: false,
  blockers: [],
};
const activationApproval = {
  status: 'approved',
  owner: 'Product Owner',
  scope: 'activate-customer-cart',
  releaseId: releaseRecord.releaseId,
  handle: 'test-product',
  environments: ['preview', 'production'],
  evidence: 'activation approval',
};
const checkoutApproval = {
  ...activationApproval,
  scope: 'shopify-hosted-checkout-redirect',
  evidence: 'checkout approval',
};

describe('monorepo cart activation', () => {
  it('authorizes only the no-write checkout rehearsal for a Staged Preview', () => {
    const decision = evaluateCartActivation({
      environment: 'preview',
      productDecision,
      releaseRecord,
      capabilityDecision,
      variantResolverDecision: resolver,
      activationApproval,
      activationRequested: true,
      checkoutApproval,
    });

    expect(decision).toMatchObject({
      status: 'eligible',
      cartAllowed: true,
      checkoutAllowed: true,
      checkoutReason: 'PRIVATE_CHECKOUT_REHEARSAL_AUTHORIZED',
    });
  });

  it('still requires Released state for Production', () => {
    const decision = evaluateCartActivation({
      environment: 'production',
      productDecision,
      releaseRecord,
      capabilityDecision,
      variantResolverDecision: { ...resolver, environment: 'production' },
      activationApproval,
      activationRequested: true,
      checkoutApproval,
    });

    expect(decision.cartAllowed).toBe(false);
    expect(decision.reason).toBe('RELEASED_PRODUCT_REQUIRED');
  });
});

import { describe, expect, it } from 'vitest';
import {
  evaluateCartActivation,
  toCartActivationSummary,
} from '../lib/commerce/cart-activation-policy';

const readyCapability = {
  status: 'ready',
  blocker: null,
};
const blockedCapability = {
  status: 'human_required',
  blocker: {
    resumePoint: 'Resume at an authorized no-order Storefront cart test.',
  },
};
const releasedRecord = {
  state: 'released',
  shopify: {
    handle: 'test-product',
    variantFingerprintStatus: 'observed',
    variantFingerprint: `sha256:${'a'.repeat(64)}`,
  },
};
const productDecision = {
  source: 'shopify',
  visibilityAllowed: true,
  product: {
    handle: 'test-product',
    availableForSale: true,
    shopifyVariants: { 'Black-M': 'opaque-variant-reference' },
    variantFingerprint: `sha256:${'a'.repeat(64)}`,
  },
};
const approval = {
  status: 'approved',
  owner: 'Product Owner',
  scope: 'activate-customer-cart',
  evidence: 'approval-record-001',
};

describe('cart activation policy', () => {
  it('keeps local fixtures disabled regardless of other inputs', () => {
    const decision = evaluateCartActivation({
      environment: 'local',
      productDecision: {
        source: 'fixture',
        visibilityAllowed: true,
        product: { handle: 'test-product' },
      },
      releaseRecord: releasedRecord,
      capabilityDecision: readyCapability,
      activationApproval: approval,
      activationRequested: true,
    });

    expect(decision).toMatchObject({
      status: 'disabled',
      cartAllowed: false,
      checkoutAllowed: false,
      reason: 'LOCAL_OR_FIXTURE_CART_UI_DISABLED',
    });
  });

  it('does not infer cart authority from credentials, visibility, or a release record', () => {
    const decision = evaluateCartActivation({
      environment: 'production',
      productDecision,
      releaseRecord: releasedRecord,
      capabilityDecision: blockedCapability,
      activationRequested: true,
    });

    expect(decision).toMatchObject({
      status: 'blocked',
      cartAllowed: false,
      checkoutAllowed: false,
      reason: 'STOREFRONT_CART_WRITE_CAPABILITY_REQUIRED',
    });
    expect(decision.prerequisites).toContainEqual({
      code: 'PRODUCT_OWNER_CART_ACTIVATION_APPROVAL_REQUIRED',
      status: 'human_required',
      resumePoint: 'Record explicit Product Owner approval scoped to activate-customer-cart with durable evidence.',
    });
  });

  it('requires a Released record and observed, sellable variant mapping', () => {
    const decision = evaluateCartActivation({
      environment: 'preview',
      productDecision: {
        ...productDecision,
        product: { handle: 'test-product', availableForSale: false, shopifyVariants: {} },
      },
      releaseRecord: {
        ...releasedRecord,
        state: 'staged',
        shopify: {
          ...releasedRecord.shopify,
          variantFingerprint: null,
          variantFingerprintStatus: 'missing',
        },
      },
      capabilityDecision: readyCapability,
      activationApproval: approval,
      activationRequested: true,
    });

    expect(decision.cartAllowed).toBe(false);
    expect(decision.prerequisites.filter(item => item.status === 'blocked').map(item => item.code))
      .toEqual(expect.arrayContaining([
        'RELEASED_PRODUCT_REQUIRED',
        'OBSERVED_VARIANT_FINGERPRINT_REQUIRED',
        'SELLABLE_VARIANT_MAPPING_REQUIRED',
      ]));
  });

  it('rejects a current variant observation that no longer matches the release fingerprint', () => {
    const decision = evaluateCartActivation({
      environment: 'production',
      productDecision: {
        ...productDecision,
        product: {
          ...productDecision.product,
          variantFingerprint: `sha256:${'b'.repeat(64)}`,
        },
      },
      releaseRecord: releasedRecord,
      capabilityDecision: readyCapability,
      activationApproval: approval,
      activationRequested: true,
    });

    expect(decision).toMatchObject({
      status: 'blocked',
      cartAllowed: false,
      reason: 'OBSERVED_VARIANT_FINGERPRINT_REQUIRED',
    });
  });

  it('can declare only cart eligibility when every prerequisite is evidenced', () => {
    const decision = evaluateCartActivation({
      environment: 'production',
      productDecision,
      releaseRecord: releasedRecord,
      capabilityDecision: readyCapability,
      activationApproval: approval,
      activationRequested: true,
    });

    expect(decision).toMatchObject({
      status: 'eligible',
      cartAllowed: true,
      checkoutAllowed: false,
      reason: 'CUSTOMER_CART_ELIGIBLE',
      checkoutReason: 'CHECKOUT_REQUIRES_SEPARATE_APPROVAL_AND_LIVE_PROOF',
    });
    expect(decision.prerequisites.every(item => item.status === 'satisfied')).toBe(true);
  });

  it('sanitizes the client summary and never carries product or variant payloads', () => {
    const summary = toCartActivationSummary(evaluateCartActivation({
      environment: 'production',
      productDecision,
      releaseRecord: releasedRecord,
      capabilityDecision: blockedCapability,
    }));

    expect(JSON.stringify(summary)).not.toContain('opaque-variant-reference');
    expect(summary).not.toHaveProperty('productHandle');
    expect(summary.checkoutAllowed).toBe(false);
  });
});

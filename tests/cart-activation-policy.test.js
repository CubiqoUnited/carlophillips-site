import { describe, expect, it } from 'vitest';
import {
  evaluateCartActivation,
  toCartActivationSummary,
} from '../lib/commerce/cart-activation-policy';

const readyCapability = {
  status: 'ready',
  capability: 'shopify-storefront-cart',
  adapter: 'shopify-storefront-cart',
  callableSurface: 'shopify_storefront',
  evidenceRef: 'evidence/shopify-storefront-cart-no-order-001',
  blocker: null,
};
const blockedCapability = {
  status: 'human_required',
  blocker: {
    resumePoint: 'Resume at an authorized no-order Storefront cart test.',
  },
};
const readyVariantResolver = {
  schemaVersion: 'cp.variant-resolution-decision.v1',
  environment: 'production',
  status: 'ready',
  capability: 'shopify-storefront-variant-resolver',
  adapter: 'server-only-shopify-variant-resolver',
  callableSurface: 'server_only',
  productHandle: 'test-product',
  variantFingerprint: `sha256:${'a'.repeat(64)}`,
  evidenceRef: 'tests/variant-resolution-policy.test.js',
  productReadEvidenceRef: 'evidence/shopify-storefront-read-001',
  mappedVariantCount: 1,
  mappingComplete: true,
  rawReferenceExposed: false,
  cartMutationAuthorized: false,
  checkoutAuthorized: false,
  blockers: [],
};
const releasedRecord = {
  releaseId: 'cp-test-release-2026-001',
  state: 'released',
  shopify: {
    handle: 'test-product',
    variantFingerprintStatus: 'observed',
    variantFingerprint: `sha256:${'a'.repeat(64)}`,
  },
};
const reviewedVariantPresentation = {
  schemaVersion: 'cp.variant-presentation.v1',
  source: 'reviewed-product-observation',
  variantFingerprint: `sha256:${'a'.repeat(64)}`,
  currency: 'USD',
  selectionAllowed: false,
  cartAuthority: false,
  optionNames: ['Color', 'Size'],
  combinations: [
    {
      referenceHash: `sha256:${'a'.repeat(64)}`,
      title: 'Black / M',
      selectedOptions: [
        { name: 'Color', value: 'Black' },
        { name: 'Size', value: 'M' },
      ],
      availableForSale: true,
      price: { amount: '128.00', currency: 'USD' },
    },
  ],
};
const productDecision = {
  source: 'shopify',
  visibilityAllowed: true,
  product: {
    handle: 'test-product',
    currency: 'USD',
    availableForSale: true,
    variantPresentation: reviewedVariantPresentation,
    variantFingerprint: `sha256:${'a'.repeat(64)}`,
  },
};
const approval = {
  status: 'approved',
  owner: 'Product Owner',
  scope: 'activate-customer-cart',
  releaseId: 'cp-test-release-2026-001',
  handle: 'test-product',
  environments: ['preview', 'production'],
  evidence: 'approval-record-001',
};
const checkoutApproval = {
  status: 'approved',
  owner: 'Product Owner',
  scope: 'shopify-hosted-checkout-redirect',
  releaseId: 'cp-test-release-2026-001',
  handle: 'test-product',
  environments: ['preview', 'production'],
  evidence: 'checkout-approval-record-001',
};

function exactLaunchInputs() {
  const candidateCommit = 'abcdef1';
  const targetFingerprint = `sha256:${'b'.repeat(64)}`;
  const releaseRecord = {
    ...releasedRecord,
    state: 'staged',
    candidate: {
      gitCommit: candidateCommit,
      releaseEvidenceFingerprint: targetFingerprint,
    },
    approvals: Object.fromEntries(
      ['product', 'media', 'fulfillment'].map((scope) => [
        scope,
        {
          status: 'approved',
          owner: 'Product Owner',
          evidence: {
            candidateCommit,
            approvedTargetFingerprint: targetFingerprint,
          },
        },
      ])
    ),
  };
  return {
    releaseRecord,
    productOfferConfig: {
      releaseId: releaseRecord.releaseId,
      handle: releaseRecord.shopify.handle,
      allowedSizes: ['M'],
      allowedReferenceHashes: [`sha256:${'a'.repeat(64)}`],
      evidence: 'Reviewed test offer',
    },
    productionLaunchAuthorization: {
      schemaVersion: 'cp.product-owner-production-launch-authorization.v1',
      status: 'approved',
      owner: 'Product Owner',
      releaseId: releaseRecord.releaseId,
      handle: releaseRecord.shopify.handle,
      candidateCommit,
      approvedTargetFingerprint: targetFingerprint,
      environments: ['production'],
      scopes: ['activate-exact-reviewed-offer'],
      evidence: 'Exact Product Owner test launch authorization',
      commerceActivation: {
        status: 'approved',
        cartWriteEvidence:
          'evidence/shopify/cp-signature-hoodie-production-cart-write-2026-08-30.json',
        allowedReferenceHashes: [`sha256:${'a'.repeat(64)}`],
        maximumQuantity: 5,
      },
    },
    productionCartWriteProof: {
      schemaVersion: 'cp.shopify-cart-write-proof.v1',
      releaseId: releaseRecord.releaseId,
      handle: releaseRecord.shopify.handle,
      candidateCommit,
      approvedTargetFingerprint: targetFingerprint,
      environment: 'production',
      request: { referenceHash: `sha256:${'a'.repeat(64)}`, quantity: 1 },
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
      evidenceBoundary: 'Sanitized test proof.',
    },
  };
}

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
      resumePoint:
        'Record explicit Product Owner approval scoped to activate-customer-cart with durable evidence.',
    });
  });

  it.each([
    ['wrong capability', { capability: 'shopify-storefront-product-read' }],
    ['wrong adapter', { adapter: 'shopify-admin-cart' }],
    ['wrong callable surface', { callableSurface: 'shopify_admin' }],
    ['missing durable evidence', { evidenceRef: null }],
  ])('rejects a generic ready decision with %s', (_label, override) => {
    const decision = evaluateCartActivation({
      environment: 'production',
      productDecision,
      releaseRecord: releasedRecord,
      capabilityDecision: { ...readyCapability, ...override },
      variantResolverDecision: readyVariantResolver,
      activationApproval: approval,
      activationRequested: true,
    });

    expect(decision).toMatchObject({
      status: 'blocked',
      cartAllowed: false,
      reason: 'STOREFRONT_CART_WRITE_CAPABILITY_REQUIRED',
    });
  });

  it('requires a Released record and an observed sellable variant presentation', () => {
    const decision = evaluateCartActivation({
      environment: 'preview',
      productDecision: {
        ...productDecision,
        product: {
          handle: 'test-product',
          availableForSale: false,
          variantPresentation: null,
        },
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
    expect(
      decision.prerequisites
        .filter((item) => item.status === 'blocked')
        .map((item) => item.code)
    ).toEqual(
      expect.arrayContaining([
        'RELEASED_PRODUCT_REQUIRED',
        'OBSERVED_VARIANT_FINGERPRINT_REQUIRED',
        'SELLABLE_REVIEWED_VARIANT_REQUIRED',
      ])
    );
  });

  it('does not accept an outer raw variant map without a reviewed presentation', () => {
    const decision = evaluateCartActivation({
      environment: 'production',
      productDecision: {
        ...productDecision,
        product: {
          handle: 'test-product',
          availableForSale: true,
          variantFingerprint: `sha256:${'a'.repeat(64)}`,
          shopifyVariants: { 'Black-M': 'opaque-outer-reference' },
        },
      },
      releaseRecord: releasedRecord,
      capabilityDecision: readyCapability,
      activationApproval: approval,
      activationRequested: true,
    });

    expect(decision.cartAllowed).toBe(false);
    expect(decision.prerequisites).toContainEqual({
      code: 'SELLABLE_REVIEWED_VARIANT_REQUIRED',
      status: 'blocked',
      resumePoint:
        'Verify at least one available canonical variant combination through an authorized read-only observation.',
    });
  });

  it('does not treat opaque reviewed hashes as cart mutation authority', () => {
    const decision = evaluateCartActivation({
      environment: 'production',
      productDecision,
      releaseRecord: releasedRecord,
      capabilityDecision: readyCapability,
      activationApproval: approval,
      activationRequested: true,
    });

    expect(decision).toMatchObject({
      status: 'blocked',
      cartAllowed: false,
      reason: 'SERVER_VARIANT_RESOLVER_REQUIRED',
    });
    expect(decision.prerequisites).toContainEqual({
      code: 'SERVER_VARIANT_RESOLVER_REQUIRED',
      status: 'blocked',
      resumePoint:
        'Bind an evidence-backed server-only resolver to this exact reviewed variant fingerprint; never expose or infer raw Shopify references.',
    });
  });

  it.each([
    ['wrong schema', { schemaVersion: 'cp.variant-resolution-decision.v0' }],
    ['wrong resolver surface', { callableSurface: 'shopify_storefront' }],
    ['missing resolver evidence', { evidenceRef: null }],
    ['missing product-read evidence', { productReadEvidenceRef: null }],
    ['incomplete mapping', { mappingComplete: false }],
    ['zero mapped variants', { mappedVariantCount: 0 }],
    ['raw reference exposure', { rawReferenceExposed: true }],
    ['cart authority', { cartMutationAuthorized: true }],
    ['checkout authority', { checkoutAuthorized: true }],
    [
      'reported blocker',
      {
        blockers: [
          {
            code: 'UNRESOLVED',
            humanAction: 'Resolve it.',
            resumePoint: 'Resume after resolution.',
          },
        ],
      },
    ],
  ])('does not accept resolver readiness with %s', (_label, override) => {
    const decision = evaluateCartActivation({
      environment: 'production',
      productDecision,
      releaseRecord: releasedRecord,
      capabilityDecision: readyCapability,
      variantResolverDecision: { ...readyVariantResolver, ...override },
      activationApproval: approval,
      activationRequested: true,
    });

    expect(decision).toMatchObject({
      status: 'blocked',
      cartAllowed: false,
      reason: 'SERVER_VARIANT_RESOLVER_REQUIRED',
    });
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
      variantResolverDecision: readyVariantResolver,
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
      variantResolverDecision: readyVariantResolver,
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
    expect(
      decision.prerequisites.every((item) => item.status === 'satisfied')
    ).toBe(true);
  });

  it('authorizes checkout in production without a second environment switch', () => {
    const decision = evaluateCartActivation({
      environment: 'production',
      productDecision,
      releaseRecord: {
        ...releasedRecord,
        releaseId: 'cp-test-release-2026-001',
      },
      capabilityDecision: readyCapability,
      variantResolverDecision: readyVariantResolver,
      activationApproval: approval,
      activationRequested: true,
      checkoutApproval,
    });

    expect(decision).toMatchObject({
      status: 'eligible',
      cartAllowed: true,
      checkoutAllowed: true,
      checkoutReason: 'SHOPIFY_HOSTED_CHECKOUT_AUTHORIZED',
    });
    expect(toCartActivationSummary(decision).checkoutAllowed).toBe(true);
  });

  it('authorizes only the exact proof-bound Product Owner offer in Production', () => {
    const exact = exactLaunchInputs();
    const decision = evaluateCartActivation({
      environment: 'production',
      productDecision,
      releaseRecord: exact.releaseRecord,
      capabilityDecision: {
        ...readyCapability,
        status: 'evidence_only',
      },
      variantResolverDecision: readyVariantResolver,
      activationApproval: approval,
      checkoutApproval,
      productionLaunchAuthorization: exact.productionLaunchAuthorization,
      productionCartWriteProof: exact.productionCartWriteProof,
      productOfferConfig: exact.productOfferConfig,
    });

    expect(decision).toMatchObject({
      status: 'eligible',
      cartAllowed: true,
      checkoutAllowed: true,
      checkoutReason: 'SHOPIFY_HOSTED_CHECKOUT_AUTHORIZED',
    });
  });

  it('keeps checkout disabled in Preview even when every cart and approval gate passes', () => {
    const decision = evaluateCartActivation({
      environment: 'preview',
      productDecision,
      releaseRecord: {
        ...releasedRecord,
        releaseId: 'cp-test-release-2026-001',
      },
      capabilityDecision: readyCapability,
      variantResolverDecision: {
        ...readyVariantResolver,
        environment: 'preview',
      },
      activationApproval: approval,
      activationRequested: true,
      checkoutApproval,
    });

    expect(decision.cartAllowed).toBe(true);
    expect(decision.checkoutAllowed).toBe(false);
    expect(decision.checkoutReason).toBe('CHECKOUT_ENVIRONMENT_GATE_DISABLED');
  });

  it('sanitizes the client summary and never carries product or variant payloads', () => {
    const summary = toCartActivationSummary(
      evaluateCartActivation({
        environment: 'production',
        productDecision,
        releaseRecord: releasedRecord,
        capabilityDecision: blockedCapability,
      })
    );

    expect(JSON.stringify(summary)).not.toContain('opaque-variant-reference');
    expect(summary).not.toHaveProperty('productHandle');
    expect(summary.checkoutAllowed).toBe(false);
  });
});

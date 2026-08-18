import { describe, expect, it } from 'vitest';
import {
  attachObservationToProduct,
  createProductObservation,
} from '../lib/commerce/product-observation.js';
import { evaluateObservationVisibility } from '../lib/commerce/observation-visibility-policy.js';
import { evaluateVariantResolutionReadiness } from '../lib/commerce/variant-resolution-policy.js';
import {
  evaluateCartActivation,
  toCartActivationSummary,
} from '../lib/commerce/cart-activation-policy.js';
import {
  discoverCapability,
  getCapabilityRegistry,
} from '../lib/orchestration/capability-registry.js';
import { createCompleteReleaseRecord } from './fixtures/release-fixtures.js';

const productReadEvidence = 'evidence/shopify-storefront-read-001';
const rawVariantIds = [
  'gid://shopify/ProductVariant/100',
  'gid://shopify/ProductVariant/200',
];

function productFacts() {
  return {
    handle: 'test-product',
    name: 'Observed product',
    description: 'Observed product description.',
    vendor: 'Observed vendor',
    productType: 'Hoodie',
    tagline: 'SIGNATURE',
    details: ['Observed product description.'],
    price: 128,
    compareAtPrice: 128,
    currency: 'USD',
    availableForSale: true,
    observedVariants: [
      {
        id: rawVariantIds[0],
        title: 'Black / M',
        selectedOptions: [
          { name: 'Size', value: 'M' },
          { name: 'Color', value: 'Black' },
        ],
        availableForSale: true,
        price: { amount: '128.00', currencyCode: 'USD' },
      },
      {
        id: rawVariantIds[1],
        title: 'Black / L',
        selectedOptions: [
          { name: 'Color', value: 'Black' },
          { name: 'Size', value: 'L' },
        ],
        availableForSale: false,
        price: { amount: '128.00', currencyCode: 'USD' },
      },
    ],
  };
}

function createContext({
  environment = 'preview',
  releaseState = environment === 'production' ? 'released' : 'staged',
} = {}) {
  const facts = productFacts();
  const observation = createProductObservation({
    source: 'shopify',
    environment,
    observedAt: '2026-07-23T12:00:00Z',
    product: facts,
    capabilityEvidence: productReadEvidence,
  });
  const rawShopifyProduct = attachObservationToProduct(facts, observation);
  const releaseRecord = createCompleteReleaseRecord(releaseState, { environment });
  releaseRecord.shopify.handle = facts.handle;
  releaseRecord.shopify.variantFingerprint = observation.variantFingerprint;
  releaseRecord.shopify.commerceFactsFingerprint = observation.commerceFactsFingerprint;
  releaseRecord.shopify.observationFingerprint = observation.observationFingerprint;
  const visibility = evaluateObservationVisibility({
    environment,
    shopifyProduct: rawShopifyProduct,
    releaseRecord,
  });
  if (!visibility.ready) throw new Error(`Fixture visibility failed: ${visibility.reason}`);

  return {
    environment,
    rawShopifyProduct,
    productDecision: {
      schemaVersion: 'cp.release-decision.v1',
      environment,
      status: 'available',
      source: 'shopify',
      visibilityAllowed: true,
      commerceAllowed: false,
      reason: environment === 'production'
        ? 'RELEASED_PRODUCT_PURCHASE_FLOW_UNVERIFIED'
        : 'PRIVATE_RELEASE_REVIEW_NON_COMMERCE',
      product: visibility.product,
    },
    releaseRecord,
    productReadCapabilityDecision: {
      status: 'ready',
      capability: 'shopify-storefront-product-read',
      adapter: 'shopify-storefront-product',
      callableSurface: 'shopify_storefront',
      evidenceRef: productReadEvidence,
      blocker: null,
    },
    resolverCapabilityDecision: discoverCapability(
      getCapabilityRegistry(),
      'shopify-storefront-variant-resolver',
      'resolve-reviewed-variant'
    ),
  };
}

function evaluate(overrides = {}) {
  return evaluateVariantResolutionReadiness({
    ...createContext(),
    ...overrides,
  });
}

describe('server-ephemeral variant resolution readiness', () => {
  it('proves one-to-one reviewed mapping without returning a mutation target', () => {
    const context = createContext();
    const before = structuredClone(context);
    const decision = evaluateVariantResolutionReadiness(context);

    expect(decision).toMatchObject({
      schemaVersion: 'cp.variant-resolution-decision.v1',
      environment: 'preview',
      status: 'ready',
      capability: 'shopify-storefront-variant-resolver',
      adapter: 'server-only-shopify-variant-resolver',
      callableSurface: 'server_only',
      productHandle: 'test-product',
      variantFingerprint: context.releaseRecord.shopify.variantFingerprint,
      evidenceRef: 'tests/variant-resolution-policy.test.js',
      productReadEvidenceRef: productReadEvidence,
      mappedVariantCount: 2,
      mappingComplete: true,
      rawReferenceExposed: false,
      cartMutationAuthorized: false,
      checkoutAuthorized: false,
      blockers: [],
    });
    expect(JSON.stringify(decision)).not.toContain('gid://');
    expect(JSON.stringify(decision)).not.toContain('ProductVariant');
    expect(context).toEqual(before);
  });

  it('satisfies only the resolver gate when a real production decision is passed to cart policy', () => {
    const context = createContext({ environment: 'production' });
    const resolverDecision = evaluateVariantResolutionReadiness(context);
    const cartDecision = evaluateCartActivation({
      environment: 'production',
      productDecision: context.productDecision,
      releaseRecord: context.releaseRecord,
      capabilityDecision: {
        status: 'ready',
        capability: 'shopify-storefront-cart',
        adapter: 'shopify-storefront-cart',
        callableSurface: 'shopify_storefront',
        evidenceRef: 'evidence/shopify-storefront-cart-no-order-001',
      },
      variantResolverDecision: resolverDecision,
      activationApproval: {
        status: 'approved',
        owner: 'Product Owner',
        scope: 'activate-customer-cart',
        releaseId: context.releaseRecord.releaseId,
        handle: 'test-product',
        environments: ['production'],
        evidence: 'approval/cart-activation-001',
      },
      activationRequested: true,
    });

    expect(resolverDecision.status).toBe('ready');
    expect(cartDecision).toMatchObject({
      status: 'eligible',
      cartAllowed: true,
      checkoutAllowed: false,
      reason: 'CUSTOMER_CART_ELIGIBLE',
    });
    const summary = toCartActivationSummary(cartDecision);
    expect(JSON.stringify(summary)).not.toContain('gid://');
    expect(JSON.stringify(summary)).not.toContain('ProductVariant');
    expect(summary).not.toHaveProperty('variantResolverDecision');
  });

  it.each([
    ['schema', { schemaVersion: 'cp.variant-resolution-decision.v0' }],
    ['environment', { environment: 'preview' }],
    ['handle', { productHandle: 'other-product' }],
    ['runtime surface', { callableSurface: 'local' }],
    ['mapping completeness', { mappingComplete: false }],
    ['mapping count', { mappedVariantCount: 0 }],
    ['resolver evidence', { evidenceRef: null }],
    ['mutation authority', { cartMutationAuthorized: true }],
    ['blockers', { blockers: [{
      code: 'UNRESOLVED',
      humanAction: 'Resolve it.',
      resumePoint: 'Resume after resolution.',
    }] }],
  ])('does not satisfy the cart resolver gate after tampering with real %s output', (_label, patch) => {
    const context = createContext({ environment: 'production' });
    const realDecision = evaluateVariantResolutionReadiness(context);
    const cartDecision = evaluateCartActivation({
      environment: 'production',
      productDecision: context.productDecision,
      releaseRecord: context.releaseRecord,
      capabilityDecision: {
        status: 'ready',
        capability: 'shopify-storefront-cart',
        adapter: 'shopify-storefront-cart',
        callableSurface: 'shopify_storefront',
        evidenceRef: 'evidence/shopify-storefront-cart-no-order-001',
      },
      variantResolverDecision: { ...realDecision, ...patch },
      activationApproval: {
        status: 'approved',
        owner: 'Product Owner',
        scope: 'activate-customer-cart',
        releaseId: context.releaseRecord.releaseId,
        handle: 'test-product',
        environments: ['production'],
        evidence: 'approval/cart-activation-001',
      },
      activationRequested: true,
    });

    expect(cartDecision).toMatchObject({
      status: 'blocked',
      cartAllowed: false,
      reason: 'SERVER_VARIANT_RESOLVER_REQUIRED',
    });
  });

  it('withholds changed raw identity even if the outer reviewed presentation is untouched', () => {
    const context = createContext();
    context.rawShopifyProduct.observedVariants[0].id = 'gid://shopify/ProductVariant/changed';
    const decision = evaluateVariantResolutionReadiness(context);

    expect(decision.status).toBe('blocked');
    expect(decision.blockers.map(item => item.code)).toEqual(expect.arrayContaining([
      'VARIANT_RESOLVER_IDENTITY_STALE',
      'VARIANT_RESOLVER_MAPPING_INCOMPLETE',
    ]));
    expect(JSON.stringify(decision)).not.toContain(
      'gid://shopify/ProductVariant/changed'
    );
  });

  it('withholds changed current price facts without mislabeling identity as stale', () => {
    const context = createContext();
    context.rawShopifyProduct.price = 129;
    context.rawShopifyProduct.compareAtPrice = 129;
    context.rawShopifyProduct.observedVariants.forEach(variant => {
      variant.price.amount = '129.00';
    });
    const decision = evaluateVariantResolutionReadiness(context);

    expect(decision.status).toBe('blocked');
    expect(decision.blockers.map(item => item.code)).toContain('VARIANT_RESOLVER_FACTS_STALE');
    expect(decision.blockers.map(item => item.code)).not.toContain('VARIANT_RESOLVER_IDENTITY_STALE');
  });

  it('rejects duplicate or missing raw variants rather than using a legacy outer map', () => {
    const duplicate = createContext();
    duplicate.rawShopifyProduct.observedVariants[1].id
      = duplicate.rawShopifyProduct.observedVariants[0].id;
    expect(evaluateVariantResolutionReadiness(duplicate).blockers.map(item => item.code))
      .toEqual(expect.arrayContaining([
        'VARIANT_RESOLVER_RAW_FACTS_INVALID',
        'VARIANT_RESOLVER_MAPPING_INCOMPLETE',
      ]));

    const missing = createContext();
    missing.rawShopifyProduct.observedVariants = [];
    missing.rawShopifyProduct.shopifyVariants = {
      'Black-M': rawVariantIds[0],
      'Black-L': rawVariantIds[1],
    };
    const decision = evaluateVariantResolutionReadiness(missing);
    expect(decision.status).toBe('blocked');
    expect(decision.mappingComplete).toBe(false);
    expect(JSON.stringify(decision)).not.toContain(rawVariantIds[0]);
  });

  it.each([
    ['wrong product-read capability', {
      productReadCapabilityDecision: {
        status: 'ready',
        capability: 'shopify-storefront-cart',
        adapter: 'shopify-storefront-product',
        callableSurface: 'shopify_storefront',
        evidenceRef: productReadEvidence,
      },
    }],
    ['mismatched product-read evidence', {
      productReadCapabilityDecision: {
        status: 'ready',
        capability: 'shopify-storefront-product-read',
        adapter: 'shopify-storefront-product',
        callableSurface: 'shopify_storefront',
        evidenceRef: 'evidence/unrelated-read',
      },
    }],
    ['wrong resolver surface', {
      resolverCapabilityDecision: {
        status: 'ready',
        capability: 'shopify-storefront-variant-resolver',
        adapter: 'server-only-shopify-variant-resolver',
        callableSurface: 'shopify_storefront',
        evidenceRef: 'evidence/unrelated-resolver',
      },
    }],
  ])('blocks %s', (_label, override) => {
    const decision = evaluate(override);
    expect(decision.status).toBe('blocked');
    expect(decision.evidenceRef).toBeNull();
    expect(decision.productReadEvidenceRef).toBeNull();
  });

  it('rejects local execution and a mismatched release fingerprint', () => {
    const local = createContext();
    local.environment = 'local';
    local.productDecision.environment = 'local';
    expect(evaluateVariantResolutionReadiness(local).blockers.map(item => item.code))
      .toContain('VARIANT_RESOLVER_ENVIRONMENT_INVALID');

    const mismatch = createContext();
    mismatch.releaseRecord.shopify.variantFingerprint = `sha256:${'e'.repeat(64)}`;
    expect(evaluateVariantResolutionReadiness(mismatch).blockers.map(item => item.code))
      .toEqual(expect.arrayContaining([
        'VARIANT_RESOLVER_RELEASE_FINGERPRINT_MISMATCH',
        'VARIANT_RESOLVER_OBSERVATION_FINGERPRINT_MISMATCH',
      ]));
  });

  it('rejects commerce facts that do not match the reviewed release binding', () => {
    const context = createContext();
    context.releaseRecord.shopify.commerceFactsFingerprint
      = `sha256:${'d'.repeat(64)}`;
    const decision = evaluateVariantResolutionReadiness(context);

    expect(decision.status).toBe('blocked');
    expect(decision.blockers.map(item => item.code))
      .toContain('VARIANT_RESOLVER_RELEASE_FACTS_MISMATCH');
  });
});

import { describe, expect, it } from 'vitest';
import {
  attachObservationToProduct,
  createProductObservation,
  reviewProductObservation,
} from '../lib/commerce/product-observation';

const observedAt = '2026-07-23T05:00:00Z';
const capabilityEvidence = 'evidence/shopify-storefront-read-001';

function product(variantOrder = ['large', 'small']) {
  const variants = {
    small: {
      id: 'gid://shopify/ProductVariant/100',
      title: 'Black / S',
      availableForSale: true,
      price: { amount: '128.00', currencyCode: 'USD' },
      selectedOptions: [
        { name: 'Size', value: 'S' },
        { name: 'Color', value: 'Black' },
      ],
    },
    large: {
      id: 'gid://shopify/ProductVariant/200',
      title: 'Black / L',
      availableForSale: false,
      price: { amount: '128.00', currencyCode: 'USD' },
      selectedOptions: [
        { name: 'Color', value: 'Black' },
        { name: 'Size', value: 'L' },
      ],
    },
  };

  return {
    handle: 'test-product',
    name: 'Test Product',
    description: 'Heavyweight cotton hoodie.',
    vendor: 'Observed vendor',
    productType: 'Hoodie',
    tagline: 'SIGNATURE',
    details: ['Heavyweight cotton hoodie.'],
    currency: 'USD',
    price: 128,
    compareAtPrice: 128,
    availableForSale: true,
    observedVariants: variantOrder.map(key => variants[key]),
  };
}

const readyCapability = {
  status: 'ready',
  capability: 'shopify-storefront-product-read',
  adapter: 'shopify-storefront-product',
  callableSurface: 'shopify_storefront',
  evidenceRef: capabilityEvidence,
  blocker: null,
};

function approvalFor(observation, handle = 'test-product') {
  return {
    status: 'approved',
    owner: 'Product Owner',
    scope: 'accept-shopify-product-observation',
    observationFingerprint: observation.observationFingerprint,
    handle,
    evidence: 'approval/product-observation-001',
  };
}

describe('product observation truth contract', () => {
  it('generates deterministic fingerprints independent of variant and option order', () => {
    const first = createProductObservation({
      source: 'shopify',
      environment: 'preview',
      observedAt,
      product: product(['large', 'small']),
      capabilityEvidence,
    });
    const reordered = product(['small', 'large']);
    reordered.observedVariants = reordered.observedVariants.map(variant => ({
      ...variant,
      selectedOptions: [...variant.selectedOptions].reverse(),
    }));
    const second = createProductObservation({
      source: 'shopify',
      environment: 'preview',
      observedAt,
      product: reordered,
      capabilityEvidence,
    });

    expect(first.variantFingerprint).toBe(second.variantFingerprint);
    expect(first.observationFingerprint).toBe(second.observationFingerprint);
    expect(first.variants.every(variant => variant.referenceHash.startsWith('sha256:'))).toBe(true);
    expect(JSON.stringify(first)).not.toContain('gid://shopify');
  });

  it('does not depend on locale-aware sorting', () => {
    const originalLocaleCompare = String.prototype.localeCompare;
    String.prototype.localeCompare = () => {
      throw new Error('localeCompare must not be used for canonical ordering');
    };
    try {
      expect(() => createProductObservation({
        source: 'shopify',
        environment: 'preview',
        observedAt,
        product: product(),
        capabilityEvidence,
      })).not.toThrow();
    } finally {
      String.prototype.localeCompare = originalLocaleCompare;
    }
  });

  it('uses recursively key-sorted canonical JSON rather than object insertion order', () => {
    const observation = createProductObservation({
      source: 'shopify',
      environment: 'preview',
      observedAt,
      product: product(),
      capabilityEvidence,
    });
    const approval = approvalFor(observation);
    observation.product = Object.fromEntries(
      Object.entries(observation.product).reverse()
    );

    const decision = reviewProductObservation({
      observation,
      expectedHandle: 'test-product',
      capabilityDecision: readyCapability,
      reviewApproval: approval,
    });

    expect(decision.status).toBe('accepted');
    expect(decision.blockers).toEqual([]);
  });

  it('keeps fixture and simulation observations local and non-authoritative', () => {
    const fixture = createProductObservation({
      source: 'fixture',
      environment: 'local',
      observedAt,
      product: product(),
    });

    expect(fixture).toMatchObject({
      authority: 'non_authoritative',
      capabilityEvidence: null,
      review: { status: 'pending', evidence: null },
    });
    expect(() => createProductObservation({
      source: 'simulation',
      environment: 'preview',
      observedAt,
      product: product(),
    })).toThrow('simulation product observations are local-only');
    expect(() => createProductObservation({
      source: 'fixture',
      environment: 'local',
      observedAt,
      product: product(),
      capabilityEvidence,
    })).toThrow('fixture product observations cannot carry capability evidence');
  });

  it.each(['fixture', 'simulation'])(
    'blocks %s evidence without mutating a Draft release record',
    source => {
      const releaseRecord = {
        state: 'draft',
        shopify: {
          handle: 'test-product',
          variantFingerprint: null,
          variantFingerprintStatus: 'missing',
        },
      };
      const before = structuredClone(releaseRecord);
      const observation = createProductObservation({
        source,
        environment: 'local',
        observedAt,
        product: product(),
      });
      const decision = reviewProductObservation({
        observation,
        expectedHandle: 'test-product',
        capabilityDecision: readyCapability,
        reviewApproval: approvalFor(observation),
      });

      expect(decision).toMatchObject({
        status: 'blocked',
        authoritative: false,
        candidateReleasePatch: null,
      });
      expect(decision.blockers.map(item => item.code)).toContain(
        'AUTHORITATIVE_SHOPIFY_OBSERVATION_REQUIRED'
      );
      expect(releaseRecord).toEqual(before);
    }
  );

  it('detects observation edits after fingerprint generation', () => {
    const observation = createProductObservation({
      source: 'shopify',
      environment: 'preview',
      observedAt,
      product: product(),
      capabilityEvidence,
    });
    observation.variants[0].price.amount = '1.00';

    const decision = reviewProductObservation({
      observation,
      expectedHandle: 'test-product',
      capabilityDecision: readyCapability,
      reviewApproval: approvalFor(observation),
    });

    expect(decision.blockers.map(item => item.code)).toContain(
      'PRODUCT_OBSERVATION_INTEGRITY_MISMATCH'
    );
    expect(decision.candidateReleasePatch).toBeNull();
  });

  it.each([
    ['observedAt', '2026-07-23T06:00:00Z'],
    ['capabilityEvidence', 'evidence/another-read'],
  ])('binds %s into the observation fingerprint', (field, changedValue) => {
    const observation = createProductObservation({
      source: 'shopify',
      environment: 'preview',
      observedAt,
      product: product(),
      capabilityEvidence,
    });
    const approval = approvalFor(observation);
    observation[field] = changedValue;

    const decision = reviewProductObservation({
      observation,
      expectedHandle: 'test-product',
      capabilityDecision: readyCapability,
      reviewApproval: approval,
    });

    expect(decision.blockers.map(item => item.code)).toContain(
      'PRODUCT_OBSERVATION_INTEGRITY_MISMATCH'
    );
    expect(decision.candidateReleasePatch).toBeNull();
  });

  it('keeps variant identity semantics separate from mutable commerce facts', () => {
    const first = createProductObservation({
      source: 'shopify',
      environment: 'preview',
      observedAt,
      product: product(),
      capabilityEvidence,
    });
    const changedProduct = product();
    changedProduct.observedVariants.forEach(variant => {
      variant.availableForSale = false;
    });
    changedProduct.availableForSale = false;
    changedProduct.observedVariants[0].price.amount = '140.00';
    changedProduct.observedVariants[1].price.amount = '140.00';
    changedProduct.price = 140;
    changedProduct.compareAtPrice = 140;
    const second = createProductObservation({
      source: 'shopify',
      environment: 'preview',
      observedAt,
      product: changedProduct,
      capabilityEvidence,
    });

    expect(second.variantFingerprint).toBe(first.variantFingerprint);
    expect(second.commerceFactsFingerprint).not.toBe(first.commerceFactsFingerprint);
    expect(second.observationFingerprint).not.toBe(first.observationFingerprint);
  });

  it.each([
    ['description', product => { product.description = 'Changed description.'; }],
    ['vendor', product => { product.vendor = 'Changed vendor'; }],
    ['product type', product => { product.productType = 'Changed type'; }],
    ['tagline', product => { product.tagline = 'CHANGED'; }],
    ['details', product => { product.details = ['Changed detail.']; }],
  ])('binds customer-visible %s into commerce facts', (_field, mutate) => {
    const reviewedProduct = product();
    const changedProduct = product();
    mutate(changedProduct);
    const reviewed = createProductObservation({
      source: 'shopify',
      environment: 'preview',
      observedAt,
      product: reviewedProduct,
      capabilityEvidence,
    });
    const changed = createProductObservation({
      source: 'shopify',
      environment: 'preview',
      observedAt,
      product: changedProduct,
      capabilityEvidence,
    });

    expect(changed.variantFingerprint).toBe(reviewed.variantFingerprint);
    expect(changed.commerceFactsFingerprint).not.toBe(reviewed.commerceFactsFingerprint);
    expect(changed.observationFingerprint).not.toBe(reviewed.observationFingerprint);
  });

  it('canonicalizes customer copy and rejects malformed reviewed-copy facts', () => {
    const input = product();
    input.description = '  Heavyweight cotton hoodie.  ';
    input.vendor = '  Observed vendor ';
    input.details = ['  First detail. ', '', 'Second detail.'];
    const observation = createProductObservation({
      source: 'shopify',
      environment: 'preview',
      observedAt,
      product: input,
      capabilityEvidence,
    });

    expect(observation.product).toMatchObject({
      description: 'Heavyweight cotton hoodie.',
      vendor: 'Observed vendor',
      details: ['First detail.', 'Second detail.'],
    });

    observation.product.details = [' valid-looking but non-canonical '];
    expect(reviewProductObservation({
      observation,
      expectedHandle: 'test-product',
      capabilityDecision: readyCapability,
      reviewApproval: approvalFor(observation),
    }).blockers.map(item => item.code)).toEqual(expect.arrayContaining([
      'PRODUCT_OBSERVATION_INTEGRITY_MISMATCH',
      'PRODUCT_OBSERVATION_FACTS_INVALID',
    ]));
  });

  it('requires capability evidence tied to the exact ready decision', () => {
    const observation = createProductObservation({
      source: 'shopify',
      environment: 'preview',
      observedAt,
      product: product(),
      capabilityEvidence,
    });
    const decision = reviewProductObservation({
      observation,
      expectedHandle: 'test-product',
      capabilityDecision: {
        status: 'human_required',
        blocker: {
          humanAction: 'Configure read-only access.',
          resumePoint: 'Resume at the product observation.',
        },
      },
    });

    expect(decision.blockers.map(item => item.code)).toEqual(expect.arrayContaining([
      'SHOPIFY_PRODUCT_READ_CAPABILITY_REQUIRED',
      'PRODUCT_OBSERVATION_REVIEW_APPROVAL_REQUIRED',
    ]));
  });

  it('does not create a Shopify candidate without durable capability evidence', () => {
    expect(() => createProductObservation({
      source: 'shopify',
      environment: 'preview',
      observedAt,
      product: product(),
    })).toThrow('durable product-read capability evidence');
  });

  it('rejects unrelated capability evidence and approval for another fingerprint or handle', () => {
    const observation = createProductObservation({
      source: 'shopify',
      environment: 'preview',
      observedAt,
      product: product(),
      capabilityEvidence: 'evidence/unrelated-read',
    });
    const decision = reviewProductObservation({
      observation,
      expectedHandle: 'test-product',
      capabilityDecision: readyCapability,
      reviewApproval: {
        ...approvalFor(observation),
        observationFingerprint: `sha256:${'f'.repeat(64)}`,
        handle: 'another-product',
      },
    });

    expect(decision.blockers.map(item => item.code)).toEqual(expect.arrayContaining([
      'PRODUCT_OBSERVATION_CAPABILITY_EVIDENCE_MISMATCH',
      'PRODUCT_OBSERVATION_REVIEW_APPROVAL_REQUIRED',
    ]));
    expect(decision.candidateReleasePatch).toBeNull();
  });

  it('rejects missing or duplicate raw variant references before hashing', () => {
    const missing = product();
    missing.observedVariants[0].id = '';
    expect(() => createProductObservation({
      source: 'shopify',
      environment: 'preview',
      observedAt,
      product: missing,
      capabilityEvidence,
    })).toThrow('unique raw variant references');

    const duplicate = product();
    duplicate.observedVariants[1].id = duplicate.observedVariants[0].id;
    expect(() => createProductObservation({
      source: 'shopify',
      environment: 'preview',
      observedAt,
      product: duplicate,
      capabilityEvidence,
    })).toThrow('unique raw variant references');
  });

  it('blocks duplicate hashes and inconsistent price, currency, and availability facts', () => {
    const observation = createProductObservation({
      source: 'shopify',
      environment: 'preview',
      observedAt,
      product: product(),
      capabilityEvidence,
    });
    observation.variants[1].referenceHash = observation.variants[0].referenceHash;
    observation.variants[0].price = { amount: '-1', currency: 'usd' };
    observation.product.minimumPrice = 500;
    observation.product.maximumPrice = 100;
    observation.product.availableForSale = false;

    const decision = reviewProductObservation({
      observation,
      expectedHandle: 'test-product',
      capabilityDecision: readyCapability,
      reviewApproval: approvalFor(observation),
    });

    expect(decision.blockers.map(item => item.code)).toEqual(expect.arrayContaining([
      'PRODUCT_OBSERVATION_INTEGRITY_MISMATCH',
      'PRODUCT_OBSERVATION_FACTS_INVALID',
    ]));
    expect(decision.candidateReleasePatch).toBeNull();
  });

  it('returns a candidate patch but never mutates a release record', () => {
    const observation = createProductObservation({
      source: 'shopify',
      environment: 'preview',
      observedAt,
      product: product(),
      capabilityEvidence,
    });
    const releaseRecord = {
      shopify: {
        handle: 'test-product',
        variantFingerprint: null,
        variantFingerprintStatus: 'missing',
      },
    };
    const before = structuredClone(releaseRecord);
    const decision = reviewProductObservation({
      observation,
      expectedHandle: releaseRecord.shopify.handle,
      capabilityDecision: readyCapability,
      reviewApproval: approvalFor(observation),
    });

    expect(decision).toMatchObject({
      status: 'accepted',
      authoritative: true,
      blockers: [],
      candidateReleasePatch: {
        handle: 'test-product',
        observedAt,
        variantFingerprintStatus: 'observed',
        commerceFactsFingerprint: observation.commerceFactsFingerprint,
        commerceFactsFingerprintStatus: 'reviewed',
        observationFingerprint: observation.observationFingerprint,
        observationFingerprintStatus: 'reviewed',
        observationReviewEvidence: approvalFor(observation).evidence,
      },
    });
    expect(decision.candidateReleasePatch.variantFingerprint).toBe(
      observation.variantFingerprint
    );
    decision.candidateReleasePatch.variantFingerprint = `sha256:${'f'.repeat(64)}`;
    expect(releaseRecord).toEqual(before);
  });

  it('attaches the complete sanitized observation for runtime integrity checks', () => {
    const observedProduct = product();
    const observation = createProductObservation({
      source: 'shopify',
      environment: 'local',
      observedAt,
      product: observedProduct,
      capabilityEvidence,
    });
    const attached = attachObservationToProduct(observedProduct, observation);

    expect(attached.variantFingerprint).toBe(observation.variantFingerprint);
    expect(attached.observation).toEqual(observation);
    expect(JSON.stringify(attached.observation)).not.toContain('gid://');
    expect(attached.observation.variants.every(variant => (
      /^sha256:[a-f0-9]{64}$/.test(variant.referenceHash)
    ))).toBe(true);
  });
});

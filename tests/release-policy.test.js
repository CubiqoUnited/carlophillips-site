import { describe, expect, it } from 'vitest';
import { resolveProductSource } from '../lib/commerce/release-policy.js';
import {
  createCompleteMediaManifest,
  createCompleteReleaseRecord,
  createObservedShopifyProduct,
} from './fixtures/release-fixtures.js';

const fixtureProduct = { id: 'fixture-1', title: 'Layout Fixture' };

describe('release source policy', () => {
  it('allows an explicitly labeled non-commerce fixture locally', () => {
    const decision = resolveProductSource({ environment: 'local', fixtureProduct });
    expect(decision).toMatchObject({
      status: 'available',
      source: 'fixture',
      visibilityAllowed: true,
      commerceAllowed: false,
      reason: 'LOCAL_NON_COMMERCE_FIXTURE',
    });
    expect(decision.product).toMatchObject({
      source: 'fixture',
      allowedEnvironment: 'local',
      commerceMode: 'non-commerce',
    });
  });

  it.each(['preview', 'production'])('returns unavailable instead of a fixture after Shopify failure in %s', environment => {
    const decision = resolveProductSource({
      environment,
      fixtureProduct,
      shopifyError: new Error('deliberate test failure'),
    });
    expect(decision).toEqual({
      schemaVersion: 'cp.release-decision.v1',
      environment,
      status: 'unavailable',
      source: 'unavailable',
      visibilityAllowed: false,
      commerceAllowed: false,
      reason: 'SHOPIFY_REQUEST_FAILED',
      product: null,
    });
  });

  it('allows a matching Staged Shopify candidate for private Preview review only', () => {
    const releaseRecord = createCompleteReleaseRecord('staged');
    const decision = resolveProductSource({
      environment: 'preview',
      shopifyProduct: createObservedShopifyProduct('test-product', 'preview'),
      releaseRecord,
      mediaManifest: createCompleteMediaManifest(),
      fixtureProduct,
    });
    expect(decision.source).toBe('shopify');
    expect(decision.product.source).toBe('shopify');
    expect(decision).toMatchObject({
      visibilityAllowed: true,
      commerceAllowed: false,
      reason: 'PRIVATE_RELEASE_REVIEW_NON_COMMERCE',
    });
  });

  it('returns only observation-bound customer copy from the complete Preview release path', () => {
    const shopifyProduct = createObservedShopifyProduct('test-product', 'preview');
    Object.assign(shopifyProduct, {
      title: 'Outer injected title',
      name: 'Outer injected name',
      description: 'Outer injected description',
      vendor: 'Outer injected vendor',
      productType: 'Outer injected type',
      tagline: 'OUTER INJECTED TAGLINE',
      details: ['Outer injected detail'],
      story: 'Outer injected story',
      descriptionHtml: '<script>outer injected HTML</script>',
    });

    const decision = resolveProductSource({
      environment: 'preview',
      shopifyProduct,
      releaseRecord: createCompleteReleaseRecord('staged'),
      mediaManifest: createCompleteMediaManifest(),
    });

    expect(decision.product).toMatchObject({
      title: 'Observed product',
      description: 'Observed product description.',
      vendor: 'Observed vendor',
      productType: 'Hoodie',
      tagline: 'SIGNATURE',
      details: ['Observed product description.'],
    });
    expect(JSON.stringify(decision.product)).not.toContain('Outer injected');
    expect(decision.product).not.toHaveProperty('descriptionHtml');
    expect(decision.product).not.toHaveProperty('story');
  });

  it.each(['preview', 'production'])('denies an observed Shopify product without a release record in %s', environment => {
    expect(resolveProductSource({
      environment,
      shopifyProduct: { handle: 'test-product' },
    })).toMatchObject({
      status: 'denied',
      visibilityAllowed: false,
      commerceAllowed: false,
      reason: 'PRODUCT_RELEASE_RECORD_REQUIRED',
      product: null,
    });
  });

  it('denies a Draft release in Preview and an Approved release in production', () => {
    expect(resolveProductSource({
      environment: 'preview',
      shopifyProduct: { handle: 'test-product' },
      releaseRecord: createCompleteReleaseRecord('draft'),
      mediaManifest: createCompleteMediaManifest(),
    }).reason).toBe('PRODUCT_RELEASE_NOT_STAGED');

    expect(resolveProductSource({
      environment: 'production',
      shopifyProduct: { handle: 'test-product' },
      releaseRecord: createCompleteReleaseRecord('approved'),
      mediaManifest: createCompleteMediaManifest(),
    }).reason).toBe('PRODUCT_RELEASE_NOT_RELEASED');
  });

  it('denies Preview when reviewed observation bindings are missing', () => {
    const releaseRecord = createCompleteReleaseRecord('staged');
    releaseRecord.shopify.commerceFactsFingerprint = null;
    releaseRecord.shopify.commerceFactsFingerprintStatus = 'missing';
    releaseRecord.shopify.observationFingerprint = null;
    releaseRecord.shopify.observationFingerprintStatus = 'missing';
    releaseRecord.shopify.observationReviewEvidence = null;

    expect(resolveProductSource({
      environment: 'preview',
      shopifyProduct: createObservedShopifyProduct('test-product', 'preview'),
      releaseRecord,
      mediaManifest: createCompleteMediaManifest(),
    })).toMatchObject({
      status: 'denied',
      reason: 'PRODUCT_OBSERVATION_REVIEW_REQUIRED',
      product: null,
    });
  });

  it('allows truthful production visibility only for a complete Released record while commerce stays disabled', () => {
    const decision = resolveProductSource({
      environment: 'production',
      shopifyProduct: createObservedShopifyProduct('test-product', 'production'),
      releaseRecord: createCompleteReleaseRecord('released'),
      mediaManifest: createCompleteMediaManifest(),
    });
    expect(decision).toMatchObject({
      status: 'available',
      source: 'shopify',
      visibilityAllowed: true,
      commerceAllowed: false,
      reason: 'RELEASED_PRODUCT_PURCHASE_FLOW_UNVERIFIED',
    });
  });

  it('denies production when a Released record has incomplete media evidence', () => {
    const manifest = createCompleteMediaManifest();
    manifest.requirements.find(item => item.modality === 'video').status = 'missing';
    expect(resolveProductSource({
      environment: 'production',
      shopifyProduct: createObservedShopifyProduct('test-product', 'production'),
      releaseRecord: createCompleteReleaseRecord('released'),
      mediaManifest: manifest,
    }).reason).toBe('PRODUCT_RELEASE_EVIDENCE_INCOMPLETE');
  });

  it('denies mismatched or withdrawn release evidence', () => {
    expect(resolveProductSource({
      environment: 'preview',
      shopifyProduct: { handle: 'another-product' },
      releaseRecord: createCompleteReleaseRecord('staged'),
      mediaManifest: createCompleteMediaManifest(),
    }).reason).toBe('PRODUCT_RELEASE_EVIDENCE_MISMATCH');

    const withdrawn = createCompleteReleaseRecord('released');
    withdrawn.state = 'withdrawn';
    expect(resolveProductSource({
      environment: 'production',
      shopifyProduct: { handle: 'test-product' },
      releaseRecord: withdrawn,
      mediaManifest: createCompleteMediaManifest(),
    }).reason).toBe('PRODUCT_RELEASE_WITHDRAWN');
  });
});

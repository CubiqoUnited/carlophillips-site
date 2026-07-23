import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';
import commerceProductSchema from '../contracts/commerce-product.schema.json';
import mediaAssetSchema from '../contracts/media-asset.schema.json';
import productReleaseSchema from '../contracts/product-release.schema.json';
import releaseDecisionSchema from '../contracts/release-decision.schema.json';

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);

const validateCommerceProduct = ajv.compile(commerceProductSchema);
const validateMediaAsset = ajv.compile(mediaAssetSchema);
const validateProductRelease = ajv.compile(productReleaseSchema);
const validateReleaseDecision = ajv.compile(releaseDecisionSchema);

const product = {
  id: 'gid://shopify/Product/1',
  handle: 'test-product',
  title: 'Test Product',
  currency: 'USD',
  variants: [],
  media: [],
};

describe('truth contracts', () => {
  it('accepts a source-labeled Shopify product', () => {
    expect(validateCommerceProduct({
      schemaVersion: 'cp.commerce-product.v1',
      source: 'shopify',
      environment: 'preview',
      fetchedAt: '2026-07-22T22:00:00Z',
      product,
    })).toBe(true);
  });

  it('rejects a source-less product', () => {
    expect(validateCommerceProduct({
      schemaVersion: 'cp.commerce-product.v1',
      environment: 'preview',
      fetchedAt: '2026-07-22T22:00:00Z',
      product,
    })).toBe(false);
  });

  it.each(['preview', 'production'])('rejects fixture commerce data in %s', environment => {
    expect(validateCommerceProduct({
      schemaVersion: 'cp.commerce-product.v1',
      source: 'fixture',
      environment,
      fetchedAt: '2026-07-22T22:00:00Z',
      commerceMode: 'non-commerce',
      product,
    })).toBe(false);
  });

  it('requires media provenance and approval fields', () => {
    expect(validateMediaAsset({
      schemaVersion: 'cp.product-media-asset.v1',
      assetId: 'front-1',
      kind: 'image',
      exactProductMatch: 'verified',
      rightsStatus: 'verified',
      approvalStatus: 'pending',
      alt: 'Front view',
    })).toBe(false);
  });

  it('validates a pending release record without claiming approval', () => {
    expect(validateProductRelease({
      schemaVersion: 'cp.product-release.v1',
      releaseId: 'cp-test-product-2026-001',
      state: 'draft',
      shopify: {
        productReference: 'sanitized-test-product',
        handle: 'test-product',
        statusObserved: 'DRAFT',
        observedAt: '2026-07-22T22:00:00Z',
        variantFingerprint: `sha256:${'a'.repeat(64)}`,
      },
      fulfillmentMappings: [],
      mediaManifest: 'fixtures/test-media-manifest.json',
      approvals: {
        product: { status: 'pending', owner: 'Product Owner' },
        media: { status: 'pending', owner: 'Product Owner/designee' },
        fulfillment: { status: 'pending', owner: 'Product Owner/designee' },
      },
      candidate: { gitCommit: null, buildEvidence: null, stagingEvidence: null },
      rollback: { previousReleaseId: null },
    })).toBe(true);
  });

  it('validates an explicit unavailable release decision', () => {
    expect(validateReleaseDecision({
      schemaVersion: 'cp.release-decision.v1',
      environment: 'production',
      status: 'unavailable',
      source: 'unavailable',
      visibilityAllowed: false,
      commerceAllowed: false,
      reason: 'SHOPIFY_REQUEST_FAILED',
      product: null,
    })).toBe(true);
  });
});

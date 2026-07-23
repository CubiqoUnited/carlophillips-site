import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';
import commerceProductSchema from '../contracts/commerce-product.schema.json';
import commerceCartSchema from '../contracts/commerce-cart.schema.json';
import pipelineRunSchema from '../contracts/pipeline-run.schema.json';
import mediaManifestSchema from '../contracts/media-manifest.schema.json';
import capabilityRegistrySchema from '../contracts/capability-registry.schema.json';
import productCreationJobSchema from '../contracts/product-creation-job.schema.json';
import mediaAssetSchema from '../contracts/media-asset.schema.json';
import productReleaseSchema from '../contracts/product-release.schema.json';
import releaseDecisionSchema from '../contracts/release-decision.schema.json';
import hoodieRelease from '../releases/cp-signature-hoodie-2026-001/release.json';
import hoodieMediaManifest from '../releases/cp-signature-hoodie-2026-001/media-manifest.json';
import hoodiePipelineRun from '../runs/cp-hoodie-local-sim-001/run.json';
import capabilityRegistry from '../config/capability-registry.json';
import designerCreationJob from '../runs/cp-hoodie-designer-contract-sim-002/job.json';
import trendCreationJob from '../runs/cp-hoodie-trend-contract-sim-003/job.json';
import designerCreationRun from '../runs/cp-hoodie-designer-contract-sim-002/run.json';
import trendCreationRun from '../runs/cp-hoodie-trend-contract-sim-003/run.json';

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
ajv.addSchema(mediaAssetSchema);

const validateCommerceProduct = ajv.compile(commerceProductSchema);
const validateCommerceCart = ajv.compile(commerceCartSchema);
const validatePipelineRun = ajv.compile(pipelineRunSchema);
const validateMediaManifest = ajv.compile(mediaManifestSchema);
const validateCapabilityRegistry = ajv.compile(capabilityRegistrySchema);
const validateProductCreationJob = ajv.compile(productCreationJobSchema);
const validateMediaAsset = ajv.getSchema(mediaAssetSchema.$id);
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

  it.each(['preview', 'production'])('rejects fixture cart data in %s', environment => {
    expect(validateCommerceCart({
      schemaVersion: 'cp.commerce-cart-envelope.v1',
      source: 'fixture',
      environment,
      status: 'ready',
      reason: null,
      cart: {
        schemaVersion: 'cp.commerce-cart.v1',
        source: 'fixture',
        id: null,
        items: [],
        total: 0,
        subtotal: 0,
        totalQuantity: 0,
        checkoutUrl: '',
      },
    })).toBe(false);
  });

  it('accepts an explicit unavailable production cart decision', () => {
    expect(validateCommerceCart({
      schemaVersion: 'cp.commerce-cart-envelope.v1',
      source: 'unavailable',
      environment: 'production',
      status: 'unavailable',
      reason: 'SHOPIFY_CART_UNAVAILABLE',
      cart: null,
    })).toBe(true);
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
        variantFingerprintStatus: 'observed',
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

  it('validates the evidence-bound Draft Hoodie record', () => {
    expect(validateProductRelease(hoodieRelease)).toBe(true);
    expect(hoodieRelease.state).toBe('draft');
    expect(hoodieRelease.shopify.variantFingerprintStatus).toBe('missing');
    expect(Object.values(hoodieRelease.approvals).every(approval => approval.status === 'pending')).toBe(true);
  });

  it('validates every Hoodie media asset and keeps uncertain assets quarantined', () => {
    expect(validateMediaManifest(hoodieMediaManifest)).toBe(true);
    expect(hoodieMediaManifest.assets.every(asset => validateMediaAsset(asset))).toBe(true);
    const quarantined = hoodieMediaManifest.assets.filter(asset => asset.approvalStatus === 'quarantined');
    expect(quarantined).toHaveLength(2);
    expect(quarantined.every(asset => asset.exactProductMatch === 'unverified')).toBe(true);
  });

  it('rejects an approved release with a missing variant fingerprint', () => {
    const invalidApprovedRecord = structuredClone(hoodieRelease);
    invalidApprovedRecord.state = 'approved';
    expect(validateProductRelease(invalidApprovedRecord)).toBe(false);
  });

  it('validates a blocked four-lane Hoodie simulation without granting restricted approvals', () => {
    expect(validatePipelineRun(hoodiePipelineRun)).toBe(true);
    expect(hoodiePipelineRun.state).toBe('blocked');
    expect(new Set(hoodiePipelineRun.workItems.map(item => item.lane)).size).toBe(4);
    expect(Object.values(hoodiePipelineRun.approvals).every(approval => approval.status === 'pending')).toBe(true);
  });

  it('validates both local creation-mode simulations as draft-only and non-authoritative', () => {
    expect(validateProductCreationJob(designerCreationJob)).toBe(true);
    expect(validateProductCreationJob(trendCreationJob)).toBe(true);
    expect(designerCreationJob.contractBindings).toMatchObject({
      productReleaseRecord: trendCreationJob.contractBindings.productReleaseRecord,
      mediaRegistry: trendCreationJob.contractBindings.mediaRegistry,
      commerceGateway: trendCreationJob.contractBindings.commerceGateway,
      pipelineRunContract: trendCreationJob.contractBindings.pipelineRunContract,
    });
    expect(designerCreationJob.contractBindings.pipelineRunId)
      .not.toBe(trendCreationJob.contractBindings.pipelineRunId);
    expect(Object.values(designerCreationJob.truthPolicy).every(value => value === false)).toBe(true);
    expect(Object.values(trendCreationJob.approvals).every(approval => approval.status === 'pending')).toBe(true);
    expect(validatePipelineRun(designerCreationRun)).toBe(true);
    expect(validatePipelineRun(trendCreationRun)).toBe(true);
    expect(designerCreationRun.state).toBe('in_progress_with_blockers');
    expect(trendCreationRun.state).toBe('in_progress_with_blockers');
  });

  it.each(['preview', 'production'])('rejects fixture creation evidence in %s', environment => {
    expect(validateProductCreationJob({
      ...structuredClone(trendCreationJob),
      environment,
      simulation: false,
    })).toBe(false);
  });

  it('rejects trend evidence that claims candidate-input authority', () => {
    const invalid = structuredClone(trendCreationJob);
    invalid.inputEvidence[0].sourceType = 'research';
    invalid.inputEvidence[0].authority = 'candidate-input';
    invalid.inputEvidence[0].confidence = 'medium';
    expect(validateProductCreationJob(invalid)).toBe(false);
  });

  it('validates the evidence-labeled capability registry without inventing callable access', () => {
    expect(validateCapabilityRegistry(capabilityRegistry)).toBe(true);
    const cartCapability = capabilityRegistry.capabilities.find(item => item.capability === 'shopify-storefront-cart');
    expect(cartCapability).toMatchObject({
      accessState: 'human_required',
      callableSurface: 'unverified',
      allowedOperations: [],
      blocker: { code: 'SHOPIFY_EMAIL_OTP_REQUIRED' },
    });
  });
});

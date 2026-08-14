import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';
import commerceProductSchema from '../contracts/commerce-product.schema.json';
import commerceCartSchema from '../contracts/commerce-cart.schema.json';
import cartActivationDecisionSchema from '../contracts/cart-activation-decision.schema.json';
import productObservationSchema from '../contracts/product-observation.schema.json';
import variantPresentationSchema from '../contracts/variant-presentation.schema.json';
import variantResolutionDecisionSchema from '../contracts/variant-resolution-decision.schema.json';
import productObservationReviewSchema from '../contracts/product-observation-review.schema.json';
import pipelineRunSchema from '../contracts/pipeline-run.schema.json';
import mediaManifestSchema from '../contracts/media-manifest.schema.json';
import capabilityRegistrySchema from '../contracts/capability-registry.schema.json';
import productCreationJobSchema from '../contracts/product-creation-job.schema.json';
import productBriefSchema from '../contracts/product-brief.schema.json';
import mediaAssetSchema from '../contracts/media-asset.schema.json';
import productReleaseSchema from '../contracts/product-release.schema.json';
import releaseDecisionSchema from '../contracts/release-decision.schema.json';
import releaseTransitionDecisionSchema from '../contracts/release-transition-decision.schema.json';
import hoodieRelease from '../releases/cp-signature-hoodie-2026-001/release.json';
import hoodieMediaManifest from '../releases/cp-signature-hoodie-2026-001/media-manifest.json';
import hoodiePipelineRun from '../runs/cp-hoodie-local-sim-001/run.json';
import capabilityRegistry from '../config/capability-registry.json';
import designerCreationJob from '../runs/cp-hoodie-designer-contract-sim-002/job.json';
import trendCreationJob from '../runs/cp-hoodie-trend-contract-sim-003/job.json';
import designerProductBrief from '../runs/cp-hoodie-designer-contract-sim-002/brief.json';
import trendProductBrief from '../runs/cp-hoodie-trend-contract-sim-003/brief.json';
import designerCreationRun from '../runs/cp-hoodie-designer-contract-sim-002/run.json';
import trendCreationRun from '../runs/cp-hoodie-trend-contract-sim-003/run.json';
import hoodieStagingReadiness from '../releases/cp-signature-hoodie-2026-001/staging-readiness.json';
import { evaluateProductReleaseTransition } from '../apps/web/src/lib/releases/product-release-transition';
import {
  createCompleteMediaManifest,
  createCompleteReleaseRecord,
} from './fixtures/release-fixtures';

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
ajv.addSchema(mediaAssetSchema);
ajv.addSchema(productReleaseSchema);
ajv.addSchema(productBriefSchema);

const validateCommerceProduct = ajv.compile(commerceProductSchema);
const validateCommerceCart = ajv.compile(commerceCartSchema);
const validateCartActivationDecision = ajv.compile(
  cartActivationDecisionSchema
);
const validateProductObservation = ajv.compile(productObservationSchema);
const validateVariantPresentation = ajv.compile(variantPresentationSchema);
const validateVariantResolutionDecision = ajv.compile(
  variantResolutionDecisionSchema
);
const validateProductObservationReview = ajv.compile(
  productObservationReviewSchema
);
const validatePipelineRun = ajv.compile(pipelineRunSchema);
const validateMediaManifest = ajv.compile(mediaManifestSchema);
const validateCapabilityRegistry = ajv.compile(capabilityRegistrySchema);
const validateProductCreationJob = ajv.compile(productCreationJobSchema);
const validateProductBrief = ajv.getSchema(productBriefSchema.$id);
const validateMediaAsset = ajv.getSchema(mediaAssetSchema.$id);
const validateProductRelease = ajv.getSchema(productReleaseSchema.$id);
const validateReleaseDecision = ajv.compile(releaseDecisionSchema);
const validateReleaseTransitionDecision = ajv.compile(
  releaseTransitionDecisionSchema
);

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
    expect(
      validateCommerceProduct({
        schemaVersion: 'cp.commerce-product.v1',
        source: 'shopify',
        environment: 'preview',
        fetchedAt: '2026-07-22T22:00:00Z',
        product,
      })
    ).toBe(true);
  });

  it('rejects a source-less product', () => {
    expect(
      validateCommerceProduct({
        schemaVersion: 'cp.commerce-product.v1',
        environment: 'preview',
        fetchedAt: '2026-07-22T22:00:00Z',
        product,
      })
    ).toBe(false);
  });

  it.each(['preview', 'production'])(
    'rejects fixture commerce data in %s',
    (environment) => {
      expect(
        validateCommerceProduct({
          schemaVersion: 'cp.commerce-product.v1',
          source: 'fixture',
          environment,
          fetchedAt: '2026-07-22T22:00:00Z',
          commerceMode: 'non-commerce',
          product,
        })
      ).toBe(false);
    }
  );

  it.each(['preview', 'production'])(
    'rejects fixture cart data in %s',
    (environment) => {
      expect(
        validateCommerceCart({
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
        })
      ).toBe(false);
    }
  );

  it('accepts an explicit unavailable production cart decision', () => {
    expect(
      validateCommerceCart({
        schemaVersion: 'cp.commerce-cart-envelope.v1',
        source: 'unavailable',
        environment: 'production',
        status: 'unavailable',
        reason: 'SHOPIFY_CART_UNAVAILABLE',
        cart: null,
      })
    ).toBe(true);
  });

  it('validates a blocked cart activation without implying checkout authority', () => {
    expect(
      validateCartActivationDecision({
        schemaVersion: 'cp.cart-activation-decision.v1',
        environment: 'production',
        status: 'blocked',
        productHandle: 'test-product',
        cartAllowed: false,
        checkoutAllowed: false,
        reason: 'PRODUCT_OWNER_CART_ACTIVATION_APPROVAL_REQUIRED',
        checkoutReason: 'CHECKOUT_REQUIRES_SEPARATE_APPROVAL_AND_LIVE_PROOF',
        prerequisites: Array.from({ length: 8 }, (_, index) => ({
          code: `PREREQUISITE_${index + 1}`,
          status: index === 0 ? 'human_required' : 'satisfied',
          resumePoint: index === 0 ? 'Obtain exact scoped approval.' : null,
        })),
      })
    ).toBe(true);
  });

  it('rejects a blocked cart activation that claims cart or checkout authority', () => {
    const decision = {
      schemaVersion: 'cp.cart-activation-decision.v1',
      environment: 'production',
      status: 'blocked',
      productHandle: null,
      cartAllowed: true,
      checkoutAllowed: true,
      reason: 'INVALID_AUTHORITY_CLAIM',
      checkoutReason: 'CHECKOUT_REQUIRES_SEPARATE_APPROVAL_AND_LIVE_PROOF',
      prerequisites: Array.from({ length: 8 }, (_, index) => ({
        code: `PREREQUISITE_${index + 1}`,
        status: 'blocked',
        resumePoint: 'Resolve the prerequisite.',
      })),
    };

    expect(validateCartActivationDecision(decision)).toBe(false);
  });

  it('validates non-authoritative local observation and blocked review contracts', () => {
    const observation = {
      schemaVersion: 'cp.product-observation.v1',
      source: 'simulation',
      authority: 'non_authoritative',
      environment: 'local',
      observedAt: '2026-07-23T05:00:00Z',
      capabilityEvidence: null,
      product: {
        handle: 'test-product',
        title: 'Test Product',
        description: '',
        vendor: '',
        productType: '',
        tagline: '',
        details: [],
        currency: 'USD',
        minimumPrice: 128,
        maximumPrice: 128,
        availableForSale: false,
      },
      variants: [
        {
          referenceHash: `sha256:${'c'.repeat(64)}`,
          title: 'Default',
          selectedOptions: [{ name: 'Title', value: 'Default Title' }],
          availableForSale: false,
          price: { amount: '128.00', currency: 'USD' },
        },
      ],
      variantFingerprint: `sha256:${'a'.repeat(64)}`,
      commerceFactsFingerprint: `sha256:${'d'.repeat(64)}`,
      observationFingerprint: `sha256:${'b'.repeat(64)}`,
      review: {
        status: 'pending',
        owner: 'Product Owner/designee',
        evidence: null,
      },
    };
    expect(validateProductObservation(observation)).toBe(true);
    const missingReviewedCopy = structuredClone(observation);
    delete missingReviewedCopy.product.description;
    expect(validateProductObservation(missingReviewedCopy)).toBe(false);
    expect(
      validateProductObservation({ ...observation, environment: 'preview' })
    ).toBe(false);
    expect(
      validateProductObservation({
        ...observation,
        source: 'shopify',
        authority: 'candidate',
        environment: 'preview',
        capabilityEvidence: null,
      })
    ).toBe(false);
    expect(
      validateProductObservationReview({
        schemaVersion: 'cp.product-observation-review.v1',
        status: 'blocked',
        authoritative: false,
        observationFingerprint: observation.observationFingerprint,
        blockers: [
          {
            code: 'AUTHORITATIVE_SHOPIFY_OBSERVATION_REQUIRED',
            humanAction: 'Use direct Shopify evidence.',
            resumePoint: 'Resume at an authorized read-only observation.',
          },
        ],
        candidateReleasePatch: null,
      })
    ).toBe(true);
    expect(
      validateProductObservationReview({
        schemaVersion: 'cp.product-observation-review.v1',
        status: 'accepted',
        authoritative: true,
        observationFingerprint: observation.observationFingerprint,
        blockers: [],
        candidateReleasePatch: {
          handle: 'test-product',
          observedAt: observation.observedAt,
          variantFingerprint: observation.variantFingerprint,
          variantFingerprintStatus: 'observed',
          commerceFactsFingerprint: observation.commerceFactsFingerprint,
          commerceFactsFingerprintStatus: 'reviewed',
          observationFingerprint: observation.observationFingerprint,
          observationFingerprintStatus: 'reviewed',
          observationReviewEvidence: 'approval/product-observation-001',
        },
      })
    ).toBe(true);
  });

  it('validates only a review-only, non-authoritative variant presentation', () => {
    const presentation = {
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
    expect(validateVariantPresentation(presentation)).toBe(true);
    expect(
      validateVariantPresentation({ ...presentation, selectionAllowed: true })
    ).toBe(false);
    expect(
      validateVariantPresentation({ ...presentation, cartAuthority: true })
    ).toBe(false);
  });

  it('validates only sanitized, non-mutating variant-resolution readiness', () => {
    const decision = {
      schemaVersion: 'cp.variant-resolution-decision.v1',
      environment: 'preview',
      status: 'ready',
      capability: 'shopify-storefront-variant-resolver',
      adapter: 'server-only-shopify-variant-resolver',
      callableSurface: 'server_only',
      productHandle: 'test-product',
      variantFingerprint: `sha256:${'a'.repeat(64)}`,
      evidenceRef: 'tests/variant-resolution-policy.test.js',
      productReadEvidenceRef: 'evidence/shopify-storefront-read-001',
      mappedVariantCount: 2,
      mappingComplete: true,
      rawReferenceExposed: false,
      cartMutationAuthorized: false,
      checkoutAuthorized: false,
      blockers: [],
    };
    expect(validateVariantResolutionDecision(decision)).toBe(true);
    expect(
      validateVariantResolutionDecision({
        ...decision,
        rawVariantId: 'gid://shopify/ProductVariant/1',
      })
    ).toBe(false);
    expect(
      validateVariantResolutionDecision({
        ...decision,
        callableSurface: 'local',
      })
    ).toBe(false);
    expect(
      validateVariantResolutionDecision({
        ...decision,
        cartMutationAuthorized: true,
      })
    ).toBe(false);
  });

  it('requires media provenance and approval fields', () => {
    expect(
      validateMediaAsset({
        schemaVersion: 'cp.product-media-asset.v1',
        assetId: 'front-1',
        kind: 'image',
        exactProductMatch: 'verified',
        rightsStatus: 'verified',
        approvalStatus: 'pending',
        alt: 'Front view',
      })
    ).toBe(false);
  });

  it('validates a pending release record without claiming approval', () => {
    expect(
      validateProductRelease({
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
          commerceFactsFingerprint: `sha256:${'b'.repeat(64)}`,
          commerceFactsFingerprintStatus: 'reviewed',
          observationFingerprint: `sha256:${'c'.repeat(64)}`,
          observationFingerprintStatus: 'reviewed',
          observationReviewEvidence: 'approval/product-observation-001',
        },
        fulfillmentMappings: [],
        physicalSample: {
          status: 'pending',
          sampleReference: null,
          fit: 'pending',
          colour: 'pending',
          artworkPlacement: 'pending',
          finish: 'pending',
          evidence: null,
        },
        mediaManifest: 'fixtures/test-media-manifest.json',
        approvals: {
          product: { status: 'pending', owner: 'Product Owner' },
          media: { status: 'pending', owner: 'Product Owner/designee' },
          fulfillment: { status: 'pending', owner: 'Product Owner/designee' },
        },
        candidate: {
          gitCommit: null,
          buildEvidence: null,
          stagingEvidence: null,
          responsiveEvidence: null,
          performanceEvidence: null,
          tokenEvidence: null,
        },
        rollback: {
          strategy: null,
          planEvidence: null,
          verificationEvidence: null,
          previousReleaseId: null,
        },
      })
    ).toBe(true);
  });

  it('validates an explicit unavailable release decision', () => {
    expect(
      validateReleaseDecision({
        schemaVersion: 'cp.release-decision.v1',
        environment: 'production',
        status: 'unavailable',
        source: 'unavailable',
        visibilityAllowed: false,
        commerceAllowed: false,
        reason: 'SHOPIFY_REQUEST_FAILED',
        product: null,
      })
    ).toBe(true);
  });

  it('requires denied release decisions to remain invisible and non-commerce', () => {
    const denied = {
      schemaVersion: 'cp.release-decision.v1',
      environment: 'production',
      status: 'denied',
      source: 'shopify',
      visibilityAllowed: false,
      commerceAllowed: false,
      reason: 'PRODUCT_RELEASE_NOT_RELEASED',
      product: null,
    };

    expect(validateReleaseDecision(denied)).toBe(true);
    expect(
      validateReleaseDecision({
        ...denied,
        visibilityAllowed: true,
        product: { handle: 'signature-hoodie' },
      })
    ).toBe(false);
  });

  it('validates the evidence-bound Draft Hoodie record', () => {
    expect(validateProductRelease(hoodieRelease)).toBe(true);
    expect(hoodieRelease.state).toBe('draft');
    expect(hoodieRelease.shopify.variantFingerprintStatus).toBe('missing');
    expect(
      Object.values(hoodieRelease.approvals).every(
        (approval) => approval.status === 'pending'
      )
    ).toBe(true);
  });

  it('validates every Hoodie media asset and keeps uncertain or artifacted assets quarantined', () => {
    expect(validateMediaManifest(hoodieMediaManifest)).toBe(true);
    expect(
      hoodieMediaManifest.assets.every((asset) => validateMediaAsset(asset))
    ).toBe(true);
    const quarantined = hoodieMediaManifest.assets.filter(
      (asset) => asset.approvalStatus === 'quarantined'
    );
    expect(quarantined).toHaveLength(3);
    expect(
      quarantined.every((asset) => asset.exactProductMatch === 'unverified')
    ).toBe(true);
    expect(quarantined).toContainEqual(
      expect.objectContaining({
        assetId: 'modelize-137843f7-embroidery-detail-quarantined',
        quality: expect.objectContaining({ status: 'failed' }),
      })
    );
  });

  it('rejects a media manifest that downgrades required video to where-feasible', () => {
    const manifest = createCompleteMediaManifest();
    const video = manifest.requirements.find(
      (item) => item.modality === 'video'
    );
    video.requirement = 'where-feasible';
    video.status = 'infeasible-approved';
    video.assetIds = [];
    video.infeasibilityBlocker = {
      reason: 'Required product film cannot be silently waived.',
      approvalStatus: 'approved',
      owner: 'Product Owner',
    };
    expect(validateMediaManifest(manifest)).toBe(false);
  });

  it('rejects an approved release with a missing variant fingerprint', () => {
    const invalidApprovedRecord = structuredClone(hoodieRelease);
    invalidApprovedRecord.state = 'approved';
    expect(validateProductRelease(invalidApprovedRecord)).toBe(false);
  });

  it('rejects contradictory Draft fingerprint status/value pairs', () => {
    const record = createCompleteReleaseRecord('draft');
    record.shopify.commerceFactsFingerprintStatus = 'missing';
    expect(validateProductRelease(record)).toBe(false);

    const observationMismatch = createCompleteReleaseRecord('draft');
    observationMismatch.shopify.observationFingerprintStatus = 'missing';
    expect(validateProductRelease(observationMismatch)).toBe(false);
  });

  it.each([
    [
      'missing fulfillment mapping',
      (record) => {
        record.fulfillmentMappings = [];
      },
    ],
    [
      'pending product approval',
      (record) => {
        record.approvals.product.status = 'pending';
      },
    ],
    [
      'pending media approval',
      (record) => {
        record.approvals.media.status = 'pending';
      },
    ],
    [
      'pending fulfillment approval',
      (record) => {
        record.approvals.fulfillment.status = 'pending';
      },
    ],
    [
      'missing candidate commit',
      (record) => {
        record.candidate.gitCommit = null;
      },
    ],
    [
      'missing build evidence',
      (record) => {
        record.candidate.buildEvidence = null;
      },
    ],
    [
      'missing staging evidence',
      (record) => {
        record.candidate.stagingEvidence = null;
      },
    ],
    [
      'missing commerce-facts review',
      (record) => {
        record.shopify.commerceFactsFingerprint = null;
        record.shopify.commerceFactsFingerprintStatus = 'missing';
      },
    ],
    [
      'missing observation review evidence',
      (record) => {
        record.shopify.observationReviewEvidence = null;
      },
    ],
    [
      'missing rollback plan',
      (record) => {
        record.rollback.planEvidence = null;
      },
    ],
    [
      'restore strategy without previous release',
      (record) => {
        record.rollback.strategy = 'restore-previous-release';
        record.rollback.previousReleaseId = null;
      },
    ],
  ])('rejects an Approved record with %s', (_label, mutate) => {
    const record = createCompleteReleaseRecord('approved');
    mutate(record);
    expect(validateProductRelease(record)).toBe(false);
  });

  it('rejects a Released record without ACTIVE and verified rollback observations', () => {
    const record = createCompleteReleaseRecord('released');
    record.shopify.statusObserved = 'DRAFT';
    record.rollback.verificationEvidence = null;
    expect(validateProductRelease(record)).toBe(false);
  });

  it('validates a denied transition decision for the incomplete Hoodie Draft', () => {
    const decision = evaluateProductReleaseTransition({
      record: hoodieRelease,
      manifest: hoodieMediaManifest,
      targetState: 'staged',
    });
    expect(validateReleaseTransitionDecision(decision)).toBe(true);
    expect(decision).toEqual(hoodieStagingReadiness);
    expect(decision.allowed).toBe(false);
    expect(decision.candidate).toBeNull();
    expect(
      decision.blockers.every((item) => item.humanAction && item.resumePoint)
    ).toBe(true);
  });

  it('validates an allowed Staged → Approved decision only when its candidate satisfies the release schema', () => {
    const decision = evaluateProductReleaseTransition({
      record: createCompleteReleaseRecord('staged'),
      manifest: createCompleteMediaManifest(),
      targetState: 'approved',
    });
    expect(decision.allowed).toBe(true);
    expect(validateProductRelease(decision.candidate)).toBe(true);
    expect(validateMediaManifest(createCompleteMediaManifest())).toBe(true);
    expect(validateReleaseTransitionDecision(decision)).toBe(true);
  });

  it('validates a blocked four-lane Hoodie simulation without granting restricted approvals', () => {
    expect(validatePipelineRun(hoodiePipelineRun)).toBe(true);
    expect(hoodiePipelineRun.state).toBe('blocked');
    expect(
      new Set(hoodiePipelineRun.workItems.map((item) => item.lane)).size
    ).toBe(4);
    expect(
      Object.values(hoodiePipelineRun.approvals).every(
        (approval) => approval.status === 'pending'
      )
    ).toBe(true);
  });

  it('validates both local creation-mode simulations as draft-only and non-authoritative', () => {
    expect(validateProductBrief(designerProductBrief)).toBe(true);
    expect(validateProductBrief(trendProductBrief)).toBe(true);
    expect(validateProductCreationJob(designerCreationJob)).toBe(true);
    expect(validateProductCreationJob(trendCreationJob)).toBe(true);
    expect(designerCreationJob.brief).toEqual(designerProductBrief);
    expect(trendCreationJob.brief).toEqual(trendProductBrief);
    expect(designerCreationJob.contractBindings).toMatchObject({
      productReleaseRecord:
        trendCreationJob.contractBindings.productReleaseRecord,
      mediaRegistry: trendCreationJob.contractBindings.mediaRegistry,
      commerceGateway: trendCreationJob.contractBindings.commerceGateway,
      pipelineRunContract:
        trendCreationJob.contractBindings.pipelineRunContract,
    });
    expect(designerCreationJob.contractBindings.pipelineRunId).not.toBe(
      trendCreationJob.contractBindings.pipelineRunId
    );
    expect(
      Object.values(designerCreationJob.brief.truthPolicy).every(
        (value) => value === false
      )
    ).toBe(true);
    expect(
      Object.values(trendCreationJob.approvals).every(
        (approval) => approval.status === 'pending'
      )
    ).toBe(true);
    expect(designerCreationJob.trigger.type).toBe('on-demand');
    expect(trendCreationJob.trigger.type).toBe('scheduled');
    expect(trendCreationJob.brief.inputEvidence[0].freshness.status).toBe(
      'stale'
    );
    expect(designerCreationJob.brief.referenceUsePolicy.mayCopy).toBe(false);
    expect(
      trendCreationJob.brief.researchPolicy.mayTriggerExternalResearch
    ).toBe(false);
    expect(designerCreationJob.idempotency.duplicatePolicy).toBe('suppress');
    expect(validatePipelineRun(designerCreationRun)).toBe(true);
    expect(validatePipelineRun(trendCreationRun)).toBe(true);
    expect(designerCreationRun.state).toBe('in_progress_with_blockers');
    expect(trendCreationRun.state).toBe('in_progress_with_blockers');
  });

  it.each(['preview', 'production'])(
    'rejects fixture creation evidence in %s',
    (environment) => {
      expect(
        validateProductCreationJob({
          ...structuredClone(trendCreationJob),
          environment,
          simulation: false,
        })
      ).toBe(false);
    }
  );

  it('rejects trend evidence that claims candidate-input authority', () => {
    const invalid = structuredClone(trendCreationJob);
    invalid.brief.inputEvidence[0].sourceType = 'research';
    invalid.brief.inputEvidence[0].authority = 'candidate-input';
    invalid.brief.inputEvidence[0].confidence = 'medium';
    expect(validateProductCreationJob(invalid)).toBe(false);
  });

  it('validates the evidence-labeled capability registry with the proven cart surface', () => {
    expect(validateCapabilityRegistry(capabilityRegistry)).toBe(true);
    const cartCapability = capabilityRegistry.capabilities.find(
      (item) => item.capability === 'shopify-storefront-cart'
    );
    expect(cartCapability).toMatchObject({
      accessState: 'write_test_verified',
      callableSurface: 'shopify_storefront',
      allowedOperations: ['cart-write'],
      evidenceRef:
        'test_reports/cp-hoodie-production-activation-2026-08-04/report.md',
      blocker: null,
    });
  });
});

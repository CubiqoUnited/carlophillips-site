import { readFileSync, readdirSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, expectTypeOf, it } from 'vitest';
import deliverySchema from '../contracts/podpipe-delivery.schema.json';
import mediaAssetSchema from '../contracts/media-asset.schema.json';
import mediaManifestSchema from '../contracts/media-manifest.schema.json';
import productReleaseSchema from '../contracts/product-release.schema.json';
import hoodieDelivery from '../releases/cp-signature-hoodie-2026-001/podpipe-delivery.json';
import hoodieMediaManifest from '../releases/cp-signature-hoodie-2026-001/media-manifest.json';
import hoodieRelease from '../releases/cp-signature-hoodie-2026-001/release.json';
import {
  ADMIN_CONTROL_PLANE_SECTIONS,
  PODPIPE_DELIVERY_APPROVALS,
  PODPIPE_DELIVERY_STEP_DEFINITIONS,
  PODPIPE_SECTION_IDS,
  PRODUCT_MEDIA_MODALITIES,
  PRODUCT_RELEASE_STATES,
  deriveAdminControlPlaneView,
  evaluatePodpipeDelivery,
  mapEligibleMediaItem,
  projectPodpipeSequence,
  type AdminControlPlaneInput,
  type AdminControlPlaneView,
  type PodpipeDeliveryInput,
  type ProductMediaManifest,
  type ProductReleaseRecord,
  type ReleaseBoundMediaItem,
} from '@repo/product-pipeline';
import { evaluatePodpipeDelivery as evaluateCompatibilityDelivery } from '../apps/web/src/lib/orchestration/podpipe-delivery';
import { projectPodpipeSequence as projectCompatibilitySequence } from '../apps/web/src/lib/media/sequences/podpipe';

const canonicalInput: AdminControlPlaneInput = {
  release: hoodieRelease as unknown as ProductReleaseRecord,
  mediaManifest: hoodieMediaManifest as unknown as ProductMediaManifest,
  delivery: hoodieDelivery as unknown as PodpipeDeliveryInput,
};
const validateMediaAsset = new Ajv2020({
  allErrors: true,
  strict: false,
}).compile(mediaAssetSchema);

const fingerprint = (value: string) => `sha256:${value.repeat(64)}`;

function completeControlPlaneInput(): AdminControlPlaneInput {
  const input = structuredClone(canonicalInput);
  input.release.state = 'released';
  input.release.shopify = {
    ...input.release.shopify,
    statusObserved: 'ACTIVE',
    observedAt: '2026-08-14T20:00:00.000Z',
    variantFingerprintStatus: 'observed',
    variantFingerprint: fingerprint('a'),
    commerceFactsFingerprintStatus: 'reviewed',
    commerceFactsFingerprint: fingerprint('b'),
    observationFingerprintStatus: 'reviewed',
    observationFingerprint: fingerprint('c'),
    observationReviewEvidence: 'evidence/shopify-review.json',
  };
  input.release.fulfillmentMappings = [
    {
      adapter: 'reviewed-pod-adapter',
      providerProductId: 'server-confined-provider-reference',
      variantFingerprintStatus: 'observed',
      variantFingerprint: fingerprint('a'),
    },
  ];
  input.release.physicalSample = {
    status: 'approved',
    evidence: 'evidence/sample-review.json',
    fit: 'approved',
    colour: 'approved',
    artworkPlacement: 'approved',
    finish: 'approved',
  };
  input.release.candidate = {
    gitCommit: '0123456789abcdef0123456789abcdef01234567',
    buildEvidence: 'evidence/build.json',
    stagingEvidence: 'evidence/staging.json',
  };
  input.release.rollback = {
    planEvidence: 'evidence/rollback-plan.md',
    verificationEvidence: 'evidence/rollback-verification.json',
  };
  input.release.approvals = {
    product: { status: 'approved', owner: 'Product Owner' },
    media: { status: 'approved', owner: 'Product Owner' },
    fulfillment: { status: 'approved', owner: 'Product Owner' },
  };

  const requiredRequirements = input.mediaManifest.requirements.filter(
    (requirement) => requirement.requirement === 'required'
  );
  input.mediaManifest.requirements = input.mediaManifest.requirements.map(
    (requirement) =>
      requirement.requirement === 'where-feasible'
        ? {
            ...requirement,
            status: 'infeasible-approved',
            assetIds: [],
            infeasibilityBlocker: {
              reason: 'Verified source model is not available.',
              approvalStatus: 'approved',
              owner: 'Product Owner',
            },
          }
        : {
            ...requirement,
            status: 'approved',
            assetIds: [`approved-${requirement.modality}`],
            infeasibilityBlocker: null,
          }
  );
  input.mediaManifest.assets = requiredRequirements.map((requirement) => ({
    schemaVersion: 'cp.product-media-asset.v1',
    assetId: `approved-${requirement.modality}`,
    kind: requirement.modality === 'video' ? 'video' : 'image',
    source: {
      type: 'photography',
      reference: `evidence/${requirement.modality}-source.json`,
    },
    approvalStatus: 'approved',
    exactProductMatch: 'verified',
    rightsStatus: 'verified',
    quality: {
      status: 'verified',
      evidence: `evidence/${requirement.modality}-quality.json`,
    },
    storefrontBinding: {
      adapter: 'shopify-storefront-media',
      referenceHash: fingerprint('d'),
      evidence: `evidence/${requirement.modality}-binding.json`,
    },
    alt: `Approved ${requirement.modality} view`,
  }));

  input.delivery.releaseState = 'released';
  input.delivery.steps = Object.fromEntries(
    PODPIPE_DELIVERY_STEP_DEFINITIONS.map((step) => [
      step.id,
      {
        status: 'approved',
        evidence: [`evidence/${step.id}.json`],
      },
    ])
  );
  input.delivery.approvals = Object.fromEntries(
    PODPIPE_DELIVERY_APPROVALS.map((approval) => [
      approval,
      { status: 'approved', owner: 'Product Owner' },
    ])
  );
  return input;
}

describe('@repo/product-pipeline', () => {
  it('stays a pure domain package without app or runtime adapter imports', () => {
    const source = readdirSync('packages/product-pipeline/src')
      .filter((file) => file.endsWith('.ts'))
      .map((file) =>
        readFileSync(`packages/product-pipeline/src/${file}`, 'utf8')
      )
      .join('\n');
    expect(source).not.toMatch(
      /from ['"](?:react|next|server-only|node:fs|node:path|@repo\/shopify|@\/|apps\/)/
    );
    expect(source).not.toMatch(/\b(?:process\.env|fetch|XMLHttpRequest)\b/);
  });

  it('keeps schema enums and required PODPIPE keys aligned with exported types', () => {
    expect(productReleaseSchema.properties.state.enum).toEqual(
      PRODUCT_RELEASE_STATES
    );
    expect(
      mediaManifestSchema.properties.requirements.items.properties.modality.enum
    ).toEqual(PRODUCT_MEDIA_MODALITIES);
    expect(deliverySchema.properties.steps.required).toEqual(
      PODPIPE_DELIVERY_STEP_DEFINITIONS.map((step) => step.id)
    );
    expect(deliverySchema.properties.approvals.required).toEqual(
      PODPIPE_DELIVERY_APPROVALS
    );
    expectTypeOf(canonicalInput.release).toMatchTypeOf<ProductReleaseRecord>();
    expectTypeOf(
      canonicalInput.mediaManifest
    ).toMatchTypeOf<ProductMediaManifest>();
  });

  it('preserves workflow and display behavior through compatibility exports', () => {
    const directDelivery = evaluatePodpipeDelivery(canonicalInput.delivery);
    expect(evaluateCompatibilityDelivery(canonicalInput.delivery)).toEqual(
      directDelivery
    );

    const directSequence = projectPodpipeSequence({});
    expect(projectCompatibilitySequence({})).toEqual(directSequence);
    expect(directSequence.map((section) => section.id)).toEqual(
      PODPIPE_SECTION_IDS
    );
  });

  it('derives a sanitized fail-closed view from the current canonical evidence', () => {
    const view = deriveAdminControlPlaneView(canonicalInput);
    expectTypeOf(view).toMatchTypeOf<AdminControlPlaneView>();
    expect(view).toMatchObject({
      schemaVersion: 'cp.admin-control-plane-view.v1',
      meta: { authoritative: false, mode: 'read_only_projection' },
      release: {
        id: 'cp-signature-hoodie-2026-001',
        state: 'draft',
      },
      metrics: {
        deliverySteps: 17,
        mediaRequirements: 9,
        approvedMedia: 0,
        boundMedia: 0,
      },
      authority: {
        externalExecutionAuthorized: false,
        shopifyMutationAuthorized: false,
        publicationAuthorized: false,
        productionAuthorized: false,
      },
    });
    expect(view.workflow.ready).toBe(false);
    expect(view.workflow.steps).toHaveLength(17);
    expect(view.operations).toMatchObject({
      authoritative: false,
      recordCount: 0,
      payment: {
        status: 'blocked',
        authoritative: false,
        recordCount: 0,
        records: [],
      },
      order: {
        status: 'empty',
        authoritative: false,
        recordCount: 0,
        records: [],
      },
      fulfillment: {
        status: 'unavailable',
        authoritative: false,
        recordCount: 0,
        records: [],
      },
      shipmentTracking: {
        status: 'unavailable',
        authoritative: false,
        recordCount: 0,
        records: [],
      },
      support: {
        status: 'unavailable',
        authoritative: false,
        recordCount: 0,
        records: [],
      },
      return: {
        status: 'unavailable',
        authoritative: false,
        recordCount: 0,
        records: [],
      },
      refund: {
        status: 'blocked',
        authoritative: false,
        recordCount: 0,
        records: [],
      },
      reviewEligibility: {
        status: 'blocked',
        authoritative: false,
        recordCount: 0,
        records: [],
      },
    });
    expect(view.release.blockers).toContain('CANONICAL_RELEASE_NOT_RELEASED');
    expect(view.workflow.steps[0]).toMatchObject({
      id: 'product-brief',
      position: 1,
      status: 'ready',
      evidenceStatus: 'candidate',
    });
    const serialized = JSON.stringify(view);
    expect(serialized).not.toContain('9432704909549');
    expect(serialized).not.toContain('5958463');
    expect(serialized).not.toContain('productReference');
    expect(serialized).not.toContain('providerProductId');
  });

  it('maps unique visible admin sections to canonical workflow and operations owners', () => {
    const ids = ADMIN_CONTROL_PLANE_SECTIONS.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(
      expect.arrayContaining([
        'briefs',
        'runs',
        'products',
        'media',
        'releases',
        'evidence',
        'approvals',
        'publication',
        'orders',
        'post-sale',
        'commands',
        'theme',
      ])
    );
    expect(
      ADMIN_CONTROL_PLANE_SECTIONS.filter((section) =>
        section.aggregates.includes('operations' as never)
      ).map((section) => section.id)
    ).toEqual(['orders', 'post-sale']);
    expect(
      ADMIN_CONTROL_PLANE_SECTIONS.find((section) => section.id === 'theme')
    ).toMatchObject({ pipelineOwned: false, aggregates: ['design-system'] });
  });

  it('whitelists customer media and rejects unknown modalities', () => {
    const rawCandidate = {
      id: 'approved-front',
      registryAssetId: 'registry-front',
      approvalStatus: 'approved',
      sourceAuthority: 'product-release-media-registry',
      type: 'image',
      url: '/media/products/front.png',
      previewUrl: '/media/products/front.png',
      alt: 'Approved front view',
      label: 'Front view',
      modalities: ['front'],
      providerProductId: 'secret-provider',
      productReference: 'gid://shopify/Product/123',
    };
    const mapped = mapEligibleMediaItem(
      rawCandidate as unknown as Partial<ReleaseBoundMediaItem>
    );
    expect(mapped).not.toBeNull();
    expect(JSON.stringify(mapped)).not.toContain('secret-provider');
    expect(JSON.stringify(mapped)).not.toContain('gid://shopify');
    expect(Object.keys(mapped || {}).sort()).toEqual(
      [
        'approvalStatus',
        'alt',
        'id',
        'label',
        'modalities',
        'previewUrl',
        'registryAssetId',
        'sourceAuthority',
        'type',
        'url',
      ].sort()
    );
    expect(
      mapEligibleMediaItem({
        ...rawCandidate,
        modalities: ['front', 'provider-private-angle'],
      } as unknown as Partial<ReleaseBoundMediaItem>)
    ).toBeNull();
  });

  it('requires a Released record, ACTIVE Shopify truth, provider binding, and complete media before readiness', () => {
    const complete = completeControlPlaneInput();
    for (const asset of complete.mediaManifest.assets) {
      expect(
        validateMediaAsset(asset),
        JSON.stringify(validateMediaAsset.errors)
      ).toBe(true);
    }
    expect(deriveAdminControlPlaneView(complete).workflow.ready).toBe(true);

    for (const state of ['draft', 'staged', 'approved', 'withdrawn'] as const) {
      const unreleased = structuredClone(complete);
      unreleased.release.state = state;
      unreleased.delivery.releaseState = state;
      const view = deriveAdminControlPlaneView(unreleased);
      expect(view.workflow.ready).toBe(false);
      expect(view.release.blockers).toContain('CANONICAL_RELEASE_NOT_RELEASED');
    }

    const inactive = structuredClone(complete);
    inactive.release.shopify.statusObserved = 'DRAFT';
    expect(deriveAdminControlPlaneView(inactive).workflow.ready).toBe(false);
    expect(
      deriveAdminControlPlaneView(inactive).release.bindings.find(
        (binding) => binding.id === 'shopify-observation'
      )?.status
    ).toBe('missing');

    const incompleteMedia = structuredClone(complete);
    incompleteMedia.mediaManifest.requirements[0].status = 'missing';
    expect(deriveAdminControlPlaneView(incompleteMedia).workflow.ready).toBe(
      false
    );

    const missingProvider = structuredClone(complete);
    missingProvider.release.fulfillmentMappings = [];
    expect(deriveAdminControlPlaneView(missingProvider).workflow.ready).toBe(
      false
    );
  });

  it('withholds Shopify facts unless reviewed commerce matches the release binding', () => {
    const releaseBinding = {
      releaseId: 'cp-signature-hoodie-2026-001',
      handle: 'carlophillips-signature-hoodie',
      variantFingerprint: fingerprint('a'),
      commerceFactsFingerprint: fingerprint('b'),
      observationFingerprint: fingerprint('c'),
    };
    const commerce = {
      approvalStatus: 'reviewed' as const,
      sourceAuthority: 'reviewed-shopify-observation' as const,
      binding: releaseBinding,
      data: {
        title: 'Signature Hoodie',
        price: 128,
        currency: 'USD',
        availableForSale: false,
        sizes: ['S', 'M'],
        sizeGuide: null,
        bagAllowed: false,
        checkoutAllowed: false,
      },
    };
    const missingBinding = projectPodpipeSequence({ commerce });
    expect(
      missingBinding.find((section) => section.id === 'shopify-facts')
    ).toMatchObject({
      status: 'withheld',
      data: null,
      blockers: ['REVIEWED_SHOPIFY_FACTS_REQUIRED'],
    });

    const mismatched = projectPodpipeSequence({
      releaseBinding: {
        ...releaseBinding,
        commerceFactsFingerprint: fingerprint('f'),
      },
      commerce,
    });
    expect(
      mismatched.find((section) => section.id === 'shopify-facts')?.status
    ).toBe('withheld');

    const reviewed = projectPodpipeSequence({ releaseBinding, commerce });
    expect(
      reviewed.find((section) => section.id === 'shopify-facts')
    ).toMatchObject({
      status: 'available',
      data: { title: 'Signature Hoodie' },
    });
  });

  it('fails closed when release, media, or delivery bindings diverge', () => {
    const mismatched = deriveAdminControlPlaneView({
      ...canonicalInput,
      mediaManifest: {
        ...canonicalInput.mediaManifest,
        releaseId: 'cp-other-001',
      },
      delivery: { ...canonicalInput.delivery, releaseState: 'staged' },
    });
    expect(mismatched.workflow.ready).toBe(false);
    expect(mismatched.release.bindings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'podpipe-release', status: 'mismatch' }),
        expect.objectContaining({ id: 'media-release', status: 'mismatch' }),
      ])
    );
    expect(mismatched.authority).toEqual({
      externalExecutionAuthorized: false,
      shopifyMutationAuthorized: false,
      publicationAuthorized: false,
      productionAuthorized: false,
    });
  });
});

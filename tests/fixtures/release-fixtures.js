import { createProductObservation } from '../../lib/commerce/product-observation.js';
import { fingerprintStorefrontMedia } from '../../lib/commerce/media-visibility-policy.js';
import {
  fingerprintReleaseApprovalTarget,
  fingerprintReleaseArtifact,
} from '../../lib/releases/product-release-transition.js';

const observedAt = '2026-07-22T00:00:00Z';
const candidateCommit = 'abcdef1';

function evidenceBinding(
  reference,
  fingerprintCharacter,
  recordedAt = '2026-07-22T00:01:00Z'
) {
  return {
    reference,
    fingerprint: `sha256:${fingerprintCharacter.repeat(64)}`,
    releaseId: 'cp-test-release-2026-001',
    candidateCommit,
    recordedAt,
  };
}

function approvalEvidence(
  scope,
  fingerprintCharacter,
  approvedTargetFingerprint
) {
  return {
    reference: `approval/${scope}.json`,
    fingerprint: `sha256:${fingerprintCharacter.repeat(64)}`,
    releaseId: 'cp-test-release-2026-001',
    candidateCommit,
    approvedTargetFingerprint,
    approvedAt: '2026-07-22T00:05:00Z',
  };
}

const imageModalities = [
  'front',
  'back-angle',
  'embroidery-detail',
  'material-detail',
  'on-model',
  'lifestyle',
];

function approvedAsset({ assetId, kind, fallbackAssetId = null }) {
  const storefrontMedia = observedStorefrontMedia(assetId, kind);
  return {
    schemaVersion: 'cp.product-media-asset.v1',
    assetId,
    kind,
    source: { type: 'photography', reference: `evidence/${assetId}.json` },
    storefrontBinding: {
      adapter: 'shopify-storefront-media',
      referenceHash: fingerprintStorefrontMedia(storefrontMedia),
      evidence: `evidence/${assetId}-storefront-binding.json`,
    },
    exactProductMatch: 'verified',
    rightsStatus: 'verified',
    approvalStatus: 'approved',
    quality: {
      status: 'verified',
      evidence: `evidence/${assetId}-quality.json`,
    },
    alt: `Exact product ${assetId}`,
    fallbackAssetId,
  };
}

function observedStorefrontMedia(assetId, type) {
  return {
    id: `shopify-media:${assetId}`,
    type,
    url: `https://cdn.example/${assetId}`,
    previewUrl: `https://cdn.example/${assetId}-preview`,
    alt: `Observed ${assetId}`,
  };
}

function observedProductInput(handle) {
  return {
    handle,
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
        id: 'sanitized-test-variant',
        title: 'Default Title',
        selectedOptions: [{ name: 'Title', value: 'Default Title' }],
        availableForSale: true,
        price: { amount: '128.00', currencyCode: 'USD' },
      },
    ],
  };
}

function createObservedEnvelope(handle, environment) {
  return createProductObservation({
    source: 'shopify',
    environment,
    observedAt,
    product: observedProductInput(handle),
    capabilityEvidence: 'evidence/shopify-storefront-read.json',
  });
}

export function createCompleteReleaseRecord(
  state = 'draft',
  {
    handle = 'test-product',
    environment = state === 'released' ? 'production' : 'preview',
  } = {}
) {
  const observation = createObservedEnvelope(handle, environment);
  const mappingFingerprint = `sha256:${'d'.repeat(64)}`;
  const record = {
    schemaVersion: 'cp.product-release.v1',
    releaseId: 'cp-test-release-2026-001',
    state,
    shopify: {
      productReference: 'sanitized-product',
      handle,
      statusObserved: state === 'released' ? 'ACTIVE' : 'DRAFT',
      observedAt,
      variantFingerprint: observation.variantFingerprint,
      variantFingerprintStatus: 'observed',
      commerceFactsFingerprint: observation.commerceFactsFingerprint,
      commerceFactsFingerprintStatus: 'reviewed',
      observationFingerprint: observation.observationFingerprint,
      observationFingerprintStatus: 'reviewed',
      observationReviewEvidence: 'evidence/product-observation-review.json',
      observationReviewBinding: evidenceBinding(
        'evidence/product-observation-review.json',
        'c'
      ),
      productionObservation: null,
    },
    fulfillmentMappings: [
      {
        adapter: 'test-provider',
        providerProductId: 'sanitized-provider-product',
        variantFingerprint: observation.variantFingerprint,
        variantFingerprintStatus: 'observed',
        mappingFingerprint,
        mappingFingerprintStatus: 'reviewed',
      },
    ],
    physicalSample: {
      status: 'approved',
      providerMappingFingerprint: mappingFingerprint,
      sampleFingerprint: `sha256:${'e'.repeat(64)}`,
      evidence: evidenceBinding(
        'evidence/physical-sample.json',
        'f',
        '2026-07-22T00:03:00Z'
      ),
      approvalEvidence: evidenceBinding(
        'approval/physical-sample.json',
        '1',
        '2026-07-22T00:04:00Z'
      ),
      inspection: {
        fit: 'verified',
        colour: 'verified',
        artworkPlacement: 'verified',
        finish: 'verified',
      },
    },
    mediaManifest: 'fixtures/complete-media-manifest.json',
    mediaManifestFingerprint: fingerprintReleaseArtifact(
      createCompleteMediaManifest()
    ),
    approvals: {
      product: { status: 'approved', owner: 'Product Owner', evidence: null },
      media: {
        status: 'approved',
        owner: 'Product Owner/designee',
        evidence: null,
      },
      fulfillment: {
        status: 'approved',
        owner: 'Product Owner/designee',
        evidence: null,
      },
    },
    candidate: {
      gitCommit: candidateCommit,
      buildEvidence: evidenceBinding(
        'test_reports/candidate/verification.json',
        '3'
      ),
      stagingEvidence: evidenceBinding(
        'test_reports/candidate/staging.json',
        '4'
      ),
      releaseEvidenceFingerprint: null,
    },
    rollback: {
      strategy: 'withdraw-release',
      planEvidence: evidenceBinding(
        'test_reports/candidate/rollback-plan.json',
        '5'
      ),
      verificationEvidence:
        state === 'released'
          ? evidenceBinding(
              'test_reports/candidate/rollback-verification.json',
              '6',
              '2026-07-22T00:09:00Z'
            )
          : null,
      previousReleaseId: null,
    },
  };
  record.candidate.releaseEvidenceFingerprint =
    fingerprintReleaseApprovalTarget(record);
  record.approvals.product.evidence = approvalEvidence(
    'product',
    '7',
    record.candidate.releaseEvidenceFingerprint
  );
  record.approvals.media.evidence = approvalEvidence(
    'media',
    '8',
    record.candidate.releaseEvidenceFingerprint
  );
  record.approvals.fulfillment.evidence = approvalEvidence(
    'fulfillment',
    '9',
    record.candidate.releaseEvidenceFingerprint
  );
  if (state === 'released') {
    record.shopify.productionObservation = {
      environment: 'production',
      statusObserved: 'ACTIVE',
      observedAt: '2026-07-22T00:10:00Z',
      variantFingerprint: observation.variantFingerprint,
      commerceFactsFingerprint: observation.commerceFactsFingerprint,
      currentObservationFingerprint: `sha256:${'a'.repeat(64)}`,
      reviewedObservationFingerprint: observation.observationFingerprint,
      capabilityEvidence: evidenceBinding(
        'evidence/production-storefront-read.json',
        'b',
        '2026-07-22T00:10:00Z'
      ),
    };
  }
  return record;
}

export function createObservedShopifyProduct(
  handle = 'test-product',
  environment = 'preview'
) {
  const observation = createObservedEnvelope(handle, environment);
  return {
    id: handle,
    handle,
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
    variantFingerprint: observation.variantFingerprint,
    observation,
    media: [
      'front',
      'back-angle',
      'embroidery-detail',
      'material-detail',
      'on-model',
      'lifestyle',
    ]
      .map((modality) => observedStorefrontMedia(`${modality}-image`, 'image'))
      .concat([
        observedStorefrontMedia('model-asset', 'model_3d'),
        observedStorefrontMedia('film-asset', 'video'),
      ]),
  };
}

export function createCompleteMediaManifest() {
  const imageRequirements = imageModalities.map((modality) => ({
    modality,
    requirement: 'required',
    status: 'approved',
    assetIds: [`${modality}-image`],
    infeasibilityBlocker: null,
  }));
  const imageAssets = imageModalities.map((modality) =>
    approvedAsset({
      assetId: `${modality}-image`,
      kind: 'image',
    })
  );

  return {
    schemaVersion: 'cp.product-media-manifest.v1',
    releaseId: 'cp-test-release-2026-001',
    requirements: [
      ...imageRequirements,
      {
        modality: 'spin-360',
        requirement: 'where-feasible',
        status: 'infeasible-approved',
        assetIds: [],
        infeasibilityBlocker: {
          reason:
            'No truthful spin renderer is active in the current storefront fixture.',
          approvalStatus: 'approved',
          owner: 'Product Owner',
        },
      },
      {
        modality: 'model-3d-ar',
        requirement: 'where-feasible',
        status: 'approved',
        assetIds: ['model-asset'],
        infeasibilityBlocker: null,
      },
      {
        modality: 'video',
        requirement: 'required',
        status: 'approved',
        assetIds: ['film-asset'],
        infeasibilityBlocker: null,
      },
    ],
    assets: [
      ...imageAssets,
      approvedAsset({
        assetId: 'model-asset',
        kind: 'model_3d',
        fallbackAssetId: 'front-image',
      }),
      approvedAsset({
        assetId: 'film-asset',
        kind: 'video',
        fallbackAssetId: 'front-image',
      }),
    ],
  };
}

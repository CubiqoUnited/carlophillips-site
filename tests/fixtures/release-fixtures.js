const fingerprint = `sha256:${'a'.repeat(64)}`;

const imageModalities = [
  'front',
  'back-angle',
  'embroidery-detail',
  'material-detail',
  'on-model',
  'lifestyle',
];

function approvedAsset({ assetId, kind, fallbackAssetId = null }) {
  return {
    schemaVersion: 'cp.product-media-asset.v1',
    assetId,
    kind,
    source: { type: 'photography', reference: `evidence/${assetId}.json` },
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

export function createCompleteReleaseRecord(state = 'draft') {
  return {
    schemaVersion: 'cp.product-release.v1',
    releaseId: 'cp-test-release-2026-001',
    state,
    shopify: {
      productReference: 'sanitized-product',
      handle: 'test-product',
      statusObserved: state === 'released' ? 'ACTIVE' : 'DRAFT',
      observedAt: '2026-07-22T00:00:00Z',
      variantFingerprint: fingerprint,
      variantFingerprintStatus: 'observed',
    },
    fulfillmentMappings: [{
      adapter: 'test-provider',
      providerProductId: 'sanitized-provider-product',
      variantFingerprint: fingerprint,
      variantFingerprintStatus: 'observed',
    }],
    mediaManifest: 'fixtures/complete-media-manifest.json',
    approvals: {
      product: { status: 'approved', owner: 'Product Owner' },
      media: { status: 'approved', owner: 'Product Owner/designee' },
      fulfillment: { status: 'approved', owner: 'Product Owner/designee' },
    },
    candidate: {
      gitCommit: 'abcdef1',
      buildEvidence: 'test_reports/candidate/verification.json',
      stagingEvidence: 'test_reports/candidate/staging.json',
    },
    rollback: {
      strategy: 'withdraw-release',
      planEvidence: 'test_reports/candidate/rollback-plan.json',
      verificationEvidence: state === 'released'
        ? 'test_reports/candidate/rollback-verification.json'
        : null,
      previousReleaseId: null,
    },
  };
}

export function createCompleteMediaManifest() {
  const imageRequirements = imageModalities.map(modality => ({
    modality,
    requirement: 'required',
    status: 'approved',
    assetIds: [`${modality}-image`],
    infeasibilityBlocker: null,
  }));
  const imageAssets = imageModalities.map(modality => approvedAsset({
    assetId: `${modality}-image`,
    kind: 'image',
  }));

  return {
    schemaVersion: 'cp.product-media-manifest.v1',
    releaseId: 'cp-test-release-2026-001',
    requirements: [
      ...imageRequirements,
      {
        modality: 'spin-360',
        requirement: 'where-feasible',
        status: 'approved',
        assetIds: ['spin-asset'],
        infeasibilityBlocker: null,
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
        assetId: 'spin-asset',
        kind: 'spin',
        fallbackAssetId: 'front-image',
      }),
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

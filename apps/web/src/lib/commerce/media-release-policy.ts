import type { ProductMediaModality } from '../media/types';
import type { MediaAsset, MediaManifest } from './runtime-types';

const EXPECTED_MODALITIES: ProductMediaModality[] = [
  'front',
  'back-angle',
  'embroidery-detail',
  'material-detail',
  'on-model',
  'lifestyle',
  'spin-360',
  'model-3d-ar',
  'video',
];

const EXPECTED_ASSET_KINDS: Record<ProductMediaModality, string[]> = {
  front: ['image'],
  'back-angle': ['image'],
  'embroidery-detail': ['image'],
  'material-detail': ['image'],
  'on-model': ['image'],
  lifestyle: ['image'],
  'spin-360': ['spin'],
  'model-3d-ar': ['model_3d'],
  video: ['video', 'external_video'],
};

const EXPECTED_REQUIREMENT_POLICY: Record<ProductMediaModality, string> = {
  front: 'required',
  'back-angle': 'required',
  'embroidery-detail': 'required',
  'material-detail': 'required',
  'on-model': 'required',
  lifestyle: 'required',
  'spin-360': 'required',
  'model-3d-ar': 'where-feasible',
  video: 'required',
};

export function evaluateMediaRelease(manifest: MediaManifest) {
  const requirements = Array.isArray(manifest.requirements)
    ? manifest.requirements
    : [];
  const modalityCounts = requirements.reduce<Map<string, number>>(
    (counts, requirement) => {
      counts.set(
        requirement.modality,
        (counts.get(requirement.modality) || 0) + 1
      );
      return counts;
    },
    new Map()
  );

  const unresolved = requirements
    .filter((requirement) => {
      if (requirement.status === 'approved') return false;
      return !(
        requirement.requirement === 'where-feasible' &&
        requirement.status === 'infeasible-approved' &&
        requirement.infeasibilityBlocker?.approvalStatus === 'approved'
      );
    })
    .map((requirement) => ({
      modality: requirement.modality,
      status: requirement.status,
    }));

  for (const modality of EXPECTED_MODALITIES) {
    const count = modalityCounts.get(modality) || 0;
    if (count === 0) unresolved.push({ modality, status: 'missing-entry' });
    if (count > 1) unresolved.push({ modality, status: 'duplicate-entry' });
  }
  for (const requirement of requirements) {
    if (
      EXPECTED_REQUIREMENT_POLICY[
        requirement.modality as ProductMediaModality
      ] !== requirement.requirement
    ) {
      unresolved.push({
        modality: requirement.modality,
        status: 'requirement-policy-mismatch',
      });
    }
  }

  const assetsById = new Map<string, MediaAsset>();
  const duplicateAssetIds = new Set<string>();
  const storefrontBindingCounts = new Map<string, number>();
  for (const asset of manifest.assets || []) {
    if (assetsById.has(asset.assetId)) duplicateAssetIds.add(asset.assetId);
    assetsById.set(asset.assetId, asset);
    const referenceHash = asset.storefrontBinding?.referenceHash;
    if (referenceHash) {
      storefrontBindingCounts.set(
        referenceHash,
        (storefrontBindingCounts.get(referenceHash) || 0) + 1
      );
    }
  }

  const assetBlockers: Array<{ assetId: string; code: string }> = [];
  const addAssetBlocker = (assetId: string, code: string) => {
    if (
      !assetBlockers.some(
        (blocker) => blocker.assetId === assetId && blocker.code === code
      )
    ) {
      assetBlockers.push({ assetId, code });
    }
  };

  for (const assetId of duplicateAssetIds) {
    addAssetBlocker(assetId, 'DUPLICATE_ASSET_ID');
  }

  for (const requirement of requirements) {
    if (requirement.status !== 'approved') continue;
    if (requirement.assetIds.length === 0) {
      addAssetBlocker(
        requirement.modality,
        'APPROVED_REQUIREMENT_HAS_NO_ASSET'
      );
    }

    for (const assetId of requirement.assetIds) {
      const asset = assetsById.get(assetId);
      if (!asset) {
        addAssetBlocker(assetId, 'REFERENCED_ASSET_MISSING');
        continue;
      }
      if (asset.exactProductMatch !== 'verified') {
        addAssetBlocker(assetId, 'EXACT_PRODUCT_MATCH_UNVERIFIED');
      }
      if (asset.rightsStatus !== 'verified') {
        addAssetBlocker(assetId, 'ASSET_RIGHTS_UNVERIFIED');
      }
      if (asset.approvalStatus !== 'approved') {
        addAssetBlocker(assetId, 'ASSET_NOT_APPROVED');
      }
      if (asset.quality?.status !== 'verified' || !asset.quality?.evidence) {
        addAssetBlocker(assetId, 'ASSET_QUALITY_UNVERIFIED');
      }
      if (asset.source?.type === 'unknown') {
        addAssetBlocker(assetId, 'ASSET_SOURCE_UNKNOWN');
      }
      if (
        asset.storefrontBinding?.adapter !== 'shopify-storefront-media' ||
        !/^sha256:[a-f0-9]{64}$/.test(
          asset.storefrontBinding?.referenceHash || ''
        ) ||
        !asset.storefrontBinding?.evidence
      ) {
        addAssetBlocker(assetId, 'STOREFRONT_BINDING_MISSING');
      } else if (
        (storefrontBindingCounts.get(
          asset.storefrontBinding?.referenceHash || ''
        ) ?? 0) > 1
      ) {
        addAssetBlocker(assetId, 'DUPLICATE_STOREFRONT_BINDING');
      }
      if (
        !EXPECTED_ASSET_KINDS[
          requirement.modality as ProductMediaModality
        ]?.includes(asset.kind)
      ) {
        addAssetBlocker(assetId, 'ASSET_KIND_DOES_NOT_MATCH_MODALITY');
      }
      if (
        asset.kind === 'spin' &&
        (asset.spinEvidence?.sourceType !== 'physical-multi-angle' ||
          !Number.isInteger(asset.spinEvidence?.frameCount) ||
          (asset.spinEvidence?.frameCount ?? 0) < 24 ||
          !asset.spinEvidence?.rotationTestEvidence)
      ) {
        addAssetBlocker(assetId, 'REAL_SPIN_EVIDENCE_MISSING');
      }
      if (
        asset.kind === 'model_3d' &&
        (!asset.modelEvidence?.formats?.includes('glb') ||
          !asset.modelEvidence?.loadTestEvidence ||
          (asset.modelEvidence?.arClaimed &&
            (!asset.modelEvidence.formats.includes('usdz') ||
              !asset.modelEvidence.arTestEvidence)))
      ) {
        addAssetBlocker(assetId, 'VERIFIED_3D_EVIDENCE_MISSING');
      }

      if (
        ['video', 'external_video', 'model_3d', 'spin'].includes(asset.kind)
      ) {
        if (!asset.fallbackAssetId) {
          addAssetBlocker(assetId, 'ACCESSIBLE_FALLBACK_MISSING');
          continue;
        }
        const fallback = assetsById.get(asset.fallbackAssetId);
        if (
          !fallback ||
          fallback.kind !== 'image' ||
          fallback.exactProductMatch !== 'verified' ||
          fallback.rightsStatus !== 'verified' ||
          fallback.approvalStatus !== 'approved' ||
          fallback.quality?.status !== 'verified' ||
          !fallback.quality?.evidence ||
          fallback.storefrontBinding?.adapter !== 'shopify-storefront-media' ||
          !/^sha256:[a-f0-9]{64}$/.test(
            fallback.storefrontBinding?.referenceHash || ''
          ) ||
          !fallback.storefrontBinding?.evidence
        ) {
          addAssetBlocker(assetId, 'ACCESSIBLE_FALLBACK_NOT_RELEASE_READY');
        }
      }
    }
  }

  return {
    ready: unresolved.length === 0 && assetBlockers.length === 0,
    unresolved,
    assetBlockers,
  };
}

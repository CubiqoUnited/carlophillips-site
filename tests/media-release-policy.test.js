import { describe, expect, it } from 'vitest';
import hoodieManifest from '../releases/cp-signature-hoodie-2026-001/media-manifest.json';
import { evaluateMediaRelease } from '../apps/web/src/lib/commerce/media-release-policy';
import { createCompleteMediaManifest } from './fixtures/release-fixtures';

describe('media release policy', () => {
  it('keeps the current Hoodie blocked on missing and unapproved required media', () => {
    const decision = evaluateMediaRelease(hoodieManifest);
    expect(decision.ready).toBe(false);
    expect(decision.unresolved.map((item) => item.modality)).toContain('video');
    expect(decision.unresolved.map((item) => item.modality)).toContain(
      'embroidery-detail'
    );
    expect(decision.assetBlockers).toEqual([]);
  });

  it('accepts an approved infeasibility only for a where-feasible modality', () => {
    const manifest = createCompleteMediaManifest();
    manifest.requirements = manifest.requirements.map((requirement) =>
      requirement.modality === 'model-3d-ar'
        ? {
            modality: 'model-3d-ar',
            requirement: 'where-feasible',
            status: 'infeasible-approved',
            assetIds: [],
            infeasibilityBlocker: {
              reason:
                'Exact-product 3D capture was assessed and is not feasible for this candidate.',
              approvalStatus: 'approved',
              owner: 'Product Owner',
            },
          }
        : requirement
    );
    manifest.assets = manifest.assets.filter(
      (asset) => asset.assetId !== 'model-asset'
    );
    expect(evaluateMediaRelease(manifest)).toEqual({
      ready: true,
      unresolved: [],
      assetBlockers: [],
    });
  });

  it('does not allow the required real 360 sequence to use an infeasibility waiver', () => {
    const manifest = createCompleteMediaManifest();
    manifest.requirements = manifest.requirements.map((requirement) =>
      requirement.modality === 'spin-360'
        ? {
            modality: 'spin-360',
            requirement: 'where-feasible',
            status: 'infeasible-approved',
            assetIds: [],
            infeasibilityBlocker: {
              reason: 'Exact-product angle set is not yet available.',
              approvalStatus: 'approved',
              owner: 'Product Owner',
            },
          }
        : requirement
    );
    expect(evaluateMediaRelease(manifest).unresolved).toContainEqual({
      modality: 'spin-360',
      status: 'requirement-policy-mismatch',
    });
  });

  it.each([
    ['exactProductMatch', 'unverified', 'EXACT_PRODUCT_MATCH_UNVERIFIED'],
    ['rightsStatus', 'pending', 'ASSET_RIGHTS_UNVERIFIED'],
    ['approvalStatus', 'quarantined', 'ASSET_NOT_APPROVED'],
  ])(
    'rejects an approved requirement whose asset has unsafe %s',
    (field, value, code) => {
      const manifest = createCompleteMediaManifest();
      const asset = manifest.assets.find(
        (item) => item.assetId === 'front-image'
      );
      asset[field] = value;
      const decision = evaluateMediaRelease(manifest);
      expect(decision.ready).toBe(false);
      expect(decision.assetBlockers).toContainEqual({
        assetId: 'front-image',
        code,
      });
    }
  );

  it('requires verified asset quality evidence', () => {
    const manifest = createCompleteMediaManifest();
    const asset = manifest.assets.find(
      (item) => item.assetId === 'material-detail-image'
    );
    asset.quality = { status: 'pending', evidence: null };
    expect(evaluateMediaRelease(manifest).assetBlockers).toContainEqual({
      assetId: 'material-detail-image',
      code: 'ASSET_QUALITY_UNVERIFIED',
    });
  });

  it('requires unique evidence-backed Shopify storefront bindings for approved assets', () => {
    const missing = createCompleteMediaManifest();
    missing.assets.find(
      (item) => item.assetId === 'front-image'
    ).storefrontBinding = null;
    expect(evaluateMediaRelease(missing).assetBlockers).toContainEqual({
      assetId: 'front-image',
      code: 'STOREFRONT_BINDING_MISSING',
    });

    const duplicate = createCompleteMediaManifest();
    const front = duplicate.assets.find(
      (item) => item.assetId === 'front-image'
    );
    const back = duplicate.assets.find(
      (item) => item.assetId === 'back-angle-image'
    );
    back.storefrontBinding = structuredClone(front.storefrontBinding);
    const blockers = evaluateMediaRelease(duplicate).assetBlockers;
    expect(blockers).toContainEqual({
      assetId: 'front-image',
      code: 'DUPLICATE_STOREFRONT_BINDING',
    });
    expect(blockers).toContainEqual({
      assetId: 'back-angle-image',
      code: 'DUPLICATE_STOREFRONT_BINDING',
    });
  });

  it('requires release-ready accessible fallback media for motion and 3D assets', () => {
    const manifest = createCompleteMediaManifest();
    const film = manifest.assets.find(
      (asset) => asset.assetId === 'film-asset'
    );
    film.fallbackAssetId = null;
    expect(evaluateMediaRelease(manifest).assetBlockers).toContainEqual({
      assetId: 'film-asset',
      code: 'ACCESSIBLE_FALLBACK_MISSING',
    });
  });

  it('requires a physical multi-angle spin and verified 3D load/AR evidence', () => {
    const spinManifest = createCompleteMediaManifest();
    delete spinManifest.assets.find((asset) => asset.assetId === 'spin-asset')
      .spinEvidence;
    expect(evaluateMediaRelease(spinManifest).assetBlockers).toContainEqual({
      assetId: 'spin-asset',
      code: 'REAL_SPIN_EVIDENCE_MISSING',
    });

    const modelManifest = createCompleteMediaManifest();
    const model = modelManifest.assets.find(
      (asset) => asset.assetId === 'model-asset'
    );
    model.modelEvidence.formats = ['glb'];
    model.modelEvidence.arClaimed = true;
    model.modelEvidence.arTestEvidence = null;
    expect(evaluateMediaRelease(modelManifest).assetBlockers).toContainEqual({
      assetId: 'model-asset',
      code: 'VERIFIED_3D_EVIDENCE_MISSING',
    });
  });

  it('rejects a missing or duplicate modality in the required matrix', () => {
    const missing = createCompleteMediaManifest();
    missing.requirements = missing.requirements.filter(
      (item) => item.modality !== 'lifestyle'
    );
    expect(evaluateMediaRelease(missing).unresolved).toContainEqual({
      modality: 'lifestyle',
      status: 'missing-entry',
    });

    const duplicate = createCompleteMediaManifest();
    duplicate.requirements.push(structuredClone(duplicate.requirements[0]));
    expect(evaluateMediaRelease(duplicate).unresolved).toContainEqual({
      modality: 'front',
      status: 'duplicate-entry',
    });
  });

  it('does not allow required video to be downgraded to an infeasibility exception', () => {
    const manifest = createCompleteMediaManifest();
    const video = manifest.requirements.find(
      (item) => item.modality === 'video'
    );
    Object.assign(video, {
      requirement: 'where-feasible',
      status: 'infeasible-approved',
      assetIds: [],
      infeasibilityBlocker: {
        reason:
          'A required product film cannot be waived through a where-feasible policy.',
        approvalStatus: 'approved',
        owner: 'Product Owner',
      },
    });
    expect(evaluateMediaRelease(manifest).unresolved).toContainEqual({
      modality: 'video',
      status: 'requirement-policy-mismatch',
    });
  });
});

import { describe, expect, it } from 'vitest';
import hoodieManifest from '../releases/cp-signature-hoodie-2026-001/media-manifest.json';
import { evaluateMediaRelease } from '../lib/commerce/media-release-policy';

describe('media release policy', () => {
  it('keeps the current Hoodie blocked on missing and unapproved required media', () => {
    const decision = evaluateMediaRelease(hoodieManifest);
    expect(decision.ready).toBe(false);
    expect(decision.unresolved.map(item => item.modality)).toContain('video');
    expect(decision.unresolved.map(item => item.modality)).toContain('embroidery-detail');
  });

  it('accepts an approved infeasibility only for a where-feasible modality', () => {
    const manifest = {
      requirements: [{
        modality: 'model-3d-ar',
        requirement: 'where-feasible',
        status: 'infeasible-approved',
        assetIds: [],
        infeasibilityBlocker: {
          reason: 'Exact-product 3D capture was assessed and is not feasible for this candidate.',
          approvalStatus: 'approved',
          owner: 'Product Owner',
        },
      }],
    };
    expect(evaluateMediaRelease(manifest)).toEqual({ ready: true, unresolved: [] });
  });

  it('does not accept a pending infeasibility decision', () => {
    const manifest = {
      requirements: [{
        modality: 'spin-360',
        requirement: 'where-feasible',
        status: 'infeasible-pending',
        assetIds: [],
        infeasibilityBlocker: {
          reason: 'Exact-product angle set is not yet available.',
          approvalStatus: 'pending',
          owner: 'Product Owner',
        },
      }],
    };
    expect(evaluateMediaRelease(manifest).ready).toBe(false);
  });
});

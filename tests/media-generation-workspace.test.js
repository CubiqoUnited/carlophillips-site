import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';
import release from '../releases/cp-signature-hoodie-2026-001/release.json';
import mediaManifest from '../releases/cp-signature-hoodie-2026-001/media-manifest.json';
import workspace from '../releases/cp-signature-hoodie-2026-001/media-generation-workspace.json';
import workspaceSchema from '../contracts/media-generation-workspace.schema.json';
import {
  deriveMediaGenerationWorkspace,
  evaluateMediaGenerationAction,
  isMediaGenerationEnabled,
  mediaTruthClassifications,
} from '../lib/media/media-generation-workspace';

const ajv = new Ajv2020({ allErrors: true });
const validateWorkspace = ajv.compile(workspaceSchema);

describe('feature-flagged Media Generation workspace', () => {
  it('validates the canonical draft workspace and every truth classification', () => {
    expect(
      validateWorkspace(workspace),
      ajv.errorsText(validateWorkspace.errors)
    ).toBe(true);
    expect(mediaTruthClassifications).toEqual([
      'factual-pod',
      'ai-assisted-product-visual',
      'ai-editorial',
      'ai-assisted-360',
      'approximate-3d',
      'physically-verified',
    ]);
  });

  it('defaults off, enables only by exact server flag, and hard-denies Production', () => {
    expect(isMediaGenerationEnabled({})).toBe(false);
    expect(
      isMediaGenerationEnabled({ CP_ADMIN_MEDIA_GENERATION_ENABLED: 'TRUE' })
    ).toBe(false);
    expect(
      isMediaGenerationEnabled({
        CP_ADMIN_MEDIA_GENERATION_ENABLED: 'true',
        VERCEL_ENV: 'preview',
      })
    ).toBe(true);
    expect(
      isMediaGenerationEnabled({
        CP_ADMIN_MEDIA_GENERATION_ENABLED: 'true',
        VERCEL_ENV: 'production',
      })
    ).toBe(false);
    expect(
      isMediaGenerationEnabled({
        CP_ADMIN_MEDIA_GENERATION_ENABLED: 'true',
        NEXT_PUBLIC_COMMERCE_ENVIRONMENT: 'production',
      })
    ).toBe(false);
  });

  it('references the exact release envelope without mutating the release or Media Registry', () => {
    const beforeRelease = structuredClone(release);
    const beforeManifest = structuredClone(mediaManifest);
    const model = deriveMediaGenerationWorkspace({
      workspace,
      release,
      mediaManifest,
      featureEnabled: true,
      role: 'product_owner',
    });

    expect(model).toMatchObject({
      authoritative: false,
      draftOnly: false,
      existingFunnelChanged: false,
      canonicalReleaseState: 'staged',
      metrics: {
        candidates: 2,
        approved: 2,
        storefrontBound: 0,
        stagingPreviewBound: 2,
      },
      bindings: {
        mediaManifest: true,
        shopifyObservation: true,
        providerMapping: true,
      },
    });
    expect(release).toEqual(beforeRelease);
    expect(mediaManifest).toEqual(beforeManifest);
    expect(JSON.stringify(model)).not.toContain(
      release.shopify.productReference
    );
    expect(JSON.stringify(model)).not.toContain(
      release.fulfillmentMappings[0].providerProductId
    );
    expect(JSON.stringify(model)).not.toContain('test_reports/');
    expect(JSON.stringify(model)).not.toContain('sha256:');
  });

  it('fails closed when any canonical binding is stale', () => {
    const stale = structuredClone(workspace);
    stale.bindings.mediaManifestFingerprint = `sha256:${'a'.repeat(64)}`;
    expect(() =>
      deriveMediaGenerationWorkspace({
        workspace: stale,
        release,
        mediaManifest,
        featureEnabled: true,
        role: 'product_owner',
      })
    ).toThrow('MEDIA_GENERATION_BINDING_STALE');
  });

  it('does not duplicate the mutable aggregate release-evidence binding', () => {
    const updatedRelease = structuredClone(release);
    updatedRelease.candidate.releaseEvidenceFingerprint = `sha256:${'b'.repeat(64)}`;

    expect(() =>
      deriveMediaGenerationWorkspace({
        workspace,
        release: updatedRelease,
        mediaManifest,
        featureEnabled: true,
        role: 'product_owner',
      })
    ).not.toThrow();
    expect(workspace.bindings).not.toHaveProperty('releaseEvidenceFingerprint');
  });

  it('allows only read-only comparison and denies every mutation without durable authority', () => {
    const compare = evaluateMediaGenerationAction({
      action: 'compare',
      featureEnabled: true,
      role: 'product_owner',
      workspace,
    });
    expect(compare).toEqual({
      id: 'compare',
      allowed: true,
      reason: 'READ_ONLY_COMPARISON_AVAILABLE',
    });

    for (const action of [
      'generate',
      'regenerate',
      'quarantine',
      'approve',
      'assign',
    ]) {
      expect(
        evaluateMediaGenerationAction({
          action,
          featureEnabled: true,
          role: 'product_owner',
          workspace,
        }).allowed,
        action
      ).toBe(false);
    }
  });

  it('denies disabled, reviewer, malformed and cost-gated operations', () => {
    expect(
      evaluateMediaGenerationAction({
        action: 'compare',
        featureEnabled: false,
        role: 'product_owner',
        workspace,
      }).reason
    ).toBe('MEDIA_GENERATION_FEATURE_DISABLED');
    expect(
      evaluateMediaGenerationAction({
        action: 'compare',
        featureEnabled: true,
        role: 'reviewer',
        workspace,
      }).reason
    ).toBe('PRODUCT_OWNER_REQUIRED');
    expect(
      evaluateMediaGenerationAction({
        action: 'delete',
        featureEnabled: true,
        role: 'product_owner',
        workspace,
      }).reason
    ).toBe('MEDIA_GENERATION_ACTION_UNKNOWN');

    const ready = structuredClone(workspace);
    ready.constraintProfile.status = 'ready';
    ready.providers = ready.providers.map((provider) => ({
      ...provider,
      access: 'ready',
    }));
    expect(
      evaluateMediaGenerationAction({
        action: 'generate',
        featureEnabled: true,
        role: 'product_owner',
        workspace: ready,
      }).reason
    ).toBe('EXACT_COST_APPROVAL_REQUIRED');
  });

  it('binds the two approved videos to Staging only and keeps their truth classification', () => {
    expect(workspace.candidates).toHaveLength(2);
    expect(workspace.candidates.map((candidate) => candidate.label)).toEqual([
      'Runway motion',
      'Fit & silhouette',
    ]);
    for (const candidate of workspace.candidates) {
      expect(candidate.kind).toBe('video');
      expect(candidate.truthClassification).toBe('ai-editorial');
      expect(candidate.storageState).toBe('approved-preview');
      expect(candidate.approvalStatus).toBe('approved');
      expect(candidate.qaStatus).toBe('passed');
      expect(candidate.stagingPreviewBound).toBe(true);
      expect(candidate.storefrontBound).toBe(false);
    }
    expect(workspace.candidates[0].notes.join(' ')).toContain(
      'Closed-eye opening removed'
    );
    expect(workspace.candidates[1].notes.join(' ')).toContain(
      'not physical fit evidence'
    );
  });
});

import { describe, expect, it } from 'vitest';
import hoodieManifest from '../releases/cp-signature-hoodie-2026-001/media-manifest.json';
import hoodieRelease from '../releases/cp-signature-hoodie-2026-001/release.json';
import {
  evaluateProductReleaseTransition,
  fingerprintReleaseApprovalTarget,
  fingerprintReleaseArtifact,
} from '../lib/releases/product-release-transition';
import {
  createCompleteMediaManifest,
  createCompleteReleaseRecord,
} from './fixtures/release-fixtures';

function blockerCodes(decision) {
  return decision.blockers.map(blocker => blocker.code);
}

describe('Product Release Record transitions', () => {
  it('keeps the current Hoodie Staged and reports exact approval resume gates', () => {
    const original = structuredClone(hoodieRelease);
    const decision = evaluateProductReleaseTransition({
      record: hoodieRelease,
      manifest: hoodieManifest,
      targetState: 'approved',
    });

    expect(decision.allowed).toBe(false);
    expect(decision.candidate).toBeNull();
    expect(blockerCodes(decision)).toEqual(expect.arrayContaining([
      'PHYSICAL_SAMPLE_APPROVAL_REQUIRED',
      'PRODUCT_APPROVAL_REQUIRED',
      'MEDIA_APPROVAL_REQUIRED',
      'FULFILLMENT_APPROVAL_REQUIRED',
    ]));
    expect(blockerCodes(decision)).not.toEqual(expect.arrayContaining([
      'FULFILLMENT_VARIANT_FINGERPRINT_MISSING',
      'CANDIDATE_COMMIT_MISSING',
      'MEDIA_MANIFEST_FINGERPRINT_MISSING',
      'BUILD_EVIDENCE_MISSING',
      'STAGING_EVIDENCE_MISSING',
      'ROLLBACK_PLAN_BINDING_INVALID',
    ]));
    expect(hoodieRelease).toEqual(original);
  });

  it('does not permit state skipping even when all evidence is complete', () => {
    const decision = evaluateProductReleaseTransition({
      record: createCompleteReleaseRecord('draft'),
      manifest: createCompleteMediaManifest(),
      targetState: 'approved',
    });
    expect(decision.allowed).toBe(false);
    expect(blockerCodes(decision)).toContain('INVALID_RELEASE_TRANSITION');
  });

  it('fails closed when approval is evaluated without its release-bound media manifest', () => {
    const decision = evaluateProductReleaseTransition({
      record: createCompleteReleaseRecord('staged'),
      manifest: null,
      targetState: 'approved',
    });
    expect(decision.allowed).toBe(false);
    expect(blockerCodes(decision)).toContain('MEDIA_MANIFEST_MISSING');
  });

  it('requires an exact previous release for a restore-previous rollback strategy', () => {
    const record = createCompleteReleaseRecord('draft');
    record.rollback.strategy = 'restore-previous-release';
    record.rollback.previousReleaseId = null;
    const decision = evaluateProductReleaseTransition({
      record,
      manifest: createCompleteMediaManifest(),
      targetState: 'staged',
    });
    expect(decision.allowed).toBe(false);
    expect(blockerCodes(decision)).toContain('ROLLBACK_PREVIOUS_RELEASE_MISSING');
  });

  it('allows a complete immutable candidate to enter private staging without claiming media approval', () => {
    const record = createCompleteReleaseRecord('draft');
    record.approvals.media.status = 'pending';
    record.approvals.media.evidence = null;
    const manifest = createCompleteMediaManifest();
    manifest.requirements[0].status = 'candidate';
    record.mediaManifestFingerprint = fingerprintReleaseArtifact(manifest);
    record.candidate.releaseEvidenceFingerprint = fingerprintReleaseApprovalTarget(record);

    const decision = evaluateProductReleaseTransition({
      record,
      manifest,
      targetState: 'staged',
    });
    expect(decision.allowed, JSON.stringify(decision.blockers)).toBe(true);
    expect(decision.blockers).toEqual([]);
    expect(decision.candidate).toMatchObject({ state: 'staged' });
    expect(record.state).toBe('draft');
  });

  it('denies approval until all approvals and the release-bound media matrix are complete', () => {
    const record = createCompleteReleaseRecord('staged');
    record.approvals.product.status = 'pending';
    record.approvals.media.status = 'pending';
    record.approvals.fulfillment.status = 'pending';

    const decision = evaluateProductReleaseTransition({
      record,
      manifest: hoodieManifest,
      targetState: 'approved',
    });
    expect(decision.allowed).toBe(false);
    expect(blockerCodes(decision)).toEqual(expect.arrayContaining([
      'PRODUCT_APPROVAL_REQUIRED',
      'MEDIA_APPROVAL_REQUIRED',
      'FULFILLMENT_APPROVAL_REQUIRED',
      'MEDIA_MANIFEST_RELEASE_MISMATCH',
    ]));
  });

  it('allows Staged → Approved only with complete truth and evidence', () => {
    const decision = evaluateProductReleaseTransition({
      record: createCompleteReleaseRecord('staged'),
      manifest: createCompleteMediaManifest(),
      targetState: 'approved',
    });
    expect(decision).toMatchObject({
      allowed: true,
      fromState: 'staged',
      targetState: 'approved',
      blockers: [],
      candidate: { state: 'approved' },
    });
  });

  it('denies approval without an exact inspected and approved physical sample', () => {
    const record = createCompleteReleaseRecord('staged');
    record.physicalSample.status = 'not_ordered';
    record.physicalSample.providerMappingFingerprint = null;
    record.physicalSample.sampleFingerprint = null;
    record.physicalSample.evidence = null;
    record.physicalSample.approvalEvidence = null;
    for (const check of Object.keys(record.physicalSample.inspection)) {
      record.physicalSample.inspection[check] = 'pending';
    }

    const decision = evaluateProductReleaseTransition({
      record,
      manifest: createCompleteMediaManifest(),
      targetState: 'approved',
    });
    expect(decision.allowed).toBe(false);
    expect(blockerCodes(decision)).toContain('PHYSICAL_SAMPLE_APPROVAL_REQUIRED');
  });

  it('denies tampered and cross-release candidate evidence bindings', () => {
    const tampered = createCompleteReleaseRecord('draft');
    tampered.candidate.buildEvidence.fingerprint = `sha256:${'0'.repeat(64)}`;
    expect(blockerCodes(evaluateProductReleaseTransition({
      record: tampered,
      manifest: createCompleteMediaManifest(),
      targetState: 'staged',
    }))).toContain('RELEASE_EVIDENCE_FINGERPRINT_MISMATCH');

    const crossRelease = createCompleteReleaseRecord('draft');
    crossRelease.candidate.stagingEvidence.releaseId = 'cp-other-release-2026-001';
    expect(blockerCodes(evaluateProductReleaseTransition({
      record: crossRelease,
      manifest: createCompleteMediaManifest(),
      targetState: 'staged',
    }))).toContain('STAGING_EVIDENCE_BINDING_INVALID');

    const record = createCompleteReleaseRecord('draft');
    const changedManifest = createCompleteMediaManifest();
    changedManifest.assets[0].alt = 'Tampered after release binding';
    expect(blockerCodes(evaluateProductReleaseTransition({
      record,
      manifest: changedManifest,
      targetState: 'staged',
    }))).toContain('MEDIA_MANIFEST_FINGERPRINT_MISMATCH');
  });

  it('fingerprints equivalent evidence objects independently of key insertion order', () => {
    const manifest = createCompleteMediaManifest();
    const reordered = Object.fromEntries(Object.entries(manifest).reverse());
    reordered.assets = manifest.assets.map(asset => Object.fromEntries(Object.entries(asset).reverse()));
    expect(fingerprintReleaseArtifact(reordered)).toBe(fingerprintReleaseArtifact(manifest));
  });

  it('denies cross-candidate approval evidence even when its status says approved', () => {
    const record = createCompleteReleaseRecord('staged');
    record.approvals.product.evidence.candidateCommit = '1234567';
    const decision = evaluateProductReleaseTransition({
      record,
      manifest: createCompleteMediaManifest(),
      targetState: 'approved',
    });
    expect(decision.allowed).toBe(false);
    expect(blockerCodes(decision)).toContain('PRODUCT_APPROVAL_BINDING_INVALID');
  });

  it('denies release without an ACTIVE observation and verified rollback', () => {
    const decision = evaluateProductReleaseTransition({
      record: createCompleteReleaseRecord('approved'),
      manifest: createCompleteMediaManifest(),
      targetState: 'released',
    });
    expect(decision.allowed).toBe(false);
    expect(blockerCodes(decision)).toEqual(expect.arrayContaining([
      'SHOPIFY_ACTIVE_OBSERVATION_REQUIRED',
      'ROLLBACK_VERIFICATION_REQUIRED',
    ]));
  });

  it('allows Approved → Released only after active and rollback observations', () => {
    const record = createCompleteReleaseRecord('approved');
    const releasedEvidence = createCompleteReleaseRecord('released');
    record.shopify.statusObserved = releasedEvidence.shopify.statusObserved;
    record.shopify.productionObservation = releasedEvidence.shopify.productionObservation;
    record.shopify.productionObservation.variantFingerprint = record.shopify.variantFingerprint;
    record.shopify.productionObservation.commerceFactsFingerprint = record.shopify.commerceFactsFingerprint;
    record.shopify.productionObservation.reviewedObservationFingerprint = record.shopify.observationFingerprint;
    record.rollback.verificationEvidence = releasedEvidence.rollback.verificationEvidence;
    const decision = evaluateProductReleaseTransition({
      record,
      manifest: createCompleteMediaManifest(),
      targetState: 'released',
    });
    expect(decision.allowed, JSON.stringify(decision.blockers)).toBe(true);
    expect(decision.candidate).toMatchObject({
      state: 'released',
      shopify: { statusObserved: 'ACTIVE' },
    });
  });

  it('denies stale or changed Production observations', () => {
    const stale = createCompleteReleaseRecord('released');
    stale.state = 'approved';
    stale.shopify.productionObservation.observedAt = '2026-07-22T00:05:00Z';
    expect(blockerCodes(evaluateProductReleaseTransition({
      record: stale,
      manifest: createCompleteMediaManifest(),
      targetState: 'released',
    }))).toContain('PRODUCTION_OBSERVATION_STALE');

    const changed = createCompleteReleaseRecord('released');
    changed.state = 'approved';
    changed.shopify.productionObservation.commerceFactsFingerprint = `sha256:${'0'.repeat(64)}`;
    expect(blockerCodes(evaluateProductReleaseTransition({
      record: changed,
      manifest: createCompleteMediaManifest(),
      targetState: 'released',
    }))).toContain('PRODUCTION_OBSERVATION_BINDING_MISMATCH');
  });

  it('records withdrawal only after rollback or withdrawal evidence exists', () => {
    const missing = createCompleteReleaseRecord('released');
    missing.rollback.verificationEvidence = null;
    expect(blockerCodes(evaluateProductReleaseTransition({
      record: missing,
      manifest: createCompleteMediaManifest(),
      targetState: 'withdrawn',
    }))).toContain('WITHDRAWAL_EVIDENCE_REQUIRED');

    const verified = evaluateProductReleaseTransition({
      record: createCompleteReleaseRecord('released'),
      manifest: createCompleteMediaManifest(),
      targetState: 'withdrawn',
    });
    expect(verified.allowed).toBe(true);
    expect(verified.candidate.state).toBe('withdrawn');
  });
});

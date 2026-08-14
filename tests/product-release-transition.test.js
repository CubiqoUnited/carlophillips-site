import { describe, expect, it } from 'vitest';
import hoodieManifest from '../releases/cp-signature-hoodie-2026-001/media-manifest.json';
import hoodieRelease from '../releases/cp-signature-hoodie-2026-001/release.json';
import { evaluateProductReleaseTransition } from '../apps/web/src/lib/releases/product-release-transition';
import {
  createCompleteMediaManifest,
  createCompleteReleaseRecord,
} from './fixtures/release-fixtures';

function blockerCodes(decision) {
  return decision.blockers.map((blocker) => blocker.code);
}

describe('Product Release Record transitions', () => {
  it('keeps the current Hoodie Draft and reports exact staging resume gates', () => {
    const original = structuredClone(hoodieRelease);
    const decision = evaluateProductReleaseTransition({
      record: hoodieRelease,
      manifest: hoodieManifest,
      targetState: 'staged',
    });

    expect(decision.allowed).toBe(false);
    expect(decision.candidate).toBeNull();
    expect(blockerCodes(decision)).toEqual(
      expect.arrayContaining([
        'SHOPIFY_VARIANT_FINGERPRINT_MISSING',
        'FULFILLMENT_VARIANT_FINGERPRINT_MISSING',
        'CANDIDATE_COMMIT_MISSING',
        'BUILD_EVIDENCE_MISSING',
        'STAGING_EVIDENCE_MISSING',
      ])
    );
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
    expect(blockerCodes(decision)).toContain(
      'ROLLBACK_PREVIOUS_RELEASE_MISSING'
    );
  });

  it('allows a complete immutable candidate to enter private staging without claiming media approval', () => {
    const record = createCompleteReleaseRecord('draft');
    record.approvals.media.status = 'pending';
    const manifest = createCompleteMediaManifest();
    manifest.requirements[0].status = 'candidate';

    const decision = evaluateProductReleaseTransition({
      record,
      manifest,
      targetState: 'staged',
    });
    expect(decision.allowed).toBe(true);
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
    expect(blockerCodes(decision)).toEqual(
      expect.arrayContaining([
        'PRODUCT_APPROVAL_REQUIRED',
        'MEDIA_APPROVAL_REQUIRED',
        'FULFILLMENT_APPROVAL_REQUIRED',
        'MEDIA_MANIFEST_RELEASE_MISMATCH',
      ])
    );
  });

  it('keeps a product Staged until the exact physical sample and release QA are approved', () => {
    const record = createCompleteReleaseRecord('staged');
    record.physicalSample.status = 'pending';
    record.physicalSample.evidence = null;
    record.candidate.responsiveEvidence = null;
    record.candidate.performanceEvidence = null;
    record.candidate.tokenEvidence = null;

    const decision = evaluateProductReleaseTransition({
      record,
      manifest: createCompleteMediaManifest(),
      targetState: 'approved',
    });
    expect(blockerCodes(decision)).toEqual(
      expect.arrayContaining([
        'PHYSICAL_SAMPLE_APPROVAL_REQUIRED',
        'RESPONSIVE_QA_EVIDENCE_REQUIRED',
        'PERFORMANCE_EVIDENCE_REQUIRED',
        'DESIGN_TOKEN_EVIDENCE_REQUIRED',
      ])
    );
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

  it('denies release without an ACTIVE observation and verified rollback', () => {
    const decision = evaluateProductReleaseTransition({
      record: createCompleteReleaseRecord('approved'),
      manifest: createCompleteMediaManifest(),
      targetState: 'released',
    });
    expect(decision.allowed).toBe(false);
    expect(blockerCodes(decision)).toEqual(
      expect.arrayContaining([
        'SHOPIFY_ACTIVE_OBSERVATION_REQUIRED',
        'ROLLBACK_VERIFICATION_REQUIRED',
      ])
    );
  });

  it('allows Approved → Released only after active and rollback observations', () => {
    const record = createCompleteReleaseRecord('approved');
    record.shopify.statusObserved = 'ACTIVE';
    record.rollback.verificationEvidence =
      'test_reports/candidate/rollback-verification.json';
    const decision = evaluateProductReleaseTransition({
      record,
      manifest: createCompleteMediaManifest(),
      targetState: 'released',
    });
    expect(decision.allowed).toBe(true);
    expect(decision.candidate).toMatchObject({
      state: 'released',
      shopify: { statusObserved: 'ACTIVE' },
    });
  });

  it('records withdrawal only after rollback or withdrawal evidence exists', () => {
    const missing = createCompleteReleaseRecord('released');
    missing.rollback.verificationEvidence = null;
    expect(
      blockerCodes(
        evaluateProductReleaseTransition({
          record: missing,
          manifest: createCompleteMediaManifest(),
          targetState: 'withdrawn',
        })
      )
    ).toContain('WITHDRAWAL_EVIDENCE_REQUIRED');

    const verified = evaluateProductReleaseTransition({
      record: createCompleteReleaseRecord('released'),
      manifest: createCompleteMediaManifest(),
      targetState: 'withdrawn',
    });
    expect(verified.allowed).toBe(true);
    expect(verified.candidate.state).toBe('withdrawn');
  });
});

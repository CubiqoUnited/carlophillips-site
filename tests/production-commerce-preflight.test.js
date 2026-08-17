import { describe, expect, it } from 'vitest';
import cartAuthorization from '../config/shopify-cart-activation-authorization.json';
import checkoutAuthorization from '../config/shopify-checkout-authorization.json';
import mediaManifest from '../releases/cp-signature-hoodie-2026-001/media-manifest.json';
import releaseRecord from '../releases/cp-signature-hoodie-2026-001/release.json';
import { evaluateProductionCommercePreflight } from '../lib/releases/production-commerce-preflight.js';
import { fingerprintReleaseApprovalTarget } from '../lib/releases/product-release-transition.js';
import {
  createCompleteMediaManifest,
  createCompleteReleaseRecord,
} from './fixtures/release-fixtures.js';

const expectedSha = 'a'.repeat(40);

function registry(accessState = 'write_verified', allowedOperations = ['cart-write']) {
  return {
    evidenceBoundary: 'Evidence never grants authority by itself.',
    capabilities: [{
      capability: 'shopify-storefront-cart',
      selectedAdapter: 'shopify-storefront-cart',
      accessState,
      callableSurface: 'shopify_storefront',
      observedAt: '2026-08-17',
      evidenceRef: 'test_reports/release-bound-cart-proof/report.md',
      allowedOperations,
      requiresApproval: ['activation', 'production', 'order'],
      blocker: accessState === 'write_verified' ? null : {
        code: 'CART_WRITE_NOT_OPERATIONAL',
        resumePoint: 'Complete the exact release-bound cart proof.',
      },
    }],
  };
}

function completeEvidence() {
  const record = createCompleteReleaseRecord('released');
  record.candidate.gitCommit = expectedSha;
  for (const binding of [
    record.shopify.observationReviewBinding,
    record.physicalSample.evidence,
    record.physicalSample.approvalEvidence,
    record.candidate.buildEvidence,
    record.candidate.stagingEvidence,
    record.rollback.planEvidence,
    record.rollback.verificationEvidence,
    record.shopify.productionObservation.capabilityEvidence,
  ]) binding.candidateCommit = expectedSha;
  record.candidate.releaseEvidenceFingerprint = fingerprintReleaseApprovalTarget(record);
  for (const approval of Object.values(record.approvals)) {
    approval.evidence.candidateCommit = expectedSha;
    approval.evidence.approvedTargetFingerprint = record.candidate.releaseEvidenceFingerprint;
  }
  return record;
}

function authorizationsFor(record) {
  return {
    cart: {
      ...cartAuthorization,
      releaseId: record.releaseId,
      handle: record.shopify.handle,
    },
    checkout: {
      ...checkoutAuthorization,
      releaseId: record.releaseId,
      handle: record.shopify.handle,
    },
  };
}

describe('Production commerce preflight', () => {
  it('fails the real Draft release without weakening any blocker', () => {
    const decision = evaluateProductionCommercePreflight({
      releaseRecord,
      mediaManifest,
      expectedSha,
      capabilityRegistry: registry('write_test_verified', ['cart-write-test']),
      cartAuthorization,
      checkoutAuthorization,
    });
    expect(decision.ready).toBe(false);
    expect(decision.checkoutEnabled).toBe(false);
    expect(decision.safeFallbackCheckoutEnabled).toBe(false);
    expect(decision.blockers.map(item => item.code)).toEqual(expect.arrayContaining([
      'PRODUCT_RELEASE_NOT_RELEASED',
      'RELEASE_CANDIDATE_SHA_MISMATCH',
      'PHYSICAL_SAMPLE_APPROVAL_REQUIRED',
      'SHOPIFY_CART_CAPABILITY_NOT_READY',
    ]));
  });

  it('requires the exact immutable candidate SHA before release evaluation can pass', () => {
    const record = completeEvidence();
    record.candidate.gitCommit = 'b'.repeat(40);
    const decision = evaluateProductionCommercePreflight({
      releaseRecord: record,
      mediaManifest,
      expectedSha,
      capabilityRegistry: registry(),
      cartAuthorization,
      checkoutAuthorization,
    });
    expect(decision.ready).toBe(false);
    expect(decision.blockers.map(item => item.code)).toContain('RELEASE_CANDIDATE_SHA_MISMATCH');
  });

  it('allows only a complete Released record with operational cart evidence', () => {
    const record = completeEvidence();
    const authorizations = authorizationsFor(record);
    const decision = evaluateProductionCommercePreflight({
      releaseRecord: record,
      mediaManifest: createCompleteMediaManifest(),
      expectedSha,
      capabilityRegistry: registry(),
      cartAuthorization: authorizations.cart,
      checkoutAuthorization: authorizations.checkout,
    });
    expect(decision).toMatchObject({
      ready: true,
      checkoutEnabled: true,
      safeFallbackCheckoutEnabled: false,
      blockers: [],
    });
  });

  it('rejects broad or mismatched Product Owner authorization', () => {
    const record = completeEvidence();
    const authorizations = authorizationsFor(record);
    const decision = evaluateProductionCommercePreflight({
      releaseRecord: record,
      mediaManifest: createCompleteMediaManifest(),
      expectedSha,
      capabilityRegistry: registry(),
      cartAuthorization: { ...authorizations.cart, environments: ['preview'] },
      checkoutAuthorization: { ...authorizations.checkout, releaseId: 'cp-other' },
    });
    expect(decision.ready).toBe(false);
    expect(decision.blockers.map(item => item.code)).toEqual(expect.arrayContaining([
      'PRODUCT_OWNER_CART_AUTHORIZATION_INVALID',
      'PRODUCT_OWNER_CHECKOUT_AUTHORIZATION_INVALID',
    ]));
  });
});

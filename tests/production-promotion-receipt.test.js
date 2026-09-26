import { describe, expect, it } from 'vitest';
import {
  createProductionPromotionReceipt,
  verifyProductionPromotionReceipt,
} from '../lib/releases/production-promotion-receipt';

const secret = 'test-only-production-receipt-secret';
const sha = 'a'.repeat(40);
const hash = (character) => `sha256:${character.repeat(64)}`;

function health(checkedAt) {
  return {
    schemaVersion: 'cp.checkout-health-receipt.v1',
    checkedAt,
    healthy: true,
    checkoutEnabled: true,
    productStatus: 200,
    cartCreated: false,
    checkoutHandoffVerified: false,
    privateCheckoutUrlRetained: false,
    paymentAttempted: false,
    orderSubmitted: false,
  };
}

function evidence() {
  return {
    schemaVersion: 'cp.production-promotion-receipt.v2',
    generatedAt: '2026-09-25T20:44:41.000Z',
    release: 'cp-staging-20260925-a1b2c3d',
    gitCommitSha: sha,
    candidate: {
      deploymentId: 'dpl_Candidate123',
      deploymentUrl: 'https://candidate.vercel.app',
      readyState: 'READY',
      target: 'production',
      artifactKind: 'staged-production',
      checkoutEnabled: true,
    },
    production: {
      liveAliases: [
        { alias: 'carlophillips.com', deploymentId: 'dpl_Candidate123' },
        { alias: 'www.carlophillips.com', deploymentId: 'dpl_Candidate123' },
      ],
      beforeDeploymentId: 'dpl_Previous123',
      afterDeploymentId: 'dpl_Candidate123',
      readyState: 'READY',
      target: 'production',
      exactCandidatePromoted: true,
    },
    tests: {
      beforePromotion: health('2026-09-25T20:44:35.000Z'),
      afterPromotion: health('2026-09-25T20:44:40.000Z'),
    },
    shopify: {
      sourceEvidence: 'signed-protected-staging-receipt',
      stagingStoreReferenceHash: hash('1'),
      productionStoreReferenceHash: hash('2'),
      storesIsolated: true,
      unchangedDuringPromotion: true,
      workflowMutationPerformed: false,
    },
    rollback: {
      deploymentId: 'dpl_Previous123',
      readyState: 'READY',
      checkoutEnabled: true,
      restoreOnFailure: true,
      postRestoreHealthRequired: true,
    },
    safeguards: {
      piiFree: true,
      realPaymentUsed: false,
      paymentAttempted: false,
      orderSubmitted: false,
      privateCheckoutUrlRetained: false,
      productionStoreMutated: false,
    },
    protectedStaging: {
      schemaVersion: 'cp.protected-staging-release-receipt.v3',
      gitCommitSha: 'b'.repeat(40),
      release: 'cp-staging-20260925-a1b2c3d',
      sourcePullRequest: 166,
      receiptHash: hash('3'),
      signatureVerified: true,
    },
  };
}

function expected() {
  return {
    gitCommitSha: sha,
    release: evidence().release,
    candidateDeploymentId: 'dpl_Candidate123',
    productionDeploymentId: 'dpl_Candidate123',
    liveAliases: [
      { alias: 'carlophillips.com', deploymentId: 'dpl_Candidate123' },
      { alias: 'www.carlophillips.com', deploymentId: 'dpl_Candidate123' },
    ],
  };
}

function expectCode(action, code) {
  expect(action).toThrow(expect.objectContaining({ code }));
}

describe('Production promotion receipt', () => {
  it('signs and verifies exact identity, tests, rollback, Shopify, and safeguards', () => {
    const receipt = createProductionPromotionReceipt(evidence(), secret);
    expect(receipt.signature).toMatchObject({
      algorithm: 'hmac-sha256',
      value: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
    });
    expect(
      verifyProductionPromotionReceipt(receipt, expected(), secret)
    ).toEqual(receipt);
    expect(JSON.stringify(receipt)).not.toMatch(
      /customerEmail|customerName|shippingAddress|phoneNumber|gid:\/\/|checkouts\//i
    );
  });

  it.each([
    [
      'wrong live alias',
      (item) =>
        (item.production.liveAliases[0].alias = 'staging.carlophillips.com'),
      'PRODUCTION_IDENTITY_INVALID',
    ],
    [
      'different deployment',
      (item) => (item.production.afterDeploymentId = 'dpl_Other123'),
      'PRODUCTION_IDENTITY_INVALID',
    ],
    [
      'failed post-test',
      (item) => (item.tests.afterPromotion.healthy = false),
      'PRODUCTION_TEST_FAILED',
    ],
    [
      'Shopify mutation',
      (item) => (item.shopify.workflowMutationPerformed = true),
      'PRODUCTION_SHOPIFY_MUTATION_DETECTED',
    ],
    [
      'payment attempt',
      (item) => (item.safeguards.paymentAttempted = true),
      'PRODUCTION_SAFEGUARDS_INVALID',
    ],
    [
      'unsafe rollback',
      (item) => (item.rollback.readyState = 'ERROR'),
      'PRODUCTION_ROLLBACK_INVALID',
    ],
  ])('fails closed for %s', (_label, mutate, code) => {
    const item = evidence();
    mutate(item);
    expectCode(() => createProductionPromotionReceipt(item, secret), code);
  });

  it('rejects tampering and expectation drift', () => {
    const receipt = createProductionPromotionReceipt(evidence(), secret);
    const tampered = structuredClone(receipt);
    tampered.production.exactCandidatePromoted = false;
    expectCode(
      () => verifyProductionPromotionReceipt(tampered, expected(), secret),
      'PRODUCTION_IDENTITY_INVALID'
    );
    expectCode(
      () =>
        verifyProductionPromotionReceipt(
          receipt,
          { ...expected(), candidateDeploymentId: 'dpl_Other123' },
          secret
        ),
      'PRODUCTION_RECEIPT_EXPECTATION_MISMATCH'
    );
  });
});

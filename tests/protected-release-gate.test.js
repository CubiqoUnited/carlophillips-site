import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020';
import { describe, expect, it } from 'vitest';
import {
  createProtectedReleaseReceipt,
  verifyProtectedReleaseReceipt,
} from '../lib/releases/protected-release-gate';

const hash = (character) => `sha256:${character.repeat(64)}`;
const sha = 'a'.repeat(40);
const secret = 'test-only-release-receipt-secret-value';

function evidence() {
  return {
    schemaVersion: 'cp.protected-staging-release-receipt.v1',
    generatedAt: '2026-09-03T12:00:00.000Z',
    release: 'cp-release-2026-09-03',
    gitCommitSha: sha,
    sourcePullRequest: 68,
    staging: {
      deploymentId: 'dpl_Staging123',
      deploymentUrl: 'https://cp-release-abcdef.vercel.app',
      alias: 'staging.carlophillips.com',
      readyState: 'READY',
      checkoutEnabled: true,
      gitCommitSha: sha,
      release: 'cp-release-2026-09-03',
      immutable: true,
      productionBeforeDeploymentId: 'dpl_Production123',
      productionAfterDeploymentId: 'dpl_Production123',
    },
    shopify: {
      source: 'shopify',
      environment: 'preview',
      storeKind: 'development',
      storeReferenceHash: hash('1'),
      productionStoreReferenceHash: hash('2'),
      storeIsolated: true,
      paymentMode: 'test',
      durableStoreReferenceHash: hash('3'),
      productionDurableStoreReferenceHash: hash('4'),
      durableStoreIsolated: true,
      handle: 'carlophillips-signature-hoodie',
      variants: ['S', 'M', 'L'].map((size) => ({
        size,
        price: '128.00',
        currency: 'USD',
        availableBefore: true,
        availableAfter: true,
        inventoryBefore: 25,
        inventoryAfter: 25,
        inventoryRestored: true,
      })),
      cartBinding: {
        gitCommitSha: sha,
        release: 'cp-release-2026-09-03',
      },
      hostedCheckout: { https: true, trustedHost: true },
    },
    customerPath: {
      shopifyAuthoritativeProduct: true,
      sizeSelection: true,
      bagTruth: true,
      hostedStagingCheckout: true,
      testPayment: true,
      paidOrder: true,
      brandedConfirmation: true,
      confirmationEvidenceHash: hash('8'),
      orderStatus: true,
      orderStatusEvidenceHash: hash('9'),
    },
    lifecycle: {
      orderReferenceHash: hash('5'),
      signatureVerified: true,
      signatureAlgorithm: 'shopify-hmac-sha256',
      durableIdempotency: true,
      requiredTopics: [
        'orders/create',
        'orders/paid',
        'orders/cancelled',
        'refunds/create',
      ],
      observedTopics: [
        'orders/create',
        'orders/paid',
        'orders/cancelled',
        'orders/updated',
        'refunds/create',
      ],
      duplicateDelivery: {
        attempted: true,
        suppressed: true,
        observationCount: 1,
        externalActionCount: 0,
      },
      cancelled: true,
      refunded: true,
      inventoryRestored: true,
      finalFinancialStatus: 'REFUNDED',
      finalFulfillmentStatus: 'UNFULFILLED',
      fulfillmentRequestSubmitted: false,
      apliiqLocationAssigned: false,
      noApliiqProductionJob: true,
    },
    quality: {
      desktop: {
        width: 1440,
        screenshotHash: hash('6'),
        comparisonPassed: true,
      },
      mobile: { width: 390, screenshotHash: hash('7'), comparisonPassed: true },
      accessibilityPassed: true,
      consoleErrors: 0,
      networkFailures: 0,
    },
    production: {
      before: {
        deploymentId: 'dpl_Production123',
        healthy: true,
        checkoutEnabled: true,
      },
      after: {
        deploymentId: 'dpl_Production123',
        healthy: true,
        checkoutEnabled: true,
      },
      unchangedDuringStaging: true,
    },
    rollback: {
      lastVerifiedDeploymentId: 'dpl_Production123',
      checkoutEnabled: true,
      restoreOnFailure: true,
      postRestoreHealthRequired: true,
    },
    safeguards: {
      piiFree: true,
      realPaymentUsed: false,
      productionOrderCreated: false,
      privateCheckoutUrlRetained: false,
      productionStoreMutated: false,
    },
    approval: {
      stagingEnvironmentProtected: true,
      stagingProductOwnerReviewed: true,
      productionApproved: false,
    },
  };
}

function expectCode(action, code) {
  expect(action).toThrow(expect.objectContaining({ code }));
}

describe('protected Staging release gate', () => {
  it('matches the published JSON receipt schema', () => {
    const validate = new Ajv2020({
      strict: true,
      formats: { 'date-time': true, uri: true },
    }).compile(
      JSON.parse(
        readFileSync(
          'contracts/protected-staging-release-receipt.schema.json',
          'utf8'
        )
      )
    );
    const receipt = createProtectedReleaseReceipt(evidence(), secret);
    expect(validate(receipt), JSON.stringify(validate.errors)).toBe(true);
  });

  it('signs and verifies the complete exact-SHA PII-free evidence receipt', () => {
    const receipt = createProtectedReleaseReceipt(evidence(), secret);
    expect(receipt.signature).toMatchObject({
      algorithm: 'hmac-sha256',
      value: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
    });
    expect(
      verifyProtectedReleaseReceipt(
        receipt,
        {
          gitCommitSha: sha,
          release: evidence().release,
          sourcePullRequest: 68,
        },
        secret
      )
    ).toEqual(receipt);
    expect(JSON.stringify(receipt)).not.toMatch(
      /customerEmail|customerName|shippingAddress|phoneNumber|gid:\/\/|checkouts\//i
    );
  });

  it.each([
    [
      'wrong release SHA',
      (item) => {
        item.staging.gitCommitSha = 'b'.repeat(40);
      },
      'STAGING_EVIDENCE_INVALID',
    ],
    [
      'shared Shopify store',
      (item) => {
        item.shopify.productionStoreReferenceHash =
          item.shopify.storeReferenceHash;
      },
      'SHOPIFY_ISOLATION_INVALID',
    ],
    [
      'shared durable store',
      (item) => {
        item.shopify.productionDurableStoreReferenceHash =
          item.shopify.durableStoreReferenceHash;
      },
      'SHOPIFY_ISOLATION_INVALID',
    ],
    [
      'missing Medium',
      (item) => {
        item.shopify.variants[1].size = 'S';
      },
      'SHOPIFY_VARIANTS_INVALID',
    ],
    [
      'wrong price',
      (item) => {
        item.shopify.variants[1].price = '127.00';
      },
      'SHOPIFY_VARIANTS_INVALID',
    ],
    [
      'real payment',
      (item) => {
        item.safeguards.realPaymentUsed = true;
      },
      'SAFEGUARDS_INVALID',
    ],
    [
      'Apliiq job',
      (item) => {
        item.lifecycle.noApliiqProductionJob = false;
      },
      'APLIIQ_JOB_DETECTED',
    ],
    [
      'missing paid event',
      (item) => {
        item.lifecycle.observedTopics = item.lifecycle.observedTopics.filter(
          (topic) => topic !== 'orders/paid'
        );
      },
      'LIFECYCLE_TOPICS_INCOMPLETE',
    ],
    [
      'duplicate action',
      (item) => {
        item.lifecycle.duplicateDelivery.externalActionCount = 1;
      },
      'DUPLICATE_ACTION_DETECTED',
    ],
    [
      'inventory drift',
      (item) => {
        item.shopify.variants[0].inventoryAfter = 24;
      },
      'SHOPIFY_VARIANTS_INVALID',
    ],
    [
      'browser console error',
      (item) => {
        item.quality.consoleErrors = 1;
      },
      'BROWSER_HEALTH_FAILED',
    ],
    [
      'wrong mobile width',
      (item) => {
        item.quality.mobile.width = 412;
      },
      'SCREENSHOT_EVIDENCE_INVALID',
    ],
    [
      'production drift',
      (item) => {
        item.production.after.deploymentId = 'dpl_Other123';
      },
      'PRODUCTION_CHANGED_DURING_STAGING',
    ],
    [
      'production preapproval',
      (item) => {
        item.approval.productionApproved = true;
      },
      'PRODUCTION_APPROVAL_MUST_BE_SEPARATE',
    ],
  ])('fails closed for %s', (_label, mutate, code) => {
    const item = evidence();
    mutate(item);
    expectCode(() => createProtectedReleaseReceipt(item, secret), code);
  });

  it('rejects tampering, a wrong signing secret, and expectation drift', () => {
    const receipt = createProtectedReleaseReceipt(evidence(), secret);
    const tampered = structuredClone(receipt);
    tampered.quality.consoleErrors = 1;
    expectCode(
      () =>
        verifyProtectedReleaseReceipt(
          tampered,
          {
            gitCommitSha: sha,
            release: evidence().release,
            sourcePullRequest: 68,
          },
          secret
        ),
      'BROWSER_HEALTH_FAILED'
    );
    expectCode(
      () =>
        verifyProtectedReleaseReceipt(
          receipt,
          {
            gitCommitSha: sha,
            release: evidence().release,
            sourcePullRequest: 68,
          },
          'another-test-only-release-receipt-secret'
        ),
      'RECEIPT_SIGNATURE_INVALID'
    );
    expectCode(
      () =>
        verifyProtectedReleaseReceipt(
          receipt,
          {
            gitCommitSha: 'b'.repeat(40),
            release: evidence().release,
            sourcePullRequest: 68,
          },
          secret
        ),
      'RECEIPT_EXPECTATION_MISMATCH'
    );
  });
});

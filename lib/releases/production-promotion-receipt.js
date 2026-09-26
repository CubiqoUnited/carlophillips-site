import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const SHA = /^[a-f0-9]{40}$/;
const FINGERPRINT = /^sha256:[a-f0-9]{64}$/;
const RELEASE = /^[A-Za-z0-9._-]+$/;
const DEPLOYMENT = /^dpl_[A-Za-z0-9]+$/;

export class ProductionPromotionReceiptError extends Error {
  constructor(code) {
    super(code);
    this.name = 'ProductionPromotionReceiptError';
    this.code = code;
  }
}

function fail(code) {
  throw new ProductionPromotionReceiptError(code);
}

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stable(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function exactKeys(value, keys, code) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(code);
  if (stable(Object.keys(value).sort()) !== stable([...keys].sort())) fail(code);
}

function truthy(value, code) {
  if (value !== true) fail(code);
}

function falsy(value, code) {
  if (value !== false) fail(code);
}

function validHealth(value) {
  exactKeys(
    value,
    [
      'schemaVersion',
      'checkedAt',
      'healthy',
      'checkoutEnabled',
      'productStatus',
      'cartCreated',
      'checkoutHandoffVerified',
      'privateCheckoutUrlRetained',
      'paymentAttempted',
      'orderSubmitted',
    ],
    'PRODUCTION_TEST_EVIDENCE_INVALID'
  );
  if (
    value.schemaVersion !== 'cp.checkout-health-receipt.v1' ||
    !Number.isFinite(Date.parse(value.checkedAt)) ||
    value.productStatus !== 200
  ) {
    fail('PRODUCTION_TEST_EVIDENCE_INVALID');
  }
  truthy(value.healthy, 'PRODUCTION_TEST_FAILED');
  truthy(value.checkoutEnabled, 'PRODUCTION_CHECKOUT_DISABLED');
  falsy(value.cartCreated, 'PRODUCTION_SIDE_EFFECT_DETECTED');
  falsy(value.checkoutHandoffVerified, 'PRODUCTION_SIDE_EFFECT_DETECTED');
  falsy(value.privateCheckoutUrlRetained, 'PRODUCTION_SIDE_EFFECT_DETECTED');
  falsy(value.paymentAttempted, 'PRODUCTION_SIDE_EFFECT_DETECTED');
  falsy(value.orderSubmitted, 'PRODUCTION_SIDE_EFFECT_DETECTED');
}

function validateUnsigned(receipt) {
  exactKeys(
    receipt,
    [
      'schemaVersion',
      'generatedAt',
      'release',
      'gitCommitSha',
      'candidate',
      'production',
      'tests',
      'shopify',
      'rollback',
      'safeguards',
      'protectedStaging',
    ],
    'PRODUCTION_RECEIPT_ENVELOPE_INVALID'
  );
  if (
    receipt.schemaVersion !== 'cp.production-promotion-receipt.v2' ||
    !Number.isFinite(Date.parse(receipt.generatedAt)) ||
    !RELEASE.test(receipt.release || '') ||
    !SHA.test(receipt.gitCommitSha || '')
  ) {
    fail('PRODUCTION_RECEIPT_IDENTITY_INVALID');
  }

  exactKeys(
    receipt.candidate,
    ['deploymentId', 'deploymentUrl', 'readyState', 'target', 'artifactKind', 'checkoutEnabled'],
    'PRODUCTION_CANDIDATE_INVALID'
  );
  let candidateUrl;
  try {
    candidateUrl = new URL(receipt.candidate.deploymentUrl);
  } catch {
    fail('PRODUCTION_CANDIDATE_INVALID');
  }
  if (
    !DEPLOYMENT.test(receipt.candidate.deploymentId || '') ||
    candidateUrl.protocol !== 'https:' ||
    !candidateUrl.hostname.endsWith('.vercel.app') ||
    receipt.candidate.readyState !== 'READY' ||
    receipt.candidate.target !== 'production' ||
    receipt.candidate.artifactKind !== 'staged-production'
  ) {
    fail('PRODUCTION_CANDIDATE_INVALID');
  }
  truthy(receipt.candidate.checkoutEnabled, 'PRODUCTION_CANDIDATE_INVALID');

  exactKeys(
    receipt.production,
    ['liveAliases', 'beforeDeploymentId', 'afterDeploymentId', 'readyState', 'target', 'exactCandidatePromoted'],
    'PRODUCTION_IDENTITY_INVALID'
  );
  if (!Array.isArray(receipt.production.liveAliases)
    || stable(receipt.production.liveAliases) !== stable([
      { alias: 'carlophillips.com', deploymentId: receipt.candidate.deploymentId },
      { alias: 'www.carlophillips.com', deploymentId: receipt.candidate.deploymentId },
    ])) {
    fail('PRODUCTION_IDENTITY_INVALID');
  }
  if (
    !DEPLOYMENT.test(receipt.production.beforeDeploymentId || '') ||
    receipt.production.afterDeploymentId !== receipt.candidate.deploymentId ||
    receipt.production.readyState !== 'READY' ||
    receipt.production.target !== 'production'
  ) {
    fail('PRODUCTION_IDENTITY_INVALID');
  }
  truthy(receipt.production.exactCandidatePromoted, 'PRODUCTION_IDENTITY_INVALID');

  exactKeys(receipt.tests, ['beforePromotion', 'afterPromotion'], 'PRODUCTION_TEST_EVIDENCE_INVALID');
  validHealth(receipt.tests.beforePromotion);
  validHealth(receipt.tests.afterPromotion);

  exactKeys(
    receipt.shopify,
    [
      'sourceEvidence',
      'stagingStoreReferenceHash',
      'productionStoreReferenceHash',
      'storesIsolated',
      'unchangedDuringPromotion',
      'workflowMutationPerformed',
    ],
    'PRODUCTION_SHOPIFY_EVIDENCE_INVALID'
  );
  if (
    receipt.shopify.sourceEvidence !== 'signed-protected-staging-receipt' ||
    !FINGERPRINT.test(receipt.shopify.stagingStoreReferenceHash || '') ||
    !FINGERPRINT.test(receipt.shopify.productionStoreReferenceHash || '') ||
    receipt.shopify.stagingStoreReferenceHash === receipt.shopify.productionStoreReferenceHash
  ) {
    fail('PRODUCTION_SHOPIFY_EVIDENCE_INVALID');
  }
  truthy(receipt.shopify.storesIsolated, 'PRODUCTION_SHOPIFY_EVIDENCE_INVALID');
  truthy(receipt.shopify.unchangedDuringPromotion, 'PRODUCTION_SHOPIFY_EVIDENCE_INVALID');
  falsy(receipt.shopify.workflowMutationPerformed, 'PRODUCTION_SHOPIFY_MUTATION_DETECTED');

  exactKeys(
    receipt.rollback,
    ['deploymentId', 'readyState', 'checkoutEnabled', 'restoreOnFailure', 'postRestoreHealthRequired'],
    'PRODUCTION_ROLLBACK_INVALID'
  );
  if (
    receipt.rollback.deploymentId !== receipt.production.beforeDeploymentId ||
    receipt.rollback.readyState !== 'READY'
  ) {
    fail('PRODUCTION_ROLLBACK_INVALID');
  }
  truthy(receipt.rollback.checkoutEnabled, 'PRODUCTION_ROLLBACK_INVALID');
  truthy(receipt.rollback.restoreOnFailure, 'PRODUCTION_ROLLBACK_INVALID');
  truthy(receipt.rollback.postRestoreHealthRequired, 'PRODUCTION_ROLLBACK_INVALID');

  exactKeys(
    receipt.safeguards,
    [
      'piiFree',
      'realPaymentUsed',
      'paymentAttempted',
      'orderSubmitted',
      'privateCheckoutUrlRetained',
      'productionStoreMutated',
    ],
    'PRODUCTION_SAFEGUARDS_INVALID'
  );
  truthy(receipt.safeguards.piiFree, 'PRODUCTION_SAFEGUARDS_INVALID');
  for (const key of [
    'realPaymentUsed',
    'paymentAttempted',
    'orderSubmitted',
    'privateCheckoutUrlRetained',
    'productionStoreMutated',
  ]) {
    falsy(receipt.safeguards[key], 'PRODUCTION_SAFEGUARDS_INVALID');
  }

  exactKeys(
    receipt.protectedStaging,
    ['schemaVersion', 'gitCommitSha', 'release', 'sourcePullRequest', 'receiptHash', 'signatureVerified'],
    'PROTECTED_STAGING_BINDING_INVALID'
  );
  if (
    receipt.protectedStaging.schemaVersion !== 'cp.protected-staging-release-receipt.v3' ||
    !SHA.test(receipt.protectedStaging.gitCommitSha || '') ||
    receipt.protectedStaging.release !== receipt.release ||
    !Number.isSafeInteger(receipt.protectedStaging.sourcePullRequest) ||
    receipt.protectedStaging.sourcePullRequest < 1 ||
    !FINGERPRINT.test(receipt.protectedStaging.receiptHash || '')
  ) {
    fail('PROTECTED_STAGING_BINDING_INVALID');
  }
  truthy(receipt.protectedStaging.signatureVerified, 'PROTECTED_STAGING_BINDING_INVALID');
}

function signatureFor(unsigned, secret) {
  if (typeof secret !== 'string' || secret.length < 32) {
    fail('PRODUCTION_RECEIPT_SIGNING_SECRET_INVALID');
  }
  return `sha256:${createHmac('sha256', secret).update(stable(unsigned)).digest('hex')}`;
}

export function receiptHash(receipt) {
  return `sha256:${createHash('sha256').update(stable(receipt)).digest('hex')}`;
}

export function createProductionPromotionReceipt(unsigned, secret) {
  validateUnsigned(unsigned);
  return {
    ...structuredClone(unsigned),
    signature: {
      algorithm: 'hmac-sha256',
      value: signatureFor(unsigned, secret),
    },
  };
}

export function verifyProductionPromotionReceipt(receipt, expected, secret) {
  exactKeys(
    receipt,
    [
      'schemaVersion',
      'generatedAt',
      'release',
      'gitCommitSha',
      'candidate',
      'production',
      'tests',
      'shopify',
      'rollback',
      'safeguards',
      'protectedStaging',
      'signature',
    ],
    'SIGNED_PRODUCTION_RECEIPT_ENVELOPE_INVALID'
  );
  exactKeys(receipt.signature, ['algorithm', 'value'], 'PRODUCTION_RECEIPT_SIGNATURE_INVALID');
  if (
    receipt.signature.algorithm !== 'hmac-sha256' ||
    !FINGERPRINT.test(receipt.signature.value || '')
  ) {
    fail('PRODUCTION_RECEIPT_SIGNATURE_INVALID');
  }
  const { signature, ...unsigned } = receipt;
  validateUnsigned(unsigned);
  if (
    receipt.gitCommitSha !== expected.gitCommitSha ||
    receipt.release !== expected.release ||
    receipt.candidate.deploymentId !== expected.candidateDeploymentId ||
    receipt.production.afterDeploymentId !== expected.productionDeploymentId ||
    stable(receipt.production.liveAliases) !== stable(expected.liveAliases)
  ) {
    fail('PRODUCTION_RECEIPT_EXPECTATION_MISMATCH');
  }
  const expectedSignature = signatureFor(unsigned, secret);
  const supplied = Buffer.from(signature.value);
  const calculated = Buffer.from(expectedSignature);
  if (supplied.length !== calculated.length || !timingSafeEqual(supplied, calculated)) {
    fail('PRODUCTION_RECEIPT_SIGNATURE_INVALID');
  }
  return structuredClone(receipt);
}

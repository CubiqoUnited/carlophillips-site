import { createHmac, timingSafeEqual } from 'node:crypto';

const SHA = /^[a-f0-9]{40}$/;
const FINGERPRINT = /^sha256:[a-f0-9]{64}$/;
const RELEASE = /^[A-Za-z0-9._-]+$/;
const DEPLOYMENT = /^dpl_[A-Za-z0-9]+$/;

export class ProtectedReleaseGateError extends Error {
  constructor(code) {
    super(code);
    this.name = 'ProtectedReleaseGateError';
    this.code = code;
  }
}

function fail(code) {
  throw new ProtectedReleaseGateError(code);
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
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (stable(actual) !== stable(expected)) fail(code);
}

function truthy(value, code) {
  if (value !== true) fail(code);
}

function validDate(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function validateUnsigned(receipt) {
  exactKeys(receipt, [
    'schemaVersion',
    'generatedAt',
    'release',
    'gitCommitSha',
    'sourcePullRequest',
    'staging',
    'shopify',
    'customerPath',
    'webhookSafety',
    'quality',
    'production',
    'rollback',
    'safeguards',
    'approval',
  ], 'RECEIPT_ENVELOPE_INVALID');
  if (receipt.schemaVersion !== 'cp.protected-staging-release-receipt.v3'
    || !validDate(receipt.generatedAt)
    || !RELEASE.test(receipt.release || '')
    || !SHA.test(receipt.gitCommitSha || '')
    || !Number.isSafeInteger(receipt.sourcePullRequest)
    || receipt.sourcePullRequest < 1) {
    fail('RECEIPT_IDENTITY_INVALID');
  }

  const staging = receipt.staging;
  exactKeys(staging, [
    'deploymentId', 'deploymentUrl', 'alias', 'readyState', 'checkoutEnabled',
    'gitCommitSha', 'release', 'immutable', 'productionBeforeDeploymentId',
    'productionAfterDeploymentId',
  ], 'STAGING_EVIDENCE_INVALID');
  let stagingUrl;
  try {
    stagingUrl = new URL(staging.deploymentUrl);
  } catch {
    fail('STAGING_DEPLOYMENT_URL_INVALID');
  }
  if (!DEPLOYMENT.test(staging.deploymentId || '')
    || stagingUrl.protocol !== 'https:'
    || !stagingUrl.hostname.endsWith('.vercel.app')
    || staging.alias !== 'staging.carlophillips.com'
    || staging.readyState !== 'READY'
    || staging.gitCommitSha !== receipt.gitCommitSha
    || staging.release !== receipt.release
    || staging.productionBeforeDeploymentId !== staging.productionAfterDeploymentId) {
    fail('STAGING_EVIDENCE_INVALID');
  }
  truthy(staging.checkoutEnabled, 'STAGING_CHECKOUT_DISABLED');
  truthy(staging.immutable, 'STAGING_NOT_IMMUTABLE');

  const shopify = receipt.shopify;
  exactKeys(shopify, [
    'source', 'environment', 'storeKind', 'storeReferenceHash',
    'productionStoreReferenceHash', 'storeIsolated', 'paymentMode',
    'durableStoreReferenceHash', 'productionDurableStoreReferenceHash',
    'durableStoreIsolated', 'handle', 'variants', 'cartBinding',
    'hostedCheckout',
  ], 'SHOPIFY_EVIDENCE_INVALID');
  if (shopify.source !== 'shopify'
    || shopify.environment !== 'preview'
    || shopify.storeKind !== 'development'
    || shopify.paymentMode !== 'not-used'
    || shopify.handle !== 'carlophillips-signature-hoodie'
    || !FINGERPRINT.test(shopify.storeReferenceHash || '')
    || !FINGERPRINT.test(shopify.productionStoreReferenceHash || '')
    || shopify.storeReferenceHash === shopify.productionStoreReferenceHash
    || !FINGERPRINT.test(shopify.durableStoreReferenceHash || '')
    || !FINGERPRINT.test(shopify.productionDurableStoreReferenceHash || '')
    || shopify.durableStoreReferenceHash === shopify.productionDurableStoreReferenceHash) {
    fail('SHOPIFY_ISOLATION_INVALID');
  }
  truthy(shopify.storeIsolated, 'SHOPIFY_STORE_NOT_ISOLATED');
  truthy(shopify.durableStoreIsolated, 'DURABLE_STORE_NOT_ISOLATED');
  exactKeys(shopify.cartBinding, ['gitCommitSha', 'release'], 'CART_BINDING_INVALID');
  if (shopify.cartBinding.gitCommitSha !== receipt.gitCommitSha
    || shopify.cartBinding.release !== receipt.release) fail('CART_BINDING_INVALID');
  exactKeys(shopify.hostedCheckout, ['https', 'trustedHost'], 'HOSTED_CHECKOUT_INVALID');
  truthy(shopify.hostedCheckout.https, 'HOSTED_CHECKOUT_INVALID');
  truthy(shopify.hostedCheckout.trustedHost, 'HOSTED_CHECKOUT_INVALID');
  if (!Array.isArray(shopify.variants) || shopify.variants.length !== 3) {
    fail('SHOPIFY_VARIANTS_INVALID');
  }
  const sizes = [];
  for (const variant of shopify.variants) {
    exactKeys(variant, [
      'size', 'price', 'currency', 'customerVisible',
    ], 'SHOPIFY_VARIANTS_INVALID');
    sizes.push(variant.size);
    if (variant.price !== '128.00' || variant.currency !== 'USD'
      || variant.customerVisible !== true) {
      fail('SHOPIFY_VARIANTS_INVALID');
    }
  }
  if (stable([...sizes].sort()) !== stable(['L', 'M', 'S'])) {
    fail('SHOPIFY_VARIANTS_INVALID');
  }

  exactKeys(receipt.customerPath, [
    'shopifyAuthoritativeProduct', 'sizeSelection', 'bagTruth',
    'hostedStagingCheckoutHandoff', 'checkoutHandoffEvidenceHash',
    'privateCheckoutUrlRetained', 'paymentAttempted', 'orderSubmitted',
  ], 'CUSTOMER_PATH_INCOMPLETE');
  for (const key of [
    'shopifyAuthoritativeProduct', 'sizeSelection', 'bagTruth',
    'hostedStagingCheckoutHandoff',
  ]) {
    const result = receipt.customerPath[key];
    truthy(result, 'CUSTOMER_PATH_INCOMPLETE');
  }
  if (!FINGERPRINT.test(receipt.customerPath.checkoutHandoffEvidenceHash || '')) {
    fail('CUSTOMER_PATH_EVIDENCE_HASH_INVALID');
  }
  if (receipt.customerPath.privateCheckoutUrlRetained !== false
    || receipt.customerPath.paymentAttempted !== false
    || receipt.customerPath.orderSubmitted !== false) {
    fail('CUSTOMER_PATH_SIDE_EFFECT_DETECTED');
  }

  const webhookSafety = receipt.webhookSafety;
  exactKeys(webhookSafety, [
    'signatureVerified', 'signatureAlgorithm', 'durableIdempotency',
    'duplicateDelivery', 'externalActionCount', 'piiFree',
  ], 'WEBHOOK_SAFETY_EVIDENCE_INVALID');
  if (webhookSafety.signatureAlgorithm !== 'shopify-hmac-sha256') {
    fail('WEBHOOK_SAFETY_EVIDENCE_INVALID');
  }
  truthy(webhookSafety.signatureVerified, 'WEBHOOK_SIGNATURE_UNVERIFIED');
  truthy(webhookSafety.durableIdempotency, 'WEBHOOK_IDEMPOTENCY_UNVERIFIED');
  truthy(webhookSafety.piiFree, 'PII_EVIDENCE_REJECTED');
  exactKeys(
    webhookSafety.duplicateDelivery,
    ['attempted', 'suppressed', 'observationCount', 'externalActionCount'],
    'DUPLICATE_PROOF_INVALID'
  );
  truthy(webhookSafety.duplicateDelivery.attempted, 'DUPLICATE_PROOF_INVALID');
  truthy(webhookSafety.duplicateDelivery.suppressed, 'DUPLICATE_PROOF_INVALID');
  if (
    webhookSafety.duplicateDelivery.observationCount !== 1
    || webhookSafety.duplicateDelivery.externalActionCount !== 0
    || webhookSafety.externalActionCount !== 0
  ) fail('DUPLICATE_ACTION_DETECTED');

  const quality = receipt.quality;
  exactKeys(quality, [
    'desktop', 'mobile', 'accessibilityPassed', 'consoleErrors',
    'networkFailures',
  ], 'QUALITY_EVIDENCE_INVALID');
  for (const [name, expectedWidth] of [['desktop', 1440], ['mobile', 390]]) {
    exactKeys(quality[name], ['width', 'screenshotHash', 'comparisonPassed'], 'SCREENSHOT_EVIDENCE_INVALID');
    if (quality[name].width !== expectedWidth
      || !FINGERPRINT.test(quality[name].screenshotHash || '')) {
      fail('SCREENSHOT_EVIDENCE_INVALID');
    }
    truthy(quality[name].comparisonPassed, 'SCREENSHOT_COMPARISON_FAILED');
  }
  truthy(quality.accessibilityPassed, 'ACCESSIBILITY_FAILED');
  if (quality.consoleErrors !== 0 || quality.networkFailures !== 0) {
    fail('BROWSER_HEALTH_FAILED');
  }

  const production = receipt.production;
  exactKeys(production, ['before', 'after', 'unchangedDuringStaging'], 'PRODUCTION_HEALTH_INVALID');
  for (const point of ['before', 'after']) {
    exactKeys(production[point], ['deploymentId', 'healthy', 'checkoutEnabled'], 'PRODUCTION_HEALTH_INVALID');
    if (!DEPLOYMENT.test(production[point].deploymentId || '')) fail('PRODUCTION_HEALTH_INVALID');
    truthy(production[point].healthy, 'PRODUCTION_UNHEALTHY');
    truthy(production[point].checkoutEnabled, 'PRODUCTION_CHECKOUT_DISABLED');
  }
  truthy(production.unchangedDuringStaging, 'PRODUCTION_CHANGED_DURING_STAGING');
  if (production.before.deploymentId !== production.after.deploymentId
    || production.before.deploymentId !== staging.productionBeforeDeploymentId) {
    fail('PRODUCTION_CHANGED_DURING_STAGING');
  }

  exactKeys(receipt.rollback, [
    'lastVerifiedDeploymentId', 'checkoutEnabled', 'restoreOnFailure',
    'postRestoreHealthRequired',
  ], 'ROLLBACK_EVIDENCE_INVALID');
  if (receipt.rollback.lastVerifiedDeploymentId !== production.before.deploymentId) {
    fail('ROLLBACK_ANCHOR_INVALID');
  }
  truthy(receipt.rollback.checkoutEnabled, 'ROLLBACK_CHECKOUT_DISABLED');
  truthy(receipt.rollback.restoreOnFailure, 'ROLLBACK_NOT_ENFORCED');
  truthy(receipt.rollback.postRestoreHealthRequired, 'ROLLBACK_HEALTH_NOT_ENFORCED');

  exactKeys(receipt.safeguards, [
    'piiFree', 'realPaymentUsed', 'paymentAttempted', 'stagingOrderCreated',
    'productionOrderCreated',
    'privateCheckoutUrlRetained', 'productionStoreMutated',
  ], 'SAFEGUARDS_INVALID');
  truthy(receipt.safeguards.piiFree, 'PII_EVIDENCE_REJECTED');
  if (receipt.safeguards.realPaymentUsed !== false
    || receipt.safeguards.paymentAttempted !== false
    || receipt.safeguards.stagingOrderCreated !== false
    || receipt.safeguards.productionOrderCreated !== false
    || receipt.safeguards.privateCheckoutUrlRetained !== false
    || receipt.safeguards.productionStoreMutated !== false) {
    fail('SAFEGUARDS_INVALID');
  }

  exactKeys(receipt.approval, [
    'stagingEnvironmentProtected', 'stagingProductOwnerReviewed',
    'productionApproved',
  ], 'APPROVAL_EVIDENCE_INVALID');
  truthy(receipt.approval.stagingEnvironmentProtected, 'STAGING_NOT_PROTECTED');
  truthy(receipt.approval.stagingProductOwnerReviewed, 'STAGING_REVIEW_REQUIRED');
  if (receipt.approval.productionApproved !== false) {
    fail('PRODUCTION_APPROVAL_MUST_BE_SEPARATE');
  }
}

function signatureFor(unsigned, secret) {
  if (typeof secret !== 'string' || secret.length < 32) fail('RECEIPT_SIGNING_SECRET_INVALID');
  return `sha256:${createHmac('sha256', secret).update(stable(unsigned)).digest('hex')}`;
}

export function createProtectedReleaseReceipt(unsigned, secret) {
  validateUnsigned(unsigned);
  return {
    ...structuredClone(unsigned),
    signature: {
      algorithm: 'hmac-sha256',
      value: signatureFor(unsigned, secret),
    },
  };
}

export function verifyProtectedReleaseReceipt(receipt, expected, secret) {
  exactKeys(receipt, [
    'schemaVersion', 'generatedAt', 'release', 'gitCommitSha',
    'sourcePullRequest', 'staging', 'shopify', 'customerPath', 'webhookSafety',
    'quality', 'production', 'rollback', 'safeguards', 'approval', 'signature',
  ], 'SIGNED_RECEIPT_ENVELOPE_INVALID');
  exactKeys(receipt.signature, ['algorithm', 'value'], 'RECEIPT_SIGNATURE_INVALID');
  if (receipt.signature.algorithm !== 'hmac-sha256'
    || !FINGERPRINT.test(receipt.signature.value || '')) fail('RECEIPT_SIGNATURE_INVALID');
  const { signature, ...unsigned } = receipt;
  validateUnsigned(unsigned);
  if (receipt.gitCommitSha !== expected.gitCommitSha
    || receipt.release !== expected.release
    || receipt.sourcePullRequest !== expected.sourcePullRequest) {
    fail('RECEIPT_EXPECTATION_MISMATCH');
  }
  const expectedSignature = signatureFor(unsigned, secret);
  const suppliedBuffer = Buffer.from(signature.value);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (suppliedBuffer.length !== expectedBuffer.length
    || !timingSafeEqual(suppliedBuffer, expectedBuffer)) {
    fail('RECEIPT_SIGNATURE_INVALID');
  }
  return structuredClone(receipt);
}

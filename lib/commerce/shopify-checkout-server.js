import 'server-only';

import { evaluateProductReleaseEvidence } from '../releases/product-release-transition.js';

const REFERENCE_PATTERN = /^sha256:[a-f0-9]{64}$/;

/**
 * Keep checkout fail-closed until a separately reviewed server-only checkout
 * authorization is bound to a canonical Released Product Release Record.
 *
 * This boundary intentionally performs no Shopify read or cart mutation. A
 * historical one-product launch file previously bypassed the canonical release
 * and Media Registry gates; that authority path has been removed.
 */
export async function createApprovedHoodieCheckout({
  handle,
  referenceHash,
  quantity,
  releaseRecord = null,
  mediaManifest = null,
}) {
  if (
    !REFERENCE_PATTERN.test(referenceHash || '')
    || !Number.isInteger(quantity)
    || quantity < 1
    || quantity > 5
  ) {
    return { ok: false, reason: 'INVALID_CHECKOUT_SELECTION' };
  }

  if (
    !releaseRecord
    || !mediaManifest
    || releaseRecord.shopify?.handle !== handle
    || releaseRecord.releaseId !== mediaManifest.releaseId
  ) {
    return { ok: false, reason: 'PRODUCT_RELEASE_EVIDENCE_REQUIRED' };
  }

  if (releaseRecord.state !== 'released') {
    return { ok: false, reason: 'PRODUCT_RELEASE_NOT_RELEASED' };
  }

  const releaseDecision = evaluateProductReleaseEvidence({
    record: releaseRecord,
    manifest: mediaManifest,
    targetState: 'released',
  });
  if (!releaseDecision.ready) {
    return { ok: false, reason: 'PRODUCT_RELEASE_EVIDENCE_INCOMPLETE' };
  }

  return { ok: false, reason: 'CHECKOUT_REQUIRES_SEPARATE_RELEASE_BOUND_AUTHORIZATION' };
}

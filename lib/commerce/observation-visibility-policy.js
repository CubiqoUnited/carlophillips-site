import { validateProductObservationIntegrity } from './product-observation.js';
import { createVariantPresentation } from './variant-presentation-policy.js';

const FINGERPRINT_PATTERN = /^sha256:[a-f0-9]{64}$/;

function denied(reason) {
  return { ready: false, reason, product: null };
}

function releaseBoundProduct(product, observation) {
  return {
    id: observation.product.handle,
    handle: observation.product.handle,
    name: observation.product.title,
    title: observation.product.title,
    description: observation.product.description,
    vendor: observation.product.vendor,
    productType: observation.product.productType,
    tagline: observation.product.tagline,
    details: [...observation.product.details],
    price: observation.product.minimumPrice,
    compareAtPrice: observation.product.maximumPrice,
    currency: observation.product.currency,
    availableForSale: observation.product.availableForSale,
    variantFingerprint: observation.variantFingerprint,
    variantPresentation: createVariantPresentation(observation),
    media: Array.isArray(product?.media) ? product.media : [],
  };
}

/**
 * Preview and production may render only canonical Shopify facts already
 * reviewed and bound to the Product Release Record. Each fresh read has a new
 * full-envelope audit fingerprint, so runtime compares stable variant identity
 * and commerce facts while retaining the reviewed full fingerprint as audit
 * evidence.
 */
export function evaluateObservationVisibility({
  environment,
  shopifyProduct,
  releaseRecord,
}) {
  const observation = shopifyProduct?.observation;
  const integrity = validateProductObservationIntegrity(observation);
  if (
    !integrity.valid
    || observation?.source !== 'shopify'
    || observation?.authority !== 'candidate'
    || observation?.environment !== environment
  ) {
    return denied('PRODUCT_OBSERVATION_INVALID');
  }
  if (
    observation.product.handle !== shopifyProduct.handle
    || observation.product.handle !== releaseRecord?.shopify?.handle
  ) {
    return denied('PRODUCT_OBSERVATION_HANDLE_MISMATCH');
  }

  if (environment === 'local') {
    return {
      ready: true,
      reason: null,
      product: releaseBoundProduct(shopifyProduct, observation),
    };
  }

  if (
    releaseRecord?.shopify?.variantFingerprintStatus !== 'observed'
    || !FINGERPRINT_PATTERN.test(releaseRecord?.shopify?.variantFingerprint || '')
    || releaseRecord?.shopify?.commerceFactsFingerprintStatus !== 'reviewed'
    || !FINGERPRINT_PATTERN.test(releaseRecord?.shopify?.commerceFactsFingerprint || '')
    || releaseRecord?.shopify?.observationFingerprintStatus !== 'reviewed'
    || !FINGERPRINT_PATTERN.test(releaseRecord?.shopify?.observationFingerprint || '')
    || typeof releaseRecord?.shopify?.observationReviewEvidence !== 'string'
    || !releaseRecord.shopify.observationReviewEvidence.trim()
  ) {
    return denied('PRODUCT_OBSERVATION_REVIEW_REQUIRED');
  }

  if (shopifyProduct.variantFingerprint !== observation.variantFingerprint) {
    return denied('PRODUCT_OBSERVATION_VARIANT_METADATA_MISMATCH');
  }
  if (observation.variantFingerprint !== releaseRecord.shopify.variantFingerprint) {
    return denied('PRODUCT_VARIANT_FINGERPRINT_STALE');
  }
  if (observation.commerceFactsFingerprint !== releaseRecord.shopify.commerceFactsFingerprint) {
    return denied('PRODUCT_COMMERCE_FACTS_STALE');
  }

  return {
    ready: true,
    reason: null,
    product: releaseBoundProduct(shopifyProduct, observation),
  };
}

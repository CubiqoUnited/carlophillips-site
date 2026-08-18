import {
  createProductObservation,
  validateProductObservationIntegrity,
} from './product-observation.js';
import { hasSellableReviewedVariant } from './variant-presentation-policy.js';

const FINGERPRINT_PATTERN = /^sha256:[a-f0-9]{64}$/;

function blocker(code, humanAction, resumePoint) {
  return { code, humanAction, resumePoint };
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function readyProductReadCapability(decision, observation) {
  return decision?.status === 'ready'
    && decision.capability === 'shopify-storefront-product-read'
    && decision.adapter === 'shopify-storefront-product'
    && decision.callableSurface === 'shopify_storefront'
    && hasText(decision.evidenceRef)
    && decision.evidenceRef === observation?.capabilityEvidence;
}

function readyLocalResolverCapability(decision) {
  return decision?.status === 'ready'
    && decision.capability === 'shopify-storefront-variant-resolver'
    && decision.adapter === 'server-only-shopify-variant-resolver'
    && decision.callableSurface === 'local'
    && hasText(decision.evidenceRef);
}

/**
 * Prove that the current raw Storefront variants can be matched one-to-one to
 * the reviewed presentation. Raw IDs are consumed only inside this function
 * and are deliberately absent from its decision.
 *
 * This is readiness evidence, not a selected-variant result and not cart,
 * checkout, or order authority.
 */
export function evaluateVariantResolutionReadiness({
  environment,
  rawShopifyProduct,
  productDecision,
  releaseRecord,
  productReadCapabilityDecision,
  resolverCapabilityDecision,
}) {
  const blockers = [];
  const product = productDecision?.source === 'shopify'
    && productDecision.visibilityAllowed === true
    ? productDecision.product
    : null;
  const observation = rawShopifyProduct?.observation;
  const expectedFingerprint = releaseRecord?.shopify?.variantFingerprint;

  if (
    !['preview', 'production'].includes(environment)
    || productDecision?.environment !== environment
  ) {
    blockers.push(blocker(
      'VARIANT_RESOLVER_ENVIRONMENT_INVALID',
      'Run variant-resolution readiness only inside the matching Preview or production server boundary.',
      'Recreate the server decision with the exact Commerce Gateway environment.'
    ));
  }
  if (
    !product
    || !hasText(product.handle)
    || rawShopifyProduct?.handle !== product.handle
    || releaseRecord?.shopify?.handle !== product.handle
  ) {
    blockers.push(blocker(
      'VARIANT_RESOLVER_PRODUCT_MISMATCH',
      'Resolve variants only for the exact visible Shopify product and matching Product Release Record.',
      'Reload the handle through the Commerce Gateway and discard mismatched raw input.'
    ));
  }
  if (
    !FINGERPRINT_PATTERN.test(expectedFingerprint || '')
    || expectedFingerprint !== product?.variantFingerprint
  ) {
    blockers.push(blocker(
      'VARIANT_RESOLVER_RELEASE_FINGERPRINT_MISMATCH',
      'Bind the resolver to the exact current and reviewed release variant fingerprint.',
      'Withhold resolution until the current product and Product Release Record fingerprints match.'
    ));
  }
  if (
    releaseRecord?.shopify?.commerceFactsFingerprintStatus !== 'reviewed'
    || observation?.commerceFactsFingerprint
      !== releaseRecord?.shopify?.commerceFactsFingerprint
  ) {
    blockers.push(blocker(
      'VARIANT_RESOLVER_RELEASE_FACTS_MISMATCH',
      'Use current commerce facts that exactly match the reviewed Product Release Record.',
      'Withhold resolution until the current observation and reviewed commerce-facts binding match.'
    ));
  }

  const observationIntegrity = validateProductObservationIntegrity(observation);
  if (!observationIntegrity.valid) {
    blockers.push(blocker(
      'VARIANT_RESOLVER_OBSERVATION_INVALID',
      'Use an intact canonical Shopify Product Observation.',
      `Regenerate the observation before resolution: ${observationIntegrity.errors.join(', ')}.`
    ));
  }
  if (
    observation?.source !== 'shopify'
    || observation?.environment !== environment
    || observation?.variantFingerprint !== product?.variantFingerprint
    || observation?.variantFingerprint !== expectedFingerprint
  ) {
    blockers.push(blocker(
      'VARIANT_RESOLVER_OBSERVATION_FINGERPRINT_MISMATCH',
      'Use the current Shopify observation bound to both product and release identity.',
      'Discard the stale observation and repeat the authorized read-only product load.'
    ));
  }
  if (!readyProductReadCapability(productReadCapabilityDecision, observation)) {
    blockers.push(blocker(
      'VARIANT_RESOLVER_PRODUCT_READ_CAPABILITY_REQUIRED',
      productReadCapabilityDecision?.blocker?.humanAction
        || 'Verify the exact Storefront product-read capability and durable evidence.',
      productReadCapabilityDecision?.blocker?.resumePoint
        || 'Bind the ready product-read evidence to a fresh Shopify observation.'
    ));
  }
  if (!readyLocalResolverCapability(resolverCapabilityDecision)) {
    blockers.push(blocker(
      'VARIANT_RESOLVER_LOCAL_CAPABILITY_REQUIRED',
      'Use the verified server-only CP variant resolver implementation.',
      'Discover shopify-storefront-variant-resolver for resolve-reviewed-variant and retain its durable local evidence.'
    ));
  }
  if (!hasSellableReviewedVariant(product?.variantPresentation, {
    expectedVariantFingerprint: expectedFingerprint,
    productVariantFingerprint: product?.variantFingerprint,
    productCurrency: product?.currency,
  })) {
    blockers.push(blocker(
      'VARIANT_RESOLVER_PRESENTATION_INVALID',
      'Use an available, exact reviewed VariantPresentation bound to this release.',
      'Regenerate the presentation from the intact current Product Observation.'
    ));
  }

  let regeneratedObservation = null;
  try {
    regeneratedObservation = createProductObservation({
      source: 'shopify',
      environment: observation?.environment,
      observedAt: observation?.observedAt,
      product: rawShopifyProduct,
      capabilityEvidence: observation?.capabilityEvidence,
    });
  } catch {
    blockers.push(blocker(
      'VARIANT_RESOLVER_RAW_FACTS_INVALID',
      'Use complete, unique, internally consistent raw Storefront variant facts.',
      'Repeat the authorized read-only product load before resolution; do not copy raw reference values into evidence.'
    ));
  }

  if (
    regeneratedObservation
    && regeneratedObservation.variantFingerprint !== observation?.variantFingerprint
  ) {
    blockers.push(blocker(
      'VARIANT_RESOLVER_IDENTITY_STALE',
      'Use raw variants whose identities exactly match the current reviewed observation.',
      'Withhold resolution and submit the changed variant identity for a new review.'
    ));
  } else if (
    regeneratedObservation
    && regeneratedObservation.commerceFactsFingerprint
      !== observation?.commerceFactsFingerprint
  ) {
    blockers.push(blocker(
      'VARIANT_RESOLVER_FACTS_STALE',
      'Use raw variant facts that exactly match the current reviewed commerce facts.',
      'Withhold resolution and submit the changed price, availability, currency, or copy facts for a new review.'
    ));
  }

  const reviewedReferences = new Set(
    product?.variantPresentation?.combinations?.map(item => item.referenceHash) || []
  );
  const currentReferences = new Set(
    regeneratedObservation?.variants?.map(item => item.referenceHash) || []
  );
  const oneToOneMapping = reviewedReferences.size > 0
    && reviewedReferences.size === currentReferences.size
    && [...reviewedReferences].every(reference => currentReferences.has(reference));
  if (!oneToOneMapping) {
    blockers.push(blocker(
      'VARIANT_RESOLVER_MAPPING_INCOMPLETE',
      'Match every reviewed opaque reference to exactly one current raw Storefront variant.',
      'Repeat the read-only load and withhold cart activation until mapping coverage is exact.'
    ));
  }

  const ready = blockers.length === 0;
  return {
    schemaVersion: 'cp.variant-resolution-decision.v1',
    environment,
    status: ready ? 'ready' : 'blocked',
    capability: 'shopify-storefront-variant-resolver',
    adapter: 'server-only-shopify-variant-resolver',
    callableSurface: 'server_only',
    productHandle: product?.handle || null,
    variantFingerprint: FINGERPRINT_PATTERN.test(expectedFingerprint || '')
      ? expectedFingerprint
      : null,
    evidenceRef: ready ? resolverCapabilityDecision.evidenceRef : null,
    productReadEvidenceRef: ready ? productReadCapabilityDecision.evidenceRef : null,
    mappedVariantCount: ready ? currentReferences.size : 0,
    mappingComplete: ready,
    rawReferenceExposed: false,
    cartMutationAuthorized: false,
    checkoutAuthorized: false,
    blockers,
  };
}

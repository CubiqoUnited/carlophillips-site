import { createHash } from 'node:crypto';

const FINGERPRINT_PATTERN = /^sha256:[a-f0-9]{64}$/;
const PRICE_PATTERN = /^(0|[1-9][0-9]*)(?:\.[0-9]+)?$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function canonicalJson(value) {
  function canonicalize(item) {
    if (Array.isArray(item)) return item.map(canonicalize);
    if (item && typeof item === 'object') {
      return Object.keys(item)
        .sort(compareCanonical)
        .reduce((result, key) => {
          result[key] = canonicalize(item[key]);
          return result;
        }, {});
    }
    return item;
  }

  return JSON.stringify(canonicalize(value));
}

function normalizeText(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function compareCanonical(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function canonicalOptions(options = []) {
  return (Array.isArray(options) ? options : [])
    .map(option => ({
      name: normalizeText(option?.name),
      value: normalizeText(option?.value),
    }))
    .sort((left, right) => compareCanonical(
      `${left.name}\0${left.value}`,
      `${right.name}\0${right.value}`
    ));
}

function canonicalVariants(product) {
  return product.observedVariants.map(variant => ({
    referenceHash: sha256(normalizeText(variant.id)),
    title: normalizeText(variant.title),
    selectedOptions: canonicalOptions(variant.selectedOptions),
    availableForSale: Boolean(variant.availableForSale),
    price: {
      amount: normalizeText(variant.price?.amount),
      currency: normalizeText(variant.price?.currencyCode),
    },
  })).sort((left, right) => compareCanonical(
    `${left.referenceHash}\0${canonicalJson(left.selectedOptions)}`,
    `${right.referenceHash}\0${canonicalJson(right.selectedOptions)}`
  ));
}

function canonicalSanitizedVariants(variants = []) {
  return variants.map(variant => ({
    referenceHash: variant?.referenceHash,
    title: variant?.title,
    selectedOptions: canonicalOptions(variant?.selectedOptions),
    availableForSale: variant?.availableForSale,
    price: {
      amount: variant?.price?.amount,
      currency: variant?.price?.currency,
    },
  })).sort((left, right) => compareCanonical(
    `${left.referenceHash}\0${canonicalJson(left.selectedOptions)}`,
    `${right.referenceHash}\0${canonicalJson(right.selectedOptions)}`
  ));
}

function observationFingerprints(envelope) {
  const variants = envelope.variants || [];
  const variantIdentity = variants.map(variant => ({
    referenceHash: variant.referenceHash,
    title: variant.title,
    selectedOptions: variant.selectedOptions,
  }));

  return {
    variantFingerprint: sha256(canonicalJson(variantIdentity)),
    commerceFactsFingerprint: sha256(canonicalJson({
      product: envelope.product,
      variants,
    })),
    observationFingerprint: sha256(canonicalJson({
      schemaVersion: envelope.schemaVersion,
      source: envelope.source,
      authority: envelope.authority,
      environment: envelope.environment,
      observedAt: envelope.observedAt,
      capabilityEvidence: envelope.capabilityEvidence,
      product: envelope.product,
      variants,
    })),
  };
}

export function validateProductObservationIntegrity(observation) {
  const errors = [];
  if (
    observation?.schemaVersion !== 'cp.product-observation.v1'
    || !['shopify', 'fixture', 'simulation'].includes(observation?.source)
    || !['candidate', 'non_authoritative'].includes(observation?.authority)
    || !['local', 'preview', 'production'].includes(observation?.environment)
    || !DATE_TIME_PATTERN.test(observation?.observedAt || '')
    || !Number.isFinite(Date.parse(observation?.observedAt))
  ) {
    errors.push('envelope invalid');
  }
  if (
    observation?.source === 'shopify'
    && (
      observation?.authority !== 'candidate'
      || !normalizeText(observation?.capabilityEvidence)
    )
  ) {
    errors.push('Shopify authority invalid');
  }
  if (
    observation?.source !== 'shopify'
    && (
      observation?.authority !== 'non_authoritative'
      || observation?.environment !== 'local'
      || observation?.capabilityEvidence !== null
    )
  ) {
    errors.push('non-authoritative boundary invalid');
  }
  if (
    observation?.review?.status !== 'pending'
    || observation?.review?.owner !== 'Product Owner/designee'
    || observation?.review?.evidence !== null
  ) {
    errors.push('review state invalid');
  }
  if (
    !FINGERPRINT_PATTERN.test(observation?.variantFingerprint || '')
    || !FINGERPRINT_PATTERN.test(observation?.commerceFactsFingerprint || '')
    || !FINGERPRINT_PATTERN.test(observation?.observationFingerprint || '')
  ) {
    errors.push('fingerprint invalid');
  }

  const safeVariants = Array.isArray(observation?.variants) ? observation.variants : [];
  const canonicalObservedVariants = canonicalSanitizedVariants(safeVariants);
  if (canonicalJson(canonicalObservedVariants) !== canonicalJson(safeVariants)) {
    errors.push('canonical order invalid');
  }
  const expectedFingerprints = observationFingerprints({
    schemaVersion: observation?.schemaVersion,
    source: observation?.source,
    authority: observation?.authority,
    environment: observation?.environment,
    observedAt: observation?.observedAt,
    capabilityEvidence: observation?.capabilityEvidence ?? null,
    product: observation?.product || {},
    variants: canonicalObservedVariants,
  });
  if (
    expectedFingerprints.variantFingerprint !== observation?.variantFingerprint
    || expectedFingerprints.commerceFactsFingerprint !== observation?.commerceFactsFingerprint
    || expectedFingerprints.observationFingerprint !== observation?.observationFingerprint
  ) {
    errors.push('fingerprint integrity mismatch');
  }
  errors.push(...observationFactErrors(
    observation?.product || {},
    safeVariants
  ));

  return {
    valid: errors.length === 0,
    errors: [...new Set(errors)],
  };
}

function observationFactErrors(product, variants) {
  const errors = [];
  const currency = product?.currency;
  const minimumPrice = product?.minimumPrice;
  const maximumPrice = product?.maximumPrice;

  if (!normalizeText(product?.handle)) errors.push('product handle missing');
  if (!normalizeText(product?.title)) errors.push('product title missing');
  if (!CURRENCY_PATTERN.test(currency || '')) errors.push('product currency invalid');
  if (!Number.isFinite(minimumPrice) || minimumPrice < 0) errors.push('minimum price invalid');
  if (!Number.isFinite(maximumPrice) || maximumPrice < 0) errors.push('maximum price invalid');
  if (Number.isFinite(minimumPrice) && Number.isFinite(maximumPrice) && maximumPrice < minimumPrice) {
    errors.push('price range inverted');
  }
  if (!Array.isArray(variants) || variants.length === 0) return [...errors, 'variants missing'];

  const references = new Set();
  const variantPrices = [];
  let anyAvailable = false;
  for (const variant of variants) {
    if (!FINGERPRINT_PATTERN.test(variant?.referenceHash || '')) errors.push('variant reference invalid');
    if (references.has(variant?.referenceHash)) errors.push('duplicate variant reference');
    references.add(variant?.referenceHash);
    if (!normalizeText(variant?.title)) errors.push('variant title missing');
    if (!Array.isArray(variant?.selectedOptions) || variant.selectedOptions.length === 0) {
      errors.push('variant options missing');
    } else if (variant.selectedOptions.some(option => (
      !normalizeText(option?.name) || !normalizeText(option?.value)
    ))) {
      errors.push('variant option invalid');
    }
    if (!PRICE_PATTERN.test(variant?.price?.amount || '')) errors.push('variant price invalid');
    if (!CURRENCY_PATTERN.test(variant?.price?.currency || '')) errors.push('variant currency invalid');
    if (variant?.price?.currency !== currency) errors.push('variant currency mismatch');
    const numericPrice = Number(variant?.price?.amount);
    if (Number.isFinite(numericPrice)) variantPrices.push(numericPrice);
    if (variant?.availableForSale === true) anyAvailable = true;
  }

  if (variantPrices.length === variants.length) {
    if (Math.min(...variantPrices) !== minimumPrice) errors.push('minimum price mismatch');
    if (Math.max(...variantPrices) !== maximumPrice) errors.push('maximum price mismatch');
  }
  if (Boolean(product?.availableForSale) !== anyAvailable) {
    errors.push('availability summary mismatch');
  }

  return [...new Set(errors)];
}

export function createProductObservation({
  source,
  environment,
  observedAt,
  product,
  capabilityEvidence = null,
}) {
  if (!['shopify', 'fixture', 'simulation'].includes(source)) {
    throw new Error(`Unsupported product observation source: ${source}`);
  }
  if (!['local', 'preview', 'production'].includes(environment)) {
    throw new Error(`Unsupported product observation environment: ${environment}`);
  }
  if (source !== 'shopify' && environment !== 'local') {
    throw new Error(`${source} product observations are local-only.`);
  }
  if (source !== 'shopify' && normalizeText(capabilityEvidence)) {
    throw new Error(`${source} product observations cannot carry capability evidence.`);
  }
  if (source === 'shopify' && !normalizeText(capabilityEvidence)) {
    throw new Error('Shopify product observations require durable product-read capability evidence.');
  }
  if (!product?.handle) throw new Error('Product observation requires a handle.');
  if (!DATE_TIME_PATTERN.test(observedAt || '') || !Number.isFinite(Date.parse(observedAt))) {
    throw new Error('Product observation requires a valid observedAt timestamp.');
  }

  if (!Array.isArray(product.observedVariants)) {
    throw new Error('Product observation requires a variant array.');
  }
  const variants = canonicalVariants(product);
  const rawVariants = product.observedVariants;
  const productSummary = {
    handle: product.handle,
    title: normalizeText(product.name || product.title),
    currency: normalizeText(product.currency),
    minimumPrice: Number(product.price || 0),
    maximumPrice: Number(product.compareAtPrice || product.price || 0),
    availableForSale: Boolean(product.availableForSale),
  };
  if (
    rawVariants.some(variant => !normalizeText(variant?.id))
    || new Set(rawVariants.map(variant => variant.id)).size !== rawVariants.length
  ) {
    throw new Error('Product observation requires unique raw variant references.');
  }
  const factErrors = observationFactErrors(productSummary, variants);
  if (factErrors.length) {
    throw new Error(`Product observation facts invalid: ${factErrors.join(', ')}`);
  }
  const envelope = {
    schemaVersion: 'cp.product-observation.v1',
    source,
    authority: source === 'shopify' ? 'candidate' : 'non_authoritative',
    environment,
    observedAt,
    capabilityEvidence: normalizeText(capabilityEvidence) || null,
    product: productSummary,
    variants,
  };
  const {
    variantFingerprint,
    commerceFactsFingerprint,
    observationFingerprint,
  } = observationFingerprints(envelope);

  return {
    ...envelope,
    variantFingerprint,
    commerceFactsFingerprint,
    observationFingerprint,
    review: {
      status: 'pending',
      owner: 'Product Owner/designee',
      evidence: null,
    },
  };
}

function blocker(code, humanAction, resumePoint) {
  return { code, humanAction, resumePoint };
}

export function reviewProductObservation({
  observation,
  expectedHandle,
  capabilityDecision,
  reviewApproval = null,
}) {
  const blockers = [];

  if (
    observation?.schemaVersion !== 'cp.product-observation.v1'
    || !['local', 'preview', 'production'].includes(observation?.environment)
    || !DATE_TIME_PATTERN.test(observation?.observedAt || '')
    || !Number.isFinite(Date.parse(observation?.observedAt))
    || observation?.review?.status !== 'pending'
    || observation?.review?.owner !== 'Product Owner/designee'
    || observation?.review?.evidence !== null
  ) {
    blockers.push(blocker(
      'PRODUCT_OBSERVATION_ENVELOPE_INVALID',
      'Review a schema-versioned observation with a valid environment and timestamp.',
      'Regenerate the complete observation envelope before review.'
    ));
  }
  if (observation?.source !== 'shopify' || observation?.authority !== 'candidate') {
    blockers.push(blocker(
      'AUTHORITATIVE_SHOPIFY_OBSERVATION_REQUIRED',
      'Use a direct Shopify observation rather than fixture or simulated input.',
      'Run the authorized read-only Storefront product observation and submit that candidate for review.'
    ));
  }
  if (observation?.product?.handle !== expectedHandle) {
    blockers.push(blocker(
      'PRODUCT_OBSERVATION_HANDLE_MISMATCH',
      'Review the observation for the exact release-record handle.',
      'Discard the mismatched candidate and observe the expected Shopify handle.'
    ));
  }
  if (
    !FINGERPRINT_PATTERN.test(observation?.variantFingerprint || '')
    || !FINGERPRINT_PATTERN.test(observation?.commerceFactsFingerprint || '')
    || !FINGERPRINT_PATTERN.test(observation?.observationFingerprint || '')
  ) {
    blockers.push(blocker(
      'PRODUCT_OBSERVATION_FINGERPRINT_INVALID',
      'Generate deterministic fingerprints from the canonical observation.',
      'Rebuild and validate the observation without manually editing fingerprint values.'
    ));
  } else {
    const safeVariants = Array.isArray(observation?.variants) ? observation.variants : [];
    const canonicalObservedVariants = canonicalSanitizedVariants(safeVariants);
    const expectedFingerprints = observationFingerprints({
      schemaVersion: observation?.schemaVersion,
      source: observation?.source,
      authority: observation?.authority,
      environment: observation?.environment,
      observedAt: observation?.observedAt,
      capabilityEvidence: observation?.capabilityEvidence ?? null,
      product: observation?.product || {},
      variants: canonicalObservedVariants,
    });
    if (canonicalJson(canonicalObservedVariants) !== canonicalJson(safeVariants)) {
      blockers.push(blocker(
        'PRODUCT_OBSERVATION_CANONICAL_ORDER_REQUIRED',
        'Use locale-independent canonical variant and option ordering.',
        'Regenerate the observation with the canonical sorter before review.'
      ));
    }
    if (
      expectedFingerprints.variantFingerprint !== observation.variantFingerprint
      || expectedFingerprints.commerceFactsFingerprint !== observation.commerceFactsFingerprint
      || expectedFingerprints.observationFingerprint !== observation.observationFingerprint
    ) {
      blockers.push(blocker(
        'PRODUCT_OBSERVATION_INTEGRITY_MISMATCH',
        'Review an immutable observation whose canonical contents match all fingerprints.',
        'Discard the edited candidate and regenerate it from the read-only Shopify response.'
      ));
    }
  }
  if (!Array.isArray(observation?.variants) || observation.variants.length === 0) {
    blockers.push(blocker(
      'PRODUCT_OBSERVATION_VARIANTS_REQUIRED',
      'Observe at least one Shopify variant for the release candidate.',
      'Repeat the read-only observation after product variants are available.'
    ));
  }
  const factErrors = observationFactErrors(
    observation?.product || {},
    Array.isArray(observation?.variants) ? observation.variants : []
  );
  if (factErrors.length) {
    blockers.push(blocker(
      'PRODUCT_OBSERVATION_FACTS_INVALID',
      'Review complete, internally consistent product, variant, price, currency, and availability facts.',
      `Regenerate the observation after resolving: ${factErrors.join(', ')}.`
    ));
  }
  const capabilityReady = capabilityDecision?.status === 'ready'
    && capabilityDecision.capability === 'shopify-storefront-product-read'
    && capabilityDecision.adapter === 'shopify-storefront-product'
    && capabilityDecision.callableSurface === 'shopify_storefront';
  if (!capabilityReady) {
    blockers.push(blocker(
      'SHOPIFY_PRODUCT_READ_CAPABILITY_REQUIRED',
      capabilityDecision?.blocker?.humanAction
        || 'Verify the Shopify Storefront product-read capability.',
      capabilityDecision?.blocker?.resumePoint
        || 'Record the evidence-backed callable surface, then resubmit the observation.'
    ));
  }
  if (
    !normalizeText(observation?.capabilityEvidence)
    || observation.capabilityEvidence !== capabilityDecision?.evidenceRef
  ) {
    blockers.push(blocker(
      'PRODUCT_OBSERVATION_CAPABILITY_EVIDENCE_MISMATCH',
      'Bind the exact durable evidence reference from the ready Storefront product-read capability.',
      'Regenerate or resubmit the observation with the matching capability evidence reference.'
    ));
  }
  const approvalReady = reviewApproval?.status === 'approved'
    && ['Product Owner', 'Product Owner/designee'].includes(reviewApproval.owner)
    && reviewApproval.scope === 'accept-shopify-product-observation'
    && reviewApproval.observationFingerprint === observation?.observationFingerprint
    && reviewApproval.handle === expectedHandle
    && normalizeText(reviewApproval.evidence);
  if (!approvalReady) {
    blockers.push(blocker(
      'PRODUCT_OBSERVATION_REVIEW_APPROVAL_REQUIRED',
      'The Product Owner or named designee reviews this exact observation fingerprint.',
      'Record approval scoped to accept-shopify-product-observation with durable evidence.'
    ));
  }

  return {
    schemaVersion: 'cp.product-observation-review.v1',
    status: blockers.length === 0 ? 'accepted' : 'blocked',
    authoritative: blockers.length === 0,
    observationFingerprint: observation?.observationFingerprint || null,
    blockers,
    candidateReleasePatch: blockers.length === 0 ? {
      handle: observation.product.handle,
      observedAt: observation.observedAt,
      variantFingerprint: observation.variantFingerprint,
      variantFingerprintStatus: 'observed',
      commerceFactsFingerprint: observation.commerceFactsFingerprint,
      commerceFactsFingerprintStatus: 'reviewed',
      observationFingerprint: observation.observationFingerprint,
      observationFingerprintStatus: 'reviewed',
      observationReviewEvidence: reviewApproval.evidence,
    } : null,
  };
}

export function attachObservationToProduct(product, observation) {
  return {
    ...product,
    variantFingerprint: observation.variantFingerprint,
    observation: structuredClone(observation),
  };
}

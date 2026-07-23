const FINGERPRINT_PATTERN = /^sha256:[a-f0-9]{64}$/;
const PRICE_PATTERN = /^(0|[1-9][0-9]*)(?:\.[0-9]+)?$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function compareCanonical(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validSelectedOptions(options) {
  if (!Array.isArray(options) || options.length === 0) return false;
  const names = new Set();
  for (const option of options) {
    const normalizedName = option?.name?.toLowerCase();
    if (
      !hasText(option?.name)
      || option.name.trim() !== option.name
      || !hasText(option?.value)
      || option.value.trim() !== option.value
      || names.has(normalizedName)
    ) {
      return false;
    }
    names.add(normalizedName);
  }
  return true;
}

export function createVariantPresentation(observation) {
  // This projection is intentionally downstream of
  // validateProductObservationIntegrity. Product observations already use the
  // locale-independent canonical option ordering that this presentation binds.
  const variants = Array.isArray(observation?.variants) ? observation.variants : [];
  const optionNames = [...new Set(variants.flatMap(variant => (
    variant.selectedOptions.map(option => option.name)
  )))].sort(compareCanonical);

  return {
    schemaVersion: 'cp.variant-presentation.v1',
    source: 'reviewed-product-observation',
    variantFingerprint: observation?.variantFingerprint,
    currency: observation?.product?.currency,
    selectionAllowed: false,
    cartAuthority: false,
    optionNames,
    combinations: variants.map(variant => ({
      referenceHash: variant.referenceHash,
      title: variant.title,
      selectedOptions: variant.selectedOptions.map(option => ({ ...option })),
      availableForSale: variant.availableForSale,
      price: { ...variant.price },
    })),
  };
}

export function hasSellableReviewedVariant(
  presentation,
  {
    expectedVariantFingerprint,
    productVariantFingerprint,
    productCurrency,
  } = {}
) {
  if (
    presentation?.schemaVersion !== 'cp.variant-presentation.v1'
    || presentation?.source !== 'reviewed-product-observation'
    || !FINGERPRINT_PATTERN.test(presentation?.variantFingerprint || '')
    || presentation.variantFingerprint !== expectedVariantFingerprint
    || presentation.variantFingerprint !== productVariantFingerprint
    || !CURRENCY_PATTERN.test(presentation?.currency || '')
    || presentation.currency !== productCurrency
    || presentation?.selectionAllowed !== false
    || presentation?.cartAuthority !== false
    || !Array.isArray(presentation?.optionNames)
    || presentation.optionNames.length === 0
    || !Array.isArray(presentation?.combinations)
    || presentation.combinations.length === 0
  ) return false;

  if (
    presentation.optionNames.some(name => !hasText(name) || name.trim() !== name)
    || new Set(presentation.optionNames.map(name => name.toLowerCase())).size
      !== presentation.optionNames.length
    || [...presentation.optionNames].sort(compareCanonical)
      .some((name, index) => name !== presentation.optionNames[index])
  ) return false;

  const referenceHashes = new Set();
  const optionSignatures = new Set();
  let sellable = false;
  for (const combination of presentation.combinations) {
    const optionNames = Array.isArray(combination?.selectedOptions)
      ? combination.selectedOptions.map(option => option?.name)
      : [];
    const optionSignature = JSON.stringify(combination?.selectedOptions);
    if (
      !FINGERPRINT_PATTERN.test(combination?.referenceHash || '')
      || referenceHashes.has(combination.referenceHash)
      || !hasText(combination?.title)
      || combination.title.trim() !== combination.title
      || !validSelectedOptions(combination?.selectedOptions)
      || optionNames.length !== presentation.optionNames.length
      || optionNames.some((name, index) => name !== presentation.optionNames[index])
      || optionSignatures.has(optionSignature)
      || typeof combination?.availableForSale !== 'boolean'
      || !PRICE_PATTERN.test(combination?.price?.amount || '')
      || !CURRENCY_PATTERN.test(combination?.price?.currency || '')
      || combination.price.currency !== presentation.currency
    ) return false;
    referenceHashes.add(combination.referenceHash);
    optionSignatures.add(optionSignature);
    if (combination.availableForSale) sellable = true;
  }
  return sellable;
}

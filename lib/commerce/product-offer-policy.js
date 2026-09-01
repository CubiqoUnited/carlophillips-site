const FINGERPRINT_PATTERN = /^sha256:[a-f0-9]{64}$/;

export function validateProductOffer(offer, { releaseId, handle } = {}) {
  const hashes = offer?.allowedReferenceHashes;
  const sizes = offer?.allowedSizes;
  return Boolean(
    offer?.schemaVersion === 'cp.shopify-product-offer.v1'
    && offer.releaseId === releaseId
    && offer.handle === handle
    && Array.isArray(hashes)
    && hashes.length > 0
    && hashes.every(hash => FINGERPRINT_PATTERN.test(hash))
    && new Set(hashes).size === hashes.length
    && Array.isArray(sizes)
    && sizes.length === hashes.length
    && sizes.every(size => ['S', 'M', 'L'].includes(size))
    && new Set(sizes).size === sizes.length
    && typeof offer.evidence === 'string'
    && offer.evidence.trim().length > 0
  );
}

export function productOfferAllowsReference(offer, referenceHash, binding = {}) {
  return validateProductOffer(offer, binding)
    && offer.allowedReferenceHashes.includes(referenceHash);
}

export function applyProductOffer(presentation, offer, binding = {}) {
  if (!validateProductOffer(offer, binding)) return null;
  const allowed = new Set(offer.allowedReferenceHashes);
  const combinations = presentation?.combinations?.filter(item => (
    allowed.has(item.referenceHash)
  )) || [];
  if (combinations.length !== allowed.size) return null;
  return { ...presentation, combinations };
}

const FINGERPRINT_PATTERN = /^sha256:[a-f0-9]{64}$/;

interface OfferPresentation {
  combinations: Array<{ referenceHash: string }>;
}

export interface ProductOffer {
  schemaVersion: string;
  releaseId: string;
  handle: string;
  allowedSizes: string[];
  allowedReferenceHashes: string[];
  evidence: string;
}

export function validateProductOffer(
  offer: ProductOffer | null | undefined,
  binding: { releaseId?: string; handle?: string } = {}
): boolean {
  const hashes = offer?.allowedReferenceHashes;
  const sizes = offer?.allowedSizes;
  return Boolean(
    offer?.schemaVersion === 'cp.shopify-product-offer.v1' &&
    offer.releaseId === binding.releaseId &&
    offer.handle === binding.handle &&
    Array.isArray(hashes) &&
    hashes.length > 0 &&
    hashes.every((hash) => FINGERPRINT_PATTERN.test(hash)) &&
    new Set(hashes).size === hashes.length &&
    Array.isArray(sizes) &&
    sizes.length === hashes.length &&
    sizes.every((size) => ['S', 'M', 'L'].includes(size)) &&
    new Set(sizes).size === sizes.length &&
    typeof offer.evidence === 'string' &&
    offer.evidence.trim().length > 0
  );
}

export function productOfferAllowsReference(
  offer: ProductOffer | null | undefined,
  referenceHash: string,
  binding: { releaseId?: string; handle?: string } = {}
): boolean {
  return Boolean(
    validateProductOffer(offer, binding) &&
    offer?.allowedReferenceHashes.includes(referenceHash)
  );
}

export function applyProductOffer<T extends OfferPresentation>(
  presentation: T | null | undefined,
  offer: ProductOffer | null | undefined,
  binding: { releaseId?: string; handle?: string } = {}
): T | null {
  if (!validateProductOffer(offer, binding)) return null;
  const allowed = new Set(offer?.allowedReferenceHashes || []);
  const combinations =
    presentation?.combinations?.filter((item) =>
      allowed.has(item.referenceHash)
    ) || [];
  if (!presentation || combinations.length !== allowed.size) return null;
  return { ...presentation, combinations } as T;
}

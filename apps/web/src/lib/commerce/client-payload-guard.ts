/**
 * Client serialisation boundary for product data.
 *
 * Two controls, deliberately distinct:
 *
 * 1. `toClientRuntimeProduct` is an ALLOWLIST. Any field not named here never
 *    reaches the client, including fields added to `RuntimeProduct` later. A
 *    denylist only covers the field someone remembered; that omission is the
 *    defect this module exists to close (KAN-19).
 * 2. `assertNoBlockedTerms` is a backstop that fails loudly if a blocked term
 *    reaches the payload through an allowed field (e.g. a supplier name typed
 *    into a product title). Absence of a field is not the same as absence of
 *    the term.
 */
import type { RuntimeProduct } from './runtime-types';

/** Terms that must never appear in anything serialised to a customer. */
export const BLOCKED_CLIENT_TERMS = ['apliiq', 'printful', 'printify'] as const;

/**
 * Fields permitted to cross the server/client boundary for a product.
 * `vendor` is absent by design and must stay absent.
 */
export const CLIENT_PRODUCT_FIELDS = [
  'id',
  'handle',
  'shopifyId',
  'name',
  'collection',
  'category',
  'price',
  'compareAtPrice',
  'currency',
  'tagline',
  'description',
  'details',
  'images',
  'media',
  'heroImage',
  'variants',
  'sizes',
  'observedVariants',
  'availableForSale',
  'productType',
  'variantPresentation',
  'variantFingerprint',
  'commerceFactsFingerprint',
  'observationFingerprint',
] as const;

export type ClientProductField = (typeof CLIENT_PRODUCT_FIELDS)[number];

export type ClientRuntimeProduct = Omit<
  RuntimeProduct,
  'vendor' | 'tags' | 'observation'
>;

function findBlockedTerm(
  value: unknown,
  path: string,
  seen: WeakSet<object>
): string | null {
  if (typeof value === 'string') {
    const haystack = value.toLowerCase();
    const hit = BLOCKED_CLIENT_TERMS.find((term) => haystack.includes(term));
    return hit ? `${path}: "${hit}"` : null;
  }
  if (!value || typeof value !== 'object') return null;
  if (seen.has(value as object)) return null;
  seen.add(value as object);
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const hit = findBlockedTerm(value[index], `${path}[${index}]`, seen);
      if (hit) return hit;
    }
    return null;
  }
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    const hit = findBlockedTerm(entry, path ? `${path}.${key}` : key, seen);
    if (hit) return hit;
    const keyHit = findBlockedTerm(
      key,
      path ? `${path}.<key>` : '<key>',
      new WeakSet()
    );
    if (keyHit) return keyHit;
  }
  return null;
}

/**
 * Throws if any blocked term appears anywhere in a payload bound for the client.
 * Failing the render is the correct outcome: a wrong page beats a leaked one.
 */
export function assertNoBlockedTerms(
  payload: unknown,
  label = 'client payload'
): void {
  const hit = findBlockedTerm(payload, '', new WeakSet());
  if (hit) {
    throw new Error(
      `Blocked supplier term reached the ${label} serialisation boundary at ${hit}.`
    );
  }
}

/** Projects a product onto the allowlist and asserts the result is clean. */
export function toClientRuntimeProduct(
  product: RuntimeProduct
): ClientRuntimeProduct {
  const source = product as unknown as Record<string, unknown>;
  const projected: Record<string, unknown> = {};
  for (const field of CLIENT_PRODUCT_FIELDS) {
    if (source[field] !== undefined) projected[field] = source[field];
  }
  assertNoBlockedTerms(projected, 'product');
  return projected as unknown as ClientRuntimeProduct;
}

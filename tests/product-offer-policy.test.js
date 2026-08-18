import { describe, expect, it } from 'vitest';
import productOffer from '../config/shopify-product-offer.json';
import observation from '../releases/cp-signature-hoodie-2026-001/shopify-product-observation.json';
import {
  applyProductOffer,
  productOfferAllowsReference,
  validateProductOffer,
} from '../lib/commerce/product-offer-policy.js';
import { createVariantPresentation } from '../lib/commerce/variant-presentation-policy.js';

const binding = {
  releaseId: 'cp-signature-hoodie-2026-001',
  handle: 'carlophillips-signature-hoodie',
};

describe('initial Shopify product offer', () => {
  it('offers exactly S, M and L from the reviewed Shopify observation', () => {
    expect(validateProductOffer(productOffer, binding)).toBe(true);
    const presentation = applyProductOffer(createVariantPresentation(observation), productOffer, binding);
    const sizes = presentation.combinations.map(item => (
      item.selectedOptions.find(option => option.name.toLowerCase() === 'size').value.toUpperCase()
    )).sort();
    expect(sizes).toEqual(['L', 'M', 'S']);
  });

  it('rejects every observed reference outside the initial offer', () => {
    const decisions = observation.variants.map(item => ({
      size: item.selectedOptions.find(option => option.name.toLowerCase() === 'size').value.toUpperCase(),
      allowed: productOfferAllowsReference(productOffer, item.referenceHash, binding),
    }));
    expect(decisions.filter(item => item.allowed).map(item => item.size).sort()).toEqual(['L', 'M', 'S']);
    expect(decisions.filter(item => !item.allowed)).toHaveLength(6);
  });

  it('fails closed for a stale release, product, or incomplete reference set', () => {
    const presentation = createVariantPresentation(observation);
    expect(applyProductOffer(presentation, productOffer, { ...binding, releaseId: 'stale' })).toBeNull();
    expect(applyProductOffer(presentation, productOffer, { ...binding, handle: 'wrong' })).toBeNull();
    expect(applyProductOffer({ ...presentation, combinations: presentation.combinations.slice(1) }, productOffer, binding)).toBeNull();
  });
});

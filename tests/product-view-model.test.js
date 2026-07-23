import { describe, expect, it } from 'vitest';
import { toProductViewModel } from '../lib/commerce/product-view-model.js';

const variantPresentation = {
  schemaVersion: 'cp.variant-presentation.v1',
  source: 'reviewed-product-observation',
  variantFingerprint: `sha256:${'a'.repeat(64)}`,
  currency: 'USD',
  selectionAllowed: false,
  cartAuthority: false,
  optionNames: ['Color', 'Size'],
  combinations: [{
    referenceHash: `sha256:${'a'.repeat(64)}`,
    title: 'Black / M',
    selectedOptions: [
      { name: 'Color', value: 'Black' },
      { name: 'Size', value: 'M' },
    ],
    availableForSale: true,
    price: { amount: '128.00', currency: 'USD' },
  }],
};

describe('product view model', () => {
  it('normalizes Shopify product and media fields without changing the source', () => {
    const model = toProductViewModel({
      source: 'shopify',
      environment: 'preview',
      commerceAllowed: false,
      reason: 'PRIVATE_RELEASE_REVIEW_NON_COMMERCE',
      product: {
        id: 'hoodie',
        name: 'Observed Hoodie',
        description: 'Reviewed description',
        vendor: 'Reviewed vendor',
        productType: 'Hoodie',
        tagline: 'SIGNATURE',
        details: ['Reviewed detail'],
        story: 'Outer adapter story must not render',
        price: 128,
        currency: 'USD',
        availableForSale: true,
        variantPresentation,
        media: [{ id: 'front', type: 'image', url: 'https://cdn.example/front.jpg', alt: 'Front' }],
        mediaReview: {
          status: 'incomplete',
          coveredModalities: ['front'],
          missingModalities: ['video'],
          missingFallbackCount: 0,
        },
      },
    });

    expect(model).toMatchObject({
      source: 'shopify',
      title: 'Observed Hoodie',
      colors: [],
      sizes: [],
      variantPresentation: {
        selectionAllowed: false,
        cartAuthority: false,
        combinations: [{ title: 'Black / M', availableForSale: true }],
      },
      commerceAllowed: false,
      description: 'Reviewed description',
      vendor: 'Reviewed vendor',
      productType: 'Hoodie',
      tagline: 'SIGNATURE',
      details: ['Reviewed detail'],
      sourceLabel: 'Shopify Storefront observation — private release review',
      truthHeading: 'Reviewed facts, private release review.',
      story: 'No reviewed product story is available.',
      commerceExplanation: 'This is a private release review. Purchasing remains disabled until the separate release and commerce gates pass.',
      mediaReview: {
        status: 'incomplete',
        missingModalities: ['video'],
      },
    });
    expect(model.media[0]).toMatchObject({ id: 'front', type: 'image', url: 'https://cdn.example/front.jpg' });
    expect(JSON.stringify(model)).not.toContain('Outer adapter story');
  });

  it('labels a Released production decision without implying release approval is pending', () => {
    const model = toProductViewModel({
      source: 'shopify',
      environment: 'production',
      commerceAllowed: false,
      reason: 'RELEASED_PRODUCT_PURCHASE_FLOW_UNVERIFIED',
      product: {
        id: 'hoodie',
        title: 'Released Hoodie',
        price: 128,
        currency: 'USD',
        availableForSale: true,
        variantPresentation,
        media: [],
        story: 'Outer pending release story',
      },
    });

    expect(model).toMatchObject({
      sourceLabel: 'Shopify Storefront observation — released product facts',
      truthHeading: 'Reviewed facts, released product.',
      story: 'No reviewed product story is available.',
      commerceExplanation: 'Product facts are released. Purchasing remains disabled until the separate cart and checkout gates are proven.',
    });
    expect(JSON.stringify(model)).not.toContain('approval pending');
    expect(JSON.stringify(model)).not.toContain('unresolved release');
    expect(JSON.stringify(model)).not.toContain('Outer pending release story');
  });

  it('returns null for an unavailable decision', () => {
    expect(toProductViewModel({ product: null })).toBeNull();
  });
});

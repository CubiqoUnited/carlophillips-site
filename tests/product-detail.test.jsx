import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CommerceProductDetail, CommerceProductUnavailable } from '../components/commerce/product-detail.jsx';

describe('commerce product presentation', () => {
  it('renders source truth and keeps purchasing disabled', () => {
    const html = renderToStaticMarkup(
      <CommerceProductDetail
        releaseReason="PRIVATE_RELEASE_REVIEW_NON_COMMERCE"
        cartActivation={{
          status: 'blocked',
          reason: 'PRODUCT_OWNER_CART_ACTIVATION_APPROVAL_REQUIRED',
        }}
        product={{
          source: 'shopify',
          sourceLabel: 'Shopify Storefront observation — release approval pending',
          title: 'Observed Hoodie',
          price: 128,
          currency: 'USD',
          description: 'Observed description',
          story: 'Pending release evidence.',
          colors: ['Black'],
          sizes: ['M'],
          availableForSale: true,
          vendor: 'Observed vendor',
          productType: 'Hoodie',
          media: [],
        }}
      />
    );

    expect(html).toContain('Shopify Storefront observation');
    expect(html).toContain('PRIVATE_RELEASE_REVIEW_NON_COMMERCE');
    expect(html).toContain('Purchasing disabled');
    expect(html).toContain('Purchasing remains disabled');
    expect(html).toContain('PRODUCT_OWNER_CART_ACTIVATION_APPROVAL_REQUIRED');
    expect(html).toContain('data-cart-activation="blocked"');
    expect(html).toContain('disabled=""');
  });

  it('renders an honest unavailable state without product content', () => {
    const html = renderToStaticMarkup(<CommerceProductUnavailable decision={{ reason: 'SHOPIFY_REQUEST_FAILED' }} />);
    expect(html).toContain('This product cannot be shown truthfully');
    expect(html).toContain('Static product data has not been substituted');
    expect(html).toContain('SHOPIFY_REQUEST_FAILED');
  });
});

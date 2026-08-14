import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  CommerceProductDetail,
  CommerceProductUnavailable,
} from '../apps/web/src/components/product/ProductInfo/index.tsx';
import { toProductViewModel } from '../apps/web/src/lib/commerce/product-view-model.ts';

const variantPresentation = {
  schemaVersion: 'cp.variant-presentation.v1',
  source: 'reviewed-product-observation',
  variantFingerprint: `sha256:${'a'.repeat(64)}`,
  currency: 'USD',
  selectionAllowed: false,
  cartAuthority: false,
  optionNames: ['Color', 'Size'],
  combinations: [
    {
      referenceHash: `sha256:${'b'.repeat(64)}`,
      title: 'Black / M',
      selectedOptions: [
        { name: 'Color', value: 'Black' },
        { name: 'Size', value: 'M' },
      ],
      availableForSale: true,
      price: { amount: '128.00', currency: 'USD' },
    },
    {
      referenceHash: `sha256:${'c'.repeat(64)}`,
      title: 'Black / L',
      selectedOptions: [
        { name: 'Color', value: 'Black' },
        { name: 'Size', value: 'L' },
      ],
      availableForSale: false,
      price: { amount: '128.00', currency: 'USD' },
    },
  ],
};

describe('commerce product presentation', () => {
  it('renders source truth and keeps purchasing disabled', () => {
    const product = toProductViewModel({
      source: 'shopify',
      environment: 'preview',
      commerceAllowed: false,
      reason: 'PRIVATE_RELEASE_REVIEW_NON_COMMERCE',
      product: {
        id: 'hoodie',
        title: 'Observed Hoodie',
        price: 128,
        currency: 'USD',
        description: 'Observed description',
        story: 'Outer story cannot render',
        variantPresentation,
        availableForSale: true,
        vendor: 'Observed vendor',
        productType: 'Hoodie',
        media: [
          {
            id: 'front-approved',
            type: 'image',
            url: 'https://cdn.example/front-approved.jpg',
            previewUrl: 'https://cdn.example/front-approved.jpg',
            alt: 'Approved front',
            label: 'front',
          },
        ],
        mediaReview: {
          status: 'incomplete',
          coveredModalities: ['front'],
          missingModalities: ['video', 'on-model'],
          missingFallbackCount: 0,
        },
      },
    });
    const html = renderToStaticMarkup(
      <CommerceProductDetail
        releaseReason="PRIVATE_RELEASE_REVIEW_NON_COMMERCE"
        cartActivation={{
          status: 'blocked',
          reason: 'PRODUCT_OWNER_CART_ACTIVATION_APPROVAL_REQUIRED',
        }}
        product={product}
      />
    );

    expect(html).toContain('Private product review');
    expect(html).toContain('private release review');
    expect(html).toContain('Reviewed facts, private release review');
    expect(html).toContain('No reviewed product story is available');
    expect(html).toContain('Observed variant combinations');
    expect(html).toContain('Selection disabled');
    expect(html).toContain('Color: Black · Size: M');
    expect(html).toContain('Available in source');
    expect(html).toContain('Unavailable in source');
    expect(html).toContain('Private product review');
    expect(html).not.toContain('PRIVATE_RELEASE_REVIEW_NON_COMMERCE');
    expect(html).toContain('Purchasing disabled');
    expect(html).toContain('Purchasing remains disabled');
    expect(html).not.toContain(
      'PRODUCT_OWNER_CART_ACTIVATION_APPROVAL_REQUIRED'
    );
    expect(html).toContain('data-cart-activation="blocked"');
    expect(html).toContain('data-media-review="incomplete"');
    expect(html).toContain('Media review incomplete');
    expect(html).toContain('video, on-model');
    expect(html).toContain('disabled=""');
    expect(html).not.toContain('Outer story cannot render');
    expect(html).not.toContain('Add to cart');
    expect(html).not.toContain('Checkout');
    expect(html.toLowerCase()).not.toContain('shopify');
    const controls = html.match(/<button\b[^>]*>/g) || [];
    expect(controls.length).toBe(3);
    expect(controls.every((control) => control.includes('disabled=""'))).toBe(
      true
    );
  });

  it('renders Released production facts without pending or unresolved release copy', () => {
    const product = toProductViewModel({
      source: 'shopify',
      environment: 'production',
      commerceAllowed: false,
      reason: 'RELEASED_PRODUCT_PURCHASE_FLOW_UNVERIFIED',
      product: {
        id: 'hoodie',
        title: 'Released Hoodie',
        price: 128,
        currency: 'USD',
        description: 'Reviewed description',
        story: 'Outer pending approval story',
        variants: { colors: ['Black'], sizes: ['M'] },
        availableForSale: true,
        vendor: 'Reviewed vendor',
        productType: 'Hoodie',
        media: [],
      },
    });
    const html = renderToStaticMarkup(
      <CommerceProductDetail
        releaseReason="RELEASED_PRODUCT_PURCHASE_FLOW_UNVERIFIED"
        product={product}
      />
    );

    expect(html).toContain('Released product facts');
    expect(html).toContain('Reviewed facts, released product');
    expect(html).toContain('Product facts are released');
    expect(html).toContain(
      'Purchasing remains disabled until the separate cart and checkout gates are proven'
    );
    expect(html).not.toContain('release approval pending');
    expect(html).not.toContain('unresolved release');
    expect(html).not.toContain('Outer pending approval story');
  });

  it('does not render checkout when canonical commerce authority remains false', () => {
    const product = toProductViewModel({
      source: 'shopify',
      environment: 'production',
      commerceAllowed: false,
      reason: 'RELEASED_PRODUCT_PURCHASE_FLOW_UNVERIFIED',
      product: {
        id: 'hoodie',
        handle: 'approved-hoodie',
        title: 'Live Hoodie',
        price: 128,
        currency: 'USD',
        description: 'Current product description',
        availableForSale: true,
        vendor: 'Provider',
        productType: 'Hoodie',
        variantPresentation,
        media: [],
      },
    });
    const html = renderToStaticMarkup(
      <CommerceProductDetail
        releaseReason="RELEASED_PRODUCT_PURCHASE_FLOW_UNVERIFIED"
        cartActivation={{
          status: 'eligible',
          cartAllowed: true,
          reason: 'CUSTOMER_CART_ELIGIBLE',
        }}
        product={product}
      />
    );
    expect(html).not.toContain('Continue to checkout');
    expect(html).not.toContain('action="/api/checkout"');
    expect(html).toContain('Purchasing disabled');
    expect(html).toContain('Product facts are released');
    expect(html).not.toContain('gid://');
  });

  it('renders an honest unavailable state without product content', () => {
    const html = renderToStaticMarkup(
      <CommerceProductUnavailable
        decision={{ reason: 'SHOPIFY_REQUEST_FAILED' }}
      />
    );
    expect(html).toContain('This piece is currently unavailable');
    expect(html).toContain('Return to the collection');
    expect(html).toContain('data-unavailable-reason="unavailable"');
    expect(html).not.toContain('SHOPIFY_REQUEST_FAILED');
    expect(html).not.toContain('Reason:');
  });

  it('does not attach candidate studies to the active PDP in any environment', () => {
    const product = toProductViewModel({
      source: 'shopify',
      environment: 'preview',
      commerceAllowed: false,
      reason: 'PRIVATE_RELEASE_REVIEW_NON_COMMERCE',
      product: {
        id: 'hoodie',
        handle: 'carlophillips-signature-hoodie',
        title: 'Signature Hoodie',
        price: 128,
        currency: 'USD',
        description: 'Observed description',
        availableForSale: true,
        vendor: 'Apliiq',
        productType: 'Hoodie',
        media: [],
      },
    });
    const previewHtml = renderToStaticMarkup(
      <CommerceProductDetail environment="preview" product={product} />
    );
    const productionHtml = renderToStaticMarkup(
      <CommerceProductDetail environment="production" product={product} />
    );

    for (const html of [previewHtml, productionHtml]) {
      expect(html).not.toContain('data-editorial-study');
      expect(html).not.toContain('/candidates/moda/');
      expect(html).not.toContain('/candidates/ai-assisted/');
      expect(html).not.toContain('still-derived-motion-study');
    }
  });

  it('does not attach the Hoodie editorial study to other Preview products', () => {
    const html = renderToStaticMarkup(
      <CommerceProductDetail
        environment="preview"
        product={{
          handle: 'another-product',
          title: 'Another Product',
          price: 100,
          currency: 'USD',
          description: '',
          sourceLabel: 'Shopify Storefront observation',
          commerceAllowed: false,
          availableForSale: false,
          vendor: '',
          productType: '',
          media: [],
          mediaReview: null,
          colors: [],
          sizes: [],
          truthHeading: '',
          story: '',
        }}
      />
    );

    expect(html).not.toContain('data-editorial-study');
  });
});

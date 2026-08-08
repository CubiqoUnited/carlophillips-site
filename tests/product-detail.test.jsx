import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CommerceProductDetail, CommerceProductUnavailable } from '../components/commerce/product-detail.jsx';
import { toProductViewModel } from '../lib/commerce/product-view-model.js';

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
        media: [{
          id: 'front-approved',
          type: 'image',
          url: 'https://cdn.example/front-approved.jpg',
          previewUrl: 'https://cdn.example/front-approved.jpg',
          alt: 'Approved front',
          label: 'front',
        }],
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

    expect(html).toContain('Shopify Storefront observation');
    expect(html).toContain('private release review');
    expect(html).toContain('Reviewed facts, private release review');
    expect(html).toContain('No reviewed product story is available');
    expect(html).toContain('Observed variant combinations');
    expect(html).toContain('Selection disabled');
    expect(html).toContain('Color: Black · Size: M');
    expect(html).toContain('Available in source');
    expect(html).toContain('Unavailable in source');
    expect(html).toContain('PRIVATE_RELEASE_REVIEW_NON_COMMERCE');
    expect(html).toContain('Purchasing disabled');
    expect(html).toContain('Purchasing remains disabled');
    expect(html).not.toContain('PRODUCT_OWNER_CART_ACTIVATION_APPROVAL_REQUIRED');
    expect(html).toContain('data-cart-activation="blocked"');
    expect(html).toContain('data-media-review="incomplete"');
    expect(html).toContain('Private media review incomplete');
    expect(html).toContain('video, on-model');
    expect(html).toContain('disabled=""');
    expect(html).not.toContain('Outer story cannot render');
    expect(html).not.toContain('Add to cart');
    expect(html).not.toContain('Checkout');
    const controls = html.match(/<button\b[^>]*>/g) || [];
    expect(controls.length).toBe(3);
    expect(controls.every(control => control.includes('disabled=""'))).toBe(true);
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

    expect(html).toContain('released product facts');
    expect(html).toContain('Reviewed facts, released product');
    expect(html).toContain('Product facts are released');
    expect(html).toContain('Purchasing remains disabled until the separate cart and checkout gates are proven');
    expect(html).not.toContain('release approval pending');
    expect(html).not.toContain('unresolved release');
    expect(html).not.toContain('Outer pending approval story');
  });

  it('renders an active Shopify checkout form only for an eligible launch', () => {
    const product = toProductViewModel({
      source: 'shopify',
      environment: 'production',
      commerceAllowed: true,
      reason: 'SINGLE_PRODUCT_COMMERCE_LAUNCH_APPROVED',
      product: {
        id: 'hoodie', handle: 'approved-hoodie', title: 'Live Hoodie', price: 128, currency: 'USD',
        description: 'Current Shopify description', availableForSale: true, vendor: 'Provider', productType: 'Hoodie',
        variantPresentation, media: [],
      },
    });
    const html = renderToStaticMarkup(<CommerceProductDetail
      releaseReason="SINGLE_PRODUCT_COMMERCE_LAUNCH_APPROVED"
      cartActivation={{ status: 'eligible', cartAllowed: true, reason: 'CUSTOMER_CART_ELIGIBLE' }}
      product={product}
    />);
    expect(html).toContain('Buy with Shopify');
    expect(html).toContain('action="/api/checkout"');
    expect(html).toContain('Signature Series / 001');
    expect(html).toContain('Made to be lived in.');
    expect(html).toContain('Securely through Shopify');
    expect(html).not.toContain('Shopify Storefront — live product');
    expect(html).not.toContain('Purchasing disabled');
    expect(html).not.toContain('release state unavailable');
    expect(html).not.toContain('Cart gate: CUSTOMER_CART_ELIGIBLE');
    expect(html).not.toContain('gid://');
  });

  it('renders an honest unavailable state without product content', () => {
    const html = renderToStaticMarkup(<CommerceProductUnavailable decision={{ reason: 'SHOPIFY_REQUEST_FAILED' }} />);
    expect(html).toContain('This piece is currently unavailable');
    expect(html).toContain('Return to the collection');
    expect(html).toContain('data-unavailable-reason="SHOPIFY_REQUEST_FAILED"');
    expect(html).not.toContain('Reason:');
  });

  it('renders the disclosed Signature Hoodie editorial study only in Preview', () => {
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

    expect(previewHtml).toContain('data-editorial-study="ai-assisted-preview"');
    expect(previewHtml).toContain('Digital editorial study / 01');
    expect(previewHtml).toContain('AI-assisted on-body, material and product visualisations');
    expect(previewHtml).toContain('on-model-front-study.png');
    expect(previewHtml).toContain('material-embroidery-study.png');
    expect(previewHtml).toContain('editorial-01.jpg');
    expect(previewHtml).toContain('editorial-02.jpg');
    expect(previewHtml).not.toContain('embroidery-detail-quarantined');
    expect(productionHtml).not.toContain('data-editorial-study');
    expect(productionHtml).not.toContain('editorial-01.jpg');
    expect(productionHtml).not.toContain('editorial-02.jpg');
    expect(productionHtml).not.toContain('on-model-front-study.png');
    expect(productionHtml).not.toContain('material-embroidery-study.png');
  });

  it('does not attach the Hoodie editorial study to other Preview products', () => {
    const html = renderToStaticMarkup(
      <CommerceProductDetail
        environment="preview"
        product={{
          handle: 'another-product', title: 'Another Product', price: 100, currency: 'USD', description: '',
          sourceLabel: 'Shopify Storefront observation', commerceAllowed: false, availableForSale: false,
          vendor: '', productType: '', media: [], mediaReview: null, colors: [], sizes: [], truthHeading: '', story: '',
        }}
      />
    );

    expect(html).not.toContain('data-editorial-study');
  });
});

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CommerceBagState } from '../components/commerce/bag-state';

function render(status, source, environment = 'local') {
  return renderToStaticMarkup(
    <CommerceBagState decision={{
      status,
      source,
      environment,
      commerceAllowed: false,
      checkoutAllowed: false,
      reason: 'TEST_REASON',
      cart: null,
    }} />
  );
}

describe('CommerceBagState', () => {
  it('labels local preview as non-commerce and checkout-disabled', () => {
    const html = render('local_preview', 'fixture');
    expect(html).toContain('data-bag-status="local_preview"');
    expect(html).toContain('Local non-commerce preview');
    expect(html).toContain('No live cart, checkout, payment, or order exists.');
    expect(html).toContain('Checkout');
    expect(html).toContain('Disabled');
    expect(html.toLowerCase()).not.toContain('shopify');
  });

  it('renders an honest unavailable state without claiming an empty Shopify cart', () => {
    const html = render('unavailable', 'unavailable', 'preview');
    expect(html).toContain('data-commerce-source="unavailable"');
    expect(html).toContain('The bag cannot be opened safely.');
    expect(html).toContain('No local cart has been substituted.');
    expect(html).not.toContain('Your bag is empty.');
    expect(html.toLowerCase()).not.toContain('shopify');
  });
});

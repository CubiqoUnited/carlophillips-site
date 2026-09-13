import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import CheckoutConfirmPage from '../apps/web/src/app/checkout/confirm/page.tsx';

describe('checkout confirmation boundary', () => {
  it('does not imply that a Shopify order was created', () => {
    const html = renderToStaticMarkup(<CheckoutConfirmPage />);

    expect(html).toContain('This page does not create or confirm an order.');
    expect(html).toContain('href="/aftercare"');
    expect(html).not.toContain('Checkout rehearsal complete');
    expect(html).not.toContain('href="/admin/orders"');
  });
});

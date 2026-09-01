import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  EMAIL_PALETTE,
  renderOrderConfirmationEmail,
} from '../lib/email/order-confirmation-email.js';

/*
 * Screen 12 — Confirmation Email. A transactional email cannot load the stylesheet, so its palette
 * is restated as literals. These tests bind those literals back to the canonical primitives so the
 * email cannot drift into a second theme, and check that customer values are escaped.
 */
const tokens = readFileSync('app/design-tokens.css', 'utf8');

function primitive(name) {
  return tokens
    .match(new RegExp(`--cp-primitive-${name}:\\s*([^;]+);`))?.[1]
    ?.trim();
}

const order = {
  orderReference: 'CP-20482',
  currency: 'EUR',
  lines: [
    {
      title: 'ONE',
      size: 'M',
      color: 'Black',
      quantity: 1,
      unitPrice: 180,
      currency: 'EUR',
    },
    {
      title: 'ONE',
      size: 'L',
      color: 'Black',
      quantity: 2,
      unitPrice: 180,
      currency: 'EUR',
    },
  ],
  subtotal: 540,
  shipping: 12,
  total: 552,
  shippingAddress: {
    name: 'A Customer',
    address: 'Street 1',
    postalCode: '0150',
    city: 'Oslo',
    country: 'Norway',
  },
};

describe('order confirmation email', () => {
  it('binds its palette to the canonical colour primitives', () => {
    expect(EMAIL_PALETTE.canvas).toBe(primitive('color-neutral-025'));
    expect(EMAIL_PALETTE.panel).toBe(primitive('color-neutral-050'));
    expect(EMAIL_PALETTE.ink).toBe(primitive('color-neutral-1000'));
    expect(EMAIL_PALETTE.copy).toContain('255,255,255');
    expect(EMAIL_PALETTE.rule).toContain('0.10');
  });

  it('renders the workbook composition with totals, address and the order actions', () => {
    const html = renderOrderConfirmationEmail(order);

    expect(html).toContain('CARLOPHILLIPS');
    expect(html).toContain('Order #CP-20482 is confirmed');
    expect(html).toContain('Order summary');
    expect(html).toContain('Size M · Black · Qty 1');
    expect(html).toContain('Size L · Black · Qty 2');
    expect(html).toContain('View your order');
    expect(html).toContain('Track order');
    expect(html).toContain('Contact support');
    expect(html).toContain('Returns');
    expect(html).toContain('Oslo');
    expect(html).toContain('3–5 business days');
    expect(html).toContain('/track?order=CP-20482');
  });

  it('escapes customer-supplied values rather than interpolating markup', () => {
    const html = renderOrderConfirmationEmail({
      ...order,
      lines: [{ ...order.lines[0], title: '<script>alert(1)</script>' }],
      shippingAddress: {
        ...order.shippingAddress,
        name: 'A "quoted" & <b>bold</b> name',
      },
    });

    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('&quot;quoted&quot; &amp; &lt;b&gt;bold&lt;/b&gt;');
  });
});

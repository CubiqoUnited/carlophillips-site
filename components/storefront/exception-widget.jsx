'use client';

import Link from 'next/link';
import React from 'react';

/*
 * Appendix exception states.
 *
 * The workbook defines ten visual reference states that must exist before a product video, gallery,
 * variant, cart, discount, address, shipping option, payment, session or shipment can be presented
 * as unavailable. They share one widget: a bordered panel marked EXCEPTION, a title, one or two
 * lines of plain copy, and at most two recovery actions. The copy is fixed here so a call site
 * cannot quietly reword a failure.
 */
export const EXCEPTION_STATES = Object.freeze({
  videoUnavailable: {
    id: 'video-unavailable',
    title: 'Video unavailable',
    lines: ['The selected product video could not be loaded.', 'Product details and gallery remain available.'],
  },
  galleryUnavailable: {
    id: 'gallery-unavailable',
    title: 'Gallery unavailable',
    lines: ['No approved gallery media is currently available', 'for this product.'],
  },
  sizeUnavailable: {
    id: 'size-unavailable',
    title: 'Selected size unavailable',
    lines: ['This variant is no longer available.', 'Choose another size to continue.'],
  },
  bagEmpty: {
    id: 'bag-empty',
    title: 'Your bag is empty',
    lines: ['Add a product to continue to checkout.', 'Your saved discovery context remains available.'],
  },
  discountRejected: {
    id: 'discount-rejected',
    title: 'Discount code not recognised',
    lines: ['The code could not be applied.', 'Your cart total has not changed.'],
  },
  shippingDetailsIncomplete: {
    id: 'shipping-details-incomplete',
    title: 'Review shipping details',
    lines: ['Enter a valid email and complete the required', 'shipping address fields before payment.'],
  },
  shippingUnavailable: {
    id: 'shipping-unavailable',
    title: 'Shipping unavailable',
    lines: ['No shipping option is available for this address.', 'Edit the address or return to your bag.'],
  },
  paymentIncomplete: {
    id: 'payment-incomplete',
    title: 'Payment could not be completed',
    lines: ['No payment was taken. Your cart and shipping', 'details remain available for another attempt.'],
  },
  checkoutExpired: {
    id: 'checkout-expired',
    title: 'Checkout expired',
    lines: ['The checkout session has expired.', 'Return to your bag to restart safely.'],
  },
  trackingPending: {
    id: 'tracking-pending',
    title: 'Tracking pending',
    lines: ['Your order is confirmed. Tracking will appear', 'when the shipment is handed to the carrier.'],
  },
});

function ExceptionAction({ action }) {
  const className = action.emphasis === 'solid'
    ? 'cp-exception-action cp-exception-action-solid'
    : 'cp-exception-action';
  if (action.href) return <Link href={action.href} className={className}>{action.label}</Link>;
  return <button type="button" onClick={action.onAction} className={className}>{action.label}</button>;
}

export function ExceptionWidget({ actions = [], inline = false, state, titleId }) {
  if (!state) return null;
  return (
    <section
      role="alert"
      data-exception-state={state.id}
      className={inline ? 'cp-exception-widget cp-exception-widget-inline' : 'cp-exception-widget'}
    >
      <div className="cp-exception-bar">
        <span className="cp-exception-mark">CARLOPHILLIPS</span>
        <span className="cp-exception-tag">Exception</span>
      </div>
      <div className="cp-exception-body">
        <h2 id={titleId} className="cp-exception-title">{state.title}</h2>
        {state.lines.map(line => <p key={line} className="cp-exception-copy">{line}</p>)}
        {actions.length > 0 && (
          <div className="cp-exception-actions">
            {actions.map(action => <ExceptionAction key={action.label} action={action} />)}
          </div>
        )}
      </div>
    </section>
  );
}

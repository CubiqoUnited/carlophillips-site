'use client';

import Link from 'next/link';
import React from 'react';
import { Check } from 'lucide-react';
import { bagTotals } from '../../lib/commerce/client-bag.js';
import { ORDER_TRACKING_STAGES } from '../../lib/operations/order-tracking.js';
import { EXCEPTION_STATES, ExceptionWidget } from '../storefront/exception-widget.jsx';
import { SiteHeader } from '../storefront/site-navigation.jsx';
import { useClientBag } from './bag-store.jsx';
import { money } from './shopify-checkout-form.jsx';

/*
 * Screens 11 / 27 — Order Confirmation and Order Tracking.
 *
 * Both are reached with an order reference returned by the secure checkout. Without that reference
 * neither screen invents one: the confirmation says the reference could not be read and offers
 * support, and tracking shows the appendix "Tracking pending" state. Only the reference and the
 * bag snapshot the visitor's own browser holds are ever displayed.
 */

export function OrderConfirmation({ orderReference }) {
  const { bag, hydrated } = useClientBag();
  const totals = bagTotals(bag);

  if (!orderReference) {
    return (
      <main id="main-content" className="cp-outcome-page">
        <SiteHeader onMenu={() => {}} />
        <div className="cp-outcome-shell cp-page-shell">
          <ExceptionWidget
            state={EXCEPTION_STATES.trackingPending}
            actions={[
              { label: 'Contact support', emphasis: 'solid', href: '/contact' },
              { label: 'Continue shopping', href: '/' },
            ]}
          />
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="cp-outcome-page">
      <SiteHeader onMenu={() => {}} />
      <div className="cp-outcome-shell cp-page-shell">
        <span className="cp-outcome-mark" aria-hidden="true">
          <Check className="cp-icon cp-icon-medium" />
        </span>
        <p className="cp-eyebrow">Thank you</p>
        <h1 className="cp-outcome-title">Your order is confirmed</h1>
        <p className="cp-outcome-copy">
          A confirmation has been sent to your email. We will notify you again the moment it ships.
        </p>
        <Link href={`/track?order=${encodeURIComponent(orderReference)}`} className="cp-action cp-action-outline cp-outcome-reference">
          Order #{orderReference}
        </Link>

        {hydrated && bag.lines.length > 0 && (
          <section className="cp-outcome-summary" aria-label="Order summary">
            <h2 className="cp-outcome-summary-title">Order summary</h2>
            <ul className="cp-outcome-summary-lines">
              {bag.lines.map(line => (
                <li key={`${line.handle}-${line.size}`} className="cp-outcome-summary-line">
                  <span className="cp-outcome-summary-body">
                    <span className="cp-outcome-summary-name">{line.title}</span>
                    <span className="cp-outcome-summary-meta">Size {line.size} · {line.color} · Qty {line.quantity}</span>
                  </span>
                  <span className="cp-outcome-summary-price">{money(line.unitPrice * line.quantity, line.currency)}</span>
                </li>
              ))}
            </ul>
            <dl className="cp-cart-totals">
              <div className="cp-cart-total-row">
                <dt>Subtotal</dt>
                <dd>{money(totals.subtotal, totals.currency)}</dd>
              </div>
              <div className="cp-cart-total-row cp-cart-total-row-final">
                <dt>Total</dt>
                <dd>{money(totals.total, totals.currency)}</dd>
              </div>
            </dl>
          </section>
        )}

        <div className="cp-outcome-actions">
          <Link href="/" className="cp-action cp-action-solid cp-outcome-action">Continue shopping</Link>
          <Link href="/contact" className="cp-action cp-action-outline cp-outcome-action">Contact support</Link>
        </div>
      </div>
    </main>
  );
}

export function OrderTracking({ orderReference, stages = ORDER_TRACKING_STAGES }) {
  return (
    <main id="main-content" className="cp-outcome-page">
      <SiteHeader onMenu={() => {}} />
      <div className="cp-outcome-shell cp-page-shell">
        <p className="cp-eyebrow">Track order</p>
        <h1 className="cp-outcome-title">{orderReference ? `Order ${orderReference}` : 'Order tracking'}</h1>

        {orderReference ? (
          <>
            <ol className="cp-tracking-timeline">
              {stages.map(stage => (
                <li key={stage.id} className="cp-tracking-stage" data-tracking-state={stage.recorded ? 'recorded' : 'pending'}>
                  <span className="cp-tracking-stage-mark" aria-hidden="true" />
                  <span className="cp-tracking-stage-label">{stage.label}</span>
                  <span className="cp-tracking-stage-status">{stage.recorded ? 'Recorded' : 'Pending update'}</span>
                </li>
              ))}
            </ol>
            <ExceptionWidget
              state={EXCEPTION_STATES.trackingPending}
              actions={[{ label: 'Contact support', emphasis: 'solid', href: '/contact' }]}
            />
          </>
        ) : (
          <ExceptionWidget
            state={EXCEPTION_STATES.trackingPending}
            actions={[
              { label: 'Contact support', emphasis: 'solid', href: '/contact' },
              { label: 'Continue shopping', href: '/' },
            ]}
          />
        )}
      </div>
    </main>
  );
}

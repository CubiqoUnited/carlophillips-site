'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { Lock } from 'lucide-react';
import shippingConfig from '../../config/storefront-shipping.json';
import { DISCOUNT_STATUS, bagTotals } from '../../lib/commerce/client-bag.js';
import { designSystemRuntimeContract } from '../../lib/design-system/runtime-contract.js';
import { EXCEPTION_STATES, ExceptionWidget } from '../storefront/exception-widget.jsx';
import { SiteHeader } from '../storefront/site-navigation.jsx';
import { useClientBag } from './bag-store.jsx';
import { money } from './shopify-checkout-form.jsx';

/*
 * Screens 10 / 14 / 15 / 25 — Checkout and its recovery states.
 *
 * The page owns contact and shipping capture and the order summary. It never owns payment: card
 * details are entered in the secure hosted payment step, which is also where rates, tax and the
 * order itself are decided. The card row below the notice is a disabled preview of that step, so
 * the composition matches the mock without ever presenting a field that could take a card number.
 */
const CHECKOUT_STEPS = Object.freeze([
  Object.freeze({ id: 'information', label: 'Information' }),
  Object.freeze({ id: 'shipping-payment', label: 'Shipping & payment' }),
  Object.freeze({ id: 'confirmation', label: 'Confirmation' }),
]);

const PAYMENT_METHODS = Object.freeze(['Visa', 'Mastercard', 'Amex', 'Apple Pay']);

function Field({ autoComplete, id, label, onChange, placeholder, required = false, type = 'text', value }) {
  return (
    <div className="cp-field">
      <label htmlFor={id} className="cp-field-label">{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        onChange={event => onChange(event.target.value)}
        className="cp-field-input"
      />
    </div>
  );
}

function CheckoutSteps({ activeId }) {
  return (
    <nav className="cp-checkout-steps" aria-label="Checkout progress">
      <ol className="cp-checkout-step-list">
        {CHECKOUT_STEPS.map((step, index) => (
          <li key={step.id} className={step.id === activeId ? 'cp-checkout-step cp-checkout-step-active' : 'cp-checkout-step'}>
            <span className="cp-checkout-step-index" aria-hidden="true">{index + 1}</span>
            <span>{step.label}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function CheckoutSummary({ bag }) {
  const totals = bagTotals(bag);
  return (
    <aside className="cp-checkout-summary" aria-label="Order summary">
      <h2 className="cp-checkout-summary-title">Order summary</h2>
      <ul className="cp-checkout-summary-lines">
        {bag.lines.map(line => (
          <li key={`${line.handle}-${line.size}`} className="cp-checkout-summary-line">
            <span className="cp-checkout-summary-media">
              {line.imageUrl && (
                <Image
                  src={line.imageUrl}
                  alt={line.imageAlt}
                  fill
                  sizes={designSystemRuntimeContract.imageSizes.discoveryThumb}
                  className="cp-checkout-summary-image"
                />
              )}
              <span className="cp-checkout-summary-quantity">{line.quantity}</span>
            </span>
            <span className="cp-checkout-summary-body">
              <span className="cp-checkout-summary-name">{line.title}</span>
              <span className="cp-checkout-summary-meta">Size {line.size} · {line.color}</span>
            </span>
            <span className="cp-checkout-summary-price">{money(line.unitPrice * line.quantity, line.currency)}</span>
          </li>
        ))}
      </ul>
      <dl className="cp-cart-totals">
        <div className="cp-cart-total-row">
          <dt>Subtotal</dt>
          <dd>{money(totals.subtotal, totals.currency)}</dd>
        </div>
        {bag.discount.status === DISCOUNT_STATUS.applied && (
          <div className="cp-cart-total-row">
            <dt>Discount {bag.discount.code}</dt>
            <dd>−{money(totals.discountAmount, totals.currency)}</dd>
          </div>
        )}
        <div className="cp-cart-total-row">
          <dt>Shipping</dt>
          <dd>Calculated at payment</dd>
        </div>
        <div className="cp-cart-total-row">
          <dt>Tax</dt>
          <dd>Included</dd>
        </div>
        <div className="cp-cart-total-row cp-cart-total-row-final">
          <dt>Total</dt>
          <dd>{money(totals.total, totals.currency)}</dd>
        </div>
      </dl>
    </aside>
  );
}

function CheckoutRecovery({ actions, state, title }) {
  return (
    <div className="cp-checkout-recovery">
      <h1 className="cp-checkout-recovery-title">{title}</h1>
      <ExceptionWidget state={state} actions={actions} />
    </div>
  );
}

export function CheckoutExperience({ initialStatus = 'editing' }) {
  const { bag, hydrated } = useClientBag();
  const [status, setStatus] = useState(initialStatus);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState(shippingConfig.servedCountries[0].code);
  const [phone, setPhone] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  const served = useMemo(
    () => shippingConfig.servedCountries.some(entry => entry.code === country),
    [country]
  );
  const complete = Boolean(
    /.+@.+\..+/.test(email) && firstName.trim() && lastName.trim() && address.trim() && city.trim() && postalCode.trim()
  );
  const primaryLine = bag.lines[0] || null;

  if (status === 'expired') {
    return (
      <main id="main-content" className="cp-checkout-page">
        <SiteHeader onMenu={() => {}} />
        <CheckoutRecovery
          title="Your checkout expired"
          state={EXCEPTION_STATES.checkoutExpired}
          actions={[
            { label: 'Start new checkout', emphasis: 'solid', onAction: () => setStatus('editing') },
            { label: 'Return to bag', href: '/bag' },
            { label: 'Contact support', href: '/contact' },
          ]}
        />
      </main>
    );
  }

  if (status === 'payment-failed') {
    return (
      <main id="main-content" className="cp-checkout-page">
        <SiteHeader onMenu={() => {}} />
        <CheckoutRecovery
          title="Payment could not be completed"
          state={EXCEPTION_STATES.paymentIncomplete}
          actions={[
            { label: 'Try another payment method', emphasis: 'solid', onAction: () => setStatus('editing') },
            { label: 'Return to bag', href: '/bag' },
            { label: 'Contact support', href: '/contact' },
          ]}
        />
      </main>
    );
  }

  return (
    <main id="main-content" className="cp-checkout-page" data-checkout-status={status}>
      <SiteHeader onMenu={() => {}} />
      <CheckoutSteps activeId="shipping-payment" />

      {hydrated && bag.lines.length === 0 ? (
        <div className="cp-checkout-recovery">
          <ExceptionWidget
            state={EXCEPTION_STATES.bagEmpty}
            actions={[{ label: 'Continue shopping', emphasis: 'solid', href: '/' }]}
          />
        </div>
      ) : (
        <div className="cp-checkout-grid cp-page-shell">
          <form
            method="post"
            action="/api/checkout"
            className="cp-checkout-form"
            onSubmit={event => {
              if (!complete || !served || !primaryLine) {
                event.preventDefault();
                setShowValidation(true);
                return;
              }
              setStatus('processing');
            }}
          >
            <section className="cp-checkout-section" aria-labelledby="checkout-contact">
              <h2 id="checkout-contact" className="cp-checkout-section-title">Contact</h2>
              <Field id="email" label="Email" type="email" autoComplete="email" placeholder="you@email.com" required value={email} onChange={setEmail} />
            </section>

            <section className="cp-checkout-section" aria-labelledby="checkout-shipping">
              <h2 id="checkout-shipping" className="cp-checkout-section-title">Shipping address</h2>
              <div className="cp-field-row">
                <Field id="first-name" label="First name" autoComplete="given-name" placeholder="First name" required value={firstName} onChange={setFirstName} />
                <Field id="last-name" label="Last name" autoComplete="family-name" placeholder="Last name" required value={lastName} onChange={setLastName} />
              </div>
              <Field id="address" label="Address" autoComplete="street-address" placeholder="Street address" required value={address} onChange={setAddress} />
              <div className="cp-field-row">
                <Field id="city" label="City" autoComplete="address-level2" placeholder="City" required value={city} onChange={setCity} />
                <Field id="postal-code" label="Postal code" autoComplete="postal-code" placeholder="Postal code" required value={postalCode} onChange={setPostalCode} />
              </div>
              <div className="cp-field-row">
                <div className="cp-field">
                  <label htmlFor="country" className="cp-field-label">Country</label>
                  <select
                    id="country"
                    name="country"
                    value={country}
                    onChange={event => setCountry(event.target.value)}
                    className="cp-field-input cp-field-select"
                  >
                    {[...shippingConfig.servedCountries, ...shippingConfig.unservedCountries].map(entry => (
                      <option key={entry.code} value={entry.code}>{entry.label}</option>
                    ))}
                  </select>
                </div>
                <Field id="phone" label="Phone" type="tel" autoComplete="tel" placeholder="Phone number" value={phone} onChange={setPhone} />
              </div>
              {!served && <ExceptionWidget inline state={EXCEPTION_STATES.shippingUnavailable} />}
              {showValidation && !complete && <ExceptionWidget inline state={EXCEPTION_STATES.shippingDetailsIncomplete} />}
            </section>

            <section className="cp-checkout-section" aria-labelledby="checkout-payment">
              <h2 id="checkout-payment" className="cp-checkout-section-title">Payment</h2>
              <p className="cp-checkout-notice">
                <Lock className="cp-icon cp-icon-small" aria-hidden="true" />
                <span>
                  <strong>Handled by the secure hosted checkout.</strong> Card details are entered directly into
                  the payment provider&rsquo;s PCI-compliant fields and are never captured by this page.
                </span>
              </p>
              <ul className="cp-payment-methods" aria-label="Accepted payment methods">
                {PAYMENT_METHODS.map(method => <li key={method} className="cp-payment-method">{method}</li>)}
              </ul>
              <div className="cp-payment-preview" aria-hidden="true">
                <span className="cp-payment-preview-row">Card number</span>
                <span className="cp-payment-preview-row">Expiry</span>
                <span className="cp-payment-preview-row">CVC</span>
              </div>
              <p className="cp-checkout-explanation">These fields open in the secure payment step after you continue.</p>
            </section>

            {primaryLine && (
              <>
                <input type="hidden" name="handle" value={primaryLine.handle} />
                <input type="hidden" name="referenceHash" value={primaryLine.referenceHash} />
                <input type="hidden" name="quantity" value={primaryLine.quantity} />
              </>
            )}
            {bag.lines.length > 1 && (
              <p className="cp-checkout-explanation">
                This release completes one variant per secure checkout. Complete this order, then return to your
                bag for the remaining lines.
              </p>
            )}

            <div className="cp-checkout-actions">
              <button type="submit" disabled={status === 'processing'} className="cp-action cp-action-solid cp-checkout-pay">
                {status === 'processing' ? 'Payment in progress' : 'Pay'}
              </button>
              <Link href="/bag" className="cp-action cp-action-outline cp-checkout-return">Return to bag</Link>
            </div>
            {status === 'processing' && (
              <p className="cp-checkout-processing" role="status" aria-live="assertive">
                <strong>Processing payment</strong>
                <span>Please do not close or refresh this page.</span>
              </p>
            )}
          </form>

          <CheckoutSummary bag={bag} />
        </div>
      )}
    </main>
  );
}

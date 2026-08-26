'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useRef, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import discountConfig from '../../config/storefront-discounts.json';
import { DISCOUNT_STATUS, bagLineKey, bagTotals } from '../../lib/commerce/client-bag.js';
import { designSystemRuntimeContract } from '../../lib/design-system/runtime-contract.js';
import { EXCEPTION_STATES, ExceptionWidget } from '../storefront/exception-widget.jsx';
import { useDialogLifecycle } from '../storefront/dialog-lifecycle.js';
import { money } from './shopify-checkout-form.jsx';

/*
 * Screens 09 / 23 / 24 / 30 — Cart.
 *
 * The drawer carries the whole bag, not just the last thing added: quantity, remove, discount
 * capture, subtotal, the shipping line that defers to checkout, total, and the proceed action. The
 * empty state and the discount rejection are the appendix widgets rather than bespoke copy, and the
 * optional CP recognition block is present but never blocks guest checkout.
 */

export function AddedToBagWidget({ line, onContinue, onViewBag, open }) {
  if (!open || !line) return null;
  return (
    <div className="cp-added-widget" role="status" aria-live="polite">
      <p className="cp-added-widget-title">Added to bag</p>
      <p className="cp-added-widget-meta">
        {line.title} / Size {line.size} / {money(line.unitPrice, line.currency)}
      </p>
      <button type="button" onClick={onViewBag} className="cp-action cp-action-solid cp-added-widget-action">View bag</button>
      <button type="button" onClick={onContinue} className="cp-added-widget-quiet">Continue shopping</button>
    </div>
  );
}

function CartLine({ line, lineKey, onRemove, onQuantity }) {
  return (
    <li className="cp-cart-line">
      <span className="cp-cart-line-media">
        {line.imageUrl && (
          <Image
            src={line.imageUrl}
            alt={line.imageAlt}
            fill
            sizes={designSystemRuntimeContract.imageSizes.discoveryThumb}
            className="cp-cart-line-image"
          />
        )}
      </span>
      <div className="cp-cart-line-body">
        <p className="cp-cart-line-title">{line.title}</p>
        <p className="cp-cart-line-meta">Size {line.size} · Color: {line.color}</p>
        <div className="cp-quantity-control" aria-label={`Quantity for ${line.title}, size ${line.size}`}>
          <button type="button" onClick={() => onQuantity(lineKey, line.quantity - 1)} aria-label="Decrease quantity">
            <Minus className="cp-icon cp-icon-small" />
          </button>
          <span>{line.quantity}</span>
          <button type="button" onClick={() => onQuantity(lineKey, line.quantity + 1)} aria-label="Increase quantity">
            <Plus className="cp-icon cp-icon-small" />
          </button>
        </div>
        <button type="button" onClick={() => onRemove(lineKey)} className="cp-cart-line-remove">Remove</button>
      </div>
      <p className="cp-cart-line-price">{money(line.unitPrice * line.quantity, line.currency)}</p>
    </li>
  );
}

export function CartDrawer({
  bag,
  onApplyDiscount,
  onClose,
  onContinue,
  onQuantity,
  onRemove,
  open,
}) {
  const dialogRef = useRef(null);
  const [code, setCode] = useState('');
  const [recognitionEmail, setRecognitionEmail] = useState('');
  const [recognitionSent, setRecognitionSent] = useState(false);
  useDialogLifecycle({ open, onClose, dialogRef });
  if (!open) return null;

  const totals = bagTotals(bag);
  const empty = bag.lines.length === 0;

  return (
    <aside
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      className="cp-side-drawer cp-cart-drawer"
      data-cart-state={empty ? 'empty' : 'filled'}
    >
      <header className="cp-drawer-header">
        <h2 id="cart-drawer-title" className="cp-drawer-title">Your bag ({totals.itemCount})</h2>
        <button type="button" onClick={onClose} className="cp-media-icon-button" aria-label="Close bag">
          <X className="cp-icon cp-icon-medium" />
        </button>
      </header>

      {empty ? (
        <div className="cp-drawer-body cp-cart-empty">
          <ExceptionWidget
            inline
            state={EXCEPTION_STATES.bagEmpty}
            actions={[{ label: 'Continue shopping', emphasis: 'solid', onAction: onContinue }]}
          />
        </div>
      ) : (
        <>
          <ul className="cp-drawer-body cp-cart-lines">
            {bag.lines.map(line => (
              <CartLine
                key={bagLineKey(line)}
                line={line}
                lineKey={bagLineKey(line)}
                onQuantity={onQuantity}
                onRemove={onRemove}
              />
            ))}
          </ul>

          <div className="cp-cart-summary">
            <form
              className="cp-cart-discount"
              onSubmit={event => {
                event.preventDefault();
                onApplyDiscount(code, discountConfig.recognisedCodes);
              }}
            >
              <label htmlFor="cart-discount" className="cp-visually-hidden">Discount code</label>
              <input
                id="cart-discount"
                name="discount"
                value={code}
                onChange={event => setCode(event.target.value)}
                placeholder="Discount code"
                className="cp-field-input cp-cart-discount-input"
              />
              <button type="submit" className="cp-action cp-action-outline cp-cart-discount-apply">Apply</button>
            </form>

            {bag.discount.status === DISCOUNT_STATUS.rejected && (
              <ExceptionWidget inline state={EXCEPTION_STATES.discountRejected} />
            )}

            <dl className="cp-cart-totals">
              <div className="cp-cart-total-row">
                <dt>Subtotal</dt>
                <dd>{money(totals.subtotal, totals.currency)}</dd>
              </div>
              <div className="cp-cart-total-row">
                <dt>Shipping</dt>
                <dd>Calculated at checkout</dd>
              </div>
              <div className="cp-cart-total-row cp-cart-total-row-final">
                <dt>Total</dt>
                <dd>{money(totals.total, totals.currency)}</dd>
              </div>
            </dl>

            <Link href="/checkout" onClick={onClose} className="cp-action cp-action-solid cp-cart-proceed">
              Proceed to checkout
            </Link>
            <p className="cp-cart-assurance">Secure checkout · Taxes included</p>

            <details className="cp-cart-recognition">
              <summary className="cp-cart-recognition-summary">Have a CP account or store credit?</summary>
              <p className="cp-cart-recognition-copy">Enter your email for passwordless recognition.</p>
              <form
                className="cp-cart-recognition-form"
                onSubmit={event => {
                  event.preventDefault();
                  setRecognitionSent(true);
                }}
              >
                <label htmlFor="cart-recognition-email" className="cp-visually-hidden">Email address</label>
                <input
                  id="cart-recognition-email"
                  type="email"
                  value={recognitionEmail}
                  onChange={event => setRecognitionEmail(event.target.value)}
                  placeholder="Email address"
                  className="cp-field-input"
                />
                <button type="submit" className="cp-action cp-action-outline cp-cart-recognition-action">Recognise me</button>
              </form>
              <p className="cp-cart-recognition-note" aria-live="polite">
                {recognitionSent
                  ? 'If that email is recognised, any stored credit is applied in the secure checkout.'
                  : 'Recognition is optional. Continue as guest at any time.'}
              </p>
            </details>
          </div>
        </>
      )}
    </aside>
  );
}

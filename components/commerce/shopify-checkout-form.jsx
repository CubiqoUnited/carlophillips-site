'use client';

import React, { useState } from 'react';
import productOffer from '../../config/shopify-product-offer.json';
import { applyProductOffer } from '../../lib/commerce/product-offer-policy.js';

function money(amount, currency) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(amount));
}

const SIZE_ORDER = new Map(['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL'].map((size, index) => [size, index]));

function sizeFor(item) {
  return item.selectedOptions.find(option => option.name.toLowerCase() === 'size')?.value || item.title;
}

export default function ShopifyCheckoutForm({ handle, presentation }) {
  const offeredPresentation = applyProductOffer(presentation, productOffer, {
    releaseId: productOffer.releaseId,
    handle,
  });
  const available = (offeredPresentation?.combinations || [])
    .filter(item => item.availableForSale)
    .slice()
    .sort((left, right) => (SIZE_ORDER.get(sizeFor(left).toUpperCase()) ?? 999) - (SIZE_ORDER.get(sizeFor(right).toUpperCase()) ?? 999));
  const [referenceHash, setReferenceHash] = useState(available[0]?.referenceHash || '');
  const selected = available.find(item => item.referenceHash === referenceHash);
  if (!available.length) return null;

  return (
    <form method="post" action="/api/checkout" className="cp-variant-list cp-variant-section">
      <input type="hidden" name="handle" value={handle} />
      <label htmlFor="hoodie-variant" className="cp-label cp-checkout-label">Select size</label>
      <select id="hoodie-variant" name="referenceHash" value={referenceHash} onChange={event => setReferenceHash(event.target.value)} className="cp-checkout-select">
        {available.map(item => (
          <option key={item.referenceHash} value={item.referenceHash}>
            {sizeFor(item).toUpperCase()} — {money(item.price.amount, item.price.currency)}
          </option>
        ))}
      </select>
      <input type="hidden" name="quantity" value="1" />
      <button type="submit" disabled={!selected} className="cp-action cp-action-solid cp-checkout-action">
        Continue to checkout — {selected ? money(selected.price.amount, selected.price.currency) : ''}
      </button>
      <p className="cp-text-subtle cp-checkout-explanation">Review delivery and payment before confirming your order. No order is placed until you complete checkout.</p>
    </form>
  );
}

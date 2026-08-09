'use client';

import React, { useState } from 'react';

function money(amount, currency) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(amount));
}

const SIZE_ORDER = new Map(['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL'].map((size, index) => [size, index]));

function sizeFor(item) {
  return item.selectedOptions.find(option => option.name.toLowerCase() === 'size')?.value || item.title;
}

export default function ShopifyCheckoutForm({ handle, presentation }) {
  const available = presentation.combinations
    .filter(item => item.availableForSale)
    .slice()
    .sort((left, right) => (SIZE_ORDER.get(sizeFor(left).toUpperCase()) ?? 999) - (SIZE_ORDER.get(sizeFor(right).toUpperCase()) ?? 999));
  const [referenceHash, setReferenceHash] = useState(available[0]?.referenceHash || '');
  const selected = available.find(item => item.referenceHash === referenceHash);
  if (!available.length) return null;

  return (
    <form method="post" action="/api/checkout" className="cp-variant-list mt-10 pt-7">
      <input type="hidden" name="handle" value={handle} />
      <label htmlFor="hoodie-variant" className="cp-label mb-4 block">Select size</label>
      <select id="hoodie-variant" name="referenceHash" value={referenceHash} onChange={event => setReferenceHash(event.target.value)} className="cp-checkout-select">
        {available.map(item => (
          <option key={item.referenceHash} value={item.referenceHash}>
            {sizeFor(item).toUpperCase()} — {money(item.price.amount, item.price.currency)}
          </option>
        ))}
      </select>
      <input type="hidden" name="quantity" value="1" />
      <button type="submit" disabled={!selected} className="cp-action cp-action-solid mt-4 h-14 w-full disabled:opacity-40">
        Continue to checkout — {selected ? money(selected.price.amount, selected.price.currency) : ''}
      </button>
      <p className="cp-text-subtle mt-4 text-xs leading-relaxed">Review delivery and payment before confirming your order. No order is placed until you complete checkout.</p>
    </form>
  );
}

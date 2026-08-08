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
    <form method="post" action="/api/checkout" className="mt-10 border-t border-white/10 pt-7">
      <input type="hidden" name="handle" value={handle} />
      <label htmlFor="hoodie-variant" className="mb-4 block text-[10px] uppercase tracking-[0.24em] text-white/45">Select size</label>
      <select id="hoodie-variant" name="referenceHash" value={referenceHash} onChange={event => setReferenceHash(event.target.value)} className="h-14 w-full border border-white/20 bg-black px-4 text-sm text-white">
        {available.map(item => (
          <option key={item.referenceHash} value={item.referenceHash}>
            {sizeFor(item).toUpperCase()} — {money(item.price.amount, item.price.currency)}
          </option>
        ))}
      </select>
      <input type="hidden" name="quantity" value="1" />
      <button type="submit" disabled={!selected} className="mt-4 flex h-14 w-full items-center justify-center bg-white text-[10px] font-medium uppercase tracking-[0.24em] text-black disabled:opacity-40">
        Buy with Shopify — {selected ? money(selected.price.amount, selected.price.currency) : ''}
      </button>
      <p className="mt-4 text-xs leading-relaxed text-white/40">Secure checkout and payment are completed on Shopify. No order is placed until you confirm it there.</p>
    </form>
  );
}

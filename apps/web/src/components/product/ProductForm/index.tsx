'use client';

import React, { useState } from 'react';
import type { VariantCombination, VariantPresentation } from '@/types';

function money(amount: string, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

const SIZE_ORDER = new Map<string, number>(
  ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL'].map(
    (size, index) => [size, index] as const
  )
);

function sizeFor(item: VariantCombination): string {
  return (
    item.selectedOptions.find((option) => option.name.toLowerCase() === 'size')
      ?.value || item.title
  );
}

export default function ShopifyCheckoutForm({
  handle,
  presentation,
}: {
  handle: string;
  presentation: VariantPresentation;
}) {
  const available = presentation.combinations
    .filter((item) => item.availableForSale)
    .slice()
    .sort(
      (left, right) =>
        (SIZE_ORDER.get(sizeFor(left).toUpperCase()) ?? 999) -
        (SIZE_ORDER.get(sizeFor(right).toUpperCase()) ?? 999)
    );
  const [referenceHash, setReferenceHash] = useState(
    available[0]?.referenceHash || ''
  );
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const selected = available.find(
    (item) => item.referenceHash === referenceHash
  );
  if (!available.length) return null;

  return (
    <form
      method="post"
      action="/api/checkout"
      className="cp-variant-list mt-10 border-t pt-7"
      onSubmit={(event) => {
        event.preventDefault();
        setBagOpen(true);
      }}
    >
      <input type="hidden" name="handle" value={handle} />
      <label htmlFor="hoodie-variant" className="cp-label mb-4 block">
        Select size
      </label>
      <div
        className="grid grid-cols-3 gap-2"
        role="group"
        aria-label="Select size"
      >
        {available.map((item) => (
          <button
            key={item.referenceHash}
            type="button"
            className={`cp-choice-disabled h-12 text-xs ${
              referenceHash === item.referenceHash ? 'cp-choice-selected' : ''
            }`}
            onClick={() => setReferenceHash(item.referenceHash)}
          >
            {sizeFor(item).toUpperCase()}
          </button>
        ))}
      </div>
      <select
        id="hoodie-variant"
        name="referenceHash"
        value={referenceHash}
        onChange={(event) => setReferenceHash(event.target.value)}
        className="cp-checkout-select"
        aria-label="Selected size"
      >
        {available.map((item) => (
          <option key={item.referenceHash} value={item.referenceHash}>
            {sizeFor(item).toUpperCase()} —{' '}
            {money(item.price.amount, item.price.currency)}
          </option>
        ))}
      </select>
      <input type="hidden" name="quantity" value={quantity} />
      <button
        type="submit"
        disabled={!selected}
        className="cp-action cp-action-solid mt-4 h-14 w-full disabled:opacity-40"
      >
        {selected ? 'ADD TO BAG' : 'SELECT A SIZE'}{' '}
        {selected ? money(selected.price.amount, selected.price.currency) : ''}
      </button>
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <button
          type="button"
          className="underline"
          onClick={() => setSizeGuideOpen(true)}
        >
          Size guide
        </button>
        <span>Shipping & returns available at checkout</span>
      </div>
      {sizeGuideOpen && (
        <div role="dialog" aria-modal="true" className="cp-drawer mt-5 p-5">
          <div className="flex items-center justify-between">
            <strong>Size & fit</strong>
            <button
              type="button"
              onClick={() => setSizeGuideOpen(false)}
              aria-label="Close size guide"
            >
              Close
            </button>
          </div>
          <p className="mt-4 text-sm">
            This piece is designed for a relaxed fit. Measurements and model
            guidance are sourced from the approved product record.
          </p>
          <details className="mt-4">
            <summary className="cursor-pointer">
              Measurements & how to measure
            </summary>
            <p className="mt-3 text-sm">
              Measure chest at the fullest point and keep the tape level.
              Compare against the size information returned by Shopify.
            </p>
          </details>
        </div>
      )}
      {bagOpen && selected && (
        <div role="dialog" aria-modal="true" className="cp-drawer mt-5 p-5">
          <div className="flex items-center justify-between">
            <strong>Added to bag</strong>
            <button
              type="button"
              onClick={() => setBagOpen(false)}
              aria-label="Close bag confirmation"
            >
              Close
            </button>
          </div>
          <p className="mt-4 text-sm">
            {selected.title} · {sizeFor(selected).toUpperCase()}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              type="number"
              min="1"
              max="9"
              value={quantity}
              onChange={(event) =>
                setQuantity(Math.max(1, Number(event.target.value) || 1))
              }
              className="w-16 border p-2"
            />
          </div>
          <div className="mt-5 flex gap-3">
            <a className="cp-action cp-action-solid" href="/bag">
              View bag
            </a>
            <button
              type="button"
              className="cp-action cp-action-outline"
              onClick={() => setBagOpen(false)}
            >
              Continue shopping
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

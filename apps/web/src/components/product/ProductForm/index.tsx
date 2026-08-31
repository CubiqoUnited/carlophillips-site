'use client';

import React, { useState } from 'react';
import productOffer from '../../../../../../config/shopify-product-offer.json';
import type {
  CommerceEnvironment,
  VariantCombination,
  VariantPresentation,
} from '@/types';

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
  environment,
}: {
  handle: string;
  presentation: VariantPresentation;
  environment: CommerceEnvironment;
}) {
  const allowedSizes = new Set(productOffer.allowedSizes);
  const available = (presentation.combinations || [])
    .filter((item) => item.availableForSale && allowedSizes.has(sizeFor(item)))
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
    >
      <input type="hidden" name="handle" value={handle} />
      <label htmlFor="product-variant" className="cp-label mb-4 block">
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
        id="product-variant"
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
        {selected
          ? environment === 'preview'
            ? 'OPEN TEST CHECKOUT'
            : 'CONTINUE TO CHECKOUT'
          : 'SELECT A SIZE'}{' '}
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
            This piece is designed for a relaxed fit. Select the size currently
            offered by Shopify that works best for you.
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
      <div className="mt-4 flex items-center gap-3">
        <label htmlFor="quantity">Quantity</label>
        <input
          id="quantity"
          type="number"
          min="1"
          max="5"
          value={quantity}
          onChange={(event) =>
            setQuantity(
              Math.min(5, Math.max(1, Number(event.target.value) || 1))
            )
          }
          className="w-16 border p-2"
        />
      </div>
      <p className="mt-4 text-xs">
        {environment === 'preview'
          ? 'Private staging uses an isolated Shopify test checkout. Do not enter real customer or payment data.'
          : 'You will review delivery and payment in Shopify before placing the order.'}
      </p>
    </form>
  );
}

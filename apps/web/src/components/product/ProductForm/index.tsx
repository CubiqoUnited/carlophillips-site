'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  sizeGuide,
}: {
  handle: string;
  presentation: VariantPresentation;
  environment: CommerceEnvironment;
  sizeGuide?: string;
}) {
  const available = (presentation.combinations || [])
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
  const sizeGuideRef = useRef<HTMLDivElement>(null);
  const sizeGuideTriggerRef = useRef<HTMLButtonElement>(null);
  const [quantity, setQuantity] = useState(1);
  const selected = available.find(
    (item) => item.referenceHash === referenceHash
  );
  useEffect(() => {
    if (!sizeGuideOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sizeGuideRef.current?.querySelector<HTMLElement>('button')?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSizeGuideOpen(false);
        sizeGuideTriggerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [sizeGuideOpen]);
  if (!available.length) return null;

  return (
    <form
      method="post"
      action="/api/cart"
      className="cp-variant-list mt-10 border-t pt-7"
    >
      <input type="hidden" name="handle" value={handle} />
      <input type="hidden" name="cartAction" value="add" />
      <p className="cp-label mb-4 block">Select size</p>
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
            aria-pressed={referenceHash === item.referenceHash}
            aria-label={`Size ${sizeFor(item).toUpperCase()}`}
          >
            {sizeFor(item).toUpperCase()}
          </button>
        ))}
      </div>
      <input type="hidden" name="referenceHash" value={referenceHash} />
      <input type="hidden" name="quantity" value={quantity} />
      <button
        type="submit"
        disabled={!selected}
        className="cp-action cp-action-solid mt-4 h-14 w-full disabled:opacity-40"
      >
        {selected ? 'ADD TO BAG' : 'SELECT A SIZE'}{' '}
        {selected ? money(selected.price.amount, selected.price.currency) : ''}
      </button>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <button
          type="button"
          ref={sizeGuideTriggerRef}
          className="cp-inline-action"
          onClick={() => setSizeGuideOpen(true)}
        >
          Size guide
        </button>
        <span>Shipping & returns available at checkout</span>
      </div>
      {sizeGuideOpen && (
        <div
          className="cp-modal-backdrop"
          onMouseDown={() => setSizeGuideOpen(false)}
        >
          <div
            ref={sizeGuideRef}
            role="dialog"
            aria-modal="true"
            aria-label="Size and fit"
            className="cp-drawer"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <strong>Size & fit</strong>
              <button
                type="button"
                className="cp-icon-action"
                onClick={() => {
                  setSizeGuideOpen(false);
                  sizeGuideTriggerRef.current?.focus();
                }}
                aria-label="Close size guide"
              >
                Close
              </button>
            </div>
            <p className="mt-4 text-sm">
              {sizeGuide ||
                'Size guidance is currently unavailable in Shopify. Select from the current Shopify size options above.'}
            </p>
          </div>
        </div>
      )}
      <div className="cp-quantity-control mt-5">
        <span id="quantity-label">Quantity</span>
        <div role="group" aria-labelledby="quantity-label">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity === 1}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <output aria-live="polite">{quantity}</output>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(5, value + 1))}
            disabled={quantity === 5}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>
      <p className="mt-4 text-sm">
        {environment === 'preview'
          ? 'Private staging uses an isolated Shopify test checkout. Do not enter real customer or payment data.'
          : 'You will review delivery and payment in Shopify before placing the order.'}
      </p>
    </form>
  );
}

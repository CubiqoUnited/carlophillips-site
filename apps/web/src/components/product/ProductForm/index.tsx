'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button, QuantityStepper } from '@repo/design-system';
import type {
  CommerceEnvironment,
  VariantCombination,
  VariantPresentation,
} from '@/types';
import { useModalDialog } from '@/lib/a11y/use-modal-dialog';

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
  environment: _environment,
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
  const [referenceHash, setReferenceHash] = useState('');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const sizeGuideRef = useRef<HTMLDivElement>(null);
  const sizeGuideTriggerRef = useRef<HTMLButtonElement>(null);
  const sizeGroupRef = useRef<HTMLDivElement>(null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<
    'idle' | 'size-required' | 'adding' | 'added' | 'failed'
  >('idle');
  const selected = available.find(
    (item) => item.referenceHash === referenceHash
  );
  useModalDialog(sizeGuideOpen, sizeGuideRef, sizeGuideTriggerRef, () =>
    setSizeGuideOpen(false)
  );
  useEffect(() => {
    if (window.location.hash !== '#product-options') return;
    requestAnimationFrame(() =>
      sizeGroupRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
    );
  }, []);
  if (!available.length) return null;

  async function addToBag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) {
      setStatus('size-required');
      sizeGroupRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
      return;
    }
    setStatus('adding');
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        body: new FormData(event.currentTarget),
        headers: { accept: 'application/json' },
      });
      const result = (await response.json()) as {
        ok?: boolean;
        count?: number;
      };
      if (!response.ok || !result.ok || typeof result.count !== 'number')
        throw new Error('ADD_TO_BAG_FAILED');
      window.dispatchEvent(
        new CustomEvent('cp:bag-count', { detail: { count: result.count } })
      );
      setStatus('added');
    } catch {
      setStatus('failed');
    }
  }

  return (
    <form
      method="post"
      action="/api/cart"
      className="cp-purchase-form"
      id="product-options"
      onSubmit={addToBag}
    >
      <input type="hidden" name="handle" value={handle} />
      <input type="hidden" name="cartAction" value="add" />
      <p className="cp-label cp-purchase-size-label">Choose a size</p>
      <div
        ref={sizeGroupRef}
        className="cp-size-options"
        role="group"
        aria-label="Choose a size"
      >
        {available.map((item) => (
          <button
            key={item.referenceHash}
            type="button"
            className={`cp-choice-disabled ${
              referenceHash === item.referenceHash ? 'cp-choice-selected' : ''
            }`}
            onClick={() => {
              setReferenceHash(item.referenceHash);
              setStatus('idle');
            }}
            aria-pressed={referenceHash === item.referenceHash}
            aria-label={`Size ${sizeFor(item).toUpperCase()}`}
          >
            {sizeFor(item).toUpperCase()}
          </button>
        ))}
      </div>
      <input type="hidden" name="referenceHash" value={referenceHash} />
      <input type="hidden" name="quantity" value={quantity} />
      <QuantityStepper
        id="product-quantity"
        min={1}
        max={5}
        value={quantity}
        onChange={setQuantity}
      />
      {status !== 'added' ? (
        <Button
          type="submit"
          variant="solid"
          size="large"
          width="full"
          busy={status === 'adding'}
        >
          {status === 'adding'
            ? 'ADDING...'
            : selected
              ? `ADD TO BAG - ${money(selected.price.amount, selected.price.currency)}`
              : 'CHOOSE A SIZE'}
        </Button>
      ) : (
        <div className="cp-purchase-success">
          <p role="status" aria-live="polite">
            <strong>Added to bag.</strong> Your selected size and quantity are
            saved.
          </p>
          <Link
            href="/bag"
            className="cp-action cp-action-solid cp-action-full"
          >
            VIEW BAG
          </Link>
          <button
            type="button"
            className="cp-action cp-action-quiet cp-action-full"
            onClick={() => setStatus('idle')}
          >
            Continue shopping
          </button>
        </div>
      )}
      <div className="cp-purchase-support">
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
            tabIndex={-1}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="cp-drawer-header">
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
            <p className="cp-drawer-copy">
              {sizeGuide ||
                'Size guidance is currently unavailable in Shopify. Select from the current Shopify size options above.'}
            </p>
          </div>
        </div>
      )}
      <div className="cp-purchase-feedback" aria-live="polite">
        {status === 'size-required' && (
          <p>Choose S, M or L before adding this hoodie to your bag.</p>
        )}
        {status === 'failed' && (
          <p>This item was not added. Check availability and try again.</p>
        )}
      </div>
      <p className="cp-purchase-note">
        You will review delivery and payment securely in Shopify before placing
        the order.
      </p>
    </form>
  );
}

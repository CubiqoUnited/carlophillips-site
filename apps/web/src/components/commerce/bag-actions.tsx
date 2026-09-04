'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

type Mutation =
  | { cartAction: 'update'; lineId: string; quantity: number }
  | { cartAction: 'remove'; lineId: string };

async function postCart(fields: Record<string, string>) {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) body.set(key, value);
  const response = await fetch('/api/cart', {
    method: 'POST',
    body,
    headers: { accept: 'application/json' },
  });
  const result = (await response.json()) as {
    ok?: boolean;
    count?: number;
    checkoutUrl?: string;
  };
  if (!response.ok || !result.ok) throw new Error('BAG_MUTATION_FAILED');
  return result;
}

export function BagLineActions({
  lineId,
  quantity,
}: {
  lineId: string;
  quantity: number;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<'update' | 'remove' | null>(null);
  const [failed, setFailed] = useState(false);
  const retryRef = useRef<Mutation | null>(null);

  async function mutate(mutation: Mutation) {
    if (pending) return;
    retryRef.current = mutation;
    setPending(mutation.cartAction);
    setFailed(false);
    try {
      const result = await postCart(
        Object.fromEntries(
          Object.entries(mutation).map(([key, value]) => [key, String(value)])
        )
      );
      window.dispatchEvent(
        new CustomEvent('cp:bag-count', { detail: { count: result.count } })
      );
      router.refresh();
    } catch {
      setFailed(true);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="cp-bag-line-actions">
      <div className="cp-bag-quantity-form">
        <span id={`quantity-${lineId}-label`} className="cp-label-small">
          Quantity
        </span>
        <div
          className="cp-bag-stepper"
          role="group"
          aria-labelledby={`quantity-${lineId}-label`}
        >
          <button
            type="button"
            disabled={quantity <= 1 || Boolean(pending)}
            aria-label="Decrease quantity"
            onClick={() =>
              mutate({ cartAction: 'update', lineId, quantity: quantity - 1 })
            }
          >
            -
          </button>
          <output aria-live="polite">{quantity}</output>
          <button
            type="button"
            disabled={quantity >= 5 || Boolean(pending)}
            aria-label="Increase quantity"
            onClick={() =>
              mutate({ cartAction: 'update', lineId, quantity: quantity + 1 })
            }
          >
            +
          </button>
        </div>
      </div>
      <button
        className="cp-action cp-action-quiet"
        type="button"
        disabled={Boolean(pending)}
        aria-busy={pending === 'remove'}
        onClick={() => mutate({ cartAction: 'remove', lineId })}
      >
        {pending === 'remove' ? 'Removing…' : 'Remove'}
      </button>
      <div className="cp-bag-mutation-feedback" aria-live="polite">
        {pending === 'update' && <p>Updating…</p>}
        {failed && (
          <p>
            This change was not saved.{' '}
            <button
              type="button"
              className="cp-inline-action"
              onClick={() => retryRef.current && mutate(retryRef.current)}
            >
              Retry
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export function BagCheckoutAction() {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function checkout() {
    if (pending) return;
    setPending(true);
    setFailed(false);
    try {
      const result = await postCart({ cartAction: 'checkout' });
      if (!result.checkoutUrl) throw new Error('CHECKOUT_URL_MISSING');
      window.location.assign(result.checkoutUrl);
    } catch {
      setFailed(true);
      setPending(false);
    }
  }

  return (
    <div className="cp-bag-checkout-form">
      <button
        className="cp-action cp-action-solid cp-action-full"
        type="button"
        disabled={pending}
        aria-busy={pending}
        onClick={checkout}
      >
        {pending ? 'Opening checkout…' : failed ? 'Retry checkout' : 'Checkout'}
      </button>
      {failed && (
        <p className="cp-bag-mutation-feedback" role="alert">
          Checkout could not be opened. Your bag is unchanged; try again.
        </p>
      )}
    </div>
  );
}

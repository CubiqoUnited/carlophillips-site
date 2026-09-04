import React from 'react';
import Link from 'next/link';
import type { BagDecision } from '@/types';
import type { StorefrontCart } from '@repo/shopify';
import { StorefrontHeader } from '../layout/StorefrontHeader';

const copyByStatus: Record<
  BagDecision['status'],
  { eyebrow: string; title: string; body: string }
> = {
  local_preview: {
    eyebrow: 'Local non-commerce preview',
    title: 'The bag is intentionally inactive.',
    body: 'This local surface proves layout and failure policy only. No live cart, checkout, payment, or order exists.',
  },
  unavailable: {
    eyebrow: 'Commerce unavailable',
    title: 'The bag cannot be opened safely.',
    body: 'The required cart capability has not been verified for this environment. No local cart has been substituted.',
  },
  empty: {
    eyebrow: '',
    title: 'Your bag is empty.',
    body: 'Explore the collection and add a piece when you are ready.',
  },
  ready: {
    eyebrow: 'Your bag',
    title: 'Bag review',
    body: 'Cart lines, current pricing and hosted checkout are provided by Shopify.',
  },
};

export function CommerceBagState({
  decision,
  cart,
}: {
  decision: BagDecision;
  cart?: StorefrontCart | null;
}) {
  const hasLines = Boolean(cart?.lines.edges.length);
  const copy = hasLines
    ? {
        eyebrow: 'Your bag',
        title: 'Bag review',
        body: 'Review your pieces before checkout.',
      }
    : copyByStatus[decision.status];

  return (
    <main
      id="main-content"
      data-bag-status={decision.status}
      data-commerce-source={
        decision.source === 'shopify' ? 'store' : decision.source
      }
      className="cp-commerce-page"
    >
      <StorefrontHeader pageLabel="Bag" navigationAriaLabel="Bag navigation" />

      <section className="cp-bag-section cp-section flex items-center">
        <div className="cp-bag-layout cp-shell-medium cp-grid-rule grid px-0">
          <div className="cp-bag-copy flex flex-col justify-center">
            {copy.eyebrow && <p className="cp-label">{copy.eyebrow}</p>}
            <h1 className="cp-heading-section mt-8 max-w-4xl">{copy.title}</h1>
            <p className="cp-body-large mt-8 max-w-2xl">{copy.body}</p>
            {cart && hasLines && (
              <div className="mt-10 grid gap-6" aria-label="Shopify cart lines">
                {cart.lines.edges.map(({ node }) => (
                  <article key={node.id} className="border-t pt-5">
                    <p className="cp-label-small">
                      {node.merchandise.product.title}
                    </p>
                    <p className="cp-text-copy mt-2">
                      {node.merchandise.selectedOptions
                        .map((option) => `${option.name}: ${option.value}`)
                        .join(' · ')}
                    </p>
                    <p className="cp-text-copy mt-2">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: node.merchandise.price.currencyCode,
                      }).format(Number(node.merchandise.price.amount))}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <form method="post" action="/api/cart">
                        <input type="hidden" name="cartAction" value="update" />
                        <input type="hidden" name="lineId" value={node.id} />
                        <label
                          className="cp-label-small"
                          htmlFor={`quantity-${node.id}`}
                        >
                          Quantity
                        </label>
                        <input
                          id={`quantity-${node.id}`}
                          name="quantity"
                          type="number"
                          min="1"
                          max="5"
                          defaultValue={node.quantity}
                          className="ml-3 w-16 border p-2"
                        />
                        <button
                          className="cp-action cp-action-quiet ml-3"
                          type="submit"
                        >
                          Update
                        </button>
                      </form>
                      <form method="post" action="/api/cart">
                        <input type="hidden" name="cartAction" value="remove" />
                        <input type="hidden" name="lineId" value={node.id} />
                        <button
                          className="cp-action cp-action-quiet"
                          type="submit"
                        >
                          Remove
                        </button>
                      </form>
                    </div>
                  </article>
                ))}
                <p className="cp-body-large">
                  Subtotal:{' '}
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: cart.cost.subtotalAmount.currencyCode,
                  }).format(Number(cart.cost.subtotalAmount.amount))}
                </p>
                <form
                  method="post"
                  action="/api/cart"
                  className="cp-bag-checkout-form"
                >
                  <input type="hidden" name="cartAction" value="checkout" />
                  <button className="cp-action cp-action-solid" type="submit">
                    Checkout
                  </button>
                </form>
              </div>
            )}
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/shop" className="cp-action cp-action-outline">
                Continue shopping
              </Link>
              <Link href="/" className="cp-action cp-action-quiet">
                Return home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

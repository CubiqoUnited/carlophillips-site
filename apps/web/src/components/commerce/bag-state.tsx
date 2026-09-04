import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { BagDecision } from '@/types';
import type { StorefrontCart } from '@repo/shopify';
import { StorefrontHeader } from '../layout/StorefrontHeader';
import { curateCustomerMedia } from '@/lib/media/customer-product-media';

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
  added = false,
}: {
  decision: BagDecision;
  cart?: StorefrontCart | null;
  added?: boolean;
}) {
  const hasLines = Boolean(cart?.lines.edges.length);
  const bagCount =
    cart?.lines.edges.reduce((total, { node }) => total + node.quantity, 0) ||
    0;
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
      <StorefrontHeader
        pageLabel="Bag"
        bagCount={bagCount}
        navigationAriaLabel="Bag navigation"
      />

      <section className="cp-bag-section cp-section">
        <div className="cp-bag-layout cp-shell-medium">
          <div className="cp-bag-copy">
            {copy.eyebrow && <p className="cp-label">{copy.eyebrow}</p>}
            {added && hasLines && (
              <div className="cp-added-to-bag" role="status" aria-live="polite">
                <strong>Added to bag.</strong>
                <span>
                  {' '}
                  Your bag now contains {bagCount}{' '}
                  {bagCount === 1 ? 'item' : 'items'}.
                </span>
              </div>
            )}
            <h1 className="cp-heading-section cp-bag-title">{copy.title}</h1>
            <p className="cp-body-large cp-bag-description">{copy.body}</p>
            {cart && hasLines && (
              <div className="cp-bag-lines" aria-label="Shopify cart lines">
                {cart.lines.edges.map(({ node }) => {
                  const bagImage =
                    curateCustomerMedia(
                      node.merchandise.product.images?.nodes || []
                    )[0] || node.merchandise.image;
                  return (
                    <article key={node.id} className="cp-bag-line">
                      <div className="cp-bag-line-media">
                        {bagImage?.url ? (
                          <Image
                            src={bagImage.url}
                            alt={
                              bagImage.altText || node.merchandise.product.title
                            }
                            fill
                            sizes="(max-width: 430px) 28vw, 9rem"
                            className="cp-bag-line-image"
                          />
                        ) : (
                          <span className="cp-label-small">
                            Image unavailable
                          </span>
                        )}
                      </div>
                      <div className="cp-bag-line-content">
                        <div className="cp-bag-line-heading">
                          <div>
                            <p className="cp-label-small">
                              {node.merchandise.product.title}
                            </p>
                            <p className="cp-text-copy cp-bag-line-options">
                              {node.merchandise.selectedOptions
                                .map(
                                  (option) => `${option.name}: ${option.value}`
                                )
                                .join(' · ')}
                            </p>
                          </div>
                          <p className="cp-text-copy cp-bag-line-price">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: node.merchandise.price.currencyCode,
                            }).format(Number(node.merchandise.price.amount))}
                          </p>
                        </div>
                        <div className="cp-bag-line-actions">
                          <form
                            method="post"
                            action="/api/cart"
                            className="cp-bag-quantity-form"
                          >
                            <input
                              type="hidden"
                              name="cartAction"
                              value="update"
                            />
                            <input
                              type="hidden"
                              name="lineId"
                              value={node.id}
                            />
                            <span
                              id={`quantity-${node.id}-label`}
                              className="cp-label-small"
                            >
                              Quantity
                            </span>
                            <div
                              className="cp-bag-stepper"
                              role="group"
                              aria-labelledby={`quantity-${node.id}-label`}
                            >
                              <button
                                type="submit"
                                name="quantity"
                                value={Math.max(1, node.quantity - 1)}
                                disabled={node.quantity <= 1}
                                aria-label="Decrease quantity"
                              >
                                -
                              </button>
                              <output>{node.quantity}</output>
                              <button
                                type="submit"
                                name="quantity"
                                value={Math.min(5, node.quantity + 1)}
                                disabled={node.quantity >= 5}
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          </form>
                          <form
                            method="post"
                            action="/api/cart"
                            className="cp-bag-remove-form"
                          >
                            <input
                              type="hidden"
                              name="cartAction"
                              value="remove"
                            />
                            <input
                              type="hidden"
                              name="lineId"
                              value={node.id}
                            />
                            <button
                              className="cp-action cp-action-quiet"
                              type="submit"
                            >
                              Remove
                            </button>
                          </form>
                        </div>
                      </div>
                    </article>
                  );
                })}
                <div className="cp-bag-summary">
                  <p className="cp-body-large">
                    <span>Subtotal</span>
                    <strong>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: cart.cost.subtotalAmount.currencyCode,
                      }).format(Number(cart.cost.subtotalAmount.amount))}
                    </strong>
                  </p>
                  <form
                    method="post"
                    action="/api/cart"
                    className="cp-bag-checkout-form"
                  >
                    <input type="hidden" name="cartAction" value="checkout" />
                    <button
                      className="cp-action cp-action-solid cp-action-full"
                      type="submit"
                    >
                      Checkout
                    </button>
                  </form>
                </div>
              </div>
            )}
            <div className="cp-bag-secondary-actions">
              <Link href="/shop" className="cp-action cp-action-outline">
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

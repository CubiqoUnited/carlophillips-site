import React from 'react';
import Link from 'next/link';
import { StorefrontHeader } from '../storefront/storefront-header';

const copyByStatus = {
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
    eyebrow: 'Your bag',
    title: 'Your bag is empty.',
    body: 'The commerce source is available, but no approved product has been added.',
  },
  ready: {
    eyebrow: 'Your bag',
    title: 'Bag review',
    body: 'Cart lines are available. Checkout remains disabled until the release and checkout gates pass.',
  },
};

export function CommerceBagState({ decision }) {
  const copy = copyByStatus[decision.status] || copyByStatus.unavailable;

  return (
    <main
      id="main-content"
      data-bag-status={decision.status}
      data-commerce-source={decision.source === 'shopify' ? 'store' : decision.source}
      className="cp-commerce-page"
    >
      <StorefrontHeader pageLabel="Bag" navigationAriaLabel="Bag navigation" />

      <section className="cp-section flex min-h-[calc(100vh-5rem)] items-center">
        <div className="cp-shell-medium cp-grid-rule grid px-0 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="cp-bag-panel flex min-h-64 flex-col justify-between p-7 sm:p-10 lg:min-h-[540px]">
            <p className="cp-label">Commerce truth</p>
            <dl className="cp-definition-list grid gap-6 pt-7 text-sm">
              <div>
                <dt className="cp-label-small">Environment</dt>
                <dd className="cp-text-copy mt-2">{decision.environment}</dd>
              </div>
              <div>
                <dt className="cp-label-small">Source</dt>
                <dd className="cp-text-copy mt-2">{decision.source === 'fixture' ? 'Local preview' : decision.source === 'shopify' ? 'Store' : 'Unavailable'}</dd>
              </div>
              <div>
                <dt className="cp-label-small">Checkout</dt>
                <dd className="cp-text-copy mt-2">{decision.checkoutAllowed ? 'Eligible' : 'Disabled'}</dd>
              </div>
            </dl>
          </aside>

          <div className="cp-bag-copy flex min-h-[540px] flex-col justify-center p-7 sm:p-12 lg:p-16">
            <p className="cp-label">{copy.eyebrow}</p>
            <h1 className="cp-heading-section mt-8 max-w-4xl">
              {copy.title}
            </h1>
            <p className="cp-body-large mt-8 max-w-2xl">{copy.body}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/collections"
                className="cp-action cp-action-outline"
              >
                View release state
              </Link>
              <Link
                href="/"
                className="cp-action cp-action-quiet"
              >
                Return home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

import React from 'react';
import Link from 'next/link';
import type { BagDecision } from '@/types';
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

export function CommerceBagState({ decision }: { decision: BagDecision }) {
  const copy = copyByStatus[decision.status];

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
          <aside className="cp-bag-panel flex flex-col justify-between">
            <p className="cp-label">Commerce truth</p>
            <dl className="cp-definition-list grid gap-6 pt-7 text-sm">
              <div>
                <dt className="cp-label-small">Environment</dt>
                <dd className="cp-text-copy mt-2">{decision.environment}</dd>
              </div>
              <div>
                <dt className="cp-label-small">Source</dt>
                <dd className="cp-text-copy mt-2">
                  {decision.source === 'fixture'
                    ? 'Local preview'
                    : decision.source === 'shopify'
                      ? 'Store'
                      : 'Unavailable'}
                </dd>
              </div>
              <div>
                <dt className="cp-label-small">Checkout</dt>
                <dd className="cp-text-copy mt-2">
                  {decision.checkoutAllowed ? 'Eligible' : 'Disabled'}
                </dd>
              </div>
            </dl>
          </aside>

          <div className="cp-bag-copy flex flex-col justify-center">
            <p className="cp-label">{copy.eyebrow}</p>
            <h1 className="cp-heading-section mt-8 max-w-4xl">{copy.title}</h1>
            <p className="cp-body-large mt-8 max-w-2xl">{copy.body}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/collections" className="cp-action cp-action-outline">
                View release state
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

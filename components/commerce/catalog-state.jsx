import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StorefrontHeader } from '../storefront/storefront-header';

function countLabel(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatPrice(product) {
  if (!Number.isFinite(product.price) || product.price <= 0) return 'Price unavailable';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.currency,
    maximumFractionDigits: 0,
  }).format(product.price);
}

function environmentCopy(decision) {
  if (decision.source === 'fixture') {
    return {
      eyebrow: 'Local non-commerce fixture review',
      body: 'These cards are explicitly local layout fixtures. They are not live store data and cannot be purchased.',
    };
  }
  if (decision.environment === 'preview') {
    return {
      eyebrow: decision.commerceAllowed ? 'Private live-commerce staging' : 'Private release review',
      body: decision.commerceAllowed
        ? 'The approved Hoodie is connected to current product facts and checkout for private staging verification.'
        : 'Only observed products with complete review evidence can appear in this private Preview catalog.',
    };
  }
  if (decision.environment === 'production') {
    return {
      eyebrow: decision.commerceAllowed ? 'Live collection' : 'Released catalog',
      body: decision.commerceAllowed
        ? 'Current product facts, availability, pricing, and secure checkout are active for the approved product below.'
        : 'Only products with complete Released evidence can appear. Purchasing remains disabled until cart and checkout are proven.',
    };
  }
  return {
    eyebrow: 'Local release review',
    body: 'Only source-labeled release candidates permitted by the local policy can appear.',
  };
}

export function CommerceCatalogState({ decision, pageLabel = 'Collection' }) {
  const copy = environmentCopy(decision);
  const available = decision.status === 'available';
  const liveCollection = available && decision.commerceAllowed;

  return (
    <main
      id="main-content"
      data-catalog-status={decision.status}
      data-commerce-source={decision.source === 'shopify' ? 'store' : decision.source}
      className="cp-commerce-page"
    >
      <StorefrontHeader pageLabel={pageLabel} navigationAriaLabel="Catalog navigation" />
      <section className="cp-commerce-hero storefront-panel">
        <div className="cp-shell-wide grid gap-12 px-0 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div>
            <p className="cp-label">{liveCollection ? 'Signature Series / 001' : copy.eyebrow}</p>
            <h1 className="cp-commerce-title mt-7 max-w-5xl">
              {liveCollection ? 'The Collection' : available ? countLabel(decision.visibleCount, 'preview piece') : 'Coming soon.'}
            </h1>
            <p className="cp-body-large mt-8 max-w-3xl">
              {liveCollection ? 'One essential. Considered in every detail and available through secure checkout.' : copy.body}
            </p>
          </div>
          {!liveCollection && <dl className="cp-grid-rule grid grid-cols-2 text-sm">
            {[
              ['Candidate records', decision.candidateCount],
              ['Visible here', decision.visibleCount],
              ['Withheld', decision.excludedCount],
              ['Purchasing', decision.commerceAllowed ? 'Secure checkout' : 'Disabled'],
            ].map(([label, value]) => (
              <div key={label} className="cp-stat-cell sm:p-7">
                <dt className="cp-label-small">{label}</dt>
                <dd className="cp-text-copy mt-3">{value}</dd>
              </div>
            ))}
          </dl>}
        </div>
      </section>

      {available ? (
        <section aria-label="Available products" className="cp-section storefront-panel">
          <div className={`cp-shell-wide cp-grid-rule grid px-0 ${liveCollection && decision.products.length === 1 ? 'lg:grid-cols-[1.35fr_0.65fr]' : 'md:grid-cols-2 xl:grid-cols-3'}`}>
            {decision.products.map(product => (
              <article key={product.handle} className={`cp-surface-canvas ${liveCollection && decision.products.length === 1 ? 'contents' : 'flex min-h-[580px] flex-col'}`}>
                <div className="cp-card-media relative flex min-h-[62vh] items-center justify-center lg:min-h-[78vh]">
                  {product.media[0]?.url ? (
                    <Image
                      src={product.media[0].url}
                      alt={product.media[0].alt}
                      fill
                      sizes={liveCollection ? '(min-width: 1024px) 68vw, 100vw' : '(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw'}
                      className="object-contain p-8 sm:p-12"
                    />
                  ) : (
                    <span className="cp-text-subtle px-8 text-center text-sm">Approved catalog media unavailable</span>
                  )}
                </div>
                <div className="cp-card-copy flex flex-1 flex-col justify-center border-t p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-12">
                  <p className="cp-label-small">{liveCollection ? 'Edition 001' : decision.source === 'fixture' ? 'Local presentation fixture' : 'Product review'}</p>
                  <h2 className="cp-heading-product mt-5">{product.title}</h2>
                  <p className="cp-text-soft mt-5 text-base">{formatPrice(product)}</p>
                  <Link
                    href={`/products/${product.handle}`}
                    className="cp-action cp-action-outline mt-10 min-h-14 lg:mt-14"
                  >
                    {product.commerceAllowed ? 'View product' : 'Preview product'}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="cp-section">
          <div className="cp-shell-wide px-0">
            <div className="cp-empty-state">
              <p className="cp-label-small">CARLOPHILLIPS</p>
              <p className="cp-text-copy mt-6 max-w-3xl text-xl font-light leading-relaxed">
                The next release is being prepared. Return soon.
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CatalogDecision, ProductViewModel } from '@/types';
import { StorefrontHeader } from '../layout/StorefrontHeader';

function countLabel(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatPrice(product: ProductViewModel) {
  if (!Number.isFinite(product.price) || product.price <= 0)
    return 'Price unavailable';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(product.price);
}

function categoryKey(product: ProductViewModel) {
  const value = product.productType.trim().toLowerCase();
  if (/hoodie|sweatshirt/.test(value)) return 'hoodies';
  if (/t[ -]?shirt|tshirt|tee/.test(value)) return 'tshirts';
  return value.replace(/[^a-z0-9]+/g, '-') || 'other';
}

function categoryLabel(key: string) {
  return key.replaceAll('-', ' ').toUpperCase();
}

function environmentCopy(decision: CatalogDecision) {
  if (decision.source === 'fixture') {
    return {
      eyebrow: 'Local non-commerce fixture review',
      body: 'These cards are explicitly local layout fixtures. They are not live store data and cannot be purchased.',
    };
  }
  if (decision.environment === 'preview') {
    return {
      eyebrow: decision.commerceAllowed
        ? 'Private live-commerce staging'
        : 'Private release review',
      body: decision.commerceAllowed
        ? 'The approved Hoodie is connected to current product facts and checkout for private staging verification.'
        : 'Only observed products with complete review evidence can appear in this private Preview catalog.',
    };
  }
  if (decision.environment === 'production') {
    return {
      eyebrow: decision.commerceAllowed
        ? 'Live collection'
        : 'Released catalog',
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

export function CommerceCatalogState({
  decision,
  pageLabel = 'Collection',
  overlay = false,
}: {
  decision: CatalogDecision;
  pageLabel?: string;
  overlay?: boolean;
}) {
  const copy = environmentCopy(decision);
  const available = decision.status === 'available';
  const liveCollection = available && decision.commerceAllowed;
  const leadMedia = (product: ProductViewModel) =>
    product.media[1] || product.media[0];
  const categories = useMemo(() => {
    const grouped = new Map<string, ProductViewModel[]>();
    decision.products.forEach((product) => {
      const key = categoryKey(product);
      grouped.set(key, [...(grouped.get(key) || []), product]);
    });
    return [...grouped.entries()].map(([key, products]) => ({
      key,
      label: categoryLabel(key),
      products,
    }));
  }, [decision.products]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get(
      'category'
    );
    if (
      requested &&
      categories.some((category) => category.key === requested)
    ) {
      setActiveCategory(requested);
    }
  }, [categories]);
  const activeGroup = categories.find(
    (category) => category.key === activeCategory
  );
  const visibleProducts = activeGroup?.products || [];
  const categoryLinks = categories.map((category) => ({
    label: category.label,
    href: `/shop?category=${encodeURIComponent(category.key)}`,
  }));

  return (
    <main
      id={overlay ? undefined : 'main-content'}
      role={overlay ? 'dialog' : undefined}
      aria-modal={overlay ? true : undefined}
      aria-label={overlay ? 'Shop discovery' : undefined}
      data-catalog-status={decision.status}
      data-commerce-source={
        decision.source === 'shopify' ? 'store' : decision.source
      }
      className={`cp-commerce-page ${overlay ? 'cp-catalog-overlay' : ''}`}
    >
      {overlay ? (
        <Link
          href="/"
          className="cp-catalog-overlay-close"
          aria-label="Close shop discovery"
        >
          ×
        </Link>
      ) : (
        <StorefrontHeader
          pageLabel={pageLabel}
          navigationAriaLabel="Catalog navigation"
          categories={categoryLinks}
        />
      )}
      <section className="cp-commerce-hero storefront-panel">
        <div className="cp-catalog-hero-layout cp-shell-wide grid gap-12 px-0 lg:items-end">
          <div>
            <p className="cp-label">{activeGroup ? 'Category' : 'Discovery'}</p>
            <h1 className="cp-commerce-title mt-7 max-w-5xl">
              {activeGroup
                ? `ALL ${activeGroup.label}`
                : available
                  ? 'ALL CATEGORIES'
                  : 'Coming soon.'}
            </h1>
            <p className="cp-body-large mt-8 max-w-3xl">
              {available
                ? 'Choose a category to discover the pieces currently available from Shopify.'
                : copy.body}
            </p>
          </div>
          {!liveCollection && (
            <dl className="cp-grid-rule grid grid-cols-2 text-sm">
              {[
                ['Candidate records', decision.candidateCount],
                ['Visible here', decision.visibleCount],
                ['Withheld', decision.excludedCount],
                [
                  'Purchasing',
                  decision.commerceAllowed ? 'Secure checkout' : 'Disabled',
                ],
              ].map(([label, value]) => (
                <div key={label} className="cp-stat-cell sm:p-7">
                  <dt className="cp-label-small">{label}</dt>
                  <dd className="cp-text-copy mt-3">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {available && !activeGroup ? (
        <section
          id="categories"
          aria-label="All categories"
          className="cp-section storefront-panel"
        >
          <div className="cp-shell-wide px-0">
            <div className="cp-discovery-category-grid">
              {categories.map((category) => {
                const product = category.products[0];
                const media = leadMedia(product);
                return (
                  <button
                    key={category.key}
                    type="button"
                    onClick={() => setActiveCategory(category.key)}
                  >
                    <span className="cp-discovery-category-media">
                      {media?.url ? (
                        <Image
                          src={media.url}
                          alt=""
                          fill
                          sizes="(min-width: 768px) 50vw, 100vw"
                          className="object-contain"
                        />
                      ) : null}
                    </span>
                    <strong>{category.label}</strong>
                    <small>
                      {countLabel(category.products.length, 'piece')}
                    </small>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      ) : available && activeGroup ? (
        <section
          aria-label={`All ${activeGroup.label.toLowerCase()}`}
          className="cp-section storefront-panel"
        >
          <div
            className={`cp-shell-wide cp-grid-rule cp-catalog-grid grid px-0 ${liveCollection && decision.products.length === 1 ? 'cp-catalog-grid-featured' : 'cp-catalog-grid-standard md:grid-cols-2 xl:grid-cols-3'}`}
          >
            {visibleProducts.map((product) => (
              <article
                key={product.handle}
                className={`cp-surface-canvas ${liveCollection && decision.products.length === 1 ? 'contents' : 'cp-catalog-card flex flex-col'}`}
              >
                <div className="cp-catalog-card-media cp-card-media relative flex items-center justify-center">
                  {leadMedia(product)?.url ? (
                    <Image
                      src={leadMedia(product)?.url || ''}
                      alt={leadMedia(product)?.alt || product.title}
                      fill
                      sizes={
                        liveCollection
                          ? '(min-width: 1024px) 68vw, 100vw'
                          : '(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw'
                      }
                      className="object-contain p-8 sm:p-12"
                    />
                  ) : (
                    <span className="cp-text-subtle px-8 text-center text-sm">
                      Approved catalog media unavailable
                    </span>
                  )}
                </div>
                <div className="cp-card-copy flex flex-1 flex-col justify-center border-t p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-12">
                  <p className="cp-label-small">
                    {liveCollection
                      ? 'Edition 001'
                      : decision.source === 'fixture'
                        ? 'Local presentation fixture'
                        : 'Product review'}
                  </p>
                  <h2 className="cp-heading-product mt-5">{product.title}</h2>
                  <p className="cp-text-soft mt-5 text-base">
                    {formatPrice(product)}
                  </p>
                  <Link
                    href={`/product/${product.handle}`}
                    className="cp-action cp-action-outline mt-10 min-h-14 lg:mt-14"
                  >
                    {product.commerceAllowed
                      ? 'View product'
                      : 'Preview product'}
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
      {available && (
        <nav
          className="cp-discovery-fixed-nav"
          aria-label="Discovery shortcuts"
        >
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            aria-current={!activeGroup ? 'page' : undefined}
          >
            ALL CATEGORIES
          </button>
          {categories.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => setActiveCategory(category.key)}
              aria-current={
                activeGroup?.key === category.key ? 'page' : undefined
              }
            >
              ALL {category.label}
            </button>
          ))}
          <span role="group" aria-label="Discovery position">
            {[null, ...categories.map((category) => category.key)].map(
              (key, index) => (
                <i
                  key={key || 'all'}
                  className={
                    (activeCategory || null) === key ? 'is-active' : ''
                  }
                  aria-label={`Position ${index + 1}`}
                />
              )
            )}
          </span>
        </nav>
      )}
    </main>
  );
}

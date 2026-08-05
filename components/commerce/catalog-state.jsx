import React from 'react';
import Link from 'next/link';

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
      body: 'These cards are explicitly local layout fixtures. They are not live Shopify catalog data and cannot be purchased.',
    };
  }
  if (decision.environment === 'preview') {
    return {
      eyebrow: decision.commerceAllowed ? 'Private live-commerce staging' : 'Private release review',
      body: decision.commerceAllowed
        ? 'The approved Hoodie is connected to current Shopify facts and checkout for private staging verification.'
        : 'Only Shopify-observed products with complete Staged-or-later release evidence can appear in this private Preview catalog.',
    };
  }
  if (decision.environment === 'production') {
    return {
      eyebrow: decision.commerceAllowed ? 'Live Shopify catalog' : 'Released catalog',
      body: decision.commerceAllowed
        ? 'Current Shopify product facts, availability, pricing, and secure checkout are active for the approved product below.'
        : 'Only Shopify-observed products with complete Released evidence can appear. Purchasing remains disabled until cart and checkout are proven.',
    };
  }
  return {
    eyebrow: 'Local release review',
    body: 'Only source-labeled release candidates permitted by the local policy can appear.',
  };
}

function CatalogHeader({ pageLabel }) {
  return (
    <header className="border-b border-white/10 px-5 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1700px] items-center justify-between">
        <Link href="/" className="text-xs uppercase tracking-[0.32em] text-white">CARLOPHILLIPS</Link>
        <nav className="flex gap-6 text-[10px] uppercase tracking-[0.24em] text-white/45" aria-label="Catalog navigation">
          <span aria-current="page" className="text-white">{pageLabel}</span>
          <Link href="/bag" className="transition hover:text-white">Bag</Link>
        </nav>
      </div>
    </header>
  );
}

export function CommerceCatalogState({ decision, pageLabel = 'Collection' }) {
  const copy = environmentCopy(decision);
  const available = decision.status === 'available';

  return (
    <main
      id="main-content"
      data-catalog-status={decision.status}
      data-commerce-source={decision.source}
      className="min-h-screen bg-[#020202] text-white"
    >
      <CatalogHeader pageLabel={pageLabel} />
      <section className="border-b border-white/10 px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-[1700px] gap-12 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">{copy.eyebrow}</p>
            <h1 className="mt-7 max-w-5xl text-6xl font-light leading-[0.9] tracking-[-0.06em] sm:text-8xl lg:text-9xl">
              {available ? countLabel(decision.visibleCount, decision.commerceAllowed ? 'live product' : 'release candidate') : 'No release-eligible products.'}
            </h1>
            <p className="mt-8 max-w-3xl text-base leading-relaxed text-white/52 sm:text-lg">{copy.body}</p>
          </div>
          <dl className="grid grid-cols-2 gap-px bg-white/10 text-sm">
            {[
              ['Candidate records', decision.candidateCount],
              ['Visible here', decision.visibleCount],
              ['Withheld', decision.excludedCount],
              ['Purchasing', decision.commerceAllowed ? 'Shopify checkout' : 'Disabled'],
            ].map(([label, value]) => (
              <div key={label} className="bg-black p-5 sm:p-7">
                <dt className="text-[9px] uppercase tracking-[0.22em] text-white/30">{label}</dt>
                <dd className="mt-3 text-white/70">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {available ? (
        <section aria-label="Release-eligible products" className="px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
          <div className="mx-auto grid max-w-[1700px] gap-px bg-white/10 md:grid-cols-2 xl:grid-cols-3">
            {decision.products.map(product => (
              <article key={product.handle} className="flex min-h-[580px] flex-col bg-black">
                <div className="flex aspect-[4/5] items-center justify-center bg-[#171714]">
                  {product.media[0]?.url ? (
                    <img
                      src={product.media[0].url}
                      alt={product.media[0].alt}
                      className="h-full w-full object-contain p-8 sm:p-12"
                    />
                  ) : (
                    <span className="px-8 text-center text-sm text-white/40">Approved catalog media unavailable</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col border-t border-white/10 p-6 sm:p-8">
                  <p className="text-[9px] uppercase tracking-[0.24em] text-white/35">{product.sourceLabel}</p>
                  <h2 className="mt-5 text-3xl font-light tracking-[-0.035em]">{product.title}</h2>
                  <p className="mt-4 text-sm text-white/48">{formatPrice(product)} · {product.commerceAllowed ? 'Shopify checkout available' : 'purchasing disabled'}</p>
                  <Link
                    href={`/products/${product.handle}`}
                    className="mt-auto inline-flex min-h-12 items-center justify-center border border-white/20 px-5 pt-8 text-[10px] uppercase tracking-[0.24em] text-white/70"
                  >
                    {product.commerceAllowed ? 'Shop product' : 'Review product'}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="px-5 py-20 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1700px] border border-white/10 p-8 sm:p-12">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/35">Catalog withheld</p>
            <p className="mt-6 max-w-3xl text-xl font-light leading-relaxed text-white/62">
              No product passed the source, environment, and release-evidence policy. No denied or unavailable product data has been substituted.
            </p>
            <p className="mt-6 font-mono text-xs text-white/30">Reason: {decision.reason}</p>
          </div>
        </section>
      )}
    </main>
  );
}

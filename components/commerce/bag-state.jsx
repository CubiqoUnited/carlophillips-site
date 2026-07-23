import React from 'react';
import Link from 'next/link';

const copyByStatus = {
  local_preview: {
    eyebrow: 'Local non-commerce preview',
    title: 'The bag is intentionally inactive.',
    body: 'This local surface proves layout and failure policy only. No Shopify cart, checkout, payment, or order exists.',
  },
  unavailable: {
    eyebrow: 'Commerce unavailable',
    title: 'The bag cannot be opened safely.',
    body: 'The required Shopify cart capability has not been verified for this environment. No local cart has been substituted.',
  },
  empty: {
    eyebrow: 'Shopify cart',
    title: 'Your bag is empty.',
    body: 'The commerce source is available, but no approved product has been added.',
  },
  ready: {
    eyebrow: 'Shopify cart',
    title: 'Bag review',
    body: 'Cart lines are available from Shopify. Checkout remains disabled until the release and checkout gates pass.',
  },
};

export function CommerceBagState({ decision }) {
  const copy = copyByStatus[decision.status] || copyByStatus.unavailable;

  return (
    <main
      id="main-content"
      data-bag-status={decision.status}
      data-commerce-source={decision.source}
      className="min-h-screen bg-[#020202] text-white"
    >
      <header className="border-b border-white/10 px-5 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1700px] items-center justify-between">
          <Link href="/" className="text-xs uppercase tracking-[0.32em] text-white">CARLOPHILLIPS</Link>
          <nav className="flex gap-6 text-[10px] uppercase tracking-[0.24em] text-white/45" aria-label="Bag navigation">
            <Link href="/collections" className="transition hover:text-white">Collection</Link>
            <span aria-current="page" className="text-white">Bag</span>
          </nav>
        </div>
      </header>

      <section className="flex min-h-[calc(100vh-5rem)] items-center px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid w-full max-w-[1500px] gap-px bg-white/10 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="flex min-h-64 flex-col justify-between bg-[#050505] p-7 sm:p-10 lg:min-h-[540px]">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Commerce truth</p>
            <dl className="grid gap-6 border-t border-white/10 pt-7 text-sm">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.24em] text-white/30">Environment</dt>
                <dd className="mt-2 text-white/65">{decision.environment}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.24em] text-white/30">Source</dt>
                <dd className="mt-2 text-white/65">{decision.source}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.24em] text-white/30">Checkout</dt>
                <dd className="mt-2 text-white/65">{decision.checkoutAllowed ? 'Eligible' : 'Disabled'}</dd>
              </div>
            </dl>
          </aside>

          <div className="flex min-h-[540px] flex-col justify-center bg-black p-7 sm:p-12 lg:p-16">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">{copy.eyebrow}</p>
            <h1 className="mt-8 max-w-4xl text-5xl font-light leading-[0.94] tracking-[-0.055em] sm:text-7xl lg:text-8xl">
              {copy.title}
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-white/52 sm:text-lg">{copy.body}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/collections"
                className="inline-flex min-h-12 items-center border border-white/20 px-6 text-[10px] uppercase tracking-[0.24em] text-white/70 transition hover:border-white hover:text-white"
              >
                View release state
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-12 items-center px-6 text-[10px] uppercase tracking-[0.24em] text-white/45 transition hover:text-white"
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

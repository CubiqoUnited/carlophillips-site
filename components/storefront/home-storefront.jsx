'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { ArrowRight, Menu, ShoppingBag, X } from 'lucide-react';

const fallbackSummary = {
  status: 'denied',
  candidateCount: 0,
  visibleCount: 0,
  excludedCount: 0,
  commerceAllowed: false,
  message: 'The catalog release state is unavailable.',
  primaryProduct: null,
};

function Navigation({ onMenu }) {
  return (
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-black/78 backdrop-blur-md">
        <div className="mx-auto grid h-16 max-w-[1800px] grid-cols-3 items-center px-5 sm:px-8 lg:h-20 lg:px-12">
          <button
            type="button"
            onClick={onMenu}
            className="inline-flex w-fit items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-white/70 transition hover:text-white"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" strokeWidth={1.3} />
            <span className="hidden sm:inline">Menu</span>
          </button>
          <Link href="/" className="justify-self-center text-xs uppercase tracking-[0.38em] text-white sm:text-sm">
            CARLOPHILLIPS
          </Link>
          <Link
            href="/bag"
            className="inline-flex items-center gap-3 justify-self-end text-[10px] uppercase tracking-[0.28em] text-white/70 transition hover:text-white"
          >
            <span className="hidden sm:inline">Bag</span>
            <ShoppingBag className="h-4 w-4" strokeWidth={1.3} />
          </Link>
        </div>
      </header>
  );
}

function MenuOverlay({ onClose }) {
  return (
    <aside className="fixed inset-0 z-50 bg-black px-6 py-7 text-white" aria-label="Site navigation">
      <div className="mx-auto flex max-w-[1700px] items-center justify-between">
        <span className="text-xs uppercase tracking-[0.38em] text-white/70">CARLOPHILLIPS</span>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center border border-white/20 text-white/70"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" strokeWidth={1.3} />
        </button>
      </div>
      <nav className="mx-auto mt-24 grid max-w-[1700px] gap-4 text-5xl font-light tracking-[-0.05em] sm:text-7xl lg:text-8xl" aria-label="Main menu">
        <Link onClick={onClose} href="/">Home</Link>
        <Link onClick={onClose} href="/shop">Shop</Link>
        <Link onClick={onClose} href="/collections">Collections</Link>
        <Link onClick={onClose} href="/bag">Bag</Link>
      </nav>
    </aside>
  );
}

function Hero({ summary }) {
  const heroMedia = summary.primaryProduct?.heroMedia || null;
  const catalogLabel = summary.visibleCount > 0
    ? summary.commerceAllowed ? 'Discover the Signature Hoodie' : 'Preview the collection'
    : 'Explore the collection';

  return (
    <section className="storefront-panel relative min-h-screen overflow-hidden border-b border-white/10 bg-black px-5 pb-10 pt-24 sm:px-8 lg:px-12 lg:pb-12">
      <div className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-[1800px] items-end gap-10 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="relative z-10 pb-3 lg:pb-12">
          <p className="mb-7 text-[10px] uppercase tracking-[0.34em] text-white/48">
            CARLOPHILLIPS / 001
          </p>
          <h1 className="max-w-4xl text-[19vw] font-light leading-[0.82] tracking-[-0.075em] sm:text-[14vw] lg:text-[7.7vw]">
            Gesture of<br />Luxury
          </h1>
          <p className="mt-8 max-w-xl text-sm leading-relaxed text-white/56 sm:text-base">
            {summary.commerceAllowed
              ? 'The Signature Hoodie. Heavyweight construction, a restrained silhouette, and secure checkout through Shopify.'
              : 'A considered study in form, material and everyday utility.'}
          </p>
          <Link
            href="/shop"
            className="mt-9 inline-flex items-center gap-4 border-b border-white/35 pb-2 text-[10px] uppercase tracking-[0.3em] text-white/80 transition hover:border-white hover:text-white"
          >
            {catalogLabel}
            <ArrowRight className="h-4 w-4" strokeWidth={1.2} />
          </Link>
        </div>

        <figure className="relative min-h-[52vh] overflow-hidden bg-[#0a0a0a] lg:min-h-[78vh]">
          {heroMedia ? (
            <Image
              src={heroMedia.url}
              alt={heroMedia.alt}
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover object-center"
            />
          ) : (
            <Image
              src="/brand-boards/carlophillips-drop-board.png"
              alt="Archived CARLOPHILLIPS visual-system reference board"
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-contain object-center opacity-75"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/25" aria-hidden="true" />
          {!summary.commerceAllowed && (
            <figcaption className="absolute bottom-4 right-4 bg-black/82 px-3 py-2 text-[8px] uppercase tracking-[0.24em] text-white/58">
              {heroMedia ? heroMedia.label : 'Collection preview'}
            </figcaption>
          )}
        </figure>
      </div>
    </section>
  );
}

export function HomeReleaseStage({ summary }) {
  const product = summary.primaryProduct;

  if (product && summary.commerceAllowed) {
    return (
      <section className="storefront-panel min-h-screen border-b border-white/10 bg-[#f1f0ec] px-5 py-20 text-black sm:px-8 lg:px-12 lg:py-28" aria-label="Signature Hoodie">
        <div className="mx-auto flex min-h-[72vh] max-w-[1700px] flex-col justify-between">
          <div className="flex items-center justify-between border-b border-black/15 pb-5 text-[9px] uppercase tracking-[0.28em] text-black/48">
            <span>Signature Series</span>
            <span>Edition 001</span>
          </div>
          <div className="grid gap-12 py-20 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <h2 className="max-w-5xl text-5xl font-light leading-[0.88] tracking-[-0.065em] sm:text-8xl lg:text-[8.5rem]">
              {product.title}
            </h2>
            <div className="max-w-xl lg:pb-2">
              <p className="text-base leading-relaxed text-black/62 sm:text-lg">
                Current price and availability come directly from Shopify. Complete your purchase in Shopify’s secure checkout.
              </p>
              <Link href={product.href} className="mt-9 inline-flex items-center gap-4 border-b border-black/35 pb-2 text-[10px] uppercase tracking-[0.3em] text-black/80 transition hover:border-black">
                View the Hoodie <ArrowRight className="h-4 w-4" strokeWidth={1.2} />
              </Link>
            </div>
          </div>
          <p className="text-[9px] uppercase tracking-[0.28em] text-black/38">Available now / Black / XS–5XL</p>
        </div>
      </section>
    );
  }

  return (
    <section className="storefront-panel min-h-[82vh] border-b border-white/10 bg-black px-5 py-20 sm:px-8 lg:px-12 lg:py-28" aria-label="Current collection">
      <div className="mx-auto grid min-h-[62vh] max-w-[1700px] gap-px bg-white/10 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="flex flex-col justify-between bg-[#030303] p-7 sm:p-10 lg:p-14">
          <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.28em] text-white/38">
            <span>Current collection</span>
            <span>{summary.visibleCount > 0 ? 'Preview' : 'Coming soon'}</span>
          </div>
          <div className="py-20">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/42">
              {product ? 'Signature Series' : 'CARLOPHILLIPS'}
            </p>
            <h2 className="mt-7 max-w-4xl text-5xl font-light leading-[0.92] tracking-[-0.055em] sm:text-7xl lg:text-8xl">
              {product ? product.title : 'The next piece is taking shape.'}
            </h2>
            <p className="mt-8 max-w-2xl text-sm leading-relaxed text-white/52 sm:text-base">{summary.message}</p>
          </div>
          <div className="flex flex-wrap gap-6">
            {product && (
              <Link href={product.href} className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-white/78">
                View product <ArrowRight className="h-4 w-4" strokeWidth={1.2} />
              </Link>
            )}
            <Link href="/collections" className="text-[10px] uppercase tracking-[0.28em] text-white/46">
              View collection
            </Link>
          </div>
        </div>
        <aside className="grid bg-black sm:grid-cols-3 lg:grid-cols-1">
          {[
            ['Candidates', summary.candidateCount],
            ['Visible', summary.visibleCount],
            ['Withheld', summary.excludedCount],
          ].map(([label, value]) => (
            <div key={label} className="flex min-h-40 flex-col justify-between border-b border-white/10 p-7 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b lg:border-r-0">
              <span className="text-[9px] uppercase tracking-[0.28em] text-white/36">{label}</span>
              <strong className="text-5xl font-light text-white/75">{value}</strong>
            </div>
          ))}
        </aside>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 px-5 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1700px] flex-col gap-6 text-[9px] uppercase tracking-[0.28em] text-white/38 sm:flex-row sm:items-center sm:justify-between">
        <span>CARLOPHILLIPS</span>
        <nav className="flex gap-6" aria-label="Footer">
          <Link href="/shop">Shop</Link>
          <Link href="/collections">Collections</Link>
          <Link href="/bag">Bag</Link>
        </nav>
      </div>
    </footer>
  );
}

export default function HomeStorefront({ catalogSummary }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const summary = catalogSummary || fallbackSummary;

  return (
    <main id="main-content" className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Navigation onMenu={() => setMenuOpen(true)} />
      {menuOpen && <MenuOverlay onClose={() => setMenuOpen(false)} />}
      <Hero summary={summary} />
      <HomeReleaseStage summary={summary} />
      <Footer />
    </main>
  );
}

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
    <>
      <div className="fixed inset-x-0 top-0 z-40 h-7 border-b border-white/10 bg-black text-[8px] uppercase tracking-[0.34em] text-white/38">
        <div className="mx-auto flex h-full max-w-[1800px] items-center justify-center gap-12">
          <span className="text-white/70">CARLOPHILLIPS</span>
          <span>loveCarlo</span>
          <span>HouseOfCarlo</span>
        </div>
      </div>
      <header className="fixed inset-x-0 top-7 z-40 border-b border-white/10 bg-black/72 backdrop-blur-md">
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
    </>
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
    ? `${summary.commerceAllowed ? 'Shop' : 'Review'} ${summary.visibleCount} ${summary.visibleCount === 1 ? 'product' : 'products'}`
    : 'View release state';

  return (
    <section className="relative min-h-screen overflow-hidden border-b border-white/10 bg-black px-5 pb-14 pt-28 sm:px-8 lg:px-12 lg:pb-20">
      <div className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-[1800px] items-end gap-10 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative z-10 pb-3 lg:pb-12">
          <p className="mb-7 text-[10px] uppercase tracking-[0.34em] text-white/48">
            Signature Hoodie · first reusable proof
          </p>
          <h1 className="max-w-4xl text-[19vw] font-light leading-[0.82] tracking-[-0.075em] sm:text-[14vw] lg:text-[7.7vw]">
            Gesture of<br />Luxury
          </h1>
          <p className="mt-8 max-w-xl text-sm leading-relaxed text-white/56 sm:text-base">
            {summary.commerceAllowed
              ? 'Premium product presentation backed by current Shopify product facts, secure checkout, and POD fulfillment workflow.'
              : 'Nothing shown here grants purchase, publication, or fulfillment authority.'}
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
            <img
              src={heroMedia.url}
              alt={heroMedia.alt}
              className="absolute inset-0 h-full w-full object-cover object-center"
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
          <figcaption className="absolute bottom-4 right-4 bg-black/82 px-3 py-2 text-[8px] uppercase tracking-[0.24em] text-white/58">
            {heroMedia ? heroMedia.label : 'Visual-system reference · not product or media proof'}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

export function HomeReleaseStage({ summary }) {
  const product = summary.primaryProduct;

  return (
    <section className="min-h-[82vh] border-b border-white/10 bg-black px-5 py-20 sm:px-8 lg:px-12 lg:py-28" aria-label="Current release">
      <div className="mx-auto grid min-h-[62vh] max-w-[1700px] gap-px bg-white/10 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="flex flex-col justify-between bg-[#030303] p-7 sm:p-10 lg:p-14">
          <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.28em] text-white/38">
            <span>Current release</span>
            <span>{summary.visibleCount > 0 ? (summary.commerceAllowed ? 'Live' : 'Review visible') : 'Withheld'}</span>
          </div>
          <div className="py-20">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/42">
              {product ? product.sourceLabel : 'No release-eligible product'}
            </p>
            <h2 className="mt-7 max-w-4xl text-5xl font-light leading-[0.92] tracking-[-0.055em] sm:text-7xl lg:text-8xl">
              {product ? product.title : 'The product remains behind its release gate.'}
            </h2>
            <p className="mt-8 max-w-2xl text-sm leading-relaxed text-white/52 sm:text-base">{summary.message}</p>
          </div>
          <div className="flex flex-wrap gap-6">
            {product && (
              <Link href={product.href} className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-white/78">
                {product.commerceAllowed ? 'Shop product' : 'Review product'} <ArrowRight className="h-4 w-4" strokeWidth={1.2} />
              </Link>
            )}
            <Link href="/collections" className="text-[10px] uppercase tracking-[0.28em] text-white/46">
              Collection state
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

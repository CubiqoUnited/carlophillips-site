'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Menu, ShoppingBag, X } from 'lucide-react';

const brands = ['CARLOPHILLIPS', 'loveCarlo', 'HouseOfCarlo'];

const editorialPanels = [
  ['Apparel', 'Cut, weight, proportion.', 'The first apparel language is being edited around restraint and material presence.'],
  ['Objects', 'Useful things with silence.', 'Accessories and daily objects will enter only when form, finish, and use are resolved.'],
  ['Identity', 'A graphic system, not decoration.', 'Marks, scale, placement, and negative space are being treated as product decisions.'],
  ['Future drop', 'Release by approval.', 'Nothing enters the store until media, construction, fulfillment, and pricing are ready.'],
];

function fallbackSummary() {
  return {
    status: 'denied',
    candidateCount: 0,
    visibleCount: 0,
    excludedCount: 0,
    commerceAllowed: false,
    message: 'Catalog release state is unavailable on this editorial route.',
    primaryProduct: null,
  };
}

function Header({ onMenu, onBag }) {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1800px] items-center justify-between px-5 sm:px-8 lg:h-20 lg:px-12">
        <button
          type="button"
          onClick={onMenu}
          className="inline-flex h-11 w-11 items-center justify-center border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" strokeWidth={1.4} />
        </button>
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-xs tracking-[0.36em] text-white sm:text-sm md:hidden">
          CARLOPHILLIPS
        </Link>
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 text-[10px] uppercase tracking-[0.22em] text-white/45 md:flex" aria-label="Brand navigation">
          {brands.map(brand => (
            <Link key={brand} href={brand === 'CARLOPHILLIPS' ? '/' : '/about'} className="transition hover:text-white">
              {brand}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={onBag}
          className="inline-flex h-11 w-11 items-center justify-center border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white md:ml-8"
          aria-label="Open bag"
        >
          <ShoppingBag className="h-5 w-5" strokeWidth={1.4} />
        </button>
      </div>
    </header>
  );
}

function MenuOverlay({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/95 px-6 py-6 text-white">
      <div className="mx-auto flex max-w-[1600px] justify-between">
        <span className="text-xs tracking-[0.34em] text-white/60">CARLOPHILLIPS</span>
        <button type="button" onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center border border-white/15 text-white/70" aria-label="Close navigation">
          <X className="h-5 w-5" strokeWidth={1.4} />
        </button>
      </div>
      <nav className="mx-auto mt-24 grid max-w-[1600px] gap-5 text-5xl font-light tracking-[-0.04em] sm:text-7xl lg:text-8xl" aria-label="Main menu">
        <Link onClick={onClose} href="/">Home</Link>
        <Link onClick={onClose} href="/shop">First drop</Link>
        <Link onClick={onClose} href="/collections">Collections</Link>
        <Link onClick={onClose} href="/about">Studio</Link>
      </nav>
    </div>
  );
}

export function HomeReleaseSection({ summary }) {
  const product = summary.primaryProduct;
  return (
    <section className="border-b border-white/10 px-5 py-20 sm:px-8 lg:px-12 lg:py-28" aria-label="Current release state">
      <div className="mx-auto grid max-w-[1700px] gap-px bg-white/10 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="bg-[#050505] p-7 sm:p-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Release registry</p>
          <dl className="mt-16 grid grid-cols-3 gap-px bg-white/10 text-sm">
            {[
              ['Candidates', summary.candidateCount],
              ['Visible', summary.visibleCount],
              ['Withheld', summary.excludedCount],
            ].map(([label, value]) => (
              <div key={label} className="bg-[#050505] p-4">
                <dt className="text-[9px] uppercase tracking-[0.2em] text-white/30">{label}</dt>
                <dd className="mt-3 text-white/70">{value}</dd>
              </div>
            ))}
          </dl>
        </aside>
        <div className="flex min-h-[420px] flex-col justify-center bg-black p-7 sm:p-12 lg:p-16">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
            {product ? product.sourceLabel : 'No release-eligible product'}
          </p>
          <h2 className="mt-8 max-w-4xl text-5xl font-light leading-[0.94] tracking-[-0.055em] sm:text-7xl">
            {product ? product.title : 'The current candidate remains withheld.'}
          </h2>
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/52">{summary.message}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            {product && (
              <Link
                href={product.href}
                className="inline-flex min-h-12 items-center border border-white/20 px-6 text-[10px] uppercase tracking-[0.24em] text-white/70 transition hover:border-white hover:text-white"
              >
                Review product
              </Link>
            )}
            <Link href="/shop" className="inline-flex min-h-12 items-center px-6 text-[10px] uppercase tracking-[0.24em] text-white/45 transition hover:text-white">
              View catalog state
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomePage({ catalogSummary }) {
  const summary = catalogSummary || fallbackSummary();
  const catalogCta = summary.visibleCount > 0
    ? `Review ${summary.visibleCount} ${summary.visibleCount === 1 ? 'release candidate' : 'release candidates'}`
    : 'View release state';

  return (
    <>
      <section className="relative flex min-h-screen items-end overflow-hidden border-b border-white/10 px-5 pb-12 pt-28 sm:px-8 lg:px-12 lg:pb-16">
        <div className="absolute inset-0 opacity-70" aria-hidden="true">
          <div className="absolute left-[12%] top-24 h-[72vh] w-px bg-white/10" />
          <div className="absolute right-[18%] top-36 h-[56vh] w-px bg-white/10" />
          <div className="absolute bottom-[22%] left-0 right-0 h-px bg-white/10" />
        </div>
        <div className="relative z-10 grid w-full max-w-[1800px] gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="mb-8 text-[10px] uppercase tracking-[0.32em] text-white/45">Collection in preparation</p>
            <h1 className="max-w-5xl text-[18vw] font-light leading-[0.82] tracking-[-0.08em] sm:text-[15vw] lg:text-[9.5vw]">
              Gesture<br />of Luxury
            </h1>
          </div>
          <div className="max-w-xl lg:ml-auto">
            <p className="text-xl font-light leading-snug text-white/72 sm:text-2xl">
              An editorial product system for premium essentials, graphic restraint, and future-ready apparel.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop" className="inline-flex items-center justify-center gap-3 border border-white px-6 py-4 text-[10px] uppercase tracking-[0.24em] text-white transition hover:bg-white hover:text-black">
                {catalogCta}
                <ArrowRight className="h-4 w-4" strokeWidth={1.3} />
              </Link>
              <Link href="/about" className="inline-flex items-center justify-center border border-white/15 px-6 py-4 text-[10px] uppercase tracking-[0.24em] text-white/65 transition hover:border-white/45 hover:text-white">
                Enter the studio
              </Link>
            </div>
            <p className="mt-8 text-xs leading-relaxed text-white/35">{summary.message}</p>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
        <div className="mx-auto grid max-w-[1700px] gap-12 lg:grid-cols-[0.45fr_1fr]">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Editorial manifesto</p>
          <div>
            <h2 className="max-w-6xl text-5xl font-light leading-[0.95] tracking-[-0.055em] sm:text-7xl lg:text-8xl">Not merch. A product language.</h2>
            <div className="mt-12 grid gap-8 text-lg leading-relaxed text-white/58 md:grid-cols-3">
              <p>Built around restraint, proportion, and material presence.</p>
              <p>The first drop is being prepared with a slower threshold for approval.</p>
              <p>Nothing public should feel unfinished, inflated, or louder than the object itself.</p>
            </div>
          </div>
        </div>
      </section>

      <HomeReleaseSection summary={summary} />

      <section className="border-b border-white/10 px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1700px]">
          <p className="mb-5 text-[10px] uppercase tracking-[0.3em] text-white/40">Product system</p>
          <h2 className="mb-12 max-w-3xl text-4xl font-light tracking-[-0.045em] sm:text-6xl">Release architecture with a tighter threshold.</h2>
          <div className="grid gap-px bg-white/10 md:grid-cols-2 xl:grid-cols-4">
            {editorialPanels.map(([label, title, body], index) => (
              <article key={label} className="min-h-[360px] bg-[#050505] p-6 sm:p-8">
                <div className="mb-20 flex justify-between text-[10px] uppercase tracking-[0.26em] text-white/36">
                  <span>{label}</span><span>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="mb-5 text-2xl font-light tracking-[-0.035em]">{title}</h3>
                <p className="text-sm leading-relaxed text-white/50">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function AboutPage() {
  return (
    <section className="px-5 pb-28 pt-32 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1700px]">
        <p className="mb-8 text-[10px] uppercase tracking-[0.3em] text-white/40">Studio notes</p>
        <h1 className="max-w-6xl text-6xl font-light leading-[0.9] tracking-[-0.065em] sm:text-8xl lg:text-9xl">CARLOPHILLIPS is being composed.</h1>
        <div className="mt-20 grid gap-px bg-white/10 lg:grid-cols-3">
          {['Restraint', 'Proportion', 'Presence'].map(value => (
            <article key={value} className="min-h-[300px] bg-[#050505] p-8">
              <h2 className="mb-8 text-3xl font-light tracking-[-0.04em]">{value}</h2>
              <p className="text-sm leading-relaxed text-white/52">A working principle for future releases, applied before anything becomes public.</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BagOverlay({ onClose }) {
  return (
    <aside className="fixed bottom-0 right-0 top-0 z-50 flex w-full flex-col border-l border-white/10 bg-black p-6 text-white sm:w-[460px]" aria-label="Bag">
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <span className="text-[10px] uppercase tracking-[0.28em] text-white/55">Bag</span>
        <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center border border-white/15 text-white/70" aria-label="Close bag">
          <X className="h-4 w-4" strokeWidth={1.4} />
        </button>
      </div>
      <div className="flex flex-1 flex-col justify-center">
        <h2 className="text-4xl font-light tracking-[-0.045em]">No release is open.</h2>
        <p className="mt-6 text-sm leading-relaxed text-white/48">The bag remains inactive until the verified commerce gates pass.</p>
        <Link href="/bag" className="mt-8 text-[10px] uppercase tracking-[0.24em] text-white/60">View bag state</Link>
      </div>
    </aside>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 px-5 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1700px] flex-col justify-between gap-8 text-[10px] uppercase tracking-[0.24em] text-white/35 md:flex-row">
        <div className="flex flex-wrap gap-5">{brands.map(brand => <span key={brand}>{brand}</span>)}</div>
        <div className="flex gap-5"><Link href="/shop">Catalog state</Link><Link href="/bag">Bag</Link></div>
      </div>
    </footer>
  );
}

export default function AppShell({ homeCatalogSummary = null }) {
  const pathname = usePathname() || '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const isAbout = pathname.startsWith('/about') || pathname.startsWith('/lookbook');

  return (
    <main id="main-content" className="min-h-screen bg-[#020202] text-white selection:bg-white selection:text-black">
      <Header onMenu={() => setMenuOpen(true)} onBag={() => setBagOpen(true)} />
      {menuOpen && <MenuOverlay onClose={() => setMenuOpen(false)} />}
      {bagOpen && <BagOverlay onClose={() => setBagOpen(false)} />}
      {isAbout ? <AboutPage /> : <HomePage catalogSummary={homeCatalogSummary} />}
      <Footer />
    </main>
  );
}

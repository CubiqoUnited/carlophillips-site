'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { ArrowDown, ArrowRight, Menu, ShoppingBag, X } from 'lucide-react';

const fallbackSummary = {
  status: 'denied',
  candidateCount: 0,
  visibleCount: 0,
  excludedCount: 0,
  commerceAllowed: false,
  message: 'The catalog release state is unavailable.',
  primaryProduct: null,
};

const signatureRunwayFrames = [
  {
    src: '/products/signature-hoodie/candidates/moda/model-front-full.jpg',
    alt: 'CARLOPHILLIPS Signature Hoodie presented in a dark runway setting',
  },
  {
    src: '/products/signature-hoodie/candidates/moda/model-three-quarter.jpg',
    alt: 'Three-quarter runway presentation of the CARLOPHILLIPS Signature Hoodie',
  },
  {
    src: '/products/signature-hoodie/candidates/moda/model-side-profile.jpg',
    alt: 'Profile runway presentation of the CARLOPHILLIPS Signature Hoodie',
  },
];

const categoryTabs = ['Shirts', 'Outerwear', 'Bottoms', 'Accessories'];

const campaignHero = {
  src: '/campaigns/lofoten-runway-hero.jpg',
  alt: 'CARLOPHILLIPS runway campaign staged against a dramatic coastal mountain landscape',
};

function Navigation({ onMenu }) {
  return (
      <header className="cp-site-header fixed inset-x-0 top-0 z-40 backdrop-blur-md">
        <div className="cp-page-shell grid h-[var(--cp-header-height)] grid-cols-3 items-center">
          <button
            type="button"
            onClick={onMenu}
            className="cp-nav-action inline-flex w-fit items-center gap-3"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" strokeWidth={1.3} />
            <span className="hidden sm:inline">Menu</span>
          </button>
          <Link href="/" className="cp-wordmark justify-self-center">
            CARLOPHILLIPS
          </Link>
          <Link
            href="/bag"
            className="cp-nav-action inline-flex items-center gap-3 justify-self-end"
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

function CampaignHero() {
  return (
    <section
      className="storefront-panel cp-viewport-panel relative overflow-hidden"
      aria-label="CARLOPHILLIPS runway campaign"
    >
      <Image
        src={campaignHero.src}
        alt={campaignHero.alt}
        fill
        priority
        sizes="100vw"
        className="cp-campaign-image object-cover"
      />
      <div className="cp-campaign-scrim absolute inset-0" aria-hidden="true" />

      <div className="cp-page-shell relative z-10 flex min-h-[var(--cp-viewport-height)] flex-col justify-end pb-[var(--cp-panel-bottom)] pt-[calc(var(--cp-header-height)+3rem)]">
        <div className="max-w-4xl">
          <p className="cp-eyebrow mb-5">
            CARLOPHILLIPS / At the edge of life
          </p>
          <h1 className="cp-display max-w-5xl">
            At the<br />edge of life.
          </h1>
          <p className="cp-eyebrow mt-7">
            Runway 001 / Lofoten
          </p>
        </div>
        <a
          href="#signature-runway"
          className="cp-scroll-cue mt-10"
          aria-label="Scroll down to discover the Signature Hoodie"
        >
          <span>Discover the Signature Hoodie</span>
          <span className="inline-flex items-center gap-3" aria-hidden="true">
            Scroll down
            <ArrowDown className="cp-scroll-arrow h-4 w-4" strokeWidth={1.2} />
          </span>
        </a>
      </div>
    </section>
  );
}

function ProductRunwayHero({ summary }) {
  const heroMedia = summary.primaryProduct?.heroMedia || null;
  const signatureVisible = summary.visibleCount > 0
    && summary.primaryProduct?.href === '/products/carlophillips-signature-hoodie';
  const runwayReady = signatureVisible
    && (summary.commerceAllowed || summary.environment !== 'production');
  const catalogLabel = signatureVisible
    ? 'View the Signature Hoodie'
    : 'Explore the collection';

  return (
    <section
      id="signature-runway"
      className="storefront-panel cp-viewport-panel relative scroll-mt-[var(--cp-header-height)] overflow-hidden"
      aria-label="Signature Hoodie runway"
    >
      <figure className="absolute inset-0 overflow-hidden bg-[var(--cp-color-panel)]">
        {runwayReady ? (
          <>
            <Image
              src={signatureRunwayFrames[0].src}
              alt=""
              fill
              sizes="100vw"
              className="scale-110 object-cover object-center opacity-25 blur-2xl"
              aria-hidden="true"
            />
            {signatureRunwayFrames.map((frame, index) => (
              <Image
                key={frame.src}
                src={frame.src}
                alt={frame.alt}
                fill
                sizes="100vw"
                className={`runway-frame ${index === 0 ? 'runway-frame-primary' : ''} object-contain object-center`}
                style={{ animationDelay: `${index * -10}s` }}
              />
            ))}
          </>
        ) : heroMedia ? (
            <Image
              src={heroMedia.url}
              alt={heroMedia.alt}
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover object-center"
            />
        ) : (
            <Image
              src="/brand-boards/carlophillips-drop-board.png"
              alt="Archived CARLOPHILLIPS visual-system reference board"
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-contain object-center opacity-75"
            />
        )}
        <div className="cp-product-scrim absolute inset-0" aria-hidden="true" />
        {!summary.commerceAllowed && (
          <figcaption className="absolute bottom-5 right-5 bg-black/82 px-3 py-2 text-[8px] uppercase tracking-[0.24em] text-white/58">
            {runwayReady ? 'Private product preview' : heroMedia ? heroMedia.label : 'Collection preview'}
          </figcaption>
        )}
      </figure>

      <div className="cp-page-shell relative z-10 flex min-h-[var(--cp-viewport-height)] flex-col justify-end pb-[var(--cp-panel-bottom)] pt-[calc(var(--cp-header-height)+3rem)]">
        <div className="max-w-4xl">
          <p className="cp-eyebrow mb-5">
            {runwayReady ? 'Signature Series / Runway 001' : 'CARLOPHILLIPS / 001'}
          </p>
          <h2 className="cp-display uppercase">
            {runwayReady ? <>Signature<br />Hoodie</> : <>Form.<br />Function.</>}
          </h2>
          <p className="mt-7 max-w-md text-sm leading-relaxed text-white/66 sm:text-base">
            {runwayReady
              ? 'Heavyweight black fleece. Quiet signature detail. Built for every day.'
              : 'A considered study in form, material and everyday utility.'}
          </p>
          <Link
            href={runwayReady ? summary.primaryProduct.href : '/shop'}
            className="mt-8 inline-flex items-center gap-4 border-b border-white/45 pb-2 text-[10px] uppercase tracking-[0.3em] text-white transition hover:border-white"
          >
            {catalogLabel}
            <ArrowRight className="h-4 w-4" strokeWidth={1.2} />
          </Link>
        </div>
        {runwayReady && (
          <div className="mt-10 flex items-center justify-between border-t border-white/20 pt-4 text-[8px] uppercase tracking-[0.28em] text-white/48">
            <span>Black / XS–5XL</span>
            <span>Scroll to explore</span>
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryRail({ summary }) {
  const activeProduct = summary.visibleCount > 0
    && summary.primaryProduct?.href === '/products/carlophillips-signature-hoodie'
    ? summary.primaryProduct
    : null;

  return (
    <nav className="sticky top-16 z-30 overflow-hidden border-b border-white/10 bg-black/95 backdrop-blur-md lg:top-20" aria-label="Product categories">
      <div className="scrollbar-hide cp-page-shell flex h-14 items-center gap-8 overflow-x-auto lg:h-16">
        {activeProduct ? (
          <Link
            href={activeProduct.href}
            aria-current="page"
            className="flex h-full shrink-0 items-center border-b border-white text-[9px] uppercase tracking-[0.28em] text-white"
          >
            Hoodies
          </Link>
        ) : (
          <span aria-disabled="true" className="shrink-0 text-[9px] uppercase tracking-[0.28em] text-white/24">Hoodies</span>
        )}
        {categoryTabs.map(category => (
          <span key={category} aria-disabled="true" className="shrink-0 text-[9px] uppercase tracking-[0.28em] text-white/24">
            {category}
          </span>
        ))}
      </div>
    </nav>
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
          <div className="grid min-w-0 gap-12 py-20 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <h2 className="min-w-0 max-w-5xl break-words text-[clamp(2.35rem,10.5vw,4.5rem)] font-light leading-[0.88] tracking-[-0.065em] sm:text-8xl lg:text-[8.5rem]">
              {product.title}
            </h2>
            <div className="max-w-xl lg:pb-2">
              <p className="text-base leading-relaxed text-black/62 sm:text-lg">
                Heavyweight fleece. Quiet branding. A precise everyday silhouette, available in black from XS to 5XL.
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
      <div className="mx-auto grid min-h-[62vh] min-w-0 max-w-[1700px] gap-px bg-white/10 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="flex min-w-0 flex-col justify-between bg-[#030303] p-7 sm:p-10 lg:p-14">
          <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.28em] text-white/38">
            <span>Current collection</span>
            <span>{summary.visibleCount > 0 ? 'Preview' : 'Coming soon'}</span>
          </div>
          <div className="py-20">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/42">
              {product ? 'Signature Series' : 'CARLOPHILLIPS'}
            </p>
            <h2 className="mt-7 min-w-0 max-w-4xl break-words text-[clamp(2.35rem,10.5vw,4.5rem)] font-light leading-[0.92] tracking-[-0.055em] sm:text-7xl lg:text-8xl">
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
        <aside className="grid min-w-0 bg-black sm:grid-cols-3 lg:grid-cols-1">
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
    <main id="main-content" className="cp-site min-h-screen selection:bg-white selection:text-black">
      <Navigation onMenu={() => setMenuOpen(true)} />
      {menuOpen && <MenuOverlay onClose={() => setMenuOpen(false)} />}
      <CampaignHero />
      <ProductRunwayHero summary={summary} />
      <CategoryRail summary={summary} />
      <HomeReleaseStage summary={summary} />
      <Footer />
    </main>
  );
}

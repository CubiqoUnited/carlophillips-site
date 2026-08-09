'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, Expand, Menu, ShoppingBag, X } from 'lucide-react';
import { SIGNATURE_HOODIE_SHOWCASE_MEDIA } from '../../lib/media/signature-hoodie-showcase.js';

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

const signatureRunwayFrameClasses = [
  'runway-frame-primary',
  'runway-frame-secondary',
  'runway-frame-tertiary',
];

const categoryTabs = ['Shirts', 'Outerwear', 'Bottoms', 'Accessories'];

const campaignHero = {
  src: '/campaigns/lofoten-runway-hero.png',
  alt: 'CARLOPHILLIPS runway campaign staged against a dramatic coastal mountain landscape',
};

const signatureHomepagePresentation = {
  displayName: 'ONE',
  facts: [
    { label: 'Color', value: 'Black' },
    { label: 'Material', value: 'Structured fleece' },
    { label: 'Feel', value: 'Heavyweight, soft interior' },
  ],
};

function firstSentence(value, fallback) {
  const sentence = value?.trim().match(/^[^.!?]+[.!?]?/)?.[0];
  return sentence || fallback;
}

export function buildHomeGalleryMedia(summary) {
  const product = summary?.primaryProduct;
  const signatureVisible = summary?.visibleCount > 0
    && product?.href === '/products/carlophillips-signature-hoodie';
  if (!signatureVisible) return [];

  const releaseMedia = (product.media || []).map(item => ({
    ...item,
    src: item.url,
    disclosure: 'Product view',
  }));
  const reviewMedia = summary.environment === 'production'
    ? []
    : SIGNATURE_HOODIE_SHOWCASE_MEDIA.map(item => ({ ...item, type: 'image' }));
  const uniqueMedia = new Map();
  [...releaseMedia, ...reviewMedia].forEach(item => {
    const source = item.src || item.url;
    if (source && !uniqueMedia.has(source)) uniqueMedia.set(source, item);
  });
  return [...uniqueMedia.values()];
}

export function ProductMediaOverlay({ media, open, onClose, title }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const dialogRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setActiveIndex(0);
    requestAnimationFrame(() => {
      trackRef.current?.scrollTo({ left: 0 });
      dialogRef.current?.focus();
    });
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || media.length === 0) return null;

  const motionIndex = media.findIndex(item => item.gifHref || item.type === 'video');

  const moveTo = nextIndex => {
    const index = Math.max(0, Math.min(nextIndex, media.length - 1));
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
    setActiveIndex(index);
  };

  const handleScroll = event => {
    const track = event.currentTarget;
    if (!track.clientWidth) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActiveIndex(current => current === index ? current : index);
  };

  const handleKeyDown = event => {
    if (event.key === 'Escape') onClose();
    if (event.key === 'ArrowLeft') moveTo(activeIndex - 1);
    if (event.key === 'ArrowRight') moveTo(activeIndex + 1);
  };

  return (
    <section
      id="product-media-overlay"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-media-title"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className="cp-media-dialog fixed inset-0 flex items-center justify-center"
      data-product-media-overlay="open"
    >
      <div className="cp-media-panel relative overflow-hidden">
        <header className="cp-media-dialog-header absolute inset-x-0 top-0 flex h-[var(--cp-header-height)] items-center justify-between px-[var(--cp-page-gutter)]">
          <div className="flex items-center gap-4">
            <p className="cp-eyebrow hidden sm:block">Signature Series / Media</p>
            {motionIndex >= 0 && (
              <button
                type="button"
                onClick={() => moveTo(motionIndex)}
                className="cp-media-jump"
                aria-label="Jump to motion study"
              >
                Motion study
              </button>
            )}
            <h2 id="product-media-title" className="sr-only">{title} media viewer</h2>
          </div>
          <div className="flex items-center gap-5">
            <p className="cp-eyebrow" aria-live="polite">
              {String(activeIndex + 1).padStart(2, '0')} / {String(media.length).padStart(2, '0')}
            </p>
            <button type="button" onClick={onClose} className="cp-media-icon-button" aria-label="Close product media viewer">
              <X className="h-5 w-5" strokeWidth={1.2} />
            </button>
          </div>
        </header>

        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="cp-media-track scrollbar-hide flex h-full w-full overflow-x-auto"
          aria-label={`${title} media`}
        >
          {media.map((item, index) => {
            const source = item.src || item.url;
            const previewSource = item.previewUrl || source;
            return (
              <figure key={`${source}-${index}`} className="cp-media-slide relative h-full min-w-full snap-center">
                {item.type === 'video' ? (
                  <video
                    controls
                    preload="metadata"
                    poster={previewSource}
                    src={source}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Image
                    src={item.type === 'image' ? source : previewSource}
                    alt={item.alt}
                    fill
                    priority={index === 0}
                    sizes="90vw"
                    unoptimized={item.unoptimized}
                    className={`${item.fit || 'object-contain'} ${item.position || 'object-center'} p-0 sm:p-8`}
                  />
                )}
                <figcaption className="cp-media-caption absolute inset-x-0 bottom-0 z-10 flex flex-col items-start justify-end gap-2 px-[var(--cp-page-gutter)] py-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                  <span>{item.label}</span>
                  <span className="text-right">{item.disclosure}</span>
                </figcaption>
              </figure>
            );
          })}
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-between px-3 sm:px-8">
          <button
            type="button"
            onClick={() => moveTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            className="cp-media-arrow pointer-events-auto"
            aria-label="Previous product image"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={1.2} />
          </button>
          <button
            type="button"
            onClick={() => moveTo(activeIndex + 1)}
            disabled={activeIndex === media.length - 1}
            className="cp-media-arrow pointer-events-auto"
            aria-label="Next product image"
          >
            <ArrowRight className="h-5 w-5" strokeWidth={1.2} />
          </button>
        </div>
      </div>
    </section>
  );
}

function Navigation({ onMenu }) {
  return (
      <header className="cp-site-header fixed inset-x-0 top-0 backdrop-blur-md">
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
    <aside className="cp-menu-overlay fixed inset-0" aria-label="Site navigation">
      <div className="cp-menu-bar flex items-center justify-between">
        <span className="cp-menu-title">CARLOPHILLIPS</span>
        <button
          type="button"
          onClick={onClose}
          className="cp-menu-close"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" strokeWidth={1.3} />
        </button>
      </div>
      <nav className="cp-menu-links grid gap-4" aria-label="Main menu">
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
          <span className="cp-scroll-cue-label">Scroll and explore</span>
          <span className="cp-scroll-cue-control" aria-hidden="true">
            <ArrowDown className="cp-scroll-arrow h-5 w-5" strokeWidth={1.2} />
          </span>
        </a>
      </div>
    </section>
  );
}

function ProductRunwayHero({ galleryButtonRef, galleryCount, onOpenGallery, summary }) {
  const heroMedia = summary.primaryProduct?.heroMedia || null;
  const product = summary.primaryProduct;
  const signatureVisible = summary.visibleCount > 0
    && product?.href === '/products/carlophillips-signature-hoodie';
  const runwayReady = signatureVisible
    && (summary.commerceAllowed || summary.environment !== 'production');
  const galleryReady = runwayReady && galleryCount > 0;
  const productDescription = firstSentence(
    product?.description,
    'Product description is currently unavailable.'
  );

  return (
    <section
      id="signature-runway"
      className="storefront-panel cp-viewport-panel relative scroll-mt-[var(--cp-header-height)] overflow-hidden"
      aria-label="Signature Hoodie runway"
    >
      <figure className="cp-surface-panel absolute inset-0 overflow-hidden">
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
                className={`runway-frame ${signatureRunwayFrameClasses[index]} object-contain object-center`}
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
          <figcaption className="cp-disclosure absolute bottom-5 right-5 px-3 py-2">
            {runwayReady ? 'Private product preview' : heroMedia ? heroMedia.label : 'Collection preview'}
          </figcaption>
        )}
      </figure>

      {galleryReady ? (
        <button
          ref={galleryButtonRef}
          type="button"
          onClick={onOpenGallery}
          aria-haspopup="dialog"
          aria-controls="product-media-overlay"
          data-media-trigger="signature-hoodie"
          className="cp-product-media-button cp-product-media-button-corner"
        >
          <span>Explore media</span>
          <Expand className="cp-product-media-expand h-4 w-4" strokeWidth={1.2} aria-hidden="true" />
          <span className="text-right">{String(galleryCount).padStart(2, '0')} views</span>
        </button>
      ) : (
        <Link
          href="/shop"
          className="cp-product-media-button cp-product-media-button-corner"
        >
          <span>Explore the collection</span>
          <ArrowRight className="col-start-3 h-4 w-4 justify-self-end" strokeWidth={1.2} />
        </Link>
      )}

      <div className="cp-product-layout cp-page-shell relative z-10 flex min-h-[var(--cp-viewport-height)] flex-col">
        <div className="cp-product-copy max-w-2xl">
          <p className="cp-eyebrow mb-5">
            {runwayReady ? 'Signature Series / 001' : 'CARLOPHILLIPS / 001'}
          </p>
          <h2 className="cp-product-title">
            {runwayReady ? signatureHomepagePresentation.displayName : 'Form. Function.'}
          </h2>
          <p className="cp-product-review mt-5">
            {runwayReady ? productDescription : 'A considered study in form, material and everyday utility.'}
          </p>
          {runwayReady && (
            <ul className="cp-product-facts mt-6" aria-label="Product attributes">
              {signatureHomepagePresentation.facts.map(fact => (
                <li key={fact.label}>
                  <span className="cp-product-fact-label">{fact.label}</span>
                  <span className="cp-product-fact-value">{fact.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
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
    <nav className="cp-category-rail sticky top-16 z-30 overflow-hidden lg:top-20" aria-label="Product categories">
      <div className="scrollbar-hide cp-page-shell flex h-14 items-center gap-8 overflow-x-auto lg:h-16">
        {activeProduct ? (
          <Link
            href={activeProduct.href}
            aria-current="page"
            className="cp-category-item cp-category-item-active flex shrink-0 items-center"
          >
            Hoodies
          </Link>
        ) : (
          <span aria-disabled="true" className="cp-category-item shrink-0">Hoodies</span>
        )}
        {categoryTabs.map(category => (
          <span key={category} aria-disabled="true" className="cp-category-item shrink-0">
            {category}
          </span>
        ))}
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="cp-footer">
      <div className="cp-footer-inner flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
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
  const [mediaOpen, setMediaOpen] = useState(false);
  const galleryButtonRef = useRef(null);
  const wasMediaOpenRef = useRef(false);
  const summary = catalogSummary || fallbackSummary;
  const galleryMedia = useMemo(() => buildHomeGalleryMedia(summary), [summary]);

  useEffect(() => {
    if (wasMediaOpenRef.current && !mediaOpen) galleryButtonRef.current?.focus();
    wasMediaOpenRef.current = mediaOpen;
  }, [mediaOpen]);

  return (
    <main id="main-content" className="cp-site min-h-screen">
      <div inert={mediaOpen ? true : undefined}>
        <Navigation onMenu={() => setMenuOpen(true)} />
        {menuOpen && <MenuOverlay onClose={() => setMenuOpen(false)} />}
        <CampaignHero />
        <ProductRunwayHero
          galleryButtonRef={galleryButtonRef}
          galleryCount={galleryMedia.length}
          onOpenGallery={() => setMediaOpen(true)}
          summary={summary}
        />
        <CategoryRail summary={summary} />
        <Footer />
      </div>
      <ProductMediaOverlay
        media={galleryMedia}
        onClose={() => setMediaOpen(false)}
        open={mediaOpen}
        title={summary.primaryProduct?.title || 'Signature Hoodie'}
      />
    </main>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, Expand, Menu, ShoppingBag, X } from 'lucide-react';
import { SIGNATURE_HOODIE_SHOWCASE_MEDIA } from '../../lib/media/signature-hoodie-showcase.js';
import { designSystemRuntimeContract } from '../../lib/design-system/runtime-contract.js';

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
  'cp-runway-frame-primary',
  'cp-runway-frame-secondary',
  'cp-runway-frame-tertiary',
];

const categoryTabs = ['Shirts', 'Outerwear', 'Bottoms', 'Accessories'];
const dialogFocusableSelector = 'button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])';

const campaignHero = {
  src: '/campaigns/lofoten-runway-hero.png',
  alt: 'CARLOPHILLIPS runway campaign staged against a dramatic coastal mountain landscape',
};

const signatureHomepagePresentation = {
  displayName: 'ONE',
  description: 'Heavyweight black pullover hoodie with restrained CP chest embroidery.',
  facts: [
    'Black',
    'XS–5XL',
    'Heavyweight fleece',
    'CP embroidery',
  ],
};

export function isPreviewRunwayReference(summary) {
  return summary?.environment === 'preview'
    && summary?.visibleCount === 0
    && summary?.commerceAllowed === false;
}

function firstSentence(value, fallback) {
  const sentence = value?.trim().match(/^[^.!?]+[.!?]?/)?.[0];
  return sentence || fallback;
}

function lockDocumentScroll() {
  const root = document.documentElement;
  const body = document.body;
  const rootWasLocked = root.classList.contains('cp-scroll-locked');
  const bodyWasLocked = body.classList.contains('cp-scroll-locked');
  const preventScroll = event => event.preventDefault();

  root.classList.add('cp-scroll-locked');
  body.classList.add('cp-scroll-locked');
  window.addEventListener('wheel', preventScroll, { passive: false });

  return () => {
    window.removeEventListener('wheel', preventScroll);
    if (!rootWasLocked) root.classList.remove('cp-scroll-locked');
    if (!bodyWasLocked) body.classList.remove('cp-scroll-locked');
  };
}

function moveDialogFocus(event, dialog) {
  const focusable = [...(dialog?.querySelectorAll(dialogFocusableSelector) || [])];
  if (focusable.length === 0) return;

  event.preventDefault();
  const activeIndex = focusable.indexOf(document.activeElement);
  const nextIndex = activeIndex < 0
    ? event.shiftKey ? focusable.length - 1 : 0
    : (activeIndex + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
  focusable[nextIndex].focus();
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
    const releaseDocumentScroll = lockDocumentScroll();
    setActiveIndex(0);
    requestAnimationFrame(() => {
      trackRef.current?.scrollTo({ left: 0 });
      dialogRef.current?.querySelector(dialogFocusableSelector)?.focus();
    });
    return releaseDocumentScroll;
  }, [open]);

  const motionIndex = media.findIndex(item => item.gifHref || item.type === 'video');

  const moveTo = useCallback(nextIndex => {
    const index = Math.max(0, Math.min(nextIndex, media.length - 1));
    const track = trackRef.current;
    if (!track) return;
    const reducedMotion = window.matchMedia(designSystemRuntimeContract.media.reducedMotion).matches;
    track.scrollTo({
      left: index * track.clientWidth,
      behavior: reducedMotion
        ? designSystemRuntimeContract.behavior.instantScroll
        : designSystemRuntimeContract.behavior.smoothScroll,
    });
    setActiveIndex(index);
  }, [media.length]);

  const handleScroll = event => {
    const track = event.currentTarget;
    if (!track.clientWidth) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActiveIndex(current => current === index ? current : index);
  };

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        moveTo(activeIndex - 1);
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        moveTo(activeIndex + 1);
        return;
      }
      if (event.key === 'Tab') moveDialogFocus(event, dialogRef.current);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, moveTo, onClose, open]);

  if (!open || media.length === 0) return null;

  return (
    <section
      id="product-media-overlay"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-media-title"
      tabIndex={-1}
      className="cp-media-dialog"
      data-product-media-overlay="open"
    >
      <div className="cp-media-panel">
        <header className="cp-media-dialog-header">
          <div className="cp-media-header-group">
            <p className="cp-eyebrow cp-media-title-eyebrow">Signature Series / Media</p>
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
            <h2 id="product-media-title" className="cp-visually-hidden">{title} media viewer</h2>
          </div>
          <div className="cp-media-header-group cp-media-header-status">
            <p className="cp-eyebrow" aria-live="polite">
              {String(activeIndex + 1).padStart(2, '0')} / {String(media.length).padStart(2, '0')}
            </p>
            <button type="button" onClick={onClose} className="cp-media-icon-button" aria-label="Close product media viewer">
              <X className="cp-icon cp-icon-medium" />
            </button>
          </div>
        </header>

        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="cp-media-track cp-scrollbar-hide"
          aria-label={`${title} media`}
        >
          {media.map((item, index) => {
            const source = item.src || item.url;
            const previewSource = item.previewUrl || source;
            return (
              <figure key={`${source}-${index}`} className="cp-media-slide">
                {item.type === 'video' ? (
                  <video
                    controls
                    preload="metadata"
                    poster={previewSource}
                    src={source}
                    className="cp-media-asset cp-media-fit-contain"
                  />
                ) : (
                  <Image
                    src={item.type === 'image' ? source : previewSource}
                    alt={item.alt}
                    fill
                    priority={index === 0}
                    sizes={designSystemRuntimeContract.imageSizes.galleryAsset}
                    unoptimized={item.unoptimized}
                    className={`cp-media-asset cp-media-asset-image ${item.fit || 'cp-media-fit-contain'} ${item.position || 'cp-media-position-center'}`}
                  />
                )}
                <figcaption className="cp-media-caption">
                  <span>{item.label}</span>
                  <span className="cp-text-align-end">{item.disclosure}</span>
                </figcaption>
              </figure>
            );
          })}
        </div>

        <div className="cp-media-navigation">
          <button
            type="button"
            onClick={() => moveTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            className="cp-media-arrow"
            aria-label="Previous product image"
          >
            <ArrowLeft className="cp-icon cp-icon-medium" />
          </button>
          <button
            type="button"
            onClick={() => moveTo(activeIndex + 1)}
            disabled={activeIndex === media.length - 1}
            className="cp-media-arrow"
            aria-label="Next product image"
          >
            <ArrowRight className="cp-icon cp-icon-medium" />
          </button>
        </div>
      </div>
    </section>
  );
}

function Navigation({ menuButtonRef, menuOpen, onMenu }) {
  return (
      <header className="cp-site-header">
        <div className="cp-site-header-inner cp-page-shell">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={onMenu}
            className="cp-nav-action cp-nav-action-start"
            aria-label="Open navigation"
            aria-controls="site-menu-overlay"
            aria-expanded={menuOpen}
          >
            <Menu className="cp-icon cp-icon-small" />
            <span className="cp-nav-label">Menu</span>
          </button>
          <Link href="/" className="cp-wordmark">
            CARLOPHILLIPS
          </Link>
          <Link
            href="/bag"
            className="cp-nav-action cp-nav-action-end"
            aria-label="Bag"
          >
            <span className="cp-nav-label">Bag</span>
            <ShoppingBag className="cp-icon cp-icon-small" />
          </Link>
        </div>
      </header>
  );
}

function MenuOverlay({ onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const bodyHadMenuClass = document.body.classList.contains('cp-site-menu-open');
    const releaseDocumentScroll = lockDocumentScroll();
    document.body.classList.add('cp-site-menu-open');
    const focusDialog = window.requestAnimationFrame(() => {
      dialog?.querySelector(dialogFocusableSelector)?.focus();
    });

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      moveDialogFocus(event, dialog);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusDialog);
      window.removeEventListener('keydown', handleKeyDown);
      if (!bodyHadMenuClass) document.body.classList.remove('cp-site-menu-open');
      releaseDocumentScroll();
    };
  }, [onClose]);

  return (
    <aside
      id="site-menu-overlay"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-menu-title"
      className="cp-menu-overlay"
    >
      <div className="cp-menu-bar">
        <span id="site-menu-title" className="cp-menu-title">CARLOPHILLIPS</span>
        <button
          type="button"
          onClick={onClose}
          className="cp-menu-close"
          aria-label="Close navigation"
        >
          <X className="cp-icon cp-icon-medium" />
        </button>
      </div>
      <nav className="cp-menu-links" aria-label="Main menu">
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
      className="cp-storefront-panel cp-viewport-panel cp-campaign"
      aria-label="CARLOPHILLIPS runway campaign"
    >
      <Image
        src={campaignHero.src}
        alt={campaignHero.alt}
        fill
        priority
        sizes={designSystemRuntimeContract.imageSizes.fullViewport}
        className="cp-campaign-image"
      />
      <div className="cp-campaign-scrim" aria-hidden="true" />

      <div className="cp-campaign-content cp-page-shell">
        <div className="cp-campaign-copy">
          <p className="cp-eyebrow cp-space-after-label">
            CARLOPHILLIPS / At the edge of life
          </p>
          <h1 className="cp-display">
            At the<br />edge of life.
          </h1>
          <p className="cp-eyebrow cp-space-before-caption">
            Runway 001 / Lofoten
          </p>
        </div>
        <a
          href="#signature-runway"
          className="cp-scroll-cue"
          aria-label="Scroll down to discover the Signature Hoodie"
        >
          <span className="cp-scroll-cue-label">Scroll and explore</span>
          <span className="cp-scroll-cue-control" aria-hidden="true">
            <ArrowDown className="cp-scroll-arrow cp-icon cp-icon-medium" />
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
  const releaseRunwayReady = signatureVisible
    && (summary.commerceAllowed || summary.environment !== 'production');
  const previewReferenceReady = isPreviewRunwayReference(summary);
  const runwayVisualReady = releaseRunwayReady || previewReferenceReady;
  const galleryReady = releaseRunwayReady && galleryCount > 0;
  const productDescription = firstSentence(
    product?.description,
    signatureHomepagePresentation.description
  );

  return (
    <section
      id="signature-runway"
      className="cp-storefront-panel cp-viewport-panel cp-product-runway"
      aria-label="Signature Hoodie runway"
    >
      <figure className="cp-runway-media cp-surface-panel">
        {runwayVisualReady ? (
          <>
            <Image
              src={signatureRunwayFrames[0].src}
              alt=""
              fill
              sizes={designSystemRuntimeContract.imageSizes.fullViewport}
              className="cp-runway-backdrop"
              aria-hidden="true"
            />
            {signatureRunwayFrames.map((frame, index) => (
              <Image
                key={frame.src}
                src={frame.src}
                alt={frame.alt}
                fill
                sizes={designSystemRuntimeContract.imageSizes.fullViewport}
                className={`cp-runway-frame ${signatureRunwayFrameClasses[index]}`}
              />
            ))}
          </>
        ) : heroMedia ? (
            <Image
              src={heroMedia.url}
              alt={heroMedia.alt}
              fill
              sizes={designSystemRuntimeContract.imageSizes.productPanel}
              className="cp-media-fit-cover cp-media-position-center"
            />
        ) : (
            <Image
              src="/brand-boards/carlophillips-drop-board.png"
              alt="Archived CARLOPHILLIPS visual-system reference board"
              fill
              sizes={designSystemRuntimeContract.imageSizes.productPanel}
              className="cp-runway-fallback"
            />
        )}
        <div className="cp-product-scrim" aria-hidden="true" />
        {!summary.commerceAllowed && (
          <figcaption className="cp-disclosure">
            {previewReferenceReady
              ? 'Production visual reference · Preview only'
              : releaseRunwayReady
                ? 'Private product preview'
                : heroMedia ? heroMedia.label : 'Collection preview'}
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
          <Expand className="cp-product-media-expand cp-icon cp-icon-small" aria-hidden="true" />
          <span className="cp-text-align-end">{String(galleryCount).padStart(2, '0')} views</span>
        </button>
      ) : previewReferenceReady ? (
        <div
          aria-label="Production visual reference; product links and commerce are withheld in Preview"
          className="cp-product-media-button cp-product-media-button-corner"
          data-preview-reference="signature-hoodie"
        >
          <span>Production reference</span>
          <span aria-hidden="true">—</span>
          <span className="cp-text-align-end">Commerce withheld</span>
        </div>
      ) : (
        <Link
          href="/shop"
          className="cp-product-media-button cp-product-media-button-corner"
        >
          <span>Explore the collection</span>
          <ArrowRight className="cp-product-media-fallback-icon cp-icon cp-icon-small" />
        </Link>
      )}

      <div className="cp-product-layout cp-page-shell">
        <div className="cp-product-copy">
          <p className="cp-eyebrow cp-space-after-label">
            {runwayVisualReady ? 'Signature Series / 001' : 'CARLOPHILLIPS / 001'}
          </p>
          <h2 className="cp-product-title">
            {runwayVisualReady ? signatureHomepagePresentation.displayName : 'Form. Function.'}
          </h2>
          <p className="cp-product-review cp-space-before-review">
            {runwayVisualReady ? productDescription : 'A considered study in form, material and everyday utility.'}
          </p>
          {runwayVisualReady && (
            <ul className="cp-product-facts cp-space-before-facts" aria-label="Product highlights">
              {signatureHomepagePresentation.facts.map(fact => <li key={fact}>{fact}</li>)}
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
    <nav className="cp-category-rail" aria-label="Product categories">
      <div className="cp-scrollbar-hide cp-category-list cp-page-shell" tabIndex="0" aria-label="Collection categories">
        {activeProduct ? (
          <Link
            href={activeProduct.href}
            aria-current="page"
            className="cp-category-item cp-category-item-active"
          >
            Hoodies
          </Link>
        ) : (
          <span aria-disabled="true" className="cp-category-item">Hoodies</span>
        )}
        {categoryTabs.map(category => (
          <span key={category} aria-disabled="true" className="cp-category-item">
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
      <div className="cp-footer-inner">
        <span>CARLOPHILLIPS</span>
        <nav className="cp-footer-nav" aria-label="Footer">
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
  const menuButtonRef = useRef(null);
  const galleryButtonRef = useRef(null);
  const wasMenuOpenRef = useRef(false);
  const wasMediaOpenRef = useRef(false);
  const summary = catalogSummary || fallbackSummary;
  const galleryMedia = useMemo(() => buildHomeGalleryMedia(summary), [summary]);

  useEffect(() => {
    if (wasMenuOpenRef.current && !menuOpen) menuButtonRef.current?.focus();
    wasMenuOpenRef.current = menuOpen;
  }, [menuOpen]);

  useEffect(() => {
    if (wasMediaOpenRef.current && !mediaOpen) galleryButtonRef.current?.focus();
    wasMediaOpenRef.current = mediaOpen;
  }, [mediaOpen]);

  return (
    <main id="main-content" className="cp-site">
      <div inert={menuOpen || mediaOpen ? true : undefined}>
        <Navigation
          menuButtonRef={menuButtonRef}
          menuOpen={menuOpen}
          onMenu={() => setMenuOpen(true)}
        />
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
      {menuOpen && <MenuOverlay onClose={() => setMenuOpen(false)} />}
      <ProductMediaOverlay
        media={galleryMedia}
        onClose={() => setMediaOpen(false)}
        open={mediaOpen}
        title={summary.primaryProduct?.title || 'Signature Hoodie'}
      />
    </main>
  );
}

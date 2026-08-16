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

const signaturePreviewReferenceMedia = [
  ...SIGNATURE_HOODIE_SHOWCASE_MEDIA,
  {
    src: '/products/signature-hoodie/candidates/modelize/editorial-01.jpg',
    alt: 'Editorial visualisation of the CARLOPHILLIPS Signature Hoodie in a dark studio setting',
    label: 'Editorial study / one',
    fit: 'cp-media-fit-contain',
    position: 'cp-media-position-center',
    disclosure: 'AI-assisted preview',
  },
  {
    src: '/products/signature-hoodie/candidates/modelize/editorial-02.jpg',
    alt: 'Full-length editorial visualisation of the CARLOPHILLIPS Signature Hoodie',
    label: 'Editorial study / two',
    fit: 'cp-media-fit-contain',
    position: 'cp-media-position-center',
    disclosure: 'AI-assisted preview',
  },
  {
    src: '/products/signature-hoodie/candidates/ai-assisted/on-model-front-study.png',
    alt: 'Front on-model visual study of the CARLOPHILLIPS Signature Hoodie',
    label: 'On-body / front study',
    fit: 'cp-media-fit-contain',
    position: 'cp-media-position-center',
    disclosure: 'AI-assisted preview',
  },
  {
    src: '/products/signature-hoodie/candidates/ai-assisted/back-flatlay-hypothesis.png',
    alt: 'Back flat-lay hypothesis of the CARLOPHILLIPS Signature Hoodie',
    label: 'Back flat-lay study',
    fit: 'cp-media-fit-contain',
    position: 'cp-media-position-center',
    disclosure: 'Unverified back visualisation',
  },
];

const productCategories = [
  { label: 'Hoodies', href: '/products/carlophillips-signature-hoodie' },
  { label: 'T-Shirts', href: '/shop?category=t-shirts' },
  { label: 'Shirts', href: '/shop?category=shirts' },
  { label: 'Outerwear', href: '/shop?category=outerwear' },
  { label: 'Trousers', href: '/shop?category=trousers' },
  { label: 'Accessories', href: '/shop?category=accessories' },
];
const dialogFocusableSelector = 'button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])';

const campaignHero = {
  src: '/campaigns/lofoten-runway-hero.png',
  alt: 'CARLOPHILLIPS runway campaign staged against a dramatic coastal mountain landscape',
};

const signatureHomepagePresentation = {
  displayName: 'ONE',
  description: 'Heavyweight black pullover hoodie with restrained CP chest embroidery.',
  facts: [
    { label: 'Color', value: 'Black' },
    { label: 'Material', value: 'Structured fleece' },
    { label: 'Feel', value: 'Heavyweight, soft interior' },
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
  if (isPreviewRunwayReference(summary)) {
    return signaturePreviewReferenceMedia.map(item => ({ ...item, type: 'image' }));
  }

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
  const [motionPlaying, setMotionPlaying] = useState(false);
  const dialogRef = useRef(null);
  const trackRef = useRef(null);
  const motionNavigationPendingRef = useRef(false);

  const motionIndex = media.findIndex(item => item.gifHref || item.type === 'video');

  useEffect(() => {
    if (!open) return undefined;
    const releaseDocumentScroll = lockDocumentScroll();
    setActiveIndex(0);
    setMotionPlaying(false);
    motionNavigationPendingRef.current = false;
    requestAnimationFrame(() => {
      trackRef.current?.scrollTo({ left: 0 });
      dialogRef.current?.querySelector(dialogFocusableSelector)?.focus();
    });
    return releaseDocumentScroll;
  }, [open]);

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
    if (index !== motionIndex && !motionNavigationPendingRef.current) setMotionPlaying(false);
    setActiveIndex(index);
  }, [media.length, motionIndex]);

  const handleScroll = event => {
    const track = event.currentTarget;
    if (!track.clientWidth) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    if (index === motionIndex) motionNavigationPendingRef.current = false;
    else if (!motionNavigationPendingRef.current) setMotionPlaying(false);
    setActiveIndex(current => current === index ? current : index);
  };

  const handleMotionControl = () => {
    if (activeIndex !== motionIndex) {
      motionNavigationPendingRef.current = true;
      setMotionPlaying(true);
      moveTo(motionIndex);
      return;
    }
    setMotionPlaying(current => !current);
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
                onClick={handleMotionControl}
                className="cp-media-jump"
                aria-label={activeIndex === motionIndex
                  ? motionPlaying ? 'Pause motion study' : 'Play motion study'
                  : 'Jump to motion study'}
                aria-pressed={activeIndex === motionIndex && motionPlaying}
              >
                {activeIndex === motionIndex
                  ? motionPlaying ? 'Pause motion' : 'Play motion'
                  : 'Motion study'}
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
            const isStillDerivedMotion = Boolean(item.gifHref);
            const displayedImageSource = isStillDerivedMotion
              ? motionPlaying && activeIndex === index ? item.gifHref : item.posterSrc || previewSource
              : item.type === 'image' ? source : previewSource;
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
                    src={displayedImageSource}
                    alt={item.alt}
                    fill
                    priority={index === 0}
                    sizes={designSystemRuntimeContract.imageSizes.galleryAsset}
                    unoptimized={item.unoptimized}
                    className={`cp-media-asset cp-media-asset-image ${item.fit || 'cp-media-fit-contain'} ${item.position || 'cp-media-position-center'}`}
                  />
                )}
                {!isStillDerivedMotion && (
                  <figcaption className="cp-media-caption">
                    <span>{item.label}</span>
                    <span className="cp-text-align-end">{item.disclosure}</span>
                  </figcaption>
                )}
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
    const releaseDocumentScroll = lockDocumentScroll();
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
        {productCategories.map(category => (
          <Link key={category.label} onClick={onClose} href={category.href}>
            {category.label}
          </Link>
        ))}
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
  const galleryReady = (releaseRunwayReady || previewReferenceReady) && galleryCount > 0;
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
              priority
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
                priority={index === 0}
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
        {!summary.commerceAllowed && !previewReferenceReady && (
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
        null
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

function Footer() {
  return (
    <footer className="cp-footer">
      <div className="cp-footer-inner">
        <span>CARLOPHILLIPS</span>
        <nav className="cp-footer-nav" aria-label="Footer">
          <Link href="/shop">Shop</Link>
          <Link href="/collections">Collections</Link>
          <Link href="/bag">Bag</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/cookie-policy">Cookies</Link>
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

'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, Check, Expand, Menu, Minus, Pause, Play, Plus, Ruler, ShoppingBag, X } from 'lucide-react';
import { SIGNATURE_HOODIE_SHOWCASE_MEDIA } from '../../lib/media/signature-hoodie-showcase.js';
import { designSystemRuntimeContract } from '../../lib/design-system/runtime-contract.js';
import { money, offeredVariants, sizeFor } from '../commerce/shopify-checkout-form.jsx';

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

const signatureApprovedStagingVideos = [
  {
    type: 'video',
    src: '/media/signature-hoodie/videos/runway-motion-final.mp4',
    posterSrc: '/media/signature-hoodie/posters/runway-motion-final.jpg',
    previewUrl: '/media/signature-hoodie/posters/runway-motion-final.jpg',
    alt: 'AI editorial runway motion showing the black CARLOPHILLIPS Signature Hoodie in a concrete studio',
    label: 'Runway motion',
    disclosure: 'AI editorial · Staging approved',
    hideCaption: true,
  },
  {
    type: 'video',
    src: '/media/signature-hoodie/videos/fit-silhouette-final.mp4',
    posterSrc: '/media/signature-hoodie/posters/fit-silhouette-final.jpg',
    previewUrl: '/media/signature-hoodie/posters/fit-silhouette-final.jpg',
    alt: 'AI editorial fit and silhouette study of the black CARLOPHILLIPS Signature Hoodie in a concrete studio',
    label: 'Fit & silhouette',
    disclosure: 'AI editorial · Staging approved',
    hideCaption: true,
  },
];

const signatureSpinAsset = {
  type: 'image',
  src: '/products/signature-hoodie/candidates/ai-assisted/still-derived-motion-study.webp',
  gifHref: '/products/signature-hoodie/candidates/ai-assisted/still-derived-motion-study.gif',
  posterSrc: '/products/signature-hoodie/candidates/ai-assisted/still-derived-motion-study-poster.webp',
  previewUrl: '/products/signature-hoodie/candidates/ai-assisted/still-derived-motion-study.webp',
  alt: 'AI-assisted still-derived motion study cycling through the CARLOPHILLIPS Signature Hoodie visualisations',
  label: 'Still-derived motion loop',
  disclosure: 'AI-assisted still-derived motion',
  hideCaption: true,
};

const signatureHeroSequence = [
  ...signatureApprovedStagingVideos,
  signatureSpinAsset,
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
const motionPreferenceKey = 'cp-signature-motion-paused';

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

function useDialogLifecycle({ open, onClose, dialogRef, trapFocus = true }) {
  useEffect(() => {
    if (!open) return undefined;
    const releaseDocumentScroll = lockDocumentScroll();
    const focusDialog = window.requestAnimationFrame(() => {
      if (trapFocus) dialogRef.current?.querySelector(dialogFocusableSelector)?.focus();
    });
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (trapFocus && event.key === 'Tab') moveDialogFocus(event, dialogRef.current);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusDialog);
      window.removeEventListener('keydown', handleKeyDown);
      releaseDocumentScroll();
    };
  }, [dialogRef, onClose, open, trapFocus]);
}

export function buildHomeGalleryMedia(summary) {
  if (isPreviewRunwayReference(summary)) {
    return [
      ...signaturePreviewReferenceMedia.map(item => ({ ...item, type: 'image' })),
      ...signatureApprovedStagingVideos,
    ];
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
    : [
        ...SIGNATURE_HOODIE_SHOWCASE_MEDIA.map(item => ({ ...item, type: 'image' })),
        ...signatureApprovedStagingVideos,
      ];
  const uniqueMedia = new Map();
  [...releaseMedia, ...reviewMedia].forEach(item => {
    const source = item.src || item.url;
    if (source && !uniqueMedia.has(source)) uniqueMedia.set(source, item);
  });
  return [...uniqueMedia.values()];
}

export function ProductMediaOverlay({ activeIndex = 0, interactive = true, media, onActiveIndex = () => {}, onClose, onOrder = null, open, priceLabel = '', title }) {
  const [motionPlaying, setMotionPlaying] = useState(false);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const [autoSuspended, setAutoSuspended] = useState(false);
  const dialogRef = useRef(null);
  const trackRef = useRef(null);
  const motionNavigationPendingRef = useRef(false);
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  const motionIndex = media.findIndex(item => item.gifHref || item.type === 'video');
  const videoIndexes = media
    .map((item, index) => item.type === 'video' ? index : -1)
    .filter(index => index >= 0);

  useEffect(() => {
    if (!open) return undefined;
    const releaseDocumentScroll = lockDocumentScroll();
    setMotionPlaying(false);
    setAutoPlaying(false);
    motionNavigationPendingRef.current = false;
    requestAnimationFrame(() => {
      trackRef.current?.scrollTo({ left: activeIndexRef.current * (trackRef.current?.clientWidth || 0) });
      dialogRef.current?.querySelector(dialogFocusableSelector)?.focus();
    });
    return releaseDocumentScroll;
  }, [open]);

  useEffect(() => {
    dialogRef.current?.querySelectorAll('video').forEach(video => {
      if (Number(video.dataset.mediaIndex) !== activeIndex) video.pause();
    });
  }, [activeIndex]);

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
    onActiveIndex(index);
  }, [media.length, motionIndex, onActiveIndex]);

  const handleScroll = event => {
    const track = event.currentTarget;
    if (!track.clientWidth) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    if (index === motionIndex) motionNavigationPendingRef.current = false;
    else if (!motionNavigationPendingRef.current) setMotionPlaying(false);
    if (activeIndex !== index) onActiveIndex(index);
  };

  const handleManualMove = useCallback(nextIndex => {
    setAutoPlaying(false);
    moveTo(nextIndex);
  }, [moveTo]);

  useEffect(() => {
    if (!open || !interactive || !autoPlaying || autoSuspended || media.length < 2) return undefined;
    const interval = window.setInterval(() => {
      moveTo((activeIndex + 1) % media.length);
    }, designSystemRuntimeContract.behavior.galleryAutoplayMs);
    return () => window.clearInterval(interval);
  }, [activeIndex, autoPlaying, autoSuspended, interactive, media.length, moveTo, open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleVisibility = () => setAutoSuspended(document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [open]);

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
    if (!open || !interactive) return undefined;
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handleManualMove(activeIndex - 1);
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleManualMove(activeIndex + 1);
        return;
      }
      if (event.key === 'Tab') moveDialogFocus(event, dialogRef.current);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, handleManualMove, interactive, onClose, open]);

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
      inert={interactive ? undefined : true}
    >
      <div className="cp-media-panel">
        <header className="cp-media-dialog-header">
          <div className="cp-media-header-group">
            <p className="cp-eyebrow cp-media-title-eyebrow">Signature Series / Media</p>
            {videoIndexes.map(index => (
              <button
                key={media[index].label}
                type="button"
                onClick={() => handleManualMove(index)}
                className="cp-media-jump"
                aria-label={`Show ${media[index].label}`}
                aria-pressed={activeIndex === index}
              >
                {media[index].label}
              </button>
            ))}
            {videoIndexes.length === 0 && motionIndex >= 0 && (
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
            <button
              type="button"
              className="cp-media-auto-control"
              onClick={() => setAutoPlaying(current => !current)}
              aria-pressed={autoPlaying}
            >
              {autoPlaying ? <Pause className="cp-icon cp-icon-small" /> : <Play className="cp-icon cp-icon-small" />}
              <span>{autoPlaying ? 'Pause auto' : 'Play auto'}</span>
            </button>
            <p className="cp-eyebrow" aria-live="polite">
              {String(activeIndex + 1).padStart(2, '0')} / {String(media.length).padStart(2, '0')}
            </p>
            {onOrder && <button type="button" onClick={onOrder} className="cp-media-order-action">Order — {priceLabel}</button>}
            <button type="button" onClick={onClose} className="cp-media-icon-button" aria-label="Close product media viewer">
              <X className="cp-icon cp-icon-medium" />
            </button>
          </div>
        </header>

        <div
          ref={trackRef}
          onScroll={handleScroll}
          onMouseEnter={() => setAutoSuspended(true)}
          onMouseLeave={() => setAutoSuspended(false)}
          onFocusCapture={() => setAutoSuspended(true)}
          onBlurCapture={event => {
            if (!event.currentTarget.contains(event.relatedTarget)) setAutoSuspended(false);
          }}
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
                    poster={item.posterSrc || previewSource}
                    src={source}
                    data-media-index={index}
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
                {!isStillDerivedMotion && !item.hideCaption && (
                  <figcaption className="cp-media-caption">
                    <span>{item.label}</span>
                    <span className="cp-text-align-end">{item.disclosure}</span>
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>

        {autoPlaying && (
          <div className="cp-media-auto-progress" data-auto-suspended={autoSuspended} aria-label="Automatic gallery advances every five seconds">
            <span>Auto · 5 sec</span>
            <span className="cp-media-auto-progress-track" aria-hidden="true">
              <span key={activeIndex} className={autoSuspended ? 'cp-media-auto-progress-fill cp-motion-paused' : 'cp-media-auto-progress-fill'} />
            </span>
          </div>
        )}

        <div className="cp-media-navigation">
          <button
            type="button"
            onClick={() => handleManualMove(activeIndex - 1)}
            disabled={activeIndex === 0}
            className="cp-media-arrow"
            aria-label="Previous product image"
          >
            <ArrowLeft className="cp-icon cp-icon-medium" />
          </button>
          <button
            type="button"
            onClick={() => handleManualMove(activeIndex + 1)}
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

function ProductRunwayHero({ galleryButtonRef, galleryCount, motionAsset, motionSuspended, onOpenGallery, onOpenOrder, priceLabel, purchaseReady, summary }) {
  const sectionRef = useRef(null);
  const motionVideoRef = useRef(null);
  const [inMotionRange, setInMotionRange] = useState(true);
  const [pageActive, setPageActive] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [motionCompleted, setMotionCompleted] = useState(false);
  const [heroSequenceIndex, setHeroSequenceIndex] = useState(0);
  const heroVideos = signatureHeroSequence;
  const currentHeroVideo = heroVideos[heroSequenceIndex] || motionAsset;
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
  const motionPlaying = runwayVisualReady
    && inMotionRange
    && pageActive
    && !reducedMotion
    && !userPaused
    && !motionCompleted
    && !motionSuspended;

  useEffect(() => {
    const mediaQuery = window.matchMedia(designSystemRuntimeContract.media.reducedMotion);
    setReducedMotion(mediaQuery.matches);
    const handlePreference = event => {
      setReducedMotion(event.matches);
      if (event.matches) setUserPaused(true);
    };
    mediaQuery.addEventListener('change', handlePreference);
    return () => mediaQuery.removeEventListener('change', handlePreference);
  }, []);

  useEffect(() => {
    const video = motionVideoRef.current;
    if (!video) return;
    if (motionPlaying) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      video.pause();
    }
  }, [motionPlaying, heroSequenceIndex]);

  useEffect(() => {
    const target = sectionRef.current;
    if (!target) return undefined;
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (!entry) return;
        setInMotionRange(entry.isIntersecting || entry.intersectionRatio >= 0.6 || entry.intersectionRatio > 0);
      },
      { threshold: [0, 0.1, 0.6, 1] }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleVisibility = () => setPageActive(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    if (motionCompleted && !userPaused) {
      const timer = window.setTimeout(() => {
        setHeroSequenceIndex(prev => (prev + 1) % heroVideos.length);
        setMotionCompleted(false);
      }, 400);
      return () => window.clearTimeout(timer);
    }
  }, [motionCompleted, userPaused, heroVideos.length]);

  useEffect(() => {
    if (currentHeroVideo?.gifHref && motionPlaying) {
      const timer = window.setTimeout(() => {
        setMotionCompleted(true);
      }, 5000);
      return () => window.clearTimeout(timer);
    }
  }, [currentHeroVideo?.gifHref, motionPlaying, heroSequenceIndex]);

  const toggleMotion = () => {
    if (motionCompleted) {
      if (motionVideoRef.current) motionVideoRef.current.currentTime = 0;
      setMotionCompleted(false);
      setUserPaused(false);
      window.sessionStorage.setItem(motionPreferenceKey, 'false');
      return;
    }
    setUserPaused(current => {
      const next = !current;
      window.sessionStorage.setItem(motionPreferenceKey, String(next));
      return next;
    });
  };

  return (
    <section
      ref={sectionRef}
      id="signature-runway"
      className={motionPlaying
        ? 'cp-storefront-panel cp-viewport-panel cp-product-runway'
        : 'cp-storefront-panel cp-viewport-panel cp-product-runway cp-runway-motion-paused'}
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
            {currentHeroVideo?.type === 'video' ? (
              <video
                key={currentHeroVideo?.src || motionAsset.src}
                ref={motionVideoRef}
                src={currentHeroVideo?.src || currentHeroVideo?.url || motionAsset.src || motionAsset.url}
                poster={currentHeroVideo?.posterSrc || currentHeroVideo?.previewUrl || motionAsset.posterSrc || motionAsset.previewUrl}
                autoPlay
                muted
                playsInline
                preload="auto"
                onLoadedMetadata={(e) => {
                  e.currentTarget.muted = true;
                  if (motionPlaying) e.currentTarget.play().catch(() => {});
                }}
                onCanPlay={(e) => {
                  e.currentTarget.muted = true;
                  if (motionPlaying) e.currentTarget.play().catch(() => {});
                }}
                onEnded={() => setMotionCompleted(true)}
                className="cp-runway-live-motion"
                aria-label={currentHeroVideo?.alt || motionAsset.alt}
              />
            ) : currentHeroVideo?.gifHref || motionAsset?.gifHref ? (
              <Image
                src={motionPlaying ? (currentHeroVideo?.gifHref || motionAsset.gifHref) : (currentHeroVideo?.posterSrc || motionAsset.posterSrc || currentHeroVideo?.src || motionAsset.src)}
                alt={currentHeroVideo?.alt || motionAsset.alt}
                fill
                priority
                unoptimized
                sizes={designSystemRuntimeContract.imageSizes.fullViewport}
                className="cp-runway-live-motion"
              />
            ) : signatureRunwayFrames.map((frame, index) => (
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
        <div className="cp-product-actions-corner">
          {purchaseReady && (
            <button type="button" onClick={onOpenOrder} className="cp-product-order-button">
              Order — {priceLabel}
            </button>
          )}
          <button
            ref={galleryButtonRef}
            type="button"
            onClick={onOpenGallery}
            aria-haspopup="dialog"
            aria-controls="product-media-overlay"
            data-media-trigger="signature-hoodie"
            className="cp-product-media-button"
          >
            <span>View gallery</span>
            <Expand className="cp-product-media-expand cp-icon cp-icon-small" aria-hidden="true" />
            <span className="cp-text-align-end">{String(galleryCount).padStart(2, '0')}</span>
          </button>
        </div>
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

      {runwayVisualReady && (
        <div className="cp-motion-control-group">
          <span className="cp-motion-status" aria-live="polite">
            Runway motion · {motionPlaying ? 'playing' : motionCompleted ? 'complete' : 'paused'}
          </span>
          <button type="button" className="cp-motion-control" onClick={toggleMotion} aria-pressed={!motionPlaying} data-motion-control="true">
            {motionPlaying ? <Pause className="cp-icon cp-icon-small" /> : <Play className="cp-icon cp-icon-small" />}
            <span>{motionPlaying ? 'Pause motion' : motionCompleted ? 'Replay motion' : 'Play motion'}</span>
          </button>
          <span className={motionPlaying ? 'cp-motion-timeline' : 'cp-motion-timeline cp-motion-paused'} aria-hidden="true">
            <span />
          </span>
        </div>
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
      {purchaseReady && (
        <div className="cp-mobile-purchase-bar">
          <button type="button" onClick={onOpenOrder}>Select size</button>
          <button type="button" onClick={onOpenOrder}>Order now — {priceLabel}</button>
        </div>
      )}
    </section>
  );
}

function SizeChoices({ onSelect, selectedHash, variants }) {
  return (
    <div className="cp-home-size-grid" role="radiogroup" aria-label="Choose size">
      {variants.map(variant => (
        <button
          key={variant.referenceHash}
          type="button"
          role="radio"
          aria-checked={selectedHash === variant.referenceHash}
          className={selectedHash === variant.referenceHash ? 'cp-home-size-choice cp-home-size-choice-selected' : 'cp-home-size-choice'}
          onClick={() => onSelect(variant.referenceHash)}
        >
          {sizeFor(variant).toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function SizeFitDrawer({ onClose, open }) {
  const dialogRef = useRef(null);
  useDialogLifecycle({ open, onClose, dialogRef });
  if (!open) return null;
  return (
    <aside ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="size-fit-title" className="cp-side-drawer cp-size-fit-drawer">
      <header className="cp-drawer-header">
        <div>
          <p className="cp-eyebrow">Fit guide</p>
          <h2 id="size-fit-title" className="cp-drawer-title">Size &amp; Fit</h2>
        </div>
        <button type="button" onClick={onClose} className="cp-media-icon-button" aria-label="Close size and fit guide"><X className="cp-icon cp-icon-medium" /></button>
      </header>
      <div className="cp-drawer-body">
        <p className="cp-fit-heading">Regular fit</p>
        <p className="cp-fit-copy">Designed with room through the chest and body. Choose your usual size for the intended structured silhouette.</p>
        <div className="cp-fit-sizes" aria-label="Offered sizes"><span>S</span><span>M</span><span>L</span></div>
        <details className="cp-fit-detail" open>
          <summary>Garment measurements <Plus className="cp-icon cp-icon-small" /><Minus className="cp-icon cp-icon-small" /></summary>
          <p>Compare a favourite hoodie laid flat. Measure chest from underarm to underarm and length from shoulder to hem.</p>
        </details>
        <details className="cp-fit-detail">
          <summary>How to measure <Plus className="cp-icon cp-icon-small" /><Minus className="cp-icon cp-icon-small" /></summary>
          <p>Keep the tape level and relaxed. If you are between sizes, size up for a looser fit.</p>
        </details>
      </div>
    </aside>
  );
}

export function OrderTray({ handle, interactive = true, onAddToBag, onClose, onOpenSizeFit, open, onSelect, priceLabel, selectedHash, variants }) {
  const dialogRef = useRef(null);
  useDialogLifecycle({ open: open && interactive, onClose, dialogRef, trapFocus: interactive });
  const selected = variants.find(item => item.referenceHash === selectedHash) || null;
  if (!open) return null;
  return (
    <aside ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="order-tray-title" className="cp-side-drawer cp-order-tray" inert={interactive ? undefined : true}>
      <header className="cp-drawer-header">
        <div>
          <p className="cp-eyebrow">Signature Series / 001</p>
          <h2 id="order-tray-title" className="cp-drawer-title">ONE</h2>
        </div>
        <button type="button" onClick={onClose} className="cp-media-icon-button" aria-label="Close order panel"><X className="cp-icon cp-icon-medium" /></button>
      </header>
      <div className="cp-drawer-body cp-order-body">
        <p className="cp-order-price">{priceLabel}</p>
        <p className="cp-order-copy">Heavyweight black pullover hoodie with restrained CP chest embroidery.</p>
        <div className="cp-order-size-heading">
          <span>Select size</span>
          <button type="button" onClick={onOpenSizeFit}><Ruler className="cp-icon cp-icon-small" /> Size &amp; Fit</button>
        </div>
        <SizeChoices variants={variants} selectedHash={selectedHash} onSelect={onSelect} />
        <div className="cp-order-actions">
          <button type="button" disabled={!selected} className="cp-order-secondary" onClick={() => onAddToBag(selected)}>Add to bag</button>
          <form method="post" action="/api/checkout">
            <input type="hidden" name="handle" value={handle} />
            <input type="hidden" name="referenceHash" value={selectedHash} />
            <input type="hidden" name="quantity" value="1" />
            <button type="submit" disabled={!selected} className="cp-order-primary">Buy now — {priceLabel}</button>
          </form>
        </div>
        <p className="cp-order-note">Delivery and payment are reviewed in Shopify’s secure checkout before an order is placed.</p>
      </div>
    </aside>
  );
}

export function BagDrawer({ handle, item, onClose, onContinue, open }) {
  const dialogRef = useRef(null);
  const [quantity, setQuantity] = useState(1);
  useDialogLifecycle({ open, onClose, dialogRef });
  useEffect(() => {
    if (open) setQuantity(1);
  }, [open]);
  if (!open || !item) return null;
  return (
    <aside ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="bag-drawer-title" className="cp-side-drawer cp-bag-drawer">
      <header className="cp-drawer-header">
        <div>
          <p className="cp-eyebrow"><Check className="cp-icon cp-icon-small" /> Added</p>
          <h2 id="bag-drawer-title" className="cp-drawer-title">Your bag</h2>
        </div>
        <button type="button" onClick={onClose} className="cp-media-icon-button" aria-label="Close bag"><X className="cp-icon cp-icon-medium" /></button>
      </header>
      <div className="cp-drawer-body cp-bag-drawer-body">
        <div className="cp-bag-line-item">
          <Image src={signatureRunwayFrames[0].src} alt="Signature Hoodie in black" width={160} height={200} className="cp-bag-line-image" />
          <div>
            <p className="cp-bag-line-title">ONE</p>
            <p className="cp-bag-line-meta">Black · {sizeFor(item).toUpperCase()}</p>
            <div className="cp-quantity-control" aria-label="Quantity">
              <button type="button" onClick={() => setQuantity(current => Math.max(1, current - 1))} aria-label="Decrease quantity"><Minus className="cp-icon cp-icon-small" /></button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity(current => current + 1)} aria-label="Increase quantity"><Plus className="cp-icon cp-icon-small" /></button>
            </div>
          </div>
        </div>
        <div className="cp-bag-summary"><span>Subtotal</span><span>{money(Number(item.price.amount) * quantity, item.price.currency)}</span></div>
        <form method="post" action="/api/checkout">
          <input type="hidden" name="handle" value={handle} />
          <input type="hidden" name="referenceHash" value={item.referenceHash} />
          <input type="hidden" name="quantity" value={quantity} />
          <button type="submit" className="cp-order-primary">Checkout — {money(Number(item.price.amount) * quantity, item.price.currency)}</button>
        </form>
        <button type="button" onClick={onContinue} className="cp-order-secondary">Continue shopping</button>
      </div>
    </aside>
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
  const [mediaIndex, setMediaIndex] = useState(0);
  const [orderOpen, setOrderOpen] = useState(false);
  const [sizeFitOpen, setSizeFitOpen] = useState(false);
  const [bagItem, setBagItem] = useState(null);
  const [selectedHash, setSelectedHash] = useState('');
  const menuButtonRef = useRef(null);
  const galleryButtonRef = useRef(null);
  const wasMenuOpenRef = useRef(false);
  const wasMediaOpenRef = useRef(false);
  const summary = catalogSummary || fallbackSummary;
  const galleryMedia = useMemo(() => buildHomeGalleryMedia(summary), [summary]);
  const motionAsset = useMemo(
    () => galleryMedia.find(item => item.type === 'video') || null,
    [galleryMedia]
  );
  const variants = useMemo(() => offeredVariants(
    summary.primaryProduct?.handle || '',
    summary.primaryProduct?.variantPresentation
  ), [summary.primaryProduct?.handle, summary.primaryProduct?.variantPresentation]);
  const previewVariants = useMemo(() => {
    return ['S', 'M', 'L'].map(size => ({
      title: size,
      referenceHash: `preview-${size.toLowerCase()}`,
      availableForSale: true,
      price: { amount: '180', currency: 'EUR' },
      selectedOptions: [{ name: 'Size', value: size }],
    }));
  }, []);
  const activeVariants = variants.length > 0 ? variants : previewVariants;
  const purchaseReady = Boolean(activeVariants.length > 0);
  const priceLabel = Number(summary.primaryProduct?.price) > 0
    ? money(summary.primaryProduct.price, summary.primaryProduct.currency || 'USD')
    : activeVariants[0] ? money(activeVariants[0].price.amount, activeVariants[0].price.currency) : 'EUR 180';

  useEffect(() => {
    if (!selectedHash && activeVariants[0]) setSelectedHash(activeVariants[0].referenceHash);
  }, [selectedHash, activeVariants]);

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
      <div inert={menuOpen || mediaOpen || orderOpen || Boolean(bagItem) ? true : undefined}>
        <Navigation
          menuButtonRef={menuButtonRef}
          menuOpen={menuOpen}
          onMenu={() => setMenuOpen(true)}
        />
        <CampaignHero />
        <ProductRunwayHero
          galleryButtonRef={galleryButtonRef}
          galleryCount={galleryMedia.length}
          motionAsset={motionAsset}
          motionSuspended={mediaOpen || orderOpen || Boolean(bagItem)}
          onOpenGallery={() => {
            setMediaIndex(0);
            setMediaOpen(true);
          }}
          onOpenOrder={() => setOrderOpen(true)}
          priceLabel={priceLabel}
          purchaseReady={purchaseReady}
          summary={summary}
        />
        <Footer />
      </div>
      {menuOpen && <MenuOverlay onClose={() => setMenuOpen(false)} />}
      <ProductMediaOverlay
        activeIndex={mediaIndex}
        interactive={!orderOpen && !bagItem}
        media={galleryMedia}
        onActiveIndex={setMediaIndex}
        onClose={() => setMediaOpen(false)}
        onOrder={purchaseReady ? () => setOrderOpen(true) : null}
        open={mediaOpen}
        priceLabel={priceLabel}
        title={summary.primaryProduct?.title || 'Signature Hoodie'}
      />
      <OrderTray
        handle={summary.primaryProduct?.handle || 'carlophillips-signature-hoodie'}
        interactive={!sizeFitOpen}
        onAddToBag={item => {
          setBagItem(item);
          setOrderOpen(false);
        }}
        onClose={() => setOrderOpen(false)}
        onOpenSizeFit={() => setSizeFitOpen(true)}
        onSelect={setSelectedHash}
        open={orderOpen}
        priceLabel={priceLabel}
        selectedHash={selectedHash}
        variants={activeVariants}
      />
      <SizeFitDrawer open={sizeFitOpen} onClose={() => setSizeFitOpen(false)} />
      <BagDrawer
        handle={summary.primaryProduct?.handle || 'carlophillips-signature-hoodie'}
        item={bagItem}
        onClose={() => setBagItem(null)}
        onContinue={() => setBagItem(null)}
        open={Boolean(bagItem)}
      />
    </main>
  );
}

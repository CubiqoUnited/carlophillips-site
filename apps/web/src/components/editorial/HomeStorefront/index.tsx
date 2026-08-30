'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type MuxVideoElement from '@mux/mux-video';
import productArchitecturePoster from '../../../../public/media/editorial/product-architecture-background-v1.png';
import {
  ArrowDown,
  Expand,
  Menu,
  Pause,
  Play,
  ShoppingBag,
  X,
  Ruler,
  Check,
  Minus,
  Plus,
} from 'lucide-react';
import { buildMediaViewerProjection } from '@/lib/media/viewer';
import { MediaViewer } from '@/components/product/MediaViewer';
import { trackEvent } from '@/lib/telemetry/tracker';
import {
  getApprovedCampaignMotionAssets,
  type ApprovedCampaignMotionAsset,
} from '@/lib/media/campaign-motion-registry';
import type { ApprovedCampaignAsset, ViewerMediaItem } from '@/lib/media/types';
import type {
  HomeCatalogSummary,
  HomeCatalogProduct,
  HomeStorefrontProps,
  PreviewJourneyChoice,
  PreviewJourneyProjection,
} from '@/types';
import WorkbookReplica from '../WorkbookReplica';

const MuxVideo = dynamic(() => import('@mux/mux-video/react'), {
  ssr: false,
});

function SectionPagination({ activeSection }: { activeSection: number }) {
  const sections = [
    { id: 'hero', label: '01 Campaign', href: '#' },
    {
      id: 'signature-runway',
      label: '02 Signature 001',
      href: '#signature-runway',
    },
    { id: 'category-rail', label: '03 Collection', href: '#category-rail' },
  ];

  return (
    <nav
      className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-end gap-4 pointer-events-auto"
      aria-label="Editorial chapters"
    >
      {sections.map((sec, idx) => {
        const isActive = activeSection === idx;
        return (
          <a
            key={sec.id}
            href={sec.href}
            onClick={() =>
              trackEvent('navigation', 'chapter_click', { chapter: sec.label })
            }
            className="cp-section-pagination-link group flex items-center gap-3 uppercase"
            aria-current={isActive ? 'true' : undefined}
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {sec.label}
            </span>
            <span className="cp-section-pagination-marker h-1.5 rounded-full" />
          </a>
        );
      })}
    </nav>
  );
}

const fallbackSummary: HomeCatalogSummary = {
  status: 'denied',
  candidateCount: 0,
  visibleCount: 0,
  excludedCount: 0,
  commerceAllowed: false,
  message: 'The catalog release state is unavailable.',
  primaryProduct: null,
};

const categoryTabs = ['Shirts', 'Outerwear', 'Bottoms', 'Accessories'];

const STAGING_SIZES = ['S', 'M', 'L'] as const;

function firstSentence(value: string | undefined, fallback: string): string {
  const sentence = value?.trim().match(/^[^.!?]+[.!?]?/)?.[0];
  return sentence || fallback;
}

export function buildHomeGalleryMedia(
  summary: HomeCatalogSummary | null | undefined
): ViewerMediaItem[] {
  const product = summary?.primaryProduct;
  if (!product || (summary?.visibleCount ?? 0) < 1) return [];

  return buildMediaViewerProjection({
    media: product.media,
    title: product.title || 'Product',
  });
}

function productFacts(product: HomeCatalogProduct | null) {
  if (!product) return [];
  const facts = (product.details || []).flatMap((detail) => {
    if (!Array.isArray(detail)) return [];
    const [label, value] = detail;
    return label && value
      ? [{ label: String(label), value: String(value) }]
      : [];
  });
  if (facts.length > 0) return facts.slice(0, 3);
  return (product.colors || [])
    .slice(0, 3)
    .map((value) => ({ label: 'Color', value }));
}

function Navigation() {
  return (
    <header className="cp-site-header fixed inset-x-0 top-0 backdrop-blur-md">
      <div className="cp-page-shell grid h-[var(--cp-header-height)] grid-cols-3 items-center">
        <button
          type="button"
          className="cp-nav-action inline-flex w-fit items-center gap-3"
          aria-label="Menu"
          aria-disabled="true"
        >
          <Menu className="cp-icon-standard h-4 w-4" />
          <span className="hidden sm:inline">Menu</span>
        </button>
        <Link href="/" className="cp-wordmark justify-self-center">
          CARLOPHILLIPS
        </Link>
        <Link
          href="/bag"
          className="cp-nav-action inline-flex items-center gap-3 justify-self-end"
          aria-label="Bag"
        >
          <span className="hidden sm:inline">Bag</span>
          <ShoppingBag className="cp-icon-standard h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}

function MuxHlsVideo({
  asset,
  className,
  autoPlay = false,
  onCanPlay,
  onEnded,
  onTimeUpdate,
  videoRef,
}: {
  asset: ApprovedCampaignMotionAsset;
  className: string;
  autoPlay?: boolean;
  onCanPlay?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: () => void;
  videoRef?: React.RefObject<MuxVideoElement | null>;
}) {
  const fallbackRef = useRef<MuxVideoElement>(null);
  const ref = videoRef || fallbackRef;
  const [isPlayable, setIsPlayable] = useState(false);

  return (
    <MuxVideo
      ref={ref}
      className={`${className} ${isPlayable ? 'is-playable' : ''}`}
      playbackId={asset.playbackId}
      streamType="on-demand"
      poster={asset.posterUrl}
      muted
      playsInline
      autoplay={autoPlay ? 'muted' : false}
      preload="metadata"
      disablePictureInPicture
      disableRemotePlayback
      onCanPlay={() => {
        setIsPlayable(true);
        onCanPlay?.();
      }}
      onEnded={onEnded}
      onTimeUpdate={onTimeUpdate}
    />
  );
}

function CampaignHero({ asset }: { asset: ApprovedCampaignAsset | null }) {
  const motion = getApprovedCampaignMotionAssets('landing-hero')[0];
  const [revealMotion, setRevealMotion] = useState(false);
  return (
    <section
      className="storefront-panel cp-viewport-panel relative overflow-hidden"
      aria-label="CARLOPHILLIPS runway campaign"
    >
      {asset ? (
        <Image
          src={asset.src}
          alt={asset.alt}
          fill
          priority
          sizes="100vw"
          className="cp-campaign-image object-cover"
          onLoad={() => setRevealMotion(true)}
        />
      ) : (
        <div
          className="cp-media-withheld absolute inset-0"
          role="img"
          aria-label="Campaign media withheld pending approval"
        />
      )}
      {motion && (
        <MuxHlsVideo
          asset={motion}
          autoPlay
          className="cp-landing-motion-video"
          onCanPlay={() => setRevealMotion(true)}
        />
      )}

      <div
        className={`cp-landing-intro-panel ${revealMotion ? 'is-revealed' : ''}`}
      >
        <div className="cp-campaign-content-layout cp-page-shell absolute inset-0 z-10">
          <div className="cp-campaign-copy">
            <p className="cp-campaign-overline">at the</p>
            <h1 className="cp-campaign-title">Edge Of Life</h1>
            <p className="cp-campaign-signature">with carlophillips</p>
          </div>
        </div>
      </div>

      <a
        href="#signature-runway"
        className="cp-scroll-cue absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        aria-label="Scroll down to discover the featured product"
      >
        <span className="cp-scroll-cue-label">Scroll and explore</span>
        <span className="cp-scroll-cue-control" aria-hidden="true">
          <ArrowDown className="cp-icon-subtle cp-scroll-arrow h-5 w-5" />
        </span>
      </a>
    </section>
  );
}

function ProductRunwayHero({
  galleryButtonRef,
  galleryMedia,
  onOpenGallery,
  summary,
  onOpenOrder,
  previewJourney,
}: {
  galleryButtonRef: React.RefObject<HTMLButtonElement | null>;
  galleryMedia: ViewerMediaItem[];
  onOpenGallery: () => void;
  summary: HomeCatalogSummary;
  onOpenOrder?: () => void;
  previewJourney: PreviewJourneyProjection | null;
}) {
  const product = summary.primaryProduct;
  const productVisible = summary.visibleCount > 0 && Boolean(product);
  const productDescription = firstSentence(
    product?.description,
    product
      ? 'Product description is currently unavailable.'
      : 'A considered study in form, material and everyday utility.'
  );
  const imageThumbs = galleryMedia
    .filter((item) => item.type === 'image')
    .slice(0, 7);
  const thumbnailSlots: Array<ViewerMediaItem | null> =
    imageThumbs.length > 0
      ? imageThumbs
      : Array.from({ length: 8 }, () => null);
  const productHandle =
    product?.href.split('/').filter(Boolean).pop() ||
    'carlophillips-signature-hoodie';
  const motionAssets = getApprovedCampaignMotionAssets(
    'product-runway',
    productHandle
  );
  const orderLabel = previewJourney?.priceLabel.includes('withheld')
    ? 'Order'
    : `Order — ${previewJourney?.priceLabel || ''}`;
  const [activeMotion, setActiveMotion] = useState(0);
  const [playbackRuns, setPlaybackRuns] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const productVideoRef = useRef<MuxVideoElement>(null);
  const motion = motionAssets[activeMotion];

  const togglePlayback = () => {
    const video = productVideoRef.current;
    if (!video) return;
    if (video.paused) {
      if (video.ended) video.currentTime = 0;
      setPlaybackRuns(0);
      void video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const selectMotion = (index: number) => {
    setActiveMotion(index);
    setPlaybackRuns(0);
    setProgress(0);
    setIsPlaying(true);
  };

  return (
    <section
      id="signature-runway"
      className="storefront-panel cp-product-viewport relative scroll-mt-[var(--cp-header-height)] overflow-hidden"
      aria-label="Featured product presentation"
    >
      <figure className="cp-surface-panel absolute inset-0 overflow-hidden">
        <div className="cp-product-architecture-frame" aria-hidden="true">
          <Image
            src={productArchitecturePoster}
            alt=""
            fill
            sizes="(min-width: 1024px) 44vw, 76vw"
            className="object-cover"
          />
        </div>
        {motion && (
          <MuxHlsVideo
            key={motion.assetId}
            asset={motion}
            videoRef={productVideoRef}
            autoPlay
            className="cp-product-motion-video"
            onCanPlay={() => {
              if (isPlaying) void productVideoRef.current?.play();
            }}
            onTimeUpdate={() => {
              const video = productVideoRef.current;
              if (video?.duration)
                setProgress((video.currentTime / video.duration) * 100);
            }}
            onEnded={() => {
              if (playbackRuns < 1) {
                setPlaybackRuns((runs) => runs + 1);
                productVideoRef.current?.play();
              } else {
                setIsPlaying(false);
                setProgress(100);
              }
            }}
          />
        )}
        {!motion && (
          <div
            className="cp-media-withheld absolute inset-0"
            role="img"
            aria-label="Neutral product presentation background"
          />
        )}
        <div className="cp-product-scrim absolute inset-0" aria-hidden="true" />
      </figure>

      <div className="cp-product-cta-stack absolute right-5 top-5 z-20 flex flex-col items-stretch gap-3 sm:right-8 sm:top-8">
        <button
          ref={galleryButtonRef}
          type="button"
          onClick={onOpenGallery}
          aria-haspopup="dialog"
          aria-controls="product-media-overlay"
          data-media-trigger="product-gallery"
          className="cp-product-media-button cp-product-media-button-corner"
        >
          <span>View gallery</span>
          <Expand
            className="cp-icon-subtle col-start-2 h-4 w-4 justify-self-center"
            aria-hidden="true"
          />
          <span className="text-right">
            {String(Math.max(galleryMedia.length, 12)).padStart(2, '0')} Images
          </span>
        </button>
        {previewJourney && onOpenOrder && (
          <button
            type="button"
            onClick={onOpenOrder}
            className="cp-product-media-button cp-product-media-button-corner"
          >
            {orderLabel}
          </button>
        )}
      </div>

      <div className="cp-product-layout cp-page-shell relative z-10 flex flex-col">
        <div className="cp-product-copy max-w-2xl">
          <h2 className="cp-product-title">{product?.title || 'Product'}</h2>
          <p className="cp-product-review mt-5">{productDescription}</p>
          {previewJourney && onOpenOrder && (
            <button
              type="button"
              onClick={onOpenOrder}
              className="cp-action cp-action-solid mt-7 inline-flex sm:hidden"
            >
              {orderLabel}
            </button>
          )}
          {productVisible && (
            <ul
              className="cp-product-facts mt-6"
              aria-label="Product attributes"
            >
              {productFacts(product).map((fact) => (
                <li key={fact.label}>
                  <span className="cp-product-fact-label">{fact.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div
          className="cp-product-progress"
          aria-label="Product media progress"
        >
          <button
            type="button"
            onClick={togglePlayback}
            className="cp-product-motion-control"
            aria-label={isPlaying ? 'Pause motion' : 'Play motion'}
          >
            {isPlaying ? (
              <Pause className="cp-icon-subtle" />
            ) : (
              <Play className="cp-icon-subtle" />
            )}
          </button>
          <progress
            className="cp-product-progress-track"
            aria-label="Product media progress"
            value={progress}
            max="100"
          />
          <button
            type="button"
            onClick={onOpenGallery}
            className="cp-product-progress-expand"
            aria-label="Open gallery overlay"
          >
            <Expand className="cp-icon-subtle" />
          </button>
          <div
            className="cp-product-motion-choices"
            aria-label="Product videos"
          >
            {[...motionAssets, null].slice(0, 3).map((item, index) => (
              <button
                key={item?.assetId || '360-pending'}
                type="button"
                disabled={!item}
                onClick={() => item && selectMotion(index)}
                className={index === activeMotion && item ? 'is-active' : ''}
                aria-label={
                  item
                    ? `Play ${item.label || `video ${index + 1}`}`
                    : '360 showcase pending approved source'
                }
                aria-current={index === activeMotion ? 'true' : undefined}
              />
            ))}
          </div>
        </div>
      </div>

      {productVisible && (
        <div className="cp-thumb-strip">
          <div className="cp-thumb-cards">
            {thumbnailSlots.map((thumb, index) =>
              thumb ? (
                <button
                  key={thumb.id || thumb.src}
                  type="button"
                  aria-label={thumb.alt || thumb.label}
                  className="cp-thumb-btn"
                  onClick={onOpenGallery}
                >
                  <Image
                    src={thumb.src || thumb.url}
                    alt={thumb.alt || ''}
                    fill
                    className="object-cover"
                    sizes="52px"
                  />
                </button>
              ) : (
                <span
                  key={`placeholder-${index}`}
                  className="cp-thumb-placeholder"
                  aria-hidden="true"
                />
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function CategoryRail({ summary }: { summary: HomeCatalogSummary }) {
  const activeProduct =
    summary.visibleCount > 0 && summary.primaryProduct
      ? summary.primaryProduct
      : null;

  return (
    <nav
      className="cp-category-rail sticky top-16 z-30 overflow-hidden lg:top-20"
      aria-label="Product categories"
    >
      <div
        className="scrollbar-hide cp-page-shell flex h-14 items-center gap-8 overflow-x-auto lg:h-16"
        tabIndex={0}
        aria-label="Scrollable product categories"
      >
        {activeProduct ? (
          <Link
            href={activeProduct.href}
            aria-current="page"
            className="cp-category-item cp-category-item-active flex shrink-0 items-center"
          >
            {activeProduct.productType || 'Product'}
          </Link>
        ) : (
          <span aria-disabled="true" className="cp-category-item shrink-0">
            Product
          </span>
        )}
        {categoryTabs.map((category) => (
          <span
            key={category}
            aria-disabled="true"
            className="cp-category-item shrink-0"
          >
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

function SizeFitDrawer({ onClose }: { onClose: () => void }) {
  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-fit-title"
      className="cp-dark-panel"
    >
      <header className="cp-dark-panel-header">
        <div>
          <p className="cp-dark-panel-kicker">Fit guide</p>
          <h2 id="size-fit-title" className="cp-dark-panel-title">
            Size &amp; Fit
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="cp-dark-panel-close"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </header>
      <div className="cp-dark-panel-body cp-dark-panel-body-text">
        <p className="cp-fit-title">Regular fit</p>
        <p className="cp-dark-panel-copy">
          Designed with room through the chest and body. Choose your usual size
          for the intended structured silhouette.
        </p>
        <div className="cp-size-btn-row">
          {STAGING_SIZES.map((s) => (
            <span key={s} className="cp-size-btn">
              {s}
            </span>
          ))}
        </div>
        <details className="cp-fit-section" open>
          <summary className="cp-fit-summary">Garment measurements</summary>
          <p className="cp-fit-body">
            Compare a favourite hoodie laid flat. Measure chest from underarm to
            underarm and length from shoulder to hem.
          </p>
        </details>
        <details className="cp-fit-section">
          <summary className="cp-fit-summary">How to measure</summary>
          <p className="cp-fit-body">
            Keep the tape level and relaxed. If you are between sizes, size up
            for a looser fit.
          </p>
        </details>
      </div>
    </aside>
  );
}

function OrderTray({
  onClose,
  onAddToBag,
  priceLabel,
  choices,
  selectedChoiceId,
  onSelect,
  onOpenSizeFit,
  productHandle,
  productName,
  productDescription,
  productKicker,
}: {
  onClose: () => void;
  onAddToBag: (choice: PreviewJourneyChoice) => void;
  priceLabel: string;
  choices: PreviewJourneyChoice[];
  selectedChoiceId: string;
  onSelect: (choiceId: string) => void;
  onOpenSizeFit: () => void;
  productHandle: string;
  productName: string;
  productDescription: string;
  productKicker: string;
}) {
  const selectedChoice = choices.find(({ id }) => id === selectedChoiceId);
  const [checkoutBoundary, setCheckoutBoundary] = useState('');

  const reviewCheckout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await fetch('/api/checkout', {
      method: 'POST',
      body: new FormData(event.currentTarget),
    });
    const result = (await response.json()) as { error?: string };
    setCheckoutBoundary(
      result.error === 'PRODUCT_RELEASE_NOT_RELEASED'
        ? 'Draft review boundary confirmed. Checkout remains unavailable.'
        : 'Checkout remains unavailable during private review.'
    );
  };
  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-tray-title"
      className="cp-dark-panel"
    >
      <header className="cp-dark-panel-header">
        <div>
          <p className="cp-dark-panel-kicker">{productKicker}</p>
          <h2 id="order-tray-title" className="cp-dark-panel-title">
            {productName}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="cp-dark-panel-close"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </header>
      <div className="cp-dark-panel-body">
        <p className="cp-dark-panel-price">{priceLabel}</p>
        <p className="cp-dark-panel-copy">{productDescription}</p>
        <div className="mt-6 flex items-center justify-between">
          <span className="cp-dark-panel-label">Select size</span>
          <button
            type="button"
            onClick={onOpenSizeFit}
            className="cp-size-fit-link"
          >
            <Ruler className="h-3 w-3" /> Size &amp; Fit
          </button>
        </div>
        <div
          className="cp-size-grid"
          role="radiogroup"
          aria-label="Choose size"
        >
          {choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              role="radio"
              aria-label={`Size ${choice.label}`}
              aria-checked={selectedChoiceId === choice.id}
              onClick={() => onSelect(choice.id)}
              className="cp-size-btn"
            >
              <span>{choice.label}</span>
            </button>
          ))}
        </div>
        <div className="cp-panel-cta-stack">
          <button
            type="button"
            disabled={!selectedChoice}
            onClick={() => selectedChoice && onAddToBag(selectedChoice)}
            className="cp-panel-btn-secondary"
          >
            Add to bag
          </button>
          <form method="post" action="/api/checkout" onSubmit={reviewCheckout}>
            <input type="hidden" name="journeyMode" value="private-review" />
            <input type="hidden" name="handle" value={productHandle} />
            <input type="hidden" name="quantity" value="1" />
            <button
              type="submit"
              disabled={!selectedChoice}
              className="cp-panel-btn-primary"
            >
              Buy now — {priceLabel}
            </button>
          </form>
        </div>
        {checkoutBoundary && (
          <p className="cp-panel-disclaimer" role="status">
            {checkoutBoundary}
          </p>
        )}
        <p className="cp-panel-disclaimer">
          Private journey review only. Draft status is re-evaluated by the
          server; no cart, payment session, or order is created.
        </p>
      </div>
    </aside>
  );
}

function BagDrawer({
  item,
  onClose,
  onContinue,
  priceLabel,
  productHandle,
  colorLabel,
  productName,
}: {
  item: PreviewJourneyChoice;
  onClose: () => void;
  onContinue: () => void;
  priceLabel: string;
  productHandle: string;
  colorLabel: string;
  productName: string;
}) {
  const [qty, setQty] = useState(1);
  const [checkoutBoundary, setCheckoutBoundary] = useState('');

  const reviewCheckout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await fetch('/api/checkout', {
      method: 'POST',
      body: new FormData(event.currentTarget),
    });
    const result = (await response.json()) as { error?: string };
    setCheckoutBoundary(
      result.error === 'PRODUCT_RELEASE_NOT_RELEASED'
        ? 'Draft review boundary confirmed. Checkout remains unavailable.'
        : 'Checkout remains unavailable during private review.'
    );
  };
  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-labelledby="bag-drawer-title"
      className="cp-dark-panel"
    >
      <header className="cp-dark-panel-header">
        <div>
          <p className="cp-dark-panel-kicker flex items-center gap-1">
            <Check className="h-3 w-3" /> Added
          </p>
          <h2 id="bag-drawer-title" className="cp-dark-panel-title">
            Your bag
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="cp-dark-panel-close"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </header>
      <div className="cp-dark-panel-body">
        <div className="cp-bag-item">
          <div className="cp-bag-thumb" aria-hidden="true" />
          <div className="flex flex-1 flex-col gap-2">
            <p className="cp-bag-item-name">{productName}</p>
            <p className="cp-bag-item-detail">
              {colorLabel} &middot; {item.label}
            </p>
            <div className="cp-bag-qty-row">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="cp-bag-qty-btn"
                aria-label="Decrease"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="cp-bag-qty">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="cp-bag-qty-btn"
                aria-label="Increase"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
        <div className="cp-dark-panel-rule mt-6 pt-4">
          <div className="cp-dark-panel-subtotal">
            <span className="cp-dark-panel-subtotal-label">Subtotal</span>
            <span>{priceLabel}</span>
          </div>
        </div>
        <div className="cp-panel-cta-stack">
          <form method="post" action="/api/checkout" onSubmit={reviewCheckout}>
            <input type="hidden" name="journeyMode" value="private-review" />
            <input type="hidden" name="handle" value={productHandle} />
            <input type="hidden" name="quantity" value={qty} />
            <button type="submit" className="cp-panel-btn-primary">
              Checkout — {priceLabel}
            </button>
          </form>
          {checkoutBoundary && (
            <p className="cp-panel-disclaimer" role="status">
              {checkoutBoundary}
            </p>
          )}
          <button
            type="button"
            onClick={onContinue}
            className="cp-panel-btn-secondary"
          >
            Continue shopping
          </button>
        </div>
      </div>
    </aside>
  );
}

function LegacyHomeStorefront({
  campaignAsset,
  catalogSummary,
  previewJourney,
}: HomeStorefrontProps) {
  const [mediaOpen, setMediaOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const galleryButtonRef = useRef<HTMLButtonElement>(null);
  const wasMediaOpenRef = useRef(false);
  const summary = catalogSummary || fallbackSummary;
  const galleryMedia = useMemo(() => buildHomeGalleryMedia(summary), [summary]);

  const [orderOpen, setOrderOpen] = useState(false);
  const [sizeFitOpen, setSizeFitOpen] = useState(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string>(
    previewJourney?.choices[0]?.id || ''
  );
  const [bagItem, setBagItem] = useState<PreviewJourneyChoice | null>(null);

  // Active section scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      if (scrollY < vh * 0.6) {
        setActiveSection(0);
      } else if (scrollY < vh * 1.6) {
        setActiveSection(1);
      } else {
        setActiveSection(2);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (wasMediaOpenRef.current && !mediaOpen)
      galleryButtonRef.current?.focus();
    wasMediaOpenRef.current = mediaOpen;
  }, [mediaOpen]);

  return (
    <main id="main-content" className="cp-site min-h-screen">
      <SectionPagination activeSection={activeSection} />
      <div inert={mediaOpen ? true : undefined}>
        <Navigation />
        <CampaignHero asset={campaignAsset} />
        <ProductRunwayHero
          galleryButtonRef={galleryButtonRef}
          galleryMedia={galleryMedia}
          onOpenGallery={() => {
            trackEvent('gallery', 'open_gallery', {
              totalViews: galleryMedia.length,
            });
            setMediaOpen(true);
          }}
          summary={summary}
          onOpenOrder={() => {
            trackEvent('commerce', 'open_order_tray');
            setOrderOpen(true);
          }}
          previewJourney={previewJourney}
        />
        <CategoryRail summary={summary} />
        <Footer />
      </div>
      <MediaViewer
        media={galleryMedia}
        onClose={() => setMediaOpen(false)}
        open={mediaOpen}
        title={summary.primaryProduct?.title || 'Product'}
      />
      {previewJourney && orderOpen && !bagItem && (
        <OrderTray
          onClose={() => setOrderOpen(false)}
          onAddToBag={(choice) => {
            trackEvent('commerce', 'review_add_to_bag', {
              choice: choice.label,
            });
            setBagItem(choice);
            setOrderOpen(false);
          }}
          priceLabel={previewJourney.priceLabel}
          choices={previewJourney.choices}
          selectedChoiceId={selectedChoiceId}
          onSelect={(choiceId) => {
            const choice = previewJourney.choices.find(
              ({ id }) => id === choiceId
            );
            trackEvent('commerce', 'review_select_size', {
              choice: choice?.label,
            });
            setSelectedChoiceId(choiceId);
          }}
          onOpenSizeFit={() => setSizeFitOpen(true)}
          productHandle={previewJourney.productHandle}
          productName={
            summary.primaryProduct?.title || previewJourney.productName
          }
          productDescription={firstSentence(
            summary.primaryProduct?.description,
            'Product description is currently unavailable.'
          )}
          productKicker={
            summary.primaryProduct?.tagline ||
            summary.primaryProduct?.productType ||
            'Product'
          }
        />
      )}
      {sizeFitOpen && <SizeFitDrawer onClose={() => setSizeFitOpen(false)} />}
      {previewJourney && bagItem && (
        <BagDrawer
          item={bagItem}
          onClose={() => setBagItem(null)}
          onContinue={() => setBagItem(null)}
          priceLabel={previewJourney.priceLabel}
          productHandle={previewJourney.productHandle}
          colorLabel={previewJourney.colorLabel}
          productName={
            summary.primaryProduct?.title || previewJourney.productName
          }
        />
      )}
    </main>
  );
}

export default function HomeStorefront({
  campaignAsset,
  catalogSummary,
}: HomeStorefrontProps) {
  return (
    <WorkbookReplica
      campaignAsset={campaignAsset}
      catalogSummary={catalogSummary}
    />
  );
}

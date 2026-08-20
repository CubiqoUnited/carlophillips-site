'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
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
import type { ApprovedCampaignAsset, ViewerMediaItem } from '@/lib/media/types';
import type { HomeCatalogSummary, HomeStorefrontProps } from '@/types';

const fallbackSummary: HomeCatalogSummary = {
  status: 'denied',
  candidateCount: 0,
  visibleCount: 0,
  excludedCount: 0,
  commerceAllowed: false,
  message: 'The catalog release state is unavailable.',
  primaryProduct: null,
};

const signatureRunwayFrameClasses = [
  'runway-frame-primary',
  'runway-frame-secondary',
  'runway-frame-tertiary',
];

const categoryTabs = ['Shirts', 'Outerwear', 'Bottoms', 'Accessories'];

const PRODUCT_OFFER_HASHES = [
  'sha256:0938f4582f512244658066942f269c16cca1efdec1e197868c05cfdb8fa5859d', // S
  'sha256:a9e7278b69f56390e767c748682c37970a58b5abf9e4c47b612bebcb67cdf9c3', // M
  'sha256:bca824ce1a2583241b1785b1b655d7dd161c0dc18cdb56f05c528b2d2905e581', // L
] as const;

const STAGING_SIZES = ['S', 'M', 'L'] as const;

const signatureHomepagePresentation = {
  displayName: 'ONE',
  facts: [
    { label: 'Color', value: 'Black' },
    { label: 'Material', value: 'Structured fleece' },
    { label: 'Feel', value: 'Heavyweight, soft interior' },
  ],
};

function firstSentence(value: string | undefined, fallback: string): string {
  const sentence = value?.trim().match(/^[^.!?]+[.!?]?/)?.[0];
  return sentence || fallback;
}

export function buildHomeGalleryMedia(
  summary: HomeCatalogSummary | null | undefined
): ViewerMediaItem[] {
  const product = summary?.primaryProduct;
  const signatureVisible =
    (summary?.visibleCount ?? 0) > 0 &&
    product?.href === '/product/carlophillips-signature-hoodie';
  if (!signatureVisible) return [];

  return buildMediaViewerProjection({
    media: product.media,
    title: product.title || 'Signature Hoodie',
  });
}

function Navigation({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="cp-site-header fixed inset-x-0 top-0 backdrop-blur-md">
      <div className="cp-page-shell grid h-[var(--cp-header-height)] grid-cols-3 items-center">
        <button
          type="button"
          onClick={onMenu}
          className="cp-nav-action inline-flex w-fit items-center gap-3"
          aria-label="Open navigation"
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
        >
          <span className="hidden sm:inline">Bag</span>
          <ShoppingBag className="cp-icon-standard h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}

function MenuOverlay({ onClose }: { onClose: () => void }) {
  return (
    <aside
      className="cp-menu-overlay fixed inset-0"
      aria-label="Site navigation"
    >
      <div className="cp-menu-bar flex items-center justify-between">
        <span className="cp-menu-title">CARLOPHILLIPS</span>
        <button
          type="button"
          onClick={onClose}
          className="cp-menu-close"
          aria-label="Close navigation"
        >
          <X className="cp-icon-standard h-5 w-5" />
        </button>
      </div>
      <nav className="cp-menu-links grid gap-4" aria-label="Main menu">
        <Link onClick={onClose} href="/">
          Home
        </Link>
        <Link onClick={onClose} href="/shop">
          Shop
        </Link>
        <Link onClick={onClose} href="/collections">
          Collections
        </Link>
        <Link onClick={onClose} href="/bag">
          Bag
        </Link>
      </nav>
    </aside>
  );
}

function CampaignHero({ asset }: { asset: ApprovedCampaignAsset | null }) {
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
        />
      ) : (
        <div
          className="cp-media-withheld absolute inset-0"
          role="img"
          aria-label="Campaign media withheld pending approval"
        />
      )}
      <div className="cp-campaign-scrim absolute inset-0" aria-hidden="true" />

      <div className="cp-campaign-content-layout cp-page-shell relative z-10 flex min-h-[var(--cp-viewport-height)] flex-col justify-end pb-[var(--cp-panel-bottom)]">
        <div className="max-w-4xl">
          <p className="cp-eyebrow mb-5">CARLOPHILLIPS / At the edge of life</p>
          <h1 className="cp-display max-w-5xl">
            At the
            <br />
            edge of life.
          </h1>
          <p className="cp-eyebrow mt-7">Runway 001 / Lofoten</p>
        </div>
        <a
          href="#signature-runway"
          className="cp-scroll-cue mt-10"
          aria-label="Scroll down to discover the Signature Hoodie"
        >
          <span className="cp-scroll-cue-label">Scroll and explore</span>
          <span className="cp-scroll-cue-control" aria-hidden="true">
            <ArrowDown className="cp-icon-subtle cp-scroll-arrow h-5 w-5" />
          </span>
        </a>
      </div>
    </section>
  );
}

function ProductRunwayHero({
  galleryButtonRef,
  galleryMedia,
  onOpenGallery,
  motionPaused,
  onToggleMotion,
  summary,
  onOpenOrder,
  purchaseReady,
  priceLabel,
  dwellReady,
}: {
  galleryButtonRef: React.RefObject<HTMLButtonElement | null>;
  galleryMedia: ViewerMediaItem[];
  onOpenGallery: () => void;
  motionPaused: boolean;
  onToggleMotion: () => void;
  summary: HomeCatalogSummary;
  onOpenOrder?: () => void;
  purchaseReady?: boolean;
  priceLabel?: string;
  dwellReady?: boolean;
}) {
  const heroMedia = summary.primaryProduct?.heroMedia || null;
  const product = summary.primaryProduct;
  const signatureVisible =
    summary.visibleCount > 0 &&
    product?.href === '/product/carlophillips-signature-hoodie';
  const runwayMedia = galleryMedia
    .filter((item) => item.type === 'image')
    .slice(0, 3);
  const runwaySequenceReady = signatureVisible && runwayMedia.length === 3;
  const motionMedia = galleryMedia
    .filter((item) => item.type === 'video')
    .slice(0, 2);
  const galleryReady = signatureVisible && galleryMedia.length > 0;
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
        {motionMedia.length > 0 ? (
          <div className="cp-landing-motion absolute inset-0">
            {motionMedia.map((item, index) => (
              <video
                key={
                  item.id || item.registryAssetId || `landing-video-${index}`
                }
                className={`cp-landing-motion-video ${index === 0 ? 'is-active' : ''}`}
                src={item.src || item.url}
                poster={item.previewUrl}
                muted
                playsInline
                autoPlay={dwellReady && !motionPaused && index === 0}
                loop
                aria-label={item.alt}
              />
            ))}
            <div
              className="cp-product-scrim absolute inset-0"
              aria-hidden="true"
            />
          </div>
        ) : runwaySequenceReady ? (
          <>
            <Image
              src={runwayMedia[0].src}
              alt=""
              fill
              sizes="100vw"
              className="scale-110 object-cover object-center opacity-25 blur-2xl"
              aria-hidden="true"
            />
            {runwayMedia.map((frame, index) => (
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
          <div
            className="cp-media-withheld absolute inset-0"
            role="img"
            aria-label="Product media withheld pending approval"
          />
        )}
        <div className="cp-product-scrim absolute inset-0" aria-hidden="true" />
        {!summary.commerceAllowed && (
          <figcaption className="cp-disclosure absolute bottom-5 right-5 px-3 py-2">
            {signatureVisible
              ? 'Private product preview'
              : heroMedia
                ? heroMedia.label
                : 'Collection preview'}
          </figcaption>
        )}
      </figure>

      {galleryReady ? (
        <div className="cp-landing-actions absolute right-5 top-5 z-20 flex flex-wrap justify-end gap-2 sm:right-8 sm:top-8">
          <button
            type="button"
            onClick={onToggleMotion}
            className="cp-action cp-action-outline inline-flex items-center gap-2"
            aria-pressed={!motionPaused}
          >
            {motionPaused ? (
              <Play className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Pause className="h-4 w-4" aria-hidden="true" />
            )}
            {motionPaused ? 'Play motion' : 'Pause motion'}
          </button>
          <button
            ref={galleryButtonRef}
            type="button"
            onClick={onOpenGallery}
            aria-haspopup="dialog"
            aria-controls="product-media-overlay"
            data-media-trigger="signature-hoodie"
            className="cp-action cp-action-outline inline-flex items-center gap-2"
          >
            <span>View gallery</span>
            <Expand className="h-4 w-4" aria-hidden="true" />
            <span className="text-right">
              {String(galleryMedia.length).padStart(2, '0')}
            </span>
          </button>
        </div>
      ) : (
        <Link
          href="/shop"
          className="cp-product-media-button cp-product-media-button-corner"
        >
          <span>Explore the collection</span>
          <ArrowRight className="cp-icon-subtle col-start-3 h-4 w-4 justify-self-end" />
        </Link>
      )}

      <div className="cp-product-layout cp-page-shell relative z-10 flex min-h-[var(--cp-viewport-height)] flex-col">
        <div className="cp-product-copy max-w-2xl">
          <p className="cp-eyebrow mb-5">
            {signatureVisible
              ? 'Signature Series / 001'
              : 'CARLOPHILLIPS / 001'}
          </p>
          <h2 className="cp-product-title">
            {signatureVisible
              ? signatureHomepagePresentation.displayName
              : 'Form. Function.'}
          </h2>
          <p className="cp-product-review mt-5">
            {signatureVisible
              ? productDescription
              : 'A considered study in form, material and everyday utility.'}
          </p>
          {(purchaseReady || signatureVisible) && onOpenOrder && (
            <button
              type="button"
              onClick={onOpenOrder}
              className="cp-action cp-action-solid mt-7 inline-flex"
            >
              ORDER — {priceLabel || '\u20ac180'}
            </button>
          )}
          {signatureVisible && (
            <ul
              className="cp-product-facts mt-6"
              aria-label="Product attributes"
            >
              {signatureHomepagePresentation.facts.map((fact) => (
                <li key={fact.label}>
                  <span className="cp-product-fact-label">{fact.label}</span>
                  <span className="cp-product-fact-value">{fact.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {signatureVisible && galleryMedia.length > 0 && (
        <div className="cp-thumb-strip">
          {galleryMedia
            .filter((m) => m.type === 'image')
            .slice(0, 7)
            .map((thumb) => (
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
                  sizes="40px"
                />
              </button>
            ))}
        </div>
      )}
    </section>
  );
}

function CategoryRail({ summary }: { summary: HomeCatalogSummary }) {
  const activeProduct =
    summary.visibleCount > 0 &&
    summary.primaryProduct?.href === '/product/carlophillips-signature-hoodie'
      ? summary.primaryProduct
      : null;

  return (
    <nav
      className="cp-category-rail sticky top-16 z-30 overflow-hidden lg:top-20"
      aria-label="Product categories"
    >
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
          <span aria-disabled="true" className="cp-category-item shrink-0">
            Hoodies
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
  selectedHash,
  onSelect,
  onOpenSizeFit,
}: {
  onClose: () => void;
  onAddToBag: (hash: string) => void;
  priceLabel: string;
  selectedHash: string;
  onSelect: (hash: string) => void;
  onOpenSizeFit: () => void;
}) {
  const hasSelection = Boolean(selectedHash);
  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-tray-title"
      className="cp-dark-panel"
    >
      <header className="cp-dark-panel-header">
        <div>
          <p className="cp-dark-panel-kicker">Signature Series / 001</p>
          <h2 id="order-tray-title" className="cp-dark-panel-title">
            ONE
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
        <p className="cp-dark-panel-copy">
          Heavyweight black pullover hoodie with restrained CP chest embroidery.
        </p>
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
        <div className="cp-size-grid" role="radiogroup" aria-label="Choose size">
          {(['S', 'M', 'L'] as const).map((size, i) => (
            <button
              key={size}
              type="button"
              role="radio"
              aria-label={`Size ${size}`}
              aria-checked={selectedHash === PRODUCT_OFFER_HASHES[i]}
              onClick={() => onSelect(PRODUCT_OFFER_HASHES[i])}
              className="cp-size-btn"
            >
              <span>{size}</span>
            </button>
          ))}
        </div>
        <div className="cp-panel-cta-stack">
          <button
            type="button"
            disabled={!hasSelection}
            onClick={() => hasSelection && onAddToBag(selectedHash)}
            className="cp-panel-btn-secondary"
          >
            Add to bag
          </button>
          <form method="post" action="/api/checkout">
            <input
              type="hidden"
              name="handle"
              value="carlophillips-signature-hoodie"
            />
            <input type="hidden" name="referenceHash" value={selectedHash} />
            <input type="hidden" name="quantity" value="1" />
            <button
              type="submit"
              disabled={!hasSelection}
              className="cp-panel-btn-primary"
            >
              Buy now — {priceLabel}
            </button>
          </form>
        </div>
        <p className="cp-panel-disclaimer">
          Delivery and payment are reviewed in Shopify&apos;s secure checkout
          before an order is placed.
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
}: {
  item: { size: string; hash: string };
  onClose: () => void;
  onContinue: () => void;
  priceLabel: string;
}) {
  const [qty, setQty] = useState(1);
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
          <div className="cp-bag-thumb">
            <Image
              src="/media/signature-hoodie/posters/runway-motion.jpg"
              alt="ONE"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <p className="cp-bag-item-name">ONE</p>
            <p className="cp-bag-item-detail">Black &middot; {item.size}</p>
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
          <form method="post" action="/api/checkout">
            <input
              type="hidden"
              name="handle"
              value="carlophillips-signature-hoodie"
            />
            <input type="hidden" name="referenceHash" value={item.hash} />
            <input type="hidden" name="quantity" value={qty} />
            <button type="submit" className="cp-panel-btn-primary">
              Checkout — {priceLabel}
            </button>
          </form>
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

export default function HomeStorefront({
  campaignAsset,
  catalogSummary,
}: HomeStorefrontProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const galleryButtonRef = useRef<HTMLButtonElement>(null);
  const wasMediaOpenRef = useRef(false);
  const summary = catalogSummary || fallbackSummary;
  const galleryMedia = useMemo(() => buildHomeGalleryMedia(summary), [summary]);

  const [orderOpen, setOrderOpen] = useState(false);
  const [sizeFitOpen, setSizeFitOpen] = useState(false);
  const [selectedHash, setSelectedHash] = useState<string>(
    PRODUCT_OFFER_HASHES[0]
  );
  const [bagItem, setBagItem] = useState<{ size: string; hash: string } | null>(
    null
  );
  const [dwellReady, setDwellReady] = useState(false);

  // Dwell timer: auto-plays motion after 1.5s of the product section being visible
  useEffect(() => {
    const section = document.getElementById('signature-runway');
    if (!section) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
          timer = setTimeout(() => setDwellReady(true), 1500);
        } else {
          if (timer) clearTimeout(timer);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (wasMediaOpenRef.current && !mediaOpen)
      galleryButtonRef.current?.focus();
    wasMediaOpenRef.current = mediaOpen;
  }, [mediaOpen]);

  return (
    <main id="main-content" className="cp-site min-h-screen">
      <div inert={mediaOpen ? true : undefined}>
        <Navigation onMenu={() => setMenuOpen(true)} />
        {menuOpen && <MenuOverlay onClose={() => setMenuOpen(false)} />}
        <CampaignHero asset={campaignAsset} />
        <ProductRunwayHero
          galleryButtonRef={galleryButtonRef}
          galleryMedia={galleryMedia}
          onOpenGallery={() => setMediaOpen(true)}
          motionPaused={
            motionPaused || mediaOpen || orderOpen || Boolean(bagItem)
          }
          onToggleMotion={() => setMotionPaused((value) => !value)}
          summary={summary}
          onOpenOrder={() => setOrderOpen(true)}
          purchaseReady={true}
          priceLabel="\u20ac180"
          dwellReady={dwellReady}
        />
        <CategoryRail summary={summary} />
        <Footer />
      </div>
      <MediaViewer
        media={galleryMedia}
        onClose={() => setMediaOpen(false)}
        open={mediaOpen}
        title={summary.primaryProduct?.title || 'Signature Hoodie'}
      />
      {orderOpen && !bagItem && (
        <OrderTray
          onClose={() => setOrderOpen(false)}
          onAddToBag={(hash) => {
            const idx = PRODUCT_OFFER_HASHES.indexOf(
              hash as (typeof PRODUCT_OFFER_HASHES)[number]
            );
            setBagItem({ hash, size: STAGING_SIZES[idx] ?? 'M' });
            setOrderOpen(false);
          }}
          priceLabel="\u20ac180"
          selectedHash={selectedHash}
          onSelect={setSelectedHash}
          onOpenSizeFit={() => setSizeFitOpen(true)}
        />
      )}
      {sizeFitOpen && <SizeFitDrawer onClose={() => setSizeFitOpen(false)} />}
      {bagItem && (
        <BagDrawer
          item={bagItem}
          onClose={() => setBagItem(null)}
          onContinue={() => setBagItem(null)}
          priceLabel="\u20ac180"
        />
      )}
    </main>
  );
}

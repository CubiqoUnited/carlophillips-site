'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  Menu,
  Pause,
  Play,
  ShoppingBag,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type MuxVideoElement from '@mux/mux-video';
import productArchitecturePoster from '../../../public/media/editorial/product-architecture-background-v1.png';
import { getApprovedCampaignMotionAssets } from '@/lib/media/campaign-motion-registry';
import type { ApprovedCampaignMotionAsset } from '@/lib/media/campaign-motion-registry';
import type { ApprovedCampaignAsset } from '@/lib/media/types';
import type { HomeCatalogSummary } from '@/types';
import HeroMorphPreview from './HeroMorphPreview';

const MuxVideo = dynamic(() => import('@mux/mux-video/react'), { ssr: false });
const disableMuxTracking =
  process.env.NEXT_PUBLIC_COMMERCE_ENVIRONMENT !== 'production';

type Surface =
  | 'discovery'
  | 'gallery'
  | 'gallery-order'
  | 'order'
  | 'video-unavailable'
  | 'gallery-unavailable'
  | 'size-unavailable'
  | 'menu'
  | 'size'
  | 'private-list'
  | 'categories'
  | 'hoodies';
type StatusSurfaceName = Exclude<
  Surface,
  'discovery' | 'gallery' | 'gallery-order' | 'order' | 'menu' | 'size'
>;

const NAVIGABLE_SURFACES = new Set<Surface>([
  'discovery',
  'gallery',
  'gallery-order',
  'order',
  'video-unavailable',
  'gallery-unavailable',
  'size-unavailable',
  'menu',
  'size',
  'private-list',
  'categories',
  'hoodies',
]);

export function formatCatalogPrice(
  price: number | undefined,
  currency: string | undefined
): string {
  if (typeof price !== 'number' || !Number.isFinite(price) || !currency)
    return 'Price unavailable';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

type GalleryStill = {
  id: string;
  src: string;
  alt: string;
  label: string;
};

export function catalogGalleryStills(
  summary: HomeCatalogSummary | null | undefined
): GalleryStill[] {
  return (summary?.primaryProduct?.media || [])
    .filter((item) => item.type === 'image' && Boolean(item.src || item.url))
    .map((item, index) => ({
      id: item.id || item.registryAssetId || `shopify-image-${index + 1}`,
      src: item.src || item.url,
      alt: item.alt || summary?.primaryProduct?.title || 'Product image',
      label: item.label || `PRODUCT IMAGE ${index + 1}`,
    }));
}

function ScreenHeader({
  onMenu,
  onBag,
}: {
  onMenu: () => void;
  onBag: () => void;
}) {
  return (
    <header className="cp-workbook-header">
      <button onClick={onMenu} className="cp-workbook-nav">
        <Menu /> MENU
      </button>
      <span className="cp-workbook-brand">CARLOPHILLIPS</span>
      <button onClick={onBag} className="cp-workbook-nav">
        BAG <ShoppingBag />
      </button>
    </header>
  );
}

function ActionButton({
  children,
  onClick,
  subtle = false,
  className = '',
  type = 'button',
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  subtle?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`cp-workbook-action ${subtle ? 'is-subtle' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

function Panel({
  title,
  onClose,
  children,
  className = '',
}: {
  title: string;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`cp-workbook-panel ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <header>
        <p>{title}</p>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close">
            <X />
          </button>
        )}
      </header>
      {children}
    </section>
  );
}

function OrderWidgetBody({
  size,
  sizes,
  description,
  priceLabel,
  onSize,
  onSizeGuide,
  onContinue,
}: {
  size: string;
  sizes: string[];
  description: string;
  priceLabel: string;
  onSize: (value: string) => void;
  onSizeGuide: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="cp-workbook-order-body">
      <p className="cp-workbook-copy">{description}</p>
      <p className="cp-workbook-order-price">{priceLabel}</p>
      <p className="cp-workbook-kicker">SELECT SIZE</p>
      <div className="cp-workbook-sizes">
        {sizes.map((value) => (
          <button
            key={value}
            onClick={() => onSize(value)}
            className={value === size ? 'is-selected' : ''}
          >
            {value}
          </button>
        ))}
      </div>
      <button className="cp-workbook-link" onClick={onSizeGuide}>
        SIZE GUIDE
      </button>
      <div className="cp-workbook-order-actions">
        <ActionButton onClick={onContinue}>CONTINUE TO CHECKOUT</ActionButton>
        <p className="cp-workbook-order-note">
          SHIPPING &amp; RETURNS AVAILABLE AT CHECKOUT
        </p>
      </div>
    </div>
  );
}

function GridSurface({
  kind,
  onNavigate,
  productTitle,
  productHref,
}: {
  kind: 'categories' | 'hoodies';
  onNavigate: (next: Surface) => void;
  productTitle: string;
  productHref: string;
}) {
  const cards: Array<{ label: string; available: boolean }> =
    kind === 'categories'
      ? [{ label: 'HOODIES', available: true }]
      : [{ label: productTitle, available: true }];
  return (
    <main className="cp-workbook-screen cp-workbook-grid-screen">
      <ScreenHeader
        onMenu={() => onNavigate('menu')}
        onBag={() => window.location.assign('/bag')}
      />
      <section>
        <p className="cp-workbook-kicker">DISCOVERY</p>
        <h1>{kind === 'categories' ? 'ALL CATEGORIES' : 'ALL HOODIES'}</h1>
        <div className="cp-workbook-grid">
          {cards.map((card) => (
            <button
              type="button"
              key={card.label}
              disabled={!card.available}
              onClick={() =>
                kind === 'hoodies'
                  ? window.location.assign(productHref)
                  : onNavigate('hoodies')
              }
            >
              <div className="cp-workbook-grid-image">
                <Image
                  src={productArchitecturePoster}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <span>{card.label}</span>
              <small>
                {kind === 'categories'
                  ? card.available
                    ? 'VIEW CATEGORY'
                    : 'COMING SOON'
                  : 'VIEW PRODUCT'}
              </small>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function StatusSurface({
  state,
  onBack,
  onNavigate,
}: {
  state: StatusSurfaceName;
  onBack: () => void;
  onNavigate: (next: Surface) => void;
}) {
  const copy: Record<typeof state, [string, string, string]> = {
    'video-unavailable': [
      'VIDEO UNAVAILABLE',
      'The selected product video could not be loaded. Product details and gallery remain available.',
      'VIEW GALLERY',
    ],
    'gallery-unavailable': [
      'GALLERY UNAVAILABLE',
      'No approved gallery media is currently available for this product.',
      'RETURN TO DISCOVERY',
    ],
    'size-unavailable': [
      'SELECTED SIZE UNAVAILABLE',
      'This variant is no longer available. Choose another size to continue.',
      'RETURN TO ORDER',
    ],
    'private-list': [
      'PRIVATE LIST',
      'Early-access registration is being prepared.',
      'RETURN TO DISCOVERY',
    ],
    categories: [
      'ALL CATEGORIES',
      'Selected pieces and available categories.',
      'ALL HOODIES',
    ],
    hoodies: ['ALL HOODIES', 'Signature Series / 001', 'VIEW ONE'],
  };
  const [title, body, action] = copy[state];
  const next: Partial<Record<typeof state, Surface>> = {
    'video-unavailable': 'gallery',
    'gallery-unavailable': 'discovery',
    'size-unavailable': 'order',
    'private-list': 'discovery',
    categories: 'hoodies',
    hoodies: 'discovery',
  };
  return (
    <main className="cp-workbook-screen cp-workbook-state">
      <ScreenHeader
        onMenu={onBack}
        onBag={() => window.location.assign('/bag')}
      />
      <div className="cp-workbook-state-card">
        <p className="cp-workbook-kicker">
          {state.startsWith('private') ? 'PRIVATE LIST' : 'PRODUCT'}
        </p>
        <h1>{title}</h1>
        <p className="cp-workbook-copy">{body}</p>
        <ActionButton
          onClick={() => (next[state] ? onNavigate(next[state]!) : onBack)}
        >
          {action}
        </ActionButton>
      </div>
    </main>
  );
}

export default function WorkbookReplica({
  campaignAsset: _campaignAsset,
  catalogSummary,
}: {
  campaignAsset: ApprovedCampaignAsset | null;
  catalogSummary: HomeCatalogSummary;
}) {
  const product = catalogSummary.primaryProduct;
  const productHandle = product?.handle || 'carlophillips-signature-hoodie';
  const productMotion = getApprovedCampaignMotionAssets(
    'product-runway',
    productHandle
  );
  const productDescription =
    product?.description || 'Product details are currently unavailable.';
  const priceLabel = formatCatalogPrice(product?.price, product?.currency);
  const sizeOptions = product?.sizes?.length
    ? product.sizes.map((value) => value.toUpperCase())
    : [];
  const sizeGuide = (product?.details || []).find(
    (detail) =>
      Array.isArray(detail) && String(detail[0]).toLowerCase() === 'size guide'
  );
  const sizeGuideText = Array.isArray(sizeGuide)
    ? String(sizeGuide[1] || '')
    : '';
  const productHref = product?.href || `/product/${productHandle}`;
  const [entered, setEntered] = useState(false);
  const [surface, setSurface] = useState<Surface>('discovery');
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get(
      'screen'
    ) as Surface | null;
    if (requested && NAVIGABLE_SURFACES.has(requested)) setSurface(requested);
  }, []);
  const [activeVideo, setActiveVideo] = useState(0);
  const [productStarted, setProductStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [completedRuns, setCompletedRuns] = useState(0);
  const [progress, setProgress] = useState(0);
  const [productFrameReady, setProductFrameReady] = useState(false);
  const [size, setSize] = useState(
    sizeOptions.includes('M') ? 'M' : sizeOptions[0] || ''
  );
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [videoExpanded, setVideoExpanded] = useState(false);
  const productVideo = useRef<MuxVideoElement>(null);
  const productEndHandled = useRef(false);
  const productStartedRef = useRef(false);
  const userScrollIntent = useRef(false);
  const productAsset = productMotion[activeVideo];
  const visibleSurface = surface === 'discovery' ? null : surface;
  const isStatus =
    visibleSurface &&
    ![
      'gallery',
      'gallery-order',
      'order',
      'menu',
      'size',
      'categories',
      'hoodies',
    ].includes(visibleSurface);
  const close = () => setSurface('discovery');
  const replaySequence = () => {
    productStartedRef.current = true;
    productEndHandled.current = false;
    setProductStarted(true);
    setCompletedRuns(0);
    setProgress(0);
    setProductFrameReady(false);
    setActiveVideo(0);
    setPlaying(true);
  };
  const toggleVideo = () => {
    const video = productVideo.current;
    if (!productStarted || completedRuns >= 2) {
      replaySequence();
      return;
    }
    if (!video) return;
    if (video.paused) {
      if (video.ended) video.currentTime = 0;
      void video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };
  const startProductSequence = () => {
    if (productStartedRef.current) return;
    productStartedRef.current = true;
    productEndHandled.current = false;
    setActiveVideo(0);
    setCompletedRuns(0);
    setProgress(0);
    setProductFrameReady(false);
    setProductStarted(true);
    setPlaying(true);
  };
  const snapToProduct = () => {
    userScrollIntent.current = true;
    document
      .getElementById('signature-runway')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const enterExperience = () => {
    setEntered(true);
  };
  useEffect(() => {
    const discovery = document.getElementById('signature-runway');
    if (!discovery) return;
    const configuredThreshold = Number.parseFloat(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--cp-motion-product-autoplay-visibility')
        .trim()
    );
    const visibilityThreshold = Number.isFinite(configuredThreshold)
      ? configuredThreshold
      : 0.5;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          entry.intersectionRatio >= visibilityThreshold
        )
          startProductSequence();
      },
      { threshold: [visibilityThreshold] }
    );
    observer.observe(discovery);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!entered) return;
    const markIntent = () => {
      userScrollIntent.current = true;
    };
    const markKeyboardIntent = (event: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', 'End', ' '].includes(event.key))
        markIntent();
    };
    window.addEventListener('wheel', markIntent, { passive: true });
    window.addEventListener('touchstart', markIntent, { passive: true });
    window.addEventListener('keydown', markKeyboardIntent);
    const styles = getComputedStyle(document.documentElement);
    const parseDuration = (token: string, fallback: number) => {
      const value = styles.getPropertyValue(token).trim();
      if (value.endsWith('ms')) return Number.parseFloat(value);
      if (value.endsWith('s')) return Number.parseFloat(value) * 1000;
      return fallback;
    };
    const revealDuration = parseDuration('--cp-duration-hero-preview', 8000);
    const postMorphHold = parseDuration('--cp-duration-post-morph-hold', 5000);
    const timer = window.setTimeout(() => {
      if (
        !userScrollIntent.current &&
        window.scrollY < window.innerHeight * 0.5
      )
        snapToProduct();
    }, revealDuration + postMorphHold);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('wheel', markIntent);
      window.removeEventListener('touchstart', markIntent);
      window.removeEventListener('keydown', markKeyboardIntent);
    };
  }, [entered]);
  const handleProductEnded = () => {
    if (productEndHandled.current) return;
    productEndHandled.current = true;
    if (activeVideo === 0) {
      setProgress(0);
      setProductFrameReady(false);
      setActiveVideo(1);
      setPlaying(true);
      return;
    }
    if (completedRuns < 1) {
      setCompletedRuns(1);
      setProgress(0);
      setProductFrameReady(false);
      setActiveVideo(0);
      setPlaying(true);
      return;
    }
    setCompletedRuns(2);
    setProgress(1);
    setPlaying(false);
  };
  const galleryMedia = useMemo(
    () => catalogGalleryStills(catalogSummary).slice(0, 24),
    [catalogSummary]
  );
  const mediaCount = galleryMedia.length;
  const activeGalleryStill = galleryMedia[galleryIndex] || null;
  const previousGalleryStill = () =>
    setGalleryIndex((index) =>
      mediaCount ? (index - 1 + mediaCount) % mediaCount : 0
    );
  const nextGalleryStill = () =>
    setGalleryIndex((index) => (mediaCount ? (index + 1) % mediaCount : 0));
  useEffect(() => {
    if (!videoExpanded) return;
    const closeExpanded = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setVideoExpanded(false);
    };
    window.addEventListener('keydown', closeExpanded);
    return () => window.removeEventListener('keydown', closeExpanded);
  }, [videoExpanded]);
  useEffect(() => setProductFrameReady(false), [activeVideo]);

  if (isStatus)
    return (
      <StatusSurface
        state={visibleSurface as StatusSurfaceName}
        onBack={close}
        onNavigate={setSurface}
      />
    );
  if (surface === 'categories' || surface === 'hoodies')
    return (
      <GridSurface
        kind={surface}
        onNavigate={setSurface}
        productTitle={product?.title || 'Current product'}
        productHref={productHref}
      />
    );
  return (
    <main id="main-content" className="cp-workbook-site">
      <div inert={surface !== 'discovery' ? true : undefined}>
        <HeroMorphPreview
          embedded
          revealed={entered}
          onReveal={enterExperience}
          onExplore={snapToProduct}
          onMenu={() => setSurface('menu')}
          onBag={() => window.location.assign('/bag')}
        />
        <section
          id="signature-runway"
          className="cp-workbook-discovery"
          aria-label="Discovery default view"
        >
          <ScreenHeader
            onMenu={() => setSurface('menu')}
            onBag={() => window.location.assign('/bag')}
          />
          <div className="cp-workbook-discovery-grid">
            <div className="cp-workbook-product-copy">
              <p className="cp-workbook-kicker">SIGNATURE SERIES / 001</p>
              <h2>ONE</h2>
              <p>{productDescription}</p>
              <div className="cp-workbook-tags">
                <span>COLOR</span>
                <span>MATERIAL</span>
                <span>FEEL</span>
              </div>
            </div>
            <div
              className={`cp-workbook-video-stage${videoExpanded ? ' is-expanded' : ''}`}
              role={videoExpanded ? 'dialog' : undefined}
              aria-modal={videoExpanded ? true : undefined}
              aria-label={videoExpanded ? 'Expanded product video' : undefined}
            >
              {productAsset && (
                <MuxVideo
                  ref={productVideo}
                  key={`${productAsset.assetId}-${productStarted ? 'playing' : 'poster'}`}
                  className="cp-workbook-product-video"
                  playbackId={productAsset.playbackId}
                  poster={productAsset.posterUrl}
                  muted
                  playsInline
                  autoplay={productStarted ? 'muted' : false}
                  preload={productStarted ? 'auto' : 'metadata'}
                  disableTracking={disableMuxTracking}
                  onLoadedMetadata={() => {
                    productEndHandled.current = false;
                  }}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onTimeUpdate={() => {
                    const video = productVideo.current;
                    if (video?.duration) {
                      setProgress(
                        Math.min(1, video.currentTime / video.duration)
                      );
                      if (video.currentTime > 0.05) setProductFrameReady(true);
                    }
                  }}
                  onEnded={handleProductEnded}
                />
              )}{' '}
              {productAsset && !productFrameReady && (
                <Image
                  src={productAsset.posterUrl}
                  alt="Approved product video poster"
                  fill
                  priority
                  sizes="(max-width: 768px) 80vw, 40vw"
                  className="cp-workbook-product-poster"
                />
              )}{' '}
              {!productAsset && (
                <Image
                  src={productArchitecturePoster}
                  alt="Product runway placeholder"
                  fill
                  className="object-cover"
                />
              )}
              {!playing && completedRuns >= 2 && (
                <button
                  type="button"
                  className="cp-workbook-centered-play"
                  onClick={replaySequence}
                  aria-label="Replay both product videos"
                >
                  <Play />
                </button>
              )}
              <div className="cp-workbook-video-controls">
                <button
                  type="button"
                  onClick={toggleVideo}
                  aria-label={playing ? 'Pause motion' : 'Play motion'}
                >
                  {playing ? <Pause /> : <Play />}
                </button>
                <progress
                  aria-label="Video progress"
                  value={progress}
                  max={1}
                />
                <button
                  type="button"
                  onClick={() => setVideoExpanded((expanded) => !expanded)}
                  aria-label={videoExpanded ? 'Collapse video' : 'Expand video'}
                >
                  {videoExpanded ? <Minimize2 /> : <Maximize2 />}
                </button>
                <div
                  className="cp-workbook-video-selector"
                  aria-label="Product video selector"
                >
                  {[0, 1, 2].map((i) => (
                    <button
                      type="button"
                      key={i}
                      disabled={i >= productMotion.length}
                      className={i === activeVideo ? 'is-active' : ''}
                      onClick={() => {
                        productEndHandled.current = false;
                        productStartedRef.current = true;
                        setProductStarted(true);
                        setProductFrameReady(false);
                        setActiveVideo(i);
                        setCompletedRuns(0);
                        setProgress(0);
                        setPlaying(true);
                      }}
                      aria-label={
                        i >= productMotion.length
                          ? `Video ${i + 1} unavailable`
                          : `Play video ${i + 1}`
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="cp-workbook-cta-stack">
              <ActionButton
                onClick={() =>
                  setSurface(mediaCount ? 'gallery' : 'gallery-unavailable')
                }
              >
                VIEW GALLERY <span>{mediaCount} IMAGES</span>
              </ActionButton>
              <ActionButton
                className="cp-workbook-order-cta"
                onClick={() => setSurface('order')}
              >
                ORDER — {priceLabel}
              </ActionButton>
            </div>
            <div
              className="cp-workbook-discovery-tray"
              role="region"
              aria-label="Product media thumbnails"
            >
              {galleryMedia.slice(0, 8).map((still, index) => (
                <button
                  type="button"
                  key={still.id}
                  className={index === galleryIndex ? 'is-active' : ''}
                  onClick={() => {
                    setGalleryIndex(index);
                    setSurface('gallery');
                  }}
                  aria-label={`Open ${still.alt}`}
                >
                  <Image src={still.src} alt="" fill sizes="3rem" />
                </button>
              ))}
            </div>
            <nav
              className="cp-workbook-discovery-links"
              aria-label="Discovery shortcuts"
            >
              <ActionButton subtle onClick={() => setSurface('categories')}>
                ALL CATEGORIES
              </ActionButton>
              <ActionButton subtle onClick={() => setSurface('hoodies')}>
                ALL HOODIES
              </ActionButton>
              <div role="group" aria-label="Discovery pagination">
                {Array.from({ length: 6 }, (_, index) => (
                  <span
                    key={index}
                    className={index === 0 ? 'is-active' : ''}
                  />
                ))}
              </div>
            </nav>
          </div>
        </section>
      </div>
      {surface === 'menu' && (
        <Panel title="NAVIGATION" onClose={close}>
          <nav className="cp-workbook-menu">
            <ActionButton onClick={() => setSurface('discovery')}>
              DISCOVERY
            </ActionButton>
            <section
              className="cp-workbook-menu-group"
              aria-labelledby="menu-shop"
            >
              <h2 id="menu-shop">SHOP</h2>
              <ActionButton onClick={() => setSurface('categories')}>
                ALL CATEGORIES
              </ActionButton>
              <div className="cp-workbook-menu-categories">
                <ActionButton onClick={() => setSurface('hoodies')}>
                  HOODIES
                </ActionButton>
              </div>
            </section>
            <section
              className="cp-workbook-menu-group is-separated"
              aria-labelledby="menu-private-support"
            >
              <h2 id="menu-private-support">PRIVATE &amp; SUPPORT</h2>
              <ActionButton onClick={() => setSurface('private-list')}>
                PRIVATE LIST
              </ActionButton>
              <ActionButton onClick={() => window.location.assign('/contact')}>
                CONTACT US
              </ActionButton>
            </section>
          </nav>
        </Panel>
      )}
      {(surface === 'gallery' || surface === 'gallery-order') && (
        <section
          className={`cp-workbook-gallery-overlay${surface === 'gallery-order' ? ' has-order' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Gallery"
        >
          <div className="cp-workbook-gallery-media">
            <header>
              <ActionButton subtle onClick={() => setSurface('gallery-order')}>
                ORDER — {priceLabel}
              </ActionButton>
              <button type="button" onClick={close} aria-label="Close gallery">
                <X />
              </button>
            </header>
            <div className="cp-workbook-gallery">
              <button
                type="button"
                onClick={previousGalleryStill}
                aria-label="Previous image"
              >
                <ChevronLeft />
              </button>
              <div className="cp-workbook-gallery-image">
                {activeGalleryStill ? (
                  <Image
                    src={activeGalleryStill.src}
                    alt={activeGalleryStill.alt}
                    fill
                    sizes="(max-width: 768px) 72vw, 38vw"
                    priority
                    className="object-contain"
                  />
                ) : (
                  <Image
                    src={productArchitecturePoster}
                    alt="Product gallery unavailable"
                    fill
                    className="object-contain"
                  />
                )}
              </div>
              <button
                type="button"
                onClick={nextGalleryStill}
                aria-label="Next image"
              >
                <ChevronRight />
              </button>
            </div>
            <p className="cp-workbook-gallery-labels">
              {String(galleryIndex + 1).padStart(2, '0')} / {mediaCount}
            </p>
            <div
              className="cp-workbook-gallery-thumbnails"
              aria-label="Gallery thumbnails"
            >
              {galleryMedia.map((still, index) => (
                <button
                  type="button"
                  key={still.id}
                  className={index === galleryIndex ? 'is-active' : ''}
                  onClick={() => setGalleryIndex(index)}
                  aria-label={`View ${still.alt}`}
                >
                  <Image src={still.src} alt="" fill sizes="3rem" />
                </button>
              ))}
            </div>
          </div>
          {surface === 'gallery-order' && (
            <aside className="cp-workbook-gallery-order" aria-label="Order">
              <header>
                <p>ORDER</p>
                <button
                  type="button"
                  onClick={() => setSurface('gallery')}
                  aria-label="Close order"
                >
                  <X />
                </button>
              </header>
              <OrderWidgetBody
                size={size}
                sizes={sizeOptions}
                description={productDescription}
                priceLabel={priceLabel}
                onSize={setSize}
                onSizeGuide={() => setSurface('size')}
                onContinue={() => window.location.assign(productHref)}
              />
            </aside>
          )}
        </section>
      )}
      {surface === 'order' && (
        <Panel title="ORDER" onClose={() => setSurface('discovery')}>
          <OrderWidgetBody
            size={size}
            sizes={sizeOptions}
            description={productDescription}
            priceLabel={priceLabel}
            onSize={setSize}
            onSizeGuide={() => setSurface('size')}
            onContinue={() => window.location.assign(productHref)}
          />
        </Panel>
      )}
      {surface === 'size' && (
        <Panel title="SIZE GUIDE" onClose={() => setSurface('order')}>
          <p className="cp-workbook-copy">
            {sizeGuideText ||
              'Size guidance is currently unavailable in Shopify. Available sizes remain visible on the product page.'}
          </p>
          <ActionButton onClick={() => setSurface('order')}>CLOSE</ActionButton>
        </Panel>
      )}
    </main>
  );
}

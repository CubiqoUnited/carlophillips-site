'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Expand,
  Menu,
  ShoppingBag,
  X,
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
  summary,
}: {
  galleryButtonRef: React.RefObject<HTMLButtonElement | null>;
  galleryMedia: ViewerMediaItem[];
  onOpenGallery: () => void;
  summary: HomeCatalogSummary;
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
        {runwaySequenceReady ? (
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
          <Expand
            className="cp-icon-subtle cp-product-media-expand h-4 w-4"
            aria-hidden="true"
          />
          <span className="text-right">
            {String(galleryMedia.length).padStart(2, '0')} views
          </span>
        </button>
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

export default function HomeStorefront({
  campaignAsset,
  catalogSummary,
}: HomeStorefrontProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const galleryButtonRef = useRef<HTMLButtonElement>(null);
  const wasMediaOpenRef = useRef(false);
  const summary = catalogSummary || fallbackSummary;
  const galleryMedia = useMemo(() => buildHomeGalleryMedia(summary), [summary]);

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
          summary={summary}
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
    </main>
  );
}
